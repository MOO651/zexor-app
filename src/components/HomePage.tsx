import { ArrowUpRight, MessageCircle, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { STATS } from '../data/initialData';
import { PORTALS } from '../data/portals';
import type { DynamicCategory, Locale, Market, Product, Route, SiteSettings } from '../types';
import { publicAssetUrl, whatsappNumberFor } from '../utils';
import { CategoryShowcase } from './CategoryShowcase';
import { HomeHero } from './HomeHero';
import { FaqSection, TrackingAndNewsletter } from './HomeSections';
import { ProductCard } from './ProductCard';
import { TestimonialsSection } from './TestimonialsSection';
import { ProductFinderQuiz, SitePreloader } from './SiteExperienceExtras';
import { useSiteMedia } from '../lib/siteMediaContext';

type HomePageProps = {
  locale: Locale;
  isArabic: boolean;
  market: Market;
  products: Product[];
  settings: SiteSettings;
  categories: DynamicCategory[];
  wishlist: string[];
  navigate: (route: Route) => void;
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product, customization?: never, variant?: string) => void;
  onOpenNfcCustomizer: (product: Product) => void;
  onToast: (message: string) => void;
  onTrackOrder: () => void;
  renderPrice: (price: number, className: string) => ReactNode;
};

export function HomePage({
  locale, isArabic, market, products, settings, categories, wishlist,
  navigate, onToggleWishlist, onAddToCart, onOpenNfcCustomizer, onToast, onTrackOrder, renderPrice,
}: HomePageProps) {
  const { sectionVisibility, content } = settings;
  const { content: siteContent } = useSiteMedia();
  const storefrontProducts = products.filter((product) => product.available && (
    settings.showOtherMarketProducts?.[market] || product.markets.includes(market)
  ));
  const featured = storefrontProducts.slice(0, 4);
  const featureRoutes: Route[] = ['services', 'cars', 'property'];
  const featurePortals = featureRoutes.map((route) => PORTALS.find((portal) => portal.route === route)).filter(Boolean);
  const visible = {
    cards: sectionVisibility.cards,
    fashion: sectionVisibility.fashion,
    cars: sectionVisibility.cars,
    property: sectionVisibility.property,
    services: sectionVisibility.services,
  };

  return (
    <div className="zx-new-home">
      <SitePreloader enabled={siteContent['feature.preloader']?.value_json === true} locale={locale} />
      <HomeHero
        departmentNames={Object.fromEntries(categories.filter((category) => !category.parentSlug).map((category) => [category.slug, category.name[locale]]))}
        heroAccent={settings.heroAccent[locale]}
        heroImage={settings.heroImage}
        heroText={settings.heroText[locale]}
        heroTitle={settings.heroTitle[locale]}
        locale={locale}
        navigate={navigate}
      />

      <section className="zx-new-manifesto" aria-label={isArabic ? 'رؤية زكسور' : 'The ZEXOR point of view'}>
        <div className="zx-new-manifesto-label"><span>01</span><span>{isArabic ? 'أكثر من متجر' : 'MORE THAN A STORE'}</span></div>
        <p>{isArabic
          ? 'مساحة واحدة تجمع الأسلوب والتقنية والخدمات والأماكن — اكتشف عالمك التالي.'
          : 'One connected destination for style, technology, services and spaces. Find what moves you next.'}</p>
        <span className="zx-new-manifesto-mark" aria-hidden="true">Z/</span>
      </section>

      <div id="departments" className="zx-new-departments">
        <CategoryShowcase categories={categories} isArabic={isArabic} locale={locale} navigate={navigate} visible={visible} />
      </div>

      {siteContent['feature.quiz']?.value_json === true && <ProductFinderQuiz locale={locale} onNavigate={navigate} />}

      <section className="zx-new-featured">
        <div className="zx-new-section-head">
          <div><span className="zx-new-eyebrow">{isArabic ? '02 / اختياراتنا' : '02 / THE EDIT'}</span>
            <h2>{isArabic ? 'اختيارات تستحق الاكتشاف.' : 'Worth a closer look.'}</h2></div>
          <button type="button" onClick={() => navigate('cards')}>{isArabic ? 'اكتشف المنتجات' : 'Explore products'} <ArrowUpRight size={17} /></button>
        </div>
        {featured.length ? <div className="zx-new-product-grid">
          {featured.map((product) => <ProductCard key={product.id} product={product} market={market} locale={locale}
            wishlisted={wishlist.includes(product.id)} renderPrice={renderPrice} onToggleWishlist={onToggleWishlist}
            onAddToCart={(item: Product, variant?: string) => onAddToCart(item, undefined, variant)}
            onCustomize={onOpenNfcCustomizer} />)}
        </div> : <div className="zx-new-empty">{isArabic ? 'اختيارات جديدة قريبًا.' : 'Fresh selections coming soon.'}</div>}
      </section>

      <section className="zx-new-worlds">
        <div className="zx-new-section-head">
          <div><span className="zx-new-eyebrow">{isArabic ? '03 / عوالم زكسور' : '03 / MADE OF MANY WORLDS'}</span>
            <h2>{isArabic ? 'أفكار مختلفة. روح واحدة.' : 'Different worlds. One spirit.'}</h2></div>
        </div>
        <div className="zx-new-world-grid">
          {featurePortals.map((portal, index) => portal && <button key={portal.route} type="button" className={`zx-new-world-card zx-new-world-card-${index + 1}`} onClick={() => navigate(portal.route)}>
            <img src={publicAssetUrl(portal.image)} alt="" loading="lazy" />
            <span className="zx-new-world-shade" />
            <span className="zx-new-world-number">{portal.index} / ZEXOR</span>
            <span className="zx-new-world-copy"><small>{portal.meta[locale]}</small><strong>{portal.title[locale]}</strong><span>{portal.tagline[locale]}</span></span>
            <span className="zx-new-world-arrow"><ArrowUpRight size={19} /></span>
          </button>)}
        </div>
      </section>

      <section className="zx-new-proof">
        <div className="zx-new-proof-intro"><Sparkles size={18} /><span>{isArabic ? 'مصمم حول احتياجاتك' : 'BUILT AROUND YOUR NEXT MOVE'}</span></div>
        <div className="zx-new-proof-grid">{STATS.map((stat) => <div key={stat.id}><strong>{stat.value}</strong><span>{stat.label[locale]}</span></div>)}</div>
      </section>

      <TestimonialsSection locale={locale} onContact={() => {
        const message = isArabic ? 'مرحباً، أرغب في مشاركة تجربتي مع ZEXOR.' : 'Hello, I would like to share my experience with ZEXOR.';
        window.open(`https://wa.me/${whatsappNumberFor(market, settings)}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
      }} />
      <FaqSection isArabic={isArabic} locale={locale} />
      <TrackingAndNewsletter isArabic={isArabic} locale={locale}
        onSubscribe={(email) => onToast(isArabic ? `تمت إضافة ${email} إلى قائمة الإصدارات!` : `Added ${email} to the drop list!`)}
        onTrackOrder={onTrackOrder} />

      <section className="zx-new-contact">
        <div><span className="zx-new-eyebrow">{isArabic ? 'الخطوة التالية تبدأ هنا' : 'YOUR NEXT MOVE STARTS HERE'}</span>
          <h2>{content.ctaTitle[locale]}</h2><p>{content.ctaText[locale]}</p></div>
        <a href={`https://wa.me/${whatsappNumberFor(market, settings)}?text=${encodeURIComponent(isArabic ? 'مرحباً ZEXOR، أود بدء محادثة ومناقشة مشروع جديد.' : 'Hello ZEXOR, I want to start a new project.')}`}
          rel="noreferrer" target="_blank"><MessageCircle size={18} />{isArabic ? 'ابدأ محادثة' : 'Start a conversation'}<ArrowUpRight size={17} /></a>
      </section>
    </div>
  );
}
