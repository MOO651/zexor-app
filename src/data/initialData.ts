import type {
  AgencyProject,
  DynamicCategory,
  Product,
  Property,
  SiteSettings,
  Vehicle,
} from '../types';

import { art, photos } from './imagery';

export const INITIAL_CATEGORIES: DynamicCategory[] = [
  { id: 'cards', slug: 'cards', name: { en: 'ZEXOR LINK', ar: 'زكسور لينك' }, icon: 'credit', active: true },
  { id: 'fashion', slug: 'fashion', name: { en: 'ZEXOR FASHION', ar: 'أزياء زكسور' }, icon: 'shirt', active: true },
  { id: 'fashion-hoodies', slug: 'hoodies', name: { en: 'Hoodies', ar: 'هوديز' }, icon: 'shirt', active: true, parentSlug: 'fashion' },
  { id: 'fashion-t-shirts', slug: 't-shirts', name: { en: 'T-shirts', ar: 'تيشيرتات' }, icon: 'shirt', active: true, parentSlug: 'fashion' },
  { id: 'services', slug: 'services', name: { en: 'ZEXOR DIGITAL', ar: 'زكسور ديجيتال' }, icon: 'code', active: true },
  { id: 'cars', slug: 'cars', name: { en: 'ZEXOR MOTORS', ar: 'زكسور موتورز' }, icon: 'car', active: true },
  { id: 'property', slug: 'property', name: { en: 'ZEXOR ESTATES', ar: 'زكسور إستيتس' }, icon: 'home', active: true },
];

const LEGACY_CATEGORY_NAMES: Record<string, string[]> = {
  cards: ['NFC Cards', 'Smart NFC Cards', 'بطاقات NFC', 'بطاقات NFC الذكية'],
  fashion: ['Streetwear', 'ZEXOR ATELIER', 'الملابس والأزياء', 'الأزياء والستريت وير', 'أتيليه زكسور'],
  services: ['ZEXOR Digital', 'الخدمات الرقمية'],
  cars: ['Vehicles', 'Vehicle Showroom', 'السيارات', 'معرض السيارات'],
  property: ['Real Estate', 'العقارات', 'العقارات الفاخرة'],
};

/** Add new built-in departments and update only untouched legacy labels. */
export function normalizeCategories(categories: DynamicCategory[]): DynamicCategory[] {
  const normalized = INITIAL_CATEGORIES.map((builtIn) => {
    const current = categories.find((category) => category.slug === builtIn.slug);
    if (!current) return builtIn;
    const oldNames = LEGACY_CATEGORY_NAMES[builtIn.slug] ?? [];
    const shouldRename = oldNames.includes(current.name.ar) || oldNames.includes(current.name.en);
    return shouldRename ? { ...current, name: builtIn.name } : current;
  });
  return [
    ...normalized,
    ...categories.filter((category) => !INITIAL_CATEGORIES.some((builtIn) => builtIn.slug === category.slug)),
  ];
}

