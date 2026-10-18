import { createContext, useContext, useState } from 'react';
import type { MotionValue } from 'framer-motion';

export const SceneProgressContext = createContext<MotionValue<number> | null>(null);

export function useSceneProgress() {
  const progress = useContext(SceneProgressContext);
  if (!progress) throw new Error('Scene animation components must be inside SceneWrapper.');
  return progress;
}

export function useLowPowerDevice() {
  const [lowPower] = useState(() => {
    if (typeof navigator === 'undefined') return false;
    const device = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    return Boolean(device.connection?.saveData) || (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4) || (device.deviceMemory !== undefined && device.deviceMemory <= 4);
  });
  return lowPower;
}
