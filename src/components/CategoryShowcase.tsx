import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowUpRight,
  BadgeCheck,
  Building2,
  Car,
  Code2,
  CreditCard,
  Shirt,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import type { Locale, Route } from '../types';

export type ShowcaseTile = {
  route: Route;
  title: Record<Locale, string>;
  tagline: Record<Locale, string>;
  meta: Record<Locale, string>;
  image: string;
  icon: LucideIcon;
  /** Stagger weight — larger tiles read as "featured". */
  span?: 'wide' | 'normal';
};

type Props = {
  locale: Locale;
  isArabic: boolean;
  navigate: (route: Route) => void;
  /** Which built-in sections the admin enabled. */
  visible: {
    cards: boolean;
    fashion: boolean;
    cars: boolean;
    property: boolean;
    services: boolean;
  };
};

/**
 * Image-driven entry points for every department. Clicking a tile routes
 * straight into its section — the "department board" the brand needed.
 */
export function CategoryShowcase({ locale, isArabic, navigate, visible }: Props) {
  const reduce = useReducedMotion();

  const all: ShowcaseTile[] = [
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
      span: 'wide',
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
      span: 'wide',
    },
    {
      route: 'cards',
      title: { en: 'Smart NFC Cards', ar: 'بطاقات NFC' },
      tagline: {
        en: 'Tap-to-share identity with a 3D live customizer.',
        ar: 'شارك هويتك بلمسة مع مُخصِّص ثلاثي الأبعاد.',
      },
      meta: { en: 'Elite · Social · Bespoke', ar: 'إيليت · سوشيال · مخصص' },
      image: '/images/nfc-card.jpg',
      icon: CreditCard,
    },
    {
      route: 'fashion',
      title: { en: 'Atelier Drop', ar: 'أتيليه الأزياء' },
      tagline: {
        en: 'Heavyweight streetwear released in limited runs.',
        ar: 'أزياء ثقيلة بإصدارات محدودة وحصرية.',
      },
      meta: { en: 'Limited · 450 GSM', ar: 'إصدار محدود · 450 جرام' },
      image: '/images/streetwear-hoodie.jpg',
      icon: Shirt,
    },
    {
      route: 'services',
      title: { en: 'Digital Studio', ar: 'الاستوديو الرقمي' },
      tagline: {
        en: 'Stores, platforms and apps built to convert.',
        ar: 'متاجر ومنصات وتطبيقات مبنية لتحقيق النتائج.',
      },
      meta: { en: 'Web · Commerce · Apps', ar: 'مواقع · متاجر · تطبيقات' },
      image: '/images/digital-studio.jpg',
      icon: Code2,
    },
  ];

  const tiles = all.filter((t) => {
    if (t.route === 'cards') return visible.cards;
    if (t.route === 'fashion') return visible.fashion;
    if (t.route === 'cars') return visible.cars;
    if (t.route === 'property') return visible.property;
    if (t.route === 'services') return visible.services;
    return true;
  });

  if (tiles.length === 0) return null;

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <span className="zx-eyebrow text-[#5e8b75]">
            {isArabic ? '٠٠ / أقسام ZEXOR' : '00 / THE HOUSE OF ZEXOR'}
          </span>
          <h2 className="zx-display mt-2 text-3xl text-[#21362b] sm:text-4xl">
            {isArabic ? 'اختر عالمك وابدأ' : 'Choose Your World'}
          </h2>
          <p className="mt-2 max-w-lg text-xs leading-6 text-[#6c7d73]">
            {isArabic
              ? 'خمسة أقسام متكاملة — اضغط على أي قسم للدخول مباشرة إلى معرضه الكامل.'
              : 'Five complete departments — tap any card to enter its full showroom.'}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#dfe7e1] bg-white/70 px-3 py-1.5 text-[10px] font-semibold text-[#5e8b75]">
          <BadgeCheck className="h-3.5 w-3.5" />
          {isArabic ? 'معتمد في مصر والسعودية' : 'Certified in Egypt & KSA'}
        </span>
      </div>

      <div className="grid auto-rows-[14rem] gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile, i) => {
          const Icon = tile.icon;
          const wide = tile.span === 'wide';
          return (
            <motion.button
              className={`zx-tile group min-h-56 relative border border-white/70 bg-[#16241d] text-start shadow-lg ${
                wide ? 'sm:col-span-2 lg:row-span-2' : 'sm:col-span-1'
              }`}
              initial={reduce ? undefined : { opacity: 0, y: 22 }}
              key={tile.route}
              onClick={() => navigate(tile.route)}
              transition={{ duration: 0.55, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              type="button"
              viewport={{ once: true, margin: '-60px' }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              whileTap={{ scale: 0.985 }}
            >
              <img
                alt={tile.title[locale]}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
                src={tile.image}
              />
              {/* readability scrim */}
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-linear-to-t from-[#06100b]/94 via-[#06100b]/45 to-[#06100b]/12 transition-opacity duration-500 group-hover:from-[#06100b]/96"
              />
              {/* accent ring on hover */}
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-[1.75rem] border border-transparent transition-colors duration-500 group-hover:border-[#a6e6c4]/55"
              />

              <span className="relative flex h-full flex-col justify-between p-5 sm:p-6">
                <span className="flex items-start justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/25 bg-white/12 text-white backdrop-blur-md">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/12 text-white backdrop-blur-md transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </span>

                <span>
                  <span className="zx-eyebrow block text-[#a6e6c4]">{tile.meta[locale]}</span>
                  <span
                    className={`zx-display mt-1.5 block text-white ${
                      wide ? 'text-2xl sm:text-3xl' : 'text-xl'
                    }`}
                  >
                    {tile.title[locale]}
                  </span>
                  <span className="mt-1.5 block text-[11px] leading-5 text-white/72">
                    {tile.tagline[locale]}
                  </span>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-bold text-[#a6e6c4]">
                    <Sparkles className="h-3 w-3" />
                    {isArabic ? 'ادخل القسم' : 'Enter department'}
                  </span>
                </span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
