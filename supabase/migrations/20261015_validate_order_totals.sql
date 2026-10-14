-- Rebuild checkout validation from the database catalog and configuration.
-- Browser-provided amounts are compared before stock is changed or an order is saved.
create or replace function public.create_store_order(order_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  order_id text;
  customer_phone text;
  market_code text;
  city_name text;
  item jsonb;
  product jsonb;
  catalog jsonb;
  promos jsonb;
  promo jsonb;
  settings jsonb;
  trusted_payload jsonb;
  product_index bigint;
  requested_quantity integer;
  available_quantity integer;
  tracked_product_ids jsonb := '[]'::jsonb;
  unit_price numeric;
  calculated_subtotal numeric := 0;
  expected_discount numeric := 0;
  discount_rate numeric := 0;
  expected_shipping numeric;
  free_shipping_threshold numeric;
  tax_rate numeric := 0;
  expected_tax numeric := 0;
  expected_total numeric := 0;
begin
  if jsonb_typeof(order_payload) <> 'object'
    or pg_column_size(order_payload) > 100000 then
    return jsonb_build_object('accepted', false, 'reason', 'item');
  end if;
  if jsonb_typeof(order_payload->'items') <> 'array' then
    return jsonb_build_object('accepted', false, 'reason', 'item');
  end if;
  if jsonb_array_length(order_payload->'items') = 0
    or jsonb_array_length(order_payload->'items') > 50 then
    return jsonb_build_object('accepted', false, 'reason', 'item');
  end if;

  order_id := upper(trim(order_payload->>'id'));
  customer_phone := trim(order_payload->>'phone');
  market_code := order_payload->>'market';
  city_name := order_payload->>'city';
  if order_id !~ '^ZX-[A-Z0-9-]{5,40}$'
    or length(regexp_replace(customer_phone, '[^0-9]', '', 'g')) < 7
    or coalesce(trim(order_payload->>'customer'), '') = ''
    or market_code not in ('eg', 'ksa') then
    return jsonb_build_object('accepted', false, 'reason', 'item');
  end if;

  select value into catalog
  from public.store_content
  where key = 'products'
  for update;
  if catalog is null or jsonb_typeof(catalog) <> 'array' then
    return jsonb_build_object('accepted', false, 'reason', 'catalog');
  end if;

  for item in select value from jsonb_array_elements(order_payload->'items') loop
    if coalesce(item->>'productId', '') = ''
      or coalesce(item->>'quantity', '') !~ '^[1-9][0-9]{0,3}$' then
      return jsonb_build_object('accepted', false, 'reason', 'item');
    end if;
    requested_quantity := (item->>'quantity')::integer;

    select p.ordinality - 1, p.value
    into product_index, product
    from jsonb_array_elements(catalog) with ordinality as p(value, ordinality)
    where p.value->>'id' = item->>'productId'
    limit 1;

    if product is null
      or coalesce((product->>'available')::boolean, true) = false
      or (product ? 'markets' and not (product->'markets' @> jsonb_build_array(market_code))) then
      return jsonb_build_object('accepted', false, 'reason', 'item');
    end if;

    unit_price := (product->'price'->>market_code)::numeric;
    if unit_price is null or unit_price < 0
      or (market_code = 'eg' and (item->>'egp')::numeric is distinct from unit_price)
      or (market_code = 'ksa' and (item->>'sar')::numeric is distinct from unit_price) then
      return jsonb_build_object('accepted', false, 'reason', 'price');
    end if;
    calculated_subtotal := calculated_subtotal + (unit_price * requested_quantity);

    if product ? 'stock' then
      if not (tracked_product_ids @> jsonb_build_array(item->>'productId')) then
        tracked_product_ids := tracked_product_ids || jsonb_build_array(item->>'productId');
      end if;
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

  if order_payload->>'subtotal' is null
    or abs((order_payload->>'subtotal')::numeric - calculated_subtotal) > 0.01 then
    return jsonb_build_object('accepted', false, 'reason', 'price');
  end if;

  if coalesce((order_payload->>'discount')::numeric, 0) > 0 then
    select value into promos from public.store_content where key = 'promo_codes';
    if jsonb_typeof(promos) = 'array' then
      select entry.value into promo
      from jsonb_array_elements(promos) as entry(value)
      where upper(entry.value->>'code') = upper(order_payload->>'promoCode')
      limit 1;
    end if;
    if promo is null
      or coalesce((promo->>'active')::boolean, false) = false
      or coalesce((promo->>'expiresAt')::date, (now() at time zone 'Africa/Cairo')::date - 1)
        < (now() at time zone 'Africa/Cairo')::date then
      return jsonb_build_object('accepted', false, 'reason', 'price');
    end if;
    discount_rate := (promo->>'discount')::numeric;
    if discount_rate <= 0 or discount_rate > 100 then
      return jsonb_build_object('accepted', false, 'reason', 'price');
    end if;
    expected_discount := floor((calculated_subtotal * discount_rate / 100) + 0.5);
  end if;
  if coalesce((order_payload->>'discount')::numeric, 0) is distinct from expected_discount then
    return jsonb_build_object('accepted', false, 'reason', 'price');
  end if;

  select value into settings from public.site_settings where key = 'shippingRates';
  if jsonb_typeof(settings->city_name) = 'object' then
    begin
      expected_shipping := (settings->city_name->>market_code)::numeric;
    exception when others then
      expected_shipping := null;
    end;
  end if;
  if expected_shipping is null then
    expected_shipping := case market_code || ':' || city_name
    when 'eg:Cairo' then 40
    when 'eg:Giza' then 45
    when 'eg:Alexandria' then 55
    when 'eg:Delta Cities' then 65
    when 'eg:Upper Egypt' then 80
    when 'ksa:Riyadh' then 25
    when 'ksa:Jeddah' then 30
    when 'ksa:Dammam' then 30
    when 'ksa:Other KSA' then 35
    else null
    end;
  end if;
  if expected_shipping is null or expected_shipping < 0 or expected_shipping > 100000 then
    return jsonb_build_object('accepted', false, 'reason', 'price');
  end if;

  select value into settings from public.site_settings where key = 'freeShippingThreshold';
  free_shipping_threshold := coalesce((settings->>market_code)::numeric, case market_code when 'eg' then 2000 else 300 end);
  if free_shipping_threshold > 0 and calculated_subtotal >= free_shipping_threshold then
    expected_shipping := 0;
  end if;
  if (order_payload->>'shippingFee')::numeric is distinct from expected_shipping then
    return jsonb_build_object('accepted', false, 'reason', 'price');
  end if;

  select value into settings from public.site_settings where key = 'taxRateByMarket';
  if settings ? market_code then
    tax_rate := coalesce((settings->>market_code)::numeric, 0);
  else
    select value into settings from public.site_settings where key = 'taxRate';
    tax_rate := coalesce(settings::text::numeric, 0);
  end if;
  if tax_rate < 0 or tax_rate > 100 then
    return jsonb_build_object('accepted', false, 'reason', 'price');
  end if;
  expected_tax := floor((greatest(0, calculated_subtotal - expected_discount) * tax_rate / 100) + 0.5);
  expected_total := greatest(0, calculated_subtotal - expected_discount + expected_shipping + expected_tax);
  if order_payload->>'total' is null
    or abs((order_payload->>'total')::numeric - expected_total) > 0.01 then
    return jsonb_build_object('accepted', false, 'reason', 'price');
  end if;

  update public.store_content set value = catalog, updated_at = now() where key = 'products';
  trusted_payload := jsonb_set(order_payload, '{subtotal}', to_jsonb(calculated_subtotal), true);
  trusted_payload := jsonb_set(trusted_payload, '{discount}', to_jsonb(expected_discount), true);
  trusted_payload := jsonb_set(trusted_payload, '{shippingFee}', to_jsonb(expected_shipping), true);
  trusted_payload := jsonb_set(trusted_payload, '{total}', to_jsonb(expected_total), true);
  trusted_payload := jsonb_set(trusted_payload, '{stockAdjustedProductIds}', tracked_product_ids, true);
  trusted_payload := jsonb_set(trusted_payload, '{stockAdjusted}', 'true'::jsonb, true);
  insert into public.store_orders (id, phone, status, payload)
  values (order_id, customer_phone, 'new', jsonb_set(trusted_payload, '{status}', '"new"'::jsonb, true));
  return jsonb_build_object('accepted', true);
end;
$$;

revoke all on function public.create_store_order(jsonb) from public;
grant execute on function public.create_store_order(jsonb) to anon, authenticated;
