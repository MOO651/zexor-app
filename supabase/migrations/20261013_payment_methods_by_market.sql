-- Keep legacy payment method rows assigned to Egypt, then separate
-- Saudi Arabia methods with the `ksa` market key.
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  method text NOT NULL,
  market text NOT NULL DEFAULT 'eg',
  label text NOT NULL DEFAULT '',
  account_name text NOT NULL DEFAULT '',
  account_number text NOT NULL DEFAULT '',
  instructions_en text NOT NULL DEFAULT '',
  instructions_ar text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_methods
  ADD COLUMN IF NOT EXISTS market text NOT NULL DEFAULT 'eg';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'payment_methods_market_check'
      AND conrelid = 'public.payment_methods'::regclass
  ) THEN
    ALTER TABLE public.payment_methods
      ADD CONSTRAINT payment_methods_market_check CHECK (market IN ('eg', 'ksa'));
  END IF;
END
$$;
