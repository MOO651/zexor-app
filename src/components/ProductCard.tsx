import { useState, type ReactNode } from 'react';
import { Fingerprint, Heart, ShoppingBag, Sparkles } from 'lucide-react';
import type { Locale, Market, Product } from '../types';

type ProductCardProps = {
  product: Product;
  market: Market;
  locale: Locale;
  wishlisted: boolean;
  /**
   * Render a price with the app's own <PriceTag> so the RTL number/currency
   * order stays exactly as it is today.
   */
  renderPrice: (price: number, className: string) => ReactNode;
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product, variant?: string) => void;
  /** When given (NFC cards) the main button opens the customizer. */
  onCustomize?: (product: Product) => void;
  /** Optional label on the image, e.g. "Limited Drop". */
  badge?: string;
};

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
}: ProductCardProps) {
  const isArabic = locale === 'ar';
  const price = product.price[market];
  const oldPrice = product.oldPrice?.[market];
  const offer =
    oldPrice !== undefined && oldPrice > price
      ? { oldPrice, percent: Math.round((1 - price / oldPrice) * 100) }
      : null;
  const soldOut = !product.available;
  const variants = product.variants ?? [];
  const [variant, setVariant] = useState<string | undefined>(() =>
    variants.includes('L') ? 'L' : variants[0],
  );

  const t = {
    wishlist: isArabic ? 'إضافة للمفضلة' : 'Toggle wishlist',
    soldOut: isArabic ? 'نفدت الكمية' : 'Sold out',
    unavailable: isArabic ? 'غير متوفر' : 'Unavailable',
    customize: isArabic ? 'تخصيص الكارت' : 'Customize',
    addToCart: isArabic ? 'إضافة إلى السلة' : 'Add to cart',
    size: isArabic ? 'المقاس' : 'Size',
  };

  return (
    <article className="zx-card group flex flex-col overflow-hidden rounded-[var(--zx-radius,1.5rem)] border border-zx-line bg-zx-surface">
      <div className="relative aspect-[4/3] overflow-hidden bg-zx-surface-2">
        {product.imageUrl ? (
          <img
            alt={product.name[locale]}
            className={`h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
              soldOut ? 'grayscale' : ''
            }`}
            loading="lazy"
            src={product.imageUrl}
          />
        ) : (
          <div
            aria-hidden="true"
            className="h-full w-full bg-linear-to-br from-zx-mint/25 to-zx-lilac/25"
          />
        )}

        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/40 to-transparent"
        />

        <div className="absolute start-3 top-3 flex flex-wrap gap-1.5">
          {soldOut && (
            <span className="rounded-full bg-zx-ink px-2.5 py-1 text-[11px] font-bold text-zx-bg">
              {t.soldOut}
            </span>
          )}
          {offer && !soldOut && (
            <span className="rounded-full bg-zx-sale px-2.5 py-1 text-[11px] font-extrabold text-zx-on-sale">
              −{offer.percent}%
            </span>
          )}
        </div>

        <button
          aria-label={t.wishlist}
          aria-pressed={wishlisted}
          className="absolute end-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/85 text-[#5e6f66] shadow-sm backdrop-blur-md transition-colors hover:text-[#b4533a]"
          onClick={() => onToggleWishlist(product)}
          type="button"
        >
          <Heart className="h-4 w-4" fill={wishlisted ? '#b4533a' : 'none'} />
        </button>

        {badge && (
          <span className="absolute bottom-3 start-3 inline-flex items-center gap-1.5 rounded-full bg-[#0f2a22]/90 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm backdrop-blur-md">
            <Sparkles className="h-3 w-3 shrink-0 text-[#77cdb5]" />
            {/* bdi keeps the Arabic label from being reordered around the icon */}
            <bdi>{badge}</bdi>
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="text-[15px] font-bold leading-6 text-zx-ink">{product.name[locale]}</h3>
          <p className="mt-1 line-clamp-2 text-[12.5px] leading-5 text-zx-muted">
            {product.description[locale]}
          </p>
        </div>

        {variants.length > 0 && (
          <div aria-label={t.size} className="flex flex-wrap gap-1.5" role="radiogroup">
            {variants.map((v) => {
              const selected = v === variant;
              return (
                <button
                  aria-checked={selected}
                  className={`flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-[11px] font-bold transition-colors ${
                    selected
                      ? 'border-zx-primary bg-zx-primary text-zx-on-primary'
                      : 'border-zx-line bg-zx-surface text-zx-muted hover:border-zx-primary hover:text-zx-primary'
                  }`}
                  key={v}
                  onClick={() => setVariant(v)}
                  role="radio"
                  type="button"
                >
                  {v}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-auto flex flex-wrap items-baseline gap-x-3 gap-y-1 pt-1">
          {renderPrice(price, 'zx-display text-[22px] text-zx-ink')}
          {offer && renderPrice(offer.oldPrice, 'zx-strike text-xs text-zx-muted')}
        </div>

        {onCustomize ? (
          <div className="flex gap-2">
            <button
              className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-zx-primary text-[13px] font-bold text-zx-on-primary shadow-sm transition-colors hover:bg-zx-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
              disabled={soldOut}
              onClick={() => onCustomize(product)}
              type="button"
            >
              <Fingerprint className="h-4 w-4" />
              {soldOut ? t.unavailable : t.customize}
            </button>
            <button
              aria-label={t.addToCart}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-zx-line bg-zx-surface text-zx-primary transition-colors hover:border-zx-primary hover:bg-zx-surface-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={soldOut}
              onClick={() => onAddToCart(product, variant)}
              type="button"
            >
              <ShoppingBag className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-zx-primary text-[13px] font-bold text-zx-on-primary shadow-sm transition-colors hover:bg-zx-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            disabled={soldOut}
            onClick={() => onAddToCart(product, variant)}
            type="button"
          >
            <ShoppingBag className="h-4 w-4" />
            {soldOut ? t.unavailable : t.addToCart}
          </button>
        )}
      </div>
    </article>
  );
}
