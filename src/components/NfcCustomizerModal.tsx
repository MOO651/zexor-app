import { useState } from 'react';
import { motion } from 'framer-motion';
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
import type { Locale, Market, NfcCustomization, Product } from '../types';

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

  if (!open) return null;

  const finishes = [
    { id: 'pearl', label: isArabic ? 'لؤلؤي سبيشال' : 'Pearl White', bg: 'from-[#dcf4ef] via-[#faf8f2] to-[#ebdcd4]' },
    { id: 'mint', label: isArabic ? 'نعناعي منعش' : 'Mint Jade', bg: 'from-[#bfeade] via-[#eaf7f1] to-[#d6eee4]' },
    { id: 'rose', label: isArabic ? 'ذهبي وردي' : 'Rose Gold', bg: 'from-[#fde2d4] via-[#f9eee7] to-[#e7c7b8]' },
    { id: 'lilac', label: isArabic ? 'ليلكي ملكي' : 'Royal Lilac', bg: 'from-[#e4d8fb] via-[#f7f2fd] to-[#d8e6f8]' },
    { id: 'matte-black', label: isArabic ? 'أسود مطفي بريميوم' : 'Matte Obsidian', bg: 'from-[#1a2320] via-[#212f2a] to-[#121916]' },
  ] as const;

  const currentFinish = finishes.find((f) => f.id === formData.finish) ?? finishes[0];
  const isDarkCard = formData.finish === 'matte-black';

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
      className="fixed inset-0 z-100 flex items-center justify-center bg-[#17231e]/50 p-3 backdrop-blur-md sm:p-5"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2.2rem] border border-white/90 bg-[#fbfdfa] shadow-2xl"
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e9eeeb] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e5f4ec] text-[#4f7d67]">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-[#2f4239]">
                {isArabic ? 'استوديو تخصيص كروت NFC الذكية' : 'Smart NFC Card Studio & Profile Linking'}
              </h2>
              <p className="text-[10px] text-[#7d8b83]">
                {isArabic
                  ? 'صمم بطاقتك وشاهد مظهرها الحي قبل الطلب مع ربطها بصفحة بروفيل مخصصة'
                  : 'Customize your card live, pick finish & link it to your custom digital profile'}
              </p>
            </div>
          </div>
          <button
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e2eae4] text-[#6d7d74] hover:bg-[#f0f4f1]"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* View Switcher: Card vs Mobile Profile */}
        <div className="flex border-b border-[#edf1ee] bg-[#f5f8f5] px-6 py-2.5">
          <div className="flex rounded-full bg-white/90 p-1 shadow-xs">
            <button
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                activeTab === 'card' ? 'bg-[#314f43] text-white shadow-xs' : 'text-[#6f8076] hover:text-[#314f43]'
              }`}
              onClick={() => setActiveTab('card')}
              type="button"
            >
              {isArabic ? 'معاينة البطاقة 3D' : '3D Card Preview'}
            </button>
            <button
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                activeTab === 'profile' ? 'bg-[#314f43] text-white shadow-xs' : 'text-[#6f8076] hover:text-[#314f43]'
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
          <div className="flex flex-col items-center justify-center rounded-3xl border border-[#e8edeb] bg-[#f4f7f4] p-6">
            {activeTab === 'card' ? (
              <div className="flex w-full flex-col items-center">
                <button
                  className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[#d6e3da] bg-white px-3 py-1.5 text-[10px] font-medium text-[#4f6f5e] shadow-xs hover:bg-[#edf5f0]"
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
                  <motion.div
                    animate={{ rotateY: flipped ? 180 : 0 }}
                    className="relative aspect-[1.58/1] w-full rounded-2xl p-5 shadow-2xl transition-all duration-500"
                    style={{
                      transformStyle: 'preserve-3d',
                      backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`,
                    }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                  >
                    {/* Front Side */}
                    <div
                      className={`absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl border p-5 ${
                        isDarkCard
                          ? 'border-white/10 bg-linear-to-br from-[#1a2320] via-[#212f2a] to-[#121916] text-white'
                          : `border-white/80 bg-linear-to-br ${currentFinish.bg} text-[#27382f]`
                      }`}
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <div className="absolute inset-2.5 rounded-xl border border-white/30" />
                      <div className="relative z-10 flex items-start justify-between">
                        <div>
                          <p className={`text-[10px] font-bold tracking-[0.28em] ${isDarkCard ? 'text-white' : 'text-[#2b3c33]'}`}>
                            ZEXOR
                          </p>
                          <p className={`text-[7px] tracking-widest ${isDarkCard ? 'text-[#87a393]' : 'text-[#778b7f]'}`}>
                            SMART NFC PASS
                          </p>
                        </div>
                        <Radio className={`h-4 w-4 ${isDarkCard ? 'text-[#64b88f]' : 'text-[#5d8b74]'}`} />
                      </div>

                      <div className="relative z-10 my-auto flex items-center gap-3">
                        <span
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                            isDarkCard
                              ? 'border-white/20 bg-white/10 text-[#71caa0]'
                              : 'border-white/80 bg-white/60 text-[#54806b]'
                          } shadow-xs`}
                        >
                          <Fingerprint className="h-6 w-6" strokeWidth={1.4} />
                        </span>
                        <div className="min-w-0">
                          <p className={`truncate text-sm font-semibold sm:text-base ${isDarkCard ? 'text-white' : 'text-[#24372e]'}`}>
                            {formData.fullName || 'Your Name'}
                          </p>
                          <p className={`truncate text-[9px] ${isDarkCard ? 'text-[#a2bcaf]' : 'text-[#6b7d72]'}`}>
                            {formData.jobTitle || 'Your Job Title'}
                          </p>
                          <p className={`truncate text-[8px] font-semibold tracking-wider ${isDarkCard ? 'text-[#77caa2]' : 'text-[#507d67]'}`}>
                            {formData.companyName || 'COMPANY'}
                          </p>
                        </div>
                      </div>

                      <div className="relative z-10 flex items-center justify-between border-t border-white/25 pt-2 text-[7px] tracking-wider">
                        <span className={isDarkCard ? 'text-white/70' : 'text-[#63796d]'}>EDITION 2026</span>
                        <span className="font-semibold">{currentFinish.label}</span>
                      </div>
                    </div>

                    {/* Back Side */}
                    <div
                      className={`absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl border p-5 ${
                        isDarkCard
                          ? 'border-white/10 bg-linear-to-br from-[#121916] via-[#1a2320] to-[#0f1412] text-white'
                          : `border-white/80 bg-linear-to-br ${currentFinish.bg} text-[#27382f]`
                      }`}
                      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                      <div className="absolute inset-2.5 rounded-xl border border-white/30" />
                      <div className="relative z-10 flex items-center justify-between">
                        <span className="text-[7px] font-bold tracking-widest text-[#72897d]">
                          TAP OR SCAN TO CONNECT
                        </span>
                        <span className="text-[8px] font-bold">NFC READY</span>
                      </div>

                      <div className="relative z-10 flex items-center justify-center gap-4 py-2">
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white p-1.5 shadow-md">
                          <QrCode className="h-full w-full text-[#1d2a24]" />
                        </div>
                        <div className="text-[8px] leading-4">
                          <p className="font-semibold">{isArabic ? 'رابط ملفك الرقمي:' : 'Digital Profile URL:'}</p>
                          <p className="font-mono text-[#588970]">
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
                </div>
              </div>
            ) : (
              /* Mobile Profile Preview */
              <div className="w-full max-w-xs">
                <div className="overflow-hidden rounded-[2.2rem] border-4 border-[#2b3a32] bg-[#fbfdfa] shadow-xl">
                  {/* Phone Notch */}
                  <div className="flex justify-center bg-[#2b3a32] py-1">
                    <span className="h-2 w-16 rounded-full bg-[#1b2520]" />
                  </div>
                  {/* Digital Profile Screen */}
                  <div className="p-4 text-center">
                    <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-tr from-[#94d5bd] to-[#d8c2f2] text-lg font-bold text-[#23352c] shadow-sm">
                      {formData.fullName.slice(0, 2)}
                    </div>
                    <h3 className="text-sm font-bold text-[#293c33]">{formData.fullName}</h3>
                    <p className="text-[10px] text-[#6e8076]">{formData.jobTitle}</p>
                    <p className="text-[9px] font-medium text-[#466f5c]">{formData.companyName}</p>
                    {formData.bio && (
                      <p className="mx-auto mt-2 max-w-xs text-[9px] leading-4 text-[#75847b]">{formData.bio}</p>
                    )}

                    {/* Quick action buttons */}
                    <div className="mt-3 flex justify-center gap-2">
                      <a
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8f4ed] text-[#46735e]"
                        href={`tel:${formData.phone}`}
                      >
                        <Phone className="h-3.5 w-3.5" />
                      </a>
                      <a
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8f4ed] text-[#46735e]"
                        href={`mailto:${formData.email}`}
                      >
                        <Mail className="h-3.5 w-3.5" />
                      </a>
                      <a
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8f4ed] text-[#46735e]"
                        href={formData.website}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <Globe2 className="h-3.5 w-3.5" />
                      </a>
                    </div>

                    <button
                      className="mt-3 inline-flex min-h-8 w-full items-center justify-center gap-1.5 rounded-full bg-[#314f43] px-3 text-[10px] font-medium text-white shadow-xs"
                      type="button"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      {isArabic ? 'حفظ جهة الاتصال (vCard)' : 'Save to Contacts'}
                    </button>
                    <p className="mt-2 text-[7px] text-[#97a39b]">
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
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#73887c]">
                {isArabic ? 'بيانات الكارت والهوية' : 'Card & Identity Details'}
              </h3>

              {/* Finish Selection */}
              <div className="mt-3">
                <label className="text-[10px] font-medium text-[#5c6e64]">
                  {isArabic ? 'اختر خامة ولون البطاقة:' : 'Choose Card Material & Finish:'}
                </label>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {finishes.map((f) => (
                    <button
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[9px] font-medium transition-all ${
                        formData.finish === f.id
                          ? 'border-[#3f6753] bg-[#edf6f1] text-[#2c4739] shadow-xs'
                          : 'border-[#e0eae4] bg-white text-[#6f7e76] hover:border-[#b8cdbf]'
                      }`}
                      key={f.id}
                      onClick={() => handleFinishChange(f.id)}
                      type="button"
                    >
                      <span className={`h-3 w-3 rounded-full border border-black/10 bg-linear-to-br ${f.bg}`} />
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Inputs */}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] text-[#607368]">{isArabic ? 'الاسم بالكامل' : 'Full Name'}</label>
                  <input
                    className="mt-1 h-9 w-full rounded-xl border border-[#dfe8e2] bg-white px-3 text-xs text-[#2c3d34] outline-none focus:border-[#7cb79c]"
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    value={formData.fullName}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#607368]">{isArabic ? 'المسمى الوظيفي' : 'Job Title'}</label>
                  <input
                    className="mt-1 h-9 w-full rounded-xl border border-[#dfe8e2] bg-white px-3 text-xs text-[#2c3d34] outline-none focus:border-[#7cb79c]"
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    value={formData.jobTitle}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#607368]">{isArabic ? 'اسم الشركة أو العلامة' : 'Company Name'}</label>
                  <input
                    className="mt-1 h-9 w-full rounded-xl border border-[#dfe8e2] bg-white px-3 text-xs text-[#2c3d34] outline-none focus:border-[#7cb79c]"
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    value={formData.companyName}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#607368]">{isArabic ? 'رقم الهاتف / واتساب' : 'Phone / WhatsApp'}</label>
                  <input
                    className="mt-1 h-9 w-full rounded-xl border border-[#dfe8e2] bg-white px-3 text-xs text-[#2c3d34] outline-none focus:border-[#7cb79c]"
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    value={formData.phone}
                  />
                </div>
              </div>

              {/* Profile Linking Feature Toggle */}
              <div className="mt-4 rounded-2xl border border-[#cbe4d7] bg-[#f0f9f3] p-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-[#43795f]" />
                    <span className="text-xs font-semibold text-[#2f5542]">
                      {isArabic ? 'ربط الكارت الذكي بصفحة بروفيل ويب مخصصة' : 'Link Smart Card to Custom Web Profile'}
                    </span>
                  </div>
                  <input
                    checked={formData.profileLinked}
                    className="h-4 w-4 accent-[#314f43]"
                    onChange={(e) => setFormData({ ...formData, profileLinked: e.target.checked })}
                    type="checkbox"
                  />
                </div>
                <p className="mt-1.5 text-[9px] leading-4 text-[#5f7a6b]">
                  {isArabic
                    ? 'يتم إعداد وبرمجة صفحة بروفيل شخصية سريعة ومتجاوبة على سيرفرات ZEXOR تفتح تلقائياً عند تقريب الهاتف من الكارت.'
                    : 'We program and host a responsive personal profile page that opens automatically when someone taps your card.'}
                </p>
                {formData.profileLinked && (
                  <div className="mt-2.5 flex items-center rounded-xl border border-[#c2ded0] bg-white px-3 py-1.5 text-xs text-[#395647]">
                    <span className="text-[#849a8d]">zexor.me/</span>
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
            <div className="border-t border-[#edf0ed] pt-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-[#6e8076]">{isArabic ? 'السعر التقديري:' : 'Indicative Price:'}</span>
                <span className="text-base font-bold text-[#314f43]">
                  {market === 'eg' ? `${product.price.eg} ج.م` : `${product.price.ksa} ر.س`}
                </span>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#314f43] px-4 text-xs font-semibold text-white shadow-md transition-all hover:bg-[#436e5d]"
                  onClick={handleAddAndClose}
                  type="button"
                >
                  <ShoppingBag className="h-4 w-4" />
                  {isArabic ? 'إضافة إلى السلة بالتخصيص' : 'Add Custom Card to Cart'}
                </button>
                <button
                  className="flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-[#d3e3d9] bg-white px-4 text-xs font-semibold text-[#406a56] shadow-xs hover:bg-[#eef6f1]"
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
