import { ArrowUpRight, Sparkles } from 'lucide-react';
import { useState } from 'react';
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

const HERO_GLYPHS = ['Z', 'E', 'X', 'O', 'R'] as const;

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
  const accentWords = heroAccent.trim().split(/\s+/);
  const accentWord = accentWords.pop() ?? '';
  const accentPrefix = accentWords.join(' ');

  const openDepartment = (route: Route) => {
    const chapter = document.getElementById(`chapter-${route}`);
    if (chapter) {
      chapter.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    navigate(route);
  };

  return (
    <section className="five-windows-scene zx-home-redesign" aria-label={isArabic ? 'مقدمة زكسور' : 'Welcome to ZEXOR'}>
      <div className="five-windows-stage zx-home-redesign-stage">
        <div className="five-windows-atmosphere" aria-hidden="true">
          <div className="five-windows-glow five-windows-glow--mint" />
          <div className="five-windows-glow five-windows-glow--apricot" />
          <div className="five-windows-mist five-windows-mist--far" />
          <div className="five-windows-mist five-windows-mist--near" />
        </div>

        <div className="five-windows-content zx-home-redesign-content">
          <p className="five-windows-eyebrow">
            <Sparkles aria-hidden="true" />
            {isArabic ? 'تصميم · تقنية · أسلوب حياة' : 'DESIGN · TECHNOLOGY · LIFESTYLE'}
          </p>

          <div className="five-windows-copy">
            <h1>
              <span className="five-windows-title-line">{heroTitle}</span>
              <span className="five-windows-title-line">
                {accentPrefix && <>{accentPrefix} </>}
                <span className="five-windows-accent">{accentWord}</span>
              </span>
            </h1>
            <p>{heroText}</p>
            <div className="zx-home-hero-actions">
              <button className="five-windows-cta" onClick={() => openDepartment(active.route)} type="button">
                {getText('hero.cta.primary', locale) ?? (isArabic ? `اكتشف ${active.name}` : `Explore ${active.name}`)}
                <ArrowUpRight aria-hidden="true" />
              </button>
              <span className="zx-home-hero-note">
                {isArabic ? 'كل اللي تحتاجه، في مكان واحد' : 'Everything you need, in one place'}
              </span>
            </div>
          </div>

          <nav aria-label={isArabic ? 'أقسام زكسور' : 'Explore ZEXOR departments'} className="five-windows-wordmark zx-home-departments" dir="ltr">
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
                  aria-label={`${department.name}`}
                  className={`five-windows-window zx-home-department ${activeIndex === index ? 'is-active' : ''}`}
                  key={department.route}
                  onClick={() => setActiveIndex(index)}
                  onDoubleClick={() => openDepartment(department.route)}
                  onFocus={() => setActiveIndex(index)}
                  style={{ backgroundImage: `url("${resolvedImage}")` }}
                  type="button"
                >
                  {videoUrl && (
                    <video aria-hidden="true" className="five-windows-video" autoPlay loop muted playsInline poster={resolvedImage} preload="none" src={videoUrl} />
                  )}
                  <span aria-hidden="true" className="five-windows-glyph">{Glyph}</span>
                  <span className="five-windows-label" dir="auto">
                    <span className="five-windows-number" dir="ltr">0{index + 1} / 05</span>
                    <Icon aria-hidden="true" />
                    <span className="five-windows-name">{department.name}</span>
                  </span>
                  <span className="zx-home-department-action">{isArabic ? 'استكشف القسم' : 'Explore'} <ArrowUpRight aria-hidden="true" /></span>
                </button>
              );
            })}
          </nav>

          <footer className="five-windows-footer zx-home-redesign-footer">
            <span>{isArabic ? 'ابدأ من القسم اللي يهمك' : 'START WITH WHAT YOU LOVE'}</span>
            <a href="#departments">{isArabic ? 'خمس تجارب · براند واحد' : 'FIVE WORLDS · ONE BRAND'}</a>
          </footer>
        </div>
      </div>
    </section>
  );
}
