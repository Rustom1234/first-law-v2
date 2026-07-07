import * as THREE from 'three';

const SUN_DIRECTION = new THREE.Vector3(0.55, 0.22, 0.4).normalize();
const SHADOW_SPAN = 90;

export class Lighting {
  readonly sun: THREE.DirectionalLight;
  readonly hemi: THREE.HemisphereLight;
  readonly rim: THREE.DirectionalLight;
  readonly group: THREE.Group;

  constructor(shadowsEnabled: boolean, shadowMapSize: number) {
    this.group = new THREE.Group();

    this.sun = new THREE.DirectionalLight('#ffd39a', 1.7);
    this.sun.castShadow = shadowsEnabled;
    if (shadowsEnabled) {
      this.sun.shadow.mapSize.set(shadowMapSize, shadowMapSize);
      this.sun.shadow.camera.left = -SHADOW_SPAN;
      this.sun.shadow.camera.right = SHADOW_SPAN;
      this.sun.shadow.camera.top = SHADOW_SPAN;
      this.sun.shadow.camera.bottom = -SHADOW_SPAN;
      this.sun.shadow.camera.near = 1;
      this.sun.shadow.camera.far = 220;
      this.sun.shadow.bias = -0.0015;
    }
    this.group.add(this.sun, this.sun.target);

    this.hemi = new THREE.HemisphereLight('#c9a878', '#33241a', 0.5);
    this.group.add(this.hemi);

    this.rim = new THREE.DirectionalLight('#f2b880', 0.6);
    this.rim.position.set(-SUN_DIRECTION.x, 6, -SUN_DIRECTION.z).normalize().multiplyScalar(40);
    this.group.add(this.rim, this.rim.target);
  }

  /** Keep the sun's tight shadow frustum centered on the camera so it stays cheap and sharp along the journey. */
  followCamera(cameraPosition: THREE.Vector3): void {
    this.sun.position.copy(cameraPosition).addScaledVector(SUN_DIRECTION, 120);
    this.sun.target.position.copy(cameraPosition);
    this.rim.position.set(cameraPosition.x - SUN_DIRECTION.x * 40, cameraPosition.y + 20, cameraPosition.z - SUN_DIRECTION.z * 40);
    this.rim.target.position.copy(cameraPosition);
  }
}
