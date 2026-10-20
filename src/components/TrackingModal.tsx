import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  Copy,
  MessageCircle,
  Package,
  Search,
  Truck,
  X,
} from 'lucide-react';
import { copyToClipboard } from '../utils';
import { findCloudOrder } from '../lib/siteData';
import { isSupabaseConfigured } from '../../supabase';
import type { CustomerOrder, Locale, Market } from '../types';

type Props = {
  open: boolean;
  onClose: () => void;
  orders: CustomerOrder[];
  locale: Locale;
  market: Market;
  whatsappNumber: string;
};

export function TrackingModal({
  open,
  onClose,
  orders,
  locale,
  whatsappNumber,
}: Props) {
  const isArabic = locale === 'ar';
  const [query, setQuery] = useState('');
  const [phone, setPhone] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [foundOrder, setFoundOrder] = useState<CustomerOrder | null>(null);
  const [copied, setCopied] = useState<'id' | 'phone' | null>(null);
  const foundOrderId = foundOrder?.id;

  useEffect(() => {
    if (!open || !foundOrderId || !isSupabaseConfigured) return;
    let active = true;
    const refresh = async () => {
      const latest = await findCloudOrder(foundOrderId, phone);
      if (active && latest) setFoundOrder(latest);
    };
    const interval = window.setInterval(() => void refresh(), 30_000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [foundOrderId, open, phone]);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose, open]);

  const handleCopy = async (value: string, field: 'id' | 'phone') => {
    const ok = await copyToClipboard(value);
    if (!ok) return;
    setCopied(field);
    window.setTimeout(() => setCopied(null), 1800);
  };

  if (!open) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    setFoundOrder(null);
    setIsSearching(true);
    const clean = query.trim().toUpperCase();
    const normalizePhone = (value: string) => value.replace(/\D/g, '');
    const localMatch = orders.find((order) =>
      order.id.toUpperCase() === clean && normalizePhone(order.phone) === normalizePhone(phone),
    );
    const remoteMatch = isSupabaseConfigured ? await findCloudOrder(clean, phone) : null;
    const match = isSupabaseConfigured ? remoteMatch : localMatch ?? null;
    setFoundOrder(match);
    setIsSearching(false);
  };

  const steps = [
    { id: 'new', label: isArabic ? 'تم استلام الطلب وتأكيده' : 'Order Received & Confirmed', desc: isArabic ? 'تمت مراجعة المنتجات واعتمادها في النظام.' : 'Items registered and verified.' },
    { id: 'processing', label: isArabic ? 'قيد التجهيز والتغليف' : 'Processing & Packaging', desc: isArabic ? 'تجهيز المنتجات والتغليف الفاخر.' : 'Customization & premium packaging in progress.' },
    { id: 'shipping', label: isArabic ? 'تم تسجيل بيانات الشحنة' : 'Shipment details added', desc: isArabic ? 'استخدم رقم التتبع أو رابط شركة الشحن عند ظهوره.' : 'Use the carrier tracking number or link when available.' },
    { id: 'complete', label: isArabic ? 'تم التسليم بنجاح' : 'Delivered Successfully', desc: isArabic ? 'وصلت الشحنة للعميل بنجاح.' : 'Order has reached customer.' },
  ];

  const getActiveStepIndex = (status: CustomerOrder['status']) => {
    if (status === 'new') return 1;
    if (status === 'confirmed') return 2;
    if (status === 'complete') return 3;
    return 1;
  };

  return (
    <div
      className="fixed inset-0 z-110 flex items-center justify-center bg-zx-cinematic/45 p-4 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="zx-tracking-dialog relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-[2.2rem] border border-zx-border bg-zx-surface-raised p-6 shadow-2xl"
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        aria-labelledby="zx-tracking-title"
        aria-modal="true"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zx-border pb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zx-mint text-zx-mint-contrast">
              <Truck className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-zx-text" id="zx-tracking-title">
                {isArabic ? 'تتبع حالة الطلب والشحنة' : 'Order & Shipment Tracking'}
              </h2>
              <p className="text-[10px] text-zx-text">
                {isArabic ? 'تابع حالة الطلب ورقم الشحنة باستخدام رقم الطلب وهاتفك' : 'Track your order with its reference and phone number'}
              </p>
            </div>
          </div>
          <button
            aria-label={isArabic ? 'إغلاق تتبع الطلب' : 'Close order tracking'}
            className="flex h-11 w-11 items-center justify-center rounded-full text-zx-text hover:bg-zx-mint"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search Input */}
        <form className="mt-5 grid gap-2 sm:grid-cols-[1fr_1fr_auto]" onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute inset-s-3 top-3 h-4 w-4 text-zx-text" />
            <input
              aria-label={isArabic ? 'رقم الطلب' : 'Order ID'}
              className="h-11 w-full rounded-xl border border-zx-border bg-zx-surface-raised ps-9 pe-3 text-base outline-none focus:border-zx-border"
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isArabic ? 'رقم الطلب' : 'Order ID'}
              required
              type="text"
              value={query}
            />
          </div>
          <input
            aria-label={isArabic ? 'رقم الهاتف المستخدم في الطلب' : 'Phone used for the order'}
            autoComplete="tel"
            className="h-11 w-full rounded-xl border border-zx-border bg-zx-surface-raised px-3 text-base outline-none focus:border-zx-border"
            onChange={(e) => setPhone(e.target.value)}
            placeholder={isArabic ? 'رقم الهاتف المستخدم في الطلب' : 'Phone used for the order'}
            required
            type="tel"
            value={phone}
          />
          <button
            className="min-h-11 rounded-xl bg-zx-cinematic px-5 text-xs font-semibold text-zx-accent-contrast shadow-xs hover:bg-zx-cinematic disabled:opacity-60"
            disabled={isSearching}
            type="submit"
          >
            {isSearching ? (isArabic ? 'جارٍ البحث' : 'Searching') : (isArabic ? 'تتبع' : 'Track')}
          </button>
        </form>

        {/* Quick Demo Pickers if no search query */}
        {!searched && orders.length > 0 && (
          <div className="mt-3">
            <p className="text-[9px] text-zx-text-secondary">
              {isArabic ? 'طلباتك المحفوظة مؤخراً:' : 'Recent orders on this device:'}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {orders.slice(0, 3).map((o) => (
                <button
                  className="min-h-11 rounded-lg border border-zx-border bg-zx-surface-raised px-2.5 py-1 text-xs font-mono font-bold text-zx-text hover:bg-zx-mint"
                  key={o.id}
                  onClick={() => {
                    setQuery(o.id);
                    setPhone(o.phone);
                    setFoundOrder(o);
                    setSearched(true);
                  }}
                  type="button"
                >
                  {o.id} ({o.customer})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results Area */}
        <div className="mt-5 flex-1 overflow-y-auto">
          {foundOrder ? (
            <div className="space-y-5 rounded-2xl border border-zx-border bg-zx-surface-raised p-4">
              {/* Top Order Badge */}
              <div className="flex items-center justify-between border-b border-zx-border pb-3">
                <div>
                  <span className="font-mono text-sm font-extrabold text-zx-text">{foundOrder.id}</span>
                  <p className="text-[10px] text-zx-text">
                    {foundOrder.customer} · {foundOrder.city} ({foundOrder.market === 'eg' ? '🇪🇬 مصر' : '🇸🇦 السعودية'})
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    aria-label={isArabic ? 'نسخ رقم الطلب' : 'Copy order ID'}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-zx-border text-zx-text hover:bg-zx-mint"
                    onClick={() => handleCopy(foundOrder.id, 'id')}
                    title={isArabic ? 'نسخ رقم الطلب' : 'Copy order ID'}
                    type="button"
                  >
                    {copied === 'id' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                  <span className={`rounded-full px-3 py-1 text-[9px] font-bold ${foundOrder.status === 'cancelled' ? 'bg-zx-mint text-zx-mint-contrast' : 'bg-zx-mint text-zx-mint-contrast'}`}>
                  {foundOrder.status === 'cancelled'
                    ? isArabic ? 'ملغي' : 'Cancelled'
                    : foundOrder.status === 'new'
                    ? isArabic
                      ? 'تم الاستلام'
                      : 'Received'
                    : foundOrder.status === 'confirmed'
                      ? isArabic
                        ? 'قيد التوصيل'
                        : 'Shipped'
                      : isArabic
                        ? 'مكتمل'
                        : 'Delivered'}
                  </span>
                </div>
              </div>

              {/* Progress Steps Visualizer */}
              {(foundOrder.trackingNumber || foundOrder.trackingUrl || foundOrder.shippingCarrier) && (
                <div className="rounded-xl border border-zx-border bg-zx-surface-raised p-3 text-xs">
                  <p className="font-bold text-zx-text">{isArabic ? 'بيانات شركة الشحن' : 'Shipment details'}</p>
                  {foundOrder.shippingCarrier && <p className="mt-1 text-zx-text">{isArabic ? 'الشركة:' : 'Carrier:'} {foundOrder.shippingCarrier}</p>}
                  {foundOrder.trackingNumber && <p className="mt-1 font-mono text-zx-text">{isArabic ? 'رقم التتبع:' : 'Tracking number:'} {foundOrder.trackingNumber}</p>}
                  {foundOrder.trackingUrl && /^https:\/\//i.test(foundOrder.trackingUrl) && <a className="mt-2 inline-flex text-zx-text underline" href={foundOrder.trackingUrl} rel="noopener noreferrer" target="_blank">{isArabic ? 'افتح صفحة تتبع شركة الشحن' : 'Open carrier tracking page'}</a>}
                </div>
              )}
              {foundOrder.paymentStatus && (
                <p className="rounded-xl border border-zx-border bg-zx-surface-raised p-3 text-xs text-zx-text">
                  <strong>{isArabic ? 'حالة الدفع:' : 'Payment:'}</strong>{' '}
                  {foundOrder.paymentStatus === 'paid' ? (isArabic ? 'تم الدفع' : 'Paid')
                    : foundOrder.paymentStatus === 'pending' ? (isArabic ? 'بانتظار الدفع' : 'Awaiting payment')
                      : foundOrder.paymentStatus === 'failed' ? (isArabic ? 'لم يكتمل الدفع' : 'Payment not completed')
                        : foundOrder.paymentStatus === 'refunded' ? (isArabic ? 'تم رد المبلغ' : 'Refunded')
                          : (isArabic ? 'غير مدفوع' : 'Unpaid')}
                </p>
              )}
              {foundOrder.status === 'cancelled' ? (
                <p className="rounded-xl border border-zx-border bg-zx-surface-raised p-3 text-xs text-zx-text">{isArabic ? 'تم إلغاء هذا الطلب. تواصل معنا عبر واتساب إذا كنت تحتاج إلى مساعدة.' : 'This order was cancelled. Contact us on WhatsApp if you need help.'}</p>
              ) : <div className="space-y-4">
                {steps.map((st, i) => {
                  const activeIndex = getActiveStepIndex(foundOrder.status);
                  const isDone = i <= activeIndex;
                  return (
                    <div className="flex items-start gap-3" key={st.id}>
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                          isDone
                            ? 'bg-zx-cinematic text-zx-accent-contrast shadow-xs'
                            : 'border border-zx-border bg-zx-surface-raised text-zx-text-secondary'
                        }`}
                      >
                        {isDone ? '✓' : i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className={`text-xs font-bold ${isDone ? 'text-zx-text' : 'text-zx-text-secondary'}`}>
                          {st.label}
                        </p>
                        <p className="text-[10px] text-zx-text">{st.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>}

              {/* Summary Items */}
              <div className="rounded-xl border border-zx-border bg-zx-surface-raised p-3 text-xs">
                <p className="font-bold text-zx-text">{isArabic ? 'محتويات الشحنة:' : 'Package Items:'}</p>
                <div className="mt-1.5 space-y-1 text-[11px] text-zx-text">
                  {foundOrder.items.map((it, idx) => (
                    <div className="flex justify-between" key={idx}>
                      <span>• {it.quantity}x {it.name}</span>
                      <span className="font-semibold">{it.egp ? `${it.egp} ج.م` : `${it.sar} ر.س`}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2.5 flex justify-between border-t border-zx-border pt-2 font-bold text-zx-text">
                  <span>{isArabic ? 'الإجمالي الشامل:' : 'Total Amount:'}</span>
                  <span>{foundOrder.total} {foundOrder.market === 'eg' ? 'ج.م' : 'ر.س'}</span>
                </div>
              </div>

              {/* Help & WhatsApp inquiry */}
              <a
                className="flex items-center justify-center gap-2 rounded-xl bg-zx-accent py-2.5 text-xs font-bold text-zx-accent-contrast shadow-xs hover:bg-zx-cinematic"
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                  isArabic
                    ? `استفسار حول حالة الشحنة رقم ${foundOrder.id} للعميل ${foundOrder.customer}.`
                    : `Inquiry regarding tracking of order ${foundOrder.id}.`,
                )}`}
                rel="noreferrer"
                target="_blank"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{isArabic ? 'تواصل مع خدمة العملاء عبر واتساب' : 'Contact customer support on WhatsApp'}</span>
              </a>
            </div>
          ) : searched && !isSearching ? (
            <div className="py-10 text-center">
              <Package className="mx-auto h-12 w-12 text-zx-text-secondary" />
              <p className="mt-3 text-sm font-bold text-zx-text">
                {isArabic ? 'لم يظهر طلب مطابق' : 'No matching order found'}
              </p>
              <p className="mt-1 text-xs text-zx-text-secondary">
                {isArabic ? 'تأكد من رقم الطلب والهاتف، أو تحقق من اتصال المتجر وحاول مرة أخرى.' : 'Check the order ID and phone, then verify the store connection and try again.'}
              </p>
            </div>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
