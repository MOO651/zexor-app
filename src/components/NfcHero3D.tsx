import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import type { MotionValue } from 'framer-motion';
import * as THREE from 'three';

type Props = {
  scrollProgress: MotionValue<number>;
  lowPower: boolean;
};

function readToken(name: string, fallback: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

function NfcCardModel({ scrollProgress }: Pick<Props, 'scrollProgress'>) {
  const card = useRef<THREE.Group>(null);
  const drag = useRef({ active: false, x: 0, y: 0, rotateX: 0, rotateY: 0 });
  const base = readToken('--zx-emerald', '#28654d');
  const bright = readToken('--zx-emerald-bright', '#4f8967');
  const mint = readToken('--zx-mint', '#a5d8b8');
  const text = readToken('--zx-on-primary', '#fffefa');
  const muted = readToken('--zx-text-secondary', '#d5e7db');
  const colors = useMemo(() => ({
    base, bright, mint, text, muted,
  }), [base, bright, mint, text, muted]);
  const brandTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 260;
    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = colors.text;
      context.font = '800 142px Manrope, Arial, sans-serif';
      context.letterSpacing = '20px';
      context.fillText('ZEXOR', 8, 148);
      context.globalAlpha = .72;
      context.fillStyle = colors.mint;
      context.font = '600 30px Manrope, Arial, sans-serif';
      context.letterSpacing = '5px';
      context.fillText('DESIGN · TECHNOLOGY · CULTURE', 14, 218);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, [colors]);
  useEffect(() => () => brandTexture.dispose(), [brandTexture]);
  useEffect(() => {
    const finishDrag = () => { drag.current.active = false; };
    window.addEventListener('pointerup', finishDrag);
    window.addEventListener('pointercancel', finishDrag);
    return () => {
      window.removeEventListener('pointerup', finishDrag);
      window.removeEventListener('pointercancel', finishDrag);
    };
  }, []);

  useFrame(({ clock }) => {
    const group = card.current;
    if (!group) return;
    const progress = scrollProgress.get();
    const idle = Math.sin(clock.elapsedTime * 0.44) * 0.045;
    const scrollTilt = progress * 0.16;
    const dragX = drag.current.rotateX;
    const dragY = drag.current.rotateY;
    group.rotation.x = THREE.MathUtils.damp(group.rotation.x, -0.14 + scrollTilt + dragX + idle, 5, 1 / 60);
    group.rotation.y = THREE.MathUtils.damp(group.rotation.y, -0.2 + progress * 0.28 + dragY, 5, 1 / 60);
    group.rotation.z = THREE.MathUtils.damp(group.rotation.z, progress * 0.05, 5, 1 / 60);
    group.position.y = Math.sin(clock.elapsedTime * 0.7) * 0.08 - progress * 0.16;
  });

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    drag.current.active = true;
    drag.current.x = event.nativeEvent.clientX;
    drag.current.y = event.nativeEvent.clientY;
    const captureTarget = event.target as EventTarget & { setPointerCapture?: (pointerId: number) => void };
    captureTarget.setPointerCapture?.(event.pointerId);
  };
  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!drag.current.active) return;
    event.stopPropagation();
    const deltaX = event.nativeEvent.clientX - drag.current.x;
    const deltaY = event.nativeEvent.clientY - drag.current.y;
    drag.current.x = event.nativeEvent.clientX;
    drag.current.y = event.nativeEvent.clientY;
    drag.current.rotateY = THREE.MathUtils.clamp(drag.current.rotateY + deltaX * 0.008, -0.48, 0.48);
    drag.current.rotateX = THREE.MathUtils.clamp(drag.current.rotateX + deltaY * 0.006, -0.32, 0.32);
  };

  return (
    <group
      ref={card}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={() => { drag.current.active = false; }}
      onPointerCancel={() => { drag.current.active = false; }}
      onLostPointerCapture={() => { drag.current.active = false; }}
    >
      <RoundedBox args={[3.5, 2.2, 0.05]} radius={0.18} smoothness={6}>
        <meshPhysicalMaterial color={colors.bright} emissive={colors.base} emissiveIntensity={0.18} metalness={0.28} roughness={0.3} clearcoat={0.76} clearcoatRoughness={0.22} envMapIntensity={1.1} />
      </RoundedBox>
      <RoundedBox args={[0.48, 0.58, 0.03]} radius={0.06} smoothness={4} position={[-1.12, 0.34, 0.07]}>
        <meshPhysicalMaterial color={colors.mint} metalness={0.78} roughness={0.27} clearcoat={0.65} />
      </RoundedBox>
      {[-1.24, -1.0].map((x) => <mesh key={`chip-v-${x}`} position={[x, 0.34, 0.09]}><boxGeometry args={[0.018, 0.52, 0.012]} /><meshStandardMaterial color={colors.base} metalness={0.75} roughness={0.28} /></mesh>)}
      {[-0.01, 0.34, 0.69].map((y) => <mesh key={`chip-h-${y}`} position={[-1.12, y, 0.09]}><boxGeometry args={[0.44, 0.016, 0.012]} /><meshStandardMaterial color={colors.base} metalness={0.75} roughness={0.28} /></mesh>)}
      <mesh position={[1.22, 0.62, 0.065]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.14, 0.018, 8, 32, Math.PI * 1.55]} />
        <meshStandardMaterial color={colors.mint} emissive={colors.bright} emissiveIntensity={0.25} metalness={0.58} roughness={0.26} />
      </mesh>
      <mesh position={[1.22, 0.62, 0.065]} rotation={[0, 0, -Math.PI / 2]}>
        <torusGeometry args={[0.27, 0.018, 8, 32, Math.PI * 1.55]} />
        <meshStandardMaterial color={colors.mint} emissive={colors.bright} emissiveIntensity={0.2} metalness={0.58} roughness={0.26} />
      </mesh>
      <mesh position={[-0.38, -0.39, 0.064]}>
        <planeGeometry args={[1.75, 0.51]} />
        <meshBasicMaterial map={brandTexture} transparent toneMapped={false} />
      </mesh>
      <RoundedBox args={[1.12, 0.035, 0.018]} radius={0.014} smoothness={3} position={[-0.47, -0.19, 0.067]}>
        <meshStandardMaterial color={colors.mint} metalness={0.35} roughness={0.4} />
      </RoundedBox>
      <RoundedBox args={[0.78, 0.025, 0.018]} radius={0.01} smoothness={3} position={[-0.64, -0.34, 0.067]}>
        <meshStandardMaterial color={colors.muted} metalness={0.28} roughness={0.45} />
      </RoundedBox>
      <RoundedBox args={[0.54, 0.025, 0.018]} radius={0.01} smoothness={3} position={[-0.76, -0.47, 0.067]}>
        <meshStandardMaterial color={colors.muted} metalness={0.28} roughness={0.45} />
      </RoundedBox>
    </group>
  );
}

