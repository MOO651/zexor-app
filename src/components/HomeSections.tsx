import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
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
import type { DynamicCategory, Locale, Market, Route, SiteFaqItem } from '../types';
import { FAQ_ITEMS } from '../data/initialData';
import { publicAssetUrl } from '../utils';

type Common = { locale: Locale; isArabic: boolean };

/**
 * The official TikTok channel for the brand. Kept as a constant so the footer
 * link and any future reference stay in sync.
 */
const TIKTOK_HANDLE = 'zexor.digital.studio';
const TIKTOK_URL = `https://www.tiktok.com/@${TIKTOK_HANDLE}`;

/**
 * Instagram glyph, drawn inline for the same reason as TikTok.
 */
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

/**
 * Telegram glyph (paper plane), drawn inline for the same reason as TikTok.
 */
function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M9.8 15.3 9.6 19c.4 0 .6-.2.8-.4l1.9-1.8 3.9 2.9c.7.4 1.2.2 1.4-.7l2.6-12.1c.3-1.1-.4-1.6-1.1-1.3L2.9 10.4c-1.1.4-1.1 1.1-.2 1.4l4.8 1.5 11.1-7c.5-.3 1-.1.6.2" />
    </svg>
  );
}

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

export function FaqSection({
  locale,
  isArabic,
  items = FAQ_ITEMS,
  title,
  subtitle,
}: Common & {
  items?: SiteFaqItem[];
  title?: string;
  subtitle?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const reduceMotion = useReducedMotion();

  return (
    <section className="space-y-6">
      <div className="text-center">
        <span className="text-[9px] font-bold uppercase tracking-widest text-zx-text">
          {isArabic ? '06 / الأسئلة الشائعة' : '06 / FAQ'}
        </span>
        <h2 className="mt-1 text-2xl font-bold text-zx-text sm:text-3xl">
          {title || (isArabic ? 'كل ما تحتاج معرفته قبل الطلب' : 'Everything You Need to Know')}
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-xs leading-6 text-zx-text">
          {subtitle || (isArabic
            ? 'إجابات سريعة عن البطاقات والتوصيل والدفع وخدمات الاستوديو.'
            : 'Quick answers on cards, delivery, payments, and our studio services.')}
        </p>
      </div>

      <div className="mx-auto max-w-3xl space-y-3">
        {items.filter((item) => item.question[locale].trim() && item.answer[locale].trim()).map((item, i) => {
          const open = openIndex === i;
          return (
            <div
              className="overflow-hidden rounded-2xl border border-zx-border bg-zx-surface-raised/85 shadow-sm backdrop-blur-md"
              key={item.id}
            >
              <button
                aria-expanded={open}
                aria-controls={open ? `zx-faq-answer-${i}` : undefined}
                className="zx-faq-question flex w-full items-center justify-between gap-4 p-4 text-start"
                id={`zx-faq-question-${i}`}
                onClick={() => setOpenIndex(open ? null : i)}
                type="button"
              >
                <span className="text-sm font-bold text-zx-text">{item.question[locale]}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-zx-text transition-transform duration-300 motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    initial={{ height: 0, opacity: 0 }}
                    id={`zx-faq-answer-${i}`}
                    role="region"
                    aria-labelledby={`zx-faq-question-${i}`}
                    transition={{ duration: reduceMotion ? 0 : 0.25, ease: 'easeInOut' }}
                  >
                    <p className="px-4 pb-4 text-xs leading-6 text-zx-text">{item.answer[locale]}</p>
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
      <div className="relative overflow-hidden rounded-3xl border border-zx-border bg-zx-surface-raised/85 p-7 shadow-md backdrop-blur-md sm:p-9">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-e-10 -top-10 h-40 w-40 rounded-full bg-zx-mint/70 blur-3xl"
        />
        <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-zx-mint text-zx-mint-contrast">
          <Package className="h-5 w-5" />
        </span>
        <h3 className="relative mt-4 text-lg font-bold text-zx-text">
          {isArabic ? 'تتبّع طلبك لحظة بلحظة' : 'Track Your Order Live'}
        </h3>
        <p className="relative mt-2 text-xs leading-6 text-zx-text">
          {isArabic
            ? 'أدخل رقم الطلب لمتابعة حالة الشحن والتوصيل مباشرة، أو تواصل مع الفريق عبر واتساب.'
            : 'Enter your order number to follow shipping and delivery, or reach the team directly on WhatsApp.'}
        </p>
        <div className="relative mt-5 flex flex-wrap items-center gap-3">
          <button
            className="flex min-h-11 items-center gap-2 rounded-full bg-zx-cinematic px-6 text-xs font-bold text-zx-accent-contrast shadow-md transition-all hover:bg-zx-cinematic"
            onClick={onTrackOrder}
            type="button"
          >
            <Truck className="h-4 w-4" />
            {isArabic ? 'تتبّع الطلب' : 'Track Order'}
          </button>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-zx-text">
            <ShieldCheck className="h-3.5 w-3.5" />
            {isArabic ? 'بياناتك محفوظة على جهازك فقط' : 'Your data stays on your device'}
          </span>
        </div>
      </div>

      {/* Newsletter */}
      <div className="relative overflow-hidden rounded-3xl border border-zx-border bg-linear-to-br from-zx-cinematic to-zx-cinematic p-7 text-zx-accent-contrast shadow-md sm:p-9">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zx-surface-raised/15 text-zx-text-muted">
          <Sparkles className="h-5 w-5" />
        </span>
        <h3 className="mt-4 text-lg font-bold">{isArabic ? 'اشترك في نشرة الإصدارات' : 'Join the Drop List'}</h3>
        <p className="mt-2 text-xs leading-6 text-zx-accent-contrast/70">
          {isArabic
            ? 'كن أول من يعرف بالإصدارات المحدودة والعروض الحصرية على البطاقات والخدمات.'
            : 'Be the first to hear about limited drops and exclusive offers on cards and services.'}
        </p>

        {subscribed ? (
          <p className="mt-5 flex items-center gap-2 text-xs font-semibold text-zx-text-muted">
            <CheckCircle2 className="h-4 w-4" />
            {isArabic ? 'تم تسجيلك بنجاح، شكراً لك!' : 'You’re on the list. Thanks!'}
          </p>
        ) : (
          <form className="mt-5 flex flex-col gap-2 sm:flex-row" onSubmit={handleSubscribe} noValidate>
            <div className="relative flex-1">
              <Mail className="pointer-events-none absolute inset-s-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zx-text-secondary" />
              <input
                aria-label={isArabic ? 'البريد الإلكتروني' : 'Email address'}
                aria-describedby={error ? 'zx-newsletter-error' : undefined}
                aria-invalid={Boolean(error)}
                className="h-11 w-full rounded-full border border-zx-border/15 bg-zx-surface-raised/10 ps-9 pe-4 text-base text-zx-accent-contrast outline-none placeholder:text-zx-accent-contrast/65 focus:border-zx-border/40"
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
              className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-zx-surface-raised px-6 text-xs font-bold text-zx-text shadow-md transition-all hover:bg-zx-accent"
              type="submit"
            >
              <Send className="h-3.5 w-3.5" />
              {isArabic ? 'اشترك' : 'Subscribe'}
            </button>
          </form>
        )}
        {error && <p className="mt-2 text-xs font-semibold text-zx-text-secondary" id="zx-newsletter-error" role="alert">{error}</p>}
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
    instagramHandle?: string;
    instagramUrl?: string;
    telegramUsername?: string;
    brand: { name: string; logoUrl: string };
    content: { footerNote: Record<Locale, string> };
  };
  sectionVisibility: {
    cards: boolean;
    fashion: boolean;
    cars: boolean;
    property: boolean;
    services: boolean;
    pricing: boolean;
    calculator: boolean;
    reviews: boolean;
    tracking: boolean;
    contact: boolean;
  };
  market: Market;
  navigate: (route: Route) => void;
  onTrackOrder: () => void;
  categories?: DynamicCategory[];
};

export function SiteFooter({ isArabic, settings, sectionVisibility, market, navigate, onTrackOrder, categories = [] }: FooterProps) {
  const year = new Date().getFullYear();
  const whatsapp = market === 'eg' ? settings.whatsappEg : settings.whatsappKsa;
  const instagramHandle = settings.instagramHandle || 'zexor.digital.studio';
  const instagramUrl = settings.instagramUrl || `https://www.instagram.com/${instagramHandle}`;
  const instagramTitle = `Instagram · @${instagramHandle}`;
  const telegramUrl = `https://t.me/${settings.telegramUsername || 'ZexorStudio'}`;
  const isCategoryActive = (slug: string) => categories.find((category) => category.slug === slug)?.active ?? true;

  const shopLinks: { label: string; route: Route; slug: string }[] = [
    { label: categories.find((category) => category.slug === 'cards')?.name[isArabic ? 'ar' : 'en'] ?? (isArabic ? 'زكسور لينك' : 'ZEXOR LINK'), route: 'cards', slug: 'cards' },
    { label: categories.find((category) => category.slug === 'fashion')?.name[isArabic ? 'ar' : 'en'] ?? (isArabic ? 'أزياء زكسور' : 'ZEXOR FASHION'), route: 'fashion', slug: 'fashion' },
    { label: categories.find((category) => category.slug === 'cars')?.name[isArabic ? 'ar' : 'en'] ?? (isArabic ? 'زكسور موتورز' : 'ZEXOR MOTORS'), route: 'cars', slug: 'cars' },
    { label: categories.find((category) => category.slug === 'property')?.name[isArabic ? 'ar' : 'en'] ?? (isArabic ? 'زكسور إستيتس' : 'ZEXOR ESTATES'), route: 'property', slug: 'property' },
  ].filter((link) => isCategoryActive(link.slug) && sectionVisibility[link.slug as keyof typeof sectionVisibility]);

  const companyLinks: { label: string; route: Route }[] = [
    ...(isCategoryActive('services') && sectionVisibility.services ? [{ label: categories.find((category) => category.slug === 'services')?.name[isArabic ? 'ar' : 'en'] ?? (isArabic ? 'استوديو زكسور' : 'ZEXOR STUDIO'), route: 'services' as Route }] : []),
    ...(sectionVisibility.pricing ? [{ label: isArabic ? 'باقات البرمجة' : 'Pricing', route: 'pricing' as Route }] : []),
    ...(sectionVisibility.calculator ? [{ label: isArabic ? 'حاسبة التكلفة' : 'Calculator', route: 'calculator' as Route }] : []),
    ...(sectionVisibility.reviews ? [{ label: isArabic ? 'آراء العملاء' : 'Reviews', route: 'reviews' as Route }] : []),
  ];

  return (
    <footer className="zx-site-footer relative z-10 mt-10 border-t border-zx-border/70 bg-zx-surface-raised/70 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-5 gap-y-6 px-4 py-7 sm:gap-x-8 sm:px-8 sm:py-9 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:gap-10">
        {/* Brand */}
        <div className="col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2.5">
            {settings.brand.logoUrl && <img alt="" aria-hidden="true" className="h-9 w-9 rounded-xl border border-zx-border bg-zx-surface-raised object-contain p-1" data-no-photo-grade="true" src={publicAssetUrl(settings.brand.logoUrl)} />}
            <span className="text-[15px] font-bold tracking-[0.14em] text-zx-text">{settings.brand.name}</span>
          </div>
          {settings.content.footerNote[isArabic ? 'ar' : 'en'].trim() && (
            <p className="mt-3 max-w-xs text-sm leading-6 text-zx-text">
              {settings.content.footerNote[isArabic ? 'ar' : 'en']}
            </p>
          )}
        </div>

        {/* Shop */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-widest text-zx-text">
            {isArabic ? 'المتجر' : 'Shop'}
          </h4>
          <ul className="mt-4 space-y-2.5">
            {shopLinks.map((l) => (
              <li key={l.route}>
                <button
                  className="text-sm text-zx-text transition-colors hover:text-zx-text"
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
        {companyLinks.length > 0 && (
        <div>
          <h4 className="text-sm font-bold uppercase tracking-widest text-zx-text">
            {isArabic ? 'الشركة' : 'Company'}
          </h4>
          <ul className="mt-4 space-y-2.5">
            {companyLinks.map((l) => (
              <li key={l.route}>
                <button
                  className="text-sm text-zx-text transition-colors hover:text-zx-text"
                  onClick={() => navigate(l.route)}
                  type="button"
                >
                  {l.label}
                </button>
              </li>
            ))}
            {sectionVisibility.tracking && <li>
              <button
                className="text-sm text-zx-text transition-colors hover:text-zx-text"
                onClick={onTrackOrder}
                type="button"
              >
                {isArabic ? 'تتبّع الطلب' : 'Track Order'}
              </button>
            </li>}
          </ul>
        </div>
        )}

        {/* Contact */}
        {sectionVisibility.contact && <div className="col-span-2 lg:col-span-1">
          <h4 className="text-sm font-bold uppercase tracking-widest text-zx-text">
            {isArabic ? 'تواصل معنا' : 'Get in Touch'}
          </h4>
          <ul className="zx-footer-contact-list mt-4 space-y-3 text-sm text-zx-text">
            <li className="flex items-center gap-2">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zx-text" />
              <span>{isArabic ? 'مصر والسعودية' : 'Egypt & Saudi Arabia'}</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zx-text" />
              <a className="transition-colors hover:text-zx-text" dir="ltr" href={`mailto:${settings.supportEmail}`}>
                {settings.supportEmail}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <TikTokIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zx-text" />
              <a
                className="transition-colors hover:text-zx-text"
                dir="ltr"
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
            {sectionVisibility.contact && <li>
              <button
                className="inline-flex items-center gap-1.5 font-semibold text-zx-text transition-colors hover:text-zx-text"
                onClick={() => navigate('contact')}
                type="button"
              >
                {isArabic ? 'نموذج تواصل مباشر' : 'Contact form'}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </li>}
          </ul>
        </div>}
      </div>

      <div className="border-t border-zx-border/70 px-4 py-4 sm:px-8">
        <div className="mx-auto mb-4 flex max-w-7xl flex-wrap items-center justify-center gap-2">
          <a
            className="flex h-9 w-9 items-center justify-center rounded-full border border-zx-border text-zx-text transition-colors hover:bg-zx-mint"
            href={`https://wa.me/${whatsapp}`}
            rel="noreferrer"
            target="_blank"
            aria-label="WhatsApp"
          >
            <MessageCircle className="h-4 w-4" />
          </a>
          <a
            className="flex h-9 w-9 items-center justify-center rounded-full border border-zx-border text-zx-text transition-colors hover:bg-zx-mint"
            href={`mailto:${settings.supportEmail}`}
            aria-label="Email"
          >
            <Mail className="h-4 w-4" />
          </a>
          <a
            className="flex h-9 w-9 items-center justify-center rounded-full border border-zx-border text-zx-text transition-colors hover:bg-zx-mint"
            href={TIKTOK_URL}
            rel="noreferrer"
            target="_blank"
            aria-label="TikTok"
            title={`TikTok · @${TIKTOK_HANDLE}`}
          >
            <TikTokIcon className="h-4 w-4" />
          </a>
          <a
            className="flex h-9 w-9 items-center justify-center rounded-full border border-zx-border text-zx-text transition-colors hover:bg-zx-mint"
            href={instagramUrl}
            rel="noreferrer"
            target="_blank"
            aria-label="Instagram"
            title={instagramTitle}
          >
            <InstagramIcon className="h-4 w-4" />
          </a>
          <a
            className="flex h-9 w-9 items-center justify-center rounded-full border border-zx-border text-zx-text transition-colors hover:bg-zx-mint"
            href={telegramUrl}
            rel="noreferrer"
            target="_blank"
            aria-label="Telegram"
            title={telegramUrl}
          >
            <TelegramIcon className="h-4 w-4" />
          </a>
        </div>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-xs text-zx-text sm:flex-row">
          <span>
            © {year} ZEXOR. {isArabic ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-zx-text" />
            {isArabic ? 'صُنع بعناية في القاهرة والرياض.' : 'Crafted with care in Cairo & Riyadh.'}
          </span>
          <button
            aria-label={isArabic ? 'دخول لوحة الإدارة' : 'Open admin dashboard'}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-zx-border bg-zx-surface-raised/80 text-zx-text transition hover:border-zx-border hover:bg-zx-mint hover:text-zx-mint-contrast"
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
