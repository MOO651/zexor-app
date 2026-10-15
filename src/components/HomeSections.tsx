import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  Mail,
  MapPin,
  MessageCircle,
  LockKeyhole,
  Package,
  Send,
  ShieldCheck,
  Sparkles,
  Truck,
} from 'lucide-react';
import type { DynamicCategory, Locale, Market, Route } from '../types';
import { publicAssetUrl } from '../utils';

type Common = { locale: Locale; isArabic: boolean };

/**
 * The official TikTok channel for the brand. Kept as a constant so the footer
 * link and any future reference stay in sync.
 */
const TIKTOK_HANDLE = 'zexor.digtal.studio';
const TIKTOK_URL = `https://www.tiktok.com/@${TIKTOK_HANDLE}`;

/**
 * TikTok brand glyph. lucide-react ships no brand icons, so the mark is drawn
 * inline — it inherits `currentColor` like every other footer icon.
 */
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M16.5 2h-3v13.2a2.7 2.7 0 1 1-2.7-2.7c.24 0 .47.03.7.09V9.5a5.9 5.9 0 0 0-.7-.04 5.74 5.74 0 1 0 5.74 5.74V8.9a7.3 7.3 0 0 0 4.2 1.33V7.2a4.4 4.4 0 0 1-4.24-4.2V2Z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */

type FaqItem = { q: Record<Locale, string>; a: Record<Locale, string> };

const FAQ_ITEMS: FaqItem[] = [
  {
    q: { en: 'How does an NFC card work?', ar: 'كيف تعمل بطاقة NFC؟' },
    a: {
      en: 'You tap the card on any modern phone and your profile page opens instantly — no app, no scanning. We link it to your personal page, portfolio, or social accounts.',
      ar: 'تلمس البطاقة على أي هاتف حديث فتفتح صفحتك الشخصية فوراً — بدون تطبيق أو مسح. نربط البطاقة بصفحتك الشخصية أو أعمالك أو حساباتك الاجتماعية.',
    },
  },
  {
    q: { en: 'Can I customize the card with my own design?', ar: 'هل يمكنني تخصيص البطاقة بتصميمي؟' },
    a: {
      en: 'Yes. Use the 3D customizer to pick the finish, enter your details, and preview your card live before ordering. Custom artwork is also available on request.',
      ar: 'نعم. استخدم مُخصِّص الكارت ثلاثي الأبعاد لاختيار اللمسة النهائية وإدخال بياناتك ومعاينة الكارت قبل الطلب. كما يمكن تنفيذ تصميم خاص عند الطلب.',
    },
  },
  {
    q: { en: 'How long does delivery take?', ar: 'كم تستغرق مدة التوصيل؟' },
    a: {
      en: 'Orders inside Egypt usually arrive within 3–5 working days, and within 5–7 working days for Saudi Arabia. You receive a live tracking link the moment your order ships.',
      ar: 'طلبات مصر تصل عادة خلال ٣–٥ أيام عمل، والسعودية خلال ٥–٧ أيام عمل. ويصلك رابط تتبع مباشر لحظة شحن الطلب.',
    },
  },
  {
    q: { en: 'What payment methods do you accept?', ar: 'ما طرق الدفع المتاحة؟' },
    a: {
      en: 'Available payment methods depend on your country and appear at checkout. Contact us if you need help choosing one.',
      ar: 'تختلف وسائل الدفع المتاحة حسب بلدك، وستظهر لك عند إتمام الطلب. تواصل معنا لو محتاج مساعدة في اختيار وسيلة الدفع.',
    },
  },
  {
    q: { en: 'Do you build websites and stores for businesses?', ar: 'هل تبنون مواقع ومتاجر للشركات؟' },
    a: {
      en: 'Absolutely. ZEXOR Studio builds stores, platforms, and apps. Use the cost calculator for an initial estimate, then contact us to discuss your project.',
      ar: 'بالتأكيد. استوديو زكسور يصمّم ويطوّر المتاجر والمنصات والتطبيقات. استخدم حاسبة التكلفة للحصول على تقدير أولي ثم تواصل معنا للبدء.',
    },
  },
];

