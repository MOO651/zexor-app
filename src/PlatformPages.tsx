import {
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  CalendarDays,
  CarFront,
  Check,
  Code2,
  Globe2,
  Heart,
  MapPin,
  MessageCircle,
  MonitorSmartphone,
  Search,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Tag,
  Wifi,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { makeReference } from './utils';

export type PlatformPage = 'cars' | 'property' | 'contact' | 'services';
export type TrackedOrder = { id: string; status: 'new' | 'confirmed' | 'complete'; createdAt: string };
export type PlatformInquiry = {
  id: string;
  createdAt: string;
  type: 'contact' | 'car' | 'property';
  title: string;
  name: string;
  phone: string;
  city: string;
  market: 'eg' | 'ksa';
  budget: string;
  message: string;
  date?: string;
  time?: string;
  status: 'new' | 'in-progress' | 'complete';
};

type Locale = 'en' | 'ar';
type Market = 'eg' | 'ksa';
type Props = {
  locale: Locale;
  market: Market;
  page: PlatformPage;
  orders: TrackedOrder[];
  onInquiry: (inquiry: PlatformInquiry) => void;
  onWhatsApp: (market: Market, message: string) => void;
};

type Listing = {
  id: string;
  title: Record<Locale, string>;
  location: Record<Locale, string>;
  price: number;
  area: number;
  region: 'Cairo' | 'Giza' | 'Alexandria' | 'Riyadh' | 'Jeddah';
  photo: string;
};
type Vehicle = Listing & {
  make: string;
  year: number;
  transmission: 'Automatic' | 'Manual';
  condition: 'New' | 'Used';
  body: 'Sedan' | 'SUV' | 'Coupe';
};
type Property = Listing & {
  type: 'Apartment' | 'Villa' | 'Land' | 'Shop';
  deal: 'Sale' | 'Rent';
  rooms: number;
  floor: number;
};

const DEMO_VEHICLES: Vehicle[] = [
  { id: 'DEMO-CAR-101', title: { en: 'Astra City Edition', ar: 'أسترا سيتي إيديشن' }, location: { en: 'New Cairo', ar: 'القاهرة الجديدة' }, price: 930000, area: 0, region: 'Cairo', photo: '/images/demo-sedan.svg', make: 'Astra', year: 2024, transmission: 'Automatic', condition: 'Used', body: 'Sedan' },
  { id: 'DEMO-CAR-204', title: { en: 'Terra Horizon SUV', ar: 'تيرا هورايزن SUV' }, location: { en: '6th of October', ar: 'السادس من أكتوبر' }, price: 1480000, area: 0, region: 'Giza', photo: '/images/demo-suv.svg', make: 'Terra', year: 2025, transmission: 'Automatic', condition: 'New', body: 'SUV' },
  { id: 'DEMO-CAR-318', title: { en: 'Riva Classic Coupe', ar: 'ريفا كلاسيك كوبيه' }, location: { en: 'Alexandria', ar: 'الإسكندرية' }, price: 765000, area: 0, region: 'Alexandria', photo: '/images/demo-coupe.svg', make: 'Riva', year: 2022, transmission: 'Manual', condition: 'Used', body: 'Coupe' },
];

const DEMO_PROPERTIES: Property[] = [
  { id: 'DEMO-EST-017', title: { en: 'Palm Residence Apartment', ar: 'شقة بالم ريزيدنس' }, location: { en: 'New Cairo · Fifth Settlement', ar: 'القاهرة الجديدة · التجمع الخامس' }, price: 4600000, area: 156, region: 'Cairo', photo: '/images/demo-apartment.svg', type: 'Apartment', deal: 'Sale', rooms: 3, floor: 3 },
  { id: 'DEMO-EST-024', title: { en: 'Courtyard Villa', ar: 'فيلا كورت يارد' }, location: { en: 'Sheikh Zayed', ar: 'الشيخ زايد' }, price: 28500, area: 310, region: 'Giza', photo: '/images/demo-villa.svg', type: 'Villa', deal: 'Rent', rooms: 5, floor: 0 },
  { id: 'DEMO-EST-039', title: { en: 'Garden District Plot', ar: 'قطعة أرض حي الحدائق' }, location: { en: 'Riyadh · North District', ar: 'الرياض · الحي الشمالي' }, price: 1850000, area: 420, region: 'Riyadh', photo: '/images/demo-land.svg', type: 'Land', deal: 'Sale', rooms: 0, floor: 0 },
];

const COPY = {
  en: {
    demo: 'Illustrative demo listing · not for sale',
    cars: 'Cars, considered.',
    carsIntro: 'A considered way to browse vehicle listings. Ask about availability, details, and arrange a viewing directly.',
    property: 'Find your next place.',
    propertyIntro: 'Browse illustrative homes and spaces, then request a viewing time that works for you.',
    contact: 'Tell us what you have in mind.',
    contactIntro: 'Share a few details and we’ll prepare a project brief together over WhatsApp.',
    services: 'A clear plan for what comes next.',
    servicesIntro: 'Choose the essentials. This indicative estimate helps frame a conversation; final scope and pricing are confirmed after discovery.',
    region: 'Area',
    any: 'Any',
    priceFrom: 'Minimum price',
    priceTo: 'Maximum price',
    make: 'Make',
    modelYear: 'Year from',
    body: 'Body style',
    transmission: 'Transmission',
    condition: 'Condition',
    new: 'New',
    used: 'Used',
    apartment: 'Apartment',
    villa: 'Villa',
    land: 'Land',
    shop: 'Commercial',
    sale: 'For sale',
    rent: 'For rent',
    rooms: 'Bedrooms',
    area: 'Area m²',
    floor: 'Floor',
    visit: 'Request a viewing',
    viewCar: 'Ask about this vehicle',
    viewProperty: 'Request a property viewing',
    name: 'Your name',
    phone: 'WhatsApp number',
    city: 'City / district',
    budget: 'Approximate budget',
    inquiry: 'What do you need?',
    project: 'Project type',
    details: 'Tell us about your project',
    date: 'Preferred day',
    time: 'Preferred time',
    send: 'Send via WhatsApp',
    localSaved: 'Saved only in this browser. WhatsApp opens for you to send the message.',
    requestSaved: 'Your request is saved in this browser. WhatsApp is ready to open.',
    matches: 'matching listings',
    noResults: 'No listings match those filters.',
    filter: 'Refine listings',
    sampleBadge: 'DEMO',
    bedroom: 'bedrooms',
    transmissionAutomatic: 'Automatic',
    transmissionManual: 'Manual',
    sedan: 'Sedan',
    suv: 'SUV',
    coupe: 'Coupe',
    tracking: 'Track a demo order',
    orderRef: 'Order reference',
    track: 'Check status',
    orderNotFound: 'No order on this browser matches that reference.',
    orderStatus: 'Current status',
    orderNew: 'Received',
    orderConfirmed: 'Confirmed',
    orderComplete: 'Completed',
    inboxNote: 'Tracking is limited to orders saved in this browser.',
    package: 'Website starter',
    packageShop: 'Online store',
    packageApp: 'Custom web app',
    pages: 'Number of pages',
    extras: 'Add-ons',
    copywriting: 'Bilingual content',
    seo: 'Search optimisation',
    integrations: 'Extra integrations',
    estimate: 'Planning estimate',
    estimateNote: 'Indicative only · not a quotation',
    packages: 'Clear starting points',
    starter: 'Brand website',
    store: 'E-commerce store',
    customApp: 'Custom application',
    startsAt: 'Starts at',
    workingProcess: 'How projects move forward',
    steps: ['Discover · align goals and scope', 'Design · map the experience', 'Build · develop and refine', 'Launch · test and hand over'],
    stack: 'Tools in our toolkit',
    portfolio: 'Selected studio routes',
    previewStore: 'Explore our digital studio',
    previewCards: 'Explore NFC cards',
    stats: 'Three connected creative disciplines',
    requestBrief: 'Start your project brief',
    market: 'Market',
    egp: 'EGP',
    sar: 'SAR',
  },
  ar: {
    demo: 'إعلان تجريبي توضيحي · غير متاح للبيع',
    cars: 'سيارات مختارة بعناية.',
    carsIntro: 'تصفح إعلانات تجريبية للمركبات، وتواصل للاستفسار عن التفاصيل وطلب المعاينة.',
    property: 'ابحث عن مساحتك القادمة.',
    propertyIntro: 'اكتشف نماذج توضيحية للعقارات، ثم اطلب موعد معاينة يناسبك.',
    contact: 'شاركنا فكرتك.',
    contactIntro: 'أخبرنا ببعض التفاصيل ونجهز معك ملخص مشروعك عبر واتساب.',
    services: 'خطة واضحة لخطوتك القادمة.',
    servicesIntro: 'اختر احتياجاتك. هذا تقدير إرشادي يساعدنا على بدء الحوار، ويُحدد النطاق والسعر بعد فهم المشروع.',
    region: 'المنطقة',
    any: 'الكل',
    priceFrom: 'أقل سعر',
    priceTo: 'أعلى سعر',
    make: 'الماركة',
    modelYear: 'سنة الصنع من',
    body: 'نوع السيارة',
    transmission: 'ناقل الحركة',
    condition: 'الحالة',
    new: 'جديدة',
    used: 'مستعملة',
    apartment: 'شقة',
    villa: 'فيلا',
    land: 'أرض',
    shop: 'تجاري',
    sale: 'للبيع',
    rent: 'للإيجار',
    rooms: 'غرف النوم',
    area: 'المساحة م²',
    floor: 'الطابق',
    visit: 'اطلب معاينة',
    viewCar: 'استفسر عن السيارة',
    viewProperty: 'اطلب معاينة العقار',
    name: 'الاسم',
    phone: 'رقم واتساب',
    city: 'المدينة / الحي',
    budget: 'الميزانية التقريبية',
    inquiry: 'الخدمة المطلوبة',
    project: 'نوع المشروع',
    details: 'حدثنا عن مشروعك',
    date: 'اليوم المناسب',
    time: 'الوقت المناسب',
    send: 'إرسال عبر واتساب',
    localSaved: 'تُحفظ البيانات على هذا المتصفح فقط. سيفتح واتساب لتأكيد الإرسال.',
    requestSaved: 'حُفظ الطلب على هذا المتصفح. واتساب جاهز للإرسال.',
    matches: 'إعلانات مطابقة',
    noResults: 'لا توجد إعلانات مطابقة لهذه الفلاتر.',
    filter: 'تصفية الإعلانات',
    sampleBadge: 'تجريبي',
    bedroom: 'غرف نوم',
    transmissionAutomatic: 'أوتوماتيك',
    transmissionManual: 'يدوي',
    sedan: 'سيدان',
    suv: 'دفع رباعي',
    coupe: 'كوبيه',
    tracking: 'تتبع طلب تجريبي',
    orderRef: 'رقم الطلب',
    track: 'تحقق من الحالة',
    orderNotFound: 'لا يوجد طلب بهذا الرقم محفوظ على هذا المتصفح.',
    orderStatus: 'حالة الطلب',
    orderNew: 'تم الاستلام',
    orderConfirmed: 'تم التأكيد',
    orderComplete: 'مكتمل',
    inboxNote: 'يقتصر التتبع على الطلبات المحفوظة في هذا المتصفح.',
    package: 'موقع تعريفي',
    packageShop: 'متجر إلكتروني',
    packageApp: 'تطبيق ويب مخصص',
    pages: 'عدد الصفحات',
    extras: 'إضافات',
    copywriting: 'محتوى عربي وإنجليزي',
    seo: 'تهيئة لمحركات البحث',
    integrations: 'تكاملات إضافية',
    estimate: 'تقدير مبدئي',
    estimateNote: 'تقديري فقط · ليس عرض سعر',
    packages: 'باقات بداية واضحة',
    starter: 'موقع للعلامة',
    store: 'متجر إلكتروني',
    customApp: 'تطبيق مخصص',
    startsAt: 'تبدأ من',
    workingProcess: 'مراحل تنفيذ المشروع',
    steps: ['اكتشاف · تحديد الهدف والنطاق', 'تصميم · تخطيط التجربة', 'تطوير · تنفيذ وتحسين', 'إطلاق · اختبار وتسليم'],
    stack: 'تقنيات نستخدمها',
    portfolio: 'مسارات الاستوديو',
    previewStore: 'اكتشف الاستوديو الرقمي',
    previewCards: 'اكتشف بطاقات NFC',
    stats: 'ثلاثة تخصصات إبداعية مترابطة',
    requestBrief: 'ابدأ ملخص مشروعك',
    market: 'السوق',
    egp: 'ج.م',
    sar: 'ر.س',
  },
} as const;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 text-[10px] font-medium text-[#617168]">
      <span>{label}</span>
      {children}
    </label>
  );
}

