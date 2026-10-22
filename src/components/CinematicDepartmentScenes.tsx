import { motion, useReducedMotion, useTransform, type MotionValue } from 'framer-motion';
import { ArrowUpRight, CarFront, Radio, Sparkles } from 'lucide-react';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { photos } from '../data/imagery';
import type { Locale, Route } from '../types';
import { SceneWrapper, ScrollProgress, TextReveal } from './CinematicScenePrimitives';
import { useLowPowerDevice, useSceneProgress } from './useSceneProgress';
import { DigitalExperienceScene } from './DigitalExperienceScene';

const NfcHero3D = lazy(() => import('./NfcHero3D').then((module) => ({ default: module.NfcHero3D })));

const sceneCopy = {
  ar: {
    fashion: { chapter: '02 / أزياء زكسور', lines: ['حضورك،', 'بأسلوبك.'], body: 'قطع يومية بتفاصيل مدروسة، تعكس أسلوبك من غير تكلّف.', cta: 'تصفّح الأزياء', labels: ['القطعة الأولى', 'تفاصيل الخامة'] },
    cards: { chapter: '01 / هوية متصلة', lines: ['لمسة واحدة.', 'عالمك كله.'], body: 'بطاقة NFC تجمع روابطك وهويتك الرقمية، وتشاركها بلمسة واحدة.', cta: 'صمّم بطاقتك', labels: ['قرّب هاتفك', 'هويتك الرقمية'] },
    cars: { chapter: '04 / زكسور موتورز', lines: ['الطريق،', 'على مزاجك.'], body: 'اعرف تفاصيل السيارات المتاحة، واختار مدة الإيجار المناسبة لمشاويرك.', cta: 'تصفّح السيارات', labels: ['اختيارك', 'رحلتك'] },
    property: { chapter: '05 / زكسور إستيتس', lines: ['المكان المناسب', 'يغيّر كل شيء.'], body: 'تصفّح العقارات المنشورة، واطلب معاينة للمكان المناسب لك.', cta: 'تصفّح العقارات', labels: ['مساحات مختلفة', 'اطلب معاينة'] },
  },
  en: {
    fashion: { chapter: '02 / ZEXOR FASHION', lines: ['A presence', 'of your own.'], body: 'Everyday pieces with considered details, made to feel like your own.', cta: 'Browse fashion', labels: ['The first piece', 'Considered details'] },
    cards: { chapter: '01 / CONNECTED IDENTITY', lines: ['One tap.', 'Your whole world.'], body: 'Bring your digital profile and links together on one NFC card, ready to share with a tap.', cta: 'Design your card', labels: ['Bring your phone close', 'Your digital identity'] },
    cars: { chapter: '04 / ZEXOR MOTORS', lines: ['Take the road', 'your way.'], body: 'Explore available vehicles, compare rental options and choose what suits your plans.', cta: 'Browse cars', labels: ['Your choice', 'Your journey'] },
    property: { chapter: '05 / ZEXOR ESTATES', lines: ['The right place', 'changes everything.'], body: 'Explore listed homes and spaces, then request a viewing for the one that fits.', cta: 'Browse properties', labels: ['Find your space', 'Request a viewing'] },
  },
} as const;

function ChapterHeader({ chapter, lines, body, cta, target, navigate }: { chapter: string; lines: readonly string[]; body: string; cta: string; target: Route; navigate: (route: Route) => void }) {
  return <div className="zx-chapter-copy zx-section-heading"><span className="zx-chapter-eyebrow zx-ui-badge"><Sparkles size={14} />{chapter}</span><TextReveal className="zx-chapter-title" lines={lines} /><p className="zx-chapter-description">{body}</p><button className="zx-ui-button zx-ui-button--primary zx-chapter-cta" onClick={() => navigate(target)} type="button">{cta}<ArrowUpRight size={16} /></button></div>;
}

type VisibleDepartments = { cards: boolean; fashion: boolean; services: boolean; cars: boolean; property: boolean };

export function CinematicDepartmentScenes({ locale, navigate, visible }: { locale: Locale; navigate: (route: Route) => void; visible: VisibleDepartments }) {
  const copy = sceneCopy[locale];
  return <>
    {visible.cards && <NfcStoryScene copy={copy.cards} locale={locale} navigate={navigate} />}
    {visible.fashion && <StreetwearScene copy={copy.fashion} locale={locale} navigate={navigate} />}
    {visible.services && <DigitalExperienceScene locale={locale} navigate={navigate} />}
    {visible.cars && <RentalCarScene copy={copy.cars} locale={locale} navigate={navigate} />}
    {visible.property && <RealEstateFinale copy={copy.property} locale={locale} navigate={navigate} />}
  </>;
}

function StreetwearScene({ copy, locale, navigate }: { copy: typeof sceneCopy.en.fashion | typeof sceneCopy.ar.fashion; locale: Locale; navigate: (route: Route) => void }) {
  return <SceneWrapper className="zx-story-scene zx-streetwear-scene" id="streetwear-scene" locale={locale}><StreetwearContent copy={copy} locale={locale} navigate={navigate} /></SceneWrapper>;
}

