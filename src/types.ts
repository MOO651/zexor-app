export type Locale = 'en' | 'ar';
export type Market = 'eg' | 'ksa';
export type MarketFilter = 'all' | Market;
export type Route =
  | 'home'
  | 'cards'
  | 'fashion'
  | 'services'
  | 'cars'
  | 'property'
  | 'contact'
  | 'pricing'
  | 'calculator'
  | 'reviews'
  | 'tracking'
  | 'dashboard'
  | string;

export type DynamicCategory = {
  id: string;
  name: Record<Locale, string>;
  slug: string;
  icon: string;
  active: boolean;
  /** Optional parent department; set for an in-department subcategory. */
  parentSlug?: string;
  /** Optional editable department banner copy and artwork. */
  bannerTitle?: Record<Locale, string>;
  bannerText?: Record<Locale, string>;
  bannerImage?: string;
};

export type Product = {
  id: string;
  category: string; // can be dynamic category id or cards/fashion/services
  /** Optional nested category slug, e.g. a fashion collection. */
  subcategoryId?: string;
  markets: Market[];
  name: Record<Locale, string>;
  description: Record<Locale, string>;
  price: Record<Market, number>;
  oldPrice?: Record<Market, number>; // for discounts/offers
  icon: string;
  finish: string;
  available: boolean;
  imageUrl?: string;
  variants?: string[];
  /** Optional merchant SKU / internal code shown in the admin table. */
  sku?: string;
  /** Brand or label shown as a badge on the product card. */
  brand?: string;
  /** Free-text promo badge (e.g. "New", "Limited") editable from the admin. */
  badge?: string;
  /** Pins the product to the top of its category / home showcase. */
  featured?: boolean;
  /** Optional tracked stock quantity. Omit to keep unlimited / untracked stock. */
  stock?: number;
};

export type OrderItem = {
  productId: string;
  name: string;
  quantity: number;
  egp: number;
  sar: number;
  variant?: string;
  nfcCustomization?: NfcCustomization;
};

export type CustomerOrder = {
  id: string;
  createdAt: string;
  customer: string;
  phone: string;
  email?: string;
  city: string;
  market: Market;
  items: OrderItem[];
  status: 'new' | 'confirmed' | 'complete' | 'cancelled';
  /** Prevents cancelled orders from returning stock more than once. */
  stockAdjusted?: boolean;
  /** Products whose stock was tracked when the order was placed. */
  stockAdjustedProductIds?: string[];
  total: number;
  subtotal: number;
  shippingFee: number;
  discount: number;
  promoCode?: string;
  paymentMethod: string;
  paymentMethodKey?: string;
  paymentStatus?: 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded';
  /** Orders can be archived without losing their customer or fulfillment history. */
  archived?: boolean;
  archivedAt?: string;
  shippingCarrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  notes?: string;
};

export type CartLine = {
  productId: string;
  quantity: number;
  variant?: string;
  nfcCustomization?: NfcCustomization;
};

export type PromoCode = {
  code: string;
  discount: number; // percentage e.g. 15 for 15%
  expiresAt: string;
  active: boolean;
};

export type PlatformInquiry = {
  id: string;
  createdAt: string;
  type: 'contact' | 'car' | 'property' | 'nfc';
  title: string;
  name: string;
  phone: string;
  city: string;
  market: Market;
  budget: string;
  message: string;
  date?: string;
  time?: string;
  status: 'new' | 'in-progress' | 'complete';
  telegramSent?: boolean;
};

export type NfcCustomization = {
  fullName: string;
  jobTitle: string;
  companyName: string;
  bio: string;
  phone: string;
  email: string;
  website: string;
  socialHandle: string;
  finish: 'pearl' | 'mint' | 'rose' | 'lilac' | 'matte-black';
  profileLinked: boolean;
  profileSlug: string;
};

export type Vehicle = {
  id: string;
  title: Record<Locale, string>;
  location: Record<Locale, string>;
  price: number;
  /** Defaults to Sale for listings created before rental support. */
  deal?: 'Sale' | 'Rent';
  rentalPeriod?: 'Day' | 'Week' | 'Month';
  oldPrice?: number;
  area: number;
  region: 'Cairo' | 'Giza' | 'Alexandria' | 'Riyadh' | 'Jeddah';
  photo: string;
  gallery: string[];
  make: string;
  year: number;
  mileage: number;
  transmission: 'Automatic' | 'Manual';
  condition: 'New' | 'Used';
  body: 'Sedan' | 'SUV' | 'Coupe';
  fuel: 'Petrol' | 'Electric' | 'Hybrid';
};

export type Property = {
  id: string;
  title: Record<Locale, string>;
  location: Record<Locale, string>;
  price: number;
  oldPrice?: number;
  area: number;
  region: 'Cairo' | 'Giza' | 'Alexandria' | 'Riyadh' | 'Jeddah';
  photo: string;
  gallery: string[];
  type: 'Apartment' | 'Villa' | 'Land' | 'Shop';
  deal: 'Sale' | 'Rent';
  rooms: number;
  floor: number;
  bathrooms: number;
  featured?: boolean;
};

