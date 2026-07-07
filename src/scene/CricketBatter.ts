import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const BATTER_COLOR = new THREE.Color('#1c1b18');
const SWING_CYCLES = 6;
const SWING_AMPLITUDE = 1.1;

function buildBodyGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  const legs = new THREE.CylinderGeometry(0.1, 0.13, 0.9, 6);
  legs.translate(0, 0.45, 0);
  parts.push(legs);

  const torso = new THREE.CylinderGeometry(0.17, 0.2, 0.7, 6);
  torso.translate(0, 1.05, 0);
  parts.push(torso);

  const head = new THREE.SphereGeometry(0.15, 7, 6);
  head.translate(0, 1.55, 0);
  parts.push(head);

  const cap = new THREE.ConeGeometry(0.17, 0.14, 7);
  cap.translate(0, 1.66, 0);
  parts.push(cap);

  return mergeGeometries(parts, false);
}

/** Arm + bat, built so the shoulder joint sits at local origin: rotate this group to swing. */
function buildArmAndBatGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  const arm = new THREE.CylinderGeometry(0.055, 0.055, 0.55, 5);
  arm.translate(0, -0.275, 0);
  parts.push(arm);

  const bat = new THREE.CylinderGeometry(0.04, 0.09, 0.65, 6);
  bat.translate(0, -0.85, 0);
  parts.push(bat);

  return mergeGeometries(parts, false);
}

/** A dark silhouette batter whose swing is driven directly by scroll progress, not elapsed
 * time: it winds up and follows through as you scroll, cycling a few times across the journey. */
export class CricketBatter {
  readonly group = new THREE.Group();
  private readonly swingPivot: THREE.Group;

  constructor() {
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: BATTER_COLOR, roughness: 0.9 });
    const body = new THREE.Mesh(buildBodyGeometry(), bodyMaterial);
    body.castShadow = true;
    this.group.add(body);

    this.swingPivot = new THREE.Group();
    this.swingPivot.position.set(0.2, 1.25, 0.05);
    const armAndBat = new THREE.Mesh(buildArmAndBatGeometry(), bodyMaterial);
    armAndBat.castShadow = true;
    this.swingPivot.add(armAndBat);
    this.group.add(this.swingPivot);
  }

  placeAt(x: number, z: number, heightAt: (x: number, z: number) => number, facingY: number): void {
    this.group.position.set(x, heightAt(x, z), z);
    this.group.rotation.y = facingY;
  }

  /** progress is the site-wide 0..1 scroll value: the swing plays out continuously as you scroll. */
  update(progress: number): void {
    const swing = Math.sin(progress * Math.PI * 2 * SWING_CYCLES) * SWING_AMPLITUDE;
    this.swingPivot.rotation.z = swing;
  }
}
