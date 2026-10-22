# ZEXOR redesign v2

## Phase 1 execution log — 2026-10-21

- Reworked the home gateway into five numbered chapters: hero `01`, NFC `02`,
  fashion `03`, motors `04`, and a combined estates/studio experience `05`.
- Added a premium ZEXOR wordmark lockup, scoped forest-green surfaces, dark
  glass navigation, consistent mint accents and responsive scene image ratios.
- The NFC scene now mounts its lazy 3D preview only after entering view. The
  procedural preview remains the fallback until an approved published GLB is
  available; mobile and reduced-motion devices use demand rendering.
- Kept distinct responsive WebP assets for each department. No Supabase schema,
  authentication, route, or commerce behavior was changed.
- Responsive checks at 360, 768 and 1440 CSS pixels found no horizontal
  overflow. The initial NFC canvas count was zero; it mounted after scrolling
  into the NFC chapter. Production build and lint pass. Final visual and
  real-device sign-off are still pending.
- On 2026-10-21 the story chapters were changed to native CSS sticky panels
  with bounded scroll runways and a per-chapter progress marker. This keeps
  browser-native scrolling and mounted images; short-height screens fall back
  to ordinary document flow, and reduced-motion disables scrub transforms.
- Later the same day, at the owner's request, the prior pinned-scene homepage
  was restored from commit `5f74348`: the five-window hero, NFC, fashion,
  studio, cars, and real-estate chapters and their original scene styles are
  active again. The known mobile scrolling issue is intentionally not fixed
  yet; the owner will provide the desired fix approach.
- Later on 2026-10-21, at the owner's request, the October 18 visual version
  (`980d3ce`) was restored for the home hero and department scenes. Its forest
  green palette is applied across the storefront, and the inactive
  `FutureGatewayHome` experiment, its WebP set, and unimported legacy styles
  and scene components were removed. The current production build and lint
  pass; real-device and visual sign-off remain pending.

