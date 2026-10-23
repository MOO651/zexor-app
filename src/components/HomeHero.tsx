import { motion } from 'framer-motion';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { art } from '../data/imagery';
import { PORTALS } from '../data/portals';
import type { Locale, Route } from '../types';
import { publicAssetUrl } from '../utils';
import { useSiteAssets, useSiteContent } from '../lib/siteMediaContext';

const HERO_POSTERS: Record<string, string> = {
  cards: 'hero.letter.z.poster',
  fashion: 'hero.letter.e.poster',
  services: 'hero.letter.x.poster',
  cars: 'hero.letter.o.poster',
  property: 'hero.letter.r.poster',
};

const HERO_VIDEOS: Record<string, string> = {
  cards: 'hero.letter.z.video',
  fashion: 'hero.letter.e.video',
  services: 'hero.letter.x.video',
  cars: 'hero.letter.o.video',
  property: 'hero.letter.r.video',
};

const HERO_FALLBACKS: Record<string, string> = {
  cards: art.cardsElite,
  fashion: art.hoodie,
  services: art.studioPortal,
  cars: art.vehiclesPortal,
  property: art.estatePortal,
};

const HERO_GLYPHS = ['Z', 'E', 'X', 'O', 'R', '+'] as const;

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

export function HomeHero({
  locale,
  navigate,
  heroTitle,
  heroAccent,
  heroText,
  heroImage,
  departmentNames,
}: Props) {
  const isArabic = locale === 'ar';
  const { assets } = useSiteAssets();
  const { content, getText } = useSiteContent();
  const [activeIndex, setActiveIndex] = useState(0);
  const departments = PORTALS.map((portal) => ({
    ...portal,
    name: departmentNames?.[portal.route as keyof NonNullable<Props['departmentNames']>] ?? portal.title[locale],
  }));
  const active = departments[activeIndex] ?? departments[0];

  const openDepartment = (route: Route) => {
    const chapter = document.getElementById(`chapter-${route}`);
    if (chapter) {
      chapter.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    navigate(route);
  };

  return (
    <section className="zx-bold-home" aria-label={isArabic ? 'مقدمة زكسور' : 'Welcome to ZEXOR'}>
      <div className="zx-bold-home-topline">
        <span>{isArabic ? 'منصة واحدة، عوالم مختلفة' : 'ONE PLATFORM. UNEXPECTED WORLDS.'}</span>
        <span className="zx-bold-home-index">CAIRO · KSA <i /> EST. ZEXOR</span>
      </div>
      <div className="zx-bold-home-layout">
        <div className="zx-bold-home-copy">
          <p className="zx-bold-home-kicker"><Sparkles aria-hidden="true" /> {isArabic ? 'تصميم · تقنية · أسلوب حياة' : 'DESIGN / TECH / LIFESTYLE'}</p>
          <h1>
            <span>{heroTitle}</span>
            <span className="zx-bold-home-accent">{heroAccent}</span>
          </h1>
          <p className="zx-bold-home-description">{heroText}</p>
          <div className="zx-bold-home-actions">
            <button className="zx-bold-home-cta" onClick={() => openDepartment(active.route)} type="button">
              {getText('hero.cta.primary', locale) ?? (isArabic ? `اكتشف ${active.name}` : `Explore ${active.name}`)}
              <ArrowUpRight aria-hidden="true" />
            </button>
            <span>{isArabic ? 'اسحب واكتشف عالمك' : 'SCROLL TO FIND YOUR WORLD'} <span aria-hidden="true">↘</span></span>
          </div>
          <div className="zx-bold-home-wordmark" aria-hidden="true">Z<span>E</span>XOR<span className="zx-bold-home-dot">.</span></div>
        </div>
        <div className="zx-bold-home-gallery" dir="ltr">
          {departments.map((department, index) => {
            const poster = assets[HERO_POSTERS[department.route] ?? ''];
            const video = assets[HERO_VIDEOS[department.route] ?? ''];
            const fallback = index === 0 && heroImage ? heroImage : HERO_FALLBACKS[department.route] ?? department.image ?? art.cardsPortal;
            const posterUrl = poster?.source === 'published' ? poster.url : fallback;
            const resolvedImage = publicAssetUrl(poster?.mobileUrl && window.matchMedia('(max-width: 640px)').matches ? poster.mobileUrl : posterUrl) ?? fallback;
            const videoUrl = content['feature.heavy_media']?.value_json !== false && video?.source === 'published' && video.type === 'video'
              ? publicAssetUrl(video.url)
              : null;
            const Glyph = HERO_GLYPHS[index] ?? 'X';
            const Icon = department.icon;
            return (
              <button
                aria-pressed={activeIndex === index}
                aria-label={department.name}
                className={`zx-bold-world zx-bold-world-${index + 1} ${activeIndex === index ? 'is-active' : ''}`}
                key={department.route}
                onClick={() => { setActiveIndex(index); openDepartment(department.route); }}
                onFocus={() => setActiveIndex(index)}
                style={{ backgroundImage: `url("${resolvedImage}")` }}
                type="button"
              >
                {videoUrl && <video aria-hidden="true" autoPlay className="zx-bold-world-video" loop muted playsInline poster={resolvedImage} preload="none" src={videoUrl} />}
                <span className="zx-bold-world-shade" />
                <span className="zx-bold-world-index">0{index + 1}<span> / 05</span></span>
                <span className="zx-bold-world-glyph">{Glyph}</span>
                <span className="zx-bold-world-bottom">
                  <span className="zx-bold-world-icon"><Icon aria-hidden="true" /></span>
                  <span className="zx-bold-world-name">{department.name}</span>
                  <ArrowUpRight aria-hidden="true" className="zx-bold-world-arrow" />
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="zx-bold-home-bottomline">
        <span>{isArabic ? 'ستة عوالم، برؤية واحدة.' : 'SIX WORLDS. ONE POINT OF VIEW.'}</span>
        <span className="zx-bold-home-bottom-mark">ZEXOR <i /> 01—06</span>
      </div>
    </section>
  );
}


/** Lightweight interactive card wrapper shared by the homepage sections. */
export function TiltCard({
  children,
  className = '',
  intensity = 8,
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
}) {
  return (
    <motion.div
      className={className}
      whileHover={{ y: -3, scale: 1.005 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      data-tilt-intensity={intensity}
    >
      {children}
    </motion.div>
  );
}
