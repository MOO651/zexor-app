import { useState, useRef } from 'react';
import {
  BarChart3,
  CarFront,
  Check,
  Clock,
  Download,
  Eye,
  EyeOff,
  Home,
  Layers,
  LockKeyhole,
  LogOut,
  Pencil,
  Plus,
  Search,
  Send,
  Settings,
  ShoppingBag,
  Tag,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import type {
  CustomerOrder,
  DynamicCategory,
  Locale,
  Market,
  PlatformInquiry,
  Product,
  PromoCode,
  Property,
  SiteSettings,
  Vehicle,
} from '../types';

type Props = {
  locale: Locale;
  market: Market;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: DynamicCategory[];
  setCategories: React.Dispatch<React.SetStateAction<DynamicCategory[]>>;
  vehicles: Vehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  properties: Property[];
  setProperties: React.Dispatch<React.SetStateAction<Property[]>>;
  orders: CustomerOrder[];
  setOrders: React.Dispatch<React.SetStateAction<CustomerOrder[]>>;
  inbox: PlatformInquiry[];
  promoCodes: PromoCode[];
  setPromoCodes: React.Dispatch<React.SetStateAction<PromoCode[]>>;
  settings: SiteSettings;
  setSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
  onLock: () => void;
  onToast: (msg: string) => void;
};

export function AdminDashboard({
  locale,
  products,
  setProducts,
  categories,
  setCategories,
  vehicles,
  setVehicles,
  properties,
  setProperties,
  orders,
  setOrders,
  inbox,
  promoCodes,
  setPromoCodes,
  settings,
  setSettings,
  onLock,
  onToast,
}: Props) {
  const isArabic = locale === 'ar';
  const [activeTab, setActiveTab] = useState<
    'overview' | 'categories' | 'products' | 'cars' | 'properties' | 'orders' | 'promos' | 'settings'
  >('overview');

  // Hero / contact editor: which locale column is being edited
  const [heroLang, setHeroLang] = useState<Locale>(locale);

  /** Downloads every persisted store as a single JSON backup file. */
  const handleExportData = () => {
    const backup = {
      exportedAt: new Date().toISOString(),
      products,
      categories,
      vehicles,
      properties,
      orders,
      promoCodes,
      settings,
      inbox,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zexor-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onToast(isArabic ? 'تم تنزيل نسخة احتياطية كاملة!' : 'Full backup downloaded!');
  };

  /** Clears only the demo/content stores, keeping settings and the admin session. */
  const handleResetContent = () => {
    const ok = window.confirm(
      isArabic
        ? 'سيتم مسح المنتجات والسيارات والعقارات والطلبات والرسائل. هل أنت متأكد؟'
        : 'This clears products, cars, properties, orders and inbox. Continue?',
    );
    if (!ok) return;
    setProducts([]);
    setVehicles([]);
    setProperties([]);
    setOrders([]);
    onToast(isArabic ? 'تم تفريغ بيانات المحتوى.' : 'Content data cleared.');
  };

  // Search & Filter in Admin
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'new' | 'confirmed' | 'complete'>('all');

  // Add Category Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCatNameAr, setNewCatNameAr] = useState('');
  const [newCatNameEn, setNewCatNameEn] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');

  // Add / Edit Product Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodNameAr, setProdNameAr] = useState('');
  const [prodNameEn, setProdNameEn] = useState('');
  const [prodDescAr, setProdDescAr] = useState('');
  const [prodDescEn, setProdDescEn] = useState('');
  const [prodCat, setProdCat] = useState('cards');
  const [prodPriceEg, setProdPriceEg] = useState('');
  const [prodPriceKsa, setProdPriceKsa] = useState('');
  const [prodOldPriceEg, setProdOldPriceEg] = useState('');
  const [prodOldPriceKsa, setProdOldPriceKsa] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add Car Modal State
  const [showCarModal, setShowCarModal] = useState(false);
  const [carTitleAr, setCarTitleAr] = useState('');
  const [carTitleEn] = useState('');
  const [carMake, setCarMake] = useState('Mercedes-Benz');
  const [carYear, setCarYear] = useState('2024');
  const [carPrice, setCarPrice] = useState('');
  const [carLocation] = useState('Cairo');
  const [carCondition, setCarCondition] = useState<'New' | 'Used'>('Used');

  // Add Property Modal State
  const [showPropModal, setShowPropModal] = useState(false);
  const [propTitleAr, setPropTitleAr] = useState('');
  const [propTitleEn] = useState('');
  const [propType, setPropType] = useState<'Apartment' | 'Villa' | 'Land' | 'Shop'>('Apartment');
  const [propDeal, setPropDeal] = useState<'Sale' | 'Rent'>('Sale');
  const [propPrice, setPropPrice] = useState('');
  const [propArea, setPropArea] = useState('150');
  const [propRooms, setPropRooms] = useState('3');
  const [propLocation] = useState('Cairo');

  // Cloudinary / Local Image Uploader Helper
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProdImageUrl(reader.result);
        onToast(isArabic ? 'تم رفع ومعالجة الصورة بنجاح!' : 'Image uploaded & ready!');
      }
    };
    reader.readAsDataURL(file);
  };

  // Save / Update Category
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatNameAr || !newCatNameEn) return;
    const slug = (newCatSlug || newCatNameEn.toLowerCase().replace(/\s+/g, '-')).trim();
    const newCat: DynamicCategory = {
      id: `cat-${Date.now()}`,
      name: { ar: newCatNameAr.trim(), en: newCatNameEn.trim() },
      slug,
      icon: 'sparkles',
      active: true,
    };
    setCategories((prev) => [...prev, newCat]);
    setNewCatNameAr('');
    setNewCatNameEn('');
    setNewCatSlug('');
    setShowCategoryModal(false);
    onToast(isArabic ? 'تمت إضافة القسم الجديد بنجاح!' : 'New category created successfully!');
  };

  const handleToggleCategory = (catId: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, active: !c.active } : c)),
    );
  };

  const handleDeleteCategory = (catId: string) => {
    if (window.confirm(isArabic ? 'هل أنت متأكد من حذف هذا القسم؟' : 'Delete this category?')) {
      setCategories((prev) => prev.filter((c) => c.id !== catId));
      onToast(isArabic ? 'تم حذف القسم' : 'Category removed');
    }
  };

  // Save / Update Product with Discount
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const egPrice = Number(prodPriceEg);
    const ksaPrice = Number(prodPriceKsa);
    const oldEg = prodOldPriceEg ? Number(prodOldPriceEg) : undefined;
    const oldKsa = prodOldPriceKsa ? Number(prodOldPriceKsa) : undefined;

    const newProd: Product = {
      id: editingProductId ?? `prod-${Date.now()}`,
      category: prodCat,
      markets: ['eg', 'ksa'],
      name: { ar: prodNameAr.trim(), en: prodNameEn.trim() },
      description: { ar: prodDescAr.trim(), en: prodDescEn.trim() },
      price: { eg: egPrice, ksa: ksaPrice },
      oldPrice: oldEg || oldKsa ? { eg: oldEg ?? egPrice, ksa: oldKsa ?? ksaPrice } : undefined,
      icon: 'sparkles',
      finish: 'pearl',
      available: true,
      imageUrl: prodImageUrl || '/images/nfc-card.jpg',
    };

    if (editingProductId) {
      setProducts((prev) => prev.map((p) => (p.id === editingProductId ? newProd : p)));
      onToast(isArabic ? 'تم تحديث بيانات وسعر المنتج!' : 'Product updated!');
    } else {
      setProducts((prev) => [newProd, ...prev]);
      onToast(isArabic ? 'تمت إضافة المنتج الجديد للكتالوج!' : 'New product added!');
    }

    setEditingProductId(null);
    setShowProductModal(false);
  };

  const startEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setProdNameAr(prod.name.ar);
    setProdNameEn(prod.name.en);
    setProdDescAr(prod.description.ar);
    setProdDescEn(prod.description.en);
    setProdCat(prod.category);
    setProdPriceEg(String(prod.price.eg));
    setProdPriceKsa(String(prod.price.ksa));
    setProdOldPriceEg(prod.oldPrice ? String(prod.oldPrice.eg) : '');
    setProdOldPriceKsa(prod.oldPrice ? String(prod.oldPrice.ksa) : '');
    setProdImageUrl(prod.imageUrl ?? '');
    setShowProductModal(true);
  };

  const handleToggleProduct = (prodId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === prodId ? { ...p, available: !p.available } : p)),
    );
  };

  const handleDeleteProduct = (prodId: string) => {
    if (window.confirm(isArabic ? 'هل تريد حذف هذا المنتج؟' : 'Delete product?')) {
      setProducts((prev) => prev.filter((p) => p.id !== prodId));
      onToast(isArabic ? 'تم حذف المنتج' : 'Product deleted');
    }
  };

  // Add Car
  const handleSaveCar = (e: React.FormEvent) => {
    e.preventDefault();
    const newCar: Vehicle = {
      id: `ZX-CAR-${Date.now().toString().slice(-4)}`,
      title: { ar: carTitleAr || 'سيارة جديدة', en: carTitleEn || 'New Vehicle' },
      location: { ar: carLocation, en: carLocation },
      price: Number(carPrice) || 1000000,
      area: 0,
      region: (carLocation as Vehicle['region']) || 'Cairo',
      photo: '/images/demo-sedan.svg',
      gallery: ['/images/demo-sedan.svg', '/images/demo-coupe.svg'],
      make: carMake,
      year: Number(carYear) || 2024,
      mileage: carCondition === 'New' ? 0 : 15000,
      transmission: 'Automatic',
      condition: carCondition,
      body: 'Sedan',
      fuel: 'Petrol',
    };
    setVehicles((prev) => [newCar, ...prev]);
    setShowCarModal(false);
    onToast(isArabic ? 'تمت إضافة السيارة إلى المعرض بنجاح!' : 'Vehicle added to showroom!');
  };

  // Add Property
  const handleSaveProperty = (e: React.FormEvent) => {
    e.preventDefault();
    const newProp: Property = {
      id: `ZX-PROP-${Date.now().toString().slice(-4)}`,
      title: { ar: propTitleAr || 'عقار جديد', en: propTitleEn || 'New Property' },
      location: { ar: propLocation, en: propLocation },
      price: Number(propPrice) || 2500000,
      area: Number(propArea) || 150,
      region: (propLocation as Property['region']) || 'Cairo',
      photo: propType === 'Villa' ? '/images/demo-villa.svg' : propType === 'Land' ? '/images/demo-land.svg' : '/images/demo-apartment.svg',
      gallery: ['/images/demo-apartment.svg', '/images/demo-villa.svg'],
      type: propType,
      deal: propDeal,
      rooms: Number(propRooms) || 3,
      floor: 2,
      bathrooms: 2,
    };
    setProperties((prev) => [newProp, ...prev]);
    setShowPropModal(false);
    onToast(isArabic ? 'تمت إضافة العقار بنجاح!' : 'Property added successfully!');
  };

  // Update Order Status
  const handleUpdateOrderStatus = (orderId: string, status: CustomerOrder['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o)),
    );
    onToast(isArabic ? `تم تعديل حالة الطلب إلى: ${status}` : `Order status updated to: ${status}`);
  };

  // Export JSON Backup
  const handleExportDataBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      products,
      categories,
      vehicles,
      properties,
      orders,
      promoCodes,
      settings,
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zexor-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onToast(isArabic ? 'تم تصدير ملف النسخة الاحتياطية بنجاح!' : 'Backup exported successfully!');
  };

  // Test Telegram Automation Notification
  const handleTestTelegramNotification = async () => {
    if (!settings.telegramBotToken || !settings.telegramChatId) {
      onToast(isArabic ? 'يرجى إدخال Bot Token و Chat ID أولاً في الإعدادات.' : 'Please enter Telegram Bot Token & Chat ID first.');
      return;
    }

    try {
      const text = encodeURIComponent(
        `🚀 ZEXOR Notification Test:\nYour Telegram Bot automation is active and working perfectly!\nTimestamp: ${new Date().toLocaleTimeString()}`
      );
      const url = `https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage?chat_id=${settings.telegramChatId}&text=${text}`;
      await fetch(url, { method: 'POST' });
      onToast(isArabic ? 'تم إرسال إشعار التجربة بنجاح إلى تليجرام!' : 'Telegram test notification sent!');
    } catch {
      onToast(isArabic ? 'تعذر الاتصال بـ Telegram API، تحقق من التوكن.' : 'Failed to reach Telegram API, check token.');
    }
  };

  // Stats
  const totalRevenueEg = orders.filter((o) => o.market === 'eg' && o.status === 'complete').reduce((s, o) => s + o.total, 0);
  const totalRevenueKsa = orders.filter((o) => o.market === 'ksa' && o.status === 'complete').reduce((s, o) => s + o.total, 0);
  const pendingOrdersCount = orders.filter((o) => o.status === 'new').length;

  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) return false;
    if (orderSearch && !`${o.id} ${o.customer} ${o.phone}`.toLowerCase().includes(orderSearch.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-[#5c8f76]">
            <LockKeyhole className="h-3.5 w-3.5" />
            {isArabic ? 'لوحة التحكم وإدارة النظام المتكاملة' : 'Admin Operations & Settings Control'}
          </span>
          <h1 className="mt-1 text-2xl font-bold text-[#2d4236] sm:text-3xl">
            {isArabic ? 'إدارة ZEXOR الشاملة (بدون تعديل كود)' : 'Fully Dynamic ZEXOR Control Center'}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            className="flex items-center gap-1.5 rounded-full border border-[#d6e3db] bg-white px-3.5 py-2 text-xs font-semibold text-[#3b5949] shadow-xs hover:bg-[#edf5f0]"
            onClick={handleExportDataBackup}
            type="button"
          >
            <Download className="h-3.5 w-3.5" />
            {isArabic ? 'تصدير نسخة احتياطية (JSON)' : 'Export Backup'}
          </button>
          <button
            className="flex items-center gap-1.5 rounded-full border border-[#d6e3db] bg-white px-3.5 py-2 text-xs font-semibold text-[#3b5949] shadow-xs hover:bg-[#edf5f0]"
            onClick={onLock}
            type="button"
          >
            <LogOut className="h-3.5 w-3.5" />
            {isArabic ? 'قفل لوحة الإدارة' : 'Lock Studio'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#e5ebe7] pb-3">
        {[
          { id: 'overview', label: isArabic ? 'نظرة عامة' : 'Overview', icon: BarChart3 },
          { id: 'categories', label: isArabic ? 'الأقسام الديناميكية' : 'Categories', icon: Layers },
          { id: 'products', label: isArabic ? 'المنتجات والأسعار' : 'Products & Pricing', icon: ShoppingBag },
          { id: 'cars', label: isArabic ? `معرض السيارات (${vehicles.length})` : `Vehicles (${vehicles.length})`, icon: CarFront },
          { id: 'properties', label: isArabic ? `إدارة العقارات (${properties.length})` : `Real Estate (${properties.length})`, icon: Home },
          { id: 'orders', label: isArabic ? `الطلبات الواردة (${pendingOrdersCount})` : `Orders (${pendingOrdersCount})`, icon: Clock },
          { id: 'promos', label: isArabic ? 'أكواد الخصم' : 'Promo Codes', icon: Tag },
          { id: 'settings', label: isArabic ? 'إعدادات الواجهة وتليجرام' : 'Hero & Telegram Settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-[#314f43] text-white shadow-sm'
                  : 'bg-white text-[#64776c] hover:bg-[#edf4f0] hover:text-[#2f4a3b]'
              }`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              type="button"
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white bg-white/90 p-5 shadow-sm">
              <span className="text-[10px] text-[#788a80]">{isArabic ? 'إجمالي الطلبات' : 'Total Orders'}</span>
              <p className="mt-2 text-2xl font-bold text-[#2e4739]">{orders.length}</p>
              <p className="mt-1 text-[9px] text-[#4f8369]">{pendingOrdersCount} {isArabic ? 'طلبات جديدة' : 'New pending'}</p>
            </div>
            <div className="rounded-2xl border border-white bg-white/90 p-5 shadow-sm">
              <span className="text-[10px] text-[#788a80]">{isArabic ? 'إيرادات مصر المكتملة' : 'Revenue Egypt'}</span>
              <p className="mt-2 text-2xl font-bold text-[#2e4739]">
                {new Intl.NumberFormat('ar-EG').format(totalRevenueEg)} ج.م
              </p>
            </div>
            <div className="rounded-2xl border border-white bg-white/90 p-5 shadow-sm">
              <span className="text-[10px] text-[#788a80]">{isArabic ? 'إيرادات السعودية المكتملة' : 'Revenue KSA'}</span>
              <p className="mt-2 text-2xl font-bold text-[#2e4739]">
                {new Intl.NumberFormat('ar-SA').format(totalRevenueKsa)} ر.س
              </p>
            </div>
            <div className="rounded-2xl border border-white bg-white/90 p-5 shadow-sm">
              <span className="text-[10px] text-[#788a80]">{isArabic ? 'استفسارات المعاينة والتواصل' : 'Inquiries & Viewing'}</span>
              <p className="mt-2 text-2xl font-bold text-[#2e4739]">{inbox.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Dynamic Categories Management */}
      {activeTab === 'categories' && (
        <div className="rounded-3xl border border-white bg-white/85 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#2f4437]">
                {isArabic ? 'إدارة الأقسام الديناميكية (Dynamic Categories)' : 'Dynamic Categories Manager'}
              </h2>
              <p className="text-[10px] text-[#788b80]">
                {isArabic
                  ? 'أضف قسماً جديداً (مثل: إلكترونيات، ساعات) ليظهر فوراً في النافبار والفلتر دون تعديل كود!'
                  : 'Add, rename, or toggle categories without touching code. Automatically reflects in Navbar.'}
              </p>
            </div>
            <button
              className="flex items-center gap-1.5 rounded-full bg-[#314f43] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#436e5d]"
              onClick={() => setShowCategoryModal(true)}
              type="button"
            >
              <Plus className="h-3.5 w-3.5" />
              {isArabic ? 'إضافة قسم جديد' : 'New Category'}
            </button>
          </div>

          <div className="mt-6 divide-y divide-[#edf1ee]">
            {categories.map((cat) => (
              <div className="flex items-center justify-between py-3.5" key={cat.id}>
                <div>
                  <h4 className="text-xs font-bold text-[#2c3f34]">
                    {cat.name.ar} · {cat.name.en}
                  </h4>
                  <p className="text-[9px] text-[#819288]">Slug: #{cat.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className={`flex items-center gap-1 rounded-full px-3 py-1 text-[9px] font-semibold ${
                      cat.active ? 'bg-[#e4f6ec] text-[#347854]' : 'bg-[#f4eae9] text-[#9b5147]'
                    }`}
                    onClick={() => handleToggleCategory(cat.id)}
                    type="button"
                  >
                    {cat.active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    {cat.active ? (isArabic ? 'مفعّل بالنافبار' : 'Active') : isArabic ? 'مخفي' : 'Hidden'}
                  </button>
                  <button
                    className="p-1.5 text-[#a16f66] hover:text-[#c4493a]"
                    onClick={() => handleDeleteCategory(cat.id)}
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* New Category Modal */}
          {showCategoryModal && (
            <div className="fixed inset-0 z-110 flex items-center justify-center bg-black/40 p-4">
              <form
                className="w-full max-w-md rounded-3xl border border-white bg-white p-6 shadow-2xl"
                onSubmit={handleSaveCategory}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#2e4337]">{isArabic ? 'إضافة قسم جديد' : 'Add New Category'}</h3>
                  <button onClick={() => setShowCategoryModal(false)} type="button">
                    <X className="h-4 w-4 text-[#72857a]" />
                  </button>
                </div>
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="text-[10px] text-[#607368]">{isArabic ? 'اسم القسم (عربي)' : 'Name (Arabic)'}</label>
                    <input
                      className="mt-1 h-9 w-full rounded-xl border border-[#dfe8e2] px-3 text-xs outline-none"
                      onChange={(e) => setNewCatNameAr(e.target.value)}
                      placeholder="مثال: إلكترونيات ذكية"
                      required
                      value={newCatNameAr}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#607368]">{isArabic ? 'اسم القسم (إنجليزي)' : 'Name (English)'}</label>
                    <input
                      className="mt-1 h-9 w-full rounded-xl border border-[#dfe8e2] px-3 text-xs outline-none"
                      onChange={(e) => setNewCatNameEn(e.target.value)}
                      placeholder="e.g. Smart Electronics"
                      required
                      value={newCatNameEn}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#607368]">{isArabic ? 'الرابط المختصر (Slug)' : 'URL Slug'}</label>
                    <input
                      className="mt-1 h-9 w-full rounded-xl border border-[#dfe8e2] px-3 text-xs outline-none"
                      onChange={(e) => setNewCatSlug(e.target.value)}
                      placeholder="electronics"
                      value={newCatSlug}
                    />
                  </div>
                </div>
                <button
                  className="mt-5 min-h-10 w-full rounded-full bg-[#314f43] text-xs font-semibold text-white hover:bg-[#436e5d]"
                  type="submit"
                >
                  {isArabic ? 'حفظ القسم وإظهاره فوراً' : 'Save & Publish Category'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Products, Cloud Image Upload & Discount Manager */}
      {activeTab === 'products' && (
        <div className="rounded-3xl border border-white bg-white/85 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#2f4437]">
                {isArabic ? 'إدارة المنتجات والأسعار والعروض' : 'Products & Dynamic Discounts'}
              </h2>
              <p className="text-[10px] text-[#788b80]">
                {isArabic
                  ? 'رفع الصور مباشرة، إضافة سعر جديد وسعر قديم (خصومات)، وتعديل المنتجات فورياً.'
                  : 'Manage prices, upload images to storage, configure discounts with strikethrough prices.'}
              </p>
            </div>
            <button
              className="flex items-center gap-1.5 rounded-full bg-[#314f43] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#436e5d]"
              onClick={() => {
                setEditingProductId(null);
                setProdNameAr('');
                setProdNameEn('');
                setProdDescAr('');
                setProdDescEn('');
                setProdCat('cards');
                setProdPriceEg('');
                setProdPriceKsa('');
                setProdOldPriceEg('');
                setProdOldPriceKsa('');
                setProdImageUrl('');
                setShowProductModal(true);
              }}
              type="button"
            >
              <Plus className="h-3.5 w-3.5" />
              {isArabic ? 'إضافة منتج جديد' : 'New Product'}
            </button>
          </div>

          <div className="mt-6 divide-y divide-[#edf1ee]">
            {products.map((prod) => (
              <div className="flex items-center justify-between py-4" key={prod.id}>
                <div className="flex items-center gap-3">
                  <img alt={prod.name.ar} className="h-12 w-12 rounded-xl object-cover shadow-xs" src={prod.imageUrl} />
                  <div>
                    <h4 className="text-xs font-bold text-[#2c3f34]">
                      {prod.name.ar} · {prod.name.en}
                    </h4>
                    <p className="mt-0.5 text-[10px] text-[#426b56]">
                      {prod.price.eg} ج.م / {prod.price.ksa} ر.س
                      {prod.oldPrice && (
                        <span className="ms-2 text-[#99a79f] line-through">
                          {prod.oldPrice.eg} ج.م
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className={`rounded-full px-3 py-1 text-[9px] font-semibold ${
                      prod.available ? 'bg-[#e4f6ec] text-[#347854]' : 'bg-[#f4eae9] text-[#9b5147]'
                    }`}
                    onClick={() => handleToggleProduct(prod.id)}
                    type="button"
                  >
                    {prod.available ? (isArabic ? 'متوفر' : 'Available') : isArabic ? 'مخفي' : 'Hidden'}
                  </button>
                  <button
                    className="p-1.5 text-[#517663] hover:text-[#2d4b3b]"
                    onClick={() => startEditProduct(prod)}
                    type="button"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    className="p-1.5 text-[#a16f66] hover:text-[#c4493a]"
                    onClick={() => handleDeleteProduct(prod.id)}
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Product Modal */}
          {showProductModal && (
            <div className="fixed inset-0 z-110 flex items-center justify-center bg-black/40 p-4">
              <form
                className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-white bg-white p-6 shadow-2xl"
                onSubmit={handleSaveProduct}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#2e4337]">
                    {editingProductId ? (isArabic ? 'تعديل المنتج والأسعار' : 'Edit Product') : isArabic ? 'إضافة منتج جديد' : 'New Product'}
                  </h3>
                  <button onClick={() => setShowProductModal(false)} type="button">
                    <X className="h-4 w-4 text-[#72857a]" />
                  </button>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-[10px] text-[#607368]">{isArabic ? 'الاسم (عربي)' : 'Name (Arabic)'}</label>
                    <input
                      className="mt-1 h-9 w-full rounded-xl border border-[#dfe8e2] px-3 text-xs outline-none"
                      onChange={(e) => setProdNameAr(e.target.value)}
                      required
                      value={prodNameAr}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#607368]">{isArabic ? 'الاسم (إنجليزي)' : 'Name (English)'}</label>
                    <input
                      className="mt-1 h-9 w-full rounded-xl border border-[#dfe8e2] px-3 text-xs outline-none"
                      onChange={(e) => setProdNameEn(e.target.value)}
                      required
                      value={prodNameEn}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-[#607368]">{isArabic ? 'الوصف (عربي)' : 'Description (Arabic)'}</label>
                    <textarea
                      className="mt-1 h-16 w-full rounded-xl border border-[#dfe8e2] p-2 text-xs outline-none"
                      onChange={(e) => setProdDescAr(e.target.value)}
                      value={prodDescAr}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-[#607368]">{isArabic ? 'القسم' : 'Category'}</label>
                    <select
                      className="mt-1 h-9 w-full rounded-xl border border-[#dfe8e2] px-3 text-xs outline-none"
                      onChange={(e) => setProdCat(e.target.value)}
                      value={prodCat}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.slug}>
                          {c.name.ar}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Image Upload Integration */}
                  <div>
                    <label className="text-[10px] text-[#607368]">{isArabic ? 'رفع صورة المنتج' : 'Upload Image'}</label>
                    <div className="mt-1 flex gap-2">
                      <input
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageFileUpload}
                        ref={fileInputRef}
                        type="file"
                      />
                      <button
                        className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#d6e4dc] bg-[#f4f9f6] text-[10px] font-semibold text-[#3a634e] hover:bg-[#eaf5ef]"
                        onClick={() => fileInputRef.current?.click()}
                        type="button"
                      >
                        <UploadCloud className="h-3.5 w-3.5" />
                        {isArabic ? 'اختر صورة من جهازك' : 'Upload from Device'}
                      </button>
                    </div>
                  </div>

                  {/* Price & Old Price Fields (Discounts) */}
                  <div>
                    <label className="text-[10px] text-[#607368]">{isArabic ? 'السعر الحالي (ج.م)' : 'Current Price (EGP)'}</label>
                    <input
                      className="mt-1 h-9 w-full rounded-xl border border-[#dfe8e2] px-3 text-xs outline-none"
                      onChange={(e) => setProdPriceEg(e.target.value)}
                      required
                      type="number"
                      value={prodPriceEg}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#607368]">{isArabic ? 'السعر القديم قبل الخصم (ج.م)' : 'Old Price (EGP) - Offer'}</label>
                    <input
                      className="mt-1 h-9 w-full rounded-xl border border-[#dfe8e2] px-3 text-xs outline-none"
                      onChange={(e) => setProdOldPriceEg(e.target.value)}
                      placeholder="اتركه فارغاً إن لم يكن هناك خصم"
                      type="number"
                      value={prodOldPriceEg}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-[#607368]">{isArabic ? 'السعر الحالي (ر.س)' : 'Current Price (SAR)'}</label>
                    <input
                      className="mt-1 h-9 w-full rounded-xl border border-[#dfe8e2] px-3 text-xs outline-none"
                      onChange={(e) => setProdPriceKsa(e.target.value)}
                      type="number"
                      value={prodPriceKsa}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#607368]">{isArabic ? 'السعر القديم قبل الخصم (ر.س)' : 'Old Price (SAR) - Offer'}</label>
                    <input
                      className="mt-1 h-9 w-full rounded-xl border border-[#dfe8e2] px-3 text-xs outline-none"
                      onChange={(e) => setProdOldPriceKsa(e.target.value)}
                      placeholder="اختياري"
                      type="number"
                      value={prodOldPriceKsa}
                    />
                  </div>
                </div>

                <button
                  className="mt-6 min-h-11 w-full rounded-full bg-[#314f43] text-xs font-semibold text-white hover:bg-[#436e5d]"
                  type="submit"
                >
                  {isArabic ? 'حفظ وتطبيق الخصم فوراً' : 'Save & Publish Product'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Car Showroom Management */}
      {activeTab === 'cars' && (
        <div className="rounded-3xl border border-white bg-white/85 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#2f4437]">
                {isArabic ? 'إدارة معرض السيارات' : 'Vehicle Showroom Manager'}
              </h2>
              <p className="text-[10px] text-[#788b80]">
                {isArabic ? 'إضافة وتعديل السيارات المعروضة وتحديد السعر والموديل.' : 'Add and manage vehicle inventory.'}
              </p>
            </div>
            <button
              className="flex items-center gap-1.5 rounded-full bg-[#314f43] px-4 py-2 text-xs font-semibold text-white hover:bg-[#436e5d]"
              onClick={() => setShowCarModal(true)}
              type="button"
            >
              <Plus className="h-3.5 w-3.5" />
              {isArabic ? 'إضافة سيارة جديدة' : 'Add Vehicle'}
            </button>
          </div>

          <div className="mt-6 divide-y divide-[#edf1ee]">
            {vehicles.map((v) => (
              <div className="flex items-center justify-between py-4" key={v.id}>
                <div className="flex items-center gap-3">
                  <img alt={v.title.ar} className="h-12 w-16 rounded-xl object-cover" src={v.photo} />
                  <div>
                    <h4 className="text-xs font-bold text-[#2d4236]">{v.title.ar}</h4>
                    <p className="text-[10px] text-[#697d72]">
                      {v.make} · {v.year} · {v.price.toLocaleString()} ج.م · {v.condition}
                    </p>
                  </div>
                </div>
                <button
                  className="p-2 text-[#b06155] hover:text-[#d04535]"
                  onClick={() => setVehicles((prev) => prev.filter((item) => item.id !== v.id))}
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Car Modal */}
          {showCarModal && (
            <div className="fixed inset-0 z-110 flex items-center justify-center bg-black/40 p-4">
              <form className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl" onSubmit={handleSaveCar}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#2e4337]">{isArabic ? 'إضافة سيارة جديدة' : 'Add Car'}</h3>
                  <button onClick={() => setShowCarModal(false)} type="button">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="text-[10px] text-[#5e7166]">{isArabic ? 'اسم الموديل (عربي)' : 'Model Name'}</label>
                    <input className="mt-1 h-9 w-full rounded-xl border border-[#dfe7e1] px-3 text-xs outline-none" onChange={(e) => setCarTitleAr(e.target.value)} required value={carTitleAr} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-[#5e7166]">{isArabic ? 'الماركة' : 'Make'}</label>
                      <input className="mt-1 h-9 w-full rounded-xl border border-[#dfe7e1] px-3 text-xs outline-none" onChange={(e) => setCarMake(e.target.value)} value={carMake} />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#5e7166]">{isArabic ? 'سنة الصنع' : 'Year'}</label>
                      <input className="mt-1 h-9 w-full rounded-xl border border-[#dfe7e1] px-3 text-xs outline-none" onChange={(e) => setCarYear(e.target.value)} type="number" value={carYear} />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-[#5e7166]">{isArabic ? 'السعر (ج.م)' : 'Price'}</label>
                    <input className="mt-1 h-9 w-full rounded-xl border border-[#dfe7e1] px-3 text-xs outline-none" onChange={(e) => setCarPrice(e.target.value)} required type="number" value={carPrice} />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#5e7166]">{isArabic ? 'الحالة' : 'Condition'}</label>
                    <select className="mt-1 h-9 w-full rounded-xl border border-[#dfe7e1] px-3 text-xs outline-none" onChange={(e) => setCarCondition(e.target.value as 'New' | 'Used')} value={carCondition}>
                      <option value="New">{isArabic ? 'جديد (زيرو)' : 'Brand New'}</option>
                      <option value="Used">{isArabic ? 'مستعمل فاخر' : 'Certified Used'}</option>
                    </select>
                  </div>
                </div>
                <button className="mt-5 min-h-10 w-full rounded-full bg-[#314f43] text-xs font-semibold text-white hover:bg-[#436e5d]" type="submit">
                  {isArabic ? 'حفظ وإضافة للمعرض' : 'Save Car'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Real Estate Management */}
      {activeTab === 'properties' && (
        <div className="rounded-3xl border border-white bg-white/85 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#2f4437]">
                {isArabic ? 'إدارة العقارات والمساحات' : 'Real Estate Management'}
              </h2>
              <p className="text-[10px] text-[#788b80]">
                {isArabic ? 'إضافة وتعديل عروض الشقق والفيلات والأراضي.' : 'Add and manage real estate listings.'}
              </p>
            </div>
            <button
              className="flex items-center gap-1.5 rounded-full bg-[#314f43] px-4 py-2 text-xs font-semibold text-white hover:bg-[#436e5d]"
              onClick={() => setShowPropModal(true)}
              type="button"
            >
              <Plus className="h-3.5 w-3.5" />
              {isArabic ? 'إضافة عقار جديد' : 'Add Property'}
            </button>
          </div>

          <div className="mt-6 divide-y divide-[#edf1ee]">
            {properties.map((p) => (
              <div className="flex items-center justify-between py-4" key={p.id}>
                <div className="flex items-center gap-3">
                  <img alt={p.title.ar} className="h-12 w-16 rounded-xl object-cover" src={p.photo} />
                  <div>
                    <h4 className="text-xs font-bold text-[#2d4236]">{p.title.ar}</h4>
                    <p className="text-[10px] text-[#697d72]">
                      {p.type} · {p.deal === 'Sale' ? (isArabic ? 'بيع' : 'Sale') : isArabic ? 'إيجار' : 'Rent'} · {p.price.toLocaleString()} ج.م
                    </p>
                  </div>
                </div>
                <button
                  className="p-2 text-[#b06155] hover:text-[#d04535]"
                  onClick={() => setProperties((prev) => prev.filter((item) => item.id !== p.id))}
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Property Modal */}
          {showPropModal && (
            <div className="fixed inset-0 z-110 flex items-center justify-center bg-black/40 p-4">
              <form className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl" onSubmit={handleSaveProperty}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#2e4337]">{isArabic ? 'إضافة عقار جديد' : 'Add Property'}</h3>
                  <button onClick={() => setShowPropModal(false)} type="button">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="text-[10px] text-[#5e7166]">{isArabic ? 'عنوان العقار (عربي)' : 'Title'}</label>
                    <input className="mt-1 h-9 w-full rounded-xl border border-[#dfe7e1] px-3 text-xs outline-none" onChange={(e) => setPropTitleAr(e.target.value)} required value={propTitleAr} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-[#5e7166]">{isArabic ? 'النوع' : 'Type'}</label>
                      <select className="mt-1 h-9 w-full rounded-xl border border-[#dfe7e1] px-3 text-xs outline-none" onChange={(e) => setPropType(e.target.value as Property['type'])} value={propType}>
                        <option value="Apartment">{isArabic ? 'شقة' : 'Apartment'}</option>
                        <option value="Villa">{isArabic ? 'فيلا' : 'Villa'}</option>
                        <option value="Land">{isArabic ? 'أرض' : 'Land'}</option>
                        <option value="Shop">{isArabic ? 'محل تجاري' : 'Shop'}</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-[#5e7166]">{isArabic ? 'نوع العرض' : 'Deal'}</label>
                      <select className="mt-1 h-9 w-full rounded-xl border border-[#dfe7e1] px-3 text-xs outline-none" onChange={(e) => setPropDeal(e.target.value as Property['deal'])} value={propDeal}>
                        <option value="Sale">{isArabic ? 'للبيع' : 'Sale'}</option>
                        <option value="Rent">{isArabic ? 'للإيجار' : 'Rent'}</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-[#5e7166]">{isArabic ? 'السعر' : 'Price'}</label>
                    <input className="mt-1 h-9 w-full rounded-xl border border-[#dfe7e1] px-3 text-xs outline-none" onChange={(e) => setPropPrice(e.target.value)} required type="number" value={propPrice} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-[#5e7166]">{isArabic ? 'المساحة م²' : 'Area m²'}</label>
                      <input className="mt-1 h-9 w-full rounded-xl border border-[#dfe7e1] px-3 text-xs outline-none" onChange={(e) => setPropArea(e.target.value)} type="number" value={propArea} />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#5e7166]">{isArabic ? 'عدد الغرف' : 'Bedrooms'}</label>
                      <input className="mt-1 h-9 w-full rounded-xl border border-[#dfe7e1] px-3 text-xs outline-none" onChange={(e) => setPropRooms(e.target.value)} type="number" value={propRooms} />
                    </div>
                  </div>
                </div>
                <button className="mt-5 min-h-10 w-full rounded-full bg-[#314f43] text-xs font-semibold text-white hover:bg-[#436e5d]" type="submit">
                  {isArabic ? 'حفظ العقار' : 'Save Property'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Orders & Inquiries Management */}
      {activeTab === 'orders' && (
        <div className="rounded-3xl border border-white bg-white/85 p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-base font-bold text-[#2f4437]">
                {isArabic ? 'إدارة الطلبات والعملاء' : 'Customer Orders & Inquiries'}
              </h2>
              <p className="text-[10px] text-[#788b80]">
                {isArabic ? 'متابعة كافة الطلبات الواردة وتحديث حالتها لحظياً.' : 'Track, filter, and advance order fulfillment states.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 rounded-xl border border-[#dfe8e2] bg-white px-3 py-1 text-xs">
                <Search className="h-3.5 w-3.5 text-[#72857a]" />
                <input
                  className="h-7 w-32 bg-transparent text-xs outline-none sm:w-48"
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder={isArabic ? 'بحث بالاسم أو الكود…' : 'Search orders…'}
                  value={orderSearch}
                />
              </div>
              <select
                className="h-9 rounded-xl border border-[#dfe8e2] bg-white px-3 text-xs text-[#2e4537] outline-none"
                onChange={(e) => setOrderStatusFilter(e.target.value as typeof orderStatusFilter)}
                value={orderStatusFilter}
              >
                <option value="all">{isArabic ? 'كل الحالات' : 'All Statuses'}</option>
                <option value="new">{isArabic ? 'جديد (قيد المتابعة)' : 'New'}</option>
                <option value="confirmed">{isArabic ? 'مؤكد' : 'Confirmed'}</option>
                <option value="complete">{isArabic ? 'مكتمل' : 'Complete'}</option>
              </select>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-start text-xs text-[#3a5244]">
              <thead>
                <tr className="border-b border-[#edf1ee] text-[9px] uppercase tracking-wider text-[#7e9085]">
                  <th className="py-2 text-start">{isArabic ? 'رقم الطلب' : 'Order ID'}</th>
                  <th className="py-2 text-start">{isArabic ? 'العميل' : 'Customer'}</th>
                  <th className="py-2 text-start">{isArabic ? 'المنطقة' : 'Region'}</th>
                  <th className="py-2 text-start">{isArabic ? 'الإجمالي' : 'Total'}</th>
                  <th className="py-2 text-start">{isArabic ? 'الحالة' : 'Status'}</th>
                  <th className="py-2 text-start">{isArabic ? 'الإجراء' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf1ee]">
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="py-3 font-mono font-bold">{order.id}</td>
                    <td className="py-3">
                      <div>
                        <p className="font-semibold">{order.customer}</p>
                        <p className="text-[9px] text-[#7d9084]">{order.phone}</p>
                      </div>
                    </td>
                    <td className="py-3">{order.city} · {order.market === 'eg' ? '🇪🇬' : '🇸🇦'}</td>
                    <td className="py-3 font-bold">{order.total} {order.market === 'eg' ? 'ج.م' : 'ر.س'}</td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[8px] font-semibold ${
                          order.status === 'new'
                            ? 'bg-[#fff1de] text-[#a16d3e]'
                            : order.status === 'confirmed'
                              ? 'bg-[#e7f1fb] text-[#4777a8]'
                              : 'bg-[#e4f6ec] text-[#347854]'
                        }`}
                      >
                        {order.status === 'new' ? (isArabic ? 'جديد' : 'New') : order.status === 'confirmed' ? (isArabic ? 'مؤكد' : 'Confirmed') : isArabic ? 'مكتمل' : 'Complete'}
                      </span>
                    </td>
                    <td className="py-3">
                      <select
                        className="rounded-lg border border-[#dfe8e2] bg-white px-2 py-1 text-[9px]"
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as CustomerOrder['status'])}
                        value={order.status}
                      >
                        <option value="new">{isArabic ? 'جديد' : 'New'}</option>
                        <option value="confirmed">{isArabic ? 'مؤكد' : 'Confirmed'}</option>
                        <option value="complete">{isArabic ? 'مكتمل' : 'Complete'}</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 7: Promo Codes Generator */}
      {activeTab === 'promos' && (
        <div className="rounded-3xl border border-white bg-white/85 p-6 shadow-sm">
          <h2 className="text-base font-bold text-[#2f4437]">
            {isArabic ? 'مولد كوبونات الخصم (Promo Codes Generator)' : 'Promo Code Generator'}
          </h2>
          <p className="text-[10px] text-[#788b80]">
            {isArabic ? 'أنشئ كوبونات تخفيض تُطبق تلقائياً على سلة المشتريات بالمتجر.' : 'Create coupon codes that apply instant percentage discounts at checkout.'}
          </p>

          <form
            className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4"
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              const code = String(form.get('code') ?? '').trim().toUpperCase();
              const discount = Number(form.get('discount'));
              const expiresAt = String(form.get('expiry') ?? '');

              if (!code || !discount || !expiresAt) return;
              setPromoCodes((prev) => [{ code, discount, expiresAt, active: true }, ...prev]);
              onToast(isArabic ? `تم تفعيل الكود ${code} بنسبة ${discount}%!` : `Code ${code} activated!`);
              e.currentTarget.reset();
            }}
          >
            <input className="h-10 rounded-xl border border-[#dfe8e2] px-3 text-xs uppercase" name="code" placeholder="ZEXOR20" required />
            <input className="h-10 rounded-xl border border-[#dfe8e2] px-3 text-xs" max="90" min="1" name="discount" placeholder="نسبة الخصم %" required type="number" />
            <input className="h-10 rounded-xl border border-[#dfe8e2] px-3 text-xs" min={new Date().toISOString().slice(0, 10)} name="expiry" required type="date" />
            <button className="h-10 rounded-xl bg-[#314f43] text-xs font-semibold text-white hover:bg-[#436e5d]" type="submit">
              {isArabic ? 'توليد الكوبون' : 'Generate Code'}
            </button>
          </form>

          <div className="mt-6 divide-y divide-[#edf1ee]">
            {promoCodes.map((p) => (
              <div className="flex items-center justify-between py-3" key={p.code}>
                <div>
                  <span className="font-mono text-sm font-bold text-[#294234]">{p.code}</span>
                  <span className="ms-2 rounded-full bg-[#e4f6ec] px-2.5 py-0.5 text-[9px] font-semibold text-[#387b57]">
                    {p.discount}% OFF
                  </span>
                  <p className="text-[9px] text-[#86968d]">{isArabic ? 'تاريخ الانتهاء:' : 'Expires:'} {p.expiresAt}</p>
                </div>
                <button
                  className="text-xs text-[#a46459] hover:text-[#c4493a]"
                  onClick={() => setPromoCodes((prev) => prev.filter((item) => item.code !== p.code))}
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 8: Hero & Telegram Automation Settings */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Section Visibility Toggles */}
          <div className="rounded-3xl border border-white bg-white/85 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-[#2f4437]">
              {isArabic ? 'إظهار وإخفاء أقسام الموقع (Section Visibility Toggles)' : 'Section Visibility Controls'}
            </h3>
            <p className="text-[10px] text-[#788b80]">
              {isArabic ? 'مفاتيح للتحكم الفوري في إظهار أو إخفاء أي قسم في الموقع والنافبار دون مسحه.' : 'Toggle sections on/off instantly without deleting content.'}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(['cards', 'fashion', 'services', 'cars', 'property', 'pricing', 'calculator', 'tracking', 'reviews', 'contact'] as const).map((sec) => (
                <label className="flex items-center justify-between rounded-2xl border border-[#dfe8e2] bg-[#fbfdfa] p-3 text-xs font-semibold text-[#3b5546]" key={sec}>
                  <span>{sec.toUpperCase()}</span>
                  <input
                    checked={settings.sectionVisibility[sec] ?? true}
                    className="h-4 w-4 accent-[#314f43]"
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        sectionVisibility: { ...prev.sectionVisibility, [sec]: e.target.checked },
                      }))
                    }
                    type="checkbox"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Telegram / Email Instant Notifications Automation */}
          <div className="rounded-3xl border border-[#c5e6d6] bg-linear-to-br from-[#f2faf5] to-white p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="h-5 w-5 text-[#357c5a]" />
                <h3 className="text-sm font-bold text-[#2c533f]">
                  {isArabic ? 'نظام إشعارات تليجرام التلقائي الفوري (Telegram Bot Automation)' : 'Instant Telegram Notification Automation'}
                </h3>
              </div>
              <button
                className="flex items-center gap-1.5 rounded-full bg-[#357c5a] px-3.5 py-1.5 text-[10px] font-semibold text-white shadow-xs hover:bg-[#286045]"
                onClick={handleTestTelegramNotification}
                type="button"
              >
                <Send className="h-3 w-3" />
                {isArabic ? 'إرسال إشعار تجريبي' : 'Send Test Notification'}
              </button>
            </div>
            <p className="mt-1 text-[10px] leading-5 text-[#5e7d6d]">
              {isArabic
                ? 'فور وصول طلب جديد أو رسالة من الموقع، يتم إرسال إشعار فوري بحسابك أو قناة الإدارة على تليجرام.'
                : 'Instantly notify admin on Telegram upon new orders or inquiries.'}
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-[10px] font-semibold text-[#486b59]">Telegram Bot Token</label>
                <input
                  className="mt-1 h-9 w-full rounded-xl border border-[#cce3d6] bg-white px-3 text-xs outline-none"
                  onChange={(e) => setSettings((prev) => ({ ...prev, telegramBotToken: e.target.value }))}
                  placeholder="e.g. 123456789:ABCdefGhIJKlmNoPQRstuVWXyz"
                  value={settings.telegramBotToken}
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-[#486b59]">Telegram Chat ID</label>
                <input
                  className="mt-1 h-9 w-full rounded-xl border border-[#cce3d6] bg-white px-3 text-xs outline-none"
                  onChange={(e) => setSettings((prev) => ({ ...prev, telegramChatId: e.target.value }))}
                  placeholder="e.g. 987654321"
                  value={settings.telegramChatId}
                />
              </div>
            </div>
          </div>

          {/* Hero, Announcement & Contact Settings — full EN + AR editing */}
          <div className="rounded-3xl border border-white bg-white/85 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-[#2f4437]">
                  {isArabic ? 'محرر الواجهة والإعلان وأرقام التواصل' : 'Hero, Announcement & Contact Editor'}
                </h3>
                <p className="text-[10px] text-[#788b80]">
                  {isArabic
                    ? 'عدّل نصوص الواجهة بالإنجليزية والعربية، وشريط الإعلان، وبيانات التواصل — بدون أي تعديل في الكود.'
                    : 'Edit hero copy in both languages, the announcement bar, and contact details — no code changes.'}
                </p>
              </div>
              <div className="flex rounded-full border border-[#dfe8e2] bg-[#fbfdfa] p-1">
                {(['ar', 'en'] as const).map((lng) => (
                  <button
                    className={`rounded-full px-3.5 py-1.5 text-[10px] font-bold transition-colors ${
                      heroLang === lng ? 'bg-[#314f43] text-white' : 'text-[#5e7d6d]'
                    }`}
                    key={lng}
                    onClick={() => setHeroLang(lng)}
                    type="button"
                  >
                    {lng === 'ar' ? 'العربية' : 'English'}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-[10px] text-[#607368]">
                  {isArabic ? 'العنوان الرئيسي' : 'Hero Title'}
                </label>
                <input
                  className="mt-1 h-9 w-full rounded-xl border border-[#dfe8e2] px-3 text-xs outline-none"
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      heroTitle: { ...prev.heroTitle, [heroLang]: e.target.value },
                    }))
                  }
                  value={settings.heroTitle[heroLang]}
                />
              </div>
              <div>
                <label className="text-[10px] text-[#607368]">
                  {isArabic ? 'الجزء المميز (بخط مائل)' : 'Hero Accent (italic part)'}
                </label>
                <input
                  className="mt-1 h-9 w-full rounded-xl border border-[#dfe8e2] px-3 text-xs outline-none"
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      heroAccent: { ...prev.heroAccent, [heroLang]: e.target.value },
                    }))
                  }
                  value={settings.heroAccent[heroLang]}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] text-[#607368]">
                  {isArabic ? 'نص الوصف في الواجهة' : 'Hero Supporting Text'}
                </label>
                <textarea
                  className="mt-1 w-full rounded-xl border border-[#dfe8e2] px-3 py-2 text-xs outline-none"
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      heroText: { ...prev.heroText, [heroLang]: e.target.value },
                    }))
                  }
                  rows={3}
                  value={settings.heroText[heroLang]}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="flex items-center justify-between rounded-2xl border border-[#dfe8e2] bg-[#fbfdfa] p-3 text-xs font-semibold text-[#3b5546]">
                  <span>{isArabic ? 'إظهار شريط الإعلان العلوي' : 'Show top announcement bar'}</span>
                  <input
                    checked={settings.announcementActive}
                    className="h-4 w-4 accent-[#314f43]"
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, announcementActive: e.target.checked }))
                    }
                    type="checkbox"
                  />
                </label>
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] text-[#607368]">
                  {isArabic ? 'نص شريط الإعلان' : 'Announcement Text'}
                </label>
                <input
                  className="mt-1 h-9 w-full rounded-xl border border-[#dfe8e2] px-3 text-xs outline-none"
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      announcementText: { ...prev.announcementText, [heroLang]: e.target.value },
                    }))
                  }
                  value={settings.announcementText[heroLang]}
                />
              </div>

              <div>
                <label className="text-[10px] text-[#607368]">{isArabic ? 'رقم واتساب مصر' : 'WhatsApp Egypt'}</label>
                <input
                  className="mt-1 h-9 w-full rounded-xl border border-[#dfe8e2] px-3 text-xs outline-none"
                  onChange={(e) => setSettings((prev) => ({ ...prev, whatsappEg: e.target.value }))}
                  value={settings.whatsappEg}
                />
              </div>
              <div>
                <label className="text-[10px] text-[#607368]">{isArabic ? 'رقم واتساب السعودية' : 'WhatsApp Saudi Arabia'}</label>
                <input
                  className="mt-1 h-9 w-full rounded-xl border border-[#dfe8e2] px-3 text-xs outline-none"
                  onChange={(e) => setSettings((prev) => ({ ...prev, whatsappKsa: e.target.value }))}
                  value={settings.whatsappKsa}
                />
              </div>
              <div>
                <label className="text-[10px] text-[#607368]">{isArabic ? 'بريد الدعم' : 'Support Email'}</label>
                <input
                  className="mt-1 h-9 w-full rounded-xl border border-[#dfe8e2] px-3 text-xs outline-none"
                  onChange={(e) => setSettings((prev) => ({ ...prev, supportEmail: e.target.value }))}
                  value={settings.supportEmail}
                />
              </div>
              <div>
                <label className="text-[10px] text-[#607368]">{isArabic ? 'معرّف تليجرام' : 'Telegram Username'}</label>
                <input
                  className="mt-1 h-9 w-full rounded-xl border border-[#dfe8e2] px-3 text-xs outline-none"
                  onChange={(e) => setSettings((prev) => ({ ...prev, telegramUsername: e.target.value }))}
                  value={settings.telegramUsername}
                />
              </div>
            </div>
            <button
              className="mt-6 flex min-h-10 items-center gap-1.5 rounded-full bg-[#314f43] px-5 text-xs font-semibold text-white hover:bg-[#436e5d]"
              onClick={() => onToast(isArabic ? 'تم حفظ كافة الإعدادات بنجاح!' : 'Settings saved!')}
              type="button"
            >
              <Check className="h-4 w-4" />
              {isArabic ? 'حفظ كافة التغييرات' : 'Save Changes'}
            </button>
          </div>

          {/* Backup & Data Maintenance */}
          <div className="rounded-3xl border border-white bg-white/85 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-[#2f4437]">
              {isArabic ? 'النسخ الاحتياطي وصيانة البيانات' : 'Backup & Data Maintenance'}
            </h3>
            <p className="text-[10px] leading-5 text-[#788b80]">
              {isArabic
                ? 'نزّل نسخة كاملة من بياناتك (منتجات، سيارات، عقارات، طلبات) قبل أي تغيير كبير.'
                : 'Download a full copy of your data (products, cars, properties, orders) before big changes.'}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                className="flex min-h-10 items-center gap-1.5 rounded-full border border-[#cfe3d8] bg-white px-5 text-xs font-semibold text-[#2f5b45] hover:bg-[#f2faf5]"
                onClick={handleExportData}
                type="button"
              >
                <Download className="h-4 w-4" />
                {isArabic ? 'تنزيل نسخة احتياطية' : 'Download Backup'}
              </button>
              <button
                className="flex min-h-10 items-center gap-1.5 rounded-full border border-[#f0d4cd] bg-white px-5 text-xs font-semibold text-[#a8503f] hover:bg-[#fdf4f1]"
                onClick={handleResetContent}
                type="button"
              >
                <Trash2 className="h-4 w-4" />
                {isArabic ? 'تفريغ بيانات المحتوى' : 'Reset Content Data'}
              </button>
            </div>
            <p className="mt-3 text-[10px] leading-5 text-[#9aa8a0]">
              {isArabic
                ? 'لتغيير كلمة مرور لوحة التحكم: أنشئ ملف .env في جذر المشروع واكتب VITE_ADMIN_PASSWORD=كلمة_السر_الجديدة ثم أعد التشغيل.'
                : 'To change the admin password: create a .env file at the project root with VITE_ADMIN_PASSWORD=your-new-password, then restart.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
