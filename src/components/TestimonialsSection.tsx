import { BadgeCheck, MessageCircle, PackageCheck, ShieldCheck } from 'lucide-react';
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
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-zx-elevated text-zx-secondary shadow-sm">
          <ShieldCheck className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="mt-5 text-[9px] font-bold uppercase tracking-[0.22em] text-zx-secondary">
          {isArabic ? 'آراء العملاء' : 'CUSTOMER FEEDBACK'}
        </p>
        <h2 className="zx-display mt-2 text-3xl font-bold text-zx-ink sm:text-4xl">
          {isArabic ? 'نشارك التجارب الحقيقية فقط' : 'Only real customer stories'}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-zx-secondary">
          {isArabic
            ? 'لا توجد تقييمات منشورة حتى الآن. ننشر رأي العميل بعد استلامه وموافقته على المشاركة.'
            : 'No reviews have been published yet. We share customer feedback only after receiving it and getting permission to publish.'}
        </p>
        <div className="mt-7 grid gap-3 text-start sm:grid-cols-3">
          {[
            { icon: PackageCheck, title: isArabic ? 'بعد استلام طلبك' : 'After delivery', body: isArabic ? 'ننتظر وصول تجربتك كاملة قبل طلب التقييم.' : 'We wait until your order has arrived before asking for feedback.' },
            { icon: MessageCircle, title: isArabic ? 'رأيك باختيارك' : 'Your choice', body: isArabic ? 'مشاركة التقييم اختيارية وبالطريقة التي تناسبك.' : 'Sharing feedback is always optional and on your terms.' },
            { icon: BadgeCheck, title: isArabic ? 'تجارب حقيقية' : 'Verified stories', body: isArabic ? 'لا ننشر إلا آراء حقيقية بعد موافقة أصحابها.' : 'We publish authentic feedback only with the customer’s permission.' },
          ].map(({ icon: Icon, title, body }) => <article className="rounded-2xl border border-zx-line bg-zx-elevated/70 p-4" key={title}>
            <Icon aria-hidden="true" className="h-5 w-5 text-zx-primary" />
            <h3 className="mt-3 text-sm font-bold text-zx-ink">{title}</h3>
            <p className="mt-1 text-xs leading-6 text-zx-secondary">{body}</p>
          </article>)}
        </div>
        <button
          className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-zx-primary px-6 text-xs font-semibold text-zx-on-primary shadow-md transition hover:bg-zx-primary-hover"
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
