import * as THREE from 'three';

export interface ControlPoint {
  x: number;
  z: number;
  lift: number;
}

/** Roughly aligned with the region centers in scene/regions.ts so key shots land where the story does.
 * Exported so World.ts can place warrior clusters, props, and labels coherently with what the camera sees. */
export const JOURNEY_WAYPOINTS: ControlPoint[] = [
  { x: 0, z: 48, lift: 14 }, // 0: The Approach
  { x: -11, z: -30, lift: 11 }, // 1: The Chronicler (About)
  { x: 9, z: -90, lift: 10 },
  { x: -13, z: -150, lift: 17 }, // 3: The North (Experience)
  { x: 11, z: -210, lift: 9 },
  { x: -9, z: -270, lift: 13 }, // 5: The War (Projects)
  { x: 8, z: -325, lift: 12 },
  { x: 7, z: -380, lift: 19 }, // 7: The Circle of the World (Education)
  { x: -6, z: -440, lift: 15 }, // 8: The Archive (Paper)
  { x: 5, z: -495, lift: 17 },
  { x: 0, z: -555, lift: 24 }, // 10: The Parley, summit
];
const CONTROL_POINTS = JOURNEY_WAYPOINTS;

const LOOK_AHEAD_Z = 28;
const LOOK_HEIGHT_OFFSET = 4;
const MIN_CLEARANCE = 3.5;

export interface CameraPath {
  positionCurve: THREE.CatmullRomCurve3;
  targetCurve: THREE.CatmullRomCurve3;
  minClearance: number;
}

export function buildCameraPath(heightAt: (x: number, z: number) => number): CameraPath {
  const positionPoints = CONTROL_POINTS.map(
    (p) => new THREE.Vector3(p.x, heightAt(p.x, p.z) + p.lift, p.z),
  );
  const targetPoints = CONTROL_POINTS.map((p) => {
    const tz = p.z - LOOK_AHEAD_Z;
    return new THREE.Vector3(p.x, heightAt(p.x, tz) + LOOK_HEIGHT_OFFSET, tz);
  });

  return {
    positionCurve: new THREE.CatmullRomCurve3(positionPoints, false, 'catmullrom', 0.5),
    targetCurve: new THREE.CatmullRomCurve3(targetPoints, false, 'catmullrom', 0.5),
    minClearance: MIN_CLEARANCE,
  };
}
