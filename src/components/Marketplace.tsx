import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays,
  CarFront,
  ChevronLeft,
  ChevronRight,
  Eye,
  Home,
  MapPin,
  Maximize2,
  MessageCircle,
  SlidersHorizontal,
  X,
  Check,
} from 'lucide-react';
import { INITIAL_PROPERTIES, INITIAL_VEHICLES } from '../data/initialData';
import type { Locale, Market, PlatformInquiry, Property, Vehicle } from '../types';

type Props = {
  mode: 'cars' | 'property';
  locale: Locale;
  market: Market;
  vehicles?: Vehicle[];
  properties?: Property[];
  onInquiry: (inquiry: PlatformInquiry) => void;
  onWhatsApp: (market: Market, message: string) => void;
};

export function Marketplace({
  mode,
  locale,
  market,
  vehicles,
  properties,
  onInquiry,
  onWhatsApp,
}: Props) {
  const isArabic = locale === 'ar';
  const currency = mode === 'cars' ? (market === 'eg' ? 'ج.م' : 'ر.س') : market === 'eg' ? 'ج.م' : 'ر.س';

  // Filters
  const [regionFilter, setRegionFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [dealFilter, setDealFilter] = useState('');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('');
  const [makeFilter, setMakeFilter] = useState('');

  // Selected item modal / Slider / Booking
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(null);
  const [activeProperty, setActiveProperty] = useState<Property | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // Booking Form State
  const [bookingName, setBookingName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('14:00');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const vehicleList = vehicles ?? INITIAL_VEHICLES;
  const propertyList = properties ?? INITIAL_PROPERTIES;

  const filteredVehicles = vehicleList.filter((car) => {
    if (regionFilter && car.region !== regionFilter) return false;
    if (makeFilter && car.make !== makeFilter) return false;
    if (conditionFilter && car.condition !== conditionFilter) return false;
    if (minPrice && car.price < Number(minPrice)) return false;
    if (maxPrice && car.price > Number(maxPrice)) return false;
    return true;
  });

  const filteredProperties = propertyList.filter((prop) => {
    if (regionFilter && prop.region !== regionFilter) return false;
    if (dealFilter && prop.deal !== dealFilter) return false;
    if (propertyTypeFilter && prop.type !== propertyTypeFilter) return false;
    if (minPrice && prop.price < Number(minPrice)) return false;
    if (maxPrice && prop.price > Number(maxPrice)) return false;
    return true;
  });

  const handleCarWhatsApp = (car: Vehicle) => {
    const text = isArabic
      ? `مرحباً ZEXOR، أرغب في حجز معاينة للسيارة:
كود السيارة: ${car.id}
الموديل: ${car.title.ar}
السعر: ${new Intl.NumberFormat('ar-EG').format(car.price)} ج.م`
      : `Hello ZEXOR, I want to book a viewing for vehicle:
Car Code: ${car.id}
Model: ${car.title.en}
Price: ${new Intl.NumberFormat('en').format(car.price)} EGP`;
    onWhatsApp(market, text);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const itemTitle = activeVehicle ? activeVehicle.title[locale] : activeProperty ? activeProperty.title[locale] : '';
    const itemCode = activeVehicle ? activeVehicle.id : activeProperty ? activeProperty.id : '';

    const inquiry: PlatformInquiry = {
      id: `ZX-BK-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      type: mode === 'cars' ? 'car' : 'property',
      title: `${itemCode} · ${itemTitle}`,
      name: bookingName.trim(),
      phone: bookingPhone.trim(),
      city: activeVehicle ? activeVehicle.region : activeProperty ? activeProperty.region : '',
      market,
      budget: '',
      message: `Inspection booked for ${bookingDate} at ${bookingTime}`,
      date: bookingDate,
      time: bookingTime,
      status: 'new',
    };
    onInquiry(inquiry);

    const msg = isArabic
      ? `طلب حجز موعد معاينة ميدانية:
الكود: ${itemCode}
الاسم: ${bookingName}
الهاتف: ${bookingPhone}
التاريخ: ${bookingDate}
الساعة: ${bookingTime}
العنوان: ${itemTitle}`
      : `Inspection appointment booked:
Code: ${itemCode}
Name: ${bookingName}
Phone: ${bookingPhone}
Date: ${bookingDate}
Time: ${bookingTime}
Listing: ${itemTitle}`;
    onWhatsApp(market, msg);

    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setActiveVehicle(null);
      setActiveProperty(null);
    }, 2500);
  };

  return (
    <div className="space-y-10">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-4xl border border-white bg-linear-to-br from-[#d9f2e9] via-[#faf8f2] to-[#ecdff4] p-6 shadow-xl sm:p-10">
        <div className="relative z-10 max-w-2xl">
          <p className="inline-flex items-center gap-2 text-[9px] font-semibold tracking-widest text-[#5c8a74]">
            {mode === 'cars' ? <CarFront className="h-4 w-4" /> : <Home className="h-4 w-4" />}
            ZEXOR / {mode === 'cars' ? 'VEHICLE SHOWROOM' : 'PREMIUM REAL ESTATE'}
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-[#293d32] sm:text-5xl">
            {mode === 'cars'
              ? isArabic
                ? 'معرض ومكتب السيارات الفاخرة'
                : 'Curated Vehicle Showroom'
              : isArabic
                ? 'قسم العقارات والمساحات الفاخرة'
                : 'Prime Real Estate & Estates'}
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#697a70]">
            {mode === 'cars'
              ? isArabic
                ? 'تصفح السيارات المتاحة للبيع مع صور متعددة وسلايدر تكبير ومواصفات تفصيلية وحجز معاينة فورية بالرمز التعريفي.'
                : 'Browse verified vehicles with high-resolution multi-angle gallery, specifications, and instant WhatsApp inspection booking.'
              : isArabic
                ? 'عقارات مختارة للبيع والإيجار (شقق، فيلات، أراضٍ، محلات) مع خريطة توضيحية وجدول مواعيد معاينة ميدانية.'
                : 'Explore prime residential and commercial spaces with district maps and in-person viewing reservation.'}
          </p>
        </div>
      </section>

      {/* Filter Toolbar */}
      <section className="rounded-3xl border border-white bg-white/85 p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-xs font-bold text-[#354f40]">
            <SlidersHorizontal className="h-4 w-4" />
            {isArabic ? 'تصفية وبحث متقدم' : 'Advanced Filter & Refine'}
          </h3>
          <span className="text-[10px] text-[#7d8f85]">
            {mode === 'cars' ? `${filteredVehicles.length} سيارات` : `${filteredProperties.length} عقارات`}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Region */}
          <div>
            <label className="text-[10px] font-medium text-[#65796f]">{isArabic ? 'المدينة / المنطقة' : 'Region'}</label>
            <select
              className="mt-1 h-10 w-full rounded-xl border border-[#dfe8e2] bg-white px-3 text-xs text-[#2c3d34] outline-none"
              onChange={(e) => setRegionFilter(e.target.value)}
              value={regionFilter}
            >
              <option value="">{isArabic ? 'كل المناطق' : 'All Regions'}</option>
              <option value="Cairo">{isArabic ? 'القاهرة' : 'Cairo'}</option>
              <option value="Giza">{isArabic ? 'الجيزة' : 'Giza'}</option>
              <option value="Alexandria">{isArabic ? 'الإسكندرية' : 'Alexandria'}</option>
              <option value="Riyadh">{isArabic ? 'الرياض' : 'Riyadh'}</option>
              <option value="Jeddah">{isArabic ? 'جدة' : 'Jeddah'}</option>
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="text-[10px] font-medium text-[#65796f]">{isArabic ? 'أقل سعر' : 'Min Price'}</label>
            <input
              className="mt-1 h-10 w-full rounded-xl border border-[#dfe8e2] bg-white px-3 text-xs text-[#2c3d34] outline-none"
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="0"
              type="number"
              value={minPrice}
            />
          </div>

          <div>
            <label className="text-[10px] font-medium text-[#65796f]">{isArabic ? 'أعلى سعر' : 'Max Price'}</label>
            <input
              className="mt-1 h-10 w-full rounded-xl border border-[#dfe8e2] bg-white px-3 text-xs text-[#2c3d34] outline-none"
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="—"
              type="number"
              value={maxPrice}
            />
          </div>

          {mode === 'cars' ? (
            <>
              <div>
                <label className="text-[10px] font-medium text-[#65796f]">{isArabic ? 'الماركة' : 'Make'}</label>
                <select
                  className="mt-1 h-10 w-full rounded-xl border border-[#dfe8e2] bg-white px-3 text-xs text-[#2c3d34] outline-none"
                  onChange={(e) => setMakeFilter(e.target.value)}
                  value={makeFilter}
                >
                  <option value="">{isArabic ? 'كل الماركات' : 'All Makes'}</option>
                  <option value="Mercedes-Benz">Mercedes-Benz</option>
                  <option value="Land Rover">Land Rover</option>
                  <option value="Porsche">Porsche</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-medium text-[#65796f]">{isArabic ? 'حالة السيارة' : 'Condition'}</label>
                <select
                  className="mt-1 h-10 w-full rounded-xl border border-[#dfe8e2] bg-white px-3 text-xs text-[#2c3d34] outline-none"
                  onChange={(e) => setConditionFilter(e.target.value)}
                  value={conditionFilter}
                >
                  <option value="">{isArabic ? 'الكل' : 'All'}</option>
                  <option value="New">{isArabic ? 'جديد (زيرو)' : 'Brand New'}</option>
                  <option value="Used">{isArabic ? 'مستعمل فاخر' : 'Used Certified'}</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-[10px] font-medium text-[#65796f]">{isArabic ? 'نوع العقار' : 'Property Type'}</label>
                <select
                  className="mt-1 h-10 w-full rounded-xl border border-[#dfe8e2] bg-white px-3 text-xs text-[#2c3d34] outline-none"
                  onChange={(e) => setPropertyTypeFilter(e.target.value)}
                  value={propertyTypeFilter}
                >
                  <option value="">{isArabic ? 'الكل' : 'All Types'}</option>
                  <option value="Apartment">{isArabic ? 'شقة' : 'Apartment'}</option>
                  <option value="Villa">{isArabic ? 'فيلا' : 'Villa'}</option>
                  <option value="Land">{isArabic ? 'أرض' : 'Land'}</option>
                  <option value="Shop">{isArabic ? 'محل تجاري' : 'Shop'}</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-medium text-[#65796f]">{isArabic ? 'نوع الصفقة' : 'Deal Type'}</label>
                <select
                  className="mt-1 h-10 w-full rounded-xl border border-[#dfe8e2] bg-white px-3 text-xs text-[#2c3d34] outline-none"
                  onChange={(e) => setDealFilter(e.target.value)}
                  value={dealFilter}
                >
                  <option value="">{isArabic ? 'الكل' : 'All'}</option>
                  <option value="Sale">{isArabic ? 'للبيع' : 'For Sale'}</option>
                  <option value="Rent">{isArabic ? 'للإيجار' : 'For Rent'}</option>
                </select>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Grid: Cars or Properties */}
      {mode === 'cars' ? (
        <div className="grid gap-6 md:grid-cols-3">
          {filteredVehicles.map((car) => (
            <article
              className="group overflow-hidden rounded-3xl border border-white bg-white/90 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
              key={car.id}
            >
              {/* Image & Slider Launcher */}
              <div
                className="relative aspect-[1.4/1] cursor-pointer overflow-hidden bg-[#e6ede8]"
                onClick={() => {
                  setActiveVehicle(car);
                  setGalleryIndex(0);
                }}
              >
                <img
                  alt={car.title[locale]}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  src={car.photo}
                />
                <span className="absolute start-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[8px] font-bold text-white backdrop-blur-md">
                  {car.id}
                </span>
                <span className="absolute end-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[8px] font-semibold text-[#305342]">
                  {car.condition === 'New' ? (isArabic ? 'جديدة' : 'New') : isArabic ? 'مستعملة' : 'Used'}
                </span>
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#253d30] shadow-md">
                    <Eye className="h-3.5 w-3.5" />
                    {isArabic ? 'عرض الألبوم والتفاصيل' : 'View Gallery & Specs'}
                  </span>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-5">
                <h3 className="text-sm font-bold text-[#2d4336]">{car.title[locale]}</h3>
                <p className="mt-1 flex items-center gap-1 text-[10px] text-[#798a80]">
                  <MapPin className="h-3.5 w-3.5 text-[#5e8c75]" />
                  {car.location[locale]}
                </p>

                {/* Specs pills */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-[#eef4f0] px-2.5 py-0.5 text-[8px] text-[#557363]">{car.year}</span>
                  <span className="rounded-full bg-[#eef4f0] px-2.5 py-0.5 text-[8px] text-[#557363]">
                    {car.transmission === 'Automatic' ? (isArabic ? 'أوتوماتيك' : 'Automatic') : isArabic ? 'مانيوال' : 'Manual'}
                  </span>
                  <span className="rounded-full bg-[#eef4f0] px-2.5 py-0.5 text-[8px] text-[#557363]">
                    {car.mileage === 0 ? (isArabic ? 'زيرو' : '0 km') : `${car.mileage.toLocaleString()} km`}
                  </span>
                  <span className="rounded-full bg-[#eef4f0] px-2.5 py-0.5 text-[8px] text-[#557363]">{car.body}</span>
                </div>

                <div className="mt-4 flex items-baseline justify-between border-t border-[#edf1ee] pt-3">
                  <div>
                    <span className="text-[8px] text-[#86978e]">{isArabic ? 'السعر المطلوب:' : 'Price:'}</span>
                    <p className="text-base font-extrabold text-[#2e4d3c]">
                      {new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en').format(car.price)} {currency}
                    </p>
                  </div>
                  {car.oldPrice && (
                    <span className="text-xs text-[#9aa7a0] line-through">
                      {new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en').format(car.oldPrice)}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex gap-2">
                  <button
                    className="flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-[#314f43] px-3 text-[10px] font-semibold text-white transition-all hover:bg-[#436e5d]"
                    onClick={() => handleCarWhatsApp(car)}
                    type="button"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    {isArabic ? 'احجز معاينة سريعة' : 'Instant WhatsApp Booking'}
                  </button>
                  <button
                    aria-label="View Details"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dce6e0] text-[#527362] hover:bg-[#eef5f1]"
                    onClick={() => {
                      setActiveVehicle(car);
                      setGalleryIndex(0);
                    }}
                    type="button"
                  >
                    <CalendarDays className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        /* Real Estate Grid */
        <div className="grid gap-6 md:grid-cols-3">
          {filteredProperties.map((prop) => (
            <article
              className="group overflow-hidden rounded-3xl border border-white bg-white/90 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
              key={prop.id}
            >
              <div
                className="relative aspect-[1.4/1] cursor-pointer overflow-hidden bg-[#e6ede8]"
                onClick={() => {
                  setActiveProperty(prop);
                  setGalleryIndex(0);
                }}
              >
                <img
                  alt={prop.title[locale]}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  src={prop.photo}
                />
                <span className="absolute start-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[8px] font-bold text-white backdrop-blur-md">
                  {prop.id}
                </span>
                <span className="absolute end-3 top-3 rounded-full bg-[#314f43] px-2.5 py-1 text-[8px] font-semibold text-white">
                  {prop.deal === 'Sale' ? (isArabic ? 'للبيع' : 'For Sale') : isArabic ? 'للإيجار' : 'For Rent'}
                </span>
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#253d30] shadow-md">
                    <Eye className="h-3.5 w-3.5" />
                    {isArabic ? 'استعراض العقار والخريطة' : 'View Property & Map'}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-sm font-bold text-[#2d4336]">{prop.title[locale]}</h3>
                <p className="mt-1 flex items-center gap-1 text-[10px] text-[#798a80]">
                  <MapPin className="h-3.5 w-3.5 text-[#5e8c75]" />
                  {prop.location[locale]}
                </p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-[#eef4f0] px-2.5 py-0.5 text-[8px] text-[#557363]">
                    {prop.area} م²
                  </span>
                  {prop.rooms > 0 && (
                    <span className="rounded-full bg-[#eef4f0] px-2.5 py-0.5 text-[8px] text-[#557363]">
                      {prop.rooms} {isArabic ? 'غرف' : 'rooms'}
                    </span>
                  )}
                  {prop.floor > 0 && (
                    <span className="rounded-full bg-[#eef4f0] px-2.5 py-0.5 text-[8px] text-[#557363]">
                      {isArabic ? `الطابق ${prop.floor}` : `Floor ${prop.floor}`}
                    </span>
                  )}
                  <span className="rounded-full bg-[#eef4f0] px-2.5 py-0.5 text-[8px] text-[#557363]">
                    {prop.type}
                  </span>
                </div>

                <div className="mt-4 flex items-baseline justify-between border-t border-[#edf1ee] pt-3">
                  <div>
                    <span className="text-[8px] text-[#86978e]">
                      {prop.deal === 'Rent'
                        ? isArabic
                          ? 'الإيجار الشهري:'
                          : 'Monthly Rent:'
                        : isArabic
                          ? 'السعر الإجمالي:'
                          : 'Total Price:'}
                    </span>
                    <p className="text-base font-extrabold text-[#2e4d3c]">
                      {new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en').format(prop.price)} {currency}
                    </p>
                  </div>
                  {prop.oldPrice && (
                    <span className="text-xs text-[#9aa7a0] line-through">
                      {new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en').format(prop.oldPrice)}
                    </span>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    className="flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-[#314f43] px-3 text-[10px] font-semibold text-white transition-all hover:bg-[#436e5d]"
                    onClick={() => {
                      setActiveProperty(prop);
                      setGalleryIndex(0);
                    }}
                    type="button"
                  >
                    <CalendarDays className="h-3.5 w-3.5" />
                    {isArabic ? 'حجز موعد معاينة ميدانية' : 'Book Viewing Appointment'}
                  </button>
                  <button
                    aria-label="Ask WhatsApp"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dce6e0] text-[#527362] hover:bg-[#eef5f1]"
                    onClick={() =>
                      onWhatsApp(
                        market,
                        isArabic
                          ? `استفسار عن العقار ${prop.id}: ${prop.title.ar}`
                          : `Inquiry about property ${prop.id}: ${prop.title.en}`,
                      )
                    }
                    type="button"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal: Interactive Gallery Slider + Map + Inspection Scheduler */}
      <AnimatePresence>
        {(activeVehicle || activeProperty) && (
          <div
            className="fixed inset-0 z-100 flex items-center justify-center bg-[#17231e]/50 p-3 backdrop-blur-md sm:p-5"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                setActiveVehicle(null);
                setActiveProperty(null);
              }
            }}
          >
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className="relative flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] border border-white bg-white shadow-2xl"
              exit={{ opacity: 0, scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.95 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#edf1ee] px-6 py-4">
                <div>
                  <h3 className="text-base font-bold text-[#2d4236]">
                    {activeVehicle ? activeVehicle.title[locale] : activeProperty?.title[locale]}
                  </h3>
                  <p className="text-[10px] text-[#7d8f85]">
                    {isArabic ? 'معرض الصور، الخريطة التوضيحية، وحجز المعاينة' : 'Image Slider, Map & Inspection Scheduler'}
                  </p>
                </div>
                <button
                  aria-label="Close"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e2eae4] text-[#6d7d74] hover:bg-[#f0f4f1]"
                  onClick={() => {
                    setActiveVehicle(null);
                    setActiveProperty(null);
                  }}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="grid flex-1 gap-6 overflow-y-auto p-6 md:grid-cols-[1.1fr_0.9fr]">
                {/* Left: Gallery Slider & Map */}
                <div className="space-y-4">
                  {/* Slider Main Photo */}
                  <div className="relative aspect-[1.45/1] overflow-hidden rounded-2xl bg-[#e9f2eb]">
                    {activeVehicle && (
                      <img
                        alt="Vehicle"
                        className="h-full w-full object-cover"
                        src={activeVehicle.gallery[galleryIndex] || activeVehicle.photo}
                      />
                    )}
                    {activeProperty && (
                      <img
                        alt="Property"
                        className="h-full w-full object-cover"
                        src={activeProperty.gallery[galleryIndex] || activeProperty.photo}
                      />
                    )}

                    {/* Prev/Next arrows */}
                    <button
                      aria-label="Previous image"
                      className="absolute start-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-[#294234] shadow-md backdrop-blur-md hover:bg-white"
                      onClick={() =>
                        setGalleryIndex((prev) =>
                          prev === 0
                            ? (activeVehicle?.gallery.length ?? activeProperty?.gallery.length ?? 1) - 1
                            : prev - 1,
                        )
                      }
                      type="button"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      aria-label="Next image"
                      className="absolute end-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-[#294234] shadow-md backdrop-blur-md hover:bg-white"
                      onClick={() =>
                        setGalleryIndex(
                          (prev) =>
                            (prev + 1) %
                            (activeVehicle?.gallery.length ?? activeProperty?.gallery.length ?? 1),
                        )
                      }
                      type="button"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>

                    <button
                      aria-label="Enlarge image"
                      className="absolute bottom-3 end-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md"
                      onClick={() =>
                        setZoomImage(
                          activeVehicle
                            ? activeVehicle.gallery[galleryIndex] || activeVehicle.photo
                            : activeProperty
                              ? activeProperty.gallery[galleryIndex] || activeProperty.photo
                              : null,
                        )
                      }
                      type="button"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Thumbnail Row */}
                  <div className="flex gap-2">
                    {(activeVehicle ? activeVehicle.gallery : activeProperty?.gallery ?? []).map((img, idx) => (
                      <button
                        className={`aspect-video w-20 overflow-hidden rounded-xl border-2 transition-all ${
                          galleryIndex === idx ? 'border-[#314f43] shadow-md' : 'border-transparent opacity-60'
                        }`}
                        key={img + idx}
                        onClick={() => setGalleryIndex(idx)}
                        type="button"
                      >
                        <img alt="Thumbnail" className="h-full w-full object-cover" src={img} />
                      </button>
                    ))}
                  </div>

                  {/* Property Map Visual Locator */}
                  {activeProperty && (
                    <div className="rounded-2xl border border-[#dbe6df] bg-[#f4f8f5] p-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#355243]">
                        <MapPin className="h-4 w-4 text-[#4f8369]" />
                        <span>{isArabic ? 'موقع العقار والحي التوضيحي:' : 'Location & District Map Preview:'}</span>
                      </div>
                      <div className="relative mt-2.5 flex aspect-[2.4/1] items-center justify-center overflow-hidden rounded-xl border border-white bg-linear-to-br from-[#d4ece2] via-[#e5f4ed] to-[#f4e7f8]">
                        <div className="text-center">
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#314f43] text-white shadow-lg">
                            <MapPin className="h-5 w-5" />
                          </span>
                          <p className="mt-1.5 text-xs font-bold text-[#2a4637]">{activeProperty.location[locale]}</p>
                          <p className="text-[9px] text-[#6d8075]">
                            {isArabic ? 'خريطة تفاعلية مدعومة ومحدثة' : 'Interactive Location Pin Supported'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Inspection Booking Form */}
                <div className="flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#688a77]">
                      {isArabic ? 'حجز موعد معاينة ميدانية' : 'Book In-Person Viewing'}
                    </span>
                    <h4 className="mt-1 text-sm font-bold text-[#293d32]">
                      {isArabic ? 'حدد التاريخ والساعة لتأكيد الموعد' : 'Select Date & Hour For Direct Inspection'}
                    </h4>
                    <p className="mt-1 text-[11px] leading-5 text-[#6c7d73]">
                      {isArabic
                        ? 'سيقوم ممثلنا بالتواصل وتأكيد الحضور في الموعد المحدد ومرافقتك للمعاينة.'
                        : 'Our representative will coordinate and accompany you during the viewing.'}
                    </p>

                    <form className="mt-4 space-y-3" onSubmit={handleBookingSubmit}>
                      <div>
                        <label className="text-[10px] font-medium text-[#5c6e64]">
                          {isArabic ? 'الاسم بالكامل' : 'Full Name'}
                        </label>
                        <input
                          className="mt-1 h-9 w-full rounded-xl border border-[#dfe8e2] px-3 text-xs text-[#2c3d34] outline-none"
                          onChange={(e) => setBookingName(e.target.value)}
                          required
                          value={bookingName}
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-medium text-[#5c6e64]">
                          {isArabic ? 'رقم الهاتف / واتساب' : 'Phone / WhatsApp'}
                        </label>
                        <input
                          className="mt-1 h-9 w-full rounded-xl border border-[#dfe8e2] px-3 text-xs text-[#2c3d34] outline-none"
                          onChange={(e) => setBookingPhone(e.target.value)}
                          required
                          type="tel"
                          value={bookingPhone}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-medium text-[#5c6e64]">
                            {isArabic ? 'اليوم' : 'Date'}
                          </label>
                          <input
                            className="mt-1 h-9 w-full rounded-xl border border-[#dfe8e2] px-2 text-xs text-[#2c3d34] outline-none"
                            min={new Date().toISOString().slice(0, 10)}
                            onChange={(e) => setBookingDate(e.target.value)}
                            required
                            type="date"
                            value={bookingDate}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-medium text-[#5c6e64]">
                            {isArabic ? 'الساعة' : 'Time'}
                          </label>
                          <input
                            className="mt-1 h-9 w-full rounded-xl border border-[#dfe8e2] px-2 text-xs text-[#2c3d34] outline-none"
                            onChange={(e) => setBookingTime(e.target.value)}
                            required
                            type="time"
                            value={bookingTime}
                          />
                        </div>
                      </div>

                      <button
                        className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#314f43] px-4 text-xs font-semibold text-white shadow-md transition-all hover:bg-[#436e5d]"
                        type="submit"
                      >
                        <CalendarDays className="h-4 w-4" />
                        {isArabic ? 'تأكيد حجز المعاينة وإرسال عبر واتساب' : 'Confirm Inspection & WhatsApp'}
                      </button>

                      {bookingSuccess && (
                        <p className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#3a7554]">
                          <Check className="h-4 w-4" />
                          {isArabic ? 'تم حفظ موعدك وفتح واتساب!' : 'Viewing booked successfully!'}
                        </p>
                      )}
                    </form>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Image Zoom Modal */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-110 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setZoomImage(null)}
        >
          <button
            aria-label="Close"
            className="absolute end-6 top-6 rounded-full bg-white p-2.5 text-black"
            onClick={() => setZoomImage(null)}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
          <img alt="Enlarged" className="max-h-[88vh] max-w-[92vw] rounded-2xl object-contain shadow-2xl" src={zoomImage} />
        </div>
      )}
    </div>
  );
}