/** Update untouched demo product photography without overwriting admin uploads. */
export function normalizeStarterProductImages(products: Product[]): Product[] {
  const previousDefaults: Record<string, string> = {
    elite: photos.cardsElite,
    social: photos.cardsSocial,
    custom: photos.cardsBespoke,
    hoodie: photos.hoodie,
    'oversized-tee': photos.tee,
    'launch-site': photos.studioWebsite,
    commerce: photos.studioStore,
  };
  const correctedDefaults = new Map(INITIAL_PRODUCTS.map((product) => [product.id, product.imageUrl]));
  const defaultFashionSubcategories: Record<string, string> = { hoodie: 'hoodies', 'oversized-tee': 't-shirts' };
  return products.map((product) => {
    const isUntouchedStarter = product.imageUrl === previousDefaults[product.id];
    if (!isUntouchedStarter) return product;
    return {
      ...product,
      imageUrl: correctedDefaults.get(product.id) ?? product.imageUrl,
      ...(product.category === 'fashion' && product.subcategoryId === undefined && defaultFashionSubcategories[product.id]
        ? { subcategoryId: defaultFashionSubcategories[product.id] }
        : {}),
    };
  });
}

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'elite',
    category: 'cards',
    markets: ['eg', 'ksa'],
    name: { en: 'ZEXOR NFC — Elite Matte', ar: 'ZEXOR NFC — إيليت المطفي' },
    description: {
      en: 'A sculpted premium NFC card for instantly sharing your digital profile and contact details in one tap.',
      ar: 'بطاقة أعمال NFC فاخرة ومصقولة لمشاركة ملفك الرقمي وبيانات التواصل فوراً بلمسة واحدة.',
    },
    price: { eg: 450, ksa: 35 },
    icon: 'credit',
    finish: 'pearl',
    available: true,
    imageUrl: art.cardsElite,
  },
  {
    id: 'social',
    category: 'cards',
    markets: ['eg', 'ksa'],
    name: { en: 'ZEXOR NFC — Social Card', ar: 'ZEXOR NFC — بطاقة سوشيال' },
    description: {
      en: 'Bring your social profiles together in one tap-to-share NFC card with custom link routing.',
      ar: 'اجمع حساباتك الاجتماعية في بطاقة NFC واحدة للمشاركة بلمسة مع ربط تلقائي لصفحتك.',
    },
    price: { eg: 350, ksa: 25 },
    icon: 'fingerprint',
    finish: 'mint',
    available: true,
    imageUrl: art.cardsSocial,
  },
  {
    id: 'custom',
    category: 'cards',
    markets: ['eg', 'ksa'],
    name: { en: 'ZEXOR NFC — Bespoke Signature', ar: 'ZEXOR NFC — توقيعك المخصص' },
    description: {
      en: 'A fully custom-branded ZEXOR NFC card tailored to your professional identity with digital portfolio link.',
      ar: 'بطاقة ZEXOR NFC بتصميم وهوية مخصصة بالكامل تعكس علامتك مع صفحة ويب تعريفية مخصصة.',
    },
    price: { eg: 600, ksa: 45 },
    icon: 'sparkles',
    finish: 'rose',
    available: true,
    imageUrl: art.cardsBespoke,
  },
  {
    id: 'hoodie',
    category: 'fashion',
    subcategoryId: 'hoodies',
    markets: ['eg'],
    name: { en: 'After Hours Heavyweight Hoodie', ar: 'هودي أفتر آورز الفاخر' },
    description: {
      en: 'A relaxed heavyweight hoodie with a soft brushed interior, released in a limited ZEXOR collection.',
      ar: 'هودي بقصّة مريحة وخامة داخلية ناعمة، ضمن إصدار محدود من مجموعة زكسور.',
    },
    price: { eg: 999, ksa: 0 },
    icon: 'shirt',
    finish: 'rose',
    available: true,
    imageUrl: art.hoodie,
    variants: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'oversized-tee',
    category: 'fashion',
    subcategoryId: 't-shirts',
    markets: ['eg'],
    name: { en: 'Signal Drop-Shoulder Tee', ar: 'تيشيرت سيجنال أوفرسايز' },
    description: {
      en: 'An everyday oversized relaxed silhouette with reinforced collar and high-density screen print.',
      ar: 'قصّة أوفرسايز مريحة للاستخدام اليومي مع ياقة معززة وطباعة عالية الكثافة.',
    },
    price: { eg: 499, ksa: 0 },
    icon: 'shirt',
    finish: 'lilac',
    available: true,
    imageUrl: art.tee,
    variants: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'launch-site',
    category: 'services',
    markets: ['eg', 'ksa'],
    name: { en: 'Bespoke Brand Website', ar: 'موقع بهوية علامتك وتصميم متكامل' },
    description: {
      en: 'High-speed, responsive, SEO-ready digital platform tailored to elevate your business across Egypt and Saudi Arabia.',
      ar: 'موقع متجاوب وسريع ومُهيأ لمحركات البحث، مصمم بالكامل ليعكس فخامة علامتك التجارية.',
    },
    price: { eg: 8000, ksa: 1200 },
    icon: 'code',
    finish: 'sky',
    available: true,
    imageUrl: art.studioWebsite,
  },
  {
    id: 'commerce',
    category: 'services',
    markets: ['eg', 'ksa'],
    name: { en: 'Next-Gen E-Commerce Experience', ar: 'متجر إلكتروني متكامل عالي الأداء' },
    description: {
      en: 'A tailored online store with a product catalog, cart, inventory controls, and checkout options selected for your business.',
      ar: 'متجر إلكتروني مصمم لنشاطك مع كتالوج منتجات وسلة شراء وإدارة مخزون ووسائل دفع مناسبة.',
    },
    price: { eg: 18000, ksa: 2500 },
    icon: 'layers',
    finish: 'lilac',
    available: true,
    imageUrl: art.studioStore,
  },
];

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'ZX-CAR-101',
    title: { en: 'Mercedes-Benz C200 AMG 2024', ar: 'مرسيدس C200 AMG موديل 2024' },
    location: { en: 'New Cairo · 5th Settlement', ar: 'القاهرة الجديدة · التجمع الخامس' },
    price: 3650000,
    oldPrice: 3800000,
    area: 0,
    region: 'Cairo',
    photo: photos.vehicleSedan,
    gallery: [photos.vehicleSedan, photos.vehicleCoupe, photos.vehicleSuv],
    make: 'Mercedes-Benz',
    year: 2024,
    mileage: 8500,
    transmission: 'Automatic',
    condition: 'Used',
    body: 'Sedan',
    fuel: 'Petrol',
  },
  {
    id: 'ZX-CAR-204',
    title: { en: 'Range Rover Sport Dynamic 2025', ar: 'رنج روفر سبورت ديناميك 2025' },
    location: { en: 'Sheikh Zayed · Giza', ar: 'الشيخ زايد · الجيزة' },
    price: 7450000,
    oldPrice: 7800000,
    area: 0,
    region: 'Giza',
    photo: photos.vehicleSuv,
    gallery: [photos.vehicleSuv, photos.vehicleSedan, photos.vehicleCoupe],
    make: 'Land Rover',
    year: 2025,
    mileage: 0,
    transmission: 'Automatic',
    condition: 'New',
    body: 'SUV',
    fuel: 'Hybrid',
  },
  {
    id: 'ZX-CAR-318',
    title: { en: 'Porsche 911 Carrera S Coupe 2023', ar: 'بورشه 911 كاريرا S كوبيه 2023' },
    location: { en: 'Riyadh · Al Nakheel', ar: 'الرياض · حي النخيل' },
    price: 640,
    oldPrice: 680,
    deal: 'Rent',
    rentalPeriod: 'Day',
    area: 0,
    region: 'Riyadh',
    photo: photos.vehicleCoupe,
    gallery: [photos.vehicleCoupe, photos.vehicleSedan, photos.vehicleSuv],
    make: 'Porsche',
    year: 2023,
    mileage: 14200,
    transmission: 'Automatic',
    condition: 'Used',
    body: 'Coupe',
    fuel: 'Petrol',
  },
];