const inputClass = 'min-h-11 w-full rounded-2xl border border-[#e2eae4] bg-white/90 px-3.5 text-[11px] text-[#34483f] outline-none transition placeholder:text-[#a6b0aa] focus:border-[#83bba0] focus:ring-4 focus:ring-[#e1f4e9]';
const regions = ['Cairo', 'Giza', 'Alexandria', 'Riyadh', 'Jeddah'] as const;

export function MarketplacePage({ locale, market, page, orders, onInquiry, onWhatsApp }: Props) {
  const copy = COPY[locale];
  const [region, setRegion] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [make, setMake] = useState('');
  const [yearFrom, setYearFrom] = useState('');
  const [condition, setCondition] = useState('');
  const [body, setBody] = useState('');
  const [deal, setDeal] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [rooms, setRooms] = useState('');
  const [minArea, setMinArea] = useState('');
  const [zoom, setZoom] = useState<string | null>(null);
  const [orderRef, setOrderRef] = useState('');
  const [tracked, setTracked] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [budget, setBudget] = useState('');
  const [message, setMessage] = useState('');
  const [projectType, setProjectType] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('');

  const filteredVehicles = useMemo(() => DEMO_VEHICLES.filter((item) =>
    (!region || item.region === region) &&
    (!make || item.make === make) &&
    (!yearFrom || item.year >= Number(yearFrom)) &&
    (!condition || item.condition === condition) &&
    (!body || item.body === body) &&
    (!minPrice || item.price >= Number(minPrice)) &&
    (!maxPrice || item.price <= Number(maxPrice)),
  ), [body, condition, make, maxPrice, minPrice, region, yearFrom]);
  const filteredProperties = useMemo(() => DEMO_PROPERTIES.filter((item) =>
    (!region || item.region === region) &&
    (!deal || item.deal === deal) &&
    (!propertyType || item.type === propertyType) &&
    (!rooms || item.rooms >= Number(rooms)) &&
    (!minArea || item.area >= Number(minArea)) &&
    (!minPrice || item.price >= Number(minPrice)) &&
    (!maxPrice || item.price <= Number(maxPrice)),
  ), [deal, maxPrice, minArea, minPrice, propertyType, region, rooms]);

  const request = (event: FormEvent<HTMLFormElement>, kind: PlatformInquiry['type'], title: string, options?: { date?: string; time?: string }) => {
    event.preventDefault();
    const inquiry: PlatformInquiry = {
      id: makeReference('ZX-INQ'),
      createdAt: new Date().toISOString(),
      type: kind,
      title,
      name: name.trim(),
      phone: phone.trim(),
      city: city.trim(),
      market,
      budget: budget.trim(),
      message: message.trim(),
      date: options?.date,
      time: options?.time,
      status: 'new',
    };
    onInquiry(inquiry);
    const lines = [
      locale === 'ar' ? 'مرحباً ZEXOR، لدي استفسار جديد.' : 'Hello ZEXOR, I have a new inquiry.',
      `Ref: ${inquiry.id}`,
      `${locale === 'ar' ? 'الطلب' : 'Request'}: ${title}`,
      `${locale === 'ar' ? 'الاسم' : 'Name'}: ${inquiry.name}`,
      `${locale === 'ar' ? 'الهاتف' : 'Phone'}: ${inquiry.phone}`,
      `${locale === 'ar' ? 'المدينة' : 'City'}: ${inquiry.city}`,
      inquiry.budget && `${locale === 'ar' ? 'الميزانية' : 'Budget'}: ${inquiry.budget}`,
      inquiry.date && `${locale === 'ar' ? 'موعد المعاينة' : 'Viewing'}: ${inquiry.date} ${inquiry.time ?? ''}`,
      inquiry.message && `${locale === 'ar' ? 'التفاصيل' : 'Details'}: ${inquiry.message}`,
    ].filter(Boolean).join('\n');
    onWhatsApp(market, lines);
    setError(copy.requestSaved);
    setMessage('');
  };

  const shell = (title: string, intro: string, icon: LucideIcon, children: React.ReactNode) => {
    const Icon = icon;
    return (
      <motion.section animate={{ opacity: 1, y: 0 }} className="mx-auto min-h-[72vh] max-w-7xl px-5 pb-28 pt-12 sm:px-8 sm:pt-16" initial={{ opacity: 0, y: 14 }} transition={{ duration: .35 }}>
        <div className="relative mb-8 overflow-hidden rounded-[2rem] border border-white/90 bg-linear-to-br from-[#d9f2e9] via-[#faf8f2] to-[#ecdff4] p-6 shadow-[0_32px_90px_-50px_rgba(53,83,68,.32)] sm:p-10">
          <div aria-hidden="true" className="absolute -end-20 -top-32 h-72 w-72 rounded-full border border-white/70 bg-white/30 blur-2xl" />
          <p className="relative inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[.18em] text-[#719582]"><Icon className="h-4 w-4" />ZEXOR / {page}</p>
          <h1 className={`relative mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-[#2d4438] sm:text-5xl ${locale === 'ar' ? 'leading-[1.5]' : ''}`}>{title}</h1>
          <p className="relative mt-3 max-w-2xl text-sm leading-6 text-[#748279]">{intro}</p>
          {(page === 'cars' || page === 'property') && <p className="relative mt-5 inline-flex items-center gap-2 rounded-full border border-[#e7caa9] bg-[#fff8eb]/80 px-3 py-2 text-[9px] font-semibold text-[#997246]"><Tag className="h-3.5 w-3.5" />{copy.demo}</p>}
        </div>
        {children}
      </motion.section>
    );
  };

  const filterField = (label: string, value: string, onChange: (value: string) => void, options: readonly string[]) => (
    <Field label={label}>
      <select className={inputClass} onChange={(event) => onChange(event.target.value)} value={value}>
        <option value="">{copy.any}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </Field>
  );

  const priceFields = (
    <>
      <Field label={copy.priceFrom}><input className={inputClass} min="0" onChange={(event) => setMinPrice(event.target.value)} placeholder="0" type="number" value={minPrice} /></Field>
      <Field label={copy.priceTo}><input className={inputClass} min="0" onChange={(event) => setMaxPrice(event.target.value)} placeholder="—" type="number" value={maxPrice} /></Field>
      {filterField(copy.region, region, setRegion, regions)}
    </>
  );

  const appointmentFields = (
    <>
      <Field label={copy.name}><input autoComplete="name" className={inputClass} onChange={(event) => setName(event.target.value)} required value={name} /></Field>
      <Field label={copy.phone}><input autoComplete="tel" className={inputClass} onChange={(event) => setPhone(event.target.value)} required type="tel" value={phone} /></Field>
      <Field label={copy.city}><input autoComplete="address-level2" className={inputClass} onChange={(event) => setCity(event.target.value)} required value={city} /></Field>
      <Field label={copy.date}><input className={inputClass} min={new Date().toISOString().slice(0, 10)} onChange={(event) => setVisitDate(event.target.value)} required type="date" value={visitDate} /></Field>
      <Field label={copy.time}><input className={inputClass} onChange={(event) => setVisitTime(event.target.value)} required type="time" value={visitTime} /></Field>
    </>
  );

  if (page === 'cars') {
    return shell(copy.cars, copy.carsIntro, CarFront, (
      <>
        <section className="mb-7 rounded-[1.6rem] border border-white bg-white/80 p-4 shadow-sm sm:p-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#41584a]"><SlidersHorizontal className="h-4 w-4" />{copy.filter}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {priceFields}
            {filterField(copy.make, make, setMake, [...new Set(DEMO_VEHICLES.map((item) => item.make))])}
            <Field label={copy.modelYear}><input className={inputClass} max={new Date().getFullYear()} min="1990" onChange={(event) => setYearFrom(event.target.value)} placeholder="2020" type="number" value={yearFrom} /></Field>
            {filterField(copy.body, body, setBody, ['Sedan', 'SUV', 'Coupe'])}
            {filterField(copy.transmission, '', () => {}, ['Automatic', 'Manual'])}
            {filterField(copy.condition, condition, setCondition, ['New', 'Used'])}
          </div>
          <p className="mt-4 text-[10px] text-[#8c9a91]">{filteredVehicles.length} {copy.matches}</p>
        </section>
        {filteredVehicles.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredVehicles.map((car) => (
              <article className="group overflow-hidden rounded-[1.7rem] border border-white bg-white/90 shadow-[0_22px_65px_-45px_rgba(46,72,57,.35)]" key={car.id}>
                <button aria-label={locale === 'ar' ? 'تكبير صورة السيارة' : 'Enlarge vehicle image'} className="relative block aspect-[1.42/1] w-full overflow-hidden bg-[#e8f1ec]" onClick={() => setZoom(car.photo)} type="button">
                  <img alt={car.title[locale]} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" src={car.photo} />
                  <span className="absolute start-4 top-4 rounded-full bg-[#fff8eb]/90 px-3 py-1.5 text-[8px] font-bold tracking-widest text-[#9b774a]">{copy.sampleBadge} · {car.id}</span>
                </button>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-[#354b3d]">{car.title[locale]}</h2><p className="mt-1 flex items-center gap-1 text-[10px] text-[#89968e]"><MapPin className="h-3.5 w-3.5" />{car.location[locale]}</p></div><Heart className="h-4 w-4 text-[#c39996]" /></div>
                  <div className="mt-4 flex flex-wrap gap-2">{[String(car.year), locale === 'ar' ? (car.transmission === 'Automatic' ? copy.transmissionAutomatic : copy.transmissionManual) : car.transmission, locale === 'ar' ? (car.condition === 'New' ? copy.new : copy.used) : car.condition, locale === 'ar' ? (car.body === 'SUV' ? copy.suv : car.body === 'Coupe' ? copy.coupe : copy.sedan) : car.body].map((feature) => <span className="rounded-full bg-[#eff5f0] px-2.5 py-1.5 text-[8px] text-[#617669]" key={feature}>{feature}</span>)}</div>
                  <p className="mt-4 text-lg font-semibold text-[#385c48]">{new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en').format(car.price)} <span className="text-[10px] font-normal">{copy.egp}</span></p>
                  <button className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#314f43] px-4 text-[10px] font-semibold text-white transition hover:bg-[#426a58]" onClick={() => onWhatsApp(market, `${locale === 'ar' ? 'استفسار تجريبي عن سيارة' : 'Demo vehicle inquiry'} ${car.id} · ${car.title[locale]}`)} type="button"><MessageCircle className="h-4 w-4" />{copy.viewCar}<ArrowUpRight className="h-3.5 w-3.5" /></button>
                </div>
              </article>
            ))}
          </div>
        ) : <EmptyState text={copy.noResults} />}
        <p className="mt-6 text-center text-[9px] leading-5 text-[#98a49d]">{copy.demo}</p>
        {zoom && <ImageModal image={zoom} label={locale === 'ar' ? 'صورة السيارة' : 'Vehicle image'} onClose={() => setZoom(null)} />}
      </>
    ));
  }

  if (page === 'property') {
    return shell(copy.property, copy.propertyIntro, Building2, (
      <>
        <section className="mb-7 rounded-[1.6rem] border border-white bg-white/80 p-4 shadow-sm sm:p-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#41584a]"><SlidersHorizontal className="h-4 w-4" />{copy.filter}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {priceFields}
            {filterField(copy.inquiry, deal, setDeal, ['Sale', 'Rent'])}
            {filterField(copy.project, propertyType, setPropertyType, ['Apartment', 'Villa', 'Land', 'Shop'])}
            <Field label={copy.rooms}><input className={inputClass} min="0" onChange={(event) => setRooms(event.target.value)} placeholder="2+" type="number" value={rooms} /></Field>
            <Field label={copy.area}><input className={inputClass} min="0" onChange={(event) => setMinArea(event.target.value)} placeholder="100+" type="number" value={minArea} /></Field>
          </div>
          <p className="mt-4 text-[10px] text-[#8c9a91]">{filteredProperties.length} {copy.matches}</p>
        </section>
        {filteredProperties.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredProperties.map((home) => (
              <article className="overflow-hidden rounded-[1.7rem] border border-white bg-white/90 shadow-[0_22px_65px_-45px_rgba(46,72,57,.35)]" key={home.id}>
                <button aria-label={locale === 'ar' ? 'تكبير صورة العقار' : 'Enlarge property image'} className="relative block aspect-[1.42/1] w-full overflow-hidden bg-[#e9f1ec]" onClick={() => setZoom(home.photo)} type="button">
                  <img alt={home.title[locale]} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" src={home.photo} />
                  <span className="absolute start-4 top-4 rounded-full bg-[#fff8eb]/90 px-3 py-1.5 text-[8px] font-bold tracking-widest text-[#9b774a]">{copy.sampleBadge} · {home.id}</span>
                  <span className="absolute end-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[8px] font-semibold text-[#617969]">{locale === 'ar' ? (home.deal === 'Sale' ? copy.sale : copy.rent) : home.deal}</span>
                </button>
                <div className="p-5">
                  <h2 className="font-semibold text-[#354b3d]">{home.title[locale]}</h2>
                  <p className="mt-1 flex items-center gap-1 text-[10px] text-[#89968e]"><MapPin className="h-3.5 w-3.5" />{home.location[locale]}</p>
                  <div className="mt-4 flex flex-wrap gap-2">{[`${home.area} m²`, home.type === 'Apartment' || home.type === 'Villa' ? `${home.rooms} ${copy.bedroom}` : home.type, home.floor > 0 ? `${copy.floor}: ${home.floor}` : undefined].filter(Boolean).map((feature) => <span className="rounded-full bg-[#eff5f0] px-2.5 py-1.5 text-[8px] text-[#617669]" key={feature}>{feature}</span>)}</div>
                  <p className="mt-4 text-lg font-semibold text-[#385c48]">{new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en').format(home.price)} <span className="text-[10px] font-normal">{copy.egp}{home.deal === 'Rent' ? ` / ${locale === 'ar' ? 'شهرياً' : 'month'}` : ''}</span></p>
                  <details className="mt-4 rounded-2xl bg-[#f4f7f4] p-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between text-[10px] font-semibold text-[#567260]"><span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" />{copy.visit}</span><ArrowDownRight className="h-3.5 w-3.5" /></summary>
                    <form className="mt-4 grid gap-3" onSubmit={(event) => request(event, 'property', `${home.id} · ${home.title[locale]}`, { date: visitDate, time: visitTime })}>
                      {appointmentFields}
                      {error && <p className="text-[9px] text-[#61806d]" role="status">{error}</p>}
                      <button className="min-h-11 rounded-full bg-[#314f43] px-4 text-[10px] font-semibold text-white" type="submit">{copy.send}</button>
                    </form>
                  </details>
                </div>
              </article>
            ))}
          </div>
        ) : <EmptyState text={copy.noResults} />}
        <p className="mt-6 text-center text-[9px] leading-5 text-[#98a49d]">{copy.demo}</p>
        {zoom && <ImageModal image={zoom} label={locale === 'ar' ? 'صورة العقار' : 'Property image'} onClose={() => setZoom(null)} />}
      </>
    ));
  }

  if (page === 'contact') {
    const submitContact = (event: FormEvent<HTMLFormElement>) => request(event, 'contact', projectType || (locale === 'ar' ? 'استفسار عام' : 'General inquiry'));
    const orderStatuses: Record<TrackedOrder['status'], string> = { new: copy.orderNew, confirmed: copy.orderConfirmed, complete: copy.orderComplete };
    return shell(copy.contact, copy.contactIntro, MessageCircle, (
      <div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
        <form className="grid gap-4 rounded-[1.8rem] border border-white bg-white/85 p-5 shadow-sm sm:p-7" onSubmit={submitContact}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={copy.name}><input autoComplete="name" className={inputClass} onChange={(event) => setName(event.target.value)} required value={name} /></Field>
            <Field label={copy.phone}><input autoComplete="tel" className={inputClass} onChange={(event) => setPhone(event.target.value)} required type="tel" value={phone} /></Field>
            <Field label={copy.city}><input autoComplete="address-level2" className={inputClass} onChange={(event) => setCity(event.target.value)} required value={city} /></Field>
            <Field label={copy.budget}><input className={inputClass} onChange={(event) => setBudget(event.target.value)} placeholder="EGP / SAR" value={budget} /></Field>
            <Field label={copy.market}><select className={inputClass} defaultValue={market}><option value="eg">🇪🇬 Egypt</option><option value="ksa">🇸🇦 Saudi Arabia</option></select></Field>
            <Field label={copy.project}><select className={inputClass} onChange={(event) => setProjectType(event.target.value)} required value={projectType}><option value="">{copy.any}</option>{[copy.package, copy.packageShop, copy.packageApp, locale === 'ar' ? 'بطاقات NFC وأزياء' : 'NFC cards & apparel', locale === 'ar' ? 'استفسار آخر' : 'Other inquiry'].map((item) => <option key={item}>{item}</option>)}</select></Field>
          </div>
          <Field label={copy.details}><textarea className={`${inputClass} min-h-28 py-3`} onChange={(event) => setMessage(event.target.value)} required value={message} /></Field>
          {error && <p className="text-[10px] text-[#61806d]" role="status">{error}</p>}
          <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#314f43] px-6 text-[11px] font-semibold text-white" type="submit"><MessageCircle className="h-4 w-4" />{copy.send}<ArrowUpRight className="h-4 w-4" /></button>
          <p className="text-[9px] leading-5 text-[#9aa49e]">{copy.localSaved}</p>
        </form>
        <section className="rounded-[1.8rem] border border-white bg-linear-to-br from-[#e8f5ee] to-[#f5eef8] p-5 sm:p-7">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 text-[#6a9c82]"><Search className="h-5 w-5" /></span>
          <h2 className="mt-4 text-xl font-semibold text-[#3e5548]">{copy.tracking}</h2>
          <p className="mt-2 text-[10px] leading-5 text-[#7f8d83]">{copy.inboxNote}</p>
          <form className="mt-5 flex gap-2" onSubmit={(event) => { event.preventDefault(); setTracked(orders.find((order) => order.id.toLowerCase() === orderRef.trim().toLowerCase()) ?? null); }}>
            <input aria-label={copy.orderRef} className={inputClass} onChange={(event) => setOrderRef(event.target.value)} placeholder="ZX-1234567" value={orderRef} />
            <button aria-label={copy.track} className="flex h-11 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#314f43] text-white" type="submit"><Search className="h-4 w-4" /></button>
          </form>
          {tracked ? <div className="mt-4 rounded-2xl border border-white/80 bg-white/75 p-4"><p className="text-[10px] text-[#819087]">{copy.orderStatus}</p><div className="mt-2 flex items-center gap-2 text-xs font-semibold text-[#436650]"><Check className="h-4 w-4" />{tracked.id} · {orderStatuses[tracked.status]}</div></div> : orderRef && <p className="mt-3 text-[9px] text-[#a16f69]" role="status">{copy.orderNotFound}</p>}
          <div className="mt-6 flex items-start gap-2 rounded-2xl bg-white/60 p-3 text-[9px] leading-5 text-[#8a948d]"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#80a88e]" />{copy.localSaved}</div>
        </section>
      </div>
    ));
  }

  return <ServicesToolkit locale={locale} market={market} onInquiry={onInquiry} onWhatsApp={onWhatsApp} copy={copy} />;
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-[1.6rem] border border-dashed border-[#dfe9e2] bg-white/60 px-5 py-12 text-center text-xs text-[#85938a]">{text}</div>;
}

function ImageModal({ image, label, onClose }: { image: string; label: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-90 grid place-items-center bg-[#17231e]/75 p-4 backdrop-blur-md" onClick={onClose} role="presentation">
      <button aria-label="Close image" className="absolute end-5 top-5 rounded-full bg-white p-3 text-[#34483f]" onClick={onClose} type="button"><X className="h-5 w-5" /></button>
      <img alt={label} className="max-h-[85vh] max-w-[min(90vw,70rem)] rounded-3xl object-contain shadow-2xl" src={image} />
    </div>
  );
}

function ServicesToolkit({
  locale,
  market,
  onInquiry,
  onWhatsApp,
  copy,
}: {
  locale: Locale;
  market: Market;
  onInquiry: Props['onInquiry'];
  onWhatsApp: Props['onWhatsApp'];
  copy: (typeof COPY)[Locale];
}) {
  const [kind, setKind] = useState('website');
  const [pages, setPages] = useState(5);
  const [bilingual, setBilingual] = useState(false);
  const [seo, setSeo] = useState(false);
  const [integrations, setIntegrations] = useState(0);
  const [briefOpen, setBriefOpen] = useState(false);
  const base = kind === 'website' ? (market === 'eg' ? 8000 : 1200) : kind === 'store' ? (market === 'eg' ? 18000 : 2500) : (market === 'eg' ? 32000 : 4500);
  const estimate = base + Math.max(0, pages - 5) * (market === 'eg' ? 650 : 90) + (bilingual ? (market === 'eg' ? 3000 : 420) : 0) + (seo ? (market === 'eg' ? 2200 : 310) : 0) + integrations * (market === 'eg' ? 1200 : 165);
  const currency = market === 'eg' ? copy.egp : copy.sar;
  const submitBrief = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const inquiry: PlatformInquiry = {
      id: makeReference('ZX-INQ'), createdAt: new Date().toISOString(), type: 'contact',
      title: `${kind} · ${data.get('name')?.toString() ?? ''}`, name: data.get('name')?.toString() ?? '',
      phone: data.get('phone')?.toString() ?? '', city: data.get('city')?.toString() ?? '', market,
      budget: `${estimate} ${currency}`, message: `${pages} pages · ${bilingual ? 'bilingual · ' : ''}${seo ? 'SEO · ' : ''}${integrations} integrations`,
      status: 'new',
    };
    onInquiry(inquiry);
    onWhatsApp(market, `${locale === 'ar' ? 'طلب مشروع رقمي' : 'Digital project inquiry'}\nRef: ${inquiry.id}\n${inquiry.title}\n${inquiry.budget}\n${inquiry.message}\n${inquiry.name}\n${inquiry.phone}\n${inquiry.city}`);
    setBriefOpen(false);
  };
  const price = (value: number) => `${new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en').format(value)} ${currency}`;
  const tiers = [
    { id: 'website', icon: MonitorSmartphone, title: copy.starter, amount: market === 'eg' ? 8000 : 1200, detail: locale === 'ar' ? 'موقع متجاوب ومتكامل لعلامتك.' : 'A responsive, thoughtful brand website.' },
    { id: 'store', icon: ShoppingBag, title: copy.store, amount: market === 'eg' ? 18000 : 2500, detail: locale === 'ar' ? 'كتالوج منتجات وتجربة طلب سهلة.' : 'Product catalogue and a considered order journey.' },
    { id: 'app', icon: Code2, title: copy.customApp, amount: market === 'eg' ? 32000 : 4500, detail: locale === 'ar' ? 'تطبيق ويب مخصص لطريقة عملك.' : 'A custom web experience for your workflow.' },
  ];
  return (
    <motion.section animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-7xl space-y-7 px-5 pb-28 pt-2 sm:px-8" initial={{ opacity: 0, y: 14 }}>
      <div className="relative overflow-hidden rounded-[2rem] border border-white bg-linear-to-br from-[#d9f2e9] via-[#faf8f2] to-[#ecdff4] p-6 shadow-[0_32px_90px_-50px_rgba(53,83,68,.32)] sm:p-10">
        <p className="inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[.18em] text-[#719582]"><Code2 className="h-4 w-4" />ZEXOR / DIGITAL STUDIO</p>
        <h1 className={`mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-[#2d4438] sm:text-5xl ${locale === 'ar' ? 'leading-[1.5]' : ''}`}>{copy.services}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#748279]">{copy.servicesIntro}</p>
        <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-2 text-[9px] text-[#74867b]"><Globe2 className="h-3.5 w-3.5" />{copy.stats}</p>
      </div>

      <section>
        <div className="mb-4 flex items-end justify-between gap-3"><div><p className="text-[9px] font-semibold uppercase tracking-[.18em] text-[#93a39a]">{copy.packages}</p><h2 className="mt-1 text-xl font-semibold text-[#354b3e]">{copy.portfolio}</h2></div><span className="rounded-full bg-white px-3 py-2 text-[9px] text-[#78897f]">{market === 'eg' ? '🇪🇬 EGP' : '🇸🇦 SAR'}</span></div>
        <div className="grid gap-4 md:grid-cols-3">
          {tiers.map(({ id, icon: Icon, title, amount, detail }) => <article className="rounded-[1.6rem] border border-white bg-white/85 p-5 shadow-sm" key={id}><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e7f5ec] text-[#6c9c80]"><Icon className="h-5 w-5" /></span><h3 className="mt-4 text-sm font-semibold text-[#3b5144]">{title}</h3><p className="mt-2 min-h-10 text-[10px] leading-5 text-[#87948c]">{detail}</p><p className="mt-4 text-lg font-semibold text-[#42674f]"><span className="block text-[8px] font-normal text-[#9aa49e]">{copy.startsAt}</span>{price(amount)}</p><button className="mt-4 min-h-10 w-full rounded-full border border-[#cfdfd3] text-[10px] font-semibold text-[#4d755c] transition hover:bg-[#edf6ef]" onClick={() => { setKind(id); setBriefOpen(true); }} type="button">{copy.requestBrief}<ArrowUpRight className="ms-2 inline h-3.5 w-3.5" /></button></article>)}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
        <div className="rounded-[1.8rem] border border-white bg-white/85 p-5 shadow-sm sm:p-7">
          <p className="text-[9px] font-semibold uppercase tracking-[.17em] text-[#88a392]">{copy.estimateNote}</p>
          <h2 className="mt-2 text-xl font-semibold text-[#374e41]">{copy.estimate}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label={copy.project}><select className={inputClass} onChange={(event) => setKind(event.target.value)} value={kind}><option value="website">{copy.package}</option><option value="store">{copy.packageShop}</option><option value="app">{copy.packageApp}</option></select></Field>
            <Field label={copy.pages}><input className={inputClass} max="40" min="1" onChange={(event) => setPages(Number(event.target.value))} type="number" value={pages} /></Field>
            <Field label={copy.extras}><span className="flex min-h-11 items-center gap-2 rounded-2xl border border-[#e2eae4] bg-white px-3 text-[10px]"><input checked={bilingual} onChange={(event) => setBilingual(event.target.checked)} type="checkbox" />{copy.copywriting}</span></Field>
            <Field label={copy.extras}><span className="flex min-h-11 items-center gap-2 rounded-2xl border border-[#e2eae4] bg-white px-3 text-[10px]"><input checked={seo} onChange={(event) => setSeo(event.target.checked)} type="checkbox" />{copy.seo}</span></Field>
            <Field label={copy.integrations}><input className={inputClass} max="20" min="0" onChange={(event) => setIntegrations(Number(event.target.value))} type="number" value={integrations} /></Field>
          </div>
          <div className="mt-5 flex items-center justify-between rounded-2xl bg-linear-to-r from-[#e7f4eb] to-[#f2eaf6] p-4"><span className="text-[10px] text-[#64776a]">{copy.estimateNote}</span><strong className="text-xl text-[#385d48]">{price(estimate)}</strong></div>
        </div>
        <div className="rounded-[1.8rem] border border-white bg-linear-to-br from-[#edf7ef] to-[#f7f0f8] p-5 sm:p-7">
          <h2 className="text-xl font-semibold text-[#3b5144]">{copy.workingProcess}</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">{copy.steps.map((step, index) => <div className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/65 p-4" key={step}><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#dff0e4] text-[10px] font-bold text-[#648975]">0{index + 1}</span><span className="text-[10px] leading-5 text-[#65766a]">{step}</span></div>)}</div>
          <h3 className="mt-7 text-[9px] font-semibold uppercase tracking-[.17em] text-[#899b8f]">{copy.stack}</h3>
          <div className="mt-3 flex flex-wrap gap-2">{['React', 'Vite', 'TypeScript', 'Tailwind CSS', 'Vercel', 'Supabase'].map((tech) => <span className="rounded-full border border-white bg-white/75 px-3 py-2 text-[9px] font-medium text-[#67806f]" key={tech}>{tech}</span>)}</div>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <a className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#314f43] px-4 text-[10px] font-semibold text-white" href="#services">{copy.previewStore}<ArrowUpRight className="h-3.5 w-3.5" /></a>
            <a className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white bg-white/70 px-4 text-[10px] font-semibold text-[#54735e]" href="#cards">{copy.previewCards}<Wifi className="h-3.5 w-3.5" /></a>
          </div>
        </div>
      </section>

      <section className="rounded-[1.8rem] border border-[#e4eee6] bg-[#fbfcf9]/90 p-5 sm:p-7">
        <div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#edf5ef] text-[#75a18a]"><ShieldCheck className="h-5 w-5" /></span><div><h2 className="text-sm font-semibold text-[#43594a]">{locale === 'ar' ? 'تجربة صادقة قبل الوعد.' : 'Clarity before promises.'}</h2><p className="mt-2 text-[10px] leading-5 text-[#849188]">{locale === 'ar' ? 'نشارك نطاقاً إرشادياً وطريقة العمل بدلاً من اختلاق تقييمات أو أعداد مشاريع. شاركنا ملخصك لنحدد الخطوة المناسبة.' : 'We share a transparent starting scope instead of inventing reviews or project counts. Share a brief and we’ll determine a suitable next step.'}</p></div></div>
      </section>
      {briefOpen && <div className="fixed inset-0 z-80 grid place-items-center bg-[#17231e]/35 p-4 backdrop-blur-sm"><form className="grid w-full max-w-lg gap-3 rounded-[1.8rem] bg-white p-6 shadow-2xl" onSubmit={submitBrief}><div className="flex items-center justify-between"><h2 className="font-semibold text-[#354b3d]">{copy.requestBrief}</h2><button aria-label="Close" onClick={() => setBriefOpen(false)} type="button"><X className="h-4 w-4" /></button></div><p className="text-[10px] text-[#839087]">{price(estimate)} · {copy.estimateNote}</p>{[['name', locale === 'ar' ? 'الاسم' : 'Name'], ['phone', locale === 'ar' ? 'الهاتف' : 'Phone'], ['city', locale === 'ar' ? 'المدينة' : 'City']].map(([field, label]) => <Field key={field} label={label}><input className={inputClass} name={field} required type={field === 'phone' ? 'tel' : 'text'} /></Field>)}<button className="min-h-11 rounded-full bg-[#314f43] text-[10px] font-semibold text-white" type="submit">{copy.send}</button><p className="text-center text-[9px] text-[#919d95]">{copy.localSaved}</p></form></div>}
    </motion.section>
  );
}
