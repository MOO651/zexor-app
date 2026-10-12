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
};

export type Product = {
  id: string;
  category: string; // can be dynamic category id or cards/fashion/services
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
  city: string;
  market: Market;
  items: OrderItem[];
  status: 'new' | 'confirmed' | 'complete';
  total: number;
  subtotal: number;
  shippingFee: number;
  discount: number;
  promoCode?: string;
  paymentMethod: 'whatsapp' | 'card' | 'apple_pay' | 'mada' | 'cod';
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

export type Testimonial = {
  id: string;
  name: Record<Locale, string>;
  role: Record<Locale, string>;
  company: Record<Locale, string>;
  content: Record<Locale, string>;
  rating: number;
  avatar: string;
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
  /** Global tax / VAT percentage added at checkout. */
  taxRate: number;
  /** Enables Cash on Delivery as a payment option. */
  codEnabled: boolean;
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
};
