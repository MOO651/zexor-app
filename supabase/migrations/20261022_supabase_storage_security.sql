-- Keep public object URLs readable without allowing clients to enumerate files.
-- Admin uploads, edits and deletes remain protected by their existing policies.
begin;

drop policy if exists site_media_public_read on storage.objects;

-- These RPCs are backed by authenticated grants and admin-only RLS policies.
-- Invoker security makes those row policies the actual authorization boundary.
alter function public.admin_save_products(jsonb) security invoker;
alter function public.admin_set_product_stock(text, integer) security invoker;
alter function public.admin_update_order_status(text, text) security invoker;
alter function public.admin_import_orders(jsonb) security invoker;
alter function public.admin_import_inquiries(jsonb) security invoker;
alter function public.admin_update_inquiry_status(text, text) security invoker;
alter function public.admin_update_order_shipping(text, jsonb) security invoker;

revoke execute on function public.admin_save_products(jsonb) from public, anon;
revoke execute on function public.admin_set_product_stock(text, integer) from public, anon;
revoke execute on function public.admin_update_order_status(text, text) from public, anon;
revoke execute on function public.admin_import_orders(jsonb) from public, anon;
revoke execute on function public.admin_import_inquiries(jsonb) from public, anon;
revoke execute on function public.admin_update_inquiry_status(text, text) from public, anon;
revoke execute on function public.admin_update_order_shipping(text, jsonb) from public, anon;

grant execute on function public.admin_save_products(jsonb) to authenticated;
grant execute on function public.admin_set_product_stock(text, integer) to authenticated;
grant execute on function public.admin_update_order_status(text, text) to authenticated;
grant execute on function public.admin_import_orders(jsonb) to authenticated;
grant execute on function public.admin_import_inquiries(jsonb) to authenticated;
grant execute on function public.admin_update_inquiry_status(text, text) to authenticated;
grant execute on function public.admin_update_order_shipping(text, jsonb) to authenticated;

-- Customer-facing checkout, inquiry, lookup, and admin-check RPCs intentionally
-- remain SECURITY DEFINER because anonymous visitors and RLS policies use them.
commit;