export function FaqSection({ locale, isArabic }: Common) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="space-y-6">
      <div className="text-center">
        <span className="text-[9px] font-bold uppercase tracking-widest text-[#5e8b75]">
          {isArabic ? '٦ / الأسئلة الشائعة' : '06 / FAQ'}
        </span>
        <h2 className="mt-1 text-2xl font-bold text-[#2d4236] sm:text-3xl">
          {isArabic ? 'كل ما تحتاج معرفته قبل الطلب' : 'Everything You Need to Know'}
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-xs leading-6 text-[#6c7d73]">
          {isArabic
            ? 'إجابات سريعة عن البطاقات والتوصيل والدفع وخدمات الاستوديو.'
            : 'Quick answers on cards, delivery, payments, and our studio services.'}
        </p>
      </div>

      <div className="mx-auto max-w-3xl space-y-3">
        {FAQ_ITEMS.map((item, i) => {
          const open = openIndex === i;
          return (
            <div
              className="overflow-hidden rounded-2xl border border-white bg-white/85 shadow-sm backdrop-blur-md"
              key={item.q[locale]}
            >
              <button
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-4 p-4 text-start"
                onClick={() => setOpenIndex(open ? null : i)}
                type="button"
              >
                <span className="text-sm font-bold text-[#2e4437]">{item.q[locale]}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-[#5e8b75] transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    initial={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                  >
                    <p className="px-4 pb-4 text-xs leading-6 text-[#6c7d73]">{item.a[locale]}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Order tracking CTA + newsletter                                     */
/* ------------------------------------------------------------------ */

type CtaProps = Common & {
  onTrackOrder: () => void;
  onSubscribe: (email: string) => void;
};

export function TrackingAndNewsletter({ isArabic, onTrackOrder, onSubscribe }: CtaProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError(isArabic ? 'يرجى إدخال بريد إلكتروني صحيح.' : 'Please enter a valid email address.');
      return;
    }
    setError('');
    onSubscribe(value);
    setSubscribed(true);
    setEmail('');
  };

  return (
    <section className="grid gap-5 lg:grid-cols-2">
      {/* Track order */}
      <div className="relative overflow-hidden rounded-3xl border border-white bg-white/85 p-7 shadow-md backdrop-blur-md sm:p-9">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-[#d8f0e6]/70 blur-3xl"
        />
        <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e7f4ed] text-[#35614a]">
          <Package className="h-5 w-5" />
        </span>
        <h3 className="relative mt-4 text-lg font-bold text-[#2d4236]">
          {isArabic ? 'تتبّع طلبك لحظة بلحظة' : 'Track Your Order Live'}
        </h3>
        <p className="relative mt-2 text-xs leading-6 text-[#6c7d73]">
          {isArabic
            ? 'أدخل رقم الطلب لمتابعة حالة الشحن والتوصيل مباشرة، أو تواصل مع الفريق عبر واتساب.'
            : 'Enter your order number to follow shipping and delivery, or reach the team directly on WhatsApp.'}
        </p>
        <div className="relative mt-5 flex flex-wrap items-center gap-3">
          <button
            className="flex min-h-11 items-center gap-2 rounded-full bg-[#314f43] px-6 text-xs font-bold text-white shadow-md transition-all hover:bg-[#436e5d]"
            onClick={onTrackOrder}
            type="button"
          >
            <Truck className="h-4 w-4" />
            {isArabic ? 'تتبّع الطلب' : 'Track Order'}
          </button>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#5e8b75]">
            <ShieldCheck className="h-3.5 w-3.5" />
            {isArabic ? 'بياناتك محفوظة على جهازك فقط' : 'Your data stays on your device'}
          </span>
        </div>
      </div>

      {/* Newsletter */}
      <div className="relative overflow-hidden rounded-3xl border border-white bg-linear-to-br from-[#22392e] to-[#141f19] p-7 text-white shadow-md sm:p-9">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-[#9fe0bd]">
          <Sparkles className="h-5 w-5" />
        </span>
        <h3 className="mt-4 text-lg font-bold">{isArabic ? 'اشترك في نشرة الإصدارات' : 'Join the Drop List'}</h3>
        <p className="mt-2 text-xs leading-6 text-white/70">
          {isArabic
            ? 'كن أول من يعرف بالإصدارات المحدودة والعروض الحصرية على البطاقات والخدمات.'
            : 'Be the first to hear about limited drops and exclusive offers on cards and services.'}
        </p>

        {subscribed ? (
          <p className="mt-5 flex items-center gap-2 text-xs font-semibold text-[#a6e6c4]">
            <CheckCircle2 className="h-4 w-4" />
            {isArabic ? 'تم تسجيلك بنجاح، شكراً لك!' : 'You’re on the list. Thanks!'}
          </p>
        ) : (
          <form className="mt-5 flex flex-col gap-2 sm:flex-row" onSubmit={handleSubscribe} noValidate>
            <div className="relative flex-1">
              <Mail className="pointer-events-none absolute inset-s-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8fa79a]" />
              <input
                aria-label={isArabic ? 'البريد الإلكتروني' : 'Email address'}
                className="h-11 w-full rounded-full border border-white/15 bg-white/10 ps-9 pe-4 text-xs text-white outline-none placeholder:text-white/45 focus:border-white/40"
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                placeholder={isArabic ? 'بريدك الإلكتروني' : 'Your email'}
                type="email"
                value={email}
              />
            </div>
            <button
              className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-6 text-xs font-bold text-[#1f382c] shadow-md transition-all hover:bg-[#a6e6c4]"
              type="submit"
            >
              <Send className="h-3.5 w-3.5" />
              {isArabic ? 'اشترك' : 'Subscribe'}
            </button>
          </form>
        )}
        {error && <p className="mt-2 text-[10px] font-semibold text-[#f2b8a8]">{error}</p>}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

type FooterProps = Common & {
  settings: {
    supportEmail: string;
    whatsappEg: string;
    whatsappKsa: string;
    brand: { name: string; logoUrl: string };
  };
  sectionVisibility: { cards: boolean; fashion: boolean; cars: boolean; property: boolean; services: boolean };
  market: Market;
  navigate: (route: Route) => void;
  onTrackOrder: () => void;
  categories?: DynamicCategory[];
};

export function SiteFooter({ isArabic, settings, sectionVisibility, market, navigate, onTrackOrder, categories = [] }: FooterProps) {
  const year = new Date().getFullYear();
  const whatsapp = market === 'eg' ? settings.whatsappEg : settings.whatsappKsa;
  const isCategoryActive = (slug: string) => categories.find((category) => category.slug === slug)?.active ?? true;

  const shopLinks: { label: string; route: Route; slug: string }[] = [
    { label: categories.find((category) => category.slug === 'cards')?.name[isArabic ? 'ar' : 'en'] ?? (isArabic ? 'زكسور لينك' : 'ZEXOR LINK'), route: 'cards', slug: 'cards' },
    { label: categories.find((category) => category.slug === 'fashion')?.name[isArabic ? 'ar' : 'en'] ?? (isArabic ? 'أزياء زكسور' : 'ZEXOR FASHION'), route: 'fashion', slug: 'fashion' },
    { label: categories.find((category) => category.slug === 'cars')?.name[isArabic ? 'ar' : 'en'] ?? (isArabic ? 'زكسور موتورز' : 'ZEXOR MOTORS'), route: 'cars', slug: 'cars' },
    { label: categories.find((category) => category.slug === 'property')?.name[isArabic ? 'ar' : 'en'] ?? (isArabic ? 'زكسور إستيتس' : 'ZEXOR ESTATES'), route: 'property', slug: 'property' },
  ].filter((link) => isCategoryActive(link.slug) && sectionVisibility[link.slug as keyof typeof sectionVisibility]);

  const companyLinks: { label: string; route: Route }[] = [
    ...(isCategoryActive('services') && sectionVisibility.services ? [{ label: categories.find((category) => category.slug === 'services')?.name[isArabic ? 'ar' : 'en'] ?? (isArabic ? 'استوديو زكسور' : 'ZEXOR STUDIO'), route: 'services' as Route }] : []),
    { label: isArabic ? 'باقات البرمجة' : 'Pricing', route: 'pricing' },
    { label: isArabic ? 'حاسبة التكلفة' : 'Calculator', route: 'calculator' },
    { label: isArabic ? 'آراء العملاء' : 'Reviews', route: 'reviews' },
  ];

  return (
    <footer className="zx-site-footer relative z-10 mt-16 border-t border-white/70 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-8 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2.5">
            {settings.brand.logoUrl && <img alt="" aria-hidden="true" className="h-9 w-9 rounded-xl border border-[#e2ebe5] bg-white object-contain p-1" src={publicAssetUrl(settings.brand.logoUrl)} />}
            <span className="text-[15px] font-bold tracking-[0.14em] text-[#34483e]">{settings.brand.name}</span>
          </div>
          <p className="mt-3 max-w-xs text-xs leading-6 text-[#6c7d73]">
            {isArabic
              ? `${settings.brand.name} — كروت ذكية وأزياء وخدمات رقمية، بتجربة واحدة واضحة.`
              : `${settings.brand.name} brings smart identity, considered apparel and digital services together in one place.`}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <a
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#dfe7e1] text-[#4d705d] transition-colors hover:bg-[#eef8f2]"
              href={`https://wa.me/${whatsapp}`}
              rel="noreferrer"
              target="_blank"
              aria-label="WhatsApp"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
            <a
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#dfe7e1] text-[#4d705d] transition-colors hover:bg-[#eef8f2]"
              href={`mailto:${settings.supportEmail}`}
              aria-label="Email"
            >
              <Mail className="h-4 w-4" />
            </a>
            <a
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#dfe7e1] text-[#4d705d] transition-colors hover:bg-[#eef8f2]"
              href={TIKTOK_URL}
              rel="noreferrer"
              target="_blank"
              aria-label="TikTok"
              title={`TikTok · @${TIKTOK_HANDLE}`}
            >
              <TikTokIcon className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Shop */}
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#5e8b75]">
            {isArabic ? 'المتجر' : 'Shop'}
          </h4>
          <ul className="mt-4 space-y-2.5">
            {shopLinks.map((l) => (
              <li key={l.route}>
                <button
                  className="text-xs text-[#6c7d73] transition-colors hover:text-[#2d4838]"
                  onClick={() => navigate(l.route)}
                  type="button"
                >
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#5e8b75]">
            {isArabic ? 'الشركة' : 'Company'}
          </h4>
          <ul className="mt-4 space-y-2.5">
            {companyLinks.map((l) => (
              <li key={l.route}>
                <button
                  className="text-xs text-[#6c7d73] transition-colors hover:text-[#2d4838]"
                  onClick={() => navigate(l.route)}
                  type="button"
                >
                  {l.label}
                </button>
              </li>
            ))}
            <li>
              <button
                className="text-xs text-[#6c7d73] transition-colors hover:text-[#2d4838]"
                onClick={onTrackOrder}
                type="button"
              >
                {isArabic ? 'تتبّع الطلب' : 'Track Order'}
              </button>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#5e8b75]">
            {isArabic ? 'تواصل معنا' : 'Get in Touch'}
          </h4>
          <ul className="mt-4 space-y-2.5 text-xs text-[#6c7d73]">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#5e8b75]" />
              <span>{isArabic ? 'مصر والسعودية' : 'Egypt & Saudi Arabia'}</span>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#5e8b75]" />
              <a className="transition-colors hover:text-[#2d4838]" href={`mailto:${settings.supportEmail}`}>
                {settings.supportEmail}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <TikTokIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#5e8b75]" />
              <a
                className="transition-colors hover:text-[#2d4838]"
                href={TIKTOK_URL}
                rel="noreferrer"
                target="_blank"
              >
                {/* Latin handle inside an RTL page — force LTR or the @ and
                    letters render in reverse. */}
                <span dir="ltr" className="inline-block">
                  @{TIKTOK_HANDLE}
                </span>
              </a>
            </li>
            <li>
              <button
                className="inline-flex items-center gap-1.5 font-semibold text-[#35614a] transition-colors hover:text-[#234333]"
                onClick={() => navigate('contact')}
                type="button"
              >
                {isArabic ? 'نموذج تواصل مباشر' : 'Contact form'}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/70 px-4 py-5 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-[10px] text-[#829288] sm:flex-row">
          <span>
            © {year} ZEXOR. {isArabic ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-[#5e8b75]" />
            {isArabic ? 'صُنع بعناية في القاهرة والرياض.' : 'Crafted with care in Cairo & Riyadh.'}
          </span>
          <button
            aria-label={isArabic ? 'دخول لوحة الإدارة' : 'Open admin dashboard'}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#dce7df] bg-white/80 text-[#71877a] transition hover:border-[#b8cfc0] hover:bg-[#edf5f0] hover:text-[#314f43]"
            onClick={() => navigate('dashboard')}
            title={isArabic ? 'لوحة الإدارة' : 'Admin dashboard'}
            type="button"
          >
            <LockKeyhole className="h-3 w-3" />
          </button>
        </div>
      </div>
    </footer>
  );
}
