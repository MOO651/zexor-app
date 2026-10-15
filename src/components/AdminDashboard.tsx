import { Fragment, useState, useRef } from 'react';
import {
  Archive,
  ArchiveRestore,
  BarChart3,
  CarFront,
  Boxes,
  Check,
  Copy,
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
  Percent,
  Plus,
  Search,
  Send,
  Settings,
  Share2,
  ShoppingBag,
  Tag,
  Trash2,
  Type,
  UploadCloud,
  UsersRound,
  X,
} from 'lucide-react';
import { art } from '../data/imagery';
import { DepartmentBanner } from './DepartmentBanner';
import { INITIAL_CATEGORIES, SHIPPING_RATES } from '../data/initialData';
import { publicAssetUrl } from '../utils';
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
import type { PaymentMethod, SocialLink } from '../lib/siteData';
import { validateStoreBackup } from '../lib/backupValidation';
import { sendTelegramTestNotification } from '../lib/siteData';

const csvCell = (value: unknown) => {
  const text = String(value ?? '');
  const safeText = /^[\s\uFEFF]*[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safeText.replaceAll('"', '""')}"`;
};

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
  socialLinks: SocialLink[];
  paymentMethods: PaymentMethod[];
  onSaveSocialLink: (link: SocialLink) => Promise<boolean>;
  onSavePaymentMethod: (method: PaymentMethod) => Promise<boolean>;
  siteDataReady: boolean;
  onDeleteInquiry: (id: string) => Promise<boolean>;
  onClearInquiries: () => Promise<boolean>;
  onClearOrders: () => Promise<boolean>;
  onSaveOrder: (order: CustomerOrder) => Promise<boolean>;
  onDeleteOrder: (id: string) => Promise<boolean>;
  onSetProductStock: (productId: string, stock: number | null) => Promise<boolean>;
  onUpdateOrderStatus: (orderId: string, status: CustomerOrder['status']) => Promise<boolean>;
  onUpdateOrderShipping: (orderId: string, details: Pick<CustomerOrder, 'shippingCarrier' | 'trackingNumber' | 'trackingUrl'>) => Promise<boolean>;
  onUpdateInquiryStatus: (inquiryId: string, status: PlatformInquiry['status']) => Promise<boolean>;
  onLock: () => void;
  onToast: (msg: string) => void;
};

