import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Globe2, Sparkles } from 'lucide-react';
import { PORTALS, visiblePortals, type NumberedPortal } from '../data/portals';
import type { DynamicCategory, Locale, Route } from '../types';

type Props = {
  locale: Locale;
  isArabic: boolean;
  navigate: (route: Route) => void;
  visible: {
    cards: boolean;
    fashion: boolean;
    cars: boolean;
    property: boolean;
    services: boolean;
  };
  categories?: DynamicCategory[];
};

function DepartmentTile({
  portal,
  title,
  locale,
  isArabic,
  index,
  reduceMotion,
  navigate,
}: {
  portal: NumberedPortal;
  title: string;
  locale: Locale;
  isArabic: boolean;
  index: number;
  reduceMotion: boolean;
  navigate: (route: Route) => void;
}) {
  const Icon = portal.icon;

  return (
    <motion.button
      aria-label={`${title} — ${portal.tagline[locale]}`}
      className="zx-department-tile group relative flex min-h-44 w-full overflow-hidden text-start sm:min-h-72 xl:min-h-100"
      initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
      onClick={() => navigate(portal.route)}
      style={{ transformPerspective: 1000, transformStyle: 'preserve-3d' }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      type="button"
      viewport={{ once: true, margin: '1000px 0px' }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      whileHover={reduceMotion ? undefined : { y: -7, rotateX: 2, rotateY: isArabic ? -1.5 : 1.5, scale: 1.012 }}
      whileTap={reduceMotion ? undefined : { scale: 0.985, rotateX: -1.5 }}
    >
      <img
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.045]"
        width={1200}
        height={800}
        loading="lazy"
        src={portal.image}
      />
      <span aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-zx-cinematic/95 via-zx-cinematic/25 to-zx-cinematic/5" />
      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2" style={{ background: `linear-gradient(0deg, color-mix(in srgb, ${portal.accent} 13%, transparent), transparent)` }} />

      <span className="relative flex w-full flex-col justify-between p-4 text-zx-accent-contrast sm:p-5">
        <span className="flex items-start justify-between gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-zx-border/25 bg-zx-surface-raised/10 backdrop-blur-md">
            <Icon className="h-4 w-4" />
          </span>
          <span className="font-mono text-xs tracking-[.12em] text-zx-accent-contrast/75">{portal.index} / {String(PORTALS.length).padStart(2, '0')}</span>
        </span>

        <span className="mt-5 block sm:mt-12">
          <span className="block text-xs font-bold uppercase tracking-[.12em]" style={{ color: portal.accent }}>{portal.meta[locale]}</span>
          <span className="zx-display mt-2 block text-xl leading-tight sm:text-2xl">{title}</span>
          <span className="mt-2 hidden max-w-72 text-xs leading-6 text-zx-accent-contrast/80 sm:block">{portal.tagline[locale]}</span>
          <span className="mt-2 inline-flex items-center gap-2 text-xs font-bold sm:mt-4">
            {isArabic ? 'استكشف القسم' : 'Explore department'}
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-zx-border/30 bg-zx-surface-raised/10 transition group-hover:bg-zx-surface-raised group-hover:text-zx-text">
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </span>
        </span>
      </span>
    </motion.button>
  );
}

/** Five image-led gateways form a calm, consistent directory for the store. */
export function CategoryShowcase({ locale, isArabic, navigate, visible, categories = [] }: Props) {
  const reduceMotion = useReducedMotion();
  const portals = visiblePortals(visible);

  if (portals.length === 0) return null;

  return (
    <section className="zx-department-board space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="zx-eyebrow text-zx-text">
            {isArabic ? 'عالم ZEXOR' : 'THE ZEXOR COLLECTION'}
          </span>
          <h2 className="zx-display mt-2 text-3xl text-zx-text sm:text-4xl">
            {isArabic ? 'اختار القسم اللي بتدور عليه' : 'Choose the department you need'}
          </h2>
          <p className="mt-2 max-w-xl text-xs leading-6 text-zx-text">
            {isArabic ? 'اختر القسم الذي تبحث عنه، وانتقل مباشرة إلى تفاصيله.' : 'Choose a department to explore its products, services and details.'}
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-zx-border bg-zx-surface-raised px-3.5 py-2 text-xs font-semibold text-zx-text">
          <Globe2 className="h-3.5 w-3.5 text-zx-text" />
          {isArabic ? 'مصر والسعودية' : 'Egypt & Saudi Arabia'}
          <Sparkles className="h-3 w-3 text-zx-text-secondary" />
        </span>
      </div>

      <div className="zx-department-grid grid grid-cols-2 gap-3 xl:grid-cols-5">
        {portals.map((portal, index) => (
          <DepartmentTile
            index={index}
            isArabic={isArabic}
            key={portal.route}
            locale={locale}
            navigate={navigate}
            portal={portal}
            reduceMotion={Boolean(reduceMotion)}
            title={categories.find((category) => category.slug === portal.route)?.name[locale] ?? portal.title[locale]}
          />
        ))}
      </div>
    </section>
  );
}
