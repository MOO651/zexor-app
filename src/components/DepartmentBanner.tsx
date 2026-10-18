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

export function DepartmentBanner({ locale, name, title, text, image, accent = 'var(--zx-mint)', slides = [], fallbackTitle, fallbackText, fallbackImage, tint = 'from-zx-cinematic via-zx-cinematic to-transparent' }: Props) {
  const isArabic = locale === 'ar';
  const reduceMotion = useReducedMotion();
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
        <motion.img key={`bg-${slideIndex}-${current.image}`} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" src={publicAssetUrl(current.image || fallbackImage)} initial={{ opacity: 1 }} animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: [1.02, 1.08, 1.02], x: [0, isArabic ? -8 : 8, 0] }} exit={{ opacity: 0 }} transition={{ duration: 1.1, ease: 'easeInOut' }} />
      </AnimatePresence>
      <div className={`absolute inset-0 bg-linear-to-r ${tint}`} style={{ backgroundImage: 'linear-gradient(to top, color-mix(in srgb, var(--zx-bg-cinematic) 25%, transparent), transparent 58%, color-mix(in srgb, var(--zx-footer-text) 10%, transparent))' }} />
      <motion.div aria-hidden="true" className="absolute -end-20 -top-28 h-44 w-44 rounded-full border border-zx-line sm:h-72 sm:w-72" animate={reduceMotion ? undefined : { rotate: 360 }} transition={{ duration: 50, repeat: Infinity, ease: 'linear' }} />
      <motion.div aria-hidden="true" className={`zx-banner-device pointer-events-none absolute ${isArabic ? 'start-[7%]' : 'end-[7%]'} top-[8%] block h-20 w-14 rounded-[1rem] border border-zx-line p-1 opacity-30 shadow-zx-card backdrop-blur-md sm:top-[12%] sm:h-40 sm:w-32 sm:rounded-[1.4rem] sm:p-2 sm:opacity-65 lg:h-52 lg:w-40 lg:opacity-100`} style={{ transformStyle: 'preserve-3d', perspective: 900 }} animate={reduceMotion ? undefined : { y: [0, -12, 0], rotateY: [-12, 5, -12], rotateX: [5, -3, 5], rotateZ: [-3, 2, -3] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}>
        <div className="zx-banner-device__surface relative h-full overflow-hidden rounded-[1.15rem] border border-zx-line" style={{ transform: 'translateZ(18px)' }}>
          <AnimatePresence mode="wait"><motion.img key={`card-${slideIndex}-${current.image}`} alt="" className="h-full w-full object-cover" src={publicAssetUrl(current.image || fallbackImage)} initial={{ opacity: 0, scale: 1.08, rotateY: isArabic ? -8 : 8 }} animate={{ opacity: 1, scale: 1, rotateY: 0 }} exit={{ opacity: 0, scale: .95, rotateY: isArabic ? 8 : -8 }} transition={{ duration: .65 }} /></AnimatePresence>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--zx-bg-cinematic), transparent 60%, color-mix(in srgb, var(--zx-footer-text) 10%, transparent))' }} />
          <div className="absolute inset-x-3 bottom-3 flex items-center justify-between text-zx-ink"><span className="text-[9px] font-semibold tracking-widest">{name}</span><Sparkles className="h-3.5 w-3.5" style={{ color: accent }} /></div>
        </div>
      </motion.div>
      <motion.div aria-hidden="true" className={`absolute ${isArabic ? 'start-[8%]' : 'end-[8%]'} bottom-[10%] block h-9 w-9 rounded-full border border-zx-line opacity-30 sm:h-16 sm:w-16 lg:h-28 lg:w-28 lg:opacity-100`} animate={reduceMotion ? undefined : { rotate: -360, scale: [1, 1.08, 1] }} transition={{ duration: 22, repeat: Infinity, ease: 'linear' }} />
      <div className={`relative z-10 flex min-h-[290px] max-w-2xl flex-col justify-center p-7 text-zx-ink sm:min-h-[360px] sm:p-12 ${isArabic ? 'ms-auto text-right' : 'me-auto text-left'}`}>
        <motion.p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.24em] text-zx-ink" initial={false} animate={reduceMotion ? undefined : { y: 0 }} transition={{ duration: .45 }}>
          <Sparkles className="h-4 w-4" style={{ color: accent }} /> {name}
        </motion.p>
        <motion.h1 className="zx-display mt-4 text-3xl font-semibold leading-tight sm:text-5xl" key={`${name}-${slideIndex}-title`} initial={false} animate={reduceMotion ? undefined : { y: 0, rotateX: 0 }} transition={{ duration: .55, delay: .08 }}>
          {current.title}
        </motion.h1>
        <motion.p className="mt-4 max-w-xl text-sm leading-7 text-zx-ink sm:text-base" key={`${name}-${slideIndex}-copy`} initial={false} animate={reduceMotion ? undefined : { y: 0 }} transition={{ duration: .6, delay: .18 }}>
          {current.text}
        </motion.p>
        <motion.button type="button" onClick={() => document.getElementById('department-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="mt-7 inline-flex w-fit items-center gap-2 rounded-full border border-zx-line bg-zx-elevated px-5 py-3 text-xs font-semibold backdrop-blur transition hover:bg-zx-elevated" style={{ boxShadow: 'var(--zx-glow)' }}>
          {isArabic ? 'اكتشف القسم' : 'Explore the collection'} <ArrowDown className="h-4 w-4" />
        </motion.button>
      </div>
      {activeSlides.length > 1 && <div className={`absolute bottom-5 z-20 flex items-center gap-2 ${isArabic ? 'start-7' : 'end-7'}`}>
        <button aria-label={isArabic ? 'الشريحة السابقة' : 'Previous slide'} className="flex h-11 w-11 items-center justify-center rounded-full border border-zx-line bg-zx-cinematic text-zx-ink backdrop-blur hover:bg-zx-elevated" onClick={() => setActiveSlide((activeSlide - 1 + activeSlides.length) % activeSlides.length)} type="button"><BackArrow className="h-4 w-4" /></button>
        {activeSlides.map((slide, index) => <button aria-label={isArabic ? `عرض الشريحة ${index + 1}` : `Show slide ${index + 1}`} aria-pressed={index === slideIndex} className="flex h-11 min-w-11 items-center justify-center rounded-full" key={`dot-${index}-${slide.title}`} onClick={() => setActiveSlide(index)} type="button"><span aria-hidden="true" className={`h-1.5 rounded-full transition-all ${index === slideIndex ? 'w-7 bg-zx-elevated' : 'w-2 bg-zx-elevated'}`} /></button>)}
        <button aria-label={isArabic ? 'الشريحة التالية' : 'Next slide'} className="flex h-11 w-11 items-center justify-center rounded-full border border-zx-line bg-zx-cinematic text-zx-ink backdrop-blur hover:bg-zx-elevated" onClick={() => setActiveSlide((activeSlide + 1) % activeSlides.length)} type="button"><NextArrow className="h-4 w-4" /></button>
      </div>
      }
    </section>
  );
}