function StreetwearContent({ copy, locale, navigate }: { copy: typeof sceneCopy.en.fashion | typeof sceneCopy.ar.fashion; locale: Locale; navigate: (route: Route) => void }) {
  const progress = useSceneProgress();
  const reduce = useReducedMotion();
  const lowPower = useLowPowerDevice();
  const x = useTransform(progress, [0, 1], ['0%', locale === 'ar' ? '5%' : '-5%']);
  // Two distinct editorial shots are available; never repeat the same photo in the rail.
  const cards = [photos.hoodie, photos.tee];
  return <>
    <ScrollProgress />
    <div className="zx-streetwear-layout"><ChapterHeader body={copy.body} chapter={copy.chapter} cta={copy.cta} lines={copy.lines} navigate={navigate} target="fashion" />
      <div className="zx-streetwear-gallery"><motion.div className="zx-streetwear-track" style={reduce || lowPower ? undefined : { x }}>
        {cards.map((image, index) => <article className={`zx-streetwear-piece zx-streetwear-piece--${index + 1}`} key={`${image}-${index}`}><img alt={isAlt(locale, index)} loading="lazy" src={image} /><span>{copy.labels[index]}</span><b>0{index + 1}</b></article>)}
      </motion.div></div>
      <span aria-label={locale === 'ar' ? 'المشهد 2 من 5' : 'Scene 2 of 5'} className="zx-scene-counter" dir="ltr">02 / 05</span>
    </div>
  </>;
}

function isAlt(locale: Locale, index: number) { return locale === 'ar' ? ['قطعة من مجموعة زكسور', 'تفاصيل من تصميم زكسور'][index] : ['ZEXOR fashion piece', 'A detail from the ZEXOR collection'][index]; }

function NfcStoryScene({ copy, locale, navigate }: { copy: typeof sceneCopy.en.cards | typeof sceneCopy.ar.cards; locale: Locale; navigate: (route: Route) => void }) {
  return <SceneWrapper className="zx-story-scene zx-nfc-story-scene" id="nfc-story-scene" locale={locale}><NfcStoryContent copy={copy} locale={locale} navigate={navigate} /></SceneWrapper>;
}

function NfcStoryContent({ copy, locale, navigate }: { copy: typeof sceneCopy.en.cards | typeof sceneCopy.ar.cards; locale: Locale; navigate: (route: Route) => void }) {
  const progress = useSceneProgress();
  const reduce = useReducedMotion();
  const lowPower = useLowPowerDevice();
  const compactViewport = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 820px)').matches)[0];
  const rotateY = useTransform(progress, [0, .5, 1], [0, 90, 180]);
  const y = useTransform(progress, [0, 1], [18, -40]);
  const scale = useTransform(progress, [0, .5, 1], [1, 1, 1.04]);
  const ripple = useTransform(progress, [.35, .58], [.15, 1]);
  const stageRef = useRef<HTMLDivElement>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !('IntersectionObserver' in window)) { setIsNearViewport(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      setIsNearViewport(true);
      observer.disconnect();
    }, { rootMargin: '480px 0px' });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);
  return <>
    <ScrollProgress />
    <div className="zx-nfc-story-layout"><ChapterHeader body={copy.body} chapter={copy.chapter} cta={copy.cta} lines={copy.lines} navigate={navigate} target="cards" />
      <div className="zx-nfc-story-stage" ref={stageRef}><motion.div aria-hidden="true" className="zx-nfc-ripple" style={reduce || lowPower ? undefined : { scale, opacity: ripple }} />{reduce || lowPower || compactViewport || !isNearViewport ? <motion.div className="zx-story-nfc-card" style={reduce || lowPower ? undefined : { y, rotateY, scale }}><div className="zx-story-nfc-face zx-story-nfc-front"><span>ZEXOR</span><i /><small>DESIGN · TECHNOLOGY · CULTURE</small></div><div className="zx-story-nfc-face zx-story-nfc-back"><Radio size={24} /><b>Z</b><small>{locale === 'ar' ? 'هويتك، بلمسة' : 'YOUR IDENTITY, ONE TAP'}</small></div></motion.div> : <div className="zx-nfc-story-model"><Suspense fallback={<div className="zx-story-nfc-card"><div className="zx-story-nfc-face zx-story-nfc-front"><span>ZEXOR</span><i /><small>DESIGN · TECHNOLOGY · CULTURE</small></div></div>}><NfcHero3D lowPower={lowPower} scrollProgress={progress as MotionValue<number>} /></Suspense></div>}<div className="zx-nfc-story-caption"><Radio size={15} />{locale === 'ar' ? 'NFC · جاهزة للاتصال' : 'NFC · READY TO CONNECT'}</div></div>
      <span aria-label={locale === 'ar' ? 'المشهد 1 من 5' : 'Scene 1 of 5'} className="zx-scene-counter" dir="ltr">01 / 05</span>
    </div>
  </>;
}

