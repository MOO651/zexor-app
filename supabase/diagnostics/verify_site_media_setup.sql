select
  'database' as check_name,
  current_database() as check_value
union all
select 'database_role', current_user
union all
select 'site_assets_table', coalesce(to_regclass('public.site_assets')::text, 'missing')
union all
select 'site_content_table', coalesce(to_regclass('public.site_content')::text, 'missing')
union all
select 'site_hotspots_table', coalesce(to_regclass('public.site_hotspots')::text, 'missing')
union all
select 'site_asset_history_table', coalesce(to_regclass('public.site_asset_history')::text, 'missing')
union all
select 'admin_function', coalesce(to_regprocedure('public.is_store_admin()')::text, 'missing')
union all
select 'site_media_bucket', coalesce((
  select format('exists (public=%s)', b.public)
  from storage.buckets as b
  where b.id = 'site-media'
), 'missing')
union all
select 'site_media_policies', coalesce((
  select string_agg(p.policyname, ', ' order by p.policyname)
  from pg_policies as p
  where p.schemaname = 'storage'
    and p.tablename = 'objects'
    and p.policyname like 'site_media_%'
), 'missing');
