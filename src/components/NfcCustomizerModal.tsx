import { lazy, Suspense, useMemo, useState } from 'react';
import { motion, useMotionValue, useReducedMotion } from 'framer-motion';
import {
  X,
  RotateCw,
  Globe2,
  Phone,
  Mail,
  UserCheck,
  ShoppingBag,
  ArrowUpRight,
  Sparkles,
  Link2,
} from 'lucide-react';
import type { Locale, Market, NfcCustomization, Product } from '../types';
import { useLowPowerDevice } from './useSceneProgress';
import { getNfcFinishColors } from '../data/nfcFinishColors';

const NfcHero3D = lazy(() => import('./NfcHero3D').then((module) => ({ default: module.NfcHero3D })));

type Props = {
  open: boolean;
  onClose: () => void;
  product: Product;
  locale: Locale;
  market: Market;
  onAddToCart: (product: Product, customization: NfcCustomization) => void;
  onOrderWhatsApp: (market: Market, message: string) => void;
};

function safeWebsiteUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function StaticCardPreview({
  formData,
  isArabic,
  flipped,
  reducedMotion,
  finish,
  finishLabel,
}: {
  formData: NfcCustomization;
  isArabic: boolean;
  flipped: boolean;
  reducedMotion: boolean;
  finish: NfcCustomization['finish'];
  finishLabel: string;
}) {
  const colors = getNfcFinishColors(finish);
  return (
    <motion.div
      animate={{ rotateY: flipped ? 180 : 0 }}
      className="relative aspect-[1.58/1] w-full rounded-2xl shadow-2xl perspective-[1000px]"
      style={{ transformStyle: 'preserve-3d' }}
      transition={{ duration: reducedMotion ? 0 : 0.6, ease: 'easeInOut' }}
    >
      <div
        className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl border border-zx-line p-5"
        style={{ backfaceVisibility: 'hidden', background: `linear-gradient(135deg, ${colors.bright}, ${colors.base})`, color: colors.text }}
      >
        <span className="text-[10px] font-bold tracking-[0.28em]">ZEXOR</span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold sm:text-base">{formData.fullName || (isArabic ? 'اسمك هنا' : 'Your Name')}</p>
          <p className="truncate text-[9px] text-zx-secondary">{formData.jobTitle}</p>
          <p className="truncate text-[8px] font-semibold tracking-wider text-zx-secondary">{formData.companyName}</p>
        </div>
        <div className="flex items-center justify-between border-t border-zx-line pt-2 text-[7px] tracking-wider">
          <span>{isArabic ? 'بطاقة NFC ذكية' : 'SMART NFC PASS'}</span>
          <span className="font-semibold">{finishLabel}</span>
        </div>
      </div>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-zx-line p-5 text-center"
        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: `linear-gradient(135deg, ${colors.bright}, ${colors.base})`, color: colors.text }}
      >
        <span className="text-[10px] font-bold tracking-widest">{isArabic ? 'قرّب هاتفك أو امسح الرمز' : 'TAP OR SCAN TO CONNECT'}</span>
        <span className="text-xs font-semibold">zexor.me/{formData.profileSlug || 'profile'}</span>
      </div>
    </motion.div>
  );
}

