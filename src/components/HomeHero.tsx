import { ArrowUpRight, Sparkles } from 'lucide-react';
import { motion, type ReactNode } from 'framer-motion';
import type { Locale, Route } from '../types';
import { PORTALS } from '../data/portals';
import { publicAssetUrl } from '../utils';

type Props = {
  locale: Locale;
  navigate: (route: Route) => void;
  heroTitle: string;
  heroAccent: string;
  heroText: string;
  heroImage?: string;
  departmentNames?: Partial<Record<'cards' | 'fashion' | 'services' | 'cars' | 'property' | 'market', string>>;
  departmentCount?: number;
};

export function HomeHero({ locale, navigate, heroTitle, heroAccent, heroText, heroImage, departmentNames }: Props) {
  const isArabic = locale === 'ar';
  const featuredPortal = PORTALS.find((portal) => portal.route === 'fashion') ?? PORTALS[0];
  const heroImageUrl = publicAssetUrl(heroImage) ?? featuredPortal.image;

  const exploreAll = () => {
    const target = document.getElementById('departments');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="zx-new-hero" aria-label={isArabic ? 'اكتشف زكسور' : 'Discover ZEXOR'}>
      <div className="zx-new-hero-meta">
        <span><i /> ZEXOR / INDEPENDENT WORLDS</span>
        <span>{isArabic ? 'القاهرة · السعودية' : 'CAIRO · SAUDI ARABIA'}</span>
      </div>

      <div className="zx-new-hero-layout">
        <div className="zx-new-hero-copy">
          <p className="zx-new-hero-kicker"><Sparkles size={15} /> {isArabic ? 'تسوق. اكتشف. ابتكر.' : 'SHOP / DISCOVER / CREATE'}</p>
          <h1><span>{heroTitle}</span><em>{heroAccent}</em></h1>
          <p className="zx-new-hero-description">{heroText}</p>
          <div className="zx-new-hero-actions">
            <button type="button" className="zx-new-hero-primary" onClick={exploreAll}>
              {isArabic ? 'اكتشف العوالم الستة' : 'Explore all six worlds'} <ArrowUpRight size={18} />
            </button>
            <button type="button" className="zx-new-hero-secondary" onClick={() => navigate('market')}>
              {isArabic ? 'اكتشف المختارات' : 'Discover the edit'}
            </button>
          </div>
          <div className="zx-new-hero-stamp"><span>01 — 06</span><span>{isArabic ? 'ستة أقسام. تجربة واحدة.' : 'SIX DEPARTMENTS. ONE EXPERIENCE.'}</span></div>
        </div>

        <div className="zx-new-hero-art">
          <img src={heroImageUrl} alt="" fetchPriority="high" />
          <span className="zx-new-hero-art-shade" />
          <div className="zx-new-hero-art-top"><span>THE ZEXOR UNIVERSE</span><span>№ 001</span></div>
          <div className="zx-new-hero-art-copy">
            <span>{featuredPortal.meta[locale]}</span>
            <strong>{departmentNames?.[featuredPortal.route as keyof NonNullable<Props['departmentNames']>] ?? featuredPortal.title[locale]}</strong>
            <p>{featuredPortal.tagline[locale]}</p>
            <button type="button" onClick={() => navigate(featuredPortal.route)} aria-label={isArabic ? 'اكتشف قسم الأزياء' : 'Explore fashion'}>
              <ArrowUpRight size={20} />
            </button>
          </div>
          <span className="zx-new-hero-art-mark" aria-hidden="true">Z/</span>
        </div>
      </div>

      <nav className="zx-new-hero-index" aria-label={isArabic ? 'أقسام زكسور' : 'ZEXOR departments'}>
        {PORTALS.map((portal) => {
          const Icon = portal.icon;
          const title = departmentNames?.[portal.route as keyof NonNullable<Props['departmentNames']>] ?? portal.title[locale];
          return <button type="button" key={portal.route} onClick={() => navigate(portal.route)}>
            <span className="zx-new-hero-index-num">{portal.index}</span>
            <span className="zx-new-hero-index-icon"><Icon size={16} /></span>
            <span className="zx-new-hero-index-title">{title}</span>
            <ArrowUpRight className="zx-new-hero-index-arrow" size={15} />
          </button>;
        })}
      </nav>
      <div className="zx-new-hero-footer"><span>{isArabic ? 'عالمك يبدأ من هنا' : 'YOUR NEXT WORLD STARTS HERE'}</span><span>SCROLL TO EXPLORE ↓</span></div>
    </section>
  );
}

/** Lightweight interactive card wrapper shared by optional content modules. */
export function TiltCard({ children, className = '', intensity = 8 }: { children: ReactNode; className?: string; intensity?: number }) {
  return <motion.div className={className} whileHover={{ y: -3, scale: 1.005 }} transition={{ type: 'spring', stiffness: 280, damping: 22 }} data-tilt-intensity={intensity}>{children}</motion.div>;
}
