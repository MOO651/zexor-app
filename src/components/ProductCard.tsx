import { useState, type ReactNode } from 'react';
import { Fingerprint, Heart, ShoppingBag, Sparkles } from 'lucide-react';
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
  };
  const categoryLabel = customCategoryLabel ?? (product.category === 'cards'
    ? isArabic ? 'هوية رقمية متصلة' : 'CONNECTED IDENTITY'
    : product.category === 'fashion'
      ? isArabic ? 'أزياء زكسور' : 'ZEXOR FASHION'
      : isArabic ? 'الاستوديو الرقمي' : 'DIGITAL STUDIO');

  return (
    <article className="zx-product zx-card group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-zx-line bg-zx-surface">
      <div className="zx-product-media relative aspect-[4/3] overflow-hidden bg-zx-surface-2">
        {product.imageUrl && failedImageUrl !== product.imageUrl ? (
          <img
            alt={product.name[locale]}
            className={`h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045] ${soldOut ? 'grayscale' : ''}`}
            loading="lazy"
            onError={() => setFailedImageUrl(product.imageUrl ?? '')}
            src={publicAssetUrl(product.imageUrl)}
          />
        ) : (
          <img
            alt={product.name[locale]}
            className="h-full w-full object-cover"
            loading="lazy"
            src={publicAssetUrl(fallbackImage)}
          />
        )}

        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-black/30 via-black/5 to-transparent"
        />

        <div className="absolute start-3 top-3 flex flex-wrap gap-1.5">
          {soldOut && (
            <span className="rounded-full border border-white/15 bg-[#10251e]/90 px-3 py-1.5 text-[10px] font-bold tracking-wide text-white shadow-lg backdrop-blur-md">
              {labels.soldOut}
            </span>
          )}
          {offer && !soldOut && (
            <span className="rounded-full border border-white/30 bg-[#f4d9c9]/95 px-3 py-1.5 text-[10px] font-extrabold tracking-wide text-[#392b24] shadow-lg backdrop-blur-md">
              −{offer.percent}%
            </span>
          )}
        </div>

        <button
          aria-label={labels.wishlist}
          aria-pressed={wishlisted}
          className={`absolute end-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/55 bg-white/90 shadow-lg backdrop-blur-xl transition-all hover:scale-105 hover:bg-white hover:text-[#a75245] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${wishlisted ? 'text-[#a75245]' : 'text-[#334d40]'}`}
          onClick={() => onToggleWishlist(product)}
          type="button"
        >
          <Heart aria-hidden="true" className="h-[18px] w-[18px]" fill={wishlisted ? 'currentColor' : 'none'} />
        </button>

        {badge && (
          <span className="absolute bottom-3 start-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-[#0f2a22]/90 px-3 py-1.5 text-[10px] font-bold text-white shadow-lg backdrop-blur-md">
            <Sparkles className="h-3 w-3 shrink-0 text-[#77cdb5]" />
            <bdi>{badge}</bdi>
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3.5 p-4 sm:p-5">
        <div className="min-h-[6.25rem]">
          <p className="mb-2 line-clamp-1 text-[9px] font-bold tracking-[0.12em] text-zx-primary">
            {categoryLabel}
          </p>
          <h3 className="line-clamp-1 text-[15px] font-bold leading-6 text-zx-ink sm:text-base">
            {product.name[locale]}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-[12px] leading-5 text-zx-muted">
            {product.description[locale]}
          </p>
        </div>

        {variants.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-semibold text-zx-muted">{labels.size}</p>
            <div aria-label={labels.size} className="flex flex-wrap gap-1.5" role="radiogroup">
              {variants.map((size) => {
                const selected = size === variant;
                return (
                  <button
                    aria-checked={selected}
                    className={`flex h-8 min-w-9 items-center justify-center rounded-xl border px-2.5 text-[10px] font-bold transition-all ${
                      selected
                        ? 'border-zx-primary bg-zx-primary text-zx-on-primary shadow-sm'
                        : 'border-zx-line bg-zx-surface text-zx-muted hover:border-zx-primary hover:text-zx-primary'
                    }`}
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

        <div className="zx-product-price mt-auto flex min-h-[4.25rem] items-center justify-between gap-2 border-t border-zx-line pt-3">
          <div className="min-w-0">
            <p className="mb-1 text-[9px] font-semibold tracking-wide text-zx-muted">
              {isArabic ? 'السعر' : 'PRICE'}
            </p>
            {renderPrice(price, 'zx-display text-[23px] leading-none text-zx-ink')}
          </div>
          {offer && (
            <div className="flex flex-col items-end gap-1">
              <span className="rounded-full bg-zx-sale/25 px-2 py-0.5 text-[9px] font-bold text-zx-on-sale">
                {isArabic ? `وفّر ${offer.percent}٪` : `SAVE ${offer.percent}%`}
              </span>
              {renderPrice(offer.oldPrice, 'zx-strike text-[10px] text-zx-muted')}
            </div>
          )}
        </div>

        {onCustomize ? (
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
    </article>
  );
}
