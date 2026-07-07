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

/** One committed warm palette (fireplace, ember, gold): the journey moves from morning gold
 * through ember battlefield to firelit dusk, never into greys, blues, or purples. */
export const REGIONS: RegionTheme[] = [
  {
    id: 'approach',
    center: 0.0,
    fogColor: new THREE.Color('#b39c74'),
    fogDensity: 0.009,
    skyZenith: new THREE.Color('#6e5a40'),
    skyHorizon: new THREE.Color('#e3c493'),
    particleColor: new THREE.Color('#f2e7cd'),
    particleFallSpeed: 2.5,
    warriorDensity: 0.15,
    uiAccent: new THREE.Color('#dcb576'),
  },
  {
    id: 'about',
    center: 0.13,
    fogColor: new THREE.Color('#b08d63'),
    fogDensity: 0.008,
    skyZenith: new THREE.Color('#75543a'),
    skyHorizon: new THREE.Color('#eec08a'),
    particleColor: new THREE.Color('#f4dfb4'),
    particleFallSpeed: 2,
    warriorDensity: 0.1,
    uiAccent: new THREE.Color('#e6a95c'),
  },
  {
    id: 'north',
    center: 0.33,
    fogColor: new THREE.Color('#c2b190'),
    fogDensity: 0.011,
    skyZenith: new THREE.Color('#8a6f52'),
    skyHorizon: new THREE.Color('#e9d6b4'),
    particleColor: new THREE.Color('#fdf6e8'),
    particleFallSpeed: 4,
    warriorDensity: 1,
    uiAccent: new THREE.Color('#e8cf9e'),
  },
  {
    id: 'war',
    center: 0.53,
    fogColor: new THREE.Color('#8a5638'),
    fogDensity: 0.015,
    skyZenith: new THREE.Color('#4a2c1e'),
    skyHorizon: new THREE.Color('#c96b3a'),
    particleColor: new THREE.Color('#e8a25f'),
    particleFallSpeed: 3,
    warriorDensity: 0.85,
    uiAccent: new THREE.Color('#e07840'),
  },
  {
    id: 'archive',
    center: 0.71,
    fogColor: new THREE.Color('#9c7248'),
    fogDensity: 0.011,
    skyZenith: new THREE.Color('#5c3f28'),
    skyHorizon: new THREE.Color('#d9995c'),
    particleColor: new THREE.Color('#f0cf96'),
    particleFallSpeed: 1.5,
    warriorDensity: 0.05,
    uiAccent: new THREE.Color('#dfa04e'),
  },
  {
    id: 'education',
    center: 0.81,
    fogColor: new THREE.Color('#a89a6c'),
    fogDensity: 0.008,
    skyZenith: new THREE.Color('#5f5434'),
    skyHorizon: new THREE.Color('#d6c48c'),
    particleColor: new THREE.Color('#f0e9c8'),
    particleFallSpeed: 2,
    warriorDensity: 0.3,
    uiAccent: new THREE.Color('#cdb96a'),
  },
  {
    id: 'parley',
    center: 1.0,
    fogColor: new THREE.Color('#a97d52'),
    fogDensity: 0.007,
    skyZenith: new THREE.Color('#63402a'),
    skyHorizon: new THREE.Color('#f0b878'),
    particleColor: new THREE.Color('#f6ddb2'),
    particleFallSpeed: 1.5,
    warriorDensity: 0.1,
    uiAccent: new THREE.Color('#f0b060'),
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
