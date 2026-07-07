import * as THREE from 'three';
import { JOURNEY_WAYPOINTS } from '../camera/path';
import { clamp, lerp } from '../lib/math';

const SPIRIT_COLOR = new THREE.Color('#e8ecdf');
const RUN_LEAD = 0.028;
const HOVER = 0.22;
const WISP_COUNT = 26;
const WISP_LENGTH = 3.6;

const headingMatrix = new THREE.Matrix4();
const desiredQuaternion = new THREE.Quaternion();
const upVector = new THREE.Vector3(0, 1, 0);
const lookTarget = new THREE.Vector3();

function drawHaloCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  return canvas;
}

/** A spectral white whippet, patronus-style, running the whole road with you: a smooth
 * ellipsoid-and-capsule body (additive, unlit, unfogged, shadowless) with a breathing halo
 * and wisps streaming off the gallop. It samples the road arc-length-uniformly like the
 * camera does, hovers a hand above the ground, and damps its height and heading so terrain
 * noise and path curvature never jerk it around. */
export class Whippet {
  readonly group = new THREE.Group();
  private readonly legs: THREE.Mesh[] = [];
  private readonly tail: THREE.Mesh;
  private readonly body: THREE.Group;
  private readonly curve: THREE.CatmullRomCurve3;
  private readonly heightAt: (x: number, z: number) => number;
  private readonly haloMaterial: THREE.SpriteMaterial;
  private readonly wisps: THREE.Points;
  private smoothY: number | null = null;
  private lastElapsed = 0;

  constructor(heightAt: (x: number, z: number) => number) {
    this.heightAt = heightAt;

    // Runs beside the road, not on it, so it never sits dead-center under the camera.
    const points = JOURNEY_WAYPOINTS.map(
      (wp, i) => new THREE.Vector3(wp.x + (i % 2 === 0 ? 4.5 : 6.5), 0, wp.z),
    );
    this.curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5);

    const coat = new THREE.MeshBasicMaterial({
      color: SPIRIT_COLOR,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    });

    this.body = new THREE.Group();
    this.group.add(this.body);

    // Forward is +z. Rounded anatomy: deep ellipsoid chest flowing into a tucked waist,
    // an arched capsule neck, tapered muzzle, and capsule legs.
    const chest = new THREE.Mesh(new THREE.SphereGeometry(0.32, 14, 12), coat);
    chest.position.set(0, 1.0, 0.32);
    chest.scale.set(0.62, 0.92, 1.5);
    this.body.add(chest);