export function NfcCustomizerModal({
  open,
  onClose,
  product,
  locale,
  market,
  onAddToCart,
  onOrderWhatsApp,
}: Props) {
  const isArabic = locale === 'ar';
  const reduceMotion = useReducedMotion();
  const lowPower = useLowPowerDevice();
  const scrollProgress = useMotionValue(0);
  const [flipped, setFlipped] = useState(false);
  const [activeTab, setActiveTab] = useState<'card' | 'profile'>('card');

  const [formData, setFormData] = useState<NfcCustomization>({
    fullName: isArabic ? 'م. كريم الصاوي' : 'Karim El-Sawy',
    jobTitle: isArabic ? 'مؤسس ومدير إبداعي' : 'Founder & Creative Director',
    companyName: 'ZEXOR STUDIO',
    bio: isArabic
      ? 'نساعد العلامات التجارية على النمو بتصاميم وتجارب رقمية متفردة.'
      : 'Designing impactful digital products and connected brand experiences.',
    phone: '+20 100 555 6553',
    email: 'karim@zexor.studio',
    website: 'https://zexor.studio',
    socialHandle: '@karim.elsawy',
    finish: 'pearl',
    profileLinked: true,
    profileSlug: 'karim-elsawy',
  });
  const threeDCustomization = useMemo(() => ({
    finish: formData.finish,
    fullName: formData.fullName,
    jobTitle: formData.jobTitle,
    companyName: formData.companyName,
    profileSlug: formData.profileSlug,
    flipped,
  }), [flipped, formData.companyName, formData.finish, formData.fullName, formData.jobTitle, formData.profileSlug]);

  if (!open) return null;

  const finishes = [
    { id: 'pearl', label: isArabic ? 'لؤلؤي' : 'Pearl', bg: 'from-zx-ink via-zx-surface to-zx-surface' },
    { id: 'mint', label: isArabic ? 'نعناعي' : 'Mint', bg: 'from-zx-accent via-zx-primary to-zx-panel' },
    { id: 'rose', label: isArabic ? 'زمردي مصقول' : 'Brushed Emerald', bg: 'from-zx-emerald-bright via-zx-primary to-zx-cinematic' },
    { id: 'lilac', label: isArabic ? 'غابة عميقة' : 'Deep Forest', bg: 'from-zx-cinematic via-zx-surface-2 to-zx-primary' },
    { id: 'matte-black', label: isArabic ? 'أسود مطفي بريميوم' : 'Matte Obsidian', bg: 'from-zx-cinematic via-zx-cinematic to-zx-cinematic' },
  ] as const;

  const currentFinish = finishes.find((f) => f.id === formData.finish) ?? finishes[0];

  const handleFinishChange = (finishId: NfcCustomization['finish']) => {
    setFormData((prev) => ({ ...prev, finish: finishId }));
  };

  const handleAddAndClose = () => {
    onAddToCart(product, formData);
    onClose();
  };

  const handleWhatsAppDirect = () => {
    const text = isArabic
      ? `طلب تفصيل كارت NFC ذكي:
الاسم: ${formData.fullName}
المسمى: ${formData.jobTitle}
الشركة: ${formData.companyName}
الخامة: ${currentFinish.label}
ربط بروفايل مخصص: ${formData.profileLinked ? `نعم (${formData.profileSlug})` : 'لا'}
الهاتف: ${formData.phone}`
      : `Custom NFC Card Order:
Name: ${formData.fullName}
Title: ${formData.jobTitle}
Company: ${formData.companyName}
Finish: ${currentFinish.label}
Profile Linking: ${formData.profileLinked ? `Yes (${formData.profileSlug})` : 'No'}
Phone: ${formData.phone}`;
    onOrderWhatsApp(market, text);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-zx-cinematic p-3 backdrop-blur-md sm:p-5"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        aria-label={isArabic ? 'استوديو تخصيص بطاقة NFC' : 'NFC card customization studio'}
        aria-modal="true"
        animate={reduceMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
        className="relative flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2.2rem] border border-zx-line bg-zx-elevated shadow-2xl"
        exit={reduceMotion ? undefined : { opacity: 0, scale: 0.95, y: 10 }}
        initial={reduceMotion ? false : { opacity: 0, scale: 0.95, y: 10 }}
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zx-line px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zx-elevated text-zx-secondary">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-zx-ink">
                {isArabic ? 'استوديو تخصيص كروت NFC الذكية' : 'Smart NFC Card Studio & Profile Linking'}
              </h2>
              <p className="text-[10px] text-zx-secondary">
                {isArabic
                  ? 'صمم بطاقتك وشاهد مظهرها الحي قبل الطلب مع ربطها بصفحة بروفيل مخصصة'
                  : 'Customize your card live, pick finish & link it to your custom digital profile'}
              </p>
            </div>
          </div>
          <button
            aria-label="Close"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-zx-line text-zx-secondary hover:bg-zx-elevated"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* View Switcher: Card vs Mobile Profile */}
        <div className="flex border-b border-zx-line bg-zx-elevated px-6 py-2.5">
          <div className="flex rounded-full bg-zx-elevated p-1 shadow-xs">
            <button
              className={`min-h-11 rounded-full px-4 py-2 text-xs font-medium transition-all ${
                activeTab === 'card' ? 'bg-zx-cinematic text-zx-ink shadow-xs' : 'text-zx-secondary hover:text-zx-ink'
              }`}
              onClick={() => setActiveTab('card')}
              type="button"
            >
              {isArabic ? 'معاينة البطاقة 3D' : '3D Card Preview'}
            </button>
            <button
              className={`flex min-h-11 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-all ${
                activeTab === 'profile' ? 'bg-zx-cinematic text-zx-ink shadow-xs' : 'text-zx-secondary hover:text-zx-ink'
              }`}
              onClick={() => setActiveTab('profile')}
              type="button"
            >
              <Link2 className="h-3.5 w-3.5" />
              {isArabic ? 'معاينة البروفيل الرقمي (الموبايل)' : 'Digital Profile Preview (Mobile)'}
            </button>
          </div>
        </div>

        {/* Body Grid: Left Preview, Right Form */}
        <div className="grid flex-1 gap-6 overflow-y-auto p-5 sm:p-7 md:grid-cols-[1.1fr_1fr]">
          {/* Left: Preview Area */}
          <div className="flex flex-col items-center justify-center rounded-3xl border border-zx-line bg-zx-elevated p-6">
            {activeTab === 'card' ? (
              <div className="flex w-full flex-col items-center">
                <button
                  className="mb-4 inline-flex min-h-11 items-center gap-1.5 rounded-full border border-zx-line bg-zx-elevated px-3 py-2 text-[10px] font-medium text-zx-secondary shadow-xs hover:bg-zx-elevated"
                  onClick={() => setFlipped(!flipped)}
                  type="button"
                >
                  <RotateCw className="h-3 w-3" />
                  {isArabic
                    ? flipped
                      ? 'اقلب للوجه الأمامي'
                      : 'اقلب للوجه الخلفي'
                    : flipped
                      ? 'Flip to Front'
                      : 'Flip to Back'}
                </button>

                <div className="aspect-[1.58/1] w-full max-w-sm">
                  {lowPower || reduceMotion ? (
                    <StaticCardPreview
                      finish={formData.finish}
                      finishLabel={currentFinish.label}
                      flipped={flipped}
                      formData={formData}
                      isArabic={isArabic}
                      reducedMotion={Boolean(reduceMotion)}
                    />
                  ) : (
                    <Suspense
                      fallback={
                        <StaticCardPreview
                          finish={formData.finish}
                          finishLabel={currentFinish.label}
                          flipped={flipped}
                          formData={formData}
                          isArabic={isArabic}
                          reducedMotion={false}
                        />
                      }
                    >
                      <NfcHero3D customization={threeDCustomization} lowPower={lowPower} scrollProgress={scrollProgress} />
                    </Suspense>
                  )}
                </div>
              </div>
            ) : (
              /* Mobile Profile Preview */
              <div className="w-full max-w-xs">
                <div className="overflow-hidden rounded-[2.2rem] border-4 border-zx-line bg-zx-elevated shadow-xl">
                  {/* Phone Notch */}
                  <div className="flex justify-center bg-zx-cinematic py-1">
                    <span className="h-2 w-16 rounded-full bg-zx-cinematic" />
                  </div>
                  {/* Digital Profile Screen */}
                  <div className="p-4 text-center">
                    <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-tr from-zx-elevated to-zx-elevated text-lg font-bold text-zx-ink shadow-sm">
                      {formData.fullName.slice(0, 2)}
                    </div>
                    <h3 className="text-sm font-bold text-zx-ink">{formData.fullName}</h3>
                    <p className="text-[10px] text-zx-secondary">{formData.jobTitle}</p>
                    <p className="text-[9px] font-medium text-zx-secondary">{formData.companyName}</p>
                    {formData.bio && (
                      <p className="mx-auto mt-2 max-w-xs text-[9px] leading-4 text-zx-secondary">{formData.bio}</p>
                    )}

                    {/* Quick action buttons */}
                    <div className="mt-3 flex justify-center gap-2">
                      <a
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-zx-elevated text-zx-secondary"
                        href={`tel:${formData.phone}`}
                      >
                        <Phone className="h-3.5 w-3.5" />
                      </a>
                      <a
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-zx-elevated text-zx-secondary"
                        href={`mailto:${formData.email}`}
                      >
                        <Mail className="h-3.5 w-3.5" />
                      </a>
                      <a
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-zx-elevated text-zx-secondary"
                        aria-label={isArabic ? 'زيارة الموقع الإلكتروني' : 'Visit website'}
                        href={safeWebsiteUrl(formData.website)}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <Globe2 className="h-3.5 w-3.5" />
                      </a>
                    </div>

                    <button
                      className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full bg-zx-primary px-3 text-[10px] font-medium text-zx-on-primary shadow-xs"
                      type="button"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      {isArabic ? 'حفظ جهة الاتصال (vCard)' : 'Save to Contacts'}
                    </button>
                    <p className="mt-2 text-[7px] text-zx-secondary">
                      {isArabic ? 'يتم برمجتها وربطها أوتوماتيكياً مع الكارت الذكي' : 'Programmed & linked directly to your NFC card'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Customization Form Fields */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zx-secondary">
                {isArabic ? 'بيانات الكارت والهوية' : 'Card & Identity Details'}
              </h3>

              {/* Finish Selection */}
              <div className="mt-3">
                <label className="text-[10px] font-medium text-zx-secondary">
                  {isArabic ? 'اختر خامة ولون البطاقة:' : 'Choose Card Material & Finish:'}
                </label>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {finishes.map((f) => (
                    <button
                      className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3 py-2 text-[9px] font-medium transition-all ${
                        formData.finish === f.id
                          ? 'border-zx-line bg-zx-primary/20 text-zx-ink shadow-xs'
                          : 'border-zx-line bg-zx-elevated text-zx-secondary hover:border-zx-line'
                      }`}
                      key={f.id}
                      onClick={() => handleFinishChange(f.id)}
                      type="button"
                    >
                      <span className={`h-3 w-3 rounded-full border border-zx-line bg-linear-to-br ${f.bg}`} />
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Inputs */}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] text-zx-secondary" htmlFor="nfc-full-name">{isArabic ? 'الاسم بالكامل' : 'Full Name'}</label>
                  <input
                    className="mt-1 min-h-11 w-full rounded-xl border border-zx-line bg-zx-elevated px-3 text-xs text-zx-ink outline-none focus-visible:ring-2 focus-visible:ring-zx-primary"
                    id="nfc-full-name"
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    value={formData.fullName}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zx-secondary" htmlFor="nfc-job-title">{isArabic ? 'المسمى الوظيفي' : 'Job Title'}</label>
                  <input
                    className="mt-1 min-h-11 w-full rounded-xl border border-zx-line bg-zx-elevated px-3 text-xs text-zx-ink outline-none focus-visible:ring-2 focus-visible:ring-zx-primary"
                    id="nfc-job-title"
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    value={formData.jobTitle}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zx-secondary" htmlFor="nfc-company-name">{isArabic ? 'اسم الشركة أو العلامة' : 'Company Name'}</label>
                  <input
                    className="mt-1 min-h-11 w-full rounded-xl border border-zx-line bg-zx-elevated px-3 text-xs text-zx-ink outline-none focus-visible:ring-2 focus-visible:ring-zx-primary"
                    id="nfc-company-name"
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    value={formData.companyName}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zx-secondary" htmlFor="nfc-phone">{isArabic ? 'رقم الهاتف / واتساب' : 'Phone / WhatsApp'}</label>
                  <input
                    className="mt-1 min-h-11 w-full rounded-xl border border-zx-line bg-zx-elevated px-3 text-xs text-zx-ink outline-none focus-visible:ring-2 focus-visible:ring-zx-primary"
                    id="nfc-phone"
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    value={formData.phone}
                  />
                </div>
              </div>

              {/* Profile Linking Feature Toggle */}
              <div className="mt-4 rounded-2xl border border-zx-line bg-zx-elevated p-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-zx-secondary" />
                    <span className="text-xs font-semibold text-zx-ink">
                      {isArabic ? 'ربط الكارت الذكي بصفحة بروفيل ويب مخصصة' : 'Link Smart Card to Custom Web Profile'}
                    </span>
                  </div>
                  <input
                    checked={formData.profileLinked}
                    className="h-5 w-5 accent-zx-primary"
                    onChange={(e) => setFormData({ ...formData, profileLinked: e.target.checked })}
                    type="checkbox"
                  />
                </div>
                <p className="mt-1.5 text-[9px] leading-4 text-zx-secondary">
                  {isArabic
                    ? 'يتم إعداد وبرمجة صفحة بروفيل شخصية سريعة ومتجاوبة على سيرفرات ZEXOR تفتح تلقائياً عند تقريب الهاتف من الكارت.'
                    : 'We program and host a responsive personal profile page that opens automatically when someone taps your card.'}
                </p>
                {formData.profileLinked && (
                  <div className="mt-2.5 flex items-center rounded-xl border border-zx-line bg-zx-elevated px-3 py-1.5 text-xs text-zx-ink">
                    <span className="text-zx-secondary">zexor.me/</span>
                    <input
                      className="min-h-11 min-w-0 flex-1 bg-transparent font-medium outline-none focus-visible:ring-2 focus-visible:ring-zx-primary"
                      onChange={(e) => setFormData({ ...formData, profileSlug: e.target.value })}
                      placeholder="username"
                      value={formData.profileSlug}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Price & Actions */}
            <div className="border-t border-zx-line pt-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-zx-secondary">{isArabic ? 'السعر التقديري:' : 'Indicative Price:'}</span>
                <span className="text-base font-bold text-zx-ink">
                  {market === 'eg' ? `${product.price.eg} ج.م` : `${product.price.ksa} ر.س`}
                </span>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-zx-primary px-4 text-xs font-semibold text-zx-on-primary shadow-md transition-all hover:bg-zx-primary-hover"
                  onClick={handleAddAndClose}
                  type="button"
                >
                  <ShoppingBag className="h-4 w-4" />
                  {isArabic ? 'إضافة إلى السلة بالتخصيص' : 'Add Custom Card to Cart'}
                </button>
                <button
                  className="flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-zx-line bg-zx-elevated px-4 text-xs font-semibold text-zx-secondary shadow-xs hover:bg-zx-elevated"
                  onClick={handleWhatsAppDirect}
                  type="button"
                >
                  <ArrowUpRight className="h-4 w-4" />
                  {isArabic ? 'طلب مباشر عبر واتساب' : 'Order via WhatsApp'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
