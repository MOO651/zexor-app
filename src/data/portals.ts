import {
  Building2,
  Car,
  Code2,
  CreditCard,
  Shirt,
  Gem,
  type LucideIcon,
} from 'lucide-react';
import type { Locale, Route } from '../types';
import { art, photos } from './imagery';

/**
 * The six ZEXOR departments. Kept in one place so the landing-page portals,
 * the navigation bar and the admin dashboard all read from the same source of
 * truth (and so the order can be re-tuned without hunting through the app).
 */
export type Portal = {
  route: Route;
  title: Record<Locale, string>;
  tagline: Record<Locale, string>;
  meta: Record<Locale, string>;
  image: string;
  icon: LucideIcon;
  accent: string;
  /** `wide` marks a featured gateway that gets more visual weight. */
  span?: 'wide' | 'normal';
};

/**
 * A portal plus the plate number it shows, e.g. "01". The index is derived
 * from the array order rather than hand-written, so re-tuning the layout below
 * can never leave a plate numbered out of sequence.
 */
export type NumberedPortal = Portal & { index: string };

const ORDERED: Portal[] = [
  {
    route: 'cards',
    title: { en: 'ZEXOR LINK', ar: 'زكسور لينك' },
    tagline: {
      en: 'Tap-to-share identity with a live 3D customizer.',
      ar: 'شارك هويتك بلمسة واحدة مع مُخصِّص ثلاثي الأبعاد.',
    },
    meta: { en: 'Elite · Social · Bespoke', ar: 'إيليت · سوشيال · مخصص' },
    image: art.cardsPortal,
    icon: CreditCard,
    accent: 'var(--zx-mint)',
    span: 'wide',
  },
  {
    route: 'fashion',
    title: { en: 'ZEXOR FASHION', ar: 'أزياء زكسور' },
    tagline: {
      en: 'Heavyweight streetwear released in limited runs.',
      ar: 'أزياء ثقيلة بإصدارات محدودة وحصرية.',
    },
    meta: { en: 'Limited · 450 GSM', ar: 'إصدار محدود · 450 جرام' },
    image: photos.apparelLifestyle,
    icon: Shirt,
    accent: 'var(--zx-mint)',
    span: 'wide',
  },
  {
    route: 'services',
    title: { en: 'ZEXOR STUDIO', ar: 'استوديو زكسور' },
    tagline: {
      en: 'Stores, platforms and apps engineered to convert.',
      ar: 'متاجر ومنصات وتطبيقات مبنية لتحقيق النتائج.',
    },
    meta: { en: 'Web · Commerce · Apps', ar: 'ويب · تجارة · تطبيقات' },
    image: photos.studioWebsite,
    icon: Code2,
    accent: 'var(--zx-mint)',
    span: 'wide',
  },
  {
    route: 'cars',
    title: { en: 'ZEXOR MOTORS', ar: 'زكسور موتورز' },
    tagline: {
      en: 'Selected vehicles available to rent, with easy viewing requests.',
      ar: 'سيارات مختارة للإيجار، مع سهولة طلب المعاينة.',
    },
    meta: { en: 'Daily · Weekly · Monthly', ar: 'يومي · أسبوعي · شهري' },
    image: photos.vehicleCoupe,
    icon: Car,
    accent: 'var(--zx-mint)',
  },
  {
    route: 'property',
    title: { en: 'ZEXOR ESTATES', ar: 'زكسور إستيتس' },
    tagline: {
      en: 'Apartments, villas and spaces available to rent.',
      ar: 'شقق وفيلات ومساحات متاحة للإيجار.',
    },
    meta: { en: 'Monthly · Yearly · Selected spaces', ar: 'شهري · سنوي · مساحات مختارة' },
    image: photos.propertyVilla,
    icon: Building2,
    accent: 'var(--zx-mint)',
  },
  {
    route: 'antiques',
    title: { en: 'ZEXOR ARCHIVE', ar: 'زكسور أركايف' },
    tagline: {
      en: 'Vintage objects and distinctive finds, chosen for their character.',
      ar: 'قطع عتيقة واختيارات مميزة لكل قطعة فيها حكاية وطابع خاص.',
    },
    meta: { en: 'Vintage · Objects · Collectibles', ar: 'فينتاج · قطع مميزة · مقتنيات' },
    image: photos.studioStore,
    icon: Gem,
    accent: 'var(--zx-mint)',
  },
];

const pad = (n: number) => String(n).padStart(2, '0');

/** The departments in display order, each carrying its plate number. */
export const PORTALS: NumberedPortal[] = ORDERED.map((portal, i) => ({
  ...portal,
  index: pad(i + 1),
}));

/** Filters the five departments down to the ones the admin has enabled. */
export function visiblePortals(visibility: {
  cards: boolean;
  fashion: boolean;
  cars: boolean;
  property: boolean;
  services: boolean;
}): NumberedPortal[] {
  return PORTALS.filter((portal) => {
    const key = portal.route as keyof typeof visibility;
    return visibility[key] ?? true;
  });
}
