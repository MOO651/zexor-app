import {
  AnimatePresence,
  motion,
} from 'framer-motion';
import {
  ArrowUpRight,
  BellRing,
  ChevronDown,
  Clock,
  Fingerprint,
  Globe2,
  Heart,
  LockKeyhole,
  Menu,
  MessageCircle,
  Moon,
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
  useRef,
  useState,
} from 'react';
import {
  DEFAULT_SETTINGS,
  INITIAL_CATEGORIES,
  normalizeCategories,
  normalizeLegacyProductCategories,
  normalizeLegacySectionTitles,
  normalizeStarterProductImages,
  normalizeStarterVehicles,
  normalizeStarterProperties,
  INITIAL_PRODUCTS,
  INITIAL_PROPERTIES,
  INITIAL_VEHICLES,
  AGENCY_PROJECTS,
  STATS,
} from './data/initialData';
import { HomeHero, TiltCard } from './components/HomeHero';
import { BrandIdentityBlock } from './components/BrandIdentityBlock';
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
import { DepartmentBanner } from './components/DepartmentBanner';
import { DepartmentEmptyState } from './components/DepartmentEmptyState';
import { ProductCard } from './components/ProductCard';
import { art } from './data/imagery';
import { PORTALS } from './data/portals';
import { useSiteContent } from './lib/siteMediaContext';
import { isSupabaseConfigured, supabase } from '../supabase';
import {
  blankPaymentMethod,
  blankSocialLink,
  clearAdminInquiries,
  clearAdminOrders,
  deleteAdminOrder,
  deletePaymentMethod,
  deleteSocialLink,
  createCloudOrder,
  createPaymobCheckout,
  deleteAdminInquiry,
  createCloudInquiry,
  fetchAdminInquiries,
  fetchPrivateSiteSecrets,
  fetchAdminOrders,
  fetchPaymentMethods,
  fetchStoreContent,
  fetchSiteSettings,
  fetchSocialLinks,
  pingSiteData,
  savePaymentMethod,
  saveAdminOrders,
  saveAdminInquiries,
  saveAdminOrder,
  savePrivateSiteSecrets,
  saveSiteSettings,
  saveStoreContent,
  setCloudProductStock,
  updateCloudOrderStatus,
  updateCloudOrderShipping,
  updateCloudInquiryStatus,
  saveSocialLink,
  SOCIAL_PLATFORMS,
  PAYMENT_METHODS_BY_MARKET,
  type PaymentMethod,
  type SocialLink,
  type StoreContentKey,
} from './lib/siteData';
import type {
  CartLine,
  CustomerOrder,
  DynamicCategory,
  Locale,
  Market,
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
  DEFAULT_LOCALE,
  currencySymbol,
  formatNumber,
  isValidObject,
  isValidObjectArray,
  mergeSettings,
  money,
  publicAssetUrl,
  routeFromHash,
  whatsappLink,
  whatsappNumberFor,
} from './utils';

const STORAGE = {
  locale: 'zexor-locale',
  market: 'zexor-market-v1',
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

function detectVisitorMarket(): Market {
  try {
    const stored = window.localStorage.getItem(STORAGE.market);
    if (stored === 'eg' || stored === 'ksa') return stored;
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timeZone === 'Asia/Riyadh') return 'ksa';
  } catch {
    // Fall back to Egypt if browser storage or locale detection is unavailable.
  }
  return 'eg';
}

function readStorage<T>(key: string, fallback: T, isValid?: (value: unknown) => boolean): T {
  try {
    const value = window.localStorage.getItem(key);
    if (!value) return fallback;
    const parsed = JSON.parse(value) as unknown;
    if (isValid && !isValid(parsed)) return fallback;
    if (key === STORAGE.settings && parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return { ...parsed, telegramBotToken: '', telegramChatId: '' } as T;
    }
    return parsed as T;
  } catch {
    return fallback;
  }
}

