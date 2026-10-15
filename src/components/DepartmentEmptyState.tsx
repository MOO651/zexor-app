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
  const Arrow = isArabic ? ArrowUpLeft : ArrowUpRight;

  return (
    <motion.section
      aria-label={title}
      className="zx-empty-showcase col-span-full relative isolate grid min-h-56 overflow-hidden rounded-[1.75rem] border border-[#dfe9df] bg-[#f4f4eb] sm:min-h-64 sm:grid-cols-[1.1fr_.9fr]"
      initial={reduceMotion ? undefined : { opacity: 0, y: 22, rotateX: -2 }}
      transition={{ duration: 0.65, ease: [0.2, 0.72, 0.2, 1] }}
      viewport={{ once: false, amount: 0.12 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, rotateX: 0 }}
    >
      <div className="relative z-10 flex flex-col items-start justify-center p-6 sm:p-9">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#d8e5d8] bg-white/75 px-3 py-1.5 text-[9px] font-bold tracking-[.14em] text-[#587562] backdrop-blur">
          <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
          {isArabic ? 'اختيارات ZEXOR' : 'ZEXOR SELECT'}
        </span>
        <h3 className="zx-display mt-4 text-xl font-bold text-[#20382b] sm:text-2xl">{title}</h3>
        <p className="mt-2 max-w-lg text-xs leading-6 text-[#63756a] sm:text-sm sm:leading-7">{description}</p>
        {actionLabel && onAction && (
          <button className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-full bg-[#244b38] px-4 text-[11px] font-bold text-white shadow-lg shadow-[#244b38]/15 transition hover:-translate-y-0.5 hover:bg-[#31654a]" onClick={onAction} type="button">
            <Compass aria-hidden="true" className="h-3.5 w-3.5" />
            {actionLabel}
            <Arrow aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <motion.div aria-hidden="true" className="zx-empty-art relative min-h-36 overflow-hidden sm:min-h-full" animate={reduceMotion ? undefined : { y: [0, -5, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}>
        <img alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" src={publicAssetUrl(image)} />
        <div className="absolute inset-0 bg-linear-to-t from-[#10251c]/45 via-transparent to-white/10 sm:bg-linear-to-l sm:from-[#f4f4eb]/5 sm:via-transparent sm:to-[#f4f4eb]" />
        <div className="absolute bottom-4 end-4 flex items-center gap-2 rounded-full border border-white/35 bg-[#13281f]/65 px-3 py-2 text-[9px] font-semibold text-white shadow-xl backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-[#b4dfbd]" />
          {isArabic ? 'مساحة تتشكل لك' : 'A collection in the making'}
        </div>
      </motion.div>
      <div aria-hidden="true" className="pointer-events-none absolute -start-14 -top-16 -z-10 h-44 w-44 rounded-full bg-[#b8dbc1]/35 blur-3xl" />
    </motion.section>
  );
}
