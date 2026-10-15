import { motion } from 'framer-motion';
import { ArrowDown, Sparkles } from 'lucide-react';
import type { Locale } from '../types';
import { publicAssetUrl } from '../utils';

type Props = {
  locale: Locale;
  name: string;
  title?: string;
  text?: string;
  image?: string;
  fallbackTitle: string;
  fallbackText: string;
  fallbackImage: string;
  tint?: string;
};

export function DepartmentBanner({ locale, name, title, text, image, fallbackTitle, fallbackText, fallbackImage, tint = 'from-[#173c32]/90 via-[#173c32]/50 to-transparent' }: Props) {
  const isArabic = locale === 'ar';
  return (
    <section className="relative isolate min-h-[290px] overflow-hidden rounded-[2rem] bg-[#19392f] shadow-[0_24px_70px_-35px_rgba(23,60,50,.8)] sm:min-h-[360px]">
      <motion.img
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
        src={publicAssetUrl(image || fallbackImage)}
        animate={{ scale: [1.02, 1.08, 1.02], x: [0, -8, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className={`absolute inset-0 bg-linear-to-r ${tint}`} />
      <motion.div aria-hidden="true" className="absolute -end-20 -top-28 h-72 w-72 rounded-full border border-white/15" animate={{ rotate: 360 }} transition={{ duration: 50, repeat: Infinity, ease: 'linear' }} />
      <div className={`relative z-10 flex min-h-[290px] max-w-2xl flex-col justify-center p-7 text-white sm:min-h-[360px] sm:p-12 ${isArabic ? 'ms-auto text-right' : 'me-auto text-left'}`}>
        <motion.p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.24em] text-white/75" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }}>
          <Sparkles className="h-4 w-4 text-[#b7edcf]" /> {name}
        </motion.p>
        <motion.h1 className="zx-display mt-4 text-3xl font-semibold leading-tight sm:text-5xl" key={`${name}-${title || fallbackTitle}`} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55, delay: .08 }}>
          {title || fallbackTitle}
        </motion.h1>
        <motion.p className="mt-4 max-w-xl text-sm leading-7 text-white/80 sm:text-base" key={`${name}-copy-${text || fallbackText}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .6, delay: .18 }}>
          {text || fallbackText}
        </motion.p>
        <motion.a href="#department-content" className="mt-7 inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-3 text-xs font-semibold backdrop-blur transition hover:bg-white/20">
          {isArabic ? 'اكتشف القسم' : 'Explore the collection'} <ArrowDown className="h-4 w-4" />
        </motion.a>
      </div>
      <motion.div aria-hidden="true" className="absolute bottom-5 end-7 flex gap-1.5" animate={{ opacity: [.45, 1, .45] }} transition={{ duration: 3, repeat: Infinity }}>
        {[0, 1, 2].map((dot) => <span className="h-1.5 w-1.5 rounded-full bg-white" key={dot} />)}
      </motion.div>
    </section>
  );
}