The original source of truth is available in `C:\Users\PC\Downloads\`:
`REDESIGN_BRIEF.md`, `SCROLL_DESIGN_SPEC.md`, `SECTIONS_AND_TOOLS.md`, and
`ASSETS_NEEDED.md`. The local asset inventory is also tracked in this
repository. Requirement status below is intentionally conservative: a build
does not certify visual quality, real device behavior, published media, or
production database setup.

**Overall status: not complete / not ready for final sign-off.** The core
routes, scenes, fallbacks and admin interfaces are implemented, but several
acceptance checks remain pending and some requirements depend on owner-provided
assets or access. In particular, the requested original videos/photos/sequences
and GLB models are absent; production Supabase migration and authorized admin
testing have not been performed; performance throttling and full scene-by-scene
visual sign-off remain outstanding. See `ASSETS_STATUS.md` for the media
inventory. Do not mark a phase complete based only on a passing build.

## Original UI file audit

Status values: `DONE`, `IN PROGRESS`, `PENDING`, `UNUSED — VERIFY`, `REMOVED`.

| File | Surface | Status |
| --- | --- | --- |
| `index.html` | Metadata, theme prepaint and browser chrome | DONE — Phase 1 |
| `public/404.html` | Static-host fallback page | DONE — GitHub Pages subpath fallback and accessible status |
| `src/main.tsx` | React entry and public NFC-card route | DONE — preserve behavior |
| `src/App.tsx` | Application shell, routes, theme, navigation and home wiring | DONE — Phase 1 |
| `src/App.css` | Legacy starter styles | REMOVED — no references found |
| `src/PlatformPages.tsx` | Legacy contact, services, car and property routes | REMOVED — no references found |
| `src/components/DesignSystem.tsx` | Unused UI primitives | REMOVED — no references found |
| `src/index.css` | Global styles, theme overrides and component styles | DONE — Phase 1 |
| `src/styles/tokens.css` | Existing parallel color systems and Tailwind tokens | DONE — Phase 1 |
| `src/components/AdminDashboard.tsx` | Existing admin dashboard | IN PROGRESS — Phase 5 media-center tab added; existing store workflows preserved |
| `src/components/AdminMediaCenter.tsx` | New media/content administration | IN PROGRESS — drafts, publishing, history, sequences and hotspots; live Supabase validation pending |
| `src/components/AgencyPortfolio.tsx` | Studio portfolio, pricing and calculator | IN PROGRESS — Phase 4 accessibility pass; full review pending |
| `src/components/CardView.tsx` | Public NFC profile | IN PROGRESS — Phase 4 accessibility pass; valid-card review pending |
| `src/components/CheckoutDrawer.tsx` | Cart and checkout overlay | IN PROGRESS — accessibility pass; full review pending |
| `src/components/DepartmentBanner.tsx` | Shared department-page banner | IN PROGRESS — responsive styling pass; full review pending |
| `src/components/DepartmentEmptyState.tsx` | Empty and search states | IN PROGRESS — Phase 4 accessibility pass; visual review pending |
| `src/components/FutureGatewayHome.tsx` | 2040 gateway experiment | REMOVED — October 18 home version restored; component and exclusive assets were unused |
| `src/components/HomeSections.tsx` | FAQ, newsletter, footer and shared prompts | DONE — Phase 1 |
| `src/components/Marketplace.tsx` | Product, car and property listings/details | IN PROGRESS — interaction, touch-target and image-dialog accessibility pass; full review pending |
| `src/components/NfcCustomizerModal.tsx` | NFC customization experience | IN PROGRESS — published GLB preview and finish/name overlays wired; logo upload and real-device review pending |
| `src/styles/future-home.css` | 2040 gateway experiment | REMOVED — inactive stylesheet after restoring the October 18 design |
| `src/components/SiteExperienceExtras.tsx` | New session preloader and optional product finder | IN PROGRESS — flags wired; browser QA pending |
| `src/components/ProductCard.tsx` | Shared product cards | IN PROGRESS — touch-target pass; full review pending |
| `src/components/TestimonialsSection.tsx` | Reviews and empty state | DONE — truthful empty state and contact action; no fabricated reviews |
| `src/components/TrackingModal.tsx` | Order tracking overlay | IN PROGRESS — Phase 4 accessibility pass; full review pending |

## Phases

- [ ] Phase 1 — IN PROGRESS: forest-green home surfaces, dark glass navigation,
  responsive image ratios, and the scroll-triggered NFC preview are implemented.
  Requirement-by-requirement contrast, image-ratio, blur-up and visual QA remain.
- [ ] Phase 2 — IN PROGRESS: the October 18 pinned hero and department scenes
  are active again. Real-device scroll behavior and final visual sign-off
  remain pending; do not treat the removed `FutureGatewayHome` experiment as
  the active route.
- [ ] Phase 3 — IN PROGRESS: cars and estate scenes scrub uploaded image
  sequences or optional published MP4/WebM videos with a poster/static fallback;
  reduced-motion keeps the static image. The NFC customizer loads a published
  GLB when available, tints its standard materials by finish and overlays the
  live card details. Shared canvas effects and review with real uploaded models
  remain outstanding.
- [ ] Phase 4 — IN PROGRESS: R-32 to R-34, R-41, R-42, R-44 and R-45. Cards,
  public pages and overlays have partial accessibility/touch-target updates;
  complete page-by-page visual, responsive, interaction and reduced-motion QA
  remains.
- [ ] Phase 5 — IN PROGRESS: an RTL/English Media Center supports image
  preparation, drafts separate from live content, publishing, asset history,
  reset, sequence uploads, content switches, lookbook hotspots, drag-and-drop
  and a live NFC GLB preview. The owner must apply the additive migration and
  verify uploads against the intended Supabase project. Video duration checks
  and custom posters are implemented; upload progress remains outstanding.
- [ ] Phase 6 — IN PROGRESS: the product finder is available behind its admin
  switch, the countdown is data-gated, and the preloader is session-gated.
  Ambient audio, performance budgets, full browser/device QA and final
  acceptance are not certified.

## Verification record

Current validation: `npm run build` and `npm run lint` pass. A read-only check
against the active local Supabase project on 2026-10-19 found the
`site_assets`, `site_content` and `site_hotspots` REST endpoints, each with zero
publicly visible published rows. The `public.is_store_admin()` RPC exists and
returns `false` to the unauthenticated public key, and Storage reported that
publicly visible published rows. The owner then ran
`supabase/diagnostics/verify_site_media_setup.sql` in project
`oneebpnthhfsfmyggrth`; the screenshot shows `site_assets`, `site_content`,
`site_hotspots`, `site_asset_history`, and `is_store_admin()` exist, and
`site-media` exists with `public=true`. A read-only public object-list request
returned HTTP 200 and an empty list. The earlier "Bucket not found" came from
requesting administrative bucket metadata with only the browser-safe anon key,
so it was not evidence that the bucket was absent. No media have been uploaded
or published; admin status returns false without authentication, so an
authenticated admin upload test is still pending. No service-role key,
database password or Supabase CLI is available locally. On the local
production preview, Chrome checks at 360, 390, 820 and 1440px found no
horizontal overflow, and all five home chapters were mounted. All 28 rendered
images loaded without broken-image errors. Clicking the hero letters scrolled
to the Cars and Real Estate chapters; switching to English and the light theme
updated the page language, direction and theme. A fresh reload reported no
failed network requests, HTTP errors or JavaScript exceptions. Existing checks
also covered cards, fashion, studio, cars and property routes at 390 and
1440px, locale switching and the NFC add-to-cart flow; the test cart item was
removed afterward. `git diff --check` passes. The browser-tool bridge did not
connect to the shared authenticated admin tab, so admin sign-in and live media
uploads were not validated. These checks do not certify every interaction,
page/locale/theme combination, real device or reduced-motion state. Real
uploads cannot be verified until the owner applies the migration; local assets
remain the public fallback. The WebGL vendor chunk is about 1,002 KB
uncompressed (268 KB gzip) and triggers Vite's 600 KB advisory. It remains
code-split from the main route and is not loaded until a WebGL feature is
requested.

## Phase 2 scene checklist

> Historical record: the pinned H1/C1–C5 implementation below was removed
> when the active home page was redesigned as the 2040 gateway and five-scene
> story. The scene files and their dedicated styles are no longer shipped.

### H1 — The Five Windows

- Implemented as a pinned 230svh scene with the specified p=0, 0.12, 0.45,
  0.70 and 1.00 progression. Published hero videos are used on desktop; mobile
  and reduced-motion use poster imagery. At the owner's request, the full-stage
  photo slats, glow and mist fade away as the five opening windows leave,
  leaving the large, solid Manrope ZEXOR wordmark on the cinematic gradient. The
  standalone NFC handoff image and transition counter are removed. The five
  opening windows and NFC card inside the following C1 chapter remain.
- Verified at 360, 390, 820, 1440 and 1920 CSS pixels; the sticky stage stays
  pinned and the document does not exceed the viewport width. Arabic/RTL light
  and English/LTR dark presentations were visually checked. Reduced-motion
  was checked after reloading with that preference active.
- Captured the five key frames and checked reverse progress from p=1 to p=0.45.
  Hero-specific old selectors (`zx-opening`, `zx-home-hero`, `zx-hero-*`) now
  return zero matches in `HomeHero.tsx` and `home-scenes.css`; the old
  `.zx-opening` CSS blocks were removed from `components.css`.
- Pending before H1 sign-off: recheck the p=1 handoff crop and review under a
  CPU/network budget.

### C1 — One touch

- Mounted immediately after H1 in the active home route. The first hero window
  now scrolls to the NFC chapter without changing routes; the stage stays pinned
  at the viewport top after arrival.
- Scroll choreography covers card rotation/scale, phone entry, profile reveal,
  staggered features and CTA handoff. Added damped pointer tilt, horizontal touch
  rotation with release inertia, and connector lines between the card and feature
  title cards. Reduced-motion keeps the content available without scroll-tied
  movement.
- Mobile layouts separate the phone/profile from the feature list, keep the
  CTA clear of the floating WhatsApp control, and retain a readable three-line
  Arabic headline on wide screens.
- Checked progress 0, .35, .52, .62, .70, .95 and 1 at 360×640, 390×844,
  820×900, 1440×900 and 1920×1080 in Arabic/English and light/dark. Reverse
  scrolling from 1 through .70 and .45 to 0 showed no clipping or horizontal
  overflow. Desktop pointer tilt changes the card transform; the CTA opens the
  existing NFC customizer without changing routes.
- Captured five visual checkpoints (0, .35, .52, .70 and 1). Remaining before
  full scene sign-off: exercise touch drag on a real touch-enabled browser and
  repeat motion/network checks under 4× CPU throttling.

### C2 — The Lookbook

- Mounted after C1 in the active home route. Published Fashion look photos are
  used when available; otherwise the scene selects unique product photography
  and local artwork, showing two to four looks without reusing a photo.
- Added scroll-pinned look selection, previous/next controls, touch-swipe
  handling, a reduced-motion fade, desktop pointer tilt, product hotspots,
  sizes, quick add and wishlist/share controls. Hotspots use published
  `site_hotspots` rows when present and link only to available products in the
  selected market. There is no draggable mobile shop sheet in the current UI.
- The drop timer appears only when a future date and the countdown feature flag
  are both published. It is omitted when either setting is missing or disabled.
- Browser interaction and layout metrics were checked at 1440×900 and
  390×844; the frame centers correctly in RTL, product details open from a
  hotspot, quick add increments the cart, and the next-look control reaches
LOOK 02. Per the owner's direction, the old "Shop the look" strip was removed
and replaced with a prominent "Shop now" chapter CTA.
  Interactive targets are at least 44px, scene text is at least 12px, and the
  public document has no horizontal overflow.
- Self-review: #1 partial (next-look transition checked; slow/fast/reverse
  scrolling still pending); #2 partial (content is present but visual capture
  was unavailable); #3 partial (Arabic/light at 390×844 and 1440×900 checked;
  other required sizes, English and dark mode pending); #4 partial (target and
  minimum text sizes checked; AA contrast and clipping across locales/themes
  pending); #5 pending (network and 4× CPU checks); #6 blocked because
  integrated-browser screenshot capture failed.
- `npm run build`, `npm run lint` and `git diff --check` pass. These checks do
  not complete the outstanding scene acceptance items above. Before full scene
  sign-off: verify real-device swipe behavior, reduced-motion and both
  theme/locale combinations visually, capture five key frames, and repeat
  performance checks under 4× CPU throttling.

### C3 — Digital Studio

- Added a new pinned 200svh Studio scene after the Lookbook, using the three
  existing `studio.project.1`–`.3` media slots and `AGENCY_PROJECTS` records.
  Browser, phone and dashboard mockups enter in sequence, drift through the
  middle of the scene, and converge behind the final project CTA and count-up
  stats. The CTA scrolls to the existing services route without changing its
  data or navigation contract.
- Added localized Studio copy defaults to the site-content layer; published
  content and project-media overrides continue to take precedence.
- The new scene uses the Forest/Mint/Clay tokens, has a reduced-motion layout,
  and keeps all scene text at 12px or larger with a 44px+ CTA target.
- Scoped legacy-class check: no old visual selectors in `StudioChapter.tsx`;
  no legacy hero slat selectors remain in the H1 files.
- Self-review: #1 pending (slow/fast/reverse scroll and overlap review);
  #2 pending (first-frame readability capture); #3 pending (360, 390, 820,
  1440 and 1920 across both locales and themes); #4 partial (12px minimum and
  CTA target are encoded; contrast and Arabic clipping still need visual
  verification); #5 pending (4× CPU and network checks); #6 pending (five
  key-frame screenshots); #7 pending until the above checks are complete.
- `npm run build`, `npm run lint` and `git diff --check` pass.

### C4 — ZEXOR Motors

- Added after C3 as a pinned 250svh scene. The current car image uses the
  fallback-first `cars.sequence`/`cars.hero` asset slots; a published
  `cars.scrub.video` is used when no frame sequence is available. Scroll
  progress drives the selected media, camera push, speed-line intensity,
  headlight glow, real vehicle-spec title cards, and the final listing rail/CTA.
- The CTA and listing rail preserve the existing cars route and listing data.
  Missing or non-image sequence media falls back to the image/poster and then
  the existing vehicle photo.
- The media center can upload an ordered set of up to 80 optimized frames; the
  scene scrubs published URLs with scroll and holds the first frame under
  reduced-motion. Original frame sets are not present in the repository.
- Desktop RTL layout was visually checked in-browser. Full mobile/tablet,
  English, light-theme, slow/fast/reverse and 4× CPU/network checks remain.
- No dedicated frame sequence or scrub video is currently published, so the
  full 1–70% / 100% sequence choreography is pending owner-provided media.

### C5 — ZEXOR Estates finale

- Added after C4 as a pinned 250svh scene. Scroll progress reveals the existing
  property image through moving cloud banks, pushes the building image back,
  reveals the localized copy, warm grade, live property count and the existing
  property route CTA.
- The property name, area, price and count use existing listing data. Missing
  or non-image sequence media falls back to the image/poster and then the
  listing photo; the foreground foliage is a CSS treatment until a dedicated
  transparent plants asset is published.
- RTL desktop and 390px mobile layout metrics were checked; no horizontal
  overflow was reported. English/LTR, light theme, other required widths,
  reduced-motion screenshots, slow/fast/reverse and 4× CPU/network checks
  remain.
- Estate sequence uploads use the same ordered-frame scrub path as the car
  scene; the optional `real-estate.scrub.video` slot is also wired to scroll
  progress. The current local/default asset is still a static property image.
- Final five-frame storyboard comparison and sign-off are pending.

## Phase 4 implementation notes

- The shared `DepartmentBanner` now exposes stable styling hooks for the hero
  image, scrim, title, copy, CTA and slide controls. `pages.css` sets a
  viewport-aware 56vh desktop / 44vh mobile presentation while retaining the
  existing image fallback, localized content, carousel and reduced-motion
  behavior.
- Marketplace filters now collapse behind an accessible mobile toggle, show
  the active-filter count and remain expanded on desktop. Existing filter,
  saved-search, comparison, inquiry and listing logic is unchanged.
- Marketplace cards retain their existing data/actions and gain more consistent
  image proportions, spacing, focus treatment and hover behavior. Full
  cross-page Phase 4 review and browser checks remain pending.
- The studio cost estimator keeps its three project choices compact on mobile
  and exposes the selected choice through `aria-pressed`; its pricing and
  inquiry behavior are unchanged.
- Checkout, tracking and NFC customization overlays now expose dialog semantics,
  localized accessible names and visible keyboard focus indicators. Their
  existing order, tracking and customization flows remain unchanged.
- Department directory tiles now use readable 12px labels, descriptions,
  counters and actions in both locales. RTL mobile and tablet/desktop widths
  (390, 820 and 1440px) were checked for horizontal overflow.
- Product card wishlist/share controls and fashion size choices now meet a 44px
  minimum touch target while preserving the 4:5 apparel image ratio and
  existing cart, wishlist and share behavior.
- Marketplace category, filter, comparison and listing-gallery controls now
  receive the same 44px minimum touch area with localized gallery/close labels.
- The contact form now has programmatically associated labels, 44px minimum
  fields, and 16px input text to avoid mobile browser zoom; submission and
  WhatsApp behavior are unchanged. Newsletter validation is announced and
  associated with the email input, and FAQ disclosures expose their expanded
  state and answer region while respecting reduced motion.
- Order-tracking inputs now have localized accessible names, 44px touch
  targets and mobile-friendly text sizing. Footer navigation, social links and
  utility controls meet the same minimum touch size.
- The studio calculator now programmatically labels its page-count and
  integration controls, groups the project-type choices for assistive
  technology, announces estimate updates and download status, and keeps its
  integration selector at a 44px minimum height.
- The public digital card now marks its data section as busy while loading,
  retains a screen-reader heading for loading/error states, respects reduced
  motion for loading placeholders, and provides 44px home links with visible
  keyboard focus. The missing-card state was checked at 390px in RTL with no
  horizontal overflow.
- The marketplace image zoom now has dialog semantics, localized accessible
  names and a 44px close target; clicking the image itself no longer closes the
  dialog, while clicking the backdrop still does. Escape closes the topmost
  marketplace overlay; the zoom dialog moves focus to its close button and
  restores focus to the trigger. This was checked on a 390px viewport.
  The static 404 fallback now redirects nested GitHub Pages project paths to
  the configured repository root and announces the redirect in Arabic; project
  and root redirect cases passed a script-level check.
- `SitePreloader` runs once per session for 1.5 seconds, exposes a localized
  status, respects reduced motion, and does not intercept input. The optional
  two-step finder is controlled by the published `feature.quiz` switch.
- The Media Center keeps drafts under a `.__draft` key separate from live
  content, so edits do not replace published content until Publish. It supports
  asset history/rollback-as-draft, reset, image WebP conversion, video duration
  checks/posters, multi-frame sequences, bilingual copy and product hotspots.
  Supabase access remains unverified until the owner applies the migration and
  tests with an authorized admin account.

## Phase 1 implementation notes

- Original `src/index.css` contains theme-specific overrides that target
  hard-coded Tailwind colors, as well as duplicated selectors and `!important`
  declarations. This has been replaced with the six CSS modules required by R-04.
- The existing `src/main.tsx`, Supabase client, authentication, checkout, order
  tracking and admin tables are the compatibility boundary. Do not rewrite them.
- Additive media/content SQL must be reviewed, documented and left unapplied;
  the owner runs it from Supabase Dashboard → SQL Editor.