    const waist = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 12), coat);
    waist.position.set(0, 1.06, -0.38);
    waist.scale.set(0.52, 0.78, 1.7);
    waist.rotation.x = 0.14;
    this.body.add(waist);

    const neck = new THREE.Mesh(new THREE.CapsuleGeometry(0.105, 0.46, 6, 12), coat);
    neck.position.set(0, 1.38, 0.62);
    neck.rotation.x = -0.55;
    this.body.add(neck);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), coat);
    head.position.set(0, 1.62, 0.84);
    head.scale.set(0.78, 0.9, 1.15);
    this.body.add(head);

    const snout = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.34, 10), coat);
    snout.position.set(0, 1.57, 1.06);
    snout.rotation.x = Math.PI / 2 - 0.12;
    this.body.add(snout);

    for (const side of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.15, 6), coat);
      ear.position.set(side * 0.075, 1.76, 0.78);
      ear.rotation.z = side * -0.45;
      this.body.add(ear);
    }

    // Legs pivot at the hip/shoulder: geometry shifted so rotation.x swings them from the top.
    const legGeometry = new THREE.CapsuleGeometry(0.048, 0.62, 6, 10);
    legGeometry.translate(0, -0.35, 0);
    const legSpots: [number, number][] = [
      [-0.12, 0.52],
      [0.12, 0.52],
      [-0.1, -0.52],
      [0.1, -0.52],
    ];
    for (const [x, z] of legSpots) {
      const leg = new THREE.Mesh(legGeometry, coat);
      leg.position.set(x, 0.92, z);
      this.legs.push(leg);
      this.body.add(leg);
    }

    const tailGeometry = new THREE.CylinderGeometry(0.014, 0.04, 0.68, 10);
    tailGeometry.translate(0, -0.34, 0);
    this.tail = new THREE.Mesh(tailGeometry, coat);
    this.tail.position.set(0, 1.14, -0.72);
    this.tail.rotation.x = 2.5;
    this.body.add(this.tail);

    const haloTexture = new THREE.CanvasTexture(drawHaloCanvas());
    this.haloMaterial = new THREE.SpriteMaterial({
      map: haloTexture,
      color: SPIRIT_COLOR,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    });
    const halo = new THREE.Sprite(this.haloMaterial);
    halo.position.set(0, 1.0, 0.1);
    halo.scale.set(3.4, 2.4, 1);
    this.body.add(halo);

    // Wisp trail: particles cycle from the haunches backward and slightly upward, fading
    // as they age, like the spirit is shedding light while it runs.
    const wispPositions = new Float32Array(WISP_COUNT * 3);
    const wispGeometry = new THREE.BufferGeometry();
    wispGeometry.setAttribute('position', new THREE.BufferAttribute(wispPositions, 3));
    const wispMaterial = new THREE.PointsMaterial({
      color: SPIRIT_COLOR,
      size: 0.14,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.wisps = new THREE.Points(wispGeometry, wispMaterial);
    this.group.add(this.wisps);
  }

  update(progress: number, elapsed: number): void {
    const dt = clamp(elapsed - this.lastElapsed, 0, 0.1);
    this.lastElapsed = elapsed;

    // Arc-length sampling (same as the camera) keeps its speed constant between waypoints.
    const t = clamp(progress + RUN_LEAD, 0.001, 0.999);
    const pos = this.curve.getPointAt(t);
    const tangent = this.curve.getTangentAt(t);

    const stride = elapsed * 11;
    // Rotary gallop: front pair and rear pair roughly opposed, inner legs trailing a beat.
    this.legs[0].rotation.x = Math.sin(stride) * 0.65;
    this.legs[1].rotation.x = Math.sin(stride + 0.5) * 0.65;
    this.legs[2].rotation.x = Math.sin(stride + Math.PI) * 0.6;
    this.legs[3].rotation.x = Math.sin(stride + Math.PI + 0.5) * 0.6;
    this.body.position.y = Math.abs(Math.sin(stride)) * 0.1 + Math.sin(elapsed * 1.7) * 0.05;
    this.body.rotation.x = Math.sin(stride) * 0.06;
    this.tail.rotation.z = Math.sin(elapsed * 7) * 0.35;

    this.haloMaterial.opacity = 0.24 + (Math.sin(elapsed * 3.1) * 0.5 + 0.5) * 0.14;

    const positions = this.wisps.geometry.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < WISP_COUNT; i++) {
      const age = ((i / WISP_COUNT) + elapsed * 0.55) % 1;
      const sway = Math.sin(elapsed * 4 + i * 2.3);
      positions.setXYZ(
        i,
        sway * 0.18 * age + ((i % 3) - 1) * 0.1,
        0.9 + age * 0.9 + Math.sin(age * Math.PI * 2 + i) * 0.08,
        -0.6 - age * WISP_LENGTH,
      );
    }
    positions.needsUpdate = true;

    // Damped height (it hovers, and never inherits per-bump terrain noise) and damped
    // heading (path curvature turns the body smoothly instead of snapping it).
    const targetY = this.heightAt(pos.x, pos.z) + HOVER;
    const k = 1 - Math.exp(-5 * dt);
    this.smoothY = this.smoothY === null ? targetY : lerp(this.smoothY, targetY, k);
    this.group.position.set(pos.x, this.smoothY, pos.z);

    lookTarget.copy(this.group.position).add(tangent);
    headingMatrix.lookAt(lookTarget, this.group.position, upVector);
    desiredQuaternion.setFromRotationMatrix(headingMatrix);
    const headingK = 1 - Math.exp(-7 * dt);
    this.group.quaternion.slerp(desiredQuaternion, headingK);
  }
}
