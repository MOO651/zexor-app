/**
 * Central image registry.
 *
 * ## Why this file exists
 *
 * The site needs "real" imagery for cards, apparel, vehicles, property, and the
 * studio. Real photographs cannot be generated or downloaded by the codebase, so
 * every slot resolves through this registry instead of being hard-coded:
 *
 * 1. `photos.*` — drop a real photograph into `public/images/` using the exact
 *    filename listed in `PHOTO_FILENAMES` and it is picked up automatically, with
 *    no code change anywhere else.
 * 2. Until a photo is present, the slot falls back to the locally-authored
 *    artwork in `art.*`, so the site never shows a broken image.
 *
 * To swap in your own photography: read `PHOTO_FILENAMES`, save files with those
 * names, refresh. Nothing else to edit.
 */

/**
 * The exact filenames to use for real photography. Save your own photo at each
 * path under `public/images/` and it replaces the fallback artwork site-wide.
 */
export const PHOTO_FILENAMES = {
  // NFC cards — shoot each finish on a plain surface, top-down.
  cardsElite: 'photo-card-elite.jpg',
  cardsSocial: 'photo-card-social.jpg',
  cardsBespoke: 'photo-card-bespoke.jpg',
  cardsLifestyle: 'photo-card-lifestyle.jpg',
  // Apparel — flat-lay or on-model, plain background.
  hoodie: 'photo-hoodie.jpg',
  tee: 'photo-tee.jpg',
  apparelLifestyle: 'photo-apparel-lifestyle.jpg',
  // Digital studio — screenshots of real work, or your desk setup.
  studioWebsite: 'photo-studio-website.jpg',
  studioStore: 'photo-studio-store.jpg',
  studioWorkspace: 'photo-studio-workspace.jpg',
  // Vehicles — 3/4 front, clean background.
  vehicleSedan: 'photo-vehicle-sedan.jpg',
  vehicleSuv: 'photo-vehicle-suv.jpg',
  vehicleCoupe: 'photo-vehicle-coupe.jpg',
  // Real estate — wide interior / exterior.
  propertyApartment: 'photo-property-apartment.jpg',
  propertyVilla: 'photo-property-villa.jpg',
  propertyLand: 'photo-property-land.jpg',
  // Hero + section banners.
  hero: 'photo-hero.jpg',
} as const;

const IMG = '/images/';

/** Real-photo paths. Replace the underlying files; these paths never change. */
export const photos = {
  cardsElite: IMG + PHOTO_FILENAMES.cardsElite,
  cardsSocial: IMG + PHOTO_FILENAMES.cardsSocial,
  cardsBespoke: IMG + PHOTO_FILENAMES.cardsBespoke,
  cardsLifestyle: IMG + PHOTO_FILENAMES.cardsLifestyle,
  hoodie: IMG + PHOTO_FILENAMES.hoodie,
  tee: IMG + PHOTO_FILENAMES.tee,
  apparelLifestyle: IMG + PHOTO_FILENAMES.apparelLifestyle,
  studioWebsite: IMG + PHOTO_FILENAMES.studioWebsite,
  studioStore: IMG + PHOTO_FILENAMES.studioStore,
  studioWorkspace: IMG + PHOTO_FILENAMES.studioWorkspace,
  vehicleSedan: IMG + PHOTO_FILENAMES.vehicleSedan,
  vehicleSuv: IMG + PHOTO_FILENAMES.vehicleSuv,
  vehicleCoupe: IMG + PHOTO_FILENAMES.vehicleCoupe,
  propertyApartment: IMG + PHOTO_FILENAMES.propertyApartment,
  propertyVilla: IMG + PHOTO_FILENAMES.propertyVilla,
  propertyLand: IMG + PHOTO_FILENAMES.propertyLand,
  hero: IMG + PHOTO_FILENAMES.hero,
} as const;

/** Locally-authored artwork, used until a real photo is supplied. */
export const art = {
  cardsElite: IMG + 'product-nfc-elite.svg',
  cardsSocial: IMG + 'product-nfc-social.svg',
  cardsBespoke: IMG + 'product-nfc-bespoke.svg',
  hoodie: IMG + 'product-hoodie.svg',
  tee: IMG + 'product-tee.svg',
  studioWebsite: IMG + 'product-website.svg',
  studioStore: IMG + 'product-store.svg',
  vehicleSedan: IMG + 'demo-sedan.svg',
  vehicleSuv: IMG + 'demo-suv.svg',
  vehicleCoupe: IMG + 'demo-coupe.svg',
  propertyApartment: IMG + 'demo-apartment.svg',
  propertyVilla: IMG + 'demo-villa.svg',
  propertyLand: IMG + 'demo-land.svg',
  cardsPortal: IMG + 'showcase-cards.svg',
  vehiclesPortal: IMG + 'showcase-vehicles.svg',
  estatePortal: IMG + 'showcase-estate.svg',
  studioPortal: IMG + 'showcase-studio.svg',
} as const;