export function AdminDashboard({
  locale,
  market,
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
  socialLinks,
  paymentMethods,
  onSaveSocialLink,
  onSavePaymentMethod,
  siteDataReady,
  onDeleteInquiry,
  onClearInquiries,
  onClearOrders,
  onSaveOrder,
  onDeleteOrder,
  onSetProductStock,
  onUpdateOrderStatus,
  onUpdateOrderShipping,
  onUpdateInquiryStatus,
  onLock,
  onToast,
}: Props) {
  const isArabic = locale === 'ar';
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'categories'
    | 'products'
    | 'inventory'
    | 'customers'
    | 'cars'
    | 'properties'
    | 'orders'
    | 'inbox'
    | 'promos'
    | 'sales'
    | 'channels'
    | 'design'
    | 'content'
    | 'settings'
  >('overview');
  const [socialDraftState, setSocialDraftState] = useState<{ source: SocialLink[]; value: SocialLink[] } | null>(null);
  const [paymentDraftState, setPaymentDraftState] = useState<{ source: PaymentMethod[]; value: PaymentMethod[] } | null>(null);
  const [paymentMarket, setPaymentMarket] = useState<Market>(market);
  const [newPaymentMethodLabel, setNewPaymentMethodLabel] = useState('');
  const socialDraft = socialDraftState?.source === socialLinks ? socialDraftState.value : socialLinks;
  const paymentDraft = paymentDraftState?.source === paymentMethods ? paymentDraftState.value : paymentMethods;

  // Hero / contact editor: which locale column is being edited
  const [heroLang, setHeroLang] = useState<Locale>(locale);

  // Backup restore picker — a hidden file input opened by the "Restore" button.
  const importInputRef = useRef<HTMLInputElement>(null);
  const brandLogoInputRef = useRef<HTMLInputElement>(null);

  // Search & Filter in Admin
  const [orderSearch, setOrderSearch] = useState('');
  const [orderArchiveView, setOrderArchiveView] = useState<'active' | 'archived'>('active');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | CustomerOrder['status']>('all');
  const [orderMarketFilter, setOrderMarketFilter] = useState<'all' | Market>('all');
  const [orderDetailsId, setOrderDetailsId] = useState<string | null>(null);
  const [shippingDrafts, setShippingDrafts] = useState<Record<string, Pick<CustomerOrder, 'shippingCarrier' | 'trackingNumber' | 'trackingUrl'>>>({});
  // Free-text filter for the products table (matches Arabic or English names).
  const [productSearch, setProductSearch] = useState('');
  const [productStatusFilter, setProductStatusFilter] = useState<'all' | 'available' | 'hidden' | 'low' | 'out'>('all');
  // Shared filter for the vehicle and property listings.
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryLowOnly, setInventoryLowOnly] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [salesPeriodDays, setSalesPeriodDays] = useState<7 | 30>(7);

  // Add Category Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [newCatNameAr, setNewCatNameAr] = useState('');
  const [newCatNameEn, setNewCatNameEn] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatParentSlug, setNewCatParentSlug] = useState('');
  const [newCatBannerTitleAr, setNewCatBannerTitleAr] = useState('');
  const [newCatBannerTitleEn, setNewCatBannerTitleEn] = useState('');
  const [newCatBannerTextAr, setNewCatBannerTextAr] = useState('');
  const [newCatBannerTextEn, setNewCatBannerTextEn] = useState('');
  const [newCatBannerImage, setNewCatBannerImage] = useState('');
  const [newCatBannerAccent, setNewCatBannerAccent] = useState('#b7edcf');
  const [newCatExtraSlides, setNewCatExtraSlides] = useState([
    { title: { ar: '', en: '' }, text: { ar: '', en: '' }, image: '' },
    { title: { ar: '', en: '' }, text: { ar: '', en: '' }, image: '' },
  ]);
  const updateCategorySlide = (index: number, field: 'title' | 'text' | 'image', localeKey: 'ar' | 'en', value: string) => setNewCatExtraSlides((current) => current.map((slide, slideIndex) => {
    if (slideIndex !== index) return slide;
    if (field === 'image') return { ...slide, image: value };
    return { ...slide, [field]: { ...slide[field], [localeKey]: value } };
  }));
  const [newShippingArea, setNewShippingArea] = useState('');
  const [newShippingCarrier, setNewShippingCarrier] = useState('');
  const [carrierMarket, setCarrierMarket] = useState<Market>(market);

  // Add / Edit Product Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodNameAr, setProdNameAr] = useState('');
  const [prodNameEn, setProdNameEn] = useState('');
  const [prodDescAr, setProdDescAr] = useState('');
  const [prodDescEn, setProdDescEn] = useState('');
  const [prodCat, setProdCat] = useState('cards');
  const [prodSubcategoryId, setProdSubcategoryId] = useState('');
  const [prodPriceEg, setProdPriceEg] = useState('');
  const [prodPriceKsa, setProdPriceKsa] = useState('');
  const [prodOldPriceEg, setProdOldPriceEg] = useState('');
  const [prodOldPriceKsa, setProdOldPriceKsa] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('');
  // Extra merchandising fields added for Salla-style product management.
  const [prodSku, setProdSku] = useState('');
  const [prodBrand, setProdBrand] = useState('');
  const [prodBadge, setProdBadge] = useState('');
  const [prodVariants, setProdVariants] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodMarkets, setProdMarkets] = useState<Market[]>(['eg', 'ksa']);
  const [prodFeatured, setProdFeatured] = useState(false);
  const [prodAvailable, setProdAvailable] = useState(true);
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
  const [carDeal, setCarDeal] = useState<'Sale' | 'Rent'>('Rent');
  const [carRentalPeriod, setCarRentalPeriod] = useState<'Day' | 'Week' | 'Month'>('Day');
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
  const [propDeal, setPropDeal] = useState<'Sale' | 'Rent'>('Rent');
  const [propRentalPeriod, setPropRentalPeriod] = useState<'Month' | 'Year'>('Month');
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
    if (editingCategoryId) {
      const editedCategory = categories.find((category) => category.id === editingCategoryId);
      setCategories((prev) => prev.map((category) => category.id === editingCategoryId
        ? {
          ...category,
          name: { ar: newCatNameAr.trim(), en: newCatNameEn.trim() },
          parentSlug: newCatParentSlug || undefined,
          bannerTitle: { ar: newCatBannerTitleAr.trim(), en: newCatBannerTitleEn.trim() },
          bannerText: { ar: newCatBannerTextAr.trim(), en: newCatBannerTextEn.trim() },
          bannerImage: newCatBannerImage.trim(),
          bannerAccent: newCatBannerAccent,
          bannerSlides: newCatExtraSlides.filter((slide) => slide.image.trim() || slide.title.ar.trim() || slide.title.en.trim()).map((slide) => ({ ...slide, image: slide.image.trim() })),
        }
        : category));
      if (editedCategory?.parentSlug !== newCatParentSlug) {
        setProducts((prev) => prev.map((product) => product.subcategoryId === editedCategory?.slug
          ? { ...product, category: newCatParentSlug || product.category, subcategoryId: newCatParentSlug ? product.subcategoryId : undefined }
          : product));
      }
      setEditingCategoryId(null);
      setNewCatNameAr('');
      setNewCatNameEn('');
      setNewCatSlug('');
      setNewCatParentSlug('');
      setNewCatBannerTitleAr(''); setNewCatBannerTitleEn(''); setNewCatBannerTextAr(''); setNewCatBannerTextEn(''); setNewCatBannerImage('');
      setNewCatBannerAccent('#b7edcf');
      setNewCatExtraSlides([{ title: { ar: '', en: '' }, text: { ar: '', en: '' }, image: '' }, { title: { ar: '', en: '' }, text: { ar: '', en: '' }, image: '' }]);
      setShowCategoryModal(false);
      onToast(isArabic ? 'تم تحديث اسم القسم في المتجر' : 'Section name updated across the store');
      return;
    }
    const slug = (newCatSlug || newCatNameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
      .trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    if (!slug || categories.some((category) => category.slug === slug)) {
      onToast(isArabic ? 'الرابط المختصر مستخدم بالفعل أو غير صالح.' : 'That slug is already used or invalid.');
      return;
    }
    const newCat: DynamicCategory = {
      id: `cat-${crypto.randomUUID().replaceAll('-', '').slice(0, 12)}`,
      name: { ar: newCatNameAr.trim(), en: newCatNameEn.trim() },
      slug,
      icon: 'sparkles',
      active: true,
      ...(newCatParentSlug ? { parentSlug: newCatParentSlug } : {}),
      bannerTitle: { ar: newCatBannerTitleAr.trim(), en: newCatBannerTitleEn.trim() },
      bannerText: { ar: newCatBannerTextAr.trim(), en: newCatBannerTextEn.trim() },
      bannerImage: newCatBannerImage.trim(),
      bannerAccent: newCatBannerAccent,
      bannerSlides: newCatExtraSlides.filter((slide) => slide.image.trim() || slide.title.ar.trim() || slide.title.en.trim()).map((slide) => ({ ...slide, image: slide.image.trim() })),
    };
    setCategories((prev) => [...prev, newCat]);
    setNewCatNameAr('');
    setNewCatNameEn('');
    setNewCatSlug('');
    setNewCatParentSlug('');
    setNewCatBannerTitleAr(''); setNewCatBannerTitleEn(''); setNewCatBannerTextAr(''); setNewCatBannerTextEn(''); setNewCatBannerImage('');
    setNewCatBannerAccent('#b7edcf');
    setNewCatExtraSlides([{ title: { ar: '', en: '' }, text: { ar: '', en: '' }, image: '' }, { title: { ar: '', en: '' }, text: { ar: '', en: '' }, image: '' }]);
    setEditingCategoryId(null);
    setShowCategoryModal(false);
    onToast(isArabic ? 'تمت إضافة القسم الجديد بنجاح!' : 'New category created successfully!');
  };

  const handleEditCategory = (category: DynamicCategory) => {
    setEditingCategoryId(category.id);
    setNewCatNameAr(category.name.ar);
    setNewCatNameEn(category.name.en);
    setNewCatSlug(category.slug);
    setNewCatParentSlug(category.parentSlug ?? '');
    setNewCatBannerTitleAr(category.bannerTitle?.ar ?? '');
    setNewCatBannerTitleEn(category.bannerTitle?.en ?? '');
    setNewCatBannerTextAr(category.bannerText?.ar ?? '');
    setNewCatBannerTextEn(category.bannerText?.en ?? '');
    setNewCatBannerImage(category.bannerImage ?? '');
    setNewCatBannerAccent(category.bannerAccent ?? '#b7edcf');
    setNewCatExtraSlides([0, 1].map((index) => category.bannerSlides?.[index] ?? { title: { ar: '', en: '' }, text: { ar: '', en: '' }, image: '' }));
    setShowCategoryModal(true);
  };

  const handleToggleCategory = (catId: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, active: !c.active } : c)),
    );
  };

  const handleDeleteCategory = (catId: string) => {
    const target = categories.find((category) => category.id === catId);
    if (target && !target.parentSlug && products.some((product) => product.category === target.slug)) {
      onToast(isArabic ? 'انقل المنتجات لقسم آخر أولاً قبل حذف هذا القسم.' : 'Move this category’s products before deleting it.');
      return;
    }
    if (window.confirm(isArabic ? 'هل أنت متأكد من حذف هذا القسم؟' : 'Delete this category?')) {
      const deletedCategory = target;
      setCategories((prev) => prev.filter((c) => c.id !== catId));
      if (deletedCategory?.parentSlug) {
        setProducts((prev) => prev.map((product) => product.subcategoryId === deletedCategory.slug
          ? { ...product, subcategoryId: undefined }
          : product));
      }
      onToast(isArabic ? 'تم حذف القسم' : 'Category removed');
    }
  };

  // Save / Update Product with Discount
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const egPrice = Number(prodPriceEg);
    const ksaPrice = Number(prodPriceKsa);
    const oldEg = prodOldPriceEg ? Number(prodOldPriceEg) : undefined;
    const oldKsa = prodOldPriceKsa ? Number(prodOldPriceKsa) : undefined;
    const stock = prodStock.trim() ? Number(prodStock) : undefined;

    if (!prodNameAr.trim() || !prodNameEn.trim() || !prodPriceEg.trim() || !prodPriceKsa.trim() || !Number.isFinite(egPrice) || !Number.isFinite(ksaPrice) || egPrice < 0 || ksaPrice < 0) {
      onToast(isArabic ? 'أدخل اسم المنتج بالعربية والإنجليزية وأسعاراً صحيحة غير سالبة.' : 'Enter Arabic and English product names and valid non-negative prices.');
      return;
    }
    if ((oldEg !== undefined && (!Number.isFinite(oldEg) || oldEg < egPrice)) || (oldKsa !== undefined && (!Number.isFinite(oldKsa) || oldKsa < ksaPrice))) {
      onToast(isArabic ? 'يجب أن يكون السعر القديم أكبر من أو مساوياً للسعر الحالي.' : 'Each old price must be at least the current price.');
      return;
    }
    if (stock !== undefined && (!Number.isInteger(stock) || stock < 0)) {
      onToast(isArabic ? 'الكمية يجب أن تكون رقماً صحيحاً موجباً أو صفراً.' : 'Stock must be a whole number greater than or equal to zero.');
      return;
    }
    if (prodMarkets.length === 0) {
      onToast(isArabic ? 'اختر سوقاً واحداً على الأقل لعرض المنتج.' : 'Choose at least one market for this product.');
      return;
    }

    const newProd: Product = {
      id: editingProductId ?? `prod-${crypto.randomUUID().replaceAll('-', '').slice(0, 16)}`,
      category: prodCat,
      subcategoryId: prodCat === 'fashion' && prodSubcategoryId ? prodSubcategoryId : undefined,
      markets: prodMarkets,
      name: { ar: prodNameAr.trim(), en: prodNameEn.trim() },
      description: { ar: prodDescAr.trim(), en: prodDescEn.trim() },
      price: { eg: egPrice, ksa: ksaPrice },
      oldPrice: oldEg || oldKsa ? { eg: oldEg ?? egPrice, ksa: oldKsa ?? ksaPrice } : undefined,
      icon: 'sparkles',
      finish: 'pearl',
      available: prodAvailable,
      imageUrl: prodImageUrl || art.cardsElite,
      sku: prodSku.trim() || undefined,
      brand: prodBrand.trim() || undefined,
      badge: prodBadge.trim() || undefined,
      featured: prodFeatured,
      stock,
      variants: prodVariants
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean),
    };

    const existingProduct = editingProductId ? products.find((product) => product.id === editingProductId) : undefined;
    if (existingProduct && existingProduct.stock !== stock) {
      const stockSaved = await onSetProductStock(newProd.id, stock ?? null);
      if (!stockSaved) return;
    }

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
    setProdSubcategoryId(prod.subcategoryId ?? '');
    setProdPriceEg(String(prod.price.eg));
    setProdPriceKsa(String(prod.price.ksa));
    setProdOldPriceEg(prod.oldPrice ? String(prod.oldPrice.eg) : '');
    setProdOldPriceKsa(prod.oldPrice ? String(prod.oldPrice.ksa) : '');
    setProdImageUrl(prod.imageUrl ?? '');
    setProdSku(prod.sku ?? '');
    setProdBrand(prod.brand ?? '');
    setProdBadge(prod.badge ?? '');
    setProdVariants((prod.variants ?? []).join(', '));
    setProdStock(prod.stock === undefined ? '' : String(prod.stock));
    setProdMarkets(prod.markets ?? ['eg', 'ksa']);
    setProdFeatured(Boolean(prod.featured));
    setProdAvailable(prod.available);
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

  const handleDuplicateProduct = (product: Product) => {
    const duplicate: Product = {
      ...product,
      id: `ZX-P-${crypto.randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()}`,
      name: { ar: `${product.name.ar} · نسخة`, en: `${product.name.en} · Copy` },
      sku: product.sku ? `${product.sku}-COPY-${crypto.randomUUID().slice(0, 4).toUpperCase()}` : undefined,
      available: false,
      featured: false,
      stock: undefined,
    };
    setProducts((current) => [duplicate, ...current]);
    onToast(isArabic ? 'اتعملت نسخة مخفية من المنتج. راجع بياناتها ثم فعّلها.' : 'A hidden product copy was created. Review it, then make it available.');
  };

  const handleExportProductsCsv = () => {
    const columns = ['id', 'sku', 'name_ar', 'name_en', 'category', 'subcategory', 'price_egp', 'price_sar', 'old_price_egp', 'old_price_sar', 'stock', 'markets', 'available', 'featured', 'image_url'];
    const rows = products.map((product) => [product.id, product.sku ?? '', product.name.ar, product.name.en, product.category, product.subcategoryId ?? '', product.price.eg, product.price.ksa, product.oldPrice?.eg ?? '', product.oldPrice?.ksa ?? '', product.stock ?? '', (product.markets ?? ['eg', 'ksa']).join('|'), product.available, Boolean(product.featured), product.imageUrl ?? '']);
    const csv = `\uFEFF${[columns, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n')}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `zexor-products-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    onToast(isArabic ? `تم تصدير ${products.length} منتج بصيغة CSV` : `Exported ${products.length} products as CSV`);
  };

  // Save / Update Car — creates a new listing, or updates the one being edited.
  const handleSaveCar = (e: React.FormEvent) => {
    e.preventDefault();
    const id = editingCarId ?? `ZX-CAR-${crypto.randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()}`;
    const existing = vehicles.find((v) => v.id === id);
    const photo = carPhoto || existing?.photo || '/images/demo-sedan.svg';

    const car: Vehicle = {
      id,
      title: { ar: carTitleAr.trim() || 'سيارة جديدة', en: carTitleEn.trim() || 'New Vehicle' },
      location: { ar: carLocation, en: carLocation },
      price: Number(carPrice) || existing?.price || 1000000,
      deal: carDeal,
      rentalPeriod: carDeal === 'Rent' ? carRentalPeriod : undefined,
      oldPrice: carDeal === 'Rent' ? undefined : existing?.oldPrice,
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
    setCarDeal(v.deal ?? 'Rent');
    setCarRentalPeriod(v.rentalPeriod ?? 'Day');
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
    const id = editingPropId ?? `ZX-PROP-${crypto.randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()}`;
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
      rentalPeriod: propDeal === 'Rent' ? propRentalPeriod : undefined,
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
    setPropDeal(p.deal ?? 'Rent');
    setPropRentalPeriod(p.rentalPeriod ?? 'Month');
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
  const handleUpdateOrderStatus = async (orderId: string, status: CustomerOrder['status']) => {
    const order = orders.find((item) => item.id === orderId);
    if (!order || order.status === status) return;
    if (!await onUpdateOrderStatus(orderId, status)) return;
    setOrders((prev) => prev.map((item) => item.id === orderId ? {
      ...item,
      status,
      ...(status === 'cancelled' ? { stockAdjusted: false } : order.status === 'cancelled' ? { stockAdjusted: true } : {}),
    } : item));
    onToast(isArabic ? `تم تعديل حالة الطلب إلى: ${status}` : `Order status updated to: ${status}`);
  };

  const handleArchiveOrder = async (order: CustomerOrder) => {
    const archived = !order.archived;
    const updatedOrder: CustomerOrder = {
      ...order,
      archived,
      archivedAt: archived ? new Date().toISOString() : undefined,
    };
    if (!await onSaveOrder(updatedOrder)) {
      onToast(isArabic ? 'تعذرت أرشفة الطلب في قاعدة البيانات.' : 'Could not update this order in the database.');
      return;
    }
    setOrders((current) => current.map((item) => item.id === order.id ? updatedOrder : item));
    onToast(archived
      ? isArabic ? 'تم نقل الطلب إلى الأرشيف.' : 'Order moved to the archive.'
      : isArabic ? 'تمت استعادة الطلب من الأرشيف.' : 'Order restored from the archive.');
  };

  const handleDeleteOrder = async (order: CustomerOrder) => {
    const confirmed = window.confirm(isArabic
      ? `حذف الطلب ${order.id} نهائيًا؟ لا يمكن التراجع. لو عايز تحتفظ بسجله استخدم الأرشيف.`
      : `Permanently delete order ${order.id}? This cannot be undone. Archive it to keep its history.`);
    if (!confirmed) return;
    if (!await onDeleteOrder(order.id)) {
      onToast(isArabic ? 'تعذر حذف الطلب من قاعدة البيانات.' : 'Could not delete this order from the database.');
      return;
    }
    setOrders((current) => current.filter((item) => item.id !== order.id));
    if (orderDetailsId === order.id) setOrderDetailsId(null);
    onToast(isArabic ? 'تم حذف الطلب نهائيًا.' : 'Order permanently deleted.');
  };

  const handleSaveShipping = async (order: CustomerOrder) => {
    const details = shippingDrafts[order.id] ?? {
      shippingCarrier: order.shippingCarrier ?? '',
      trackingNumber: order.trackingNumber ?? '',
      trackingUrl: order.trackingUrl ?? '',
    };
    if (details.trackingUrl && !/^https:\/\//i.test(details.trackingUrl)) {
      onToast(isArabic ? 'رابط التتبع يجب أن يبدأ بـ https://' : 'Tracking links must start with https://');
      return;
    }
    if (!await onUpdateOrderShipping(order.id, details)) {
      onToast(isArabic ? 'تعذر حفظ بيانات الشحنة. تحقق من اتصال قاعدة البيانات وتطبيق التحديثات.' : 'Could not save shipment details. Check the database connection and migrations.');
      return;
    }
    setOrders((current) => current.map((item) => item.id === order.id ? { ...item, ...details } : item));
    onToast(isArabic ? 'تم حفظ شركة الشحن ورقم التتبع' : 'Carrier and tracking details saved');
  };

  const handleExportOrdersCsv = () => {
    const columns = ['id', 'createdAt', 'customer', 'phone', 'market', 'city', 'status', 'paymentMethod', 'paymentStatus', 'shippingCarrier', 'trackingNumber', 'trackingUrl', 'subtotal', 'discount', 'shippingFee', 'total'];
    const rows = filteredOrders.map((order) => [order.id, order.createdAt, order.customer, order.phone, order.market, order.city, order.status, order.paymentMethod, order.paymentStatus ?? '', order.shippingCarrier, order.trackingNumber, order.trackingUrl, order.subtotal, order.discount, order.shippingFee, order.total]);
    const csv = `\uFEFF${[columns, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n')}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `zexor-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    onToast(isArabic ? `تم تصدير ${filteredOrders.length} طلب بصيغة CSV` : `Exported ${filteredOrders.length} orders as CSV`);
  };

  const handleExportCustomersCsv = () => {
    const rows = customerRecords.map((customer) => [
      customer.name,
      customer.phone,
      customer.orders.filter((order) => order.status !== 'cancelled').length,
      customer.inquiries.length,
      customer.orders.filter((order) => order.market === 'eg' && order.status === 'complete').reduce((sum, order) => sum + order.total, 0),
      customer.orders.filter((order) => order.market === 'ksa' && order.status === 'complete').reduce((sum, order) => sum + order.total, 0),
      [...customer.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]?.createdAt ?? '',
    ]);
    const csv = `\uFEFF${[['name', 'phone', 'orders', 'inquiries', 'completed_spend_egp', 'completed_spend_sar', 'last_order'], ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n')}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `zexor-customers-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    onToast(isArabic ? `تم تصدير ${customerRecords.length} عميلاً` : `Exported ${customerRecords.length} customers`);
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
      inbox,
      promoCodes,
      // Telegram credentials are managed in the private settings table and
      // should never be copied into a portable download.
      settings: { ...settings, telegramBotToken: '', telegramChatId: '' },
      socialLinks,
      paymentMethods,
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
      const backup = validateStoreBackup(JSON.parse(raw) as unknown);
      if (!backup) throw new Error('invalid');
      // Each store is optional, and only applied when the backup really carries
      // an array — restoring one section never silently wipes another.
      if (backup.products) setProducts(backup.products);
      if (backup.categories) setCategories(backup.categories);
      if (backup.vehicles) setVehicles(backup.vehicles);
      if (backup.properties) setProperties(backup.properties);
      if (backup.orders) setOrders(backup.orders);
      if (backup.inbox) setInbox(backup.inbox);
      if (backup.promoCodes) setPromoCodes(backup.promoCodes);
      if (backup.settings) {
        setSettings((current) => ({
          ...current,
          ...backup.settings,
          telegramBotToken: current.telegramBotToken,
          telegramChatId: current.telegramChatId,
        }));
      }
      if (backup.socialLinks) {
        const restoredLinks = backup.socialLinks.map((item) => ({
          ...item,
          id: typeof item.id === 'string' ? item.id : `social-${item.platform}`,
          label: typeof item.label === 'string' ? item.label : item.platform,
          handle: typeof item.handle === 'string' ? item.handle : '',
          url: typeof item.url === 'string' ? item.url : '',
          active: item.active !== false,
          sortOrder: Number(item.sortOrder) || 0,
        }));
        const savedLinks = await Promise.all(restoredLinks.map(onSaveSocialLink));
        if (savedLinks.some((saved) => !saved)) throw new Error('save-failed');
      }
      if (backup.paymentMethods) {
        const restoredMethods = backup.paymentMethods.map((item) => ({
          ...item,
          id: typeof item.id === 'string' ? item.id : `pay-${item.market === 'ksa' ? 'ksa' : 'eg'}-${item.method}`,
          market: item.market === 'ksa' ? 'ksa' as const : 'eg' as const,
          label: typeof item.label === 'string' ? item.label : item.method,
          accountName: typeof item.accountName === 'string' ? item.accountName : '',
          accountNumber: typeof item.accountNumber === 'string' ? item.accountNumber : '',
          instructions: { ar: typeof item.instructions?.ar === 'string' ? item.instructions.ar : '', en: typeof item.instructions?.en === 'string' ? item.instructions.en : '' },
          active: item.active !== false,
          sortOrder: Number(item.sortOrder) || 0,
        }));
        const savedMethods = await Promise.all(restoredMethods.map(onSavePaymentMethod));
        if (savedMethods.some((saved) => !saved)) throw new Error('save-failed');
      }
      onToast(isArabic ? 'تم استيراد النسخة الاحتياطية بنجاح!' : 'Backup restored successfully!');
    } catch (error) {
      onToast(error instanceof Error && error.message === 'save-failed'
        ? isArabic ? 'تم استيراد بعض البيانات، لكن تعذر حفظ طرق الدفع أو الروابط الاجتماعية سحابياً.' : 'Some data was imported, but payment methods or social links could not be saved to the cloud.'
        : isArabic ? 'ملف غير صالح، تأكد أنه نسخة ZEXOR بصيغة JSON.' : 'Invalid file — please select a ZEXOR JSON backup.');
    } finally {
      if (importInputRef.current) importInputRef.current.value = '';
    }
  };

  // Wipes store content back to a blank slate (keeps the admin's hero/telegram settings).
  const handleResetContent = async () => {
    const confirmed = window.confirm(
      isArabic ? 'هل تريد تفريغ المنتجات والأقسام والطلبات؟ لا يمكن التراجع.' : 'Clear all products, categories and orders? This cannot be undone.'
    );
    if (!confirmed) return;
    const cloudOrdersCleared = await onClearOrders();
    if (!cloudOrdersCleared) {
      onToast(isArabic ? 'تعذر حذف الطلبات من قاعدة البيانات. لم يتم تنفيذ التفريغ.' : 'Could not clear cloud orders. Reset was cancelled.');
      return;
    }
    setProducts([]);
    setCategories([]);
    setOrders([]);
    onToast(isArabic ? 'تم تفريغ المحتوى.' : 'All content cleared.');
  };

  // Test Telegram Automation Notification
  const handleTestTelegramNotification = async () => {
    const sent = await sendTelegramTestNotification();
    onToast(sent
      ? isArabic ? 'تم إرسال إشعار التجربة بنجاح إلى تليجرام!' : 'Telegram test notification sent!'
      : isArabic ? 'تعذر إرسال الإشعار. تحقق من بيانات Telegram وصلاحية المدير.' : 'Could not send the notification. Check Telegram settings and admin access.');
  };

  // Stats
  const totalRevenueEg = orders.filter((o) => o.market === 'eg' && o.status === 'complete').reduce((s, o) => s + o.total, 0);
  const totalRevenueKsa = orders.filter((o) => o.market === 'ksa' && o.status === 'complete').reduce((s, o) => s + o.total, 0);
  const pendingOrdersCount = orders.filter((o) => o.status === 'new').length;
  // Inquiries still needing follow-up (anything not closed).
  const openInquiriesCount = inbox.filter((i) => i.status !== 'complete').length;

  const handleUpdateInquiryStatus = async (id: string, status: PlatformInquiry['status']) => {
    if (!await onUpdateInquiryStatus(id, status)) return;
    setInbox((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    onToast(isArabic ? 'تم تحديث حالة الاستفسار' : 'Inquiry status updated');
  };

  const handleDeleteInquiry = async (id: string) => {
    if (window.confirm(isArabic ? 'حذف هذا الاستفسار؟' : 'Delete this inquiry?')) {
      const deleted = await onDeleteInquiry(id);
      if (!deleted) {
        onToast(isArabic ? 'تعذر حذف الاستفسار من قاعدة البيانات.' : 'Could not delete the inquiry from the database.');
        return;
      }
      setInbox((prev) => prev.filter((i) => i.id !== id));
      onToast(isArabic ? 'تم حذف الاستفسار' : 'Inquiry deleted');
    }
  };

  const handleAddPaymentMethod = () => {
    const label = newPaymentMethodLabel.trim();
    if (!label) return;
    const method = `custom_${crypto.randomUUID().replaceAll('-', '').slice(0, 10)}`;
    const item: PaymentMethod = {
      id: `pay-${paymentMarket}-${method}`,
      market: paymentMarket,
      method,
      label,
      accountName: '',
      accountNumber: '',
      instructions: { ar: '', en: '' },
      active: true,
      sortOrder: paymentDraft.length,
    };
    setPaymentDraftState({ source: paymentMethods, value: [...paymentDraft, item] });
    setNewPaymentMethodLabel('');
  };

  const filteredOrders = orders.filter((o) => {
    if (Boolean(o.archived) !== (orderArchiveView === 'archived')) return false;
    if (orderMarketFilter !== 'all' && o.market !== orderMarketFilter) return false;
    if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) return false;
    if (orderSearch && !`${o.id} ${o.customer} ${o.phone}`.toLowerCase().includes(orderSearch.toLowerCase())) return false;
    return true;
  });

  const customerMap = new Map<string, { key: string; name: string; phone: string; orders: CustomerOrder[]; inquiries: PlatformInquiry[] }>();
  for (const order of orders) {
    const phoneKey = order.phone.replace(/\D/g, '') || order.phone.trim().toLowerCase();
    const customer = customerMap.get(phoneKey) ?? { key: phoneKey, name: order.customer, phone: order.phone, orders: [], inquiries: [] };
    customer.orders.push(order);
    if (new Date(order.createdAt).getTime() > new Date(customer.orders[0]?.createdAt ?? 0).getTime()) customer.name = order.customer;
    customerMap.set(phoneKey, customer);
  }
  for (const inquiry of inbox) {
    const phoneKey = inquiry.phone.replace(/\D/g, '') || inquiry.phone.trim().toLowerCase();
    const customer = customerMap.get(phoneKey) ?? { key: phoneKey, name: inquiry.name, phone: inquiry.phone, orders: [], inquiries: [] };
    customer.inquiries.push(inquiry);
    if (!customer.orders.length) customer.name = inquiry.name;
    customerMap.set(phoneKey, customer);
  }
  const customerRecords = [...customerMap.values()].sort((a, b) => {
    const aLatest = Math.max(0, ...a.orders.map((order) => new Date(order.createdAt).getTime()), ...a.inquiries.map((inquiry) => new Date(inquiry.createdAt).getTime()));
    const bLatest = Math.max(0, ...b.orders.map((order) => new Date(order.createdAt).getTime()), ...b.inquiries.map((inquiry) => new Date(inquiry.createdAt).getTime()));
    return bLatest - aLatest;
  });
  const customerBuyerCount = customerRecords.filter((customer) => customer.orders.some((order) => order.status !== 'cancelled')).length;
  const managedStockProducts = products.filter((product) => product.stock !== undefined);
  const lowStockProducts = managedStockProducts.filter((product) => (product.stock ?? 0) <= 5);
  const recentOrders = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const salesDays = Array.from({ length: salesPeriodDays }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (salesPeriodDays - index - 1));
    return date;
  });
  const localDateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const salesTimeline = salesDays.map((date) => {
    const dayOrders = orders.filter((order) => order.status === 'complete' && localDateKey(new Date(order.createdAt)) === localDateKey(date));
    return {
      date,
      eg: dayOrders.filter((order) => order.market === 'eg').reduce((sum, order) => sum + order.total, 0),
      ksa: dayOrders.filter((order) => order.market === 'ksa').reduce((sum, order) => sum + order.total, 0),
      count: dayOrders.length,
    };
  });
  const periodStart = salesDays[0]?.getTime() ?? 0;
  const periodOrders = orders.filter((order) => new Date(order.createdAt).getTime() >= periodStart && order.status !== 'cancelled');
  const periodCompletedOrders = periodOrders.filter((order) => order.status === 'complete');
  const topProducts = new Map<string, { name: string; quantity: number; revenueEg: number; revenueKsa: number }>();
  for (const order of periodCompletedOrders) {
    for (const item of order.items) {
      const current = topProducts.get(item.productId) ?? { name: item.name, quantity: 0, revenueEg: 0, revenueKsa: 0 };
      current.quantity += item.quantity;
      if (order.market === 'eg') current.revenueEg += item.egp * item.quantity;
      else current.revenueKsa += item.sar * item.quantity;
      topProducts.set(item.productId, current);
    }
  }
  const bestSellers = [...topProducts.entries()].sort((a, b) => b[1].quantity - a[1].quantity).slice(0, 5);

  return (
    <div className="zx-admin space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-[#5c8f76]">
            <LockKeyhole className="h-3.5 w-3.5" />
            {isArabic ? 'لوحة التحكم وإدارة النظام المتكاملة' : 'Admin Operations & Settings Control'}
          </span>
          <h1 className="mt-1 text-2xl font-bold text-[#2d4236] sm:text-3xl">
            {isArabic ? `إدارة ${settings.brand.name} الشاملة` : `Fully Dynamic ${settings.brand.name} Control Center`}
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

      <div className="grid items-start gap-5 lg:grid-cols-[230px_minmax(0,1fr)]">
      {/* Store admin navigation */}
      <div className="zx-admin-tabs zx-no-bar sticky top-[4.5rem] z-30 -mx-2 flex flex-nowrap gap-2 overflow-x-auto border-b border-[#e5ebe7] bg-[var(--c-bg)]/95 px-2 pb-3 pt-2 backdrop-blur-xl lg:static lg:mx-0 lg:max-h-[calc(100vh-2rem)] lg:flex-col lg:items-stretch lg:overflow-y-auto lg:overflow-x-hidden lg:border-b-0 lg:border-e lg:bg-transparent lg:px-0 lg:pt-0 lg:pe-3 lg:backdrop-blur-none">
        {[
          { id: 'overview', label: isArabic ? 'نظرة عامة' : 'Overview', icon: BarChart3 },
          { id: 'categories', label: isArabic ? 'الأقسام الديناميكية' : 'Categories', icon: Layers },
          { id: 'products', label: isArabic ? 'المنتجات والأسعار' : 'Products & Pricing', icon: ShoppingBag },
          { id: 'inventory', label: isArabic ? `المخزون (${lowStockProducts.length})` : `Inventory (${lowStockProducts.length})`, icon: Boxes },
          { id: 'customers', label: isArabic ? `العملاء (${customerRecords.length})` : `Customers (${customerRecords.length})`, icon: UsersRound },
          { id: 'cars', label: isArabic ? `معرض السيارات (${vehicles.length})` : `Vehicles (${vehicles.length})`, icon: CarFront },
          { id: 'properties', label: isArabic ? `إدارة العقارات (${properties.length})` : `Real Estate (${properties.length})`, icon: Home },
          { id: 'orders', label: isArabic ? `الطلبات الواردة (${pendingOrdersCount})` : `Orders (${pendingOrdersCount})`, icon: Clock },
          { id: 'inbox', label: isArabic ? `الاستفسارات (${openInquiriesCount})` : `Inquiries (${openInquiriesCount})`, icon: Inbox },
          { id: 'promos', label: isArabic ? 'أكواد الخصم' : 'Promo Codes', icon: Tag },
          { id: 'channels', label: isArabic ? 'التواصل والدفع' : 'Social & Payments', icon: Share2 },
          { id: 'sales', label: isArabic ? 'العروض والكوبونات' : 'Sale & Coupons', icon: Percent },
          { id: 'design', label: isArabic ? 'التصميم والهوية' : 'Design & Brand', icon: Palette },
          { id: 'content', label: isArabic ? 'نصوص الموقع' : 'Site Content', icon: Type },
          { id: 'settings', label: isArabic ? 'إعدادات الواجهة وتليجرام' : 'Hero & Telegram Settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-all lg:w-full lg:justify-start ${
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

      <div className="min-w-0 space-y-6">
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
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-2xl border border-white bg-white/90 p-5 shadow-sm">
              <div className="flex items-center justify-between"><h3 className="text-xs font-bold">{isArabic ? 'أحدث الطلبات' : 'Recent orders'}</h3><button className="text-[10px] font-semibold text-[#4e8066]" onClick={() => setActiveTab('orders')} type="button">{isArabic ? 'كل الطلبات ←' : 'All orders →'}</button></div>
              {recentOrders.length ? <div className="mt-3 divide-y divide-[#edf1ee]">{recentOrders.map((order) => <button className="flex w-full items-center justify-between gap-3 py-2 text-start" key={order.id} onClick={() => { setOrderSearch(order.id); setOrderMarketFilter('all'); setOrderStatusFilter('all'); setOrderDetailsId(order.id); setActiveTab('orders'); }} type="button"><span><span className="block text-[11px] font-semibold">{order.customer} · {order.id}</span><span className="text-[9px] text-[#829288]">{new Date(order.createdAt).toLocaleDateString(isArabic ? 'ar-EG' : 'en-GB')}</span></span><span className="text-[10px] font-bold">{order.total.toLocaleString()} {order.market === 'eg' ? 'ج.م' : 'ر.س'}</span></button>)}</div> : <p className="mt-3 text-xs text-[#829288]">{isArabic ? 'لا توجد طلبات بعد.' : 'No orders yet.'}</p>}
            </div>
            <div className="rounded-2xl border border-white bg-white/90 p-5 shadow-sm">
              <div className="flex items-center justify-between"><h3 className="text-xs font-bold">{isArabic ? 'تنبيهات المخزون' : 'Stock alerts'}</h3><button className="text-[10px] font-semibold text-[#4e8066]" onClick={() => { setInventoryLowOnly(true); setActiveTab('inventory'); }} type="button">{isArabic ? 'إدارة المخزون ←' : 'Manage inventory →'}</button></div>
              {lowStockProducts.length ? <div className="mt-3 divide-y divide-[#edf1ee]">{lowStockProducts.slice(0, 5).map((product) => <div className="flex items-center justify-between gap-3 py-2 text-[11px]" key={product.id}><span className="font-semibold">{product.name[locale]}</span><span className={`rounded-full px-2 py-1 text-[9px] font-semibold ${product.stock === 0 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{product.stock === 0 ? (isArabic ? 'نفد' : 'Out') : `${product.stock} ${isArabic ? 'متبقي' : 'left'}`}</span></div>)}</div> : <p className="mt-3 text-xs text-[#829288]">{isArabic ? 'لا توجد تنبيهات مخزون. أضف كميات للمنتجات من شاشة المخزون.' : 'No low-stock alerts. Track quantities from Inventory.'}</p>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <section className="space-y-5 rounded-3xl border border-white bg-white/85 p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#2f4437]">{isArabic ? 'مراقبة المخزون' : 'Inventory control'}</h2>
              <p className="mt-1 text-[10px] text-[#788b80]">{isArabic ? 'تحديث الكميات هنا ينعكس مباشرة على صفحة المتجر. الكمية الفارغة تعني مخزوناً غير محدود.' : 'Stock edits apply directly to the storefront. Blank quantity means untracked stock.'}</p>
            </div>
            <button className={`rounded-full px-3.5 py-2 text-xs font-semibold ${inventoryLowOnly ? 'bg-amber-100 text-amber-800' : 'border border-[#dfe8e2] bg-white text-[#52685b]'}`} onClick={() => setInventoryLowOnly((value) => !value)} type="button">{isArabic ? `منخفض أو نافد (${lowStockProducts.length})` : `Low or out (${lowStockProducts.length})`}</button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-[#f4f8f5] p-4"><span className="text-[10px] text-[#788b80]">{isArabic ? 'منتجات بمخزون متتبع' : 'Stock tracked'}</span><p className="mt-1 text-xl font-bold">{managedStockProducts.length}</p></div>
            <div className="rounded-2xl bg-amber-50 p-4"><span className="text-[10px] text-amber-700">{isArabic ? 'مخزون منخفض (٥ أو أقل)' : 'Low stock (5 or less)'}</span><p className="mt-1 text-xl font-bold text-amber-800">{lowStockProducts.filter((product) => (product.stock ?? 0) > 0).length}</p></div>
            <div className="rounded-2xl bg-red-50 p-4"><span className="text-[10px] text-red-700">{isArabic ? 'نفد المخزون' : 'Out of stock'}</span><p className="mt-1 text-xl font-bold text-red-800">{managedStockProducts.filter((product) => product.stock === 0).length}</p></div>
          </div>
          <div className="flex flex-wrap gap-2">
            <input className="h-10 min-w-48 flex-1 rounded-full border border-[#dfe7e1] px-4 text-xs outline-none" onChange={(event) => setInventorySearch(event.target.value)} placeholder={isArabic ? 'ابحث عن منتج أو SKU…' : 'Search product or SKU…'} value={inventorySearch} />
          </div>
          <div className="overflow-x-auto rounded-2xl border border-[#edf1ee]">
            <table className="w-full min-w-[620px] text-start text-xs text-[#3a5244]">
              <thead className="bg-[#f7faf8]"><tr className="text-[10px] text-[#7e9085]"><th className="p-3 text-start">{isArabic ? 'المنتج' : 'Product'}</th><th className="p-3 text-start">SKU</th><th className="p-3 text-start">{isArabic ? 'الكمية المتاحة' : 'On hand'}</th><th className="p-3 text-start">{isArabic ? 'الحالة' : 'Status'}</th><th className="p-3 text-start">{isArabic ? 'تعديل' : 'Edit'}</th></tr></thead>
              <tbody className="divide-y divide-[#edf1ee]">{products.filter((product) => product.stock !== undefined).filter((product) => !inventoryLowOnly || (product.stock ?? 0) <= 5).filter((product) => `${product.name.ar} ${product.name.en} ${product.sku ?? ''}`.toLowerCase().includes(inventorySearch.trim().toLowerCase())).map((product) => (
                <tr key={product.id}>
                  <td className="p-3"><div className="flex items-center gap-2"><img alt="" className="h-9 w-9 rounded-lg object-cover" src={publicAssetUrl(product.imageUrl)} /><span className="font-semibold">{product.name[locale]}</span></div></td>
                  <td className="p-3 font-mono text-[10px]">{product.sku || '—'}</td>
                  <td className="p-3"><input aria-label={`${isArabic ? 'كمية' : 'Quantity'} ${product.name.en}`} className="h-9 w-24 rounded-lg border border-[#dfe8e2] px-2 text-xs" min="0" onBlur={() => void onSetProductStock(product.id, product.stock ?? null)} onChange={(event) => { const value = event.target.value; const parsed = Number(value); setProducts((current) => current.map((item) => item.id === product.id ? { ...item, stock: value === '' ? undefined : Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : item.stock } : item)); }} type="number" value={product.stock ?? ''} /></td>
                  <td className="p-3"><span className={`rounded-full px-2.5 py-1 text-[9px] font-semibold ${product.stock === 0 ? 'bg-red-50 text-red-700' : (product.stock ?? 0) <= 5 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{product.stock === 0 ? (isArabic ? 'نفد' : 'Out') : (product.stock ?? 0) <= 5 ? (isArabic ? 'منخفض' : 'Low') : (isArabic ? 'متاح' : 'In stock')}</span></td>
                  <td className="p-3"><button className="rounded-full border border-[#dfe8e2] px-3 py-1.5 text-[10px]" onClick={() => startEditProduct(product)} type="button">{isArabic ? 'المنتج' : 'Product'}</button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          {managedStockProducts.length === 0 && <p className="rounded-2xl bg-[#f7faf8] p-5 text-center text-xs text-[#788b80]">{isArabic ? 'لم يتم تفعيل تتبع المخزون لأي منتج بعد. أضف كمية من شاشة تعديل المنتج.' : 'No products are tracked yet. Set a stock quantity in the product editor.'}</p>}
        </section>
      )}

      {activeTab === 'customers' && (
        <section className="space-y-5 rounded-3xl border border-white bg-white/85 p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><h2 className="text-base font-bold text-[#2f4437]">{isArabic ? 'قاعدة العملاء' : 'Customer directory'}</h2><p className="mt-1 text-[10px] text-[#788b80]">{isArabic ? 'ملف موحد لكل رقم هاتف مع سجل الطلبات والإنفاق المكتمل.' : 'A unified profile per phone number with order history and completed spend.'}</p></div>
            <div className="flex flex-wrap gap-2"><input className="h-10 min-w-48 rounded-full border border-[#dfe7e1] px-4 text-xs outline-none" onChange={(event) => setCustomerSearch(event.target.value)} placeholder={isArabic ? 'ابحث بالاسم أو الهاتف…' : 'Search name or phone…'} value={customerSearch} /><button className="flex h-10 items-center gap-1 rounded-full border border-[#dfe8e2] px-3 text-xs font-semibold" onClick={handleExportCustomersCsv} type="button"><Download className="h-3.5 w-3.5" />CSV</button></div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-[#f4f8f5] p-4"><span className="text-[10px] text-[#788b80]">{isArabic ? 'إجمالي العملاء' : 'Customers'}</span><p className="mt-1 text-xl font-bold">{customerRecords.length}</p></div>
            <div className="rounded-2xl bg-[#f4f8f5] p-4"><span className="text-[10px] text-[#788b80]">{isArabic ? 'عملاء متكررون (٣ طلبات+)' : 'Repeat customers (3+ orders)'}</span><p className="mt-1 text-xl font-bold">{customerRecords.filter((customer) => customer.orders.filter((order) => order.status !== 'cancelled').length >= 3).length}</p></div>
            <div className="rounded-2xl bg-[#f4f8f5] p-4"><span className="text-[10px] text-[#788b80]">{isArabic ? 'متوسط عدد الطلبات' : 'Average orders per customer'}</span><p className="mt-1 text-xl font-bold">{customerBuyerCount ? (orders.filter((order) => order.status !== 'cancelled').length / customerBuyerCount).toFixed(1) : '0.0'}</p></div>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-[#edf1ee]"><table className="w-full min-w-[800px] text-start text-xs text-[#3a5244]"><thead className="bg-[#f7faf8]"><tr className="text-[10px] text-[#7e9085]"><th className="p-3 text-start">{isArabic ? 'العميل' : 'Customer'}</th><th className="p-3 text-start">{isArabic ? 'الهاتف' : 'Phone'}</th><th className="p-3 text-start">{isArabic ? 'الطلبات' : 'Orders'}</th><th className="p-3 text-start">{isArabic ? 'الاستفسارات' : 'Inquiries'}</th><th className="p-3 text-start">{isArabic ? 'إنفاق مصر' : 'Egypt spend'}</th><th className="p-3 text-start">{isArabic ? 'إنفاق السعودية' : 'Saudi spend'}</th><th className="p-3 text-start">{isArabic ? 'آخر تواصل' : 'Last activity'}</th><th className="p-3 text-start">{isArabic ? 'التواصل' : 'Contact'}</th></tr></thead><tbody className="divide-y divide-[#edf1ee]">{customerRecords.filter((customer) => `${customer.name} ${customer.phone}`.toLowerCase().includes(customerSearch.trim().toLowerCase())).map((customer) => {
            const latestOrder = [...customer.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
            const latestInquiry = [...customer.inquiries].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
            const lastActivity = [latestOrder?.createdAt, latestInquiry?.createdAt].filter(Boolean).sort().at(-1);
            const spentEg = customer.orders.filter((order) => order.market === 'eg' && order.status === 'complete').reduce((sum, order) => sum + order.total, 0);
            const spentKsa = customer.orders.filter((order) => order.market === 'ksa' && order.status === 'complete').reduce((sum, order) => sum + order.total, 0);
            const validOrderCount = customer.orders.filter((order) => order.status !== 'cancelled').length;
            return <tr key={customer.key}><td className="p-3 font-semibold">{customer.name}{validOrderCount >= 3 && <span className="ms-2 rounded-full bg-amber-50 px-2 py-0.5 text-[9px] text-amber-800">VIP</span>}</td><td className="p-3 font-mono">{customer.phone}</td><td className="p-3">{validOrderCount}</td><td className="p-3">{customer.inquiries.length}</td><td className="p-3">{spentEg.toLocaleString()} ج.م</td><td className="p-3">{spentKsa.toLocaleString()} ر.س</td><td className="p-3">{lastActivity ? new Date(lastActivity).toLocaleDateString(isArabic ? 'ar-EG' : 'en-GB') : '—'}</td><td className="p-3"><a className="rounded-full bg-[#314f43] px-3 py-1.5 text-[10px] text-white" href={`https://wa.me/${customer.phone.replace(/\D/g, '')}`} rel="noreferrer" target="_blank">WhatsApp</a></td></tr>;
          })}</tbody></table></div>
        </section>
      )}

      {activeTab === 'channels' && (
        <div className="space-y-5 rounded-3xl border border-white bg-white/85 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#2f4437]">{isArabic ? 'روابط التواصل وطرق الدفع حسب البلد' : 'Social links & market payment methods'}</h2>
              <p className="text-[10px] text-[#788b80]">{siteDataReady ? (isArabic ? 'متصل بقاعدة البيانات' : 'Connected to database') : (isArabic ? 'حفظ محلي في هذا المتصفح' : 'Saved locally in this browser')}</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {socialDraft.map((item) => (
              <form className="space-y-2 rounded-2xl border border-[#e5ebe7] p-4" key={item.id} onSubmit={(event) => { event.preventDefault(); void onSaveSocialLink(item).then((saved) => onToast(saved ? (isArabic ? 'تم حفظ رابط التواصل' : 'Social link saved') : (isArabic ? 'تعذر حفظ رابط التواصل' : 'Could not save social link'))); }}>
                <h3 className="text-xs font-bold">{item.label}</h3>
                <input aria-label="Handle" className="h-9 w-full rounded-xl border px-3 text-xs" placeholder="Handle" value={item.handle} onChange={(event) => setSocialDraftState({ source: socialLinks, value: socialDraft.map((entry) => entry.id === item.id ? { ...entry, handle: event.target.value } : entry) })} />
                <input aria-label="URL" className="h-9 w-full rounded-xl border px-3 text-xs" placeholder="URL" value={item.url} onChange={(event) => setSocialDraftState({ source: socialLinks, value: socialDraft.map((entry) => entry.id === item.id ? { ...entry, url: event.target.value } : entry) })} />
                <button className="rounded-full bg-[#314f43] px-4 py-2 text-xs text-white" type="submit">{isArabic ? 'حفظ' : 'Save'}</button>
              </form>
            ))}
            <div className="md:col-span-2">
              <div className="mb-3 flex gap-2">
                {(['eg', 'ksa'] as const).map((targetMarket) => (
                  <button className={`rounded-full px-4 py-2 text-xs font-semibold ${paymentMarket === targetMarket ? 'bg-[#314f43] text-white' : 'border border-[#dce7df] text-[#52685b]'}`} key={targetMarket} onClick={() => setPaymentMarket(targetMarket)} type="button">
                    {targetMarket === 'eg' ? (isArabic ? 'مصر · EGP' : 'Egypt · EGP') : (isArabic ? 'السعودية · SAR' : 'Saudi Arabia · SAR')}
                  </button>
                ))}
              </div>
              <p className="mb-3 rounded-xl bg-[#fff8e8] px-3 py-2 text-[10px] leading-5 text-[#795e2e]">
                {isArabic
                  ? 'الدفع الإلكتروني لمصر يمر عبر Paymob بعد نشر وظائف الدفع وإضافة مفاتيح التاجر كأسرار في Supabase. لا تضع أي مفتاح سري في لوحة المتجر.'
                  : 'Egypt online payments use Paymob after deploying the payment functions and adding merchant credentials as Supabase secrets. Never put secret keys in this dashboard.'}
              </p>
              <form className="mb-4 flex gap-2" onSubmit={(event) => { event.preventDefault(); handleAddPaymentMethod(); }}>
                <input aria-label={isArabic ? 'إضافة وسيلة دفع' : 'Add payment method'} className="h-10 flex-1 rounded-xl border border-[#dfe8e2] px-3 text-xs" onChange={(event) => setNewPaymentMethodLabel(event.target.value)} placeholder={isArabic ? 'اسم وسيلة دفع جديدة لهذا البلد' : 'New payment method for this market'} value={newPaymentMethodLabel} />
                <button className="flex items-center gap-1 rounded-xl bg-[#314f43] px-4 text-xs font-semibold text-white" type="submit"><Plus className="h-3.5 w-3.5" />{isArabic ? 'إضافة' : 'Add'}</button>
              </form>
            </div>
            {paymentDraft.filter((item) => item.market === paymentMarket).map((item) => (
              <form className="space-y-2 rounded-2xl border border-[#e5ebe7] p-4" key={item.id} onSubmit={(event) => { event.preventDefault(); void onSavePaymentMethod(item).then((saved) => onToast(saved ? (isArabic ? 'تم حفظ طريقة الدفع' : 'Payment method saved') : (isArabic ? 'تعذر حفظ طريقة الدفع' : 'Could not save payment method'))); }}>
                <h3 className="text-xs font-bold">{item.method}</h3>
                <input aria-label="Payment label" className="h-9 w-full rounded-xl border px-3 text-xs" placeholder={isArabic ? 'اسم طريقة الدفع' : 'Payment method name'} value={item.label} onChange={(event) => setPaymentDraftState({ source: paymentMethods, value: paymentDraft.map((entry) => entry.id === item.id ? { ...entry, label: event.target.value } : entry) })} />
                <input aria-label="Account name" className="h-9 w-full rounded-xl border px-3 text-xs" placeholder={isArabic ? 'اسم الحساب' : 'Account name'} value={item.accountName} onChange={(event) => setPaymentDraftState({ source: paymentMethods, value: paymentDraft.map((entry) => entry.id === item.id ? { ...entry, accountName: event.target.value } : entry) })} />
                <input aria-label="Account number" className="h-9 w-full rounded-xl border px-3 text-xs" placeholder={isArabic ? 'رقم الحساب أو المحفظة' : 'Account or wallet number'} value={item.accountNumber} onChange={(event) => setPaymentDraftState({ source: paymentMethods, value: paymentDraft.map((entry) => entry.id === item.id ? { ...entry, accountNumber: event.target.value } : entry) })} />
                <input aria-label="Payment instructions Arabic" className="h-9 w-full rounded-xl border px-3 text-xs" placeholder="تعليمات الدفع بالعربية" value={item.instructions.ar} onChange={(event) => setPaymentDraftState({ source: paymentMethods, value: paymentDraft.map((entry) => entry.id === item.id ? { ...entry, instructions: { ...entry.instructions, ar: event.target.value } } : entry) })} />
                <input aria-label="Payment instructions English" className="h-9 w-full rounded-xl border px-3 text-xs" placeholder="Payment instructions in English" value={item.instructions.en} onChange={(event) => setPaymentDraftState({ source: paymentMethods, value: paymentDraft.map((entry) => entry.id === item.id ? { ...entry, instructions: { ...entry.instructions, en: event.target.value } } : entry) })} />
                <label className="flex items-center gap-2 text-xs"><input checked={item.active} onChange={(event) => setPaymentDraftState({ source: paymentMethods, value: paymentDraft.map((entry) => entry.id === item.id ? { ...entry, active: event.target.checked } : entry) })} type="checkbox" />{isArabic ? 'إظهار طريقة الدفع للعملاء' : 'Show this method to customers'}</label>
                <button className="rounded-full bg-[#314f43] px-4 py-2 text-xs text-white" type="submit">{isArabic ? 'حفظ' : 'Save'}</button>
              </form>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Dynamic Categories Management */}
      {activeTab === 'categories' && (
        <div className="rounded-3xl border border-white bg-white/85 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#2f4437]">
                {isArabic ? 'إدارة الأقسام والمجموعات' : 'Categories & Collections'}
              </h2>
              <p className="text-[10px] text-[#788b80]">
                {isArabic
                  ? 'أنشئ أقساماً فرعية داخل أي قسم، واربط المنتجات بها، وعدّل بانر كل قسم ونصوصه وصورته من هنا.'
                  : 'Create subcategories in any department, assign products, and edit each department banner, copy and image here.'}
              </p>
            </div>
            <button
              className="flex items-center gap-1.5 rounded-full bg-[#314f43] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#436e5d]"
              onClick={() => {
                setEditingCategoryId(null);
                setNewCatNameAr('');
                setNewCatNameEn('');
                setNewCatSlug('');
                setNewCatParentSlug('');
                setNewCatBannerTitleAr(''); setNewCatBannerTitleEn(''); setNewCatBannerTextAr(''); setNewCatBannerTextEn(''); setNewCatBannerImage('');
                setNewCatBannerAccent('#b7edcf');
                setNewCatExtraSlides([{ title: { ar: '', en: '' }, text: { ar: '', en: '' }, image: '' }, { title: { ar: '', en: '' }, text: { ar: '', en: '' }, image: '' }]);
                setShowCategoryModal(true);
              }}
              type="button"
            >
              <Plus className="h-3.5 w-3.5" />
              {isArabic ? 'إضافة قسم أو قسم فرعي' : 'Add Category'}
            </button>
          </div>

          <div className="mt-6 divide-y divide-[#edf1ee]">
            {categories.map((cat) => (
              <div className={`flex items-center justify-between py-3.5 ${cat.parentSlug ? 'ps-5' : ''}`} key={cat.id}>
                <div>
                  <h4 className="text-xs font-bold text-[#2c3f34]">
                    {cat.parentSlug ? '↳ ' : ''}{cat.name.ar} · {cat.name.en}
                  </h4>
                  <p className="text-[9px] text-[#819288]">
                    {cat.parentSlug
                      ? `${isArabic ? 'قسم فرعي داخل' : 'Subcategory of'} ${categories.find((parent) => parent.slug === cat.parentSlug)?.name[locale] ?? cat.parentSlug} · `
                      : ''}Slug: #{cat.slug}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    aria-label={isArabic ? `تعديل اسم ${cat.name.ar}` : `Rename ${cat.name.en}`}
                    className="p-1.5 text-[#496e5a] hover:text-[#234333]"
                    onClick={() => handleEditCategory(cat)}
                    type="button"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    className={`flex items-center gap-1 rounded-full px-3 py-1 text-[9px] font-semibold ${
                      cat.active ? 'bg-[#e4f6ec] text-[#347854]' : 'bg-[#f4eae9] text-[#9b5147]'
                    }`}
                    onClick={() => handleToggleCategory(cat.id)}
                    type="button"
                  >
                    {cat.active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    {cat.active ? (cat.parentSlug ? (isArabic ? 'ظاهر' : 'Visible') : (isArabic ? 'مفعّل بالنافبار' : 'Active')) : isArabic ? 'مخفي' : 'Hidden'}
                  </button>
                  {!['cards', 'fashion', 'services', 'cars', 'property'].includes(cat.slug)
                    && !INITIAL_CATEGORIES.some((builtIn) => builtIn.id === cat.id && builtIn.parentSlug)
                    && <button
                    className="p-1.5 text-[#a16f66] hover:text-[#c4493a]"
                    onClick={() => handleDeleteCategory(cat.id)}
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>}
                </div>
              </div>
            ))}
          </div>

          {/* New Category Modal */}
          {showCategoryModal && (
            <div className="fixed inset-0 z-110 flex items-center justify-center bg-black/40 p-4">
              <form
                className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white bg-white p-6 shadow-2xl"
                onSubmit={handleSaveCategory}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#2e4337]">{editingCategoryId ? isArabic ? 'تعديل القسم وتصميمه' : 'Edit department design' : isArabic ? 'إضافة قسم جديد' : 'Add New Category'}</h3>
                  <button onClick={() => { setShowCategoryModal(false); setEditingCategoryId(null); setNewCatNameAr(''); setNewCatNameEn(''); setNewCatSlug(''); setNewCatParentSlug(''); }} type="button">
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
                  {(!editingCategoryId || !['cards', 'fashion', 'services', 'cars', 'property'].includes(categories.find((category) => category.id === editingCategoryId)?.slug ?? '')) && (
                    <div>
                      <label className="text-[10px] text-[#607368]">{isArabic ? 'القسم الرئيسي (اختياري)' : 'Parent department (optional)'}</label>
                      <select className="mt-1 h-10 w-full rounded-xl border border-[#dfe8e2] bg-white px-3 text-xs" onChange={(event) => setNewCatParentSlug(event.target.value)} value={newCatParentSlug}>
                        <option value="">{isArabic ? 'قسم رئيسي مستقل' : 'Top-level category'}</option>
                        {categories.filter((category) => !category.parentSlug && category.slug !== categories.find((entry) => entry.id === editingCategoryId)?.slug).map((category) => (
                          <option key={category.id} value={category.slug}>{category.name[locale]}</option>
                        ))}
                      </select>
                      <p className="mt-1 text-[9px] leading-4 text-[#819288]">{isArabic ? 'اختر أي قسم رئيسي لإظهار المجموعة داخله.' : 'Choose any main department to show this collection inside it.'}</p>
                    </div>
                  )}
                  <div>
                    {!editingCategoryId && <>
                    <label className="text-[10px] text-[#607368]">{isArabic ? 'الرابط المختصر (Slug)' : 'URL Slug'}</label>
                    <input
                      className="mt-1 h-9 w-full rounded-xl border border-[#dfe8e2] px-3 text-xs outline-none"
                      onChange={(e) => setNewCatSlug(e.target.value)}
                      placeholder="electronics"
                      value={newCatSlug}
                    />
                    </>}
                  </div>
                  <div className="border-t border-[#edf1ee] pt-3">
                    <p className="mb-2 text-[10px] font-bold text-[#496e5a]">{isArabic ? 'بانر القسم المتحرك' : 'Animated department banner'}</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="text-[10px] text-[#607368]">{isArabic ? 'عنوان البانر بالعربي' : 'Banner title (Arabic)'}<input className="mt-1 h-9 w-full rounded-xl border border-[#dfe8e2] px-3 text-xs" onChange={(e) => setNewCatBannerTitleAr(e.target.value)} value={newCatBannerTitleAr} /></label>
                      <label className="text-[10px] text-[#607368]">{isArabic ? 'عنوان البانر بالإنجليزي' : 'Banner title (English)'}<input className="mt-1 h-9 w-full rounded-xl border border-[#dfe8e2] px-3 text-xs" onChange={(e) => setNewCatBannerTitleEn(e.target.value)} value={newCatBannerTitleEn} /></label>
                      <label className="text-[10px] text-[#607368]">{isArabic ? 'وصف البانر بالعربي' : 'Banner description (Arabic)'}<textarea className="mt-1 min-h-20 w-full rounded-xl border border-[#dfe8e2] p-3 text-xs" onChange={(e) => setNewCatBannerTextAr(e.target.value)} value={newCatBannerTextAr} /></label>
                      <label className="text-[10px] text-[#607368]">{isArabic ? 'وصف البانر بالإنجليزي' : 'Banner description (English)'}<textarea className="mt-1 min-h-20 w-full rounded-xl border border-[#dfe8e2] p-3 text-xs" onChange={(e) => setNewCatBannerTextEn(e.target.value)} value={newCatBannerTextEn} /></label>
                    </div>
                    <label className="mt-3 block text-[10px] text-[#607368]">{isArabic ? 'رابط صورة البانر' : 'Banner image URL'}<input className="mt-1 h-9 w-full rounded-xl border border-[#dfe8e2] px-3 text-xs" onChange={(e) => setNewCatBannerImage(e.target.value)} placeholder="https://…" value={newCatBannerImage} /></label>
                    <label className="mt-3 flex items-center gap-3 text-[10px] text-[#607368]">{isArabic ? 'لون التفاصيل' : 'Accent color'}<input aria-label={isArabic ? 'لون تفاصيل البانر' : 'Banner accent color'} className="h-9 w-14 cursor-pointer rounded-lg border border-[#dfe8e2] p-1" onChange={(e) => setNewCatBannerAccent(e.target.value)} type="color" value={/^#[0-9a-f]{6}$/i.test(newCatBannerAccent) ? newCatBannerAccent : '#b7edcf'} /><span className="font-mono">{newCatBannerAccent}</span></label>
                    <div className="mt-4 grid gap-3 lg:grid-cols-2">
                      {newCatExtraSlides.map((slide, index) => <div className="rounded-2xl border border-[#e5ece7] bg-[#f8faf8] p-3" key={`banner-slide-${index}`}>
                        <p className="mb-2 text-[10px] font-bold text-[#496e5a]">{isArabic ? `الشريحة ${index + 2}` : `Slide ${index + 2}`}</p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <input aria-label={isArabic ? 'عنوان الشريحة بالعربي' : 'Slide title Arabic'} className="h-9 rounded-xl border border-[#dfe8e2] px-3 text-xs" onChange={(e) => updateCategorySlide(index, 'title', 'ar', e.target.value)} placeholder={isArabic ? 'العنوان بالعربي' : 'Arabic title'} value={slide.title.ar} />
                          <input aria-label={isArabic ? 'عنوان الشريحة بالإنجليزي' : 'Slide title English'} className="h-9 rounded-xl border border-[#dfe8e2] px-3 text-xs" onChange={(e) => updateCategorySlide(index, 'title', 'en', e.target.value)} placeholder={isArabic ? 'العنوان بالإنجليزي' : 'English title'} value={slide.title.en} />
                          <textarea aria-label={isArabic ? 'وصف الشريحة بالعربي' : 'Slide text Arabic'} className="min-h-16 rounded-xl border border-[#dfe8e2] p-2 text-xs" onChange={(e) => updateCategorySlide(index, 'text', 'ar', e.target.value)} placeholder={isArabic ? 'الوصف بالعربي' : 'Arabic description'} value={slide.text.ar} />
                          <textarea aria-label={isArabic ? 'وصف الشريحة بالإنجليزي' : 'Slide text English'} className="min-h-16 rounded-xl border border-[#dfe8e2] p-2 text-xs" onChange={(e) => updateCategorySlide(index, 'text', 'en', e.target.value)} placeholder={isArabic ? 'الوصف بالإنجليزي' : 'English description'} value={slide.text.en} />
                        </div>
                        <input aria-label={isArabic ? 'صورة الشريحة' : 'Slide image URL'} className="mt-2 h-9 w-full rounded-xl border border-[#dfe8e2] px-3 text-xs" onChange={(e) => updateCategorySlide(index, 'image', 'ar', e.target.value)} placeholder="https:// image URL" value={slide.image} />
                      </div>)}
                    </div>
                    <div className="mt-4 overflow-hidden rounded-[2rem] border border-[#e5ece7] p-2">
                      <p className="mb-2 px-2 text-[10px] font-bold text-[#496e5a]">{isArabic ? 'معاينة مباشرة' : 'Live preview'}</p>
                      <DepartmentBanner locale={locale} name={newCatNameAr || newCatNameEn || (isArabic ? 'القسم الجديد' : 'New department')} accent={newCatBannerAccent} slides={[
                        { title: (locale === 'ar' ? newCatBannerTitleAr : newCatBannerTitleEn) || (newCatNameAr || newCatNameEn || (isArabic ? 'القسم الجديد' : 'New department')), text: (locale === 'ar' ? newCatBannerTextAr : newCatBannerTextEn) || (isArabic ? 'أضف وصفاً مميزاً لقسمك.' : 'Add a distinctive description for your department.'), image: newCatBannerImage || art.studioPortal },
                        ...newCatExtraSlides.filter((slide) => slide.title.ar || slide.title.en || slide.image).map((slide) => ({ title: slide.title[locale] || (newCatNameAr || newCatNameEn), text: slide.text[locale] || (isArabic ? 'وصف الشريحة' : 'Slide description'), image: slide.image || newCatBannerImage || art.studioPortal })),
                      ]} fallbackTitle={isArabic ? 'عنوان القسم' : 'Department title'} fallbackText={isArabic ? 'وصف القسم' : 'Department description'} fallbackImage={art.studioPortal} />
                    </div>
                    <p className="mt-1 text-[9px] text-[#819288]">{isArabic ? 'اترك الحقول فارغة لاستخدام التصميم والصورة الافتراضيين للقسم.' : 'Leave these fields empty to use the department’s built-in design and image.'}</p>
                  </div>
                </div>
                <button
                  className="mt-5 min-h-10 w-full rounded-full bg-[#314f43] text-xs font-semibold text-white hover:bg-[#436e5d]"
                  type="submit"
                >
                  {editingCategoryId ? isArabic ? 'حفظ تصميم القسم' : 'Save department design' : isArabic ? 'إنشاء القسم ونشره' : 'Create & publish department'}
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
                setProdSubcategoryId('');
                setProdPriceEg('');
                setProdPriceKsa('');
                setProdOldPriceEg('');
                setProdOldPriceKsa('');
                setProdImageUrl('');
                setProdSku('');
                setProdBrand('');
                setProdBadge('');
                setProdVariants('');
                setProdStock('');
                setProdMarkets(['eg', 'ksa']);
                setProdFeatured(false);
                setProdAvailable(true);
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
            <select aria-label={isArabic ? 'تصفية حالة المنتجات' : 'Filter products by status'} className="h-10 min-w-40 rounded-full border border-[#dfe7e1] bg-white px-4 text-xs text-[#52685b] outline-none focus:border-[#7fb59a]" onChange={(event) => setProductStatusFilter(event.target.value as typeof productStatusFilter)} value={productStatusFilter}>
              <option value="all">{isArabic ? 'كل الحالات' : 'All statuses'}</option>
              <option value="available">{isArabic ? 'متاح للبيع' : 'Available'}</option>
              <option value="hidden">{isArabic ? 'مخفي' : 'Hidden'}</option>
              <option value="low">{isArabic ? 'مخزون منخفض' : 'Low stock'}</option>
              <option value="out">{isArabic ? 'نفد المخزون' : 'Out of stock'}</option>
            </select>
            <button className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full border border-[#dfe7e1] bg-white px-4 text-xs font-semibold text-[#52685b] transition hover:bg-[#f4f8f5]" onClick={handleExportProductsCsv} type="button"><Download className="h-3.5 w-3.5" />{isArabic ? 'تصدير المنتجات CSV' : 'Export products CSV'}</button>
          </div>

          <div className="mt-4 divide-y divide-[#edf1ee]">
            {products
              .filter((prod) => {
                const q = productSearch.trim().toLowerCase();
                const matchesSearch = !q || (
                  prod.name.ar.toLowerCase().includes(q) ||
                  prod.name.en.toLowerCase().includes(q) ||
                  prod.category.toLowerCase().includes(q) ||
                  (categories.find((category) => category.slug === prod.subcategoryId)?.name[locale] ?? '').toLowerCase().includes(q)
                );
                if (!matchesSearch) return false;
                if (productStatusFilter === 'available' && (!prod.available || prod.stock === 0)) return false;
                if (productStatusFilter === 'hidden' && prod.available) return false;
                if (productStatusFilter === 'low' && (prod.stock === undefined || prod.stock === 0 || prod.stock > 5)) return false;
                if (productStatusFilter === 'out' && prod.stock !== 0) return false;
                return true;
              })
              .map((prod) => (
              <div className="flex items-center justify-between py-4" key={prod.id}>
                <div className="flex items-center gap-3">
                  <img alt={prod.name.ar} className="h-12 w-12 rounded-xl object-cover shadow-xs" src={publicAssetUrl(prod.imageUrl)} />
                  <div>
                    <h4 className="text-xs font-bold text-[#2c3f34]">
                      {prod.name.ar} · {prod.name.en}
                    </h4>
                    <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[10px] text-[#426b56]">
                      <span>
                        {prod.price.eg} ج.م / {prod.price.ksa} ر.س
                      </span>
                      <span className="rounded-full bg-[#eef5f0] px-2 py-0.5 text-[9px] font-semibold text-[#426b56]">
                        {categories.find((category) => category.slug === prod.subcategoryId)?.name[locale]
                          ?? categories.find((category) => category.slug === prod.category)?.name[locale]
                          ?? prod.category}
                      </span>
                      {prod.oldPrice && (
                        <span className="text-[#99a79f] line-through">
                          {prod.oldPrice.eg} ج.م
                        </span>
                      )}
                      {prod.sku && (
                        <span className="font-mono text-[9px] text-[#8a9a90]">{prod.sku}</span>
                      )}
                      {prod.stock !== undefined && (
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${prod.stock === 0 ? 'bg-red-50 text-red-700' : prod.stock <= 5 ? 'bg-amber-50 text-amber-700' : 'bg-[#eef5f0] text-[#3f6c56]'}`}>
                          {prod.stock === 0 ? (isArabic ? 'نفد المخزون' : 'Out of stock') : `${prod.stock} ${isArabic ? 'قطعة' : 'in stock'}`}
                        </span>
                      )}
                      {prod.brand && (
                        <span className="rounded-full bg-[#eef5f0] px-2 py-0.5 text-[9px] font-semibold text-[#3f6c56]">
                          {prod.brand}
                        </span>
                      )}
                      {prod.featured && (
                        <span className="rounded-full bg-[#fdf3dd] px-2 py-0.5 text-[9px] font-semibold text-[#9a7628]">
                          ★ {isArabic ? 'مميز' : 'Featured'}
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
                    aria-label={isArabic ? 'إنشاء نسخة من المنتج' : 'Duplicate product'}
                    className="p-1.5 text-[#517663] hover:text-[#2d4b3b]"
                    onClick={() => handleDuplicateProduct(prod)}
                    title={isArabic ? 'إنشاء نسخة مخفية قابلة للتعديل' : 'Create an editable hidden copy'}
                    type="button"
                  >
                    <Copy className="h-4 w-4" />
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
                      onChange={(e) => { setProdCat(e.target.value); setProdSubcategoryId(''); }}
                      value={prodCat}
                    >
                      {categories.filter((category) => !category.parentSlug).map((c) => (
                        <option key={c.id} value={c.slug}>
                          {c.name.ar}
                        </option>
                      ))}
                    </select>
                  </div>
                  {categories.some((category) => category.parentSlug === prodCat) && (
                    <div>
                      <label className="text-[10px] text-[#607368]">{isArabic ? 'القسم الفرعي' : 'Collection'}</label>
                      <select className="mt-1 h-9 w-full rounded-xl border border-[#dfe8e2] bg-white px-3 text-xs outline-none" onChange={(event) => setProdSubcategoryId(event.target.value)} value={prodSubcategoryId}>
                        <option value="">{isArabic ? 'بدون قسم فرعي' : 'No subcategory'}</option>
                        {categories.filter((category) => category.parentSlug === prodCat).map((category) => (
                          <option key={category.id} value={category.slug}>{category.name[locale]}</option>
                        ))}
                      </select>
                    </div>
                  )}

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

                  {/* Merchandising fields: SKU, brand label, promo badge,
                      size variants and featured/availability flags. */}
                  <div>
                    <label className="text-[10px] text-[#607368]">{isArabic ? 'كود المنتج (SKU)' : 'SKU / Product Code'}</label>
                    <input
                      className="mt-1 h-9 w-full rounded-xl border border-[#dfe8e2] px-3 text-xs outline-none"
                      onChange={(e) => setProdSku(e.target.value)}
                      placeholder="ZX-CARD-001"
                      value={prodSku}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#607368]">{isArabic ? 'الماركة / البراند' : 'Brand'}</label>
                    <input
                      className="mt-1 h-9 w-full rounded-xl border border-[#dfe8e2] px-3 text-xs outline-none"
                      onChange={(e) => setProdBrand(e.target.value)}
                      placeholder={isArabic ? 'مثال: ZEXOR Studio' : 'e.g. ZEXOR Studio'}
                      value={prodBrand}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#607368]">{isArabic ? 'شارة ترويجية (Badge)' : 'Promo Badge'}</label>
                    <input
                      className="mt-1 h-9 w-full rounded-xl border border-[#dfe8e2] px-3 text-xs outline-none"
                      onChange={(e) => setProdBadge(e.target.value)}
                      placeholder={isArabic ? 'جديد / إصدار محدود' : 'New / Limited'}
                      value={prodBadge}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#607368]">{isArabic ? 'المقاسات / الخيارات (افصل بفاصلة)' : 'Variants (comma separated)'}</label>
                    <input
                      className="mt-1 h-9 w-full rounded-xl border border-[#dfe8e2] px-3 text-xs outline-none"
                      onChange={(e) => setProdVariants(e.target.value)}
                      placeholder="S, M, L, XL"
                      value={prodVariants}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#607368]">{isArabic ? 'كمية المخزون (اتركه فارغاً لمخزون غير محدود)' : 'Stock quantity (leave blank for untracked)'}</label>
                    <input className="mt-1 h-9 w-full rounded-xl border border-[#dfe8e2] px-3 text-xs outline-none" min="0" onChange={(e) => setProdStock(e.target.value)} placeholder={isArabic ? 'مثال: 25' : 'e.g. 25'} type="number" value={prodStock} />
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-[#dfe8e2] p-3">
                    <span className="text-[10px] font-semibold text-[#607368]">{isArabic ? 'أسواق العرض' : 'Markets'}</span>
                    {(['eg', 'ksa'] as const).map((marketKey) => <label className="flex items-center gap-1.5 text-[10px]" key={marketKey}><input checked={prodMarkets.includes(marketKey)} onChange={(event) => setProdMarkets((current) => event.target.checked ? [...current, marketKey] : current.filter((item) => item !== marketKey))} type="checkbox" />{marketKey === 'eg' ? (isArabic ? 'مصر' : 'Egypt') : (isArabic ? 'السعودية' : 'Saudi Arabia')}</label>)}
                  </div>
                  <div className="flex items-center gap-4 sm:col-span-2">
                    <label className="flex flex-1 items-center justify-between rounded-2xl border border-[#dfe8e2] bg-[#fbfdfa] p-3 text-xs font-semibold text-[#3b5546]">
                      <span>{isArabic ? 'منتج مميز (يظهر في المقدمة)' : 'Featured product'}</span>
                      <input
                        checked={prodFeatured}
                        className="h-4 w-4 accent-[#314f43]"
                        onChange={(e) => setProdFeatured(e.target.checked)}
                        type="checkbox"
                      />
                    </label>
                    <label className="flex flex-1 items-center justify-between rounded-2xl border border-[#dfe8e2] bg-[#fbfdfa] p-3 text-xs font-semibold text-[#3b5546]">
                      <span>{isArabic ? 'متوفر للبيع' : 'Available for sale'}</span>
                      <input
                        checked={prodAvailable}
                        className="h-4 w-4 accent-[#314f43]"
                        onChange={(e) => setProdAvailable(e.target.checked)}
                        type="checkbox"
                      />
                    </label>
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
                setCarDeal('Rent');
                setCarRentalPeriod('Day');
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
                return `${v.title.ar} ${v.title.en} ${v.make} ${v.id} ${v.deal ?? 'Rent'}`.toLowerCase().includes(q);
              })
              .map((v) => (
              <div className="flex items-center justify-between py-4" key={v.id}>
                <div className="flex items-center gap-3">
                  <img alt={v.title.ar} className="h-12 w-16 rounded-xl object-cover" src={publicAssetUrl(v.photo)} />
                  <div>
                    <h4 className="text-xs font-bold text-[#2d4236]">{v.title.ar}</h4>
                    <p className="text-[10px] text-[#697d72]">
                      {v.make} · {v.year} · {v.price.toLocaleString()} {v.region === 'Riyadh' || v.region === 'Jeddah' ? 'ر.س' : 'ج.م'}{v.deal === 'Rent' ? ` / ${isArabic ? ({ Day: 'يوم', Week: 'أسبوع', Month: 'شهر' } as const)[v.rentalPeriod ?? 'Day'] : (v.rentalPeriod ?? 'Day').toLowerCase()}` : ''} · {v.deal === 'Rent' ? (isArabic ? 'إيجار' : 'Rent') : isArabic ? 'بيع' : 'Sale'}
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
                    <label className="text-[10px] text-[#5e7166]">{isArabic ? carDeal === 'Rent' ? 'سعر الإيجار للفترة المختارة' : 'سعر البيع' : carDeal === 'Rent' ? 'Rental price for selected period' : 'Sale price'}</label>
                    <input className="mt-1 h-9 w-full rounded-xl border border-[#dfe7e1] px-3 text-xs outline-none" onChange={(e) => setCarPrice(e.target.value)} required type="number" value={carPrice} />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#5e7166]">{isArabic ? 'نوع العرض' : 'Listing type'}</label>
                    <select className="mt-1 h-9 w-full rounded-xl border border-[#dfe7e1] bg-white px-3 text-xs" onChange={(e) => setCarDeal(e.target.value as 'Sale' | 'Rent')} value={carDeal}>
                      <option value="Sale">{isArabic ? 'بيع بتفويض من المالك' : 'Owner-authorized sale'}</option>
                      <option value="Rent">{isArabic ? 'للإيجار' : 'For rent'}</option>
                    </select>
                    <p className="mt-1 text-[9px] leading-4 text-[#819288]">{isArabic ? 'اختر البيع فقط إذا طلب المالك تسويق سيارته للبيع.' : 'Choose sale only when the owner has asked you to market their vehicle.'}</p>
                  </div>
                  {carDeal === 'Rent' && <div>
                    <label className="text-[10px] text-[#5e7166]">{isArabic ? 'مدة الإيجار' : 'Rental period'}</label>
                    <select className="mt-1 h-9 w-full rounded-xl border border-[#dfe7e1] bg-white px-3 text-xs" onChange={(e) => setCarRentalPeriod(e.target.value as 'Day' | 'Week' | 'Month')} value={carRentalPeriod}>
                      <option value="Day">{isArabic ? 'باليوم' : 'Per day'}</option>
                      <option value="Week">{isArabic ? 'بالأسبوع' : 'Per week'}</option>
                      <option value="Month">{isArabic ? 'بالشهر' : 'Per month'}</option>
                    </select>
                  </div>}
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
                      <option value="Used">{isArabic ? 'مستعمل' : 'Pre-owned'}</option>
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
                      {carPhoto && <img alt="" className="h-9 w-12 rounded-lg object-cover" src={publicAssetUrl(carPhoto)} />}
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
                setPropDeal('Rent');
                setPropRentalPeriod('Month');
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
                  <img alt={p.title.ar} className="h-12 w-16 rounded-xl object-cover" src={publicAssetUrl(p.photo)} />
                  <div>
                    <h4 className="text-xs font-bold text-[#2d4236]">{p.title.ar}</h4>
                    <p className="text-[10px] text-[#697d72]">
                      {p.type} · {p.deal === 'Sale' ? (isArabic ? 'بيع بتفويض المالك' : 'Owner-authorized sale') : isArabic ? `إيجار ${p.rentalPeriod === 'Year' ? 'سنوي' : 'شهري'}` : `Rent · ${p.rentalPeriod === 'Year' ? 'yearly' : 'monthly'}`} · {p.price.toLocaleString()}
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
                      <option value="Sale">{isArabic ? 'بيع بتفويض من المالك' : 'Owner-authorized sale'}</option>
                      <option value="Rent">{isArabic ? 'للإيجار' : 'Rent'}</option>
                    </select>
                  </div>
                  {propDeal === 'Rent' && <div>
                    <label className="text-[10px] text-[#5e7166]">{isArabic ? 'مدة الإيجار' : 'Rental period'}</label>
                    <select className="mt-1 h-9 w-full rounded-xl border border-[#dfe7e1] bg-white px-3 text-xs" onChange={(e) => setPropRentalPeriod(e.target.value as 'Month' | 'Year')} value={propRentalPeriod}>
                      <option value="Month">{isArabic ? 'شهري' : 'Monthly'}</option>
                      <option value="Year">{isArabic ? 'سنوي' : 'Yearly'}</option>
                    </select>
                  </div>}
                  <div>
                    <label className="text-[10px] text-[#5e7166]">{isArabic ? propDeal === 'Rent' ? `قيمة الإيجار ${propRentalPeriod === 'Year' ? 'السنوية' : 'الشهرية'}` : 'سعر البيع بتفويض المالك' : propDeal === 'Rent' ? `Rent price (${propRentalPeriod === 'Year' ? 'yearly' : 'monthly'})` : 'Owner-authorized sale price'}</label>
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
                      {propPhoto && <img alt="" className="h-9 w-12 rounded-lg object-cover" src={publicAssetUrl(propPhoto)} />}
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
              <div className="flex items-center gap-1 rounded-xl bg-[#f2f6f3] p-1">
                <button
                  aria-pressed={orderArchiveView === 'active'}
                  className={`rounded-lg px-3 py-2 text-[10px] font-semibold transition ${orderArchiveView === 'active' ? 'bg-white text-[#294638] shadow-sm' : 'text-[#718278]'}`}
                  onClick={() => setOrderArchiveView('active')}
                  type="button"
                >
                  {isArabic ? `الطلبات (${orders.filter((order) => !order.archived).length})` : `Orders (${orders.filter((order) => !order.archived).length})`}
                </button>
                <button
                  aria-pressed={orderArchiveView === 'archived'}
                  className={`rounded-lg px-3 py-2 text-[10px] font-semibold transition ${orderArchiveView === 'archived' ? 'bg-white text-[#294638] shadow-sm' : 'text-[#718278]'}`}
                  onClick={() => setOrderArchiveView('archived')}
                  type="button"
                >
                  {isArabic ? `الأرشيف (${orders.filter((order) => order.archived).length})` : `Archive (${orders.filter((order) => order.archived).length})`}
                </button>
              </div>
              <button className="flex h-9 items-center gap-1.5 rounded-xl border border-[#dfe8e2] bg-white px-3 text-xs font-semibold text-[#3b5949]" onClick={handleExportOrdersCsv} type="button"><Download className="h-3.5 w-3.5" />{isArabic ? 'تصدير CSV' : 'Export CSV'}</button>
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
                onChange={(e) => setOrderMarketFilter(e.target.value as typeof orderMarketFilter)}
                value={orderMarketFilter}
              >
                <option value="all">{isArabic ? 'كل الأسواق' : 'All markets'}</option>
                <option value="eg">{isArabic ? 'مصر' : 'Egypt'}</option>
                <option value="ksa">{isArabic ? 'السعودية' : 'Saudi Arabia'}</option>
              </select>
              <select
                className="h-9 rounded-xl border border-[#dfe8e2] bg-white px-3 text-xs text-[#2e4537] outline-none"
                onChange={(e) => setOrderStatusFilter(e.target.value as typeof orderStatusFilter)}
                value={orderStatusFilter}
              >
                <option value="all">{isArabic ? 'كل الحالات' : 'All Statuses'}</option>
                <option value="new">{isArabic ? 'جديد (قيد المتابعة)' : 'New'}</option>
                <option value="confirmed">{isArabic ? 'مؤكد' : 'Confirmed'}</option>
                <option value="complete">{isArabic ? 'مكتمل' : 'Complete'}</option>
                <option value="cancelled">{isArabic ? 'ملغي' : 'Cancelled'}</option>
              </select>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[760px] text-start text-xs text-[#3a5244]">
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
                  <Fragment key={order.id}>
                  <tr>
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
                              : order.status === 'cancelled' ? 'bg-[#f1f2f1] text-[#69766f]' : 'bg-[#e4f6ec] text-[#347854]'
                        }`}
                      >
                        {order.status === 'new' ? (isArabic ? 'جديد' : 'New') : order.status === 'confirmed' ? (isArabic ? 'مؤكد' : 'Confirmed') : order.status === 'cancelled' ? (isArabic ? 'ملغي' : 'Cancelled') : isArabic ? 'مكتمل' : 'Complete'}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <select
                          aria-label={isArabic ? 'تحديث حالة الطلب' : 'Update order status'}
                          className="rounded-lg border border-[#dfe8e2] bg-white px-2 py-1 text-[9px]"
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as CustomerOrder['status'])}
                          value={order.status}
                        >
                          <option value="new">{isArabic ? 'جديد' : 'New'}</option>
                          <option value="confirmed">{isArabic ? 'مؤكد' : 'Confirmed'}</option>
                          <option value="complete">{isArabic ? 'مكتمل' : 'Complete'}</option>
                          <option value="cancelled">{isArabic ? 'ملغي' : 'Cancelled'}</option>
                        </select>
                        <button className="rounded-lg border border-[#dfe8e2] px-2 py-1 text-[9px]" onClick={() => setOrderDetailsId((current) => current === order.id ? null : order.id)} type="button">{orderDetailsId === order.id ? (isArabic ? 'إخفاء' : 'Hide') : (isArabic ? 'تفاصيل' : 'Details')}</button>
                        <button
                          aria-label={order.archived ? (isArabic ? 'استعادة الطلب' : 'Restore order') : (isArabic ? 'أرشفة الطلب' : 'Archive order')}
                          className="rounded-lg border border-[#dfe8e2] p-1.5 text-[#496d58] transition hover:bg-[#edf5f0]"
                          onClick={() => void handleArchiveOrder(order)}
                          title={order.archived ? (isArabic ? 'استعادة من الأرشيف' : 'Restore from archive') : (isArabic ? 'نقل إلى الأرشيف' : 'Move to archive')}
                          type="button"
                        >
                          {order.archived ? <ArchiveRestore className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          aria-label={isArabic ? 'حذف الطلب نهائيًا' : 'Permanently delete order'}
                          className="rounded-lg border border-[#f0d9d5] p-1.5 text-[#ad5e51] transition hover:bg-[#fff2ef]"
                          onClick={() => void handleDeleteOrder(order)}
                          title={isArabic ? 'حذف نهائي' : 'Delete permanently'}
                          type="button"
                        ><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                  {orderDetailsId === order.id && (
                    <tr>
                      <td className="bg-[#f7faf8] px-4 py-3" colSpan={6}>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <p className="font-semibold">{isArabic ? 'المنتجات' : 'Items'}</p>
                            <ul className="mt-1 space-y-1 text-[10px]">{order.items.map((item, index) => <li key={`${item.productId}-${index}`}>{item.quantity} × {item.name}{item.variant ? ` · ${item.variant}` : ''}</li>)}</ul>
                          </div>
                          <div className="space-y-1 text-[10px]">
                            <p><strong>{isArabic ? 'تاريخ الطلب:' : 'Placed:'}</strong> {new Date(order.createdAt).toLocaleString(isArabic ? 'ar-EG' : 'en-GB')}</p>
                            <p><strong>{isArabic ? 'طريقة الدفع:' : 'Payment:'}</strong> {order.paymentMethod || '—'}</p>
                            {order.paymentStatus && <p><strong>{isArabic ? 'حالة الدفع:' : 'Payment status:'}</strong> {order.paymentStatus === 'paid' ? (isArabic ? 'مدفوع' : 'Paid') : order.paymentStatus === 'pending' ? (isArabic ? 'بانتظار الدفع' : 'Awaiting payment') : order.paymentStatus === 'failed' ? (isArabic ? 'لم يكتمل الدفع' : 'Payment failed') : order.paymentStatus === 'refunded' ? (isArabic ? 'مسترد' : 'Refunded') : (isArabic ? 'غير مدفوع' : 'Unpaid')}</p>}
                            <p><strong>{isArabic ? 'كود الخصم:' : 'Promo:'}</strong> {order.promoCode || '—'}</p>
                            <p><strong>{isArabic ? 'الخصم:' : 'Discount:'}</strong> {order.discount} {order.market === 'eg' ? 'ج.م' : 'ر.س'}</p>
                            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                              <select aria-label={isArabic ? 'شركة الشحن' : 'Shipping carrier'} className="rounded-lg border border-[#dfe8e2] bg-white px-2.5 py-2 text-[10px]" onChange={(event) => setShippingDrafts((current) => ({ ...current, [order.id]: { ...current[order.id], shippingCarrier: event.target.value === '__other__' ? (settings.shippingCarriers?.[order.market]?.includes(current[order.id]?.shippingCarrier ?? order.shippingCarrier ?? '') ? '' : current[order.id]?.shippingCarrier ?? order.shippingCarrier ?? '') : event.target.value, trackingNumber: current[order.id]?.trackingNumber ?? order.trackingNumber ?? '', trackingUrl: current[order.id]?.trackingUrl ?? order.trackingUrl ?? '' } }))} value={(settings.shippingCarriers?.[order.market] ?? []).includes(shippingDrafts[order.id]?.shippingCarrier ?? order.shippingCarrier ?? '') ? shippingDrafts[order.id]?.shippingCarrier ?? order.shippingCarrier ?? '' : '__other__'}>
                                <option value="__other__">{isArabic ? 'شركة أخرى / اكتب الاسم' : 'Other / enter name'}</option>
                                {(settings.shippingCarriers?.[order.market] ?? []).map((carrier) => <option key={carrier} value={carrier}>{carrier}</option>)}
                              </select>
                              {(!(settings.shippingCarriers?.[order.market] ?? []).includes(shippingDrafts[order.id]?.shippingCarrier ?? order.shippingCarrier ?? '')) && <input aria-label={isArabic ? 'اسم شركة الشحن الأخرى' : 'Other carrier name'} className="rounded-lg border border-[#dfe8e2] bg-white px-2.5 py-2 text-[10px]" maxLength={100} onChange={(event) => setShippingDrafts((current) => ({ ...current, [order.id]: { ...current[order.id], shippingCarrier: event.target.value, trackingNumber: current[order.id]?.trackingNumber ?? order.trackingNumber ?? '', trackingUrl: current[order.id]?.trackingUrl ?? order.trackingUrl ?? '' } }))} placeholder={isArabic ? 'اكتب اسم شركة الشحن' : 'Enter carrier name'} value={shippingDrafts[order.id]?.shippingCarrier ?? order.shippingCarrier ?? ''} />}
                              <input aria-label={isArabic ? 'رقم التتبع' : 'Tracking number'} className="rounded-lg border border-[#dfe8e2] bg-white px-2.5 py-2 text-[10px]" onChange={(event) => setShippingDrafts((current) => ({ ...current, [order.id]: { ...current[order.id], shippingCarrier: current[order.id]?.shippingCarrier ?? order.shippingCarrier ?? '', trackingNumber: event.target.value, trackingUrl: current[order.id]?.trackingUrl ?? order.trackingUrl ?? '' } }))} placeholder={isArabic ? 'رقم التتبع' : 'Tracking number'} value={shippingDrafts[order.id]?.trackingNumber ?? order.trackingNumber ?? ''} />
                              <input aria-label={isArabic ? 'رابط تتبع الشحنة' : 'Shipment tracking link'} className="rounded-lg border border-[#dfe8e2] bg-white px-2.5 py-2 text-[10px] sm:col-span-2" dir="ltr" onChange={(event) => setShippingDrafts((current) => ({ ...current, [order.id]: { ...current[order.id], shippingCarrier: current[order.id]?.shippingCarrier ?? order.shippingCarrier ?? '', trackingNumber: current[order.id]?.trackingNumber ?? order.trackingNumber ?? '', trackingUrl: event.target.value } }))} placeholder="https://…" value={shippingDrafts[order.id]?.trackingUrl ?? order.trackingUrl ?? ''} />
                              <button className="rounded-full bg-[#314f43] px-3 py-2 text-[10px] font-semibold text-white sm:col-span-2" onClick={() => void handleSaveShipping(order)} type="button">{isArabic ? 'حفظ بيانات الشحن' : 'Save shipment details'}</button>
                            </div>
                            <a className="mt-2 inline-flex rounded-full bg-[#314f43] px-3 py-1.5 text-white" href={`https://wa.me/${order.phone.replace(/\D/g, '')}`} rel="noreferrer" target="_blank">{isArabic ? 'مراسلة العميل على واتساب' : 'Message on WhatsApp'}</a>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  </Fragment>
                ))}
              </tbody>
            </table>
            {filteredOrders.length === 0 && (
              <p className="border-t border-[#edf1ee] px-4 py-12 text-center text-xs text-[#829288]">
                {orderArchiveView === 'archived'
                  ? isArabic ? 'الأرشيف فارغ حاليًا.' : 'The archive is empty.'
                  : isArabic ? 'لا توجد طلبات مطابقة للفلاتر.' : 'No orders match these filters.'}
              </p>
            )}
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
                onClick={async () => {
                  if (window.confirm(isArabic ? 'مسح كل الاستفسارات؟' : 'Clear all inquiries?')) {
                    const cleared = await onClearInquiries();
                    if (!cleared) {
                      onToast(isArabic ? 'تعذر مسح الاستفسارات من قاعدة البيانات.' : 'Could not clear inquiries from the database.');
                      return;
                    }
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
              const expiryTime = Date.parse(`${expiresAt}T23:59:59.999`);
              if (!/^[A-Z0-9_-]{3,24}$/.test(code) || !Number.isFinite(discount) || discount <= 0 || discount > 90 || !Number.isFinite(expiryTime) || expiryTime < Date.now()) {
                onToast(isArabic ? 'تحقق من الكود ونسبة الخصم وتاريخ الانتهاء.' : 'Check the code, discount percentage, and expiry date.');
                return;
              }
              if (promoCodes.some((promo) => promo.code.toUpperCase() === code)) {
                onToast(isArabic ? 'كود الخصم موجود بالفعل.' : 'That promo code already exists.');
                return;
              }
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
      {activeTab === 'sales' && (
        <section className="space-y-5 rounded-3xl border border-white bg-white/85 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="text-base font-bold text-[#2f4437]">{isArabic ? 'تقارير المبيعات' : 'Sales analytics'}</h2><p className="mt-1 text-[10px] text-[#788b80]">{isArabic ? 'الإيرادات هنا للطلبات المكتملة فقط، وكل سوق بعملته.' : 'Revenue includes completed orders only; each market stays in its own currency.'}</p></div>
            <select aria-label={isArabic ? 'فترة التقرير' : 'Report period'} className="h-10 rounded-xl border border-[#dfe8e2] bg-white px-3 text-xs" onChange={(event) => setSalesPeriodDays(Number(event.target.value) as 7 | 30)} value={salesPeriodDays}><option value={7}>{isArabic ? 'آخر ٧ أيام' : 'Last 7 days'}</option><option value={30}>{isArabic ? 'آخر ٣٠ يوماً' : 'Last 30 days'}</option></select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-[#f4f8f5] p-4"><span className="text-[10px] text-[#788b80]">{isArabic ? 'طلبات الفترة' : 'Orders in period'}</span><p className="mt-1 text-xl font-bold">{periodOrders.length}</p></div>
            <div className="rounded-2xl bg-[#f4f8f5] p-4"><span className="text-[10px] text-[#788b80]">{isArabic ? 'مكتملة' : 'Completed'}</span><p className="mt-1 text-xl font-bold">{periodCompletedOrders.length}</p></div>
            <div className="rounded-2xl bg-[#f4f8f5] p-4"><span className="text-[10px] text-[#788b80]">{isArabic ? 'إيراد مصر' : 'Egypt revenue'}</span><p className="mt-1 text-xl font-bold">{periodCompletedOrders.filter((order) => order.market === 'eg').reduce((sum, order) => sum + order.total, 0).toLocaleString()} ج.م</p></div>
            <div className="rounded-2xl bg-[#f4f8f5] p-4"><span className="text-[10px] text-[#788b80]">{isArabic ? 'إيراد السعودية' : 'Saudi revenue'}</span><p className="mt-1 text-xl font-bold">{periodCompletedOrders.filter((order) => order.market === 'ksa').reduce((sum, order) => sum + order.total, 0).toLocaleString()} ر.س</p></div>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            {(['eg', 'ksa'] as const).map((marketKey) => {
              const maximum = Math.max(1, ...salesTimeline.map((day) => day[marketKey]));
              return <div className="rounded-2xl border border-[#edf1ee] p-4" key={marketKey}>
                <h3 className="text-xs font-bold">{marketKey === 'eg' ? (isArabic ? 'إيرادات مصر · ج.م' : 'Egypt revenue · EGP') : (isArabic ? 'إيرادات السعودية · ر.س' : 'Saudi revenue · SAR')}</h3>
                <div className="mt-5 flex h-40 items-end gap-1 overflow-x-auto border-b border-[#e8efea] pb-2">{salesTimeline.map((day) => <div className="flex h-full min-w-5 flex-1 flex-col items-center justify-end gap-1" key={localDateKey(day.date)} title={`${day.date.toLocaleDateString()} · ${day[marketKey].toLocaleString()} ${marketKey === 'eg' ? 'EGP' : 'SAR'} · ${day.count} orders`}><div className="w-full max-w-7 rounded-t-md bg-[#5a9677] transition-all" style={{ height: `${day[marketKey] ? Math.max(4, day[marketKey] / maximum * 100) : 0}%` }} /><span className="text-[8px] text-[#829288]">{day.date.toLocaleDateString(isArabic ? 'ar-EG' : 'en-GB', { day: 'numeric', month: salesPeriodDays === 7 ? undefined : 'short' })}</span></div>)}</div>
              </div>;
            })}
          </div>
          <div className="rounded-2xl border border-[#edf1ee] p-4">
            <h3 className="text-xs font-bold">{isArabic ? 'الأكثر مبيعاً في الفترة' : 'Top products in this period'}</h3>
            {bestSellers.length ? <div className="mt-3 divide-y divide-[#edf1ee]">{bestSellers.map(([id, product], index) => <div className="flex items-center justify-between gap-3 py-2 text-xs" key={id}><span className="font-semibold">{index + 1}. {product.name}</span><span className="text-[#62786b]">{product.quantity} {isArabic ? 'قطعة' : 'sold'} · {product.revenueEg.toLocaleString()} ج.م / {product.revenueKsa.toLocaleString()} ر.س</span></div>)}</div> : <p className="mt-3 text-xs text-[#829288]">{isArabic ? 'لا توجد طلبات مكتملة في هذه الفترة.' : 'No completed orders in this period yet.'}</p>}
          </div>
        </section>
      )}

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

          <div className="mt-5 grid gap-4 rounded-2xl border border-[#e7efe9] bg-[#fbfdfa] p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <label className="block text-[10px] font-semibold text-[#486b59]">
              {isArabic ? 'اسم المتجر الظاهر' : 'Store name'}
              <input
                className="mt-1 h-10 w-full rounded-xl border border-[#dfe8e2] bg-white px-3 text-sm font-semibold text-[#2e4537] outline-none"
                maxLength={32}
                onChange={(event) => setSettings((previous) => ({ ...previous, brand: { ...previous.brand, name: event.target.value } }))}
                onBlur={() => setSettings((previous) => ({ ...previous, brand: { ...previous.brand, name: previous.brand.name.trim() || 'ZEXOR' } }))}
                placeholder="ZEXOR"
                value={settings.brand.name}
              />
            </label>
            <label className="block text-[10px] font-semibold text-[#486b59]">
              {isArabic ? 'رابط صورة الشعار (اختياري)' : 'Logo image URL (optional)'}
              <input
                className="mt-1 h-10 w-full rounded-xl border border-[#dfe8e2] bg-white px-3 text-xs text-[#2e4537] outline-none"
                dir="ltr"
                onChange={(event) => setSettings((previous) => ({ ...previous, brand: { ...previous.brand, logoUrl: event.target.value } }))}
                placeholder="https://… or /images/logo.png"
                value={settings.brand.logoUrl}
              />
            </label>
            <div className="flex items-center gap-2">
              <input
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  if (file.size > 1024 * 1024) {
                    onToast(isArabic ? 'حجم الشعار يجب ألا يتجاوز ١ ميجابايت.' : 'Logo image must be 1 MB or smaller.');
                    event.target.value = '';
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = () => {
                    if (typeof reader.result === 'string') {
                      setSettings((previous) => ({ ...previous, brand: { ...previous.brand, logoUrl: reader.result as string } }));
                      onToast(isArabic ? 'تم تحديث الشعار.' : 'Logo updated.');
                    }
                  };
                  reader.readAsDataURL(file);
                  event.target.value = '';
                }}
                ref={brandLogoInputRef}
                type="file"
              />
              <button className="flex h-10 items-center gap-2 rounded-xl border border-[#dfe8e2] bg-white px-3 text-[10px] font-semibold text-[#3b5949]" onClick={() => brandLogoInputRef.current?.click()} type="button">
                <UploadCloud className="h-4 w-4" />{isArabic ? 'رفع الشعار' : 'Upload logo'}
              </button>
              {settings.brand.logoUrl && <img alt={isArabic ? 'معاينة الشعار' : 'Logo preview'} className="h-10 w-10 rounded-xl border border-[#e7efe9] bg-white object-contain p-1" src={settings.brand.logoUrl.startsWith('data:') ? settings.brand.logoUrl : publicAssetUrl(settings.brand.logoUrl)} />}
            </div>
          </div>

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
                  brand: { name: 'ZEXOR', logoUrl: '', primary: '#314f43', accent: '#4e8e6f', ink: '#21362b', radius: 1.5, fontScale: 1 },
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
          <div className="rounded-3xl border border-white bg-white/85 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-[#2f4437]">{isArabic ? 'الشحن والضريبة والدفع عند الاستلام' : 'Shipping, tax & cash on delivery'}</h3>
            <p className="mt-1 text-[10px] text-[#788b80]">{isArabic ? 'تُطبّق هذه القيم على الإجمالي في صفحة الدفع حسب البلد.' : 'These settings update checkout totals for both markets.'}</p>
            <div className="mt-4 rounded-2xl border border-[#e5ebe7] p-4">
              <h4 className="text-xs font-bold text-[#3b5546]">{isArabic ? 'أسعار التوصيل التقديرية حسب المنطقة' : 'Estimated delivery fees by area'}</h4>
              <p className="mt-1 text-[10px] leading-5 text-[#788b80]">{isArabic ? 'عدّل الرسوم لتطابق تعاقدك مع شركة الشحن. الأسعار تقديرية حتى تسجل السعر الفعلي من شركة الشحن.' : 'Match these fees to your carrier agreement. These are estimates until you enter your contracted carrier rates.'}</p>
              <form className="mt-3 flex flex-wrap gap-2" onSubmit={(event) => {
                event.preventDefault();
                const area = newShippingArea.trim();
                if (!area || area.length > 80 || Object.keys(settings.shippingRates ?? {}).some((name) => name.toLocaleLowerCase() === area.toLocaleLowerCase())) {
                  onToast(isArabic ? 'اكتب اسم منطقة جديداً (حتى 80 حرفاً).' : 'Enter a new area name (up to 80 characters).');
                  return;
                }
                setSettings((previous) => ({
                  ...previous,
                  shippingRates: { ...SHIPPING_RATES, ...previous.shippingRates, [area]: { eg: 0, ksa: 0 } },
                  shippingAreas: { ...previous.shippingAreas, eg: [...(previous.shippingAreas?.eg ?? []), area] },
                }));
                setNewShippingArea('');
              }}>
                <input className="h-10 min-w-48 flex-1 rounded-xl border border-[#dfe8e2] px-3 text-xs" maxLength={80} onChange={(event) => setNewShippingArea(event.target.value)} placeholder={isArabic ? 'اسم منطقة / مدينة جديدة' : 'New city or delivery area'} value={newShippingArea} />
                <button className="rounded-full bg-[#314f43] px-4 text-xs font-semibold text-white" type="submit">{isArabic ? 'إضافة منطقة' : 'Add area'}</button>
              </form>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {Object.entries(settings.shippingRates ?? SHIPPING_RATES).map(([city, rates]) => {
                  const defaults = SHIPPING_RATES[city] ?? { eg: 0, ksa: 0 };
                  return (
                    <div className="rounded-xl bg-[#f7faf8] p-3" key={city}>
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="truncate text-[10px] font-bold text-[#486253]">{city}</p>
                        <button aria-label={`${isArabic ? 'حذف منطقة' : 'Delete area'} ${city}`} className="text-[10px] font-semibold text-[#a16f66]" onClick={() => {
                          setSettings((previous) => {
                            const nextRates = { ...previous.shippingRates };
                            delete nextRates[city];
                            return { ...previous, shippingRates: nextRates, shippingAreas: { ...previous.shippingAreas, eg: previous.shippingAreas.eg.filter((area) => area !== city), ksa: previous.shippingAreas.ksa.filter((area) => area !== city) } };
                          });
                        }} type="button">{isArabic ? 'حذف' : 'Remove'}</button>
                      </div>
                      {(['eg', 'ksa'] as const).map((targetMarket) => (
                        <div className="mb-2" key={targetMarket}>
                          <label className="mb-1 flex items-center gap-1 text-[9px] text-[#72847a]">
                            <input checked={settings.shippingAreas?.[targetMarket]?.includes(city) ?? defaults[targetMarket] > 0} className="accent-[#314f43]" onChange={(event) => setSettings((previous) => {
                              const areas = previous.shippingAreas?.[targetMarket] ?? Object.keys(SHIPPING_RATES).filter((area) => SHIPPING_RATES[area][targetMarket] > 0);
                              return { ...previous, shippingAreas: { ...previous.shippingAreas, [targetMarket]: event.target.checked ? [...areas, city] : areas.filter((area) => area !== city) } };
                            })} type="checkbox" />
                            {targetMarket === 'eg' ? (isArabic ? 'مصر' : 'Egypt') : (isArabic ? 'السعودية' : 'Saudi Arabia')}
                          </label>
                          <label className="block text-[9px] text-[#72847a]">{targetMarket === 'eg' ? 'EGP' : 'SAR'}
                            <input className="mt-1 h-8 w-full rounded-lg border border-[#dfe8e2] bg-white px-2 text-[10px]" min="0" max="100000" onChange={(event) => setSettings((previous) => ({ ...previous, shippingRates: { ...previous.shippingRates, [city]: { ...(previous.shippingRates?.[city] ?? defaults), [targetMarket]: Math.max(0, Math.min(100000, Number(event.target.value) || 0)) } } }))} type="number" value={rates[targetMarket] ?? defaults[targetMarket]} />
                          </label>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-[#e5ebe7] p-4">
              <h4 className="text-xs font-bold text-[#3b5546]">{isArabic ? 'شركات الشحن' : 'Shipping companies'}</h4>
              <p className="mt-1 text-[10px] text-[#788b80]">{isArabic ? 'أضف واحذف شركات الشحن لكل دولة؛ ستظهر في قائمة تجهيز الطلب.' : 'Manage the carrier list for each market; it appears when preparing an order.'}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(['eg', 'ksa'] as const).map((targetMarket) => (
                  <button className={`rounded-full px-3 py-1.5 text-[10px] font-semibold ${carrierMarket === targetMarket ? 'bg-[#314f43] text-white' : 'bg-[#edf4f0] text-[#52685b]'}`} key={targetMarket} onClick={() => setCarrierMarket(targetMarket)} type="button">{targetMarket === 'eg' ? (isArabic ? 'مصر' : 'Egypt') : (isArabic ? 'السعودية' : 'Saudi Arabia')}</button>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(settings.shippingCarriers?.[carrierMarket] ?? []).map((carrier) => (
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#dfe8e2] bg-[#fbfdfa] px-3 py-1.5 text-[10px] font-semibold text-[#3b5546]" key={carrier}>
                    {carrier}
                    <button aria-label={`${isArabic ? 'حذف شركة الشحن' : 'Remove carrier'} ${carrier}`} className="text-[#a16f66]" onClick={() => setSettings((previous) => ({ ...previous, shippingCarriers: { ...previous.shippingCarriers, [carrierMarket]: previous.shippingCarriers[carrierMarket].filter((item) => item !== carrier) } }))} type="button">×</button>
                  </span>
                ))}
              </div>
              <form className="mt-3 flex flex-wrap gap-2" onSubmit={(event) => {
                event.preventDefault();
                const carrier = newShippingCarrier.trim();
                const current = settings.shippingCarriers?.[carrierMarket] ?? [];
                if (!carrier || carrier.length > 80 || current.some((item) => item.toLocaleLowerCase() === carrier.toLocaleLowerCase())) {
                  onToast(isArabic ? 'اكتب اسم شركة جديداً (حتى 80 حرفاً).' : 'Enter a new carrier name (up to 80 characters).');
                  return;
                }
                setSettings((previous) => ({ ...previous, shippingCarriers: { ...previous.shippingCarriers, [carrierMarket]: [...(previous.shippingCarriers?.[carrierMarket] ?? []), carrier] } }));
                setNewShippingCarrier('');
              }}>
                <input className="h-9 min-w-48 flex-1 rounded-xl border border-[#dfe8e2] px-3 text-xs" maxLength={80} onChange={(event) => setNewShippingCarrier(event.target.value)} placeholder={isArabic ? 'اسم شركة الشحن' : 'Carrier name'} value={newShippingCarrier} />
                <button className="rounded-full bg-[#314f43] px-4 text-xs font-semibold text-white" type="submit">{isArabic ? 'إضافة شركة' : 'Add carrier'}</button>
              </form>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="text-[10px] font-semibold text-[#607368]">{isArabic ? 'كوبون تلقائي لكل الزوار' : 'Automatic coupon for all visitors'}<select className="mt-1 h-10 w-full rounded-xl border border-[#dfe8e2] bg-white px-3 text-xs" onChange={(event) => setSettings((previous) => ({ ...previous, autoPromoCode: event.target.value }))} value={settings.autoPromoCode ?? ''}><option value="">{isArabic ? 'بدون كوبون تلقائي' : 'No automatic coupon'}</option>{promoCodes.filter((promo) => promo.active && promo.discount > 0 && promo.discount <= 100).map((promo) => <option key={promo.code} value={promo.code}>{promo.code} ({promo.discount}%)</option>)}</select></label>
              <label className="text-[10px] font-semibold text-[#607368]">{isArabic ? 'الشحن المجاني عند طلب بقيمة (ج.م)' : 'Egypt free shipping threshold (EGP)'}<input className="mt-1 h-10 w-full rounded-xl border px-3 text-xs" min="0" onChange={(event) => setSettings((previous) => ({ ...previous, freeShippingThreshold: { ...previous.freeShippingThreshold, eg: Number(event.target.value) } }))} type="number" value={settings.freeShippingThreshold?.eg ?? 0} /></label>
              <label className="text-[10px] font-semibold text-[#607368]">{isArabic ? 'الشحن المجاني عند طلب بقيمة (ر.س)' : 'Saudi free shipping threshold (SAR)'}<input className="mt-1 h-10 w-full rounded-xl border px-3 text-xs" min="0" onChange={(event) => setSettings((previous) => ({ ...previous, freeShippingThreshold: { ...previous.freeShippingThreshold, ksa: Number(event.target.value) } }))} type="number" value={settings.freeShippingThreshold?.ksa ?? 0} /></label>
              <label className="text-[10px] font-semibold text-[#607368]">{isArabic ? 'ضريبة مصر (%)' : 'Egypt tax rate (%)'}<input className="mt-1 h-10 w-full rounded-xl border px-3 text-xs" max="100" min="0" onChange={(event) => setSettings((previous) => ({ ...previous, taxRateByMarket: { ...previous.taxRateByMarket, eg: Math.min(100, Math.max(0, Number(event.target.value))) } }))} type="number" value={settings.taxRateByMarket?.eg ?? settings.taxRate ?? 0} /></label>
              <label className="text-[10px] font-semibold text-[#607368]">{isArabic ? 'ضريبة السعودية (%)' : 'Saudi tax rate (%)'}<input className="mt-1 h-10 w-full rounded-xl border px-3 text-xs" max="100" min="0" onChange={(event) => setSettings((previous) => ({ ...previous, taxRateByMarket: { ...previous.taxRateByMarket, ksa: Math.min(100, Math.max(0, Number(event.target.value))) } }))} type="number" value={settings.taxRateByMarket?.ksa ?? settings.taxRate ?? 0} /></label>
              <label className="flex items-center justify-between rounded-xl border border-[#dfe8e2] px-3 py-2 text-xs font-semibold text-[#3b5546]"><span>{isArabic ? 'الدفع عند الاستلام في مصر' : 'Egypt cash on delivery'}</span><input checked={settings.codEnabledByMarket?.eg ?? settings.codEnabled} className="h-4 w-4 accent-[#314f43]" onChange={(event) => setSettings((previous) => ({ ...previous, codEnabledByMarket: { ...previous.codEnabledByMarket, eg: event.target.checked } }))} type="checkbox" /></label>
              <label className="flex items-center justify-between rounded-xl border border-[#dfe8e2] px-3 py-2 text-xs font-semibold text-[#3b5546]"><span>{isArabic ? 'الدفع عند الاستلام في السعودية' : 'Saudi cash on delivery'}</span><input checked={settings.codEnabledByMarket?.ksa ?? settings.codEnabled} className="h-4 w-4 accent-[#314f43]" onChange={(event) => setSettings((previous) => ({ ...previous, codEnabledByMarket: { ...previous.codEnabledByMarket, ksa: event.target.checked } }))} type="checkbox" /></label>
            </div>
          </div>
          <div className="rounded-3xl border border-[#dce9e0] bg-white/90 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-[#2f4437]">{isArabic ? 'تخصيص المنتجات حسب الدولة' : 'Market-specific product visibility'}</h3>
            <p className="mt-1 text-[10px] leading-5 text-[#788b80]">{isArabic ? 'عند إيقاف الاختيار، يرى الزائر منتجات السوق الذي اختاره فقط. فعّله للسماح له برؤية منتجات السوق الآخر أيضًا. المنتجات المشتركة بين السوقين تظل ظاهرة.' : 'When off, visitors see products for their selected market only. Turn it on to also show products reserved for the other market. Products assigned to both markets remain visible.'}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(['eg', 'ksa'] as const).map((targetMarket) => (
                <label className="flex items-center justify-between gap-3 rounded-2xl border border-[#dfe8e2] bg-[#fbfdfa] p-4 text-xs font-semibold text-[#3b5546]" key={targetMarket}>
                  <span>{targetMarket === 'eg' ? (isArabic ? 'السماح لزوار مصر برؤية منتجات السعودية' : 'Show Saudi-only products to Egypt visitors') : (isArabic ? 'السماح لزوار السعودية برؤية منتجات مصر' : 'Show Egypt-only products to Saudi visitors')}</span>
                  <input checked={settings.showOtherMarketProducts?.[targetMarket] ?? false} className="h-4 w-4 shrink-0 accent-[#314f43]" onChange={(event) => setSettings((previous) => ({ ...previous, showOtherMarketProducts: { ...previous.showOtherMarketProducts, [targetMarket]: event.target.checked } }))} type="checkbox" />
                </label>
              ))}
            </div>
          </div>

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
                  {isArabic ? 'إعداد واختبار إشعارات تليجرام' : 'Telegram Notifications Setup & Test'}
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
                ? 'بيانات البوت محفوظة للأدمن فقط. اختبر الاتصال بإرسال رسالة تجريبية.'
                : 'Bot credentials are admin-only. Send a test message to verify the connection.'}
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
                ? 'إدارة كلمات المرور وصلاحيات الأدمن تتم من Supabase Auth وقائمة store_admins.'
                : 'Manage administrator passwords in Supabase Auth and dashboard access in store_admins.'}
            </p>
          </div>
        </div>
      )}
      </div>
      </div>
    </div>
  );
}
