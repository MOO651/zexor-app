import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUpRight, Heart, Plus, Share2, ShoppingBag, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { art } from '../data/imagery';
import { useMobileViewport } from '../hooks/useMobileViewport';
import { useSiteAssets, useSiteContent, useSiteHotspots } from '../lib/siteMediaContext';
import type { Locale, Market, Product } from '../types';
import { publicAssetUrl } from '../utils';

type Props = {
  locale: Locale;
  market: Market;
  products: Product[];
  copyTitle?: string;
  copySubtitle?: string;
  wishlist: string[];
  onAddToCart: (product: Product, variant?: string) => void;
  onToggleWishlist: (product: Product) => void;
  onShare: (product: Product) => void;
  navigateToFashion: () => void;
  renderPrice: (price: number, className: string) => ReactNode;
};

type LookPhoto = {
  id: string;
  slot: number;
  url: string;
  assetKey?: string;
};

type LookHotspot = {
  id: string;
  x: number;
  y: number;
  product: Product;
};

const LOOK_ASSET_KEYS = [1, 2, 3, 4] as const;
const HOTSPOT_POSITIONS = [
  { x: 38, y: 54 },
  { x: 67, y: 40 },
  { x: 54, y: 73 },
];

function fallbackProductImage(product: Product): string {
  return product.id.toLowerCase().includes('hoodie') ? art.hoodie : art.tee;
}

function lookIndexFromId(lookId: string): number | null {
  const match = lookId.match(/(?:fashion[._-])?look[._ -]?0?([1-4])/i);
  if (match) return Number(match[1]);
  return /^[1-4]$/.test(lookId) ? Number(lookId) : null;
}

function uniquePhotos(photos: LookPhoto[], failedUrls: string[]): LookPhoto[] {
  const seen = new Set<string>();
  return photos.filter((photo) => {
    if (failedUrls.includes(photo.url) || seen.has(photo.url)) return false;
    seen.add(photo.url);
    return true;
  }).slice(0, 4);
}

