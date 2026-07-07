import * as THREE from 'three';
import { makeRng, rngRange } from '../lib/rng';
import { particlesVertexShader, particlesFragmentShader } from '../shaders/particles';

const BOX_SIZE = 70;

export class Particles {
  readonly points: THREE.Points;
  private readonly material: THREE.ShaderMaterial;

  constructor(count: number, seed = 7) {
    const rng = makeRng(seed);
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = rngRange(rng, -BOX_SIZE / 2, BOX_SIZE / 2);
      positions[i * 3 + 1] = rngRange(rng, -BOX_SIZE / 2, BOX_SIZE / 2);
      positions[i * 3 + 2] = rngRange(rng, -BOX_SIZE / 2, BOX_SIZE / 2);
      seeds[i] = rng();
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), BOX_SIZE);

    this.material = new THREE.ShaderMaterial({
      vertexShader: particlesVertexShader,
      fragmentShader: particlesFragmentShader,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uBoxSize: { value: BOX_SIZE },
        uFallSpeed: { value: 4 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uParticleSize: { value: 1.4 },
        uColor: { value: new THREE.Color('#dfe6e8') },
      },
    });

    this.points = new THREE.Points(geometry, this.material);
    this.points.frustumCulled = false;
  }

  update(elapsed: number, cameraPosition: THREE.Vector3): void {
    this.material.uniforms.uTime.value = elapsed;
    this.points.position.copy(cameraPosition);
  }

  setTint(color: THREE.Color, fallSpeed: number): void {
    (this.material.uniforms.uColor.value as THREE.Color).copy(color);
    this.material.uniforms.uFallSpeed.value = fallSpeed;
  }
}
