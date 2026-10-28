# ZEXOR — New Design Project

This folder is a separate, independent redesign workspace. It does not replace or modify the existing production app.

## Design direction
- Premium, editorial quiet-luxury with subtle futuristic details.
- Warm ivory, sand, charcoal and restrained bronze accents.
- Responsive layouts, Arabic RTL and English LTR.
- Six editable brand worlds: LINK, FASHION, STUDIO, MOTORS, ESTATES and MARKET.
- Accessible motion with reduced-motion support.
- No fake backend integrations.

## Integration status
This is a design workspace, not yet connected to the existing Supabase database, authentication, orders, checkout, payments, admin permissions or partner integrations. Those must be audited and integrated deliberately before production use.

## Next step
Build the standalone React/Vite frontend here, verify `npm run build`, and deploy it as a separate Vercel project. Keep the existing `main` production branch unchanged.
