import { Canvas } from '@react-three/fiber';
import { Html, OrbitControls, RoundedBox, useGLTF } from '@react-three/drei';
import { Box3, Mesh, MeshStandardMaterial, Vector3 } from 'three';
import { Component, Suspense, useEffect, useMemo, useState, type ReactNode } from 'react';

const FINISH_TOKENS: Record<string, string> = {
  pearl: '--zx-footer-text',
  mint: '--zx-mint',
  clay: '--zx-highlight',
  sage: '--zx-sage',
  forest: '--zx-footer-bg',
};

function readFinishColor(finish: string) {
  const token = FINISH_TOKENS[finish] ?? FINISH_TOKENS.sage!;
  return getComputedStyle(document.documentElement).getPropertyValue(token).trim();
}

function ProceduralCard({ finishColor, children }: { finishColor: string; children: ReactNode }) {
  return (
    <>
      <RoundedBox args={[3.36, 2.12, 0.055]} radius={0.12} smoothness={8}>
        <meshPhysicalMaterial
          clearcoat={0.72}
          clearcoatRoughness={0.25}
          color={finishColor}
          metalness={0.72}
          roughness={0.27}
          envMapIntensity={0.7}
        />
      </RoundedBox>
      <Html center distanceFactor={4.5} pointerEvents="none" position={[0, 0, 0.04]} transform>
              <div className="w-full">{children}</div>
      </Html>
    </>
  );
}

class CardModelBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    console.error('Could not load the published NFC model; using the procedural card preview.', error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function PublishedCardModel({ url, finishColor, children }: {
  url: string;
  finishColor: string;
  children: ReactNode;
}) {
  const { scene } = useGLTF(url);
  const model = useMemo(() => {
    const clone = scene.clone(true);
    const bounds = new Box3().setFromObject(clone);
    const size = bounds.getSize(new Vector3());
    const scale = 3.2 / Math.max(size.x, size.y, size.z, 0.001);
    const center = bounds.getCenter(new Vector3());

    clone.scale.setScalar(scale);
    clone.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    clone.traverse((node) => {
      if (!(node instanceof Mesh)) return;
      node.castShadow = true;
      node.receiveShadow = true;
      node.material = Array.isArray(node.material)
        ? node.material.map((material) => material.clone())
        : node.material.clone();
    });
    return clone;
  }, [scene]);

  useEffect(() => {
    model.traverse((node) => {
      if (!(node instanceof Mesh)) return;
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      for (const material of materials) {
        if (material instanceof MeshStandardMaterial) {
          material.color.set(finishColor);
        }
      }
    });
  }, [finishColor, model]);

  return (
    <>
      <primitive object={model} />
      <Html center distanceFactor={4.5} pointerEvents="none" position={[0, 0, 0.08]} transform>
              <div className="w-full">{children}</div>
      </Html>
    </>
  );
}

export function NfcLivePreview({
  finish,
  reducedMotion,
  modelUrl,
  children,
}: {
  finish: string;
  reducedMotion: boolean;
  modelUrl?: string | null;
  children: ReactNode;
}) {
  const [finishColor, setFinishColor] = useState(() => readFinishColor(finish));

  useEffect(() => {
    const updateColor = () => setFinishColor(readFinishColor(finish));
    const observer = new MutationObserver(updateColor);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, [finish]);

  return (
    <div className="relative aspect-[1.58/1] w-full">
      <Canvas
        aria-label="Interactive 3D NFC card preview"
        camera={{ fov: 34, position: [0, 0, 5.4] }}
        dpr={[1, 1.4]}
        fallback={children}
        frameloop={reducedMotion ? 'demand' : 'always'}
        gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
      >
        <ambientLight intensity={0.65} />
        <directionalLight color={readFinishColor('pearl')} intensity={2.1} position={[-3, 4, 5]} />
        <pointLight color={readFinishColor('mint')} intensity={5} position={[0, 0, 2]} distance={5} />
        {modelUrl
          ? <Suspense fallback={<ProceduralCard finishColor={finishColor}>{children}</ProceduralCard>}>
            <CardModelBoundary
              fallback={<ProceduralCard finishColor={finishColor}>{children}</ProceduralCard>}
              key={modelUrl}
            >
              <PublishedCardModel finishColor={finishColor} url={modelUrl}>{children}</PublishedCardModel>
            </CardModelBoundary>
          </Suspense>
          : <ProceduralCard finishColor={finishColor}>{children}</ProceduralCard>}
        <OrbitControls
          enableDamping={!reducedMotion}
          enablePan={false}
          enableZoom={false}
          maxPolarAngle={Math.PI * 0.66}
          minPolarAngle={Math.PI * 0.34}
          rotateSpeed={0.55}
        />
      </Canvas>
    </div>
  );
}
