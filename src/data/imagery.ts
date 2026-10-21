/**
 * Central image registry.
 *
 * ## Why this file exists
 *
 * The site needs "real" imagery for cards, apparel, vehicles, property, and the
 * studio. Real photographs cannot be generated or downloaded by the codebase, so
 * every slot resolves through this registry instead of being hard-coded:
 *
 * `photos.*` maps to the bundled photographs in public/images, while `art.*`
 * maps to locally authored illustration fallbacks. The media center can
 * override configured site-wide slots when its Supabase migration is applied.
 */

/**
 * Bundled photography filenames. Several are illustrative stock images and
 * must not be presented as photos of specific inventory or owner projects.
 */
export const PHOTO_FILENAMES = {
  // NFC cards — shoot each finish on a plain surface, top-down.
  cardsElite: 'nfc-card.jpg',
  cardsSocial: 'social-profile.jpg',
  cardsBespoke: 'custom-identity.jpg',
  // Apparel — flat-lay or on-model, plain background.
  hoodie: 'streetwear-hoodie.jpg',
  tee: 'streetwear-collection.jpg',
  apparelLifestyle: 'streetwear-hoodie.jpg',
  // Digital studio — screenshots of real work, or your desk setup.
  studioWebsite: 'digital-studio.jpg',
  studioStore: 'digital-commerce.jpg',
  // Vehicles — 3/4 front, clean background.
  vehicleSedan: 'vehicle-sedan.jpg',
  vehicleSuv: 'vehicle-suv.jpg',
  vehicleCoupe: 'vehicle-coupe.jpg',
  // Real estate — wide interior / exterior.
  propertyApartment: 'property-apartment.jpg',
  propertyVilla: 'property-villa.jpg',
  propertyLand: 'property-land.jpg',
  // Hero + section banners.
  hero: 'digital-studio.jpg',
} as const;

const IMG = `${import.meta.env.BASE_URL}images/`;

/** Paths to bundled photography. */
export const photos = {
  cardsElite: IMG + PHOTO_FILENAMES.cardsElite,
  cardsSocial: IMG + PHOTO_FILENAMES.cardsSocial,
  cardsBespoke: IMG + PHOTO_FILENAMES.cardsBespoke,
  hoodie: IMG + PHOTO_FILENAMES.hoodie,
  tee: IMG + PHOTO_FILENAMES.tee,
  apparelLifestyle: IMG + PHOTO_FILENAMES.apparelLifestyle,
  studioWebsite: IMG + PHOTO_FILENAMES.studioWebsite,
  studioStore: IMG + PHOTO_FILENAMES.studioStore,
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
