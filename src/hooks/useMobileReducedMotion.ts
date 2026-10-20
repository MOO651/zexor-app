import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

const MOBILE_PERFORMANCE_QUERY = '(max-width: 640px), (pointer: coarse)';

export function useMobileReducedMotion() {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [mobilePerformanceMode, setMobilePerformanceMode] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(MOBILE_PERFORMANCE_QUERY).matches,
  );

  useEffect(() => {
    const query = window.matchMedia(MOBILE_PERFORMANCE_QUERY);
    const updateMode = () => setMobilePerformanceMode(query.matches);
    updateMode();
    query.addEventListener('change', updateMode);
    return () => query.removeEventListener('change', updateMode);
  }, []);

  return prefersReducedMotion || mobilePerformanceMode;
}
