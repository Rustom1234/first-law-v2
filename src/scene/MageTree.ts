import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { makeRng, rngRange } from '../lib/rng';

const BARK_COLOR = new THREE.Color('#4a3520');
const FOLIAGE_COLOR = new THREE.Color('#77683a');
const ROBE_COLOR = new THREE.Color('#5a2b2e');
const STUDENT_COLORS = ['#3d3524', '#33291c', '#463a28', '#2c261c'];

/** A robed teacher, feet at y=0: taller than the students, with a peaked hat and a staff. */
function buildMageGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  const robe = new THREE.ConeGeometry(0.55, 2.0, 7);
  robe.translate(0, 1.0, 0);
  parts.push(robe);

  const head = new THREE.SphereGeometry(0.17, 7, 6);
  head.translate(0, 2.15, 0);
  parts.push(head);

  const hat = new THREE.ConeGeometry(0.26, 0.65, 6);
  hat.translate(0, 2.5, -0.03);
  parts.push(hat);

  return mergeGeometries(parts, false);
}

/** A seated pupil, a small hooded lump with a head bent toward the teacher, base at y=0. */
function buildStudentGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  const body = new THREE.ConeGeometry(0.36, 0.85, 6);
  body.translate(0, 0.42, 0);
  parts.push(body);

  const head = new THREE.SphereGeometry(0.12, 7, 6);
  head.translate(0, 0.95, 0.06);
  parts.push(head);

  return mergeGeometries(parts, false);
}

/** The Education chapter's landmark: a lone great tree, a mage teaching beneath it, and a
 * half-circle of seated students. The staff tip carries a slow-pulsing glow so the lesson
 * reads from a distance, and the canopy sways just enough to feel alive. */
export class MageTree {
  readonly group = new THREE.Group();
  private readonly canopy: THREE.Group;
  private readonly staffGlow: THREE.Mesh;
  private readonly glowMaterial: THREE.MeshBasicMaterial;

  constructor(center: { x: number; z: number }, heightAt: (x: number, z: number) => number) {
    const rng = makeRng(31);
    const baseY = heightAt(center.x, center.z);
    this.group.position.set(center.x, baseY, center.z);

    const barkMaterial = new THREE.MeshStandardMaterial({ color: BARK_COLOR, roughness: 1, flatShading: true });
    const foliageMaterial = new THREE.MeshStandardMaterial({ color: FOLIAGE_COLOR, roughness: 1, flatShading: true });

    // Broad and low rather than tall: the journey camera pitches downward, so a landmark
    // taller than ~15 units loses its crown off the top of the frame. This tree spreads.
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.8, 8, 7), barkMaterial);
    trunk.position.y = 4;
    trunk.castShadow = true;
    this.group.add(trunk);

    for (const [dx, dz, tilt] of [
      [2.4, 0.6, 1.0],
      [-2.2, -0.8, -0.95],
      [0.4, 2.4, 0.6],
    ] as [number, number, number][]) {
      const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.45, 5.5, 5), barkMaterial);
      branch.position.set(dx, 7, dz);
      branch.rotation.z = tilt;
      branch.rotation.x = dz * 0.35;
      this.group.add(branch);
    }

    // Canopy in its own group so update() can sway it without moving the trunk.
    this.canopy = new THREE.Group();
    this.canopy.position.y = 8.6;
    for (let i = 0; i < 9; i++) {
      const clump = new THREE.Mesh(new THREE.DodecahedronGeometry(rngRange(rng, 2.2, 3.4), 0), foliageMaterial);
      clump.position.set(rngRange(rng, -6.5, 6.5), rngRange(rng, -1.0, 2.0), rngRange(rng, -5, 5));
      clump.rotation.set(rng() * Math.PI, rng() * Math.PI, 0);
      clump.castShadow = true;
      this.canopy.add(clump);
    }
    this.group.add(this.canopy);

    // The mage stands just clear of the trunk, students fanned in front.
    const mageMaterial = new THREE.MeshStandardMaterial({ color: ROBE_COLOR, roughness: 0.9, flatShading: true });
    const mage = new THREE.Mesh(buildMageGeometry(), mageMaterial);
    const mageOffset = { x: 2.6, z: 3.2 };
    mage.position.set(mageOffset.x, heightAt(center.x + mageOffset.x, center.z + mageOffset.z) - baseY, mageOffset.z);
    mage.rotation.y = Math.PI * 0.15;
    mage.castShadow = true;
    this.group.add(mage);

    const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 2.6, 5), barkMaterial);
    staff.position.set(mageOffset.x + 0.55, mage.position.y + 1.3, mageOffset.z + 0.15);
    staff.rotation.z = -0.08;
    this.group.add(staff);

    this.glowMaterial = new THREE.MeshBasicMaterial({
      color: '#ffd27a',
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    });
    this.staffGlow = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 7), this.glowMaterial);
    this.staffGlow.position.set(mageOffset.x + 0.66, mage.position.y + 2.62, mageOffset.z + 0.15);
    this.group.add(this.staffGlow);

    const studentGeometry = buildStudentGeometry();
    const pupilCount = 7;
    for (let i = 0; i < pupilCount; i++) {
      const angle = Math.PI * (0.15 + (i / (pupilCount - 1)) * 0.7);
      const radius = rngRange(rng, 3.2, 4.6);
      const x = mageOffset.x + Math.sin(angle) * radius;
      const z = mageOffset.z + Math.cos(angle) * radius;
      const material = new THREE.MeshStandardMaterial({
        color: STUDENT_COLORS[i % STUDENT_COLORS.length],
        roughness: 0.9,
        flatShading: true,
      });
      const student = new THREE.Mesh(studentGeometry, material);
      student.position.set(x, heightAt(center.x + x, center.z + z) - baseY, z);
      // Seated facing the mage.
      student.rotation.y = Math.atan2(mageOffset.x - x, mageOffset.z - z);
      this.group.add(student);
    }
  }

  update(elapsed: number): void {
    this.canopy.rotation.z = Math.sin(elapsed * 0.6) * 0.02;
    this.canopy.rotation.x = Math.cos(elapsed * 0.45) * 0.02;
    const pulse = 0.7 + Math.sin(elapsed * 2.2) * 0.25;
    this.glowMaterial.opacity = pulse * 0.85;
    this.staffGlow.scale.setScalar(0.85 + pulse * 0.35);
  }
}