function RentalCarScene({ copy, locale, navigate }: { copy: typeof sceneCopy.en.cars | typeof sceneCopy.ar.cars; locale: Locale; navigate: (route: Route) => void }) {
  return <SceneWrapper className="zx-story-scene zx-rental-story-scene" id="rental-story-scene" locale={locale}><RentalCarContent copy={copy} locale={locale} navigate={navigate} /></SceneWrapper>;
}

function RentalCarContent({ copy, locale, navigate }: { copy: typeof sceneCopy.en.cars | typeof sceneCopy.ar.cars; locale: Locale; navigate: (route: Route) => void }) {
  const progress = useSceneProgress();
  const reduce = useReducedMotion();
  const lowPower = useLowPowerDevice();
  const imageX = useTransform(progress, [0, 1], [locale === 'ar' ? '1%' : '-1%', '0%']);
  const imageScale = useTransform(progress, [0, 1], [1, 1.06]);
  const blur = useTransform(progress, [0, .48, 1], ['1px', '0px', '0px']);
  const flare = useTransform(progress, [0, .5, 1], [0, .9, .25]);
  return <>
    <ScrollProgress />
    <div className="zx-rental-layout"><ChapterHeader body={copy.body} chapter={copy.chapter} cta={copy.cta} lines={copy.lines} navigate={navigate} target="cars" />
      <div className="zx-rental-stage"><motion.div className="zx-rental-headlight" style={reduce || lowPower ? undefined : { opacity: flare }} /><motion.img alt={locale === 'ar' ? 'سيارة للإيجار من زكسور' : 'ZEXOR rental car'} className="zx-rental-car" loading="lazy" src={photos.vehicleSedan} style={reduce || lowPower ? undefined : { x: imageX, scale: imageScale, filter: blur }} /><div className="zx-rental-spec"><CarFront size={16} /><span>{locale === 'ar' ? 'خيارات إيجار مرنة' : 'FLEXIBLE RENTAL OPTIONS'}</span><b>01 — 03</b></div></div>
      <span aria-label={locale === 'ar' ? 'المشهد 4 من 5' : 'Scene 4 of 5'} className="zx-scene-counter" dir="ltr">04 / 05</span>
    </div>
  </>;
}

function RealEstateFinale({ copy, locale, navigate }: { copy: typeof sceneCopy.en.property | typeof sceneCopy.ar.property; locale: Locale; navigate: (route: Route) => void }) {
  return <SceneWrapper className="zx-story-scene zx-estate-finale" id="estate-finale-scene" locale={locale}><EstateContent copy={copy} locale={locale} navigate={navigate} /></SceneWrapper>;
}

function EstateContent({ copy, locale, navigate }: { copy: typeof sceneCopy.en.property | typeof sceneCopy.ar.property; locale: Locale; navigate: (route: Route) => void }) {
  const progress = useSceneProgress();
  const reduce = useReducedMotion();
  const lowPower = useLowPowerDevice();
  const buildingY = useTransform(progress, [0, 1], [110, -20]);
  const buildingScale = useTransform(progress, [0, 1], [.82, 1.12]);
  const cloudLeft = useTransform(progress, [0, 1], ['0%', '-78%']);
  const cloudRight = useTransform(progress, [0, 1], ['0%', '78%']);
  return <>
    <ScrollProgress />
    <div className="zx-estate-finale__stage">
      <div className="zx-estate-sky" />
      <motion.div aria-hidden="true" className="zx-estate-cloud zx-estate-cloud--left" style={reduce || lowPower ? undefined : { x: cloudLeft }} />
      <motion.div aria-hidden="true" className="zx-estate-cloud zx-estate-cloud--right" style={reduce || lowPower ? undefined : { x: cloudRight }} />
      <motion.img alt={locale === 'ar' ? 'مساحة سكنية للإيجار' : 'Rental residence by ZEXOR Estates'} className="zx-estate-building" loading="lazy" src={photos.propertyVilla} style={reduce || lowPower ? undefined : { y: buildingY, scale: buildingScale }} />
      <div className="zx-estate-grading" />
      <div className="zx-estate-finale__content"><div className="zx-estate-finale__reveal-title"><span>ZEXOR</span><small>{copy.chapter}</small></div><div className="zx-estate-finale__copy"><TextReveal className="zx-chapter-title" lines={copy.lines} /><p>{copy.body}</p><button className="zx-ui-button zx-ui-button--primary zx-chapter-cta" onClick={() => navigate('property')} type="button">{copy.cta}<ArrowUpRight size={16} /></button></div></div>
    </div>
    <span aria-label={locale === 'ar' ? 'المشهد 5 من 5' : 'Scene 5 of 5'} className="zx-scene-counter" dir="ltr">05 / 05</span>
  </>;
}
