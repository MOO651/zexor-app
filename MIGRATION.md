# ZEXOR full-site redesign migration

The latest brief restores the Jade Luxe light theme as the default, keeps the cinematic dark theme, and tracks the whole-site redesign. Status values: `DONE`, `IN PROGRESS`, `PENDING`, `REMOVED`, `N/A`.

## UI file audit

| File | Surface | Status |
|---|---|---|
| `index.html` | Theme prepaint, metadata, browser chrome | DONE |
| `src/main.tsx` | React entry, NFC public card route | DONE |
| `src/App.tsx` | Theme, shell, navbar, routes, floating actions | DONE |
| `src/index.css` | Ordered imports for the modular global stylesheets | DONE |
| `src/styles/tokens.css` | Light/dark tokens and shared card primitive | DONE |
| `src/styles/base.css` | Base styles, typography and document defaults | DONE |
| `src/styles/components.css` | Shared component styles | DONE |
| `src/styles/home-scenes.css` | Home composition and cinematic chapter styles | DONE |
| `src/styles/pages.css` | Customer page and route styles | DONE |
| `src/styles/admin.css` | Admin layout and responsive styles | DONE |
| `tailwind.config.js` | Tailwind token extensions | DONE |
| `src/components/HomeHero.tsx` | Interactive five-letter image-window hero | DONE |
| `src/components/CinematicDepartmentScenes.tsx` | NFC, fashion, cars, property and scene order | DONE |
| `src/components/CinematicScenePrimitives.tsx` | Shared scene wrapper, progress and heading | DONE |
| `src/components/DigitalExperienceScene.tsx` | Scene 03: Digital Studio | DONE |
| `src/components/NfcHero3D.tsx` | Lazy interactive NFC model | DONE |
| `src/components/useSceneProgress.ts` | Scroll progress and low-power detection | DONE |
| `src/components/CategoryShowcase.tsx` | Homepage department selector | DONE |
| `src/components/DepartmentBanner.tsx` | Department landing banners | DONE |
| `src/components/DepartmentEmptyState.tsx` | Empty and search states | DONE |
| `src/components/ProductCard.tsx` | Product/listing cards and price layout | DONE |
| `src/components/Marketplace.tsx` | Product, car and property listings/details | DONE |
| `src/components/CardView.tsx` | Public NFC profile | DONE |
| `src/components/NfcCustomizerModal.tsx` | NFC customization | DONE |
| `src/components/CheckoutDrawer.tsx` | Cart, payment and checkout | DONE |
| `src/components/TrackingModal.tsx` | Order tracking | DONE |
| `src/components/AgencyPortfolio.tsx` | Agency/services and pricing | DONE |
| `src/components/TestimonialsSection.tsx` | Reviews and empty state | DONE |
| `src/components/HomeSections.tsx` | FAQ, newsletter, footer and shared prompts | DONE |
| `src/components/AdminDashboard.tsx` | Admin tables, forms, charts and navigation | DONE |
| `src/data/portals.ts` | Shared department order and scene metadata | DONE |
| `src/data/imagery.ts` | Optimized shared imagery | DONE |
| `src/data/initialData.ts` | Storefront copy and seeded content | DONE |
| `src/lib/siteData.ts` | Public data and persistence behavior | N/A — logic-only audit |
| `src/lib/backupValidation.ts` | Backup validation | N/A — logic-only audit |

## Required order

1. `01 NFC Cards`
2. `02 Fashion`
3. `03 Digital Studio`
4. `04 Cars`
5. `05 Real Estate`

## Phases

- [ ] Phase 1 — IN PROGRESS: restore Jade Luxe light mode as default; semantic light/dark tokens, no-flash theme persistence and shared UI surfaces. Reopened after follow-up testing found the home navigation used the lighter glass token instead of the stronger theme-aware surface; verify remaining shared surfaces before marking complete.
- [ ] Phase 2 — IN PROGRESS: align hero and five scenes to required order and image-window concept; fix scene visibility, dimensions, spacing and motion fallbacks. Reopened because the NFC WebGL canvas was detected but its rendered appearance was not visually confirmed.
- [x] Phase 3 — migrate customer routes, cards, forms, overlays, empty states and footer.
- [x] Phase 4 — migrate admin dashboard without changing data behavior.
- [ ] Phase 5 — automated route/layout sweep is complete across 12 routes, six widths (320, 390, 430, 768, 1024 and 1440px), both themes and both locales (288 combinations) with no detected overflow, broken large images, offscreen main headings, empty main content, or theme/direction mismatch. Representative screenshots have been reviewed for the home, NFC, fashion, studio/services, pricing, calculator, cars, property and reviews surfaces. Screenshot-by-screenshot visual overlap review of every route/width/theme/locale combination remains open; the dashboard screenshot review also remains limited to the unauthenticated login because no signed-in admin session is available.
- [x] CSS module extraction — split the former global stylesheet into ordered files without changing the rule order.
- [x] P1 session preloader — implemented and verified in normal/reduced-motion modes.
- [x] P3 — the NFC customizer now reuses the Three.js card model and updates its finish, identity texture and reverse-side profile link live; low-power and reduced-motion users retain a CSS preview.
- [x] P5 department finder — added a localized three-question matcher that opens the recommended department.
- [ ] P1 hero video clips and P2 scrubbed car/property sequences — implementation remains image-first until cleared, optimized motion assets are supplied; see `ASSETS_NEEDED.md`.
- [ ] P4 shared WebGL image effects and P6 AR/360 experiences — not implemented; these depend on an approved, compressed asset set and additional low-power-device validation.

