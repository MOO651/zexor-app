import {
  AnimatePresence,
  motion,
} from 'framer-motion';
import {
  ArrowUpRight,
  ChevronDown,
  Fingerprint,
  Globe2,
  Heart,
  LockKeyhole,
  Menu,
  MessageCircle,
  Moon,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Sun,
  Truck,
  X,
} from 'lucide-react';
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  DEFAULT_SETTINGS,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_PROPERTIES,
  INITIAL_VEHICLES,
  AGENCY_PROJECTS,
  STATS,
} from './data/initialData';
import { HomeHero, TiltCard } from './components/HomeHero';
import { NfcCustomizerModal } from './components/NfcCustomizerModal';
import { TestimonialsSection } from './components/TestimonialsSection';
import { FaqSection, SiteFooter, TrackingAndNewsletter } from './components/HomeSections';

// Route-only surfaces are code-split so the home page ships a much smaller
// initial bundle. Admins and buyers only download what they actually open.
const AgencyPortfolio = lazy(() =>
  import('./components/AgencyPortfolio').then((m) => ({ default: m.AgencyPortfolio })),
);
const Marketplace = lazy(() =>
  import('./components/Marketplace').then((m) => ({ default: m.Marketplace })),
);
const AdminDashboard = lazy(() =>
  import('./components/AdminDashboard').then((m) => ({ default: m.AdminDashboard })),
);
const CheckoutDrawer = lazy(() =>
  import('./components/CheckoutDrawer').then((m) => ({ default: m.CheckoutDrawer })),
);
const TrackingModal = lazy(() =>
  import('./components/TrackingModal').then((m) => ({ default: m.TrackingModal })),
);
import { CategoryShowcase } from './components/CategoryShowcase';
import type {
  CartLine,
  CustomerOrder,
  DynamicCategory,
  Locale,
  Market,
  MarketFilter,
  NfcCustomization,
  PlatformInquiry,
  Product,
  PromoCode,
  Property,
  Route,
  SiteSettings,
  Vehicle,
} from './types';
import {
  ADMIN_PASSWORD_FALLBACK,
  DEFAULT_LOCALE,
  isValidObject,
  isValidObjectArray,
  money,
  resolveAdminPassword,
  routeFromHash,
  whatsappLink,
  whatsappNumberFor,
} from './utils';

const STORAGE = {
  locale: 'zexor-locale',
  products: 'zexor-products-v3',
  categories: 'zexor-categories-v3',
  cart: 'zexor-cart-v3',
  orders: 'zexor-orders-v3',
  theme: 'zexor-theme',
  wishlist: 'zexor-wishlist',
  inbox: 'zexor-inbox-v3',
  promoCodes: 'zexor-promo-codes-v3',
  settings: 'zexor-settings-v3',
};

// Admin password is read from an env var so the real secret is never committed.
// Set VITE_ADMIN_PASSWORD in a local .env file to override the dev fallback.
const ADMIN_PASSWORD = resolveAdminPassword();

function readStorage<T>(key: string, fallback: T, isValid?: (value: unknown) => boolean): T {
  try {
    const value = window.localStorage.getItem(key);
    if (!value) return fallback;
    const parsed = JSON.parse(value) as unknown;
    return isValid && !isValid(parsed) ? fallback : (parsed as T);
  } catch {
    return fallback;
  }
}

// Lets useStoredState tell the caller when persistence fails (quota exceeded or
// storage disabled in private mode) so the UI can warn instead of silently losing data.
type StorageWriteHandler = (failed: boolean) => void;
let onStorageWriteError: StorageWriteHandler | null = null;

function useStoredState<T>(key: string, initial: T, isValid?: (value: unknown) => boolean) {
  const [value, setValue] = useState<T>(() => readStorage(key, initial, isValid));
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      onStorageWriteError?.(false);
    } catch {
      // storage quota or private mode fallback
      onStorageWriteError?.(true);
    }
  }, [key, value]);
  return [value, setValue] as const;
}

function pageFromHash(): Route {
  return routeFromHash(window.location.hash);
}

/**
 * Opens a pre-filled WhatsApp chat for the given number in a new tab.
 * Centralised so every CTA (cars, property, services, contact, NFC) behaves the same.
 */
function openWhatsApp(number: string, message: string) {
  window.open(whatsappLink(number, message), '_blank', 'noopener,noreferrer');
}

/**
 * Skeleton shown while a lazily-loaded route surface (admin, marketplace,
 * checkout) downloads. Keeps the layout stable instead of flashing empty.
 */
function RouteFallback({ label }: { label: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <span className="h-10 w-10 animate-spin rounded-full border-2 border-[#cfe3d8] border-t-[#35614a]" />
      <p className="text-xs font-semibold text-[#6c7d73]">{label}</p>
    </div>
  );
}