export function NfcHero3D({ scrollProgress, lowPower }: Props) {
  const bright = readToken('--zx-emerald-bright', '#4f8967');
  const mint = readToken('--zx-mint', '#a5d8b8');
  const colors = useMemo(() => ({
    bright, mint,
  }), [bright, mint]);
  return (
    <Canvas
      aria-label="Three-dimensional ZEXOR NFC card"
      camera={{ position: [0, 0, 6.4], fov: 34 }}
      dpr={lowPower ? 0.85 : [1, 1.5]}
      gl={{ alpha: true, antialias: !lowPower, powerPreference: lowPower ? 'low-power' : 'high-performance' }}
      shadows={!lowPower}
      style={{ touchAction: 'pan-y' }}
    >
      <ambientLight intensity={lowPower ? 1.5 : 1.1} />
      <directionalLight color={colors.mint} intensity={lowPower ? 2.1 : 3.2} position={[-3, 4, 5]} castShadow={!lowPower} />
      <pointLight color={colors.bright} intensity={lowPower ? 16 : 28} position={[4, 1, 3]} distance={8} />
      <pointLight color={colors.mint} intensity={lowPower ? 5 : 9} position={[-3, -2, 2]} distance={7} />
      <NfcCardModel scrollProgress={scrollProgress} />
    </Canvas>
  );
}
