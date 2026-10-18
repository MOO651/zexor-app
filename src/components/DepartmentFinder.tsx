import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import { PORTALS } from '../data/portals';
import type { Locale, Route } from '../types';

type Department = 'cards' | 'fashion' | 'services' | 'cars' | 'property';
type Choice = { label: Record<Locale, string>; department: Department };

const QUESTIONS: Array<{ title: Record<Locale, string>; choices: Choice[] }> = [
  {
    title: { en: 'What are you looking to do?', ar: 'ما الذي تريد إنجازه؟' },
    choices: [
      { label: { en: 'Share my identity with one tap', ar: 'مشاركة هويتي بلمسة واحدة' }, department: 'cards' },
      { label: { en: 'Find a look that feels like me', ar: 'اختيار إطلالة تعبّر عني' }, department: 'fashion' },
      { label: { en: 'Build a stronger digital presence', ar: 'بناء حضور رقمي أقوى' }, department: 'services' },
      { label: { en: 'Get on the road', ar: 'الانطلاق في الطريق' }, department: 'cars' },
      { label: { en: 'Find a place to call my own', ar: 'العثور على مساحة تناسبني' }, department: 'property' },
    ],
  },
  {
    title: { en: 'Which experience sounds most useful?', ar: 'أي تجربة ستكون الأنسب لك؟' },
    choices: [
      { label: { en: 'Networking without paper cards', ar: 'التواصل دون بطاقات ورقية' }, department: 'cards' },
      { label: { en: 'Everyday pieces with a point of view', ar: 'قطع يومية بطابع مميز' }, department: 'fashion' },
      { label: { en: 'A site, store or app made for growth', ar: 'موقع أو متجر أو تطبيق للنمو' }, department: 'services' },
      { label: { en: 'A flexible rental for my plans', ar: 'سيارة إيجار تناسب خططي' }, department: 'cars' },
      { label: { en: 'A home or space for what comes next', ar: 'منزل أو مساحة لخطوتي القادمة' }, department: 'property' },
    ],
  },
  {
    title: { en: 'What should we help you explore first?', ar: 'بماذا نبدأ رحلتك؟' },
    choices: [
      { label: { en: 'A connected personal brand', ar: 'علامة شخصية متصلة' }, department: 'cards' },
      { label: { en: 'A more individual wardrobe', ar: 'خزانة ملابس تعبّر عني' }, department: 'fashion' },
      { label: { en: 'A practical digital launch', ar: 'انطلاقة رقمية عملية' }, department: 'services' },
      { label: { en: 'A car for the next journey', ar: 'سيارة لرحلتي القادمة' }, department: 'cars' },
      { label: { en: 'A new place to live or work', ar: 'مكان جديد للسكن أو العمل' }, department: 'property' },
    ],
  },
];

type Props = { locale: Locale; navigate: (route: Route) => void };

