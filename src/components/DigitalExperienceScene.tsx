import { motion, useReducedMotion, useTransform } from 'framer-motion';
import { ArrowDown, ArrowUpRight, Layers3, MonitorSmartphone, Sparkles } from 'lucide-react';
import type { Route, Locale } from '../types';
import { SceneWrapper, ScrollProgress, TextReveal } from './CinematicScenePrimitives';
import { useLowPowerDevice, useSceneProgress } from './useSceneProgress';

function FloatingInterface({ className, depth, children }: { className: string; depth: number; children: React.ReactNode }) {
  const progress = useSceneProgress();
  const reducedMotion = useReducedMotion();
  const lowPower = useLowPowerDevice();
  const y = useTransform(progress, [0, 1], [depth, -depth]);
  const rotate = useTransform(progress, [0, 1], [-2, 2]);
  return <motion.div className={`zx-digital-scene__float ${className}`} style={reducedMotion || lowPower ? undefined : { y, rotate }}>{children}</motion.div>;
}

export function DigitalExperienceScene({ locale, navigate }: { locale: Locale; navigate: (route: Route) => void }) {
  const isArabic = locale === 'ar';
  const reducedMotion = useReducedMotion();
  return (
    <SceneWrapper className="zx-digital-scene" id="digital-experiences" locale={locale}>
      <ScrollProgress />
      <div className="zx-digital-scene__content">
        <div className="zx-digital-scene__copy">
          <div className="zx-digital-scene__eyebrow"><span><Sparkles size={15} /></span>{isArabic ? 'الفصل 03 · تجارب رقمية' : 'CHAPTER 03 · DIGITAL EXPERIENCES'}</div>
          <TextReveal className="zx-digital-scene__title" lines={isArabic ? ['كل تفصيلة', 'تبدأ بفكرة.', 'وتنتهي بتجربة.'] : ['Every detail', 'starts with an idea.', 'ends as an experience.']} />
          <p className="zx-digital-scene__description">{isArabic ? 'نصمم عوالم رقمية وهوية متصلة، تجمع بين التقنية والحضور الواثق.' : 'Digital worlds and connected identities, shaped with clarity, craft and quiet confidence.'}</p>
          <button className="zx-ui-button zx-ui-button--primary zx-digital-scene__cta" onClick={() => navigate('services')} type="button">
            {isArabic ? 'اكتشف التجارب' : 'Explore experiences'} <ArrowUpRight aria-hidden="true" size={17} />
          </button>
          <div className="zx-digital-scene__scroll-hint"><ArrowDown size={15} />{isArabic ? 'تابع الرحلة' : 'SCROLL TO EXPLORE'}</div>
        </div>
        <div aria-hidden="true" className="zx-digital-scene__stage">
          <div className="zx-digital-scene__orb zx-digital-scene__orb--back" />
          <FloatingInterface className="zx-digital-scene__panel zx-digital-scene__panel--browser" depth={reducedMotion ? 0 : 55}>
            <div className="zx-digital-scene__browser-top"><i /><i /><i /><span>ZEXOR / STUDIO</span></div>
            <div className="zx-digital-scene__browser-body"><small>DESIGN · TECHNOLOGY · CULTURE</small><b>Ideas made<br />tangible.</b><span className="zx-digital-scene__browser-line" /><div className="zx-digital-scene__browser-image" /></div>
          </FloatingInterface>
          <FloatingInterface className="zx-digital-scene__panel zx-digital-scene__panel--identity" depth={reducedMotion ? 0 : 34}>
            <span className="zx-digital-scene__icon"><MonitorSmartphone size={18} /></span><small>{isArabic ? 'هوية متصلة' : 'CONNECTED IDENTITY'}</small><b>ZEXOR<span>®</span></b><em>ONE TAP. YOUR WORLD.</em>
          </FloatingInterface>
          <FloatingInterface className="zx-digital-scene__panel zx-digital-scene__panel--layers" depth={reducedMotion ? 0 : 23}>
            <Layers3 size={19} /><span>{isArabic ? 'تفاصيل تصنع الفرق' : 'CRAFTED IN LAYERS'}</span><strong>01 — 05</strong>
          </FloatingInterface>
          <div className="zx-digital-scene__stage-glow" />
          <div className="zx-digital-scene__stage-wordmark">Z</div>
        </div>
      </div>
      <div aria-label={isArabic ? 'المشهد 3 من 5' : 'Scene 3 of 5'} className="zx-digital-scene__index" dir="ltr">03 / 05</div>
    </SceneWrapper>
  );
}
