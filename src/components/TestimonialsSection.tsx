import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MessageSquarePlus,
  Quote,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import { TESTIMONIALS } from '../data/initialData';
import { TiltCard } from './HomeHero';
import type { Locale, Testimonial } from '../types';

type Props = {
  locale: Locale;
  onToast: (msg: string) => void;
};

export function TestimonialsSection({ locale, onToast }: Props) {
  const isArabic = locale === 'ar';
  const [items, setItems] = useState<Testimonial[]>(TESTIMONIALS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState<'all' | 'nfc' | 'dev' | 'market'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New review form
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);

  const categories = [
    { id: 'all', label: isArabic ? 'جميع التقييمات' : 'All Reviews' },
    { id: 'nfc', label: isArabic ? 'كروت NFC الذكية' : 'NFC Cards' },
    { id: 'dev', label: isArabic ? 'تطوير المواقع والمتاجر' : 'Web & Apps' },
    { id: 'market', label: isArabic ? 'السيارات والعقارات' : 'Cars & Real Estate' },
  ] as const;

  const filteredItems = items.filter((item) => {
    if (filter === 'nfc') return item.id === 'test-2';
    if (filter === 'dev') return item.id === 'test-1' || item.id === 'test-3';
    if (filter === 'market') return item.id === 'test-4' || item.id === 'test-5';
    return true;
  });

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredItems.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? filteredItems.length - 1 : prev - 1));
  };

  const visibleReviews = filteredItems.length <= 3
    ? filteredItems
    : filteredItems.slice(currentIndex, currentIndex + 3).concat(
        filteredItems.slice(0, Math.max(0, currentIndex + 3 - filteredItems.length)),
      );

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newComment.trim()) return;

    const newTestimonial: Testimonial = {
      id: `test-user-${Date.now()}`,
      name: { ar: newName.trim(), en: newName.trim() },
      role: { ar: newRole.trim() || (isArabic ? 'عميل مميز' : 'Verified Client'), en: newRole.trim() || 'Verified Client' },
      company: { ar: newCompany.trim() || 'ZEXOR VIP', en: newCompany.trim() || 'ZEXOR VIP' },
      content: { ar: newComment.trim(), en: newComment.trim() },
      rating: newRating,
      avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
    };

    setItems((prev) => [newTestimonial, ...prev]);
    setShowAddModal(false);
    setNewName('');
    setNewRole('');
    setNewCompany('');
    setNewComment('');
    onToast(isArabic ? 'شكراً لك! تم نشر تقييمك بنجاح.' : 'Thank you! Your review is published.');
  };

  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-white/90 bg-linear-to-br from-[#eff7f2] via-[#fafcf9] to-[#f5ebf8] p-6 shadow-xl sm:p-12 sm:rounded-[3rem]">
      {/* Background radial effects */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 inset-s-[20%] h-80 w-80 rounded-full bg-[#a3e8ce]/25 blur-[90px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -inset-e-20 h-96 w-96 rounded-full bg-[#f1d0ec]/25 blur-[100px]"
      />

      {/* Top Header */}
      <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3.5 py-1.5 text-[9px] font-bold uppercase tracking-widest text-[#4f7f68] shadow-xs backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-[#5e967c]" />
            <span>06 / {isArabic ? 'آراء وتقييمات العملاء' : 'CLIENT EXPERIENCES & REVIEWS'}</span>
          </div>

          <h2 className="mt-3 text-3xl font-extrabold text-[#263c30] sm:text-4xl md:text-5xl">
            {isArabic ? 'تجارب حقيقية' : 'Real Stories,'}{' '}
            <span className="font-serif italic font-normal text-[#ba7f6d]">
              {isArabic ? 'بثقة عملائنا الدائمة.' : 'Lasting Impressions.'}
            </span>
          </h2>
          <p className="mt-2 text-xs leading-6 text-[#697d72] sm:text-sm">
            {isArabic
              ? 'أكثر من 85 تقييماً معتمداً لرواد أعمال وشركات في مصر والسعودية تميزوا مع ZEXOR.'
              : 'Over 85 verified testimonials from founders and organizations across Egypt and Saudi Arabia.'}
          </p>
        </div>

        {/* Global Rating Score Badge & Add Review CTA */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-white bg-white/80 px-4 py-2.5 shadow-sm backdrop-blur-md">
            <div className="flex text-[#f59e0b]">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star className="h-4 w-4 fill-current drop-shadow-xs" key={i} />
              ))}
            </div>
            <span className="text-sm font-extrabold text-[#284133]">5.0 / 5.0</span>
            <span className="text-[10px] text-[#718579]">
              ({items.length}+ {isArabic ? 'تقييم موثق' : 'reviews'})
            </span>
          </div>

          <button
            className="flex items-center gap-1.5 rounded-2xl bg-[#314f43] px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-[#436e5d]"
            onClick={() => setShowAddModal(true)}
            type="button"
          >
            <MessageSquarePlus className="h-3.5 w-3.5" />
            <span>{isArabic ? 'أضف رأيك وتقييمك' : 'Write a Review'}</span>
          </button>
        </div>
      </div>

      {/* Category Pills & Carousel Nav Controls */}
      <div className="relative z-10 mt-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              className={`rounded-full px-3.5 py-1.5 text-[10px] font-bold transition-all ${
                filter === cat.id
                  ? 'bg-[#294234] text-white shadow-xs'
                  : 'border border-white/80 bg-white/60 text-[#62776c] hover:bg-white'
              }`}
              key={cat.id}
              onClick={() => {
                setFilter(cat.id as typeof filter);
                setCurrentIndex(0);
              }}
              type="button"
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Slider Arrows & Dots */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {filteredItems.map((_, dotIdx) => (
              <button
                aria-label={`Go to slide ${dotIdx + 1}`}
                className={`h-2 rounded-full transition-all ${
                  currentIndex === dotIdx ? 'w-6 bg-[#314f43]' : 'w-2 bg-[#ccd9d1]'
                }`}
                key={dotIdx}
                onClick={() => setCurrentIndex(dotIdx)}
                type="button"
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              aria-label="Previous review"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white bg-white/80 text-[#30483a] shadow-xs backdrop-blur-md transition-all hover:bg-white"
              onClick={handlePrev}
              type="button"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              aria-label="Next review"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white bg-white/80 text-[#30483a] shadow-xs backdrop-blur-md transition-all hover:bg-white"
              onClick={handleNext}
              type="button"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modern Vibrant Cards Grid with 3D Tilt */}
      <div className="relative z-10 mt-8 grid gap-6 md:grid-cols-3">
        {visibleReviews.map((item, idx) => (
          <TiltCard
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/95 bg-white/85 p-6 shadow-[0_20px_50px_-30px_rgba(40,75,55,.25)] backdrop-blur-xl transition-all duration-300 hover:shadow-[0_25px_60px_-25px_rgba(40,75,55,.35)]"
            intensity={idx === 1 ? 10 : 7}
            key={item.id}
          >
            {/* Top Quote Icon & Rating */}
            <div>
              <div className="flex items-center justify-between">
                <div className="flex gap-1 text-[#f59e0b]">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star className="h-4 w-4 fill-current drop-shadow-xs" key={i} />
                  ))}
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#eaf4ee] text-[#55866d] shadow-xs">
                  <Quote className="h-4 w-4" />
                </span>
              </div>

              {/* Review Text */}
              <p className="mt-4 text-xs font-medium leading-6 text-[#405649]">
                "{item.content[locale]}"
              </p>
            </div>

            {/* Author Info */}
            <div className="mt-6 flex items-center gap-3 border-t border-[#edf2ef] pt-4">
              <div className="relative">
                <img
                  alt={item.name[locale]}
                  className="h-11 w-11 rounded-full border-2 border-white object-cover shadow-sm ring-2 ring-[#70bfa0]/40"
                  src={item.avatar}
                />
                <span
                  className="absolute -bottom-0.5 -end-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#314f43] text-white shadow-xs"
                  title="Verified Client"
                >
                  <CheckCircle2 className="h-3 w-3" />
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="truncate text-xs font-bold text-[#2a4133]">
                    {item.name[locale]}
                  </h4>
                  <span className="rounded-full bg-[#e8f6ee] px-2 py-0.5 text-[7px] font-bold text-[#357c58]">
                    {isArabic ? 'موثق' : 'Verified'}
                  </span>
                </div>
                <p className="truncate text-[10px] text-[#718579]">
                  {item.role[locale]} · {item.company[locale]}
                </p>
              </div>
            </div>
          </TiltCard>
        ))}
      </div>

      {/* Add Review Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div
            className="fixed inset-0 z-110 flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowAddModal(false);
            }}
          >
            <motion.div
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative w-full max-w-md rounded-[2rem] border border-white bg-white p-6 shadow-2xl"
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
            >
              <div className="flex items-center justify-between border-b border-[#edf1ee] pb-3">
                <h3 className="text-base font-bold text-[#293d31]">
                  {isArabic ? 'شاركنا رأيك وتجربتك مع ZEXOR' : 'Share Your Experience'}
                </h3>
                <button
                  aria-label="Close"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[#718478] hover:bg-[#edf2ef]"
                  onClick={() => setShowAddModal(false)}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form className="mt-4 space-y-3" onSubmit={handleAddReview}>
                <div>
                  <label className="text-[10px] font-semibold text-[#5a6e62]">
                    {isArabic ? 'الاسم' : 'Your Name'}
                  </label>
                  <input
                    className="mt-1 h-9 w-full rounded-xl border border-[#dfe7e1] px-3 text-xs outline-none"
                    onChange={(e) => setNewName(e.target.value)}
                    required
                    value={newName}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-[#5a6e62]">
                      {isArabic ? 'المسمى الوظيفي' : 'Role'}
                    </label>
                    <input
                      className="mt-1 h-9 w-full rounded-xl border border-[#dfe7e1] px-3 text-xs outline-none"
                      onChange={(e) => setNewRole(e.target.value)}
                      placeholder="e.g. Founder"
                      value={newRole}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-[#5a6e62]">
                      {isArabic ? 'الشركة / النشاط' : 'Company'}
                    </label>
                    <input
                      className="mt-1 h-9 w-full rounded-xl border border-[#dfe7e1] px-3 text-xs outline-none"
                      onChange={(e) => setNewCompany(e.target.value)}
                      placeholder="e.g. Studio"
                      value={newCompany}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-[#5a6e62]">
                    {isArabic ? 'التقييم' : 'Rating'}
                  </label>
                  <div className="mt-1 flex gap-2">
                    {[5, 4, 3, 2, 1].map((stars) => (
                      <button
                        className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold transition-all ${
                          newRating === stars ? 'bg-[#f59e0b] text-white shadow-xs' : 'bg-[#f4f7f5] text-[#697d71]'
                        }`}
                        key={stars}
                        onClick={() => setNewRating(stars)}
                        type="button"
                      >
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <span>{stars}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-[#5a6e62]">
                    {isArabic ? 'تفاصيل الرأي والتجربة' : 'Your Review'}
                  </label>
                  <textarea
                    className="mt-1 h-20 w-full rounded-xl border border-[#dfe7e1] p-2.5 text-xs outline-none"
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                    value={newComment}
                  />
                </div>

                <button
                  className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#314f43] text-xs font-bold text-white shadow-md hover:bg-[#436e5d]"
                  type="submit"
                >
                  <Sparkles className="h-4 w-4" />
                  {isArabic ? 'نشر التقييم فورياً' : 'Submit Review'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
