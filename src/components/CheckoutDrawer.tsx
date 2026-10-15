import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  Check,
  Minus,
  Plus,
  ShoppingBag,
  Truck,
  X,
} from 'lucide-react';
import { SHIPPING_RATES } from '../data/initialData';
import type { CartLine, CustomerOrder, Locale, Market, Product, PromoCode, SiteSettings } from '../types';
import type { PaymentMethod } from '../lib/siteData';
import { publicAssetUrl } from '../utils';

const hasExpiredPromo = (promo: PromoCode) => Date.parse(`${promo.expiresAt}T23:59:59.999`) < Date.now();

type Props = {
  open: boolean;
  onClose: () => void;
  cart: CartLine[];
  products: Product[];
  locale: Locale;
  market: Market;
  paymentMethods: PaymentMethod[];
  promoCodes: PromoCode[];
  settings: SiteSettings;
  onQuantityChange: (line: CartLine, delta: number) => void;
  onRemoveItem: (line: CartLine) => void;
  onOrderComplete: (order: CustomerOrder) => Promise<boolean | { accepted: boolean; paymentUrl?: string }>;
  onToast: (msg: string) => void;
};

export function CheckoutDrawer({
  open,
  onClose,
  cart,
  products,
  locale,
  market,
  paymentMethods,
  promoCodes,
  settings,
  onQuantityChange,
  onRemoveItem,
  onOrderComplete,
  onToast,
}: Props) {
  const isArabic = locale === 'ar';
  const currency = market === 'eg' ? (isArabic ? 'ج.م' : 'EGP') : isArabic ? 'ر.س' : 'SAR';

  // Windows opened synchronously from a click are never blocked; we keep a reference
  // and only assign the WhatsApp URL once the order payload has been assembled.
  const whatsappWindowRef = useRef<Window | null>(null);

  // Checkout Form
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [selectedCity, setSelectedCity] = useState(market === 'eg' ? 'Cairo' : 'Riyadh');
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetCheckout = () => {
    setStep('cart');
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setSelectedCity(market === 'eg' ? 'Cairo' : 'Riyadh');
    setPaymentMethodId('');
    setPromoCodeInput('');
    setAppliedPromo(null);
    setIsSubmitting(false);
  };
  const handleClose = () => {
    if (isSubmitting) return;
    resetCheckout();
    onClose();
  };

  if (!open) return null;

  const configuredPaymentMethods = paymentMethods.filter((method) =>
    method.market === market && method.active && ((settings.codEnabledByMarket?.[market] ?? settings.codEnabled) || method.method !== 'cash'),
  );
  const marketPaymentMethods: PaymentMethod[] = configuredPaymentMethods.length ? configuredPaymentMethods : [{
    id: `fallback-whatsapp-${market}`,
    market,
    method: 'whatsapp',
    label: isArabic ? 'التأكيد عبر واتساب' : 'Confirm via WhatsApp',
    accountName: '',
    accountNumber: '',
    instructions: { ar: '', en: '' },
    active: true,
    sortOrder: 0,
  }];
  const selectedPaymentMethod = marketPaymentMethods.find((method) => method.id === paymentMethodId);
  const marketCities = settings.shippingAreas?.[market]?.length
    ? settings.shippingAreas[market]
    : market === 'eg' ? ['Cairo'] : ['Riyadh'];
  const effectiveCity = marketCities.includes(selectedCity)
    ? selectedCity
    : marketCities[0];

  const isUsablePromo = (promo: PromoCode | undefined | null): promo is PromoCode => {
    if (!promo || !promo.active || !Number.isFinite(promo.discount) || promo.discount <= 0 || promo.discount > 100) return false;
    return Number.isFinite(Date.parse(`${promo.expiresAt}T23:59:59.999`));
  };
  const automaticPromo = promoCodes.find((promo) =>
    promo.code.toUpperCase() === settings.autoPromoCode.trim().toUpperCase() && isUsablePromo(promo),
  );
  const currentPromo = isUsablePromo(appliedPromo) ? appliedPromo : automaticPromo ?? null;

  // Cart Calculation
  const subtotal = cart.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    return sum + (product ? product.price[market] * item.quantity : 0);
  }, 0);

  const discountAmount = currentPromo ? Math.round((subtotal * currentPromo.discount) / 100) : 0;
  const rateForCity = (city: string, targetMarket: Market) => {
    const configured = settings.shippingRates?.[city]?.[targetMarket];
    return Number.isFinite(configured) && configured >= 0 && configured <= 100000
      ? configured
      : SHIPPING_RATES[city]?.[targetMarket] ?? (targetMarket === 'eg' ? 45 : 25);
  };
  const baseShippingFee = rateForCity(effectiveCity, market);
  const freeShippingThreshold = settings.freeShippingThreshold?.[market] ?? Number.POSITIVE_INFINITY;
  const shippingFee = freeShippingThreshold > 0 && subtotal >= freeShippingThreshold ? 0 : baseShippingFee;
  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const taxRate = settings.taxRateByMarket?.[market] ?? settings.taxRate ?? 0;
  const taxAmount = Math.round((taxableSubtotal * Math.max(0, taxRate)) / 100);
  const total = Math.max(0, taxableSubtotal + shippingFee + taxAmount);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const found = promoCodes.find(
      (p) => p.code.toUpperCase() === promoCodeInput.trim().toUpperCase() && isUsablePromo(p),
    );
    if (!found || hasExpiredPromo(found)) {
      onToast(isArabic ? 'كود الخصم غير صالح أو منتهي الصلاحية.' : 'Invalid or expired promo code.');
      return;
    }
    setAppliedPromo(found);
    onToast(isArabic ? `تم تطبيق خصم ${found.discount}% بنجاح!` : `Discount of ${found.discount}% applied!`);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      onToast(isArabic ? 'يرجى إكمال بيانات الاسم والهاتف.' : 'Please enter your name and phone number.');
      return;
    }
    if (!selectedPaymentMethod) {
      onToast(isArabic ? 'اختر طريقة الدفع للمتابعة.' : 'Choose a payment method to continue.');
      return;
    }
    // Basic phone sanity check so we don't create an order we can never reach.
    const digits = customerPhone.replace(/\D/g, '');
    if (digits.length < 8) {
      onToast(isArabic ? 'يرجى إدخال رقم هاتف صحيح.' : 'Please enter a valid phone number.');
      return;
    }
    const isOnlinePayment = market === 'eg' && ['visa', 'fawry'].includes(selectedPaymentMethod.method);
    if (isOnlinePayment && !customerEmail.trim()) {
      onToast(isArabic ? 'أدخل بريدك الإلكتروني لإتمام الدفع الإلكتروني.' : 'Enter your email to continue with online payment.');
      return;
    }
    const stockConflict = products.find((product) => product.stock !== undefined && cart.filter((line) => line.productId === product.id).reduce((sum, line) => sum + line.quantity, 0) > product.stock);
    if (stockConflict) {
      onToast(isArabic ? 'الكمية في السلة أكبر من المخزون المتاح. عدّل الكمية وحاول مجدداً.' : 'Cart quantity exceeds available stock. Update it and try again.');
      return;
    }
    if (isSubmitting) return;
    if (currentPromo && hasExpiredPromo(currentPromo)) {
      setAppliedPromo(null);
      onToast(isArabic ? 'انتهت صلاحية كود الخصم. راجع الإجمالي وحاول مجدداً.' : 'The promo code expired. Review the total and try again.');
      return;
    }
    setIsSubmitting(true);

    // Open the WhatsApp tab while still inside the user gesture so mobile browsers
    // don't treat it as an unprompted popup and block it.
    const num = market === 'eg' ? settings.whatsappEg : settings.whatsappKsa;
    const pendingWindow = window.open('', '_blank');
    if (pendingWindow) pendingWindow.opener = null;

    // Keep enough random bits in the public tracking reference to make online
    // order-ID guessing impractical, even when a customer's phone is known.
    const orderId = `ZX-${crypto.randomUUID().replaceAll('-', '').slice(0, 24).toUpperCase()}`;
    const orderItems = cart.map((line) => {
      const prod = products.find((p) => p.id === line.productId);
      return {
        productId: line.productId,
        name: prod ? prod.name[locale] : 'Item',
        quantity: line.quantity,
        egp: prod ? prod.price.eg : 0,
        sar: prod ? prod.price.ksa : 0,
        variant: line.variant,
        nfcCustomization: line.nfcCustomization,
      };
    });

    const newOrder: CustomerOrder = {
      id: orderId,
      createdAt: new Date().toISOString(),
      customer: customerName.trim(),
      phone: customerPhone.trim(),
      ...(customerEmail.trim() ? { email: customerEmail.trim() } : {}),
      city: effectiveCity,
      market,
      items: orderItems,
      status: 'new',
      total,
      subtotal,
      shippingFee,
      discount: discountAmount,
      promoCode: currentPromo?.code,
      paymentMethod: selectedPaymentMethod?.label ?? (isArabic ? 'التواصل عبر واتساب' : 'WhatsApp'),
      paymentMethodKey: selectedPaymentMethod?.method,
      paymentStatus: isOnlinePayment ? 'pending' : 'unpaid',
    };

    whatsappWindowRef.current = pendingWindow;
    let completion: boolean | { accepted: boolean; paymentUrl?: string };
    try {
      completion = await onOrderComplete(newOrder);
    } catch {
      completion = false;
    }
    const accepted = typeof completion === 'boolean' ? completion : completion.accepted;
    const paymentUrl = typeof completion === 'boolean' ? undefined : completion.paymentUrl;
    if (!accepted) {
      if (pendingWindow && !pendingWindow.closed) pendingWindow.close();
      whatsappWindowRef.current = null;
      setIsSubmitting(false);
      return;
    }

    // Format WhatsApp Message & Open
    const itemsText = orderItems.map((i) => `• ${i.quantity}x ${i.name}`).join('\n');
    const msg = isArabic
      ? `طلب شراء جديد من ZEXOR:
رقم الطلب: ${orderId}
الاسم: ${customerName}
الهاتف: ${customerPhone}
المدينة: ${effectiveCity}
طريقة الدفع: ${selectedPaymentMethod?.label ?? 'واتساب'}${selectedPaymentMethod?.accountName ? ` - ${selectedPaymentMethod.accountName}` : ''}${selectedPaymentMethod?.accountNumber ? ` - ${selectedPaymentMethod.accountNumber}` : ''}${selectedPaymentMethod?.instructions[locale] ? ` - ${selectedPaymentMethod.instructions[locale]}` : ''}
المنتجات:
${itemsText}
الشحن: ${shippingFee} ${currency}
الضريبة: ${taxAmount} ${currency}
الإجمالي: ${total} ${currency}`
      : `New ZEXOR Order:
Order ID: ${orderId}
Name: ${customerName}
Phone: ${customerPhone}
City: ${effectiveCity}
Payment: ${selectedPaymentMethod?.label ?? 'WhatsApp'}${selectedPaymentMethod?.accountName ? ` - ${selectedPaymentMethod.accountName}` : ''}${selectedPaymentMethod?.accountNumber ? ` - ${selectedPaymentMethod.accountNumber}` : ''}${selectedPaymentMethod?.instructions[locale] ? ` - ${selectedPaymentMethod.instructions[locale]}` : ''}
Items:
${itemsText}
Shipping: ${shippingFee} ${currency}
Tax: ${taxAmount} ${currency}
Total: ${total} ${currency}`;

    const waUrl = `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
    const target = whatsappWindowRef.current ?? pendingWindow;
    if (paymentUrl) {
      if (target && !target.closed) target.location.href = paymentUrl;
      else window.location.assign(paymentUrl);
      whatsappWindowRef.current = null;
      resetCheckout();
      onClose();
      return;
    }
    if (target && !target.closed) {
      target.location.href = waUrl;
    } else {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }
    whatsappWindowRef.current = null;
    resetCheckout();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-100 flex justify-end bg-black/40 backdrop-blur-xs"
      onMouseDown={(e) => {
        if (!isSubmitting && e.target === e.currentTarget) handleClose();
      }}
    >
      <motion.aside
        animate={{ x: 0 }}
        className="zx-checkout-drawer flex h-full w-full max-w-md flex-col border-s border-white/80 bg-[#fbfdfa] shadow-2xl"
        exit={{ x: isArabic ? '-100%' : '100%' }}
        initial={{ x: isArabic ? '-100%' : '100%' }}
        transition={{ type: 'spring', stiffness: 280, damping: 30 }}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-[#e9eee9] px-6 py-5">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-5 w-5 text-[#3b634e]" />
            <div>
              <h2 className="text-base font-bold text-[#2e4437]">
                {step === 'cart'
                  ? isArabic
                    ? 'سلة المشتريات'
                    : 'Your Cart'
                  : isArabic
                    ? 'إتمام الطلب والشحن والدفع'
                    : 'Checkout & Delivery'}
              </h2>
              <p className="text-[10px] text-[#7d8d83]">
                {cart.length} {isArabic ? 'منتجات بالسلة' : 'items'}
              </p>
            </div>
          </div>
          <button
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#738279] hover:bg-[#edf2ef] disabled:cursor-not-allowed disabled:opacity-40"
            disabled={isSubmitting}
            onClick={handleClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Drawer Content */}
        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#edf5f0] text-[#55866c]">
              <ShoppingBag className="h-8 w-8" />
            </span>
            <h3 className="mt-4 text-base font-bold text-[#354f40]">
              {isArabic ? 'سلتك فارغة حالياً' : 'Your cart is empty'}
            </h3>
            <p className="mt-1 text-xs text-[#809187]">
              {isArabic ? 'تصفح كروت NFC أو الملابس وأضف ما يناسبك.' : 'Explore our collection and add items to your cart.'}
            </p>
          </div>
        ) : step === 'cart' ? (
          <>
            {/* Cart Items List */}
            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              {cart.map((line, lineIndex) => {
                const product = products.find((p) => p.id === line.productId);
                if (!product) return null;
                return (
                  <div
                    className="flex gap-3 rounded-2xl border border-[#e5ebe6] bg-white p-3.5 shadow-xs"
                    key={`${line.productId}-${line.variant ?? 'default'}-${line.nfcCustomization?.profileSlug ?? 'plain'}-${lineIndex}`}
                  >
                    <img
                      alt={product.name[locale]}
                      className="h-16 w-16 rounded-xl object-cover"
                      src={publicAssetUrl(product.imageUrl)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="truncate text-xs font-bold text-[#2d4236]">{product.name[locale]}</h4>
                        <button
                          className="text-[#9ea9a2] hover:text-[#b45648]"
                          onClick={() => onRemoveItem(line)}
                          type="button"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {line.variant && (
                        <p className="text-[9px] text-[#697f72]">
                          {isArabic ? 'المقاس / الخامة:' : 'Variant:'} {line.variant}
                        </p>
                      )}
                      {line.nfcCustomization && (
                        <p className="text-[8px] text-[#4d7e64]">
                          ★ {line.nfcCustomization.fullName} ({line.nfcCustomization.finish})
                        </p>
                      )}

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs font-bold text-[#335342]">
                          {product.price[market]} {currency}
                        </span>

                        <div className="flex items-center gap-1.5 rounded-full border border-[#dfe7e1] px-2 py-0.5">
                          <button
                            className="text-[#64796e]"
                            onClick={() => onQuantityChange(line, -1)}
                            type="button"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="min-w-4 text-center text-xs font-semibold">{line.quantity}</span>
                          <button
                            className="text-[#64796e] disabled:opacity-30"
                            disabled={product.stock !== undefined && cart.filter((item) => item.productId === product.id).reduce((sum, item) => sum + item.quantity, 0) >= product.stock}
                            onClick={() => onQuantityChange(line, 1)}
                            type="button"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Promo Code Input */}
            <div className="border-t border-[#edf1ee] bg-[#f7faf8] p-5">
              <form className="flex gap-2" onSubmit={handleApplyPromo}>
                <input
                  className="h-10 flex-1 rounded-xl border border-[#dfe7e1] bg-white px-3 text-xs uppercase outline-none"
                  onChange={(e) => setPromoCodeInput(e.target.value)}
                  placeholder={isArabic ? 'كود الخصم (e.g. ZEXOR15)' : 'Promo Code (e.g. ZEXOR15)'}
                  value={promoCodeInput}
                />
                <button
                  className="rounded-xl bg-[#314f43] px-4 text-xs font-semibold text-white hover:bg-[#436e5d]"
                  type="submit"
                >
                  {isArabic ? 'تطبيق' : 'Apply'}
                </button>
              </form>

              {currentPromo && (
                <p className="mt-2 text-xs font-semibold text-[#377755]">
                  ✓ {isArabic ? `تم تفعيل كود ${currentPromo.code}: خصم ${currentPromo.discount}%` : `Code ${currentPromo.code} applied: ${currentPromo.discount}% OFF`}
                </p>
              )}

              {/* Subtotal & Next */}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-[#6e8076]">{isArabic ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                <span className="text-base font-bold text-[#2e4739]">{subtotal} {currency}</span>
              </div>

              <button
                className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#314f43] text-xs font-semibold text-white shadow-md hover:bg-[#436e5d]"
                onClick={() => setStep('checkout')}
                type="button"
              >
                {isArabic ? 'متابعة إلى الشحن والدفع' : 'Proceed to Checkout'}
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </>
        ) : (
          /* Step 2: Checkout Form with Shipping Calculator & Payment Options */
          <form className="flex flex-1 flex-col justify-between overflow-y-auto p-6" onSubmit={handleSubmitOrder}>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#445b4e]">
                  {isArabic ? 'الاسم بالكامل' : 'Full Name'}
                </label>
                <input
                  className="mt-1 h-10 w-full rounded-xl border border-[#dfe7e1] px-3 text-xs outline-none"
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  value={customerName}
                />
              </div>

              {['visa', 'fawry'].includes(selectedPaymentMethod?.method ?? '') && (
                <div>
                  <label className="text-xs font-semibold text-[#445b4e]">
                    {isArabic ? 'البريد الإلكتروني' : 'Email address'}
                  </label>
                  <input autoComplete="email" className="mt-1 h-10 w-full rounded-xl border border-[#dfe7e1] px-3 text-xs outline-none" onChange={(event) => setCustomerEmail(event.target.value)} required type="email" value={customerEmail} />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-[#445b4e]">
                  {isArabic ? 'رقم الهاتف / واتساب' : 'Phone / WhatsApp'}
                </label>
                <input
                  className="mt-1 h-10 w-full rounded-xl border border-[#dfe7e1] px-3 text-xs outline-none"
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                  type="tel"
                  value={customerPhone}
                />
              </div>

              {/* Shipping Calculator by City */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-[#445b4e]">
                    <Truck className="h-3.5 w-3.5 text-[#487a60]" />
                    {isArabic ? 'تقدير تكلفة التوصيل (المدينة):' : 'Estimated delivery fee (city):'}
                  </label>
                  <span className="text-xs font-bold text-[#355844]">+{shippingFee} {currency}</span>
                </div>

                <select
                  className="mt-1 h-10 w-full rounded-xl border border-[#dfe7e1] bg-white px-3 text-xs outline-none"
                  onChange={(e) => setSelectedCity(e.target.value)}
                  value={effectiveCity}
                >
                  {market === 'eg' ? (
                    <>
                      <option value="Cairo">{isArabic ? 'القاهرة' : 'Cairo'} — {rateForCity('Cairo', market)} {currency}</option>
                      <option value="Giza">{isArabic ? 'الجيزة' : 'Giza'} — {rateForCity('Giza', market)} {currency}</option>
                      <option value="Alexandria">{isArabic ? 'الإسكندرية' : 'Alexandria'} — {rateForCity('Alexandria', market)} {currency}</option>
                      <option value="Delta Cities">{isArabic ? 'محافظات الدلتا' : 'Delta cities'} — {rateForCity('Delta Cities', market)} {currency}</option>
                      <option value="Upper Egypt">{isArabic ? 'محافظات الصعيد' : 'Upper Egypt'} — {rateForCity('Upper Egypt', market)} {currency}</option>
                    </>
                  ) : (
                    <>
                      <option value="Riyadh">{isArabic ? 'الرياض' : 'Riyadh'} — {rateForCity('Riyadh', market)} {currency}</option>
                      <option value="Jeddah">{isArabic ? 'جدة' : 'Jeddah'} — {rateForCity('Jeddah', market)} {currency}</option>
                      <option value="Dammam">{isArabic ? 'الدمام والمنطقة الشرقية' : 'Dammam & Eastern Province'} — {rateForCity('Dammam', market)} {currency}</option>
                      <option value="Other KSA">{isArabic ? 'باقي مدن المملكة' : 'Other cities'} — {rateForCity('Other KSA', market)} {currency}</option>
                    </>
                  )}
                </select>
              </div>

              {/* Payment Gateways Selection */}
              <div>
                <label className="text-xs font-semibold text-[#445b4e]">
                  {isArabic ? 'اختر طريقة الدفع:' : 'Choose a payment method:'}
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {marketPaymentMethods.map((method) => (
                    <button
                      className={`flex items-center gap-2 rounded-xl border p-2.5 text-start text-xs transition-all ${
                        (selectedPaymentMethod?.id ?? '') === method.id
                          ? 'border-[#3f6753] bg-[#edf6f1] text-[#2c4739] shadow-xs'
                          : 'border-[#dfe8e2] bg-white text-[#65796e]'
                      }`}
                      key={method.id}
                      onClick={() => setPaymentMethodId(method.id)}
                      type="button"
                    >
                      <span>{['visa', 'mada', 'apple_pay'].includes(method.method) ? '💳' : method.method === 'fawry' ? '🟡' : method.method === 'cash' ? '💵' : '💸'}</span>
                      <span className="text-[10px] font-semibold">{method.label}{method.accountNumber ? ` · ${method.accountNumber}` : ''}</span>
                    </button>
                  ))}
                </div>
                {['visa', 'fawry'].includes(selectedPaymentMethod?.method ?? '') && (
                  <p className="mt-2 text-[10px] leading-5 text-[#788b80]">
                    {isArabic
                      ? 'سيتم فتح صفحة دفع آمنة بعد تسجيل الطلب. لا تُدخل بيانات بطاقتك داخل المتجر.'
                      : 'A secure payment page will open after the order is recorded. Never enter card details on this store.'}
                  </p>
                )}
              </div>
            </div>

            {/* Pricing Summary & Finish */}
            <div className="border-t border-[#edf1ee] pt-4">
              <div className="space-y-1.5 text-xs text-[#586e61]">
                <div className="flex justify-between">
                  <span>{isArabic ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                  <span>{subtotal} {currency}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between font-semibold text-[#3b7857]">
                    <span>{isArabic ? 'الخصم المطبق:' : 'Discount:'}</span>
                    <span>-{discountAmount} {currency}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>{isArabic ? 'تكلفة التوصيل والشحن:' : 'Delivery Fee:'}</span>
                  <span>{shippingFee} {currency}</span>
                </div>
                {taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span>{isArabic ? `الضريبة (${taxRate}%):` : `Tax (${taxRate}%):`}</span>
                    <span>{taxAmount} {currency}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-[#e8eeea] pt-2 text-base font-extrabold text-[#2b4435]">
                  <span>{isArabic ? 'الإجمالي النهائي:' : 'Total Amount:'}</span>
                  <span>{total} {currency}</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  className="rounded-full border border-[#d6e2da] px-4 py-2.5 text-xs font-semibold text-[#5a7265]"
                  onClick={() => setStep('cart')}
                  type="button"
                >
                  {isArabic ? 'رجوع للسلة' : 'Back'}
                </button>
                <button
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#314f43] py-2.5 text-xs font-semibold text-white shadow-md hover:bg-[#436e5d] disabled:cursor-wait disabled:opacity-60"
                  disabled={isSubmitting}
                  type="submit"
                >
                  <Check className="h-4 w-4" />
                  {isSubmitting
                    ? isArabic ? 'جارٍ تأكيد المخزون...' : 'Checking stock...'
                    : isArabic ? 'تأكيد الطلب وإرسال الإشعار' : 'Confirm Order & Send'}
                </button>
              </div>
            </div>
          </form>
        )}
      </motion.aside>
    </div>
  );
}
