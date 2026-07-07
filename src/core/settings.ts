import type { QualityTier } from './capabilities';

export interface QualitySettings {
  pixelRatioCap: number;
  antialias: boolean;
  shadowMapSize: number;
  shadowsEnabled: boolean;
  particleCount: number;
  warriorsPerCluster: number;
  postProcessing: boolean;
  terrainSegments: number;
}

const HIGH: QualitySettings = {
  pixelRatioCap: 2,
  antialias: true,
  shadowMapSize: 2048,
  shadowsEnabled: true,
  particleCount: 4000,
  warriorsPerCluster: 40,
  postProcessing: true,
  terrainSegments: 256,
};

const LOW: QualitySettings = {
  pixelRatioCap: 1.5,
  antialias: false,
  shadowMapSize: 512,
  shadowsEnabled: false,
  particleCount: 800,
  warriorsPerCluster: 14,
  postProcessing: false,
  terrainSegments: 96,
};

export function forTier(tier: QualityTier): QualitySettings {
  return tier === 'high' ? HIGH : LOW;
}
