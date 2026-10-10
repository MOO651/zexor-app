import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  Check,
  Code2,
  Download,
  ExternalLink,
  Laptop,
  Layers,
  MessageCircle,
  MonitorSmartphone,
  Quote,
  ShoppingBag,
  Sparkles,
  Star,
} from 'lucide-react';
import { AGENCY_PROJECTS, STATS, TESTIMONIALS } from '../data/initialData';
import type { Locale, Market, PlatformInquiry } from '../types';

type Props = {
  locale: Locale;
  market: Market;
  onInquiry: (inquiry: PlatformInquiry) => void;
  onWhatsApp: (market: Market, message: string) => void;
};

export function AgencyPortfolio({ locale, market, onInquiry, onWhatsApp }: Props) {
  const isArabic = locale === 'ar';
  const currency = market === 'eg' ? (isArabic ? 'ج.م' : 'EGP') : isArabic ? 'ر.س' : 'SAR';

  // Calculator State
  const [kind, setKind] = useState<'landing' | 'store' | 'custom_app'>('landing');
  const [pages, setPages] = useState(5);
  const [bilingual, setBilingual] = useState(true);
  const [seo, setSeo] = useState(true);
  const [speedOptimization, setSpeedOptimization] = useState(true);
  const [crmIntegrations, setCrmIntegrations] = useState(1);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Pricing calculation
  const basePrice = kind === 'landing' ? (market === 'eg' ? 6500 : 950) : kind === 'store' ? (market === 'eg' ? 16500 : 2300) : (market === 'eg' ? 29000 : 4100);
  const extraPagesCost = Math.max(0, pages - 5) * (market === 'eg' ? 550 : 80);
  const bilingualCost = bilingual ? (market === 'eg' ? 2500 : 350) : 0;
  const seoCost = seo ? (market === 'eg' ? 1800 : 250) : 0;
  const speedCost = speedOptimization ? (market === 'eg' ? 1500 : 200) : 0;
  const integrationsCost = crmIntegrations * (market === 'eg' ? 1200 : 160);

  const totalEstimate = basePrice + extraPagesCost + bilingualCost + seoCost + speedCost + integrationsCost;

  const handleCalculatorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const inquiry: PlatformInquiry = {
      id: `ZX-CALC-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      type: 'contact',
      title: `${kind.toUpperCase()} Project · Cost Calculator`,
      name: isArabic ? 'طلب حاسبة تقديرية' : 'Calculator Request',
      phone: '',
      city: market === 'eg' ? 'Cairo' : 'Riyadh',
      market,
      budget: `${totalEstimate} ${currency}`,
      message: `${pages} pages, Bilingual: ${bilingual ? 'Yes' : 'No'}, SEO: ${seo ? 'Yes' : 'No'}, Integrations: ${crmIntegrations}`,
      status: 'new',
    };
    onInquiry(inquiry);
    const msg = isArabic
      ? `مرحباً ZEXOR، حسبت تكلفة مشروعي بالحاسبة التفاعلية:
النوع: ${kind === 'landing' ? 'موقع تعريفي' : kind === 'store' ? 'متجر إلكتروني' : 'تطبيق مخصص'}
عدد الصفحات: ${pages}
التقدير: ${totalEstimate} ${currency}
أود مناقشة تفاصيل التنفيذ.`
      : `Hello ZEXOR, I calculated my project estimate:
Type: ${kind}
Pages: ${pages}
Estimate: ${totalEstimate} ${currency}
I would like to discuss next steps.`;
    onWhatsApp(market, msg);
  };

  const handleDownloadProfile = () => {
    // Generate text/PDF format profile download
    const profileContent = `
==================================================
           ZEXOR DIGITAL STUDIO & ATELIER
     Design · Technology · Regional Innovation
==================================================

Cairo, Egypt: +20 100 555 6553
Riyadh, Saudi Arabia: +966 56 041 0310
Website: https://zexor.studio
TikTok: @zexor.digtal.studio

1. OVERVIEW:
ZEXOR delivers bespoke web applications, high-converting e-commerce experiences, and smart NFC connected hardware for top-tier brands and ambitious founders across the MENA region.

2. CORE SERVICES:
• Brand Strategy & High-End Editorial Web Platforms
• Full-Featured E-Commerce Engines (Stripe, Apple Pay, Mada, WhatsApp CRM)
• Custom Web Applications & Enterprise Dashboards
• Interactive Smart NFC Identity Passes & Digital Profiles

3. TECH STACK:
React 19, TypeScript, Vite, Tailwind CSS v4, Next.js, Supabase, Vercel, Node.js

4. GUARANTEE:
100% responsive, high-speed Lighthouse score > 95, bespoke code with zero generic templates.

© 2026 ZEXOR Studio. All rights reserved.
    `.trim();

    const blob = new Blob([profileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ZEXOR-Studio-Company-Profile-2026.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  const techStack = [
    { name: 'React 19', role: isArabic ? 'واجهات متقدمة' : 'Modern UI', icon: '⚛️' },
    { name: 'Vite 8', role: isArabic ? 'أداء فائق وسرعة' : 'Blazing Fast Build', icon: '⚡' },
    { name: 'TypeScript', role: isArabic ? 'كود آمن ومستقر' : 'Type Safety', icon: '📘' },
    { name: 'Tailwind CSS v4', role: isArabic ? 'تصاميم حديثة' : 'Cutting-edge CSS', icon: '🎨' },
    { name: 'Framer Motion', role: isArabic ? 'أنيميشن سلس' : 'Smooth Motion', icon: '✨' },
    { name: 'Vercel Edge', role: isArabic ? 'استضافة عالمية' : 'Edge Deployment', icon: '▲' },
    { name: 'Supabase', role: isArabic ? 'قواعد بيانات سحابية' : 'Cloud Database', icon: '⚡' },
    { name: 'Node.js', role: isArabic ? 'خوادم خلفية' : 'Backend APIs', icon: '🟢' },
  ];

  return (
    <div className="space-y-16">
      {/* 1. Header & Live Stats Counter */}
      <section className="relative overflow-hidden rounded-4xl border border-white bg-linear-to-br from-[#d9f2e9] via-[#faf8f2] to-[#ecdff4] p-6 shadow-xl sm:p-10">
        <div className="relative z-10 max-w-3xl">
          <p className="inline-flex items-center gap-2 text-[9px] font-semibold tracking-widest text-[#5c8a74]">
            <Code2 className="h-4 w-4" />
            ZEXOR / PORTFOLIO & DIGITAL AGENCY
          </p>
          <h1 className={`mt-3 text-3xl font-semibold text-[#293d32] sm:text-5xl ${isArabic ? 'leading-tight' : ''}`}>
            {isArabic ? 'استوديو البرمجة والتطوير الرقمي' : 'Digital Studio & Software Engineering'}
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#697a70]">
            {isArabic
              ? 'نطور مواقع وتطبيقات ومتاجر إلكترونية استثنائية تجمع بين الفخامة البصرية والأداء التقني الصاروخي لخدمة رواد الأعمال والشركات في مصر والسعودية.'
              : 'We architect distinct web experiences, high-converting stores, and bespoke applications engineered with world-class frontend precision.'}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#2f4d3f] px-5 text-xs font-semibold text-white shadow-md transition-all hover:bg-[#416957]"
              onClick={handleDownloadProfile}
              type="button"
            >
              <Download className="h-4 w-4" />
              {isArabic ? 'تحميل ملف أعمال الوكالة (Company Profile)' : 'Download Agency Profile / CV'}
            </button>
            {downloadSuccess && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#3b7355]">
                <Check className="h-4 w-4" />
                {isArabic ? 'تم تحميل الملف بنجاح!' : 'Profile downloaded successfully!'}
              </span>
            )}
          </div>
        </div>

        {/* Live Animated Stats Counter */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {STATS.map((s) => (
            <div
              className="rounded-2xl border border-white/80 bg-white/70 p-4 shadow-sm backdrop-blur-md"
              key={s.id}
            >
              <p className="text-2xl font-bold tracking-tight text-[#2d4d3c] sm:text-3xl">{s.value}</p>
              <p className="mt-1 text-[10px] text-[#6e8076]">{s.label[locale]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Live Demo Portfolio Section */}
      <section>
        <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#7fa390]">
              {isArabic ? 'معاينة حية للمشاريع' : 'Live Interactive Demos'}
            </span>
            <h2 className="mt-1 text-2xl font-bold text-[#2d4236]">
              {isArabic ? 'نماذج ومشاريع قمنا بتطويرها' : 'Featured Client Works & Platforms'}
            </h2>
          </div>
          <p className="text-xs text-[#7e8d84]">
            {isArabic ? 'اضغط "معاينة حية" لتجربة المنصة في نافذة جديدة' : 'Click "Live Demo" to experience the platform'}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {AGENCY_PROJECTS.map((proj) => (
            <motion.article
              className="group overflow-hidden rounded-3xl border border-white bg-white/85 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              key={proj.id}
              whileHover={{ y: -4 }}
            >
              <div className="relative aspect-video w-full overflow-hidden bg-[#e0eee5]">
                <img
                  alt={proj.title[locale]}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  src={proj.image}
                />
                <span className="absolute start-3 top-3 rounded-full bg-[#1b2b23]/80 px-3 py-1 text-[8px] font-semibold tracking-wider text-white backdrop-blur-md">
                  {proj.category[locale]}
                </span>
              </div>
              <div className="p-5">
                <h3 className="text-sm font-bold text-[#2f4438]">{proj.title[locale]}</h3>
                <p className="mt-2 min-h-10 text-[11px] leading-5 text-[#6d7e74]">{proj.description[locale]}</p>

                {/* Tech tags */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {proj.tags.map((t) => (
                    <span
                      className="rounded-full bg-[#eef5f1] px-2.5 py-0.5 text-[8px] font-medium text-[#4b6a5a]"
                      key={t}
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="mt-5 border-t border-[#edf1ee] pt-3.5">
                  <a
                    className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full bg-[#314f43] px-4 text-xs font-semibold text-white transition-all hover:bg-[#45705e]"
                    href={proj.demoUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {isArabic ? 'معاينة حية للمشروع (Live Demo)' : 'Explore Live Demo'}
                  </a>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* 3. Interactive Cost Calculator */}
      <section className="rounded-3xl border border-white bg-linear-to-br from-[#f8faf8] to-[#edf4f0] p-6 shadow-lg sm:p-8">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-[#5e8f77]">
            <Sparkles className="h-3.5 w-3.5" />
            {isArabic ? 'حاسبة التكلفة التفاعلية' : 'Interactive Project Cost Calculator'}
          </span>
          <h2 className="mt-1 text-2xl font-bold text-[#2e4337]">
            {isArabic ? 'احسب تكلفة موقعك أو متجرك فوراً' : 'Estimate Your Project Scope in Real Time'}
          </h2>
          <p className="mt-1.5 text-xs text-[#708177]">
            {isArabic
              ? 'اختر متطلبات مشروعك وميزانيتك لتظهر لك التكلفة التقديرية الفورية مع إمكانية إرسالها لمناقشة البدء فوراً.'
              : 'Configure your deliverables to receive a transparent starting scope and estimate.'}
          </p>
        </div>

        <form className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]" onSubmit={handleCalculatorSubmit}>
          {/* Options Form */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#405649]">
                {isArabic ? 'نوع المنصة المطلوبة:' : 'Project Type:'}
              </label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {[
                  { id: 'landing', label: isArabic ? 'موقع تعريفي' : 'Brand Website', icon: Laptop },
                  { id: 'store', label: isArabic ? 'متجر إلكتروني' : 'Online Store', icon: ShoppingBag },
                  { id: 'custom_app', label: isArabic ? 'تطبيق ويب مخصص' : 'Custom App', icon: Layers },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      className={`flex flex-col items-center gap-2 rounded-2xl border p-3 text-center transition-all ${
                        kind === item.id
                          ? 'border-[#3f6753] bg-[#eef7f1] text-[#2f4c3c] shadow-xs'
                          : 'border-[#e0e8e2] bg-white text-[#6b7b71] hover:border-[#b4cdbd]'
                      }`}
                      key={item.id}
                      onClick={() => setKind(item.id as typeof kind)}
                      type="button"
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-[10px] font-semibold">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#405649]">
                  {isArabic ? 'عدد الصفحات والشاشات:' : 'Estimated Number of Pages:'}
                </label>
                <span className="text-xs font-bold text-[#355343]">{pages} {isArabic ? 'صفحات' : 'pages'}</span>
              </div>
              <input
                className="mt-2 w-full accent-[#314f43]"
                max="30"
                min="1"
                onChange={(e) => setPages(Number(e.target.value))}
                type="range"
                value={pages}
              />
            </div>

            {/* Feature Toggles */}
            <div className="grid gap-2 sm:grid-cols-3">
              <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-[#dfe8e2] bg-white p-3 text-xs text-[#405449]">
                <input
                  checked={bilingual}
                  className="h-4 w-4 accent-[#314f43]"
                  onChange={(e) => setBilingual(e.target.checked)}
                  type="checkbox"
                />
                <span>{isArabic ? 'ثنائي اللغة (عربي / إنجليزي)' : 'Bilingual Support (AR/EN)'}</span>
              </label>

              <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-[#dfe8e2] bg-white p-3 text-xs text-[#405449]">
                <input
                  checked={seo}
                  className="h-4 w-4 accent-[#314f43]"
                  onChange={(e) => setSeo(e.target.checked)}
                  type="checkbox"
                />
                <span>{isArabic ? 'تهيئة محركات البحث (SEO)' : 'SEO Engine Optimization'}</span>
              </label>

              <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-[#dfe8e2] bg-white p-3 text-xs text-[#405449]">
                <input
                  checked={speedOptimization}
                  className="h-4 w-4 accent-[#314f43]"
                  onChange={(e) => setSpeedOptimization(e.target.checked)}
                  type="checkbox"
                />
                <span>{isArabic ? 'تسريع فائق (Lighthouse 95+)' : 'Extreme Speed Optimization'}</span>
              </label>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#405649]">
                {isArabic ? 'عدد الربط مع خدمات خارجية أو بوابات دفع:' : 'External API & Payment Integrations:'}
              </label>
              <select
                className="mt-1.5 h-10 w-full rounded-xl border border-[#dfe8e2] bg-white px-3 text-xs text-[#34483e] outline-none"
                onChange={(e) => setCrmIntegrations(Number(e.target.value))}
                value={crmIntegrations}
              >
                <option value={0}>{isArabic ? 'لا توجد بوابات إضافية' : 'No extra integrations'}</option>
                <option value={1}>{isArabic ? 'ربط واحد (واتساب وبوابة دفع أساسية)' : '1 Integration (WhatsApp + Basic Gateway)'}</option>
                <option value={2}>{isArabic ? 'ربطان (بوابة دفع + نظام شحن تلقائي)' : '2 Integrations (Payment + Shipping API)'}</option>
                <option value={3}>{isArabic ? '3+ ربط كامل (دفع، شحن، CRM، إشعارات تليجرام)' : '3+ Full Stack (Payment, CRM, Telegram Bot)'}</option>
              </select>
            </div>
          </div>

          {/* Calculator Output Card */}
          <div className="flex flex-col justify-between rounded-2xl border border-white bg-white p-6 shadow-md">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#7e9989]">
                {isArabic ? 'ملخص التقدير الفوري' : 'Instant Cost Breakdown'}
              </span>
              <p className="mt-3 text-3xl font-extrabold text-[#2a4537]">
                {new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en').format(totalEstimate)} {currency}
              </p>
              <p className="mt-1 text-[10px] text-[#86968d]">
                {isArabic
                  ? 'تقدير أولي شفاف، يشمل التصميم والبرمجة والتجاوب الكامل.'
                  : 'Transparent starting estimate including design, development & testing.'}
              </p>

              <div className="mt-5 space-y-2 border-t border-[#edf1ee] pt-4 text-xs text-[#526659]">
                <div className="flex justify-between">
                  <span>{isArabic ? 'الباقة الأساسية:' : 'Base Package:'}</span>
                  <span className="font-semibold">{basePrice} {currency}</span>
                </div>
                {extraPagesCost > 0 && (
                  <div className="flex justify-between">
                    <span>{isArabic ? 'صفحات إضافية:' : 'Extra Pages:'}</span>
                    <span className="font-semibold">+{extraPagesCost} {currency}</span>
                  </div>
                )}
                {bilingualCost > 0 && (
                  <div className="flex justify-between">
                    <span>{isArabic ? 'دعم اللغتين:' : 'Bilingual Engine:'}</span>
                    <span className="font-semibold">+{bilingualCost} {currency}</span>
                  </div>
                )}
                {integrationsCost > 0 && (
                  <div className="flex justify-between">
                    <span>{isArabic ? 'الربط الخارجي:' : 'Integrations:'}</span>
                    <span className="font-semibold">+{integrationsCost} {currency}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#314f43] px-4 text-xs font-semibold text-white shadow-md transition-all hover:bg-[#436e5d]"
              type="submit"
            >
              <MessageCircle className="h-4 w-4" />
              {isArabic ? 'إرسال التقدير وبدء المناقشة عبر واتساب' : 'Send Estimate via WhatsApp'}
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </section>

      {/* 4. Pricing Tables */}
      <section>
        <div className="mb-6 text-center">
          <span className="text-[9px] font-bold uppercase tracking-widest text-[#7fa390]">
            {isArabic ? 'باقات البرمجة والتطوير' : 'Transparent Pricing Packages'}
          </span>
          <h2 className="mt-1 text-2xl font-bold text-[#2d4236]">
            {isArabic ? 'خطط مرنة تناسب مرحلة نموك' : 'Clear Starting Tiers for Every Stage'}
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              id: 'starter',
              title: isArabic ? 'باقة الموقع التعريفي' : 'Brand Starter',
              desc: isArabic ? 'مثالية للشركات والمكاتب لتقديم خدماتها بهوية مميزة.' : 'Perfect for professional firms, agencies and creators.',
              price: market === 'eg' ? '8,000 ج.م' : '1,200 ر.س',
              icon: MonitorSmartphone,
              features: isArabic
                ? ['تصميم متجاوب بالكامل 100%', 'سرعة فائقة وتحسين SEO', 'حتى 5 صفحات وتنسيق هوية', 'زر تواصل مباشر مع واتساب', 'لوحة تحكم أساسية بالمحتوى']
                : ['100% Mobile Responsive', 'SEO Optimization & Ultra-Fast', 'Up to 5 Custom Pages', 'Direct WhatsApp Call-to-action', 'Basic Content CMS'],
              popular: false,
            },
            {
              id: 'store',
              title: isArabic ? 'باقة المتجر الإلكتروني' : 'E-Commerce Growth',
              desc: isArabic ? 'متجر إلكتروني متكامل لبيع المنتجات أو كروت NFC والأزياء.' : 'Full online store with seamless checkout and inventory.',
              price: market === 'eg' ? '18,000 ج.م' : '2,500 ر.س',
              icon: ShoppingBag,
              features: isArabic
                ? ['سلة تسوق تفاعلية وجانبية', 'ربط بوابات الدفع (مدى، بطاقات، أبل باي)', 'نظام تتبع الطلبات والشحنات', 'إدارة المقاسات والألوان والخصومات', 'إشعارات لحظية للطلبات على تليجرام']
                : ['Interactive Cart Drawer', 'Payment Gateways (Mada, Apple Pay)', 'Live Order Tracking Engine', 'Product Variants & Promo Codes', 'Telegram Order Automations'],
              popular: true,
            },
            {
              id: 'custom_app',
              title: isArabic ? 'تطبيق ويب ونظام مخصص' : 'Custom Enterprise App',
              desc: isArabic ? 'حلول برمجية مخصصة للأنشطة العقارية والمعارض والأنظمة.' : 'Tailored SaaS platform, marketplace or CRM solution.',
              price: market === 'eg' ? '32,000 ج.م' : '4,500 ر.س',
              icon: Code2,
              features: isArabic
                ? ['بنية سحابية كاملة مع Supabase', 'لوحة تحكم ديناميكية بدون كود', 'فلاتر بحث ومعارض صور متقدمة', 'نظام مستخدمين وصلاحيات دقيقة', 'دعم فني وصيانة لمدة 6 أشهر']
                : ['Supabase Cloud Architecture', 'Zero-code Dynamic Admin Panel', 'Advanced Filtering & Sliders', 'Role-based Access & Security', '6 Months Priority SLA Support'],
              popular: false,
            },
          ].map((tier) => {
            const Icon = tier.icon;
            return (
              <div
                className={`relative flex flex-col justify-between rounded-3xl border p-6 shadow-md transition-all ${
                  tier.popular
                    ? 'border-[#3f6753] bg-linear-to-b from-white via-[#f3f9f5] to-white shadow-xl ring-2 ring-[#4d7d65]/20'
                    : 'border-white bg-white/80'
                }`}
                key={tier.id}
              >
                {tier.popular && (
                  <span className="absolute -top-3 inset-x-0 mx-auto w-fit rounded-full bg-[#314f43] px-3 py-1 text-[9px] font-bold text-white shadow-sm">
                    {isArabic ? 'الأكثر طلباً' : 'Most Popular'}
                  </span>
                )}
                <div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e7f4ed] text-[#47775f]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-base font-bold text-[#2d4236]">{tier.title}</h3>
                  <p className="mt-1 text-[11px] text-[#718278]">{tier.desc}</p>
                  <p className="mt-4 text-2xl font-extrabold text-[#314f43]">{tier.price}</p>

                  <ul className="mt-6 space-y-2.5 border-t border-[#edf1ee] pt-4 text-xs text-[#526659]">
                    {tier.features.map((feat) => (
                      <li className="flex items-center gap-2" key={feat}>
                        <Check className="h-4 w-4 shrink-0 text-[#477f62]" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  className={`mt-8 min-h-11 w-full rounded-full text-xs font-semibold shadow-xs transition-all ${
                    tier.popular
                      ? 'bg-[#314f43] text-white hover:bg-[#436e5d]'
                      : 'border border-[#d2e3d8] bg-white text-[#385b49] hover:bg-[#eef6f1]'
                  }`}
                  onClick={() =>
                    onWhatsApp(
                      market,
                      isArabic
                        ? `مرحباً، أود الاستفسار عن ${tier.title} بسعر ${tier.price}.`
                        : `Hello, I am interested in ${tier.title} (${tier.price}).`,
                    )
                  }
                  type="button"
                >
                  {isArabic ? 'احجز الباقة الآن' : 'Select Plan'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Client Testimonials & Reviews */}
      <section className="rounded-3xl border border-white bg-linear-to-br from-[#eff7f2] via-white to-[#f7f1f9] p-6 shadow-md sm:p-9">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#69937c]">
              {isArabic ? 'آراء وتقييمات العملاء' : 'Client Testimonials'}
            </span>
            <h2 className="mt-1 text-2xl font-bold text-[#2b4134]">
              {isArabic ? 'ماذا يقول شركاء نجاحنا؟' : 'Trusted by Visionary Founders'}
            </h2>
          </div>
          <div className="flex items-center gap-1 text-[#f39c12]">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star className="h-4 w-4 fill-current" key={i} />
            ))}
            <span className="ms-1.5 text-xs font-bold text-[#3d594a]">5.0 / 5.0</span>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div
              className="relative flex flex-col justify-between rounded-2xl border border-white/90 bg-white/80 p-5 shadow-sm backdrop-blur-md"
              key={t.id}
            >
              <Quote className="h-6 w-6 text-[#99bfaa]/40" />
              <p className="my-3 text-xs leading-5 text-[#546b5e]">{t.content[locale]}</p>
              <div className="flex items-center gap-3 border-t border-[#edf2ef] pt-3">
                <img alt={t.name[locale]} className="h-10 w-10 rounded-full object-cover" src={t.avatar} />
                <div>
                  <h4 className="text-xs font-bold text-[#2e4337]">{t.name[locale]}</h4>
                  <p className="text-[9px] text-[#7d8f85]">
                    {t.role[locale]} · {t.company[locale]}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Tech Stack Badges */}
      <section className="rounded-3xl border border-[#e4ece6] bg-white/70 p-6 text-center">
        <span className="text-[9px] font-bold uppercase tracking-widest text-[#729381]">
          {isArabic ? 'التقنيات والأدوات المستخدمة' : 'Our Engineering Toolkit'}
        </span>
        <h3 className="mt-1 text-lg font-bold text-[#30473a]">
          {isArabic ? 'أحدث التقنيات البرمجية فائقة الأداء' : 'Built With Modern High-Performance Technologies'}
        </h3>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {techStack.map((tech) => (
            <div
              className="flex items-center gap-2 rounded-2xl border border-[#dfe8e2] bg-[#fbfdfa] px-4 py-2.5 shadow-xs"
              key={tech.name}
            >
              <span className="text-base">{tech.icon}</span>
              <div className="text-start">
                <p className="text-xs font-bold text-[#2f4639]">{tech.name}</p>
                <p className="text-[8px] text-[#7c8d83]">{tech.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
