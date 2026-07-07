export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(x: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, x));
}

/** Frame-rate independent exponential damping toward `target`. `lambda` is roughly "1/seconds to settle". */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  return lerp(current, target, 1 - Math.exp(-lambda * dt));
}

export function remap(x: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  const t = clamp((x - inMin) / (inMax - inMin), 0, 1);
  return lerp(outMin, outMax, t);
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/** Smoothly ramps in over [start, start+fadeIn], holds, ramps out over [end-fadeOut, end]. Returns 0..1. */
export function bandFade(t: number, start: number, end: number, fadeIn: number, fadeOut: number): number {
  const inValue = smoothstep(start, start + fadeIn, t);
  const outValue = 1 - smoothstep(end - fadeOut, end, t);
  return Math.min(inValue, outValue);
}