/** Keep the built-in Porsche demo rental-enabled for returning local/cloud catalogs too. */
export function normalizeStarterVehicles(vehicles: Vehicle[]): Vehicle[] {
  return vehicles.map((vehicle) => vehicle.id === 'ZX-CAR-318'
    && vehicle.price === 640000
    && vehicle.title.en === 'Porsche 911 Carrera S Coupe 2023'
    ? { ...vehicle, price: 640, oldPrice: 680, deal: 'Rent', rentalPeriod: 'Day' }
    : vehicle);
}

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'ZX-PROP-017',
    title: { en: 'Luxury Palm Residence Apartment', ar: 'شقة فاخرة بكمبوند بالم ريزيدنس' },
    location: { en: 'New Cairo · Golden Square', ar: 'القاهرة الجديدة · المربع الذهبي' },
    price: 4950000,
    oldPrice: 5300000,
    area: 185,
    region: 'Cairo',
    photo: photos.propertyApartment,
    gallery: [photos.propertyApartment, photos.propertyVilla, photos.propertyLand],
    type: 'Apartment',
    deal: 'Sale',
    rooms: 3,
    floor: 3,
    bathrooms: 3,
    featured: true,
  },
  {
    id: 'ZX-PROP-024',
    title: { en: 'Standalone Courtyard Villa with Pool', ar: 'فيلا مستقلة بحمام سباحة وحديقة خاصة' },
    location: { en: 'Sheikh Zayed · Beverly Hills', ar: 'الشيخ زايد · بيفرلي هيلز' },
    price: 65000,
    oldPrice: 75000,
    area: 420,
    region: 'Giza',
    photo: photos.propertyVilla,
    gallery: [photos.propertyVilla, photos.propertyApartment, photos.propertyLand],
    type: 'Villa',
    deal: 'Rent',
    rooms: 5,
    floor: 2,
    bathrooms: 5,
    featured: true,
  },
  {
    id: 'ZX-PROP-039',
    title: { en: 'Prime Commercial Plot / North District', ar: 'قطعة أرض تجارية مميزة بالحي الشمالي' },
    location: { en: 'Riyadh · North District', ar: 'الرياض · شمال الرياض' },
    price: 2450000,
    oldPrice: 2600000,
    area: 650,
    region: 'Riyadh',
    photo: photos.propertyLand,
    gallery: [photos.propertyLand, photos.propertyVilla, photos.propertyApartment],
    type: 'Land',
    deal: 'Sale',
    rooms: 0,
    floor: 0,
    bathrooms: 0,
  },
];

