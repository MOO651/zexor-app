import { motion } from 'framer-motion';
import { ArrowUpLeft, ArrowUpRight, Sparkles } from 'lucide-react';
import { art } from '../data/imagery';
import type { Locale } from '../types';
import { publicAssetUrl } from '../utils';

type Department = 'cards' | 'fashion' | 'services' | 'cars' | 'property';
const stories: Record<Department, { image: string; ar: string; en: string; noteAr: string; noteEn: string }[]> = {
  cards: [
    { image: art.cardsElite, ar: 'هوية مهنية في لمسة', en: 'Your identity, in one tap', noteAr: 'بطاقة NFC بتفاصيلك', noteEn: 'A card that carries your details' },
    { image: art.cardsSocial, ar: 'روابطك كلها معك', en: 'All your links, together', noteAr: 'مشاركة أسهل لحساباتك', noteEn: 'Share your profiles with ease' },
    { image: art.cardsBespoke, ar: 'تفصيلة تشبهك', en: 'Made to feel like you', noteAr: 'خيارات تخصيص متعددة', noteEn: 'Personalized finishes' },
  ],
  fashion: [
    { image: art.hoodie, ar: 'راحة بقصّة واضحة', en: 'Comfort with a point of view', noteAr: 'قطع أساسية للّبس اليومي', noteEn: 'Everyday essentials' },
    { image: art.tee, ar: 'تفاصيل تصنع الفرق', en: 'Details make the difference', noteAr: 'ألوان وقصّات مختارة', noteEn: 'Considered cuts and colors' },
    { image: art.hoodie, ar: 'اختيارات على مزاجك', en: 'Find your own uniform', noteAr: 'اكتشف المجموعة', noteEn: 'Explore the collection' },
  ],
  services: [
    { image: art.studioWebsite, ar: 'مواقع تعكس مشروعك', en: 'Websites built around you', noteAr: 'حضور رقمي واضح', noteEn: 'A clear digital presence' },
    { image: art.studioStore, ar: 'متجر جاهز للنمو', en: 'A store ready to grow', noteAr: 'تجربة بيع سلسة', noteEn: 'A smoother sales experience' },
    { image: art.studioPortal, ar: 'من التخطيط للإطلاق', en: 'From plan to launch', noteAr: 'نرافقك في كل خطوة', noteEn: 'Support at every step' },
  ],
  cars: [
    { image: art.vehicleSedan, ar: 'قيادة يومية براحة', en: 'Comfort for every day', noteAr: 'اختيارات عملية', noteEn: 'Practical choices' },
    { image: art.vehicleSuv, ar: 'مساحة أكبر لمشوارك', en: 'More room for the journey', noteAr: 'تفاصيل تناسب احتياجك', noteEn: 'Space for what matters' },
    { image: art.vehicleCoupe, ar: 'حضور مختلف على الطريق', en: 'A different road presence', noteAr: 'شاهد المعروض', noteEn: 'Browse available listings' },
  ],
  property: [
    { image: art.propertyApartment, ar: 'مساحة تبدأ منها', en: 'A place to begin', noteAr: 'شقق مختارة', noteEn: 'Selected apartments' },
    { image: art.propertyVilla, ar: 'بيت على مقاسك', en: 'A home that fits you', noteAr: 'تفاصيل تدوم', noteEn: 'Room to make it yours' },
    { image: art.propertyLand, ar: 'فرصة للمستقبل', en: 'Space for what comes next', noteAr: 'أراضٍ ومساحات', noteEn: 'Land and possibilities' },
  ],
};

export function DepartmentHighlights({ department, locale }: { department: Department; locale: Locale }) {
  const isArabic = locale === 'ar';
  const entries = stories[department];
  const Arrow = isArabic ? ArrowUpLeft : ArrowUpRight;
  return (
    <section aria-label={isArabic ? 'اكتشف القسم' : 'Discover this department'} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map((entry, index) => (
        <motion.article key={`${department}-${index}`} className="group relative min-h-64 overflow-hidden rounded-[1.7rem] border border-white/80 bg-[#e8eee9] shadow-[0_16px_50px_-30px_rgba(31,65,50,.55)]" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }} transition={{ duration: .5, delay: index * .08 }}>
          <motion.img alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" src={publicAssetUrl(entry.image)} />
          <div className="absolute inset-0 bg-linear-to-t from-[#142b23]/90 via-[#142b23]/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
            <p className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[.18em] text-white/70"><Sparkles className="h-3.5 w-3.5" />{isArabic ? entry.noteAr : entry.noteEn}</p>
            <h3 className="mt-2 text-lg font-bold leading-snug sm:text-xl">{isArabic ? entry.ar : entry.en}</h3>
            <Arrow className="absolute bottom-6 end-6 h-5 w-5 text-white/70 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-white" />
          </div>
        </motion.article>
      ))}
    </section>
  );
}
