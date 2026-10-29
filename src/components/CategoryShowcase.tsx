import { ArrowUpLeft, ArrowUpRight, Globe2 } from 'lucide-react';
import { visiblePortals } from '../data/portals';
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
    antiques?: boolean;
  };
  categories?: DynamicCategory[];
};

/** Photo-led editorial department tiles; routes and admin labels stay live. */
export function CategoryShowcase({ locale, isArabic, navigate, visible, categories = [] }: Props) {
  const portals = visiblePortals({ ...visible, antiques: visible.antiques ?? true });
  const Arrow = isArabic ? ArrowUpLeft : ArrowUpRight;
  if (portals.length === 0) return null;

  return (
    <section className="zx-department-index" aria-labelledby="zx-department-index-title">
      <div className="zx-department-index-head">
        <div>
          <span className="zx-department-index-kicker">
            {isArabic ? `عوالم زكسور — 01 / ${String(portals.length).padStart(2, '0')}` : `THE ZEXOR WORLDS — 01 / ${String(portals.length).padStart(2, '0')}`}
          </span>
          <h2 id="zx-department-index-title">
            {isArabic ? 'أكثر من مجرد علامة.' : 'One identity. Many worlds.'}
          </h2>
          <p>
            {isArabic
              ? 'من البطاقات الذكية والأزياء والخدمات الرقمية إلى السيارات والعقارات والقطع العتيقة — لكل عالم تجربته، وتجمعها هوية واحدة.'
              : 'Discover connected identity, considered fashion, digital services, vehicles, real estate and distinctive vintage finds — all under one identity.'}
          </p>
        </div>
        <span className="zx-department-index-market">
          <Globe2 aria-hidden="true" /> {isArabic ? 'مصر والسعودية' : 'EGYPT / KSA'}
        </span>
      </div>

      <div className="zx-department-tiles">
        {portals.map((portal, index) => {
          const Icon = portal.icon;
          const title = categories.find((category) => category.slug === portal.route)?.name[locale] ?? portal.title[locale];
          return (
            <button
              className={`zx-department-tile zx-department-tile-${index % 6}`}
              key={portal.route}
              style={{ backgroundImage: `url("${portal.image}")` }}
              onClick={() => navigate(portal.route)}
              type="button"
            >
              <span className="zx-tile-number">{String(index + 1).padStart(2, '0')}</span>
              <span className="zx-tile-icon"><Icon aria-hidden="true" /></span>
              <span className="zx-tile-content">
                <span className="zx-tile-kicker">{portal.meta[locale]}</span>
                <span className="zx-tile-title">{title}</span>
                <span className="zx-tile-description">{portal.tagline[locale]}</span>
              </span>
              <span className="zx-tile-action"><Arrow aria-hidden="true" /></span>
            </button>
          );
        })}
      </div>
      <div className="zx-department-index-foot">
        <span>{isArabic ? 'هوية واحدة. عوالم متعددة.' : 'ONE IDENTITY. MANY WORLDS.'}</span>
        <span>ZEXOR®</span>
      </div>
    </section>
  );
}
