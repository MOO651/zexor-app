import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowDown, ArrowUpRight, Sparkles } from 'lucide-react';
import { useRef, useState } from 'react';
import { cinematicHeroVideos } from '../data/imagery';
import { PORTALS } from '../data/portals';
import type { Locale, Market, Route } from '../types';

type Props = {
  locale: Locale;
  brandName: string;
  market: Market;
  onMarketChange: (m: Market) => void;
  navigate: (r: Route) => void;
  heroTitle: string;
  heroAccent: string;
  heroText: string;
  heroImage?: string;
  departmentNames?: Partial<Record<'cards' | 'fashion' | 'services' | 'cars' | 'property', string>>;
};

const sceneId: Record<string, string> = {
  cards: 'nfc-story-scene', fashion: 'streetwear-scene', services: 'digital-experiences',
  cars: 'rental-story-scene', property: 'estate-finale-scene',
};

export function HomeHero({ locale, brandName, market, onMarketChange, navigate, heroTitle, heroAccent, heroText, heroImage, departmentNames }: Props) {
  const isArabic = locale === 'ar';
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const container = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: container, offset: ['start start', 'end end'] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 30, restDelta: .001 });
  const imageScale = useTransform(progress, [0, 1], [1.08, 1]);
  const mistY = useTransform(progress, [0, 1], [0, -100]);
  useMotionValueEvent(progress, 'change', (value) => setActiveIndex(Math.min(PORTALS.length - 1, Math.floor(value * PORTALS.length))));
  const background = heroImage?.trim() || '/images/zexor-cinematic-hero.webp';
  const active = PORTALS[activeIndex] ?? PORTALS[0];
  const title = [heroTitle, heroAccent].filter(Boolean).join(' ') || (isArabic ? 'كل حضورك، في مكان واحد' : 'Everything you stand for, in one place');
  const titleStart = heroTitle.trim();
  const titleHighlight = heroAccent.trim();
  const device = typeof navigator === 'undefined'
    ? null
    : navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const systemPrefersReducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const allowHeroVideo = !reduceMotion
    && !systemPrefersReducedMotion
    && !device?.connection?.saveData
    && (device?.hardwareConcurrency ?? 0) >= 4
    && (device?.deviceMemory ?? 0) >= 4;

  const focusPortal = (index: number) => setActiveIndex(index);
  const openPortal = (index: number) => {
    setActiveIndex(index);
    const target = document.getElementById(sceneId[PORTALS[index]?.route]);
    if (target) target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    else navigate(PORTALS[index]?.route ?? 'home');
  };

  return (
    <section aria-label={isArabic ? 'مقدمة زكسور' : 'ZEXOR introduction'} className="zx-cinematic-hero" dir={isArabic ? 'rtl' : 'ltr'} ref={container}>
      <div className="zx-cine-sticky">
        <motion.div aria-hidden="true" className="zx-cine-image" style={{ backgroundImage: `url("${background.replaceAll('"', '')}")`, scale: reduceMotion ? 1 : imageScale }} />
        <div aria-hidden="true" className="zx-cine-grade" />
        <motion.div aria-hidden="true" className="zx-cine-cloud zx-cine-cloud--far" style={reduceMotion ? undefined : { y: mistY }} />
        <div aria-hidden="true" className="zx-cine-cloud zx-cine-cloud--near" />
        <span aria-hidden="true" className="zx-cine-grain" />

        <header className="zx-cine-header">
          <a aria-label={brandName || 'ZEXOR'} className="zx-cine-brand" href="#top" onClick={(event) => { event.preventDefault(); window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); }}>
            <span className="zx-cine-brand-mark">Z</span><span>{brandName || 'ZEXOR'}<small>DESIGN · TECHNOLOGY · CULTURE</small></span>
          </a>
          <div aria-label={isArabic ? 'اختيار السوق' : 'Choose market'} className="zx-cine-market">
            {(['eg', 'ksa'] as const).map((option) => <button aria-pressed={market === option} className={market === option ? 'is-active' : ''} key={option} onClick={() => onMarketChange(option)} type="button">{option === 'eg' ? (isArabic ? 'مصر' : 'EGYPT') : (isArabic ? 'السعودية' : 'KSA')}</button>)}
          </div>
        </header>

        <div className="zx-cine-composition">
          <p className="zx-cine-eyebrow"><Sparkles aria-hidden="true" className="h-4 w-4" />{isArabic ? 'مصر · السعودية · حضور بلا حدود' : 'EGYPT · SAUDI ARABIA · MADE TO MOVE'}</p>
          <h1 className="zx-cine-word" aria-label="ZEXOR" dir="ltr">
            {PORTALS.map((portal, index) => {
              const video = allowHeroVideo && index === activeIndex ? cinematicHeroVideos[portal.route as keyof typeof cinematicHeroVideos] : null;
              const letter = 'ZEXOR'[index];
              const mask = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="50%" y="78%" text-anchor="middle" font-family="Arial,sans-serif" font-size="100" font-weight="900">${letter}</text></svg>`)}")`;
              return (
                <button
                  aria-label={`${portal.index}: ${departmentNames?.[portal.route as keyof NonNullable<Props['departmentNames']>] ?? portal.title[locale]}`}
                  aria-pressed={index === activeIndex}
                  className={index === activeIndex ? 'zx-cine-letter is-active' : 'zx-cine-letter'}
                  key={portal.route}
                  onClick={() => openPortal(index)}
                  onFocus={() => focusPortal(index)}
                  onPointerEnter={() => focusPortal(index)}
                  style={{
                    backgroundImage: `linear-gradient(0deg, color-mix(in srgb, var(--zx-footer-bg) 35%, transparent), color-mix(in srgb, var(--zx-footer-bg) 35%, transparent)), url("${portal.image}")`,
                    maskImage: video ? mask : undefined,
                    WebkitMaskImage: video ? mask : undefined,
                  }}
                  type="button"
                >
                  {video && <video aria-hidden="true" autoPlay className="zx-cine-letter__video" loop muted playsInline poster={portal.image} preload="none" src={video} onError={(event) => { event.currentTarget.hidden = true; }} />}
                  <span>{letter}</span>
                </button>
              );
            })}
          </h1>
          <div className="zx-cine-copy">
            <p className="zx-cine-kicker"><span dir="ltr">0{activeIndex + 1} / 05</span><span>{active.meta[locale]}</span></p>
            <h2 className="zx-cine-heading">
              {titleStart ? <>{titleStart}{titleHighlight && <> <span className="zx-cine-heading-accent">{titleHighlight}</span></>}</> : title}
            </h2>
            <p className="zx-cine-description">{activeIndex === 0 && heroText ? heroText : active.tagline[locale]}</p>
            <button className="zx-cine-cta" onClick={() => navigate(active.route)} type="button">{isArabic ? `اكتشف ${departmentNames?.[active.route as keyof NonNullable<Props['departmentNames']>] ?? active.title[locale]}` : `Explore ${departmentNames?.[active.route as keyof NonNullable<Props['departmentNames']>] ?? active.title[locale]}`}<ArrowUpRight aria-hidden="true" className="h-4 w-4" /></button>
          </div>
          <button className="zx-cine-bottomline" onClick={() => document.getElementById('nfc-story-scene')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })} type="button"><span>{isArabic ? 'خمسة عوالم · تجربة واحدة' : 'FIVE WORLDS · ONE EXPERIENCE'}</span><span>{isArabic ? 'ابدأ الرحلة' : 'SCROLL TO EXPLORE'}<ArrowDown aria-hidden="true" className="h-4 w-4" /></span></button>
        </div>
        <div aria-label={isArabic ? 'أقسام زكسور' : 'ZEXOR departments'} className="zx-cine-departments">
          {PORTALS.map((portal, index) => { const Icon = portal.icon; const name = departmentNames?.[portal.route as keyof NonNullable<Props['departmentNames']>] ?? portal.title[locale]; return <button aria-current={activeIndex === index ? 'true' : undefined} key={portal.route} onClick={() => openPortal(index)} onFocus={() => focusPortal(index)} onPointerEnter={() => focusPortal(index)} type="button"><Icon aria-hidden="true" /><span>{portal.index} · {name}</span></button>; })}
        </div>
        <div aria-hidden="true" className="zx-cine-scroll-progress"><motion.span style={{ scaleX: progress }} /></div>
      </div>
    </section>
  );
}