export const AGENCY_PROJECTS: AgencyProject[] = [
  {
    id: 'proj-1',
    title: { en: 'Aura Luxury Apparel Store', ar: 'متجر أورا للأزياء الفاخرة' },
    category: { en: 'E-commerce & Brand Platform', ar: 'متجر إلكتروني وتجربة متكاملة' },
    description: {
      en: 'Modern high-converting fashion store with cart drawer, currency switcher, and inventory management.',
      ar: 'متجر أزياء متكامل بتصميم عصري مع سلة جانبية تفاعلية وتحويل عملات سلس.',
    },
    image: art.tee,
    demoUrl: 'https://aura-luxury-demo.vercel.app',
    tags: ['React', 'Tailwind', 'Stripe', 'Framer Motion'],
  },
  {
    id: 'proj-2',
    title: { en: 'Apex Horizon Real Estate CRM', ar: 'منصة آيبكس العقارية وإدارة العملاء' },
    category: { en: 'Web Application & Marketplace', ar: 'تطبيق ويب ومنصة عقارية' },
    description: {
      en: 'Interactive listings filter, virtual tours, automated WhatsApp booking, and lead tracking.',
      ar: 'نظام فلترة عقارية متقدم، جولات افتراضية، وحجز مواعيد معاينة عبر واتساب.',
    },
    image: art.studioStore,
    demoUrl: 'https://apex-realestate-demo.vercel.app',
    tags: ['Next.js', 'Supabase', 'Leaflet', 'TypeScript'],
  },
  {
    id: 'proj-3',
    title: { en: 'Nexus NFC Digital Identity', ar: 'بوابة نيكسس للهوية الرقمية وكروت NFC' },
    category: { en: 'SaaS & Digital Business Cards', ar: 'نظام بروفايل وكروت رقمية ذكية' },
    description: {
      en: 'Instant contact sharing platform with analytics, vCard generation, and custom digital links.',
      ar: 'منصة مشاركة جهات الاتصال بلمسة NFC مع إحصائيات فورية وتوليد بطاقة vCard.',
    },
    image: art.cardsElite,
    demoUrl: 'https://nexus-nfc-demo.vercel.app',
    tags: ['React 19', 'Vite', 'Tailwind v4', 'Web NFC API'],
  },
];

export const STATS = [
  { id: 'markets', value: 'EG · KSA', label: { en: 'Markets served', ar: 'مصر والسعودية' } },
  { id: 'languages', value: 'AR · EN', label: { en: 'Bilingual experience', ar: 'تجربة بالعربية والإنجليزية' } },
  { id: 'identity', value: 'NFC', label: { en: 'Tap-to-share identity', ar: 'هوية رقمية بلمسة' } },
  { id: 'studio', value: 'CUSTOM', label: { en: 'Digital work, made to fit', ar: 'حلول رقمية حسب احتياجك' } },
];

