import type { Locale } from '../types';

type Props = { locale: Locale };

/** A quiet brand manifesto that connects the six departments into one identity. */
export function BrandIdentityBlock({ locale }: Props) {
  const isArabic = locale === 'ar';

  return (
    <section className="zx-brand-manifesto" aria-labelledby="zx-brand-manifesto-title" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="zx-brand-manifesto-copy">
        <span className="zx-brand-manifesto-kicker">
          {isArabic ? 'رؤية زكسور' : 'THE ZEXOR POINT OF VIEW'}
        </span>
        <h2 id="zx-brand-manifesto-title">
          <span>{isArabic ? 'هوية واحدة.' : 'One identity.'}</span>
          <span className="zx-brand-manifesto-accent">
            {isArabic ? 'ستة عوالم مختلفة.' : 'Six distinct worlds.'}
          </span>
        </h2>
        <p>
          {isArabic
            ? 'من البطاقات الذكية والأزياء إلى الإبداع الرقمي والسيارات والعقارات والقطع العتيقة؛ مجالات مختلفة تجمعها عناية واحدة بالتفاصيل وتجربة واضحة من البداية للنهاية.'
            : 'From connected identity and considered streetwear to digital craft, mobility, property and vintage finds — different disciplines, brought together by thoughtful design and a consistent experience.'}
        </p>
      </div>

      <div className="zx-brand-manifesto-mark" aria-hidden="true">
        <span className="zx-brand-manifesto-orbit zx-brand-manifesto-orbit-outer" />
        <span className="zx-brand-manifesto-orbit zx-brand-manifesto-orbit-inner" />
        <span className="zx-brand-manifesto-monogram">Z<span>/</span>X</span>
        <span className="zx-brand-manifesto-index">01 — 06</span>
        <span className="zx-brand-manifesto-caption">
          {isArabic ? 'تصميم · تقنية · أسلوب حياة' : 'DESIGN · TECHNOLOGY · LIFESTYLE'}
        </span>
      </div>
    </section>
  );
}
