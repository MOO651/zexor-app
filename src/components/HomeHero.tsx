import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';
import {
  ArrowDown,
  ArrowUpRight,
  Fingerprint,
  Radio,
  Sparkles,
} from 'lucide-react';
import type { PointerEvent, ReactNode } from 'react';
import type { Locale, Market, Route } from '../types';

export function TiltCard({
  children,
  className = '',
  intensity = 12,
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
}) {
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [intensity, -intensity]), {
    stiffness: 160,
    damping: 18,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-intensity, intensity]), {
    stiffness: 160,
    damping: 18,
  });

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left) / rect.width - 0.5);
    y.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className={className}
      onPointerLeave={reset}
      onPointerMove={handleMove}
      style={{
        rotateX: reduceMotion ? 0 : rotateX,
        rotateY: reduceMotion ? 0 : rotateY,
        transformStyle: 'preserve-3d',
      }}
      transition={{ type: 'spring', stiffness: 140, damping: 18 }}
      whileHover={reduceMotion ? undefined : { scale: 1.02 }}
    >
      {children}
    </motion.div>
  );
}

type Props = {
  locale: Locale;
  market: Market;
  onMarketChange: (m: Market) => void;
  navigate: (r: Route) => void;
  heroTitle: string;
  heroAccent: string;
  heroText: string;
};

/** Rotating advertising headline words for the animated hero ticker. */
const HERO_TICKER: Record<Locale, string[]> = {
  en: ['CONNECTED IDENTITY', 'ATELIER', 'DIGITAL STUDIO', 'VEHICLES', 'REAL ESTATE'],
  ar: ['هوية متصلة', 'أتيليه', 'استوديو رقمي', 'سيارات', 'عقارات'],
};

