import type {
  CustomerOrder,
  DynamicCategory,
  PlatformInquiry,
  Product,
  PromoCode,
  Property,
  SiteSettings,
  Vehicle,
} from '../types';
import type { PaymentMethod, SocialLink } from './siteData';
import { DEFAULT_SETTINGS } from '../data/initialData';

export type StoreBackup = Partial<{
  products: Product[];
  categories: DynamicCategory[];
  vehicles: Vehicle[];
  properties: Property[];
  orders: CustomerOrder[];
  inbox: PlatformInquiry[];
  promoCodes: PromoCode[];
  settings: Partial<SiteSettings>;
  socialLinks: SocialLink[];
  paymentMethods: PaymentMethod[];
}>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const isText = (value: unknown): value is string => typeof value === 'string';
const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const isTextPair = (value: unknown) => isRecord(value) && isText(value.en) && isText(value.ar);
const isTextArray = (value: unknown) => Array.isArray(value) && value.every(isText);
const isMarket = (value: unknown) => value === 'eg' || value === 'ksa';

function hasUniqueIds<T>(values: T[], getId: (value: T) => string): boolean {
  const ids = values.map(getId);
  return ids.every(Boolean) && new Set(ids).size === ids.length;
}

function validProduct(value: unknown): value is Product {
  if (!isRecord(value) || !isRecord(value.price) || !isRecord(value.name) || !isRecord(value.description)) return false;
  return isText(value.id) && isText(value.category) && Array.isArray(value.markets)
    && (value.subcategoryId === undefined || isText(value.subcategoryId))
    && value.markets.length > 0 && value.markets.every(isMarket)
    && isText(value.name.en) && isText(value.name.ar)
    && isText(value.description.en) && isText(value.description.ar)
    && isNumber(value.price.eg) && value.price.eg >= 0
    && isNumber(value.price.ksa) && value.price.ksa >= 0
    && (value.oldPrice === undefined || (isRecord(value.oldPrice)
      && isNumber(value.oldPrice.eg) && value.oldPrice.eg >= value.price.eg
      && isNumber(value.oldPrice.ksa) && value.oldPrice.ksa >= value.price.ksa))
    && isText(value.icon) && isText(value.finish) && typeof value.available === 'boolean'
    && (value.stock === undefined || (Number.isInteger(value.stock) && Number(value.stock) >= 0))
    && (value.variants === undefined || isTextArray(value.variants))
    && (value.imageUrl === undefined || isText(value.imageUrl))
    && (value.featured === undefined || typeof value.featured === 'boolean')
    && (value.sku === undefined || isText(value.sku))
    && (value.brand === undefined || isText(value.brand))
    && (value.badge === undefined || isText(value.badge));
}

function validCategory(value: unknown): value is DynamicCategory {
  return isRecord(value) && isText(value.id) && isText(value.slug) && isText(value.icon)
    && isTextPair(value.name) && typeof value.active === 'boolean'
    && (value.parentSlug === undefined || isText(value.parentSlug));
}

function validVehicle(value: unknown): value is Vehicle {
  if (!isRecord(value)) return false;
  const regions = ['Cairo', 'Giza', 'Alexandria', 'Riyadh', 'Jeddah'];
  return isText(value.id) && isTextPair(value.title) && isTextPair(value.location)
    && isNumber(value.price) && value.price >= 0 && isNumber(value.area) && value.area >= 0 && isText(value.photo)
    && (value.deal === undefined || ['Sale', 'Rent'].includes(String(value.deal)))
    && (value.rentalPeriod === undefined || ['Day', 'Week', 'Month'].includes(String(value.rentalPeriod)))
    && isTextArray(value.gallery) && isText(value.make) && Number.isInteger(value.year)
    && (value.oldPrice === undefined || (isNumber(value.oldPrice) && value.oldPrice >= value.price))
    && isNumber(value.mileage) && ['Automatic', 'Manual'].includes(String(value.transmission))
    && ['New', 'Used'].includes(String(value.condition))
    && ['Sedan', 'SUV', 'Coupe'].includes(String(value.body))
    && ['Petrol', 'Electric', 'Hybrid'].includes(String(value.fuel))
    && regions.includes(String(value.region));
}

