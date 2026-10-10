import { useState } from 'react';
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
  const [searched, setSearched] = useState(false);
  const [foundOrder, setFoundOrder] = useState<CustomerOrder | null>(null);
  const [copied, setCopied] = useState<'id' | 'phone' | null>(null);

  const handleCopy = async (value: string, field: 'id' | 'phone') => {
    const ok = await copyToClipboard(value);
    if (!ok) return;
    setCopied(field);
    window.setTimeout(() => setCopied(null), 1800);
  };

  if (!open) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    const clean = query.trim().toUpperCase();
    const match = orders.find(
      (o) => o.id.toUpperCase() === clean || o.phone.includes(clean) || o.customer.toUpperCase().includes(clean),
    );
    setFoundOrder(match ?? null);
  };

  const steps = [
    { id: 'new', label: isArabic ? 'تم استلام الطلب وتأكيده' : 'Order Received & Confirmed', desc: isArabic ? 'تمت مراجعة المنتجات واعتمادها في النظام.' : 'Items registered and verified.' },
    { id: 'processing', label: isArabic ? 'قيد التجهيز والتغليف' : 'Processing & Packaging', desc: isArabic ? 'تجهيز الكروت والملابس في الأتيليه والتغليف الفاخر.' : 'Customization & premium packaging in progress.' },
    { id: 'shipping', label: isArabic ? 'خرج مع مندوب الشحن' : 'Out for Delivery', desc: isArabic ? 'الشحنة في طريقها إليك عبر أرامكس / بوسطة.' : 'Package is on the vehicle for delivery.' },
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
      className="fixed inset-0 z-110 flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-[2.2rem] border border-white bg-white p-6 shadow-2xl"
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#edf1ee] pb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e5f4ec] text-[#4f7d67]">
              <Truck className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-[#2b4133]">
                {isArabic ? 'نظام تتبع حالة الشحنات والطلبات' : 'Live Order & Shipment Tracker'}
              </h2>
              <p className="text-[10px] text-[#788a80]">
                {isArabic ? 'تتبع فوري لمراحل شحن طلبك برقم الشحنة أو رقم الهاتف' : 'Track your package progress in real-time'}
              </p>
            </div>
          </div>
          <button
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#75887d] hover:bg-[#edf2ef]"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search Input */}
        <form className="mt-5 flex gap-2" onSubmit={handleSearch}>
          <div className="relative flex-1">
            <Search className="absolute start-3 top-3 h-4 w-4 text-[#758a7e]" />
            <input
              className="h-10 w-full rounded-xl border border-[#dfe7e1] bg-white ps-9 pe-3 text-xs outline-none focus:border-[#67ab8b]"
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isArabic ? 'أدخل رقم الطلب (مثال: ZX-10293) أو هاتفك…' : 'Enter Order ID (e.g. ZX-10293) or phone…'}
              required
              value={query}
            />
          </div>
          <button
            className="rounded-xl bg-[#314f43] px-5 text-xs font-semibold text-white shadow-xs hover:bg-[#436e5d]"
            type="submit"
          >
            {isArabic ? 'تتبع' : 'Track'}
          </button>
        </form>

        {/* Quick Demo Pickers if no search query */}
        {!searched && orders.length > 0 && (
          <div className="mt-3">
            <p className="text-[9px] text-[#7d8f85]">
              {isArabic ? 'طلباتك المحفوظة مؤخراً:' : 'Recent orders on this device:'}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {orders.slice(0, 3).map((o) => (
                <button
                  className="rounded-lg border border-[#dfe7e1] bg-[#f8faf8] px-2.5 py-1 text-[9px] font-mono font-bold text-[#426453] hover:bg-[#edf5f0]"
                  key={o.id}
                  onClick={() => {
                    setQuery(o.id);
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
            <div className="space-y-5 rounded-2xl border border-[#e3ebe5] bg-[#f8faf8] p-4">
              {/* Top Order Badge */}
              <div className="flex items-center justify-between border-b border-[#e9eee9] pb-3">
                <div>
                  <span className="font-mono text-sm font-extrabold text-[#2a4435]">{foundOrder.id}</span>
                  <p className="text-[10px] text-[#718579]">
                    {foundOrder.customer} · {foundOrder.city} ({foundOrder.market === 'eg' ? '🇪🇬 مصر' : '🇸🇦 السعودية'})
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    aria-label={isArabic ? 'نسخ رقم الطلب' : 'Copy order ID'}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-[#dfe7e1] text-[#5a7265] hover:bg-[#edf5f0]"
                    onClick={() => handleCopy(foundOrder.id, 'id')}
                    title={isArabic ? 'نسخ رقم الطلب' : 'Copy order ID'}
                    type="button"
                  >
                    {copied === 'id' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                  <span className="rounded-full bg-[#e5f5ec] px-3 py-1 text-[9px] font-bold text-[#357e58]">
                  {foundOrder.status === 'new'
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
              <div className="space-y-4">
                {steps.map((st, i) => {
                  const activeIndex = getActiveStepIndex(foundOrder.status);
                  const isDone = i <= activeIndex;
                  return (
                    <div className="flex items-start gap-3" key={st.id}>
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                          isDone
                            ? 'bg-[#314f43] text-white shadow-xs'
                            : 'border border-[#d5ded8] bg-white text-[#9aa8a0]'
                        }`}
                      >
                        {isDone ? '✓' : i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className={`text-xs font-bold ${isDone ? 'text-[#2e4739]' : 'text-[#8fa096]'}`}>
                          {st.label}
                        </p>
                        <p className="text-[10px] text-[#76877d]">{st.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary Items */}
              <div className="rounded-xl border border-[#e1e9e3] bg-white p-3 text-xs">
                <p className="font-bold text-[#344d3f]">{isArabic ? 'محتويات الشحنة:' : 'Package Items:'}</p>
                <div className="mt-1.5 space-y-1 text-[11px] text-[#5e7166]">
                  {foundOrder.items.map((it, idx) => (
                    <div className="flex justify-between" key={idx}>
                      <span>• {it.quantity}x {it.name}</span>
                      <span className="font-semibold">{it.egp ? `${it.egp} ج.م` : `${it.sar} ر.س`}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2.5 flex justify-between border-t border-[#edf1ee] pt-2 font-bold text-[#2a4435]">
                  <span>{isArabic ? 'الإجمالي الشامل:' : 'Total Amount:'}</span>
                  <span>{foundOrder.total} {foundOrder.market === 'eg' ? 'ج.م' : 'ر.س'}</span>
                </div>
              </div>

              {/* Help & WhatsApp inquiry */}
              <a
                className="flex items-center justify-center gap-2 rounded-xl bg-[#25855a] py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#1f734d]"
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                  isArabic
                    ? `استفسار حول حالة الشحنة رقم ${foundOrder.id} للعميل ${foundOrder.customer}.`
                    : `Inquiry regarding tracking of order ${foundOrder.id}.`,
                )}`}
                rel="noreferrer"
                target="_blank"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{isArabic ? 'متابعة مباشرة مع مندوب الشحن عبر واتساب' : 'Chat with Courier Support'}</span>
              </a>
            </div>
          ) : searched ? (
            <div className="py-10 text-center">
              <Package className="mx-auto h-12 w-12 text-[#9bb0a4]" />
              <p className="mt-3 text-sm font-bold text-[#354f41]">
                {isArabic ? 'لم يتم العثور على شحنة بهذا الرقم' : 'No shipment found'}
              </p>
              <p className="mt-1 text-xs text-[#7f9086]">
                {isArabic ? 'تأكد من إدخال رقم الطلب الصحيح أو تواصل مع خدمة العملاء.' : 'Verify order ID or contact customer care.'}
              </p>
            </div>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
