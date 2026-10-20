-- Fixes admin product saves. The previous version named a variable
-- current_catalog, which is a reserved SQL keyword (it returns the database
-- name), so jsonb_typeof(current_catalog) failed with error 42883.
create or replace function public.admin_save_products(product_payload jsonb)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  stored_catalog jsonb;
  next_catalog jsonb := '[]'::jsonb;
  incoming_product jsonb;
  current_product jsonb;
  product_id text;
begin
  if not public.is_store_admin()
    or jsonb_typeof(product_payload) is distinct from 'array' then
    return false;
  end if;

  select value into stored_catalog
  from public.store_content where key = 'products' for update;

  for incoming_product in select value from jsonb_array_elements(product_payload) loop
    product_id := incoming_product->>'id';
    if coalesce(product_id, '') = '' then return false; end if;
    if exists (
      select 1 from jsonb_array_elements(next_catalog) as saved_row(value)
      where saved_row.value->>'id' = product_id
    ) then return false; end if;
    current_product := null;
    if jsonb_typeof(stored_catalog) = 'array' then
      select value into current_product
      from jsonb_array_elements(stored_catalog) as current_row(value)
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

revoke all on function public.admin_save_products(jsonb) from public;
revoke all on function public.admin_save_products(jsonb) from anon;
grant execute on function public.admin_save_products(jsonb) to authenticated;
