# ZEXOR

ZEXOR is a bilingual, responsive storefront and brand site for NFC business cards, Egypt-only streetwear, and digital studio services across Egypt and Saudi Arabia.

## Requirements

- Node.js 22.12+ (required by the current Vite toolchain)
- npm

## Run locally

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm run lint
npm run build
npm run preview
```

The production-ready static site is generated in `dist/`.

## Deploy with Vercel

1. Push this project to a GitHub repository.
2. Import the repository in Vercel and select the **Vite** framework preset.
3. Use `npm run build` as the build command and `dist` as the output directory.
4. Deploy. No environment variables or server rewrite rules are required for the current client-side app.

## Features

- Arabic and English interface with RTL/LTR layout switching.
- NFC cards, apparel, and digital services with Egypt/Saudi market selection.
- Cart and WhatsApp order handoff.
- Locally hosted fonts, product imagery, and downloadable brand artwork.

## Important: current admin and order storage

The current admin password is included in the frontend bundle, and products and orders are saved in the visitor's browser `localStorage`. This is suitable only for a private demo: it is **not secure authentication or shared production storage**. Before using the admin dashboard or accepting live customer orders on a public production site, connect a backend with server-side authentication, protected product/order APIs, and a shared database. WhatsApp handoff is not payment processing.
