import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { useEffect, useState, type PointerEvent, type ReactNode } from 'react';
import { PORTALS } from '../data/portals';
import type { Locale, Market, Route } from '../types';
import { publicAssetUrl } from '../utils';

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
  brandName: string;
  market: Market;
  onMarketChange: (m: Market) => void;
  navigate: (r: Route) => void;
  heroTitle: string;
  heroAccent: string;
  heroText: string;
  /** Optional admin-set hero background image (data-url or /images path). */
  heroImage?: string;
  departmentNames?: Partial<Record<'cards' | 'fashion' | 'services' | 'cars' | 'property', string>>;
  departmentCount?: number;
};

export function HomeHero({
  locale,
  brandName,
  market,
  onMarketChange,
  navigate,
  heroTitle,
  heroAccent,
  heroText,
  heroImage,
  departmentNames,
}: Props) {
  const isArabic = locale === 'ar';
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const departments = PORTALS.map((portal) => ({
    ...portal,
    name: departmentNames?.[portal.route as keyof NonNullable<Props['departmentNames']>] ?? portal.title[locale],
  }));
  const active = departments[activeIndex] ?? departments[0];
  const PreviousIcon = isArabic ? ArrowRight : ArrowLeft;
  const NextIcon = isArabic ? ArrowLeft : ArrowRight;
  const slideCopy = [
    { title: heroTitle, accent: heroAccent, text: heroText },
    {
      title: isArabic ? 'تفاصيل يومية،' : 'Made for the everyday.',
      accent: isArabic ? 'بطابع مختلف.' : 'Never ordinary.',
      text: activeIndex === 1 ? active.tagline[locale] : '',
    },
    {
      title: isArabic ? 'حضورك الرقمي،' : 'Your next idea,',
      accent: isArabic ? 'يبدأ من هنا.' : 'made real.',
      text: activeIndex === 2 ? active.tagline[locale] : '',
    },
    {
      title: isArabic ? 'مشوارك القادم،' : 'A better way',
      accent: isArabic ? 'على اختيارك.' : 'to get there.',
      text: activeIndex === 3 ? active.tagline[locale] : '',
    },
    {
      title: isArabic ? 'مساحة تناسب' : 'Space for',
      accent: isArabic ? 'خطوتك القادمة.' : 'what comes next.',
      text: activeIndex === 4 ? active.tagline[locale] : '',
    },
  ];
  const copy = slideCopy[activeIndex] ?? slideCopy[0];

  useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setInterval(() => setActiveIndex((index) => (index + 1) % departments.length), 6500);
    return () => window.clearInterval(timer);
  }, [departments.length, reduceMotion]);

  const step = (direction: number) => {
    setActiveIndex((index) => (index + direction + departments.length) % departments.length);
  };

  return (
    <section className="zx-home-hero zx-home-hero--showroom relative overflow-hidden rounded-[2rem] border text-[#222923]">
      <div className="zx-hero-inner relative flex flex-col">
        <div className="zx-hero-head relative z-20 flex items-center justify-between gap-4">
          <div>
            <p className="zx-hero-topline text-[9px] font-bold tracking-[.18em] sm:text-[10px]">
              {brandName} <span aria-hidden="true" className="mx-1.5 opacity-40">/</span>
              {isArabic ? 'اختيارات للحياة اليومية' : 'A HOUSE OF CONSIDERED CHOICES'}
            </p>
            <p className="mt-1 text-[9px] text-[#829087]">
              {isArabic ? 'مصر والسعودية' : 'EGYPT & SAUDI ARABIA'}
            </p>
          </div>
          <div className="zx-hero-market flex items-center gap-1 rounded-full border p-1">
            {(['eg', 'ksa'] as const).map((option) => (
              <button
                aria-pressed={market === option}
                className={`rounded-full px-3 py-1.5 text-[9px] font-bold transition ${market === option ? 'bg-[#244b38] text-white' : 'text-[#617267] hover:bg-white/70'}`}
                key={option}
                onClick={() => onMarketChange(option)}
                type="button"
              >
                {option === 'eg' ? '🇪🇬' : '🇸🇦'} {option === 'eg' ? (isArabic ? 'مصر' : 'Egypt') : (isArabic ? 'السعودية' : 'KSA')}
              </button>
            ))}
          </div>
        </div>

        <div className="zx-hero-stage relative z-10 grid flex-1 items-stretch">
          <div className="zx-hero-copy relative z-10 flex flex-col justify-center">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                initial={{ opacity: 0, y: 14 }}
                key={active.route}
                transition={{ duration: reduceMotion ? 0.01 : 0.42, ease: 'easeOut' }}
              >
                <span className="zx-hero-badge inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[9px] font-bold tracking-widest">
                  <Sparkles className="h-3.5 w-3.5" />
                  {active.meta[locale]}
                </span>
                <h1 className="zx-display zx-hero-title mt-5">
                {copy.title}{' '}
                  <span className="zx-hero-accent">{copy.accent}</span>
                </h1>
                <p className="zx-hero-description mt-5 max-w-lg text-sm sm:text-base">
                  {activeIndex === 0 ? copy.text : active.tagline[locale]}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                className="zx-hero-primary group inline-flex min-h-12 items-center gap-2.5 px-6 text-xs font-bold transition"
                onClick={() => navigate(active.route)}
                type="button"
              >
                {isArabic ? `اكتشف ${active.name}` : `Explore ${active.name}`}
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </button>
              <span className="zx-hero-slide-count text-[10px] font-semibold tabular-nums">
                {String(activeIndex + 1).padStart(2, '0')} <span className="opacity-40">/</span> {String(departments.length).padStart(2, '0')}
              </span>
            </div>

            <div className="zx-hero-controls mt-8 flex items-center gap-2">
              <button aria-label={isArabic ? 'القسم السابق' : 'Previous department'} className="zx-hero-arrow" onClick={() => step(-1)} type="button"><PreviousIcon className="h-4 w-4" /></button>
              <div className="flex items-center gap-1.5" role="tablist" aria-label={isArabic ? 'اختيار القسم' : 'Choose a department'}>
                {departments.map((department, index) => (
                  <button
                    aria-label={department.name}
                    aria-selected={activeIndex === index}
                    className={`zx-hero-dot ${activeIndex === index ? 'is-active' : ''}`}
                    key={department.route}
                    onClick={() => setActiveIndex(index)}
                    role="tab"
                    type="button"
                  />
                ))}
              </div>
              <button aria-label={isArabic ? 'القسم التالي' : 'Next department'} className="zx-hero-arrow" onClick={() => step(1)} type="button"><NextIcon className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="zx-hero-visual relative isolate overflow-hidden">
            <AnimatePresence mode="sync" initial={false}>
              <motion.img
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover"
                key={`${active.route}-${activeIndex === 0 ? heroImage : ''}`}
                src={publicAssetUrl(activeIndex === 0 && heroImage ? heroImage : active.image)}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.025 }}
                transition={{ duration: reduceMotion ? 0.01 : 0.75, ease: 'easeOut' }}
              />
            </AnimatePresence>
            <span aria-hidden="true" className="zx-hero-image-shade absolute inset-0" />
            <span className="zx-hero-image-index absolute start-5 top-5 font-mono text-[10px] font-semibold tracking-[.18em] text-white/75">
              Z / {String(activeIndex + 1).padStart(2, '0')}
            </span>
            <div className="zx-hero-image-caption absolute inset-x-4 bottom-4 flex items-end justify-between gap-4 rounded-2xl border border-white/20 p-4 text-white backdrop-blur-xl sm:inset-x-6 sm:bottom-6 sm:p-5">
              <div>
                <span className="block text-[8px] font-bold tracking-[.2em] text-white/65">{brandName.toUpperCase()}</span>
                <span className="zx-display mt-1 block text-xl sm:text-2xl">{active.name}</span>
              </div>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10">
                <active.icon className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>

        <nav aria-label={isArabic ? 'أقسام ZEXOR' : 'ZEXOR departments'} className="zx-hero-departments relative z-20 grid grid-cols-2 border-t pt-4 sm:grid-cols-3 lg:grid-cols-5">
          {departments.map((department, index) => {
            const Icon = department.icon;
            return (
              <button
                aria-current={activeIndex === index ? 'true' : undefined}
                className={`zx-hero-department ${activeIndex === index ? 'is-active' : ''}`}
                key={department.route}
                onClick={() => setActiveIndex(index)}
                type="button"
              >
                <span className="zx-hero-department-number">0{index + 1}</span>
                <Icon className="h-4 w-4 shrink-0" />
                <span className="min-w-0 truncate">{department.name}</span>
                <ArrowUpRight className="zx-hero-department-arrow ms-auto h-3.5 w-3.5 shrink-0" />
              </button>
            );
          })}
        </nav>
      </div>
    </section>
  );
}
