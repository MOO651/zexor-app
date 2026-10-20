import { lazy, Suspense, useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  X,
  Radio,
  Fingerprint,
  RotateCw,
  QrCode,
  Globe2,
  Phone,
  Mail,
  UserCheck,
  ShoppingBag,
  ArrowUpRight,
  Sparkles,
  Link2,
} from 'lucide-react';
import { useSiteAssets } from '../lib/siteMediaContext';
import type { Locale, Market, NfcCustomization, Product } from '../types';
import { publicAssetUrl } from '../utils';

const NfcLivePreview = lazy(() => import('./NfcLivePreview').then((module) => ({ default: module.NfcLivePreview })));

type Props = {
  open: boolean;
  onClose: () => void;
  product: Product;
  locale: Locale;
  market: Market;
  onAddToCart: (product: Product, customization: NfcCustomization) => void;
  onOrderWhatsApp: (market: Market, message: string) => void;
};

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
  const reduceMotion = useReducedMotion() ?? false;
  const { assets } = useSiteAssets();
  const modelAsset = assets['nfc.model'];
  const modelUrl = modelAsset?.source === 'published' && modelAsset.type === 'model'
    ? publicAssetUrl(modelAsset.url)
    : null;
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

  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose, open]);

  if (!open) return null;

  const finishes = [
    { id: 'pearl', label: isArabic ? 'لؤلؤي كريمي' : 'Cream & Sage', bg: 'from-zx-footer-text via-zx-sage to-zx-mint' },
    { id: 'mint', label: isArabic ? 'نعناعي منعش' : 'Mint Jade', bg: 'from-zx-mint via-zx-mint to-zx-accent' },
    { id: 'clay', label: isArabic ? 'طين دافئ' : 'Warm Clay', bg: 'from-zx-sand via-zx-highlight to-zx-accent' },
    { id: 'sage', label: isArabic ? 'سيج هادئ' : 'Soft Sage', bg: 'from-zx-sage via-zx-mint to-zx-accent' },
    { id: 'forest', label: isArabic ? 'أخضر الغابة' : 'Deep Forest', bg: 'from-zx-accent via-zx-cinematic to-zx-footer-bg' },
  ] as const;

  const currentFinish = finishes.find((f) => f.id === formData.finish) ?? finishes[0];
  const isDarkCard = currentFinish.id === 'forest';

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
      className="fixed inset-0 z-100 flex items-center justify-center bg-zx-cinematic/50 p-3 backdrop-blur-md sm:p-5"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="zx-nfc-customizer-dialog relative flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2.2rem] border border-zx-border/90 bg-zx-surface-raised shadow-2xl"
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        aria-labelledby="zx-nfc-customizer-title"
        aria-modal="true"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zx-border px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zx-mint text-zx-mint-contrast">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-zx-text" id="zx-nfc-customizer-title">
                {isArabic ? 'استوديو تخصيص كروت NFC الذكية' : 'Smart NFC Card Studio & Profile Linking'}
              </h2>
              <p className="text-[10px] text-zx-text">
                {isArabic
                  ? 'صمم بطاقتك وشاهد مظهرها الحي قبل الطلب مع ربطها بصفحة بروفيل مخصصة'
                  : 'Customize your card live, pick finish & link it to your custom digital profile'}
              </p>
            </div>
          </div>
          <button
            aria-label={isArabic ? 'إغلاق تخصيص البطاقة' : 'Close card customizer'}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-zx-border text-zx-text hover:bg-zx-mint"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* View Switcher: Card vs Mobile Profile */}
        <div className="flex border-b border-zx-border bg-zx-mint px-6 py-2.5">
          <div className="flex rounded-full bg-zx-surface-raised/90 p-1 shadow-xs">
            <button
              aria-pressed={activeTab === 'card'}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                activeTab === 'card' ? 'bg-zx-cinematic text-zx-accent-contrast shadow-xs' : 'text-zx-text hover:text-zx-text'
              }`}
              onClick={() => setActiveTab('card')}
              type="button"
            >
              {isArabic ? 'معاينة البطاقة 3D' : '3D Card Preview'}
            </button>
            <button
              aria-pressed={activeTab === 'profile'}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                activeTab === 'profile' ? 'bg-zx-cinematic text-zx-accent-contrast shadow-xs' : 'text-zx-text hover:text-zx-text'
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
          <div className="zx-nfc-preview-stage flex flex-col items-center justify-center rounded-3xl border border-zx-border bg-zx-mint p-6">
            {activeTab === 'card' ? (
              <div className="flex w-full flex-col items-center">
                <button
                  className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-zx-border bg-zx-surface-raised px-3 py-1.5 text-[10px] font-medium text-zx-text shadow-xs hover:bg-zx-mint"
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

                <div className="w-full max-w-sm perspective-[1000px]">
                  <Suspense fallback={
                    <motion.div
                      animate={{ rotateY: flipped ? 180 : 0 }}
                      className={`zx-nfc-preview-card relative aspect-[1.58/1] w-full rounded-2xl p-5 shadow-2xl ${currentFinish.id === 'pearl' ? 'zx-nfc-preview-card--metal' : ''}`}
                      transition={{ duration: 0.6, ease: 'easeInOut' }}
                    >
                      <div className="flex h-full flex-col justify-between rounded-xl border border-zx-border/50 p-4">
                        <span className="text-xs font-bold tracking-[0.28em]" dir="ltr">ZEXOR</span>
                        <span className="text-sm font-semibold">{formData.fullName || 'Your Name'}</span>
                        <span className="text-xs">{currentFinish.label}</span>
                      </div>
                    </motion.div>
                  }>
                  <NfcLivePreview finish={currentFinish.id} key={currentFinish.id} modelUrl={modelUrl} reducedMotion={reduceMotion}>
                  <motion.div
                    animate={{ rotateY: flipped ? 180 : 0 }}
                    className={`zx-nfc-preview-card relative aspect-[1.58/1] w-full rounded-2xl p-5 shadow-2xl transition-all duration-500 ${currentFinish.id === 'pearl' ? 'zx-nfc-preview-card--metal' : ''}`}
                    style={{
                      transformStyle: 'preserve-3d',
                      backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`,
                    }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                  >
                    {/* Front Side */}
                    <div
                      className={`absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl border p-5 ${
                        currentFinish.id === 'pearl'
                          ? 'zx-nfc-metal-face border-zx-border/80 text-zx-text'
                          : isDarkCard
                          ? 'border-zx-border/10 bg-linear-to-br from-zx-cinematic via-zx-cinematic to-zx-cinematic text-zx-accent-contrast'
                          : `border-zx-border/80 bg-linear-to-br ${currentFinish.bg} text-zx-text`
                      }`}
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <div className="absolute inset-2.5 rounded-xl border border-zx-border/30" />
                      <div className="relative z-10 flex items-start justify-between">
                        <div>
                          <p className={`text-[10px] font-bold tracking-[0.28em] ${isDarkCard ? 'text-zx-accent-contrast' : 'text-zx-text'}`}>
                            ZEXOR
                          </p>
                          <p className={`text-[7px] tracking-widest ${isDarkCard ? 'text-zx-text-secondary' : 'text-zx-text'}`}>
                            SMART NFC PASS
                          </p>
                        </div>
                        <Radio className={`h-4 w-4 ${isDarkCard ? 'text-zx-text-secondary' : 'text-zx-text'}`} />
                      </div>

                      <div className="relative z-10 my-auto flex items-center gap-3">
                        <span
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                            isDarkCard
                              ? 'border-zx-border/20 bg-zx-surface-raised/10 text-zx-text-secondary'
                              : 'border-zx-border/80 bg-zx-surface-raised/60 text-zx-text'
                          } shadow-xs`}
                        >
                          <Fingerprint className="h-6 w-6" strokeWidth={1.4} />
                        </span>
                        <div className="min-w-0">
                          <p className={`truncate text-sm font-semibold sm:text-base ${isDarkCard ? 'text-zx-accent-contrast' : 'text-zx-text'}`}>
                            {formData.fullName || 'Your Name'}
                          </p>
                          <p className={`truncate text-[9px] ${isDarkCard ? 'text-zx-text-secondary' : 'text-zx-text'}`}>
                            {formData.jobTitle || 'Your Job Title'}
                          </p>
                          <p className={`truncate text-[8px] font-semibold tracking-wider ${isDarkCard ? 'text-zx-text-secondary' : 'text-zx-text'}`}>
                            {formData.companyName || 'COMPANY'}
                          </p>
                        </div>
                      </div>

                      <div className="relative z-10 flex items-center justify-between border-t border-zx-border/25 pt-2 text-[7px] tracking-wider">
                        <span className={isDarkCard ? 'text-zx-accent-contrast/70' : 'text-zx-text'}>EDITION 2026</span>
                        <span className="font-semibold">{currentFinish.label}</span>
                      </div>
                    </div>

                    {/* Back Side */}
                    <div
                      className={`absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl border p-5 ${
                        currentFinish.id === 'pearl'
                          ? 'zx-nfc-metal-face border-zx-border/80 text-zx-text'
                          : isDarkCard
                          ? 'border-zx-border/10 bg-linear-to-br from-zx-cinematic via-zx-cinematic to-zx-cinematic text-zx-accent-contrast'
                          : `border-zx-border/80 bg-linear-to-br ${currentFinish.bg} text-zx-text`
                      }`}
                      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                      <div className="absolute inset-2.5 rounded-xl border border-zx-border/30" />
                      <div className="relative z-10 flex items-center justify-between">
                        <span className="text-[7px] font-bold tracking-widest text-zx-text">
                          TAP OR SCAN TO CONNECT
                        </span>
                        <span className="text-[8px] font-bold">NFC READY</span>
                      </div>

                      <div className="relative z-10 flex items-center justify-center gap-4 py-2">
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-zx-surface-raised p-1.5 shadow-md">
                          <QrCode className="h-full w-full text-zx-text" />
                        </div>
                        <div className="text-[8px] leading-4">
                          <p className="font-semibold">{isArabic ? 'رابط ملفك الرقمي:' : 'Digital Profile URL:'}</p>
                          <p className="font-mono text-zx-text">
                            zexor.me/{formData.profileSlug || 'profile'}
                          </p>
                          <p className="text-[7px] opacity-75">{formData.phone}</p>
                        </div>
                      </div>

                      <div className="relative z-10 flex justify-between text-[7px] opacity-75">
                        <span>ZEXOR CONNECTED ECOSYSTEM</span>
                        <span>EGYPT · SAUDI ARABIA</span>
                      </div>
                    </div>
                  </motion.div>
                  </NfcLivePreview>
                  </Suspense>
                </div>
              </div>
            ) : (
              /* Mobile Profile Preview */
              <div className="w-full max-w-xs">
                <div className="overflow-hidden rounded-[2.2rem] border-4 border-zx-border bg-zx-surface-raised shadow-xl">
                  {/* Phone Notch */}
                  <div className="flex justify-center bg-zx-cinematic py-1">
                    <span className="h-2 w-16 rounded-full bg-zx-cinematic" />
                  </div>
                  {/* Digital Profile Screen */}
                  <div className="p-4 text-center">
                    <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-tr from-zx-accent to-zx-accent text-lg font-bold text-zx-text shadow-sm">
                      {formData.fullName.slice(0, 2)}
                    </div>
                    <h3 className="text-sm font-bold text-zx-text">{formData.fullName}</h3>
                    <p className="text-[10px] text-zx-text">{formData.jobTitle}</p>
                    <p className="text-[9px] font-medium text-zx-text">{formData.companyName}</p>
                    {formData.bio && (
                      <p className="mx-auto mt-2 max-w-xs text-[9px] leading-4 text-zx-text">{formData.bio}</p>
                    )}

                    {/* Quick action buttons */}
                    <div className="mt-3 flex justify-center gap-2">
                      <a
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-zx-mint text-zx-mint-contrast"
                        href={`tel:${formData.phone}`}
                      >
                        <Phone className="h-3.5 w-3.5" />
                      </a>
                      <a
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-zx-mint text-zx-mint-contrast"
                        href={`mailto:${formData.email}`}
                      >
                        <Mail className="h-3.5 w-3.5" />
                      </a>
                      <a
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-zx-mint text-zx-mint-contrast"
                        href={formData.website}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <Globe2 className="h-3.5 w-3.5" />
                      </a>
                    </div>

                    <button
                      className="mt-3 inline-flex min-h-8 w-full items-center justify-center gap-1.5 rounded-full bg-zx-cinematic px-3 text-[10px] font-medium text-zx-accent-contrast shadow-xs"
                      type="button"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      {isArabic ? 'حفظ جهة الاتصال (vCard)' : 'Save to Contacts'}
                    </button>
                    <p className="mt-2 text-[7px] text-zx-text-secondary">
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
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zx-text">
                {isArabic ? 'بيانات الكارت والهوية' : 'Card & Identity Details'}
              </h3>

              {/* Finish Selection */}
              <div className="mt-3">
                <label className="text-[10px] font-medium text-zx-text">
                  {isArabic ? 'اختر خامة ولون البطاقة:' : 'Choose Card Material & Finish:'}
                </label>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {finishes.map((f) => (
                    <button
                      aria-pressed={formData.finish === f.id}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[9px] font-medium transition-all ${
                        formData.finish === f.id
                          ? 'border-zx-border bg-zx-mint text-zx-mint-contrast shadow-xs'
                          : 'border-zx-border bg-zx-surface-raised text-zx-text hover:border-zx-border'
                      }`}
                      key={f.id}
                      onClick={() => handleFinishChange(f.id)}
                      type="button"
                    >
                      <span className={`h-3 w-3 rounded-full border border-zx-border/10 bg-linear-to-br ${f.bg}`} />
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Inputs */}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] text-zx-text">{isArabic ? 'الاسم بالكامل' : 'Full Name'}</label>
                  <input
                    className="mt-1 h-9 w-full rounded-xl border border-zx-border bg-zx-surface-raised px-3 text-xs text-zx-text outline-none focus:border-zx-border"
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    value={formData.fullName}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zx-text">{isArabic ? 'المسمى الوظيفي' : 'Job Title'}</label>
                  <input
                    className="mt-1 h-9 w-full rounded-xl border border-zx-border bg-zx-surface-raised px-3 text-xs text-zx-text outline-none focus:border-zx-border"
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    value={formData.jobTitle}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zx-text">{isArabic ? 'اسم الشركة أو العلامة' : 'Company Name'}</label>
                  <input
                    className="mt-1 h-9 w-full rounded-xl border border-zx-border bg-zx-surface-raised px-3 text-xs text-zx-text outline-none focus:border-zx-border"
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    value={formData.companyName}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zx-text">{isArabic ? 'رقم الهاتف / واتساب' : 'Phone / WhatsApp'}</label>
                  <input
                    className="mt-1 h-9 w-full rounded-xl border border-zx-border bg-zx-surface-raised px-3 text-xs text-zx-text outline-none focus:border-zx-border"
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    value={formData.phone}
                  />
                </div>
              </div>

              {/* Profile Linking Feature Toggle */}
              <div className="mt-4 rounded-2xl border border-zx-border bg-zx-mint p-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-zx-text" />
                    <span className="text-xs font-semibold text-zx-text">
                      {isArabic ? 'ربط الكارت الذكي بصفحة بروفيل ويب مخصصة' : 'Link Smart Card to Custom Web Profile'}
                    </span>
                  </div>
                  <input
                    checked={formData.profileLinked}
                    className="h-4 w-4 accent-zx-accent"
                    onChange={(e) => setFormData({ ...formData, profileLinked: e.target.checked })}
                    type="checkbox"
                  />
                </div>
                <p className="mt-1.5 text-[9px] leading-4 text-zx-text">
                  {isArabic
                    ? 'يتم إعداد وبرمجة صفحة بروفيل شخصية سريعة ومتجاوبة على سيرفرات ZEXOR تفتح تلقائياً عند تقريب الهاتف من الكارت.'
                    : 'We program and host a responsive personal profile page that opens automatically when someone taps your card.'}
                </p>
                {formData.profileLinked && (
                  <div className="mt-2.5 flex items-center rounded-xl border border-zx-border bg-zx-surface-raised px-3 py-1.5 text-xs text-zx-text">
                    <span className="text-zx-text-secondary">zexor.me/</span>
                    <input
                      className="min-w-0 flex-1 bg-transparent font-medium outline-none"
                      onChange={(e) => setFormData({ ...formData, profileSlug: e.target.value })}
                      placeholder="username"
                      value={formData.profileSlug}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Price & Actions */}
            <div className="border-t border-zx-border pt-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-zx-text">{isArabic ? 'السعر التقديري:' : 'Indicative Price:'}</span>
                <span className="text-base font-bold text-zx-text">
                  {market === 'eg' ? `${product.price.eg} ج.م` : `${product.price.ksa} ر.س`}
                </span>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-zx-cinematic px-4 text-xs font-semibold text-zx-accent-contrast shadow-md transition-all hover:bg-zx-cinematic"
                  onClick={handleAddAndClose}
                  type="button"
                >
                  <ShoppingBag className="h-4 w-4" />
                  {isArabic ? 'إضافة إلى السلة بالتخصيص' : 'Add Custom Card to Cart'}
                </button>
                <button
                  className="flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-zx-border bg-zx-surface-raised px-4 text-xs font-semibold text-zx-text shadow-xs hover:bg-zx-mint"
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
