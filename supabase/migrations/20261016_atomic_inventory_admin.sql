-- Product content saves must not restore stale stock values after a checkout.
-- Stock edits and order status changes use dedicated, row-locked RPCs instead.
create or replace function public.admin_save_products(product_payload jsonb)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_catalog jsonb;
  next_catalog jsonb := '[]'::jsonb;
  incoming_product jsonb;
  current_product jsonb;
  product_id text;
begin
  if not public.is_store_admin()
    or jsonb_typeof(product_payload) is distinct from 'array' then
    return false;
  end if;

  select value into current_catalog
  from public.store_content where key = 'products' for update;

  for incoming_product in select value from jsonb_array_elements(product_payload) loop
    product_id := incoming_product->>'id';
    if coalesce(product_id, '') = '' then return false; end if;
    if exists (
      select 1 from jsonb_array_elements(next_catalog) as saved_row(value)
      where saved_row.value->>'id' = product_id
    ) then return false; end if;
    current_product := null;
    if jsonb_typeof(current_catalog) = 'array' then
      select value into current_product
      from jsonb_array_elements(current_catalog) as current_row(value)
      where current_row.value->>'id' = product_id
      limit 1;
    end if;
    if current_product is not null then
      if jsonb_typeof(current_product->'stock') = 'number' then
        incoming_product := jsonb_set(incoming_product, '{stock}', current_product->'stock', true);
      else
        incoming_product := incoming_product - 'stock';
      end if;
    end if;
    next_catalog := next_catalog || jsonb_build_array(incoming_product);
  end loop;

  insert into public.store_content (key, value, updated_at)
  values ('products', next_catalog, now())
  on conflict (key) do update set value = excluded.value, updated_at = excluded.updated_at;
  return true;
end;
$$;

