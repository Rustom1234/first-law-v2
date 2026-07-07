import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { makeRng, rngRange } from '../lib/rng';
import { bannerVertexShader, bannerFragmentShader } from '../shaders/banner';

const dummy = new THREE.Object3D();
const tmpColor = new THREE.Color();

function buildDeadTreeGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const trunk = new THREE.CylinderGeometry(0.05, 0.09, 2.4, 5);
  trunk.translate(0, 1.2, 0);
  parts.push(trunk);

  for (let i = 0; i < 3; i++) {
    const branch = new THREE.CylinderGeometry(0.015, 0.04, 1.0, 4);
    branch.translate(0, 0.5, 0);
    branch.rotateZ(0.9 + i * 0.3);
    branch.rotateY((i * Math.PI * 2) / 3);
    branch.translate(0, 1.8 + i * 0.15, 0);
    parts.push(branch);
  }

  return mergeGeometries(parts, false);
}

function buildBannerGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const pole = new THREE.CylinderGeometry(0.025, 0.025, 2.6, 5);
  pole.translate(0, 1.3, 0);
  parts.push(pole);

  const cloth = new THREE.PlaneGeometry(0.6, 1.1, 3, 4);
  cloth.translate(0.32, 1.9, 0);
  parts.push(cloth);

  return mergeGeometries(parts, false);
}

/** Two crossed planes: the cheapest silhouette that reads as a grass tuft from any angle. */
function buildGrassGeometry(): THREE.BufferGeometry {
  const bladeA = new THREE.PlaneGeometry(0.4, 0.5, 1, 3);
  bladeA.translate(0, 0.25, 0);
  const bladeB = bladeA.clone();
  bladeB.rotateY(Math.PI / 2);
  return mergeGeometries([bladeA, bladeB], false);
}

export interface PropCluster {
  center: { x: number; z: number };
  radius: number;
  rocks: number;
  trees: number;
  banners: number;
  grass: number;
}

export class Props {
  readonly group = new THREE.Group();
  private readonly rockMesh: THREE.InstancedMesh;
  private readonly treeMesh: THREE.InstancedMesh;
  private readonly bannerMesh: THREE.InstancedMesh;
  private readonly grassMesh: THREE.InstancedMesh;
  private readonly bannerMaterial: THREE.ShaderMaterial;
  private readonly grassMaterial: THREE.ShaderMaterial;

  constructor(maxRocks: number, maxTrees: number, maxBanners: number, maxGrass: number) {
    const rockGeometry = new THREE.DodecahedronGeometry(0.5, 0);
    const rockMaterial = new THREE.MeshStandardMaterial({ color: '#4a4238', roughness: 1, flatShading: true });
    this.rockMesh = new THREE.InstancedMesh(rockGeometry, rockMaterial, maxRocks);
    this.rockMesh.receiveShadow = true;
    this.rockMesh.castShadow = true;
    this.rockMesh.count = 0;

    const treeGeometry = buildDeadTreeGeometry();
    const treeMaterial = new THREE.MeshStandardMaterial({ color: '#241f1a', roughness: 1 });
    this.treeMesh = new THREE.InstancedMesh(treeGeometry, treeMaterial, maxTrees);
    this.treeMesh.castShadow = true;
    this.treeMesh.count = 0;

    const bannerGeometry = buildBannerGeometry();
    bannerGeometry.setAttribute(
      'aColor',
      new THREE.InstancedBufferAttribute(new Float32Array(maxBanners * 3), 3),
    );
    this.bannerMaterial = new THREE.ShaderMaterial({
      vertexShader: bannerVertexShader,
      fragmentShader: bannerFragmentShader,
      uniforms: { uTime: { value: 0 } },
    });
    this.bannerMesh = new THREE.InstancedMesh(bannerGeometry, this.bannerMaterial, maxBanners);
    this.bannerMesh.count = 0;

    const grassGeometry = buildGrassGeometry();
    grassGeometry.setAttribute(
      'aColor',
      new THREE.InstancedBufferAttribute(new Float32Array(maxGrass * 3), 3),
    );
    this.grassMaterial = new THREE.ShaderMaterial({
      vertexShader: bannerVertexShader,
      fragmentShader: bannerFragmentShader,
      uniforms: { uTime: { value: 0 } },
      side: THREE.DoubleSide,
    });
    this.grassMesh = new THREE.InstancedMesh(grassGeometry, this.grassMaterial, maxGrass);
    this.grassMesh.count = 0;

    this.group.add(this.rockMesh, this.treeMesh, this.bannerMesh, this.grassMesh);
  }

