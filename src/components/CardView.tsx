import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, CreditCard, ExternalLink, Phone, Sparkles } from 'lucide-react';
import { supabase } from '../../supabase';

interface CardData {
  card_id: string;
  client_name: string;
  invoice_url: string;
  phone?: string;
}

function getSafeExternalUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
  } catch {
    return null;
  }
}

export default function CardView() {
  const [card, setCard] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    document.documentElement.lang = 'ar';
    document.documentElement.dir = 'rtl';
    document.title = 'بطاقة زكسور الرقمية | ZEXOR';

    let cancelled = false;
    async function getCardData() {
      let cardId = '';
      try {
        cardId = decodeURIComponent(window.location.hash.slice('#card/'.length)).trim();
      } catch {
        // Keep the id empty if a malformed URL escape was supplied.
      }
      if (!cardId || cardId.length > 120) {
        setError('رابط البطاقة غير صالح. تأكد من الرابط وحاول مرة أخرى.');
        setLoading(false);
        return;
      }

      try {
        const { data, error: queryError } = await supabase
          .from('cards')
          .select('card_id, client_name, invoice_url, phone')
          .eq('card_id', cardId)
          .maybeSingle();
        if (cancelled) return;
        if (queryError || !data) {
          setError('لم نتمكن من العثور على هذه البطاقة. تحقق من الرابط أو تواصل مع صاحبها.');
        } else {
          setCard(data as CardData);
        }
      } catch {
        if (!cancelled) setError('تعذر الاتصال الآن. تحقق من الإنترنت ثم حاول مرة أخرى.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void getCardData();
    return () => { cancelled = true; };
  }, []);

  const invoiceUrl = card ? getSafeExternalUrl(card.invoice_url) : null;
  const phoneUrl = card?.phone ? `tel:${card.phone.replace(/[^\d+]/g, '')}` : null;

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-zx-cinematic px-4 py-12 text-zx-ink sm:px-6">
        <div aria-hidden="true" className="zx-card-view__glow pointer-events-none absolute inset-0" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 -left-40 h-96 w-96 rounded-full border border-zx-line" />
      <div className="relative w-full max-w-md">
        <a className="mb-8 inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-zx-ink transition hover:text-zx-primary" href="./">
          <ArrowLeft aria-hidden="true" className="h-4 w-4 rtl:rotate-180" />
          العودة إلى ZEXOR
        </a>

        <section aria-live="polite" className="overflow-hidden rounded-[2rem] border border-zx-line bg-zx-cinematic shadow-zx-card backdrop-blur-xl">
          <div className="relative border-b border-zx-line px-7 pb-8 pt-7 sm:px-9">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zx-elevated to-transparent" />
            <div className="flex items-center justify-between">
              <a aria-label="ZEXOR" className="text-lg font-black tracking-[0.23em]" href="./">ZEXOR<span className="text-zx-secondary">.</span></a>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-zx-line bg-zx-panel px-3 py-1.5 text-[10px] font-semibold tracking-wide text-zx-accent">
                <Sparkles aria-hidden="true" className="h-3 w-3" /> بطاقة رقمية
              </span>
            </div>
            <div className="mt-9 flex h-14 w-14 items-center justify-center rounded-2xl border border-zx-line bg-zx-elevated text-zx-accent">
              <CreditCard aria-hidden="true" className="h-6 w-6" />
            </div>
            <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.22em] text-zx-secondary">ZEXOR DIGITAL IDENTITY</p>
            {loading ? (
              <div className="mt-3 space-y-3" role="status">
                <span className="block h-7 w-2/3 animate-pulse rounded-lg bg-zx-elevated" />
                <span className="block h-4 w-1/2 animate-pulse rounded-lg bg-zx-elevated" />
                <span className="sr-only">جارٍ تحميل بيانات البطاقة</span>
              </div>
            ) : error ? (
              <div className="mt-5 rounded-2xl border border-zx-warning/10 bg-zx-warning/10/[0.05] p-4 text-sm leading-7 text-zx-ink" role="alert">
                {error}
              </div>
            ) : (
              <>
                <h1 className="mt-3 break-words text-3xl font-bold tracking-tight sm:text-4xl">{card?.client_name}</h1>
                <p className="mt-2 text-sm leading-6 text-zx-ink">بطاقتك الرقمية، كل تفاصيلك المهمة في مكان واحد.</p>
              </>
            )}
          </div>

          {!loading && !error && card && (
            <div className="space-y-3 p-6 sm:p-8">
              {invoiceUrl ? (
                <a className="group flex min-h-14 w-full items-center justify-between rounded-2xl bg-zx-panel px-5 text-sm font-bold text-zx-ink transition hover:bg-zx-elevated focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-zx-accent" href={invoiceUrl} rel="noopener noreferrer" target="_blank">
                  <span>عرض الملف الشخصي أو الفاتورة</span>
                  <ExternalLink aria-hidden="true" className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              ) : (
                <p className="rounded-2xl border border-zx-line bg-zx-elevated px-4 py-3 text-xs leading-6 text-zx-ink">لا يوجد رابط ملف شخصي مضاف لهذه البطاقة حاليًا.</p>
              )}
              {phoneUrl && (
                <a className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-zx-line bg-zx-elevated text-xs font-semibold text-zx-ink transition hover:bg-zx-elevated focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-zx-accent" href={phoneUrl}>
                  <Phone aria-hidden="true" className="h-3.5 w-3.5" />
                  اتصال مباشر
                  <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          )}
        </section>

        <p className="mt-6 text-center text-[10px] tracking-wide text-zx-ink">هوية رقمية أنيقة من ZEXOR</p>
      </div>
    </main>
  );
}