function validProperty(value: unknown): value is Property {
  const regions = ['Cairo', 'Giza', 'Alexandria', 'Riyadh', 'Jeddah'];
  return isRecord(value) && isText(value.id) && isTextPair(value.title) && isTextPair(value.location)
    && isNumber(value.price) && value.price >= 0 && isNumber(value.area) && value.area >= 0 && regions.includes(String(value.region)) && isText(value.photo)
    && isTextArray(value.gallery) && ['Apartment', 'Villa', 'Land', 'Shop'].includes(String(value.type))
    && ['Sale', 'Rent'].includes(String(value.deal))
    && isNumber(value.rooms) && value.rooms >= 0 && isNumber(value.floor)
    && isNumber(value.bathrooms) && value.bathrooms >= 0
    && (value.oldPrice === undefined || (isNumber(value.oldPrice) && value.oldPrice >= value.price));
}

function validOrder(value: unknown): value is CustomerOrder {
  if (!isRecord(value) || !Array.isArray(value.items)) return false;
  const validItems = value.items.every((item) => isRecord(item) && isText(item.productId)
    && isText(item.name) && Number.isInteger(item.quantity) && Number(item.quantity) > 0
    && isNumber(item.egp) && isNumber(item.sar));
  return validItems && isText(value.id) && isText(value.createdAt) && isText(value.customer)
    && isText(value.phone) && isText(value.city) && isMarket(value.market)
    && (value.email === undefined || (isText(value.email) && value.email.length <= 254))
    && (value.paymentMethodKey === undefined || isText(value.paymentMethodKey))
    && (value.paymentStatus === undefined || ['unpaid', 'pending', 'paid', 'failed', 'refunded'].includes(String(value.paymentStatus)))
    && ['new', 'confirmed', 'complete', 'cancelled'].includes(String(value.status))
    && isNumber(value.total) && isNumber(value.subtotal) && isNumber(value.shippingFee)
    && isNumber(value.discount) && isText(value.paymentMethod)
    && (value.shippingCarrier === undefined || (isText(value.shippingCarrier) && value.shippingCarrier.length <= 100))
    && (value.trackingNumber === undefined || (isText(value.trackingNumber) && value.trackingNumber.length <= 120))
    && (value.trackingUrl === undefined || (isText(value.trackingUrl) && value.trackingUrl.length <= 1000
      && (value.trackingUrl === '' || /^https:\/\//i.test(value.trackingUrl))));
}

function validInquiry(value: unknown): value is PlatformInquiry {
  return isRecord(value) && isText(value.id) && isText(value.createdAt)
    && ['contact', 'car', 'property', 'nfc'].includes(String(value.type))
    && isText(value.title) && isText(value.name) && isText(value.phone)
    && isText(value.city) && isMarket(value.market) && isText(value.budget)
    && isText(value.message) && ['new', 'in-progress', 'complete'].includes(String(value.status));
}

function validPromo(value: unknown): value is PromoCode {
  return isRecord(value) && isText(value.code) && isNumber(value.discount)
    && value.discount > 0 && value.discount <= 100 && isText(value.expiresAt)
    && typeof value.active === 'boolean';
}

function validSocialLink(value: unknown): value is SocialLink {
  return isRecord(value) && isText(value.id) && isText(value.platform) && isText(value.label)
    && isText(value.handle) && isText(value.url) && typeof value.active === 'boolean'
    && isNumber(value.sortOrder);
}

function validPaymentMethod(value: unknown): value is PaymentMethod {
  return isRecord(value) && isText(value.id) && isMarket(value.market) && isText(value.method)
    && isText(value.label) && isText(value.accountName) && isText(value.accountNumber)
    && isTextPair(value.instructions) && typeof value.active === 'boolean'
    && isNumber(value.sortOrder);
}

function conformsToShape(value: unknown, shape: unknown): boolean {
  if (typeof shape === 'string') return isText(value);
  if (typeof shape === 'number') return isNumber(value);
  if (typeof shape === 'boolean') return typeof value === 'boolean';
  if (!isRecord(shape) || !isRecord(value)) return false;
  return Object.entries(value).every(([key, item]) => {
    if (key === 'shippingRates') return isRecord(item) && Object.entries(item).every(([area, rates]) =>
      isText(area) && isRecord(rates) && ['eg', 'ksa'].every((market) => isNumber(rates[market])));
    if (key === 'shippingAreas') return isRecord(item) && ['eg', 'ksa'].every((market) => isTextArray(item[market]));
    if (key === 'shippingCarriers') return isRecord(item) && ['eg', 'ksa'].every((market) => isTextArray(item[market]));
    return Object.hasOwn(shape, key) && conformsToShape(item, shape[key]);
  });
}

function validSettings(value: unknown): value is Partial<SiteSettings> {
  if (!conformsToShape(value, DEFAULT_SETTINGS) || !isRecord(value)) return false;
  const taxRate = value.taxRate;
  const taxByMarket = value.taxRateByMarket;
  const shippingThreshold = value.freeShippingThreshold;
  const shippingRates = value.shippingRates;
  const shippingAreas = value.shippingAreas;
  const discount = value.discountBanner;
  const brand = value.brand;
  return (taxRate === undefined || (isNumber(taxRate) && taxRate >= 0 && taxRate <= 100))
    && (taxByMarket === undefined || (isRecord(taxByMarket)
      && ['eg', 'ksa'].every((market) => isNumber(taxByMarket[market]) && Number(taxByMarket[market]) >= 0 && Number(taxByMarket[market]) <= 100)))
    && (shippingThreshold === undefined || (isRecord(shippingThreshold)
      && ['eg', 'ksa'].every((market) => isNumber(shippingThreshold[market]) && Number(shippingThreshold[market]) >= 0)))
    && (shippingRates === undefined || (isRecord(shippingRates)
      && Object.entries(shippingRates).every(([city, rates]) => isText(city) && city.trim().length > 0 && city.length <= 80
        && isRecord(rates) && ['eg', 'ksa'].every((market) => isNumber(rates[market]) && Number(rates[market]) >= 0 && Number(rates[market]) <= 100000))))
    && (shippingAreas === undefined || (isRecord(shippingAreas)
      && ['eg', 'ksa'].every((market) => Array.isArray(shippingAreas[market])
        && shippingAreas[market].every((city) => isText(city) && city.trim().length > 0 && city.length <= 80))))
    && (discount === undefined || (isRecord(discount) && isNumber(discount.percent) && discount.percent >= 0 && discount.percent <= 100))
    && (brand === undefined || (isRecord(brand) && isNumber(brand.radius) && brand.radius >= 0.5 && brand.radius <= 3
      && isNumber(brand.fontScale) && brand.fontScale >= 0.75 && brand.fontScale <= 1.25));
}

export function validateStoreBackup(value: unknown): StoreBackup | null {
  if (!isRecord(value)) return null;
  const backup: StoreBackup = {};
  const arrayFields = [
    ['products', validProduct],
    ['categories', validCategory],
    ['vehicles', validVehicle],
    ['properties', validProperty],
    ['orders', validOrder],
    ['inbox', validInquiry],
    ['promoCodes', validPromo],
    ['socialLinks', validSocialLink],
    ['paymentMethods', validPaymentMethod],
  ] as const;

  for (const [key, isValidItem] of arrayFields) {
    const candidate = value[key];
    if (candidate === undefined) continue;
    if (!Array.isArray(candidate) || !candidate.every(isValidItem)) return null;
    if (key === 'products' || key === 'categories' || key === 'vehicles' || key === 'properties' || key === 'orders' || key === 'inbox' || key === 'promoCodes') {
      if (!hasUniqueIds(candidate, (item) => String((item as { id?: unknown }).id ?? ''))) return null;
    }
    if (key === 'promoCodes' && !hasUniqueIds(candidate, (item) => String((item as PromoCode).code).toUpperCase())) return null;
    if (key === 'socialLinks' && !hasUniqueIds(candidate, (item) => String((item as SocialLink).platform).toLowerCase())) return null;
    if (key === 'paymentMethods' && !hasUniqueIds(candidate, (item) => `${(item as PaymentMethod).market}:${(item as PaymentMethod).method}`)) return null;
    Object.assign(backup, { [key]: candidate });
  }
  if (backup.categories && backup.products) {
    const categoriesBySlug = new Map(backup.categories.map((category) => [category.slug, category]));
    const hasInvalidSubcategory = backup.products.some((product) => {
      if (!product.subcategoryId) return false;
      const category = categoriesBySlug.get(product.subcategoryId);
      return !category || category.parentSlug !== product.category;
    });
    if (hasInvalidSubcategory) return null;
  }
  if (value.settings !== undefined) {
    if (!validSettings(value.settings)) return null;
    backup.settings = value.settings as Partial<SiteSettings>;
  }
  return backup;
}
