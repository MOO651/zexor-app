import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { useEffect } from 'react';

export function IntroPreloader({ onComplete }: { onComplete: () => void }) {
  const progress = useMotionValue(0);
  const count = useTransform(progress, (value) => `${Math.round(value).toString().padStart(2, '0')}`);
  const reveal = useTransform(progress, (value) => `inset(0 ${100 - value}% 0 0)`);

  useEffect(() => {
    const animation = animate(progress, 100, { duration: 0.86, ease: [0.22, 1, 0.36, 1] });
    const timeout = window.setTimeout(onComplete, 900);
    return () => {
      animation.stop();
      window.clearTimeout(timeout);
    };
  }, [onComplete, progress]);

  return (
    <motion.div
      animate={{ opacity: 1 }}
      aria-label="ZEXOR"
      aria-live="polite"
      className="zx-preloader"
      exit={{ clipPath: 'inset(0 0 100% 0)' }}
      initial={{ opacity: 1, clipPath: 'inset(0)' }}
      role="status"
      transition={{ duration: 0.32, ease: [0.76, 0, 0.24, 1] }}
    >
      <div aria-hidden="true" className="zx-preloader__word">
        <span>ZEXOR</span>
        <motion.span className="zx-preloader__fill" style={{ clipPath: reveal }}>ZEXOR</motion.span>
      </div>
      <div aria-hidden="true" className="zx-preloader__status">
        <div className="zx-preloader__track"><motion.span style={{ scaleX: progress }} /></div>
        <motion.span>{count}</motion.span>
      </div>
    </motion.div>
  );
}