## Current continuation

- Extracted the global styles into ordered modules while preserving cascade order; removed confirmed-dead NFC hero card styles.
- Added a localized three-question department finder after the five cinematic chapters.
- Hero video playback is opt-in through the centralized asset map and is skipped for reduced-motion, data-saving and low-power devices.
- The NFC customizer shares the lazy Three.js card model with the NFC chapter, previews user-entered identity and finish on both sides, and falls back to CSS for reduced-motion, low-power or unavailable-WebGL environments.
- Automated layout QA covers all 12 customer/admin routes at 320, 390, 430, 768, 1024 and 1440px in both themes and locales; complete visual screenshot review is still pending.
- Representative screenshot review now includes home, NFC, fashion, Studio/services, pricing, calculator, cars, property and reviews. This is sampling, not a claim that all 288 route/viewport/theme/locale screenshots were manually inspected.
- Authenticated dashboard content still needs a separate review in a signed-in admin session; the available route shows the login surface only.
- No approved video, GLB, GLTF, USDZ, or 360-tour assets are present. Keep the image-first P1/P2 behavior and defer P4/P6 until suitable licensed assets are supplied.
- The full cascade cleanup remains open: the stylesheet still contains legacy repeated selectors and `!important` declarations. Continue only with route/viewport checks to protect established styling.
- Reopened Phase 1 and Phase 2 rather than treating earlier build and layout checks as proof of visual completion. The home navigation now uses `--zx-glass-strong`; in the live browser, both light and dark computed surface colors matched their tokens when the navigation transition was disabled for measurement. The browser preview left that transition at its starting frame, so this is not evidence that all animated surfaces have been reviewed.
- A 390px light-theme homepage screenshot was sampled. The five-scene sequence still needs a reliable visual review, especially the NFC 3D render; a WebGL context alone is not sufficient verification.

## Change log

- 2026-10-18: User reports persistent dead space across customer pages and the admin. Start a viewport-by-viewport visual audit of all route sections at 390px, 820px and 1440px in both themes; identify each concrete content/height issue before editing layout components.