export function HomeHero({
  locale,
  market,
  onMarketChange,
  navigate,
  heroTitle,
  heroAccent,
  heroText,
}: Props) {
  const isArabic = locale === 'ar';
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const smoothX = useSpring(pointerX, { stiffness: 65, damping: 20 });
  const smoothY = useSpring(pointerY, { stiffness: 65, damping: 20 });

  const fashionX = useTransform(smoothX, [0, 1], [-28, 28]);
  const fashionY = useTransform(smoothY, [0, 1], [22, -22]);
  const cardX = useTransform(smoothX, [0, 1], [24, -24]);
  const cardY = useTransform(smoothY, [0, 1], [-18, 18]);
  const sceneScale = useTransform(smoothX, [0, 1], [1.01, 1.05]);
  const cardTilt = useTransform(smoothX, [0, 1], [-5, 5]);
  const studioTilt = useTransform(smoothX, [0, 1], [4, -4]);
  // Derived ranges must be declared unconditionally at the top level — calling
  // useTransform inline in JSX would break the Rules of Hooks.
  const studioX = useTransform(fashionX, (v) => -v * 0.6);
  const studioY = useTransform(cardY, (v) => -v);

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set(Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width)));
    pointerY.set(Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height)));
  };

  const resetPointer = () => {
    pointerX.set(0.5);
    pointerY.set(0.5);
  };

  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-white/90 bg-[#f9f8f3] text-[#222923] shadow-xl sm:rounded-[3rem]">
      {/* 3D Atmospheric Radial Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_35%,rgba(224,180,157,.32),transparent_40%),radial-gradient(ellipse_at_20%_72%,rgba(142,213,195,.28),transparent_38%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20 bg-[radial-gradient(rgba(71,99,85,.3)_1px,transparent_1px)] bg-size-[28px_28px]"
      />

      <div
        className="relative flex min-h-[82vh] flex-col justify-between p-6 sm:p-10 lg:p-12"
        onPointerLeave={resetPointer}
        onPointerMove={handlePointerMove}
      >
        {/* Top Tagline */}
        <div className="relative z-20 flex items-center justify-between gap-3">
          <p className="text-[9px] font-bold tracking-[0.24em] text-[#69746c] sm:text-[10px]">
            ZEXOR · CONNECTED IDENTITY · ATELIER · STUDIO
          </p>
          <div className="flex items-center gap-2">
            <button
              className={`rounded-full px-2.5 py-1 text-[9px] font-bold transition-all ${
                market === 'eg' ? 'bg-[#263b31] text-white shadow-xs' : 'bg-white/80 text-[#607367]'
              }`}
              onClick={() => onMarketChange('eg')}
              type="button"
            >
              🇪🇬 {isArabic ? 'مصر' : 'Egypt'}
            </button>
            <button
              className={`rounded-full px-2.5 py-1 text-[9px] font-bold transition-all ${
                market === 'ksa' ? 'bg-[#263b31] text-white shadow-xs' : 'bg-white/80 text-[#607367]'
              }`}
              onClick={() => onMarketChange('ksa')}
              type="button"
            >
              🇸🇦 {isArabic ? 'السعودية' : 'KSA'}
            </button>
          </div>
        </div>

        {/* 3D Center Area: Left Typography, Right Interactive Parallax 3D Stack */}
        <div className="relative z-20 my-auto grid items-center gap-8 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          {/* Typography */}
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/60 px-3.5 py-1.5 text-[9px] font-bold tracking-widest text-[#567a68] shadow-xs backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-[#5e967c]" />
              {isArabic ? 'العلامة المتصلة للخطوة القادمة' : 'A CONNECTED BRAND FOR WHAT’S NEXT'}
            </span>

            <h1 className="zx-display mt-5 text-4xl text-[#1c2f25] sm:text-6xl md:text-7xl">
              {heroTitle}{' '}
              <span className="italic font-normal text-[#ba7f6d]">{heroAccent}</span>
            </h1>

            <p className="mt-5 max-w-lg text-sm leading-7 text-[#607166] sm:text-base">
              {heroText}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                className="group flex min-h-12 items-center gap-2.5 rounded-full bg-[#16241d] px-6 text-xs font-bold text-white shadow-lg transition-all duration-300 hover:scale-[1.03] hover:bg-[#b97561]"
                onClick={() => navigate('cards')}
                type="button"
              >
                <span>{isArabic ? 'اكتشف بطاقات NFC' : 'Explore NFC Cards'}</span>
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </button>

              <button
                className="flex min-h-12 items-center gap-2 rounded-full border border-[#d2dfd7] bg-white/80 px-5 text-xs font-bold text-[#355243] shadow-xs backdrop-blur-md transition-all hover:bg-white"
                onClick={() => navigate('cars')}
                type="button"
              >
                <span>{isArabic ? 'معرض السيارات والعقارات' : 'Vehicles & Real Estate'}</span>
              </button>
            </div>
          </div>

          {/* Right 3D Visual Floating Composition */}
          <div className="relative -mx-2 grid min-h-84 flex-1 grid-cols-[1.05fr_0.95fr] gap-3 sm:min-h-104 sm:gap-4 lg:mx-0 lg:min-h-130">
            {/* 1. Atelier Fashion Card */}
            <motion.button
              aria-label="Atelier"
              className="group relative min-h-80 overflow-hidden rounded-3xl bg-[#dedbd1] text-start shadow-[0_35px_80px_-35px_rgba(45,38,30,.45)] sm:min-h-100 sm:rounded-4xl"
              onClick={() => navigate('fashion')}
              style={{ x: fashionX, y: fashionY, scale: sceneScale }}
              type="button"
            >
              <img
                alt="Atelier"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                src="/images/streetwear-collection.jpg"
              />
              <span aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent" />
              <span className="absolute start-4 top-4 rounded-full border border-white/50 bg-white/20 px-3 py-1.5 text-[8px] font-bold text-white backdrop-blur-md">
                01 / {isArabic ? 'أزياء مصر' : 'APPAREL'}
              </span>
              <span className="absolute inset-x-4 bottom-4 text-white">
                <span className="block text-[8px] tracking-wider text-white/70">ZEXOR ATELIER</span>
                <span className="mt-1 block text-lg font-bold leading-tight sm:text-xl">
                  {isArabic ? 'هودي وستريت وير فاخر' : 'After Hours Streetwear'}
                </span>
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/20 px-3 py-1 text-[8px] font-semibold backdrop-blur-md">
                  {isArabic ? 'إصدار محدود' : 'Limited Drop'}
                  <ArrowUpRight className="h-3 w-3" />
                </span>
              </span>
            </motion.button>

            {/* Right Column Stack: NFC 3D Card + Studio 3D Card */}
            <div className="grid min-h-80 grid-rows-2 gap-3 sm:min-h-100 sm:gap-4">
              {/* 2. Interactive 3D NFC Card */}
              <motion.button
                aria-label="NFC Card"
                className="group relative min-h-0 overflow-hidden rounded-2xl border border-white/90 bg-[#e4ece4] text-start shadow-[0_25px_60px_-30px_rgba(35,55,42,.4)] sm:rounded-3xl"
                onClick={() => navigate('cards')}
                style={{ x: cardX, y: cardY, rotate: cardTilt }}
                type="button"
              >
                <img
                  alt="NFC"
                  className="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
                  src="/images/nfc-card.jpg"
                />
                <span aria-hidden="true" className="absolute inset-0 bg-linear-to-br from-[#d4f0e4]/80 via-[#f8f6ed]/70 to-[#e4cebe]/80" />

                <span className="absolute inset-3 flex flex-col justify-between rounded-xl border border-white/70 p-3 sm:rounded-2xl sm:p-4">
                  <span className="flex items-start justify-between">
                    <div>
                      <span className="block text-[9px] font-extrabold tracking-[0.26em] text-[#2c4234]">ZEXOR</span>
                      <span className="text-[7px] text-[#697d70]">SMART NFC PASS</span>
                    </div>
                    <Radio className="h-4 w-4 text-[#59836d]" />
                  </span>
                  <span className="flex items-end justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 text-[#4c7e65] shadow-xs">
                      <Fingerprint className="h-5 w-5" strokeWidth={1.4} />
                    </span>
                    <span className="text-end">
                      <span className="block text-[7px] text-[#74877b]">YOUR PROFILE</span>
                      <span className="block text-xs font-bold text-[#2b4134]">
                        {isArabic ? 'لمسة واحدة.' : 'One tap.'}
                      </span>
                    </span>
                  </span>
                </span>
                <span className="absolute start-3 bottom-3 rounded-full bg-[#294234]/90 px-2.5 py-1 text-[7px] font-bold text-white">
                  02 · {isArabic ? 'بطاقات NFC' : 'NFC CARDS'}
                </span>
              </motion.button>

              {/* 3. Studio 3D Card */}
              <motion.button
                aria-label="Digital Studio"
                className="group relative min-h-0 overflow-hidden rounded-2xl border border-white/85 bg-[#203129] text-start shadow-[0_25px_60px_-30px_rgba(25,45,35,.4)] sm:rounded-3xl"
                onClick={() => navigate('services')}
                style={{ x: studioX, y: studioY, rotate: studioTilt }}
                type="button"
              >
                <img
                  alt="Studio"
                  className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105"
                  src="/images/digital-studio.jpg"
                />
                <span aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-[#121c17]/90 via-[#121c17]/30 to-transparent" />
                <span className="absolute inset-x-3 bottom-3 flex items-end justify-between text-white sm:inset-x-4 sm:bottom-4">
                  <div>
                    <span className="block text-[7px] font-bold tracking-widest text-white/75">03 · STUDIO</span>
                    <span className="mt-0.5 block text-xs font-bold sm:text-sm">
                      {isArabic ? 'مواقع وتطبيقات ومتاجر' : 'Web & App Studio'}
                    </span>
                  </div>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Bottom Prompts */}
        <div className="relative z-20 flex flex-col gap-3 border-t border-black/5 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="zx-marquee zx-no-bar overflow-hidden">
            <div className="zx-marquee-track">
              {[...HERO_TICKER[locale], ...HERO_TICKER[locale], ...HERO_TICKER[locale], ...HERO_TICKER[locale]].map(
                (word, i) => (
                  <span
                    className="zx-eyebrow mx-4 inline-flex items-center gap-3 text-[#748278]"
                    key={`${word}-${i}`}
                  >
                    {word}
                    <span className="h-1 w-1 rounded-full bg-[#a6e6c4]" />
                  </span>
                ),
              )}
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 text-[9px] font-bold text-[#748278]">
            <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
            {isArabic ? 'مرّر لاستعراض الأقسام' : 'SCROLL TO EXPLORE'}
          </span>
        </div>
      </div>
    </section>
  );
}
