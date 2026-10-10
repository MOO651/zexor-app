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
  whatsappEg: string;
  whatsappKsa: string;
  supportEmail: string;
  telegramUsername: string;
  telegramBotToken: string;
  telegramChatId: string;
  announcementText: Record<Locale, string>;
  announcementActive: boolean;
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
};