function detectPreferredTheme(): 'light' | 'dark' {
  const stored = readStorage<unknown>(STORAGE.theme, null);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function isValidTheme(value: unknown): value is 'light' | 'dark' {
  return value === 'light' || value === 'dark';
}

// Lets useStoredState tell the caller when persistence fails (quota exceeded or
// storage disabled in private mode) so the UI can warn instead of silently losing data.
type StorageWriteHandler = (failed: boolean) => void;
let onStorageWriteError: StorageWriteHandler | null = null;

function useStoredState<T>(key: string, initial: T, isValid?: (value: unknown) => boolean) {
  const [value, setValue] = useState<T>(() => readStorage(key, initial, isValid));
  useEffect(() => {
    try {
      const safeValue = key === STORAGE.settings && value && typeof value === 'object'
        ? { ...(value as Record<string, unknown>), telegramBotToken: '', telegramChatId: '' }
        : value;
      window.localStorage.setItem(key, JSON.stringify(safeValue));
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

function mergeRemoteRows<T extends { id: string; createdAt: string }>(
  remoteRows: T[],
  currentRows: T[],
  previouslySyncedIds: Set<string>,
): T[] {
  const remoteIds = new Set(remoteRows.map((row) => row.id));
  const pendingLocalRows = currentRows.filter((row) =>
    !previouslySyncedIds.has(row.id) && !remoteIds.has(row.id),
  );
  return [...remoteRows, ...pendingLocalRows].sort((left, right) => {
    const leftTime = Date.parse(left.createdAt) || 0;
    const rightTime = Date.parse(right.createdAt) || 0;
    return rightTime - leftTime;
  });
}

function completeSocialRows(remoteRows: SocialLink[]): SocialLink[] {
  const builtIn = SOCIAL_PLATFORMS.map((platform, index) =>
    remoteRows.find((row) => row.platform === platform) ?? blankSocialLink(platform, index),
  );
  const custom = remoteRows.filter((row) => !SOCIAL_PLATFORMS.includes(row.platform as typeof SOCIAL_PLATFORMS[number]));
  return [...builtIn, ...custom];
}

function completePaymentRows(remoteRows: PaymentMethod[]): PaymentMethod[] {
  const configured = (['eg', 'ksa'] as const).flatMap((market) =>
    PAYMENT_METHODS_BY_MARKET[market].map((item, index) =>
      remoteRows.find((row) => row.method === item.method && row.market === market)
        ?? { ...blankPaymentMethod(item.method, market, index), active: item.active },
    ),
  );
  const custom = remoteRows.filter((row) =>
    !PAYMENT_METHODS_BY_MARKET[row.market].some((item) => item.method === row.method),
  );
  return [...configured, ...custom];
}

/**
 * Opens a pre-filled WhatsApp chat for the given number in a new tab.
 * Centralised so every CTA (cars, property, services, contact, NFC) behaves the same.
 */
function openWhatsApp(number: string, message: string) {
  window.open(whatsappLink(number, message), '_blank', 'noopener,noreferrer');
}

/**
 * Renders one price as two isolated runs — the numeral and the currency word.
 *
 * A single string such as "٣٥٠ ج.م" is unreliable in an RTL document: the
 * browser may reorder the digits and the currency, and two price strings dropped
 * into a flex row can collapse together with no visible gap. Wrapping each half
 * in its own `bdi` (which imposes unicode-bidi isolation) keeps the numeral and
 * its currency adjacent, correctly ordered, and cleanly separated from any
 * neighbouring price.
 */
function PriceTag({
  className,
  price,
  market,
  locale,
}: {
  className?: string;
  price: number;
  market: Market;
  locale: Locale;
}) {
  /*
   * Read this carefully before changing the order again — it was wrong four
   * times.
   *
   * In an RTL flex row the FIRST DOM child is painted on the RIGHT, and the eye
   * reads it first. Arabic prices are written and read number-first, so the
   * numeral must be the first DOM child; the currency then lands to its left,
   * producing `450 ج.م` on screen.
   *
   * Each half is wrapped in its own `bdi` with `unicode-bidi: isolate` so the
   * bidi algorithm cannot merge them into one run (which is what dragged the
   * `ج.م` dot out of place) and cannot swap them against the surrounding text.
   */
  return (
    <span
      className={`inline-flex items-baseline gap-1 whitespace-nowrap font-bold ${className ?? ''}`}
      dir="rtl"
    >
      <bdi className="[unicode-bidi:isolate]">{formatNumber(price)}</bdi>
      <bdi className="[unicode-bidi:isolate]">{currencySymbol(market, locale)}</bdi>
    </span>
  );
}

/**
 * Skeleton shown while a lazily-loaded route surface (admin, marketplace,
 * checkout) downloads. Keeps the layout stable instead of flashing empty.
 */
function RouteFallback({ label }: { label: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <span className="h-10 w-10 animate-spin rounded-full border-2 border-zx-border border-t-zx-accent" />
      <p className="text-xs font-semibold text-zx-text">{label}</p>
    </div>
  );
}

function LogoMark({ compact = false, logoUrl = '' }: { compact?: boolean; logoUrl?: string }) {
  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-[1.15rem] border border-zx-border/80 bg-linear-to-br from-zx-surface-raised via-zx-mint to-zx-mint shadow-md ${
        compact ? 'h-9 w-9 rounded-xl' : 'h-12 w-12'
      }`}
    >
      {logoUrl ? (
        <img alt="" aria-hidden="true" className="relative z-10 h-full w-full object-contain p-1" data-no-photo-grade="true" src={publicAssetUrl(logoUrl)} />
      ) : (
        <svg aria-hidden="true" className="relative z-10 h-[76%] w-[76%]" fill="none" viewBox="0 0 48 48">
          <path d="M12 14.5h24L12 33.5h24" stroke="var(--zx-text-secondary)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5.5" />
          <path d="M35.5 11.5a17 17 0 0 1 3.7 5.2M12.1 36.5a17 17 0 0 1-3.4-5.1" stroke="var(--zx-accent)" strokeLinecap="round" strokeWidth="2.5" />
          <circle cx="36" cy="12" r="3" fill="var(--zx-mint)" />
          <circle cx="12" cy="36" r="2.2" fill="var(--zx-mint)" />
        </svg>
      )}
      <span aria-hidden="true" className="absolute -right-2 -top-3 h-8 w-8 rounded-full bg-zx-surface-raised/75 blur-md" />
    </span>
  );
}

function DesktopPointerEffects({ locale }: { locale: Locale }) {
  const dotRef = useRef<HTMLSpanElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const pointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (!pointerQuery.matches) return undefined;

    const body = document.body;
    let activeMagnet: HTMLElement | null = null;
    body.classList.add('zx-custom-cursor-enabled');

    const resetMagnet = () => {
      activeMagnet?.style.removeProperty('translate');
      activeMagnet = null;
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const { clientX, clientY } = event;
      const position = `translate3d(${clientX}px, ${clientY}px, 0) translate(-50%, -50%)`;
      if (dotRef.current) dotRef.current.style.transform = position;
      if (ringRef.current) {
        ringRef.current.style.transform = position;
        ringRef.current.dataset.view = event.target instanceof Element
          && Boolean(event.target.closest('[data-cursor="view"]'))
          ? 'true'
          : 'false';
      }
      body.classList.add('zx-custom-cursor-visible');

      const target = event.target instanceof Element ? event.target : null;
      const magnet = target?.closest<HTMLElement>(
        '.zx-magnetic, .zx-app-shell button.bg-zx-cinematic, .zx-app-shell a.bg-zx-cinematic',
      ) ?? null;
      if (magnet !== activeMagnet) {
        resetMagnet();
        activeMagnet = magnet;
      }
      if (magnet) {
        const rect = magnet.getBoundingClientRect();
        const offsetX = ((clientX - rect.left) / rect.width - 0.5) * 8;
        const offsetY = ((clientY - rect.top) / rect.height - 0.5) * 8;
        magnet.style.setProperty('translate', `${offsetX}px ${offsetY}px`);
      }
    };
    const onPointerDown = () => {
      if (ringRef.current) ringRef.current.dataset.down = 'true';
    };
    const onPointerUp = () => {
      if (ringRef.current) ringRef.current.dataset.down = 'false';
    };
    const onPointerLeave = () => {
      body.classList.remove('zx-custom-cursor-visible');
      resetMagnet();
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointerleave', onPointerLeave);
      body.classList.remove('zx-custom-cursor-enabled', 'zx-custom-cursor-visible');
      resetMagnet();
    };
  }, []);

  return (
    <div aria-hidden="true" className="zx-desktop-cursor">
      <span className="zx-custom-cursor-dot" ref={dotRef} />
      <span className="zx-custom-cursor-ring" data-down="false" data-view="false" ref={ringRef}>
        <span>{locale === 'ar' ? 'عرض' : 'View'}</span>
      </span>
    </div>
  );
}

const sameCartLine = (left: CartLine, right: CartLine) =>
  left.productId === right.productId && left.variant === right.variant && left.nfcCustomization === right.nfcCustomization;

export default function App() {
  // 👇 التحقق السريع من الـ Hash لعرض الكارت فوراً من Supabase.
  // ملاحظة: هذا الفحص كان موضوعاً قبل الـ hooks (return مبكر) مما يخلّ بقواعد
  // الـ Hooks ويهدم الشجرة عند التنقل — لذا أُزيل من هنا ونُقل إلى نقطة الدخول
  // في `main.tsx` التي تعرض CardView مباشرةً عند فتح رابط #card/<id>.

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
  const [theme, setTheme] = useStoredState<'light' | 'dark'>(STORAGE.theme, detectPreferredTheme(), isValidTheme);
  const [wishlist, setWishlist] = useStoredState<string[]>(STORAGE.wishlist, []);
  const [inbox, setInbox] = useStoredState<PlatformInquiry[]>(STORAGE.inbox, [], isValidObjectArray);
  const [promoCodes, setPromoCodes] = useStoredState<PromoCode[]>(STORAGE.promoCodes, [
    { code: 'ZEXOR15', discount: 15, expiresAt: '2026-12-31', active: true },
    { code: 'VIP20', discount: 20, expiresAt: '2026-12-31', active: true },
  ], isValidObjectArray);
  const [vehicles, setVehicles] = useStoredState<Vehicle[]>('zexor-vehicles-v3', INITIAL_VEHICLES, isValidObjectArray);
  const [properties, setProperties] = useStoredState<Property[]>('zexor-properties-v3', INITIAL_PROPERTIES, isValidObjectArray);
  const [settings, setSettings] = useStoredState<SiteSettings>(STORAGE.settings, DEFAULT_SETTINGS, isValidObject);
  const storeContentSnapshot = useRef({ products, categories, vehicles, properties, promoCodes });
  useEffect(() => {
    storeContentSnapshot.current = { products, categories, vehicles, properties, promoCodes };
  }, [products, categories, vehicles, properties, promoCodes]);
  const syncedStoreContent = useRef<Record<StoreContentKey, string> | null>(null);
  useEffect(() => {
    setCategories((current) => normalizeCategories(current));
    setProducts((current) => normalizeLegacyProductCategories(normalizeStarterProductImages(current)));
    setVehicles((current) => normalizeStarterVehicles(current));
    setProperties((current) => normalizeStarterProperties(current));
  }, [setCategories, setProducts, setVehicles, setProperties]);
  // True once the settings document has been read from Supabase at least once.
  // Every cloud write stays gated on this so a boot-time default can never race
  // the initial read and overwrite the row that is still being fetched.
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [storeContentLoaded, setStoreContentLoaded] = useState(false);
  const [cloudOrdersLoaded, setCloudOrdersLoaded] = useState(false);
  const [cloudInquiriesLoaded, setCloudInquiriesLoaded] = useState(false);
  const [privateSecretsLoaded, setPrivateSecretsLoaded] = useState(false);
  const cloudOrderIds = useRef(new Set<string>());
  const cloudInquiryIds = useRef(new Set<string>());

  /*
   * Supabase-backed stores. The admin dashboard edits these, and the storefront
   * renders them (footer socials, wallet payment instructions at checkout).
   * They seed with the built-in defaults so the site looks complete even before
   * the tables exist in the database.
   */
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(() =>
    SOCIAL_PLATFORMS.map((platform, i) => {
      const blank = blankSocialLink(platform, i);
      // Instagram and TikTok start from the brand's live handle so the footer
      // keeps working before the admin has saved anything.
      if (platform === 'instagram') {
        return { ...blank, handle: 'zexor.digtal.studio', url: 'https://www.instagram.com/zexor.digtal.studio' };
      }
      if (platform === 'tiktok') {
        return { ...blank, handle: 'zexor.digtal.studio', url: 'https://www.tiktok.com/@zexor.digtal.studio' };
      }
      return blank;
    }),
  );
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(() =>
    (['eg', 'ksa'] as const).flatMap((market) => PAYMENT_METHODS_BY_MARKET[market].map((item, i) => ({
      ...blankPaymentMethod(item.method, market, i),
      active: item.active,
      instructions: item.method === 'visa'
        ? { ar: 'الدفع بالبطاقة عبر صفحة Paymob الآمنة بعد تأكيد الطلب.', en: 'Pay by card through Paymob’s secure checkout after order confirmation.' }
        : item.method === 'fawry'
          ? { ar: 'الدفع عبر فوري من صفحة Paymob الآمنة بعد تأكيد الطلب.', en: 'Pay through Fawry on Paymob’s secure checkout after order confirmation.' }
          : blankPaymentMethod(item.method, market, i).instructions,
    }))),
  );
  // Tracks whether the Supabase read has completed so the admin header can show
  // a meaningful "database connected / offline fallback" badge.
  const [siteDataReady, setSiteDataReady] = useState(false);

  /*
   * Pull every admin-managed value from Supabase once on boot. A `null` result
   * means the table is missing or the network failed — in that case we keep
   * whatever localStorage had, so the storefront never regresses.
   */
  useEffect(() => {
    let active = true;
    void (async () => {
      const [remoteSettings, remoteSocials, remotePayments, connected] = await Promise.all([
        fetchSiteSettings(DEFAULT_SETTINGS),
        fetchSocialLinks(),
        fetchPaymentMethods(),
        pingSiteData(),
      ]);
      if (!active) return;
      if (remoteSettings) setSettings((current) => ({
        ...remoteSettings,
        telegramBotToken: current.telegramBotToken,
        telegramChatId: current.telegramChatId,
      }));
      if (remoteSocials) {
        // Keep every supported platform in the editor even if it has no row yet.
        setSocialLinks(completeSocialRows(remoteSocials));
      }
      if (remotePayments) setPaymentMethods(completePaymentRows(remotePayments));
      setSiteDataReady(connected);
      setSettingsLoaded(true);
    })();
    return () => {
      active = false;
    };
  }, [setSettings]);

  useEffect(() => {
    let active = true;
    const keys: StoreContentKey[] = ['products', 'categories', 'vehicles', 'properties', 'promo_codes'];
    void Promise.all(keys.map((key) => fetchStoreContent<unknown>(key))).then((values) => {
      if (!active) return;
      const [remoteProducts, remoteCategories, remoteVehicles, remoteProperties, remotePromos] = values;
      const loadedProducts = isValidObjectArray(remoteProducts)
        ? normalizeLegacyProductCategories(normalizeStarterProductImages(remoteProducts as Product[]))
        : storeContentSnapshot.current.products;
      const loadedCategories = isValidObjectArray(remoteCategories)
        ? normalizeCategories(remoteCategories as DynamicCategory[])
        : storeContentSnapshot.current.categories;
      const loadedVehicles = isValidObjectArray(remoteVehicles)
        ? normalizeStarterVehicles(remoteVehicles as Vehicle[])
        : storeContentSnapshot.current.vehicles;
      const loadedProperties = isValidObjectArray(remoteProperties)
        ? normalizeStarterProperties(remoteProperties as Property[])
        : storeContentSnapshot.current.properties;
      const loadedPromos = isValidObjectArray(remotePromos)
        ? remotePromos as PromoCode[]
        : storeContentSnapshot.current.promoCodes;
      syncedStoreContent.current = {
        products: JSON.stringify(loadedProducts),
        categories: JSON.stringify(loadedCategories),
        vehicles: JSON.stringify(loadedVehicles),
        properties: JSON.stringify(loadedProperties),
        promo_codes: JSON.stringify(loadedPromos),
      };
      if (isValidObjectArray(remoteProducts)) setProducts(loadedProducts);
      if (isValidObjectArray(remoteCategories)) setCategories(loadedCategories);
      if (isValidObjectArray(remoteVehicles)) setVehicles(loadedVehicles);
      if (isValidObjectArray(remoteProperties)) setProperties(loadedProperties);
      if (isValidObjectArray(remotePromos)) setPromoCodes(loadedPromos);
      setStoreContentLoaded(true);
    });
    return () => { active = false; };
  }, [setProducts, setCategories, setVehicles, setProperties, setPromoCodes]);

  // Keep already-open storefront tabs aligned with published admin changes.
  // Realtime is enabled only for publicly readable tables; order and inquiry
  // payloads remain on the separately authenticated admin channel below.
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    const refreshSettings = () => {
      void fetchSiteSettings(DEFAULT_SETTINGS).then((remote) => {
        if (!active || !remote) return;
        setSettings((current) => ({
          ...remote,
          telegramBotToken: current.telegramBotToken,
          telegramChatId: current.telegramChatId,
        }));
      });
    };
    const refreshSocials = () => {
      void fetchSocialLinks(false).then((remote) => {
        if (active && remote) setSocialLinks(completeSocialRows(remote));
      });
    };
    const refreshPayments = () => {
      void fetchPaymentMethods(false).then((remote) => {
        if (active && remote) setPaymentMethods(completePaymentRows(remote));
      });
    };
    const refreshContent = (payload: { new?: unknown; old?: unknown }) => {
      const changedRow = (payload.new ?? payload.old) as { key?: unknown } | undefined;
      const key = changedRow?.key;
      if (typeof key !== 'string' || !['products', 'categories', 'vehicles', 'properties', 'promo_codes'].includes(key)) return;
      void fetchStoreContent<unknown>(key as StoreContentKey).then((remote) => {
        if (!active || !isValidObjectArray(remote)) return;
        if (key === 'products') setProducts(normalizeLegacyProductCategories(normalizeStarterProductImages(remote as Product[])));
        else if (key === 'categories') setCategories(normalizeCategories(remote as DynamicCategory[]));
        else if (key === 'vehicles') setVehicles(normalizeStarterVehicles(remote as Vehicle[]));
        else if (key === 'properties') setProperties(normalizeStarterProperties(remote as Property[]));
        else setPromoCodes(remote as PromoCode[]);
      });
    };
    const channel = supabase.channel('zexor-published-store-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, refreshSettings)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'social_links' }, refreshSocials)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payment_methods' }, refreshPayments)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'store_content' }, refreshContent)
      .subscribe();
    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [setCategories, setPaymentMethods, setProducts, setPromoCodes, setProperties, setSettings, setSocialLinks, setVehicles]);

  // Merge the persisted settings over the current defaults so a payload written
  // by an earlier build (before `brand`/`content`/`maintenanceText` existed) still
  // renders every field instead of crashing on an undefined lookup.
  const resolvedSettings = useMemo<SiteSettings>(
    () => normalizeLegacySectionTitles(mergeSettings(DEFAULT_SETTINGS, settings)),
    [settings],
  );
  const { content: siteContent, getText: getResolvedSiteText } = useSiteContent();
  const getSiteText = (key: string, language: Locale) => (
    siteContent[key]?.source === 'published'
      ? getResolvedSiteText(key, language)
      : null
  );

  const [route, setRoute] = useState<Route>(pageFromHash);
  useEffect(() => {
    if (route === 'admin' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -28px 0px' });
    const selector = '.zx-app-shell > main section:not(.five-windows-scene):not(.nfc-one-touch-scene):not(.zx-lookbook-scene):not(.studio-chapter):not(.cars-chapter):not(.estate-chapter), .zx-department-board, .zx-marketplace section, .zx-agency-page section, .zx-product, .zx-market-card, .zx-department-tile, .zx-showcase-card';
    let order = 0;
    const observeTargets = (root: ParentNode) => {
      if (root instanceof HTMLElement && root.matches(selector) && !root.classList.contains('zx-reveal')) {
        root.classList.add('zx-reveal');
        root.style.setProperty('--zx-reveal-order', String(order++ % 5));
        observer.observe(root);
      }
      root.querySelectorAll<HTMLElement>(selector).forEach((target) => {
        if (target.classList.contains('zx-reveal')) return;
        target.classList.add('zx-reveal');
        target.style.setProperty('--zx-reveal-order', String(order++ % 5));
        observer.observe(target);
      });
    };
    const appRoot = document.querySelector('.zx-app-shell') ?? document.body;
    observeTargets(appRoot);
    const mutations = new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach((node) => {
        if (node instanceof Element) observeTargets(node);
      }));
    });
    mutations.observe(appRoot, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, [route]);

  useEffect(() => {
    const appRoot = document.querySelector('.zx-app-shell');
    if (!appRoot) return undefined;

    const markImageReady = (image: HTMLImageElement) => {
      if (image.complete) image.dataset.loaded = 'true';
    };
    const handleImageLoad = (event: Event) => {
      if (event.target instanceof HTMLImageElement) event.target.dataset.loaded = 'true';
    };
    const handleImageError = (event: Event) => {
      if (event.target instanceof HTMLImageElement) event.target.dataset.loaded = 'true';
    };
    const markAddedImages = (node: Node) => {
      if (!(node instanceof Element)) return;
      if (node instanceof HTMLImageElement) markImageReady(node);
      node.querySelectorAll('img').forEach(markImageReady);
    };

    appRoot.querySelectorAll('img').forEach(markImageReady);
    appRoot.addEventListener('load', handleImageLoad, true);
    appRoot.addEventListener('error', handleImageError, true);
    const observer = new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach(markAddedImages));
    });
    observer.observe(appRoot, { childList: true, subtree: true });

    return () => {
      appRoot.removeEventListener('load', handleImageLoad, true);
      appRoot.removeEventListener('error', handleImageError, true);
      observer.disconnect();
    };
  }, []);

  const [market, setMarket] = useStoredState<Market>(STORAGE.market, detectVisitorMarket(), (value) => value === 'eg' || value === 'ksa');
  const [selectedSubcategories, setSelectedSubcategories] = useState<Record<string, string>>({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [navigationHidden, setNavigationHidden] = useState(false);
  const [navigationCompact, setNavigationCompact] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [routeCurtainVisible, setRouteCurtainVisible] = useState(false);
  const [cartFlight, setCartFlight] = useState<{
    id: number;
    src: string;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);
  const cartButtonRef = useRef<HTMLButtonElement>(null);
  const cartFlightSequence = useRef(0);
  const previousScrollY = useRef(0);
  const scrollFrame = useRef<number | null>(null);
  const routeCurtainTimer = useRef<number | null>(null);
  const [toast, setToast] = useState('');
  const cloudSyncWarnings = useRef(new Set<string>());
  const reportCloudSave = useCallback((key: string, saved: boolean, label: string) => {
    if (saved) {
      cloudSyncWarnings.current.delete(key);
      return;
    }
    if (cloudSyncWarnings.current.has(key)) return;
    cloudSyncWarnings.current.add(key);
    setToast(locale === 'ar'
      ? `تعذرت مزامنة ${label} مع قاعدة البيانات. راجع الاتصال قبل مغادرة الصفحة.`
      : `Could not sync ${label} to the database. Check the connection before leaving.`);
  }, [locale]);

  // NFC Customizer Modal State
  const [nfcModalOpen, setNfcModalOpen] = useState(false);
  const [selectedNfcProduct, setSelectedNfcProduct] = useState<Product | null>(null);
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [restockName, setRestockName] = useState('');
  const [restockPhone, setRestockPhone] = useState('');

  // Admin Login State
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');
  const [adminAuthLoading, setAdminAuthLoading] = useState(false);

  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return;
      const { data: allowed, error } = await supabase.rpc('is_store_admin');
      if (active && !error && allowed === true) setAdminAuthenticated(true);
      else if (active) await supabase.auth.signOut();
    });
    return () => { active = false; };
  }, []);

  const isArabic = locale === 'ar';
  const dir = isArabic ? 'rtl' : 'ltr';

  const handleSaveSiteSettings = useCallback(async () => {
    const saved = await saveSiteSettings(settings);
    reportCloudSave('settings', saved, isArabic ? 'إعدادات الموقع' : 'site settings');
    if (saved) {
      cloudSyncWarnings.current.delete('settings');
      setToast(isArabic ? 'اتحفظت إعدادات الموقع على قاعدة البيانات.' : 'Site settings saved to the database.');
    }
    return saved;
  }, [isArabic, reportCloudSave, settings]);

  // Warn (once) when the browser refuses to persist state, so the user knows
  // their cart/orders are only kept for this session.
  const storageWarning = isArabic
    ? 'تنبيه: تعذر حفظ بياناتك في المتصفح.'
    : 'Heads up: your data could not be saved in this browser.';

  useEffect(() => {
    let warned = false;
    let active = true;
    onStorageWriteError = (failed) => {
      if (failed && !warned && active) {
        warned = true;
        setToast(storageWarning);
      }
    };
    return () => {
      active = false;
      onStorageWriteError = null;
    };
  }, [storageWarning]);

  const startRouteCurtain = useCallback(() => {
    setRouteCurtainVisible(true);
    if (routeCurtainTimer.current !== null) window.clearTimeout(routeCurtainTimer.current);
    routeCurtainTimer.current = window.setTimeout(() => {
      setRouteCurtainVisible(false);
      routeCurtainTimer.current = null;
    }, 360);
  }, []);

  const navigate = useCallback((next: Route) => {
    const target = `#${next}`;
    if (next !== routeFromHash(window.location.hash)) startRouteCurtain();
    if (window.location.hash !== target) window.history.pushState({ route: next }, '', target);
    setRoute(next);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [startRouteCurtain]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [menuOpen]);

  useEffect(() => () => {
    if (routeCurtainTimer.current !== null) window.clearTimeout(routeCurtainTimer.current);
  }, []);

  /*
   * Mirror the settings document back to Supabase. Gated on `adminAuthenticated`
   * so a public visitor's boot-time defaults can never overwrite the published
   * row, and on `settingsLoaded` so the write cannot race the initial read.
   */
  useEffect(() => {
    if (!settingsLoaded || !adminAuthenticated) return;
    const timer = window.setTimeout(() => {
      void saveSiteSettings(settings).then((saved) => reportCloudSave('settings', saved, isArabic ? 'إعدادات الموقع' : 'site settings'));
    }, 350);
    return () => window.clearTimeout(timer);
  }, [settings, settingsLoaded, adminAuthenticated, isArabic, reportCloudSave]);

  useEffect(() => {
    if (!storeContentLoaded || !adminAuthenticated || !syncedStoreContent.current) return;
    const timer = window.setTimeout(() => {
      const documents: [StoreContentKey, unknown, string, string][] = [
        ['products', products, 'المنتجات', 'products'],
        ['categories', categories, 'الأقسام', 'categories'],
        ['vehicles', vehicles, 'السيارات', 'vehicles'],
        ['properties', properties, 'العقارات', 'properties'],
        ['promo_codes', promoCodes, 'أكواد الخصم', 'promo codes'],
      ];
      const changedDocuments = documents.filter(([key, value]) =>
        JSON.stringify(value) !== syncedStoreContent.current?.[key],
      );
      if (!changedDocuments.length) return;
      void Promise.all(changedDocuments.map(async ([key, value, labelAr, labelEn]) => ({
        key,
        value,
        label: isArabic ? labelAr : labelEn,
        saved: await saveStoreContent(key, value),
      }))).then((results) => {
        const failed = results.filter((result) => !result.saved);
        for (const result of results) {
          if (result.saved && syncedStoreContent.current) {
            syncedStoreContent.current[result.key] = JSON.stringify(result.value);
          }
        }
        if (failed.length) {
          console.error('ZEXOR store content sync failed:', failed.map(({ key }) => key));
        }
        const label = failed.length
          ? failed.map(({ label: item }) => item).join(isArabic ? '، ' : ', ')
          : isArabic ? 'بيانات المتجر' : 'store data';
        reportCloudSave('content', failed.length === 0, label);
      });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [products, categories, vehicles, properties, promoCodes, storeContentLoaded, adminAuthenticated, isArabic, reportCloudSave]);

  useEffect(() => {
    if (!adminAuthenticated) return;
    let active = true;
    void fetchAdminOrders().then((remoteOrders) => {
      if (!active) return;
      if (remoteOrders) {
        cloudOrderIds.current = new Set(remoteOrders.map((order) => order.id));
        setOrders((localOrders) => {
          const remoteIds = new Set(remoteOrders.map((order) => order.id));
          return [...remoteOrders, ...localOrders.filter((order) => !remoteIds.has(order.id))];
        });
      }
      setCloudOrdersLoaded(true);
    });
    return () => { active = false; };
  }, [adminAuthenticated, setOrders]);

  useEffect(() => {
    if (!adminAuthenticated || !cloudOrdersLoaded) return;
    const unimportedOrders = orders.filter((order) => !cloudOrderIds.current.has(order.id));
    if (!unimportedOrders.length) return;
    const timer = window.setTimeout(() => {
      void saveAdminOrders(unimportedOrders).then((saved) => {
        if (saved) unimportedOrders.forEach((order) => cloudOrderIds.current.add(order.id));
        reportCloudSave('orders', saved, isArabic ? 'الطلبات' : 'orders');
      });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [adminAuthenticated, cloudOrdersLoaded, orders, isArabic, reportCloudSave]);

  useEffect(() => {
    if (!adminAuthenticated) return;
    let active = true;
    void fetchAdminInquiries().then((remoteInquiries) => {
      if (!active) return;
      if (remoteInquiries) {
        cloudInquiryIds.current = new Set(remoteInquiries.map((inquiry) => inquiry.id));
        setInbox((localInquiries) => {
          const remoteIds = new Set(remoteInquiries.map((inquiry) => inquiry.id));
          return [...remoteInquiries, ...localInquiries.filter((inquiry) => !remoteIds.has(inquiry.id))];
        });
      }
      setCloudInquiriesLoaded(true);
    });
    return () => { active = false; };
  }, [adminAuthenticated, setInbox]);

  useEffect(() => {
    if (!adminAuthenticated || !cloudInquiriesLoaded) return;
    const unimportedInquiries = inbox.filter((inquiry) => !cloudInquiryIds.current.has(inquiry.id));
    if (!unimportedInquiries.length) return;
    const timer = window.setTimeout(() => {
      void saveAdminInquiries(unimportedInquiries).then((saved) => {
        if (saved) unimportedInquiries.forEach((inquiry) => cloudInquiryIds.current.add(inquiry.id));
        reportCloudSave('inquiries', saved, isArabic ? 'الاستفسارات' : 'inquiries');
      });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [adminAuthenticated, cloudInquiriesLoaded, inbox, isArabic, reportCloudSave]);

  useEffect(() => {
    if (!adminAuthenticated) return;
    let active = true;
    const refreshOrders = () => {
      void fetchAdminOrders().then((remoteOrders) => {
        if (!active || !remoteOrders) return;
        const previouslySyncedIds = cloudOrderIds.current;
        cloudOrderIds.current = new Set(remoteOrders.map((order) => order.id));
        setOrders((currentOrders) => mergeRemoteRows(remoteOrders, currentOrders, previouslySyncedIds));
      });
    };
    const refreshInquiries = () => {
      void fetchAdminInquiries().then((remoteInquiries) => {
        if (!active || !remoteInquiries) return;
        const previouslySyncedIds = cloudInquiryIds.current;
        cloudInquiryIds.current = new Set(remoteInquiries.map((inquiry) => inquiry.id));
        setInbox((currentInquiries) => mergeRemoteRows(remoteInquiries, currentInquiries, previouslySyncedIds));
      });
    };
    const channel = supabase.channel('zexor-admin-live-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'store_orders' }, refreshOrders)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'store_inquiries' }, refreshInquiries)
      .subscribe();
    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [adminAuthenticated, setInbox, setOrders, setProducts]);

  useEffect(() => {
    if (!adminAuthenticated) return;
    let active = true;
    void fetchPrivateSiteSecrets().then((secrets) => {
      if (!active) return;
      if (secrets) {
        setSettings((current) => ({ ...current, ...secrets }));
        setPrivateSecretsLoaded(true);
      }
    });
    return () => { active = false; };
  }, [adminAuthenticated, setSettings]);

  useEffect(() => {
    if (!adminAuthenticated || !privateSecretsLoaded) return;
    const timer = window.setTimeout(() => {
      void savePrivateSiteSecrets({
        telegramBotToken: settings.telegramBotToken,
        telegramChatId: settings.telegramChatId,
      }).then((saved) => reportCloudSave('private-settings', saved, isArabic ? 'إعدادات الإشعارات الخاصة' : 'private notification settings'));
    }, 350);
    return () => window.clearTimeout(timer);
  }, [adminAuthenticated, privateSecretsLoaded, settings.telegramBotToken, settings.telegramChatId, isArabic, reportCloudSave]);

  const handleSaveSocialLink = useCallback(async (link: SocialLink) => {
    const saved = await saveSocialLink(link);
    if (saved) setSocialLinks((current) => current.some((item) => item.platform === saved.platform)
      ? current.map((item) => item.platform === saved.platform ? saved : item)
      : [...current, saved]);
    return Boolean(saved);
  }, []);

  const handleDeleteSocialLink = useCallback(async (link: SocialLink) => {
    const deleted = await deleteSocialLink(link);
    if (deleted) setSocialLinks((current) => current.filter((item) => item.platform !== link.platform));
    return deleted;
  }, []);

  const handleAddInquiry = useCallback((inquiry: PlatformInquiry) => {
    setInbox((current) => [inquiry, ...current.filter((item) => item.id !== inquiry.id)]);
    void createCloudInquiry(inquiry).then((saved) => {
      if (!saved && isSupabaseConfigured) {
        setToast(isArabic
          ? 'تم فتح واتساب، لكن تعذر حفظ الرسالة في صندوق الإدارة.'
          : 'WhatsApp opened, but the inquiry could not be saved to the admin inbox.');
      }
    });
  }, [isArabic, setInbox]);

  const handleDeleteCloudInquiry = useCallback(async (id: string) => {
    const deleted = !isSupabaseConfigured || await deleteAdminInquiry(id);
    if (deleted) cloudInquiryIds.current.delete(id);
    return deleted;
  }, []);

  const handleClearCloudInquiries = useCallback(async () => {
    const cleared = !isSupabaseConfigured || await clearAdminInquiries();
    if (cleared) cloudInquiryIds.current.clear();
    return cleared;
  }, []);

  const handleClearCloudOrders = useCallback(async () => {
    const cleared = !isSupabaseConfigured || await clearAdminOrders();
    if (cleared) cloudOrderIds.current.clear();
    return cleared;
  }, []);

  const handleSaveCloudOrder = useCallback(async (order: CustomerOrder) => {
    if (!isSupabaseConfigured) return true;
    return saveAdminOrder(order);
  }, []);

  const handleDeleteCloudOrder = useCallback(async (id: string) => {
    const deleted = !isSupabaseConfigured || await deleteAdminOrder(id);
    if (deleted) cloudOrderIds.current.delete(id);
    return deleted;
  }, []);

  const handleSetCloudProductStock = useCallback(async (productId: string, stock: number | null) => {
    if (!isSupabaseConfigured) return true;
    const saved = await setCloudProductStock(productId, stock);
    if (saved) return true;
    const currentCatalog = await fetchStoreContent<unknown>('products');
    if (isValidObjectArray(currentCatalog)) setProducts(normalizeLegacyProductCategories(normalizeStarterProductImages(currentCatalog as Product[])));
    setToast(isArabic ? 'تعذر تحديث المخزون في قاعدة البيانات.' : 'Could not update stock in the database.');
    return false;
  }, [isArabic, setProducts]);

  const handleUpdateCloudOrderStatus = useCallback(async (orderId: string, status: CustomerOrder['status']) => {
    if (!isSupabaseConfigured) return true;
    const result = await updateCloudOrderStatus(orderId, status);
    if (!result.accepted) {
      setToast(result.reason === 'stock'
        ? isArabic ? 'المخزون غير كافٍ لإعادة تفعيل الطلب. لم تتغير حالته.' : 'There is not enough stock to reopen this order. Its status was not changed.'
        : isArabic ? 'تعذر تحديث حالة الطلب في قاعدة البيانات.' : 'Could not update the order status in the database.');
      return false;
    }
    if (result.payload) {
      setOrders((current) => current.map((order) => order.id === orderId ? result.payload! : order));
    }
    const currentCatalog = await fetchStoreContent<unknown>('products');
    if (isValidObjectArray(currentCatalog)) setProducts(currentCatalog as Product[]);
    return true;
  }, [isArabic, setOrders, setProducts]);

  const handleUpdateCloudOrderShipping = useCallback(async (orderId: string, details: Pick<CustomerOrder, 'shippingCarrier' | 'trackingNumber' | 'trackingUrl'>) => {
    if (!isSupabaseConfigured) return true;
    const updated = await updateCloudOrderShipping(orderId, details);
    if (!updated) return false;
    setOrders((current) => current.map((order) => order.id === orderId ? updated : order));
    return true;
  }, [setOrders]);

  const handleUpdateCloudInquiryStatus = useCallback(async (inquiryId: string, status: PlatformInquiry['status']) => {
    if (!isSupabaseConfigured) return true;
    const saved = await updateCloudInquiryStatus(inquiryId, status);
    if (!saved) setToast(isArabic ? 'تعذر تحديث حالة الاستفسار في قاعدة البيانات.' : 'Could not update inquiry status in the database.');
    return saved;
  }, [isArabic]);

  const handleSavePaymentMethod = useCallback(async (method: PaymentMethod) => {
    const saved = await savePaymentMethod(method);
    if (saved) setPaymentMethods((current) => current.map((item) => item.market === saved.market && item.method === saved.method ? saved : item));
    return Boolean(saved);
  }, []);

  const handleDeletePaymentMethod = useCallback(async (method: PaymentMethod) => {
    const deleted = await deletePaymentMethod(method);
    if (deleted) setPaymentMethods((current) => current.filter((item) => !(item.market === method.market && item.method === method.method)));
    return deleted;
  }, []);

  useEffect(() => {
    const sync = () => {
      const hash = pageFromHash();
      if (hash !== route) startRouteCurtain();
      setRoute(hash);
      setMenuOpen(false);
    };
    window.addEventListener('popstate', sync);
    window.addEventListener('hashchange', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('hashchange', sync);
    };
  }, [route, startRouteCurtain]);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = dir;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    const themeColor = getComputedStyle(root).getPropertyValue('--zx-bg').trim();
    if (themeColor) document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor);
    const routeLabels: Record<string, Record<Locale, string>> = {
      home: { ar: 'المتجر واستوديو زكسور', en: 'Store & ZEXOR Studio' },
      cards: categories.find((category) => category.slug === 'cards')?.name ?? { ar: 'زكسور لينك', en: 'ZEXOR LINK' },
      fashion: categories.find((category) => category.slug === 'fashion')?.name ?? { ar: 'أزياء زكسور', en: 'ZEXOR FASHION' },
      services: categories.find((category) => category.slug === 'services')?.name ?? { ar: 'استوديو زكسور', en: 'ZEXOR STUDIO' },
      cars: categories.find((category) => category.slug === 'cars')?.name ?? { ar: 'زكسور موتورز', en: 'ZEXOR MOTORS' },
      property: categories.find((category) => category.slug === 'property')?.name ?? { ar: 'زكسور إستيتس', en: 'ZEXOR ESTATES' },
      contact: { ar: 'تواصل معنا', en: 'Contact Us' },
      pricing: { ar: 'الأسعار', en: 'Pricing' },
      calculator: { ar: 'حاسبة التكلفة', en: 'Project Calculator' },
      reviews: { ar: 'آراء العملاء', en: 'Customer Reviews' },
      tracking: { ar: 'تتبع الطلب', en: 'Track an Order' },
      dashboard: { ar: 'إدارة المتجر', en: 'Store Admin' },
    };
    const pageName = routeLabels[String(route)]?.[locale] ?? routeLabels.home[locale];
    const title = `${pageName} | ${resolvedSettings.brand.name}`;
    document.title = title;
    const description = locale === 'ar'
      ? `${pageName} من ${resolvedSettings.brand.name} — بطاقات NFC، أزياء، وخدمات رقمية في مصر والسعودية.`
      : `${pageName} at ${resolvedSettings.brand.name} — NFC cards, fashion and digital services in Egypt and Saudi Arabia.`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', title);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', description);
    try {
      window.localStorage.setItem(STORAGE.locale, locale);
    } catch {
      // ignore
    }
  }, [categories, dir, locale, resolvedSettings.brand.name, route, theme]);

  // Keep non-colour brand settings live while the storefront uses the shared palette.
  useEffect(() => {
    const root = document.documentElement;
    const { brand } = resolvedSettings;
    root.style.setProperty('--zx-radius', `${brand.radius}rem`);
    root.style.fontSize = `${brand.fontScale * 100}%`;
  }, [resolvedSettings]);

  useEffect(() => {
    const icon = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
    if (!icon) return;
    const defaultHref = icon.dataset.defaultHref || icon.href;
    icon.dataset.defaultHref = defaultHref;
    icon.href = resolvedSettings.brand.logoUrl
      ? publicAssetUrl(resolvedSettings.brand.logoUrl) ?? defaultHref
      : defaultHref;
  }, [resolvedSettings.brand.logoUrl]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const onScroll = () => {
      if (scrollFrame.current !== null) return;
      scrollFrame.current = window.requestAnimationFrame(() => {
        scrollFrame.current = null;
        const currentY = window.scrollY;
        const previousY = previousScrollY.current;
        const totalScrollable = document.documentElement.scrollHeight - window.innerHeight;
        setScrollProgress(totalScrollable > 0 ? Math.min(1, Math.max(0, currentY / totalScrollable)) : 0);
        setShowBackToTop(currentY > 600);
        setNavigationCompact(currentY > 48);
        if (currentY < 80) setNavigationHidden(false);
        else if (Math.abs(currentY - previousY) > 6) setNavigationHidden(currentY > previousY);
        previousScrollY.current = currentY;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (scrollFrame.current !== null) {
        window.cancelAnimationFrame(scrollFrame.current);
        scrollFrame.current = null;
      }
    };
  }, []);

  const effectiveMarketFilter = resolvedSettings.showOtherMarketProducts?.[market] ? 'all' : market;
  const storefrontProducts = useMemo(() => products.filter((product) =>
    product.available && (effectiveMarketFilter === 'all' || product.markets.includes(effectiveMarketFilter)),
  ), [effectiveMarketFilter, products]);
  const visibleProductIds = useMemo(() => new Set(storefrontProducts.map((product) => product.id)), [storefrontProducts]);
  const storefrontCart = useMemo(() => cart.filter((line) => visibleProductIds.has(line.productId)), [cart, visibleProductIds]);
  const cartCount = storefrontCart.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToCart = (product: Product, customization?: NfcCustomization, variant?: string) => {
    if (!storefrontProducts.some((item) => item.id === product.id)) {
      setToast(isArabic ? 'هذا المنتج غير متاح للسوق المحدد.' : 'This product is not available in the selected market.');
      return;
    }
    const quantityInCart = cart.filter((line) => line.productId === product.id).reduce((sum, line) => sum + line.quantity, 0);
    if (product.stock !== undefined && quantityInCart >= product.stock) {
      setToast(isArabic ? 'وصلت للكمية المتاحة من هذا المنتج.' : 'You have reached the available stock for this product.');
      return;
    }
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && cartButtonRef.current) {
      const productCard = [...document.querySelectorAll<HTMLElement>('[data-product-id]')]
        .find((element) => {
          if (element.dataset.productId !== product.id) return false;
          const rect = element.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight
            && rect.right > 0 && rect.left < window.innerWidth;
        });
      const image = productCard?.querySelector<HTMLImageElement>('.zx-product-media img');
      if (image) {
        const sourceRect = image.getBoundingClientRect();
        const cartRect = cartButtonRef.current.getBoundingClientRect();
        if (sourceRect.width > 0 && sourceRect.height > 0) {
          cartFlightSequence.current += 1;
          setCartFlight({
            id: cartFlightSequence.current,
            src: image.currentSrc || image.src,
            startX: sourceRect.left + sourceRect.width / 2 - 34,
            startY: sourceRect.top + sourceRect.height / 2 - 34,
            endX: cartRect.left + cartRect.width / 2 - 10,
            endY: cartRect.top + cartRect.height / 2 - 10,
          });
        }
      }
    }
    setCart((current) => {
      const existing = current.find(
        (line) => line.productId === product.id && line.variant === variant && !line.nfcCustomization,
      );
      if (existing && !customization) {
        // Bump only the line we actually matched. A bare productId comparison
        // would also increment other variants of the same product.
        return current.map((line) =>
          line === existing ? { ...line, quantity: line.quantity + 1 } : line,
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

  const handleShareProduct = async (product: Product) => {
    const shareData = {
      title: product.name[locale],
      text: isArabic
        ? `${product.name.ar}\n${product.description.ar}\nكود المنتج: ${product.id}`
        : `${product.name.en}\n${product.description.en}\nProduct code: ${product.id}`,
      url: window.location.href.split('#')[0],
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        setToast(isArabic ? 'تم نسخ تفاصيل المنتج ورابط المتجر للمشاركة.' : 'Product details and store link copied.');
      } else {
        setToast(isArabic ? 'المشاركة غير متاحة في هذا المتصفح.' : 'Sharing is unavailable in this browser.');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      setToast(isArabic ? 'تعذرت مشاركة المنتج. حاول مرة أخرى.' : 'Could not share this product. Please try again.');
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminAuthLoading(true);
    setAdminLoginError('');
    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({ email: adminEmail.trim(), password: adminPassword });
      if (loginError) {
        setAdminLoginError(isArabic ? 'بيانات الدخول غير صحيحة أو خدمة الدخول غير مهيأة.' : 'Invalid credentials or authentication is not configured.');
        return;
      }
      const { data: allowed, error } = await supabase.rpc('is_store_admin');
      if (error || allowed !== true) {
        await supabase.auth.signOut();
        setAdminLoginError(isArabic ? 'هذا الحساب لا يملك صلاحية إدارة المتجر.' : 'This account is not authorized to administer this store.');
        return;
      }
      setCloudOrdersLoaded(false);
      setCloudInquiriesLoaded(false);
      setPrivateSecretsLoaded(false);
      cloudOrderIds.current.clear();
      cloudInquiryIds.current.clear();
      setAdminAuthenticated(true);
      setAdminLoginError('');
      setAdminPassword('');
      setToast(isArabic ? 'مرحباً بك في لوحة تحكم ZEXOR' : 'Welcome to ZEXOR Studio Admin');
    } catch {
      setAdminLoginError(isArabic ? 'تعذر الاتصال بخدمة الدخول. تحقق من الإنترنت وحاول مجدداً.' : 'Could not reach the sign-in service. Check your connection and try again.');
    } finally {
      setAdminAuthLoading(false);
    }
  };

  // Primary navigation: the five departments, kept short so the bar never wraps.
  const categoryNameFor = useCallback((slug: string, fallback: string) =>
    categories.find((category) => category.slug === slug)?.name[locale] ?? fallback,
  [categories, locale]);
  const departmentFor = useCallback((slug: string) => categories.find((category) => category.slug === slug), [categories]);
  const subcategoriesFor = useCallback((slug: string) => categories.filter((category) => category.parentSlug === slug && category.active), [categories]);
  const isDepartmentActive = useCallback((slug: 'cards' | 'fashion' | 'services' | 'cars' | 'property') =>
    (resolvedSettings.sectionVisibility[slug] ?? true) && (categories.find((category) => category.slug === slug)?.active ?? true),
  [categories, resolvedSettings.sectionVisibility]);
  const activeDepartmentCount = (['cards', 'fashion', 'services', 'cars', 'property'] as const)
    .filter(isDepartmentActive).length + Number(categories.find((category) => category.slug === 'antiques')?.active ?? true);

  const navItems: { route: Route; label: string }[] = useMemo(() => {
    const items: { route: Route; label: string }[] = [
      { route: 'home', label: isArabic ? 'الرئيسية' : 'Home' },
    ];
    if (isDepartmentActive('cards')) items.push({ route: 'cards', label: categoryNameFor('cards', isArabic ? 'زكسور لينك' : 'ZEXOR LINK') });
    if (isDepartmentActive('fashion')) items.push({ route: 'fashion', label: categoryNameFor('fashion', isArabic ? 'أزياء زكسور' : 'ZEXOR FASHION') });
    if (isDepartmentActive('services')) items.push({ route: 'services', label: categoryNameFor('services', isArabic ? 'استوديو زكسور' : 'ZEXOR STUDIO') });
    if (isDepartmentActive('cars')) items.push({ route: 'cars', label: categoryNameFor('cars', isArabic ? 'زكسور موتورز' : 'ZEXOR MOTORS') });
    if (isDepartmentActive('property')) items.push({ route: 'property', label: categoryNameFor('property', isArabic ? 'زكسور إستيتس' : 'ZEXOR ESTATES') });

    // Dynamic categories created in Admin!
    categories
      .filter((c) => c.active && !c.parentSlug && !['cards', 'fashion', 'services', 'cars', 'property', 'market'].includes(c.slug))
      .forEach((c) => {
        items.push({ route: c.slug, label: c.name[locale] });
      });

    return items;
  }, [categories, categoryNameFor, isArabic, isDepartmentActive, locale]);

  // Secondary navigation: pricing, calculator, reviews, tracking, contact.
  // Rendered in a "More" menu so the bar stays uncluttered on every width.
  const moreNavItems: { route: Route; label: string }[] = useMemo(() => {
    const items: { route: Route; label: string }[] = [];
    if (resolvedSettings.sectionVisibility.pricing ?? true) items.push({ route: 'pricing', label: isArabic ? 'باقات البرمجة' : 'Pricing' });
    if (resolvedSettings.sectionVisibility.calculator ?? true) items.push({ route: 'calculator', label: isArabic ? 'حاسبة التكلفة' : 'Cost Calculator' });
    if (resolvedSettings.sectionVisibility.reviews ?? true) items.push({ route: 'reviews', label: isArabic ? 'آراء العملاء' : 'Reviews' });
    if (resolvedSettings.sectionVisibility.tracking ?? true) items.push({ route: 'tracking', label: isArabic ? 'تتبّع الطلب' : 'Track Order' });
    if (resolvedSettings.sectionVisibility.contact) items.push({ route: 'contact', label: isArabic ? 'تواصل معنا' : 'Contact' });
    return items;
  }, [isArabic, resolvedSettings.sectionVisibility]);

  // Global search entries
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const matches: { title: string; desc: string; route: Route }[] = [];

    storefrontProducts.forEach((p) => {
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
        title: isArabic ? 'خدمات استوديو زكسور' : 'ZEXOR Studio & Packages',
        desc: isArabic ? 'حاسبة التكلفة وباقات التطوير ومعاينة المشاريع' : 'Cost calculator & live demos',
        route: 'services',
      });
    }

    return matches;
  }, [isArabic, locale, searchQuery, storefrontProducts]);

  // Products filtered for the current route
  const activeFashionSubcategories = useMemo(
    () => categories.filter((category) => category.parentSlug === 'fashion' && category.active),
    [categories],
  );
  const fashionProductsInMarket = useMemo(() => storefrontProducts.filter((product) =>
    product.category === 'fashion'
    && (!product.subcategoryId || activeFashionSubcategories.some((subcategory) => subcategory.slug === product.subcategoryId)),
  ), [activeFashionSubcategories, storefrontProducts]);
  const serviceSubcategories = categories.filter((category) => category.parentSlug === 'services' && category.active);
  const serviceProducts = storefrontProducts.filter((product) => product.available && product.category === 'services'
    && (!product.subcategoryId || serviceSubcategories.some((category) => category.slug === product.subcategoryId))
    && (!selectedSubcategories.services || product.subcategoryId === selectedSubcategories.services));
  const activeSelectedFashionSubcategory = activeFashionSubcategories.some((category) => category.slug === selectedSubcategories.fashion)
    ? selectedSubcategories.fashion
    : '';
  const currentCategoryProducts = storefrontProducts.filter(
    (p) =>
      p.available &&
      (route === 'cards' ? p.category === 'cards' : route === 'fashion' ? p.category === 'fashion' : true) &&
      (route !== 'cards' || !p.subcategoryId || categories.some((category) => category.slug === p.subcategoryId && category.parentSlug === 'cards' && category.active)) &&
      (route !== 'cards' || !selectedSubcategories.cards || p.subcategoryId === selectedSubcategories.cards) &&
      (route !== 'fashion' || !p.subcategoryId || categories.some((category) => category.slug === p.subcategoryId && category.parentSlug === 'fashion' && category.active)) &&
      (route !== 'fashion' || !activeSelectedFashionSubcategory || p.subcategoryId === activeSelectedFashionSubcategory),
  );
  const currentDynamicDepartment = categories.find((category) => !category.parentSlug && category.slug === route && !['cards', 'fashion', 'services', 'cars', 'property'].includes(category.slug));
  const dynamicDepartmentChildren = currentDynamicDepartment ? subcategoriesFor(currentDynamicDepartment.slug) : [];
  const dynamicDepartmentProducts = currentDynamicDepartment ? storefrontProducts.filter((product) =>
    product.available && product.category === currentDynamicDepartment.slug
    && (!product.subcategoryId || dynamicDepartmentChildren.some((child) => child.slug === product.subcategoryId))
    && (!selectedSubcategories[currentDynamicDepartment.slug] || product.subcategoryId === selectedSubcategories[currentDynamicDepartment.slug]),
  ) : [];
  const dynamicDepartmentSlides = currentDynamicDepartment
    ? currentDynamicDepartment.bannerSlides?.length
      ? currentDynamicDepartment.bannerSlides.map((slide) => ({ title: slide.title[locale] || currentDynamicDepartment.name[locale], text: slide.text[locale] || currentDynamicDepartment.bannerText?.[locale] || (isArabic ? 'اختيارات منتقاة بعناية، بتفاصيل تقدر تعدلها وتطورها من لوحة الإدارة.' : 'A considered collection with content and details you can shape from the admin dashboard.'), image: slide.image || currentDynamicDepartment.bannerImage || art.studioPortal }))
      : [0, 1, 2].map((index) => ({ title: currentDynamicDepartment.bannerTitle?.[locale] || currentDynamicDepartment.name[locale], text: currentDynamicDepartment.bannerText?.[locale] || (isArabic ? `اكتشف اختيارات ${currentDynamicDepartment.name.ar} المصممة لتناسب احتياجك.` : `Explore ${currentDynamicDepartment.name.en}, curated around what you need.`), image: currentDynamicDepartment.bannerImage || dynamicDepartmentProducts[index]?.imageUrl || art.studioPortal }))
    : [];
  const routeNotFound = ![
    'home', 'cards', 'fashion', 'services', 'cars', 'property', 'contact',
    'dashboard', 'admin', 'pricing', 'calculator', 'reviews', 'tracking',
  ].includes(route) && !currentDynamicDepartment;
  const departmentImage = (slug: string) => ({ cards: art.cardsPortal, fashion: art.hoodie, services: art.studioPortal, cars: art.vehiclesPortal, property: art.estatePortal }[slug] ?? art.studioPortal);
  const departmentBanner = (slug: string, fallbackTitle: string, fallbackText: string) => {
    const category = departmentFor(slug);
    const storyImages: Record<string, string[]> = {
      cards: [art.cardsElite, art.cardsSocial, art.cardsBespoke],
      fashion: [art.hoodie, art.tee, art.hoodie],
      services: [art.studioWebsite, art.studioStore, art.studioPortal],
      cars: [art.vehicleSedan, art.vehicleSuv, art.vehicleCoupe],
      property: [art.propertyApartment, art.propertyVilla, art.propertyLand],
    };
    const storyTitles: Record<string, Record<Locale, string[]>> = {
      cards: { ar: ['هويتك الرقمية، بلمسة واحدة', 'كل روابطك في مكان واحد', 'تفاصيل مصممة لتشبهك'], en: ['Your identity, one tap away', 'All your links in one place', 'Personal details, made yours'] },
      fashion: { ar: ['تفاصيل يومية، بطابع مختلف', 'قصّات مريحة وواضحة', 'اكتشف اختياراتك الجديدة'], en: ['Everyday pieces, a distinct point of view', 'Comfortable, confident silhouettes', 'Find your next favorite'] },
      services: { ar: ['نبني حضورك الرقمي', 'متجرك يبدأ من هنا', 'من الفكرة إلى الإطلاق'], en: ['Build a stronger digital presence', 'Your online store starts here', 'From first idea to launch'] },
      cars: { ar: ['سيارة تناسب مشوارك', 'مساحة أوسع لخططك', 'تجربة قيادة مختلفة'], en: ['A car for your next journey', 'More space for your plans', 'A different driving experience'] },
      property: { ar: ['مساحة تبدأ منها', 'بيت يناسب تفاصيل يومك', 'مساحة لخطوتك القادمة'], en: ['A place to begin', 'A home for the way you live', 'Room for your next chapter'] },
    };
    const extraSlides = category?.bannerSlides?.filter((slide) => slide.title?.[locale] || slide.text?.[locale] || slide.image).map((slide) => ({ title: slide.title?.[locale] || category.name[locale], text: slide.text?.[locale] || category.bannerText?.[locale] || fallbackText, image: slide.image || category.bannerImage || departmentImage(slug) })) ?? [];
    const primaryConfigured = Boolean(category?.bannerTitle?.[locale] || category?.bannerText?.[locale] || category?.bannerImage);
    const configuredSlides = primaryConfigured ? [{ title: category?.bannerTitle?.[locale] || category?.name[locale] || slug, text: category?.bannerText?.[locale] || fallbackText, image: category?.bannerImage || departmentImage(slug) }, ...extraSlides] : extraSlides;
    const slides = configuredSlides.length ? configuredSlides : storyImages[slug].map((slideImage, index) => ({ title: storyTitles[slug][locale][index], text: index === 0 ? fallbackText : storyTitles[slug][locale][index], image: slideImage }));
    return <DepartmentBanner locale={locale} name={category?.name[locale] ?? slug.toUpperCase()} title={category?.bannerTitle?.[locale]} text={category?.bannerText?.[locale]} image={category?.bannerImage} accent={category?.bannerAccent} slides={slides} fallbackImage={departmentImage(slug)} fallbackTitle={fallbackTitle} fallbackText={fallbackText} />;
  };
  const renderSubcategoryChips = (slug: string, count: (subcategorySlug?: string) => number) => {
    const children = subcategoriesFor(slug);
    if (!children.length) return null;
    return <nav aria-label={isArabic ? 'الأقسام الفرعية' : 'Subcategories'} className="flex flex-wrap gap-2">{[
      { slug: '', name: isArabic ? 'الكل' : 'All' }, ...children.map((category) => ({ slug: category.slug, name: category.name[locale] })),
    ].map((item) => <button aria-pressed={selectedSubcategories[slug] === item.slug} className={`min-h-10 rounded-full border px-4 text-xs font-semibold transition ${selectedSubcategories[slug] === item.slug ? 'border-zx-border bg-zx-cinematic text-zx-accent-contrast' : 'border-zx-border bg-zx-surface-raised text-zx-text hover:border-zx-border'}`} key={item.slug || 'all'} onClick={() => setSelectedSubcategories((current) => ({ ...current, [slug]: item.slug }))} type="button">{item.name}<span className="ms-2 opacity-70">{count(item.slug || undefined)}</span></button>)}</nav>;
  };

  return (
    <div
      className="zx-app-shell relative min-h-screen bg-zx-bg text-zx-text transition-colors duration-300 selection:bg-zx-mint selection:text-zx-mint-contrast"
      dir={dir}
      lang={locale}
    >
      <DesktopPointerEffects locale={locale} />
      <div aria-hidden="true" className="zx-scroll-progress">
        <span style={{ width: `${scrollProgress * 100}%` }} />
      </div>
      {/* Static ambient tones: preserve depth without perpetual GPU-heavy blur motion. */}
      <div aria-hidden="true" className="zx-ambient pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-64 inset-s-[4%] h-168 w-2xl rounded-full bg-zx-mint/40 blur-[72px]" />
        <div className="absolute top-200 -inset-e-52 h-160 w-160 rounded-full bg-zx-surface/35 blur-[80px]" />
      </div>

      {/* 1. Dynamic Announcement Bar */}
      {resolvedSettings.announcementActive && (
        <div className="relative z-50 flex min-h-9 items-center justify-center gap-2 bg-zx-cinematic px-8 py-2 text-center text-[10px] font-semibold text-zx-accent-contrast shadow-xs">
          <Sparkles className="h-3.5 w-3.5 text-zx-text-muted" />
          <span>{resolvedSettings.announcementText[locale]}</span>
        </div>
      )}

      {/* Maintenance notice — shown only when the admin enables it. Distinct
          amber styling so it never reads as the marketing announcement. */}
      {resolvedSettings.maintenanceActive && (
        <div className="relative z-50 flex min-h-9 items-center justify-center gap-2 bg-zx-cinematic px-8 py-2 text-center text-[10px] font-semibold text-zx-text-muted shadow-xs">
          <Clock className="h-3.5 w-3.5" />
          <span>{resolvedSettings.maintenanceText[locale]}</span>
        </div>
      )}

      {/* 2. Global Floating Navigation Bar */}
      <header
        className="zx-site-header sticky top-2 z-50 px-3 sm:px-6"
        data-hidden={navigationHidden && !menuOpen}
        data-scrolled={navigationCompact}
      >
        <nav
          aria-label={isArabic ? 'التنقل الرئيسي' : 'Main navigation'}
          className="zx-site-nav zx-glass mx-auto flex h-18 max-w-7xl items-center justify-between gap-2 rounded-[1.35rem] border border-zx-border/90 px-3 shadow-lg sm:px-5"
        >
          {/* Logo */}
          <button
            className="flex items-center gap-2.5"
            onClick={() => navigate('home')}
            type="button"
          >
            <LogoMark compact logoUrl={resolvedSettings.brand.logoUrl} />
            <span className="max-w-32 truncate text-[15px] font-bold tracking-[0.14em] text-zx-text">{resolvedSettings.brand.name}</span>
          </button>

          {/* Desktop Nav Items — nowrap so labels never break onto two lines */}
          <div className="zx-no-bar zx-snap-x hidden items-center gap-0.5 overflow-x-auto lg:flex">
            {navItems.map((item) => (
              <button
                aria-current={route === item.route ? 'page' : undefined}
                className={`relative shrink-0 whitespace-nowrap rounded-full px-2.5 py-2 text-[11px] font-semibold transition-all xl:px-3 ${
                  route === item.route
                    ? 'bg-zx-mint text-zx-mint-contrast shadow-xs'
                    : 'text-zx-text hover:bg-zx-surface-raised/80 hover:text-zx-text'
                }`}
                key={item.route}
                onClick={() => navigate(item.route)}
                type="button"
              >
                {item.label}
                {route === item.route && (
                  <motion.span
                    className="absolute inset-x-3 -bottom-1 h-0.5 rounded-full bg-zx-accent"
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
                      ? 'bg-zx-mint text-zx-mint-contrast shadow-xs'
                      : 'text-zx-text hover:bg-zx-surface-raised/80 hover:text-zx-text'
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
                      className="absolute inset-e-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-zx-border/90 bg-zx-surface-raised/95 p-1.5 shadow-2xl backdrop-blur-2xl"
                      exit={{ opacity: 0, y: -6 }}
                      initial={{ opacity: 0, y: -6 }}
                    >
                      {moreNavItems.map((item) => (
                        <button
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-start text-xs font-semibold transition-colors ${
                            route === item.route
                              ? 'bg-zx-mint text-zx-mint-contrast'
                              : 'text-zx-text hover:bg-zx-mint'
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
              aria-label={isArabic ? 'بحث في المتجر' : 'Search the store'}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zx-border bg-zx-surface-raised/70 text-zx-text transition-colors hover:bg-zx-mint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zx-accent"
              onClick={() => setSearchOpen(true)}
              type="button"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              aria-label={isArabic ? (theme === 'light' ? 'تفعيل الوضع الداكن' : 'تفعيل الوضع الفاتح') : (theme === 'light' ? 'Enable dark mode' : 'Enable light mode')}
              className="hidden h-9 w-9 items-center justify-center rounded-full border border-zx-border bg-zx-surface-raised/70 text-zx-text hover:bg-zx-mint sm:flex"
              onClick={() => setTheme((curr) => (curr === 'light' ? 'dark' : 'light'))}
              type="button"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            {/* Wishlist */}
            <button
              aria-label={isArabic ? 'قائمة المفضلة' : 'Wishlist'}
              className="relative hidden h-9 w-9 items-center justify-center rounded-full border border-zx-border bg-zx-surface-raised/70 text-zx-text hover:bg-zx-mint md:flex"
              onClick={() => setWishlistOpen(true)}
              type="button"
            >
              <Heart className="h-4 w-4" />
              {wishlist.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-zx-accent px-1 text-[8px] font-bold text-zx-accent-contrast">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Quick Track Order Button */}
            <button
              aria-label={isArabic ? 'تتبع الطلب' : 'Track order'}
              className="hidden h-9 items-center gap-1.5 rounded-full border border-zx-border bg-zx-surface-raised/70 px-3 text-[10px] font-semibold text-zx-text hover:bg-zx-mint lg:flex"
              onClick={() => setTrackingOpen(true)}
              title={isArabic ? 'تتبع الشحنة' : 'Track Order'}
              type="button"
            >
              <Truck className="h-3.5 w-3.5 text-zx-text" />
              <span className="hidden xl:inline">{isArabic ? 'تتبع طلبك' : 'Track'}</span>
            </button>

            {/* Market & Region Switcher */}
            <button
              aria-label={isArabic ? 'تغيير الدولة' : 'Change country'}
              className="inline-flex min-h-9 items-center gap-1 rounded-full border border-zx-border bg-zx-surface-raised/70 px-2.5 text-[10px] font-semibold text-zx-text hover:bg-zx-mint"
              onClick={() => {
                const nextMarket: Market = market === 'eg' ? 'ksa' : 'eg';
                setMarket(nextMarket);
              }}
              type="button"
            >
              <span>{market === 'eg' ? '🇪🇬' : '🇸🇦'}</span>
              <span className="hidden sm:inline">{market === 'eg' ? (isArabic ? 'مصر' : 'EGP') : isArabic ? 'السعودية' : 'SAR'}</span>
            </button>

            {/* Language Switch */}
            <button
              aria-label={isArabic ? 'تغيير اللغة إلى الإنجليزية' : 'Change language to Arabic'}
              className="hidden min-h-9 items-center gap-1 rounded-full border border-zx-border bg-zx-surface-raised/70 px-2.5 text-[10px] font-semibold text-zx-text hover:bg-zx-mint sm:inline-flex"
              onClick={() => setLocale((curr) => (curr === 'ar' ? 'en' : 'ar'))}
              type="button"
            >
              <Globe2 className="h-3.5 w-3.5 text-zx-text" />
              <span className="hidden sm:inline">{isArabic ? 'English' : 'العربية'}</span>
            </button>

            {/* Cart Drawer Button */}
            <button
              aria-label={isArabic ? 'سلة المشتريات' : 'Shopping cart'}
              className="relative flex h-9 items-center gap-1.5 rounded-full bg-zx-cinematic px-3.5 text-[10px] font-semibold text-zx-accent-contrast shadow-sm hover:bg-zx-cinematic"
              onClick={() => setCartOpen(true)}
              ref={cartButtonRef}
              type="button"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{isArabic ? 'السلة' : 'Cart'}</span>
              {cartCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-zx-surface-raised px-1 text-[8px] font-bold text-zx-text">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Full-screen navigation */}
            <button
              aria-expanded={menuOpen}
              aria-label={isArabic ? (menuOpen ? 'إغلاق القائمة' : 'فتح القائمة') : (menuOpen ? 'Close menu' : 'Open menu')}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zx-border bg-zx-surface-raised/70 text-zx-text"
              onClick={() => setMenuOpen(!menuOpen)}
              type="button"
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            aria-label={isArabic ? 'قائمة الموقع الرئيسية' : 'Main site menu'}
            aria-modal="true"
            className="zx-fullscreen-menu fixed inset-0 z-120 overflow-y-auto bg-zx-bg px-5 py-5 text-zx-text sm:px-9 sm:py-8"
            dir={dir}
            exit={{ opacity: 0, y: 12 }}
            initial={{ opacity: 0, y: 12 }}
            role="dialog"
          >
            <div className="mx-auto max-w-7xl">
              <div className="flex items-center justify-between border-b border-zx-border pb-5">
                <div className="flex items-center gap-3">
                  <LogoMark compact logoUrl={resolvedSettings.brand.logoUrl} />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zx-text-muted">ZEXOR</p>
                    <p className="text-xs text-zx-text-secondary">{isArabic ? 'كل فصول الحكاية' : 'Explore every chapter'}</p>
                  </div>
                </div>
                <button
                  aria-label={isArabic ? 'إغلاق القائمة' : 'Close menu'}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-zx-border bg-zx-surface-raised text-zx-text transition-colors hover:bg-zx-mint"
                  onClick={() => setMenuOpen(false)}
                  type="button"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-4 sm:hidden">
                <button className="zx-menu-control" onClick={() => setTheme((current) => current === 'light' ? 'dark' : 'light')} type="button">
                  {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  {isArabic ? 'المظهر' : 'Theme'}
                </button>
                <button className="zx-menu-control" onClick={() => setLocale((current) => current === 'ar' ? 'en' : 'ar')} type="button">
                  <Globe2 className="h-4 w-4" />{isArabic ? 'English' : 'العربية'}
                </button>
                <button className="zx-menu-control" onClick={() => setMarket((current) => current === 'eg' ? 'ksa' : 'eg')} type="button">
                  <span>{market === 'eg' ? '🇪🇬' : '🇸🇦'}</span>{market === 'eg' ? (isArabic ? 'مصر' : 'Egypt') : (isArabic ? 'السعودية' : 'KSA')}
                </button>
              </div>

              <div className="grid gap-8 py-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14 lg:py-12">
                <nav aria-label={isArabic ? 'روابط الموقع' : 'Site links'} className="flex flex-col">
                  {[...navItems, ...moreNavItems].map((item, index) => {
                    const chapterIndex = PORTALS.findIndex((portal) => portal.route === item.route);
                    return (
                      <motion.button
                        animate={{ opacity: 1, x: 0 }}
                        aria-current={route === item.route ? 'page' : undefined}
                        className={`zx-fullscreen-menu-link flex min-h-14 items-baseline gap-4 border-b border-zx-border py-2 text-start font-semibold transition-colors ${
                          route === item.route ? 'text-zx-accent' : 'text-zx-text hover:text-zx-accent'
                        }`}
                        initial={{ opacity: 0, x: isArabic ? 18 : -18 }}
                        key={`${item.route}-${item.label}`}
                        onClick={() => navigate(item.route)}
                        transition={{ delay: Math.min(index * 0.035, 0.35), duration: 0.3 }}
                        type="button"
                      >
                        <span aria-hidden="true" className="w-8 text-[10px] tracking-widest text-zx-text-muted">
                          {chapterIndex < 0 ? '' : String(chapterIndex + 1).padStart(2, '0')}
                        </span>
                        <span className="text-2xl sm:text-4xl lg:text-[2.7rem]">{item.label}</span>
                      </motion.button>
                    );
                  })}
                </nav>

                <div className="flex flex-col gap-6">
                  <div>
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zx-text-muted">{isArabic ? 'فصول زكسور' : 'ZEXOR CHAPTERS'}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {PORTALS.filter((portal) => navItems.some((item) => item.route === portal.route)).map((portal) => (
                        <button
                          className="zx-menu-portal group relative flex min-h-32 items-end overflow-hidden rounded-2xl border border-zx-border bg-zx-surface text-start sm:min-h-44"
                          key={portal.route}
                          onClick={() => navigate(portal.route)}
                          type="button"
                        >
                          <img alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" loading="lazy" src={publicAssetUrl(portal.image)} />
                          <span className="absolute inset-0 bg-linear-to-t from-zx-footer-bg/90 via-zx-footer-bg/15 to-transparent transition-opacity group-hover:opacity-80" />
                          <span className="relative z-10 flex w-full items-end justify-between gap-2 p-3 text-zx-footer-text sm:p-4">
                            <span className="text-sm font-semibold sm:text-base">{navItems.find((item) => item.route === portal.route)?.label}</span>
                            <span className="text-[10px] tracking-widest">{portal.index}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="hidden grid-cols-2 gap-2 sm:grid sm:grid-cols-4">
                    <button className="zx-menu-control" onClick={() => setTheme((current) => current === 'light' ? 'dark' : 'light')} type="button">
                      {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                      {isArabic ? (theme === 'light' ? 'الوضع الداكن' : 'الوضع الفاتح') : (theme === 'light' ? 'Dark mode' : 'Light mode')}
                    </button>
                    <button className="zx-menu-control" onClick={() => setLocale((current) => current === 'ar' ? 'en' : 'ar')} type="button">
                      <Globe2 className="h-4 w-4" />{isArabic ? 'English' : 'العربية'}
                    </button>
                    <button className="zx-menu-control" onClick={() => setMarket((current) => current === 'eg' ? 'ksa' : 'eg')} type="button">
                      <span>{market === 'eg' ? '🇪🇬' : '🇸🇦'}</span>{market === 'eg' ? (isArabic ? 'مصر' : 'Egypt') : (isArabic ? 'السعودية' : 'Saudi Arabia')}
                    </button>
                    <button className="zx-menu-control" onClick={() => { setSearchOpen(true); setMenuOpen(false); }} type="button">
                      <Search className="h-4 w-4" />{isArabic ? 'بحث' : 'Search'}
                    </button>
                    <button className="zx-menu-control" onClick={() => { setWishlistOpen(true); setMenuOpen(false); }} type="button">
                      <Heart className="h-4 w-4" />{isArabic ? 'المفضلة' : 'Wishlist'}
                    </button>
                    <button className="zx-menu-control" onClick={() => { setTrackingOpen(true); setMenuOpen(false); }} type="button">
                      <Truck className="h-4 w-4" />{isArabic ? 'تتبع الطلب' : 'Track order'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {routeCurtainVisible && (
          <motion.div
            animate={{ scaleY: 1 }}
            aria-hidden="true"
            className="zx-route-curtain pointer-events-none fixed inset-0 z-110 origin-top"
            exit={{ scaleY: 0 }}
            initial={{ scaleY: 0 }}
          >
            <span className="text-2xl font-semibold tracking-[0.28em]">ZEXOR</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cartFlight && (
          <motion.img
            alt=""
            aria-hidden="true"
            animate={{ x: cartFlight.endX, y: cartFlight.endY, scale: 0.18, opacity: 0.25 }}
            className="zx-cart-flight pointer-events-none fixed left-0 top-0 z-130 size-17 rounded-2xl object-cover"
            initial={{ x: cartFlight.startX, y: cartFlight.startY, scale: 1, opacity: 1 }}
            key={cartFlight.id}
            onAnimationComplete={() => setCartFlight((current) => current?.id === cartFlight.id ? null : current)}
            src={cartFlight.src}
            transition={{ duration: 0.68, ease: [0.22, 1, 0.36, 1] }}
          />
        )}
      </AnimatePresence>

      {/* Main View Router. Lazy route surfaces render inside Suspense so the
          home page ships without them in the initial bundle. */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-12">
        <Suspense fallback={<RouteFallback label={isArabic ? 'جارٍ التحميل…' : 'Loading…'} />}>
        {routeNotFound && (
          <section className="zx-not-found mx-auto flex min-h-[65vh] max-w-5xl flex-col items-start justify-center overflow-hidden rounded-4xl border border-zx-border bg-zx-surface p-7 sm:p-12 lg:p-16">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zx-text-muted">ZEXOR · {isArabic ? 'فصل غير موجود' : 'CHAPTER NOT FOUND'}</p>
            <p aria-hidden="true" className="zx-not-found-number mt-4 text-8xl font-bold leading-none sm:text-[10rem]">404</p>
            <h1 className="zx-display mt-3 max-w-2xl text-3xl text-zx-text sm:text-5xl">
              {isArabic ? 'الطريق ده مش موجود في حكايتنا.' : 'This chapter is not in our story.'}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-zx-text-secondary">
              {isArabic ? 'الرابط يمكن اتغير أو اتكتب غلط. ارجع للرئيسية أو افتح القائمة واختار الفصل اللي بتدور عليه.' : 'The link may have changed or been entered incorrectly. Return home or open the menu to find your way.'}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button className="min-h-11 rounded-full bg-zx-cinematic px-6 text-sm font-semibold text-zx-accent-contrast" onClick={() => navigate('home')} type="button">
                {isArabic ? 'ارجع للرئيسية' : 'Back to home'}
              </button>
              <button className="min-h-11 rounded-full border border-zx-border bg-zx-surface-raised px-6 text-sm font-semibold text-zx-text hover:bg-zx-mint" onClick={() => setMenuOpen(true)} type="button">
                {isArabic ? 'افتح الفصول' : 'Explore chapters'}
              </button>
            </div>
          </section>
        )}
        {route === 'home' && (
          <div className="home-page-flow">
            {/* 1. Brand hero */}
            <HomeHero
              departmentCount={activeDepartmentCount}
              heroAccent={getSiteText('hero.subtitle', locale) ?? resolvedSettings.heroAccent[locale]}
              heroImage={resolvedSettings.heroImage}
              heroText={getSiteText('hero.description', locale) ?? resolvedSettings.heroText[locale]}
              heroTitle={getSiteText('hero.headline', locale) ?? resolvedSettings.heroTitle[locale]}
              locale={locale}
              navigate={navigate}
            />

            {/* 2. Six-department board — image-led entry points into each active section.
                The `departments` id is the scroll target for the hero's explore button. */}
            <div id="departments" className="scroll-mt-24">
              <CategoryShowcase
                isArabic={isArabic}
                locale={locale}
                navigate={navigate}
                visible={{
                  cards: isDepartmentActive('cards'),
                  fashion: isDepartmentActive('fashion'),
                  cars: isDepartmentActive('cars'),
                  property: isDepartmentActive('property'),
                  services: isDepartmentActive('services'),
                  antiques: categories.find((category) => category.slug === 'antiques')?.active ?? true,
                }}
                categories={categories}
              />
            </div>

            {/* 3. Live Animated Stats Counter */}
            <section className="zx-feature-band relative overflow-hidden rounded-4xl p-6 shadow-sm sm:p-8">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -inset-e-16 -top-16 h-48 w-48 rounded-full bg-zx-mint/60 blur-3xl"
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
                    <p className="zx-display zx-feature-value text-3xl sm:text-4xl">
                      {s.value}
                    </p>
                    <p className="zx-eyebrow zx-feature-label mt-2">{s.label[locale]}</p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* 3. Section 01: 3D Smart NFC Identity Cards Showcase */}
            {isDepartmentActive('cards') && (
              <section className="space-y-6">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                  <div>
                    <span className="zx-eyebrow text-zx-text">
                      01 / {isArabic ? 'بطاقات الهوية المتصلة' : 'CONNECTED IDENTITY'}
                    </span>
                    <h2 className="zx-display mt-2 text-2xl text-zx-text sm:text-3xl">
                      {resolvedSettings.content.cardsTitle[locale]}
                    </h2>
                  </div>
                  <button
                    className="flex items-center gap-1.5 text-xs font-bold text-zx-text hover:text-zx-text"
                    onClick={() => navigate('cards')}
                    type="button"
                  >
                    <span>{isArabic ? 'استعراض كافة البطاقات' : 'View All Cards'}</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {storefrontProducts.filter((p) => p.category === 'cards').slice(0, 3).length === 0 ? (
                    <DepartmentEmptyState actionLabel={isArabic ? 'اكتشف البطاقات' : 'Explore NFC cards'} description={isArabic ? 'نجهّز لك تجربة بطاقات تربط حضورك الرقمي بلمسة واحدة. تواصل معنا لمساعدتك في اختيار التصميم المناسب.' : 'We are preparing a considered NFC collection. Talk to our team and we will help you choose the right design.'} image={art.cardsPortal} locale={locale} onAction={() => navigate('cards')} title={isArabic ? 'هويتك الرقمية تبدأ من هنا' : 'Your connected identity starts here'} />
                  ) : storefrontProducts
                    .filter((p) => p.category === 'cards')
                    .slice(0, 3)
                    .map((p) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        categoryLabel={categories.find((category) => category.slug === p.subcategoryId)?.name[locale] ?? categoryNameFor(p.category, p.category.toUpperCase())}
                        market={market}
                        locale={locale}
                        wishlisted={wishlist.includes(p.id)}
                        renderPrice={(price, className) => (
                          <PriceTag className={className} price={price} market={market} locale={locale} />
                        )}
                        onToggleWishlist={handleToggleWishlist}
                        onShare={handleShareProduct}
                        onNotifyAvailability={(item) => setRestockProduct(item)}
                        onAddToCart={(prod) => handleAddToCart(prod)}
                        onCustomize={handleOpenNfcCustomizer}
                      />
                    ))}
                </div>
              </section>
            )}

            {/* 4. Section 02: Streetwear Collection Showcase */}
            {isDepartmentActive('fashion') && (
              <section className="space-y-6">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                  <div>
                    <span className="zx-eyebrow text-zx-text">
                      02 / {isArabic ? 'مجموعة الأزياء والستريت وير' : 'STREETWEAR COLLECTION'}
                    </span>
                    <h2 className="zx-display mt-2 text-2xl text-zx-text sm:text-3xl">
                      {resolvedSettings.content.fashionTitle[locale]}
                    </h2>
                  </div>
                  <button
                    className="flex items-center gap-1.5 text-xs font-bold text-zx-text hover:text-zx-text"
                    onClick={() => navigate('fashion')}
                    type="button"
                  >
                    <span>{isArabic ? 'استعراض التشكيلة' : 'View Drop'}</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  {storefrontProducts.filter((p) => p.category === 'fashion').slice(0, 2).length === 0 ? (
                    <DepartmentEmptyState actionLabel={isArabic ? 'اكتشف الأزياء' : 'Explore fashion'} description={isArabic ? 'المجموعة الجديدة قيد التجهيز. استكشف قسم الأزياء أو تواصل معنا لمعرفة المتاح.' : 'The next fashion collection is being prepared. Explore the department or ask our team what is available.'} image={art.hoodie} locale={locale} onAction={() => navigate('fashion')} title={isArabic ? 'تفاصيل مختارة ليومك' : 'Thoughtful pieces for every day'} />
                  ) : storefrontProducts
                    .filter((p) => p.category === 'fashion')
                    .slice(0, 2)
                    .map((p) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        categoryLabel={categories.find((category) => category.slug === p.subcategoryId)?.name[locale] ?? categoryNameFor(p.category, p.category.toUpperCase())}
                        market={market}
                        locale={locale}
                        wishlisted={wishlist.includes(p.id)}
                        renderPrice={(price, className) => (
                          <PriceTag className={className} price={price} market="eg" locale={locale} />
                        )}
                        onToggleWishlist={handleToggleWishlist}
                        onShare={handleShareProduct}
                        onNotifyAvailability={(item) => setRestockProduct(item)}
                        onAddToCart={(prod, variant) => handleAddToCart(prod, undefined, variant)}
                        badge={isArabic ? 'إصدار محدود' : 'Limited Drop'}
                      />
                    ))}
                </div>
              </section>
            )}

            <BrandIdentityBlock locale={locale} />

            {/* 5. Section 03: Digital Studio, Live Demos & Software Agency */}
            {isDepartmentActive('services') && (
              <section className="space-y-6">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                  <div>
                    <span className="zx-eyebrow text-zx-text">
                      03 / {isArabic ? 'استوديو زكسور' : 'ZEXOR STUDIO'}
                    </span>
                    <h2 className="zx-display mt-2 text-2xl text-zx-text sm:text-3xl">
                      {resolvedSettings.content.servicesTitle[locale]}
                    </h2>
                  </div>
                  <button
                    className="flex items-center gap-1.5 text-xs font-bold text-zx-text hover:text-zx-text"
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
                      className="zx-showcase-card group overflow-hidden rounded-[1.7rem] border border-zx-border bg-zx-surface-raised shadow-zx-card transition-all duration-300 hover:-translate-y-1 hover:border-zx-border hover:shadow-zx-card"
                      intensity={8}
                      key={proj.id}
                    >
                      <div className="relative aspect-[1.55/1] overflow-hidden bg-zx-mint">
                        <img alt={proj.title[locale]} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" src={publicAssetUrl(proj.image)} />
                        <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-zx-cinematic/35 to-transparent" />
                        <span className="absolute inset-s-3 top-3 rounded-full bg-zx-cinematic/80 px-2.5 py-1 text-[8px] font-semibold text-zx-accent-contrast backdrop-blur-md">
                          {proj.category[locale]}
                        </span>
                      </div>
                      <div className="flex min-h-47.5 flex-col p-4 sm:p-5">
                        <h3 className="line-clamp-1 text-sm font-bold text-zx-text">{proj.title[locale]}</h3>
                        <p className="mt-2 line-clamp-3 min-h-15 text-[11px] leading-5 text-zx-text">{proj.description[locale]}</p>
                        <a
                          className="mt-auto flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-zx-cinematic px-4 text-xs font-semibold text-zx-accent-contrast shadow-xs transition hover:bg-zx-cinematic"
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
            {isDepartmentActive('cars') && (
              <section className="space-y-6">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                  <div>
                    <span className="zx-eyebrow text-zx-text">
                      04 / {isArabic ? 'معرض ومكتب السيارات الفاخرة' : 'CURATED VEHICLES'}
                    </span>
                    <h2 className="zx-display mt-2 text-2xl text-zx-text sm:text-3xl">
                      {resolvedSettings.content.carsTitle[locale]}
                    </h2>
                  </div>
                  <button
                    className="flex items-center gap-1.5 text-xs font-bold text-zx-text hover:text-zx-text"
                    onClick={() => navigate('cars')}
                    type="button"
                  >
                    <span>{isArabic ? 'استعراض كل السيارات' : 'View All Cars'}</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {vehicles.length === 0 ? (
                    <DepartmentEmptyState actionLabel={isArabic ? 'تواصل مع فريق السيارات' : 'Ask our vehicle team'} description={isArabic ? 'لا توجد سيارات منشورة في المعرض حالياً. فريقنا يساعدك في العثور على خيار الإيجار المناسب.' : 'There are no published vehicles in the showroom right now. Our team can help you find a rental that fits.'} image={art.vehiclesPortal} locale={locale} onAction={() => navigate('cars')} title={isArabic ? 'اختيارك القادم يبدأ من هنا' : 'Your next drive starts here'} />
                  ) : vehicles.map((car) => (
                    <TiltCard
                      className="zx-showcase-card group overflow-hidden rounded-[1.7rem] border border-zx-border bg-zx-surface-raised shadow-zx-card transition-all duration-300 hover:-translate-y-1 hover:border-zx-border hover:shadow-zx-card"
                      intensity={8}
                      key={car.id}
                    >
                      <div className="relative aspect-[1.42/1] overflow-hidden bg-zx-mint">
                        <img alt={car.title[locale]} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" src={publicAssetUrl(car.photo)} />
                        <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-zx-cinematic/50 to-transparent" />
                        <span className="absolute inset-s-3 top-3 rounded-full border border-zx-border/20 bg-zx-cinematic/55 px-2.5 py-1 text-[8px] font-bold text-zx-accent-contrast backdrop-blur-md">{car.id}</span>
                        <span className="absolute inset-e-3 top-3 rounded-full border border-zx-border/20 bg-zx-cinematic/85 px-2.5 py-1 text-[9px] font-bold text-zx-accent-contrast backdrop-blur-md">
                          {car.deal === 'Rent' ? isArabic ? 'للإيجار' : 'For rent' : isArabic ? 'للبيع' : 'For sale'}
                        </span>
                      </div>
                      <div className="flex                       min-h-56.25 flex-col p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="line-clamp-1 text-sm font-bold text-zx-text">{car.title[locale]}</h3>
                          <span className="shrink-0 rounded-full bg-zx-mint px-2.5 py-1 text-[9px] font-bold text-zx-mint-contrast">{car.make}</span>
                        </div>
                        <p className="mt-1.5 line-clamp-1 text-[10px] text-zx-text">{car.location[locale]}</p>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {[String(car.year), car.transmission === 'Automatic' ? (isArabic ? 'أوتوماتيك' : 'Automatic') : (isArabic ? 'مانيوال' : 'Manual'), car.body].map((spec) => (
                            <span className="rounded-lg border border-zx-border bg-zx-mint px-2 py-1 text-[9px] font-semibold text-zx-mint-contrast" key={spec}>
                              {isArabic ? ({ Sedan: 'سيدان', SUV: 'دفع رباعي', Coupe: 'كوبيه' } as Record<string, string>)[spec] ?? spec : spec}
                            </span>
                          ))}
                        </div>
                        <div className="mt-4 border-t border-zx-border pt-3">
                          <span className="block text-[9px] font-semibold text-zx-text-secondary">{isArabic ? 'السعر' : 'PRICE'}</span>
                          <p className="zx-display mt-1 text-lg text-zx-text">
                            {money(car.price, car.region === 'Riyadh' || car.region === 'Jeddah' ? 'ksa' : 'eg', locale)}
                            {car.deal === 'Rent' && <span className="ms-1 font-sans text-[10px] font-semibold text-zx-text">/ {isArabic ? ({ Day: 'يوم', Week: 'أسبوع', Month: 'شهر' } as const)[car.rentalPeriod ?? 'Day'] : (car.rentalPeriod ?? 'Day').toLowerCase()}</span>}
                          </p>
                        </div>
                        <button
                          className="mt-auto flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-zx-cinematic text-xs font-semibold text-zx-accent-contrast transition hover:bg-zx-cinematic"
                          onClick={() => {
                            const msg = isArabic
                              ? `${car.deal === 'Rent' ? 'طلب استئجار' : 'طلب حجز معاينة للسيارة'} ${car.id}: ${car.title.ar}`
                              : `${car.deal === 'Rent' ? 'Rental inquiry' : 'Booking inspection'} for ${car.id}: ${car.title.en}`;
                            openWhatsApp(whatsappNumberFor(market, resolvedSettings), msg);
                          }}
                          type="button"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                            {car.deal === 'Rent' ? isArabic ? 'استفسر عن الإيجار' : 'Ask about rental' : isArabic ? 'احجز معاينة على واتساب' : 'Book Inspection'}
                        </button>
                      </div>
                    </TiltCard>
                  ))}
                </div>
              </section>
            )}

            {/* 7. Section 05: Prime Real Estate Showcase */}
            {isDepartmentActive('property') && (
              <section className="space-y-6">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                  <div>
                    <span className="zx-eyebrow text-zx-text">
                      05 / {isArabic ? 'قسم العقارات والمساحات' : 'PRIME REAL ESTATE'}
                    </span>
                    <h2 className="zx-display mt-2 text-2xl text-zx-text sm:text-3xl">
                      {resolvedSettings.content.propertyTitle[locale]}
                    </h2>
                  </div>
                  <button
                    className="flex items-center gap-1.5 text-xs font-bold text-zx-text hover:text-zx-text"
                    onClick={() => navigate('property')}
                    type="button"
                  >
                    <span>{isArabic ? 'استعراض كل العقارات' : 'View All Properties'}</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {properties.length === 0 ? (
                    <DepartmentEmptyState actionLabel={isArabic ? 'تواصل مع فريق العقارات' : 'Ask our property team'} description={isArabic ? 'لا توجد مساحات منشورة حالياً. أخبرنا بما تبحث عنه وسنساعدك في العثور على إيجار مناسب.' : 'There are no published spaces right now. Tell us what you need and we will help find a suitable rental.'} image={art.estatePortal} locale={locale} onAction={() => navigate('property')} title={isArabic ? 'مساحة تناسب خطوتك القادمة' : 'Find room for what comes next'} />
                  ) : properties.map((prop) => (
                    <TiltCard
                      className="zx-showcase-card group overflow-hidden rounded-[1.7rem] border border-zx-border bg-zx-surface-raised shadow-zx-card transition-all duration-300 hover:-translate-y-1 hover:border-zx-border hover:shadow-zx-card"
                      intensity={8}
                      key={prop.id}
                    >
                      <div className="relative aspect-[1.42/1] overflow-hidden bg-zx-mint">
                        <img alt={prop.title[locale]} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" src={publicAssetUrl(prop.photo)} />
                        <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-zx-cinematic/50 to-transparent" />
                        <span className="absolute inset-s-3 top-3 rounded-full bg-zx-cinematic/60 px-2.5 py-1 text-[8px] font-bold text-zx-accent-contrast backdrop-blur-md">
                          {prop.id}
                        </span>
                        <span className="absolute inset-e-3 top-3 rounded-full bg-zx-cinematic px-2.5 py-1 text-[8px] font-semibold text-zx-accent-contrast">
                          {prop.deal === 'Sale' ? (isArabic ? 'للبيع' : 'Sale') : isArabic ? 'للإيجار' : 'Rent'}
                        </span>
                      </div>
                      <div className="flex                       min-h-56.25 flex-col p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="line-clamp-2 min-h-10 text-sm font-bold text-zx-text">{prop.title[locale]}</h3>
                          <span className="shrink-0 rounded-full bg-zx-mint px-2.5 py-1 text-[9px] font-bold text-zx-mint-contrast">
                            {isArabic ? ({ Apartment: 'شقة', Villa: 'فيلا', Land: 'أرض', Shop: 'محل' } as Record<string, string>)[prop.type] ?? prop.type : prop.type}
                          </span>
                        </div>
                        <p className="mt-1.5 line-clamp-1 text-[10px] text-zx-text">{prop.location[locale]}</p>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {[`${new Intl.NumberFormat('en-US').format(prop.area)} ${isArabic ? 'م²' : 'm²'}`, prop.rooms > 0 ? `${prop.rooms} ${isArabic ? 'غرف' : 'rooms'}` : ''].filter(Boolean).map((spec) => (
                            <span className="rounded-lg border border-zx-border bg-zx-mint px-2 py-1 text-[9px] font-semibold text-zx-mint-contrast" key={spec}>{spec}</span>
                          ))}
                        </div>
                        <div className="mt-4 border-t border-zx-border pt-3">
                          <span className="block text-[9px] font-semibold text-zx-text-secondary">{isArabic ? 'السعر' : 'PRICE'}</span>
                          <p className="zx-display mt-1 text-lg text-zx-text">
                            {money(prop.price, prop.region === 'Riyadh' || prop.region === 'Jeddah' ? 'ksa' : 'eg', locale)}
                          {prop.deal === 'Rent' && <span className="ms-1 font-sans text-[10px] font-semibold text-zx-text">{isArabic ? 'إيجار' : 'rent'}</span>}
                          </p>
                        </div>
                        <button
                          className="mt-auto flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-zx-cinematic text-xs font-semibold text-zx-accent-contrast transition hover:bg-zx-cinematic"
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
            <TestimonialsSection
              locale={locale}
              onContact={() => openWhatsApp(
                whatsappNumberFor(market, resolvedSettings),
                isArabic ? 'مرحباً، أرغب في مشاركة تجربتي مع ZEXOR.' : 'Hello, I would like to share my experience with ZEXOR.',
              )}
            />

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
            <section className="relative overflow-hidden rounded-4xl border border-zx-border bg-linear-to-br from-zx-cinematic to-zx-cinematic p-8 text-zx-accent-contrast shadow-2xl sm:p-14">
              <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div className="max-w-xl">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zx-text-secondary">
                    {isArabic ? 'ابدأ خطوتك القادمة الآن' : 'YOUR NEXT MOVE STARTS HERE'}
                  </span>
                  <h2 className="mt-2 text-3xl font-extrabold sm:text-5xl">
                    {resolvedSettings.content.ctaTitle[locale]}
                  </h2>
                  <p className="mt-3 text-xs leading-6 text-zx-accent-contrast/75 sm:text-sm">
                    {resolvedSettings.content.ctaText[locale]}
                  </p>
                </div>
                <a
                  className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-zx-surface-raised px-8 text-xs font-bold text-zx-text shadow-lg transition-all hover:bg-zx-accent"
                  href={`https://wa.me/${market === 'eg' ? resolvedSettings.whatsappEg : resolvedSettings.whatsappKsa}?text=${encodeURIComponent(
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
            {departmentBanner('cards', isArabic ? 'هويتك الرقمية، بلمسة واحدة' : 'Your identity, one tap away', isArabic ? 'بطاقات NFC عملية وأنيقة تربط تفاصيلك المهنية والاجتماعية مباشرة بهاتفك.' : 'Thoughtful NFC cards that connect your professional identity and social profiles in one tap.')}
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              {renderSubcategoryChips('cards', (subcategory) => storefrontProducts.filter((product) => product.category === 'cards' && (!subcategory ? true : product.subcategoryId === subcategory)).length)}

              {/* Direct Customize CTA */}
              <button
                className="flex items-center gap-2 rounded-full bg-zx-cinematic px-5 py-2.5 text-xs font-bold text-zx-accent-contrast shadow-md hover:bg-zx-cinematic"
                disabled={!storefrontProducts.some((product) => product.category === 'cards')}
                onClick={() => {
                  const product = storefrontProducts.find((item) => item.category === 'cards');
                  if (product) handleOpenNfcCustomizer(product);
                }}
                type="button"
              >
                <Fingerprint className="h-4 w-4" />
                {isArabic ? 'استوديو تخصيص الكارت المباشر' : 'Open Live 3D Customizer'}
              </button>
            </div>

            {/* Product Cards Grid — premium surface, image plate with a soft
                inner ring, discount badge and a two-tier action row. */}
            <div id="department-content" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {currentCategoryProducts.length === 0 ? (
                <DepartmentEmptyState actionLabel={isArabic ? 'اسألنا عن تصميم بطاقتك' : 'Ask about your NFC card'} description={isArabic ? 'تواصل مع فريقنا لتجهيز بطاقة NFC بتصميم يناسب هويتك، وسنخبرك بالتفاصيل المتاحة.' : 'Talk with our team about an NFC card designed around your identity, and we will share the available options.'} image={art.cardsPortal} locale={locale} onAction={() => openWhatsApp(whatsappNumberFor(market, resolvedSettings), isArabic ? 'مرحباً، أرغب في الاستفسار عن بطاقات NFC وتصميمها.' : 'Hello, I would like to ask about NFC cards and their design.')} title={isArabic ? 'بطاقتك المميزة تبدأ بفكرة' : 'Your signature card starts with an idea'} />
              ) : currentCategoryProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  categoryLabel={categoryNameFor(p.category, p.category.toUpperCase())}
                  market={market}
                  locale={locale}
                  wishlisted={wishlist.includes(p.id)}
                  renderPrice={(price, className) => (
                    <PriceTag className={className} price={price} market={market} locale={locale} />
                  )}
                  onToggleWishlist={handleToggleWishlist}
                  onShare={handleShareProduct}
                  onNotifyAvailability={(item) => setRestockProduct(item)}
                  onAddToCart={(prod) => handleAddToCart(prod)}
                  onCustomize={handleOpenNfcCustomizer}
                />
              ))}
            </div>
          </div>
        )}

        {/* Route: Fashion */}
        {route === 'fashion' && (
          <div className="space-y-10">
            {departmentBanner('fashion', isArabic ? 'تفاصيل يومية، بطابع مختلف' : 'Everyday pieces, a distinct point of view', isArabic ? 'اختيارات أزياء مريحة بقصّات واضحة وتفاصيل مدروسة تناسب يومك.' : 'Considered everyday essentials with confident silhouettes and thoughtful details.')}

            {activeFashionSubcategories.length > 0 && (
              <nav aria-label={isArabic ? 'أقسام الأزياء الفرعية' : 'Fashion collections'} className="flex flex-wrap gap-2">
                <button
                  aria-pressed={!activeSelectedFashionSubcategory}
                  className={`min-h-10 rounded-full border px-4 text-xs font-semibold transition ${!activeSelectedFashionSubcategory ? 'border-zx-border bg-zx-cinematic text-zx-accent-contrast shadow-sm' : 'border-zx-border bg-zx-surface-raised text-zx-text hover:border-zx-border'}`}
                  onClick={() => setSelectedSubcategories((current) => ({ ...current, fashion: '' }))}
                  type="button"
                >
                  {isArabic ? `كل الأزياء (${fashionProductsInMarket.length})` : `All fashion (${fashionProductsInMarket.length})`}
                </button>
                {activeFashionSubcategories.map((subcategory) => {
                  const count = fashionProductsInMarket.filter((product) => product.subcategoryId === subcategory.slug).length;
                  const active = activeSelectedFashionSubcategory === subcategory.slug;
                  return (
                    <button
                      aria-pressed={active}
                      className={`min-h-10 rounded-full border px-4 text-xs font-semibold transition ${active ? 'border-zx-border bg-zx-cinematic text-zx-accent-contrast shadow-sm' : 'border-zx-border bg-zx-surface-raised text-zx-text hover:border-zx-border'}`}
                      key={subcategory.id}
                      onClick={() => setSelectedSubcategories((current) => ({ ...current, fashion: subcategory.slug }))}
                      type="button"
                    >
                      {subcategory.name[locale]} <span className="ms-1 opacity-70">{count}</span>
                    </button>
                  );
                })}
              </nav>
            )}

            <div id="department-content" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {currentCategoryProducts.length === 0 ? (
                <DepartmentEmptyState actionLabel={isArabic ? 'اسألنا عن الأزياء' : 'Ask about the collection'} description={isArabic ? 'تواصل معنا لمعرفة التشكيلات المتاحة ومواعيد وصول القطع الجديدة.' : 'Contact us for current availability and details about the next fashion release.'} image={art.hoodie} locale={locale} onAction={() => openWhatsApp(whatsappNumberFor(market, resolvedSettings), isArabic ? 'مرحباً، أود معرفة المتاح في قسم الأزياء.' : 'Hello, I would like to ask what is available in the fashion collection.')} title={isArabic ? 'اختيارات جديدة في الطريق' : 'A new edit is on the way'} />
              ) : currentCategoryProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  categoryLabel={categories.find((category) => category.slug === p.subcategoryId)?.name[locale] ?? categoryNameFor(p.category, p.category.toUpperCase())}
                  market="eg"
                  locale={locale}
                  wishlisted={wishlist.includes(p.id)}
                  renderPrice={(price, className) => (
                    <PriceTag className={className} price={price} market="eg" locale={locale} />
                  )}
                  onToggleWishlist={handleToggleWishlist}
                  onShare={handleShareProduct}
                  onNotifyAvailability={(item) => setRestockProduct(item)}
                  onAddToCart={(prod, variant) => handleAddToCart(prod, undefined, variant)}
                  badge={isArabic ? 'إصدار محدود' : 'Limited Drop'}
                />
              ))}
            </div>
          </div>
        )}

        {/* Route: Services (Agency, Portfolio, Calculator, Reviews, CV) */}
        {(route === 'services' || route === 'pricing' || route === 'calculator') && (
          <div className="space-y-8">{departmentBanner('services', isArabic ? 'نبني حضورك الرقمي من الفكرة للإطلاق' : 'From first idea to a confident digital launch', isArabic ? 'مواقع ومتاجر وتجارب رقمية مصممة حول احتياج مشروعك.' : 'Websites, stores and digital experiences shaped around your business.')}
          <section className="space-y-5"><div className="flex flex-wrap items-end justify-between gap-4"><div><span className="text-[10px] font-bold uppercase tracking-[.2em] text-zx-text">{isArabic ? 'حلولنا' : 'OUR SERVICES'}</span><h2 className="zx-display mt-2 text-2xl font-bold text-zx-text">{isArabic ? 'خدمات تناسب احتياج مشروعك' : 'Services for your next step'}</h2></div>{renderSubcategoryChips('services', (subcategory) => storefrontProducts.filter((product) => product.category === 'services' && (!subcategory || product.subcategoryId === subcategory)).length)}</div>
          <div id="department-content" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{serviceProducts.length ? serviceProducts.map((product) => <ProductCard key={product.id} product={product} categoryLabel={categories.find((category) => category.slug === product.subcategoryId)?.name[locale] ?? categoryNameFor('services', 'ZEXOR STUDIO')} market={market} locale={locale} wishlisted={wishlist.includes(product.id)} renderPrice={(price, className) => <PriceTag className={className} price={price} market={market} locale={locale} />} onToggleWishlist={handleToggleWishlist} onShare={handleShareProduct} onNotifyAvailability={(item) => setRestockProduct(item)} onAddToCart={(item, variant) => handleAddToCart(item, undefined, variant)} />) : <DepartmentEmptyState actionLabel={isArabic ? 'ناقش مشروعك معنا' : 'Discuss a project'} description={isArabic ? 'احكِ لنا عن فكرتك وسنقترح عليك الخطوة المناسبة ونبني تجربة رقمية تناسب مشروعك.' : 'Tell us about your idea and we will help shape the right digital experience for your business.'} image={art.studioPortal} locale={locale} onAction={() => openWhatsApp(whatsappNumberFor(market, resolvedSettings), isArabic ? 'مرحباً، أرغب في مناقشة مشروع رقمي جديد.' : 'Hello, I would like to discuss a new digital project.')} title={isArabic ? 'كل مشروع ناجح يبدأ بحوار' : 'Every good project starts with a conversation'} />}</div></section>
          <AgencyPortfolio
            locale={locale}
            market={market}
            sectionName={categoryNameFor('services', isArabic ? 'استوديو زكسور' : 'ZEXOR STUDIO')}
            onInquiry={handleAddInquiry}
            onWhatsApp={(m, text) => openWhatsApp(whatsappNumberFor(m, resolvedSettings), text)}
          /></div>
        )}

        {/* Route: Reviews Dedicated */}
        {route === 'reviews' && (
          <div className="space-y-10">
          <TestimonialsSection
            locale={locale}
            onContact={() => openWhatsApp(
              whatsappNumberFor(market, resolvedSettings),
              isArabic ? 'مرحباً، أرغب في مشاركة تجربتي مع ZEXOR.' : 'Hello, I would like to share my experience with ZEXOR.',
            )}
          />
          </div>
        )}

        {/* Route: Cars */}
        {route === 'cars' && (
          <Marketplace
            locale={locale}
            market={market}
            mode="cars"
            sectionName={categoryNameFor('cars', isArabic ? 'زكسور موتورز' : 'ZEXOR MOTORS')}
            banner={departmentFor('cars')}
            subcategories={subcategoriesFor('cars')}
            onInquiry={handleAddInquiry}
            onWhatsApp={(m, text) => openWhatsApp(whatsappNumberFor(m, resolvedSettings), text)}
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
            sectionName={categoryNameFor('property', isArabic ? 'زكسور إستيتس' : 'ZEXOR ESTATES')}
            banner={departmentFor('property')}
            subcategories={subcategoriesFor('property')}
            onInquiry={handleAddInquiry}
            onWhatsApp={(m, text) => openWhatsApp(whatsappNumberFor(m, resolvedSettings), text)}
            properties={properties}
            vehicles={vehicles}
          />
        )}

        {currentDynamicDepartment && (
          <section className="space-y-10">
            <DepartmentBanner locale={locale} name={currentDynamicDepartment.name[locale]} title={currentDynamicDepartment.bannerTitle?.[locale]} text={currentDynamicDepartment.bannerText?.[locale]} image={currentDynamicDepartment.bannerImage} accent={currentDynamicDepartment.bannerAccent} slides={dynamicDepartmentSlides} fallbackImage={art.studioPortal} fallbackTitle={isArabic ? `اكتشف ${currentDynamicDepartment.name.ar}` : `Discover ${currentDynamicDepartment.name.en}`} fallbackText={isArabic ? 'اختيارات منتقاة بعناية، بتفاصيل تقدر تعدلها وتطورها من لوحة الإدارة.' : 'A considered collection with content and details you can shape from the admin dashboard.'} />
            <div id="department-content" className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
              <div className="rounded-4xl border border-zx-border bg-zx-surface-raised p-7 shadow-sm sm:p-9">
                <span className="text-[10px] font-bold uppercase tracking-[.2em] text-zx-text">{isArabic ? 'مساحة هذا القسم' : 'THE DEPARTMENT'}</span>
                <h2 className="zx-display mt-4 text-2xl font-bold text-zx-text sm:text-3xl">{currentDynamicDepartment.name[locale]}</h2>
                <p className="mt-3 text-sm leading-7 text-zx-text">{currentDynamicDepartment.bannerText?.[locale] || (isArabic ? 'أضف وصفاً وصورة من لوحة الإدارة ليظهر هنا، ثم أضف المنتجات واربطها بالمجموعات المناسبة.' : 'Add a description and image in Admin, then assign products to this department and its collections.')}</p>
                <div className="mt-7 flex flex-wrap gap-2">
                  <span className="rounded-full bg-zx-mint px-4 py-2 text-[11px] font-semibold text-zx-mint-contrast">{isArabic ? `${dynamicDepartmentProducts.length} منتج` : `${dynamicDepartmentProducts.length} products`}</span>
                  <span className="rounded-full bg-zx-mint px-4 py-2 text-[11px] font-semibold text-zx-mint-contrast">{isArabic ? `${dynamicDepartmentChildren.length} مجموعة` : `${dynamicDepartmentChildren.length} collections`}</span>
                </div>
              </div>
              <div className="relative min-h-64 overflow-hidden rounded-4xl bg-zx-mint p-6 sm:p-9">
                <img alt="" className="absolute inset-0 h-full w-full object-cover opacity-80 mix-blend-multiply" src={publicAssetUrl(currentDynamicDepartment.bannerImage || art.studioPortal)} />
                <div className="absolute inset-0 bg-linear-to-t from-zx-cinematic/85 via-zx-cinematic/15 to-transparent" />
                <div className="relative z-10 flex h-full min-h-52 flex-col justify-end text-zx-accent-contrast">
                  <span className="text-[10px] font-bold uppercase tracking-[.2em] text-zx-accent-contrast/75">ZEXOR COLLECTIONS</span>
                  <p className="mt-2 text-xl font-semibold">{currentDynamicDepartment.bannerTitle?.[locale] || currentDynamicDepartment.name[locale]}</p>
                </div>
              </div>
            </div>
            {dynamicDepartmentChildren.length > 0 && <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{dynamicDepartmentChildren.map((child, index) => <button aria-pressed={selectedSubcategories[currentDynamicDepartment.slug] === child.slug} className="group relative min-h-36 overflow-hidden rounded-3xl border border-zx-border bg-zx-surface-raised p-5 text-start shadow-sm transition hover:-translate-y-1 hover:shadow-lg" key={child.id} onClick={() => setSelectedSubcategories((current) => ({ ...current, [currentDynamicDepartment.slug]: child.slug }))} type="button"><div className={`absolute inset-y-0 inset-e-0 w-1/2 opacity-50 transition group-hover:opacity-80 ${index % 3 === 0 ? 'bg-linear-to-l from-zx-mint' : index % 3 === 1 ? 'bg-linear-to-l from-zx-mint' : 'bg-linear-to-l from-zx-mint'}`} /><span className="relative text-[10px] font-semibold uppercase tracking-widest text-zx-text-secondary">{isArabic ? 'مجموعة' : 'COLLECTION'} 0{index + 1}</span><h3 className="relative mt-3 text-lg font-bold text-zx-text">{child.name[locale]}</h3><span className="relative mt-4 inline-flex rounded-full bg-zx-mint px-3 py-1.5 text-[10px] text-zx-mint-contrast">{isArabic ? 'عرض المجموعة ←' : 'Explore collection →'}</span></button>)}</div>}
            <div className="space-y-5">
              <div className="flex items-end justify-between gap-4"><div><span className="text-[10px] font-bold uppercase tracking-[.2em] text-zx-text">{isArabic ? 'مختارة لك' : 'CURATED FOR YOU'}</span><h2 className="zx-display mt-2 text-2xl font-bold text-zx-text">{isArabic ? 'منتجات القسم' : 'Department products'}</h2></div>{renderSubcategoryChips(currentDynamicDepartment.slug, (childSlug) => storefrontProducts.filter((product) => product.category === currentDynamicDepartment.slug && (!childSlug || product.subcategoryId === childSlug)).length)}</div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{dynamicDepartmentProducts.length === 0 ? <DepartmentEmptyState actionLabel={isArabic ? 'اسألنا عن القسم' : 'Ask about this collection'} description={isArabic ? 'تواصل معنا لمعرفة التفاصيل والاختيارات المتاحة في هذا القسم.' : 'Contact our team for details and current options in this department.'} image={publicAssetUrl(currentDynamicDepartment.bannerImage || art.studioPortal) ?? art.studioPortal} locale={locale} onAction={() => openWhatsApp(whatsappNumberFor(market, resolvedSettings), isArabic ? `مرحباً، أود الاستفسار عن ${currentDynamicDepartment.name.ar}.` : `Hello, I would like to ask about ${currentDynamicDepartment.name.en}.`)} title={isArabic ? 'اختيارات القسم تتشكل لك' : 'A collection shaped around you'} /> : dynamicDepartmentProducts.map((product) => <ProductCard key={product.id} product={product} categoryLabel={categories.find((category) => category.slug === product.subcategoryId)?.name[locale] ?? currentDynamicDepartment.name[locale]} market={market} locale={locale} wishlisted={wishlist.includes(product.id)} renderPrice={(price, className) => <PriceTag className={className} price={price} market={market} locale={locale} />} onToggleWishlist={handleToggleWishlist} onShare={handleShareProduct} onNotifyAvailability={(item) => setRestockProduct(item)} onAddToCart={(item, variant) => handleAddToCart(item, undefined, variant)} />)}</div>
            </div>
          </section>
        )}

        {/* Route: Tracking */}
        {route === 'tracking' && (
          <div className="space-y-10">
            <div className="text-center">
              <span className="text-[9px] font-bold uppercase tracking-widest text-zx-text">
                {isArabic ? 'تتبّع الشحنات' : 'Shipment Tracking'}
              </span>
              <h1 className="mt-1 text-3xl font-extrabold text-zx-text">
                {isArabic ? 'تتبّع طلبك خطوة بخطوة' : 'Follow Your Order Step by Step'}
              </h1>
              <p className="mx-auto mt-2 max-w-xl text-xs leading-6 text-zx-text">
                {isArabic
                  ? 'افتح نافذة التتبع وأدخل رقم طلبك لمتابعة حالة الشحن مباشرة.'
                  : 'Open the tracker and enter your order number to follow your shipment live.'}
              </p>
              <button
                className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-zx-cinematic px-6 text-xs font-bold text-zx-accent-contrast shadow-md transition-all hover:bg-zx-cinematic"
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
          <div className="zx-contact-panel mx-auto max-w-2xl rounded-3xl border border-zx-border bg-zx-surface-raised/90 p-8 shadow-xl">
            <span className="text-[9px] font-bold uppercase tracking-widest text-zx-text">
              {isArabic ? 'تواصل مباشر وسريع' : 'Direct Conversation'}
            </span>
            <h1 className="mt-1 text-2xl font-bold text-zx-text">
              {isArabic ? 'ابدأ محادثة مع فريق ZEXOR' : 'Start a Conversation with Us'}
            </h1>
            <p className="mt-2 text-xs leading-6 text-zx-text">
              {isArabic
                ? 'شاركنا تفاصيل مشروعك أو طلبك وسنقوم بالرد عليك فوراً وإعداد ملخص متكامل.'
                : 'Send your project brief, budget and requirements for rapid response.'}
            </p>

            <form
              className="zx-contact-form mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                const name = String(form.get('name') ?? '');
                const phone = String(form.get('phone') ?? '');
                const budget = String(form.get('budget') ?? '');
                const details = String(form.get('details') ?? '');

                const inq: PlatformInquiry = {
                  id: `ZX-INQ-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
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
                handleAddInquiry(inq);

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

                openWhatsApp(whatsappNumberFor(market, resolvedSettings), text);
                setToast(isArabic ? 'تم حفظ رسالتك وجارٍ فتح واتساب!' : 'Opening WhatsApp!');
              }}
            >
              <div>
                <label className="text-xs font-semibold text-zx-text" htmlFor="contact-name">{isArabic ? 'الاسم بالكامل' : 'Full Name'}</label>
                <input autoComplete="name" className="zx-contact-field mt-1 w-full rounded-xl border border-zx-border px-3 text-base outline-none" id="contact-name" name="name" required />
              </div>
              <div>
                <label className="text-xs font-semibold text-zx-text" htmlFor="contact-phone">{isArabic ? 'رقم الهاتف / واتساب' : 'Phone / WhatsApp'}</label>
                <input autoComplete="tel" className="zx-contact-field mt-1 w-full rounded-xl border border-zx-border px-3 text-base outline-none" id="contact-phone" name="phone" required type="tel" />
              </div>
              <div>
                <label className="text-xs font-semibold text-zx-text" htmlFor="contact-budget">{isArabic ? 'الميزانية التقريبية' : 'Estimated Budget'}</label>
                <input className="zx-contact-field mt-1 w-full rounded-xl border border-zx-border px-3 text-base outline-none" id="contact-budget" name="budget" placeholder="EGP / SAR" />
              </div>
              <div>
                <label className="text-xs font-semibold text-zx-text" htmlFor="contact-details">{isArabic ? 'تفاصيل الطلب أو المشروع' : 'Project Brief'}</label>
                <textarea className="zx-contact-field mt-1 w-full rounded-xl border border-zx-border p-3 text-base outline-none" id="contact-details" name="details" required />
              </div>
              <button
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-zx-cinematic text-xs font-semibold text-zx-accent-contrast shadow-md hover:bg-zx-cinematic"
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
            <>
            <AdminDashboard
              categories={categories}
              inbox={inbox}
              locale={locale}
              market={market}
              onLock={() => {
                setAdminAuthenticated(false);
                setCloudOrdersLoaded(false);
                setCloudInquiriesLoaded(false);
                setPrivateSecretsLoaded(false);
                setSettings((current) => ({ ...current, telegramBotToken: '', telegramChatId: '' }));
                void supabase.auth.signOut();
                navigate('home');
              }}
              onDeleteInquiry={handleDeleteCloudInquiry}
              onDeleteOrder={handleDeleteCloudOrder}
              onSaveOrder={handleSaveCloudOrder}
              onClearInquiries={handleClearCloudInquiries}
              onClearOrders={handleClearCloudOrders}
              onSetProductStock={handleSetCloudProductStock}
              onUpdateOrderStatus={handleUpdateCloudOrderStatus}
              onUpdateOrderShipping={handleUpdateCloudOrderShipping}
              onUpdateInquiryStatus={handleUpdateCloudInquiryStatus}
              onToast={(msg) => setToast(msg)}
              onSaveSettings={handleSaveSiteSettings}
              orders={orders}
              products={products}
              promoCodes={promoCodes}
              properties={properties}
              setCategories={setCategories}
              setOrders={setOrders}
              setProducts={setProducts}
              setPromoCodes={setPromoCodes}
              setInbox={setInbox}
              setProperties={setProperties}
              settings={resolvedSettings}
              setSettings={setSettings}
              setVehicles={setVehicles}
              vehicles={vehicles}
              /* Supabase-managed stores — written straight to the database so
                 every visitor sees the admin's edits. */
              socialLinks={socialLinks}
              paymentMethods={paymentMethods}
              onSaveSocialLink={handleSaveSocialLink}
              onDeleteSocialLink={handleDeleteSocialLink}
              onSavePaymentMethod={handleSavePaymentMethod}
              onDeletePaymentMethod={handleDeletePaymentMethod}
              siteDataReady={siteDataReady && adminAuthenticated}
            />
            </>
          ) : (
            <div className="mx-auto max-w-md rounded-3xl border border-zx-border bg-zx-surface-raised/90 p-8 shadow-xl">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zx-mint text-zx-mint-contrast">
                <LockKeyhole className="h-6 w-6" />
              </span>
              <h2 className="mt-4 text-xl font-bold text-zx-text">
                {isArabic ? 'دخول لوحة تحكم ZEXOR' : 'Studio Administration Access'}
              </h2>
              <p className="mt-1 text-xs text-zx-text">
                  {isArabic ? 'سجّل الدخول بحساب الإدارة المعتمد.' : 'Sign in with your authorized administrator account.'}
              </p>

              <form className="mt-6 space-y-4" onSubmit={handleAdminLogin}>
                <div>
                  <label className="text-xs font-semibold text-zx-text">
                    {isArabic ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                  <input
                    autoComplete="username"
                    className="mt-1 h-11 w-full rounded-xl border border-zx-border px-4 text-sm outline-none"
                    onChange={(e) => setAdminEmail(e.target.value)}
                    required
                    type="email"
                    value={adminEmail}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zx-text">
                    {isArabic ? 'كلمة المرور' : 'Password'}
                  </label>
                  <input
                    className="mt-1 h-11 w-full rounded-xl border border-zx-border px-4 text-sm tracking-widest outline-none"
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    type="password"
                    value={adminPassword}
                  />
                </div>
                {adminLoginError && (
                  <p className="text-xs font-medium text-zx-text">{adminLoginError}</p>
                )}
                <button
                  className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-zx-cinematic text-xs font-semibold text-zx-accent-contrast shadow-md hover:bg-zx-cinematic"
                  disabled={adminAuthLoading}
                  type="submit"
                >
                  <LockKeyhole className="h-4 w-4" />
                  {adminAuthLoading ? (isArabic ? 'جارٍ التحقق...' : 'Signing in...') : (isArabic ? 'دخول لوحة التحكم' : 'Sign in')}
                </button>
              </form>
            </div>
          )
        )}
        </Suspense>
      </main>

      {/* Site Footer: navigation, contact and legal */}
      <SiteFooter
        categories={categories}
        isArabic={isArabic}
        locale={locale}
        market={market}
        navigate={navigate}
        onTrackOrder={() => setTrackingOpen(true)}
        settings={resolvedSettings}
        sectionVisibility={resolvedSettings.sectionVisibility}
      />

      {/* 3. Floating WhatsApp Widget */}
      <a
        aria-label="Floating WhatsApp"
        className="zx-float-anchor fixed inset-e-5 z-40 flex h-14 items-center gap-2.5 rounded-full border border-zx-border/70 bg-zx-accent px-4.5 text-zx-accent-contrast shadow-xl transition-all duration-300 hover:scale-105 hover:bg-zx-cinematic"
        href={`https://wa.me/${market === 'eg' ? resolvedSettings.whatsappEg : resolvedSettings.whatsappKsa}?text=${encodeURIComponent(
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
            className="zx-float-anchor fixed inset-s-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-zx-border/70 bg-zx-surface-raised/90 text-zx-text shadow-xl backdrop-blur-md transition-colors hover:bg-zx-mint"
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
          className="fixed inset-0 z-110 flex items-start justify-center bg-zx-cinematic/45 p-4 pt-[10vh] backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSearchOpen(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setSearchOpen(false);
          }}
          role="presentation"
        >
          <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-zx-border bg-zx-surface-raised p-5 shadow-2xl">
            <div className="flex items-center gap-2.5 rounded-2xl border border-zx-border px-3.5 py-2">
              <Search className="h-4 w-4 text-zx-text" />
              <input
                autoFocus
                className="h-8 flex-1 text-xs outline-none"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isArabic ? 'ابحث في كافة الأقسام (ملابس، كروت، عقارات، سيارات، خدمات)…' : 'Search products, cars, properties, services…'}
                value={searchQuery}
              />
              <button onClick={() => setSearchOpen(false)} type="button">
                <X className="h-4 w-4 text-zx-text" />
              </button>
            </div>

            <div className="mt-3 max-h-72 divide-y divide-zx-border overflow-y-auto">
              {searchResults.map((res, i) => (
                <button
                  className="flex w-full items-center justify-between p-3 text-start hover:bg-zx-mint"
                  key={res.title + i}
                  onClick={() => {
                    navigate(res.route);
                    setSearchOpen(false);
                  }}
                  type="button"
                >
                  <div>
                    <h4 className="text-xs font-bold text-zx-text">{res.title}</h4>
                    <p className="text-[10px] text-zx-text">{res.desc}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-zx-text" />
                </button>
              ))}
              {searchQuery && searchResults.length === 0 && (
                <p className="py-6 text-center text-xs text-zx-text-secondary">
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
          className="fixed inset-0 z-110 flex items-center justify-center bg-zx-cinematic/45 p-4 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) setWishlistOpen(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setWishlistOpen(false);
          }}
          role="presentation"
        >
          <div className="w-full max-w-md rounded-3xl border border-zx-border bg-zx-surface-raised p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-zx-text">
                {isArabic ? 'قائمة الرغبات والمفضلة' : 'Your Wishlist'} ({wishlist.length})
              </h3>
              <button onClick={() => setWishlistOpen(false)} type="button">
                <X className="h-4 w-4 text-zx-text" />
              </button>
            </div>

            <div className="mt-4 max-h-80 divide-y divide-zx-border overflow-y-auto">
              {storefrontProducts
                .filter((p) => wishlist.includes(p.id))
                .map((p) => (
                  <div className="flex items-center justify-between py-3" key={p.id}>
                    <div className="flex items-center gap-3">
                      <img alt={p.name[locale]} className="h-12 w-12 rounded-xl object-cover" src={publicAssetUrl(p.imageUrl)} />
                      <div>
                        <h4 className="text-xs font-bold text-zx-text">{p.name[locale]}</h4>
                        <p className="text-[10px] text-zx-text">
                          {money(p.price[market], market, locale)}
                        </p>
                      </div>
                    </div>
                    <button
                      className="rounded-full bg-zx-cinematic px-3 py-1.5 text-[10px] font-semibold text-zx-accent-contrast"
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
                <p className="py-8 text-center text-xs text-zx-text-secondary">
                  {isArabic ? 'قائمة المفضلة فارغة حالياً.' : 'Your wishlist is empty.'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {restockProduct && (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-120 flex items-center justify-center bg-zx-cinematic/65 p-4 backdrop-blur-md"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={(event) => { if (event.target === event.currentTarget) setRestockProduct(null); }}
          >
            <motion.form
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="w-full max-w-md overflow-hidden rounded-[1.7rem] border border-zx-border/70 bg-zx-surface-raised shadow-2xl"
              exit={{ opacity: 0, y: 14, scale: 0.98 }}
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              onClick={(event) => event.stopPropagation()}
              onSubmit={(event) => {
                event.preventDefault();
                if (restockPhone.replace(/\D/g, '').length < 7) {
                  setToast(isArabic ? 'اكتب رقم هاتف صحيح عشان نقدر نبلغك.' : 'Enter a valid phone number so we can notify you.');
                  return;
                }
                const inquiry: PlatformInquiry = {
                  id: `ZX-INQ-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
                  createdAt: new Date().toISOString(),
                  type: 'contact',
                  title: isArabic ? `تنبيه توفر المنتج: ${restockProduct.name.ar}` : `Restock alert: ${restockProduct.name.en}`,
                  name: restockName.trim(),
                  phone: restockPhone.trim(),
                  city: '',
                  market,
                  budget: '',
                  message: `RESTOCK_ALERT · ${restockProduct.id} · ${restockProduct.name[locale]}`,
                  status: 'new',
                };
                handleAddInquiry(inquiry);
                setRestockProduct(null);
                setRestockName('');
                setRestockPhone('');
                setToast(isArabic ? 'سجلنا طلب التنبيه. هنتواصل معاك لما المنتج يتوفر.' : 'You are on the restock list. We will contact you when it is available.');
              }}
            >
              <div className="relative h-36 overflow-hidden bg-zx-mint">
                <img alt="" className="h-full w-full object-cover opacity-90" src={publicAssetUrl(restockProduct.imageUrl || departmentImage(restockProduct.category))} />
                <div className="absolute inset-0 bg-linear-to-t from-zx-cinematic/80 via-zx-cinematic/10 to-transparent" />
                <div className="absolute inset-x-5 bottom-4 flex items-end justify-between gap-4 text-zx-accent-contrast">
                  <div><p className="text-[9px] font-bold uppercase tracking-[.16em] text-zx-accent-contrast/70">{isArabic ? 'قائمة التنبيه' : 'RESTOCK ALERT'}</p><h3 className="mt-1 font-bold">{restockProduct.name[locale]}</h3></div>
                  <button aria-label={isArabic ? 'إغلاق' : 'Close'} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zx-border/40 bg-zx-cinematic/20 backdrop-blur" onClick={() => setRestockProduct(null)} type="button"><X className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="space-y-4 p-5 sm:p-6">
                <p className="text-xs leading-6 text-zx-text">{isArabic ? 'سيب بياناتك، وفريقنا هيبلغك أول ما المنتج يرجع متاح.' : 'Leave your details and our team will let you know when this item is available again.'}</p>
                <label className="block text-[10px] font-semibold text-zx-text">{isArabic ? 'الاسم' : 'Name'}<input autoComplete="name" className="mt-1.5 h-11 w-full rounded-xl border border-zx-border bg-zx-surface-raised px-3 text-sm outline-none transition focus:border-zx-border focus:ring-4 focus:ring-zx-accent/10" maxLength={100} onChange={(event) => setRestockName(event.target.value)} required value={restockName} /></label>
                <label className="block text-[10px] font-semibold text-zx-text">{isArabic ? 'رقم الهاتف' : 'Phone'}<input autoComplete="tel" className="mt-1.5 h-11 w-full rounded-xl border border-zx-border bg-zx-surface-raised px-3 text-sm outline-none transition focus:border-zx-border focus:ring-4 focus:ring-zx-accent/10" dir="ltr" maxLength={30} onChange={(event) => setRestockPhone(event.target.value)} required type="tel" value={restockPhone} /></label>
                <button className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-zx-cinematic px-4 text-xs font-bold text-zx-accent-contrast shadow-zx-card transition hover:bg-zx-cinematic" type="submit"><BellRing className="h-4 w-4" />{isArabic ? 'سجلني في قائمة التنبيه' : 'Notify me when available'}</button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. Live NFC 3D Customizer Modal */}
      {selectedNfcProduct && (
        <NfcCustomizerModal
          locale={locale}
          market={market}
          onAddToCart={(p, custom) => handleAddToCart(p, custom)}
          onClose={() => setNfcModalOpen(false)}
          onOrderWhatsApp={(m, text) => openWhatsApp(whatsappNumberFor(m, resolvedSettings), text)}
          open={nfcModalOpen}
          product={selectedNfcProduct}
        />
      )}

      {/* 7. Interactive Cart & Checkout Drawer */}
      <CheckoutDrawer
        cart={storefrontCart}
        locale={locale}
        market={market}
        paymentMethods={paymentMethods}
        onClose={() => setCartOpen(false)}
        onOrderComplete={async (order) => {
          const stockAdjustedProductIds = products.filter((product) => product.stock !== undefined && order.items.some((item) => item.productId === product.id)).map((product) => product.id);
          const completedOrder = { ...order, stockAdjusted: true, stockAdjustedProductIds };
          const onlinePaymentRequested = order.market === 'eg' && ['visa', 'fawry'].includes(order.paymentMethodKey ?? '');
          const cloudResult = await createCloudOrder(completedOrder);
          if (cloudResult === 'stock_conflict') {
            const latestProducts = await fetchStoreContent<unknown>('products');
            if (isValidObjectArray(latestProducts)) setProducts(normalizeLegacyProductCategories(normalizeStarterProductImages(latestProducts as Product[])));
            setToast(isArabic ? 'تغير المخزون أو لم يعد المنتج متاحًا. راجع السلة وحاول مجددًا.' : 'Stock changed or an item is no longer available. Review your cart and try again.');
            return false;
          }
          if (cloudResult === 'price_changed') {
            const [latestProducts, latestPromos, latestSettings] = await Promise.all([
              fetchStoreContent<unknown>('products'),
              fetchStoreContent<unknown>('promo_codes'),
              fetchSiteSettings(DEFAULT_SETTINGS),
            ]);
            if (isValidObjectArray(latestProducts)) setProducts(latestProducts as Product[]);
            if (isValidObjectArray(latestPromos)) setPromoCodes(latestPromos as PromoCode[]);
            if (latestSettings) setSettings(latestSettings);
            setToast(isArabic ? 'تغير السعر أو الخصم أو رسوم التوصيل. تم تحديث البيانات، راجع الإجمالي وحاول مجدداً.' : 'The price, discount, or delivery fee changed. Details were refreshed; review the total and try again.');
            return false;
          }
          if (cloudResult === 'unavailable' || cloudResult === 'rejected') {
            setToast(isArabic
              ? 'تعذر حفظ الطلب والتحقق من المخزون. تحقق من اتصال المتجر وحاول مرة أخرى.'
              : 'The order could not be saved or stock verified. Check the store connection and try again.');
            return false;
          }
          if (onlinePaymentRequested && cloudResult === 'local_only') {
            setToast(isArabic
              ? 'الدفع الإلكتروني يحتاج اتصال المتجر بقاعدة البيانات. اختر الدفع عند الاستلام أو أعد المحاولة بعد عودة الاتصال.'
              : 'Online payment needs the store database connection. Choose cash on delivery or try again when the connection is restored.');
            return false;
          }
          const paymentUrl = onlinePaymentRequested && cloudResult === 'saved'
            ? await createPaymobCheckout(order.id, order.phone)
            : null;
          setOrders((prev) => [completedOrder, ...prev.filter((existing) => existing.id !== completedOrder.id)]);
          setProducts((prev) => prev.map((product) => {
            if (product.stock === undefined || !stockAdjustedProductIds.includes(product.id)) return product;
            const orderedQuantity = order.items.filter((item) => item.productId === product.id).reduce((sum, item) => sum + item.quantity, 0);
            return orderedQuantity ? { ...product, stock: Math.max(0, product.stock - orderedQuantity) } : product;
          }));
          setCart([]);
          if (onlinePaymentRequested && !paymentUrl) {
            setToast(isArabic
              ? 'تم تسجيل الطلب، لكن تعذر بدء الدفع الإلكتروني. لم يتم خصم أي مبلغ؛ سنفتح واتساب لمساعدتك.'
              : 'Your order was recorded, but online payment could not start. No payment was taken; WhatsApp will open for help.');
          } else {
            setToast(cloudResult === 'local_only'
              ? isArabic ? 'تم حفظ الطلب على هذا الجهاز وفتح واتساب، لكن المخزون لم يُحدّث سحابيًا.' : 'Order saved locally and WhatsApp opened, but cloud stock could not update.'
              : onlinePaymentRequested
                ? isArabic ? 'تم تسجيل الطلب، جارٍ فتح صفحة الدفع الآمنة.' : 'Order recorded. Opening secure payment.'
                : isArabic ? 'تم تأكيد طلبك بنجاح وفتح واتساب!' : 'Order confirmed & WhatsApp ready!');
          }
          return { accepted: true, ...(paymentUrl ? { paymentUrl } : {}) };
        }}
        onQuantityChange={(targetLine, delta) => {
          const product = products.find((item) => item.id === targetLine.productId);
          const quantityForProduct = cart.filter((item) => item.productId === targetLine.productId).reduce((sum, item) => sum + item.quantity, 0);
          if (delta > 0 && product?.stock !== undefined && quantityForProduct >= product.stock) {
            setToast(isArabic ? 'لا توجد كمية إضافية متاحة.' : 'No additional stock is available.');
            return;
          }
          setCart((curr) =>
            curr
              .map((line) => (sameCartLine(line, targetLine) ? { ...line, quantity: line.quantity + delta } : line))
              .filter((line) => line.quantity > 0),
          );
        }}
        onRemoveItem={(targetLine) => {
          setCart((curr) => curr.filter((line) => !sameCartLine(line, targetLine)));
        }}
        onToast={(msg) => setToast(msg)}
        open={cartOpen}
        products={products}
        promoCodes={promoCodes}
        settings={resolvedSettings}
      />

      {/* 8. Live Shipment & Order Tracking Modal */}
      <TrackingModal
        locale={locale}
        market={market}
        onClose={() => setTrackingOpen(false)}
        open={trackingOpen}
        orders={orders}
        whatsappNumber={market === 'eg' ? resolvedSettings.whatsappEg : resolvedSettings.whatsappKsa}
      />

      {/* 9. Notification Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 inset-x-0 mx-auto z-120 flex w-fit max-w-sm items-center gap-2 rounded-full border border-zx-border bg-zx-cinematic px-5 py-3 text-xs font-semibold text-zx-accent-contrast shadow-2xl backdrop-blur-md"
            exit={{ opacity: 0, y: 8 }}
            initial={{ opacity: 0, y: 8 }}
          >
            <Sparkles className="h-4 w-4 text-zx-text-muted" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
