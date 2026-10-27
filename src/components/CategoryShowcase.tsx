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
  };
  categories?: DynamicCategory[];
};

/**
 * Lightweight department index: no background photography, video, scroll
 * animation, image decoding, or 3D transforms. Real department routes and
 * admin-controlled category labels remain unchanged.
 */
export function CategoryShowcase({ locale, isArabic, navigate, visible, categories = [] }: Props) {
  const portals = visiblePortals(visible);
  const Arrow = isArabic ? ArrowUpLeft : ArrowUpRight;

  if (portals.length === 0) return null;

  return (
    <section className="zx-department-index" aria-labelledby="zx-department-index-title">
      <div className="zx-department-index-head">
        <div>
          <span className="zx-department-index-kicker">
            {isArabic ? 'عالم ZEXOR — 01 / 06' : 'THE ZEXOR WORLDS — 01 / 06'}
          </span>
          <h2 id="zx-department-index-title">
            {isArabic ? 'اختار عالمك.' : 'Find your world.'}
          </h2>
          <p>
            {isArabic
              ? 'ستة اتجاهات مختلفة، تحت هوية واحدة. اختار القسم وادخل مباشرة.'
              : 'Six different directions, one identity. Choose a department and go straight in.'}
          </p>
        </div>
        <span className="zx-department-index-market">
          <Globe2 aria-hidden="true" />
          {isArabic ? 'مصر والسعودية' : 'EGYPT / KSA'}
        </span>
      </div>

      <div className="zx-department-list">
        {portals.map((portal) => {
          const Icon = portal.icon;
          const title = categories.find((category) => category.slug === portal.route)?.name[locale] ?? portal.title[locale];
          return (
            <button
              className="zx-department-link"
              key={portal.route}
              onClick={() => navigate(portal.route)}
              type="button"
            >
              <span className="zx-department-number">{portal.index}</span>
              <span className="zx-department-icon"><Icon aria-hidden="true" /></span>
              <span className="zx-department-copy">
                <span className="zx-department-title">{title}</span>
                <span className="zx-department-tagline">{portal.tagline[locale]}</span>
                <span className="zx-department-meta">{portal.meta[locale]}</span>
              </span>
              <span className="zx-department-arrow"><Arrow aria-hidden="true" /></span>
            </button>
          );
        })}
      </div>
      <div className="zx-department-index-foot">
        <span>{isArabic ? 'فكرة واحدة. عوالم متعددة.' : 'ONE POINT OF VIEW. MANY WORLDS.'}</span>
        <span>ZEXOR®</span>
      </div>
    </section>
  );
}
