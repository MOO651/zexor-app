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

const STORY_BEATS: Record<string, {
  title: Record<Locale, string>;
  scene: Record<Locale, string>;
  next: Record<Locale, string>;
  details: Record<Locale, string[]>;
}> = {
  cards: {
    title: { ar: 'لمسة واحدة… وتظهر هويتك كلها.', en: 'One tap reveals your whole identity.' },
    scene: { ar: 'تقرّب كارتك من الهاتف، فيظهر ملفك وروابطك فورًا.', en: 'Tap your card to a phone and your profile and links appear instantly.' },
    next: { ar: 'ومن هويتك… لأسلوبك.', en: 'From your identity to your style.' },
    details: { ar: ['أحمد محمد', 'مصمم تجارب رقمية', 'احفظ جهة الاتصال'], en: ['Ahmed Mohamed', 'Digital experience designer', 'Save contact'] },
  },
  fashion: {
    title: { ar: 'الهوية تتحول لستايل يشبهك.', en: 'Your identity becomes a style of your own.' },
    scene: { ar: 'من شاشة الملف الشخصي لشارع المدينة، اختار قطعة تعبّر عنك.', en: 'From your profile to the city streets, find a piece that feels like you.' },
    next: { ar: 'ومن الفكرة… لتجربة رقمية.', en: 'From an idea to a digital experience.' },
    details: { ar: ['إصدار محدود', 'ستايل يومي', 'اكتشف المجموعة'], en: ['Limited release', 'Everyday streetwear', 'Explore the collection'] },
  },
  services: {
    title: { ar: 'فكرة مشروعك تاخد شكلها الرقمي.', en: 'Your idea takes its digital shape.' },
    scene: { ar: 'الفكرة تتحول قدامك لموقع أو متجر أو تطبيق جاهز للنمو.', en: 'Watch an idea become a website, a store, or an app built to grow.' },
    next: { ar: 'والتجربة تخرج للطريق.', en: 'Then the experience hits the road.' },
    details: { ar: ['فكرة', 'تصميم', 'تجربة جاهزة'], en: ['Idea', 'Design', 'Ready to launch'] },
  },
  cars: {
    title: { ar: 'اختار الطريق اللي يوصّلك للي بعده.', en: 'Choose the road that takes you further.' },
    scene: { ar: 'سيارات مختارة تظهر بتفاصيلها الحقيقية، جاهزة للمعاينة والاستفسار.', en: 'Explore real vehicle listings with clear details and an easy viewing request.' },
    next: { ar: 'وكل طريق ليه مكان تبدأ منه.', en: 'Every road leads to a place to begin.' },
    details: { ar: ['اختيارات مختارة', 'تفاصيل واضحة', 'اطلب معاينة'], en: ['Curated vehicles', 'Clear details', 'Request a viewing'] },
  },
  property: {
    title: { ar: 'الرحلة تنتهي بمكانك الجاي.', en: 'The journey ends at your next place.' },
    scene: { ar: 'اكتشف المكان من صورته لتفاصيله، وحدد خطوتك التالية بسهولة.', en: 'Explore the space, its photos and details, then decide on your next step.' },
    next: { ar: 'زكسور… عوالم متعددة، في تجربة واحدة.', en: 'ZEXOR: many worlds in one experience.' },
    details: { ar: ['موقع واضح', 'تفاصيل المكان', 'رتّب معاينتك'], en: ['A clear location', 'Space details', 'Arrange a viewing'] },
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
              {isArabic ? 'رحلة واحدة · خمس محطات' : 'ONE JOURNEY · FIVE CHAPTERS'}
            </p>
            <h2 id="future-departments-title">
              {isArabic ? 'من لمسة… لعالم كامل.' : 'One tap. A whole world unfolds.'}
            </h2>
          </div>
          <p>
            {isArabic
              ? 'ابدأ بهويتك، واكمل الرحلة بين الأزياء والأفكار والطريق والمكان.'
              : 'Begin with your identity, then move through style, ideas, the road, and a place to call yours.'}
          </p>
        </header>

        <div className="future-home-story">
          {portals.map((portal, index) => {
            const Icon = portal.icon;
            const image = GATEWAY_IMAGES[portal.route];
            const category = categories.find((item) => item.slug === portal.route);
            const title = category?.name[locale] ?? portal.title[locale];
            const description = GATEWAY_COPY[portal.route]?.[locale] ?? portal.tagline[locale];
            const story = STORY_BEATS[portal.route];

            if (!image || !story) return null;

            return (
              <article
                aria-labelledby={`future-chapter-title-${portal.route}`}
                className={`future-home-chapter${index % 2 === 1 ? ' future-home-chapter--reverse' : ''}`}
                id={`future-gateway-${portal.route}`}
                key={portal.route}
              >
                <div className="future-home-chapter-stage">
                  <img
                    alt=""
                    aria-hidden="true"
                    className="future-home-chapter-image"
                    decoding="async"
                    height={900}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    sizes="(max-width: 767px) 100vw, 58vw"
                    src={image.small}
                    srcSet={`${image.small} 800w, ${image.large} 1440w`}
                    width={1440}
                  />
                  <span aria-hidden="true" className={`future-home-scene-finish future-home-scene-finish--${portal.route}`} />
                  <span className="future-home-chapter-stamp" dir="ltr">
                    <Icon aria-hidden="true" />
                    {portal.index} / 05
                  </span>

                  {portal.route === 'cards' && (
                    <div aria-label={isArabic ? 'معاينة ملف تعريفي يظهر بعد لمس الكارت' : 'Digital profile preview after tapping the card'} className="future-home-hud future-home-hud--profile" dir={isArabic ? 'rtl' : 'ltr'}>
                      <span className="future-home-hud-avatar">أ</span>
                      <span className="future-home-hud-name">{story.details[locale][0]}</span>
                      <span className="future-home-hud-caption">{story.details[locale][1]}</span>
                      <span className="future-home-hud-link"><RadioTower aria-hidden="true" /> {story.details[locale][2]}</span>
                    </div>
                  )}

                  {portal.route === 'fashion' && (
                    <span className="future-home-hud future-home-hud--fashion" dir={isArabic ? 'rtl' : 'ltr'}>
                      <Sparkles aria-hidden="true" />
                      {story.details[locale][0]}
                    </span>
                  )}

                  {portal.route === 'services' && (
                    <div className="future-home-hud future-home-hud--process" dir={isArabic ? 'rtl' : 'ltr'}>
                      {story.details[locale].map((step, stepIndex) => (
                        <span key={step}><i>{String(stepIndex + 1).padStart(2, '0')}</i>{step}</span>
                      ))}
                    </div>
                  )}

                  {(portal.route === 'cars' || portal.route === 'property') && (
                    <span className="future-home-hud future-home-hud--location" dir={isArabic ? 'rtl' : 'ltr'}>
                      <span aria-hidden="true" />
                      {isArabic ? 'مصر · السعودية' : 'EGYPT · SAUDI ARABIA'}
                    </span>
                  )}
                </div>

                <div className="future-home-chapter-copy" dir={isArabic ? 'rtl' : 'ltr'}>
                  <p className="future-home-chapter-meta">
                    <span>{portal.index}</span>
                    <span>{title}</span>
                  </p>
                  <h3 id={`future-chapter-title-${portal.route}`}>{story.title[locale]}</h3>
                  <p className="future-home-chapter-description">{story.scene[locale]}</p>
                  <p className="future-home-chapter-context">{description}</p>
                  <button
                    className="future-home-chapter-action"
                    onClick={() => navigate(portal.route)}
                    type="button"
                  >
                    {isArabic ? `اكتشف ${title}` : `Explore ${title}`}
                    <ArrowUpRight aria-hidden="true" />
                  </button>
                  <a
                    className="future-home-next"
                    href={index < portals.length - 1 ? `#future-gateway-${portals[index + 1].route}` : '#future-ending'}
                  >
                    {story.next[locale]}
                    <span aria-hidden="true" className="future-home-next-line" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="future-ending-title" className="future-home-ending" id="future-ending" dir={isArabic ? 'rtl' : 'ltr'}>
        <div aria-hidden="true" className="future-home-ending-orbit">
          <RadioTower />
        </div>
        <p className="future-home-eyebrow">
          <Sparkles aria-hidden="true" />
          {isArabic ? 'نظام واحد · عوالم متعددة' : 'ONE SYSTEM · MANY WORLDS'}
        </p>
        <h2 id="future-ending-title">
          {isArabic ? 'مستقبلك مش اختيار واحد.' : 'Your future isn’t just one choice.'}
          <span>{isArabic ? ' اختار عالمك.' : ' Choose your world.'}</span>
        </h2>
        <div className="future-home-ending-worlds">
          {portals.map((portal) => {
            const Icon = portal.icon;
            const title = categories.find((item) => item.slug === portal.route)?.name[locale] ?? portal.title[locale];
            return (
              <button key={portal.route} onClick={() => navigate(portal.route)} type="button">
                <Icon aria-hidden="true" />
                {title}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
