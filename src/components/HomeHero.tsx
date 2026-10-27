import { ArrowDownLeft, ArrowDownRight, ArrowUpLeft, ArrowUpRight, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Locale, Route } from '../types';

type Props = {
  locale: Locale;
  navigate: (r: Route) => void;
  heroTitle: string;
  heroAccent: string;
  heroText: string;
  heroImage?: string;
  departmentNames?: Partial<Record<'cards' | 'fashion' | 'services' | 'cars' | 'property', string>>;
  departmentCount?: number;
};

/**
 * Lightweight editorial opening. No image gallery, carousel, video, or
 * per-department media is rendered here. Department navigation lives below.
 */
export function HomeHero({ locale, navigate, heroTitle, heroAccent, heroText }: Props) {
  const isArabic = locale === 'ar';
  const Down = isArabic ? ArrowDownLeft : ArrowDownRight;
  const Up = isArabic ? ArrowUpLeft : ArrowUpRight;

  const exploreDepartments = () => {
    const target = document.getElementById('departments');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else navigate('cards');
  };

  return (
    <section className="zx-hero-editorial" aria-label={isArabic ? 'مرحبًا بك في زكسور' : 'Welcome to ZEXOR'}>
      <div className="zx-hero-editorial-top">
        <span className="zx-hero-overline"><Sparkles aria-hidden="true" /> {isArabic ? 'تصميم · تقنية · أسلوب حياة' : 'DESIGN · TECHNOLOGY · LIFESTYLE'}</span>
        <span className="zx-hero-location">CAIRO <i aria-hidden="true" /> KSA</span>
      </div>
      <div className="zx-hero-editorial-main">
        <div className="zx-hero-copy">
          <p className="zx-hero-index">{isArabic ? 'مساحة واحدة لأفكار مختلفة' : 'A HOME FOR DIFFERENT IDEAS'}</p>
          <h1><span>{heroTitle}</span><span className="zx-hero-accent">{heroAccent}</span></h1>
          <p className="zx-hero-description">{heroText}</p>
          <div className="zx-hero-actions">
            <button className="zx-hero-primary" onClick={exploreDepartments} type="button">
              {isArabic ? 'اكتشف عوالمنا' : 'Explore our worlds'} <Down aria-hidden="true" />
            </button>
            <button className="zx-hero-secondary" onClick={() => navigate('market')} type="button">
              {isArabic ? 'تسوّق المنتجات' : 'Shop products'} <Up aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="zx-hero-art" aria-hidden="true">
          <div className="zx-hero-art-ring zx-hero-art-ring-outer" />
          <div className="zx-hero-art-ring zx-hero-art-ring-inner" />
          <div className="zx-hero-art-disc"><span>Z</span><i /><span>X</span></div>
          <span className="zx-hero-art-label zx-hero-art-label-top">EST. ZEXOR</span>
          <span className="zx-hero-art-label zx-hero-art-label-side">01 — 06</span>
          <span className="zx-hero-art-dot zx-hero-art-dot-one" />
          <span className="zx-hero-art-dot zx-hero-art-dot-two" />
        </div>
      </div>
      <div className="zx-hero-editorial-bottom">
        <span>{isArabic ? 'ستة عوالم مختلفة، بهوية واحدة.' : 'SIX WORLDS. ONE DISTINCT IDENTITY.'}</span>
        <span className="zx-hero-scroll">{isArabic ? 'اكتشف المزيد' : 'DISCOVER MORE'} <Down aria-hidden="true" /></span>
      </div>
    </section>
  );
}

export function TiltCard({ children, className = '' }: { children: ReactNode; className?: string; intensity?: number }) {
  return <div className={className}>{children}</div>;
}
