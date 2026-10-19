import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Compass, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Locale, Route } from '../types';

type PreloaderProps = { locale: Locale; enabled: boolean };

export function SitePreloader({ locale, enabled }: PreloaderProps) {
  const isArabic = locale === 'ar';
  const reduceMotion = useReducedMotion() ?? false;
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!enabled || reduceMotion) {
      const timeout = window.setTimeout(() => setVisible(false), 0);
      return () => window.clearTimeout(timeout);
    }
    let alreadySeen = false;
    try {
      alreadySeen = sessionStorage.getItem('zexor-preloader-seen') === '1';
    } catch (error) {
      console.warn('Session storage is unavailable; the ZEXOR preloader will only run for this mount.', error);
    }
    if (!started.current && alreadySeen) return;
    if (!started.current) {
      started.current = true;
      try {
        sessionStorage.setItem('zexor-preloader-seen', '1');
      } catch (error) {
        console.warn('Could not remember the ZEXOR preloader state for this session.', error);
      }
      setVisible(true);
    }
    const start = performance.now();
    const interval = window.setInterval(() => {
      setProgress(Math.min(100, Math.round(((performance.now() - start) / 1500) * 100)));
    }, 32);
    const timeout = window.setTimeout(() => {
      window.clearInterval(interval);
      setProgress(100);
      setVisible(false);
    }, 1500);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [enabled, reduceMotion]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          animate={{ opacity: 1 }}
          aria-label={isArabic ? 'جارٍ تجهيز تجربة زكسور' : 'Preparing the ZEXOR experience'}
          className="pointer-events-none fixed inset-0 z-[10000] grid place-items-center bg-zx-cinematic text-zx-accent-contrast"
          exit={{ clipPath: 'inset(0 0 100% 0)', transition: { duration: 0.45, ease: [0.76, 0, 0.24, 1] } }}
          initial={{ opacity: 0 }}
          role="status"
          transition={{ duration: 0.25 }}
        >
          <div className="text-center">
            <motion.p
              animate={{ opacity: 1, y: 0 }}
              className="zx-display flex justify-center text-5xl font-semibold tracking-[0.28em]"
              initial={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.35 }}
              dir="ltr"
            >
              {'ZEXOR'.split('').map((letter, index) => (
                <span
                  className={progress >= (index + 1) * 20 ? 'text-zx-accent-contrast' : 'text-zx-accent-contrast/25'}
                  key={letter}
                  style={{ transition: 'color 160ms ease-out' }}
                >
                  {letter}
                </span>
              ))}
            </motion.p>
            <p className="mt-3 text-[10px] font-semibold tracking-[0.24em] text-zx-accent-contrast/75">
              {isArabic ? 'تصميم · تقنية · ثقافة' : 'DESIGN · TECHNOLOGY · CULTURE'}
            </p>
            <p aria-hidden="true" className="mt-5 text-xs tabular-nums text-zx-accent-contrast/75" dir="ltr">
              {String(progress).padStart(3, '0')}%
            </p>
            <span aria-hidden="true" className="mx-auto mt-2 block h-px w-32 overflow-hidden bg-zx-accent-contrast/20">
              <span className="block h-full origin-left bg-zx-accent-contrast" style={{ transform: `scaleX(${progress / 100})` }} />
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const INTERESTS: Array<{ route: Route; ar: string; en: string }> = [
  { route: 'cards', ar: 'بطاقات NFC وهوية رقمية', en: 'NFC cards and digital identity' },
  { route: 'fashion', ar: 'أزياء وستريت وير', en: 'Fashion and streetwear' },
  { route: 'services', ar: 'موقع أو مشروع رقمي', en: 'A website or digital project' },
  { route: 'cars', ar: 'سيارات', en: 'Vehicles' },
  { route: 'property', ar: 'عقارات', en: 'Property' },
];

export function ProductFinderQuiz({
  locale,
  onNavigate,
}: {
  locale: Locale;
  onNavigate: (route: Route) => void;
}) {
  const isArabic = locale === 'ar';
  const [route, setRoute] = useState<Route | null>(null);
  const [intent, setIntent] = useState<'shop' | 'explore' | null>(null);
  const interest = INTERESTS.find((item) => item.route === route);

  return (
    <section
      aria-labelledby="zx-finder-title"
      className="rounded-3xl border border-zx-border bg-zx-feature-band p-5 sm:p-8"
    >
      <div className="mx-auto max-w-3xl">
        <p className="zx-eyebrow text-zx-text">
          <Compass aria-hidden="true" className="me-1 inline h-4 w-4" />
          {isArabic ? 'مساعد الاختيار' : 'THE ZEXOR FINDER'}
        </p>
        <h2 className="zx-display mt-2 text-2xl font-semibold text-zx-text sm:text-3xl" id="zx-finder-title">
          {isArabic ? 'مش عارف تبدأ منين؟' : 'Not sure where to start?'}
        </h2>
        {!route ? (
          <fieldset className="mt-5">
            <legend className="text-sm font-semibold text-zx-text">
              {isArabic ? 'إيه أكتر حاجة بتدور عليها؟' : 'What are you looking for?'}
            </legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {INTERESTS.map((option) => (
                <button
                  className="min-h-12 rounded-xl border border-zx-border bg-zx-surface px-4 text-start text-sm font-medium text-zx-text transition hover:border-zx-accent"
                  key={option.route}
                  onClick={() => setRoute(option.route)}
                  type="button"
                >
                  {isArabic ? option.ar : option.en}
                </button>
              ))}
            </div>
          </fieldset>
        ) : !intent ? (
          <fieldset className="mt-5">
            <legend className="text-sm font-semibold text-zx-text">
              {isArabic ? `تمام، ${interest?.ar}. تحب تعمل إيه؟` : `Great, ${interest?.en}. What would you like to do?`}
            </legend>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                className="min-h-12 rounded-full bg-zx-cinematic px-5 text-sm font-semibold text-zx-accent-contrast"
                onClick={() => setIntent('shop')}
                type="button"
              >
                {isArabic ? 'أشوف الاختيارات المتاحة' : 'See what is available'}
              </button>
              <button
                className="min-h-12 rounded-full border border-zx-border bg-zx-surface px-5 text-sm font-semibold text-zx-text"
                onClick={() => setIntent('explore')}
                type="button"
              >
                {isArabic ? 'أستكشف الأول' : 'Explore first'}
              </button>
            </div>
          </fieldset>
        ) : (
          <div className="mt-5 rounded-2xl bg-zx-surface p-4 sm:p-5" role="status">
            <p className="text-sm font-medium text-zx-text">
              <Sparkles aria-hidden="true" className="me-1 inline h-4 w-4" />
              {isArabic ? `ابدأ من ${interest?.ar}.` : `Start with ${interest?.en}.`}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                className="min-h-12 rounded-full bg-zx-cinematic px-5 text-sm font-semibold text-zx-accent-contrast"
                onClick={() => route && onNavigate(route)}
                type="button"
              >
                {isArabic ? intent === 'shop' ? 'روح للاختيارات' : 'استكشف القسم' : intent === 'shop' ? 'Browse options' : 'Explore the section'}
                <ArrowRight aria-hidden="true" className="ms-2 inline h-4 w-4" />
              </button>
              <button
                className="min-h-12 rounded-full border border-zx-border px-4 text-sm font-semibold text-zx-text"
                onClick={() => { setRoute(null); setIntent(null); }}
                type="button"
              >
                {isArabic ? 'ابدأ من جديد' : 'Start again'}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
