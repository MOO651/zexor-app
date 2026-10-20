import {
  animate,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { ArrowUpRight, Code2, LayoutDashboard, Monitor, Smartphone } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { STATS } from '../data/initialData';
import { useMobileViewport } from '../hooks/useMobileViewport';
import { useSiteAssets, useSiteContent } from '../lib/siteMediaContext';
import type { AgencyProject, Locale, Route } from '../types';
import { publicAssetUrl } from '../utils';

type Props = {
  locale: Locale;
  projects: AgencyProject[];
  navigate: (route: Route) => void;
};

type DeviceKind = 'browser' | 'phone' | 'dashboard';

const DEVICE_ICONS = {
  browser: Monitor,
  phone: Smartphone,
  dashboard: LayoutDashboard,
} satisfies Record<DeviceKind, typeof Monitor>;

function DeviceMockup({
  kind,
  index,
  project,
  image,
  progress,
  reduceMotion,
  locale,
}: {
  kind: DeviceKind;
  index: number;
  project: AgencyProject;
  image: string;
  progress: MotionValue<number>;
  reduceMotion: boolean;
  locale: Locale;
}) {
  const Icon = DEVICE_ICONS[kind];
  const entryStart = index * 0.06;
  const opacity = useTransform(
    progress,
    [entryStart, entryStart + 0.1, 0.3, 0.8, 1],
    [0, 1, 1, 0.85, 0.28],
  );
  const scale = useTransform(progress, [entryStart, 0.3, 0.8, 1], [0.72, 1, 0.92, 0.68]);
  const x = useTransform(
    progress,
    [0.15, 0.5, 0.8, 1],
    kind === 'phone'
      ? ['-30vw', '-32vw', '-18vw', '0vw']
      : kind === 'dashboard'
        ? ['30vw', '32vw', '18vw', '0vw']
        : ['0vw', '0vw', '0vw', '0vw'],
  );
  const y = useTransform(progress, [0.2, 0.55, 0.8, 1], [32, 0, 20, 0]);
  const rotate = useTransform(
    progress,
    [0.18, 0.5, 0.8, 1],
    kind === 'phone' ? [-14, -10, -6, 0] : kind === 'dashboard' ? [12, 9, 5, 0] : [0, 0, 0, 0],
  );
  const screenshotY = useTransform(progress, [0.3, 0.8], ['0%', '-40%']);

  return (
    <motion.article
      aria-label={`${project.title[locale]} project preview`}
      className={`studio-device studio-device--${kind}`}
      style={{
        opacity: reduceMotion ? 1 : opacity,
        scale: reduceMotion ? 1 : scale,
        x: reduceMotion ? 0 : x,
        y: reduceMotion ? 0 : y,
        rotate: reduceMotion ? 0 : rotate,
      }}
    >
      <div className="studio-device-chrome">
        <span aria-hidden="true" className="studio-device-icon"><Icon /></span>
        <span className="studio-device-address">zexor.studio</span>
        <span aria-hidden="true" className="studio-device-dots"><i /><i /><i /></span>
      </div>
      <div className="studio-device-screen">
        <motion.img
          alt=""
          aria-hidden="true"
          loading="lazy"
          src={publicAssetUrl(image)}
          style={{ y: kind === 'browser' && !reduceMotion ? screenshotY : 0 }}
        />
      </div>
      <div className="studio-device-caption">
        <span>{project.category[locale]}</span>
        <strong>{project.title[locale]}</strong>
      </div>
    </motion.article>
  );
}

function StudioStat({
  value,
  label,
  reduceMotion,
  active,
}: {
  value: number;
  label: string;
  reduceMotion: boolean;
  active: boolean;
}) {
  const [count, setCount] = useState(reduceMotion ? value : 0);

  useEffect(() => {
    if (!active) return;
    const controls = animate(0, value, {
      duration: reduceMotion ? 0 : 1.2,
      ease: 'easeOut',
      onUpdate: (latest) => setCount(Math.round(latest)),
    });
    return () => controls.stop();
  }, [active, reduceMotion, value]);

  return (
    <div className="studio-final-stat">
      <strong>{String(count).padStart(2, '0')}</strong>
      <span>{label}</span>
    </div>
  );
}

export function StudioChapter({ locale, projects, navigate }: Props) {
  const isArabic = locale === 'ar';
  const reduceMotion = useReducedMotion() ?? false;
  const isMobileViewport = useMobileViewport();
  const staticMotion = reduceMotion || isMobileViewport;
  const sceneRef = useRef<HTMLElement>(null);
  const { assets } = useSiteAssets();
  const { getText } = useSiteContent();
  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ['start start', 'end end'],
  });
  const [statsActive, setStatsActive] = useState(false);
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (staticMotion || latest >= 0.8) setStatsActive(true);
  });
  const titleOpacity = useTransform(scrollYProgress, [0, 0.08, 0.78, 0.92], [1, 1, 1, 0.08]);
  const finalOpacity = useTransform(scrollYProgress, [0.78, 0.9, 1], [0, 1, 1]);
  const finalScale = useTransform(scrollYProgress, [0.78, 1], [0.84, 1]);
  const projectSlots = useMemo(() => projects.slice(0, 3), [projects]);
  const devices = useMemo(() => {
    const kinds: DeviceKind[] = ['browser', 'phone', 'dashboard'];
    return projectSlots.map((project, index) => {
      const key = `studio.project.${index + 1}`;
      return {
        project,
        kind: kinds[index],
        image: assets[key]?.url || project.image,
      };
    });
  }, [assets, projectSlots]);
  const stats = [
    { value: projects.length, label: isArabic ? 'مشاريع رقمية' : 'Digital projects' },
    { value: 2, label: STATS[0].label[locale] },
    { value: 2, label: STATS[1].label[locale] },
  ];
  const headline = getText('studio.headline', locale) ?? (isArabic ? 'نبني تجارب رقمية' : 'We build digital experiences');
  const headlineAccent = getText('studio.headline.accent', locale) ?? (isArabic ? 'تشتغل' : 'that work.');
  const ctaTitle = getText('studio.cta.title', locale) ?? (isArabic ? 'ابنِ مشروعك معنا' : 'Build with us');
  const ctaButton = getText('studio.cta.button', locale) ?? (isArabic ? 'ابدأ مشروعك' : 'Start a project');
  const trafficChip = getText('studio.chip.traffic', locale) ?? (isArabic ? '+128٪ زيارات' : '+128% traffic');
  const checkoutChip = getText('studio.chip.checkout', locale) ?? (isArabic ? 'الدفع في 2.1 ثانية' : 'Checkout 2.1s');

  if (devices.length === 0) return null;

  return (
    <section className="studio-chapter" id="chapter-services" ref={sceneRef}>
      <div className={`studio-stage${staticMotion ? ' studio-stage--static' : ''}`} dir={isArabic ? 'rtl' : 'ltr'}>
        <div aria-hidden="true" className="studio-stage-glow studio-stage-glow--mint" />
        <div aria-hidden="true" className="studio-stage-glow studio-stage-glow--clay" />

        <motion.header className="studio-heading" style={{ opacity: staticMotion ? 1 : titleOpacity }}>
          <span className="studio-eyebrow">
            <Code2 aria-hidden="true" />
            {isArabic ? 'زكسور ستوديو · تجارب رقمية' : 'ZEXOR STUDIO · DIGITAL EXPERIENCES'}
          </span>
          <h2>
            {headline}
            <span>{headlineAccent}</span>
          </h2>
        </motion.header>

        <div aria-label={isArabic ? 'نماذج من مشاريع الاستوديو' : 'Studio project previews'} className="studio-devices">
          {devices.map(({ project, kind, image }, index) => (
            <DeviceMockup
              image={image}
              index={index}
              key={project.id}
              kind={kind}
              progress={scrollYProgress}
              project={project}
              reduceMotion={staticMotion}
              locale={locale}
            />
          ))}
        </div>

        <motion.span
          className="studio-float-chip studio-float-chip--traffic"
          initial={staticMotion ? undefined : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          whileInView={staticMotion ? undefined : { opacity: 1, y: 0 }}
        >
          <span aria-hidden="true" />
          {trafficChip}
        </motion.span>
        <motion.span
          className="studio-float-chip studio-float-chip--checkout"
          initial={staticMotion ? undefined : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          viewport={{ once: true }}
          whileInView={staticMotion ? undefined : { opacity: 1, y: 0 }}
        >
          <span aria-hidden="true" />
          {checkoutChip}
        </motion.span>

        <motion.article
          aria-label={ctaTitle}
          className="studio-final-card"
          style={{
            opacity: staticMotion ? 1 : finalOpacity,
            scale: staticMotion ? 1 : finalScale,
            x: staticMotion ? 0 : '-50%',
            y: staticMotion ? 0 : '-50%',
          }}
        >
          <span className="studio-final-card-label">{isArabic ? 'من الفكرة إلى الإطلاق' : 'FROM IDEA TO LAUNCH'}</span>
          <h3>{ctaTitle}</h3>
          <div className="studio-final-stats">
            {stats.map((stat, index) => (
              <StudioStat
                active={staticMotion || statsActive}
                key={`${stat.label}-${index}`}
                label={stat.label}
                reduceMotion={staticMotion}
                value={stat.value}
              />
            ))}
          </div>
          <button className="studio-cta" onClick={() => navigate('services')} type="button">
            {ctaButton}
            <ArrowUpRight aria-hidden="true" />
          </button>
        </motion.article>
      </div>
    </section>
  );
}
