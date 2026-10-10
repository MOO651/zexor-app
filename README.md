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

### Admin password

The admin studio password is read from the `VITE_ADMIN_PASSWORD` environment
variable. Create a local `.env` file (git-ignored) from the template:

```bash
cp .env.example .env
# then edit .env and set VITE_ADMIN_PASSWORD
```

If the variable is unset, the app falls back to the built-in demo password
`zexor-demo` so a fresh clone is never locked out. The login screen shows a hint
while that fallback is active.

Open the studio at `#dashboard`.

## Quality checks

```bash
npm run lint                              # ESLint
npx tsc --noEmit -p tsconfig.app.json     # Type check
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
2. Optionally add a repository secret `VITE_ADMIN_PASSWORD` (Settings →
   Secrets and variables → Actions) to control the admin password in the build.
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
- Cart, promo codes, per-city shipping rates, and WhatsApp order handoff.
- Live order tracking, FAQ, newsletter capture, and an animated luxury hero.
- Admin studio: products, categories, vehicles, properties, orders, promo codes,
  hero/announcement copy, section visibility, day/night theme, JSON backup.
- Route-level code splitting so the home page ships a small initial bundle.
- Locally hosted fonts and imagery — no third-party asset requests.

## Architecture notes

- **State lives in `localStorage`.** The admin has a **Download Backup** button
  that exports every store as a single JSON file.
- **WhatsApp handoff is not payment processing.** Orders are a concierge flow:
  the customer confirms, and the conversation continues in WhatsApp.
- **The admin gate is a shared password in a static bundle.** It is suitable for
  a demo or a private build, not for protecting real customer data. Before
  accepting live orders publicly, move authentication, product/order APIs, and
  storage behind a server with a shared database. Use the repository secret
  above rather than committing a real password.
