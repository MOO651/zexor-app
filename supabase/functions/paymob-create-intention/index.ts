import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
});

const normalizePhone = (value: string) => value.replace(/\D/g, '');

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const secretKey = Deno.env.get('PAYMOB_EG_SECRET_KEY');
  const publicKey = Deno.env.get('PAYMOB_EG_PUBLIC_KEY');
  const siteUrl = Deno.env.get('SITE_URL');
  if (!supabaseUrl || !serviceRoleKey || !secretKey || !publicKey || !siteUrl) {
    return json({ error: 'Payment provider is not configured' }, 503);
  }

  let input: { orderId?: unknown; phone?: unknown };
  try {
    input = await request.json();
  } catch {
    return json({ error: 'Invalid request' }, 400);
  }
  const orderId = typeof input.orderId === 'string' ? input.orderId.trim().toUpperCase() : '';
  const phone = typeof input.phone === 'string' ? input.phone.trim() : '';
  if (!/^ZX-[A-F0-9]{24}$/.test(orderId) || normalizePhone(phone).length < 8 || normalizePhone(phone).length > 15) {
    return json({ error: 'Invalid order reference' }, 400);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: row, error: orderError } = await admin.from('store_orders')
    .select('id, phone, status, payload')
    .eq('id', orderId)
    .maybeSingle();
  if (orderError || !row || normalizePhone(row.phone) !== normalizePhone(phone)) {
    return json({ error: 'Order not found' }, 404);
  }

  const order = row.payload as Record<string, unknown>;
  const method = order.paymentMethodKey;
  if (order.market !== 'eg' || !['visa', 'fawry'].includes(String(method)) || row.status === 'cancelled') {
    return json({ error: 'This order is not eligible for online payment' }, 409);
  }
  if (order.paymentStatus === 'paid' || order.paymentStatus === 'refunded') {
    return json({ error: 'This order already has a completed payment' }, 409);
  }
  if (!Number.isFinite(order.total) || Number(order.total) <= 0 || typeof order.customer !== 'string'
    || typeof order.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(order.email)) {
    return json({ error: 'Order billing details are incomplete' }, 422);
  }

  const amountCents = Math.round(Number(order.total) * 100);
  const integrationValue = Deno.env.get(method === 'fawry'
    ? 'PAYMOB_EG_FAWRY_INTEGRATION_ID'
    : 'PAYMOB_EG_CARD_INTEGRATION_ID');
  const integrationId = Number(integrationValue);
  if (!Number.isSafeInteger(integrationId) || integrationId <= 0) {
    return json({ error: 'Selected payment method is not configured' }, 503);
  }

  const { data: existing, error: existingError } = await admin.from('store_payment_attempts')
    .select('status, checkout_url, updated_at')
    .eq('order_id', orderId)
    .maybeSingle();
  if (existingError) return json({ error: 'Payment service unavailable' }, 503);
  if (existing?.status === 'pending' && typeof existing.checkout_url === 'string') {
    return json({ checkoutUrl: existing.checkout_url });
  }
  if (existing?.status === 'paid' || existing?.status === 'refunded') {
    return json({ error: 'This order already has a completed payment' }, 409);
  }
  if (existing?.status === 'creating' && Date.now() - Date.parse(existing.updated_at) < 180_000) {
    return json({ error: 'Payment session is already being prepared' }, 409);
  }

  const now = new Date().toISOString();
  const claim = {
    order_id: orderId,
    provider_order_id: null,
    transaction_id: null,
    integration_id: integrationId,
    amount_cents: amountCents,
    currency: 'EGP',
    status: 'creating',
    checkout_url: null,
    updated_at: now,
  };
  const claimResult = existing
    ? await admin.from('store_payment_attempts').update(claim).eq('order_id', orderId).eq('status', existing.status).select('order_id').maybeSingle()
    : await admin.from('store_payment_attempts').insert(claim).select('order_id').maybeSingle();
  if (claimResult.error || !claimResult.data) {
    const { data: raced } = await admin.from('store_payment_attempts').select('status, checkout_url').eq('order_id', orderId).maybeSingle();
    if (raced?.status === 'pending' && typeof raced.checkout_url === 'string') return json({ checkoutUrl: raced.checkout_url });
    return json({ error: 'Payment session is already being prepared' }, 409);
  }

  const customerName = order.customer.trim().split(/\s+/).filter(Boolean);
  const firstName = customerName.shift() ?? 'Customer';
  const lastName = customerName.join(' ') || firstName;
  const city = typeof order.city === 'string' ? order.city : 'Cairo';
  const rawPhone = normalizePhone(phone);
  const internationalPhone = rawPhone.startsWith('20') ? `+${rawPhone}` : rawPhone.startsWith('0') ? `+20${rawPhone.slice(1)}` : `+20${rawPhone}`;
  const notificationUrl = `${supabaseUrl.replace(/\/$/, '')}/functions/v1/paymob-webhook`;
  const returnUrl = new URL(siteUrl);
  if (returnUrl.protocol !== 'https:' && returnUrl.hostname !== 'localhost') {
    await admin.from('store_payment_attempts').update({ status: 'failed', updated_at: new Date().toISOString() }).eq('order_id', orderId);
    return json({ error: 'Store URL must use HTTPS' }, 503);
  }
  returnUrl.searchParams.set('payment', orderId);
  // Paymob's Intention API accepts these per-request callbacks for card
  // integrations. Other integrations use the callback URLs configured on
  // their Integration ID in the merchant dashboard.
  const cardCallbacks = method === 'visa'
    ? { notification_url: notificationUrl, redirection_url: returnUrl.toString() }
    : {};

  try {
    const paymobResponse = await fetch('https://accept.paymob.com/v1/intention/', {
      method: 'POST',
      headers: {
        Authorization: `Token ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountCents,
        currency: 'EGP',
        payment_methods: [integrationId],
        items: [{
          name: `ZEXOR order ${orderId}`,
          amount: amountCents,
          description: `${Array.isArray(order.items) ? order.items.length : 0} order item lines, including delivery`,
          quantity: 1,
        }],
        billing_data: {
          first_name: firstName,
          last_name: lastName,
          phone_number: internationalPhone,
          email: order.email,
          country: 'EG',
          city,
          state: city,
          street: city,
          building: 'NA',
          floor: 'NA',
          apartment: 'NA',
          postal_code: 'NA',
        },
        special_reference: orderId,
        expiration: 3600,
        ...cardCallbacks,
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!paymobResponse.ok) throw new Error('Paymob rejected the intention request');
    const intention = await paymobResponse.json();
    if (typeof intention.client_secret !== 'string' || typeof intention.intention_order_id !== 'number') {
      throw new Error('Paymob returned an incomplete intention');
    }

    const checkoutUrl = new URL('https://eg.checkout.paymob.com/');
    checkoutUrl.searchParams.set('publicKey', publicKey);
    checkoutUrl.searchParams.set('clientSecret', intention.client_secret);
    const { error: updateError } = await admin.from('store_payment_attempts').update({
      provider_order_id: String(intention.intention_order_id),
      checkout_url: checkoutUrl.toString(),
      status: 'pending',
      updated_at: new Date().toISOString(),
    }).eq('order_id', orderId).eq('status', 'creating');
    if (updateError) throw new Error('Could not save the payment session');
    return json({ checkoutUrl: checkoutUrl.toString() });
  } catch {
    await Promise.all([
      admin.from('store_payment_attempts').update({ status: 'failed', updated_at: new Date().toISOString() }).eq('order_id', orderId).eq('status', 'creating'),
      admin.from('store_orders').update({ payload: { ...order, paymentStatus: 'failed' } }).eq('id', orderId),
    ]);
    return json({ error: 'Could not start online payment' }, 502);
  }
});
