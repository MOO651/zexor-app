import type { Locale, Market, Route } from './types';

/**
 * The locale the app starts from when nothing valid is stored, or when
 * localStorage is unreadable (private mode / disabled storage). A single
 * constant keeps the initial locale deterministic across every code path.
 */
export const DEFAULT_LOCALE: Locale = 'ar';

/**
 * Locale identifier used by Intl for the given app locale.
 */
export function intlLocale(locale: Locale): string {
  return locale === 'ar' ? 'ar-EG' : 'en';
}

/**
 * Currency symbol/label for a market in a given locale.
 */
export function currencySymbol(market: Market, locale: Locale): string {
  if (market === 'eg') return locale === 'ar' ? 'ج.م' : 'EGP';
  return locale === 'ar' ? 'ر.س' : 'SAR';
}

/**
 * Locale-aware number formatting.
 */
export function formatNumber(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale(locale)).format(amount);
}

/**
 * Formats an amount together with its market currency, e.g. "1,250 ج.م".
 */
export function money(amount: number, market: Market, locale: Locale): string {
  return `${formatNumber(amount, locale)} ${currencySymbol(market, locale)}`;
}

/**
 * Copies a value to the clipboard, falling back to a hidden textarea + execCommand
 * for browsers/contexts where the async Clipboard API is unavailable or rejected.
 */
export async function copyToClipboard(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // fall through to the legacy approach
  }
  try {
    const area = document.createElement('textarea');
    area.value = value;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.top = '-1000px';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

/**
 * Simple runtime validators used to guard data read back from localStorage.
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Validates that a persisted array value still matches the shape it was written with
 * (an array whose members are all objects). Falls back to the default otherwise, so a
 * corrupted or hand-edited localStorage entry can never crash the UI.
 */
export function isValidObjectArray(value: unknown): boolean {
  return isArray(value) && value.every((item) => isObject(item));
}

export function isValidObject(value: unknown): boolean {
  return isObject(value);
}

/**
 * Routes the app renders as built-in pages. Any other non-empty hash segment is
 * treated as a dynamic category slug (created in the admin dashboard).
 */
const KNOWN_ROUTES = new Set<string>([
  'home',
  'cards',
  'fashion',
  'services',
  'cars',
  'property',
  'contact',
  'dashboard',
  'pricing',
  'calculator',
  'reviews',
  'tracking',
]);

/**
 * Derives the current route from `window.location.hash`, e.g. `#/cars/x` -> `cars`.
 * Empty hashes resolve to home; unknown segments fall through as dynamic slugs so
 * admin-created categories are routable.
 */
export function routeFromHash(hash: string): Route {
  const current = hash.replace(/^#\/?/, '').split('/')[0];
  if (!current) return 'home';
  return KNOWN_ROUTES.has(current) ? (current as Route) : current;
}

/**
 * Builds the `https://wa.me/...` deep link for a market's WhatsApp number,
 * with the message pre-encoded. Centralised so every CTA opens the same way.
 */
export function whatsappLink(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/**
 * Resolves the WhatsApp number for a market from site settings.
 */
export function whatsappNumberFor(
  market: Market,
  settings: { whatsappEg: string; whatsappKsa: string },
): string {
  return market === 'eg' ? settings.whatsappEg : settings.whatsappKsa;
}

/**
 * Builds a short human-readable reference such as `ZX-INQ-482913`.
 * Kept as a plain module function (not called during render) so React's
 * purity rules stay satisfied.
 */
export function makeReference(prefix: string): string {
  return `${prefix}-${Date.now().toString().slice(-6)}`;
}

/**
 * Password used when `VITE_ADMIN_PASSWORD` is not configured.
 * Exported (and read as a default parameter, not inline in `App.tsx`) so the
 * `undefined` env path can be exercised directly in tests.
 */
export const ADMIN_PASSWORD_FALLBACK = 'zexor-demo';

/**
 * Resolves the admin studio password from a raw env value.
 * An `undefined` value (variable not set in `.env`) or a blank string
 * (e.g. `VITE_ADMIN_PASSWORD=` in `.env`) falls back to the demo password
 * instead of authenticating against an empty secret.
 */
export function resolveAdminPassword(envValue?: string): string {
  const raw = envValue ?? import.meta.env?.VITE_ADMIN_PASSWORD;
  const trimmed = raw?.trim();
  return trimmed ? trimmed : ADMIN_PASSWORD_FALLBACK;
}
