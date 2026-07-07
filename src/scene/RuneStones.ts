import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { bandFade } from '../lib/math';
import type { Section } from '../content/types';

const STONE_COLOR = new THREE.Color('#5e5c54');

/** A chapter obelisk: plinth, tapered four-sided shaft, pyramidal cap. Taller and more
 * deliberate than the education waystones, one stands at every chapter of the journey. */
function buildObeliskGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  // Four radial segments make a square obelisk; rotateY(PI/4) turns a flat face toward +z,
  // where the carved rune sits and where the camera approaches from.
  const plinth = new THREE.CylinderGeometry(1.0, 1.3, 0.5, 4).toNonIndexed();
  plinth.rotateY(Math.PI / 4);
  plinth.translate(0, 0.25, 0);
  parts.push(plinth);

  const shaft = new THREE.CylinderGeometry(0.42, 0.72, 4.6, 4).toNonIndexed();
  shaft.rotateY(Math.PI / 4);
  shaft.translate(0, 2.8, 0);
  parts.push(shaft);

  const cap = new THREE.CylinderGeometry(0.04, 0.46, 0.8, 4).toNonIndexed();
  cap.rotateY(Math.PI / 4);
  cap.translate(0, 5.5, 0);
  parts.push(cap);

  return mergeGeometries(parts, false);
}

function drawRuneCanvas(glyph: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = '700 84px Georgia, "Times New Roman", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
  ctx.shadowBlur = 16;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(glyph, canvas.width / 2, canvas.height / 2 + 6);

  return canvas;
}

function drawHaloCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  return canvas;
}

/** A landmark for every rune: a carved obelisk whose glyph (the same glyph as the nav and
 * progress track) ignites in the region's accent color while its chapter is on screen, so
 * arriving at a chapter in the world mirrors reaching its rune in the UI. The glow is
 * additive sprite + emissive plane only, no extra point lights, so seven of them stay cheap. */
export class RuneStone {
  readonly group = new THREE.Group();
  private readonly glyphMaterial: THREE.MeshBasicMaterial;
  private readonly haloMaterial: THREE.SpriteMaterial;
  private readonly halo: THREE.Sprite;
  private readonly section: Section;
  private readonly phase: number;

  constructor(glyph: string, accent: THREE.Color, section: Section, phase = 0) {
    this.section = section;
    this.phase = phase;

    const stoneMaterial = new THREE.MeshStandardMaterial({ color: STONE_COLOR, roughness: 1, flatShading: true });
    const stone = new THREE.Mesh(buildObeliskGeometry(), stoneMaterial);
    stone.castShadow = true;
    stone.receiveShadow = true;
    this.group.add(stone);

    const glyphTexture = new THREE.CanvasTexture(drawRuneCanvas(glyph));
    glyphTexture.colorSpace = THREE.SRGBColorSpace;
    this.glyphMaterial = new THREE.MeshBasicMaterial({
      map: glyphTexture,
      color: accent,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    });
    const glyphPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.75), this.glyphMaterial);
    // Just proud of the shaft's front face (face distance ~0.39 at this height), tilted to its taper.
    glyphPlane.position.set(0, 3.1, 0.42);
    glyphPlane.rotation.x = -0.05;
    this.group.add(glyphPlane);

    const haloTexture = new THREE.CanvasTexture(drawHaloCanvas());
    this.haloMaterial = new THREE.SpriteMaterial({
      map: haloTexture,
      color: accent,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    });
    this.halo = new THREE.Sprite(this.haloMaterial);
    this.halo.position.set(0, 3.1, 0.5);
    this.halo.scale.setScalar(2.4);
    this.group.add(this.halo);
  }

  placeAt(x: number, z: number, heightAt: (x: number, z: number) => number, facingY = 0): void {
    this.group.position.set(x, heightAt(x, z), z);
    this.group.rotation.y = facingY;
  }

  update(progress: number, elapsed: number): void {
    const lit = bandFade(progress, this.section.start, this.section.end, this.section.fadeIn, this.section.fadeOut);
    const breathe = Math.sin(elapsed * 2.1 + this.phase) * 0.5 + 0.5;
    this.glyphMaterial.opacity = 0.12 + lit * (0.68 + breathe * 0.2);
    this.haloMaterial.opacity = lit * (0.28 + breathe * 0.12);
    this.halo.scale.setScalar(2.4 + lit * (0.6 + breathe * 0.3));
  }
}
