import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';
import {
  ArrowDown,
  ArrowUpRight,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Code2,
  CreditCard,
  Fingerprint,
  Globe2,
  Layers3,
  LockKeyhole,
  LogOut,
  Menu,
  MessageCircle,
  Minus,
  PackageCheck,
  Pencil,
  Plus,
  Radio,
  ScanLine,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  Sparkles,
  Trash2,
  TrendingUp,
  Music2,
  Wifi,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';

type Locale = 'en' | 'ar';
type Market = 'eg' | 'ksa';
type MarketFilter = 'all' | Market;
type Route = 'home' | 'cards' | 'fashion' | 'services' | 'dashboard';
type ProductCategory = Exclude<Route, 'home' | 'dashboard'>;
type Product = {
  id: string;
  category: ProductCategory;
  markets: Market[];
  name: Record<Locale, string>;
  description: Record<Locale, string>;
  price: Record<Market, number>;
  icon: string;
  finish: string;
  available: boolean;
  imageUrl?: string;
};
type OrderItem = { productId: string; name: string; quantity: number; egp: number; sar: number };
type CustomerOrder = {
  id: string;
  createdAt: string;
  customer: string;
  phone: string;
  city: string;
  market: Market;
  items: OrderItem[];
  status: 'new' | 'confirmed' | 'complete';
  total: number;
};
type CartLine = { productId: string; quantity: number };

const STORAGE = {
  locale: 'zexor-locale',
  products: 'zexor-products-v2',
  cart: 'zexor-cart-v2',
  orders: 'zexor-orders-v2',
};
const ADMIN_PASSWORD = 'mmo11290';
const WHATSAPP_NUMBERS: Record<Market, string> = {
  eg: '201005556553',
  ksa: '966560410310',
};

function whatsAppUrl(market: Market, message?: string) {
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${WHATSAPP_NUMBERS[market]}${text}`;
}

const ICONS: Record<string, LucideIcon> = {
  wifi: Wifi,
  credit: CreditCard,
  fingerprint: Fingerprint,
  shirt: Shirt,
  code: Code2,
  layers: Layers3,
  sparkles: Sparkles,
  scan: ScanLine,
};

const PRODUCT_IMAGES: Record<string, string> = {
  elite: '/images/nfc-card.jpg',
  social: '/images/social-profile.jpg',
  custom: '/images/custom-identity.jpg',
  hoodie: '/images/streetwear-hoodie.jpg',
  'oversized-tee': '/images/streetwear-collection.jpg',
  'launch-site': '/images/digital-commerce.jpg',
  commerce: '/images/nfc-card.jpg',
};

const CATEGORY_IMAGES: Record<ProductCategory, string> = {
  cards: '/images/nfc-card.jpg',
  fashion: '/images/streetwear-collection.jpg',
  services: '/images/digital-commerce.jpg',
};

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'elite',
    category: 'cards',
    markets: ['eg', 'ksa'],
    name: { en: 'ZEXOR NFC — Elite', ar: 'ZEXOR NFC — إيليت' },
    description: {
      en: 'A premium NFC business card for instantly sharing your digital profile and contact details.',
      ar: 'بطاقة أعمال NFC فاخرة لمشاركة ملفك الرقمي وبيانات التواصل فوراً.',
    },
    price: { eg: 450, ksa: 35 },
    icon: 'credit',
    finish: 'pearl',
    available: true,
  },
  {
    id: 'social',
    category: 'cards',
    markets: ['eg', 'ksa'],
    name: { en: 'ZEXOR NFC — Social', ar: 'ZEXOR NFC — سوشيال' },
    description: {
      en: 'Bring your social profiles together in one tap-to-share NFC card.',
      ar: 'اجمع حساباتك الاجتماعية في بطاقة NFC واحدة للمشاركة بلمسة.',
    },
    price: { eg: 350, ksa: 25 },
    icon: 'fingerprint',
    finish: 'mint',
    available: true,
  },
  {
    id: 'custom',
    category: 'cards',
    markets: ['eg', 'ksa'],
    name: { en: 'ZEXOR NFC — Custom', ar: 'ZEXOR NFC — مخصصة' },
    description: {
      en: 'A custom-branded ZEXOR NFC card tailored to your professional identity.',
      ar: 'بطاقة ZEXOR NFC بتصميم مخصص يعكس هويتك المهنية.',
    },
    price: { eg: 600, ksa: 45 },
    icon: 'sparkles',
    finish: 'rose',
    available: true,
  },
  {
    id: 'hoodie',
    category: 'fashion',
    markets: ['eg'],
    name: { en: 'After Hours Hoodie', ar: 'هودي أفتر آورز' },
    description: {
      en: 'A heavyweight, soft-touch hoodie from a limited ZEXOR Atelier release.',
      ar: 'هودي بخامة ناعمة وثقيلة، ضمن إصدار محدود من أتيليه ZEXOR.',
    },
    price: { eg: 1250, ksa: 0 },
    icon: 'shirt',
    finish: 'rose',
    available: true,
  },
  {
    id: 'oversized-tee',
    category: 'fashion',
    markets: ['eg'],
    name: { en: 'Signal Oversized Tee', ar: 'تيشيرت سيجنال واسع' },
    description: {
      en: 'An everyday oversized fit with a considered finish and easy, relaxed feel.',
      ar: 'تيشيرت واسع للاستخدام اليومي بتفاصيل مدروسة وقصّة مريحة.',
    },
    price: { eg: 790, ksa: 0 },
    icon: 'shirt',
    finish: 'lilac',
    available: true,
  },
  {
    id: 'launch-site',
    category: 'services',
    markets: ['eg', 'ksa'],
    name: { en: 'Brand Website', ar: 'موقع بهوية علامتك' },
    description: {
      en: 'A responsive, high-performance website tailored to your brand and business goals.',
      ar: 'موقع متجاوب وعالي الأداء، مصمم ليتوافق مع علامتك وأهداف أعمالك.',
    },
    price: { eg: 8000, ksa: 1200 },
    icon: 'code',
    finish: 'sky',
    available: true,
  },
  {
    id: 'commerce',
    category: 'services',
    markets: ['eg', 'ksa'],
    name: { en: 'E-commerce Experience', ar: 'متجر إلكتروني متكامل' },
    description: {
      en: 'A complete online store designed to make browsing and ordering straightforward.',
      ar: 'متجر إلكتروني متكامل يسهل على عملائك استعراض المنتجات وإتمام الطلب.',
    },
    price: { eg: 18000, ksa: 2500 },
    icon: 'layers',
    finish: 'lilac',
    available: true,
  },
];

const LEGACY_PRODUCT_COPY: Record<string, Pick<Product, 'name' | 'description'>> = {
  elite: {
    name: { en: 'Spatial Elite', ar: 'سبيشال إيليت' },
    description: {
      en: 'A sculpted metal finish. One tap, and your introduction becomes unforgettable.',
      ar: 'تصميم معدني فاخر. لمسة واحدة تجعل لقاءك الأول لا يُنسى.',
    },
  },
  social: {
    name: { en: 'Social Card', ar: 'بطاقة سوشيال' },
    description: {
      en: 'Your socials, your story, your world—beautifully shared in one tap.',
      ar: 'حساباتك وقصتك وعالمك، شاركها كلها بلمسة أنيقة.',
    },
  },
  custom: {
    name: { en: 'Bespoke Signature', ar: 'توقيعك الخاص' },
    description: {
      en: 'Your identity, made tangible. A custom ZEXOR card that is unmistakably yours.',
      ar: 'هويتك أصبحت ملموسة. بطاقة زكسور مخصصة تحمل طابعك الخاص.',
    },
  },
  hoodie: {
    name: { en: 'After Hours Hoodie', ar: 'هودي أفتر آورز' },
    description: {
      en: 'Heavyweight, soft-touch streetwear in a limited ZEXOR studio drop.',
      ar: 'قطعة ستريت وير بخامة ناعمة وثقيلة، إصدار محدود من استوديو زكسور.',
    },
  },
  'oversized-tee': {
    name: { en: 'Signal Oversized Tee', ar: 'تيشيرت سيجنال واسع' },
    description: {
      en: 'A confident everyday silhouette. Relaxed fit, elevated finish.',
      ar: 'قصة يومية واثقة، واسعة ومريحة بتفاصيل راقية.',
    },
  },
  'launch-site': {
    name: { en: 'Signature Website', ar: 'موقع سيجنتشر' },
    description: {
      en: 'An editorial, high-performance website shaped around your brand.',
      ar: 'موقع أنيق وسريع، مصمم بالكامل حول علامتك التجارية.',
    },
  },
  commerce: {
    name: { en: 'Commerce, Considered', ar: 'تجارة إلكترونية متكاملة' },
    description: {
      en: 'A considered e-commerce experience, from first glance to checkout.',
      ar: 'تجربة تجارة إلكترونية مدروسة، من أول نظرة إلى إتمام الطلب.',
    },
  },
};

const TEXT = {
  en: {
    nav: { home: 'Home', cards: 'NFC cards', fashion: 'Apparel', services: 'Digital studio', dashboard: 'Studio admin' },
    language: 'العربية',
    bag: 'Cart',
    brandKicker: 'DESIGN · TECHNOLOGY · CULTURE',
    heroEyebrow: 'A CONNECTED BRAND FOR WHAT’S NEXT.',
    heroTitle: 'Make your',
    heroAccent: 'next move matter.',
    heroText: 'ZEXOR brings together connected NFC identity, considered streetwear, and digital experiences—built for people and brands moving forward across Egypt and Saudi Arabia.',
    discover: 'Explore NFC cards',
    exploreCard: 'Discover NFC cards',
    byAppointment: 'EGYPT & SAUDI ARABIA',
    cardLabel: 'ZEXOR NFC / 01',
    cardName: 'One tap.',
    cardNameAccent: 'Every connection.',
    cardProfile: 'YOUR DIGITAL PROFILE',
    nfcReady: 'NFC · READY',
    cardEdition: 'EDITION 2026',
    haptic: 'Tap. Connect. Continue.',
    highlights: ['CONNECTED IDENTITY', 'DESIGNED IN EGYPT', 'BUILT FOR THE REGION'],
    highlightsSub: ['Share your profile with NFC', 'Independent apparel releases', 'Serving Egypt and Saudi Arabia'],
    philosophyEyebrow: 'THOUGHTFUL DESIGN. PRACTICAL TECHNOLOGY.',
    philosophyTitle: 'One brand,',
    philosophyAccent: 'three ways forward.',
    philosophyText: 'From the way you introduce yourself to the way you dress and do business, ZEXOR brings design and technology together in useful, considered experiences.',
    philosophyCards: [
      ['01 / CONNECT', 'Share in a tap.', 'Bring your contact details and social profiles together in one NFC-enabled card.'],
      ['02 / WEAR', 'Style with intent.', 'Discover considered streetwear and limited releases from the ZEXOR Atelier.'],
      ['03 / BUILD', 'Create what’s next.', 'Launch a website, online store, or digital product with the ZEXOR Studio.'],
    ],
    collectionsEyebrow: 'THREE PILLARS · ONE CONNECTED BRAND',
    collectionsTitle: 'Explore what',
    collectionsAccent: 'ZEXOR can do.',
    collectionsText: 'Discover products and services designed to work together and move your ideas forward.',
    viewCollection: 'Explore collection',
    pillarEyebrow: 'DESIGNED TO CONNECT YOUR WORLD.',
    pillarTitles: ['NFC business cards.', 'Streetwear, by ZEXOR.', 'Websites, commerce & apps.'],
    pillarDescriptions: [
      'Share your digital profile instantly with a premium NFC card. Available in Egypt and Saudi Arabia.',
      'Small-run apparel with confident fits and thoughtful details. Available in Egypt.',
      'Brand-led digital experiences for businesses ready to grow across the region.',
    ],
    pillarBadges: ['EGYPT · SAUDI ARABIA', 'MADE IN EGYPT', 'REGIONAL STUDIO'],
    heroFashionLabel: 'ZEXOR ATELIER',
    heroFashionMeta: 'APPAREL · EGYPT',
    heroStudioLabel: 'ZEXOR DIGITAL STUDIO',
    heroStudioMeta: 'WEB · E-COMMERCE · APPS',
    heroSignal: 'THREE PILLARS · ONE BRAND',
    studioCairo: 'ZEXOR ATELIER · EGYPT',
    cardChapter: '01 / CONNECT',
    apparelChapter: '02 / WEAR',
    studioChapter: '03 / BUILD',
    scrollPrompt: 'SCROLL TO EXPLORE',
    concierge: 'ZEXOR / CUSTOMER CARE',
    collectionTag: 'ZEXOR / COLLECTION',
    flowTag: 'ZEXOR / ORDER MANAGEMENT',
    ordersTag: 'ZEXOR / ORDERS',
    privateTag: 'ZEXOR / PRIVATE STUDIO',
    cardProductTag: 'NFC BUSINESS CARD',
    studioProductTag: 'DIGITAL STUDIO',
    servicesProductTag: 'WEB · COMMERCE · APPS',
    apparelDropTag: 'LIMITED RELEASE',
    cardMarketLine: 'EGYPT · SAUDI ARABIA · NFC',
    languageSwitch: 'Switch to Arabic',
    cardsOverline: 'ZEXOR / NFC CARDS',
    fashionOverline: 'ZEXOR / ATELIER',
    servicesOverline: 'ZEXOR / DIGITAL STUDIO',
    whatsappGreeting: 'Hello ZEXOR, I would like to place an order.',
    whatsappOrder: 'Order',
    whatsappName: 'Name',
    whatsappPhone: 'Phone',
    whatsappCity: 'City',
    whatsappRegion: 'Region',
    whatsappItems: 'Items',
    whatsappTotal: 'Total',
    regionalFooter: 'EGYPT 🇪🇬 · SAUDI ARABIA 🇸🇦 · © 2026 ZEXOR',
    decreaseQuantity: 'Decrease quantity',
    increaseQuantity: 'Increase quantity',
    all: 'All regions',
    egypt: 'Egypt',
    ksa: 'Saudi Arabia',
    availableIn: 'AVAILABLE IN',
    cardsTitle: 'A smarter first impression.',
    cardsSubtitle: 'Your introduction, in one tap.',
    cardsText: 'A premium NFC business card that shares your digital profile instantly—no app or paper business card required.',
    configTitle: 'Choose your card.',
    configHint: 'Select a finish that feels like you.',
    configPreview: 'YOUR ZEXOR CARD',
    finishPearl: 'Pearl',
    finishMint: 'Mint',
    finishRose: 'Rose gold',
    finishLilac: 'Lilac',
    fashionTitle: 'Designed to move with you.',
    fashionSubtitle: 'ZEXOR Atelier.',
    fashionText: 'Independent streetwear with considered materials, relaxed silhouettes, and limited releases. Designed in Egypt.',
    ksaFashionTitle: 'The Atelier is currently in Egypt.',
    ksaFashionText: 'Our apparel collection is currently available in Egypt. Choose Egypt to browse this release.',
    servicesTitle: 'Build your next',
    servicesAccent: 'digital experience.',
    servicesText: 'Strategy, design, and development for distinctive websites, online stores, and applications serving Egypt and Saudi Arabia.',
    servicesCatalogTitle: 'Digital services for your next stage.',
    servicesFeatures: ['Brand strategy & digital direction', 'Responsive web design & development', 'E-commerce & application experiences'],
    servicesCta: 'Tell us about your project',
    contactZexor: 'Start a conversation',
    contactGreeting: 'Hello ZEXOR, I would like to learn more about your products and services.',
    ctaEyebrow: 'YOUR NEXT IDEA STARTS HERE',
    ctaTitle: 'Let’s make',
    ctaAccent: 'something matter.',
    menu: 'Open navigation',
    closeMenu: 'Close navigation',
    productSaved: 'Product added to the ZEXOR collection.',
    productUpdated: 'Product information updated.',
    products: 'Explore the collection',
    addToBag: 'Add to cart',
    addedToBag: 'Added to cart',
    from: 'From',
    egp: 'EGP',
    sar: 'SAR',
    egOnly: 'EGYPT EXCLUSIVE',
    noProducts: 'A moment before the next drop.',
    noProductsText: 'This collection is currently available in Egypt only.',
    switchEgypt: 'Explore Egypt collection',
    dashboardEyebrow: 'THE STUDIO / ADMINISTRATION',
    dashboardTitle: 'Your world,',
    dashboardAccent: 'in good hands.',
    dashboardIntro: 'A private, locally stored overview of your products and incoming orders.',
    localData: 'PRIVATE · STORED IN THIS BROWSER',
    totalOrders: 'Orders received',
    openOrders: 'Needs attention',
    productCount: 'Available products',
    totalRevenue: 'Recorded revenue',
    regionalOverview: 'Your regions',
    ordersTitle: 'Incoming orders',
    orderRef: 'REFERENCE',
    client: 'CLIENT',
    region: 'REGION',
    orderContents: 'ORDER',
    total: 'TOTAL',
    orderState: 'STATUS',
    statusNew: 'New',
    statusConfirmed: 'Confirmed',
    statusComplete: 'Complete',
    advance: 'Next status',
    deleteOrder: 'Remove order',
    noOrders: 'Your first order will appear here.',
    noOrdersText: 'Orders created through checkout are kept in this browser.',
    catalogManage: 'Manage your collection',
    addProduct: 'Add a product',
    removeProduct: 'Remove product',
    productNameEn: 'Product name · English',
    productNameAr: 'Product name · Arabic',
    productDescriptionEn: 'Short description · English',
    productDescriptionAr: 'Short description · Arabic',
    productImageUrl: 'Product image URL (https://...)',
    editProduct: 'Edit product',
    updateProduct: 'Save changes',
    newProduct: 'New product',
    adminAccess: 'Private studio access',
    adminPassword: 'Studio password',
    unlockAdmin: 'Unlock dashboard',
    invalidPassword: 'That password is not correct. Try again.',
    adminSecurityNote: 'This browser-only gate is not server-side security. Use backend authentication before publishing private business data.',
    adminLogout: 'Lock dashboard',
    imagePreview: 'Image preview',
    invalidImageUrl: 'Enter a valid image URL that starts with http:// or https://.',
    invalidProductFields: 'Complete both names, both descriptions, and valid prices.',
    priceEG: 'Price · EGP',
    priceKSA: 'Price · SAR',
    productCategory: 'Collection',
    saveProduct: 'Add to collection',
    cancel: 'Cancel',
    confirmRemove: 'Remove this product from your collection?',
    cartTitle: 'Your ZEXOR cart.',
    cartAccent: 'Ready when you are.',
    emptyBag: 'Your cart is ready for something good.',
    emptyBagText: 'Browse the ZEXOR collection and add a product to get started.',
    checkout: 'Continue to WhatsApp',
    checkoutNote: 'Your order will be sent directly to our team in your region.',
    subtotal: 'Subtotal',
    shippingAt: 'Delivery details confirmed with our team.',
    checkoutTitle: 'Your order details.',
    customerName: 'Your name',
    customerPhone: 'Your phone number',
    customerCity: 'City / delivery area',
    selectRegion: 'Choose your region',
    EgyptWhatsApp: 'Egypt · WhatsApp',
    KSAWhatsApp: 'Saudi Arabia · WhatsApp',
    whatsAppTeam: 'Open regional WhatsApp',
    sendOrder: 'Send order on WhatsApp',
    orderCreated: 'Order details saved in this browser.',
    orderErrors: 'Please complete your name, phone, city, and region.',
    checkoutWhatsAppNote: 'WhatsApp will open with your order details ready to send.',
    orderCreatedToast: 'Your order is recorded. Opening WhatsApp…',
    close: 'Close',
    footer: 'Connected identity. Considered style. Digital experiences.',
    follow: 'FOLLOW ZEXOR',
    tikTok: 'TikTok · @zexor.digtal.studio',
    adminHint: 'Changes are saved on this device. Connect a backend before using this as a shared production admin.',
    count: 'products',
    quantity: 'Quantity',
    remove: 'Remove',
  },
  ar: {
    nav: { home: 'الرئيسية', cards: 'بطاقات NFC', fashion: 'الأزياء', services: 'الاستوديو الرقمي', dashboard: 'إدارة الاستوديو' },
    language: 'English',
    bag: 'السلة',
    brandKicker: 'تصميم · تقنية · ثقافة',
    heroEyebrow: 'علامة متكاملة لعالم يتقدّم.',
    heroTitle: 'اجعل خطوتك',
    heroAccent: 'القادمة ذات أثر.',
    heroText: 'تجمع ZEXOR بين بطاقات NFC لمشاركة هويتك، وأزياء مدروسة، وتجارب رقمية متكاملة — لعلامات وأشخاص يتطلعون إلى التقدّم في مصر والسعودية.',
    discover: 'اكتشف بطاقات NFC',
    exploreCard: 'اكتشف بطاقات NFC',
    byAppointment: 'مصر والمملكة العربية السعودية',
    cardLabel: 'بطاقة ZEXOR / ٠١',
    cardName: 'لمسة واحدة.',
    cardNameAccent: 'وكل عالمك معك.',
    cardProfile: 'ملفك الرقمي',
    nfcReady: 'تقنية NFC جاهزة',
    cardEdition: 'إصدار ٢٠٢٦',
    haptic: 'قرّب. شارك. تواصل.',
    highlights: ['هوية رقمية متصلة', 'تصميم من مصر', 'مصممة للمنطقة'],
    highlightsSub: ['شارك ملفك بلمسة NFC', 'إصدارات أزياء مستقلة', 'نخدم مصر والسعودية'],
    philosophyEyebrow: 'تصميم مدروس. تقنية عملية.',
    philosophyTitle: 'علامة واحدة،',
    philosophyAccent: 'وثلاثة عوالم.',
    philosophyText: 'من طريقة التعريف بنفسك، إلى أسلوبك ومشروعك؛ تجمع ZEXOR بين التصميم والتقنية في تجارب عملية متكاملة.',
    philosophyCards: [
      ['٠١ / تواصل', 'شارك بياناتك بلمسة.', 'اجمع بيانات التواصل وروابطك في بطاقة NFC واحدة، وشارك ملفك الرقمي فوراً.'],
      ['٠٢ / ارتدِ', 'أسلوب بتفاصيل مدروسة.', 'اكتشف أزياء ZEXOR بإصدارات محدودة وقصّات مريحة وتفاصيل مختارة.'],
      ['٠٣ / ابنِ', 'ابدأ خطوتك الرقمية.', 'أطلق موقعك أو متجرك الإلكتروني أو منتجك الرقمي مع استوديو ZEXOR.'],
    ],
    collectionsEyebrow: 'ثلاثة محاور · علامة متكاملة',
    collectionsTitle: 'اكتشف ما',
    collectionsAccent: 'تقدمه ZEXOR.',
    collectionsText: 'منتجات وخدمات متكاملة صُممت لدعم أفكارك وتحويلها إلى خطوات عملية.',
    viewCollection: 'اكتشف المجموعة',
    pillarEyebrow: 'مصممة لتربط عوالمك.',
    pillarTitles: ['بطاقات أعمال NFC.', 'أزياء من ZEXOR.', 'مواقع ومتاجر وتطبيقات.'],
    pillarDescriptions: [
      'شارك ملفك الرقمي فوراً ببطاقة NFC مميزة، متاحة في مصر والسعودية.',
      'أزياء بإصدارات محدودة وقصّات واثقة وتفاصيل مدروسة. متاحة في مصر.',
      'تجارب رقمية تحمل هوية علامتك وتدعم نمو أعمالك في المنطقة.',
    ],
    pillarBadges: ['مصر · السعودية', 'صُنع في مصر', 'استوديو إقليمي'],
    heroFashionLabel: 'أتيليه ZEXOR',
    heroFashionMeta: 'أزياء · مصر',
    heroStudioLabel: 'استوديو زكسور الرقمي',
    heroStudioMeta: 'مواقع · تجارة إلكترونية · تطبيقات',
    heroSignal: 'ثلاثة محاور · علامة واحدة',
    studioCairo: 'أتيليه ZEXOR · مصر',
    cardChapter: '٠١ / تواصل',
    apparelChapter: '٠٢ / ارتدِ',
    studioChapter: '٠٣ / ابنِ',
    scrollPrompt: 'مرّر لاكتشاف المزيد',
    concierge: 'ZEXOR / خدمة العملاء',
    collectionTag: 'ZEXOR / المنتجات',
    flowTag: 'ZEXOR / إدارة الطلبات',
    ordersTag: 'ZEXOR / الطلبات',
    privateTag: 'ZEXOR / الاستوديو الخاص',
    cardProductTag: 'بطاقة أعمال NFC',
    studioProductTag: 'الاستوديو الرقمي',
    servicesProductTag: 'مواقع · متاجر · تطبيقات',
    apparelDropTag: 'إصدار محدود',
    cardMarketLine: 'مصر · السعودية · NFC',
    languageSwitch: 'التبديل إلى الإنجليزية',
    cardsOverline: 'ZEXOR / بطاقات NFC',
    fashionOverline: 'ZEXOR / الأتيليه',
    servicesOverline: 'ZEXOR / الاستوديو الرقمي',
    whatsappGreeting: 'مرحباً ZEXOR، أرغب في تقديم طلب.',
    whatsappOrder: 'رقم الطلب',
    whatsappName: 'الاسم',
    whatsappPhone: 'رقم الهاتف',
    whatsappCity: 'المدينة',
    whatsappRegion: 'المنطقة',
    whatsappItems: 'المنتجات',
    whatsappTotal: 'الإجمالي',
    regionalFooter: 'مصر 🇪🇬 · السعودية 🇸🇦 · © 2026 ZEXOR',
    decreaseQuantity: 'تقليل الكمية',
    increaseQuantity: 'زيادة الكمية',
    all: 'كل المناطق',
    egypt: 'مصر',
    ksa: 'السعودية',
    availableIn: 'متاحة في',
    cardsTitle: 'انطباع أول أكثر ذكاءً.',
    cardsSubtitle: 'عرّف بنفسك بلمسة.',
    cardsText: 'بطاقة أعمال NFC مميزة لمشاركة ملفك الرقمي فوراً، دون تطبيق أو بطاقات ورقية.',
    configTitle: 'اختر بطاقتك.',
    configHint: 'اختر اللون الأقرب إلى أسلوبك.',
    configPreview: 'بطاقة ZEXOR الخاصة بك',
    finishPearl: 'لؤلؤي',
    finishMint: 'نعناعي',
    finishRose: 'ذهبي وردي',
    finishLilac: 'ليلكي',
    fashionTitle: 'أزياء تواكب إيقاعك.',
    fashionSubtitle: 'أتيليه ZEXOR.',
    fashionText: 'أزياء مستقلة بخامات مختارة وقصّات مريحة وإصدارات محدودة. صُممت في مصر.',
    ksaFashionTitle: 'أتيليه ZEXOR متاح حالياً في مصر.',
    ksaFashionText: 'تتوفر مجموعة الأزياء حالياً في مصر. اختر مصر لاستعراض هذا الإصدار.',
    servicesTitle: 'ابنِ تجربتك',
    servicesAccent: 'الرقمية القادمة.',
    servicesText: 'استراتيجية وتصميم وتطوير للمواقع والمتاجر والتطبيقات التي تخدم أعمالك في مصر والسعودية.',
    servicesCatalogTitle: 'خدمات رقمية تدعم خطوتك القادمة.',
    servicesFeatures: ['استراتيجية العلامة والتوجيه الرقمي', 'تصميم وتطوير مواقع متجاوبة', 'تجارب المتاجر والتطبيقات'],
    servicesCta: 'شاركنا تفاصيل مشروعك',
    contactZexor: 'ابدأ محادثة مع فريقنا',
    contactGreeting: 'مرحباً ZEXOR، أود معرفة المزيد عن منتجاتكم وخدماتكم.',
    ctaEyebrow: 'فكرتك القادمة تبدأ هنا',
    ctaTitle: 'لنحوّل فكرتك',
    ctaAccent: 'إلى شيء مؤثر.',
    menu: 'افتح قائمة التنقل',
    closeMenu: 'أغلق قائمة التنقل',
    productSaved: 'تمت إضافة المنتج إلى مجموعة ZEXOR.',
    productUpdated: 'تم تحديث بيانات المنتج.',
    products: 'اكتشف المجموعة',
    addToBag: 'أضف إلى السلة',
    addedToBag: 'تمت الإضافة إلى السلة',
    from: 'يبدأ من',
    egp: 'ج.م',
    sar: 'ر.س',
    egOnly: 'حصري لمصر',
    noProducts: 'قليلاً من الترقّب.',
    noProductsText: 'هذه المجموعة متاحة حالياً في مصر فقط.',
    switchEgypt: 'اكتشف مجموعة مصر',
    dashboardEyebrow: 'الاستوديو / الإدارة',
    dashboardTitle: 'عالمك،',
    dashboardAccent: 'بإدارة أجمل.',
    dashboardIntro: 'نظرة خاصة محفوظة محلياً على منتجاتك والطلبات الواردة.',
    localData: 'خاص · محفوظ على هذا المتصفح',
    totalOrders: 'الطلبات المستلمة',
    openOrders: 'تحتاج إلى متابعة',
    productCount: 'المنتجات المتاحة',
    totalRevenue: 'الإيرادات المسجلة',
    regionalOverview: 'مناطقك',
    ordersTitle: 'الطلبات الواردة',
    orderRef: 'رقم الطلب',
    client: 'العميل',
    region: 'المنطقة',
    orderContents: 'الطلب',
    total: 'الإجمالي',
    orderState: 'الحالة',
    statusNew: 'جديد',
    statusConfirmed: 'مؤكد',
    statusComplete: 'مكتمل',
    advance: 'الحالة التالية',
    deleteOrder: 'حذف الطلب',
    noOrders: 'سيظهر أول طلب لك هنا.',
    noOrdersText: 'الطلبات المنشأة من صفحة الدفع محفوظة في هذا المتصفح.',
    catalogManage: 'إدارة مجموعتك',
    addProduct: 'أضف منتجاً',
    removeProduct: 'حذف المنتج',
    productNameEn: 'اسم المنتج · الإنجليزية',
    productNameAr: 'اسم المنتج · العربية',
    productDescriptionEn: 'وصف مختصر · الإنجليزية',
    productDescriptionAr: 'وصف مختصر · العربية',
    productImageUrl: 'رابط صورة المنتج (https://...)',
    editProduct: 'تعديل المنتج',
    updateProduct: 'حفظ التعديلات',
    newProduct: 'منتج جديد',
    adminAccess: 'دخول الاستوديو الخاص',
    adminPassword: 'كلمة مرور الاستوديو',
    unlockAdmin: 'فتح لوحة الإدارة',
    invalidPassword: 'كلمة المرور غير صحيحة. حاول مرة أخرى.',
    adminSecurityNote: 'بوابة المتصفح هذه ليست حماية من جهة الخادم. استخدم مصادقة خلفية قبل نشر بيانات العمل الخاصة.',
    adminLogout: 'قفل لوحة الإدارة',
    imagePreview: 'معاينة الصورة',
    invalidImageUrl: 'أدخل رابط صورة صالحاً يبدأ بـ http:// أو https://.',
    invalidProductFields: 'أكمل الاسمين والوصفين وأدخل أسعاراً صالحة.',
    priceEG: 'السعر · جنيه',
    priceKSA: 'السعر · ريال',
    productCategory: 'المجموعة',
    saveProduct: 'أضف إلى المجموعة',
    cancel: 'إلغاء',
    confirmRemove: 'هل تريد حذف هذا المنتج من مجموعتك؟',
    cartTitle: 'سلة ZEXOR.',
    cartAccent: 'جاهزة لاختيارك.',
    emptyBag: 'سلتك بانتظار اختيارك.',
    emptyBagText: 'تصفّح مجموعة ZEXOR وأضف المنتجات التي تناسبك.',
    checkout: 'أكمل الطلب عبر واتساب',
    checkoutNote: 'سنرسل طلبك مباشرةً إلى فريقنا في منطقتك.',
    subtotal: 'المجموع',
    shippingAt: 'نتفق على تفاصيل التوصيل مع فريقنا.',
    checkoutTitle: 'بيانات طلبك.',
    customerName: 'اسمك',
    customerPhone: 'رقم هاتفك',
    customerCity: 'المدينة / منطقة التوصيل',
    selectRegion: 'اختر منطقتك',
    EgyptWhatsApp: 'مصر · واتساب',
    KSAWhatsApp: 'السعودية · واتساب',
    whatsAppTeam: 'افتح واتساب المنطقة',
    sendOrder: 'أرسل الطلب عبر واتساب',
    orderCreated: 'تم حفظ تفاصيل الطلب على هذا المتصفح.',
    orderErrors: 'يرجى إدخال الاسم والهاتف والمدينة والمنطقة.',
    checkoutWhatsAppNote: 'سيُفتح واتساب مع تفاصيل طلبك جاهزة للإرسال.',
    orderCreatedToast: 'تم تسجيل طلبك. جارٍ فتح واتساب…',
    close: 'إغلاق',
    footer: 'هوية متصلة. أسلوب مدروس. تجارب رقمية.',
    follow: 'تابع ZEXOR',
    tikTok: 'تيك توك · @zexor.digtal.studio',
    adminHint: 'التغييرات محفوظة على هذا الجهاز. اربط قاعدة بيانات قبل استخدام الإدارة بشكل مشترك.',
    count: 'منتجات',
    quantity: 'الكمية',
    remove: 'حذف',
  },
} as const;

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function useStoredState<T>(key: string, initial: T, migrate: (value: T) => T = (value) => value) {
  const [value, setValue] = useState<T>(() => migrate(readStorage(key, initial)));
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Keep the session usable if browser storage is disabled or full.
    }
  }, [key, value]);
  return [value, setValue] as const;
}

function migrateProductCopy(products: Product[]) {
  let changed = false;
  const migrated = products.map((product) => {
    const previous = LEGACY_PRODUCT_COPY[product.id];
    const updated = INITIAL_PRODUCTS.find((item) => item.id === product.id);
    if (
      !previous ||
      !updated ||
      product.name.en !== previous.name.en ||
      product.name.ar !== previous.name.ar ||
      product.description.en !== previous.description.en ||
      product.description.ar !== previous.description.ar
    ) {
      return product;
    }
    changed = true;
    return { ...product, name: updated.name, description: updated.description };
  });
  return changed ? migrated : products;
}

function pageFromHash(): Route {
  const current = window.location.hash.replace(/^#\/?/, '').split('/')[0];
  return current === 'cards' || current === 'fashion' || current === 'services' || current === 'dashboard'
    ? current
    : 'home';
}

function money(amount: number, market: Market, locale: Locale) {
  const formatted = new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en', {
    maximumFractionDigits: 0,
  }).format(amount);
  const currency = locale === 'ar' ? (market === 'eg' ? 'ج.م' : 'ر.س') : market === 'eg' ? 'EGP' : 'SAR';
  return `${formatted} ${currency}`;
}

function TiltCard({
  children,
  className = '',
  intensity = 10,
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
}) {
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [intensity, -intensity]), { stiffness: 150, damping: 19 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-intensity, intensity]), { stiffness: 150, damping: 19 });

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left) / rect.width - 0.5);
    y.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className={className}
      onPointerLeave={reset}
      onPointerMove={handleMove}
      style={{ rotateX: reduceMotion ? 0 : rotateX, rotateY: reduceMotion ? 0 : rotateY, transformStyle: 'preserve-3d' }}
      whileHover={reduceMotion ? undefined : { scale: 1.018 }}
      transition={{ type: 'spring', stiffness: 130, damping: 18 }}
    >
      {children}
    </motion.div>
  );
}

function HomeExperience({
  locale,
  market,
  navigate,
  onMarketChange,
  t,
}: {
  locale: Locale;
  market: Market;
  navigate: (route: Route) => void;
  onMarketChange: (market: Market) => void;
  t: (typeof TEXT)[Locale];
}) {
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const smoothX = useSpring(pointerX, { stiffness: 70, damping: 22 });
  const smoothY = useSpring(pointerY, { stiffness: 70, damping: 22 });
  const fashionX = useTransform(smoothX, [0, 1], [-24, 24]);
  const fashionY = useTransform(smoothY, [0, 1], [18, -18]);
  const cardX = useTransform(smoothX, [0, 1], [20, -20]);
  const cardY = useTransform(smoothY, [0, 1], [-14, 14]);
  const sceneScale = useTransform(smoothX, [0, 1], [1.01, 1.04]);
  const cardTilt = useTransform(smoothX, [0, 1], [-3, 3]);
  const studioTilt = useTransform(smoothX, [0, 1], [2, -2]);
  const direction = locale === 'ar' ? 'rtl' : 'ltr';
  const scenes = [
    { route: 'fashion' as const, number: '01', title: t.heroFashionLabel, image: '/images/streetwear-collection.jpg', alt: t.heroFashionLabel },
    { route: 'cards' as const, number: '02', title: t.nav.cards, image: '/images/nfc-card.jpg', alt: t.cardLabel },
    { route: 'services' as const, number: '03', title: t.heroStudioLabel, image: '/images/digital-studio.jpg', alt: t.heroStudioLabel },
  ];

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set(Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width)));
    pointerY.set(Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height)));
  };

  const resetPointer = () => {
    pointerX.set(0.5);
    pointerY.set(0.5);
  };

  return (
    <div dir={direction}>
      <section
        className="relative bg-[#f8f7f2] text-[#232923]"
      >
        <div className="relative">
          <div className="relative flex min-h-180 flex-col overflow-hidden sm:min-h-200 lg:min-h-[calc(100svh-4.25rem)]" onPointerLeave={resetPointer} onPointerMove={handlePointerMove}>
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_35%,rgba(224,180,157,.25),transparent_36%),radial-gradient(ellipse_at_20%_72%,rgba(142,213,195,.23),transparent_34%)]" />
            <div className="relative z-20 mx-auto flex w-full max-w-360 items-center justify-between gap-3 px-5 pt-5 sm:px-10 sm:pt-8">
              <p className="text-[9px] font-semibold tracking-[.25em] text-[#687069] sm:text-[10px]">ZEXOR · {t.brandKicker}</p>
              <span className="inline-flex min-w-0 items-center gap-1.5 text-[7px] font-medium tracking-[.08em] text-[#83877f] sm:gap-2 sm:text-[9px] sm:tracking-[.14em]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#db846d]" />
                {locale === 'ar' ? '🇪🇬 مصر' : 'EGYPT'} <span className="text-[#b4b0a8]">/</span> {locale === 'ar' ? '🇸🇦 السعودية' : 'SAUDI ARABIA'}
              </span>
            </div>

            <div className="relative mx-auto grid w-full max-w-360 flex-1 items-center gap-2 px-5 pb-7 pt-4 sm:gap-4 sm:px-10 sm:pb-10 sm:pt-5 lg:grid-cols-[1fr_1fr] lg:gap-2 lg:pb-12 lg:pt-0">
              <div className="relative z-20 max-w-xl self-start pt-5 sm:pt-8 lg:self-center lg:pt-0">
                <p className="mb-5 inline-flex items-center gap-2 text-[9px] font-semibold tracking-[.2em] text-[#9a6757]">
                  <span className="h-px w-7 bg-[#d8947c]" />{t.heroEyebrow}
                </p>
                <h1 className={`max-w-180 text-[clamp(2.65rem,10vw,3.35rem)] font-medium leading-[1.04] tracking-[-.065em] sm:text-6xl sm:leading-[.96] md:text-7xl ${locale === 'ar' ? 'leading-[1.35] tracking-normal lg:text-[5rem]' : 'lg:text-[6.4rem]'}`}>
                  {t.heroTitle}
                  <span className="mt-1 block font-serif italic font-normal text-[#bd806c]">{t.heroAccent}</span>
                </h1>
                <p className={`mt-5 max-w-md text-[13px] leading-6 text-[#68716b] sm:mt-7 sm:text-sm sm:leading-7 ${locale === 'ar' ? 'text-right' : ''}`}>{t.heroText}</p>
                <div className="mt-5 flex flex-wrap items-center gap-2.5 sm:mt-8 sm:gap-3">
                  <button className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-[#24372f] px-4 text-[10px] font-medium text-white transition-colors hover:bg-[#b97561] sm:gap-3 sm:px-6 sm:text-xs" onClick={() => navigate('cards')} type="button">
                    {t.discover}<ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </button>
                  <span className="text-[9px] tracking-[.12em] text-[#878c84]">{t.byAppointment}</span>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2.5 sm:mt-5 sm:gap-3">
                  <span className="text-[8px] font-semibold tracking-[.15em] text-[#858a82]">{t.availableIn}</span>
                  <MarketSwitch className={`scale-90 ${locale === 'ar' ? 'origin-right' : 'origin-left'}`} locale={locale} market={market} onChange={onMarketChange} />
                </div>
              </div>

              <div className="relative -mx-2 grid min-h-80 flex-1 grid-cols-[1.05fr_.95fr] gap-2.5 sm:min-h-104 sm:gap-4 lg:mx-0 lg:min-h-140">
                <motion.button
                  aria-label={scenes[0].alt}
                  className="group relative min-h-80 overflow-hidden rounded-3xl bg-[#dedbd1] text-start shadow-[0_35px_80px_-38px_rgba(68,58,48,.5)] sm:min-h-104 sm:rounded-4xl"
                  onClick={() => navigate('fashion')}
                  style={{ x: fashionX, y: fashionY, scale: sceneScale }}
                  type="button"
                >
                  <img alt={scenes[0].alt} className="absolute inset-0 h-full w-full object-cover object-center saturate-[.82] transition-transform duration-700 group-hover:scale-105" draggable={false} src={scenes[0].image} />
                  <span aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-[#26251f]/75 via-[#26251f]/5 to-white/10" />
                  <span className="absolute inset-s-3 top-3 rounded-full border border-white/50 bg-white/20 px-2.5 py-1.5 text-[7px] font-semibold tracking-[.14em] text-white backdrop-blur-md sm:inset-s-5 sm:top-5 sm:px-3 sm:text-[9px]">{scenes[0].number} / {t.heroFashionMeta}</span>
                  <span className="absolute inset-x-3 bottom-3 text-white sm:inset-x-5 sm:bottom-5">
                    <span className="block text-[7px] font-medium tracking-[.14em] text-white/75 sm:text-[9px]">{t.studioCairo}</span>
                    <span className={`mt-1 block text-sm font-medium leading-snug sm:text-xl ${locale === 'ar' ? 'leading-relaxed' : ''}`}>{t.heroFashionLabel}</span>
                    <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-white/45 bg-white/15 px-2.5 py-1.5 text-[7px] backdrop-blur-md sm:text-[9px]">{t.apparelDropTag}<ArrowUpRight className="h-3 w-3" /></span>
                  </span>
                </motion.button>

                <div className="grid min-h-80 grid-rows-2 gap-2.5 sm:min-h-104 sm:gap-4">
                  <motion.button
                    aria-label={scenes[1].alt}
                    className="group relative min-h-0 overflow-hidden rounded-[1.35rem] border border-white/90 bg-[#e5ece5] text-start shadow-[0_25px_60px_-35px_rgba(37,50,43,.42)] sm:rounded-[1.8rem]"
                    onClick={() => navigate('cards')}
                    style={{ x: cardX, y: cardY, rotate: cardTilt }}
                    type="button"
                  >
                    <img alt="" className="absolute inset-0 h-full w-full object-cover opacity-50 mix-blend-multiply transition-transform duration-700 group-hover:scale-105" draggable={false} src={scenes[1].image} />
                    <span aria-hidden="true" className="absolute inset-0 bg-linear-to-br from-[#d5eee4]/75 via-[#f7f4e9]/70 to-[#e2c8be]/75" />
                    <span className="absolute inset-2 flex flex-col justify-between rounded-2xl border border-white/75 p-2.5 sm:inset-3 sm:rounded-[1.35rem] sm:p-4">
                      <span className="flex items-start justify-between gap-1"><span><span className="block text-[8px] font-bold tracking-[.25em] text-[#344a3d] sm:text-[10px]">ZEXOR</span><span className="mt-1 block text-[6px] leading-tight text-[#74857a] sm:text-[8px]">{t.cardLabel}</span></span><Radio className="h-3.5 w-3.5 shrink-0 text-[#638c75] sm:h-4 sm:w-4" /></span>
                      <span className="flex items-end justify-between gap-1">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/80 bg-white/65 text-[#628b75] sm:h-10 sm:w-10 sm:rounded-xl"><Fingerprint className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.3} /></span>
                        <span className="text-end"><span className="block text-[6px] text-[#79867c] sm:text-[8px]">{t.cardProfile}</span><span className="mt-0.5 block text-[9px] font-medium leading-tight text-[#314438] sm:text-sm">{t.cardName}</span></span>
                      </span>
                    </span>
                    <span className="absolute inset-s-3 bottom-3 rounded-full bg-[#31483b]/90 px-2.5 py-1 text-[6px] font-semibold text-white sm:inset-s-4 sm:bottom-4 sm:px-3 sm:text-[8px]">{scenes[1].number} · {t.nav.cards}</span>
                  </motion.button>

                  <motion.button
                    aria-label={scenes[2].alt}
                    className="group relative min-h-0 overflow-hidden rounded-[1.35rem] border border-white/85 bg-[#26352e] text-start shadow-[0_25px_60px_-35px_rgba(37,50,43,.42)] sm:rounded-[1.8rem]"
                    onClick={() => navigate('services')}
                    style={{ x: useTransform(fashionX, (value) => -value * 0.6), y: useTransform(cardY, (value) => -value), rotate: studioTilt }}
                    type="button"
                  >
                    <img alt={scenes[2].alt} className="absolute inset-0 h-full w-full object-cover opacity-85 transition-transform duration-700 group-hover:scale-105" draggable={false} src={scenes[2].image} />
                    <span aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-[#17231e]/90 via-[#17231e]/20 to-[#17231e]/5" />
                    <span className="absolute inset-x-2.5 bottom-2.5 flex items-end justify-between gap-1 text-white sm:inset-x-4 sm:bottom-4">
                      <span className="min-w-0"><span className="block text-[6px] font-semibold tracking-[.12em] text-white/75 sm:text-[8px]">{scenes[2].number} · {t.studioChapter}</span><span className={`mt-1 block text-[9px] font-medium leading-snug sm:text-sm ${locale === 'ar' ? 'leading-relaxed' : ''}`}>{t.heroStudioLabel}</span></span>
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/60 bg-white/15 backdrop-blur-md sm:h-8 sm:w-8"><ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4" /></span>
                    </span>
                  </motion.button>
                </div>
              </div>
            </div>

            <div className="relative z-20 mx-auto flex w-full max-w-360 items-center justify-between px-5 pb-5 sm:px-10 sm:pb-7">
              <div className="flex items-center gap-2">
                {scenes.map((scene, index) => (
                  <span
                    aria-hidden="true"
                    className={`h-1 rounded-full bg-[#bd806c] ${index === 0 ? 'w-7' : 'w-2 opacity-30'}`}
                    key={scene.number}
                  />
                ))}
              </div>
              <span className="inline-flex items-center gap-2 text-[8px] font-semibold tracking-[.14em] text-[#81877f] sm:text-[9px]">
                <ArrowDown className="h-3.5 w-3.5 animate-bounce" />{t.scrollPrompt}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-360 px-5 py-14 sm:px-10 sm:py-20">
        <div className="mb-7 flex items-end justify-between gap-5 sm:mb-9">
          <div><p className="text-[9px] font-semibold tracking-[.2em] text-[#a06f60]">{t.pillarEyebrow}</p><h2 className={`mt-2 text-3xl font-medium tracking-tighter text-[#28372f] sm:text-5xl ${locale === 'ar' ? 'leading-[1.45] tracking-normal' : ''}`}>{t.collectionsTitle} <span className="font-serif italic font-normal text-[#bd806c]">{t.collectionsAccent}</span></h2></div>
          <span className="hidden max-w-52 text-end text-[9px] leading-5 tracking-widest text-[#879087] sm:block">{t.heroSignal}</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {scenes.map((scene, index) => (
            <button className="group relative min-h-72 overflow-hidden rounded-[1.6rem] border border-white bg-[#e8e6de] text-start shadow-[0_22px_60px_-40px_rgba(36,53,42,.45)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_32px_70px_-38px_rgba(36,53,42,.55)] sm:min-h-88 sm:rounded-4xl" key={scene.route} onClick={() => navigate(scene.route)} type="button">
              <img alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" src={scene.image} />
              <span aria-hidden="true" className={`absolute inset-0 ${index === 1 ? 'bg-linear-to-t from-[#1d2923]/75 via-[#28392d]/10 to-[#28392d]/5' : 'bg-linear-to-t from-[#171b18]/75 via-[#171b18]/10 to-[#171b18]/5'}`} />
              <span className="absolute inset-x-4 top-4 flex items-center justify-between sm:inset-x-5 sm:top-5">
                <span className="rounded-full border border-white/45 bg-white/20 px-3 py-1.5 text-[8px] font-semibold tracking-[.18em] text-white backdrop-blur-md">{scene.number} / 03</span>
                {index === 0 && <span className="rounded-full bg-[#efe0d2]/90 px-3 py-1.5 text-[8px] font-semibold tracking-[.12em] text-[#54443a]">{t.egOnly}</span>}
              </span>
              <span className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 text-white sm:inset-x-5 sm:bottom-5">
                <span className="max-w-[85%]">
                  <span className="block text-[8px] font-medium tracking-[.15em] text-white/75">{index === 0 ? t.heroFashionMeta : index === 1 ? t.cardLabel : t.heroStudioMeta}</span>
                  <span className={`mt-1.5 block text-xl font-medium tracking-[-.035em] sm:text-2xl ${locale === 'ar' ? 'leading-relaxed tracking-normal' : ''}`}>{scene.title}</span>
                  <span className="mt-1.5 block text-[10px] text-white/75">{index === 0 ? t.apparelDropTag : index === 1 ? t.cardMarketLine : t.servicesProductTag}</span>
                </span>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/55 bg-white/15 backdrop-blur-md transition-all duration-300 group-hover:rotate-45 group-hover:bg-white group-hover:text-[#263a30]"><ArrowUpRight className="h-4 w-4" /></span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-360 px-5 pb-14 sm:px-10 sm:pb-20">
        <div className="relative overflow-hidden rounded-4xl border border-white/90 bg-linear-to-br from-[#eff8f1] via-[#fffaf2] to-[#f6e9e3] p-5 shadow-[0_28px_80px_-55px_rgba(57,87,68,.34)] sm:rounded-[2.5rem] sm:p-8 lg:p-10">
          <div aria-hidden="true" className="absolute -inset-e-20 -top-28 h-64 w-64 rounded-full border border-white/70 bg-white/20 blur-2xl" />
          <div className="relative grid gap-7 lg:grid-cols-[.72fr_1.28fr] lg:items-center lg:gap-10">
            <div className="max-w-md">
              <p className="text-[9px] font-semibold tracking-[.18em] text-[#9a6d5e]">{t.philosophyEyebrow}</p>
              <h2 className={`mt-3 text-3xl font-medium leading-tight tracking-tighter text-[#293c33] sm:text-4xl ${locale === 'ar' ? 'leading-[1.45] tracking-normal' : ''}`}>
                {t.philosophyTitle} <span className="font-serif italic font-normal text-[#b77c68]">{t.philosophyAccent}</span>
              </h2>
              <p className="mt-3 text-xs leading-6 text-[#6e7971] sm:text-sm">{t.philosophyText}</p>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-3">
              {t.philosophyCards.map(([eyebrow, title, description], index) => {
                const PillarIcon = index === 0 ? Fingerprint : index === 1 ? Shirt : Code2;
                const route = index === 0 ? 'cards' : index === 1 ? 'fashion' : 'services';
                return (
                  <motion.button
                    className="group relative flex min-h-44 flex-col items-start overflow-hidden rounded-[1.35rem] border border-white/90 bg-white/65 p-4 text-start shadow-[0_15px_40px_-32px_rgba(43,71,54,.42)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/90 hover:shadow-[0_22px_50px_-30px_rgba(43,71,54,.45)] sm:min-h-52 sm:p-5"
                    key={eyebrow}
                    onClick={() => navigate(route)}
                    type="button"
                    whileInView={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: 12 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.35, delay: index * 0.06 }}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white bg-linear-to-br from-[#dff3e9] to-[#f4e4da] text-[#638773] shadow-sm"><PillarIcon className="h-4 w-4" /></span>
                    <span className="mt-4 text-[8px] font-semibold tracking-[.14em] text-[#a27b68]">{eyebrow}</span>
                    <span className={`mt-1 text-sm font-medium leading-snug text-[#34483e] ${locale === 'ar' ? 'leading-relaxed' : ''}`}>{title}</span>
                    <span className="mt-2 text-[9px] leading-5 text-[#79867f]">{description}</span>
                    <ArrowUpRight aria-hidden="true" className="absolute bottom-4 inset-e-4 h-3.5 w-3.5 text-[#90a79a] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-360 px-5 pb-14 sm:px-10 sm:pb-20">
        <div className="relative overflow-hidden rounded-4xl border border-white/90 bg-linear-to-br from-[#dff1e9] via-[#fbf6ed] to-[#f1dfd8] px-6 py-10 shadow-[0_30px_90px_-55px_rgba(64,94,76,.35)] sm:rounded-[2.5rem] sm:px-12 sm:py-14">
          <div aria-hidden="true" className="absolute -inset-e-14 -top-32 h-80 w-80 rounded-full border border-white/65 bg-white/25 shadow-[0_0_90px_rgba(255,255,255,.65)]" />
          <div aria-hidden="true" className="absolute -bottom-32 inset-s-[42%] h-72 w-72 rounded-full bg-[#e8cfc5]/45 blur-[75px]" />
          <div className="relative flex flex-col items-start justify-between gap-7 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-[9px] font-semibold tracking-[.2em] text-[#9a6d5e]">{t.ctaEyebrow}</p>
              <h2 className={`mt-3 text-3xl font-medium leading-tight tracking-tighter text-[#2c3c33] sm:text-5xl ${locale === 'ar' ? 'leading-[1.4] tracking-normal' : ''}`}>
                {t.ctaTitle} <span className="font-serif italic font-normal text-[#b77c68]">{t.ctaAccent}</span>
              </h2>
              <p className="mt-4 max-w-xl text-xs leading-6 text-[#6e7971] sm:text-sm">{t.collectionsText}</p>
            </div>
            <a
              className="group inline-flex min-h-12 shrink-0 items-center gap-3 rounded-full bg-[#263b32] px-5 text-[10px] font-medium text-white shadow-[0_15px_35px_-18px_rgba(34,62,48,.55)] transition-all hover:-translate-y-0.5 hover:bg-[#b97561] sm:px-6 sm:text-xs"
              href={whatsAppUrl(market, t.contactGreeting)}
              rel="noreferrer"
              target="_blank"
            >
              {t.contactZexor}<ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function LogoMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-[1.15rem] border border-white/80 bg-linear-to-br from-[#f5ffff] via-[#e5f8f3] to-[#f1eaff] shadow-[0_14px_30px_-16px_rgba(93,150,154,.6)] ${compact ? 'h-9 w-9 rounded-xl' : 'h-12 w-12'}`}>
      <svg aria-hidden="true" className="relative z-10 h-[76%] w-[76%]" fill="none" viewBox="0 0 48 48">
        <path d="M12 14.5h24L12 33.5h24" stroke="#344F47" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5.5" />
        <path d="M35.5 11.5a17 17 0 0 1 3.7 5.2M12.1 36.5a17 17 0 0 1-3.4-5.1" stroke="#77CDB5" strokeLinecap="round" strokeWidth="2.5" />
        <circle cx="36" cy="12" r="3" fill="#A986E8" />
        <circle cx="12" cy="36" r="2.2" fill="#E6A68E" />
      </svg>
      <span aria-hidden="true" className="absolute -right-2 -top-3 h-8 w-8 rounded-full bg-white/75 blur-md" />
    </span>
  );
}

function MarketSwitch({
  market,
  onChange,
  locale,
  className = '',
}: {
  market: Market;
  onChange: (market: Market) => void;
  locale: Locale;
  className?: string;
}) {
  const t = TEXT[locale];
  const options: { id: Market; flag: string; label: string }[] = [
    { id: 'eg', flag: '🇪🇬', label: t.egypt },
    { id: 'ksa', flag: '🇸🇦', label: t.ksa },
  ];
  return (
    <div aria-label={t.availableIn} className={`inline-flex items-center gap-1 rounded-full border border-[#dce5e3] bg-white/80 p-1 shadow-[0_6px_20px_-16px_rgba(29,49,46,.35)] ${className}`} role="group">
      {options.map((option) => (
        <button
          aria-pressed={market === option.id}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[10px] transition-all ${
            market === option.id
              ? 'bg-[#182925] text-white shadow-md'
              : 'text-[#67736e] hover:text-[#253b34]'
          }`}
          key={option.id}
          onClick={() => onChange(option.id)}
          type="button"
        >
          <span>{option.flag}</span>
          {option.label}
        </button>
      ))}
    </div>
  );
}

function RegionFilter({
  locale,
  value,
  onChange,
}: {
  locale: Locale;
  value: MarketFilter;
  onChange: (value: MarketFilter) => void;
}) {
  const t = TEXT[locale];
  const options: { id: MarketFilter; label: string; flag: string }[] = [
    { id: 'all', label: t.all, flag: '✦' },
    { id: 'eg', label: t.egypt, flag: '🇪🇬' },
    { id: 'ksa', label: t.ksa, flag: '🇸🇦' },
  ];
  return (
    <div aria-label={t.availableIn} className="inline-flex flex-wrap items-center gap-1 rounded-full border border-[#dce5e3] bg-white/80 p-1 shadow-[0_6px_20px_-16px_rgba(29,49,46,.35)]" role="group">
      {options.map((option) => (
        <button
          aria-pressed={value === option.id}
          className={`inline-flex items-center gap-1 rounded-full px-3 py-2 text-[9px] transition-all ${
            value === option.id ? 'bg-[#182925] text-white shadow-md' : 'text-[#67736e] hover:text-[#253b34]'
          }`}
          key={option.id}
          onClick={() => onChange(option.id)}
          type="button"
        >
          <span>{option.flag}</span>{option.label}
        </button>
      ))}
    </div>
  );
}

function ProductCard({
  product,
  locale,
  onAdd,
  t,
}: {
  product: Product;
  locale: Locale;
  onAdd: (product: Product) => void;
  t: (typeof TEXT)[Locale];
}) {
  const Icon = ICONS[product.icon] ?? Sparkles;
  const visual = product.imageUrl ?? PRODUCT_IMAGES[product.id] ?? CATEGORY_IMAGES[product.category];
  return (
    <motion.article
      className="group relative overflow-hidden rounded-[1.8rem] border border-white/85 bg-[#fffefa] p-2 shadow-[0_22px_70px_-42px_rgba(40,55,45,.32)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_36px_85px_-42px_rgba(61,91,70,.4)]"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.4 }}
    >
      <TiltCard className="relative flex aspect-[1.12/1] items-center justify-center overflow-hidden rounded-[1.4rem] bg-[#e5e4dc]" intensity={7}>
        <img alt="" className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 ${product.category === 'services' ? 'saturate-[.78]' : ''}`} loading="lazy" src={visual} />
        <div aria-hidden="true" className={`absolute inset-0 ${product.category === 'fashion' ? 'bg-linear-to-t from-[#1d211d]/65 via-[#302c25]/5 to-[#1d211d]/15' : product.category === 'cards' ? 'bg-linear-to-br from-[#d7eee4]/55 via-transparent to-[#f1d9ce]/35' : 'bg-linear-to-t from-[#14241d]/80 via-[#14241d]/5 to-[#14241d]/15'}`} />
        {product.category === 'cards' && (
          <motion.div className="relative z-10 aspect-[1.58/1] w-[68%] max-w-72 overflow-hidden rounded-[1.1rem] border border-white/75 bg-linear-to-br from-[#e9f2e9]/95 via-[#f8f5eb]/95 to-[#e8d7ce]/95 p-4 shadow-[0_30px_65px_-25px_rgba(22,42,32,.6)] backdrop-blur-md transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-105 sm:rounded-[1.4rem] sm:p-5">
            <div className="absolute inset-2 rounded-[.8rem] border border-white/75 sm:inset-2.5 sm:rounded-2xl" />
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-start justify-between"><div><p className="text-[8px] font-bold tracking-[.3em] text-[#304338] sm:text-[10px]">ZEXOR</p><p className="mt-1 text-[6px] tracking-[.14em] text-[#718277]">{t.cardProductTag}</p></div><Radio className="h-4 w-4 text-[#668a73]" /></div>
              <div className="flex items-end justify-between"><Icon aria-hidden="true" className="h-6 w-6 text-[#658b75] sm:h-8 sm:w-8" strokeWidth={1.4} /><p className="text-end text-[8px] font-medium text-[#35473b] sm:text-xs">{product.name[locale]}</p></div>
            </div>
          </motion.div>
        )}
        {product.category === 'services' && (
          <div className="absolute inset-x-[9%] bottom-[10%] z-10 rounded-xl border border-white/60 bg-[#f9f8f2]/90 p-3 shadow-[0_20px_45px_-22px_rgba(10,25,18,.6)] backdrop-blur-xl transition-transform duration-500 group-hover:-translate-y-1 sm:rounded-2xl sm:p-4">
            <div className="flex items-center justify-between"><span className="text-[7px] font-bold tracking-[.2em] text-[#344a3c] sm:text-[9px]">ZEXOR / STUDIO</span><span className="flex gap-1"><i className="h-1.5 w-1.5 rounded-full bg-[#e7aa8f]" /><i className="h-1.5 w-1.5 rounded-full bg-[#c4d7b9]" /><i className="h-1.5 w-1.5 rounded-full bg-[#e7d6be]" /></span></div>
            <div className="mt-2 grid grid-cols-[1fr_.7fr] gap-2"><div className="space-y-1.5"><i className="block h-1.5 w-3/4 rounded-full bg-[#92baa0]" /><i className="block h-1 w-full rounded-full bg-[#dce4da]" /><i className="block h-1 w-4/5 rounded-full bg-[#dce4da]" /></div><div className="flex h-9 items-end gap-1 rounded-lg bg-linear-to-br from-[#e8eee4] to-[#f1ded4] p-1.5"><i className="h-1/2 flex-1 rounded-t bg-[#83ac91]" /><i className="h-4/5 flex-1 rounded-t bg-[#d49a84]" /><i className="h-2/3 flex-1 rounded-t bg-[#a1b9aa]" /></div></div>
          </div>
        )}
        <span className="absolute inset-s-3 top-3 z-20 rounded-full border border-white/65 bg-[#f8f7f0]/90 px-3 py-1.5 text-[7px] font-semibold tracking-[.12em] text-[#405448] shadow-sm backdrop-blur-lg sm:inset-s-4 sm:top-4 sm:text-[8px]">
          {product.category === 'fashion' ? t.egOnly : product.category === 'cards' ? t.cardProductTag : t.studioProductTag}
        </span>
        <span aria-hidden="true" className="absolute bottom-3 inset-s-3 z-20 flex items-center gap-1.5 rounded-full border border-white/55 bg-[#f8f7f0]/85 px-2.5 py-1.5 text-[7px] font-semibold tracking-[.11em] text-[#405448] backdrop-blur-lg sm:bottom-4 sm:inset-s-4"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#b87962]" />{product.category === 'fashion' ? t.apparelDropTag : product.category === 'cards' ? t.cardMarketLine : t.servicesProductTag}</span>
      </TiltCard>
      <div className="px-3.5 pb-4 pt-4 sm:px-4.5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-medium tracking-[-0.02em] text-[#263a33]">{product.name[locale]}</h3>
            <p className="mt-1.5 min-h-10 text-[11px] leading-5 text-[#74807a]">{product.description[locale]}</p>
          </div>
          <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${product.available ? 'bg-[#72c6aa]' : 'bg-[#d89f81]'}`} />
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#e9eeeb] pt-3.5">
          <div>
            <p className="text-[8px] uppercase tracking-[0.13em] text-[#98a19d]">{t.from}</p>
            <p className="mt-1 text-[11px] font-semibold text-[#344a42]">
              {product.markets.includes('eg') && <>{money(product.price.eg, 'eg', locale)}{product.markets.includes('ksa') && <span className="mx-1 text-[#b0b8b3]">/</span>}</>}
              {product.markets.includes('ksa') && money(product.price.ksa, 'ksa', locale)}
            </p>
          </div>
          <button
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-[#24372f] px-4 text-[10px] font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[#ad735f]"
            onClick={() => onAdd(product)}
            type="button"
          >
            <Plus aria-hidden="true" className="h-3.5 w-3.5" />
            {t.addToBag}
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function StatCard({ icon: Icon, label, value, detail }: { icon: LucideIcon; label: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-[#e8edeb] bg-white/85 p-4 shadow-[0_10px_30px_-24px_rgba(36,62,53,.3)] sm:p-5">
      <div className="flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e5f4ed] text-[#427866]">
          <Icon aria-hidden="true" className="h-4 w-4" />
        </span>
        <span className="text-[8px] font-medium text-[#9aa59f]">{detail}</span>
      </div>
      <p className="mt-4 text-[10px] text-[#839089]">{label}</p>
      <p className="mt-1 text-2xl font-medium tracking-tight text-[#273a33]">{value}</p>
    </div>
  );
}

function CheckoutDialog({
  open,
  onClose,
  products,
  cart,
  locale,
  market,
  onMarketChange,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  products: Product[];
  cart: CartLine[];
  locale: Locale;
  market: Market;
  onMarketChange: (market: Market) => void;
  onSubmit: (details: { customer: string; phone: string; city: string; market: Market }) => void;
}) {
  const t = TEXT[locale];
  const [customer, setCustomer] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, open]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!customer.trim() || !phone.trim() || !city.trim()) {
      setError(t.orderErrors);
      return;
    }
    onSubmit({ customer: customer.trim(), phone: phone.trim(), city: city.trim(), market });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-95 flex items-center justify-center bg-[#25332e]/30 p-4 backdrop-blur-md"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            aria-labelledby="checkout-heading"
            aria-modal="true"
            className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-4xl border border-white/80 bg-[#fbfcf9] p-6 shadow-[0_40px_120px_-35px_rgba(34,58,49,.35)] sm:p-8"
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            role="dialog"
            transition={{ duration: 0.22 }}
          >
            <button aria-label={t.close} className="absolute inset-e-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-[#e5ebe7] text-[#62736a] hover:bg-white" onClick={onClose} type="button">
              <X className="h-4 w-4" />
            </button>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#84a99b]">{t.concierge}</p>
            <h2 className="mt-3 text-2xl font-medium tracking-tight text-[#293c34]" id="checkout-heading">{t.checkoutTitle}</h2>
            <p className="mt-2 text-xs leading-5 text-[#79867f]">{t.checkoutWhatsAppNote}</p>

            <div className="mt-5 space-y-2 rounded-2xl bg-[#f2f6f3] p-4">
              {cart.map((line) => {
                const product = products.find((item) => item.id === line.productId);
                if (!product) return null;
                return (
                  <div className="flex justify-between gap-3 text-[10px] text-[#526259]" key={line.productId}>
                    <span>{line.quantity} × {product.name[locale]}</span>
                    <span>{money(product.price[market], market, locale)}</span>
                  </div>
                );
              })}
            </div>

            <form className="mt-5 space-y-3" onSubmit={submit}>
              <label className="block">
                <span className="mb-1.5 block text-[10px] text-[#627168]">{t.customerName}</span>
                <input autoComplete="name" className="w-full rounded-xl border border-[#e1e8e3] bg-white px-3.5 py-3 text-xs text-[#263a33] outline-none transition focus:border-[#9bcbb5] focus:ring-2 focus:ring-[#cceade]/60" onChange={(event) => setCustomer(event.target.value)} required value={customer} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[10px] text-[#627168]">{t.customerPhone}</span>
                <input autoComplete="tel" className="w-full rounded-xl border border-[#e1e8e3] bg-white px-3.5 py-3 text-xs text-[#263a33] outline-none transition focus:border-[#9bcbb5] focus:ring-2 focus:ring-[#cceade]/60" onChange={(event) => setPhone(event.target.value)} required type="tel" value={phone} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[10px] text-[#627168]">{t.customerCity}</span>
                <input autoComplete="address-level2" className="w-full rounded-xl border border-[#e1e8e3] bg-white px-3.5 py-3 text-xs text-[#263a33] outline-none transition focus:border-[#9bcbb5] focus:ring-2 focus:ring-[#cceade]/60" onChange={(event) => setCity(event.target.value)} required value={city} />
              </label>
              <div>
                <span className="mb-1.5 block text-[10px] text-[#627168]">{t.selectRegion}</span>
                <MarketSwitch locale={locale} market={market} onChange={onMarketChange} />
              </div>
              {error && <p className="text-[10px] text-[#b5544b]" role="alert">{error}</p>}
              <div className="flex items-center justify-between border-t border-[#e7ece8] pt-4 text-xs">
                <span className="text-[#76837b]">{t.shippingAt}</span>
                <span className="font-semibold text-[#30463c]">
                  {money(
                    cart.reduce((sum, line) => sum + (products.find((item) => item.id === line.productId)?.price[market] ?? 0) * line.quantity, 0),
                    market,
                    locale,
                  )}
                </span>
              </div>
              <button className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#314f43] px-5 text-xs font-medium text-white shadow-[0_12px_25px_-15px_rgba(43,78,62,.6)] transition-all hover:-translate-y-0.5 hover:bg-[#416856]" type="submit">
                <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                {t.sendOrder}
              </button>
            </form>
            <p className="mt-3 text-center text-[9px] leading-4 text-[#94a098]">{t.checkoutNote}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  const [locale, setLocale] = useState<Locale>(() => {
    try {
      return window.localStorage.getItem(STORAGE.locale) === 'ar' ? 'ar' : 'en';
    } catch {
      return 'en';
    }
  });
  const [products, setProducts] = useStoredState<Product[]>(STORAGE.products, INITIAL_PRODUCTS, migrateProductCopy);
  const [cart, setCart] = useStoredState<CartLine[]>(STORAGE.cart, []);
  const [orders, setOrders] = useStoredState<CustomerOrder[]>(STORAGE.orders, []);
  const [route, setRoute] = useState<Route>(pageFromHash);
  const [market, setMarket] = useState<Market>('eg');
  const [marketFilter, setMarketFilter] = useState<MarketFilter>('all');
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [configFinish, setConfigFinish] = useState('pearl');
  const [toast, setToast] = useState('');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productNameEn, setProductNameEn] = useState('');
  const [productNameAr, setProductNameAr] = useState('');
  const [productDescriptionEn, setProductDescriptionEn] = useState('');
  const [productDescriptionAr, setProductDescriptionAr] = useState('');
  const [productImageUrl, setProductImageUrl] = useState('');
  const [productFormError, setProductFormError] = useState('');
  const [productPriceEg, setProductPriceEg] = useState('');
  const [productPriceKsa, setProductPriceKsa] = useState('');
  const [productCategory, setProductCategory] = useState<ProductCategory>('cards');
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');
  const [clock, setClock] = useState(() => new Date());
  const t = TEXT[locale];
  const isArabic = locale === 'ar';
  const dir = isArabic ? 'rtl' : 'ltr';

  const navigate = useCallback((next: Route) => {
    const target = `#${next}`;
    if (window.location.hash !== target) window.history.pushState({ route: next }, '', target);
    setRoute(next);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const sync = () => {
      const hash = pageFromHash();
      setRoute(hash);
      setMenuOpen(false);
    };
    window.addEventListener('popstate', sync);
    window.addEventListener('hashchange', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('hashchange', sync);
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    try {
      window.localStorage.setItem(STORAGE.locale, locale);
    } catch {
      // The language switch remains functional for this session without persistent storage.
    }
  }, [dir, locale]);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const cartProducts = useMemo(
    () =>
      cart
        .map((line) => ({ line, product: products.find((product) => product.id === line.productId) }))
        .filter((item): item is { line: CartLine; product: Product } => Boolean(item.product)),
    [cart, products],
  );
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartProducts.reduce((sum, item) => sum + item.product.price[market] * item.line.quantity, 0);
  const displayProducts = products.filter(
    (product) =>
      product.category === route &&
      product.available &&
      (marketFilter === 'all' || product.markets.includes(marketFilter)),
  );
  const dashboardOrders = marketFilter === 'all'
    ? orders
    : orders.filter((order) => order.market === marketFilter);
  const dashboardOpenOrders = dashboardOrders.filter((order) => order.status !== 'complete').length;
  const dashboardProducts = products.filter((product) =>
    product.available && (marketFilter === 'all' || product.markets.includes(marketFilter)),
  );
  const revenueByMarket = (target: Market) =>
    orders.filter((order) => order.market === target && order.status === 'complete').reduce((sum, order) => sum + order.total, 0);
  const totalRevenue = marketFilter === 'all'
    ? `${money(revenueByMarket('eg'), 'eg', locale)} / ${money(revenueByMarket('ksa'), 'ksa', locale)}`
    : money(revenueByMarket(marketFilter), marketFilter, locale);
  const visibleOrders = orders.filter((order) => marketFilter === 'all' || order.market === marketFilter);
  const clockLabel = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(clock);

  const addToCart = (product: Product) => {
    setCart((current) => {
      const existing = current.find((line) => line.productId === product.id);
      if (existing) {
        return current.map((line) => line.productId === product.id ? { ...line, quantity: line.quantity + 1 } : line);
      }
      return [...current, { productId: product.id, quantity: 1 }];
    });
    setToast(`${product.name[locale]} · ${t.addedToBag}`);
  };

  const changeQuantity = (productId: string, change: number) => {
    setCart((current) =>
      current
        .map((line) => line.productId === productId ? { ...line, quantity: line.quantity + change } : line)
        .filter((line) => line.quantity > 0),
    );
  };

  const submitCheckout = (details: { customer: string; phone: string; city: string; market: Market }) => {
    const lines = cartProducts.map(({ product, line }) => ({
      productId: product.id,
      name: product.name[locale],
      quantity: line.quantity,
      egp: product.price.eg,
      sar: product.price.ksa,
    }));
    const total = cartProducts.reduce(
      (sum, { product, line }) => sum + product.price[details.market] * line.quantity,
      0,
    );
    const order: CustomerOrder = {
      id: `ZX-${Date.now().toString().slice(-7)}`,
      createdAt: new Date().toISOString(),
      customer: details.customer,
      phone: details.phone,
      city: details.city,
      market: details.market,
      items: lines,
      status: 'new',
      total,
    };
    setOrders((current) => [order, ...current]);

    const orderLines = lines.map((line) => `• ${line.quantity} × ${line.name}`).join('\n');
    const message = [
      t.whatsappGreeting,
      `${t.whatsappOrder}: ${order.id}`,
      `${t.whatsappName}: ${details.customer}`,
      `${t.whatsappPhone}: ${details.phone}`,
      `${t.whatsappCity}: ${details.city}`,
      `${t.whatsappRegion}: ${details.market === 'eg' ? t.egypt : t.ksa}`,
      `${t.whatsappItems}:`,
      orderLines,
      `${t.whatsappTotal}: ${money(total, details.market, locale)}`,
    ].join('\n');
    setCart([]);
    setCheckoutOpen(false);
    setCartOpen(false);
    setToast(t.orderCreatedToast);
    window.open(whatsAppUrl(details.market, message), '_blank', 'noopener,noreferrer');
  };

  const addAdminProduct = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nameEn = productNameEn.trim();
    const nameAr = productNameAr.trim();
    const descriptionEn = productDescriptionEn.trim();
    const descriptionAr = productDescriptionAr.trim();
    const egPrice = Number(productPriceEg);
    const ksaPrice = productCategory === 'fashion' ? 0 : Number(productPriceKsa);
    const imageUrl = productImageUrl.trim();
    setProductFormError('');
    if (!nameEn || !nameAr || !descriptionEn || !descriptionAr || !Number.isFinite(egPrice) || !Number.isFinite(ksaPrice) || egPrice < 0 || ksaPrice < 0) {
      setProductFormError(t.invalidProductFields);
      return;
    }
    if (imageUrl) {
      try {
        const parsed = new URL(imageUrl);
        if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') throw new Error('Unsupported image URL protocol');
      } catch {
        setProductFormError(t.invalidImageUrl);
        return;
      }
    }
    const existingProduct = editingProductId ? products.find((product) => product.id === editingProductId) : undefined;
    const product: Product = {
      id: existingProduct?.id ?? `custom-${Date.now()}`,
      category: productCategory,
      markets: productCategory === 'fashion' ? ['eg'] : ['eg', 'ksa'],
      name: { en: nameEn, ar: nameAr },
      description: { en: descriptionEn, ar: descriptionAr },
      price: { eg: egPrice, ksa: ksaPrice },
      icon: existingProduct?.icon ?? (productCategory === 'cards' ? 'credit' : productCategory === 'fashion' ? 'shirt' : 'code'),
      finish: existingProduct?.finish ?? 'mint',
      available: existingProduct?.available ?? true,
      ...(imageUrl ? { imageUrl } : {}),
    };
    setProducts((current) => existingProduct
      ? current.map((item) => item.id === existingProduct.id ? product : item)
      : [product, ...current]);
    setProductNameEn('');
    setProductNameAr('');
    setProductDescriptionEn('');
    setProductDescriptionAr('');
    setProductImageUrl('');
    setProductPriceEg('');
    setProductPriceKsa('');
    setEditingProductId(null);
    setShowProductForm(false);
    setProductFormError('');
    setToast(existingProduct ? t.productUpdated : t.productSaved);
  };

  const startProductEdit = (product: Product) => {
    setEditingProductId(product.id);
    setProductNameEn(product.name.en);
    setProductNameAr(product.name.ar);
    setProductDescriptionEn(product.description.en);
    setProductDescriptionAr(product.description.ar);
    setProductImageUrl(product.imageUrl ?? '');
    setProductPriceEg(String(product.price.eg));
    setProductPriceKsa(String(product.price.ksa));
    setProductCategory(product.category);
    setProductFormError('');
    setShowProductForm(true);
  };

  const handleAdminLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (adminPassword !== ADMIN_PASSWORD) {
      setAdminLoginError(t.invalidPassword);
      setAdminPassword('');
      return;
    }
    setAdminAuthenticated(true);
    setAdminLoginError('');
    setAdminPassword('');
  };

  const lockAdmin = () => {
    setAdminAuthenticated(false);
    setAdminPassword('');
    setAdminLoginError('');
    navigate('home');
  };

  const updateOrderStatus = (orderId: string) => {
    setOrders((current) =>
      current.map((order) => {
        if (order.id !== orderId) return order;
        const nextStatus = order.status === 'new' ? 'confirmed' : order.status === 'confirmed' ? 'complete' : 'complete';
        return { ...order, status: nextStatus };
      }),
    );
  };

  const removeOrder = (orderId: string) => {
    setOrders((current) => current.filter((order) => order.id !== orderId));
  };

  const pageLinks: Route[] = ['home', 'cards', 'fashion', 'services'];

  const productGrid = (items: Product[]) => (
    items.length > 0 ? (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((product) => (
          <ProductCard key={product.id} locale={locale} onAdd={addToCart} product={product} t={t} />
        ))}
      </div>
    ) : (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-[1.8rem] border border-[#e6ece8] bg-white/70 px-6 py-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7e9e2] text-[#a87761]">
          <CircleHelp className="h-5 w-5" />
        </span>
        <h3 className="mt-4 text-base font-medium text-[#34483f]">{t.noProducts}</h3>
        <p className="mt-2 max-w-sm text-xs leading-5 text-[#7b8981]">{t.noProductsText}</p>
        {route === 'fashion' && marketFilter === 'ksa' && (
          <button className="mt-5 rounded-full bg-[#314f43] px-4 py-2.5 text-[10px] font-medium text-white" onClick={() => setMarketFilter('eg')} type="button">
            {t.switchEgypt}
          </button>
        )}
      </div>
    )
  );

  const homePage = <HomeExperience locale={locale} market={market} navigate={navigate} onMarketChange={setMarket} t={t} />;

  const marketControl = (
    <div className="flex flex-col items-start gap-2">
      <p className="text-[8px] font-semibold uppercase tracking-[.16em] text-[#99a59e]">{t.availableIn}</p>
      <RegionFilter locale={locale} value={marketFilter} onChange={setMarketFilter} />
    </div>
  );

  const productRoutePage = (category: ProductCategory) => {
    const isCards = category === 'cards';
    const isFashion = category === 'fashion';
    const isServices = category === 'services';
    const header = isCards
      ? { overline: t.cardsOverline, title: t.cardsTitle, description: t.cardsText, icon: CreditCard }
      : isFashion
        ? { overline: t.fashionOverline, title: t.fashionTitle, description: t.fashionText, icon: Shirt }
        : { overline: t.servicesOverline, title: t.servicesTitle, description: t.servicesText, icon: Code2 };
    const Icon = header.icon;
    const categoryProducts = displayProducts;
    return (
      <motion.div animate={{ opacity: 1, y: 0 }} className="mx-auto min-h-[72vh] max-w-7xl px-5 pb-28 pt-12 sm:px-8 sm:pt-16" initial={{ opacity: 0, y: 12 }} transition={{ duration: 0.38 }}>
        <div className={`relative mb-9 overflow-hidden rounded-4xl border border-white/90 px-6 py-9 shadow-[0_30px_85px_-45px_rgba(69,102,90,.31)] sm:mb-12 sm:px-10 sm:py-12 ${isCards ? 'bg-linear-to-br from-[#c8f2e8] via-[#f9f9f4] to-[#e9d9f5]' : isFashion ? 'bg-linear-to-br from-[#f5d9ce] via-[#fbf6ef] to-[#efdcf7]' : 'bg-linear-to-br from-[#d9eaf5] via-[#fbfaf5] to-[#d9f1e4]'}`}>
          <div aria-hidden="true" className="absolute inset-0 opacity-35 bg-[linear-gradient(rgba(78,119,106,.2)_1px,transparent_1px),linear-gradient(90deg,rgba(78,119,106,.2)_1px,transparent_1px)] bg-size-[34px_34px] mask-[linear-gradient(90deg,black,transparent)]" />
          <div className="absolute -inset-e-20 -top-32 h-72 w-72 rounded-full bg-white/75 blur-[70px]" />
          <div aria-hidden="true" className="absolute -bottom-32 inset-e-[25%] h-72 w-72 rounded-full bg-[#b8e8d9]/65 blur-[85px]" />
          <div aria-hidden="true" className="absolute inset-e-[8%] top-[8%] hidden h-52 w-52 rounded-full border border-white/70 shadow-[inset_0_0_40px_rgba(255,255,255,.75)] sm:block" />
          <div aria-hidden="true" className="absolute inset-e-[11%] top-[12%] hidden h-40 w-40 rounded-full border border-dashed border-white/80 sm:block" />
          <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="mb-3 inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[.2em] text-[#759586]"><Icon className="h-3.5 w-3.5" />{header.overline}</p>
              <h1 className={`text-3xl font-medium leading-tight tracking-[-.045em] text-[#2e4138] sm:text-5xl ${isArabic ? 'tracking-normal leading-[1.4]' : ''}`}>
                {isCards ? <>{t.cardsSubtitle}</> : isFashion ? <>{t.fashionSubtitle}</> : <>{t.servicesTitle} <span className="bg-linear-to-r from-[#619c91] to-[#a88197] bg-clip-text text-transparent">{t.servicesAccent}</span></>}
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-[#75837b]">{header.description}</p>
            </div>
            {marketControl}
          </div>
        </div>

        {isCards && (
          <section className="mb-10 grid items-center gap-8 rounded-4xl border border-white bg-white/75 p-5 shadow-[0_20px_60px_-48px_rgba(34,63,50,.3)] sm:p-8 lg:grid-cols-[.9fr_1.1fr]">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[.19em] text-[#86a896]">{t.configTitle}</p>
              <h2 className={`mt-2 text-2xl font-medium text-[#34473e] sm:text-3xl ${isArabic ? '' : 'tracking-tight'}`}>{t.configHint}</h2>
              <div className="mt-6 flex flex-wrap gap-2">
                {(['pearl', 'mint', 'rose', 'lilac'] as const).map((finish) => {
                  const finishName = finish === 'pearl' ? t.finishPearl : finish === 'mint' ? t.finishMint : finish === 'rose' ? t.finishRose : t.finishLilac;
                  return (
                    <button
                      aria-pressed={configFinish === finish}
                      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[10px] transition-all ${configFinish === finish ? 'border-[#7bad98] bg-[#ecf6ef] text-[#365a4b]' : 'border-[#e6ece7] bg-white text-[#7b8981] hover:border-[#bdcec4]'}`}
                      key={finish}
                      onClick={() => setConfigFinish(finish)}
                      type="button"
                    >
                      <span className={`h-3.5 w-3.5 rounded-full border border-black/5 ${finish === 'pearl' ? 'bg-linear-to-br from-[#d6f4f1] to-[#efd9d0]' : finish === 'mint' ? 'bg-[#bdeede]' : finish === 'rose' ? 'bg-[#efd0be]' : 'bg-[#ddd1f4]'}`} />
                      {finishName}
                    </button>
                  );
                })}
              </div>
              <div className="mt-7 flex items-center gap-2 text-[10px] text-[#76867d]"><ShieldCheck className="h-4 w-4 text-[#75a58d]" />{t.checkoutNote}</div>
            </div>
            <TiltCard className="relative mx-auto w-full max-w-112.5" intensity={10}>
              <div className={`relative aspect-[1.62/1] overflow-hidden rounded-[1.65rem] border border-white bg-linear-to-br p-6 shadow-[0_28px_65px_-35px_rgba(70,111,92,.38)] sm:p-8 ${configFinish === 'pearl' ? 'from-[#d6f4f1] via-[#faf8f4] to-[#efd9d0]' : configFinish === 'mint' ? 'from-[#bdeede] via-[#ecf9f2] to-[#d7f0e5]' : configFinish === 'rose' ? 'from-[#ffe4d7] via-[#f8eee7] to-[#e7c5b5]' : 'from-[#e7ddff] via-[#f8f4ff] to-[#d6e9f5]'}`}>
                <div className="absolute inset-3 rounded-[1.35rem] border border-white/75" />
                <div className="absolute -inset-e-14 -top-16 h-48 w-48 rounded-full bg-white/70 blur-[45px]" />
                <div className="relative flex h-full flex-col justify-between">
                  <div className="flex justify-between"><div><p className="text-[10px] font-semibold tracking-[.3em] text-[#3f594d]">ZEXOR</p><p className="mt-1 text-[7px] tracking-[.2em] text-[#81968a]">{t.cardLabel}</p></div><Radio className="h-4 w-4 text-[#719785]" /></div>
                  <div className="flex items-center justify-between"><span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/80 bg-white/45 text-[#6b9e88] shadow-sm"><Fingerprint className="h-8 w-8" /></span><p className="text-end text-lg font-medium text-[#3f584c]">{t.configPreview}</p></div>
                  <div className="flex justify-between border-t border-white/70 pt-3 text-[8px] tracking-[.13em] text-[#72877a]"><span>{t.cardMarketLine}</span><span>{t.nfcReady}</span></div>
                </div>
              </div>
            </TiltCard>
          </section>
        )}

        {isFashion && marketFilter === 'ksa' ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-[1.8rem] border border-[#e6ece8] bg-white/70 px-6 py-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7e9e2] text-[#a87761]"><Sparkles className="h-5 w-5" /></span>
            <h2 className="mt-4 text-lg font-medium text-[#34483f]">{t.ksaFashionTitle}</h2>
            <p className="mt-2 max-w-sm text-xs leading-5 text-[#7b8981]">{t.ksaFashionText}</p>
            <button className="mt-5 rounded-full bg-[#314f43] px-4 py-2.5 text-[10px] font-medium text-white" onClick={() => setMarketFilter('all')} type="button">{t.all}</button>
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div><p className="text-[9px] font-semibold uppercase tracking-[.18em] text-[#95a39b]">{t.products}</p><h2 className="mt-1 text-lg font-medium text-[#34483f]">{isCards ? t.cardsSubtitle : isFashion ? t.fashionSubtitle : t.servicesCatalogTitle}</h2></div>
              <p className="text-[9px] text-[#9aa69f]">{categoryProducts.length} {t.count}</p>
            </div>
            {productGrid(categoryProducts)}
          </>
        )}

        {isServices && (
          <div className="mt-10">
            <div className="grid gap-3 sm:grid-cols-3">
              {t.servicesFeatures.map((feature, index) => (
                <div className="flex items-center gap-3 rounded-2xl border border-white bg-white/75 p-4 text-[11px] text-[#5f7167] shadow-sm" key={feature}>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#e8f4ed] text-[#67907a]">{index === 0 ? <Sparkles className="h-4 w-4" /> : index === 1 ? <ScanLine className="h-4 w-4" /> : <Zap className="h-4 w-4" />}</span>
                  {feature}
                </div>
              ))}
            </div>
            <a
              className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#243f35] px-6 text-xs font-medium text-white shadow-[0_15px_35px_-18px_rgba(36,73,55,.55)] transition-all hover:-translate-y-0.5 hover:bg-[#3d6852]"
              href={whatsAppUrl(market, locale === 'ar' ? 'مرحباً ZEXOR، أرغب في مناقشة مشروع رقمي.' : 'Hello ZEXOR, I would like to discuss a digital project.')}
              rel="noreferrer"
              target="_blank"
            >
              {t.servicesCta}<ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        )}
      </motion.div>
    );
  };

  const dashboardPage = (
    <motion.div animate={{ opacity: 1, y: 0 }} className="mx-auto min-h-[72vh] max-w-7xl px-5 pb-28 pt-12 sm:px-8 sm:pt-16" initial={{ opacity: 0, y: 12 }} transition={{ duration: 0.38 }}>
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-3 inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[.2em] text-[#7a9f8c]"><BarChart3 className="h-3.5 w-3.5" />{t.dashboardEyebrow}</p>
          <h1 className={`text-3xl font-medium tracking-[-.045em] text-[#2f4239] sm:text-5xl ${isArabic ? 'tracking-normal' : ''}`}>{t.dashboardTitle} <span className="bg-linear-to-r from-[#65a79b] to-[#ba8b7a] bg-clip-text text-transparent">{t.dashboardAccent}</span></h1>
          <p className="mt-3 max-w-2xl text-sm text-[#77847d]">{t.dashboardIntro}</p>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#dfebe3] bg-white/85 px-3.5 py-2.5 text-[8px] font-medium tracking-widest text-[#658273]">
              <LockKeyholeIcon />{t.localData}
            </span>
            <button className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[#e4eae5] bg-white/75 px-3 text-[9px] text-[#718178] transition-colors hover:border-[#d8b8b4] hover:text-[#a2655b]" onClick={lockAdmin} type="button"><LogOut className="h-3.5 w-3.5" />{t.adminLogout}</button>
          </div>
          <RegionFilter locale={locale} onChange={setMarketFilter} value={marketFilter} />
        </div>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard detail={`${dashboardOrders.length} ${t.ordersTitle.toLowerCase()}`} icon={ShoppingBag} label={t.totalOrders} value={`${dashboardOrders.length}`} />
        <StatCard detail={t.statusNew} icon={Clock3} label={t.openOrders} value={`${dashboardOpenOrders}`} />
        <StatCard detail={marketFilter === 'all' ? '🇪🇬 / 🇸🇦' : marketFilter === 'eg' ? (isArabic ? 'مصر' : 'EGYPT') : (isArabic ? 'السعودية' : 'SAUDI ARABIA')} icon={Layers3} label={t.productCount} value={`${dashboardProducts.length}`} />
        <StatCard detail={marketFilter === 'all' ? 'EGP / SAR' : marketFilter === 'eg' ? 'EGP' : 'SAR'} icon={TrendingUp} label={t.totalRevenue} value={totalRevenue} />
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-[.75fr_1.25fr]">
        <section className="rounded-[1.6rem] border border-[#e8edeb] bg-white/80 p-5 shadow-[0_16px_45px_-35px_rgba(31,57,45,.25)]">
          <div className="flex items-center justify-between"><div><p className="text-[9px] uppercase tracking-[.16em] text-[#91a098]">{t.regionalOverview}</p><h2 className="mt-1 text-sm font-medium text-[#3a4f44]">{t.totalRevenue}</h2></div><Globe2 className="h-4 w-4 text-[#8aab98]" /></div>
          <div className="mt-6 space-y-5">
            {(['eg', 'ksa'] as const).map((region) => {
              const regionVisible = marketFilter === 'all' || marketFilter === region;
              const regionRevenue = regionVisible ? revenueByMarket(region) : 0;
              const regionOrders = regionVisible ? orders.filter((order) => order.market === region).length : 0;
              const maxValue = Math.max(...orders.map((order) => order.total), 1);
              const percent = Math.min(100, Math.round((regionRevenue / maxValue) * 100));
              return (
                <div key={region}>
                  <div className="mb-2 flex items-center justify-between text-[10px]"><span className="text-[#52645a]">{region === 'eg' ? '🇪🇬' : '🇸🇦'} {region === 'eg' ? t.egypt : t.ksa}</span><span className="text-[#8c9991]">{regionOrders} · {money(regionRevenue, region, locale)}</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#edf2ee]"><motion.div animate={{ width: `${percent}%` }} className={`h-full rounded-full ${region === 'eg' ? 'bg-linear-to-r from-[#9bd9c6] to-[#559f83]' : 'bg-linear-to-r from-[#e8c7b7] to-[#bd8a77]'}`} initial={{ width: 0 }} transition={{ duration: 0.7 }} /></div>
                </div>
              );
            })}
          </div>
          <div className="mt-7 flex items-center gap-2 border-t border-[#edf0ed] pt-4 text-[9px] text-[#98a39c]"><Clock3 className="h-3.5 w-3.5" />{clockLabel}</div>
        </section>

        <section className="overflow-hidden rounded-[1.6rem] border border-[#e8edeb] bg-white/80 shadow-[0_16px_45px_-35px_rgba(31,57,45,.25)]">
          <div className="flex items-center justify-between border-b border-[#edf0ed] px-5 py-4"><div><p className="text-[9px] uppercase tracking-[.16em] text-[#91a098]">{t.flowTag}</p><h2 className="mt-1 text-sm font-medium text-[#3a4f44]">{t.ordersTitle}</h2></div><span className="rounded-full bg-[#e9f4ed] px-3 py-1.5 text-[8px] text-[#608675]">{dashboardOrders.length} {t.count}</span></div>
          {dashboardOrders.length === 0 ? (
            <div className="flex min-h-52 flex-col items-center justify-center px-6 text-center"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf5f0] text-[#709480]"><PackageCheck className="h-5 w-5" /></span><p className="mt-4 text-sm font-medium text-[#53665c]">{t.noOrders}</p><p className="mt-2 max-w-xs text-[10px] leading-5 text-[#909c94]">{t.noOrdersText}</p></div>
          ) : (
            <div className="max-h-85 divide-y divide-[#edf0ed] overflow-y-auto">
              {dashboardOrders.slice(0, 6).map((order) => (
                <div className="flex items-center justify-between gap-3 px-5 py-3.5" key={order.id}>
                  <div className="min-w-0"><p className="truncate text-[10px] font-medium text-[#46594f]">{order.id} · {order.customer}</p><p className="mt-1 truncate text-[8px] text-[#97a29b]">{order.market === 'eg' ? '🇪🇬' : '🇸🇦'} {order.city} · {money(order.total, order.market, locale)}</p></div>
                  <StatusPill locale={locale} status={order.status} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="overflow-hidden rounded-[1.6rem] border border-[#e8edeb] bg-white/85 shadow-[0_16px_45px_-35px_rgba(31,57,45,.25)]">
        <div className="flex flex-col justify-between gap-3 border-b border-[#edf0ed] px-5 py-4 sm:flex-row sm:items-center">
          <div><p className="text-[9px] uppercase tracking-[.16em] text-[#91a098]">{t.collectionTag}</p><h2 className="mt-1 text-sm font-medium text-[#3a4f44]">{t.catalogManage}</h2></div>
          <button className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full bg-[#314f43] px-4 text-[10px] font-medium text-white transition-colors hover:bg-[#426a58]" onClick={() => setShowProductForm((current) => !current)} type="button">
            {showProductForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}{editingProductId ? t.editProduct : t.addProduct}
          </button>
        </div>
        {showProductForm && (
          <form className="grid gap-3 border-b border-[#edf0ed] bg-[#f8faf8] p-5 sm:grid-cols-2 lg:grid-cols-3" onSubmit={addAdminProduct}>
            <input aria-label={t.productNameEn} className="rounded-xl border border-[#e1e8e3] bg-white px-3 py-2.5 text-[10px] text-[#34483f] outline-none focus:border-[#9bcbb5]" onChange={(event) => setProductNameEn(event.target.value)} placeholder={t.productNameEn} required value={productNameEn} />
            <input aria-label={t.productNameAr} className="rounded-xl border border-[#e1e8e3] bg-white px-3 py-2.5 text-[10px] text-[#34483f] outline-none focus:border-[#9bcbb5]" dir="rtl" onChange={(event) => setProductNameAr(event.target.value)} placeholder={t.productNameAr} required value={productNameAr} />
            <input aria-label={t.productDescriptionEn} className="rounded-xl border border-[#e1e8e3] bg-white px-3 py-2.5 text-[10px] text-[#34483f] outline-none focus:border-[#9bcbb5]" onChange={(event) => setProductDescriptionEn(event.target.value)} placeholder={t.productDescriptionEn} required value={productDescriptionEn} />
            <input aria-label={t.productDescriptionAr} className="rounded-xl border border-[#e1e8e3] bg-white px-3 py-2.5 text-[10px] text-[#34483f] outline-none focus:border-[#9bcbb5]" dir="rtl" onChange={(event) => setProductDescriptionAr(event.target.value)} placeholder={t.productDescriptionAr} required value={productDescriptionAr} />
            <select aria-label={t.productCategory} className="rounded-xl border border-[#e1e8e3] bg-white px-3 py-2.5 text-[10px] text-[#34483f] outline-none focus:border-[#9bcbb5]" onChange={(event) => setProductCategory(event.target.value as ProductCategory)} value={productCategory}>
              <option value="cards">{t.nav.cards}</option><option value="fashion">{t.nav.fashion}</option><option value="services">{t.nav.services}</option>
            </select>
            <input aria-label={t.priceEG} className="rounded-xl border border-[#e1e8e3] bg-white px-3 py-2.5 text-[10px] text-[#34483f] outline-none focus:border-[#9bcbb5]" min="0" onChange={(event) => setProductPriceEg(event.target.value)} placeholder={t.priceEG} required type="number" value={productPriceEg} />
            <input aria-label={t.priceKSA} className="rounded-xl border border-[#e1e8e3] bg-white px-3 py-2.5 text-[10px] text-[#34483f] outline-none focus:border-[#9bcbb5] disabled:bg-[#f1f4f1]" disabled={productCategory === 'fashion'} min="0" onChange={(event) => setProductPriceKsa(event.target.value)} placeholder={t.priceKSA} required={productCategory !== 'fashion'} type="number" value={productCategory === 'fashion' ? '0' : productPriceKsa} />
            <input aria-label={t.productImageUrl} className="rounded-xl border border-[#e1e8e3] bg-white px-3 py-2.5 text-[10px] text-[#34483f] outline-none focus:border-[#9bcbb5] lg:col-span-2" onChange={(event) => setProductImageUrl(event.target.value)} placeholder={t.productImageUrl} type="url" value={productImageUrl} />
            {productImageUrl && <div className="flex items-center gap-2 text-[9px] text-[#74867b]"><img alt={t.imagePreview} className="h-10 w-10 rounded-lg border border-white object-cover shadow-sm" src={productImageUrl} />{t.imagePreview}</div>}
            {productFormError && <p className="text-[10px] text-[#b5544b] sm:col-span-2 lg:col-span-3" role="alert">{productFormError}</p>}
            <div className="flex gap-2 sm:col-span-2 lg:col-span-3">
              <button className="rounded-xl bg-[#d9eee3] px-4 py-2.5 text-[10px] font-medium text-[#426855] hover:bg-[#c9e6d6]" type="submit">{editingProductId ? t.updateProduct : t.saveProduct}</button>
              {editingProductId && <button className="rounded-xl border border-[#e1e8e3] bg-white px-4 py-2.5 text-[10px] text-[#6e7c73]" onClick={() => { setShowProductForm(false); setEditingProductId(null); setProductFormError(''); }} type="button">{t.cancel}</button>}
            </div>
          </form>
        )}
        <div className="divide-y divide-[#edf0ed]">
          {products.map((product) => {
            const Icon = ICONS[product.icon] ?? Sparkles;
            return (
              <div className="flex items-center gap-3 px-4 py-3.5 sm:px-5" key={product.id}>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#edf5f0] text-[#719681]">{product.imageUrl ? <img alt="" className="h-full w-full object-cover" src={product.imageUrl} /> : <Icon className="h-4 w-4" />}</span>
                <div className="min-w-0 flex-1"><p className="truncate text-[10px] font-medium text-[#43574c]">{product.name[locale]}</p><p className="mt-1 text-[8px] text-[#9aa49e]">{t.nav[product.category]} · {product.markets.map((region) => region === 'eg' ? '🇪🇬' : '🇸🇦').join(' ')}</p></div>
                <p className="hidden text-[9px] text-[#718178] sm:block">{money(product.price.eg, 'eg', locale)}{product.markets.includes('ksa') && ` / ${money(product.price.ksa, 'ksa', locale)}`}</p>
                <button aria-label={`${t.editProduct}: ${product.name[locale]}`} className="flex h-8 w-8 items-center justify-center rounded-full text-[#718c7c] transition-colors hover:bg-[#edf5f0]" onClick={() => startProductEdit(product)} type="button"><Pencil className="h-3.5 w-3.5" /></button>
                <button aria-label={`${t.removeProduct}: ${product.name[locale]}`} className="flex h-8 w-8 items-center justify-center rounded-full text-[#a2aaa5] transition-colors hover:bg-[#fbefec] hover:text-[#b26759]" onClick={() => {
                  if (window.confirm(t.confirmRemove)) {
                    setProducts((current) => current.filter((item) => item.id !== product.id));
                    setCart((current) => current.filter((line) => line.productId !== product.id));
                  }
                }} type="button"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            );
          })}
        </div>
        <p className="border-t border-[#edf0ed] bg-[#fafbf9] px-5 py-3 text-[9px] leading-4 text-[#98a39c]">{t.adminHint}</p>
      </section>

      <section className="mt-5 overflow-hidden rounded-[1.6rem] border border-[#e8edeb] bg-white/85 shadow-[0_16px_45px_-35px_rgba(31,57,45,.25)]">
        <div className="flex items-center justify-between border-b border-[#edf0ed] px-5 py-4"><div><p className="text-[9px] uppercase tracking-[.16em] text-[#91a098]">{t.ordersTag}</p><h2 className="mt-1 text-sm font-medium text-[#3a4f44]">{t.ordersTitle}</h2></div><span className="text-[9px] text-[#8f9d94]">{visibleOrders.length} {t.count}</span></div>
        {visibleOrders.length === 0 ? (
          <div className="px-5 py-10 text-center"><p className="text-sm text-[#53665c]">{t.noOrders}</p><p className="mt-2 text-[10px] text-[#909c94]">{t.noOrdersText}</p></div>
        ) : (
          <div className="divide-y divide-[#edf0ed]">
            {visibleOrders.map((order) => (
              <div className="grid gap-3 px-4 py-4 sm:grid-cols-[1.1fr_1fr_1.2fr_.8fr_auto] sm:items-center sm:px-5" key={order.id}>
                <div><p className="text-[10px] font-medium text-[#46594f]">{order.id}</p><p className="mt-1 text-[8px] text-[#96a29a]">{new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en', { dateStyle: 'medium' }).format(new Date(order.createdAt))}</p></div>
                <div><p className="text-[10px] text-[#52645a]">{order.customer}</p><p className="mt-1 text-[8px] text-[#98a39c]">{order.phone} · {order.city}</p></div>
                <p className="text-[9px] text-[#718178]">{order.items.map((item) => `${item.quantity}× ${item.name}`).join(', ')}</p>
                <p className="text-[10px] font-medium text-[#43574c]">{money(order.total, order.market, locale)} · {order.market === 'eg' ? '🇪🇬' : '🇸🇦'}</p>
                <div className="flex items-center gap-2">
                  <StatusPill locale={locale} status={order.status} />
                  <a aria-label={`${t.whatsAppTeam}: ${order.id}`} className="flex h-8 w-8 items-center justify-center rounded-full border border-[#dcebe1] text-[#5d9b76] transition-colors hover:bg-[#edf8ef]" href={whatsAppUrl(order.market, locale === 'ar' ? `مرحباً، أحتاج إلى متابعة الطلب ${order.id} لدى ZEXOR.` : `Hello, I need an update on ZEXOR order ${order.id}.`)} rel="noreferrer" target="_blank"><MessageCircle className="h-3.5 w-3.5" /></a>
                  <button aria-label={`${t.advance}: ${order.id}`} className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e3ebe5] text-[#718c7c] hover:bg-[#edf5f0]" onClick={() => updateOrderStatus(order.id)} title={t.advance} type="button">{order.status === 'complete' ? <Check className="h-3.5 w-3.5" /> : isArabic ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}</button>
                  <button aria-label={`${t.deleteOrder}: ${order.id}`} className="flex h-8 w-8 items-center justify-center rounded-full text-[#a2aaa5] hover:bg-[#fbefec] hover:text-[#b26759]" onClick={() => removeOrder(order.id)} type="button"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );

  const adminLoginPage = (
    <motion.section animate={{ opacity: 1, y: 0 }} className="mx-auto flex min-h-[74vh] max-w-7xl items-center justify-center px-5 py-16 sm:px-8" initial={{ opacity: 0, y: 14 }} transition={{ duration: 0.35 }}>
      <div className="relative w-full max-w-lg overflow-hidden rounded-[2.2rem] border border-white/90 bg-white/70 p-7 shadow-[0_38px_110px_-48px_rgba(49,92,74,.38)] backdrop-blur-2xl sm:p-10">
        <div aria-hidden="true" className="absolute -inset-e-20 -top-24 h-60 w-60 rounded-full bg-[#c9f0e6]/70 blur-[75px]" />
        <div aria-hidden="true" className="absolute -bottom-24 -inset-s-20 h-56 w-56 rounded-full bg-[#edddf6]/70 blur-[75px]" />
        <div className="relative">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white bg-linear-to-br from-[#d6f4eb] to-[#e8ddf6] text-[#557b68] shadow-lg"><LockKeyhole className="h-6 w-6" /></span>
          <p className="mt-7 text-[9px] font-semibold uppercase tracking-[.2em] text-[#81968a]">{t.privateTag}</p>
          <h1 className={`mt-2 text-3xl font-medium tracking-tight text-[#2f4338] ${isArabic ? 'leading-relaxed' : ''}`}>{t.adminAccess}</h1>
          <form className="mt-7 space-y-4" onSubmit={handleAdminLogin}>
            <label className="block">
              <span className="mb-2 block text-[10px] font-medium text-[#607269]">{t.adminPassword}</span>
              <input autoComplete="current-password" className="w-full rounded-2xl border border-white bg-white/85 px-4 py-3.5 text-sm tracking-[.24em] text-[#344a3e] shadow-sm outline-none transition focus:border-[#91c5ab] focus:ring-4 focus:ring-[#d9efe3]/60" onChange={(event) => { setAdminPassword(event.target.value); setAdminLoginError(''); }} required type="password" value={adminPassword} />
            </label>
            {adminLoginError && <p className="text-xs text-[#b95e54]" role="alert">{adminLoginError}</p>}
            <button className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#243f35] px-5 text-xs font-medium text-white shadow-[0_15px_35px_-18px_rgba(36,73,55,.65)] transition-all hover:-translate-y-0.5 hover:bg-[#3d6852]" type="submit"><LockKeyhole className="h-4 w-4" />{t.unlockAdmin}</button>
          </form>
          <p className="mt-5 rounded-2xl border border-[#f0e4d8] bg-[#fffaf4]/85 p-3.5 text-[9px] leading-5 text-[#89796c]">{t.adminSecurityNote}</p>
        </div>
      </div>
    </motion.section>
  );

  function StatusPill({ status, locale: currentLocale }: { status: CustomerOrder['status']; locale: Locale }) {
    const labels = TEXT[currentLocale];
    const label = status === 'new' ? labels.statusNew : status === 'confirmed' ? labels.statusConfirmed : labels.statusComplete;
    const classes = status === 'new' ? 'bg-[#fff1df] text-[#a77847]' : status === 'confirmed' ? 'bg-[#eaf0fa] text-[#7182a0]' : 'bg-[#e9f5ed] text-[#5c8b6e]';
    return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1.5 text-[8px] ${classes}`}>{label}</span>;
  }

  const pageContent = route === 'home'
    ? homePage
    : route === 'dashboard'
      ? adminAuthenticated ? dashboardPage : adminLoginPage
      : productRoutePage(route);

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-[#f5f8f7] text-[#304239] selection:bg-[#d8eee5] selection:text-[#263e33]"
      dir={dir}
      lang={locale}
      onPointerMove={(event) => {
        if (event.pointerType !== 'mouse') return;
        event.currentTarget.style.setProperty('--pointer-x', `${event.clientX}px`);
        event.currentTarget.style.setProperty('--pointer-y', `${event.clientY}px`);
      }}
      style={{
        backgroundImage: 'radial-gradient(560px circle at var(--pointer-x, 50%) var(--pointer-y, 20%), rgba(158, 227, 211, .24), transparent 74%)',
      }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div animate={{ x: [0, 36, 0], y: [0, 24, 0] }} className="absolute -top-64 inset-s-[4%] h-168 w-2xl rounded-full bg-[#c4f2e9]/70 blur-[130px]" transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div animate={{ x: [0, -28, 0], y: [0, 34, 0] }} className="absolute top-200 -inset-e-52 h-160 w-160 rounded-full bg-[#f4dced]/55 blur-[140px]" transition={{ duration: 21, repeat: Infinity, ease: 'easeInOut' }} />
        <div className="absolute bottom-72 -inset-s-64 h-144 w-xl rounded-full bg-[#dbdef8]/55 blur-[135px]" />
        <div className="absolute inset-0 opacity-[0.17] bg-[radial-gradient(rgba(71,99,85,.22)_0.7px,transparent_0.7px)] bg-size-[24px_24px]" />
        <div className="absolute inset-0 opacity-[0.12] bg-[linear-gradient(rgba(107,145,127,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(107,145,127,.12)_1px,transparent_1px)] bg-size-[72px_72px] mask-[linear-gradient(to_bottom,black,transparent_90%)]" />
      </div>

      <header className="sticky top-2 z-50 px-3 sm:px-6">
        <nav aria-label={isArabic ? 'التنقل الرئيسي' : 'Main navigation'} className="mx-auto flex h-17 max-w-7xl items-center justify-between gap-1 rounded-full border border-white/90 bg-white/70 px-3 shadow-[0_20px_65px_-35px_rgba(41,78,65,.32)] backdrop-blur-2xl sm:gap-3 sm:px-7">
          <button aria-label={`ZEXOR · ${t.nav.home}`} className="group flex shrink-0 items-center gap-2.5" onClick={() => navigate('home')} type="button">
            <LogoMark compact />
            <span className="text-[15px] font-semibold tracking-[.21em] text-[#34483e]">ZEXOR</span>
          </button>

          <div className="hidden items-center gap-1 lg:flex">
            {pageLinks.map((item) => (
              <button
                aria-current={route === item ? 'page' : undefined}
                className={`relative rounded-full px-3.5 py-2.5 text-[10px] transition-all ${route === item ? 'bg-[#e7f4ed] font-medium text-[#345548] shadow-[inset_0_0_0_1px_rgba(255,255,255,.9)]' : 'text-[#7e8c83] hover:bg-white/80 hover:text-[#31493d]'}`}
                key={item}
                onClick={() => navigate(item)}
                type="button"
              >
                {t.nav[item]}
                {route === item && <motion.span className="absolute inset-x-3 -bottom-1 h-0.5 rounded-full bg-linear-to-r from-[#69c9b1] via-[#b49bdf] to-[#edb69e]" layoutId="pearl-nav" />}
              </button>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <button aria-label={t.adminAccess} className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e0e8e2] bg-white/65 text-[#71877b] transition-all hover:border-[#bfd9ca] hover:bg-[#eef8f2] hover:text-[#385c49]" onClick={() => navigate('dashboard')} title={t.adminAccess} type="button">
              <LockKeyhole className="h-3.5 w-3.5" />
            </button>
            <button aria-label={t.languageSwitch} className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[#e0e8e2] bg-white/65 px-2 text-[10px] font-medium text-[#66776d] transition-colors hover:border-[#abcab8] hover:text-[#354b40] sm:px-3" onClick={() => setLocale((current) => current === 'ar' ? 'en' : 'ar')} type="button">
              <Globe2 className="h-3.5 w-3.5 shrink-0 text-[#80a892]" /><span className="max-[360px]:hidden">{t.language}</span>
            </button>
            <button aria-label={`${t.bag} (${cartCount})`} className="relative flex h-9 items-center gap-2 rounded-full border border-[#e0e8e2] bg-white/70 px-3 text-[10px] text-[#5e7066] transition-colors hover:border-[#abcab8]" onClick={() => setCartOpen(true)} type="button">
              <ShoppingBag className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t.bag}</span>
              {cartCount > 0 && <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#6d9b83] px-1 text-[8px] font-medium text-white">{cartCount}</span>}
            </button>
            <button aria-expanded={menuOpen} aria-label={menuOpen ? t.closeMenu : t.menu} className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e0e8e2] bg-white/70 text-[#5e7066] lg:hidden" onClick={() => setMenuOpen((open) => !open)} type="button">{menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button>
          </div>
        </nav>
        <AnimatePresence>
          {menuOpen && (
            <motion.div animate={{ height: 'auto', opacity: 1, y: 0 }} className="mx-auto mt-2 max-w-7xl overflow-hidden rounded-[1.7rem] border border-white/90 bg-white/90 shadow-[0_24px_60px_-30px_rgba(41,78,65,.3)] backdrop-blur-2xl lg:hidden" exit={{ height: 0, opacity: 0, y: -5 }} initial={{ height: 0, opacity: 0, y: -5 }} transition={{ duration: .2 }}>
              <div className="flex flex-col gap-1 px-4 py-3">
                {pageLinks.map((item) => <button className={`rounded-xl px-3 py-3 text-start text-xs ${route === item ? 'bg-[#eef5f0] text-[#416754]' : 'text-[#6c7c72]'}`} key={item} onClick={() => navigate(item)} type="button">{t.nav[item]}</button>)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="relative z-10">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={route}>
            {pageContent}
          </motion.div>
        </AnimatePresence>
      </main>

      <a
        aria-label={`${t.whatsAppTeam} · ${market === 'eg' ? t.egypt : t.ksa}`}
        className="group fixed bottom-4 inset-e-4 z-40 inline-flex h-13 w-13 items-center justify-center gap-2 overflow-hidden rounded-full border border-white/75 bg-[#25865a] text-white shadow-[0_14px_38px_-12px_rgba(32,119,79,.62)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:bg-[#1d754d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#25865a] sm:bottom-6 sm:inset-e-6 sm:h-12 sm:w-auto sm:justify-start sm:px-4"
        href={whatsAppUrl(market, t.contactGreeting)}
        rel="noreferrer"
        target="_blank"
      >
        <span aria-hidden="true" className="absolute inset-0 rounded-full bg-[#48b878]/35 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <MessageCircle aria-hidden="true" className="relative h-5 w-5 shrink-0" />
        <span className="relative hidden text-[10px] font-semibold sm:inline">{t.whatsAppTeam}</span>
        <span aria-hidden="true" className="relative hidden rounded-full bg-white/15 px-2 py-1 text-[8px] sm:inline">{market === 'eg' ? '🇪🇬' : '🇸🇦'}</span>
      </a>

      <footer className="relative z-10 border-t border-[#e5ebe6] bg-[#fbfcf9]/55 px-5 py-7 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-start">
          <button className="flex items-center gap-2.5" onClick={() => navigate('home')} type="button"><LogoMark compact /><span className="text-xs font-semibold tracking-[.2em] text-[#40564a]">ZEXOR</span></button>
          <p className="text-[9px] text-[#87948c]">{t.footer}</p>
          <div className="flex flex-col items-center gap-2 sm:items-end">
            <span className="text-[8px] font-semibold uppercase tracking-[.14em] text-[#a0aaa4]">{t.follow}</span>
            <a className="inline-flex max-w-full items-center gap-1.5 break-all text-[10px] text-[#688775] transition-colors hover:text-[#344f40]" href="https://www.tiktok.com/@zexor.digtal.studio" rel="noreferrer" target="_blank">
              <Music2 className="h-3.5 w-3.5" />{t.tikTok}<ArrowUpRight className="h-3 w-3" />
            </a>
            <a className="text-[9px] text-[#829087] transition-colors hover:text-[#344f40]" href={whatsAppUrl('eg', t.contactGreeting)} rel="noreferrer" target="_blank">{t.EgyptWhatsApp} · +20 100 555 6553</a>
            <a className="text-[9px] text-[#829087] transition-colors hover:text-[#344f40]" href={whatsAppUrl('ksa', t.contactGreeting)} rel="noreferrer" target="_blank">{t.KSAWhatsApp} · +966 56 041 0310</a>
          </div>
          <p className="text-[8px] tracking-wide text-[#99a39d]">{t.regionalFooter}</p>
        </div>
      </footer>

      <AnimatePresence>
        {toast && (
          <motion.div animate={{ opacity: 1, y: 0 }} className="fixed bottom-5 inset-s-1/2 z-90 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-start gap-3 rounded-2xl border border-white bg-[#fbfdf9]/95 px-4 py-3.5 shadow-[0_14px_50px_-22px_rgba(46,86,64,.35)] backdrop-blur-xl" exit={{ opacity: 0, y: 8 }} initial={{ opacity: 0, y: 8 }} role="status" transition={{ duration: .2 }}>
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#6da58a]" />
            <p className="text-[10px] leading-5 text-[#52675b]">{toast}</p>
            <button aria-label={t.close} className="ms-auto text-[#9aa69e] hover:text-[#4b6455]" onClick={() => setToast('')} type="button"><X className="h-4 w-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cartOpen && (
          <motion.div animate={{ opacity: 1 }} className="fixed inset-0 z-80 flex justify-end bg-[#33443b]/20 backdrop-blur-sm" exit={{ opacity: 0 }} initial={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) setCartOpen(false); }}>
            <motion.aside animate={{ x: 0 }} aria-label={t.bag} aria-modal="true" className="flex h-full w-full max-w-md flex-col border-s border-white/80 bg-[#fbfcf9] shadow-[-20px_0_80px_-45px_rgba(42,72,56,.35)]" initial={{ x: isArabic ? '-100%' : '100%' }} role="dialog" transition={{ type: 'spring', stiffness: 270, damping: 29 }}>
              <div className="flex items-center justify-between border-b border-[#e8eeea] px-5 py-5">
                <div><p className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#94a298]">{t.concierge}</p><h2 className="mt-1 text-lg font-medium text-[#34483e]">{t.cartTitle} <span className="text-[#83a08e]">{t.cartAccent}</span></h2></div>
                <button aria-label={t.close} className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e4eae5] text-[#728279]" onClick={() => setCartOpen(false)} type="button"><X className="h-4 w-4" /></button>
              </div>

              {cartProducts.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center px-7 text-center">
                  <LogoMark /><p className="mt-5 text-base font-medium text-[#3c5045]">{t.emptyBag}</p><p className="mt-2 max-w-xs text-xs leading-5 text-[#87938b]">{t.emptyBagText}</p>
                  <button className="mt-6 rounded-full bg-[#314f43] px-5 py-2.5 text-[10px] font-medium text-white" onClick={() => { setCartOpen(false); navigate('cards'); }} type="button">{t.exploreCard}</button>
                </div>
              ) : (
                <>
                  <div className="flex-1 space-y-3 overflow-y-auto p-4">
                    {cartProducts.map(({ product, line }) => {
                      const Icon = ICONS[product.icon] ?? Sparkles;
                      return (
                        <div className="flex gap-3 rounded-2xl border border-[#e8eeea] bg-white/85 p-3" key={product.id}>
                          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-[#dff3eb] to-[#f5e6dc] text-[#719985]"><Icon className="h-6 w-6" /></span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2"><p className="truncate text-xs font-medium text-[#3e5247]">{product.name[locale]}</p><button aria-label={`${t.remove} ${product.name[locale]}`} className="text-[#a6afa8] hover:text-[#b36f63]" onClick={() => setCart((current) => current.filter((item) => item.productId !== product.id))} type="button"><X className="h-3.5 w-3.5" /></button></div>
                            <p className="mt-1 text-[9px] text-[#8e9a92]">{money(product.price[market], market, locale)}</p>
                            <div className="mt-2 flex items-center gap-2"><button aria-label={t.decreaseQuantity} className="flex h-6 w-6 items-center justify-center rounded-full border border-[#e4ebe5] text-[#75887c]" onClick={() => changeQuantity(product.id, -1)} type="button"><Minus className="h-3 w-3" /></button><span className="min-w-4 text-center text-[10px] text-[#42564a]">{line.quantity}</span><button aria-label={t.increaseQuantity} className="flex h-6 w-6 items-center justify-center rounded-full border border-[#e4ebe5] text-[#75887c]" onClick={() => changeQuantity(product.id, 1)} type="button"><Plus className="h-3 w-3" /></button></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t border-[#e8eeea] p-5">
                    <div className="flex items-center justify-between text-xs"><span className="text-[#849188]">{t.subtotal}</span><span className="font-semibold text-[#3f5548]">{money(cartTotal, market, locale)}</span></div>
                    <p className="mt-2 text-[9px] text-[#a0aaa3]">{t.shippingAt}</p>
                    <button className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#314f43] text-xs font-medium text-white shadow-[0_14px_30px_-17px_rgba(42,82,64,.55)] transition-all hover:-translate-y-0.5 hover:bg-[#426a58]" onClick={() => setCheckoutOpen(true)} type="button"><ArrowUpRight className="h-4 w-4" />{t.checkout}</button>
                    <p className="mt-3 text-center text-[9px] text-[#98a39c]">{t.checkoutNote}</p>
                  </div>
                </>
              )}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <CheckoutDialog
        cart={cart}
        locale={locale}
        market={market}
        onClose={() => setCheckoutOpen(false)}
        onMarketChange={setMarket}
        onSubmit={submitCheckout}
        open={checkoutOpen}
        products={products}
      />
    </div>
  );
}

function LockKeyholeIcon() {
  return <span aria-hidden="true" className="flex h-4 w-4 items-center justify-center rounded-full border border-[#9ab4a3] text-[8px]">✓</span>;
}
