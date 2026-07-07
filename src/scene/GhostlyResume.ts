import * as THREE from 'three';
import * as pdfjsLib from 'pdfjs-dist';
// eslint-disable-next-line import/no-unresolved
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { clamp } from '../lib/math';
import { assetUrl } from '../lib/assetUrl';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

/** The real resume, rendered from the actual PDF (not a recreation, so it never drifts
 * out of sync when the file is replaced), as a pale ghost that rises from behind the
 * summit ridge as the journey ends. Real depth-tested occlusion, not a CSS clip: the
 * terrain in front of it is opaque geometry, so the mountain genuinely hides whatever
 * hasn't risen above the ridgeline yet. */
export class GhostlyResume {
  readonly group = new THREE.Group();
  private sprite: THREE.Sprite | null = null;
  private readonly rangeStart: number;
  private readonly rangeEnd: number;
  private readonly baseY: number;
  private readonly riseHeight: number;

  constructor(range: [number, number], baseY: number, riseHeight: number, src = assetUrl('resume.pdf')) {
    this.rangeStart = range[0];
    this.rangeEnd = range[1];
    this.baseY = baseY;
    this.riseHeight = riseHeight;
    this.load(src);
  }

  private async load(src: string): Promise<void> {
    try {
      const pdf = await pdfjsLib.getDocument({ url: src }).promise;
      const page = await pdf.getPage(1);
      // Rasterized well above the sprite's on-screen size at the final camera distance so
      // text stays crisp instead of upscaled/hazy; no mipmaps so minification never blurs it.
      const viewport = page.getViewport({ scale: 5.5 });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport, canvas } as never).promise;

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.generateMipmaps = false;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.anisotropy = 8;
      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.25,
        depthWrite: false,
        fog: false,
      });

      this.sprite = new THREE.Sprite(material);
      const aspect = canvas.width / canvas.height;
      const height = 14;
      this.sprite.scale.set(height * aspect, height, 1);
      this.sprite.position.y = this.baseY;
      this.group.add(this.sprite);
    } catch {
      // No PDF yet, or it failed to render: stay empty rather than showing a broken plane.
    }
  }

  placeAt(x: number, z: number): void {
    this.group.position.set(x, 0, z);
  }

  update(progress: number): void {
    if (!this.sprite) return;
    const span = this.rangeEnd - this.rangeStart;
    const t = span > 0 ? clamp((progress - this.rangeStart) / span, 0, 1) : 0;
    this.sprite.position.y = this.baseY + t * this.riseHeight;
    (this.sprite.material as THREE.SpriteMaterial).opacity = 0.25 + t * 0.6;
  }
}
