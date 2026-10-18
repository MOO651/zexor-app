# Store photography

The storefront uses locally optimized WebP photographs from `public/images/`.
The exact active filenames are listed in `PHOTO_FILENAMES` in
`src/data/imagery.ts`; replace a WebP asset with a photo using the same name to
update that image site-wide.

| Active files | Suggested photo |
|---|---|
| `nfc-card.webp`, `social-profile.webp`, `custom-identity.webp` | NFC cards and their finishes |
| `streetwear-hoodie.webp`, `streetwear-collection.webp` | Clothing, on model or flat lay |
| `digital-studio.webp`, `digital-commerce.webp` | Real digital products and studio work |
| `vehicle-sedan.webp`, `vehicle-suv.webp`, `vehicle-coupe.webp` | Rental vehicles, front three-quarter view |
| `property-apartment.webp`, `property-villa.webp`, `property-land.webp` | Actual rental spaces and properties |

The project keeps the original JPEG source files alongside the optimized WebP
files. The storefront requests WebP. Keep image dimensions and framing close to
the existing assets to prevent layout shifts.
