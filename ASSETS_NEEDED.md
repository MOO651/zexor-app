# ZEXOR cinematic asset checklist

The storefront already has local image fallbacks in `public/images/`; replacing
those named files updates their existing use without changing component code.
The optional motion assets below should be added only when cleared for commercial
use. Keep the still-image experience as the fallback on reduced-motion, low-power
and unsupported devices.

| Asset | Suggested specification | Used for | Suggested sources and rights checks |
| --- | --- | --- | --- |
| Five hero letter-window clips (`hero-cards.webm`, `hero-fashion.webm`, `hero-studio.webm`, `hero-cars.webm`, `hero-property.webm`) | 3–5 second seamless loop; silent; 16:9; 1920×1080; WebM VP9/AV1 plus H.264 MP4 fallback; target ≤1.5 MB per clip; matching 1200×675 WebP poster | Z, E, X, O and R in the home opener, respectively NFC, fashion, digital studio, cars and property | Shoot commissioned brand footage, or source clips from [Pexels Videos](https://www.pexels.com/videos/) under the [Pexels License](https://www.pexels.com/license/). Check recognizable people, trademarks, property releases and any restrictions on redistribution. |
| Car scroll-sequence frames (`car-0001.webp` …) | 24–36 consistently framed frames; 1600×1000 or 16:10; WebP/AVIF, ≤100 KB each; one vehicle, camera and lighting setup throughout; optional low-resolution mobile set | Scroll-scrubbed Cars chapter | Prefer a commissioned turntable/drive-by shoot. Existing illustrative car photos are in `public/images/vehicle-*.webp`; those are still-image fallbacks, not sequence frames. |
| Property reveal layers (`estate-sky.webp`, `estate-building.webp`, `estate-foreground.webp`) | 2000×1200, 5:3 or 16:9; WebP; transparent alpha on the building/foreground layers; separate clouds, building and plants with generous overlap | Parallax Real Estate finale | Use owner-approved photography or commissioned composites. Pexels and [Unsplash](https://unsplash.com/) may be used under their respective [Pexels License](https://www.pexels.com/license/) and [Unsplash License](https://unsplash.com/license/); verify model/property releases and do not imply a stock image depicts a specific listing. |
| NFC card product photos (`nfc-card-*.webp`) | 1600×1000; 8:5; WebP/AVIF; front, reverse, chip and finish detail shots on a consistent neutral set | Product listings, card scenes and customizer image fallback | Shoot actual ZEXOR card finishes. Do not substitute imagery that misrepresents the purchasable product. |
| Fashion campaign photos (`fashion-*.webp`) | 1600×2000; 4:5; WebP/AVIF; consistent crop and grading; each image a distinct outfit/model | Fashion chapter and apparel cards | Use brand-owned or commissioned campaign photography with model releases; stock sources must explicitly permit commercial use. |
| NFC card 3D model (`zexor-card.glb`) | GLB; real-world dimensions and PBR materials; ≤5 MB after Draco mesh compression and KTX2 textures; include front/back logo artwork with brand approval | Optional reusable 3D product preview and future AR view | Commission the model or use [Sketchfab downloadable models](https://sketchfab.com/3d-models) only after checking the individual license, commercial-use permission, attribution and redistribution terms. |
| Vehicle 3D model (`zexor-vehicle.glb`) | GLB with Draco/KTX2; ≤10 MB; optimized LODs and neutral studio environment | Optional vehicle spin/AR enhancement | Prefer a licensed manufacturer/commissioned asset. Check each model's commercial rights, trademarks, redistribution restrictions and attribution before use. |
| Property 360 panorama (`property-tour-*.webp`) | Equirectangular 2:1 panorama; 4096×2048; tiled/streamed for mobile | Optional property virtual tour | Capture only properties with owner approval; obtain permission for interiors, people and personal belongings. |
| Shared visual-effect textures (`mist-*.webp`, `fabric-normal.ktx2`) | Seamless or tileable; 1024×1024; compressed; subtle contrast suitable for low-intensity use | Optional shared-canvas mist/ripple/fabric effects | [Poly Haven](https://polyhaven.com/) and [ambientCG](https://ambientcg.com/) publish CC0 assets; retain source/license records and verify any third-party content embedded in a downloaded asset. |

## Integration notes

- Replace files in `public/images/` using the filenames in
  `src/data/imagery.ts` to update existing photo slots.
- Optional hero clip URLs are centralized in `cinematicHeroVideos` in
  `src/data/imagery.ts`. Leave a slot `null` until the matching licensed file
  exists under `public/videos/`; the letter continues to use its existing image.
- Do not make autoplay video, WebGL, or an external embed a prerequisite for
  reading or using a page. Honor reduced motion and data-saving preferences.
- Keep a record of the source URL, asset creator, license, download date and any
  required attribution alongside each supplied asset.
