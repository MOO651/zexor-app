-- Keep carrier and tracking details in the protected order payload, updated
-- atomically from the authenticated admin dashboard.
create or replace function public.admin_update_order_shipping(
  requested_order_id text,
  shipping_details jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  order_payload jsonb;
begin
  if not public.is_store_admin()
    or jsonb_typeof(shipping_details) is distinct from 'object'
    or length(coalesce(shipping_details->>'shippingCarrier', '')) > 100
    or length(coalesce(shipping_details->>'trackingNumber', '')) > 120
    or length(coalesce(shipping_details->>'trackingUrl', '')) > 1000
    or (coalesce(shipping_details->>'trackingUrl', '') <> '' and shipping_details->>'trackingUrl' !~ '^https://') then
    return jsonb_build_object('accepted', false, 'reason', 'invalid');
  end if;

  select payload into order_payload
  from public.store_orders
  where id = upper(trim(requested_order_id))
  for update;

  if order_payload is null then
    return jsonb_build_object('accepted', false, 'reason', 'missing');
  end if;

  order_payload := jsonb_set(order_payload, '{shippingCarrier}', to_jsonb(coalesce(shipping_details->>'shippingCarrier', '')), true);
  order_payload := jsonb_set(order_payload, '{trackingNumber}', to_jsonb(coalesce(shipping_details->>'trackingNumber', '')), true);
  order_payload := jsonb_set(order_payload, '{trackingUrl}', to_jsonb(coalesce(shipping_details->>'trackingUrl', '')), true);
  update public.store_orders set payload = order_payload where id = upper(trim(requested_order_id));
  return jsonb_build_object('accepted', true, 'payload', order_payload);
end;
$$;

revoke all on function public.admin_update_order_shipping(text, jsonb) from public;
grant execute on function public.admin_update_order_shipping(text, jsonb) to authenticated;
