# ZEXOR

ZEXOR is a bilingual (Arabic / English), responsive brand site and storefront for
smart NFC identity cards, Egypt-only streetwear, a digital studio, and curated
vehicles and real estate across Egypt and Saudi Arabia.

## Requirements

- Node.js 20+
- npm

## Run locally

```bash
npm install
npm run dev
```

### Admin account and Supabase

Create a local `.env` file (git-ignored) from the template, then set your
Supabase project URL and public anon key. Admin login uses Supabase Auth; there
is no password embedded in the website build.

```bash
cp .env.example .env
```

Apply `supabase/migrations/20261013_payment_methods_by_market.sql`, then
`supabase/migrations/20261014_admin_auth.sql` and
`supabase/migrations/20261015_validate_order_totals.sql` in the Supabase SQL
editor, in order. These migrations create the shared settings/payment tables,
add the `eg` / `ksa` market split, and validate checkout prices, discounts,
shipping, tax, and tracked stock against database data. Delivery estimates are
editable by area and market in admin, and checkout and database validation use
the same saved rates. Then apply
`supabase/migrations/20261016_atomic_inventory_admin.sql` to protect inventory
from stale admin writes, make order cancellation/restoration atomic, and keep
order/inquiry status updates from being overwritten by stale browser snapshots.
Apply `supabase/migrations/20261017_order_shipping_details.sql` to let admins
save a carrier name, tracking number, and secure carrier tracking link on each
order; customers can then open the carrier's tracking page from order lookup.
Apply `supabase/migrations/20261018_paymob_payment_sessions.sql` to add private
payment session records. Egypt Visa/Mastercard and Fawry checkout use Paymob
hosted checkout when configured; the browser never receives merchant secrets.
Apply `supabase/migrations/20261019_public_store_realtime.sql` so open storefront
sessions receive live updates to public catalog, settings, social links, and
payment methods. Customer order and inquiry changes remain on the admin-only
channel.
Create the administrator in
Supabase Auth, copy that user's UUID, and run this in the Supabase SQL editor:

```sql
insert into public.store_admins (user_id)
values ('AUTH_USER_UUID');
```

Only users listed in `store_admins` can open the dashboard or change shared
settings, social links, payment methods, products, categories, vehicles,
properties, and promo codes. Storefront visitors can read the published catalog.
Telegram bot credentials are stored separately in an admin-only table.
New orders are stored in a private table; customers can retrieve one only with
both its order ID and matching phone number. Admin order changes sync across
devices. Customer inquiries and booking requests also sync privately to the
admin inbox across devices.

Open the studio at `#dashboard`.

### Egypt online payments (Paymob)

This is optional. Cash on delivery and other configured manual methods continue
to work without it. To collect Visa/Mastercard or Fawry online, create/activate
the corresponding Egypt integrations in a Paymob merchant account. Add these
values to **Supabase Edge Function secrets** (never to Vite variables or the
admin dashboard):

```text
PAYMOB_EG_SECRET_KEY
PAYMOB_EG_PUBLIC_KEY
PAYMOB_EG_CARD_INTEGRATION_ID
PAYMOB_EG_FAWRY_INTEGRATION_ID
PAYMOB_EG_HMAC_SECRET
SITE_URL
```

`SITE_URL` is the public HTTPS storefront URL. Supabase injects its project URL
and service role key into Edge Functions. Set secrets from the Supabase
Dashboard, or use a private `supabase/functions/.env` file and the Supabase CLI:

```bash
supabase secrets set --env-file supabase/functions/.env
supabase functions deploy paymob-create-intention
supabase functions deploy paymob-webhook
supabase functions deploy telegram-test-notification
```

In Paymob, configure the **transaction processed callback** on both the Card
and Fawry Integration IDs to
`https://<project-ref>.supabase.co/functions/v1/paymob-webhook`. The Intention
API request supplies per-payment callback URLs for Card; Fawry uses the callback
configured on its Integration ID. The webhook checks Paymob's HMAC and the
order's integration, currency, and exact amount before changing payment status.
The customer redirect is only a return to the store; it does not mark an order
paid. Keep payment credentials out of source control and rotate them in
Paymob/Supabase if exposed. The functions and SQL migration must be deployed to
the same Supabase project as the storefront.

## Quality checks

```bash
npm run lint                              # ESLint
npx tsc --noEmit -p tsconfig.app.json     # Type check
npx --yes deno check supabase/functions/paymob-create-intention/index.ts supabase/functions/paymob-webhook/index.ts supabase/functions/telegram-test-notification/index.ts
npm run build                             # Production build -> dist/
npm run preview                           # Serve the built output

# Pure helpers are covered by the Node built-in test runner:
node --experimental-strip-types --test src/utils.test.ts
```

## Deployment

The build is a fully static site in `dist/`.

### GitHub Pages (automated)

Pushing to `main` runs `.github/workflows/deploy.yml`, which lints, type-checks,
builds, and publishes to GitHub Pages.

1. In the repository, go to **Settings → Pages** and set **Source** to
   **GitHub Actions**.
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as repository build
   variables so the deployed app can authenticate and access its database.
3. Push to `main`. The site publishes at `https://<user>.github.io/<repo>/`.

`base: './'` in `vite.config.ts` keeps asset URLs working under a project
subpath, and `public/404.html` supplies the SPA fallback for deep links.

### Vercel

Import the repository, pick the **Vite** preset, build with `npm run build` and
serve `dist`.

## Features

- Arabic and English with full RTL/LTR layout switching.
- NFC cards, apparel, vehicles, real estate, and digital services, with an
  Egypt / Saudi market switch and per-market pricing.
- Image-driven department board linking straight into each section.
- Cart, promo codes, per-city shipping rates, WhatsApp order handoff, and
  optional hosted Visa/Fawry payments for Egypt.
- Live order tracking, FAQ, newsletter capture, and an animated luxury hero.
- Admin studio: products, categories, vehicles, properties, orders, promo codes,
  hero/announcement copy, section visibility, day/night theme, JSON backup.
- Store operations: a responsive admin sidebar, order lifecycle and CSV export,
  customer directory, low-stock alerts, per-market sales reports, and stock
  reservation/restocking when orders are placed or cancelled.
- Market-specific checkout controls for payment methods, tax, cash on delivery,
  and free-shipping thresholds in Egypt and Saudi Arabia.
- Admin design studio: live brand colours (primary / accent / ink), corner radius,
  and global font scale, applied instantly as CSS variables.
- Admin content studio: bilingual copy for all eight home departments (cards,
  fashion, studio, vehicles, real estate, CTA, footer) plus hero and maintenance text.
- Admin tools: a Telegram connection test, data export / import, and reset controls.
- Route-level code splitting so the home page ships a small initial bundle.
- Locally hosted fonts and imagery — no third-party asset requests.

## Architecture notes

- **Store data is shared through Supabase** when the migrations and project keys
  are configured. Locale, theme, cart, and wishlist remain in browser storage;
  the admin has a **Download Backup** button for store data.
- **WhatsApp handoff is not payment processing.** Without a configured payment
  provider, online methods are unavailable for collection and orders continue
  through the configured manual checkout flow.
- **The admin uses Supabase Auth and database roles.** Order and inquiry records
  are private; public tracking requires both the order ID and matching phone.
