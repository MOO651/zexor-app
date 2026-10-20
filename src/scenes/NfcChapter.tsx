import {
  motion,
  useSpring,
  useScroll,
  useTransform,
} from 'framer-motion';
import { ArrowUpLeft, ArrowUpRight, Fingerprint, Radio, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { art } from '../data/imagery';
import { useMobileViewport } from '../hooks/useMobileViewport';
import { useSiteAssets, useSiteContent } from '../lib/siteMediaContext';
import type { Locale, Market, Product } from '../types';
import { publicAssetUrl } from '../utils';

type Props = {
  locale: Locale;
  market: Market;
  product?: Product;
  copyTitle?: string;
  copySubtitle?: string;
  onDesign: (product: Product) => void;
  onExplore: () => void;
  renderPrice: (price: number, className: string) => ReactNode;
};

const FEATURES = [
  {
    number: '01',
    icon: Radio,
    ar: 'رابط فوري',
    en: 'Instant link',
  },
  {
    number: '02',
    icon: Fingerprint,
    ar: 'هويتك في لمسة',
    en: 'Your identity, one tap',
  },
  {
    number: '03',
    icon: Sparkles,
    ar: 'تصميم مخصص',
    en: 'Made your way',
  },
] as const;

function FeatureCard({
  feature,
  index,
  isArabic,
  progress,
  staticMotion,
}: {
  feature: (typeof FEATURES)[number];
  index: number;
  isArabic: boolean;
  progress: ReturnType<typeof useScroll>['scrollYProgress'];
  staticMotion: boolean;
}) {
  const start = 0.6 + index * 0.1;
  const featureOpacity = useTransform(progress, [start, Math.min(start + 0.1, 0.98)], [0, 1]);
  const featureY = useTransform(progress, [start, Math.min(start + 0.1, 0.98)], [24, 0]);
  const Icon = feature.icon;

  return (
    <motion.article
      className={`nfc-one-touch-feature nfc-one-touch-feature--${feature.number}`}
      style={{
        opacity: staticMotion ? 1 : featureOpacity,
        y: staticMotion ? 0 : featureY,
      }}
    >
      <span className="nfc-one-touch-feature-number">{feature.number}</span>
      <Icon aria-hidden="true" />
      <span>{isArabic ? feature.ar : feature.en}</span>
    </motion.article>
  );
}

export function NfcChapter({ locale, market, product, copyTitle, copySubtitle, onDesign, onExplore, renderPrice }: Props) {
  const isArabic = locale === 'ar';
  const isMobileViewport = useMobileViewport();
  const sceneRef = useRef<HTMLElement>(null);
  const touchDragRef = useRef<{
    startX: number;
    lastX: number;
    lastTime: number;
    rotation: number;
    velocity: number;
  } | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const pointerTiltX = useSpring(0, { stiffness: 170, damping: 24 });
  const pointerTiltY = useSpring(0, { stiffness: 170, damping: 24 });
  const touchRotation = useSpring(0, { stiffness: 150, damping: 22 });
  const { assets } = useSiteAssets();
  const { content, getText } = useSiteContent();
  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ['start start', 'end end'],
  });
  const cardRotateY = useTransform(scrollYProgress, [0, 0.35, 0.9, 1], [-18, 160, 160, 0]);
  const cardRotateX = useTransform(scrollYProgress, [0, 0.35, 0.9, 1], [8, 0, 0, 8]);
  const cardScale = useTransform(scrollYProgress, [0, 0.35, 0.9, 1], [1, 1.12, 1.12, 1]);
  const titleY = useTransform(scrollYProgress, [0, 0.35], [0, -40]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0.4]);
  const phoneY = useTransform(scrollYProgress, [0.35, 0.6], ['90vh', '0vh']);
  const phoneOpacity = useTransform(scrollYProgress, [0.35, 0.43, 0.58, 0.64], [0, 1, 1, 0]);
  const profileY = useTransform(scrollYProgress, [0.49, 0.58, 0.68], ['2rem', '0rem', '-1rem']);
  const profileOpacity = useTransform(scrollYProgress, [0.5, 0.57, 0.68, 0.74], [0, 1, 1, 0]);
  const rippleOpacity = useTransform(scrollYProgress, [0.5, 0.52, 0.62], [0, 0.5, 0]);
  const connectorsOpacity = useTransform(scrollYProgress, [0.58, 0.68, 0.9], [0, 0.55, 0.55]);
  const ctaOpacity = useTransform(scrollYProgress, [0.9, 1], [0, 1]);
  const cardAsset = assets['nfc.card'];
  const sceneImage = cardAsset?.source === 'published' && cardAsset.type === 'image'
    ? publicAssetUrl(cardAsset.url) ?? art.cardsElite
    : art.cardsElite;
  const publishedTitle = content['nfc.scene.title']?.source === 'published'
    ? getText('nfc.scene.title', locale)
    : null;
  const publishedSubtitle = content['nfc.scene.subtitle']?.source === 'published'
    ? getText('nfc.scene.subtitle', locale)
    : null;
  const title = publishedTitle || copyTitle?.trim() || getText('nfc.scene.title', locale) || (isArabic ? 'لمسة واحدة' : 'One tap');
  const accent = getText('nfc.scene.accent', locale) ?? (isArabic ? 'عالمك كله' : 'your whole world');
  const description = publishedSubtitle || copySubtitle?.trim() || getText('nfc.scene.subtitle', locale) || (isArabic
      ? 'بطاقة واحدة تجمع هويتك الرقمية، روابطك، وحضورك في كل مكان.'
      : 'One card brings your digital identity, links and presence together.');
  const profileName = getText('nfc.profile.name', locale) ?? (isArabic ? 'أحمد م.' : 'Ahmed M.');
  const price = product
    ? renderPrice(product.price[market], 'nfc-one-touch-price')
    : null;
  const Arrow = isArabic ? ArrowUpLeft : ArrowUpRight;

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setPrefersReducedMotion(preference.matches);
    updatePreference();
    preference.addEventListener('change', updatePreference);
    return () => preference.removeEventListener('change', updatePreference);
  }, []);

  const staticMotion = prefersReducedMotion || isMobileViewport;
  const handleCardPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'touch' || staticMotion) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    touchDragRef.current = {
      startX: event.clientX,
      lastX: event.clientX,
      lastTime: performance.now(),
      rotation: touchRotation.get(),
      velocity: 0,
    };
  };
  const handleCardPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (staticMotion) return;
    if (event.pointerType === 'touch') {
      const drag = touchDragRef.current;
      if (!drag) return;
      const now = performance.now();
      const elapsed = Math.max(now - drag.lastTime, 1);
      drag.velocity = ((event.clientX - drag.lastX) / elapsed) * 1000;
      drag.lastX = event.clientX;
      drag.lastTime = now;
      touchRotation.set(drag.rotation + (event.clientX - drag.startX) * 0.7);
      return;
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    const y = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
    pointerTiltX.set(-y * 12);
    pointerTiltY.set(x * 12);
  };
  const handleCardPointerUp = () => {
    const drag = touchDragRef.current;
    if (!drag) return;
    touchRotation.set(touchRotation.get() + drag.velocity * 0.12);
    touchDragRef.current = null;
  };

  return (
    <section
      aria-label={isArabic ? 'الفصل الأول: لمسة واحدة' : 'Chapter one: One touch'}
      className="nfc-one-touch-scene"
      id="chapter-cards"
      ref={sceneRef}
    >
      <div className="nfc-one-touch-stage">
        <div
          aria-hidden="true"
          className="nfc-one-touch-backdrop"
          style={{ backgroundImage: `url("${sceneImage}")` }}
        />
        <div aria-hidden="true" className="nfc-one-touch-glow nfc-one-touch-glow--mint" />
        <div aria-hidden="true" className="nfc-one-touch-glow nfc-one-touch-glow--warm" />

        <motion.svg
          aria-hidden="true"
          className="nfc-one-touch-connectors"
          preserveAspectRatio="none"
          style={{ opacity: staticMotion ? 0.45 : connectorsOpacity }}
          viewBox="0 0 1000 1000"
        >
          <path d="M550 683 C495 692 370 710 220 720" />
          <path d="M680 683 C625 692 560 710 495 720" />
          <path d="M810 683 C800 695 785 710 770 720" />
        </motion.svg>

        <motion.header
          className="nfc-one-touch-copy"
          style={{
            opacity: staticMotion ? 1 : titleOpacity,
            y: staticMotion ? 0 : titleY,
          }}
        >
          <p className="nfc-one-touch-eyebrow">
            <span>01</span>
            {isArabic ? 'هوية رقمية · بطاقة NFC' : 'DIGITAL IDENTITY · NFC'}
          </p>
          <h2>
            <span>{title}</span>
            <span className="nfc-one-touch-accent">{accent}</span>
          </h2>
          <p className="nfc-one-touch-description">{description}</p>
        </motion.header>

        <motion.div
          aria-hidden="true"
          className="nfc-one-touch-ripples"
          style={{ opacity: staticMotion ? 0 : rippleOpacity }}
        >
          {[0, 1, 2].map((ring) => (
            <span
              className="nfc-one-touch-ripple"
              key={ring}
              style={{ animationDelay: `${ring * 150}ms` }}
            />
          ))}
        </motion.div>

        <motion.div
          aria-hidden="true"
          className="nfc-one-touch-card-wrap"
          style={{
            rotateX: staticMotion ? 0 : cardRotateX,
            rotateY: staticMotion ? 0 : cardRotateY,
            scale: staticMotion ? 1 : cardScale,
          }}
          onPointerDown={handleCardPointerDown}
          onPointerMove={handleCardPointerMove}
          onPointerUp={handleCardPointerUp}
          onPointerCancel={handleCardPointerUp}
          onPointerLeave={() => {
            pointerTiltX.set(0);
            pointerTiltY.set(0);
          }}
        >
          <motion.div
            className="nfc-one-touch-pointer-tilt"
            style={{
              rotateX: staticMotion ? 0 : pointerTiltX,
              rotateY: staticMotion ? 0 : pointerTiltY,
            }}
          >
            <motion.div
              className="nfc-one-touch-card"
              style={{ rotateY: staticMotion ? 0 : touchRotation }}
            >
              <div className="nfc-one-touch-card-face nfc-one-touch-card-face--front">
                <span className="nfc-one-touch-card-label">ZEXOR / LINK</span>
                <span aria-hidden="true" className="nfc-one-touch-chip">
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
                <span aria-hidden="true" className="nfc-one-touch-waves">
                  <i />
                  <i />
                  <i />
                </span>
                <strong className="nfc-one-touch-card-brand">{product?.brand || 'ZEXOR'}</strong>
                <span className="nfc-one-touch-card-name">
                  {product?.name[locale] ?? (isArabic ? 'بطاقة هوية متصلة' : 'Connected identity')}
                </span>
                <span className="nfc-one-touch-card-rim" />
              </div>
              <div className="nfc-one-touch-card-face nfc-one-touch-card-face--back">
                <span aria-hidden="true" className="nfc-one-touch-card-mark">Z</span>
                <span>CONNECTED IDENTITY</span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          aria-hidden="true"
          className="nfc-one-touch-phone"
          style={{
            opacity: staticMotion ? 0 : phoneOpacity,
            y: staticMotion ? '90vh' : phoneY,
          }}
        >
          <div className="nfc-one-touch-phone-screen">
            <span className="nfc-one-touch-phone-camera" />
            <span className="nfc-one-touch-phone-mark">Z</span>
            <span className="nfc-one-touch-phone-line" />
            <span className="nfc-one-touch-phone-line nfc-one-touch-phone-line--short" />
          </div>
        </motion.div>

        <motion.div
          className="nfc-one-touch-profile"
          style={{
            opacity: staticMotion ? 0 : profileOpacity,
            y: staticMotion ? '2rem' : profileY,
          }}
        >
          <span className="nfc-one-touch-profile-mark">Z</span>
          <span>
            <strong>ZEXOR</strong>
            <small>{profileName}</small>
          </span>
          <span className="nfc-one-touch-profile-status">{isArabic ? 'متصل' : 'ONLINE'}</span>
        </motion.div>

        <div className="nfc-one-touch-features">
          {FEATURES.map((feature, index) => (
            <FeatureCard
              feature={feature}
              index={index}
              isArabic={isArabic}
              key={feature.number}
              progress={scrollYProgress}
              staticMotion={staticMotion}
            />
          ))}
        </div>

        <motion.footer
          className="nfc-one-touch-footer"
          style={{ opacity: staticMotion ? 1 : ctaOpacity }}
        >
          <div>
            <span className="nfc-one-touch-footer-eyebrow">
              {isArabic ? 'اتصال واحد يفتح لك كل شيء' : 'ONE TAP OPENS YOUR WORLD'}
            </span>
            <strong>{product?.name[locale] ?? (isArabic ? 'بطاقة زكسور' : 'ZEXOR card')}</strong>
            {price}
          </div>
          <button
            className="nfc-one-touch-cta"
            onClick={() => product ? onDesign(product) : onExplore()}
            type="button"
          >
            {isArabic ? 'صمّم بطاقتك' : 'Design your card'}
            <Arrow aria-hidden="true" />
          </button>
        </motion.footer>
      </div>
    </section>
  );
}
