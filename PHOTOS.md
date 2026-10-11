# Adding real photography

The site works with the artwork that ships in `public/images/`, but every product
and section has a **slot reserved for a real photograph**. Drop your own files in
and they replace the artwork automatically — no code changes.

## How it works

`src/data/imagery.ts` is the single registry:

- `photos.*` — the path a real photo will live at (e.g. `photo-card-elite.jpg`).
- `art.*` — the fallback artwork used until that photo exists.

Right now every slot points at `art.*`. To switch a slot to your photo, open
`src/data/imagery.ts` and change that one line from `art.<key>` to `photos.<key>`.

> If you'd rather keep it zero-config, save your photos with the filenames below
> and I'll flip the registry over to `photos.*` for you in one pass.

## File names and what to shoot

Save each file in `public/images/`. Recommended: **JPG, 1600×1000 (landscape), under 300 KB.**

| File name | What to shoot |
|---|---|
| `photo-card-elite.jpg` | The pearl/matte NFC card, top-down on a plain surface |
| `photo-card-social.jpg` | The mint NFC card, top-down |
| `photo-card-bespoke.jpg` | The rose/gold NFC card, top-down |
| `photo-card-lifestyle.jpg` | A hand holding a card toward a phone (tap moment) |
| `photo-hoodie.jpg` | The heavyweight hoodie — flat-lay or on a model |
| `photo-tee.jpg` | The oversized tee — flat-lay or on a model |
| `photo-apparel-lifestyle.jpg` | Streetwear worn on location |
| `photo-studio-website.jpg` | A screenshot of a site you built, on a laptop |
| `photo-studio-store.jpg` | An e-commerce store you built |
| `photo-studio-workspace.jpg` | Your actual desk / studio |
| `photo-vehicle-sedan.jpg` | Sedan, 3/4 front, clean background |
| `photo-vehicle-suv.jpg` | SUV, 3/4 front |
| `photo-vehicle-coupe.jpg` | Coupe, 3/4 front |
| `photo-property-apartment.jpg` | Apartment interior, wide |
| `photo-property-villa.jpg` | Villa exterior, wide |
| `photo-property-land.jpg` | Land plot / aerial |
| `photo-hero.jpg` | One strong brand image for the hero (optional) |

## How to add them

1. Put the files in `public/images/` with the exact names above.
2. Open `src/data/imagery.ts` and switch the keys you have photos for from
   `art.x` to `photos.x`.
3. Run `npm run build`.

Any slot left on `art.*` keeps its artwork, so you can add photos gradually.

## Adding photos without touching code

The admin dashboard already supports uploads: **Studio → Products / Vehicles /
Real Estate → edit an item → upload from device**. Those are stored in the
browser (`localStorage`), so they are per-device. The `public/images/` route
above is what makes a photo permanent and visible to every visitor.
