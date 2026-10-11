import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';
import { ArrowUpRight, BadgeCheck, Layers, Sparkles } from 'lucide-react';
import { useMemo, useState, type PointerEvent } from 'react';
import { PORTALS, visiblePortals, type NumberedPortal } from '../data/portals';
import type { Locale, Route } from '../types';

type Props = {
  locale: Locale;
  isArabic: boolean;
  navigate: (route: Route) => void;
  /** Which built-in sections the admin enabled. */
  visible: {
    cards: boolean;
    fashion: boolean;
    cars: boolean;
    property: boolean;
    services: boolean;
  };
};

/**
 * A single 3D gateway. Pointer position drives a spring-smoothed tilt so the
 * tile reads as a physical panel, while the glare highlight follows the cursor.
 */
function PortalGate({
  portal,
  locale,
  isArabic,
  navigate,
  reduce,
  delay,
}: {
  portal: NumberedPortal;
  locale: Locale;
  isArabic: boolean;
  navigate: (route: Route) => void;
  reduce: boolean;
  delay: number;
}) {
  const Icon = portal.icon;
  const wide = portal.span === 'wide';

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sx = useSpring(px, { stiffness: 130, damping: 20 });
  const sy = useSpring(py, { stiffness: 130, damping: 20 });

  const rotateY = useTransform(sx, [0, 1], [-11, 11]);
  const rotateX = useTransform(sy, [0, 1], [9, -9]);
  const glareX = useTransform(sx, [0, 1], ['16%', '84%']);
  const glareY = useTransform(sy, [0, 1], ['10%', '90%']);
  // A template keeps the highlight bound to the live springs — reading glareX/Y
  // directly in `style` would freeze it at its initial position on first render.
  const glareBackground = useMotionTemplate`radial-gradient(40% 50% at ${glareX} ${glareY}, rgba(255,255,255,.24), transparent 72%)`;

  const handleMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (reduce || event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width);
    py.set((event.clientY - rect.top) / rect.height);
  };

  const reset = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <motion.button
      aria-label={`${portal.title[locale]} — ${portal.tagline[locale]}`}
      className="zx-portal group relative w-full text-start shadow-[0_36px_80px_-42px_rgba(6,16,11,.85)]"
      initial={reduce ? undefined : { opacity: 0, y: 30, scale: 0.97 }}
      onPointerLeave={reset}
      onPointerMove={handleMove}
      onClick={() => navigate(portal.route)}
      style={{
        rotateX: reduce ? 0 : rotateX,
        rotateY: reduce ? 0 : rotateY,
        transformPerspective: 1100,
      }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      type="button"
      viewport={{ once: true, margin: '-70px' }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
      whileTap={{ scale: 0.985 }}
    >
      {/* Background plate */}
      <img
        alt=""
        aria-hidden="true"
        className="zx-portal-img absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        src={portal.image}
      />

      {/* Legibility scrim + accent tint on hover */}
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-t from-[#050d09]/96 via-[#050d09]/44 to-[#050d09]/10"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
        style={{ background: `radial-gradient(120% 90% at 80% 0%, ${portal.accent}30, transparent 62%)` }}
      />

      {/* Pointer-tracking glare */}
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: glareBackground }}
      />

      {/* Accent ring on hover */}
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-[1.75rem] border border-white/0 transition-colors duration-500 group-hover:border-white/25"
      />

      {/* Content plate */}
      <span className="relative flex h-full w-full flex-col justify-between p-5 sm:p-6">
        <span className="flex items-start justify-between gap-3">
          <span className="flex items-center gap-2.5">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white backdrop-blur-md"
              style={{ boxShadow: `0 12px 30px -18px ${portal.accent}` }}
            >
              <Icon className="h-5 w-5" />
            </span>
            <span className="zx-eyebrow text-white/60">
              {portal.index} / {String(PORTALS.length).padStart(2, '0')}
            </span>
          </span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:bg-white/20">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </span>

        <span className="mt-6 block">
          <span className="zx-eyebrow block" style={{ color: portal.accent }}>
            {portal.meta[locale]}
          </span>
          <span className={`zx-display mt-1.5 block text-white ${wide ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
            {portal.title[locale]}
          </span>
          <span className="mt-1.5 block max-w-md text-[11px] leading-5 text-white/72">
            {portal.tagline[locale]}
          </span>
          <span
            className="mt-3.5 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-[10px] font-bold backdrop-blur-md transition-colors duration-500 group-hover:border-white/35"
            style={{ color: portal.accent }}
          >
            <Sparkles className="h-3 w-3" />
            {isArabic ? 'ادخل القسم' : 'Enter department'}
          </span>
        </span>
      </span>
    </motion.button>
  );
}

/**
 * The landing page "department board": five animated 3D gateways, one per
 * ZEXOR department. Tapping a gateway routes straight into its showroom.
 */
export function CategoryShowcase({ locale, isArabic, navigate, visible }: Props) {
  const reduce = useReducedMotion();
  const portals = visiblePortals(visible);
  const [focused, setFocused] = useState<Route>('cards');
  const active = portals.find((p) => p.route === focused) ?? portals[0];

  // A `wide` portal occupies two cells. Pick a column count that the enabled
  // portals divide into exactly, so the board never renders a ragged empty
  // cell at the end of a row (the classic "department board looks broken"
  // symptom when the admin toggles sections on and off).
  const cells = portals.reduce((sum, p) => sum + (p.span === 'wide' ? 2 : 1), 0);
  const columns = useMemo(() => {
    if (portals.length === 0) return 1;
    for (const candidate of [4, 3, 2]) {
      // Every row must be filled: the cell count has to divide evenly, and a
      // single-column board only makes sense when nothing is `wide`.
      if (cells % candidate === 0 && (candidate > 1 || cells === 1)) return candidate;
    }
    return 2;
  }, [cells, portals.length]);

  const columnClass = { 1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4' }[columns];

  if (portals.length === 0) return null;

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <span className="zx-eyebrow text-[#5e8b75]">
            {isArabic ? '٠٠ / أقسام ZEXOR' : '00 / THE HOUSE OF ZEXOR'}
          </span>
          <h2 className="zx-display mt-2 text-3xl text-[#21362b] sm:text-4xl">
            {isArabic ? 'اختر عالمك وابدأ' : 'Choose Your World'}
          </h2>
          <p className="mt-2 max-w-lg text-xs leading-6 text-[#6c7d73]">
            {isArabic
              ? 'خمس بوابات تفاعلية ثلاثية الأبعاد — المس أي بوابة للدخول مباشرة إلى معرضها الكامل.'
              : 'Five interactive 3D gateways — tap any portal to enter its full showroom.'}
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#dfe7e1] bg-white/70 px-3 py-1.5 text-[10px] font-semibold text-[#5e8b75]">
          <BadgeCheck className="h-3.5 w-3.5" />
          {isArabic ? 'معتمد في مصر والسعودية' : 'Certified in Egypt & KSA'}
        </span>
      </div>

      {/* Mobile helper: which gateway is under focus right now */}
      <div className="flex items-center justify-between gap-3 lg:hidden">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#7a8d83]">
          <Layers className="h-3.5 w-3.5 text-[#5e8b75]" />
          {isArabic ? 'اضغط على أي بوابة للدخول' : 'Tap any gateway to enter'}
        </span>
        <AnimatePresence mode="wait">
          <motion.span
            animate={{ opacity: 1, y: 0 }}
            className="rounded-full bg-[#e7f4ed] px-3 py-1 text-[10px] font-bold text-[#2c5341]"
            exit={{ opacity: 0, y: -6 }}
            initial={{ opacity: 0, y: 6 }}
            key={active?.route ?? 'none'}
          >
            {active?.index} · {active?.title[locale]}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Five gateways laid out as a balanced board. The column count is
          derived from how many departments are actually marked `wide` so the
          board always tiles with no empty cells — whether the admin has all
          five enabled or just a couple. */}
      <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 sm:auto-rows-[15rem] ${columnClass}`}>
        {portals.map((portal, i) => (
          <div
            className={`flex min-h-64 ${portal.span === 'wide' ? 'sm:col-span-2' : ''}`}
            key={portal.route}
            onFocus={() => setFocused(portal.route)}
            onPointerEnter={() => setFocused(portal.route)}
          >
            <PortalGate
              delay={i * 0.07}
              isArabic={isArabic}
              locale={locale}
              navigate={navigate}
              portal={portal}
              reduce={Boolean(reduce)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
