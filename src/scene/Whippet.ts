import * as THREE from 'three';
import { JOURNEY_WAYPOINTS } from '../camera/path';
import { clamp } from '../lib/math';

const COAT_COLOR = new THREE.Color('#efe9dc');
const RUN_LEAD = 0.028;

/** A white whippet running the whole road with you: it keeps a little ahead of the camera
 * along a path offset from the road's centerline, deep-chested and thin-waisted, legs in a
 * rotary gallop. Slightly larger than life so it stays readable from the camera's height. */
export class Whippet {
  readonly group = new THREE.Group();
  private readonly legs: THREE.Mesh[] = [];
  private readonly tail: THREE.Mesh;
  private readonly body: THREE.Group;
  private readonly curve: THREE.CatmullRomCurve3;
  private readonly heightAt: (x: number, z: number) => number;

  constructor(heightAt: (x: number, z: number) => number) {
    this.heightAt = heightAt;

    // Runs beside the road, not on it, so it never sits dead-center under the camera.
    const points = JOURNEY_WAYPOINTS.map(
      (wp, i) => new THREE.Vector3(wp.x + (i % 2 === 0 ? 4.5 : 6.5), 0, wp.z),
    );
    this.curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5);

    const coat = new THREE.MeshStandardMaterial({ color: COAT_COLOR, roughness: 0.85, flatShading: true });

    this.body = new THREE.Group();
    this.group.add(this.body);

    // Forward is +z (update() aligns +z with the path tangent).
    const chest = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.55, 0.65), coat);
    chest.position.set(0, 0.95, 0.35);
    chest.castShadow = true;
    this.body.add(chest);

    const waist = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.34, 0.75), coat);
    waist.position.set(0, 1.0, -0.3);
    waist.rotation.x = 0.12;
    waist.castShadow = true;
    this.body.add(waist);

    const neck = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.5, 0.22), coat);
    neck.position.set(0, 1.32, 0.65);
    neck.rotation.x = -0.5;
    this.body.add(neck);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.3), coat);
    head.position.set(0, 1.52, 0.82);
    this.body.add(head);

    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.12, 0.3), coat);
    snout.position.set(0, 1.48, 1.05);
    this.body.add(snout);

    for (const side of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.16, 4), coat);
      ear.position.set(side * 0.08, 1.66, 0.76);
      ear.rotation.z = side * -0.5;
      this.body.add(ear);
    }

    // Legs pivot at the hip/shoulder: geometry shifted so rotation.x swings them from the top.
    const legGeometry = new THREE.BoxGeometry(0.09, 0.85, 0.11);
    legGeometry.translate(0, -0.425, 0);
    const legSpots: [number, number][] = [
      [-0.13, 0.55],
      [0.13, 0.55],
      [-0.11, -0.55],
      [0.11, -0.55],
    ];
    for (const [x, z] of legSpots) {
      const leg = new THREE.Mesh(legGeometry, coat);
      leg.position.set(x, 0.9, z);
      leg.castShadow = true;
      this.legs.push(leg);
      this.body.add(leg);
    }

    const tailGeometry = new THREE.CylinderGeometry(0.02, 0.045, 0.7, 4);
    tailGeometry.translate(0, -0.35, 0);
    this.tail = new THREE.Mesh(tailGeometry, coat);
    this.tail.position.set(0, 1.1, -0.68);
    this.tail.rotation.x = 2.4;
    this.body.add(this.tail);
  }

  update(progress: number, elapsed: number): void {
    const t = clamp(progress + RUN_LEAD, 0.001, 0.999);
    const pos = this.curve.getPoint(t);
    const tangent = this.curve.getTangent(t);

    const stride = elapsed * 11;
    // Rotary gallop: front pair and rear pair roughly opposed, inner legs trailing a beat.
    this.legs[0].rotation.x = Math.sin(stride) * 0.65;
    this.legs[1].rotation.x = Math.sin(stride + 0.5) * 0.65;
    this.legs[2].rotation.x = Math.sin(stride + Math.PI) * 0.6;
    this.legs[3].rotation.x = Math.sin(stride + Math.PI + 0.5) * 0.6;
    this.body.position.y = Math.abs(Math.sin(stride)) * 0.14;
    this.body.rotation.x = Math.sin(stride) * 0.07;
    this.tail.rotation.z = Math.sin(elapsed * 7) * 0.35;

    this.group.position.set(pos.x, this.heightAt(pos.x, pos.z), pos.z);
    this.group.rotation.y = Math.atan2(tangent.x, tangent.z);
  }
}
