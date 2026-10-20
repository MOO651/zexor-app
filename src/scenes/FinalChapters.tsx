import {
  animate,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import { ArrowUpRight, Gauge, MapPin, MoveUpRight, Waves } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useMobileViewport } from '../hooks/useMobileViewport';
import { useSiteAssets, useSiteContent } from '../lib/siteMediaContext';
import type { Locale, Market, Property, Route, Vehicle } from '../types';
import { money, publicAssetUrl } from '../utils';

function seekScrubVideo(video: HTMLVideoElement | null, progress: number) {
  if (!video || video.readyState < HTMLMediaElement.HAVE_METADATA || !Number.isFinite(video.duration)) return;
  const target = Math.max(0, Math.min(video.duration - 0.04, progress * video.duration));
  if (Math.abs(video.currentTime - target) > 0.08) video.currentTime = target;
}

function useScrollScrubVideo(
  videoRef: { current: HTMLVideoElement | null },
  progress: ReturnType<typeof useScroll>['scrollYProgress'],
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return;
    let latestProgress = progress.get();
    let frame = 0;
    const unsubscribe = progress.on('change', (nextProgress) => {
      latestProgress = nextProgress;
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        seekScrubVideo(videoRef.current, latestProgress);
      });
    });
    return () => {
      unsubscribe();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [enabled, progress, videoRef]);
}

function useNearViewport(ref: { current: HTMLElement | null }) {
  const [isNearViewport, setIsNearViewport] = useState(
    () => !('IntersectionObserver' in window),
  );

  useEffect(() => {
    const target = ref.current;
    if (!target || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setIsNearViewport(true);
        observer.disconnect();
      }
    }, { rootMargin: `${Math.round(window.innerHeight * 0.75)}px 0px` });
    observer.observe(target);
    return () => observer.disconnect();
  }, [ref]);

  return isNearViewport;
}

type ChapterProps = {
  locale: Locale;
  market: Market;
  navigate: (route: Route) => void;
  copyTitle?: string;
  copySummary?: string;
};

function SpeedLine({
  index,
  progress,
  reduceMotion,
}: {
  index: number;
  progress: ReturnType<typeof useScroll>['scrollYProgress'];
  reduceMotion: boolean;
}) {
  const opacity = useTransform(progress, [0, 0.2, 0.55, 0.9, 1], [0, 0.35, 0.5, 0.18, 0]);
  const angle = -70 + (index / 39) * 140;
  const length = 10 + ((index * 17) % 28);

  return (
    <motion.span
      aria-hidden="true"
      className="cars-speed-line"
      style={{ opacity: reduceMotion ? 0 : opacity, rotate: angle, scaleX: length / 20 }}
    />
  );
}

function CarSpec({
  vehicle,
  index,
  locale,
  progress,
}: {
  vehicle: Vehicle;
  index: number;
  locale: Locale;
  progress: ReturnType<typeof useScroll>['scrollYProgress'];
}) {
  const isArabic = locale === 'ar';
  const start = 0.55 + index * 0.08;
  const opacity = useTransform(progress, [start, start + 0.12, 0.9, 1], [0, 1, 1, 0.7]);
  const x = useTransform(progress, [start, start + 0.12], [index === 1 ? 30 : -30, 0]);
  const specs = [
    { label: isArabic ? 'الموديل' : 'MODEL', value: `${vehicle.make} ${vehicle.year}` },
    { label: isArabic ? 'المسافة' : 'MILEAGE', value: `${new Intl.NumberFormat(locale).format(vehicle.mileage)} ${isArabic ? 'كم' : 'km'}` },
    { label: isArabic ? 'المواصفات' : 'DETAILS', value: `${vehicle.transmission} · ${vehicle.fuel}` },
  ];
  const spec = specs[index];

  return (
    <motion.article className="cars-spec-card" style={{ opacity, x }}>
      <span>{spec.label}</span>
      <strong>{spec.value}</strong>
    </motion.article>
  );
}

