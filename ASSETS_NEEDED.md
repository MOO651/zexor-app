# ZEXOR — Assets Needed (handoff file)

Read this together with the main redesign prompt. It lists every video, photo, image sequence and 3D model the new design uses.

## Rules for the agent
1. Put all files under `/public/media/` using EXACTLY the file names below.
2. Centralize every path in ONE file: `src/config/assets.ts` (template at the end). Components must import paths from it and never hardcode them.
3. Every asset must have a fallback: if a file is missing, use the best existing image from `/public/images` or a palette gradient. The site must never show a broken image, an empty frame or a blank section.
4. Never use the same photo twice in one scene. Apply one shared color grade to all media (warm highlights, slightly desaturated greens, soft contrast).
5. After scanning `/public/media`, write `ASSETS_STATUS.md` listing which files exist, which are missing and which fallback is used.
6. Compress everything: video WebM (VP9) plus MP4 (H.264) fallback; images AVIF/WebP plus JPG fallback; 3D models with Draco/KTX2.

## Folder structure
```
/public/media/
  video/   hero/ , chapters/
  photos/  fashion/ , cars/ , realestate/ , nfc/ , studio/
  sequences/ cars/ , realestate/
  3d/
  textures/
  og/
```

## 1. Videos (the hero letters: 5 windows)
All: portrait 4:5 (1080x1350), 5 to 8 seconds, seamless loop, NO audio, 24-30fps, max 1.5MB each in WebM, plus an MP4 copy and a poster JPG (same name, `.jpg`). Warm, slow, cinematic camera movement.

| File | Letter / Section | Subject |
|---|---|---|
| `video/hero/z-nfc.webm` | Z / NFC Cards | hand tapping an NFC card on a phone, macro, soft light |
| `video/hero/e-fashion.webm` | E / Fashion | slow movement of a streetwear outfit or fabric in wind |
| `video/hero/x-studio.webm` | X / Digital Studio | screens with UI or code, slow camera push, green-tinted |
| `video/hero/o-cars.webm` | O / Cars | slow car detail or road at golden hour |
| `video/hero/r-estate.webm` | R / Real Estate | modern villa or building, slow drone or push-in at golden hour |

Also: `video/hero/clouds-loop.webm` (optional): 1920x1080 mist/cloud loop, transparent-friendly, 8s, under 3MB.

## 2. Scroll-scrubbed sequences (Cars and Real Estate)
Pick ONE method per chapter: (A) image sequence or (B) one video scrubbed by scroll. The agent must support both and prefer A when frames exist.
- `sequences/cars/frame-001.webp` ... `frame-090.webp`: 1920x1080, each under 90KB, a car moving from far to near (or a slow orbit). Also a 960x540 set in `sequences/cars/sm/` for mobile.
- `sequences/realestate/frame-001.webp` ... `frame-060.webp`: slow push-in towards a property (clouds parting if possible). Also `sm/` mobile set.
- Method B fallback: `video/chapters/cars-scrub.mp4` and `video/chapters/realestate-scrub.mp4` (1920x1080, 6 to 10s, keyframe every frame / all-intra so scrubbing is smooth).

## 3. Photos
Common: 2400px on the long side, sRGB, same grade, no text or watermarks, subject kept away from the edges so any crop works.

### Fashion "Lookbook" (4 looks, ratio 4:5, 2400x3000)
`photos/fashion/look-01.jpg` ... `look-04.jpg`: full outfit, one person per look, clean urban or studio backgrounds, green/cream/neutral tones.
Detail shots (4:5): `photos/fashion/look-01-detail.jpg` ... `look-04-detail.jpg` (back, fabric or print close-up, used for hover/swipe).
Hotspot data (the agent stores it in the config): for each look, 2 or 3 points as percentages `{x, y, productId}` on the garments.
Product photos for the shop strip: one per product, 4:5, 1200x1500, file name = product slug, e.g. `photos/fashion/products/<slug>.jpg`. Reuse the real products already in the database.

### Cars (16:10, 2400x1500)
`photos/cars/<slug>-front.jpg` and `<slug>-side.jpg` for each rental car (real photos of your fleet preferred). Plus `photos/cars/hero-wide.jpg` (21:9, 3200x1370) for the chapter background.

### Real estate (16:10, 2400x1500)
`photos/realestate/<slug>-exterior.jpg` and `<slug>-interior.jpg` for each property. Plus `photos/realestate/finale-hero.jpg` (21:9, 3200x1370, golden hour) and a separate foreground plant layer `photos/realestate/foreground-plants.png` (transparent PNG/WebP).

### NFC cards
`photos/nfc/card-front.jpg`, `card-back.jpg`, `card-hand-tap.jpg` (1:1 or 4:3), plus transparent cutouts `card-front.png` and `card-back.png` for the 3D fallback.

### Digital Studio
Screenshots of real finished projects (browser frame not included, 16:10, 1920x1200): `photos/studio/<project-slug>.jpg`. The agent builds floating mockups from these.

## 4. Textures and extras
- `textures/mist-01.webp`, `mist-02.webp`: soft cream/mint mist on transparent background, 2048px.
- `textures/cloud-layer-1.webp`, `cloud-layer-2.webp`, `cloud-layer-3.webp`: three cloud layers for parallax (transparent, 2400px wide).
- `textures/grain.webp`: seamless film grain tile, 512px.
- `textures/env-warm.hdr` (1k or 2k HDRI, warm sunset or studio) for the metal card reflections.
- `og/og-image.jpg` 1200x630 and `og/og-card-share.jpg` (template for shared digital cards).

