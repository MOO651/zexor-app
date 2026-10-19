-- Additive media/content schema. This migration is intentionally not applied
-- automatically; run it from the Supabase Dashboard SQL Editor.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-media',
  'site-media',
  true,
  52428800,
  array[
    'image/avif',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/vnd.radiance',
    'video/mp4',
    'video/webm',
    'model/gltf-binary',
    'application/octet-stream'
  ]
)
on conflict (id) do nothing;

create table if not exists public.site_assets (
  key text primary key,
  type text not null check (type in ('image', 'video', 'sequence', 'model', 'texture')),
  url text not null,
  poster_url text,
  meta jsonb not null default '{}'::jsonb,
  alt_ar text not null default '',
  alt_en text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published')),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table if not exists public.site_content (
  key text primary key,
  value_ar text,
  value_en text,
  value_json jsonb,
  status text not null default 'draft' check (status in ('draft', 'published')),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table if not exists public.site_hotspots (
  id uuid primary key default gen_random_uuid(),
  look_id text not null,
  x numeric(5, 2) not null check (x between 0 and 100),
  y numeric(5, 2) not null check (y between 0 and 100),
  product_id text not null,
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published')),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create index if not exists site_hotspots_published_look_order_idx
  on public.site_hotspots (look_id, sort_order)
  where status = 'published';

create table if not exists public.site_asset_history (
  id uuid primary key default gen_random_uuid(),
  asset_key text not null,
  type text not null check (type in ('image', 'video', 'sequence', 'model', 'texture')),
  url text not null,
  poster_url text,
  meta jsonb not null default '{}'::jsonb,
  alt_ar text not null default '',
  alt_en text not null default '',
  status text not null check (status in ('draft', 'published')),
  updated_at timestamptz not null,
  updated_by uuid references auth.users(id) on delete set null,
  archived_at timestamptz not null default now(),
  archived_by uuid references auth.users(id) on delete set null
);

alter table public.site_assets enable row level security;
alter table public.site_content enable row level security;
alter table public.site_hotspots enable row level security;
alter table public.site_asset_history enable row level security;

drop policy if exists site_assets_published_read on public.site_assets;
create policy site_assets_published_read on public.site_assets
  for select to anon, authenticated
  using (status = 'published' or public.is_store_admin());
drop policy if exists site_assets_admin_write on public.site_assets;
create policy site_assets_admin_write on public.site_assets
  for all to authenticated
  using (public.is_store_admin())
  with check (public.is_store_admin());

drop policy if exists site_content_published_read on public.site_content;
create policy site_content_published_read on public.site_content
  for select to anon, authenticated
  using (status = 'published' or public.is_store_admin());
drop policy if exists site_content_admin_write on public.site_content;
create policy site_content_admin_write on public.site_content
  for all to authenticated
  using (public.is_store_admin())
  with check (public.is_store_admin());

drop policy if exists site_hotspots_published_read on public.site_hotspots;
create policy site_hotspots_published_read on public.site_hotspots
  for select to anon, authenticated
  using (status = 'published' or public.is_store_admin());
drop policy if exists site_hotspots_admin_write on public.site_hotspots;
create policy site_hotspots_admin_write on public.site_hotspots
  for all to authenticated
  using (public.is_store_admin())
  with check (public.is_store_admin());

drop policy if exists site_asset_history_admin_read on public.site_asset_history;
create policy site_asset_history_admin_read on public.site_asset_history
  for select to authenticated
  using (public.is_store_admin());

grant select on public.site_assets, public.site_content, public.site_hotspots
  to anon, authenticated;
grant insert, update, delete on public.site_assets, public.site_content, public.site_hotspots
  to authenticated;
grant select on public.site_asset_history to authenticated;
revoke all on public.site_asset_history from anon;

create or replace function public.archive_site_asset_version()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.site_asset_history (
    asset_key, type, url, poster_url, meta, alt_ar, alt_en, status,
    updated_at, updated_by, archived_by
  )
  values (
    old.key, old.type, old.url, old.poster_url, old.meta, old.alt_ar, old.alt_en,
    old.status, old.updated_at, old.updated_by, auth.uid()
  );
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

revoke all on function public.archive_site_asset_version() from public, anon, authenticated;

drop trigger if exists site_assets_archive_previous_version on public.site_assets;
create trigger site_assets_archive_previous_version
  before update or delete on public.site_assets
  for each row execute function public.archive_site_asset_version();

create or replace function public.set_site_media_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

drop trigger if exists site_assets_set_updated_at on public.site_assets;
create trigger site_assets_set_updated_at
  before insert or update on public.site_assets
  for each row execute function public.set_site_media_updated_at();
drop trigger if exists site_content_set_updated_at on public.site_content;
create trigger site_content_set_updated_at
  before insert or update on public.site_content
  for each row execute function public.set_site_media_updated_at();
drop trigger if exists site_hotspots_set_updated_at on public.site_hotspots;
create trigger site_hotspots_set_updated_at
  before insert or update on public.site_hotspots
  for each row execute function public.set_site_media_updated_at();

drop policy if exists site_media_public_read on storage.objects;
create policy site_media_public_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'site-media');
drop policy if exists site_media_admin_insert on storage.objects;
create policy site_media_admin_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'site-media' and public.is_store_admin());
drop policy if exists site_media_admin_update on storage.objects;
create policy site_media_admin_update on storage.objects
  for update to authenticated
  using (bucket_id = 'site-media' and public.is_store_admin())
  with check (bucket_id = 'site-media' and public.is_store_admin());
drop policy if exists site_media_admin_delete on storage.objects;
create policy site_media_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'site-media' and public.is_store_admin());
