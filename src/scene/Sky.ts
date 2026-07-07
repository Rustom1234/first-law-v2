import * as THREE from 'three';
import { skyVertexShader, skyFragmentShader } from '../shaders/sky';

export interface SkyColors {
  zenith: THREE.Color;
  horizon: THREE.Color;
}

export class Sky {
  readonly mesh: THREE.Mesh;
  private readonly material: THREE.ShaderMaterial;

  constructor(radius = 500) {
    const geometry = new THREE.SphereGeometry(radius, 32, 16);
    this.material = new THREE.ShaderMaterial({
      vertexShader: skyVertexShader,
      fragmentShader: skyFragmentShader,
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        uZenithColor: { value: new THREE.Color('#5a6570') },
        uHorizonColor: { value: new THREE.Color('#b9c2c4') },
        uOffset: { value: 15 },
        uExponent: { value: 0.65 },
      },
    });
    this.mesh = new THREE.Mesh(geometry, this.material);
  }

  setColors(colors: SkyColors): void {
    (this.material.uniforms.uZenithColor.value as THREE.Color).copy(colors.zenith);
    (this.material.uniforms.uHorizonColor.value as THREE.Color).copy(colors.horizon);
  }
}