function LogoMark({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-[1.15rem] border border-white/80 bg-linear-to-br from-[#f5ffff] via-[#e5f8f3] to-[#f1eaff] shadow-md ${
        compact ? 'h-9 w-9 rounded-xl' : 'h-12 w-12'
      }`}
    >
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

export default function App() {
  const [locale, setLocale] = useState<Locale>(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE.locale);
      return stored === 'ar' || stored === 'en' ? stored : DEFAULT_LOCALE;
    } catch {
      return DEFAULT_LOCALE;
    }
  });

  const [products, setProducts] = useStoredState<Product[]>(STORAGE.products, INITIAL_PRODUCTS, isValidObjectArray);
  const [categories, setCategories] = useStoredState<DynamicCategory[]>(STORAGE.categories, INITIAL_CATEGORIES, isValidObjectArray);
  const [cart, setCart] = useStoredState<CartLine[]>(STORAGE.cart, [], isValidObjectArray);
  const [orders, setOrders] = useStoredState<CustomerOrder[]>(STORAGE.orders, [], isValidObjectArray);
  const [theme, setTheme] = useStoredState<'light' | 'dark'>(STORAGE.theme, 'light');
  const [wishlist, setWishlist] = useStoredState<string[]>(STORAGE.wishlist, []);
  const [inbox, setInbox] = useStoredState<PlatformInquiry[]>(STORAGE.inbox, [], isValidObjectArray);
  const [promoCodes, setPromoCodes] = useStoredState<PromoCode[]>(STORAGE.promoCodes, [
    { code: 'ZEXOR15', discount: 15, expiresAt: '2026-12-31', active: true },
    { code: 'VIP20', discount: 20, expiresAt: '2026-12-31', active: true },
  ], isValidObjectArray);
  const [vehicles, setVehicles] = useStoredState<Vehicle[]>('zexor-vehicles-v3', INITIAL_VEHICLES, isValidObjectArray);
  const [properties, setProperties] = useStoredState<Property[]>('zexor-properties-v3', INITIAL_PROPERTIES, isValidObjectArray);
  const [settings, setSettings] = useStoredState<SiteSettings>(STORAGE.settings, DEFAULT_SETTINGS, isValidObject);

  const [route, setRoute] = useState<Route>(pageFromHash);
  const [market, setMarket] = useState<Market>('eg');
  const [marketFilter, setMarketFilter] = useState<MarketFilter>('all');
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [toast, setToast] = useState('');

  // NFC Customizer Modal State
  const [nfcModalOpen, setNfcModalOpen] = useState(false);
  const [selectedNfcProduct, setSelectedNfcProduct] = useState<Product | null>(null);

  // Admin Login State
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');

  const isArabic = locale === 'ar';
  const dir = isArabic ? 'rtl' : 'ltr';

  // Warn (once) when the browser refuses to persist state, so the user knows
  // their cart/orders are only kept for this session.
  const storageWarning = isArabic
    ? 'تنبيه: تعذر حفظ بياناتك في المتصفح.'
    : 'Heads up: your data could not be saved in this browser.';

  useEffect(() => {
    let warned = false;
    onStorageWriteError = (failed) => {
      if (failed && !warned) {
        warned = true;
        setToast(storageWarning);
      }
    };
    return () => {
      onStorageWriteError = null;
    };
  }, [storageWarning]);

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
    document.documentElement.dataset.theme = theme;
    try {
      window.localStorage.setItem(STORAGE.locale, locale);
    } catch {
      // ignore
    }
  }, [dir, locale, theme]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToCart = (product: Product, customization?: NfcCustomization, variant?: string) => {
    setCart((current) => {
      const existing = current.find(
        (line) => line.productId === product.id && line.variant === variant && !line.nfcCustomization,
      );
      if (existing && !customization) {
        return current.map((line) =>
          line.productId === product.id ? { ...line, quantity: line.quantity + 1 } : line,
        );
      }
      return [
        ...current,
        {
          productId: product.id,
          quantity: 1,
          variant,
          nfcCustomization: customization,
        },
      ];
    });
    setToast(
      isArabic
        ? `تمت إضافة "${product.name.ar}" إلى سلة المشتريات!`
        : `Added "${product.name.en}" to cart!`,
    );
  };

  const handleOpenNfcCustomizer = (product: Product) => {
    setSelectedNfcProduct(product);
    setNfcModalOpen(true);
  };

  const handleToggleWishlist = (product: Product) => {
    const exists = wishlist.includes(product.id);
    setWishlist((current) =>
      exists ? current.filter((id) => id !== product.id) : [...current, product.id],
    );
    setToast(
      exists
        ? isArabic
          ? 'تمت إزالة المنتج من قائمة الرغبات.'
          : 'Removed from wishlist.'
        : isArabic
          ? 'تم حفظ المنتج في المفضلة!'
          : 'Saved to your wishlist!',
    );
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === ADMIN_PASSWORD) {
      setAdminAuthenticated(true);
      setAdminLoginError('');
      setAdminPassword('');
      setToast(isArabic ? 'مرحباً بك في لوحة تحكم ZEXOR' : 'Welcome to ZEXOR Studio Admin');
    } else {
      setAdminLoginError(isArabic ? 'كلمة المرور غير صحيحة، حاول مجدداً.' : 'Invalid password.');
    }
  };

  // Primary navigation: the five departments, kept short so the bar never wraps.
  const navItems: { route: Route; label: string }[] = useMemo(() => {
    const items: { route: Route; label: string }[] = [
      { route: 'home', label: isArabic ? 'الرئيسية' : 'Home' },
    ];
    if (settings.sectionVisibility.cards) items.push({ route: 'cards', label: isArabic ? 'بطاقات NFC' : 'NFC Cards' });
    if (settings.sectionVisibility.fashion) items.push({ route: 'fashion', label: isArabic ? 'الأزياء' : 'Streetwear' });
    if (settings.sectionVisibility.cars) items.push({ route: 'cars', label: isArabic ? 'السيارات' : 'Vehicles' });
    if (settings.sectionVisibility.property) items.push({ route: 'property', label: isArabic ? 'العقارات' : 'Real Estate' });
    if (settings.sectionVisibility.services) items.push({ route: 'services', label: isArabic ? 'الاستوديو' : 'Studio' });

    // Dynamic categories created in Admin!
    categories
      .filter((c) => c.active && !['cards', 'fashion', 'services'].includes(c.slug))
      .forEach((c) => {
        items.push({ route: c.slug, label: c.name[locale] });
      });

    return items;
  }, [categories, isArabic, locale, settings.sectionVisibility]);

  // Secondary navigation: pricing, calculator, reviews, tracking, contact.
  // Rendered in a "More" menu so the bar stays uncluttered on every width.
  const moreNavItems: { route: Route; label: string }[] = useMemo(() => {
    const items: { route: Route; label: string }[] = [];
    if (settings.sectionVisibility.pricing ?? true) items.push({ route: 'pricing', label: isArabic ? 'باقات البرمجة' : 'Pricing' });
    if (settings.sectionVisibility.calculator ?? true) items.push({ route: 'calculator', label: isArabic ? 'حاسبة التكلفة' : 'Cost Calculator' });
    if (settings.sectionVisibility.reviews ?? true) items.push({ route: 'reviews', label: isArabic ? 'آراء العملاء' : 'Reviews' });
    if (settings.sectionVisibility.tracking ?? true) items.push({ route: 'tracking', label: isArabic ? 'تتبّع الطلب' : 'Track Order' });
    if (settings.sectionVisibility.contact) items.push({ route: 'contact', label: isArabic ? 'تواصل معنا' : 'Contact' });
    return items;
  }, [isArabic, settings.sectionVisibility]);

  // Global search entries
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const matches: { title: string; desc: string; route: Route }[] = [];

    products.forEach((p) => {
      const haystack = `${p.name.ar} ${p.name.en} ${p.description.ar} ${p.description.en}`.toLowerCase();
      if (haystack.includes(q)) {
        matches.push({
          title: p.name[locale],
          desc: p.description[locale],
          route: (p.category === 'cards' || p.category === 'fashion' || p.category === 'services' ? p.category : 'cards') as Route,
        });
      }
    });

    if ('سيارات سيارة مرسيدس رنج بورش car cars vehicle automobile'.includes(q)) {
      matches.push({
        title: isArabic ? 'معرض ومكتب السيارات الفاخرة' : 'Vehicle Showroom',
        desc: isArabic ? 'تصفح السيارات المتاحة واحجز معاينة مباشرة' : 'Browse vehicles & book viewings',
        route: 'cars',
      });
    }

    if ('عقارات عقار شقة فيلا أرض شقق real estate property villa apartment house homes'.includes(q)) {
      matches.push({
        title: isArabic ? 'قسم العقارات والمساحات الفاخرة' : 'Real Estate Showroom',
        desc: isArabic ? 'فيلات وشقق وأراضٍ مع خريطة وحجز موعد معاينة' : 'Browse listings & map preview',
        route: 'property',
      });
    }

    if ('برمجة مواقع موقع متجر متاجر استوديو تطوير code website websites app apps store development'.includes(q)) {
      matches.push({
        title: isArabic ? 'خدمات البرمجة والاستوديو الرقمي' : 'Digital Studio & Packages',
        desc: isArabic ? 'حاسبة التكلفة وباقات التطوير ومعاينة المشاريع' : 'Cost calculator & live demos',
        route: 'services',
      });
    }

    return matches;
  }, [isArabic, locale, products, searchQuery]);

  // Products filtered for the current route
  const currentCategoryProducts = products.filter(
    (p) =>
      p.available &&
      (route === 'cards' ? p.category === 'cards' : route === 'fashion' ? p.category === 'fashion' : true) &&
      (marketFilter === 'all' || p.markets.includes(marketFilter)),
  );

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-[#f5f8f7] text-[#304239] transition-colors duration-300 selection:bg-[#d8eee5] selection:text-[#263e33]"
      data-theme={theme}
      dir={dir}
      lang={locale}
    >
      {/* Dynamic Background Glow Elements */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 36, 0], y: [0, 24, 0] }}
          className="absolute -top-64 inset-s-[4%] h-168 w-2xl rounded-full bg-[#c4f2e9]/70 blur-[130px]"
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          animate={{ x: [0, -28, 0], y: [0, 34, 0] }}
          className="absolute top-200 -inset-e-52 h-160 w-160 rounded-full bg-[#f4dced]/55 blur-[140px]"
          transition={{ duration: 21, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* 1. Dynamic Announcement Bar */}
      {settings.announcementActive && (
        <div className="relative z-50 flex min-h-9 items-center justify-center gap-2 bg-[#2d493e] px-8 py-2 text-center text-[10px] font-semibold text-white shadow-xs">
          <Sparkles className="h-3.5 w-3.5 text-[#a8dfc4]" />
          <span>{settings.announcementText[locale]}</span>
        </div>
      )}

      {/* 2. Global Floating Navigation Bar */}
      <header className="sticky top-2 z-50 px-3 sm:px-6">
        <nav
          aria-label="Navigation"
          className="zx-glass mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 rounded-full border border-white/90 px-3 shadow-lg sm:px-4"
        >
          {/* Logo */}
          <button
            className="flex items-center gap-2.5"
            onClick={() => navigate('home')}
            type="button"
          >
            <LogoMark compact />
            <span className="text-[15px] font-bold tracking-[0.22em] text-[#34483e]">ZEXOR</span>
          </button>

          {/* Desktop Nav Items — nowrap so labels never break onto two lines */}
          <div className="zx-no-bar hidden items-center gap-0.5 overflow-x-auto lg:flex">
            {navItems.map((item) => (
              <button
                className={`relative shrink-0 whitespace-nowrap rounded-full px-2.5 py-2 text-[11px] font-semibold transition-all xl:px-3 ${
                  route === item.route
                    ? 'bg-[#e7f4ed] text-[#2c5341] shadow-xs'
                    : 'text-[#6e8076] hover:bg-white/80 hover:text-[#2c4737]'
                }`}
                key={item.route}
                onClick={() => navigate(item.route)}
                type="button"
              >
                {item.label}
                {route === item.route && (
                  <motion.span
                    className="absolute inset-x-3 -bottom-1 h-0.5 rounded-full bg-[#4e8e6f]"
                    layoutId="active-nav-pill"
                  />
                )}
              </button>
            ))}

            {/* "More" dropdown keeps pricing/calculator/reviews/tracking/contact
                reachable without crowding the bar. */}
            {moreNavItems.length > 0 && (
              <div
                className="relative shrink-0"
                onMouseLeave={() => setMoreOpen(false)}
              >
                <button
                  aria-expanded={moreOpen}
                  aria-haspopup="true"
                  className={`relative flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-2 text-[11px] font-semibold transition-all xl:px-3 ${
                    moreNavItems.some((m) => m.route === route)
                      ? 'bg-[#e7f4ed] text-[#2c5341] shadow-xs'
                      : 'text-[#6e8076] hover:bg-white/80 hover:text-[#2c4737]'
                  }`}
                  onClick={() => setMoreOpen((o) => !o)}
                  onMouseEnter={() => setMoreOpen(true)}
                  type="button"
                >
                  {isArabic ? 'المزيد' : 'More'}
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {moreOpen && (
                    <motion.div
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute end-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-white/90 bg-white/95 p-1.5 shadow-2xl backdrop-blur-2xl"
                      exit={{ opacity: 0, y: -6 }}
                      initial={{ opacity: 0, y: -6 }}
                    >
                      {moreNavItems.map((item) => (
                        <button
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-start text-xs font-semibold transition-colors ${
                            route === item.route
                              ? 'bg-[#e7f4ed] text-[#2c5341]'
                              : 'text-[#62776c] hover:bg-[#f2f7f4]'
                          }`}
                          key={item.route}
                          onClick={() => {
                            navigate(item.route);
                            setMoreOpen(false);
                          }}
                          type="button"
                        >
                          {item.label}
                          <ArrowUpRight className="h-3.5 w-3.5 opacity-50" />
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Right Action Icons: Search, Dark Mode, Wishlist, Language, Cart, Admin */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Search */}
            <button
              aria-label="Search"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#dfe7e1] bg-white/70 text-[#697d72] hover:bg-[#edf5f0]"
              onClick={() => setSearchOpen(true)}
              type="button"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              aria-label="Toggle Dark Mode"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#dfe7e1] bg-white/70 text-[#697d72] hover:bg-[#edf5f0]"
              onClick={() => setTheme((curr) => (curr === 'light' ? 'dark' : 'light'))}
              type="button"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            {/* Wishlist */}
            <button
              aria-label="Wishlist"
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#dfe7e1] bg-white/70 text-[#697d72] hover:bg-[#edf5f0]"
              onClick={() => setWishlistOpen(true)}
              type="button"
            >
              <Heart className="h-4 w-4" />
              {wishlist.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c85a6e] px-1 text-[8px] font-bold text-white">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Quick Track Order Button */}
            <button
              aria-label="Track Order"
              className="flex h-9 items-center gap-1.5 rounded-full border border-[#dfe7e1] bg-white/70 px-3 text-[10px] font-semibold text-[#5a6e63] hover:bg-[#edf5f0]"
              onClick={() => setTrackingOpen(true)}
              title={isArabic ? 'تتبع الشحنة' : 'Track Order'}
              type="button"
            >
              <Truck className="h-3.5 w-3.5 text-[#4e826a]" />
              <span className="hidden xl:inline">{isArabic ? 'تتبع طلبك' : 'Track'}</span>
            </button>

            {/* Market & Region Switcher */}
            <button
              aria-label="Toggle Market"
              className="inline-flex min-h-9 items-center gap-1 rounded-full border border-[#dfe7e1] bg-white/70 px-2.5 text-[10px] font-semibold text-[#5a6e63] hover:bg-[#edf5f0]"
              onClick={() => {
                const nextMarket: Market = market === 'eg' ? 'ksa' : 'eg';
                setMarket(nextMarket);
                setMarketFilter(nextMarket);
              }}
              type="button"
            >
              <span>{market === 'eg' ? '🇪🇬' : '🇸🇦'}</span>
              <span className="hidden sm:inline">{market === 'eg' ? (isArabic ? 'مصر' : 'EGP') : isArabic ? 'السعودية' : 'SAR'}</span>
            </button>

            {/* Language Switch */}
            <button
              aria-label="Language"
              className="inline-flex min-h-9 items-center gap-1 rounded-full border border-[#dfe7e1] bg-white/70 px-2.5 text-[10px] font-semibold text-[#5a6e63] hover:bg-[#edf5f0]"
              onClick={() => setLocale((curr) => (curr === 'ar' ? 'en' : 'ar'))}
              type="button"
            >
              <Globe2 className="h-3.5 w-3.5 text-[#5e8b75]" />
              <span className="hidden sm:inline">{isArabic ? 'English' : 'العربية'}</span>
            </button>

            {/* Cart Drawer Button */}
            <button
              aria-label="Cart"
              className="relative flex h-9 items-center gap-1.5 rounded-full bg-[#314f43] px-3.5 text-[10px] font-semibold text-white shadow-sm hover:bg-[#436e5d]"
              onClick={() => setCartOpen(true)}
              type="button"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{isArabic ? 'السلة' : 'Cart'}</span>
              {cartCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[8px] font-bold text-[#314f43]">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Admin Lock / Studio Access */}
            <button
              aria-label="Studio Admin"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#dfe7e1] bg-white/70 text-[#697d72] hover:bg-[#eef8f2] hover:text-[#325b46]"
              onClick={() => navigate('dashboard')}
              title={isArabic ? 'لوحة التحكم' : 'Studio Admin'}
              type="button"
            >
              <LockKeyhole className="h-3.5 w-3.5" />
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              aria-label="Open menu"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#dfe7e1] bg-white/70 text-[#697d72] lg:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              type="button"
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto mt-2 max-w-7xl overflow-hidden rounded-3xl border border-white/90 bg-white/95 p-4 shadow-xl backdrop-blur-2xl lg:hidden"
              exit={{ opacity: 0, y: -8 }}
              initial={{ opacity: 0, y: -8 }}
            >
              <div className="flex flex-col gap-1.5">
                {navItems.map((item) => (
                  <button
                    className={`rounded-2xl px-4 py-3 text-start text-xs font-semibold ${
                      route === item.route ? 'bg-[#e7f4ed] text-[#2c5341]' : 'text-[#62776c]'
                    }`}
                    key={item.route}
                    onClick={() => navigate(item.route)}
                    type="button"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main View Router. Lazy route surfaces render inside Suspense so the
          home page ships without them in the initial bundle. */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-12">
        <Suspense fallback={<RouteFallback label={isArabic ? 'جارٍ التحميل…' : 'Loading…'} />}>
        {route === 'home' && (
          <div className="space-y-20">
            {/* 1. Interactive 3D Parallax Hero */}
            <HomeHero
              heroAccent={settings.heroAccent[locale]}
              heroText={settings.heroText[locale]}
              heroTitle={settings.heroTitle[locale]}
              locale={locale}
              market={market}
              navigate={navigate}
              onMarketChange={(m) => {
                setMarket(m);
                setMarketFilter(m);
              }}
            />

            {/* 2. Department Board — image-driven entry points into every section */}
            <CategoryShowcase
              isArabic={isArabic}
              locale={locale}
              navigate={navigate}
              visible={{
                cards: settings.sectionVisibility.cards,
                fashion: settings.sectionVisibility.fashion,
                cars: settings.sectionVisibility.cars,
                property: settings.sectionVisibility.property,
                services: settings.sectionVisibility.services,
              }}
            />

            {/* 3. Live Animated Stats Counter */}
            <section className="relative overflow-hidden rounded-4xl border border-white bg-linear-to-br from-[#f7fbf8] to-[#eef5f0] p-6 shadow-sm sm:p-8">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -end-16 -top-16 h-48 w-48 rounded-full bg-[#c4f2e9]/60 blur-3xl"
              />
              <div className="relative grid grid-cols-2 gap-5 sm:grid-cols-4">
                {STATS.map((s, i) => (
                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 14 }}
                    key={s.id}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    viewport={{ once: true }}
                    whileInView={{ opacity: 1, y: 0 }}
                  >
                    <p className="zx-display bg-linear-to-br from-[#21362b] to-[#4e8e6f] bg-clip-text text-3xl text-transparent sm:text-4xl">
                      {s.value}
                    </p>
                    <p className="zx-eyebrow mt-2 text-[#7a8d83]">{s.label[locale]}</p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* 3. Section 01: 3D Smart NFC Identity Cards Showcase */}
            {settings.sectionVisibility.cards && (
              <section className="space-y-6">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                  <div>
                    <span className="zx-eyebrow text-[#5e8b75]">
                      01 / {isArabic ? 'بطاقات الهوية المتصلة' : 'CONNECTED IDENTITY'}
                    </span>
                    <h2 className="zx-display mt-2 text-2xl text-[#21362b] sm:text-3xl">
                      {isArabic ? 'بطاقات NFC الذكية والمخصصة' : 'Interactive Smart NFC Cards'}
                    </h2>
                  </div>
                  <button
                    className="flex items-center gap-1.5 text-xs font-bold text-[#35614a] hover:text-[#234333]"
                    onClick={() => navigate('cards')}
                    type="button"
                  >
                    <span>{isArabic ? 'استعراض كافة البطاقات' : 'View All Cards'}</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  {products
                    .filter((p) => p.category === 'cards')
                    .slice(0, 3)
                    .map((p) => (
                      <TiltCard
                        className="flex flex-col justify-between overflow-hidden rounded-3xl border border-white bg-white/90 p-5 shadow-md"
                        intensity={8}
                        key={p.id}
                      >
                        <div>
                          <div className="relative aspect-[1.3/1] overflow-hidden rounded-2xl bg-[#e6ede8]">
                            <img alt={p.name[locale]} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" src={p.imageUrl} />
                            <span className="absolute start-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[8px] font-bold text-white backdrop-blur-md">
                              NFC READY
                            </span>
                            <button
                              aria-label={isArabic ? 'إضافة للمفضلة' : 'Toggle wishlist'}
                              className="absolute end-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-[#718579] shadow-xs backdrop-blur-md"
                              onClick={() => handleToggleWishlist(p)}
                              type="button"
                            >
                              <Heart className="h-4 w-4" fill={wishlist.includes(p.id) ? '#c85a6e' : 'none'} />
                            </button>
                          </div>

                          <h3 className="mt-4 text-sm font-bold text-[#2e4537]">{p.name[locale]}</h3>
                          <p className="mt-1 text-[11px] leading-5 text-[#6c7d73]">{p.description[locale]}</p>
                        </div>

                        <div className="mt-5 border-t border-[#edf1ee] pt-4">
                          <div className="flex items-baseline justify-between">
                            <span className="text-base font-extrabold text-[#2d4738]">
                              {money(p.price[market], market, locale)}
                            </span>
                            {p.oldPrice && p.oldPrice[market] > p.price[market] && (
                              <span className="text-xs text-[#98a79f] line-through">
                                {money(p.oldPrice[market], market, locale)}
                              </span>
                            )}
                          </div>

                          <div className="mt-3 flex gap-2">
                            <button
                              className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#314f43] py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#436e5d]"
                              onClick={() => handleOpenNfcCustomizer(p)}
                              type="button"
                            >
                              <Fingerprint className="h-3.5 w-3.5" />
                              {isArabic ? 'تخصيص الكارت 3D' : '3D Customizer'}
                            </button>
                            <button
                              aria-label="Add to cart"
                              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d5e2d9] text-[#4d705d] hover:bg-[#edf5f0]"
                              onClick={() => handleAddToCart(p)}
                              type="button"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </TiltCard>
                    ))}
                </div>
              </section>
            )}

            {/* 4. Section 02: Streetwear Atelier Drop Showcase */}
            {settings.sectionVisibility.fashion && (
              <section className="space-y-6">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                  <div>
                    <span className="zx-eyebrow text-[#5e8b75]">
                      02 / {isArabic ? 'أتيليه الأزياء والستريت وير' : 'STREETWEAR ATELIER'}
                    </span>
                    <h2 className="zx-display mt-2 text-2xl text-[#21362b] sm:text-3xl">
                      {isArabic ? 'إصدارات الأزياء الحصرية' : 'Exclusive Streetwear Releases'}
                    </h2>
                  </div>
                  <button
                    className="flex items-center gap-1.5 text-xs font-bold text-[#35614a] hover:text-[#234333]"
                    onClick={() => navigate('fashion')}
                    type="button"
                  >
                    <span>{isArabic ? 'استعراض التشكيلة' : 'View Drop'}</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {products
                    .filter((p) => p.category === 'fashion')
                    .slice(0, 2)
                    .map((p) => (
                      <TiltCard
                        className="group overflow-hidden rounded-3xl border border-white bg-white/90 p-5 shadow-md"
                        intensity={6}
                        key={p.id}
                      >
                        <div className="relative aspect-[1.4/1] overflow-hidden rounded-2xl bg-[#e6ede8]">
                          <img alt={p.name[locale]} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" src={p.imageUrl} />
                          <span className="absolute start-3 top-3 rounded-full bg-[#1b2721]/80 px-2.5 py-1 text-[8px] font-bold text-white backdrop-blur-md">
                            450 GSM COTTON
                          </span>
                        </div>
                        <div className="mt-4 flex items-start justify-between">
                          <div>
                            <h3 className="text-base font-bold text-[#2c4033]">{p.name[locale]}</h3>
                            <p className="mt-1 text-xs text-[#697b71]">{p.description[locale]}</p>
                          </div>
                          <span className="text-base font-extrabold text-[#2b4435]">
                            {p.price.eg} ج.م
                          </span>
                        </div>
                        <button
                          className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#314f43] text-xs font-semibold text-white shadow-xs hover:bg-[#436e5d]"
                          onClick={() => handleAddToCart(p, undefined, 'L')}
                          type="button"
                        >
                          <ShoppingBag className="h-3.5 w-3.5" />
                          {isArabic ? 'إضافة إلى السلة (مقاس L)' : 'Add to Cart (Size L)'}
                        </button>
                      </TiltCard>
                    ))}
                </div>
              </section>
            )}

            {/* 5. Section 03: Digital Studio, Live Demos & Software Agency */}
            {settings.sectionVisibility.services && (
              <section className="space-y-6">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                  <div>
                    <span className="zx-eyebrow text-[#5e8b75]">
                      03 / {isArabic ? 'الاستوديو وتطوير البرمجيات' : 'SOFTWARE & DIGITAL AGENCY'}
                    </span>
                    <h2 className="zx-display mt-2 text-2xl text-[#21362b] sm:text-3xl">
                      {isArabic ? 'معاينة حية للمشاريع والمنصات' : 'Live Platform Demos & Agency Works'}
                    </h2>
                  </div>
                  <button
                    className="flex items-center gap-1.5 text-xs font-bold text-[#35614a] hover:text-[#234333]"
                    onClick={() => navigate('services')}
                    type="button"
                  >
                    <span>{isArabic ? 'فتح الاستوديو وحاسبة التكلفة' : 'Open Full Studio & Calculator'}</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  {AGENCY_PROJECTS.map((proj) => (
                    <TiltCard
                      className="group overflow-hidden rounded-3xl border border-white bg-white/90 shadow-md"
                      intensity={8}
                      key={proj.id}
                    >
                      <div className="relative aspect-video overflow-hidden bg-[#e0eee5]">
                        <img alt={proj.title[locale]} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" src={proj.image} />
                        <span className="absolute start-3 top-3 rounded-full bg-[#1b2b23]/80 px-2.5 py-1 text-[8px] font-semibold text-white backdrop-blur-md">
                          {proj.category[locale]}
                        </span>
                      </div>
                      <div className="p-5">
                        <h3 className="text-sm font-bold text-[#2f4438]">{proj.title[locale]}</h3>
                        <p className="mt-1 text-[11px] leading-5 text-[#6c7d73]">{proj.description[locale]}</p>
                        <a
                          className="mt-4 flex min-h-10 w-full items-center justify-center gap-2 rounded-full bg-[#314f43] px-4 text-xs font-semibold text-white shadow-xs hover:bg-[#436e5d]"
                          href={proj.demoUrl}
                          rel="noreferrer"
                          target="_blank"
                        >
                          <ArrowUpRight className="h-3.5 w-3.5" />
                          {isArabic ? 'معاينة حية للمشروع (Live Demo)' : 'Live Demo'}
                        </a>
                      </div>
                    </TiltCard>
                  ))}
                </div>
              </section>
            )}

            {/* 6. Section 04: Luxury Car Showroom */}
            {settings.sectionVisibility.cars && (
              <section className="space-y-6">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                  <div>
                    <span className="zx-eyebrow text-[#5e8b75]">
                      04 / {isArabic ? 'معرض ومكتب السيارات الفاخرة' : 'CURATED VEHICLES'}
                    </span>
                    <h2 className="zx-display mt-2 text-2xl text-[#21362b] sm:text-3xl">
                      {isArabic ? 'سيارات معتمدة مع حجز معاينة' : 'Featured Luxury Vehicles'}
                    </h2>
                  </div>
                  <button
                    className="flex items-center gap-1.5 text-xs font-bold text-[#35614a] hover:text-[#234333]"
                    onClick={() => navigate('cars')}
                    type="button"
                  >
                    <span>{isArabic ? 'استعراض كل السيارات' : 'View All Cars'}</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  {vehicles.map((car) => (
                    <TiltCard
                      className="overflow-hidden rounded-3xl border border-white bg-white/90 shadow-md"
                      intensity={8}
                      key={car.id}
                    >
                      <div className="relative aspect-[1.4/1] overflow-hidden bg-[#e5eee7]">
                        <img alt={car.title[locale]} className="h-full w-full object-cover" src={car.photo} />
                        <span className="absolute start-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[8px] font-bold text-white backdrop-blur-md">
                          {car.id}
                        </span>
                      </div>
                      <div className="p-5">
                        <h3 className="text-sm font-bold text-[#2e4437]">{car.title[locale]}</h3>
                        <p className="mt-1 text-[10px] text-[#718478]">{car.location[locale]}</p>
                        <p className="mt-3 text-base font-extrabold text-[#2d4838]">
                          {money(car.price, market, locale)}
                        </p>
                        <button
                          className="mt-4 flex min-h-10 w-full items-center justify-center gap-2 rounded-full bg-[#314f43] text-xs font-semibold text-white hover:bg-[#436e5d]"
                          onClick={() => {
                            const msg = isArabic
                              ? `طلب حجز معاينة للسيارة ${car.id}: ${car.title.ar}`
                              : `Booking inspection for ${car.id}: ${car.title.en}`;
                            openWhatsApp(whatsappNumberFor(market, settings), msg);
                          }}
                          type="button"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          {isArabic ? 'احجز معاينة على واتساب' : 'Book Inspection'}
                        </button>
                      </div>
                    </TiltCard>
                  ))}
                </div>
              </section>
            )}

            {/* 7. Section 05: Prime Real Estate Showcase */}
            {settings.sectionVisibility.property && (
              <section className="space-y-6">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                  <div>
                    <span className="zx-eyebrow text-[#5e8b75]">
                      05 / {isArabic ? 'قسم العقارات والمساحات' : 'PRIME REAL ESTATE'}
                    </span>
                    <h2 className="zx-display mt-2 text-2xl text-[#21362b] sm:text-3xl">
                      {isArabic ? 'عقارات فاخرة للبيع والإيجار' : 'Curated Residential & Commercial Spaces'}
                    </h2>
                  </div>
                  <button
                    className="flex items-center gap-1.5 text-xs font-bold text-[#35614a] hover:text-[#234333]"
                    onClick={() => navigate('property')}
                    type="button"
                  >
                    <span>{isArabic ? 'استعراض كل العقارات' : 'View All Properties'}</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  {properties.map((prop) => (
                    <TiltCard
                      className="overflow-hidden rounded-3xl border border-white bg-white/90 shadow-md"
                      intensity={8}
                      key={prop.id}
                    >
                      <div className="relative aspect-[1.4/1] overflow-hidden bg-[#e5eee7]">
                        <img alt={prop.title[locale]} className="h-full w-full object-cover" src={prop.photo} />
                        <span className="absolute start-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[8px] font-bold text-white backdrop-blur-md">
                          {prop.id}
                        </span>
                        <span className="absolute end-3 top-3 rounded-full bg-[#314f43] px-2.5 py-1 text-[8px] font-semibold text-white">
                          {prop.deal === 'Sale' ? (isArabic ? 'للبيع' : 'Sale') : isArabic ? 'للإيجار' : 'Rent'}
                        </span>
                      </div>
                      <div className="p-5">
                        <h3 className="text-sm font-bold text-[#2e4437]">{prop.title[locale]}</h3>
                        <p className="mt-1 text-[10px] text-[#718478]">{prop.location[locale]}</p>
                        <p className="mt-3 text-base font-extrabold text-[#2d4838]">
                          {money(prop.price, market, locale)}
                        </p>
                        <button
                          className="mt-4 flex min-h-10 w-full items-center justify-center gap-2 rounded-full bg-[#314f43] text-xs font-semibold text-white hover:bg-[#436e5d]"
                          onClick={() => navigate('property')}
                          type="button"
                        >
                          {isArabic ? 'طلب معاينة ميدانية' : 'Request Viewing'}
                        </button>
                      </div>
                    </TiltCard>
                  ))}
                </div>
              </section>
            )}

            {/* 8. Section 06: Client Testimonials & Reviews */}
            <TestimonialsSection locale={locale} onToast={(msg) => setToast(msg)} />

            {/* 9. Section 07: Interactive FAQ */}
            <FaqSection isArabic={isArabic} locale={locale} />

            {/* 10. Section 08: Order Tracking + Newsletter */}
            <TrackingAndNewsletter
              isArabic={isArabic}
              locale={locale}
              onSubscribe={(email) =>
                setToast(
                  isArabic
                    ? `تمت إضافة ${email} إلى قائمة الإصدارات!`
                    : `Added ${email} to the drop list!`,
                )
              }
              onTrackOrder={() => setTrackingOpen(true)}
            />

            {/* 9. Section 07: High-Impact Call to Action */}
            <section className="relative overflow-hidden rounded-4xl border border-white bg-linear-to-br from-[#20372d] to-[#121c17] p-8 text-white shadow-2xl sm:p-14">
              <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div className="max-w-xl">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#72ce9f]">
                    {isArabic ? 'ابدأ خطوتك القادمة الآن' : 'YOUR NEXT MOVE STARTS HERE'}
                  </span>
                  <h2 className="mt-2 text-3xl font-extrabold sm:text-5xl">
                    {isArabic ? 'جاهز لتحويل فكرتك إلى واقع؟' : 'Ready to Elevate Your Brand?'}
                  </h2>
                  <p className="mt-3 text-xs leading-6 text-white/75 sm:text-sm">
                    {isArabic
                      ? 'تواصل مباشرة مع استوديو ZEXOR عبر واتساب لمناقشة كروت NFC، تطوير متجرك، أو حجز معاينة.'
                      : 'Connect directly with our team over WhatsApp for NFC orders, software development, or bookings.'}
                  </p>
                </div>
                <a
                  className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-8 text-xs font-bold text-[#1f382c] shadow-lg transition-all hover:bg-[#a6e6c4]"
                  href={`https://wa.me/${market === 'eg' ? settings.whatsappEg : settings.whatsappKsa}?text=${encodeURIComponent(
                    isArabic ? 'مرحباً ZEXOR، أود بدء محادثة ومناقشة مشروع جديد.' : 'Hello ZEXOR, I want to start a new project.',
                  )}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{isArabic ? 'محادثة فورية على واتساب' : 'Chat on WhatsApp'}</span>
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </section>
          </div>
        )}

        {/* Route: Cards */}
        {route === 'cards' && (
          <div className="space-y-10">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#5e8b75]">
                  {isArabic ? 'بطاقات الهوية المتصلة' : 'Connected Identity'}
                </span>
                <h1 className="mt-1 text-3xl font-extrabold text-[#293d32]">
                  {isArabic ? 'بطاقات NFC الذكية والمخصصة' : 'ZEXOR Smart NFC Cards'}
                </h1>
                <p className="mt-1.5 text-xs text-[#6e8076]">
                  {isArabic
                    ? 'شارك ملفك الشخصي أو التجاري بلمسة واحدة دون الحاجة لتطبيق أو أوراق.'
                    : 'Share your contact details, portfolio and socials with a single tap.'}
                </p>
              </div>

              {/* Direct Customize CTA */}
              <button
                className="flex items-center gap-2 rounded-full bg-[#314f43] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#436e5d]"
                onClick={() => handleOpenNfcCustomizer(products[0])}
                type="button"
              >
                <Fingerprint className="h-4 w-4" />
                {isArabic ? 'استوديو تخصيص الكارت المباشر' : 'Open Live 3D Customizer'}
              </button>
            </div>

            {/* Product Cards Grid */}
            <div className="grid gap-6 md:grid-cols-3">
              {currentCategoryProducts.map((p) => (
                <div
                  className="flex flex-col justify-between overflow-hidden rounded-3xl border border-white bg-white/90 p-5 shadow-md"
                  key={p.id}
                >
                  <div>
                    <div className="relative aspect-[1.3/1] overflow-hidden rounded-2xl bg-[#e6ede8]">
                      <img alt={p.name[locale]} className="h-full w-full object-cover" src={p.imageUrl} />
                      <button
                        aria-label={isArabic ? 'إضافة للمفضلة' : 'Toggle wishlist'}
                        className="absolute end-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-[#718579] shadow-xs backdrop-blur-md"
                        onClick={() => handleToggleWishlist(p)}
                        type="button"
                      >
                        <Heart className="h-4 w-4" fill={wishlist.includes(p.id) ? '#c85a6e' : 'none'} />
                      </button>
                    </div>

                    <h3 className="mt-4 text-sm font-bold text-[#2e4537]">{p.name[locale]}</h3>
                    <p className="mt-1 text-[11px] leading-5 text-[#6c7d73]">{p.description[locale]}</p>
                  </div>

                  <div className="mt-5 border-t border-[#edf1ee] pt-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-base font-extrabold text-[#2d4738]">
                        {money(p.price[market], market, locale)}
                      </span>
                      {p.oldPrice && p.oldPrice[market] > p.price[market] && (
                        <span className="text-xs text-[#98a79f] line-through">
                          {money(p.oldPrice[market], market, locale)}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#314f43] py-2 text-xs font-semibold text-white hover:bg-[#436e5d]"
                        onClick={() => handleOpenNfcCustomizer(p)}
                        type="button"
                      >
                        <Fingerprint className="h-3.5 w-3.5" />
                        {isArabic ? 'تخصيص الكارت' : 'Customize'}
                      </button>
                                      <button
                        aria-label={isArabic ? 'أضف للسلة' : 'Add to cart'}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d5e2d9] text-[#4d705d] hover:bg-[#edf5f0]"
                        onClick={() => handleAddToCart(p)}
                        type="button"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Route: Fashion */}
        {route === 'fashion' && (
          <div className="space-y-10">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#5e8b75]">
                {isArabic ? 'أتيليه زكسور للملابس' : 'ZEXOR Atelier'}
              </span>
              <h1 className="mt-1 text-3xl font-extrabold text-[#293d32]">
                {isArabic ? 'تشكيلة الستريت وير والأزياء' : 'Streetwear & Apparel Collection'}
              </h1>
              <p className="mt-1.5 text-xs text-[#6e8076]">
                {isArabic
                  ? 'أقمشة قطنية ثقيلة وقصّات واسعة مريحة بإصدارات محدودة وحصرية.'
                  : 'Independent drops with high-density cotton and confident silhouettes.'}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {currentCategoryProducts.map((p) => (
                <div
                  className="flex flex-col justify-between overflow-hidden rounded-3xl border border-white bg-white/90 p-5 shadow-md"
                  key={p.id}
                >
                  <div>
                    <div className="relative aspect-[1.3/1] overflow-hidden rounded-2xl bg-[#e6ede8]">
                      <img alt={p.name[locale]} className="h-full w-full object-cover" src={p.imageUrl} />
                      <button
                        className="absolute end-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-[#718579] shadow-xs backdrop-blur-md"
                        onClick={() => handleToggleWishlist(p)}
                        type="button"
                      >
                        <Heart className="h-4 w-4" fill={wishlist.includes(p.id) ? '#c85a6e' : 'none'} />
                      </button>
                    </div>

                    <h3 className="mt-4 text-sm font-bold text-[#2e4537]">{p.name[locale]}</h3>
                    <p className="mt-1 text-[11px] leading-5 text-[#6c7d73]">{p.description[locale]}</p>

                    {p.variants && (
                      <div className="mt-3 flex gap-1.5">
                        {p.variants.map((v) => (
                          <span
                            className="rounded-lg border border-[#dfe8e2] bg-[#fbfdfa] px-2 py-0.5 text-[9px] font-bold text-[#4e6b5b]"
                            key={v}
                          >
                            {v}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-5 border-t border-[#edf1ee] pt-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-base font-extrabold text-[#2d4738]">
                        {money(p.price.eg, 'eg', locale)}
                      </span>
                      {p.oldPrice && p.oldPrice.eg > p.price.eg && (
                        <span className="text-xs text-[#98a79f] line-through">
                          {money(p.oldPrice.eg, 'eg', locale)}
                        </span>
                      )}
                    </div>

                    <button
                      className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-full bg-[#314f43] text-xs font-semibold text-white hover:bg-[#436e5d]"
                      onClick={() => handleAddToCart(p, undefined, 'L')}
                      type="button"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      {isArabic ? 'إضافة إلى السلة (مقاس L)' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Route: Services (Agency, Portfolio, Calculator, Reviews, CV) */}
        {(route === 'services' || route === 'pricing' || route === 'calculator') && (
          <AgencyPortfolio
            locale={locale}
            market={market}
            onInquiry={(inq) => setInbox((prev) => [inq, ...prev])}
            onWhatsApp={(m, text) => openWhatsApp(whatsappNumberFor(m, settings), text)}
          />
        )}

        {/* Route: Reviews Dedicated */}
        {route === 'reviews' && (
          <div className="space-y-10">
            <TestimonialsSection locale={locale} onToast={(msg) => setToast(msg)} />
          </div>
        )}

        {/* Route: Cars */}
        {route === 'cars' && (
          <Marketplace
            locale={locale}
            market={market}
            mode="cars"
            onInquiry={(inq) => setInbox((prev) => [inq, ...prev])}
            onWhatsApp={(m, text) => openWhatsApp(whatsappNumberFor(m, settings), text)}
            properties={properties}
            vehicles={vehicles}
          />
        )}

        {/* Route: Property */}
        {route === 'property' && (
          <Marketplace
            locale={locale}
            market={market}
            mode="property"
            onInquiry={(inq) => setInbox((prev) => [inq, ...prev])}
            onWhatsApp={(m, text) => openWhatsApp(whatsappNumberFor(m, settings), text)}
            properties={properties}
            vehicles={vehicles}
          />
        )}

        {/* Route: Tracking */}
        {route === 'tracking' && (
          <div className="space-y-10">
            <div className="text-center">
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#5e8b75]">
                {isArabic ? 'تتبّع الشحنات' : 'Shipment Tracking'}
              </span>
              <h1 className="mt-1 text-3xl font-extrabold text-[#293d32]">
                {isArabic ? 'تتبّع طلبك خطوة بخطوة' : 'Follow Your Order Step by Step'}
              </h1>
              <p className="mx-auto mt-2 max-w-xl text-xs leading-6 text-[#6e8076]">
                {isArabic
                  ? 'افتح نافذة التتبع وأدخل رقم طلبك لمتابعة حالة الشحن مباشرة.'
                  : 'Open the tracker and enter your order number to follow your shipment live.'}
              </p>
              <button
                className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#314f43] px-6 text-xs font-bold text-white shadow-md transition-all hover:bg-[#436e5d]"
                onClick={() => setTrackingOpen(true)}
                type="button"
              >
                <Truck className="h-4 w-4" />
                {isArabic ? 'فتح نافذة التتبع' : 'Open Tracker'}
              </button>
            </div>
            <TrackingAndNewsletter
              isArabic={isArabic}
              locale={locale}
              onSubscribe={(email) =>
                setToast(isArabic ? `تمت إضافة ${email} إلى القائمة!` : `Added ${email} to the list!`)
              }
              onTrackOrder={() => setTrackingOpen(true)}
            />
          </div>
        )}

        {/* Route: Contact */}
        {route === 'contact' && (
          <div className="mx-auto max-w-2xl rounded-3xl border border-white bg-white/90 p-8 shadow-xl">
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#5e8b75]">
              {isArabic ? 'تواصل مباشر وسريع' : 'Direct Conversation'}
            </span>
            <h1 className="mt-1 text-2xl font-bold text-[#283d31]">
              {isArabic ? 'ابدأ محادثة مع فريق ZEXOR' : 'Start a Conversation with Us'}
            </h1>
            <p className="mt-2 text-xs leading-6 text-[#6c7d73]">
              {isArabic
                ? 'شاركنا تفاصيل مشروعك أو طلبك وسنقوم بالرد عليك فوراً وإعداد ملخص متكامل.'
                : 'Send your project brief, budget and requirements for rapid response.'}
            </p>

            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                const name = String(form.get('name') ?? '');
                const phone = String(form.get('phone') ?? '');
                const budget = String(form.get('budget') ?? '');
                const details = String(form.get('details') ?? '');

                const inq: PlatformInquiry = {
                  id: `ZX-INQ-${Date.now().toString().slice(-6)}`,
                  createdAt: new Date().toISOString(),
                  type: 'contact',
                  title: `${name} · Contact Form`,
                  name,
                  phone,
                  city: market === 'eg' ? 'Cairo' : 'Riyadh',
                  market,
                  budget,
                  message: details,
                  status: 'new',
                };
                setInbox((prev) => [inq, ...prev]);

                const text = isArabic
                  ? `رسالة تواصل جديدة:
الاسم: ${name}
الهاتف: ${phone}
الميزانية: ${budget}
التفاصيل: ${details}`
                  : `New Contact Request:
Name: ${name}
Phone: ${phone}
Budget: ${budget}
Details: ${details}`;

                openWhatsApp(whatsappNumberFor(market, settings), text);
                setToast(isArabic ? 'تم حفظ رسالتك وجارٍ فتح واتساب!' : 'Opening WhatsApp!');
              }}
            >
              <div>
                <label className="text-xs font-semibold text-[#405449]">{isArabic ? 'الاسم بالكامل' : 'Full Name'}</label>
                <input className="mt-1 h-10 w-full rounded-xl border border-[#dfe7e1] px-3 text-xs outline-none" name="name" required />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#405449]">{isArabic ? 'رقم الهاتف / واتساب' : 'Phone / WhatsApp'}</label>
                <input className="mt-1 h-10 w-full rounded-xl border border-[#dfe7e1] px-3 text-xs outline-none" name="phone" required type="tel" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#405449]">{isArabic ? 'الميزانية التقريبية' : 'Estimated Budget'}</label>
                <input className="mt-1 h-10 w-full rounded-xl border border-[#dfe7e1] px-3 text-xs outline-none" name="budget" placeholder="EGP / SAR" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#405449]">{isArabic ? 'تفاصيل الطلب أو المشروع' : 'Project Brief'}</label>
                <textarea className="mt-1 h-24 w-full rounded-xl border border-[#dfe7e1] p-3 text-xs outline-none" name="details" required />
              </div>
              <button
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#314f43] text-xs font-semibold text-white shadow-md hover:bg-[#436e5d]"
                type="submit"
              >
                <MessageCircle className="h-4 w-4" />
                {isArabic ? 'إرسال الرسالة عبر واتساب' : 'Send via WhatsApp'}
              </button>
            </form>
          </div>
        )}

        {/* Route: Dashboard (Protected Admin) */}
        {route === 'dashboard' && (
          adminAuthenticated ? (
            <AdminDashboard
              categories={categories}
              inbox={inbox}
              locale={locale}
              market={market}
              onLock={() => {
                setAdminAuthenticated(false);
                navigate('home');
              }}
              onToast={(msg) => setToast(msg)}
              orders={orders}
              products={products}
              promoCodes={promoCodes}
              properties={properties}
              setCategories={setCategories}
              setOrders={setOrders}
              setProducts={setProducts}
              setPromoCodes={setPromoCodes}
              setProperties={setProperties}
              setSettings={setSettings}
              setVehicles={setVehicles}
              settings={settings}
              vehicles={vehicles}
            />
          ) : (
            <div className="mx-auto max-w-md rounded-3xl border border-white bg-white/90 p-8 shadow-xl">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf5f0] text-[#4d7d65]">
                <LockKeyhole className="h-6 w-6" />
              </span>
              <h2 className="mt-4 text-xl font-bold text-[#2e4437]">
                {isArabic ? 'دخول لوحة تحكم ZEXOR' : 'Studio Administration Access'}
              </h2>
              <p className="mt-1 text-xs text-[#73857b]">
                {isArabic ? 'أدخل كلمة مرور الإدارة لفتح جميع أدوات التحكم.' : 'Enter admin studio password to unlock.'}
              </p>

              <form className="mt-6 space-y-4" onSubmit={handleAdminLogin}>
                <div>
                  <label className="text-xs font-semibold text-[#405449]">
                    {isArabic ? 'كلمة المرور' : 'Studio Password'}
                  </label>
                  <input
                    className="mt-1 h-11 w-full rounded-xl border border-[#dfe7e1] px-4 text-sm tracking-widest outline-none"
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                    type="password"
                    value={adminPassword}
                  />
                </div>
                {adminLoginError && (
                  <p className="text-xs font-medium text-[#b45248]">{adminLoginError}</p>
                )}
                <button
                  className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#314f43] text-xs font-semibold text-white shadow-md hover:bg-[#436e5d]"
                  type="submit"
                >
                  <LockKeyhole className="h-4 w-4" />
                  {isArabic ? 'فتح لوحة التحكم' : 'Unlock Dashboard'}
                </button>
              </form>

              {/* Recovery hint — only while the built-in demo password is active.
                  Set VITE_ADMIN_PASSWORD in a .env file to replace it. */}
              {ADMIN_PASSWORD === ADMIN_PASSWORD_FALLBACK && (
                <div className="mt-5 rounded-2xl border border-[#e3ede7] bg-[#f5faf7] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#7a9384]">
                    {isArabic ? 'كلمة المرور الافتراضية' : 'Default password'}
                  </p>
                  <p className="mt-1 text-xs text-[#4e6b5b]">
                    {isArabic ? 'استخدم:' : 'Use:'}{' '}
                    <code className="rounded-md bg-white px-2 py-0.5 font-bold tracking-wider text-[#26402f]">
                      {ADMIN_PASSWORD_FALLBACK}
                    </code>
                  </p>
                  <p className="mt-2 text-[10px] leading-5 text-[#7a9384]">
                    {isArabic
                      ? 'لتغييرها: أنشئ ملف .env واكتب فيه VITE_ADMIN_PASSWORD=كلمة_سرك_الجديدة'
                      : 'To change it: create a .env file with VITE_ADMIN_PASSWORD=your-new-password'}
                  </p>
                </div>
              )}
            </div>
          )
        )}
        </Suspense>
      </main>

      {/* Site Footer: navigation, contact and legal */}
      <SiteFooter
        isArabic={isArabic}
        locale={locale}
        market={market}
        navigate={navigate}
        onTrackOrder={() => setTrackingOpen(true)}
        settings={settings}
      />

      {/* 3. Floating WhatsApp Widget */}
      <a
        aria-label="Floating WhatsApp"
        className="fixed bottom-5 inset-e-5 z-40 flex h-14 items-center gap-2.5 rounded-full border border-white/70 bg-[#25855a] px-4.5 text-white shadow-xl transition-all duration-300 hover:scale-105 hover:bg-[#1d734c]"
        href={`https://wa.me/${market === 'eg' ? settings.whatsappEg : settings.whatsappKsa}?text=${encodeURIComponent(
          isArabic ? 'مرحباً ZEXOR، أود الاستفسار والتواصل السريع.' : 'Hello ZEXOR, I want to inquire.',
        )}`}
        rel="noreferrer"
        target="_blank"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="hidden text-xs font-bold sm:inline">
          {isArabic ? 'تواصل فوري واتساب' : 'Chat on WhatsApp'}
        </span>
      </a>

      {/* Back to top — appears after scrolling past the hero */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            animate={{ opacity: 1, scale: 1 }}
            aria-label={isArabic ? 'العودة للأعلى' : 'Back to top'}
            className="fixed bottom-5 inset-s-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/90 text-[#35614a] shadow-xl backdrop-blur-md transition-colors hover:bg-[#eef8f2]"
            exit={{ opacity: 0, scale: 0.9 }}
            initial={{ opacity: 0, scale: 0.9 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            type="button"
          >
            <ArrowUpRight className="h-5 w-5 -rotate-45" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* 4. Global Search Modal */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-110 flex items-start justify-center bg-black/45 p-4 pt-[10vh] backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSearchOpen(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setSearchOpen(false);
          }}
          role="presentation"
        >
          <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-white bg-white p-5 shadow-2xl">
            <div className="flex items-center gap-2.5 rounded-2xl border border-[#dfe7e1] px-3.5 py-2">
              <Search className="h-4 w-4 text-[#758a7e]" />
              <input
                autoFocus
                className="h-8 flex-1 text-xs outline-none"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isArabic ? 'ابحث في كافة الأقسام (ملابس، كروت، عقارات، سيارات، خدمات)…' : 'Search products, cars, properties, services…'}
                value={searchQuery}
              />
              <button onClick={() => setSearchOpen(false)} type="button">
                <X className="h-4 w-4 text-[#758a7e]" />
              </button>
            </div>

            <div className="mt-3 max-h-72 divide-y divide-[#edf1ee] overflow-y-auto">
              {searchResults.map((res, i) => (
                <button
                  className="flex w-full items-center justify-between p-3 text-start hover:bg-[#f2f7f4]"
                  key={res.title + i}
                  onClick={() => {
                    navigate(res.route);
                    setSearchOpen(false);
                  }}
                  type="button"
                >
                  <div>
                    <h4 className="text-xs font-bold text-[#2e4437]">{res.title}</h4>
                    <p className="text-[10px] text-[#718478]">{res.desc}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-[#5e8b75]" />
                </button>
              ))}
              {searchQuery && searchResults.length === 0 && (
                <p className="py-6 text-center text-xs text-[#829288]">
                  {isArabic ? 'لا توجد نتائج مطابقة.' : 'No results found.'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Wishlist Modal */}
      {wishlistOpen && (
        <div
          className="fixed inset-0 z-110 flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) setWishlistOpen(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setWishlistOpen(false);
          }}
          role="presentation"
        >
          <div className="w-full max-w-md rounded-3xl border border-white bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#2d4236]">
                {isArabic ? 'قائمة الرغبات والمفضلة' : 'Your Wishlist'} ({wishlist.length})
              </h3>
              <button onClick={() => setWishlistOpen(false)} type="button">
                <X className="h-4 w-4 text-[#758a7e]" />
              </button>
            </div>

            <div className="mt-4 max-h-80 divide-y divide-[#edf1ee] overflow-y-auto">
              {products
                .filter((p) => wishlist.includes(p.id))
                .map((p) => (
                  <div className="flex items-center justify-between py-3" key={p.id}>
                    <div className="flex items-center gap-3">
                      <img alt={p.name[locale]} className="h-12 w-12 rounded-xl object-cover" src={p.imageUrl} />
                      <div>
                        <h4 className="text-xs font-bold text-[#2d4236]">{p.name[locale]}</h4>
                        <p className="text-[10px] text-[#55826c]">
                          {money(p.price[market], market, locale)}
                        </p>
                      </div>
                    </div>
                    <button
                      className="rounded-full bg-[#314f43] px-3 py-1.5 text-[10px] font-semibold text-white"
                      onClick={() => {
                        handleAddToCart(p);
                        setWishlistOpen(false);
                      }}
                      type="button"
                    >
                      {isArabic ? 'أضف للسلة' : 'Add'}
                    </button>
                  </div>
                ))}
              {wishlist.length === 0 && (
                <p className="py-8 text-center text-xs text-[#829288]">
                  {isArabic ? 'قائمة المفضلة فارغة حالياً.' : 'Your wishlist is empty.'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. Live NFC 3D Customizer Modal */}
      {selectedNfcProduct && (
        <NfcCustomizerModal
          locale={locale}
          market={market}
          onAddToCart={(p, custom) => handleAddToCart(p, custom)}
          onClose={() => setNfcModalOpen(false)}
          onOrderWhatsApp={(m, text) => openWhatsApp(whatsappNumberFor(m, settings), text)}
          open={nfcModalOpen}
          product={selectedNfcProduct}
        />
      )}

      {/* 7. Interactive Cart & Checkout Drawer */}
      <CheckoutDrawer
        cart={cart}
        locale={locale}
        market={market}
        onClose={() => setCartOpen(false)}
        onOrderComplete={(order) => {
          setOrders((prev) => [order, ...prev]);
          setCart([]);
          setToast(isArabic ? 'تم تأكيد طلبك بنجاح وفتح واتساب!' : 'Order confirmed & WhatsApp ready!');
        }}
        onQuantityChange={(prodId, delta) => {
          setCart((curr) =>
            curr
              .map((line) => (line.productId === prodId ? { ...line, quantity: line.quantity + delta } : line))
              .filter((line) => line.quantity > 0),
          );
        }}
        onRemoveItem={(prodId) => {
          setCart((curr) => curr.filter((line) => line.productId !== prodId));
        }}
        onToast={(msg) => setToast(msg)}
        open={cartOpen}
        products={products}
        promoCodes={promoCodes}
        settings={settings}
      />

      {/* 8. Live Shipment & Order Tracking Modal */}
      <TrackingModal
        locale={locale}
        market={market}
        onClose={() => setTrackingOpen(false)}
        open={trackingOpen}
        orders={orders}
        whatsappNumber={market === 'eg' ? settings.whatsappEg : settings.whatsappKsa}
      />

      {/* 9. Notification Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 inset-x-0 mx-auto z-120 flex w-fit max-w-sm items-center gap-2 rounded-full border border-white bg-[#1f382c] px-5 py-3 text-xs font-semibold text-white shadow-2xl backdrop-blur-md"
            exit={{ opacity: 0, y: 8 }}
            initial={{ opacity: 0, y: 8 }}
          >
            <Sparkles className="h-4 w-4 text-[#7cdbb0]" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