export const SHIPPING_RATES: Record<string, { eg: number; ksa: number }> = {
  Cairo: { eg: 40, ksa: 0 },
  Giza: { eg: 45, ksa: 0 },
  Alexandria: { eg: 55, ksa: 0 },
  'Delta Cities': { eg: 65, ksa: 0 },
  'Upper Egypt': { eg: 80, ksa: 0 },
  Riyadh: { eg: 0, ksa: 25 },
  Jeddah: { eg: 0, ksa: 30 },
  Dammam: { eg: 0, ksa: 30 },
  'Other KSA': { eg: 0, ksa: 35 },
};

export const DEFAULT_SETTINGS: SiteSettings = {
  heroTitle: { en: 'Where identity becomes', ar: 'حيث تصبح الهوية' },
  heroAccent: { en: 'an experience.', ar: 'تجربة تُعاش.' },
  heroText: {
    en: 'One house for smart NFC identity, considered streetwear, a full digital studio, and curated vehicles and real estate across Egypt and Saudi Arabia.',
    ar: 'بيت واحد لهوية NFC الذكية، وأزياء مدروسة، واستوديو رقمي متكامل، وسيارات وعقارات مختارة بعناية في مصر والسعودية.',
  },
  heroImage: '',
  whatsappEg: '201005556553',
  whatsappKsa: '966560410310',
  supportEmail: 'contact@zexor.studio',
  telegramUsername: 'ZexorStudio',
  telegramBotToken: '',
  telegramChatId: '',
  // Social & wallet payment identifiers — editable from the admin dashboard.
  instagramHandle: '',
  instagramUrl: '',
  instapayHandle: '',
  instapayName: '',
  vodafoneCashNumber: '',
  vodafoneCashName: '',
  announcementText: {
    en: '✦ LAUNCH DROP — 15% OFF NFC Cards & Apparel with code ZEXOR15 · Free delivery above the order threshold',
    ar: '✦ إصدار الإطلاق — خصم ١٥٪ على كروت NFC والأزياء بكود ZEXOR15 · توصيل مجاني للطلبات المؤهلة',
  },
  announcementActive: true,
  discountBanner: {
    active: false,
    percent: 0,
    text: {
      en: 'Seasonal offer — limited time only',
      ar: 'عرض الموسم — لفترة محدودة فقط',
    },
  },
  freeShippingThreshold: { eg: 2000, ksa: 300 },
  shippingRates: SHIPPING_RATES,
  shippingAreas: {
    eg: Object.keys(SHIPPING_RATES).filter((area) => SHIPPING_RATES[area].eg > 0),
    ksa: Object.keys(SHIPPING_RATES).filter((area) => SHIPPING_RATES[area].ksa > 0),
  },
  shippingCarriers: {
    eg: ['Bosta', 'Mylerz', 'Aramex', 'DHL'],
    ksa: ['Aramex', 'SMSA Express', 'SPL', 'DHL'],
  },
  taxRate: 0,
  codEnabled: true,
  taxRateByMarket: { eg: 0, ksa: 0 },
  codEnabledByMarket: { eg: true, ksa: true },
  autoPromoCode: '',
  sectionVisibility: {
    cards: true,
    fashion: true,
    services: true,
    cars: true,
    property: true,
    contact: true,
    pricing: true,
    calculator: true,
    reviews: true,
    tracking: true,
  },
  brand: {
    primary: '#1f6b52',
    accent: '#77cdb5',
    ink: '#14241d',
    radius: 1.5,
    fontScale: 1,
  },
  content: {
    cardsTitle: { en: 'Your Identity, One Tap Away', ar: 'هويتك الرقمية بلمسة واحدة' },
    cardsSubtitle: {
      en: 'Share your contact details, portfolio and socials with a single tap.',
      ar: 'شارك ملفك الشخصي أو التجاري بلمسة واحدة دون الحاجة لتطبيق أو أوراق.',
    },
    fashionTitle: { en: 'The Signature Collection', ar: 'تشكيلة زكسور المميزة' },
    fashionSubtitle: {
      en: 'Independent drops with high-density cotton and confident silhouettes.',
      ar: 'أقمشة قطنية ثقيلة وقصّات واسعة مريحة بإصدارات محدودة وحصرية.',
    },
    servicesTitle: { en: 'Digital Experiences, Built to Perform', ar: 'تجارب رقمية صُممت لتصنع الفرق' },
    servicesSubtitle: {
      en: 'Websites, storefronts and product design shipped end to end.',
      ar: 'مواقع ومتاجر وتصميم منتجات من الفكرة حتى الإطلاق.',
    },
    carsTitle: { en: 'The ZEXOR Motors Collection', ar: 'مختارات زكسور موتورز' },
    carsSubtitle: {
      en: 'Inspected, priced and ready to view in Egypt and Saudi Arabia.',
      ar: 'سيارات مفحوصة بأسعار واضحة وجاهزة للمعاينة في مصر والسعودية.',
    },
    propertyTitle: { en: 'Exceptional Spaces, Found Here', ar: 'مساحات استثنائية في مكان واحد' },
    propertySubtitle: {
      en: 'Apartments, villas and land with listing details and viewing arrangements.',
      ar: 'شقق وفيلات وأراضٍ بتفاصيل العرض وإمكانية ترتيب المعاينة.',
    },
    ctaTitle: { en: 'Ready to Elevate Your Brand?', ar: 'جاهز لتحويل فكرتك إلى واقع؟' },
    ctaText: {
      en: 'Connect directly with our team over WhatsApp for NFC orders, software development, or bookings.',
      ar: 'تواصل مباشرة مع استوديو ZEXOR عبر واتساب لمناقشة كروت NFC، تطوير متجرك، أو حجز معاينة.',
    },
    footerNote: {
      en: 'Smart identity, apparel, software and property — one house, two markets.',
      ar: 'هوية ذكية، أزياء، برمجيات وعقارات — بيت واحد وسوقان.',
    },
  },
  maintenanceActive: false,
  maintenanceText: {
    en: 'Scheduled maintenance — orders may take a little longer than usual.',
    ar: 'صيانة مجدولة — قد تستغرق الطلبات وقتاً أطول قليلاً من المعتاد.',
  },
  socials: {
    instagramHandle: 'zexor.digtal.studio',
    instagramUrl: 'https://www.instagram.com/zexor.digtal.studio',
    instapayNumber: '',
    instapayName: '',
    vodafoneCashNumber: '',
    vodafoneCashName: '',
  },
};

