import * as THREE from 'three';
import { lerp, clamp } from '../lib/math';

export interface RegionTheme {
  id: string;
  /** Scroll progress (0..1) where this region is fully in effect. Blending happens between consecutive centers. */
  center: number;
  fogColor: THREE.Color;
  fogDensity: number;
  skyZenith: THREE.Color;
  skyHorizon: THREE.Color;
  particleColor: THREE.Color;
  particleFallSpeed: number;
  warriorDensity: number;
  /** Bleeds into the overlay UI (card borders/headings) so each chapter reads as a distinct place, not just a haze. */
  uiAccent: THREE.Color;
}

export const REGIONS: RegionTheme[] = [
  {
    id: 'approach',
    center: 0.0,
    fogColor: new THREE.Color('#8f9a9c'),
    fogDensity: 0.011,
    skyZenith: new THREE.Color('#5a6570'),
    skyHorizon: new THREE.Color('#b9c2c4'),
    particleColor: new THREE.Color('#e8eef0'),
    particleFallSpeed: 2.5,
    warriorDensity: 0.15,
    uiAccent: new THREE.Color('#9fb0b8'),
  },
  {
    id: 'about',
    center: 0.13,
    fogColor: new THREE.Color('#8a7a63'),
    fogDensity: 0.01,
    skyZenith: new THREE.Color('#5c4d3d'),
    skyHorizon: new THREE.Color('#c7ab7f'),
    particleColor: new THREE.Color('#e8d9b8'),
    particleFallSpeed: 2,
    warriorDensity: 0.1,
    uiAccent: new THREE.Color('#d9b98c'),
  },
  {
    id: 'north',
    center: 0.33,
    fogColor: new THREE.Color('#7c8894'),
    fogDensity: 0.013,
    skyZenith: new THREE.Color('#4a5560'),
    skyHorizon: new THREE.Color('#9fabb2'),
    particleColor: new THREE.Color('#f2f6f7'),
    particleFallSpeed: 4,
    warriorDensity: 1,
    uiAccent: new THREE.Color('#a9c9d6'),
  },
  {
    id: 'war',
    center: 0.53,
    fogColor: new THREE.Color('#6b5a52'),
    fogDensity: 0.016,
    skyZenith: new THREE.Color('#453a35'),
    skyHorizon: new THREE.Color('#8a6f5c'),
    particleColor: new THREE.Color('#8f8577'),
    particleFallSpeed: 3,
    warriorDensity: 0.85,
    uiAccent: new THREE.Color('#c9633f'),
  },
  {
    id: 'education',
    center: 0.71,
    fogColor: new THREE.Color('#5f7d74'),
    fogDensity: 0.008,
    skyZenith: new THREE.Color('#41564e'),
    skyHorizon: new THREE.Color('#a9c4b8'),
    particleColor: new THREE.Color('#e5f0ea'),
    particleFallSpeed: 2,
    warriorDensity: 0.3,
    uiAccent: new THREE.Color('#6fae94'),
  },
  {
    id: 'archive',
    center: 0.81,
    fogColor: new THREE.Color('#4f4763'),
    fogDensity: 0.012,
    skyZenith: new THREE.Color('#332c47'),
    skyHorizon: new THREE.Color('#8579a3'),
    particleColor: new THREE.Color('#c9c0e0'),
    particleFallSpeed: 1.5,
    warriorDensity: 0.05,
    uiAccent: new THREE.Color('#9b8ec4'),
  },
  {
    id: 'parley',
    center: 1.0,
    fogColor: new THREE.Color('#9c8368'),
    fogDensity: 0.007,
    skyZenith: new THREE.Color('#7a5f47'),
    skyHorizon: new THREE.Color('#d9b98c'),
    particleColor: new THREE.Color('#f0e4cf'),
    particleFallSpeed: 1.5,
    warriorDensity: 0.1,
    uiAccent: new THREE.Color('#e0b97a'),
  },
];

export interface RegionBlend {
  fogColor: THREE.Color;
  fogDensity: number;
  skyZenith: THREE.Color;
  skyHorizon: THREE.Color;
  particleColor: THREE.Color;
  particleFallSpeed: number;
  warriorDensity: number;
  uiAccent: THREE.Color;
}

/** Find the pair of adjacent regions bracketing `progress` and linearly blend every themed property. */
export function resolveRegionBlend(progress: number): RegionBlend {
  const p = clamp(progress, 0, 1);
  let a = REGIONS[0];
  let b = REGIONS[REGIONS.length - 1];

  for (let i = 0; i < REGIONS.length - 1; i++) {
    if (p >= REGIONS[i].center && p <= REGIONS[i + 1].center) {
      a = REGIONS[i];
      b = REGIONS[i + 1];
      break;
    }
  }

  const span = b.center - a.center;
  const t = span > 0 ? (p - a.center) / span : 0;

  return {
    fogColor: a.fogColor.clone().lerp(b.fogColor, t),
    fogDensity: lerp(a.fogDensity, b.fogDensity, t),
    skyZenith: a.skyZenith.clone().lerp(b.skyZenith, t),
    skyHorizon: a.skyHorizon.clone().lerp(b.skyHorizon, t),
    particleColor: a.particleColor.clone().lerp(b.particleColor, t),
    particleFallSpeed: lerp(a.particleFallSpeed, b.particleFallSpeed, t),
    warriorDensity: lerp(a.warriorDensity, b.warriorDensity, t),
    uiAccent: a.uiAccent.clone().lerp(b.uiAccent, t),
  };
}
