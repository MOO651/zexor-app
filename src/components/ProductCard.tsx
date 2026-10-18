import { useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { BellRing, Fingerprint, Heart, Share2, ShoppingBag, Sparkles } from 'lucide-react';
import { art } from '../data/imagery';
import type { Locale, Market, Product } from '../types';
import { publicAssetUrl } from '../utils';

type ProductCardProps = {
  product: Product;
  market: Market;
  locale: Locale;
  wishlisted: boolean;
  renderPrice: (price: number, className: string) => ReactNode;
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product, variant?: string) => void;
  onNotifyAvailability?: (product: Product) => void;
  onShare?: (product: Product) => void;
  onCustomize?: (product: Product) => void;
  badge?: string;
  categoryLabel?: string;
};

function fallbackFor(product: Product): string {
  const id = product.id.toLowerCase();
  if (product.category === 'fashion') return id.includes('hoodie') ? art.hoodie : art.tee;
  if (product.category === 'services') {
    return id.includes('commerce') || id.includes('store') ? art.studioStore : art.studioWebsite;
  }
  if (id.includes('social')) return art.cardsSocial;
  if (id.includes('custom') || id.includes('bespoke')) return art.cardsBespoke;
  return art.cardsElite;
}

export function ProductCard({
  product,
  market,
  locale,
  wishlisted,
  renderPrice,
  onToggleWishlist,
  onAddToCart,
  onNotifyAvailability,
  onShare,
  onCustomize,
  badge,
  categoryLabel: customCategoryLabel,
}: ProductCardProps) {
  const isArabic = locale === 'ar';
  const price = product.price[market];
  const oldPrice = product.oldPrice?.[market];
  const offer = oldPrice !== undefined && oldPrice > price
    ? { oldPrice, percent: Math.round((1 - price / oldPrice) * 100) }
    : null;
  const soldOut = !product.available || product.stock === 0;
  const variants = product.variants ?? [];
  const [variant, setVariant] = useState<string | undefined>(() =>
    variants.includes('L') ? 'L' : variants[0],
  );
  const [failedImageUrl, setFailedImageUrl] = useState('');
  const reduceMotion = useReducedMotion();
  const fallbackImage = fallbackFor(product);
  const labels = {
    wishlist: wishlisted
      ? isArabic ? 'إزالة من المفضلة' : 'Remove from wishlist'
      : isArabic ? 'إضافة للمفضلة' : 'Add to wishlist',
    soldOut: isArabic ? 'نفدت الكمية' : 'Sold out',
    unavailable: isArabic ? 'غير متوفر' : 'Unavailable',
    customize: isArabic ? 'تخصيص الكارت' : 'Personalize',
    addToCart: isArabic ? 'إضافة إلى السلة' : 'Add to bag',
    size: isArabic ? 'المقاس' : 'Size',
    notify: isArabic ? 'نبّهني عند التوفر' : 'Notify me when available',
    share: isArabic ? 'مشاركة المنتج' : 'Share product',
  };
  const categoryLabel = customCategoryLabel ?? (product.category === 'cards'
    ? isArabic ? 'هوية رقمية متصلة' : 'CONNECTED IDENTITY'
    : product.category === 'fashion'
      ? isArabic ? 'أزياء زكسور' : 'ZEXOR FASHION'
      : isArabic ? 'الاستوديو الرقمي' : 'DIGITAL STUDIO');

  return (
    <motion.article className="zx-product zx-card group flex h-full flex-col overflow-hidden rounded-3xl border border-zx-line bg-zx-surface" data-category={product.category} style={{ transformPerspective: 1100 }} transition={{ type: 'spring', stiffness: 220, damping: 22 }} whileHover={reduceMotion ? undefined : { y: -5 }} whileTap={reduceMotion ? undefined : { scale: 0.985, rotateX: -1.5 }}>
      <div className="zx-product-media relative aspect-[4/3] overflow-hidden bg-zx-surface-2">
        {product.imageUrl && failedImageUrl !== product.imageUrl ? (
          <img
            alt={product.name[locale]}
            className={`h-full w-full ${product.category === 'fashion' ? 'object-contain p-4 sm:p-5' : 'object-cover'} transition-transform duration-700 ease-out group-hover:scale-[1.045] ${soldOut ? 'grayscale' : ''}`}
            loading="lazy"
            onError={() => setFailedImageUrl(product.imageUrl ?? '')}
            src={publicAssetUrl(product.imageUrl)}
          />
        ) : (
          <img
            alt={product.name[locale]}
            className={`h-full w-full ${product.category === 'fashion' ? 'object-contain p-4 sm:p-5' : 'object-cover'}`}
            loading="lazy"
            src={publicAssetUrl(fallbackImage)}
          />
        )}

        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: 'var(--zx-photo-scrim)' }}
        />

        <div className="absolute start-3 top-3 flex flex-wrap gap-1.5">
          {soldOut && (
            <span className="rounded-full border border-zx-line bg-zx-cinematic px-3 py-1.5 text-[10px] font-bold tracking-wide text-zx-ink shadow-lg backdrop-blur-md">
              {labels.soldOut}
            </span>
          )}
          {offer && !soldOut && (
            <span className="rounded-full border border-zx-line bg-zx-elevated px-3 py-1.5 text-[10px] font-extrabold tracking-wide text-zx-ink shadow-lg backdrop-blur-md">
              −{offer.percent}%
            </span>
          )}
        </div>

        <button
          aria-label={labels.wishlist}
          aria-pressed={wishlisted}
          className={`absolute end-3 top-3 flex h-11 w-11 items-center justify-center rounded-full border border-zx-line bg-zx-elevated shadow-md backdrop-blur-xl transition-all hover:scale-105 hover:bg-zx-elevated hover:text-zx-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zx-primary ${wishlisted ? 'text-zx-secondary' : 'text-zx-ink'}`}
          onClick={() => onToggleWishlist(product)}
          type="button"
        >
          <Heart aria-hidden="true" className="h-[18px] w-[18px]" fill={wishlisted ? 'currentColor' : 'none'} />
        </button>
        {onShare && <button aria-label={labels.share} className="absolute end-14 top-3 flex h-11 w-11 items-center justify-center rounded-full border border-zx-line bg-zx-elevated text-zx-ink shadow-md backdrop-blur-xl transition hover:scale-105 hover:bg-zx-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zx-primary" onClick={() => onShare(product)} title={labels.share} type="button"><Share2 aria-hidden="true" className="h-[17px] w-[17px]" /></button>}

        {badge && (
          <span className="absolute bottom-3 start-3 inline-flex items-center gap-1.5 rounded-full border border-zx-line bg-zx-cinematic px-3 py-1.5 text-[10px] font-bold text-zx-ink shadow-lg backdrop-blur-md">
            <Sparkles className="h-3 w-3 shrink-0 text-zx-accent" />
            <bdi>{badge}</bdi>
          </span>
        )}
      </div>

      <div className="zx-product-body flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="zx-product-category line-clamp-1 text-[9px] font-bold tracking-[0.1em] text-zx-primary">{categoryLabel}</p>
          {!soldOut && <span className="zx-product-availability flex shrink-0 items-center gap-1.5 text-[9px] font-semibold text-zx-secondary"><span className="h-1.5 w-1.5 rounded-full bg-zx-cinematic" />{isArabic ? 'متاح الآن' : 'Available now'}</span>}
        </div>
        <h3 className="zx-product-name mt-2 line-clamp-1 text-base font-bold leading-6 text-zx-ink">{product.name[locale]}</h3>
        <p className="zx-product-description mt-1 line-clamp-2 min-h-10 text-[11px] leading-5 text-zx-muted">{product.description[locale]}</p>

        {variants.length > 0 && (
          <div className="zx-product-variants mt-3 flex items-center gap-2">
            <p className="shrink-0 text-[9px] font-semibold text-zx-muted">{labels.size}</p>
            <div aria-label={labels.size} className="flex flex-wrap gap-1.5" role="radiogroup">
              {variants.map((size) => {
                const selected = size === variant;
                return (
                  <button
                    aria-checked={selected}
                    className={`flex h-11 min-w-11 items-center justify-center rounded-lg border px-2 text-[9px] font-bold transition ${selected ? 'border-zx-primary bg-zx-primary text-zx-on-primary' : 'border-zx-line bg-zx-surface text-zx-muted hover:border-zx-primary hover:text-zx-primary'}`}
                    key={size}
                    onClick={() => setVariant(size)}
                    role="radio"
                    type="button"
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="zx-product-price mt-auto flex min-h-16 flex-wrap items-end justify-between gap-2 border-t border-zx-line pt-3">
          <div className="min-w-0">
            <p className="mb-1 text-[9px] font-semibold text-zx-muted">{isArabic ? 'السعر' : 'PRICE'}</p>
            {renderPrice(price, 'zx-display text-[23px] leading-none text-zx-ink')}
          </div>
          {offer && <div className="flex flex-col items-end gap-1">
            <span className="rounded-full bg-zx-sale/25 px-2 py-0.5 text-[9px] font-bold text-zx-on-sale">{isArabic ? `خصم ${offer.percent}٪` : `${offer.percent}% OFF`}</span>
            {renderPrice(offer.oldPrice, 'zx-strike text-[10px] text-zx-muted')}
          </div>}
        </div>

        {soldOut && onNotifyAvailability ? (
          <button
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-zx-primary/25 bg-zx-surface-2 text-[12px] font-bold text-zx-primary shadow-sm transition-all hover:-translate-y-0.5 hover:bg-zx-surface focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-zx-primary/20"
            onClick={() => onNotifyAvailability(product)}
            type="button"
          >
            <BellRing aria-hidden="true" className="h-4 w-4" />
            {labels.notify}
          </button>
        ) : onCustomize ? (
          <div className="flex gap-2">
            <button
              className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-zx-primary px-4 text-[12px] font-bold text-zx-on-primary shadow-md shadow-zx-primary/15 transition-all hover:-translate-y-0.5 hover:bg-zx-primary-hover hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-zx-primary/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              disabled={soldOut}
              onClick={() => onCustomize(product)}
              type="button"
            >
              <Fingerprint className="h-4 w-4" />
              {soldOut ? labels.unavailable : labels.customize}
            </button>
            <button
              aria-label={labels.addToCart}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zx-line bg-zx-surface text-zx-primary transition-all hover:border-zx-primary hover:bg-zx-surface-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-zx-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={soldOut}
              onClick={() => onAddToCart(product, variant)}
              type="button"
            >
              <ShoppingBag className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-zx-primary text-[12px] font-bold text-zx-on-primary shadow-md shadow-zx-primary/15 transition-all hover:-translate-y-0.5 hover:bg-zx-primary-hover hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-zx-primary/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            disabled={soldOut}
            onClick={() => onAddToCart(product, variant)}
            type="button"
          >
            <ShoppingBag className="h-4 w-4" />
            {soldOut ? labels.unavailable : labels.addToCart}
          </button>
        )}
      </div>
    </motion.article>
  );
}