- 2026-10-18: Restored original light palette tokens and added dark-mode values, theme-before-paint, persisted theme initialization and the required five-department order. Updated the hero to remove its floating NFC model and make each image-filled letter a scene selector. Moved the NFC model to scene 01; reordered scenes and counters to NFC, Fashion, Digital Studio, Cars and Real Estate.
- 2026-10-18: Added responsive hero composition and shared scene spacing; lazy-mounted the 3D card near the viewport, synchronized Lenis touch scrolling, aligned footer links, and improved garment image and price-row layout.
- 2026-10-18: Completed Tailwind semantic token mapping for surfaces, primary text, shadows, typography and motion. Audited the React entry and shared scene primitives; all headings stay accessible and visible before scroll.
- 2026-10-18: Fixed department and category cards/banners/empty states so images, labels and actions render immediately with theme-aware overlays, high-contrast text, reduced-motion support and 44px touch controls.
- 2026-10-18: Updated product cards and marketplace controls, galleries, filters, compare actions and listing CTAs for readable image treatments, wrapping prices and accessible touch targets.
- 2026-10-18: Public NFC profiles now respect the selected theme. Customization, checkout and order tracking dialogs use dynamic viewport sizing, reduced-motion support, stronger labels and touch-sized actions; business logic remains intact.
- 2026-10-18: Updated agency, testimonials, FAQ, newsletter and footer styling to shared tokens; retained honest empty-review content and existing contact/order flows.
- 2026-10-18: Migrated the admin dashboard to semantic colors and consistent fields/tables; admin brand settings now update storefront palette and readable foregrounds.
- 2026-10-18: Confirmed all five shared department portals and Latin scene indices; centralized WebP imagery, seeded catalog photography and market-specific catalogue data. Example vehicles and properties are rentals; existing admin-authorized sale support remains.
- 2026-10-18: Updated lazy NFC model materials and textures to respond to live admin palette edits and dispose replaced textures.
- 2026-10-18: Fixed hero information label contrast for pale custom accents and repositioned the compact Real Estate scene counter to keep it clear of the call-to-action.
- 2026-10-18: Final automated QA passed: 288 route/theme/locale/viewport combinations across 12 routes, six widths, both themes and both locales; no overflow, empty main content, direction/theme mismatch, browser console error or page error. Visual review was sampled, not a screenshot review at every combination. `npm run lint` and `npm run build` both passed.
- 2026-10-18: Removed trailing blank lines from the global stylesheet after git diff --check flagged its EOF formatting.
- 2026-10-18: Live browser review found excess whitespace between announcement and navigation, a desktop hero composition taller than its viewport, and oversized gaps between homepage scenes. Adjust the shared hero and flow spacing; this is the start of the user's visual refinement pass.
- 2026-10-18: Tightened the homepage masthead and section gaps, fixed light-mode hero label specificity against custom admin accents, and scaled desktop hero type to viewport height so the CTA stays inside the first screen.
- 2026-10-18: Direct measurement at 820px exposed a tablet-only hero width overflow and oversized Arabic line-height inherited from the global heading rule. Correct tablet inset sizing and give the image wordmark its own compact line-height.
- 2026-10-18: Prevented the absolute hero panel from overconstraining its width between both horizontal insets on desktop and tablet.
- 2026-10-18: Traced the oversized hero wordmark to the Arabic global button line-height being inherited by each letter button; constrain those decorative controls to the wordmark line-height.
- 2026-10-18: Live scene review showed light-theme chapter labels/titles inheriting the foreground meant for accent-color chips, mobile mockups colliding with fixed controls, and marketplace hero copy sitting directly on top of vehicle art. Applying surface-aware scene colors, safe composition spacing and legible banner panels.
- 2026-10-18: Light-theme scene headings now use surface-safe text. Added a consistent fabric-card label scrim, lifted mobile details clear of the floating actions, restored readable rental counters, and placed marketplace banner copy in a high-contrast glass panel.
- 2026-10-18: Follow-up scene review caught the Fashion rail opening on the last card in RTL, Digital Studio mockups under fixed actions, and the Estate reveal hiding its building too long. Correct the rail direction and reserve visual space around mobile scene controls.
- 2026-10-18: Fixed RTL gallery start position, moved mobile digital mockups and estate actions clear of floating controls, enlarged the property reveal, and separated carousel controls from department-banner copy.
- 2026-10-18: Live scroll-through found an extra Digital Studio badge covering the mobile mockups and overly long pinned durations creating blank exits. Simplify the mobile mockup and shorten scene travel distances.
- 2026-10-18: Simplified Digital Studio's compact composition and shortened pinned scene durations to reduce empty scroll tails on phones and desktop.
- 2026-10-18: Fixed dark text on primary buttons in reviews and tracking by correcting the theme foreground token used by Tailwind.
- 2026-10-18: Final spacing audit showed stacked main/footer margins left large plain bands between customer content and the footer. Tighten shared footer separation while retaining safe area for floating actions; simplify the mobile digital mockup to the two principal panels.
- 2026-10-18: Reduced excess whitespace stacked before the footer and removed the third overlapping Digital Studio panel on small screens.
- 2026-10-18: Final visual refinement build and lint passed; route, theme, locale and viewport checks passed across 288 combinations. Manual visual review sampled the home flow, listing pages, customer forms, review/tracking pages and admin login. Phase 5 remains open for full screenshot-by-screenshot visual review at every route and size.
- 2026-10-18: Route completeness pass: separate the services overview, pricing page and project calculator so each navigation item opens its own focused content instead of repeating the full agency page.
- 2026-10-18: Completed the route completeness fix: Services now shows its overview and portfolio, Pricing opens only the package comparison, and Calculator opens only the interactive estimator. Verified all three live routes plus the not-found state; production build and lint pass.
- 2026-10-18: Visual audit of the live Pricing page found low-contrast mint headings and warning-brown agency panels; correct the shared Studio surfaces to use accessible text and the Jade light/dark tokens.
- 2026-10-18: Visual follow-up from the live Pricing screenshot: fill the empty hero column with a route-specific graphic, bring Arabic title sizing back into balance, and remove duplicated section spacing.
- 2026-10-18: Browser measurements exposed Tailwind end margins stacking on top of the Studio flex gap; remove both margins and slightly tighten the focused page headline scale.
- 2026-10-18: Final cascade check found the global heading scale overriding the Studio title size. Set a route-specific heading override after global typography so the visual hierarchy holds at desktop and mobile widths.
- 2026-10-18: Direct desktop review found the long Services banner title using the global oversized heading scale; cap department banner headlines to a legible responsive size while keeping mobile RTL layouts intact.
- 2026-10-18: Live page review caught the floating WhatsApp action covering package and estimate details; auto-hide the floating action only while it overlaps interactive storefront content.
- 2026-10-18: Applied the visual refinements and floating-action collision guard. Live-checked Services, Pricing and Calculator at 390/820/1440, plus Cars, Property, Fashion, NFC Cards and Contact; no horizontal overflow. `npm run build`, `npm run lint` and `git diff --check` pass.

