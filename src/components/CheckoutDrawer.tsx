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

type Props = {
  open: boolean;
  onClose: () => void;
  cart: CartLine[];
  products: Product[];
  locale: Locale;
  market: Market;
  promoCodes: PromoCode[];
  settings: SiteSettings;
  onQuantityChange: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onOrderComplete: (order: CustomerOrder) => void;
  onToast: (msg: string) => void;
};

export function CheckoutDrawer({
  open,
  onClose,
  cart,
  products,
  locale,
  market,
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
  const [selectedCity, setSelectedCity] = useState(market === 'eg' ? 'Cairo' : 'Riyadh');
  const [paymentMethod, setPaymentMethod] = useState<'whatsapp' | 'card' | 'apple_pay' | 'mada' | 'cod'>('whatsapp');
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);

  if (!open) return null;

  // Cart Calculation
  const subtotal = cart.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    return sum + (product ? product.price[market] * item.quantity : 0);
  }, 0);

  const discountAmount = appliedPromo ? Math.round((subtotal * appliedPromo.discount) / 100) : 0;
  const shippingFee = SHIPPING_RATES[selectedCity]?.[market] ?? (market === 'eg' ? 45 : 25);
  const total = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const found = promoCodes.find(
      (p) => p.code.toUpperCase() === promoCodeInput.trim().toUpperCase() && p.active,
    );
    if (!found) {
      onToast(isArabic ? 'كود الخصم غير صالح أو منتهي الصلاحية.' : 'Invalid or expired promo code.');
      return;
    }
    setAppliedPromo(found);
    onToast(isArabic ? `تم تطبيق خصم ${found.discount}% بنجاح!` : `Discount of ${found.discount}% applied!`);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      onToast(isArabic ? 'يرجى إكمال بيانات الاسم والهاتف.' : 'Please enter your name and phone number.');
      return;
    }
    // Basic phone sanity check so we don't create an order we can never reach.
    const digits = customerPhone.replace(/\D/g, '');
    if (digits.length < 8) {
      onToast(isArabic ? 'يرجى إدخال رقم هاتف صحيح.' : 'Please enter a valid phone number.');
      return;
    }

    // Open the WhatsApp tab while still inside the user gesture so mobile browsers
    // don't treat it as an unprompted popup and block it.
    const num = market === 'eg' ? settings.whatsappEg : settings.whatsappKsa;
    const pendingWindow = window.open('', '_blank', 'noopener,noreferrer');

    const orderId = `ZX-${Date.now().toString().slice(-7)}`;
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
      city: selectedCity,
      market,
      items: orderItems,
      status: 'new',
      total,
      subtotal,
      shippingFee,
      discount: discountAmount,
      promoCode: appliedPromo?.code,
      paymentMethod,
    };

    whatsappWindowRef.current = pendingWindow;
    onOrderComplete(newOrder);

    // Automation: Telegram Notification dispatch if configured
    if (settings.telegramBotToken && settings.telegramChatId) {
      try {
        const text = encodeURIComponent(
          `🛍️ NEW ORDER: ${orderId}\n` +
          `Customer: ${customerName}\n` +
          `Phone: ${customerPhone}\n` +
          `City: ${selectedCity} (${market.toUpperCase()})\n` +
          `Total: ${total} ${currency}\n` +
          `Payment: ${paymentMethod.toUpperCase()}`
        );
        fetch(`https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage?chat_id=${settings.telegramChatId}&text=${text}`, {
          method: 'POST',
        }).catch(() => {});
      } catch {
        // silent fail for local session
      }
    }

    // Format WhatsApp Message & Open
    const itemsText = orderItems.map((i) => `• ${i.quantity}x ${i.name}`).join('\n');
    const msg = isArabic
      ? `طلب شراء جديد من ZEXOR:
رقم الطلب: ${orderId}
الاسم: ${customerName}
الهاتف: ${customerPhone}
المدينة: ${selectedCity}
طريقة الدفع: ${paymentMethod}
المنتجات:
${itemsText}
الشحن: ${shippingFee} ${currency}
الإجمالي: ${total} ${currency}`
      : `New ZEXOR Order:
Order ID: ${orderId}
Name: ${customerName}
Phone: ${customerPhone}
City: ${selectedCity}
Payment: ${paymentMethod}
Items:
${itemsText}
Shipping: ${shippingFee} ${currency}
Total: ${total} ${currency}`;

    const waUrl = `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
    const target = whatsappWindowRef.current ?? pendingWindow;
    if (target && !target.closed) {
      target.location.href = waUrl;
    } else {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }
    whatsappWindowRef.current = null;
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-100 flex justify-end bg-black/40 backdrop-blur-xs"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.aside
        animate={{ x: 0 }}
        className="flex h-full w-full max-w-md flex-col border-s border-white/80 bg-[#fbfdfa] shadow-2xl"
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
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#738279] hover:bg-[#edf2ef]"
            onClick={onClose}
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
              {cart.map((line) => {
                const product = products.find((p) => p.id === line.productId);
                if (!product) return null;
                return (
                  <div
                    className="flex gap-3 rounded-2xl border border-[#e5ebe6] bg-white p-3.5 shadow-xs"
                    key={line.productId}
                  >
                    <img
                      alt={product.name[locale]}
                      className="h-16 w-16 rounded-xl object-cover"
                      src={product.imageUrl}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="truncate text-xs font-bold text-[#2d4236]">{product.name[locale]}</h4>
                        <button
                          className="text-[#9ea9a2] hover:text-[#b45648]"
                          onClick={() => onRemoveItem(line.productId)}
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
                            onClick={() => onQuantityChange(line.productId, -1)}
                            type="button"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="min-w-4 text-center text-xs font-semibold">{line.quantity}</span>
                          <button
                            className="text-[#64796e]"
                            onClick={() => onQuantityChange(line.productId, 1)}
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

              {appliedPromo && (
                <p className="mt-2 text-xs font-semibold text-[#377755]">
                  ✓ {isArabic ? `تم تفعيل كود ${appliedPromo.code}: خصم ${appliedPromo.discount}%` : `Code ${appliedPromo.code} applied: ${appliedPromo.discount}% OFF`}
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
                    {isArabic ? 'حاسبة الشحن والتوصيل (المدينة):' : 'Automated Shipping Calculator (City):'}
                  </label>
                  <span className="text-xs font-bold text-[#355844]">+{shippingFee} {currency}</span>
                </div>

                <select
                  className="mt-1 h-10 w-full rounded-xl border border-[#dfe7e1] bg-white px-3 text-xs outline-none"
                  onChange={(e) => setSelectedCity(e.target.value)}
                  value={selectedCity}
                >
                  {market === 'eg' ? (
                    <>
                      <option value="Cairo">القاهرة (Cairo) - 40 ج.م</option>
                      <option value="Giza">الجيزة (Giza) - 45 ج.م</option>
                      <option value="Alexandria">الإسكندرية (Alexandria) - 55 ج.م</option>
                      <option value="Delta Cities">محافظات الدلتا (Delta) - 65 ج.م</option>
                      <option value="Upper Egypt">محافظات الصعيد (Upper Egypt) - 80 ج.م</option>
                    </>
                  ) : (
                    <>
                      <option value="Riyadh">الرياض (Riyadh) - 25 ر.س</option>
                      <option value="Jeddah">جدة (Jeddah) - 30 ر.س</option>
                      <option value="Dammam">الدمام والشرقية (Dammam) - 30 ر.س</option>
                      <option value="Other KSA">باقي مدن المملكة - 35 ر.س</option>
                    </>
                  )}
                </select>
              </div>

              {/* Payment Gateways Selection */}
              <div>
                <label className="text-xs font-semibold text-[#445b4e]">
                  {isArabic ? 'اختر طريقة الدفع المفضلة:' : 'Select Payment Gateway:'}
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {[
                    { id: 'whatsapp', label: isArabic ? 'تأكيد ودفع عبر واتساب' : 'WhatsApp Checkout', icon: '💬' },
                    { id: 'card', label: isArabic ? 'بطاقة بنكية / فيزا' : 'Credit / Debit Card', icon: '💳' },
                    { id: 'apple_pay', label: 'Apple Pay', icon: '🍎' },
                    { id: 'mada', label: isArabic ? 'مدى (Mada)' : 'Mada Payment', icon: '🇸🇦' },
                  ].map((method) => (
                    <button
                      className={`flex items-center gap-2 rounded-xl border p-2.5 text-start text-xs transition-all ${
                        paymentMethod === method.id
                          ? 'border-[#3f6753] bg-[#edf6f1] text-[#2c4739] shadow-xs'
                          : 'border-[#dfe8e2] bg-white text-[#65796e]'
                      }`}
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as typeof paymentMethod)}
                      type="button"
                    >
                      <span>{method.icon}</span>
                      <span className="text-[10px] font-semibold">{method.label}</span>
                    </button>
                  ))}
                </div>
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
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#314f43] py-2.5 text-xs font-semibold text-white shadow-md hover:bg-[#436e5d]"
                  type="submit"
                >
                  <Check className="h-4 w-4" />
                  {isArabic ? 'تأكيد الطلب وإرسال الإشعار' : 'Confirm Order & Send'}
                </button>
              </div>
            </div>
          </form>
        )}
      </motion.aside>
    </div>
  );
}
