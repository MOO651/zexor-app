import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Locale } from '../types';
import { publicAssetUrl } from '../utils';

type Props = {
  locale: Locale;
  name: string;
  title?: string;
  text?: string;
  image?: string;
  accent?: string;
  slides?: { title: string; text: string; image?: string }[];
  fallbackTitle: string;
  fallbackText: string;
  fallbackImage: string;
  tint?: string;
};

export function DepartmentBanner({ locale, name, title, text, image, accent = 'var(--zx-mint)', slides = [], fallbackTitle, fallbackText, fallbackImage, tint = 'from-zx-cinematic/90 via-zx-cinematic/50 to-transparent' }: Props) {
  const isArabic = locale === 'ar';
  const reduceMotion = useReducedMotion();
  const safeAccent = accent === 'var(--zx-accent)' ? 'var(--zx-accent)' : 'var(--zx-mint)';
  const activeSlides = slides.length ? slides : [{ title: title || fallbackTitle, text: text || fallbackText, image: image || fallbackImage }];
  const [activeSlide, setActiveSlide] = useState(0);
  useEffect(() => {
    if (activeSlides.length < 2 || reduceMotion) return;
    const timer = window.setInterval(() => setActiveSlide((current) => (current + 1) % activeSlides.length), 6000);
    return () => window.clearInterval(timer);
  }, [activeSlides.length, reduceMotion]);
  const slideIndex = activeSlide % activeSlides.length;
  const current = activeSlides[slideIndex];
  const BackArrow = isArabic ? ArrowRight : ArrowLeft;
  const NextArrow = isArabic ? ArrowLeft : ArrowRight;
  return (
    <section className="zx-department-banner relative isolate min-h-[290px] overflow-hidden rounded-[2rem] bg-zx-cinematic shadow-zx-card sm:min-h-[360px]">
      <AnimatePresence mode="sync">
        <motion.img key={`bg-${slideIndex}-${current.image}`} alt="" aria-hidden="true" className="zx-department-banner-image absolute inset-0 h-full w-full object-cover" src={publicAssetUrl(current.image || fallbackImage)} initial={reduceMotion ? undefined : { opacity: 0, scale: 1.08, x: isArabic ? 24 : -24 }} animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: [1.02, 1.08, 1.02], x: [0, isArabic ? -8 : 8, 0] }} exit={reduceMotion ? undefined : { opacity: 0, scale: 1.03 }} transition={{ duration: 1.1, ease: 'easeInOut' }} />
      </AnimatePresence>
      <div className={`zx-department-banner-scrim absolute inset-0 bg-linear-to-r ${tint}`} />
      <motion.div aria-hidden="true" className="absolute -end-20 -top-28 h-44 w-44 rounded-full border border-zx-border/15 sm:h-72 sm:w-72" animate={reduceMotion ? undefined : { rotate: 360 }} transition={{ duration: 50, repeat: Infinity, ease: 'linear' }} />
      <motion.div aria-hidden="true" className={`pointer-events-none absolute ${isArabic ? 'start-[7%]' : 'end-[7%]'} top-[8%] block h-20 w-14 rounded-[1rem] border border-zx-border/50 bg-zx-surface-raised/10 p-1 opacity-30 shadow-zx-card backdrop-blur-md sm:top-[12%] sm:h-40 sm:w-32 sm:rounded-[1.4rem] sm:p-2 sm:opacity-65 lg:h-52 lg:w-40 lg:opacity-100`} style={{ transformStyle: 'preserve-3d', perspective: 900 }} animate={reduceMotion ? undefined : { y: [0, -12, 0], rotateY: [-12, 5, -12], rotateX: [5, -3, 5], rotateZ: [-3, 2, -3] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}>
        <div className="relative h-full overflow-hidden rounded-[1.15rem] border border-zx-border/45 bg-zx-mint" style={{ transform: 'translateZ(18px)' }}>
          <AnimatePresence mode="wait"><motion.img key={`card-${slideIndex}-${current.image}`} alt="" className="h-full w-full object-cover" src={publicAssetUrl(current.image || fallbackImage)} initial={{ opacity: 0, scale: 1.08, rotateY: isArabic ? -8 : 8 }} animate={{ opacity: 1, scale: 1, rotateY: 0 }} exit={{ opacity: 0, scale: .95, rotateY: isArabic ? 8 : -8 }} transition={{ duration: .65 }} /></AnimatePresence>
          <div className="absolute inset-0 bg-linear-to-t from-zx-cinematic/80 via-transparent to-zx-surface-raised/10" />
          <div className="absolute inset-x-3 bottom-3 flex items-center justify-between text-zx-accent-contrast"><span className="text-[9px] font-semibold tracking-widest">{name}</span><Sparkles className="h-3.5 w-3.5" style={{ color: safeAccent }} /></div>
        </div>
      </motion.div>
      <motion.div aria-hidden="true" className={`absolute ${isArabic ? 'start-[8%]' : 'end-[8%]'} bottom-[10%] block h-9 w-9 rounded-full border border-zx-border/30 opacity-30 sm:h-16 sm:w-16 lg:h-28 lg:w-28 lg:opacity-100`} animate={reduceMotion ? undefined : { rotate: -360, scale: [1, 1.08, 1] }} transition={{ duration: 22, repeat: Infinity, ease: 'linear' }} />
      <div className={`zx-department-banner-content relative z-10 flex min-h-[290px] max-w-2xl flex-col justify-center p-7 text-zx-accent-contrast sm:min-h-[360px] sm:p-12 ${isArabic ? 'ms-auto text-right' : 'me-auto text-left'}`}>
        <motion.p className="zx-department-banner-eyebrow flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.24em] text-zx-accent-contrast/75" initial={reduceMotion ? undefined : { opacity: 0, y: 12 }} animate={reduceMotion ? undefined : { opacity: 1, y: 0 }} transition={{ duration: .45 }}>
          <Sparkles className="h-4 w-4" style={{ color: safeAccent }} /> {name}
        </motion.p>
        <motion.h1 className="zx-department-banner-title zx-display mt-4 text-3xl font-semibold leading-tight sm:text-5xl" key={`${name}-${slideIndex}-title`} initial={reduceMotion ? undefined : { opacity: 0, y: 18, rotateX: -8 }} animate={reduceMotion ? undefined : { opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: .55, delay: .08 }}>
          {current.title}
        </motion.h1>
        <motion.p className="zx-department-banner-description mt-4 max-w-xl text-sm leading-7 text-zx-accent-contrast/80 sm:text-base" key={`${name}-${slideIndex}-copy`} initial={reduceMotion ? undefined : { opacity: 0, y: 10 }} animate={reduceMotion ? undefined : { opacity: 1, y: 0 }} transition={{ duration: .6, delay: .18 }}>
          {current.text}
        </motion.p>
        <motion.button type="button" onClick={() => document.getElementById('department-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="zx-department-banner-action mt-7 inline-flex w-fit items-center gap-2 rounded-full border border-zx-border/25 bg-zx-surface-raised/10 px-5 py-3 text-xs font-semibold backdrop-blur transition hover:bg-zx-surface-raised/20" style={{ boxShadow: `inset 0 0 0 1px ${accent}22` }}>
          {isArabic ? 'اكتشف القسم' : 'Explore the collection'} <ArrowDown className="h-4 w-4" />
        </motion.button>
      </div>
      {activeSlides.length > 1 && <div className={`zx-department-banner-controls absolute bottom-5 z-20 flex items-center gap-2 ${isArabic ? 'start-7' : 'end-7'}`}>
        <button aria-label={isArabic ? 'الشريحة السابقة' : 'Previous slide'} className="flex h-8 w-8 items-center justify-center rounded-full border border-zx-border/30 bg-zx-cinematic/20 text-zx-accent-contrast backdrop-blur hover:bg-zx-surface-raised/20" onClick={() => setActiveSlide((activeSlide - 1 + activeSlides.length) % activeSlides.length)} type="button"><BackArrow className="h-4 w-4" /></button>
        {activeSlides.map((slide, index) => <button aria-label={isArabic ? `عرض الشريحة ${index + 1}` : `Show slide ${index + 1}`} aria-pressed={index === slideIndex} className={`h-1.5 rounded-full transition-all ${index === slideIndex ? 'w-7 bg-zx-surface-raised' : 'w-2 bg-zx-surface-raised/50'}`} key={`dot-${index}-${slide.title}`} onClick={() => setActiveSlide(index)} type="button" />)}
        <button aria-label={isArabic ? 'الشريحة التالية' : 'Next slide'} className="flex h-8 w-8 items-center justify-center rounded-full border border-zx-border/30 bg-zx-cinematic/20 text-zx-accent-contrast backdrop-blur hover:bg-zx-surface-raised/20" onClick={() => setActiveSlide((activeSlide + 1) % activeSlides.length)} type="button"><NextArrow className="h-4 w-4" /></button>
      </div>
      }
    </section>
  );
}
