import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { art } from '../data/imagery';
import { PORTALS } from '../data/portals';
import { useMobileViewport } from '../hooks/useMobileViewport';
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

function TiltCard({
  children,
  className = '',
  intensity = 6,
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
}) {
  const reduceMotion = useReducedMotion() ?? false;
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
    >
      {children}
    </motion.div>
  );
}

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
  const sceneRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ['start start', 'end end'],
  });
  const { assets } = useSiteAssets();
  const { content, getText } = useSiteContent();
  const [activeIndex, setActiveIndex] = useState(0);
  const isMobileViewport = useMobileViewport();
  const [reduceMotion, setReduceMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const taglineOpacity = useTransform(scrollYProgress, [0, 0.1, 0.12], [1, 1, 0]);
  const taglineY = useTransform(scrollYProgress, [0.1, 0.12], ['0px', '-24px']);
  const windowsOpacity = useTransform(scrollYProgress, [0, 0.12, 0.32, 0.45], [1, 1, 0, 0]);
  const atmosphereOpacity = useTransform(scrollYProgress, [0.12, 0.32], [1, 0]);
  const windowsScale = useTransform(scrollYProgress, [0, 0.12, 0.45], [1, 1.06, 0.92]);
  const windowsPointerEvents = useTransform(
    scrollYProgress,
    [0, 0.12, 0.13, 1],
    ['auto', 'auto', 'none', 'none'],
  );
  const outlineOpacity = useTransform(scrollYProgress, [0.12, 0.2, 0.9, 1], [0, 1, 1, 0]);
  const outlineScale = useTransform(scrollYProgress, [0.12, 0.45, 0.7, 1], [1, 1.35, 1.35, 1.35]);
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
      chapter.scrollIntoView({
        behavior: reduceMotion ? 'instant' : 'smooth',
        block: 'start',
      });
      return;
    }
    navigate(route);
  };

  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => setReduceMotion(motionPreference.matches);
    updateMotionPreference();
    motionPreference.addEventListener('change', updateMotionPreference);
    return () => {
      motionPreference.removeEventListener('change', updateMotionPreference);
    };
  }, []);

  return (
    <section
      ref={sceneRef}
      className="five-windows-scene"
      aria-label={isArabic ? 'افتتاحية زكسور' : 'ZEXOR opening'}
    >
      <div className="five-windows-stage">
        <motion.div
          aria-hidden="true"
          className="five-windows-atmosphere"
          style={{ opacity: isMobileViewport ? 1 : atmosphereOpacity }}
        >
          <div className="five-windows-glow five-windows-glow--mint" />
          <div className="five-windows-glow five-windows-glow--apricot" />
          <div className="five-windows-mist five-windows-mist--far" />
          <div className="five-windows-mist five-windows-mist--near" />
        </motion.div>

        <motion.div
          aria-hidden="true"
          className="five-windows-outline"
          style={{
            opacity: isMobileViewport ? 0 : outlineOpacity,
            scale: reduceMotion || isMobileViewport ? 1 : outlineScale,
          }}
        >
          ZEXOR
        </motion.div>
        <div className="five-windows-content">
          <motion.p
            className="five-windows-eyebrow"
            style={{ opacity: isMobileViewport ? 1 : taglineOpacity, y: reduceMotion || isMobileViewport ? 0 : taglineY }}
          >
            <Sparkles aria-hidden="true" />
            {isArabic ? 'تصميم · تقنية · ثقافة' : 'DESIGN · TECHNOLOGY · CULTURE'}
          </motion.p>

          <motion.nav
            aria-label={isArabic ? 'اختار فصل من زكسور' : 'Choose a ZEXOR chapter'}
            className="five-windows-wordmark"
            dir="ltr"
            style={{
              opacity: isMobileViewport ? 1 : windowsOpacity,
              scale: reduceMotion || isMobileViewport ? 1 : windowsScale,
              pointerEvents: isMobileViewport ? 'auto' : windowsPointerEvents,
            }}
          >
            {departments.map((department, index) => {
              const poster = assets[HERO_POSTERS[department.route] ?? ''];
              const video = assets[HERO_VIDEOS[department.route] ?? ''];
              const fallback = index === 0 && heroImage
                ? heroImage
                : HERO_FALLBACKS[department.route] ?? department.image ?? art.cardsPortal;
              const posterUrl = poster?.source === 'published' ? poster.url : fallback;
              const windowImage = isMobileViewport ? poster?.mobileUrl ?? posterUrl : posterUrl;
              const resolvedImage = publicAssetUrl(windowImage) ?? publicAssetUrl(fallback) ?? fallback;
              const videoUrl = !reduceMotion
                && !isMobileViewport
                && content['feature.heavy_media']?.value_json !== false
                && video?.source === 'published'
                && video.type === 'video'
                ? publicAssetUrl(video.url)
                : null;
              const Glyph = HERO_GLYPHS[index] ?? 'X';
              const Icon = department.icon;

              return (
                <motion.button
                  aria-current={activeIndex === index ? 'page' : undefined}
                  aria-label={`${String(index + 1).padStart(2, '0')} / 05 — ${department.name}`}
                  className={`five-windows-window ${activeIndex === index ? 'is-active' : ''}`}
                  key={department.route}
                  onClick={() => {
                    setActiveIndex(index);
                    openDepartment(department.route);
                  }}
                  onFocus={() => setActiveIndex(index)}
                  onMouseEnter={() => setActiveIndex(index)}
                  style={{
                    backgroundImage: `url("${resolvedImage}")`,
                    opacity: isMobileViewport ? 1 : windowsOpacity,
                  }}
                  type="button"
                  initial={reduceMotion ? false : { y: '12%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1.4, delay: index * 0.11, ease: [0.22, 1, 0.36, 1] }}
                >
                  {videoUrl && (
                    <video
                      aria-hidden="true"
                      className="five-windows-video"
                      autoPlay
                      loop
                      muted
                      playsInline
                      poster={resolvedImage}
                      preload="none"
                      src={videoUrl}
                    />
                  )}
                  <span aria-hidden="true" className="five-windows-glyph">{Glyph}</span>
                  <span className="five-windows-label" dir="auto">
                    <span className="five-windows-number" dir="ltr">0{index + 1} / 05</span>
                    <Icon aria-hidden="true" />
                    <span className="five-windows-name">{department.name}</span>
                  </span>
                </motion.button>
              );
            })}
          </motion.nav>

          <motion.div
            className="five-windows-copy"
            style={{ opacity: isMobileViewport ? 1 : taglineOpacity, y: reduceMotion || isMobileViewport ? 0 : taglineY }}
          >
            <h1 aria-label={`${heroTitle} ${heroAccent}`}>
              <span className="five-windows-title-line">{heroTitle}</span>
              <span className="five-windows-title-line">
                {accentPrefix && <>{accentPrefix} </>}
                <span className="five-windows-accent">{accentWord}</span>
              </span>
            </h1>
            <p>{heroText}</p>
            <button
              className="five-windows-cta"
              onClick={() => openDepartment(active.route)}
              type="button"
            >
              {getText('hero.cta.primary', locale) ?? (isArabic ? `اكتشف ${active.name}` : `Explore ${active.name}`)}
              <ArrowUpRight aria-hidden="true" />
            </button>
          </motion.div>

          <motion.footer
            className="five-windows-footer"
            style={{ opacity: reduceMotion || isMobileViewport ? 1 : taglineOpacity, y: reduceMotion || isMobileViewport ? 0 : taglineY }}
          >
            <span>{isArabic ? 'اسحب للأسفل' : 'SCROLL TO EXPLORE'}</span>
            <span aria-hidden="true" className="five-windows-scroll-line" />
            <a href="#departments">
              {isArabic ? 'خمسة فصول · تجربة واحدة' : 'FIVE CHAPTERS · ONE EXPERIENCE'}
            </a>
          </motion.footer>
        </div>
      </div>
    </section>
  );
}

export { TiltCard };