export function DepartmentFinder({ locale, navigate }: Props) {
  const isArabic = locale === 'ar';
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Department[]>([]);
  const [complete, setComplete] = useState(false);
  const recommendation = useMemo(() => {
    const totals = new Map<Department, number>();
    answers.forEach((answer) => totals.set(answer, (totals.get(answer) ?? 0) + 1));
    return PORTALS.find((portal) => portal.route === answers.reduce<Department | null>((best, answer) => {
      if (!best || (totals.get(answer) ?? 0) > (totals.get(best) ?? 0)) return answer;
      return best;
    }, null));
  }, [answers]);
  const selected = answers[step];
  const currentQuestion = QUESTIONS[step];

  const choose = (department: Department) => {
    setAnswers((current) => {
      const next = current.slice(0, step);
      next[step] = department;
      return next;
    });
  };

  const advance = () => {
    if (!selected) return;
    if (step === QUESTIONS.length - 1) {
      setComplete(true);
      return;
    }
    setStep((current) => current + 1);
  };

  const restart = () => {
    setStep(0);
    setAnswers([]);
    setComplete(false);
  };

  return (
    <section aria-labelledby="department-finder-title" className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 overflow-hidden rounded-[2rem] border border-zx-line bg-zx-elevated p-6 shadow-sm sm:p-9 lg:grid-cols-[.8fr_1.2fr] lg:items-center lg:p-12">
        <div>
          <p className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-zx-secondary">
            <Sparkles aria-hidden="true" className="h-4 w-4 text-zx-highlight" />
            {isArabic ? 'مساعد زكسور · ٣ أسئلة' : 'ZEXOR FINDER · 3 QUESTIONS'}
          </p>
          <h2 className="text-3xl font-bold leading-tight text-zx-ink sm:text-4xl" id="department-finder-title">
            {isArabic ? 'ابدأ من القسم الأنسب لك.' : 'Find your place in ZEXOR.'}
          </h2>
          <p className="mt-3 max-w-md text-sm leading-7 text-zx-secondary sm:text-base">
            {isArabic ? 'أجب عن ثلاثة أسئلة قصيرة وسنرشدك إلى التجربة الأقرب لاحتياجك.' : 'Answer three quick questions and we’ll point you toward the experience that fits.'}
          </p>
        </div>

        <div aria-live="polite" className="min-w-0">
          {complete && recommendation ? (
            <div className="rounded-3xl border border-zx-line bg-zx-bg p-5 sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[.14em] text-zx-secondary">{isArabic ? 'اقتراحنا لك' : 'YOUR MATCH'}</p>
              <h3 className="mt-2 text-2xl font-bold text-zx-ink">{recommendation.title[locale]}</h3>
              <p className="mt-2 text-sm leading-6 text-zx-secondary">{recommendation.tagline[locale]}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button className="inline-flex min-h-11 items-center gap-2 rounded-full bg-zx-primary px-5 py-2.5 text-sm font-semibold text-zx-on-primary" onClick={() => navigate(recommendation.route)} type="button">
                  {isArabic ? 'اكتشف القسم' : 'Explore this department'}
                  {isArabic ? <ArrowLeft aria-hidden="true" className="h-4 w-4" /> : <ArrowRight aria-hidden="true" className="h-4 w-4" />}
                </button>
                <button className="inline-flex min-h-11 items-center gap-2 rounded-full border border-zx-line px-4 py-2.5 text-sm font-semibold text-zx-ink" onClick={restart} type="button">
                  <RotateCcw aria-hidden="true" className="h-4 w-4" />{isArabic ? 'ابدأ من جديد' : 'Start again'}
                </button>
              </div>
            </div>
          ) : currentQuestion && (
            <div className="rounded-3xl border border-zx-line bg-zx-bg p-5 sm:p-7">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h3 className="text-lg font-bold leading-snug text-zx-ink sm:text-xl">{currentQuestion.title[locale]}</h3>
                <span className="shrink-0 text-xs font-bold tabular-nums text-zx-secondary" dir="ltr">{String(step + 1).padStart(2, '0')} / 03</span>
              </div>
              <div aria-label={currentQuestion.title[locale]} className="grid gap-2 sm:grid-cols-2" role="group">
                {currentQuestion.choices.map((choice) => {
                  const active = selected === choice.department;
                  return (
                    <button
                      aria-pressed={active}
                      className={`min-h-12 rounded-2xl border px-4 py-3 text-start text-sm leading-5 transition-colors ${active ? 'border-zx-primary bg-zx-surface text-zx-ink' : 'border-zx-line bg-zx-elevated text-zx-secondary hover:border-zx-primary/50 hover:text-zx-ink'}`}
                      key={choice.department}
                      onClick={() => choose(choice.department)}
                      type="button"
                    >
                      {choice.label[locale]}
                    </button>
                  );
                })}
              </div>
              <div className="mt-5 flex justify-between gap-3">
                <button className="min-h-11 rounded-full px-4 py-2 text-sm font-semibold text-zx-secondary disabled:opacity-40" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))} type="button">
                  {isArabic ? 'السابق' : 'Back'}
                </button>
                <button className="inline-flex min-h-11 items-center gap-2 rounded-full bg-zx-primary px-5 py-2.5 text-sm font-semibold text-zx-on-primary disabled:cursor-not-allowed disabled:opacity-45" disabled={!selected} onClick={advance} type="button">
                  {step === QUESTIONS.length - 1 ? (isArabic ? 'اعرض اقتراحي' : 'Show my match') : (isArabic ? 'السؤال التالي' : 'Next question')}
                  {isArabic ? <ArrowLeft aria-hidden="true" className="h-4 w-4" /> : <ArrowRight aria-hidden="true" className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