create or replace function public.admin_set_product_stock(requested_product_id text, stock_value integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  catalog jsonb;
  product jsonb;
  product_index bigint;
begin
  if not public.is_store_admin() or coalesce(trim(requested_product_id), '') = ''
    or (stock_value is not null and stock_value < 0) then
    return false;
  end if;
  select value into catalog from public.store_content where key = 'products' for update;
  if jsonb_typeof(catalog) is distinct from 'array' then return false; end if;
  select p.ordinality - 1, p.value into product_index, product
  from jsonb_array_elements(catalog) with ordinality as p(value, ordinality)
  where p.value->>'id' = requested_product_id
  limit 1;
  if product is null then return false; end if;
  if stock_value is null then
    product := product - 'stock';
  else
    product := jsonb_set(product, '{stock}', to_jsonb(stock_value), true);
  end if;
  catalog := jsonb_set(catalog, array[product_index::text], product, false);
  update public.store_content set value = catalog, updated_at = now() where key = 'products';
  return true;
end;
$$;

create or replace function public.admin_update_order_status(requested_order_id text, target_status text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  order_payload jsonb;
  previous_status text;
  tracked_ids jsonb;
  catalog jsonb;
  item jsonb;
  product jsonb;
  product_index bigint;
  requested_quantity integer;
  available_quantity integer;
  stock_adjusted boolean;
  should_write_catalog boolean := false;
begin
  if not public.is_store_admin()
    or coalesce(target_status, '') not in ('new', 'confirmed', 'complete', 'cancelled') then
    return jsonb_build_object('accepted', false, 'reason', 'forbidden');
  end if;
  select payload, status into order_payload, previous_status
  from public.store_orders where id = upper(trim(requested_order_id)) for update;
  if order_payload is null then
    return jsonb_build_object('accepted', false, 'reason', 'missing');
  end if;
  if previous_status = target_status then
    return jsonb_build_object('accepted', true, 'payload', order_payload);
  end if;

  stock_adjusted := coalesce((order_payload->>'stockAdjusted')::boolean, false);
  tracked_ids := coalesce(order_payload->'stockAdjustedProductIds', '[]'::jsonb);
  if (target_status = 'cancelled' and previous_status <> 'cancelled' and stock_adjusted)
    or (previous_status = 'cancelled' and target_status <> 'cancelled' and not stock_adjusted) then
    select value into catalog from public.store_content where key = 'products' for update;
    if jsonb_typeof(catalog) is distinct from 'array'
      or jsonb_typeof(tracked_ids) is distinct from 'array' then
      return jsonb_build_object('accepted', false, 'reason', 'stock');
    end if;

    for item in select value from jsonb_array_elements(order_payload->'items') loop
      if not (tracked_ids @> jsonb_build_array(item->>'productId')) then continue; end if;
      requested_quantity := (item->>'quantity')::integer;
      select p.ordinality - 1, p.value into product_index, product
      from jsonb_array_elements(catalog) with ordinality as p(value, ordinality)
      where p.value->>'id' = item->>'productId'
      limit 1;

      if target_status <> 'cancelled' then
        if product is null or not (product ? 'stock')
          or jsonb_typeof(product->'stock') is distinct from 'number'
          or coalesce((product->>'available')::boolean, true) = false
          or (product ? 'markets' and not (product->'markets' @> jsonb_build_array(order_payload->>'market'))) then
          return jsonb_build_object('accepted', false, 'reason', 'stock');
        end if;
        available_quantity := (product->>'stock')::integer;
        if available_quantity < requested_quantity then
          return jsonb_build_object('accepted', false, 'reason', 'stock');
        end if;
        product := jsonb_set(product, '{stock}', to_jsonb(available_quantity - requested_quantity), false);
      else
        if product is null or not (product ? 'stock') then continue; end if;
        if jsonb_typeof(product->'stock') is distinct from 'number' then
          return jsonb_build_object('accepted', false, 'reason', 'stock');
        end if;
        available_quantity := (product->>'stock')::integer;
        product := jsonb_set(product, '{stock}', to_jsonb(available_quantity + requested_quantity), false);
      end if;
      catalog := jsonb_set(catalog, array[product_index::text], product, false);
      should_write_catalog := true;
    end loop;
  end if;

  if target_status = 'cancelled' and previous_status <> 'cancelled' then
    stock_adjusted := false;
  elsif previous_status = 'cancelled' and target_status <> 'cancelled' then
    stock_adjusted := true;
  end if;
  order_payload := jsonb_set(order_payload, '{status}', to_jsonb(target_status), true);
  order_payload := jsonb_set(order_payload, '{stockAdjusted}', to_jsonb(stock_adjusted), true);
  if should_write_catalog then
    update public.store_content set value = catalog, updated_at = now() where key = 'products';
  end if;
  update public.store_orders
  set status = target_status, payload = order_payload
  where id = upper(trim(requested_order_id));
  return jsonb_build_object('accepted', true, 'payload', order_payload);
end;
$$;

-- Import only previously local orders. Existing cloud orders are updated solely
-- through admin_update_order_status so stale browser snapshots cannot undo a
-- status change or stock transaction.
create or replace function public.admin_import_orders(order_payloads jsonb)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  order_payload jsonb;
  order_item jsonb;
  order_id text;
  customer_phone text;
  order_status text;
begin
  if not public.is_store_admin()
    or jsonb_typeof(order_payloads) is distinct from 'array' then
    return false;
  end if;
  if jsonb_array_length(order_payloads) > 500 then
    return false;
  end if;
  for order_payload in select value from jsonb_array_elements(order_payloads) loop
    if jsonb_typeof(order_payload) <> 'object' then raise exception 'Invalid order import payload'; end if;
    order_id := upper(trim(order_payload->>'id'));
    customer_phone := trim(order_payload->>'phone');
    order_status := order_payload->>'status';
    if coalesce(order_id, '') !~ '^ZX-[A-Z0-9-]{5,40}$'
      or customer_phone is null
      or length(regexp_replace(customer_phone, '[^0-9]', '', 'g')) < 7
      or coalesce(order_status, '') not in ('new', 'confirmed', 'complete', 'cancelled')
      or jsonb_typeof(order_payload->'items') is distinct from 'array'
      or jsonb_array_length(order_payload->'items') = 0
      or coalesce(trim(order_payload->>'customer'), '') = ''
      or coalesce(order_payload->>'market', '') not in ('eg', 'ksa')
      or jsonb_typeof(order_payload->'subtotal') is distinct from 'number'
      or jsonb_typeof(order_payload->'total') is distinct from 'number'
      or jsonb_typeof(order_payload->'shippingFee') is distinct from 'number'
      or jsonb_typeof(order_payload->'discount') is distinct from 'number'
      or (order_payload->>'subtotal')::numeric < 0
      or (order_payload->>'total')::numeric < 0
      or (order_payload->>'shippingFee')::numeric < 0
      or (order_payload->>'discount')::numeric < 0 then
      raise exception 'Invalid order import payload';
    end if;
    for order_item in select value from jsonb_array_elements(order_payload->'items') loop
      if jsonb_typeof(order_item) <> 'object'
        or coalesce(trim(order_item->>'productId'), '') = ''
        or coalesce(order_item->>'quantity', '') !~ '^[1-9][0-9]{0,3}$'
        or coalesce(trim(order_item->>'name'), '') = ''
        or jsonb_typeof(order_item->'egp') is distinct from 'number'
        or jsonb_typeof(order_item->'sar') is distinct from 'number' then
        raise exception 'Invalid order import item';
      end if;
    end loop;
    order_payload := jsonb_set(order_payload, '{stockAdjusted}', 'false'::jsonb, true);
    order_payload := jsonb_set(order_payload, '{stockAdjustedProductIds}', '[]'::jsonb, true);
    insert into public.store_orders (id, phone, status, payload, created_at)
    values (order_id, customer_phone, order_status, order_payload, coalesce((order_payload->>'createdAt')::timestamptz, now()))
    on conflict (id) do nothing;
  end loop;
  return true;
end;
$$;

create or replace function public.admin_import_inquiries(inquiry_payloads jsonb)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  inquiry_payload jsonb;
  inquiry_id text;
  customer_phone text;
  inquiry_status text;
begin
  if not public.is_store_admin()
    or jsonb_typeof(inquiry_payloads) is distinct from 'array' then
    return false;
  end if;
  if jsonb_array_length(inquiry_payloads) > 500 then
    return false;
  end if;
  for inquiry_payload in select value from jsonb_array_elements(inquiry_payloads) loop
    if jsonb_typeof(inquiry_payload) <> 'object' then raise exception 'Invalid inquiry import payload'; end if;
    inquiry_id := upper(trim(inquiry_payload->>'id'));
    customer_phone := trim(inquiry_payload->>'phone');
    inquiry_status := inquiry_payload->>'status';
    if coalesce(inquiry_id, '') !~ '^(ZX-(INQ|BK)-[A-Z0-9-]{5,40}|ZX-CALC-[A-Z0-9-]{5,40})$'
      or (inquiry_id not like 'ZX-CALC-%' and (customer_phone is null or length(regexp_replace(customer_phone, '[^0-9]', '', 'g')) < 7))
      or coalesce(inquiry_status, '') not in ('new', 'in-progress', 'complete') then
      raise exception 'Invalid inquiry import payload';
    end if;
    insert into public.store_inquiries (id, phone, status, payload, created_at)
    values (inquiry_id, customer_phone, inquiry_status, inquiry_payload, coalesce((inquiry_payload->>'createdAt')::timestamptz, now()))
    on conflict (id) do nothing;
  end loop;
  return true;
end;
$$;

create or replace function public.admin_update_inquiry_status(requested_inquiry_id text, target_status text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  inquiry_payload jsonb;
begin
  if not public.is_store_admin()
    or coalesce(target_status, '') not in ('new', 'in-progress', 'complete') then
    return false;
  end if;
  select payload into inquiry_payload
  from public.store_inquiries
  where id = upper(trim(requested_inquiry_id))
  for update;
  if inquiry_payload is null then return false; end if;
  inquiry_payload := jsonb_set(inquiry_payload, '{status}', to_jsonb(target_status), true);
  update public.store_inquiries
  set status = target_status, payload = inquiry_payload
  where id = upper(trim(requested_inquiry_id));
  return true;
end;
$$;

revoke all on function public.admin_save_products(jsonb) from public;
revoke all on function public.admin_set_product_stock(text, integer) from public;
revoke all on function public.admin_update_order_status(text, text) from public;
revoke all on function public.admin_import_orders(jsonb) from public;
revoke all on function public.admin_import_inquiries(jsonb) from public;
revoke all on function public.admin_update_inquiry_status(text, text) from public;
grant execute on function public.admin_save_products(jsonb) to authenticated;
grant execute on function public.admin_set_product_stock(text, integer) to authenticated;
grant execute on function public.admin_update_order_status(text, text) to authenticated;
grant execute on function public.admin_import_orders(jsonb) to authenticated;
grant execute on function public.admin_import_inquiries(jsonb) to authenticated;
grant execute on function public.admin_update_inquiry_status(text, text) to authenticated;
