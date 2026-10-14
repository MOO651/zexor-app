import { createClient } from 'npm:@supabase/supabase-js@2';

const HMAC_FIELDS: readonly (readonly string[])[] = [
  ['amount_cents'],
  ['created_at'],
  ['currency'],
  ['error_occured'],
  ['has_parent_transaction'],
  ['id'],
  ['integration_id'],
  ['is_3d_secure'],
  ['is_auth'],
  ['is_capture'],
  ['is_refunded'],
  ['is_standalone_payment'],
  ['is_voided'],
  ['order', 'id'],
  ['owner'],
  ['pending'],
  ['source_data', 'pan'],
  ['source_data', 'sub_type'],
  ['source_data', 'type'],
  ['success'],
];

const readField = (value: Record<string, unknown>, path: readonly string[]) => {
  let current: unknown = value;
  for (const part of path) {
    if (!current || typeof current !== 'object') return '';
    current = (current as Record<string, unknown>)[part];
  }
  return current === null || current === undefined ? '' : String(current);
};

const constantTimeEqual = (left: string, right: string) => {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return result === 0;
};

async function verifyHmac(obj: Record<string, unknown>, received: string, secret: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-512' }, false, ['sign']);
  const message = HMAC_FIELDS.map((path) => readField(obj, path)).join('');
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  const expected = [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return constantTimeEqual(expected.toLowerCase(), received.toLowerCase());
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
});

Deno.serve(async (request) => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const hmacSecret = Deno.env.get('PAYMOB_EG_HMAC_SECRET');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!hmacSecret || !supabaseUrl || !serviceRoleKey) return json({ error: 'Webhook is not configured' }, 503);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid callback body' }, 400);
  }
  if (body.type !== 'TRANSACTION' || !body.obj || typeof body.obj !== 'object') {
    return json({ received: true });
  }
  const obj = body.obj as Record<string, unknown>;
  const requestUrl = new URL(request.url);
  const hmac = requestUrl.searchParams.get('hmac')
    || (typeof body.hmac === 'string' ? body.hmac : '')
    || (typeof obj.hmac === 'string' ? obj.hmac : '');
  if (!hmac || !await verifyHmac(obj, hmac, hmacSecret)) return json({ error: 'Invalid callback signature' }, 401);

  const providerOrderId = readField(obj, ['order', 'id']);
  const integrationId = Number(obj.integration_id);
  const amountCents = Number(obj.amount_cents);
  if (!providerOrderId || !Number.isSafeInteger(integrationId) || !Number.isSafeInteger(amountCents)
    || obj.currency !== 'EGP') return json({ error: 'Invalid transaction details' }, 400);

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: attempt, error: attemptError } = await admin.from('store_payment_attempts')
    .select('order_id, integration_id, amount_cents, currency, status')
    .eq('provider_order_id', providerOrderId)
    .maybeSingle();
  if (attemptError) return json({ error: 'Could not verify order reference' }, 503);
  if (!attempt) return json({ received: true });
  if (Number(attempt.integration_id) !== integrationId || Number(attempt.amount_cents) !== amountCents || attempt.currency !== 'EGP') {
    return json({ error: 'Transaction does not match the order' }, 400);
  }

  const { data: row, error: orderError } = await admin.from('store_orders')
    .select('id, status, payload')
    .eq('id', attempt.order_id)
    .maybeSingle();
  if (orderError || !row || !row.payload || typeof row.payload !== 'object') return json({ error: 'Order not found' }, 404);

  // Only trust refund/void flags that are part of Paymob's signed HMAC fields.
  const wasRefunded = obj.is_refunded === true || obj.is_voided === true;
  const succeeded = obj.success === true && obj.pending === false && !wasRefunded;
  const failed = obj.success === false && obj.pending === false;
  if (attempt.status === 'refunded' && !wasRefunded) return json({ received: true });
  if (attempt.status === 'paid' && !wasRefunded) return json({ received: true });
  if (!wasRefunded && !succeeded && !failed) return json({ received: true });

  const paymentStatus = wasRefunded ? 'refunded' : succeeded ? 'paid' : 'failed';
  const currentPayload = row.payload as Record<string, unknown>;
  const nextPayload = { ...currentPayload, paymentStatus };
  const nextOrderStatus = succeeded && row.status !== 'cancelled' ? 'confirmed' : row.status;
  const transactionId = String(obj.id ?? '');
  const [{ error: updateOrderError }, { error: updateAttemptError }] = await Promise.all([
    admin.from('store_orders').update({ status: nextOrderStatus, payload: nextPayload }).eq('id', attempt.order_id),
    admin.from('store_payment_attempts').update({
      status: paymentStatus,
      transaction_id: transactionId,
      updated_at: new Date().toISOString(),
    }).eq('order_id', attempt.order_id),
  ]);
  if (updateOrderError || updateAttemptError) return json({ error: 'Could not update payment status' }, 503);
  return json({ received: true });
});
