export type QualityTier = 'high' | 'low' | 'static';

function hasWebGL2(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!canvas.getContext('webgl2');
  } catch {
    return false;
  }
}

function isCoarsePointer(): boolean {
  return window.matchMedia?.('(pointer: coarse)').matches ?? false;
}

function isLowMemory(): boolean {
  const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  return typeof deviceMemory === 'number' && deviceMemory <= 4;
}

function isLowConcurrency(): boolean {
  return (navigator.hardwareConcurrency ?? 8) <= 4;
}

export function detectTier(): QualityTier {
  if (!hasWebGL2()) return 'static';
  const mobileSignal = isCoarsePointer() || isLowMemory() || isLowConcurrency();
  return mobileSignal ? 'low' : 'high';
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}
