import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { makeRng, rngRange } from '../lib/rng';

const CANVAS_COLOR = new THREE.Color('#8a6b4a');
const COMMAND_CANVAS = new THREE.Color('#7a3a26');
const WOOD_COLOR = new THREE.Color('#4a3520');
const WORKER_COLORS = ['#33291c', '#3d2f22', '#2a251d', '#453424'];

/** A hooded laborer, spearless cousin of the warrior silhouette, feet at y=0. */
function buildWorkerGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  const legs = new THREE.CylinderGeometry(0.09, 0.12, 0.9, 6);
  legs.translate(0, 0.45, 0);
  parts.push(legs);

  const torso = new THREE.CylinderGeometry(0.17, 0.22, 0.75, 6);
  torso.translate(0, 1.05, 0);
  parts.push(torso);

  const head = new THREE.SphereGeometry(0.14, 7, 6);
  head.translate(0, 1.56, 0.02);
  parts.push(head);

  const hood = new THREE.ConeGeometry(0.17, 0.28, 6);
  hood.translate(0, 1.66, -0.02);
  parts.push(hood);

  return mergeGeometries(parts, false);
}

/** The Work Experience chapter's landmark: a big labor camp spread beside the road. One tall
 * command tent ringed by work tents, stacked crates and barrels, and a crowd of workers, some
 * bent over their tasks and hammering away, so the camp reads as working rather than posed. */
export class WorkCamp {
  readonly group = new THREE.Group();
  private readonly laborers: { pivot: THREE.Group; phase: number; speed: number }[] = [];

  constructor(center: { x: number; z: number }, heightAt: (x: number, z: number) => number) {
    const rng = makeRng(77);
    const canvasMaterial = new THREE.MeshStandardMaterial({ color: CANVAS_COLOR, roughness: 1, flatShading: true });
    const commandMaterial = new THREE.MeshStandardMaterial({ color: COMMAND_CANVAS, roughness: 1, flatShading: true });
    const woodMaterial = new THREE.MeshStandardMaterial({ color: WOOD_COLOR, roughness: 0.95, flatShading: true });

    // Command tent: the tall centerpiece, visible from well down the road.
    const commandTent = new THREE.Mesh(new THREE.ConeGeometry(4.4, 8, 6), commandMaterial);
    commandTent.position.set(center.x, heightAt(center.x, center.z) + 4, center.z);
    commandTent.castShadow = true;
    this.group.add(commandTent);

    const polePos = { x: center.x + 4.6, z: center.z + 1 };
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 6.4, 5), woodMaterial);
    pole.position.set(polePos.x, heightAt(polePos.x, polePos.z) + 3.2, polePos.z);
    this.group.add(pole);
    const bannerMaterial = new THREE.MeshStandardMaterial({
      color: COMMAND_CANVAS,
      roughness: 1,
      side: THREE.DoubleSide,
    });
    const banner = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.2), bannerMaterial);
    banner.position.set(polePos.x + 0.8, heightAt(polePos.x, polePos.z) + 5.2, polePos.z);
    this.group.add(banner);

    // Work tents ringed around the command tent.
    const tentGeometry = new THREE.ConeGeometry(2.3, 3.6, 5);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + rngRange(rng, -0.25, 0.25);
      const radius = rngRange(rng, 9, 15);
      const x = center.x + Math.cos(angle) * radius;
      const z = center.z + Math.sin(angle) * radius * 0.8;
      const tent = new THREE.Mesh(tentGeometry, canvasMaterial);
      tent.position.set(x, heightAt(x, z) + 1.8, z);
      tent.rotation.y = rngRange(rng, 0, Math.PI);
      tent.scale.setScalar(rngRange(rng, 0.85, 1.25));
      tent.castShadow = true;
      this.group.add(tent);
    }

    // Supplies: crate stacks and barrels scattered between tents.
    const crateGeometry = new THREE.BoxGeometry(0.9, 0.9, 0.9);
    const barrelGeometry = new THREE.CylinderGeometry(0.42, 0.48, 1.0, 7);
    for (let i = 0; i < 14; i++) {
      const angle = rngRange(rng, 0, Math.PI * 2);
      const radius = rngRange(rng, 4, 13);
      const x = center.x + Math.cos(angle) * radius;
      const z = center.z + Math.sin(angle) * radius * 0.8;
      const y = heightAt(x, z);
      if (i % 3 === 0) {
        const barrel = new THREE.Mesh(barrelGeometry, woodMaterial);
        barrel.position.set(x, y + 0.5, z);
        this.group.add(barrel);
      } else {
        const stack = Math.floor(rngRange(rng, 1, 3));
        for (let s = 0; s < stack; s++) {
          const crate = new THREE.Mesh(crateGeometry, woodMaterial);
          crate.position.set(x, y + 0.45 + s * 0.9, z);
          crate.rotation.y = rngRange(rng, 0, Math.PI / 2);
          crate.castShadow = true;
          this.group.add(crate);
        }
      }
    }

    // The crowd at work. Each figure sits in a pivot group so update() can bend the whole
    // body from the feet (a hammering bow) without touching the merged geometry.
    const workerGeometry = buildWorkerGeometry();
    for (let i = 0; i < 16; i++) {
      const angle = rngRange(rng, 0, Math.PI * 2);
      const radius = rngRange(rng, 3, 14);
      const x = center.x + Math.cos(angle) * radius;
      const z = center.z + Math.sin(angle) * radius * 0.8;
      const material = new THREE.MeshStandardMaterial({
        color: WORKER_COLORS[i % WORKER_COLORS.length],
        roughness: 0.9,
        flatShading: true,
      });
      const figure = new THREE.Mesh(workerGeometry, material);
      figure.castShadow = true;
      const pivot = new THREE.Group();
      pivot.add(figure);
      pivot.position.set(x, heightAt(x, z), z);
      pivot.rotation.y = rngRange(rng, 0, Math.PI * 2);
      this.group.add(pivot);
      // Two in three workers are actively hammering/hauling; the rest stand watch.
      if (i % 3 !== 2) {
        this.laborers.push({ pivot, phase: rngRange(rng, 0, Math.PI * 2), speed: rngRange(rng, 2.6, 4.2) });
      }
    }
  }

  update(elapsed: number): void {
    for (const { pivot, phase, speed } of this.laborers) {
      pivot.rotation.x = (Math.sin(elapsed * speed + phase) + 1) * 0.14;
    }
  }
}
