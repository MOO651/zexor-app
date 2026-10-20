import { useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpLeft, ArrowUpRight, Compass, Sparkles } from 'lucide-react';
import type { Locale } from '../types';
import { publicAssetUrl } from '../utils';

type Props = {
  locale: Locale;
  title: string;
  description: string;
  image: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function DepartmentEmptyState({ locale, title, description, image, actionLabel, onAction }: Props) {
  const isArabic = locale === 'ar';
  const reduceMotion = useReducedMotion();
  const titleId = useId();
  const Arrow = isArabic ? ArrowUpLeft : ArrowUpRight;

  return (
    <motion.section
      aria-labelledby={titleId}
      className="zx-empty-showcase col-span-full relative isolate grid min-h-56 overflow-hidden rounded-[1.75rem] border border-zx-border bg-zx-mint sm:min-h-64 sm:grid-cols-[1.1fr_.9fr]"
      initial={reduceMotion ? undefined : { opacity: 0, y: 22, rotateX: -2 }}
      transition={{ duration: 0.65, ease: [0.2, 0.72, 0.2, 1] }}
      viewport={{ once: true, amount: 0.12 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, rotateX: 0 }}
    >
      <div className="relative z-10 flex flex-col items-start justify-center p-6 sm:p-9">
        <span className="inline-flex min-h-11 items-center gap-2 rounded-full border border-zx-border bg-zx-surface-raised/75 px-3 text-xs font-bold tracking-[.14em] text-zx-text backdrop-blur">
          <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
          {isArabic ? 'اختيارات ZEXOR' : 'ZEXOR SELECT'}
        </span>
        <h3 className="zx-display mt-4 text-xl font-bold text-zx-text sm:text-2xl" id={titleId}>{title}</h3>
        <p className="mt-2 max-w-lg text-xs leading-6 text-zx-text sm:text-sm sm:leading-7">{description}</p>
        {actionLabel && onAction && (
          <button className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-zx-cinematic px-4 text-xs font-bold text-zx-accent-contrast shadow-zx-card transition motion-safe:hover:-translate-y-0.5 hover:bg-zx-cinematic focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zx-accent focus-visible:ring-offset-2" onClick={onAction} type="button">
            <Compass aria-hidden="true" className="h-3.5 w-3.5" />
            {actionLabel}
            <Arrow aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <motion.div aria-hidden="true" className="zx-empty-art relative min-h-36 overflow-hidden sm:min-h-full" animate={reduceMotion ? undefined : { y: [0, -5, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}>
        <img alt="" className="absolute inset-0 h-full w-full object-cover" height={800} loading="lazy" src={publicAssetUrl(image)} width={1200} />
        <div className="absolute inset-0 bg-linear-to-t from-zx-cinematic/45 via-transparent to-zx-surface-raised/10 sm:bg-linear-to-l sm:from-zx-mint/5 sm:via-transparent sm:to-zx-mint" />
        <div className="absolute bottom-4 inset-e-4 flex min-h-11 items-center gap-2 rounded-full border border-zx-border/35 bg-zx-cinematic/65 px-3 text-xs font-semibold text-zx-accent-contrast shadow-xl backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-zx-accent" />
          {isArabic ? 'مساحة تتشكل لك' : 'A collection in the making'}
        </div>
      </motion.div>
      <div aria-hidden="true" className="pointer-events-none absolute -inset-s-14 -top-16 -z-10 h-44 w-44 rounded-full bg-zx-accent/35 blur-3xl" />
    </motion.section>
  );
}
