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

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const authorization = request.headers.get('Authorization') ?? '';
  const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!token || !supabaseUrl || !serviceRoleKey) return json({ error: 'Unauthorized' }, 401);

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: authData, error: authError } = await admin.auth.getUser(token);
  if (authError || !authData.user) return json({ error: 'Unauthorized' }, 401);

  const { data: adminRow, error: adminError } = await admin.from('store_admins')
    .select('user_id')
    .eq('user_id', authData.user.id)
    .maybeSingle();
  if (adminError) return json({ error: 'Could not verify admin access' }, 503);
  if (!adminRow) return json({ error: 'Forbidden' }, 403);

  const { data: settings, error: settingsError } = await admin.from('store_private_settings')
    .select('key, value')
    .in('key', ['telegramBotToken', 'telegramChatId']);
  if (settingsError) return json({ error: 'Could not read Telegram settings' }, 503);
  const values = Object.fromEntries((settings ?? []).map((row) => [row.key, row.value]));
  const botToken = typeof values.telegramBotToken === 'string' ? values.telegramBotToken.trim() : '';
  const chatId = typeof values.telegramChatId === 'string' ? values.telegramChatId.trim() : '';
  if (!botToken || !chatId) return json({ error: 'Telegram is not configured' }, 409);

  try {
    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `ZEXOR Telegram connection test\nYour admin notification connection is working.\n${new Date().toISOString()}`,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!telegramResponse.ok) return json({ error: 'Telegram rejected the test message' }, 502);
    const result = await telegramResponse.json();
    if (result?.ok !== true) return json({ error: 'Telegram could not deliver the test message' }, 502);
    return json({ sent: true });
  } catch {
    return json({ error: 'Telegram is unavailable' }, 502);
  }
});
