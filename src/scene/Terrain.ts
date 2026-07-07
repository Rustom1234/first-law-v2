import * as THREE from 'three';
import { makeFbm2D } from '../lib/noise';
import { smoothstep, clamp } from '../lib/math';

export const TERRAIN_WIDTH = 340;
export const TERRAIN_START_Z = 60;
export const TERRAIN_END_Z = -595;
const TERRAIN_DEPTH = TERRAIN_START_Z - TERRAIN_END_Z;

const SNOW = new THREE.Color('#c9d3d6');
const ROCK = new THREE.Color('#4a4a4d');
const MOOR = new THREE.Color('#4f5a45');
const MUD = new THREE.Color('#372e22');
const TRACK = new THREE.Color('#241d15');

export class Terrain {
  readonly mesh: THREE.Mesh;
  private readonly macro: (x: number, y: number) => number;
  private readonly detail: (x: number, y: number) => number;

  constructor(seed: number, segments: number) {
    this.macro = makeFbm2D(seed, 5, 2.0, 0.5);
    this.detail = makeFbm2D(seed + 1, 3, 2.3, 0.45);

    const geometry = new THREE.PlaneGeometry(TERRAIN_WIDTH, TERRAIN_DEPTH, segments, segments);
    geometry.rotateX(-Math.PI / 2);
    geometry.translate(0, 0, TERRAIN_START_Z - TERRAIN_DEPTH / 2);

    const position = geometry.attributes.position;
    const colors = new Float32Array(position.count * 3);

    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i);
      const z = position.getZ(i);
      const y = this.heightAt(x, z);
      position.setY(i, y);

      const eps = 1.5;
      const slope = Math.abs(this.heightAt(x + eps, z) - y) + Math.abs(this.heightAt(x, z + eps) - y);
      const color = this.colorFor(x, y, slope / eps);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 1,
      metalness: 0,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.receiveShadow = true;
  }

  /** Pure function of world x/z: single source of ground truth, shared by geometry bake and placement queries. */
  heightAt(x: number, z: number): number {
    const valley = -9 * Math.exp(-(x * x) / (2 * 32 * 32));
    const ridgeLift = smoothstep(18, 90, Math.abs(x)) * 26;
    const macro = this.macro(x * 0.012, z * 0.012) * 22;
    const detail = this.detail(x * 0.05, z * 0.05) * 5;
    return valley + ridgeLift + macro + detail;
  }

  private colorFor(x: number, height: number, slope: number): THREE.Color {
    const steep = clamp(slope * 1.4, 0, 1);
    const snowLine = smoothstep(24, 40, height);
    const mossy = smoothstep(-6, 6, height) * (1 - smoothstep(0, 30, height));

    const base = new THREE.Color().copy(MUD).lerp(MOOR, clamp(mossy, 0, 1));
    const withRock = base.lerp(ROCK, steep);
    const withSnow = withRock.lerp(SNOW, snowLine * (1 - steep * 0.6));

    // A worn track down the valley centerline: generations of travelers on the North Road.
    const trackWidth = smoothstep(7, 1.5, Math.abs(x));
    const trackVisible = trackWidth * (1 - steep) * (1 - snowLine);
    return withSnow.lerp(TRACK, trackVisible * 0.5);
  }
}
