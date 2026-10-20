# Adding and managing photography

The site has two image workflows. Use the admin dashboard for listing-specific
photos and the media center for shared site sections.

## Product, vehicle and property listings

1. Open `#dashboard` and sign in as a store administrator.
2. Open Products, Vehicles or Real Estate, then add or edit a listing.
3. Choose an image. The dashboard accepts JPG, PNG, WebP and AVIF files up to
   20 MB, scales them to at most 1400 px, converts them to WebP and compresses
   the prepared image to 450 KB or less.
4. Save the listing. The optimized image is stored with the catalog record and
   synchronized through the configured Supabase database.

These listing images are currently stored inline in the catalog data, not in
Supabase Storage. Keep images optimized; large catalogs with many photos should
move to Storage URLs before production-scale use.

## Shared site photography and media

Use **Dashboard → Media** for hero posters, fashion slots, chapter media, NFC
previews, textures, bilingual copy and lookbook hotspots. Uploads are saved as
drafts; publish each draft to make it visible to visitors. Shared media is
uploaded to the `site-media` Supabase Storage bucket.
Shared-site images are converted to WebP, scaled to at most 1800 px and
compressed to 1 MB or less. This only applies to new uploads; existing
published objects and archived history are kept to avoid breaking live content
or rollback.

The media center requires
`supabase/migrations/20261020_site_media_content.sql`, an authorized
administrator account, and the `site-media` bucket and policies created by
that migration. See [the owner guide](./دليل-المالك.md) for first-time setup.

## Local fallbacks and photography requirements

Bundled photography and locally authored artwork live in `public/images/`.
Their file paths are centrally listed in `src/data/imagery.ts`; replacing a
local fallback requires changing the corresponding file and deploying the
site. Shared-slot overrides should instead be managed through the media center.

The Unsplash vehicle and property images are illustrative stock, not photos of
the exact listings. Do not advertise them as actual fleet or property photos.
Verify source, author and license for non-original assets in
[`IMAGE_CREDITS.md`](./IMAGE_CREDITS.md), and replace illustrative imagery with
owner-approved photos before publishing real inventory.
