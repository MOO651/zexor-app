-- Payment provider state is private and can only be touched with the service
-- role from trusted Edge Functions. Public order rows continue to be protected
-- by the existing RLS policies and phone + reference tracking RPC.
create table if not exists public.store_payment_attempts (
  order_id text primary key references public.store_orders(id) on delete cascade,
  provider_order_id text unique,
  transaction_id text,
  integration_id bigint not null,
  amount_cents bigint not null check (amount_cents > 0),
  currency text not null check (currency = 'EGP'),
  status text not null check (status in ('creating', 'pending', 'paid', 'failed', 'refunded')),
  checkout_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.store_payment_attempts enable row level security;
revoke all on public.store_payment_attempts from public, anon, authenticated;
grant select, insert, update on public.store_payment_attempts to service_role;
