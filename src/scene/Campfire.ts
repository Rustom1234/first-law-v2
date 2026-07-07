import * as THREE from 'three';

const EMBER_COUNT = 24;
const EMBER_HEIGHT = 6;

/** A visible campfire: leaned logs and a stone ring, layered translucent flame cones that
 * pulse, a flickering warm point light, and embers drifting upward. The rest stops that make
 * the journey feel like a road with warm fires along it, not an entirely dark land. */
export class Campfire {
  readonly group = new THREE.Group();
  private readonly light: THREE.PointLight;
  private readonly flames: { mesh: THREE.Mesh; phase: number }[] = [];
  private readonly embers: THREE.Points;
  private readonly emberPhases: Float32Array;
  private readonly emberRadii: Float32Array;
  private readonly emberAngles: Float32Array;

  constructor(seedPhase = 0) {
    const logMaterial = new THREE.MeshStandardMaterial({ color: '#3a2a1a', roughness: 1 });
    const logGeometry = new THREE.CylinderGeometry(0.09, 0.12, 1.6, 5);
    for (let i = 0; i < 5; i++) {
      const log = new THREE.Mesh(logGeometry, logMaterial);
      const angle = (i / 5) * Math.PI * 2 + seedPhase;
      log.position.set(Math.cos(angle) * 0.35, 0.45, Math.sin(angle) * 0.35);
      log.rotation.z = Math.cos(angle) * 1.0;
      log.rotation.x = -Math.sin(angle) * 1.0;
      log.castShadow = true;
      this.group.add(log);
    }

    const stoneMaterial = new THREE.MeshStandardMaterial({ color: '#4a4238', roughness: 1, flatShading: true });
    const stoneGeometry = new THREE.DodecahedronGeometry(0.16, 0);
    for (let i = 0; i < 8; i++) {
      const stone = new THREE.Mesh(stoneGeometry, stoneMaterial);
      const angle = (i / 8) * Math.PI * 2 + seedPhase * 2;
      stone.position.set(Math.cos(angle) * 0.95, 0.08, Math.sin(angle) * 0.95);
      stone.rotation.set(angle, angle * 2, 0);
      this.group.add(stone);
    }

    // Two nested cones, additive so they read as glow, not solid geometry.
    const flameSpecs = [
      { color: '#ff7a2a', radius: 0.42, height: 1.5, opacity: 0.55 },
      { color: '#ffc25a', radius: 0.24, height: 1.0, opacity: 0.75 },
    ];
    flameSpecs.forEach((spec, i) => {
      const material = new THREE.MeshBasicMaterial({
        color: spec.color,
        transparent: true,
        opacity: spec.opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: false,
      });
      const flame = new THREE.Mesh(new THREE.ConeGeometry(spec.radius, spec.height, 7), material);
      flame.position.y = 0.3 + spec.height / 2;
      this.flames.push({ mesh: flame, phase: seedPhase + i * 1.7 });
      this.group.add(flame);
    });

    this.light = new THREE.PointLight('#ff9a3c', 4, 30, 2);
    this.light.position.y = 1.1;
    this.group.add(this.light);

    this.emberPhases = new Float32Array(EMBER_COUNT);
    this.emberRadii = new Float32Array(EMBER_COUNT);
    this.emberAngles = new Float32Array(EMBER_COUNT);
    const positions = new Float32Array(EMBER_COUNT * 3);
    for (let i = 0; i < EMBER_COUNT; i++) {
      this.emberPhases[i] = ((i * 0.618 + seedPhase) % 1) * EMBER_HEIGHT;
      this.emberRadii[i] = 0.1 + (i % 5) * 0.08;
      this.emberAngles[i] = (i / EMBER_COUNT) * Math.PI * 2;
    }
    const emberGeometry = new THREE.BufferGeometry();
    emberGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const emberMaterial = new THREE.PointsMaterial({
      color: '#ffb056',
      size: 0.09,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.embers = new THREE.Points(emberGeometry, emberMaterial);
    this.group.add(this.embers);
  }

  placeAt(x: number, z: number, heightAt: (x: number, z: number) => number): void {
    this.group.position.set(x, heightAt(x, z), z);
  }

  update(elapsed: number): void {
    for (const { mesh, phase } of this.flames) {
      const pulse = 1 + Math.sin(elapsed * 8 + phase) * 0.12 + Math.sin(elapsed * 21 + phase * 3) * 0.06;
      mesh.scale.set(pulse, 1 / pulse + Math.sin(elapsed * 5 + phase) * 0.08, pulse);
      mesh.rotation.y = elapsed * 0.8 + phase;
    }

    this.light.intensity = 3.6 + Math.sin(elapsed * 9) * 0.5 + Math.sin(elapsed * 23.7) * 0.3;

    const positions = this.embers.geometry.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < EMBER_COUNT; i++) {
      const y = (this.emberPhases[i] + elapsed * (0.7 + (i % 3) * 0.25)) % EMBER_HEIGHT;
      const fade = 1 - y / EMBER_HEIGHT;
      const angle = this.emberAngles[i] + elapsed * 0.6;
      const radius = this.emberRadii[i] + y * 0.12;
      positions.setXYZ(i, Math.cos(angle) * radius * fade + Math.sin(y * 2 + i) * 0.1, 0.5 + y, Math.sin(angle) * radius * fade);
    }
    positions.needsUpdate = true;
  }
}