export type AgencyProject = {
  id: string;
  title: Record<Locale, string>;
  category: Record<Locale, string>;
  description: Record<Locale, string>;
  image: string;
  demoUrl: string;
  tags: string[];
};

export type SiteSettings = {
  heroTitle: Record<Locale, string>;
  heroAccent: Record<Locale, string>;
  heroText: Record<Locale, string>;
  // Optional background image for the hero (data-url or /images/... path).
  // When empty the hero keeps its built-in gradient mesh.
  heroImage: string;
  whatsappEg: string;
  whatsappKsa: string;
  supportEmail: string;
  telegramUsername: string;
  telegramBotToken: string;
  telegramChatId: string;
  /** Instagram business handle shown in the footer (without the leading @). */
  instagramHandle: string;
  /** Public Instagram profile URL; empty falls back to the handle-based URL. */
  instagramUrl: string;
  /** InstaPay wallet handle used by customers paying from Egypt. */
  instapayHandle: string;
  /** InstaPay account holder name shown next to the handle. */
  instapayName: string;
  /** Vodafone Cash wallet number customers transfer to. */
  vodafoneCashNumber: string;
  /** Vodafone Cash account holder name shown next to the number. */
  vodafoneCashName: string;
  announcementText: Record<Locale, string>;
  announcementActive: boolean;
  /** Percentage discount applied to the whole catalogue while active. */
  discountBanner: {
    active: boolean;
    percent: number;
    text: Record<Locale, string>;
  };
  /** Order subtotal above which shipping is free (per market, in local currency). */
  freeShippingThreshold: Record<Market, number>;
  /** Store-configured delivery estimates indexed by checkout city and market. */
  shippingRates: Record<string, Record<Market, number>>;
  /** Cities/areas offered at checkout in each market. */
  shippingAreas: Record<Market, string[]>;
  /** Editable carrier directory used while preparing shipment details. */
  shippingCarriers: Record<Market, string[]>;
  /** Global tax / VAT percentage added at checkout. */
  taxRate: number;
  /** Optional market-specific rates and COD controls; legacy values remain fallbacks. */
  taxRateByMarket: Record<Market, number>;
  codEnabledByMarket: Record<Market, boolean>;
  /** Enables Cash on Delivery as a payment option. */
  codEnabled: boolean;
  /** Let visitors in each market view products reserved for the other market. */
  showOtherMarketProducts: Record<Market, boolean>;
  /** Coupon code applied site-wide automatically when set. */
  autoPromoCode: string;
  sectionVisibility: {
    cards: boolean;
    fashion: boolean;
    services: boolean;
    cars: boolean;
    property: boolean;
    contact: boolean;
    pricing: boolean;
    calculator: boolean;
    reviews: boolean;
    tracking: boolean;
  };
  /**
   * Brand design tokens applied live to the storefront as CSS variables.
   * The admin "Design" tab writes these; `applyThemeTokens()` paints them onto
   * <html> so the whole site restyles without touching Tailwind classes.
   */
  brand: {
    name: string;
    logoUrl: string;
    primary: string; // buttons, active pills, primary surfaces
    accent: string; // highlights, glows, badge accents
    ink: string; // headline / body ink
    radius: number; // base corner radius in rem
    fontScale: number; // root font scale (0.9 – 1.15)
  };
  /**
   * Editable storefront copy. Every value has an Arabic and English variant so
   * the admin can localise the marketing sections without code changes.
   */
  content: {
    cardsTitle: Record<Locale, string>;
    cardsSubtitle: Record<Locale, string>;
    fashionTitle: Record<Locale, string>;
    fashionSubtitle: Record<Locale, string>;
    servicesTitle: Record<Locale, string>;
    servicesSubtitle: Record<Locale, string>;
    carsTitle: Record<Locale, string>;
    carsSubtitle: Record<Locale, string>;
    propertyTitle: Record<Locale, string>;
    propertySubtitle: Record<Locale, string>;
    ctaTitle: Record<Locale, string>;
    ctaText: Record<Locale, string>;
    footerNote: Record<Locale, string>;
  };
  /**
   * Optional site-wide notice (e.g. "orders resume Monday"). Shown as a banner
   * under the nav when `maintenanceActive` is true.
   */
  maintenanceActive: boolean;
  maintenanceText: Record<Locale, string>;
  /**
   * Social + manual payment channels edited from the admin dashboard.
   * Instagram, InstaPay and Vodafone Cash identifiers live here so the admin
   * can publish them without a code change.
   */
  socials: {
    instagramHandle: string;
    instagramUrl: string;
    instapayNumber: string;
    instapayName: string;
    vodafoneCashNumber: string;
    vodafoneCashName: string;
  };
};
