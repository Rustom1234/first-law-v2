import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const HORSE_COLOR = new THREE.Color('#2e2620');
const RIDER_COLOR = new THREE.Color('#20201d');

/** Builds one low-poly horse + seated rider, centered at the horse's feet (y=0), facing -z. */
function buildHorseGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  const legPositions: [number, number][] = [
    [0.22, 0.55],
    [0.22, -0.55],
    [-0.22, 0.55],
    [-0.22, -0.55],
  ];
  for (const [x, z] of legPositions) {
    const leg = new THREE.CylinderGeometry(0.05, 0.06, 1.0, 5);
    leg.translate(x, 0.5, z);
    parts.push(leg);
  }

  const body = new THREE.CapsuleGeometry(0.32, 0.9, 2, 6);
  body.rotateZ(Math.PI / 2);
  body.translate(0, 1.05, 0);
  parts.push(body);

  const neck = new THREE.CylinderGeometry(0.16, 0.22, 0.7, 6);
  neck.rotateX(-0.9);
  neck.translate(0, 1.35, -0.62);
  parts.push(neck);

  const head = new THREE.BoxGeometry(0.22, 0.24, 0.42);
  head.translate(0, 1.62, -1.0);
  parts.push(head);

  const tail = new THREE.ConeGeometry(0.09, 0.7, 5);
  tail.rotateX(Math.PI / 2 + 0.5);
  tail.translate(0, 0.95, 0.75);
  parts.push(tail);

  return mergeGeometries(parts, false);
}

function buildRiderGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  const torso = new THREE.CylinderGeometry(0.14, 0.17, 0.55, 6);
  torso.translate(0, 1.65, -0.05);
  parts.push(torso);

  const cloak = new THREE.ConeGeometry(0.28, 0.7, 6, 1, true);
  cloak.translate(0, 1.6, -0.1);
  parts.push(cloak);

  const head = new THREE.SphereGeometry(0.12, 7, 6);
  head.translate(0, 1.98, -0.05);
  parts.push(head);

  const spearShaft = new THREE.CylinderGeometry(0.016, 0.016, 1.8, 5);
  spearShaft.rotateX(0.15);
  spearShaft.translate(0.22, 1.9, -0.1);
  parts.push(spearShaft);

  const spearTip = new THREE.ConeGeometry(0.045, 0.24, 5);
  spearTip.rotateX(0.15);
  spearTip.translate(0.24, 2.8, 0.02);
  parts.push(spearTip);

  return mergeGeometries(parts, false);
}

/** A standalone mounted figure: horse + rider, sharing one draw call per part but not instanced
 * (only ever a couple of these exist, so a plain Group is simpler than InstancedMesh). */
export function createRider(): THREE.Group {
  const group = new THREE.Group();

  const horseMaterial = new THREE.MeshStandardMaterial({ color: HORSE_COLOR, roughness: 0.85 });
  const horse = new THREE.Mesh(buildHorseGeometry(), horseMaterial);
  horse.castShadow = true;

  const riderMaterial = new THREE.MeshStandardMaterial({ color: RIDER_COLOR, roughness: 0.88 });
  const rider = new THREE.Mesh(buildRiderGeometry(), riderMaterial);
  rider.castShadow = true;

  group.add(horse, rider);
  return group;
}
