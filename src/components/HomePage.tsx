import { motion } from 'framer-motion';
import { ArrowUpRight, MessageCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { AGENCY_PROJECTS, STATS } from '../data/initialData';
import type { Locale, Market, Product, Property, Route, SiteSettings, Vehicle } from '../types';
import { money, publicAssetUrl, whatsappNumberFor } from '../utils';
import { CategoryShowcase } from './CategoryShowcase';
import { HomeHero, TiltCard } from './HomeHero';
import { FaqSection, TrackingAndNewsletter } from './HomeSections';
import { ProductCard } from './ProductCard';
import { TestimonialsSection } from './TestimonialsSection';
import { NfcChapter } from '../scenes/NfcChapter';
import { ProductFinderQuiz, SitePreloader } from './SiteExperienceExtras';
import { useSiteMedia } from '../lib/siteMediaContext';

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
        <span className="zx-eyebrow text-zx-text">{eyebrow}</span>
        <h2 className="zx-display zx-section-heading-title mt-2 text-2xl text-zx-text sm:text-3xl">
          <span className="zx-heading-mask">
            <span className="zx-heading-line">{title}</span>
          </span>
        </h2>
      </div>
      {actionLabel && onAction && (
        <button
          className="flex items-center gap-1.5 text-xs font-bold text-zx-text hover:text-zx-text"
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
  products: Product[];
  vehicles: Vehicle[];
  properties: Property[];
  settings: SiteSettings;
  wishlist: string[];
  navigate: (route: Route) => void;
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
  onToggleWishlist,
  onAddToCart,
  onOpenNfcCustomizer,
  onToast,
  onTrackOrder,
  renderPrice,
}: HomePageProps) {
  const { sectionVisibility, content } = settings;
  const { content: siteContent } = useSiteMedia();
  const storefrontProducts = products.filter((product) => product.available && (
    settings.showOtherMarketProducts?.[market]
      ? true
      : product.markets.includes(market)
  ));
  const cards = storefrontProducts.filter((p) => p.category === 'cards');
  const fashion = storefrontProducts.filter((p) => p.category === 'fashion');

  return (
    <div className="home-page-flow">
      <SitePreloader enabled={siteContent['feature.preloader']?.value_json === true} locale={locale} />
      {/* 1. Interactive 3D Parallax Hero */}
      <HomeHero
        heroAccent={settings.heroAccent[locale]}
        heroImage={settings.heroImage}
        heroText={settings.heroText[locale]}
        heroTitle={settings.heroTitle[locale]}
        locale={locale}
        navigate={navigate}
      />

      <NfcChapter
        locale={locale}
        market={market}
        onDesign={onOpenNfcCustomizer}
        onExplore={() => navigate('cards')}
        product={cards[0]}
        renderPrice={renderPrice}
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

      {siteContent['feature.quiz']?.value_json === true && (
        <ProductFinderQuiz locale={locale} onNavigate={navigate} />
      )}

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
                className="group overflow-hidden rounded-3xl border border-zx-border bg-zx-surface-raised/90 shadow-md"
                intensity={8}
                key={proj.id}
              >
                <div className="relative aspect-video overflow-hidden bg-zx-mint">
                  <img alt={proj.title[locale]} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" src={publicAssetUrl(proj.image)} />
                  <span className="absolute inset-s-3 top-3 rounded-full bg-zx-cinematic/80 px-2.5 py-1 text-[8px] font-semibold text-zx-accent-contrast backdrop-blur-md">
                    {proj.category[locale]}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-sm font-bold text-zx-text">{proj.title[locale]}</h3>
                  <p className="mt-1 text-[11px] leading-5 text-zx-text">{proj.description[locale]}</p>
                  <a
                    className="mt-4 flex min-h-10 w-full items-center justify-center gap-2 rounded-full bg-zx-cinematic px-4 text-xs font-semibold text-zx-accent-contrast shadow-xs hover:bg-zx-cinematic"
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
                className="overflow-hidden rounded-3xl border border-zx-border bg-zx-surface-raised/90 shadow-md"
                intensity={8}
                key={car.id}
              >
                <div className="relative aspect-[1.4/1] overflow-hidden bg-zx-mint">
                  <img alt={car.title[locale]} className="h-full w-full object-cover" src={publicAssetUrl(car.photo)} />
                                    <span className="absolute inset-s-3 top-3 rounded-full bg-zx-cinematic/60 px-2.5 py-1 text-[8px] font-bold text-zx-accent-contrast backdrop-blur-md">
                    {car.id}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-sm font-bold text-zx-text">{car.title[locale]}</h3>
                  <p className="mt-1 text-[10px] text-zx-text">{car.location[locale]}</p>
                  <p className="mt-3 text-base font-extrabold text-zx-text">
                    {money(car.price, market, locale)}
                  </p>
                  <button
                    className="mt-4 flex min-h-10 w-full items-center justify-center gap-2 rounded-full bg-zx-cinematic text-xs font-semibold text-zx-accent-contrast hover:bg-zx-cinematic"
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
                className="overflow-hidden rounded-3xl border border-zx-border bg-zx-surface-raised/90 shadow-md"
                intensity={8}
                key={prop.id}
              >
                <div className="relative aspect-[1.4/1] overflow-hidden bg-zx-mint">
                  <img alt={prop.title[locale]} className="h-full w-full object-cover" src={publicAssetUrl(prop.photo)} />
                                    <span className="absolute inset-s-3 top-3 rounded-full bg-zx-cinematic/60 px-2.5 py-1 text-[8px] font-bold text-zx-accent-contrast backdrop-blur-md">
                    {prop.id}
                  </span>
                  <span className="absolute inset-e-3 top-3 rounded-full bg-zx-cinematic px-2.5 py-1 text-[8px] font-semibold text-zx-accent-contrast">
                    {prop.deal === 'Sale' ? (isArabic ? 'للبيع' : 'Sale') : isArabic ? 'للإيجار' : 'Rent'}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-sm font-bold text-zx-text">{prop.title[locale]}</h3>
                  <p className="mt-1 text-[10px] text-zx-text">{prop.location[locale]}</p>
                  <p className="mt-3 text-base font-extrabold text-zx-text">
                    {money(prop.price, market, locale)}
                  </p>
                  <button
                    className="mt-4 flex min-h-10 w-full items-center justify-center gap-2 rounded-full bg-zx-cinematic text-xs font-semibold text-zx-accent-contrast hover:bg-zx-cinematic"
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
      <section className="zx-home-cta relative overflow-hidden rounded-4xl border border-zx-border bg-linear-to-br from-zx-cinematic to-zx-cinematic p-8 shadow-2xl sm:p-14">
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-xl">
            <span className="text-[9px] font-bold uppercase tracking-widest text-zx-text-secondary">
              {isArabic ? 'ابدأ خطوتك القادمة الآن' : 'YOUR NEXT MOVE STARTS HERE'}
            </span>
            <h2 className="mt-2 text-3xl font-extrabold sm:text-5xl">{content.ctaTitle[locale]}</h2>
            <p className="mt-3 text-xs leading-6 text-zx-accent-contrast/75 sm:text-sm">{content.ctaText[locale]}</p>
          </div>
          <a
            className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-zx-surface-raised px-8 text-xs font-bold text-zx-text shadow-lg transition-all hover:bg-zx-accent"
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
