import {
  Building2,
  Car,
  Code2,
  CreditCard,
  Shirt,
  type LucideIcon,
} from 'lucide-react';
import type { Locale, Route } from '../types';
import { art } from './imagery';

/**
 * The five ZEXOR departments. Kept in one place so the landing-page portals,
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
    title: { en: 'Smart NFC Cards', ar: 'بطاقات NFC الذكية' },
    tagline: {
      en: 'Tap-to-share identity with a live 3D customizer.',
      ar: 'شارك هويتك بلمسة واحدة مع مُخصِّص ثلاثي الأبعاد.',
    },
    meta: { en: 'Elite · Social · Bespoke', ar: 'إيليت · سوشيال · مخصص' },
    image: art.cardsPortal,
    icon: CreditCard,
    accent: '#a6e6c4',
    span: 'wide',
  },
  {
    route: 'fashion',
    title: { en: 'Atelier & Streetwear', ar: 'أتيليه الأزياء' },
    tagline: {
      en: 'Heavyweight streetwear released in limited runs.',
      ar: 'أزياء ثقيلة بإصدارات محدودة وحصرية.',
    },
    meta: { en: 'Limited · 450 GSM', ar: 'إصدار محدود · 450 جرام' },
    image: art.hoodie,
    icon: Shirt,
    accent: '#e0b49d',
    span: 'wide',
  },
  {
    route: 'cars',
    title: { en: 'Vehicle Showroom', ar: 'معرض السيارات' },
    tagline: {
      en: 'Certified luxury cars with live inspection booking.',
      ar: 'سيارات فاخرة معتمدة مع حجز معاينة مباشر.',
    },
    meta: { en: 'Mercedes · BMW · Porsche', ar: 'مرسيدس · BMW · بورش' },
    image: '/images/showcase-vehicles.svg',
    icon: Car,
    accent: '#b8d8c7',
  },
  {
    route: 'property',
    title: { en: 'Real Estate', ar: 'العقارات الفاخرة' },
    tagline: {
      en: 'Villas, apartments and land across Egypt & KSA.',
      ar: 'فيلات وشقق وأراضٍ في مصر والسعودية.',
    },
    meta: { en: 'Sale · Rent · Off-plan', ar: 'بيع · إيجار · تحت الإنشاء' },
    image: '/images/showcase-estate.svg',
    icon: Building2,
    accent: '#a9c4e8',
  },
  {
    route: 'services',
    title: { en: 'Digital Studio', ar: 'الاستوديو الرقمي' },
    tagline: {
      en: 'Stores, platforms and apps engineered to convert.',
      ar: 'متاجر ومنصات وتطبيقات مبنية لتحقيق النتائج.',
    },
    meta: { en: 'Web · Commerce · Apps', ar: 'ويب · تجارة · تطبيقات' },
    image: art.studioPortal,
    icon: Code2,
    accent: '#9fd8e8',
    span: 'wide',
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
