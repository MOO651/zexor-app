-- Administrator identities are provisioned manually by a trusted project owner.
-- The browser cannot grant itself a role: anon/authenticated have no table access.
create table if not exists public.store_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.store_admins enable row level security;
revoke all on public.store_admins from anon, authenticated;

create or replace function public.is_store_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.store_admins where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_store_admin() from public;
grant execute on function public.is_store_admin() to anon, authenticated;

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null unique,
  label text not null default '',
  handle text not null default '',
  url text not null default '',
  active boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

-- Bot credentials were previously stored alongside public site settings. Move
-- them before applying the public read policy below.
create table if not exists public.store_private_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
insert into public.store_private_settings (key, value)
select key, value from public.site_settings
where key in ('telegramBotToken', 'telegramChatId')
on conflict (key) do update set value = excluded.value, updated_at = now();
delete from public.site_settings where key in ('telegramBotToken', 'telegramChatId');
alter table public.store_private_settings enable row level security;
drop policy if exists admin_manage on public.store_private_settings;
create policy admin_manage on public.store_private_settings for all to authenticated
  using (public.is_store_admin()) with check (public.is_store_admin());
grant select, insert, update, delete on public.store_private_settings to authenticated;
revoke all on public.store_private_settings from anon;

-- Public catalogue/content is readable by visitors, while writes require the
-- authenticated administrator role. Customer orders and inquiries are kept out.
create table if not exists public.store_content (
  key text primary key check (key in ('products', 'categories', 'vehicles', 'properties', 'promo_codes')),
  value jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.store_content enable row level security;
drop policy if exists storefront_read on public.store_content;
drop policy if exists admin_manage on public.store_content;
create policy storefront_read on public.store_content for select to anon, authenticated using (true);
create policy admin_manage on public.store_content for all to authenticated
  using (public.is_store_admin()) with check (public.is_store_admin());
grant select on public.store_content to anon, authenticated;
grant insert, update, delete on public.store_content to authenticated;

-- Orders contain customer PII. Visitors can create an order and look up one
-- order only when they provide both its reference and matching phone number.
-- The table itself is never readable by anon or regular authenticated users.
create table if not exists public.store_orders (
  id text primary key,
  phone text not null,
  status text not null default 'new' check (status in ('new', 'confirmed', 'complete', 'cancelled')),
  payload jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.store_orders enable row level security;
drop policy if exists admin_manage on public.store_orders;
create policy admin_manage on public.store_orders for all to authenticated
  using (public.is_store_admin()) with check (public.is_store_admin());
grant select, insert, update, delete on public.store_orders to authenticated;
revoke all on public.store_orders from anon;

drop function if exists public.create_store_order(jsonb);
create function public.create_store_order(order_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  order_id text;
  customer_phone text;
  item jsonb;
  product jsonb;
  catalog jsonb;
  product_index bigint;
  requested_quantity integer;
  available_quantity integer;
begin
  if jsonb_typeof(order_payload) <> 'object'
    or jsonb_typeof(order_payload->'items') <> 'array' then
    raise exception 'Invalid order payload';
  end if;
  if pg_column_size(order_payload) > 100000
    or jsonb_array_length(order_payload->'items') = 0 then
    raise exception 'Invalid order payload';
  end if;

  order_id := upper(trim(order_payload->>'id'));
  customer_phone := trim(order_payload->>'phone');
  if order_id !~ '^ZX-[A-Z0-9-]{5,40}$'
    or length(regexp_replace(customer_phone, '[^0-9]', '', 'g')) < 7
    or coalesce(trim(order_payload->>'customer'), '') = '' then
    raise exception 'Invalid customer order';
  end if;

  for item in select value from jsonb_array_elements(order_payload->'items') loop
    if coalesce(item->>'productId', '') = '' or coalesce(item->>'quantity', '') !~ '^[1-9][0-9]{0,3}$' then
      raise exception 'Invalid order item';
    end if;
  end loop;

  -- Serialize checkout writes to the catalog row so two visitors cannot buy
  -- the final tracked unit at the same time.
  select value into catalog from public.store_content where key = 'products' for update;
  if catalog is not null then
    if jsonb_typeof(catalog) <> 'array' then
      return jsonb_build_object('accepted', false, 'reason', 'catalog');
    end if;
    for item in select value from jsonb_array_elements(order_payload->'items') loop
      requested_quantity := (item->>'quantity')::integer;
      select p.ordinal - 1, p.value into product_index, product
      from jsonb_array_elements(catalog) with ordinality as p(value, ordinal)
      where p.value->>'id' = item->>'productId'
      limit 1;
      if product is null
        or coalesce((product->>'available')::boolean, true) = false
        or (product ? 'markets' and not (product->'markets' @> jsonb_build_array(order_payload->>'market'))) then
        return jsonb_build_object('accepted', false, 'reason', 'item');
      end if;
      if product ? 'stock' then
        if jsonb_typeof(product->'stock') <> 'number' then
          return jsonb_build_object('accepted', false, 'reason', 'stock');
        end if;
        available_quantity := (product->>'stock')::integer;
        if available_quantity < requested_quantity then
          return jsonb_build_object('accepted', false, 'reason', 'stock');
        end if;
        catalog := jsonb_set(
          catalog,
          array[product_index::text, 'stock'],
          to_jsonb(available_quantity - requested_quantity),
          false
        );
      end if;
    end loop;
    update public.store_content set value = catalog, updated_at = now() where key = 'products';
  end if;

  insert into public.store_orders (id, phone, status, payload)
  values (order_id, customer_phone, 'new', jsonb_set(order_payload, '{status}', '"new"'::jsonb, true));
  return jsonb_build_object('accepted', true);
end;
$$;

create or replace function public.lookup_store_order(order_id text, customer_phone text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select payload from public.store_orders
  where id = upper(trim(order_id))
    and regexp_replace(phone, '[^0-9]', '', 'g') = regexp_replace(trim(customer_phone), '[^0-9]', '', 'g')
  limit 1;
$$;

revoke all on function public.create_store_order(jsonb) from public;
revoke all on function public.lookup_store_order(text, text) from public;
grant execute on function public.create_store_order(jsonb) to anon, authenticated;
grant execute on function public.lookup_store_order(text, text) to anon, authenticated;

create table if not exists public.store_inquiries (
  id text primary key,
  phone text not null,
  status text not null default 'new' check (status in ('new', 'in-progress', 'complete')),
  payload jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.store_inquiries enable row level security;
drop policy if exists admin_manage on public.store_inquiries;
create policy admin_manage on public.store_inquiries for all to authenticated
  using (public.is_store_admin()) with check (public.is_store_admin());
grant select, insert, update, delete on public.store_inquiries to authenticated;
revoke all on public.store_inquiries from anon;

create or replace function public.create_store_inquiry(inquiry_payload jsonb)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  inquiry_id text;
  customer_phone text;
begin
  if jsonb_typeof(inquiry_payload) <> 'object' or pg_column_size(inquiry_payload) > 50000 then
    raise exception 'Invalid inquiry payload';
  end if;
  inquiry_id := upper(trim(inquiry_payload->>'id'));
  customer_phone := trim(inquiry_payload->>'phone');
  if inquiry_id !~ '^(ZX-(INQ|BK)-[A-Z0-9-]{5,40}|ZX-CALC-[A-Z0-9-]{5,40})$'
    or (inquiry_id not like 'ZX-CALC-%' and length(regexp_replace(customer_phone, '[^0-9]', '', 'g')) < 7)
    or coalesce(trim(inquiry_payload->>'name'), '') = '' then
    raise exception 'Invalid customer inquiry';
  end if;
  insert into public.store_inquiries (id, phone, status, payload)
  values (inquiry_id, customer_phone, 'new', jsonb_set(inquiry_payload, '{status}', '"new"'::jsonb, true));
  return true;
end;
$$;
revoke all on function public.create_store_inquiry(jsonb) from public;
grant execute on function public.create_store_inquiry(jsonb) to anon, authenticated;

-- Storefronts can read published configuration; only provisioned admins can edit it.
do $$
declare
  table_name text;
  policy_name text;
begin
  foreach table_name in array array['site_settings', 'social_links', 'payment_methods'] loop
    if to_regclass(format('public.%I', table_name)) is not null then
      execute format('alter table public.%I enable row level security', table_name);
      for policy_name in
        select polname from pg_policy
        where polrelid = to_regclass(format('public.%I', table_name))
      loop
        execute format('drop policy %I on public.%I', policy_name, table_name);
      end loop;
      if table_name = 'site_settings' then
        execute format('create policy storefront_read on public.%I for select to anon, authenticated using (key not in (''telegramBotToken'', ''telegramChatId''))', table_name);
      else
        execute format('create policy storefront_read on public.%I for select to anon, authenticated using (true)', table_name);
      end if;
      execute format('create policy admin_manage on public.%I for all to authenticated using (public.is_store_admin()) with check (public.is_store_admin())', table_name);
      execute format('grant select on public.%I to anon, authenticated', table_name);
      execute format('grant insert, update, delete on public.%I to authenticated', table_name);
    end if;
  end loop;
end $$;

-- Live admin updates for new orders, inquiries, and inventory changes.
do $$
declare
  table_name text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach table_name in array array['store_orders', 'store_inquiries', 'store_content'] loop
      if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = table_name
      ) then
        execute format('alter publication supabase_realtime add table public.%I', table_name);
      end if;
    end loop;
  end if;
end $$;