export function FashionLookbook({
  locale,
  market,
  products,
  copyTitle,
  copySubtitle,
  wishlist,
  onAddToCart,
  onToggleWishlist,
  onShare,
  navigateToFashion,
  renderPrice,
}: Props) {
  const isArabic = locale === 'ar';
  const reduceMotion = useReducedMotion() ?? false;
  const isMobileViewport = useMobileViewport();
  const sceneRef = useRef<HTMLElement>(null);
  const swipeStart = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [failedUrls, setFailedUrls] = useState<string[]>([]);
  const [now, setNow] = useState(0);
  const tiltX = useSpring(0, { stiffness: 150, damping: 24 });
  const tiltY = useSpring(0, { stiffness: 150, damping: 24 });
  const { assets } = useSiteAssets();
  const { getText, content } = useSiteContent();
  const { hotspots } = useSiteHotspots();
  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ['start start', 'end end'],
  });
  const fashionProducts = useMemo(() => products.filter((product) =>
    product.category === 'fashion' && product.available && product.markets.includes(market),
  ), [market, products]);
  const photos = useMemo(() => {
    const candidates: LookPhoto[] = [];
    LOOK_ASSET_KEYS.forEach((slot) => {
      const key = `fashion.look.${slot}.photo`;
      const asset = assets[key];
      if (asset?.source === 'published' && asset.type === 'image') {
        candidates.push({ id: key, slot, url: asset.url, assetKey: key });
      }
    });
    fashionProducts.forEach((product, index) => {
      const url = product.imageUrl ?? fallbackProductImage(product);
      candidates.push({ id: `fashion.product.${product.id}`, slot: index + 1, url });
    });
    candidates.push(
      { id: 'fashion.default.hoodie', slot: 1, url: art.hoodie },
      { id: 'fashion.default.tee', slot: 2, url: art.tee },
    );
    return uniquePhotos(candidates, failedUrls);
  }, [assets, failedUrls, fashionProducts]);
  const looks = useMemo(() => photos.map((photo, index) => {
    const product = fashionProducts[(Math.max(1, photo.slot) - 1) % Math.max(fashionProducts.length, 1)];
    const detailAsset = assets[`fashion.look.${photo.slot}.detail`];
    const detailUrl = detailAsset?.source === 'published' && detailAsset.type === 'image'
      ? detailAsset.url
      : photos[(index + 1) % photos.length]?.url ?? photo.url;
    return {
      ...photo,
      number: index + 1,
      product,
      detailUrl,
    };
  }), [assets, fashionProducts, photos]);
  const lookCount = looks.length;
  const currentIndex = Math.min(activeIndex, Math.max(lookCount - 1, 0));
  const currentLook = looks[currentIndex];
  const wordmarkX = useTransform(scrollYProgress, [0, 1], ['-12vw', '12vw']);
  const lookProgress = useTransform(scrollYProgress, (progress) =>
    Math.max(0, Math.min(1, progress * Math.max(lookCount, 1) - currentIndex)),
  );
  const photoClipPath = useTransform(
    lookProgress,
    [0, 0.2, 0.85, 1],
    ['inset(100% 0% 0% 0%)', 'inset(0% 0% 0% 0%)', 'inset(0% 0% 0% 0%)', 'inset(0% 0% 0% 0%)'],
  );
  const photoScale = useTransform(lookProgress, [0, 0.2, 0.85, 1], [1.15, 1, 1.05, 1.08]);
  const photoOpacity = useTransform(lookProgress, [0, 0.2, 0.85, 1], [0.35, 1, 1, 0.7]);
  const publishedHeadline = content['fashion.lookbook.title']?.source === 'published'
    ? getText('fashion.lookbook.title', locale)
    : null;
  const publishedSubtitle = content['fashion.lookbook.subtitle']?.source === 'published'
    ? getText('fashion.lookbook.subtitle', locale)
    : null;
  const headline = publishedHeadline || copyTitle?.trim() || getText('fashion.lookbook.title', locale)
    || (isArabic ? 'اختار لوكك' : 'FIND YOUR');
  const headlineAccent = getText('fashion.lookbook.accent', locale)
    ?? (isArabic ? 'حكايتك' : 'LOOKBOOK');
  const subtitle = publishedSubtitle || copySubtitle?.trim() || getText('fashion.lookbook.subtitle', locale)
    || (isArabic ? 'تفاصيل محدودة. اختيارات شبهك.' : 'Limited pieces. Made to feel like you.');
  const subtitleWords = subtitle.trim().split(/\s+/);
  const subtitleAccent = subtitleWords.pop() ?? '';
  const dropDateValue = content['settings.drop_countdown_at']?.value_json;
  const dropDateText = typeof dropDateValue === 'string'
    ? dropDateValue
    : content['settings.drop_countdown_at']?.value_ar
      ?? content['settings.drop_countdown_at']?.value_en
      ?? null;
  const dropTimestamp = dropDateText ? Date.parse(dropDateText) : Number.NaN;
  const remaining = Number.isFinite(dropTimestamp) ? Math.max(0, dropTimestamp - now) : 0;
  const dropEnabled = content['feature.countdown']?.value_json === true && remaining > 0;
  const ArrowNext = isArabic ? ArrowLeft : ArrowRight;
  const ArrowPrevious = isArabic ? ArrowRight : ArrowLeft;
  const brokenImages = (url: string) => {
    setFailedUrls((previous) => previous.includes(url) ? previous : [...previous, url]);
  };

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    if (!lookCount || isMobileViewport) return;
    const nextIndex = Math.min(lookCount - 1, Math.floor(progress * lookCount));
    setActiveIndex(nextIndex);
  });

  useEffect(() => {
    if (!dropDateText || !Number.isFinite(dropTimestamp) || dropTimestamp <= Date.now()) return;
    const frame = window.requestAnimationFrame(() => setNow(Date.now()));
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearInterval(timer);
    };
  }, [dropDateText, dropTimestamp]);

  const goToLook = (index: number) => {
    if (!lookCount) return;
    const targetIndex = Math.max(0, Math.min(lookCount - 1, index));
    if (isMobileViewport) {
      setActiveIndex(targetIndex);
      return;
    }
    if (!sceneRef.current) return;
    const rect = sceneRef.current.getBoundingClientRect();
    const sceneTop = rect.top + window.scrollY;
    const scrollDistance = sceneRef.current.offsetHeight - window.innerHeight;
    const progress = (targetIndex + 0.5) / lookCount;
    window.scrollTo({
      top: sceneTop + scrollDistance * progress,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  };

  const handleLookPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') {
      swipeStart.current = event.clientX;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  };

  const handleLookPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    const y = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
    tiltX.set(-y * 12);
    tiltY.set(x * 12);
  };

  const handleLookPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'touch' || swipeStart.current === null) return;
    const delta = event.clientX - swipeStart.current;
    if (Math.abs(delta) > 48) goToLook(currentIndex + (delta < 0 ? 1 : -1));
    swipeStart.current = null;
  };

  const currentHotspots = useMemo<LookHotspot[]>(() => {
    if (!currentLook) return [];
    const saved = hotspots
      .filter((spot) => lookIndexFromId(spot.look_id) === currentLook.slot)
      .map((spot) => ({
        id: spot.id,
        x: Math.max(0, Math.min(100, spot.x)),
        y: Math.max(0, Math.min(100, spot.y)),
        product: fashionProducts.find((product) => product.id === spot.product_id),
      }))
      .filter((spot): spot is LookHotspot => Boolean(spot.product));
    if (saved.length) return saved.slice(0, 3);
    if (!fashionProducts.length) return [];
    return fashionProducts.slice(0, 3).map((product, index) => ({
      id: `${currentLook.id}-${product.id}`,
      x: HOTSPOT_POSITIONS[index].x,
      y: HOTSPOT_POSITIONS[index].y,
      product,
    }));
  }, [currentLook, fashionProducts, hotspots]);

  const activeSpot = currentHotspots.find((spot) => spot.id === activeHotspot);
  const selectedProduct = activeSpot?.product;
  const selectedVariant = selectedProduct
    ? selectedVariants[selectedProduct.id] ?? selectedProduct.variants?.[0]
    : undefined;

  if (!currentLook || !lookCount) return null;

  return (
    <section
      aria-label={isArabic ? 'الفصل الثاني: اللوك بوك' : 'Chapter two: The Lookbook'}
      className="zx-lookbook-scene"
      id="chapter-fashion"
      ref={sceneRef}
    >
      <div className="zx-lookbook-stage">
        <motion.div aria-hidden="true" className="zx-lookbook-wordmark" style={{ x: reduceMotion ? 0 : wordmarkX }}>
          DROP 01
        </motion.div>
        <header className="zx-lookbook-intro">
          <p className="zx-lookbook-eyebrow">
            <span>02</span>
            {isArabic ? 'أزياء زكسور · إصدار محدود' : 'ZEXOR FASHION · LIMITED DROP'}
          </p>
          <h2>
            <span>{headline}</span>
            <span className="zx-lookbook-accent">{headlineAccent}</span>
          </h2>
          <p>{subtitleWords.join(' ')} <span className="zx-lookbook-accent">{subtitleAccent}</span></p>
          <span className="zx-lookbook-counter">{String(currentIndex + 1).padStart(2, '0')} / {String(lookCount).padStart(2, '0')}</span>
        </header>

        {lookCount > 1 && (
          <div aria-hidden="true" className="zx-lookbook-neighbors">
            {lookCount > 2 && (
              <div className="zx-lookbook-neighbor zx-lookbook-neighbor--previous">
                <img alt="" loading="lazy" src={publicAssetUrl(looks[(activeIndex + lookCount - 1) % lookCount].url)} />
              </div>
            )}
            <div className="zx-lookbook-neighbor zx-lookbook-neighbor--next">
              <img alt="" loading="lazy" src={publicAssetUrl(looks[(activeIndex + 1) % lookCount].url)} />
            </div>
          </div>
        )}

        <motion.div
          className="zx-lookbook-frame"
          onPointerDown={handleLookPointerDown}
          onPointerMove={handleLookPointerMove}
          onPointerUp={handleLookPointerUp}
          onPointerCancel={handleLookPointerUp}
          onPointerLeave={() => {
            tiltX.set(0);
            tiltY.set(0);
          }}
          style={{ rotateX: tiltX, rotateY: tiltY, transformPerspective: 1400, transformStyle: 'preserve-3d' }}
        >
          <picture key={currentLook.id} className="zx-lookbook-picture">
            {assets[currentLook.assetKey ?? '']?.mobileUrl && (
              <source media="(max-width: 640px)" srcSet={assets[currentLook.assetKey ?? ''].mobileUrl ?? undefined} />
            )}
            <motion.img
              alt={assets[currentLook.assetKey ?? '']?.alt[locale] || currentLook.product?.name[locale] || `${headline} ${currentIndex + 1}`}
              className="zx-lookbook-photo"
              key={currentLook.id}
              loading={isMobileViewport ? 'eager' : 'lazy'}
              onError={() => brokenImages(currentLook.url)}
              src={publicAssetUrl(currentLook.url)}
              style={reduceMotion || isMobileViewport ? undefined : { clipPath: photoClipPath, opacity: photoOpacity, scale: photoScale }}
            />
            <img
              alt=""
              aria-hidden="true"
              className="zx-lookbook-detail"
              loading="lazy"
              onError={(event) => {
                event.currentTarget.src = publicAssetUrl(currentLook.url) ?? currentLook.url;
              }}
              src={publicAssetUrl(currentLook.detailUrl)}
            />
          </picture>
          <span aria-hidden="true" className="zx-lookbook-frame-shade" />
          <span className="zx-lookbook-look-number">LOOK {String(currentIndex + 1).padStart(2, '0')}</span>
          <div className="zx-lookbook-hotspots">
            {currentHotspots.map((spot) => (
              <button
                aria-expanded={activeHotspot === spot.id}
                aria-label={`${isArabic ? 'عرض المنتج' : 'Show product'}: ${spot.product.name[locale]}`}
                className={`zx-lookbook-hotspot${activeHotspot === spot.id ? ' is-active' : ''}`}
                key={spot.id}
                onClick={(event) => {
                  event.stopPropagation();
                  setActiveHotspot(spot.id);
                }}
                onFocus={() => setActiveHotspot(spot.id)}
                onMouseEnter={() => setActiveHotspot(spot.id)}
                onMouseLeave={() => setActiveHotspot((active) => active === spot.id ? null : active)}
                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                type="button"
              >
                <Plus aria-hidden="true" />
              </button>
            ))}
          </div>

          {activeSpot && selectedProduct && (
            <article className="zx-lookbook-hotspot-card" onPointerDown={(event) => event.stopPropagation()}>
              <button
                aria-label={isArabic ? 'إغلاق تفاصيل المنتج' : 'Close product details'}
                className="zx-lookbook-hotspot-close"
                onClick={() => setActiveHotspot(null)}
                type="button"
              >
                <X aria-hidden="true" />
              </button>
              <div className="zx-lookbook-hotspot-product">
                <img alt="" src={publicAssetUrl(selectedProduct.imageUrl ?? fallbackProductImage(selectedProduct))} />
                <div>
                  <strong>{selectedProduct.name[locale]}</strong>
                  {renderPrice(selectedProduct.price[market], 'zx-lookbook-price')}
                </div>
              </div>
              <div className="zx-lookbook-sizes" aria-label={isArabic ? 'اختار المقاس' : 'Choose a size'}>
                {(selectedProduct.variants ?? []).map((size) => (
                  <button
                    aria-pressed={selectedVariant === size}
                    className={selectedVariant === size ? 'is-selected' : ''}
                    key={size}
                    onClick={() => setSelectedVariants((current) => ({ ...current, [selectedProduct.id]: size }))}
                    type="button"
                  >
                    {size}
                  </button>
                ))}
              </div>
              <div className="zx-lookbook-hotspot-actions">
                <button
                  aria-label={wishlist.includes(selectedProduct.id)
                    ? isArabic ? 'إزالة من المفضلة' : 'Remove from wishlist'
                    : isArabic ? 'إضافة للمفضلة' : 'Add to wishlist'}
                  aria-pressed={wishlist.includes(selectedProduct.id)}
                  className="zx-lookbook-icon-button"
                  onClick={() => onToggleWishlist(selectedProduct)}
                  type="button"
                >
                  <Heart aria-hidden="true" fill={wishlist.includes(selectedProduct.id) ? 'currentColor' : 'none'} />
                </button>
                <button
                  aria-label={isArabic ? 'مشاركة المنتج' : 'Share product'}
                  className="zx-lookbook-icon-button"
                  onClick={() => onShare(selectedProduct)}
                  type="button"
                >
                  <Share2 aria-hidden="true" />
                </button>
              </div>
              <button
                className="zx-lookbook-quick-add"
                onClick={() => onAddToCart(selectedProduct, selectedVariant)}
                type="button"
              >
                <ShoppingBag aria-hidden="true" />
                {isArabic ? 'إضافة سريعة' : 'Quick add'}
              </button>
            </article>
          )}
        </motion.div>

        <div className="zx-lookbook-controls">
          <button
            aria-label={isArabic ? 'اللوك السابق' : 'Previous look'}
            disabled={currentIndex === 0}
            onClick={() => goToLook(currentIndex - 1)}
            type="button"
          >
            <ArrowPrevious aria-hidden="true" />
          </button>
          <button
            aria-label={isArabic ? 'اللوك التالي' : 'Next look'}
            disabled={currentIndex === lookCount - 1}
            onClick={() => goToLook(currentIndex + 1)}
            type="button"
          >
            <ArrowNext aria-hidden="true" />
          </button>
        </div>

        {dropEnabled && (
          <div className="zx-lookbook-drop">
            <span>{isArabic ? 'الإصدار بينتهي خلال' : 'DROP ENDS IN'}</span>
            <strong>{Math.floor(remaining / 86400000)}d {String(Math.floor((remaining % 86400000) / 3600000)).padStart(2, '0')}:{String(Math.floor((remaining % 3600000) / 60000)).padStart(2, '0')}:{String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0')}</strong>
          </div>
        )}

        <motion.button
          className="zx-lookbook-shop-now"
          onClick={navigateToFashion}
          type="button"
          whileHover={reduceMotion ? undefined : { y: -3, scale: 1.035, rotateX: -4 }}
          whileTap={reduceMotion ? undefined : { scale: 0.97 }}
        >
          {isArabic ? 'تسوق الآن' : 'Shop now'}
          <ArrowUpRight aria-hidden="true" />
        </motion.button>
      </div>
    </section>
  );
}
