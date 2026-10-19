import { MessageCircle, ShieldCheck } from 'lucide-react';
import type { Locale } from '../types';

type Props = {
  locale: Locale;
  onContact: () => void;
};

export function TestimonialsSection({ locale, onContact }: Props) {
  const isArabic = locale === 'ar';

  return (
    <section className="zx-feature-band relative overflow-hidden rounded-[2.5rem] p-6 shadow-xl sm:rounded-[3rem] sm:p-12">
      <div className="mx-auto max-w-2xl text-center">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-zx-surface-raised/80 text-zx-text shadow-sm">
          <ShieldCheck className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="mt-5 text-[9px] font-bold uppercase tracking-[0.22em] text-zx-text">
          {isArabic ? 'آراء العملاء' : 'CUSTOMER FEEDBACK'}
        </p>
        <h2 className="zx-display mt-2 text-3xl font-bold text-zx-text sm:text-4xl">
          {isArabic ? 'نشارك التجارب الحقيقية فقط' : 'Only real customer stories'}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-zx-text">
          {isArabic
            ? 'لا توجد تقييمات منشورة حتى الآن. ننشر رأي العميل بعد استلامه وموافقته على المشاركة.'
            : 'No reviews have been published yet. We share customer feedback only after receiving it and getting permission to publish.'}
        </p>
        <button
          className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-zx-cinematic px-6 text-xs font-semibold text-zx-accent-contrast shadow-md transition hover:bg-zx-cinematic"
          onClick={onContact}
          type="button"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          {isArabic ? 'شاركنا تجربتك عبر واتساب' : 'Share your experience on WhatsApp'}
        </button>
      </div>
    </section>
  );
}
