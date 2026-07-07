import * as THREE from 'three';
import type { CameraPath } from './path';

const ORIENTATION_LAMBDA = 9;
const lookMatrix = new THREE.Matrix4();
const desiredQuaternion = new THREE.Quaternion();
const upVector = new THREE.Vector3(0, 1, 0);

export class CameraRig {
  readonly camera: THREE.PerspectiveCamera;
  private readonly path: CameraPath;
  private readonly heightAt: (x: number, z: number) => number;

  constructor(path: CameraPath, heightAt: (x: number, z: number) => number, aspect: number) {
    this.path = path;
    this.heightAt = heightAt;
    this.camera = new THREE.PerspectiveCamera(52, aspect, 0.1, 600);
  }

  /** progress is the damped 0..1 scroll value from ScrollController. */
  update(progress: number, dt: number): void {
    const position = this.path.positionCurve.getPointAt(progress);
    const target = this.path.targetCurve.getPointAt(progress);

    const minY = this.heightAt(position.x, position.z) + this.path.minClearance;
    if (position.y < minY) position.y = minY;

    this.camera.position.copy(position);

    lookMatrix.lookAt(position, target, upVector);
    desiredQuaternion.setFromRotationMatrix(lookMatrix);
    const slerpT = 1 - Math.exp(-ORIENTATION_LAMBDA * dt);
    this.camera.quaternion.slerp(desiredQuaternion, slerpT);
  }

  setAspect(aspect: number): void {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }
}
