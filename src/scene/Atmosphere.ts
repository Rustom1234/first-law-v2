import * as THREE from 'three';

export class Atmosphere {
  readonly fog: THREE.FogExp2;

  constructor(initialColor: THREE.Color, initialDensity: number) {
    this.fog = new THREE.FogExp2(initialColor.getHex(), initialDensity);
  }

  setColor(color: THREE.Color): void {
    this.fog.color.copy(color);
  }

  setDensity(density: number): void {
    this.fog.density = density;
  }
}