/** Upgrade the old starter section headings while preserving admin-written copy. */
export function normalizeLegacySectionTitles(settings: SiteSettings): SiteSettings {
  const legacy: Partial<Record<keyof SiteSettings['content'], string[]>> = {
    cardsTitle: ['Interactive Smart NFC Cards', 'بطاقات NFC الذكية والمخصصة'],
    fashionTitle: ['Exclusive Streetwear Releases', 'إصدارات الأزياء الحصرية'],
    servicesTitle: ['Live Platform Demos & Agency Works', 'معاينة حية للمشاريع والمنصات'],
    carsTitle: ['Featured Luxury Vehicles', 'سيارات معتمدة مع حجز معاينة'],
    propertyTitle: ['Curated Residential & Commercial Spaces', 'عقارات فاخرة للبيع والإيجار'],
  };
  const content = { ...settings.content };
  for (const [key, names] of Object.entries(legacy)) {
    const typedKey = key as keyof SiteSettings['content'];
    const current = content[typedKey] as Record<'ar' | 'en', string>;
    if (names?.includes(current.ar) || names?.includes(current.en)) {
      content[typedKey] = DEFAULT_SETTINGS.content[typedKey] as never;
    }
  }
  const oldAnnouncements = [
    '✦ LAUNCH DROP — 15% OFF NFC Cards & Apparel with code ZEXOR15 · Free nationwide delivery',
    '✦ إصدار الإطلاق — خصم ١٥٪ على كروت NFC والأزياء بكود ZEXOR15 · توصيل مجاني لكل المحافظات',
  ];
  const announcementText = oldAnnouncements.includes(settings.announcementText.ar)
    || oldAnnouncements.includes(settings.announcementText.en)
    ? DEFAULT_SETTINGS.announcementText
    : settings.announcementText;
  return { ...settings, content, announcementText };
}
