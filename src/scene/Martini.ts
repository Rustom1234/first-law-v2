import * as THREE from 'three';
import { clamp, lerp } from '../lib/math';

/** Martini the dog, running alongside the road for a stretch of the journey. Placeholder
 * photo slot: drop a photo at public/martini.png and she appears; until then this
 * quietly adds nothing to the scene (no broken-texture box). */
export class Martini {
  readonly group = new THREE.Group();
  private sprite: THREE.Sprite | null = null;
  private readonly from: THREE.Vector3;
  private readonly to: THREE.Vector3;
  private readonly rangeStart: number;
  private readonly rangeEnd: number;
  private readonly heightAt: (x: number, z: number) => number;

  constructor(
    from: { x: number; z: number },
    to: { x: number; z: number },
    range: [number, number],
    heightAt: (x: number, z: number) => number,
    src = '/martini.png',
  ) {
    this.from = new THREE.Vector3(from.x, 0, from.z);
    this.to = new THREE.Vector3(to.x, 0, to.z);
    this.rangeStart = range[0];
    this.rangeEnd = range[1];
    this.heightAt = heightAt;

    new THREE.TextureLoader().load(
      src,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, fog: true });
        this.sprite = new THREE.Sprite(material);
        this.sprite.scale.set(4, 4, 1);
        this.sprite.visible = false;
        this.group.add(this.sprite);
      },
      undefined,
      () => {
        // No photo yet: stay empty rather than showing a broken texture.
      },
    );
  }

  update(progress: number, elapsed: number): void {
    if (!this.sprite) return;
    if (progress < this.rangeStart || progress > this.rangeEnd) {
      this.sprite.visible = false;
      return;
    }

    this.sprite.visible = true;
    const t = clamp((progress - this.rangeStart) / (this.rangeEnd - this.rangeStart), 0, 1);
    const x = lerp(this.from.x, this.to.x, t);
    const z = lerp(this.from.z, this.to.z, t);
    const bob = Math.abs(Math.sin(elapsed * 9)) * 0.35;
    this.sprite.position.set(x, this.heightAt(x, z) + 1.6 + bob, z);
  }
}
