import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const STONE_COLOR = new THREE.Color('#6b6a63');

/** A weathered standing stone, carved at the top: one per education/trial entry, centered at its foot (y=0). */
function buildWaystoneGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  // DodecahedronGeometry (below) is non-indexed, unlike CylinderGeometry, so every
  // part is converted to non-indexed before merging to keep attributes compatible.
  const base = new THREE.CylinderGeometry(0.32, 0.4, 0.3, 6).toNonIndexed();
  base.translate(0, 0.15, 0);
  parts.push(base);

  const shaft = new THREE.CylinderGeometry(0.22, 0.3, 1.6, 6).toNonIndexed();
  shaft.translate(0, 1.1, 0);
  parts.push(shaft);

  const cap = new THREE.DodecahedronGeometry(0.26, 0);
  cap.translate(0, 2.0, 0);
  parts.push(cap);

  return mergeGeometries(parts, false);
}

export function createWaystone(): THREE.Mesh {
  const material = new THREE.MeshStandardMaterial({ color: STONE_COLOR, roughness: 1, flatShading: true });
  const mesh = new THREE.Mesh(buildWaystoneGeometry(), material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}