export function CarsChapter({
  locale,
  market,
  vehicles,
  navigate,
  copyTitle,
  copySummary,
}: ChapterProps & { vehicles: Vehicle[] }) {
  const isArabic = locale === 'ar';
  const reduceMotion = useReducedMotion() ?? false;
  const isMobileViewport = useMobileViewport();
  const sceneRef = useRef<HTMLElement>(null);
  const isNearViewport = useNearViewport(sceneRef);
  const scrubVideoRef = useRef<HTMLVideoElement>(null);
  const { assets } = useSiteAssets();
  const { content, getText } = useSiteContent();
  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ['start start', 'end end'],
  });
  const cars = useMemo(() => vehicles.slice(0, 3), [vehicles]);
  const featured = cars[0];
  const sequenceAsset = assets['cars.sequence'];
  const scrubVideo = assets['cars.scrub.video'];
  const heroAsset = assets['cars.hero'];
  const frameValue = sequenceAsset?.meta.frames;
  const sequenceFrames = Array.isArray(frameValue)
    ? frameValue.filter((frame): frame is string => typeof frame === 'string')
    : [];
  const scrubVideoEnabled = !reduceMotion
    && !isMobileViewport
    && sequenceFrames.length === 0
    && content['feature.heavy_media']?.value_json !== false
    && scrubVideo?.source === 'published'
    && scrubVideo.type === 'video';
  useScrollScrubVideo(scrubVideoRef, scrollYProgress, scrubVideoEnabled);
  const [sequenceFrameIndex, setSequenceFrameIndex] = useState(0);
  const heroImage = (sequenceFrames.length
    ? sequenceFrames[reduceMotion || isMobileViewport ? 0 : sequenceFrameIndex]
    : (sequenceAsset?.type === 'image' ? sequenceAsset.url : sequenceAsset?.posterUrl))
    ?? (heroAsset?.type === 'image' ? heroAsset.url : heroAsset?.posterUrl)
    ?? featured?.photo;
  const imageScale = useTransform(scrollYProgress, [0, 0.55, 0.9, 1], [1.25, 1.06, 1, 1.02]);
  const imageX = useTransform(scrollYProgress, [0.55, 1], ['-2%', '2%']);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.35, 0.6, 1], [0.08, 0.5, 1, 0.45]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.12, 0.55, 0.72], [1, 1, 0.82, 0]);
  const railOpacity = useTransform(scrollYProgress, [0.84, 0.93, 1], [0, 1, 1]);
  const [vehicleCount, setVehicleCount] = useState(0);

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    if (progress >= 0.9) setVehicleCount(cars.length);
    if (sequenceFrames.length > 1 && !reduceMotion && !isMobileViewport) {
      const nextFrame = Math.min(sequenceFrames.length - 1, Math.floor(progress * sequenceFrames.length));
      setSequenceFrameIndex((current) => current === nextFrame ? current : nextFrame);
    }
  });

  const title = (content['cars.chapter.title']?.source === 'published' ? getText('cars.chapter.title', locale) : null)
    || copyTitle?.trim() || getText('cars.chapter.title', locale)
    || (isArabic ? 'زكسور موتورز' : 'ZEXOR MOTORS');
  const accent = getText('cars.chapter.accent', locale)
    ?? (isArabic ? 'حرّك خطوتك' : 'Move with intent');
  const summary = (content['cars.chapter.summary']?.source === 'published' ? getText('cars.chapter.summary', locale) : null)
    || copySummary?.trim() || getText('cars.chapter.summary', locale)
    || (isArabic ? 'سيارات مختارة بعناية، وتجربة استفسار مباشرة وواضحة.' : 'A considered selection, with a direct and easy way to enquire.');
  const action = getText('cars.chapter.action', locale)
    ?? (isArabic ? 'اكتشف السيارات' : 'Explore vehicles');

  return (
    <section aria-label={isArabic ? 'الفصل الرابع: زكسور موتورز' : 'Chapter four: ZEXOR MOTORS'} className="cars-chapter" id="chapter-cars" ref={sceneRef}>
      <div className="cars-stage" dir={isArabic ? 'rtl' : 'ltr'}>
        <div aria-hidden="true" className="cars-road-grid" />
        <div aria-hidden="true" className="cars-speed-lines">
          {Array.from({ length: 40 }, (_, index) => (
            <SpeedLine index={index} key={index} progress={scrollYProgress} reduceMotion={reduceMotion} />
          ))}
        </div>

        {heroImage && (
          <motion.div
            aria-hidden="true"
            className="cars-hero-image"
            style={{
              backgroundImage: isNearViewport ? `url("${publicAssetUrl(heroImage)}")` : undefined,
              scale: reduceMotion ? 1 : imageScale,
              x: reduceMotion ? 0 : imageX,
            }}
          />
        )}
        {scrubVideoEnabled && (
          <motion.video
            aria-hidden="true"
            className="cars-hero-video"
            muted
            onLoadedMetadata={(event) => seekScrubVideo(event.currentTarget, scrollYProgress.get())}
            playsInline
            poster={scrubVideo.posterUrl ?? undefined}
            preload="metadata"
            ref={scrubVideoRef}
            src={publicAssetUrl(scrubVideo.url) ?? undefined}
            style={{
              scale: reduceMotion ? 1 : imageScale,
              x: reduceMotion ? 0 : imageX,
            }}
          />
        )}
        <motion.div aria-hidden="true" className="cars-headlight-glow" style={{ opacity: reduceMotion ? 0.55 : glowOpacity }} />
        <div aria-hidden="true" className="cars-stage-scrim" />

        <motion.header className="cars-heading" style={{ opacity: reduceMotion ? 1 : titleOpacity }}>
          <span className="cars-eyebrow"><Gauge aria-hidden="true" />04 · {isArabic ? 'اختيارات على الطريق' : 'CURATED FOR THE ROAD'}</span>
          <h2><span>{title}</span><em>{accent}</em></h2>
          <p>{summary}</p>
        </motion.header>

        {featured && (
          <div aria-label={isArabic ? 'مواصفات السيارة المختارة' : 'Featured vehicle details'} className="cars-specs">
            {[0, 1, 2].map((index) => (
              <CarSpec index={index} key={`${featured.id}-${index}`} locale={locale} progress={scrollYProgress} vehicle={featured} />
            ))}
          </div>
        )}

        <motion.div className="cars-ending" style={{ opacity: reduceMotion ? 1 : railOpacity }}>
          <div className="cars-ending-copy">
            <span>{isArabic ? 'اختيارك القادم يبدأ هنا' : 'YOUR NEXT DRIVE STARTS HERE'}</span>
            {cars.length > 0 && (
              <strong>+{String(vehicleCount || cars.length).padStart(2, '0')} {isArabic ? 'سيارات متاحة' : 'vehicles to explore'}</strong>
            )}
            <button className="cars-cta" onClick={() => navigate('cars')} type="button">
              {action}<ArrowUpRight aria-hidden="true" />
            </button>
          </div>
          <div aria-label={isArabic ? 'سيارات مختارة' : 'Selected vehicles'} className="cars-rail">
            {cars.map((car) => (
              <button className="cars-rail-card" key={car.id} onClick={() => navigate('cars')} type="button">
                <img alt="" loading="lazy" src={publicAssetUrl(car.photo)} />
                <span><strong>{car.title[locale]}</strong><small>{money(car.price, car.region === 'Riyadh' || car.region === 'Jeddah' ? 'ksa' : market, locale)}</small></span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function EstateCount({ value, locale }: { value: number; locale: Locale }) {
  const reduceMotion = useReducedMotion() ?? false;
  const [count, setCount] = useState(reduceMotion ? value : 0);
  const countLabel = locale === 'ar' ? 'مساحة للاكتشاف' : 'spaces to explore';

  useEffect(() => {
    if (!value) return;
    const controls = animate(0, value, {
      duration: reduceMotion ? 0 : 1.2,
      ease: 'easeOut',
      onUpdate: (next) => setCount(Math.round(next)),
    });
    return () => controls.stop();
  }, [reduceMotion, value]);

  if (!value) return null;

  return <span className="estate-count"><strong>+{String(count).padStart(2, '0')}</strong>{countLabel}</span>;
}

export function RealEstateChapter({
  locale,
  market,
  properties,
  navigate,
  copyTitle,
  copySummary,
}: ChapterProps & { properties: Property[] }) {
  const isArabic = locale === 'ar';
  const reduceMotion = useReducedMotion() ?? false;
  const isMobileViewport = useMobileViewport();
  const sceneRef = useRef<HTMLElement>(null);
  const isNearViewport = useNearViewport(sceneRef);
  const scrubVideoRef = useRef<HTMLVideoElement>(null);
  const { assets } = useSiteAssets();
  const { content, getText } = useSiteContent();
  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ['start start', 'end end'],
  });
  const listing = properties[0];
  const sequenceAsset = assets['real-estate.sequence'];
  const scrubVideo = assets['real-estate.scrub.video'];
  const heroAsset = assets['real-estate.hero'];
  const frameValue = sequenceAsset?.meta.frames;
  const sequenceFrames = Array.isArray(frameValue)
    ? frameValue.filter((frame): frame is string => typeof frame === 'string')
    : [];
  const scrubVideoEnabled = !reduceMotion
    && !isMobileViewport
    && sequenceFrames.length === 0
    && content['feature.heavy_media']?.value_json !== false
    && scrubVideo?.source === 'published'
    && scrubVideo.type === 'video';
  useScrollScrubVideo(scrubVideoRef, scrollYProgress, scrubVideoEnabled);
  const [sequenceFrameIndex, setSequenceFrameIndex] = useState(0);
  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    if (sequenceFrames.length > 1 && !reduceMotion && !isMobileViewport) {
      const nextFrame = Math.min(sequenceFrames.length - 1, Math.floor(progress * sequenceFrames.length));
      setSequenceFrameIndex((current) => current === nextFrame ? current : nextFrame);
    }
  });
  const heroImage = (sequenceFrames.length
    ? sequenceFrames[reduceMotion || isMobileViewport ? 0 : sequenceFrameIndex]
    : (sequenceAsset?.type === 'image' ? sequenceAsset.url : sequenceAsset?.posterUrl))
    ?? (heroAsset?.type === 'image' ? heroAsset.url : heroAsset?.posterUrl)
    ?? listing?.photo;
  const buildingScale = useTransform(scrollYProgress, [0, 0.5, 0.8, 1], [1.35, 1.08, 1, 1]);
  const cloudLeftX = useTransform(scrollYProgress, [0, 0.5, 0.8, 1], ['0%', '-45%', '-48%', '-48%']);
  const cloudRightX = useTransform(scrollYProgress, [0, 0.5, 0.8, 1], ['0%', '45%', '48%', '48%']);
  const cloudsY = useTransform(scrollYProgress, [0, 0.5, 0.8, 1], [0, 24, 42, 42]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.12, 0.48, 0.62], [1, 1, 0.85, 0]);
  const copyOpacity = useTransform(scrollYProgress, [0.48, 0.64, 0.82, 1], [0, 1, 1, 1]);
  const copyY = useTransform(scrollYProgress, [0.48, 0.66], [44, 0]);
  const plantsY = useTransform(scrollYProgress, [0.35, 0.82, 1], ['8vh', '0vh', '0vh']);
  const goldenHour = useTransform(scrollYProgress, [0.4, 0.82, 1], [0, 0.18, 0.18]);
  const title = (content['property.chapter.title']?.source === 'published' ? getText('property.chapter.title', locale) : null)
    || copyTitle?.trim() || getText('property.chapter.title', locale)
    || (isArabic ? 'زكسور إستيتس' : 'ZEXOR ESTATES');
  const accent = getText('property.chapter.accent', locale)
    ?? (isArabic ? 'المكان يغيّر كل شيء' : 'Find your next place');
  const summary = (content['property.chapter.summary']?.source === 'published' ? getText('property.chapter.summary', locale) : null)
    || copySummary?.trim() || getText('property.chapter.summary', locale)
    || (isArabic ? 'مساحات منتقاة تساعدك تلاقي المكان المناسب لخطوتك الجاية.' : 'Thoughtfully selected spaces to help you find the right place for what comes next.');
  const action = getText('property.chapter.action', locale)
    ?? (isArabic ? 'اكتشف المساحات' : 'Explore spaces');

  return (
    <section aria-label={isArabic ? 'الفصل الخامس: زكسور إستيتس' : 'Chapter five: ZEXOR ESTATES'} className="estate-chapter" id="chapter-property" ref={sceneRef}>
      <div className="estate-stage" dir={isArabic ? 'rtl' : 'ltr'}>
        {heroImage && (
          <motion.div
            aria-hidden="true"
            className="estate-building"
            style={{
              backgroundImage: isNearViewport ? `url("${publicAssetUrl(heroImage)}")` : undefined,
              scale: reduceMotion ? 1 : buildingScale,
            }}
          />
        )}
        {scrubVideoEnabled && (
          <motion.video
            aria-hidden="true"
            className="estate-scrub-video"
            muted
            onLoadedMetadata={(event) => seekScrubVideo(event.currentTarget, scrollYProgress.get())}
            playsInline
            poster={scrubVideo.posterUrl ?? undefined}
            preload="metadata"
            ref={scrubVideoRef}
            src={publicAssetUrl(scrubVideo.url) ?? undefined}
            style={{
              scale: reduceMotion ? 1 : buildingScale,
            }}
          />
        )}
        <div aria-hidden="true" className="estate-sky" />
        <motion.div aria-hidden="true" className="estate-cloud estate-cloud--left" style={{ x: reduceMotion ? '-42%' : cloudLeftX, y: reduceMotion ? 32 : cloudsY }} />
        <motion.div aria-hidden="true" className="estate-cloud estate-cloud--right" style={{ x: reduceMotion ? '42%' : cloudRightX, y: reduceMotion ? 32 : cloudsY }} />
        <motion.div aria-hidden="true" className="estate-golden-hour" style={{ opacity: reduceMotion ? 0.18 : goldenHour }} />
        <div aria-hidden="true" className="estate-grain" />

        <motion.h2 className="estate-outline-title" style={{ opacity: reduceMotion ? 0.45 : titleOpacity }}>
          ESTATES
        </motion.h2>

        <motion.div aria-hidden="true" className="estate-foreground" style={{ y: reduceMotion ? 0 : plantsY }}>
          <span /><span /><span /><span /><span />
        </motion.div>

        <motion.header className="estate-copy" style={{ opacity: reduceMotion ? 1 : copyOpacity, y: reduceMotion ? 0 : copyY }}>
          <span className="estate-eyebrow"><MapPin aria-hidden="true" />05 · {isArabic ? 'مساحتك القادمة' : 'A PLACE TO CALL YOURS'}</span>
          <h2>{title}<em>{accent}</em></h2>
          <p>{summary}</p>
          {listing && (
            <div className="estate-featured">
              <Waves aria-hidden="true" />
              <span>{listing.title[locale]}</span>
              <small>{new Intl.NumberFormat(locale).format(listing.area)} {isArabic ? 'م²' : 'm²'}</small>
              <strong>{money(listing.price, listing.region === 'Riyadh' || listing.region === 'Jeddah' ? 'ksa' : market, locale)}</strong>
            </div>
          )}
          <div className="estate-actions">
            <button className="estate-cta" onClick={() => navigate('property')} type="button">
              {action}<MoveUpRight aria-hidden="true" />
            </button>
            <EstateCount locale={locale} value={properties.length} />
          </div>
        </motion.header>

        <span aria-hidden="true" className="estate-chapter-mark">05 / 05</span>
      </div>
    </section>
  );
}
