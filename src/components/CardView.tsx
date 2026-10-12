import { useEffect, useState } from 'react';
import { supabase } from '../../supabase';

interface CardData {
  card_id: string;
  client_name: string;
  invoice_url: string;
  phone?: string;
}

export default function CardView() {
  const [card, setCard] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function getCardData() {
      // استخراج الـ ID مباشرة من الـ Hash (مثال: #card/zexor-001)
      const hash = window.location.hash;
      const cardId = hash.split('#card/')[1];

      if (!cardId) {
        setError('معرف الكارت غير صحيح');
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('card_id', cardId)
        .single();

      if (error) {
        setError('الكارت غير مسجل أو تعذر العثور على البيانات');
      } else {
        setCard(data);
      }
      setLoading(false);
    }

    getCardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-900 text-white">
        <p className="text-xl animate-pulse">جاري تحميل بيانات الكارت...</p>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-900 text-red-400">
        <p className="text-xl">{error || 'عفواً، هذا الكارت غير موجود'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col items-center justify-center dir-rtl">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-center space-y-6">
        <h1 className="text-3xl font-bold text-cyan-400">ZEXOR</h1>
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-xl font-semibold text-slate-200">{card.client_name}</h2>
          {card.phone && <p className="text-sm text-slate-400 mt-1">هاتف: {card.phone}</p>}
        </div>

        <div className="space-y-4">
          <a
            href={card.invoice_url}
            target="_blank"
            rel="noreferrer"
            className="block w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 font-bold rounded-xl shadow-lg hover:opacity-90 transition"
          >
            عرض الفاتورة / البروفايل
          </a>
        </div>
      </div>
    </div>
  );
}