import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowDown, ArrowUpRight, Sparkles } from 'lucide-react';
import { useRef, useState } from 'react';
import { PORTALS } from '../data/portals';
import { useSiteAssets } from '../lib/siteMediaContext';
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
  const activeIndexRef = useRef(0);
  const container = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: container, offset: ['start start', 'end end'] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 30, restDelta: .001 });
  const imageScale = useTransform(progress, [0, 1], [1.08, 1]);
  const mistY = useTransform(progress, [0, 1], [0, -100]);
  useMotionValueEvent(progress, 'change', (value) => {
    const nextIndex = Math.min(PORTALS.length - 1, Math.floor(value * PORTALS.length));
    if (nextIndex === activeIndexRef.current) return;
    activeIndexRef.current = nextIndex;
    setActiveIndex(nextIndex);
  });
  const background = heroImage?.trim() || '/images/zexor-cinematic-hero.webp';
  const { assets } = useSiteAssets();
  const portalImages = PORTALS.map((portal, index) => assets[`hero.letter.${'zexor'[index]}.poster`]?.url || portal.image);
  const active = PORTALS[activeIndex] ?? PORTALS[0];
  const title = [heroTitle, heroAccent].filter(Boolean).join(' ') || (isArabic ? 'كل حضورك، في مكان واحد' : 'Everything you stand for, in one place');

  const focusPortal = (index: number) => {
    activeIndexRef.current = index;
    setActiveIndex(index);
  };
  const openPortal = (index: number) => {
    activeIndexRef.current = index;
    setActiveIndex(index);
    const target = document.getElementById(sceneId[PORTALS[index]?.route]);
    if (target) target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    else navigate(PORTALS[index]?.route ?? 'home');
  };

  return (
    <section aria-label={isArabic ? 'مقدمة زكسور' : 'ZEXOR introduction'} className="zx-cinematic-hero" dir={isArabic ? 'rtl' : 'ltr'} ref={container}>
      <div className="zx-cine-sticky">
        {heroImage?.trim() ? (
          <motion.div aria-hidden="true" className="zx-cine-image" style={{ backgroundImage: `url("${background.replaceAll('"', '')}")`, scale: reduceMotion ? 1 : imageScale }} />
        ) : (
          <motion.div aria-hidden="true" className="zx-cine-image" style={{ scale: reduceMotion ? 1 : imageScale }}>
            {PORTALS.map((portal, index) => <div className={index === activeIndex ? 'zx-cine-image-slide is-active' : 'zx-cine-image-slide'} key={portal.route} style={{ backgroundImage: `url("${portalImages[index].replaceAll('"', '')}")` }} />)}
          </motion.div>
        )}
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
            {PORTALS.map((portal, index) => <button aria-label={`${portal.index}: ${departmentNames?.[portal.route as keyof NonNullable<Props['departmentNames']>] ?? portal.title[locale]}`} aria-pressed={index === activeIndex} className={index === activeIndex ? 'zx-cine-letter is-active' : 'zx-cine-letter'} key={portal.route} onClick={() => openPortal(index)} onFocus={() => focusPortal(index)} onPointerEnter={() => focusPortal(index)} style={{ backgroundImage: `linear-gradient(0deg, color-mix(in srgb, var(--zx-footer-bg) 35%, transparent), color-mix(in srgb, var(--zx-footer-bg) 35%, transparent)), url("${portalImages[index]}")` }} type="button">{'ZEXOR'[index]}</button>)}
          </h1>
          <div className="zx-cine-copy">
            <p className="zx-cine-kicker"><span dir="ltr">0{activeIndex + 1} / 05</span><span>{active.meta[locale]}</span></p>
            <h2 className="zx-cine-heading">{title}</h2>
            <p className="zx-cine-description">{activeIndex === 0 && heroText ? heroText : active.tagline[locale]}</p>
            <button className="zx-cine-cta" onClick={() => navigate(active.route)} type="button">{isArabic ? 'تصفّح الأقسام' : 'Browse the sections'}<ArrowUpRight aria-hidden="true" className="h-4 w-4" /></button>
          </div>
          <div aria-label={isArabic ? 'مختارات من أقسام زكسور' : 'Selected ZEXOR departments'} className="zx-cine-featured">
            {PORTALS.map((portal, index) => {
              const name = departmentNames?.[portal.route as keyof NonNullable<Props['departmentNames']>] ?? portal.title[locale];
              return <button aria-label={isArabic ? `اكتشف ${name}` : `Explore ${name}`} className="zx-cine-featured-card" key={portal.route} onClick={() => openPortal(index)} type="button">
                <img alt="" loading="lazy" src={portalImages[index]} />
                <span>{name}<ArrowUpRight aria-hidden="true" /></span>
              </button>;
            })}
          </div>
          <div className="zx-cine-proof" aria-label={isArabic ? 'عن زكسور' : 'About ZEXOR'}>
            <span><b>02</b>{isArabic ? 'سوقان: مصر والسعودية' : 'Markets: Egypt & Saudi Arabia'}</span>
            <span><b>05</b>{isArabic ? 'أقسام تحت علامة واحدة' : 'Departments, one brand'}</span>
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
