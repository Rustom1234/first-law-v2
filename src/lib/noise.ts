import { makeRng } from './rng';

/** Seeded 2D value noise (bilinear-interpolated lattice), no external deps. Returns roughly -1..1. */
export function makeNoise2D(seed: number) {
  const rng = makeRng(seed);
  const size = 256;
  const mask = size - 1;
  const perm = new Uint8Array(size * 2);
  const values = new Float32Array(size);

  for (let i = 0; i < size; i++) values[i] = rng() * 2 - 1;
  for (let i = 0; i < size; i++) perm[i] = i;
  for (let i = size - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  for (let i = 0; i < size; i++) perm[size + i] = perm[i];

  function fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  function latticeValue(xi: number, yi: number): number {
    const idx = perm[(perm[xi & mask] + yi) & mask];
    return values[idx];
  }

  return function noise2D(x: number, y: number): number {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;

    const v00 = latticeValue(xi, yi);
    const v10 = latticeValue(xi + 1, yi);
    const v01 = latticeValue(xi, yi + 1);
    const v11 = latticeValue(xi + 1, yi + 1);

    const u = fade(xf);
    const v = fade(yf);

    const x1 = v00 + (v10 - v00) * u;
    const x2 = v01 + (v11 - v01) * u;
    return x1 + (x2 - x1) * v;
  };
}

/** Fractal Brownian motion: layers of the base noise at increasing frequency, decreasing amplitude. */
export function makeFbm2D(seed: number, octaves = 5, lacunarity = 2.0, gain = 0.5) {
  const noise2D = makeNoise2D(seed);
  return function fbm2D(x: number, y: number): number {
    let amplitude = 0.5;
    let frequency = 1;
    let sum = 0;
    let norm = 0;
    for (let o = 0; o < octaves; o++) {
      sum += amplitude * noise2D(x * frequency, y * frequency);
      norm += amplitude;
      amplitude *= gain;
      frequency *= lacunarity;
    }
    return sum / norm;
  };
}
