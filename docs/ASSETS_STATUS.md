# Asset status

Inventory checked against `ASSETS_NEEDED.md` on 2026-10-19.

The project does not currently contain a `public/media/` directory. The
website's bundled visual assets are under `public/images/`, with their paths
defined in `src/data/imagery.ts` and the media-center slot defaults in
`src/config/assets.ts`. Published Supabase media overrides these defaults.
The PNG files in the repository root are QA screenshots, not source photos or
video assets.

| Requirement from `ASSETS_NEEDED.md` | Files found | Current implementation / fallback |
| --- | --- | --- |
| Five hero videos, MP4 alternatives and posters | None | Five default image posters are wired; published videos can play on desktop. The media center accepts one MP4 or WebM per video slot, not a paired WebM/MP4 set. |
| Optional mist/cloud video | None | CSS atmosphere treatment; no local cloud video. |
| Cars sequence: 90 desktop and mobile frames, or scrub video | None | The media center uploads 2–80 image frames (50 MB total limit) or one published `cars.scrub.video`; the chapter scrolls through either source with its poster/image fallback. No source frames or video are currently present. |
| Real-estate sequence: 60 desktop and mobile frames, or scrub video | None | The media center uploads 2–80 image frames (50 MB total limit) or one published `real-estate.scrub.video`; the chapter scrolls through either source with its poster/image fallback. No source frames or video are currently present. |
| Fashion looks, details and real product photography | No owner-provided photos found | Neutral garment-rack photo and locally authored product artwork; campaign photos and product-specific images are still needed. |
| Fleet and property photography | No owner-provided listing photos found | Existing Unsplash stock files are illustrative only; some show recognizable vehicle brands. They must not be presented as the exact listed inventory. |
| NFC card photos and transparent cutouts | None | Locally authored card illustrations; no actual product photos/cutouts. |
| Studio portfolio screenshots | None | Existing generic stock desk photos and authored mockup illustrations; no client-project screenshots. |
| Mist, cloud, grain textures and HDRI | None | CSS atmosphere and local artwork fallbacks. |
| NFC GLB, hoodie GLB and car GLB | None | A procedural Three.js NFC card preview is the fallback; publishing an NFC GLB enables a live model preview in the media center and customizer. No GLB is bundled or published, and hoodie/car models remain unavailable. |
| Open Graph campaign images | No dedicated campaign image set | Existing site logo image is available; no designed general/card share templates. |

No supported video files (`.mp4`, `.webm`, `.mov`, `.m4v`, `.avi` or `.mkv`)
were found in the project or `public/`. Existing photos remain available in
`public/images/`; their license/attribution status is recorded in
`IMAGE_CREDITS.md`. NFC product and portal slots use locally authored card
artwork rather than the unrelated payment-terminal photograph. The branded
streetwear portrait is not used in the active fashion slots.

The owner ran the read-only diagnostic in the Supabase SQL Editor and shared
the result from project `oneebpnthhfsfmyggrth`: all four media tables and
`public.is_store_admin()` exist, and the `site-media` bucket exists with
`public=true`. The SQL run reported the active database as `postgres`. A
read-only public Storage object-list request also returned HTTP 200 with an
empty list, confirming that public object listing works and no files have
been uploaded yet. The bucket-metadata endpoint returned "Bucket not found"
when called with only the browser-safe public key; that endpoint is
administrative and is not a valid public-bucket existence check. Public
published asset/content/hotspot queries are empty, and the admin check returns
false without an authenticated user. The migration is therefore confirmed
applied; next validate an authenticated administrator session and upload an
approved test asset from the dashboard. The local environment still contains
only the public Supabase key; no database password, service-role key or CLI
access is configured. Do not point default paths at absent `/media/` files:
the site's current valid local fallbacks are in `/images/`, while new media
should be reviewed and published through the media center.
