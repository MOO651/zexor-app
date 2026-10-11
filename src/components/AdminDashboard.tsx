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
  Inbox,
  Layers,
  LockKeyhole,
  LogOut,
  Palette,
  Pencil,
  Plus,
  Search,
  Send,
  Settings,
  ShoppingBag,
  Tag,
  Trash2,
  Type,
  UploadCloud,
  X,
} from 'lucide-react';
import { art } from '../data/imagery';
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
  setInbox: React.Dispatch<React.SetStateAction<PlatformInquiry[]>>;
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
  setInbox,
  promoCodes,
  setPromoCodes,
  settings,
  setSettings,
  onLock,
  onToast,
}: Props) {
  const isArabic = locale === 'ar';
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'categories'
    | 'products'
    | 'cars'
    | 'properties'
    | 'orders'
    | 'inbox'
    | 'promos'
    | 'design'
    | 'content'
    | 'settings'
  >('overview');

  // Hero / contact editor: which locale column is being edited
  const [heroLang, setHeroLang] = useState<Locale>(locale);

  // Backup restore picker — a hidden file input opened by the "Restore" button.
  const importInputRef = useRef<HTMLInputElement>(null);

  // Search & Filter in Admin
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'new' | 'confirmed' | 'complete'>('all');
  // Free-text filter for the products table (matches Arabic or English names).
  const [productSearch, setProductSearch] = useState('');
  // Shared filter for the vehicle and property listings.
  const [inventorySearch, setInventorySearch] = useState('');

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

  // Add / Edit Car Modal State — every field is editable and bilingual so the
  // admin can create AND correct a listing without touching code.
  const [showCarModal, setShowCarModal] = useState(false);
  const [editingCarId, setEditingCarId] = useState<string | null>(null);
  const [carTitleAr, setCarTitleAr] = useState('');
  const [carTitleEn, setCarTitleEn] = useState('');
  const [carMake, setCarMake] = useState('Mercedes-Benz');
  const [carYear, setCarYear] = useState('2024');
  const [carPrice, setCarPrice] = useState('');
  const [carLocation, setCarLocation] = useState('Cairo');
  const [carCondition, setCarCondition] = useState<'New' | 'Used'>('Used');
  const [carPhoto, setCarPhoto] = useState('');
  const carFileInputRef = useRef<HTMLInputElement>(null);

  // Add / Edit Property Modal State
  const [showPropModal, setShowPropModal] = useState(false);
  const [editingPropId, setEditingPropId] = useState<string | null>(null);
  const [propTitleAr, setPropTitleAr] = useState('');
  const [propTitleEn, setPropTitleEn] = useState('');
  const [propType, setPropType] = useState<'Apartment' | 'Villa' | 'Land' | 'Shop'>('Apartment');
  const [propDeal, setPropDeal] = useState<'Sale' | 'Rent'>('Sale');
  const [propPrice, setPropPrice] = useState('');
  const [propArea, setPropArea] = useState('150');
  const [propRooms, setPropRooms] = useState('3');
  const [propLocation, setPropLocation] = useState('Cairo');
  const [propPhoto, setPropPhoto] = useState('');
  const propFileInputRef = useRef<HTMLInputElement>(null);

  // Reads a picked image file as a data-URL and hands it to the setter. Shared
  // by the product, vehicle and property forms so uploads behave identically.
  const readImageFile = (file: File, onLoaded: (dataUrl: string) => void) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onLoaded(reader.result);
        onToast(isArabic ? 'تم رفع ومعالجة الصورة بنجاح!' : 'Image uploaded & ready!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) readImageFile(file, setProdImageUrl);
  };

  const handleCarImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) readImageFile(file, setCarPhoto);
  };

  const handlePropImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) readImageFile(file, setPropPhoto);
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
      imageUrl: prodImageUrl || art.cardsElite,
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

  // Save / Update Car — creates a new listing, or updates the one being edited.
  const handleSaveCar = (e: React.FormEvent) => {
    e.preventDefault();
    const id = editingCarId ?? `ZX-CAR-${Date.now().toString().slice(-4)}`;
    const existing = vehicles.find((v) => v.id === id);
    const photo = carPhoto || existing?.photo || '/images/demo-sedan.svg';

    const car: Vehicle = {
      id,
      title: { ar: carTitleAr.trim() || 'سيارة جديدة', en: carTitleEn.trim() || 'New Vehicle' },
      location: { ar: carLocation, en: carLocation },
      price: Number(carPrice) || existing?.price || 1000000,
      area: existing?.area ?? 0,
      region: (carLocation as Vehicle['region']) || 'Cairo',
      photo,
      gallery: existing?.gallery?.length ? existing.gallery : [photo],
      make: carMake,
      year: Number(carYear) || 2024,
      mileage: carCondition === 'New' ? 0 : existing?.mileage || 15000,
      transmission: existing?.transmission ?? 'Automatic',
      condition: carCondition,
      body: existing?.body ?? 'Sedan',
      fuel: existing?.fuel ?? 'Petrol',
    };

    if (editingCarId) {
      setVehicles((prev) => prev.map((v) => (v.id === editingCarId ? car : v)));
      onToast(isArabic ? 'تم تحديث بيانات السيارة!' : 'Vehicle updated!');
    } else {
      setVehicles((prev) => [car, ...prev]);
      onToast(isArabic ? 'تمت إضافة السيارة إلى المعرض بنجاح!' : 'Vehicle added to showroom!');
    }
    setEditingCarId(null);
    setShowCarModal(false);
  };

  // Loads a vehicle into the modal for editing.
  const startEditCar = (v: Vehicle) => {
    setEditingCarId(v.id);
    setCarTitleAr(v.title.ar);
    setCarTitleEn(v.title.en);
    setCarMake(v.make);
    setCarYear(String(v.year));
    setCarPrice(String(v.price));
    setCarLocation(v.region);
    setCarCondition(v.condition);
    setCarPhoto(v.photo);
    setShowCarModal(true);
  };

  const handleDeleteCar = (id: string) => {
    if (window.confirm(isArabic ? 'حذف هذه السيارة؟' : 'Delete this vehicle?')) {
      setVehicles((prev) => prev.filter((v) => v.id !== id));
      onToast(isArabic ? 'تم حذف السيارة' : 'Vehicle deleted');
    }
  };

  // Save / Update Property.
  const handleSaveProperty = (e: React.FormEvent) => {
    e.preventDefault();
    const id = editingPropId ?? `ZX-PROP-${Date.now().toString().slice(-4)}`;
    const existing = properties.find((p) => p.id === id);
    const fallbackPhoto =
      propType === 'Villa' ? '/images/demo-villa.svg' : propType === 'Land' ? '/images/demo-land.svg' : '/images/demo-apartment.svg';
    const photo = propPhoto || existing?.photo || fallbackPhoto;

    const prop: Property = {
      id,
      title: { ar: propTitleAr.trim() || 'عقار جديد', en: propTitleEn.trim() || 'New Property' },
      location: { ar: propLocation, en: propLocation },
      price: Number(propPrice) || existing?.price || 2500000,
      area: Number(propArea) || 150,
      region: (propLocation as Property['region']) || 'Cairo',
      photo,
      gallery: existing?.gallery?.length ? existing.gallery : [photo],
      type: propType,
      deal: propDeal,
      rooms: Number(propRooms) || 3,
      floor: existing?.floor ?? 2,
      bathrooms: existing?.bathrooms ?? 2,
      featured: existing?.featured,
    };

    if (editingPropId) {
      setProperties((prev) => prev.map((p) => (p.id === editingPropId ? prop : p)));
      onToast(isArabic ? 'تم تحديث بيانات العقار!' : 'Property updated!');
    } else {
      setProperties((prev) => [prop, ...prev]);
      onToast(isArabic ? 'تمت إضافة العقار بنجاح!' : 'Property added successfully!');
    }
    setEditingPropId(null);
    setShowPropModal(false);
  };

  // Loads a property into the modal for editing.
  const startEditProperty = (p: Property) => {
    setEditingPropId(p.id);
    setPropTitleAr(p.title.ar);
    setPropTitleEn(p.title.en);
    setPropType(p.type);
    setPropDeal(p.deal);
    setPropPrice(String(p.price));
    setPropArea(String(p.area));
    setPropRooms(String(p.rooms));
    setPropLocation(p.region);
    setPropPhoto(p.photo);
    setShowPropModal(true);
  };

  const handleDeleteProperty = (id: string) => {
    if (window.confirm(isArabic ? 'حذف هذا العقار؟' : 'Delete this property?')) {
      setProperties((prev) => prev.filter((p) => p.id !== id));
      onToast(isArabic ? 'تم حذف العقار' : 'Property deleted');
    }
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

  // Import a previously exported JSON backup. We validate the shape loosely so a
  // stray file (e.g. an image) can't wipe the live state.
  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('invalid');
      }
      // Each store is optional, and only applied when the backup really carries
      // an array — restoring one section never silently wipes another.
      if (Array.isArray(parsed.products)) setProducts(parsed.products as Product[]);
      if (Array.isArray(parsed.categories)) setCategories(parsed.categories as DynamicCategory[]);
      if (Array.isArray(parsed.vehicles)) setVehicles(parsed.vehicles as Vehicle[]);
      if (Array.isArray(parsed.properties)) setProperties(parsed.properties as Property[]);
      if (Array.isArray(parsed.orders)) setOrders(parsed.orders as CustomerOrder[]);
      if (Array.isArray(parsed.promoCodes)) setPromoCodes(parsed.promoCodes as PromoCode[]);
      if (parsed.settings && typeof parsed.settings === 'object') setSettings(parsed.settings as SiteSettings);
      onToast(isArabic ? 'تم استيراد النسخة الاحتياطية بنجاح!' : 'Backup restored successfully!');
    } catch {
      onToast(isArabic ? 'ملف غير صالح، تأكد أنه نسخة ZEXOR بصيغة JSON.' : 'Invalid file — please select a ZEXOR JSON backup.');
    } finally {
      if (importInputRef.current) importInputRef.current.value = '';
    }
  };

  // Wipes store content back to a blank slate (keeps the admin's hero/telegram settings).
  const handleResetContent = () => {
    const confirmed = window.confirm(
      isArabic ? 'هل تريد تفريغ المنتجات والأقسام والطلبات؟ لا يمكن التراجع.' : 'Clear all products, categories and orders? This cannot be undone.'
    );
    if (!confirmed) return;
    setProducts([]);
    setCategories([]);
    setOrders([]);
    onToast(isArabic ? 'تم تفريغ المحتوى.' : 'All content cleared.');
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
  // Inquiries still needing follow-up (anything not closed).
  const openInquiriesCount = inbox.filter((i) => i.status !== 'complete').length;

  const handleUpdateInquiryStatus = (id: string, status: PlatformInquiry['status']) => {
    setInbox((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    onToast(isArabic ? 'تم تحديث حالة الاستفسار' : 'Inquiry status updated');
  };

  const handleDeleteInquiry = (id: string) => {
    if (window.confirm(isArabic ? 'حذف هذا الاستفسار؟' : 'Delete this inquiry?')) {
      setInbox((prev) => prev.filter((i) => i.id !== id));
      onToast(isArabic ? 'تم حذف الاستفسار' : 'Inquiry deleted');
    }
  };

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
            {isArabic ? 'تصدير نسخة احتياطية' : 'Export Backup'}
          </button>
          <button
            className="flex items-center gap-1.5 rounded-full border border-[#d6e3db] bg-white px-3.5 py-2 text-xs font-semibold text-[#3b5949] shadow-xs hover:bg-[#edf5f0]"
            onClick={() => importInputRef.current?.click()}
            type="button"
          >
            <UploadCloud className="h-3.5 w-3.5" />
            {isArabic ? 'استيراد نسخة' : 'Restore Backup'}
          </button>
          <input
            accept="application/json,.json"
            className="hidden"
            onChange={handleImportData}
            ref={importInputRef}
            type="file"
          />
          <button
            className="flex items-center gap-1.5 rounded-full border border-[#f0d9d3] bg-white px-3.5 py-2 text-xs font-semibold text-[#a5574c] shadow-xs hover:bg-[#fdf4f2]"
            onClick={handleResetContent}
            type="button"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {isArabic ? 'تفريغ المحتوى' : 'Clear Content'}
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
          { id: 'inbox', label: isArabic ? `الاستفسارات (${openInquiriesCount})` : `Inquiries (${openInquiriesCount})`, icon: Inbox },
          { id: 'promos', label: isArabic ? 'أكواد الخصم' : 'Promo Codes', icon: Tag },
          { id: 'design', label: isArabic ? 'التصميم والهوية' : 'Design & Brand', icon: Palette },
          { id: 'content', label: isArabic ? 'نصوص الموقع' : 'Site Content', icon: Type },
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

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-48">
              <Search className="pointer-events-none absolute inset-s-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8a9a90]" />
              <input
                className="h-10 w-full rounded-full border border-[#dfe7e1] ps-9 pe-3 text-xs outline-none focus:border-[#7fb59a]"
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder={isArabic ? 'ابحث بالاسم أو التصنيف…' : 'Search by name or category…'}
                type="search"
                value={productSearch}
              />
            </div>
          </div>

          <div className="mt-4 divide-y divide-[#edf1ee]">
            {products
              .filter((prod) => {
                const q = productSearch.trim().toLowerCase();
                if (!q) return true;
                return (
                  prod.name.ar.toLowerCase().includes(q) ||
                  prod.name.en.toLowerCase().includes(q) ||
                  prod.category.toLowerCase().includes(q)
                );
              })
              .map((prod) => (
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
              onClick={() => {
                setEditingCarId(null);
                setCarTitleAr('');
                setCarTitleEn('');
                setCarMake('Mercedes-Benz');
                setCarYear('2024');
                setCarPrice('');
                setCarLocation('Cairo');
                setCarCondition('Used');
                setCarPhoto('');
                setShowCarModal(true);
              }}
              type="button"
            >
              <Plus className="h-3.5 w-3.5" />
              {isArabic ? 'إضافة سيارة جديدة' : 'Add Vehicle'}
            </button>
          </div>

          {/* Shared inventory filter — matches the Arabic/English title, the
              make (cars) and the id, so any listing is one query away. */}
          <div className="relative mt-4">
            <Search className="pointer-events-none absolute inset-s-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8a9a90]" />
            <input
              className="h-10 w-full rounded-full border border-[#dfe7e1] ps-9 pe-3 text-xs outline-none focus:border-[#7fb59a]"
              onChange={(e) => setInventorySearch(e.target.value)}
              placeholder={isArabic ? 'ابحث بالموديل أو الماركة أو رقم العرض…' : 'Search by model, make or listing id…'}
              type="search"
              value={inventorySearch}
            />
          </div>

          <div className="mt-4 divide-y divide-[#edf1ee]">
            {vehicles
              .filter((v) => {
                const q = inventorySearch.trim().toLowerCase();
                if (!q) return true;
                return `${v.title.ar} ${v.title.en} ${v.make} ${v.id}`.toLowerCase().includes(q);
              })
              .map((v) => (
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
                <div className="flex items-center gap-2">
                  <button
                    aria-label={isArabic ? 'تعديل' : 'Edit'}
                    className="p-2 text-[#517663] hover:text-[#2d4b3b]"
                    onClick={() => startEditCar(v)}
                    type="button"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    aria-label={isArabic ? 'حذف' : 'Delete'}
                    className="p-2 text-[#b06155] hover:text-[#d04535]"
                    onClick={() => handleDeleteCar(v.id)}
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add / Edit Car Modal */}
          {showCarModal && (
            <div className="fixed inset-0 z-110 flex items-center justify-center bg-black/40 p-4">
              <form className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl" onSubmit={handleSaveCar}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#2e4337]">
                    {editingCarId ? (isArabic ? 'تعديل السيارة' : 'Edit Vehicle') : isArabic ? 'إضافة سيارة جديدة' : 'Add Vehicle'}
                  </h3>
                  <button onClick={() => setShowCarModal(false)} type="button">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-[10px] text-[#5e7166]">{isArabic ? 'اسم الموديل (عربي)' : 'Model (Arabic)'}</label>
                    <input className="mt-1 h-9 w-full rounded-xl border border-[#dfe7e1] px-3 text-xs outline-none" onChange={(e) => setCarTitleAr(e.target.value)} required value={carTitleAr} />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#5e7166]">{isArabic ? 'اسم الموديل (إنجليزي)' : 'Model (English)'}</label>
                    <input className="mt-1 h-9 w-full rounded-xl border border-[#dfe7e1] px-3 text-xs outline-none" onChange={(e) => setCarTitleEn(e.target.value)} value={carTitleEn} />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#5e7166]">{isArabic ? 'الماركة' : 'Make'}</label>
                    <input className="mt-1 h-9 w-full rounded-xl border border-[#dfe7e1] px-3 text-xs outline-none" onChange={(e) => setCarMake(e.target.value)} value={carMake} />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#5e7166]">{isArabic ? 'سنة الصنع' : 'Year'}</label>
                    <input className="mt-1 h-9 w-full rounded-xl border border-[#dfe7e1] px-3 text-xs outline-none" onChange={(e) => setCarYear(e.target.value)} type="number" value={carYear} />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#5e7166]">{isArabic ? 'السعر (ج.م / ر.س)' : 'Price (EGP / SAR)'}</label>
                    <input className="mt-1 h-9 w-full rounded-xl border border-[#dfe7e1] px-3 text-xs outline-none" onChange={(e) => setCarPrice(e.target.value)} required type="number" value={carPrice} />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#5e7166]">{isArabic ? 'المدينة' : 'City'}</label>
                    <select className="mt-1 h-9 w-full rounded-xl border border-[#dfe7e1] px-3 text-xs outline-none" onChange={(e) => setCarLocation(e.target.value)} value={carLocation}>
                      {(['Cairo', 'Giza', 'Alexandria', 'Riyadh', 'Jeddah'] as const).map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-[#5e7166]">{isArabic ? 'الحالة' : 'Condition'}</label>
                    <select className="mt-1 h-9 w-full rounded-xl border border-[#dfe7e1] px-3 text-xs outline-none" onChange={(e) => setCarCondition(e.target.value as 'New' | 'Used')} value={carCondition}>
                      <option value="New">{isArabic ? 'جديد (زيرو)' : 'Brand New'}</option>
                      <option value="Used">{isArabic ? 'مستعمل فاخر' : 'Certified Used'}</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-[#5e7166]">{isArabic ? 'صورة السيارة' : 'Vehicle Photo'}</label>
                    <div className="mt-1 flex items-center gap-2">
                      <input accept="image/*" className="hidden" onChange={handleCarImageUpload} ref={carFileInputRef} type="file" />
                      <button
                        className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#d6e4dc] bg-[#f4f9f6] text-[10px] font-semibold text-[#3a634e] hover:bg-[#eaf5ef]"
                        onClick={() => carFileInputRef.current?.click()}
                        type="button"
                      >
                        <UploadCloud className="h-3.5 w-3.5" />
                        {isArabic ? 'اختر صورة من جهازك' : 'Upload from Device'}
                      </button>
                      {carPhoto && <img alt="" className="h-9 w-12 rounded-lg object-cover" src={carPhoto} />}
                    </div>
                  </div>
                </div>
                <button className="mt-5 min-h-10 w-full rounded-full bg-[#314f43] text-xs font-semibold text-white hover:bg-[#436e5d]" type="submit">
                  {editingCarId ? (isArabic ? 'حفظ التعديلات' : 'Save Changes') : isArabic ? 'حفظ وإضافة للمعرض' : 'Save Vehicle'}
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
              onClick={() => {
                setEditingPropId(null);
                setPropTitleAr('');
                setPropTitleEn('');
                setPropType('Apartment');
                setPropDeal('Sale');
                setPropPrice('');
                setPropArea('150');
                setPropRooms('3');
                setPropLocation('Cairo');
                setPropPhoto('');
                setShowPropModal(true);
              }}
              type="button"
            >
              <Plus className="h-3.5 w-3.5" />
              {isArabic ? 'إضافة عقار جديد' : 'Add Property'}
            </button>
          </div>

          <div className="relative mt-4">
            <Search className="pointer-events-none absolute inset-s-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8a9a90]" />
            <input
              className="h-10 w-full rounded-full border border-[#dfe7e1] ps-9 pe-3 text-xs outline-none focus:border-[#7fb59a]"
              onChange={(e) => setInventorySearch(e.target.value)}
              placeholder={isArabic ? 'ابحث بالعنوان أو النوع أو رقم العرض…' : 'Search by title, type or listing id…'}
              type="search"
              value={inventorySearch}
            />
          </div>

          <div className="mt-4 divide-y divide-[#edf1ee]">
            {properties
              .filter((p) => {
                const q = inventorySearch.trim().toLowerCase();
                if (!q) return true;
                return `${p.title.ar} ${p.title.en} ${p.type} ${p.deal} ${p.id}`.toLowerCase().includes(q);
              })
              .map((p) => (
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
                <div className="flex items-center gap-2">
                  <button
                    aria-label={isArabic ? 'تعديل' : 'Edit'}
                    className="p-2 text-[#517663] hover:text-[#2d4b3b]"
                    onClick={() => startEditProperty(p)}
                    type="button"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    aria-label={isArabic ? 'حذف' : 'Delete'}
                    className="p-2 text-[#b06155] hover:text-[#d04535]"
                    onClick={() => handleDeleteProperty(p.id)}
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add / Edit Property Modal */}
          {showPropModal && (
            <div className="fixed inset-0 z-110 flex items-center justify-center bg-black/40 p-4">
              <form className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl" onSubmit={handleSaveProperty}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#2e4337]">
                    {editingPropId ? (isArabic ? 'تعديل العقار' : 'Edit Property') : isArabic ? 'إضافة عقار جديد' : 'Add Property'}
                  </h3>
                  <button onClick={() => setShowPropModal(false)} type="button">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-[10px] text-[#5e7166]">{isArabic ? 'عنوان العقار (عربي)' : 'Title (Arabic)'}</label>
                    <input className="mt-1 h-9 w-full rounded-xl border border-[#dfe7e1] px-3 text-xs outline-none" onChange={(e) => setPropTitleAr(e.target.value)} required value={propTitleAr} />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#5e7166]">{isArabic ? 'عنوان العقار (إنجليزي)' : 'Title (English)'}</label>
                    <input className="mt-1 h-9 w-full rounded-xl border border-[#dfe7e1] px-3 text-xs outline-none" onChange={(e) => setPropTitleEn(e.target.value)} value={propTitleEn} />
                  </div>
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
                  <div>
                    <label className="text-[10px] text-[#5e7166]">{isArabic ? 'السعر' : 'Price'}</label>
                    <input className="mt-1 h-9 w-full rounded-xl border border-[#dfe7e1] px-3 text-xs outline-none" onChange={(e) => setPropPrice(e.target.value)} required type="number" value={propPrice} />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#5e7166]">{isArabic ? 'المدينة' : 'City'}</label>
                    <select className="mt-1 h-9 w-full rounded-xl border border-[#dfe7e1] px-3 text-xs outline-none" onChange={(e) => setPropLocation(e.target.value)} value={propLocation}>
                      {(['Cairo', 'Giza', 'Alexandria', 'Riyadh', 'Jeddah'] as const).map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-[#5e7166]">{isArabic ? 'المساحة م²' : 'Area m²'}</label>
                    <input className="mt-1 h-9 w-full rounded-xl border border-[#dfe7e1] px-3 text-xs outline-none" onChange={(e) => setPropArea(e.target.value)} type="number" value={propArea} />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#5e7166]">{isArabic ? 'عدد الغرف' : 'Bedrooms'}</label>
                    <input className="mt-1 h-9 w-full rounded-xl border border-[#dfe7e1] px-3 text-xs outline-none" onChange={(e) => setPropRooms(e.target.value)} type="number" value={propRooms} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-[#5e7166]">{isArabic ? 'صورة العقار' : 'Property Photo'}</label>
                    <div className="mt-1 flex items-center gap-2">
                      <input accept="image/*" className="hidden" onChange={handlePropImageUpload} ref={propFileInputRef} type="file" />
                      <button
                        className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#d6e4dc] bg-[#f4f9f6] text-[10px] font-semibold text-[#3a634e] hover:bg-[#eaf5ef]"
                        onClick={() => propFileInputRef.current?.click()}
                        type="button"
                      >
                        <UploadCloud className="h-3.5 w-3.5" />
                        {isArabic ? 'اختر صورة من جهازك' : 'Upload from Device'}
                      </button>
                      {propPhoto && <img alt="" className="h-9 w-12 rounded-lg object-cover" src={propPhoto} />}
                    </div>
                  </div>
                </div>
                <button className="mt-5 min-h-10 w-full rounded-full bg-[#314f43] text-xs font-semibold text-white hover:bg-[#436e5d]" type="submit">
                  {editingPropId ? (isArabic ? 'حفظ التعديلات' : 'Save Changes') : isArabic ? 'حفظ العقار' : 'Save Property'}
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

      {/* Tab 6b: Inbox — every contact / car / property / NFC inquiry, with
          status workflow and direct call/WhatsApp actions. */}
      {activeTab === 'inbox' && (
        <div className="rounded-3xl border border-white bg-white/85 p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-base font-bold text-[#2f4437]">
                {isArabic ? 'صندوق الاستفسارات والمعاينات' : 'Inquiries & Viewing Requests'}
              </h2>
              <p className="text-[10px] text-[#788b80]">
                {isArabic
                  ? 'كل رسالة من نموذج التواصل أو طلب معاينة سيارة/عقار أو تخصيص كارت NFC تصل هنا فوراً.'
                  : 'Every contact-form message, vehicle/property viewing request and NFC enquiry lands here.'}
              </p>
            </div>
            {inbox.length > 0 && (
              <button
                className="flex items-center gap-1.5 rounded-full border border-[#d6e3db] bg-white px-3.5 py-2 text-xs font-semibold text-[#3b5949] hover:bg-[#edf5f0]"
                onClick={() => {
                  if (window.confirm(isArabic ? 'مسح كل الاستفسارات؟' : 'Clear all inquiries?')) {
                    setInbox([]);
                    onToast(isArabic ? 'تم مسح الاستفسارات' : 'Inquiries cleared');
                  }
                }}
                type="button"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {isArabic ? 'مسح الكل' : 'Clear All'}
              </button>
            )}
          </div>

          {inbox.length === 0 ? (
            <p className="py-12 text-center text-xs text-[#829288]">
              {isArabic ? 'لا توجد استفسارات بعد.' : 'No inquiries yet.'}
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {inbox.map((inq) => (
                <div className="rounded-2xl border border-[#e7efe9] bg-[#fbfdfa] p-4" key={inq.id}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-[#e7f4ed] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#35614a]">
                          {inq.type}
                        </span>
                        <h4 className="text-xs font-bold text-[#2d4236]">{inq.title}</h4>
                      </div>
                      <p className="mt-1 text-[10px] text-[#697d72]">
                        {inq.name} · {inq.phone} · {inq.city} {inq.market === 'eg' ? '🇪🇬' : '🇸🇦'}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[9px] font-semibold ${
                        inq.status === 'new'
                          ? 'bg-[#fff1de] text-[#a16d3e]'
                          : inq.status === 'in-progress'
                            ? 'bg-[#e7f1fb] text-[#4777a8]'
                            : 'bg-[#e4f6ec] text-[#347854]'
                      }`}
                    >
                      {inq.status === 'new' ? (isArabic ? 'جديد' : 'New') : inq.status === 'in-progress' ? (isArabic ? 'قيد المتابعة' : 'In progress') : isArabic ? 'منتهي' : 'Complete'}
                    </span>
                  </div>

                  {inq.message && (
                    <p className="mt-3 text-[11px] leading-5 text-[#4d6157]">{inq.message}</p>
                  )}
                  {inq.budget && (
                    <p className="mt-1 text-[10px] text-[#7a8d83]">{isArabic ? 'الميزانية:' : 'Budget:'} {inq.budget}</p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <select
                      className="rounded-lg border border-[#dfe8e2] bg-white px-2 py-1 text-[10px] outline-none"
                      onChange={(e) => handleUpdateInquiryStatus(inq.id, e.target.value as PlatformInquiry['status'])}
                      value={inq.status}
                    >
                      <option value="new">{isArabic ? 'جديد' : 'New'}</option>
                      <option value="in-progress">{isArabic ? 'قيد المتابعة' : 'In progress'}</option>
                      <option value="complete">{isArabic ? 'منتهي' : 'Complete'}</option>
                    </select>
                    <a
                      className="flex items-center gap-1 rounded-full bg-[#25855a] px-3 py-1 text-[10px] font-semibold text-white hover:bg-[#1d734c]"
                      href={`https://wa.me/${inq.phone.replace(/\D/g, '')}`}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <Send className="h-3 w-3" />
                      {isArabic ? 'واتساب' : 'WhatsApp'}
                    </a>
                    <button
                      className="flex items-center gap-1 rounded-full border border-[#f0d4cd] px-3 py-1 text-[10px] font-semibold text-[#a8503f] hover:bg-[#fdf4f1]"
                      onClick={() => handleDeleteInquiry(inq.id)}
                      type="button"
                    >
                      <Trash2 className="h-3 w-3" />
                      {isArabic ? 'حذف' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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

      {/* Tab: Design & Brand — live brand tokens (colours, radius, font scale).
          These are written onto <html> as CSS variables by the storefront, so a
          change here restyles the whole site instantly. */}
      {activeTab === 'design' && (
        <div className="rounded-3xl border border-white bg-white/85 p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-base font-bold text-[#2f4437]">
            <Palette className="h-4 w-4 text-[#4e8e6f]" />
            {isArabic ? 'التصميم والهوية البصرية' : 'Design & Brand Identity'}
          </h2>
          <p className="text-[10px] text-[#788b80]">
            {isArabic
              ? 'غيّر ألوان العلامة ونصف القطر وحجم الخط وشاهد النتيجة على الموقع مباشرة.'
              : 'Change brand colours, corner radius and font scale — applied live across the site.'}
          </p>

          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            {([
              { key: 'primary' as const, labelAr: 'اللون الأساسي', labelEn: 'Primary colour' },
              { key: 'accent' as const, labelAr: 'اللون الثانوي', labelEn: 'Accent colour' },
              { key: 'ink' as const, labelAr: 'لون العناوين', labelEn: 'Ink colour' },
            ]).map(({ key, labelAr, labelEn }) => (
              <div key={key}>
                <label className="text-[10px] font-semibold text-[#486b59]">{isArabic ? labelAr : labelEn}</label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    className="h-9 w-12 cursor-pointer rounded-lg border border-[#dfe8e2] bg-white p-1"
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, brand: { ...prev.brand, [key]: e.target.value } }))
                    }
                    type="color"
                    value={settings.brand[key]}
                  />
                  <input
                    className="h-9 flex-1 rounded-xl border border-[#dfe8e2] px-3 font-mono text-xs uppercase outline-none"
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, brand: { ...prev.brand, [key]: e.target.value } }))
                    }
                    value={settings.brand[key]}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="flex items-center justify-between text-[10px] font-semibold text-[#486b59]">
                <span>{isArabic ? 'استدارة الحواف' : 'Corner radius'}</span>
                <span className="font-mono text-[#3b5949]">{settings.brand.radius.toFixed(2)} rem</span>
              </label>
              <input
                className="mt-2 w-full accent-[#314f43]"
                max={3}
                min={0}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, brand: { ...prev.brand, radius: Number(e.target.value) } }))
                }
                step={0.05}
                type="range"
                value={settings.brand.radius}
              />
            </div>
            <div>
              <label className="flex items-center justify-between text-[10px] font-semibold text-[#486b59]">
                <span>{isArabic ? 'حجم الخط العام' : 'Global font scale'}</span>
                <span className="font-mono text-[#3b5949]">{Math.round(settings.brand.fontScale * 100)}%</span>
              </label>
              <input
                className="mt-2 w-full accent-[#314f43]"
                max={1.15}
                min={0.9}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, brand: { ...prev.brand, fontScale: Number(e.target.value) } }))
                }
                step={0.01}
                type="range"
                value={settings.brand.fontScale}
              />
            </div>
          </div>

          {/* Live swatch preview so the admin sees the palette before saving. */}
          <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-[#e7efe9] bg-[#fbfdfa] p-4">
            <span className="text-[10px] font-semibold text-[#607368]">{isArabic ? 'معاينة:' : 'Preview:'}</span>
            <span className="rounded-full px-4 py-1.5 text-[11px] font-bold text-white" style={{ background: settings.brand.primary }}>
              {isArabic ? 'زر أساسي' : 'Primary button'}
            </span>
            <span className="rounded-full px-4 py-1.5 text-[11px] font-bold text-white" style={{ background: settings.brand.accent }}>
              {isArabic ? 'زر ثانوي' : 'Accent button'}
            </span>
            <span className="text-sm font-extrabold" style={{ color: settings.brand.ink }}>
              {isArabic ? 'نص العناوين' : 'Headline text'}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              className="flex min-h-10 items-center gap-1.5 rounded-full bg-[#314f43] px-5 text-xs font-semibold text-white hover:bg-[#436e5d]"
              onClick={() => onToast(isArabic ? 'تم تطبيق التصميم على الموقع!' : 'Design applied across the site!')}
              type="button"
            >
              <Check className="h-4 w-4" />
              {isArabic ? 'تثبيت التصميم' : 'Apply Design'}
            </button>
            <button
              className="flex min-h-10 items-center gap-1.5 rounded-full border border-[#d6e3db] bg-white px-5 text-xs font-semibold text-[#3b5949] hover:bg-[#edf5f0]"
              onClick={() => {
                setSettings((prev) => ({
                  ...prev,
                  brand: { primary: '#314f43', accent: '#4e8e6f', ink: '#21362b', radius: 1.5, fontScale: 1 },
                }));
                onToast(isArabic ? 'تمت استعادة الهوية الافتراضية' : 'Default brand restored');
              }}
              type="button"
            >
              {isArabic ? 'استعادة الافتراضي' : 'Reset to Default'}
            </button>
          </div>
        </div>
      )}

      {/* Tab: Site Content — editable copy for every marketing section. */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-white bg-white/85 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-base font-bold text-[#2f4437]">
                  <Type className="h-4 w-4 text-[#4e8e6f]" />
                  {isArabic ? 'نصوص أقسام الموقع' : 'Site Section Copy'}
                </h2>
                <p className="text-[10px] text-[#788b80]">
                  {isArabic
                    ? 'عدّل عناوين وأوصاف كل قسم بعنوان عربي وإنجليزي — يظهر فوراً على الصفحة الرئيسية.'
                    : 'Edit each homepage section title and subtitle in both languages — reflected instantly.'}
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

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {([
                { key: 'cardsTitle' as const, labelAr: 'عنوان قسم البطاقات', labelEn: 'Cards section title' },
                { key: 'cardsSubtitle' as const, labelAr: 'وصف قسم البطاقات', labelEn: 'Cards section subtitle' },
                { key: 'fashionTitle' as const, labelAr: 'عنوان قسم الأزياء', labelEn: 'Fashion section title' },
                { key: 'fashionSubtitle' as const, labelAr: 'وصف قسم الأزياء', labelEn: 'Fashion section subtitle' },
                { key: 'servicesTitle' as const, labelAr: 'عنوان قسم الاستوديو', labelEn: 'Studio section title' },
                { key: 'servicesSubtitle' as const, labelAr: 'وصف قسم الاستوديو', labelEn: 'Studio section subtitle' },
                { key: 'carsTitle' as const, labelAr: 'عنوان قسم السيارات', labelEn: 'Vehicles section title' },
                { key: 'carsSubtitle' as const, labelAr: 'وصف قسم السيارات', labelEn: 'Vehicles section subtitle' },
                { key: 'propertyTitle' as const, labelAr: 'عنوان قسم العقارات', labelEn: 'Real Estate section title' },
                { key: 'propertySubtitle' as const, labelAr: 'وصف قسم العقارات', labelEn: 'Real Estate section subtitle' },
                { key: 'ctaTitle' as const, labelAr: 'عنوان دعوة التواصل', labelEn: 'CTA title' },
                { key: 'ctaText' as const, labelAr: 'نص دعوة التواصل', labelEn: 'CTA text' },
                { key: 'footerNote' as const, labelAr: 'ملاحظة التذييل', labelEn: 'Footer note' },
              ]).map(({ key, labelAr, labelEn }) => (
                <div key={key}>
                  <label className="text-[10px] text-[#607368]">{isArabic ? labelAr : labelEn}</label>
                  <input
                    className="mt-1 h-9 w-full rounded-xl border border-[#dfe8e2] px-3 text-xs outline-none"
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        content: { ...prev.content, [key]: { ...prev.content[key], [heroLang]: e.target.value } },
                      }))
                    }
                    value={settings.content[key][heroLang]}
                  />
                </div>
              ))}
            </div>

            {/* Hero background image + maintenance notice live here too, since
                they are site-wide presentation rather than store data. */}
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-[10px] text-[#607368]">{isArabic ? 'صورة خلفية الواجهة (اختياري)' : 'Hero background image (optional)'}</label>
                <input
                  className="mt-1 h-9 w-full rounded-xl border border-[#dfe8e2] px-3 text-xs outline-none"
                  onChange={(e) => setSettings((prev) => ({ ...prev, heroImage: e.target.value }))}
                  placeholder="/images/hero.jpg or https://…"
                  value={settings.heroImage}
                />
              </div>
              <div>
                <label className="flex items-center justify-between rounded-2xl border border-[#dfe8e2] bg-[#fbfdfa] p-3 text-xs font-semibold text-[#3b5546]">
                  <span>{isArabic ? 'إظهار شريط الصيانة' : 'Show maintenance banner'}</span>
                  <input
                    checked={settings.maintenanceActive}
                    className="h-4 w-4 accent-[#314f43]"
                    onChange={(e) => setSettings((prev) => ({ ...prev, maintenanceActive: e.target.checked }))}
                    type="checkbox"
                  />
                </label>
              </div>
              <div>
                <label className="text-[10px] text-[#607368]">{isArabic ? 'نص شريط الصيانة' : 'Maintenance banner text'}</label>
                <input
                  className="mt-1 h-9 w-full rounded-xl border border-[#dfe8e2] px-3 text-xs outline-none"
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      maintenanceText: { ...prev.maintenanceText, [heroLang]: e.target.value },
                    }))
                  }
                  value={settings.maintenanceText[heroLang]}
                />
              </div>
            </div>

            <button
              className="mt-6 flex min-h-10 items-center gap-1.5 rounded-full bg-[#314f43] px-5 text-xs font-semibold text-white hover:bg-[#436e5d]"
              onClick={() => onToast(isArabic ? 'تم حفظ نصوص الموقع!' : 'Site copy saved!')}
              type="button"
            >
              <Check className="h-4 w-4" />
              {isArabic ? 'حفظ النصوص' : 'Save Copy'}
            </button>
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
                onClick={handleExportDataBackup}
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
