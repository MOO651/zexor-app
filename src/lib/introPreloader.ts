export function shouldShowIntroPreloader() {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    if (window.sessionStorage.getItem('zexor-intro-seen') === '1') return false;
    window.sessionStorage.setItem('zexor-intro-seen', '1');
    return true;
  } catch {
    return false;
  }
}
