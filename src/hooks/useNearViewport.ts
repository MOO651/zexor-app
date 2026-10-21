import { useEffect, useState } from 'react';

export function useNearViewport(
  ref: { current: Element | null },
  rootMargin = '100% 0px',
) {
  const [isNearViewport, setIsNearViewport] = useState(
    () => typeof IntersectionObserver === 'undefined',
  );

  useEffect(() => {
    const target = ref.current;
    if (!target || isNearViewport || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setIsNearViewport(true);
        observer.disconnect();
      }
    }, { rootMargin });
    observer.observe(target);
    return () => observer.disconnect();
  }, [isNearViewport, ref, rootMargin]);

  return isNearViewport;
}
