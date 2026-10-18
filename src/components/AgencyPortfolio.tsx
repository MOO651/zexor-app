import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
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
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { AGENCY_PROJECTS, STATS } from '../data/initialData';
import type { Locale, Market, PlatformInquiry } from '../types';
import { publicAssetUrl } from '../utils';

type Props = {
  locale: Locale;
  market: Market;
  onInquiry: (inquiry: PlatformInquiry) => void;
  onWhatsApp: (market: Market, message: string) => void;
  sectionName?: string;
  view?: 'overview' | 'pricing' | 'calculator';
};

export function AgencyPortfolio({ locale, market, onInquiry, onWhatsApp, sectionName, view = 'overview' }: Props) {
  const isArabic = locale === 'ar';
  const reduceMotion = useReducedMotion();
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
      id: `ZX-CALC-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
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
    const profileContent = isArabic
      ? `استوديو زكسور\nتصميم وتطوير حلول رقمية للشركات ورواد الأعمال.\n\nخدماتنا\n• تصميم وتطوير المواقع التعريفية.\n• إنشاء المتاجر الإلكترونية.\n• تطوير تطبيقات الويب والأنظمة المخصصة.\n• تحسين تجربة الاستخدام ودعم الإطلاق.\n\nنبدأ بفهم احتياج المشروع، ثم نحدد النطاق والمدة والتكلفة قبل التنفيذ.\nللتواصل، استخدم وسائل التواصل الموجودة على موقعنا.`
      : `ZEXOR STUDIO\nDigital design and development for businesses and founders.\n\nOUR SERVICES\n• Company and brand websites.\n• E-commerce stores.\n• Custom web applications and internal tools.\n• User experience and launch support.\n\nWe start by understanding the brief, then agree on scope, timing and cost before development.\nContact us through the channels listed on our website.`;

    const blob = new Blob([profileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = isArabic ? 'نبذة-استوديو-ZEXOR.txt' : 'ZEXOR-Studio-Profile.txt';
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

  const pageTitle = view === 'pricing'
    ? (isArabic ? 'أسعار واضحة وخيارات تناسب مشروعك' : 'Clear pricing for your next step')
    : view === 'calculator'
      ? (isArabic ? 'قدّر تكلفة مشروعك' : 'Estimate your project')
      : (sectionName ?? (isArabic ? 'استوديو زكسور' : 'ZEXOR STUDIO'));

  return (
    <div className={`zx-agency-page zx-agency-page--${view} space-y-12`}>
      {/* 1. Header & Live Stats Counter */}
      <section className="zx-agency-hero relative overflow-hidden rounded-4xl border p-6 sm:p-10 lg:p-12">
        <div className="zx-agency-intro relative z-10 max-w-3xl">
          <p className="inline-flex items-center gap-2 text-[9px] font-semibold tracking-widest text-zx-secondary">
            <Code2 className="h-4 w-4" />
            {view === 'pricing'
              ? (isArabic ? 'استوديو زكسور / الباقات والأسعار' : 'ZEXOR STUDIO / PRICING')
              : view === 'calculator'
                ? (isArabic ? 'استوديو زكسور / تقدير التكلفة' : 'ZEXOR STUDIO / PROJECT ESTIMATE')
                : (isArabic ? 'استوديو زكسور / أعمال مختارة' : 'ZEXOR STUDIO / SELECTED WORK')}
          </p>
          <h1 className={`mt-3 text-3xl font-semibold text-zx-ink sm:text-5xl ${isArabic ? 'leading-tight' : ''}`}>
            {pageTitle}
          </h1>
          <p className="mt-3 text-sm leading-6 text-zx-secondary">
            {view === 'pricing'
              ? (isArabic ? 'تعرّف على باقاتنا ونطاق كل باقة، ثم تواصل معنا لتحديد التفاصيل المناسبة لاحتياجك.' : 'Compare our starting packages, see what each includes, and contact us to shape the right scope.')
              : view === 'calculator'
                ? (isArabic ? 'اختر نوع المشروع والخصائص التي تحتاجها للحصول على تقدير مبدئي قابل للمناقشة.' : 'Choose your project type and requirements to get a practical starting estimate.')
                : isArabic
            ? 'نصمّم ونطوّر مواقع ومتاجر وتطبيقات تساعد مشروعك على الظهور والعمل بكفاءة. من الفكرة إلى الإطلاق، بخطوات واضحة تناسب احتياجك.'
              : 'We design and build websites, online stores and apps around your business needs, guiding each project from its first brief to launch.'}
          </p>

          {view === 'overview' && <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-zx-primary px-5 text-xs font-semibold text-zx-on-primary shadow-md transition-all hover:bg-zx-primary-hover"
              onClick={handleDownloadProfile}
              type="button"
            >
              <Download className="h-4 w-4" />
              {isArabic ? 'تحميل نبذة عن الاستوديو' : 'Download studio profile'}
            </button>
            {downloadSuccess && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zx-secondary">
                <Check className="h-4 w-4" />
                {isArabic ? 'تم تحميل الملف بنجاح!' : 'Profile downloaded successfully!'}
              </span>
            )}
          </div>}
        </div>

        {view !== 'overview' && (
          <aside aria-hidden="true" className={`zx-agency-visual zx-agency-visual--${view}`}>
            <div className="zx-agency-visual__window">
              <div className="zx-agency-visual__topbar"><span /><span /><span /><b>ZEXOR STUDIO</b><Sparkles /></div>
              {view === 'pricing' ? (
                <div className="zx-agency-visual__plans">
                  <div><i><MonitorSmartphone /></i><span>BRAND WEBSITE</span><b>01</b></div>
                  <div><i><ShoppingBag /></i><span>ONLINE STORE</span><b>02</b></div>
                  <div><i><Layers /></i><span>CUSTOM PLATFORM</span><b>03</b></div>
                  <small>PLANS BUILT AROUND YOUR NEXT MOVE</small>
                </div>
              ) : (
                <div className="zx-agency-visual__estimate">
                  <span>PROJECT SCOPE</span>
                  <b><i /><i /><i /></b>
                  <div><span>Pages</span><strong>05</strong></div>
                  <div><span>Language</span><strong>AR + EN</strong></div>
                  <div><span>Integrations</span><strong>READY</strong></div>
                  <small>YOUR IDEA, CLEARER BY DESIGN</small>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Live Animated Stats Counter */}
        {view === 'overview' && <div className="zx-agency-stats mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {STATS.map((s) => (
            <div
              className="rounded-2xl border border-zx-line bg-zx-elevated p-4 shadow-sm backdrop-blur-md"
              key={s.id}
            >
              <p className="text-2xl font-bold tracking-tight text-zx-ink sm:text-3xl">{s.value}</p>
              <p className="mt-1 text-[10px] text-zx-secondary">{s.label[locale]}</p>
            </div>
          ))}
        </div>}
      </section>

      {/* 2. Live Demo Portfolio Section */}
      {view === 'overview' && <section className="zx-agency-projects">
        <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-zx-secondary">
              {isArabic ? 'معاينة حية للمشاريع' : 'Live Interactive Demos'}
            </span>
            <h2 className="mt-1 text-2xl font-bold text-zx-ink">
              {isArabic ? 'نماذج تفاعلية مختارة' : 'Selected Interactive Demos'}
            </h2>
          </div>
          <p className="text-xs text-zx-secondary">
            {isArabic ? 'اضغط "معاينة حية" لتجربة المنصة في نافذة جديدة' : 'Click "Live Demo" to experience the platform'}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {AGENCY_PROJECTS.map((proj) => (
            <motion.article
              className="zx-showcase-card group overflow-hidden rounded-[1.7rem] border border-zx-line bg-zx-elevated shadow-zx-card transition-all duration-300 hover:-translate-y-1 hover:border-zx-line hover:shadow-zx-card"
              key={proj.id}
              whileHover={reduceMotion ? undefined : { y: -4 }}
            >
              <div className="relative aspect-[1.55/1] w-full overflow-hidden bg-zx-elevated">
                <img
                  alt={proj.title[locale]}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                  src={publicAssetUrl(proj.image)}
                />
                <span className="absolute start-3 top-3 rounded-full bg-zx-cinematic px-3 py-1 text-[8px] font-semibold tracking-wider text-zx-ink backdrop-blur-md">
                  {proj.category[locale]}
                </span>
              </div>
              <div className="zx-agency-project-copy flex min-h-[250px] flex-col p-4 sm:p-5">
                <h3 className="line-clamp-1 text-sm font-bold text-zx-ink">{proj.title[locale]}</h3>
                <p className="mt-2 line-clamp-3 min-h-[3.75rem] text-[11px] leading-5 text-zx-secondary">{proj.description[locale]}</p>

                {/* Tech tags */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {proj.tags.map((t) => (
                    <span
                      className="rounded-full border border-zx-line bg-zx-elevated px-2.5 py-1 text-[8px] font-medium text-zx-secondary"
                      key={t}
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="mt-auto border-t border-zx-line pt-3.5">
                  <a
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-zx-primary px-4 text-xs font-semibold text-zx-on-primary transition-all hover:bg-zx-primary-hover"
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
      </section>}

      {/* 3. Interactive Cost Calculator */}
      {view !== 'pricing' && <section className="zx-agency-calculator rounded-3xl border p-5 sm:p-8">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-zx-secondary">
            <Sparkles className="h-3.5 w-3.5" />
            {isArabic ? 'حاسبة التكلفة التفاعلية' : 'Interactive Project Cost Calculator'}
          </span>
          <h2 className="mt-1 text-2xl font-bold text-zx-ink">
            {isArabic ? 'احسب تكلفة موقعك أو متجرك فوراً' : 'Estimate Your Project Scope in Real Time'}
          </h2>
          <p className="mt-1.5 text-xs text-zx-secondary">
            {isArabic
              ? 'اختر متطلبات مشروعك وميزانيتك لتظهر لك التكلفة التقديرية الفورية مع إمكانية إرسالها لمناقشة البدء فوراً.'
              : 'Configure your deliverables to receive a transparent starting scope and estimate.'}
          </p>
        </div>

        <form className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]" onSubmit={handleCalculatorSubmit}>
          {/* Options Form */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zx-ink">
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
                          ? 'border-zx-line bg-zx-primary/20 text-zx-ink shadow-xs'
                          : 'border-zx-line bg-zx-elevated text-zx-secondary hover:border-zx-line'
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
                <label className="text-xs font-semibold text-zx-ink">
                  {isArabic ? 'عدد الصفحات والشاشات:' : 'Estimated Number of Pages:'}
                </label>
                <span className="text-xs font-bold text-zx-ink">{pages} {isArabic ? 'صفحات' : 'pages'}</span>
              </div>
              <input
                className="mt-2 w-full accent-zx-primary"
                max="30"
                min="1"
                onChange={(e) => setPages(Number(e.target.value))}
                type="range"
                value={pages}
              />
            </div>

            {/* Feature Toggles */}
            <div className="grid gap-2 sm:grid-cols-3">
              <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-zx-line bg-zx-elevated p-3 text-xs text-zx-ink">
                <input
                  checked={bilingual}
                  className="h-4 w-4 accent-zx-primary"
                  onChange={(e) => setBilingual(e.target.checked)}
                  type="checkbox"
                />
                <span>{isArabic ? 'ثنائي اللغة (عربي / إنجليزي)' : 'Bilingual Support (AR/EN)'}</span>
              </label>

              <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-zx-line bg-zx-elevated p-3 text-xs text-zx-ink">
                <input
                  checked={seo}
                  className="h-4 w-4 accent-zx-primary"
                  onChange={(e) => setSeo(e.target.checked)}
                  type="checkbox"
                />
                <span>{isArabic ? 'تهيئة محركات البحث (SEO)' : 'SEO Engine Optimization'}</span>
              </label>

              <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-zx-line bg-zx-elevated p-3 text-xs text-zx-ink">
                <input
                  checked={speedOptimization}
                  className="h-4 w-4 accent-zx-primary"
                  onChange={(e) => setSpeedOptimization(e.target.checked)}
                  type="checkbox"
                />
                <span>{isArabic ? 'تسريع فائق (Lighthouse 95+)' : 'Extreme Speed Optimization'}</span>
              </label>
            </div>

            <div>
              <label className="text-xs font-semibold text-zx-ink">
                {isArabic ? 'عدد الربط مع خدمات خارجية أو بوابات دفع:' : 'External API & Payment Integrations:'}
              </label>
              <select
                className="mt-1.5 min-h-11 w-full rounded-xl border border-zx-line bg-zx-elevated px-3 text-xs text-zx-ink outline-none focus-visible:ring-2 focus-visible:ring-zx-primary"
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
          <div className="zx-agency-estimate flex flex-col justify-between rounded-2xl border p-6">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-zx-secondary">
                {isArabic ? 'ملخص التقدير الفوري' : 'Instant Cost Breakdown'}
              </span>
              <p className="mt-3 text-3xl font-extrabold text-zx-ink">
                {new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en').format(totalEstimate)} {currency}
              </p>
              <p className="mt-1 text-[10px] text-zx-secondary">
                {isArabic
                  ? 'تقدير أولي شفاف، يشمل التصميم والبرمجة والتجاوب الكامل.'
                  : 'Transparent starting estimate including design, development & testing.'}
              </p>

              <div className="mt-5 space-y-2 border-t border-zx-line pt-4 text-xs text-zx-secondary">
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
              className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-zx-primary px-4 text-xs font-semibold text-zx-on-primary shadow-md transition-all hover:bg-zx-primary-hover"
              type="submit"
            >
              <MessageCircle className="h-4 w-4" />
              {isArabic ? 'إرسال التقدير وبدء المناقشة عبر واتساب' : 'Send Estimate via WhatsApp'}
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </section>}

      {/* 4. Pricing Tables */}
      {view !== 'calculator' && <section className="zx-agency-pricing">
        <div className="mb-6 text-center">
          <span className="text-[9px] font-bold uppercase tracking-widest text-zx-secondary">
            {isArabic ? 'باقات البرمجة والتطوير' : 'Transparent Pricing Packages'}
          </span>
          <h2 className="mt-1 text-2xl font-bold text-zx-ink">
            {isArabic ? 'خطط مرنة تناسب مرحلة نموك' : 'Clear Starting Tiers for Every Stage'}
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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
                className={`zx-agency-tier relative flex flex-col justify-between rounded-3xl border p-6 transition-all ${
                  tier.popular
                    ? 'border-zx-line bg-linear-to-b from-zx-elevated via-zx-surface to-zx-elevated shadow-xl ring-2 ring-zx-accent'
                    : 'border-zx-line bg-zx-elevated'
                }`}
                key={tier.id}
              >
                {tier.popular && (
                  <span className="absolute -top-3 inset-x-0 mx-auto w-fit rounded-full bg-zx-cinematic px-3 py-1 text-[9px] font-bold text-zx-ink shadow-sm">
                    {isArabic ? 'الأكثر طلباً' : 'Most Popular'}
                  </span>
                )}
                <div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zx-elevated text-zx-secondary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-base font-bold text-zx-ink">{tier.title}</h3>
                  <p className="mt-1 text-[11px] text-zx-secondary">{tier.desc}</p>
                  <p className="mt-4 text-2xl font-extrabold text-zx-ink">{tier.price}</p>

                  <ul className="mt-6 space-y-2.5 border-t border-zx-line pt-4 text-xs text-zx-secondary">
                    {tier.features.map((feat) => (
                      <li className="flex items-center gap-2" key={feat}>
                        <Check className="h-4 w-4 shrink-0 text-zx-secondary" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  className={`mt-8 min-h-11 w-full rounded-full text-xs font-semibold shadow-xs transition-all ${
                    tier.popular
                      ? 'bg-zx-primary text-zx-on-primary hover:bg-zx-primary-hover'
                      : 'border border-zx-line bg-zx-elevated text-zx-ink hover:bg-zx-elevated'
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
      </section>}

      {/* 6. Tech Stack Badges */}
      {view === 'overview' && <section className="zx-agency-toolkit rounded-3xl border p-6 text-center">
        <span className="text-[9px] font-bold uppercase tracking-widest text-zx-secondary">
          {isArabic ? 'التقنيات والأدوات المستخدمة' : 'Our Engineering Toolkit'}
        </span>
        <h3 className="mt-1 text-lg font-bold text-zx-ink">
          {isArabic ? 'أحدث التقنيات البرمجية فائقة الأداء' : 'Built With Modern High-Performance Technologies'}
        </h3>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {techStack.map((tech) => (
            <div
              className="flex items-center gap-2 rounded-2xl border border-zx-line bg-zx-elevated px-4 py-2.5 shadow-xs"
              key={tech.name}
            >
              <span className="text-base">{tech.icon}</span>
              <div className="text-start">
                <p className="text-xs font-bold text-zx-ink">{tech.name}</p>
                <p className="text-[8px] text-zx-secondary">{tech.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>}
    </div>
  );
}