## 5. 3D models (glTF/GLB, Draco compressed, under 1MB each)
| File | Description | Priority |
|---|---|---|
| `3d/nfc-card.glb` | credit-card size (85.6 x 54mm, rounded corners, thin), separate meshes for front/back/chip, UV mapped so the customizer can swap color, name and logo textures live | P3 must |
| `3d/hoodie.glb` | simple hoodie for the Fashion chapter accent | optional |
| `3d/car.glb` | one car model for the 360 spin or AR view | P6 optional |

If no model exists yet, the agent builds the NFC card procedurally in three.js (rounded box + chip + metallic material) and keeps the loader ready for the `.glb`.

## 6. Where to get media (check each license before use)
- Photos: your own shoots (best), Pexels, Unsplash (free licenses; avoid recognizable brand logos and identifiable people without a release).
- Videos: your own shoots, Pexels Videos, Coverr, Mixkit (free licenses).
- 3D models: Sketchfab (filter "Downloadable" and check CC license), Poly Haven (CC0 HDRIs and textures), or custom-made in Blender.
- AI-generated video/images are an option for mist, clouds and abstract motion; keep a record of the tool and its usage terms.
- Keep a `IMAGE_CREDITS.md` updated with source, author and license for every non-original asset.

## 7. Template: `src/config/assets.ts`
```ts
const base = '/media';

export const assets = {
  heroLetters: [
    { letter: 'Z', section: 'nfc',     video: `${base}/video/hero/z-nfc.webm`,     mp4: `${base}/video/hero/z-nfc.mp4`,     poster: `${base}/video/hero/z-nfc.jpg` },
    { letter: 'E', section: 'fashion', video: `${base}/video/hero/e-fashion.webm`, mp4: `${base}/video/hero/e-fashion.mp4`, poster: `${base}/video/hero/e-fashion.jpg` },
    { letter: 'X', section: 'studio',  video: `${base}/video/hero/x-studio.webm`,  mp4: `${base}/video/hero/x-studio.mp4`,  poster: `${base}/video/hero/x-studio.jpg` },
    { letter: 'O', section: 'cars',    video: `${base}/video/hero/o-cars.webm`,    mp4: `${base}/video/hero/o-cars.mp4`,    poster: `${base}/video/hero/o-cars.jpg` },
    { letter: 'R', section: 'estate',  video: `${base}/video/hero/r-estate.webm`,  mp4: `${base}/video/hero/r-estate.mp4`,  poster: `${base}/video/hero/r-estate.jpg` },
  ],
  clouds: `${base}/video/hero/clouds-loop.webm`,
  sequences: {
    cars:   { dir: `${base}/sequences/cars`,       count: 90, mobileDir: `${base}/sequences/cars/sm` },
    estate: { dir: `${base}/sequences/realestate`, count: 60, mobileDir: `${base}/sequences/realestate/sm` },
  },
  scrubVideo: {
    cars:   `${base}/video/chapters/cars-scrub.mp4`,
    estate: `${base}/video/chapters/realestate-scrub.mp4`,
  },
  fashionLooks: [
    { id: 'look-01', photo: `${base}/photos/fashion/look-01.jpg`, detail: `${base}/photos/fashion/look-01-detail.jpg`, hotspots: [{ x: 48, y: 30, productId: '' }, { x: 52, y: 62, productId: '' }] },
    { id: 'look-02', photo: `${base}/photos/fashion/look-02.jpg`, detail: `${base}/photos/fashion/look-02-detail.jpg`, hotspots: [] },
    { id: 'look-03', photo: `${base}/photos/fashion/look-03.jpg`, detail: `${base}/photos/fashion/look-03-detail.jpg`, hotspots: [] },
    { id: 'look-04', photo: `${base}/photos/fashion/look-04.jpg`, detail: `${base}/photos/fashion/look-04-detail.jpg`, hotspots: [] },
  ],
  photos: {
    carsHero:   `${base}/photos/cars/hero-wide.jpg`,
    estateHero: `${base}/photos/realestate/finale-hero.jpg`,
    estatePlants: `${base}/photos/realestate/foreground-plants.png`,
    nfcFront:   `${base}/photos/nfc/card-front.jpg`,
    nfcBack:    `${base}/photos/nfc/card-back.jpg`,
  },
  textures: {
    mist: [`${base}/textures/mist-01.webp`, `${base}/textures/mist-02.webp`],
    clouds: [`${base}/textures/cloud-layer-1.webp`, `${base}/textures/cloud-layer-2.webp`, `${base}/textures/cloud-layer-3.webp`],
    grain: `${base}/textures/grain.webp`,
    env: `${base}/textures/env-warm.hdr`,
  },
  models: {
    nfcCard: `${base}/3d/nfc-card.glb`,
    hoodie:  `${base}/3d/hoodie.glb`,
    car:     `${base}/3d/car.glb`,
  },
  og: { default: `${base}/og/og-image.jpg`, card: `${base}/og/og-card-share.jpg` },
} as const;

// Helper: frame URL for scroll-scrubbed sequences
export const frameUrl = (dir: string, i: number) => `${dir}/frame-${String(i).padStart(3, '0')}.webp`;
```

## 8. Priority (what to get first)
1. The 5 hero videos (or at least posters) and `nfc-card.glb`.
2. Cars and real-estate sequences (or scrub videos).
3. Fashion looks (4 photos plus details) and real product photos.
4. Textures (mist, clouds, grain) and HDRI.
5. Everything else.
