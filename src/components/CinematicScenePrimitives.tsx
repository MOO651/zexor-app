import { useRef, type ReactNode } from 'react';
import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import type { Locale } from '../types';
import { SceneProgressContext, useSceneProgress } from './useSceneProgress';

export function SceneWrapper({ id, locale, children, className = '' }: {
  id: string;
  locale: Locale;
  children: ReactNode;
  className?: string;
}) {
  const target = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target, offset: ['start start', 'end end'] });
  const progress = useSpring(scrollYProgress, reducedMotion ? { stiffness: 1000, damping: 100 } : { stiffness: 92, damping: 28, restDelta: 0.001 });

  return (
    <section aria-label={id} className={`zx-cinematic-scene ${className}`} dir={locale === 'ar' ? 'rtl' : 'ltr'} id={id} ref={target}>
      <SceneProgressContext.Provider value={progress}>
        <div className="zx-cinematic-scene__sticky">{children}</div>
      </SceneProgressContext.Provider>
    </section>
  );
}

export function ScrollProgress({ className = '' }: { className?: string }) {
  const progress = useSceneProgress();
  return <div aria-hidden="true" className={`zx-scene-scroll-progress ${className}`}><motion.span style={{ scaleX: progress }} /></div>;
}

function TextRevealLine({ text, className }: { text: string; className?: string }) {
  // Keep copy fully readable before any scroll; motion is a non-essential polish.
  return <motion.span aria-hidden="true" className={className}>{text}</motion.span>;
}

export function TextReveal({ lines, className = '', lineClassName = '' }: {
  lines: readonly string[];
  className?: string;
  lineClassName?: string;
}) {
  return <h2 aria-label={lines.join(' ')} className={className}>{lines.map((line, index) => <TextRevealLine className={lineClassName} key={`${index}-${line}`} text={line} />)}</h2>;
}
