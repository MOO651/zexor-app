import { ArrowUpRight, RadioTower, Sparkles } from 'lucide-react';
import { PORTALS } from '../data/portals';
import type { DynamicCategory, Locale, Route } from '../types';
import { publicAssetUrl } from '../utils';

const futureImage = (file: string) => `${import.meta.env.BASE_URL}images/${file}`;

const GATEWAY_IMAGES: Record<string, { small: string; large: string }> = {
  cards: {
    small: futureImage('future-cards-800.webp'),
    large: futureImage('future-cards-1440.webp'),
  },
  fashion: {
    small: futureImage('future-fashion-800.webp'),
    large: futureImage('future-fashion-1440.webp'),
  },
  services: {
    small: futureImage('future-studio-800.webp'),
    large: futureImage('future-studio-1440.webp'),
  },
  cars: {
    small: futureImage('future-cars-800.webp'),
    large: futureImage('future-cars-1440.webp'),
  },
  property: {
    small: futureImage('future-property-800.webp'),
    large: futureImage('future-property-1440.webp'),
  },
};

const GATEWAY_COPY: Record<string, Record<Locale, string>> = {
  cards: {
    ar: 'هويتك وروابطك كلها في لمسة واحدة.',
    en: 'Your identity and links, one tap away.',
  },
  fashion: {
    ar: 'اختيارات تعبّر عن النسخة الجاية منك.',
    en: 'Pieces that reflect who you are becoming.',
  },
  services: {
    ar: 'من فكرة أولى لتجربة رقمية متكاملة.',
    en: 'Turn your first idea into a complete digital experience.',
  },
  cars: {
    ar: 'اختار الطريق اللي يوصّلك للي بعده.',
    en: 'Choose the drive that takes you further.',
  },
  property: {
    ar: 'مساحتك القادمة تبدأ من هنا.',
    en: 'Your next space starts here.',
  },
};

type Props = {
  locale: Locale;
  isArabic: boolean;
  categories: DynamicCategory[];
  visible: Record<'cards' | 'fashion' | 'services' | 'cars' | 'property', boolean>;
  heroTitle: string;
  heroAccent: string;
  heroText: string;
  heroImage: string;
  heroCta: string;
  navigate: (route: Route) => void;
};

export function FutureGatewayHome({
  locale,
  isArabic,
  categories,
  visible,
  heroTitle,
  heroAccent,
  heroText,
  heroImage,
  heroCta,
  navigate,
}: Props) {
  const portals = PORTALS.filter((portal) => visible[portal.route as keyof typeof visible]);
  const resolvedHeroImage = publicAssetUrl(heroImage) || futureImage('future-city-800.webp');

  return (
    <div className="future-home">
      <section aria-label={isArabic ? 'بوابة زكسور للمستقبل' : 'ZEXOR future gateway'} className="future-home-hero">
        <img
          alt=""
          aria-hidden="true"
          className="future-home-hero-image"
          decoding="async"
          fetchPriority="high"
          height={900}
          sizes="100vw"
          src={resolvedHeroImage}
          srcSet={heroImage ? undefined : `${futureImage('future-city-800.webp')} 800w, ${futureImage('future-city-1440.webp')} 1440w`}
          width={1440}
        />
        <div aria-hidden="true" className="future-home-hero-grid" />
        <div className="future-home-hero-content" dir={isArabic ? 'rtl' : 'ltr'}>
          <p className="future-home-eyebrow">
            <Sparkles aria-hidden="true" />
            {isArabic ? 'بوابة زكسور · ٢٠٤٠' : 'ZEXOR GATEWAY · 2040'}
          </p>
          <h1>
            {heroTitle}
            <span>{heroAccent}</span>
          </h1>
          <p className="future-home-description">{heroText}</p>
          <a className="future-home-primary-action" href="#departments">
            {heroCta}
            <ArrowUpRight aria-hidden="true" />
          </a>
        </div>

        <div aria-hidden="true" className="future-home-interface">
          <div className="future-home-interface-orbit">
            <span className="future-home-interface-core"><RadioTower /></span>
            <i className="future-home-orbit-node future-home-orbit-node--one" />
            <i className="future-home-orbit-node future-home-orbit-node--two" />
            <i className="future-home-orbit-node future-home-orbit-node--three" />
          </div>
          <span className="future-home-interface-label">{isArabic ? 'نظام واحد · عوالم متعددة' : 'ONE SYSTEM · MANY WORLDS'}</span>
        </div>

        <a className="future-home-skip" href="#departments">
          <span>{isArabic ? 'اكتشف البوابات الخمس' : 'EXPLORE FIVE GATEWAYS'}</span>
          <span aria-hidden="true" className="future-home-skip-line" />
        </a>
      </section>

      <section aria-labelledby="future-departments-title" className="future-home-departments" id="departments">
        <header className="future-home-section-heading" dir={isArabic ? 'rtl' : 'ltr'}>
          <div>
            <p className="future-home-section-kicker">
              <span aria-hidden="true">Z / 05</span>
              {isArabic ? 'عالم زكسور' : 'THE ZEXOR WORLDS'}
            </p>
            <h2 id="future-departments-title">
              {isArabic ? 'مستقبلك له أكتر من بوابة' : 'Your future has more than one doorway'}
            </h2>
          </div>
          <p>
            {isArabic
              ? 'اختار وجهتك، وكل بوابة هتوصّلك مباشرة للعالم اللي بتدور عليه.'
              : 'Choose a destination and step directly into the world you need.'}
          </p>
        </header>

        <div className="future-home-gateway-grid">
          {portals.map((portal, index) => {
            const Icon = portal.icon;
            const image = GATEWAY_IMAGES[portal.route];
            const category = categories.find((item) => item.slug === portal.route);
            const title = category?.name[locale] ?? portal.title[locale];
            const description = GATEWAY_COPY[portal.route]?.[locale] ?? portal.tagline[locale];

            if (!image) return null;

            return (
              <button
                aria-label={`${title} — ${description}`}
                className={`future-home-gateway future-home-gateway--${portal.route}`}
                id={`future-gateway-${portal.route}`}
                key={portal.route}
                onClick={() => navigate(portal.route)}
                type="button"
              >
                <img
                  alt=""
                  aria-hidden="true"
                  decoding="async"
                  height={900}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  sizes={portal.route === 'cards'
                    ? '(max-width: 767px) 100vw, 58vw'
                    : '(max-width: 767px) 50vw, 38vw'}
                  src={image.small}
                  srcSet={`${image.small} 800w, ${image.large} 1440w`}
                  width={1440}
                />
                <span aria-hidden="true" className="future-home-gateway-wash" />
                <span className="future-home-gateway-content" dir={isArabic ? 'rtl' : 'ltr'}>
                  <span className="future-home-gateway-topline">
                    <span className="future-home-gateway-icon"><Icon aria-hidden="true" /></span>
                    <span className="future-home-gateway-index" dir="ltr">{portal.index} / 05</span>
                  </span>
                  <span className="future-home-gateway-copy">
                    <span className="future-home-gateway-meta">{portal.meta[locale]}</span>
                    <span className="future-home-gateway-title">{title}</span>
                    <span className="future-home-gateway-description">{description}</span>
                    <span className="future-home-gateway-action">
                      {isArabic ? 'ادخل العالم' : 'Enter this world'}
                      <ArrowUpRight aria-hidden="true" />
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