  populate(clusters: PropCluster[], heightAt: (x: number, z: number) => number, seed: number): void {
    const rng = makeRng(seed);
    let rockIndex = 0;
    let treeIndex = 0;
    let bannerIndex = 0;
    let grassIndex = 0;
    const bannerColors: THREE.Color[] = [];
    const grassColors: THREE.Color[] = [];

    const scatter = (
      n: number,
      cluster: PropCluster,
      place: (x: number, y: number, z: number, rotY: number, scale: number) => void,
    ) => {
      for (let i = 0; i < n; i++) {
        const angle = rng() * Math.PI * 2;
        const dist = Math.sqrt(rng()) * cluster.radius;
        const x = cluster.center.x + Math.cos(angle) * dist;
        const z = cluster.center.z + Math.sin(angle) * dist;
        place(x, heightAt(x, z), z, rngRange(rng, 0, Math.PI * 2), rngRange(rng, 0.7, 1.3));
      }
    };

    for (const cluster of clusters) {
      scatter(cluster.rocks, cluster, (x, y, z, rotY, scale) => {
        if (rockIndex >= this.rockMesh.instanceMatrix.count) return;
        dummy.position.set(x, y + 0.15 * scale, z);
        dummy.rotation.set(0, rotY, 0);
        dummy.scale.setScalar(scale);
        dummy.updateMatrix();
        this.rockMesh.setMatrixAt(rockIndex++, dummy.matrix);
      });

      scatter(cluster.trees, cluster, (x, y, z, rotY, scale) => {
        if (treeIndex >= this.treeMesh.instanceMatrix.count) return;
        dummy.position.set(x, y, z);
        dummy.rotation.set(0, rotY, 0);
        dummy.scale.setScalar(scale);
        dummy.updateMatrix();
        this.treeMesh.setMatrixAt(treeIndex++, dummy.matrix);
      });

      scatter(cluster.banners, cluster, (x, y, z, rotY, scale) => {
        if (bannerIndex >= this.bannerMesh.instanceMatrix.count) return;
        dummy.position.set(x, y, z);
        dummy.rotation.set(0, rotY, 0);
        dummy.scale.setScalar(scale);
        dummy.updateMatrix();
        this.bannerMesh.setMatrixAt(bannerIndex, dummy.matrix);
        tmpColor.setHSL(0.02, 0.45, rngRange(rng, 0.16, 0.26));
        bannerColors[bannerIndex] = tmpColor.clone();
        bannerIndex++;
      });

      scatter(cluster.grass, cluster, (x, y, z, rotY, scale) => {
        if (grassIndex >= this.grassMesh.instanceMatrix.count) return;
        dummy.position.set(x, y, z);
        dummy.rotation.set(0, rotY, 0);
        dummy.scale.setScalar(scale * 0.8);
        dummy.updateMatrix();
        this.grassMesh.setMatrixAt(grassIndex, dummy.matrix);
        tmpColor.setHSL(rngRange(rng, 0.22, 0.3), 0.28, rngRange(rng, 0.2, 0.32));
        grassColors[grassIndex] = tmpColor.clone();
        grassIndex++;
      });
    }

    const colorAttr = this.bannerMesh.geometry.getAttribute('aColor') as THREE.InstancedBufferAttribute;
    bannerColors.forEach((color, i) => colorAttr.setXYZ(i, color.r, color.g, color.b));
    colorAttr.needsUpdate = true;

    const grassColorAttr = this.grassMesh.geometry.getAttribute('aColor') as THREE.InstancedBufferAttribute;
    grassColors.forEach((color, i) => grassColorAttr.setXYZ(i, color.r, color.g, color.b));
    grassColorAttr.needsUpdate = true;

    this.rockMesh.count = rockIndex;
    this.treeMesh.count = treeIndex;
    this.bannerMesh.count = bannerIndex;
    this.grassMesh.count = grassIndex;
    this.rockMesh.instanceMatrix.needsUpdate = true;
    this.treeMesh.instanceMatrix.needsUpdate = true;
    this.bannerMesh.instanceMatrix.needsUpdate = true;
    this.grassMesh.instanceMatrix.needsUpdate = true;
  }

  update(elapsed: number): void {
    this.bannerMaterial.uniforms.uTime.value = elapsed;
    this.grassMaterial.uniforms.uTime.value = elapsed;
  }
}
