import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { makeRng, rngRange } from '../lib/rng';

const WARRIOR_COLOR = new THREE.Color('#20201d');
const HERO_COLOR = new THREE.Color('#2b2a24');
const dummy = new THREE.Object3D();

/** Builds one low-poly "hooded Northman with spear" silhouette, a few hundred tris, centered at its feet (y=0). */
function buildWarriorGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  const legs = new THREE.CylinderGeometry(0.09, 0.12, 0.9, 6);
  legs.translate(0, 0.45, 0);
  parts.push(legs);

  const torso = new THREE.CylinderGeometry(0.16, 0.2, 0.75, 6);
  torso.translate(0, 1.05, 0);
  parts.push(torso);

  const cloak = new THREE.ConeGeometry(0.34, 0.95, 6, 1, true);
  cloak.translate(0, 1.05, -0.06);
  parts.push(cloak);

  const head = new THREE.SphereGeometry(0.14, 7, 6);
  head.translate(0, 1.58, 0.02);
  parts.push(head);

  const hood = new THREE.ConeGeometry(0.17, 0.3, 6);
  hood.translate(0, 1.68, -0.02);
  parts.push(hood);

  const spearShaft = new THREE.CylinderGeometry(0.018, 0.018, 2.1, 5);
  spearShaft.rotateX(0.12);
  spearShaft.translate(0.26, 1.1, 0.05);
  parts.push(spearShaft);

  const spearTip = new THREE.ConeGeometry(0.05, 0.28, 5);
  spearTip.rotateX(0.12);
  spearTip.translate(0.29, 2.2, 0.15);
  parts.push(spearTip);

  return mergeGeometries(parts, false);
}

export interface WarriorCluster {
  center: { x: number; z: number };
  radius: number;
  count: number;
}

export class Warriors {
  readonly instancedMesh: THREE.InstancedMesh;
  readonly hero: THREE.Mesh;
  private readonly geometry: THREE.BufferGeometry;
  private readonly maxCount: number;

  constructor(maxCount: number) {
    this.maxCount = maxCount;
    this.geometry = buildWarriorGeometry();

    const material = new THREE.MeshStandardMaterial({
      color: WARRIOR_COLOR,
      roughness: 0.9,
      metalness: 0.05,
    });

    this.instancedMesh = new THREE.InstancedMesh(this.geometry, material, maxCount);
    this.instancedMesh.castShadow = true;
    this.instancedMesh.count = 0;

    const heroMaterial = new THREE.MeshStandardMaterial({
      color: HERO_COLOR,
      roughness: 0.85,
      metalness: 0.08,
    });
    this.hero = new THREE.Mesh(this.geometry, heroMaterial);
    this.hero.castShadow = true;
    this.hero.scale.setScalar(1.35);
  }

  /** Seeded scatter of instances onto the terrain across a set of ridgeline clusters, up to `densityScale` of maxCount. */
  populate(
    clusters: WarriorCluster[],
    heightAt: (x: number, z: number) => number,
    seed: number,
    densityScale: number,
  ): void {
    const rng = makeRng(seed);
    let instanceIndex = 0;

    for (const cluster of clusters) {
      const scaledCount = Math.round(cluster.count * densityScale);
      for (let i = 0; i < scaledCount && instanceIndex < this.maxCount; i++) {
        const angle = rng() * Math.PI * 2;
        const dist = Math.sqrt(rng()) * cluster.radius;
        const x = cluster.center.x + Math.cos(angle) * dist;
        const z = cluster.center.z + Math.sin(angle) * dist;
        const y = heightAt(x, z);

        dummy.position.set(x, y, z);
        dummy.rotation.set(0, rngRange(rng, 0, Math.PI * 2), 0);
        const scale = rngRange(rng, 0.85, 1.15);
        dummy.scale.setScalar(scale);
        dummy.updateMatrix();

        this.instancedMesh.setMatrixAt(instanceIndex, dummy.matrix);
        instanceIndex++;
      }
    }

    this.instancedMesh.count = instanceIndex;
    this.instancedMesh.instanceMatrix.needsUpdate = true;
  }

  placeHero(x: number, z: number, heightAt: (x: number, z: number) => number, facingY: number): void {
    this.hero.position.set(x, heightAt(x, z), z);
    this.hero.rotation.y = facingY;
  }

  /** A standalone (non-instanced) figure sharing the warrior geometry, for named companions. */
  createFigure(color: THREE.Color, scale = 1): THREE.Mesh {
    const material = new THREE.MeshStandardMaterial({ color, roughness: 0.88, metalness: 0.06 });
    const mesh = new THREE.Mesh(this.geometry, material);
    mesh.castShadow = true;
    mesh.scale.setScalar(scale);
    return mesh;
  }
}
