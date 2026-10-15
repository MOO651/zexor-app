import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  MapPin,
  Maximize2,
  MessageCircle,
  SlidersHorizontal,
  X,
  Check,
} from 'lucide-react';
import { INITIAL_PROPERTIES, INITIAL_VEHICLES } from '../data/initialData';
import type { Locale, Market, PlatformInquiry, Property, Vehicle } from '../types';
import type { DynamicCategory } from '../types';
import { publicAssetUrl } from '../utils';
import { DepartmentBanner } from './DepartmentBanner';
import { DepartmentEmptyState } from './DepartmentEmptyState';
import { art } from '../data/imagery';

type Props = {
  mode: 'cars' | 'property';
  locale: Locale;
  market: Market;
  vehicles?: Vehicle[];
  properties?: Property[];
  onInquiry: (inquiry: PlatformInquiry) => void;
  onWhatsApp: (market: Market, message: string) => void;
  sectionName?: string;
  banner?: DynamicCategory;
  subcategories?: DynamicCategory[];
};

export function Marketplace({
  mode,
  locale,
  market,
  vehicles,
  properties,
  onInquiry,
  onWhatsApp,
  sectionName,
  banner,
  subcategories = [],
}: Props) {
  const isArabic = locale === 'ar';
  // Filters
  const [regionFilter, setRegionFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [dealFilter, setDealFilter] = useState('');
  const [vehicleDealFilter, setVehicleDealFilter] = useState('');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('');
  const [makeFilter, setMakeFilter] = useState('');
  const [selectedDepartmentCategory, setSelectedDepartmentCategory] = useState('');

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

  const marketRegions = market === 'eg' ? ['Cairo', 'Giza', 'Alexandria'] : ['Riyadh', 'Jeddah'];
  const selectedRegion = marketRegions.includes(regionFilter) ? regionFilter : '';
  const inMarket = (region: string) => (market === 'ksa' ? ['Riyadh', 'Jeddah'].includes(region) : !['Riyadh', 'Jeddah'].includes(region));
  const listingCurrency = (region: string) => (['Riyadh', 'Jeddah'].includes(region)
    ? (isArabic ? 'ر.س' : 'SAR')
    : (isArabic ? 'جم' : 'EGP'));
  const formatListingPrice = (price: number, region: string) =>
    `${new Intl.NumberFormat(isArabic ? (market === 'ksa' ? 'ar-SA' : 'ar-EG') : 'en').format(price)} ${listingCurrency(region)}`;
  const rentalPeriodLabel = (vehicle: Vehicle) => {
    const period = vehicle.rentalPeriod ?? 'Day';
    if (!isArabic) return period.toLowerCase();
    return ({ Day: 'يوم', Week: 'أسبوع', Month: 'شهر' } as const)[period];
  };
  const vehiclePricePeriod = (vehicle: Vehicle) => vehicle.deal === 'Rent'
    ? isArabic ? ` / ${rentalPeriodLabel(vehicle)}` : ` / ${rentalPeriodLabel(vehicle)}`
    : '';
  const marketplaceBannerText = mode === 'cars'
    ? isArabic ? 'إيجار سيارات بالمدة التي تناسب احتياجك، مع إمكانية طلب موعد معاينة.' : 'Car rentals for the period you need, with viewing requests available.'
    : isArabic ? 'مساحات متاحة للإيجار. وتظهر عروض البيع فقط بتفويض من المالك.' : 'Spaces available to rent. Sale listings are shown only with owner authorization.';
  const defaultSlides = mode === 'cars'
    ? [
        { title: isArabic ? 'سيارة تناسب مشوارك' : 'A car for your next journey', text: marketplaceBannerText, image: art.vehicleSedan },
        { title: isArabic ? 'مساحة أوسع لخططك' : 'More room for your plans', text: isArabic ? 'اكتشف خيارات السيارات للإيجار، واختر المدة المناسبة لك.' : 'Explore rental options and choose the period that works for you.', image: art.vehicleSuv },
        { title: isArabic ? 'تجربة قيادة مختلفة' : 'A different driving experience', text: isArabic ? 'تصفح المعروض واحجز موعد المعاينة مع فريقنا.' : 'Browse the fleet and request a viewing with our team.', image: art.vehicleCoupe },
      ]
    : [
        { title: isArabic ? 'مساحة تبدأ منها' : 'A place to begin', text: marketplaceBannerText, image: art.propertyApartment },
        { title: isArabic ? 'بيت يناسب تفاصيل يومك' : 'A home for the way you live', text: isArabic ? 'شقق وفيلات متاحة للإيجار الشهري.' : 'Apartments and villas available to rent by the month.', image: art.propertyVilla },
        { title: isArabic ? 'مساحة لخطوتك القادمة' : 'Room for your next chapter', text: isArabic ? 'تظهر عروض البيع فقط بعد تفويض المالك.' : 'Sale listings appear only with owner authorization.', image: art.propertyLand },
      ];
  const extraSlides = banner?.bannerSlides?.filter((slide) => slide.title?.[locale] || slide.text?.[locale] || slide.image).map((slide) => ({ title: slide.title?.[locale] || sectionName || '', text: slide.text?.[locale] || marketplaceBannerText, image: slide.image || banner.bannerImage || (mode === 'cars' ? art.vehiclesPortal : art.estatePortal) })) ?? [];
  const primaryConfigured = Boolean(banner?.bannerTitle?.[locale] || banner?.bannerText?.[locale] || banner?.bannerImage);
  const configuredSlides = primaryConfigured ? [{ title: banner?.bannerTitle?.[locale] || sectionName || '', text: banner?.bannerText?.[locale] || marketplaceBannerText, image: banner?.bannerImage || (mode === 'cars' ? art.vehiclesPortal : art.estatePortal) }, ...extraSlides] : extraSlides;

  const filteredVehicles = vehicleList.filter((car) => {
    if (!inMarket(car.region)) return false;
    if (selectedDepartmentCategory) {
      const custom = subcategories.find((category) => category.slug === selectedDepartmentCategory);
      const haystack = `${car.title[locale]} ${car.make} ${car.body} ${car.condition} ${car.region}`.toLowerCase();
      if (!custom || (!haystack.includes(custom.slug.replaceAll('-', ' ')) && !haystack.includes(custom.name[locale].toLowerCase()) && !haystack.includes(custom.name.en.toLowerCase()))) return false;
    }
    if (selectedRegion && car.region !== selectedRegion) return false;
    if (vehicleDealFilter && (car.deal ?? 'Rent') !== vehicleDealFilter) return false;
    if (makeFilter && car.make !== makeFilter) return false;
    if (conditionFilter && car.condition !== conditionFilter) return false;
    if (minPrice && car.price < Number(minPrice)) return false;
    if (maxPrice && car.price > Number(maxPrice)) return false;
    return true;
  });

  const filteredProperties = propertyList.filter((prop) => {
    if (!inMarket(prop.region)) return false;
    if (selectedDepartmentCategory) {
      const custom = subcategories.find((category) => category.slug === selectedDepartmentCategory);
      const haystack = `${prop.title[locale]} ${prop.type} ${prop.deal} ${prop.region}`.toLowerCase();
      if (!custom || (!haystack.includes(custom.slug.replaceAll('-', ' ')) && !haystack.includes(custom.name[locale].toLowerCase()) && !haystack.includes(custom.name.en.toLowerCase()))) return false;
    }
    if (selectedRegion && prop.region !== selectedRegion) return false;
    if (dealFilter && prop.deal !== dealFilter) return false;
    if (propertyTypeFilter && prop.type !== propertyTypeFilter) return false;
    if (minPrice && prop.price < Number(minPrice)) return false;
    if (maxPrice && prop.price > Number(maxPrice)) return false;
    return true;
  });
  const hasMarketListings = mode === 'cars'
    ? vehicleList.some((car) => inMarket(car.region))
    : propertyList.some((property) => inMarket(property.region));

  const resetMarketplaceFilters = () => {
    setRegionFilter('');
    setMinPrice('');
    setMaxPrice('');
    setConditionFilter('');
    setDealFilter('');
    setVehicleDealFilter('');
    setPropertyTypeFilter('');
    setMakeFilter('');
    setSelectedDepartmentCategory('');
  };

  const handleCarWhatsApp = (car: Vehicle) => {
    const isRental = car.deal === 'Rent';
    const text = isArabic
      ? `مرحباً ZEXOR، أرغب في ${isRental ? 'الاستفسار عن استئجار السيارة' : 'حجز معاينة للسيارة'}:
كود السيارة: ${car.id}
الموديل: ${car.title.ar}
السعر: ${formatListingPrice(car.price, car.region)}${vehiclePricePeriod(car)}`
      : `Hello ZEXOR, I want to ${isRental ? 'inquire about renting' : 'book a viewing for'} vehicle:
Car Code: ${car.id}
Model: ${car.title.en}
Price: ${formatListingPrice(car.price, car.region)}${vehiclePricePeriod(car)}`;
    onWhatsApp(market, text);
  };

  const openVehicleGallery = (vehicle: Vehicle) => {
    setActiveVehicle(vehicle);
    setActiveProperty(null);
    setGalleryIndex(0);
  };

  const openPropertyGallery = (property: Property) => {
    setActiveProperty(property);
    setActiveVehicle(null);
    setGalleryIndex(0);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const itemTitle = activeVehicle ? activeVehicle.title[locale] : activeProperty ? activeProperty.title[locale] : '';
    const itemCode = activeVehicle ? activeVehicle.id : activeProperty ? activeProperty.id : '';

    const inquiry: PlatformInquiry = {
      id: `ZX-BK-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      type: mode === 'cars' ? 'car' : 'property',
      title: `${itemCode} · ${itemTitle}`,
      name: bookingName.trim(),
      phone: bookingPhone.trim(),
      city: activeVehicle ? activeVehicle.region : activeProperty ? activeProperty.region : '',
      market,
      budget: '',
      message: activeVehicle?.deal === 'Rent'
        ? `Vehicle rental request for ${bookingDate} at ${bookingTime}`
        : `Inspection booked for ${bookingDate} at ${bookingTime}`,
      date: bookingDate,
      time: bookingTime,
      status: 'new',
    };
    onInquiry(inquiry);

    const msg = isArabic
      ? `${activeVehicle?.deal === 'Rent' ? 'طلب استئجار السيارة:' : 'طلب حجز موعد معاينة ميدانية:'}
الكود: ${itemCode}
الاسم: ${bookingName}
الهاتف: ${bookingPhone}
التاريخ: ${bookingDate}
الساعة: ${bookingTime}
العنوان: ${itemTitle}`
      : `${activeVehicle?.deal === 'Rent' ? 'Vehicle rental request:' : 'Inspection appointment booked:'}
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
    <div className="zx-marketplace space-y-8">
      {/* Hero Banner */}
      <DepartmentBanner locale={locale} name={sectionName ?? (mode === 'cars' ? 'ZEXOR MOTORS' : 'ZEXOR ESTATES')} title={banner?.bannerTitle?.[locale]} text={banner?.bannerText?.[locale]} image={banner?.bannerImage} accent={banner?.bannerAccent} slides={configuredSlides?.length ? configuredSlides : defaultSlides} fallbackImage={mode === 'cars' ? art.vehiclesPortal : art.estatePortal} fallbackTitle={mode === 'cars' ? (isArabic ? 'اختيارات سيارات تناسب خطوتك القادمة' : 'Find the right car for your next move') : (isArabic ? 'مساحات أقرب لما تبحث عنه' : 'Find a space that feels right')} fallbackText={marketplaceBannerText} />
      {subcategories.length > 0 && <nav aria-label={isArabic ? 'تصنيفات المعرض' : 'Showroom categories'} className="flex flex-wrap gap-2">{[
        { slug: '', name: isArabic ? 'كل المعروض' : 'All listings' }, ...subcategories.map((category) => ({ slug: category.slug, name: category.name[locale] })),
      ].map((item) => <button aria-pressed={selectedDepartmentCategory === item.slug} className={`min-h-10 rounded-full border px-4 py-3 text-xs font-semibold transition ${selectedDepartmentCategory === item.slug ? 'border-[#263f33] bg-[#263f33] text-white' : 'border-[#dce7df] bg-white text-[#52685b] hover:border-[#9ab8a4]'}`} key={item.slug || 'all'} onClick={() => setSelectedDepartmentCategory(item.slug)} type="button">{item.name}</button>)}</nav>}
      {/* Filter Toolbar */}
      <section id="department-content" className="zx-market-filters rounded-3xl border border-white bg-white/85 p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-xs font-bold text-[#354f40]">
            <SlidersHorizontal className="h-4 w-4" />
            {isArabic ? 'تصفية وبحث متقدم' : 'Advanced Filter & Refine'}
          </h3>
          <span className="text-[10px] text-[#7d8f85]">
            {isArabic
              ? mode === 'cars' ? `${filteredVehicles.length} سيارات` : `${filteredProperties.length} عقارات`
              : mode === 'cars' ? `${filteredVehicles.length} vehicles` : `${filteredProperties.length} properties`}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Region */}
          <div className="flex flex-col gap-1.5">
            <label className="zx-field-label">{isArabic ? 'المدينة / المنطقة' : 'Region'}</label>
            <select
              className="zx-select h-10 w-full rounded-xl border border-[#dfe8e2] bg-white px-3 text-xs text-[#2c3d34]"
              onChange={(e) => setRegionFilter(e.target.value)}
              value={selectedRegion}
            >
              <option value="">{isArabic ? 'كل المناطق' : 'All Regions'}</option>
              {marketRegions.map((region) => (
                <option key={region} value={region}>
                  {isArabic
                    ? ({ Cairo: 'القاهرة', Giza: 'الجيزة', Alexandria: 'الإسكندرية', Riyadh: 'الرياض', Jeddah: 'جدة' } as Record<string, string>)[region]
                    : region}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="flex flex-col gap-1.5">
            <label className="zx-field-label">{isArabic ? `أقل سعر (${market === 'eg' ? 'ج.م' : 'ر.س'})` : `Min Price (${market === 'eg' ? 'EGP' : 'SAR'})`}</label>
            <input
              className="zx-select h-10 w-full rounded-xl border border-[#dfe8e2] bg-white px-3 text-xs text-[#2c3d34]"
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="0"
              type="number"
              value={minPrice}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="zx-field-label">{isArabic ? `أعلى سعر (${market === 'eg' ? 'ج.م' : 'ر.س'})` : `Max Price (${market === 'eg' ? 'EGP' : 'SAR'})`}</label>
            <input
              className="zx-select h-10 w-full rounded-xl border border-[#dfe8e2] bg-white px-3 text-xs text-[#2c3d34]"
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="—"
              type="number"
              value={maxPrice}
            />
          </div>

          {mode === 'cars' ? (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="zx-field-label">{isArabic ? 'نوع العرض' : 'Listing type'}</label>
                <select
                  className="zx-select h-10 w-full rounded-xl border border-[#dfe8e2] bg-white px-3 text-xs text-[#2c3d34]"
                  onChange={(e) => setVehicleDealFilter(e.target.value)}
                  value={vehicleDealFilter}
                >
                  <option value="">{isArabic ? 'كل العروض' : 'All listings'}</option>
                  <option value="Sale">{isArabic ? 'بيع بتفويض المالك' : 'Owner-authorized sale'}</option>
                  <option value="Rent">{isArabic ? 'للإيجار' : 'For rent'}</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="zx-field-label">{isArabic ? 'الماركة' : 'Make'}</label>
                <select
                  className="zx-select h-10 w-full rounded-xl border border-[#dfe8e2] bg-white px-3 text-xs text-[#2c3d34]"
                  onChange={(e) => setMakeFilter(e.target.value)}
                  value={makeFilter}
                >
                  <option value="">{isArabic ? 'كل الماركات' : 'All Makes'}</option>
                  <option value="Mercedes-Benz">Mercedes-Benz</option>
                  <option value="Land Rover">Land Rover</option>
                  <option value="Porsche">Porsche</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="zx-field-label">{isArabic ? 'حالة السيارة' : 'Condition'}</label>
                <select
                  className="zx-select h-10 w-full rounded-xl border border-[#dfe8e2] bg-white px-3 text-xs text-[#2c3d34]"
                  onChange={(e) => setConditionFilter(e.target.value)}
                  value={conditionFilter}
                >
                  <option value="">{isArabic ? 'الكل' : 'All'}</option>
                  <option value="New">{isArabic ? 'جديد (زيرو)' : 'Brand New'}</option>
                  <option value="Used">{isArabic ? 'مستعمل' : 'Pre-owned'}</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="zx-field-label">{isArabic ? 'نوع العقار' : 'Property Type'}</label>
                <select
                  className="zx-select h-10 w-full rounded-xl border border-[#dfe8e2] bg-white px-3 text-xs text-[#2c3d34]"
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
              <div className="flex flex-col gap-1.5">
                <label className="zx-field-label">{isArabic ? 'نوع الصفقة' : 'Deal Type'}</label>
                <select
                  className="zx-select h-10 w-full rounded-xl border border-[#dfe8e2] bg-white px-3 text-xs text-[#2c3d34]"
                  onChange={(e) => setDealFilter(e.target.value)}
                  value={dealFilter}
                >
                  <option value="">{isArabic ? 'الكل' : 'All'}</option>
                  <option value="Sale">{isArabic ? 'بيع بتفويض المالك' : 'Owner-authorized sale'}</option>
                  <option value="Rent">{isArabic ? 'للإيجار' : 'For Rent'}</option>
                </select>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Grid: Cars or Properties */}
      {mode === 'cars' ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredVehicles.length === 0 ? (
            <DepartmentEmptyState actionLabel={isArabic ? (hasMarketListings ? 'عرض كل السيارات' : 'تواصل مع فريق السيارات') : (hasMarketListings ? 'Show all vehicles' : 'Ask our vehicle team')} description={isArabic ? (hasMarketListings ? 'غيّرنا لك العرض ليتوافق مع بحثك. امسح الفلاتر لرؤية جميع السيارات المتاحة في سوقك.' : 'المعرض يستقبل اختيارات جديدة باستمرار. أخبرنا بنوع السيارة ومدة الإيجار التي تناسبك.') : (hasMarketListings ? 'No vehicles match these filters. Clear them to see all available vehicles in your market.' : 'Our showroom is being curated. Tell us what kind of vehicle and rental period you need.')} image={art.vehiclesPortal} locale={locale} onAction={() => hasMarketListings ? resetMarketplaceFilters() : onWhatsApp(market, isArabic ? 'مرحباً، أبحث عن سيارة للإيجار. هل يمكنكم مساعدتي بالخيارات المتاحة؟' : 'Hello, I am looking for a rental vehicle. Could you share the available options?')} title={isArabic ? 'نبحث لك عن السيارة المناسبة' : 'Let us find the right drive for you'} />
          ) : filteredVehicles.map((car) => (
            <article
              className="zx-market-card group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-[#e5ebe6] bg-white shadow-[0_8px_30px_-20px_rgba(28,47,37,0.28)] transition-all duration-300 hover:-translate-y-1 hover:border-[#bed2c4] hover:shadow-[0_24px_50px_-26px_rgba(28,47,37,0.42)]"
              key={car.id}
            >
              {/* Image & Gallery Launcher */}
              <div
                aria-label={isArabic ? `عرض صور ومواصفات ${car.title.ar}` : `View photos and specifications for ${car.title.en}`}
                className="relative aspect-[1.42/1] cursor-pointer overflow-hidden bg-[#e8efeb]"
                onClick={() => openVehicleGallery(car)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openVehicleGallery(car);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <img
                  alt={car.title[locale]}
                  className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
                  loading="lazy"
                  src={publicAssetUrl(car.photo)}
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/45 to-transparent"
                />
                <span
                  className={`absolute start-3 top-3 rounded-full px-2.5 py-1 text-[9px] font-extrabold tracking-wide shadow-sm backdrop-blur-md ${
                    car.condition === 'New'
                      ? 'bg-[#a6e6c4] text-[#14301f]'
                      : 'bg-white/90 text-[#305342]'
                  }`}
                >
                  {car.condition === 'New' ? (isArabic ? 'زيرو' : 'Brand New') : isArabic ? 'مستعمل' : 'Pre-owned'}
                </span>
                <div className="absolute end-3 top-3 flex items-center gap-1.5">
                  <span className="rounded-full border border-white/20 bg-[#143b2d]/85 px-2.5 py-1 text-[9px] font-extrabold text-white backdrop-blur-md">
                    {(car.deal ?? 'Rent') === 'Rent' ? isArabic ? 'للإيجار' : 'For Rent' : isArabic ? 'بيع بتفويض المالك' : 'Owner-authorized sale'}
                  </span>
                  <span className="rounded-full border border-white/40 bg-black/45 px-2.5 py-1 font-mono text-[9px] font-bold text-white backdrop-blur-md">
                    {car.id}
                  </span>
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-2 text-[11px] font-bold text-[#253d30] shadow-lg">
                    <Eye className="h-3.5 w-3.5" />
                    {isArabic ? 'عرض الألبوم والتفاصيل' : 'View Gallery & Specs'}
                  </span>
                </div>
              </div>

              {/* Card Details */}
              <div className="flex flex-1 flex-col p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="line-clamp-1 text-sm font-bold leading-6 text-[#24382d]">{car.title[locale]}</h3>
                  <span className="shrink-0 rounded-full bg-[#f0f5f1] px-2.5 py-1 text-[9px] font-bold text-[#527362]">{car.make}</span>
                </div>
                <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[#6f8378]">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-[#5e8c75]" />
                  {car.location[locale]}
                </p>

                {/* Spec chips — tinted so they read as data, not decoration.
                    Every value is localised: the enum values in the data are
                    English ("Sedan") and showing them raw put Latin words inside
                    an otherwise Arabic row. */}
                <div className="mt-3.5 flex min-h-14 flex-wrap content-start gap-1.5">
                  {[
                    String(car.year),
                    car.transmission === 'Automatic' ? (isArabic ? 'أوتوماتيك' : 'Automatic') : isArabic ? 'مانيوال' : 'Manual',
                    car.mileage === 0
                      ? (isArabic ? 'زيرو' : '0 km')
                      : `${new Intl.NumberFormat('en-US').format(car.mileage)} ${isArabic ? 'كم' : 'km'}`,
                    isArabic
                      ? ({ Sedan: 'سيدان', SUV: 'دفع رباعي', Coupe: 'كوبيه' } as Record<string, string>)[car.body] ?? car.body
                      : car.body,
                    car.fuel === 'Electric'
                      ? (isArabic ? 'كهربائية' : 'Electric')
                      : car.fuel === 'Hybrid'
                        ? (isArabic ? 'هايبرد' : 'Hybrid')
                        : (isArabic ? 'بنزين' : 'Petrol'),
                  ].map((spec) => (
                    <span
                      className="rounded-lg border border-[#e3ece7] bg-[#f5f8f5] px-2.5 py-1.5 text-[9px] font-semibold text-[#4b6d5b]"
                      key={spec}
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                  {car.oldPrice && car.deal !== 'Rent' && (
                  <p className="mt-3 text-[10px] text-[#9aa7a0]">
                    {isArabic ? 'كان:' : 'Was:'}{' '}
                    <span className="zx-strike font-semibold">
                      {formatListingPrice(car.oldPrice, car.region)}
                    </span>
                  </p>
                )}

                {/* Action Buttons */}
                <div className="mt-auto space-y-3 border-t border-[#edf1ee] pt-4">
                  <div className="min-w-0">
                    <span className="block text-[9px] font-semibold text-[#839188]">{car.deal === 'Rent' ? (isArabic ? 'قيمة الإيجار للفترة' : 'RENTAL RATE') : (isArabic ? 'بيع بتفويض المالك' : 'OWNER-AUTHORIZED SALE')}</span>
                    <span className="zx-display mt-1 flex flex-wrap items-baseline gap-x-1 text-lg leading-none text-[#24382d]">
                      {new Intl.NumberFormat('en-US').format(car.price)}
                      <span className="font-sans text-[10px] font-semibold">{listingCurrency(car.region)}{car.deal === 'Rent' ? vehiclePricePeriod(car) : ''}</span>
                    </span>
                  </div>
                  <div className="flex gap-2">
                  <button
                    aria-label={car.deal === 'Rent' ? (isArabic ? 'اسأل عن الإيجار' : 'Ask about rental') : (isArabic ? 'احجز معاينة' : 'Book viewing')}
                    className="flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-[#314f43] px-3 text-[10px] font-bold text-white shadow-sm transition-all hover:-translate-y-px hover:bg-[#436e5d]"
                    onClick={() => handleCarWhatsApp(car)}
                    type="button"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {car.deal === 'Rent' ? isArabic ? 'استفسر عن الإيجار' : 'Ask about rental' : isArabic ? 'احجز معاينة' : 'Book viewing'}
                  </button>
                  <button
                    aria-label={isArabic ? 'التفاصيل' : 'Details'}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#dce6e0] text-[#527362] transition-colors hover:border-[#4e8e6f] hover:bg-[#eef5f1]"
                    title={isArabic ? 'التفاصيل والصور' : 'Photos and details'}
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
              </div>
            </article>
          ))}
        </div>
      ) : (
        /* Real Estate Grid */
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProperties.length === 0 ? (
            <DepartmentEmptyState actionLabel={isArabic ? (hasMarketListings ? 'عرض كل المساحات' : 'تواصل مع فريق العقارات') : (hasMarketListings ? 'Show all spaces' : 'Ask our property team')} description={isArabic ? (hasMarketListings ? 'لا توجد نتائج بهذه المواصفات. امسح الفلاتر لاستكشاف كل المساحات المتاحة للإيجار.' : 'أخبرنا بالمدينة ونوع المساحة التي تبحث عنها، وسيساعدك فريقنا في الخيارات المتاحة للإيجار.') : (hasMarketListings ? 'No spaces match these filters. Clear them to explore all available rentals.' : 'Tell us which city and type of space you need, and our team can help with current rental options.')} image={art.estatePortal} locale={locale} onAction={() => hasMarketListings ? resetMarketplaceFilters() : onWhatsApp(market, isArabic ? 'مرحباً، أبحث عن عقار للإيجار. أود معرفة الخيارات المتاحة.' : 'Hello, I am looking for a property to rent. Please share the available options.')} title={isArabic ? 'مساحة مناسبة تستحق البحث' : 'The right space is worth finding'} />
          ) : filteredProperties.map((prop) => (
            <article
              className="zx-market-card group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-[#e5ebe6] bg-white shadow-[0_8px_30px_-20px_rgba(28,47,37,0.28)] transition-all duration-300 hover:-translate-y-1 hover:border-[#bed2c4] hover:shadow-[0_24px_50px_-26px_rgba(28,47,37,0.42)]"
              key={prop.id}
            >
              <div
                aria-label={isArabic ? `عرض صور وتفاصيل ${prop.title.ar}` : `View photos and details for ${prop.title.en}`}
                className="relative aspect-[1.42/1] cursor-pointer overflow-hidden bg-[#e6ede8]"
                onClick={() => openPropertyGallery(prop)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openPropertyGallery(prop);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <img
                  alt={prop.title[locale]}
                  className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
                  loading="lazy"
                  src={publicAssetUrl(prop.photo)}
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/45 to-transparent"
                />
                <span
                  className={`absolute start-3 top-3 rounded-full px-2.5 py-1 text-[9px] font-extrabold tracking-wide shadow-sm backdrop-blur-md ${
                    prop.deal === 'Sale' ? 'bg-[#a6e6c4] text-[#14301f]' : 'bg-[#e6a68e] text-[#3a1a12]'
                  }`}
                >
                  {prop.deal === 'Sale' ? (isArabic ? 'بيع بتفويض المالك' : 'Owner-authorized sale') : isArabic ? 'للإيجار' : 'For Rent'}
                </span>
                <span className="absolute end-3 top-3 rounded-full border border-white/40 bg-black/45 px-2.5 py-1 font-mono text-[9px] font-bold text-white backdrop-blur-md">
                  {prop.id}
                </span>
                <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-2 text-[11px] font-bold text-[#253d30] shadow-lg">
                    <Eye className="h-3.5 w-3.5" />
                    {isArabic ? 'استعراض العقار والموقع' : 'View Property & Location'}
                  </span>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="line-clamp-1 text-sm font-bold leading-6 text-[#24382d]">{prop.title[locale]}</h3>
                  <span className="shrink-0 rounded-full bg-[#f0f5f1] px-2.5 py-1 text-[9px] font-bold text-[#527362]">
                    {isArabic ? ({ Apartment: 'شقة', Villa: 'فيلا', Land: 'أرض', Shop: 'محل' } as Record<string, string>)[prop.type] ?? prop.type : prop.type}
                  </span>
                </div>
                <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[#6f8378]">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-[#5e8c75]" />
                  {prop.location[locale]}
                </p>

                <div className="mt-3.5 flex min-h-14 flex-wrap content-start gap-1.5">
                  {[
                    `${new Intl.NumberFormat('en-US').format(prop.area)} ${isArabic ? 'م²' : 'm²'}`,
                    prop.rooms > 0 ? `${prop.rooms} ${isArabic ? 'غرف' : 'rooms'}` : '',
                    prop.bathrooms > 0 ? `${prop.bathrooms} ${isArabic ? 'حمام' : 'baths'}` : '',
                    // The type is a raw enum value in the data ("Apartment"); show it
                    // localised so an Arabic card never mixes scripts. The English
                    // word is the canonical value used by the admin filter, so only
                    // the label is translated here.
                    isArabic
                      ? ({ Apartment: 'شقة', Villa: 'فيلا', Land: 'أرض', Shop: 'محل' } as Record<string, string>)[prop.type] ?? prop.type
                      : prop.type,
                  ]
                    .filter(Boolean)
                    .map((spec) => (
                      <span
                        className="rounded-lg border border-[#e3ece7] bg-[#f5f8f5] px-2.5 py-1.5 text-[9px] font-semibold text-[#4b6d5b]"
                        key={spec}
                      >
                        {spec}
                      </span>
                    ))}
                </div>

                {prop.oldPrice && (
                  <p className="mt-3 text-[10px] text-[#9aa7a0]">
                    {isArabic ? 'كان:' : 'Was:'}{' '}
                    <span className="zx-strike font-semibold">
                      {formatListingPrice(prop.oldPrice, prop.region)}
                    </span>
                  </p>
                )}

                <div className="mt-auto space-y-3 border-t border-[#edf1ee] pt-4">
                  <div className="min-w-0">
                    <span className="block text-[9px] font-semibold text-[#839188]">{prop.deal === 'Rent' ? (isArabic ? `الإيجار ${prop.rentalPeriod === 'Year' ? 'السنوي' : 'الشهري'}` : `RENT · ${prop.rentalPeriod === 'Year' ? 'YEARLY' : 'MONTHLY'}`) : (isArabic ? 'بيع بتفويض المالك' : 'OWNER-AUTHORIZED SALE')}</span>
                    <span className="zx-display mt-1 block text-lg leading-none text-[#24382d]">{formatListingPrice(prop.price, prop.region)}</span>
                    {prop.deal === 'Rent' && <span className="mt-1 block text-[9px] text-[#839188]">{isArabic ? 'اطلب تأكيد التوفر وشروط التعاقد' : 'Confirm availability and rental terms'}</span>}
                  </div>
                  <div className="flex gap-2">
                  <button
                    aria-label={isArabic ? 'حجز معاينة' : 'Book viewing'}
                    className="flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-[#314f43] px-3 text-[10px] font-bold text-white shadow-sm transition-all hover:-translate-y-px hover:bg-[#436e5d]"
                    onClick={() => {
                      setActiveProperty(prop);
                      setGalleryIndex(0);
                    }}
                    type="button"
                  >
                    <CalendarDays className="h-4 w-4" />
                    {isArabic ? 'احجز معاينة' : 'Book viewing'}
                  </button>
                  <button
                    aria-label={isArabic ? 'استفسار واتساب' : 'Ask on WhatsApp'}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#dce6e0] text-[#527362] transition-colors hover:border-[#4e8e6f] hover:bg-[#eef5f1]"
                    title={isArabic ? 'استفسار واتساب' : 'Ask on WhatsApp'}
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
              aria-labelledby="listing-dialog-title"
              aria-modal="true"
              role="dialog"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#edf1ee] px-6 py-4">
                <div>
                  <h3 className="text-base font-bold text-[#2d4236]" id="listing-dialog-title">
                    {activeVehicle ? activeVehicle.title[locale] : activeProperty?.title[locale]}
                  </h3>
                  <p className="text-[10px] text-[#7d8f85]">
                    {isArabic ? 'معرض الصور، بيانات الموقع، وحجز المعاينة' : 'Image Gallery, Location Details & Viewing'}
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
                        src={publicAssetUrl(activeVehicle.gallery[galleryIndex] || activeVehicle.photo)}
                      />
                    )}
                    {activeProperty && (
                      <img
                        alt="Property"
                        className="h-full w-full object-cover"
                        src={publicAssetUrl(activeProperty.gallery[galleryIndex] || activeProperty.photo)}
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
                <div className="zx-no-bar flex gap-2 overflow-x-auto pb-1">
                    {(activeVehicle ? activeVehicle.gallery : activeProperty?.gallery ?? []).map((img, idx) => (
                      <button
                        className={`aspect-video w-20 overflow-hidden rounded-xl border-2 transition-all ${
                          galleryIndex === idx ? 'border-[#314f43] shadow-md' : 'border-transparent opacity-60'
                        }`}
                        key={img + idx}
                        onClick={() => setGalleryIndex(idx)}
                        type="button"
                      >
                        <img alt={`${isArabic ? 'الصورة' : 'Photo'} ${idx + 1}`} className="h-full w-full object-cover" loading="lazy" src={publicAssetUrl(img)} />
                      </button>
                    ))}
                  </div>

                  {/* Property Map Visual Locator */}
                  {activeProperty && (
                    <div className="rounded-2xl border border-[#dbe6df] bg-[#f4f8f5] p-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#355243]">
                        <MapPin className="h-4 w-4 text-[#4f8369]" />
                        <span>{isArabic ? 'موقع العقار حسب بيانات الإعلان:' : 'Location as listed:'}</span>
                      </div>
                      <div className="relative mt-2.5 flex aspect-[2.4/1] items-center justify-center overflow-hidden rounded-xl border border-white bg-linear-to-br from-[#d4ece2] via-[#e5f4ed] to-[#f4e7f8]">
                        <div className="text-center">
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#314f43] text-white shadow-lg">
                            <MapPin className="h-5 w-5" />
                          </span>
                          <p className="mt-1.5 text-xs font-bold text-[#2a4637]">{activeProperty.location[locale]}</p>
                          <p className="text-[9px] text-[#6d8075]">
                            {isArabic ? 'المنطقة المذكورة في بيانات العقار' : 'Area shown in the listing details'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Inspection Booking Form */}
                <div className="flex flex-col justify-between">
                  <div>
                    <div className="mb-4 rounded-2xl border border-[#e4ece6] bg-[#f7faf7] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[9px] font-bold tracking-wide text-[#7d8f85]">{activeVehicle ? (isArabic ? 'السيارة' : 'VEHICLE') : (isArabic ? 'العقار' : 'PROPERTY')}</p>
                          <p className="mt-1 text-xs font-bold text-[#2d4236]">{activeVehicle?.title[locale] ?? activeProperty?.title[locale]}</p>
                          <p className="mt-1 text-[10px] text-[#718478]">{activeVehicle?.location[locale] ?? activeProperty?.location[locale]}</p>
                        </div>
                        <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-[9px] font-bold text-[#527362]">
                          {activeVehicle?.deal === 'Rent' ? (isArabic ? 'للإيجار' : 'FOR RENT') : activeProperty?.deal === 'Rent' ? (isArabic ? 'للإيجار' : 'FOR RENT') : (isArabic ? 'بيع بتفويض المالك' : 'OWNER-AUTHORIZED SALE')}
                        </span>
                      </div>
                      <p className="zx-display mt-3 text-xl text-[#2d4838]">
                        {activeVehicle
                          ? formatListingPrice(activeVehicle.price, activeVehicle.region)
                          : activeProperty ? formatListingPrice(activeProperty.price, activeProperty.region) : ''}
                        {activeVehicle?.deal === 'Rent' && <span className="ms-1 font-sans text-xs font-semibold">{vehiclePricePeriod(activeVehicle)}</span>}
                      </p>
                      {activeProperty?.deal === 'Rent' && <p className="mt-1 text-[10px] text-[#718478]">{isArabic ? `إيجار ${activeProperty.rentalPeriod === 'Year' ? 'سنوي' : 'شهري'}` : `${activeProperty.rentalPeriod === 'Year' ? 'Yearly' : 'Monthly'} rental`}</p>}
                      <p className="mt-2 text-[10px] leading-5 text-[#718478]">
                        {activeVehicle
                          ? `${activeVehicle.make} · ${activeVehicle.year} · ${activeVehicle.mileage === 0 ? (isArabic ? 'زيرو' : 'New') : `${new Intl.NumberFormat('en-US').format(activeVehicle.mileage)} ${isArabic ? 'كم' : 'km'}`}`
                          : activeProperty ? `${activeProperty.type} · ${new Intl.NumberFormat('en-US').format(activeProperty.area)} ${isArabic ? 'م²' : 'm²'} · ${activeProperty.rooms} ${isArabic ? 'غرف' : 'rooms'}` : ''}
                      </p>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#688a77]">
                      {isArabic ? 'حجز موعد معاينة ميدانية' : 'Book In-Person Viewing'}
                    </span>
                    <h4 className="mt-1 text-sm font-bold text-[#293d32]">
                      {activeVehicle?.deal === 'Rent'
                        ? isArabic ? 'حدد موعد بدء الإيجار واستلام السيارة' : 'Choose rental start and pickup time'
                        : isArabic ? 'حدد التاريخ والساعة لتأكيد الموعد' : 'Select Date & Hour For Direct Inspection'}
                    </h4>
                    <p className="mt-1 text-[11px] leading-5 text-[#6c7d73]">
                      {activeVehicle?.deal === 'Rent'
                        ? isArabic ? 'سيتواصل معك فريقنا لتأكيد التوفر ومدة الإيجار والتفاصيل قبل اعتماد الحجز.' : 'Our team will confirm availability, rental duration and terms before confirming your request.'
                        : isArabic ? 'سيتواصل معك فريقنا لتأكيد موعد المعاينة.' : 'Our team will contact you to confirm the viewing appointment.'}
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
                          {activeVehicle?.deal === 'Rent' ? isArabic ? 'تاريخ بدء الإيجار' : 'Rental start date' : isArabic ? 'اليوم' : 'Date'}
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
                          {activeVehicle?.deal === 'Rent' ? isArabic ? 'موعد الاستلام' : 'Pickup time' : isArabic ? 'الساعة' : 'Time'}
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
                        {activeVehicle?.deal === 'Rent'
                          ? isArabic ? 'إرسال طلب الإيجار عبر واتساب' : 'Send Rental Request on WhatsApp'
                          : isArabic ? 'تأكيد حجز المعاينة وإرسال عبر واتساب' : 'Confirm Inspection & WhatsApp'}
                      </button>

                      {bookingSuccess && (
                        <p className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#3a7554]">
                          <Check className="h-4 w-4" />
                          {activeVehicle?.deal === 'Rent'
                            ? isArabic ? 'تم حفظ طلب الإيجار وفتح واتساب!' : 'Rental request saved and WhatsApp opened.'
                            : isArabic ? 'تم حفظ موعدك وفتح واتساب!' : 'Viewing request saved and WhatsApp opened.'}
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
