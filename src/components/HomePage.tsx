import { motion } from 'framer-motion';
import { ArrowUpRight, MessageCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { AGENCY_PROJECTS, STATS } from '../data/initialData';
import type { Locale, Market, MarketFilter, Product, Property, Route, SiteSettings, Vehicle } from '../types';
import { money, publicAssetUrl, whatsappNumberFor } from '../utils';
import { CategoryShowcase } from './CategoryShowcase';
import { HomeHero, TiltCard } from './HomeHero';
import { FaqSection, TrackingAndNewsletter } from './HomeSections';
import { ProductCard } from './ProductCard';
import { TestimonialsSection } from './TestimonialsSection';

/**
 * Shared section header: an eyebrow label, the admin-editable title and an
 * optional "view all" action. Extracted so the eight home departments stay in
 * lockstep instead of repeating the same five lines of markup each time.
 */
function SectionHeading({
  eyebrow,
  title,
  actionLabel,
  onAction,
}: {
  eyebrow: string;
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
      <div>
        <span className="zx-eyebrow text-[#5e8b75]">{eyebrow}</span>
        <h2 className="zx-display mt-2 text-2xl text-[#21362b] sm:text-3xl">{title}</h2>
      </div>
      {actionLabel && onAction && (
        <button
          className="flex items-center gap-1.5 text-xs font-bold text-[#35614a] hover:text-[#234333]"
          onClick={onAction}
          type="button"
        >
          <span>{actionLabel}</span>
          <ArrowUpRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

type HomePageProps = {
  locale: Locale;
  isArabic: boolean;
  market: Market;
  marketFilter: MarketFilter;
  products: Product[];
  vehicles: Vehicle[];
  properties: Property[];
  settings: SiteSettings;
  wishlist: string[];
  navigate: (route: Route) => void;
  onMarketChange: (market: Market) => void;
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product, customization?: never, variant?: string) => void;
  onOpenNfcCustomizer: (product: Product) => void;
  onToast: (message: string) => void;
  onTrackOrder: () => void;
  renderPrice: (price: number, className: string) => ReactNode;
};

/**
 * The complete storefront landing surface. Pulled out of `App` so the main
 * component only has to own routing/global chrome; every piece of home-specific
 * markup — the hero, the department board, stats, the four product/market
 * showcases and the closing CTA — lives here.
 */
export function HomePage({
  locale,
  isArabic,
  market,
  products,
  vehicles,
  properties,
  settings,
  wishlist,
  navigate,
  onMarketChange,
  onToggleWishlist,
  onAddToCart,
  onOpenNfcCustomizer,
  onToast,
  onTrackOrder,
  renderPrice,
}: HomePageProps) {
  const { sectionVisibility, content } = settings;
  const cards = products.filter((p) => p.category === 'cards');
  const fashion = products.filter((p) => p.category === 'fashion');

  return (
    <div className="space-y-20">
      {/* 1. Interactive 3D Parallax Hero */}
      <HomeHero
        heroAccent={settings.heroAccent[locale]}
        heroImage={settings.heroImage}
        heroText={settings.heroText[locale]}
        heroTitle={settings.heroTitle[locale]}
        locale={locale}
        market={market}
        navigate={navigate}
        onMarketChange={onMarketChange}
      />

      {/* 2. Department Board — image-driven entry points into every section.
          The `departments` id is the scroll target for the hero's
          "Explore All 5 Departments" button. */}
      <div id="departments" className="scroll-mt-24">
        <CategoryShowcase
          isArabic={isArabic}
          locale={locale}
          navigate={navigate}
          visible={{
            cards: sectionVisibility.cards,
            fashion: sectionVisibility.fashion,
            cars: sectionVisibility.cars,
            property: sectionVisibility.property,
            services: sectionVisibility.services,
          }}
        />
      </div>

      {/* 3. Live Animated Stats Counter */}
      <section className="zx-feature-band relative overflow-hidden rounded-4xl p-6 shadow-sm sm:p-8">
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
              <p className="zx-display zx-feature-value text-3xl sm:text-4xl">
                {s.value}
              </p>
              <p className="zx-eyebrow zx-feature-label mt-2">{s.label[locale]}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. Section 01: 3D Smart NFC Identity Cards Showcase */}
      {sectionVisibility.cards && (
        <section className="space-y-6">
          <SectionHeading
            eyebrow={`01 / ${isArabic ? 'بطاقات الهوية المتصلة' : 'CONNECTED IDENTITY'}`}
            title={content.cardsTitle[locale]}
            actionLabel={isArabic ? 'استعراض كافة البطاقات' : 'View All Cards'}
            onAction={() => navigate('cards')}
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cards.slice(0, 3).map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                market={market}
                locale={locale}
                wishlisted={wishlist.includes(p.id)}
                renderPrice={renderPrice}
                onToggleWishlist={onToggleWishlist}
                onAddToCart={(prod: Product) => onAddToCart(prod)}
                onCustomize={onOpenNfcCustomizer}
              />
            ))}
          </div>
        </section>
      )}

      {/* 5. Section 02: Streetwear Collection Showcase */}
      {sectionVisibility.fashion && (
        <section className="space-y-6">
          <SectionHeading
            eyebrow={`02 / ${isArabic ? 'مجموعة الأزياء والستريت وير' : 'STREETWEAR COLLECTION'}`}
            title={content.fashionTitle[locale]}
            actionLabel={isArabic ? 'استعراض التشكيلة' : 'View Drop'}
            onAction={() => navigate('fashion')}
          />
          <div className="grid gap-6 sm:grid-cols-2">
            {fashion.slice(0, 2).map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                market="eg"
                locale={locale}
                wishlisted={wishlist.includes(p.id)}
                renderPrice={renderPrice}
                onToggleWishlist={onToggleWishlist}
                onAddToCart={(prod: Product, variant?: string) =>
                  onAddToCart(prod, undefined, variant)
                }
                badge={isArabic ? 'إصدار محدود' : 'Limited Drop'}
              />
            ))}
          </div>
        </section>
      )}

      {/* 6. Section 03: Digital Studio, Live Demos & Software Agency */}
      {sectionVisibility.services && (
        <section className="space-y-6">
          <SectionHeading
            eyebrow={`03 / ${isArabic ? 'الاستوديو وتطوير البرمجيات' : 'SOFTWARE & DIGITAL AGENCY'}`}
            title={content.servicesTitle[locale]}
            actionLabel={isArabic ? 'فتح الاستوديو وحاسبة التكلفة' : 'Open Full Studio & Calculator'}
            onAction={() => navigate('services')}
          />
          <div className="grid gap-6 md:grid-cols-3">
            {AGENCY_PROJECTS.map((proj) => (
              <TiltCard
                className="group overflow-hidden rounded-3xl border border-white bg-white/90 shadow-md"
                intensity={8}
                key={proj.id}
              >
                <div className="relative aspect-video overflow-hidden bg-[#e0eee5]">
                  <img alt={proj.title[locale]} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" src={publicAssetUrl(proj.image)} />
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

      {/* 7. Section 04: Luxury Car Showroom */}
      {sectionVisibility.cars && (
        <section className="space-y-6">
          <SectionHeading
            eyebrow={`04 / ${isArabic ? 'معرض ومكتب السيارات الفاخرة' : 'CURATED VEHICLES'}`}
            title={content.carsTitle[locale]}
            actionLabel={isArabic ? 'استعراض كل السيارات' : 'View All Cars'}
            onAction={() => navigate('cars')}
          />
          <div className="grid gap-6 md:grid-cols-3">
            {vehicles.map((car) => (
              <TiltCard
                className="overflow-hidden rounded-3xl border border-white bg-white/90 shadow-md"
                intensity={8}
                key={car.id}
              >
                <div className="relative aspect-[1.4/1] overflow-hidden bg-[#e5eee7]">
                  <img alt={car.title[locale]} className="h-full w-full object-cover" src={publicAssetUrl(car.photo)} />
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
                      window.open(
                        `https://wa.me/${whatsappNumberFor(market, settings)}?text=${encodeURIComponent(msg)}`,
                        '_blank',
                        'noopener,noreferrer',
                      );
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

      {/* 8. Section 05: Prime Real Estate Showcase */}
      {sectionVisibility.property && (
        <section className="space-y-6">
          <SectionHeading
            eyebrow={`05 / ${isArabic ? 'قسم العقارات والمساحات' : 'PRIME REAL ESTATE'}`}
            title={content.propertyTitle[locale]}
            actionLabel={isArabic ? 'استعراض كل العقارات' : 'View All Properties'}
            onAction={() => navigate('property')}
          />
          <div className="grid gap-6 md:grid-cols-3">
            {properties.map((prop) => (
              <TiltCard
                className="overflow-hidden rounded-3xl border border-white bg-white/90 shadow-md"
                intensity={8}
                key={prop.id}
              >
                <div className="relative aspect-[1.4/1] overflow-hidden bg-[#e5eee7]">
                  <img alt={prop.title[locale]} className="h-full w-full object-cover" src={publicAssetUrl(prop.photo)} />
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

      {/* 9. Section 06: Client Testimonials & Reviews */}
      <TestimonialsSection
        locale={locale}
        onContact={() => {
          const text = locale === 'ar' ? 'مرحباً، أرغب في مشاركة تجربتي مع ZEXOR.' : 'Hello, I would like to share my experience with ZEXOR.';
          window.open(`https://wa.me/${whatsappNumberFor(market, settings)}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
        }}
      />

      {/* 10. Section 07: Interactive FAQ */}
      <FaqSection isArabic={isArabic} locale={locale} />

      {/* 11. Section 08: Order Tracking + Newsletter */}
      <TrackingAndNewsletter
        isArabic={isArabic}
        locale={locale}
        onSubscribe={(email) =>
          onToast(
            isArabic ? `تمت إضافة ${email} إلى قائمة الإصدارات!` : `Added ${email} to the drop list!`,
          )
        }
        onTrackOrder={onTrackOrder}
      />

      {/* 12. Section 09: High-Impact Call to Action */}
      <section className="relative overflow-hidden rounded-4xl border border-white bg-linear-to-br from-[#20372d] to-[#121c17] p-8 text-white shadow-2xl sm:p-14">
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-xl">
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#72ce9f]">
              {isArabic ? 'ابدأ خطوتك القادمة الآن' : 'YOUR NEXT MOVE STARTS HERE'}
            </span>
            <h2 className="mt-2 text-3xl font-extrabold sm:text-5xl">{content.ctaTitle[locale]}</h2>
            <p className="mt-3 text-xs leading-6 text-white/75 sm:text-sm">{content.ctaText[locale]}</p>
          </div>
          <a
            className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-8 text-xs font-bold text-[#1f382c] shadow-lg transition-all hover:bg-[#a6e6c4]"
            href={`https://wa.me/${whatsappNumberFor(market, settings)}?text=${encodeURIComponent(
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
  );
}