- 2026-10-18: Responsive layout pass for phone/tablet/desktop: filled the hero’s unused area with linked department imagery and compact market/department facts, fixed wide-screen copy/image overlap, preserved scroll-driven transitions while reducing oversized pinned-scene travel, used a reliably visible NFC-card fallback at compact widths, and improved empty-cart, review and admin-order states. Captured hero screenshots at 390px, 820px and 1440px in light and dark themes; visually reviewed all three light screenshots and the desktop dark screenshot. The existing route scan found no horizontal overflow at its audited breakpoints.

- 2026-10-18: Responsive pass complete. `npm run build`, `npm run lint`, and `git diff --check` pass. Scroll-linked scene animations remain enabled with shorter pinned travel; inspect all authenticated admin content in a live signed-in browser separately.

- 2026-10-18: User requests a more focused ZEXOR homepage centered on its five departments, with secondary content below, plus a mobile preview and a file-by-file project review. Start by mapping the home composition, shared shell, page components, styles, and package checks before making changes.
- 2026-10-18: Homepage restructure complete: after the hero, show the five department scenes once, then place stats, customer feedback, FAQ, tracking/newsletter and contact CTA below. Removed the duplicate department directory and per-department product showcases from the homepage while leaving their dedicated routes intact. Scene visibility follows admin settings, and selecting a hero department still scrolls to it or opens its route when hidden. Mobile audit at 390x844 found all five scenes, no horizontal overflow, and no empty or failed customer routes across the 11 audited routes. Opened a narrow local Chrome preview for hands-on mobile review. `npm run build` and `npm run lint` pass; TypeScript and ESLint covered the 32 files under `src`.

- 2026-10-18: User asks for another full visual pass focused on homepage/layout whitespace, department consistency, and scroll rhythm across the site. Audit shared page spacing and scroll behavior at mobile, tablet, and desktop before applying targeted corrections.
- 2026-10-18: Completed the shared scroll and spacing pass: storefront routes now use the same Lenis behavior while the admin remains native-scroll; homepage content uses a consistent 16–24px section rhythm and all five cinematic scenes share a shorter 115svh travel distance. Tightened mobile hero bottom spacing, preserved reduced-motion behavior, and verified light/dark at 390, 820 and 1440px: all five scene heights match at each viewport and there is no horizontal overflow. `npm run build`, `npm run lint`, and `git diff --check` pass. Captures are available under the system temporary `zexor-rhythm-audit` folder; the live mobile preview remains open. Visual review sampled the homepage at each tested width, not every route.
- 2026-10-18: Completed P3 by wiring the NFC customizer to the existing lazy Three.js card model. Finish, name, title, company and profile URL update the live card textures; the flip control turns the model to its reverse. Low-power and reduced-motion devices keep a CSS preview, and the WebGL canvas includes a CSS fallback. Verified the modal, canvas, finish/name/flip interaction and add-to-cart flow in the browser; `npm run build` and `npm run lint` pass.
- 2026-10-18: Re-ran the automated visual-layout matrix on 12 routes at 320, 390, 430, 768, 1024 and 1440px in both themes and locales (288 combinations). No horizontal overflow, broken large inline images, offscreen main headings, empty main content, or theme/direction mismatches were detected. Sampled the home opener at desktop and mobile; the exhaustive screenshot-by-screenshot overlap review remains open. No approved motion/3D/360 assets are present, so P1/P2 and P4/P6 remain deferred.
- 2026-10-18: Continued Phase 5 with representative live screenshot review of the home, NFC, fashion, Studio/services, pricing, calculator, cars, property and reviews surfaces. No concrete overlap/clipping defect was confirmed in the sampled views. Full manual review of all 288 combinations and authenticated dashboard content is still pending; motion, 3D and 360 work remains blocked on approved assets.
- 2026-10-18: Finalized Phase 1 shared-surface verification. Confirmed semantic light/dark token aliases and the full-screen mobile navigation across Arabic/RTL and English/LTR, light and dark themes, and 390px/820px/1440px viewports. All five departments appear in order; the menu scrolls on compact screens and is hidden at desktop width. `npm run build`, `npm run lint`, and `git diff --check` pass. Exhaustive screenshot review and the wider legacy CSS cascade cleanup remain separate open items.
