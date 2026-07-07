import * as THREE from 'three';
import type { CameraPath } from '../camera/path';
import type { World } from '../scene/World';

/** DEV-only tuning panel + spline visualizer. Dynamically imported from main.ts behind import.meta.env.DEV
 * so lil-gui and this module are tree-shaken out of the production bundle entirely. */
export async function setupDebug(world: World, cameraPath: CameraPath): Promise<() => void> {
  const { default: GUI } = await import('lil-gui');
  const gui = new GUI({ title: 'First Law debug' });

  const points = cameraPath.positionCurve.getPoints(200);
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ color: '#ff5544' }));
  world.scene.add(line);

  const state = {
    fogDensity: world.atmosphere.fog.density,
    sunIntensity: world.lighting.sun.intensity,
    showSpline: true,
  };

  gui
    .add(state, 'fogDensity', 0, 0.05, 0.001)
    .onChange((v: number) => world.atmosphere.setDensity(v));
  gui
    .add(state, 'sunIntensity', 0, 4, 0.05)
    .onChange((v: number) => {
      world.lighting.sun.intensity = v;
    });
  gui.add(state, 'showSpline').onChange((v: boolean) => {
    line.visible = v;
  });

  return () => {
    gui.destroy();
    world.scene.remove(line);
    lineGeometry.dispose();
  };
}
