import * as THREE from 'three';
import type { Warriors } from './Warriors';

export interface CompanionDef {
  name: string;
  line: string;
  x: number;
  z: number;
  facing: number;
  color?: string;
}

function drawCompanionLabel(name: string, line: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 160;
  const ctx = canvas.getContext('2d')!;

  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = 10;

  ctx.font = '700 34px Georgia, "Times New Roman", serif';
  ctx.fillStyle = 'rgba(224,220,210,0.95)';
  ctx.fillText(name, canvas.width / 2, 54);

  ctx.font = 'italic 26px Georgia, "Times New Roman", serif';
  ctx.fillStyle = 'rgba(200,195,182,0.88)';
  wrapText(ctx, `"${line}"`, canvas.width / 2, 96, 580, 30);

  return canvas;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): void {
  const words = text.split(' ');
  let line = '';
  let cursorY = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cursorY);
      line = word;
      cursorY += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, cursorY);
}

/** Named companions encountered along the road: a figure plus a floating voice-line label. */
export class Companions {
  readonly group = new THREE.Group();

  constructor(defs: CompanionDef[], warriors: Warriors, heightAt: (x: number, z: number) => number) {
    for (const def of defs) {
      const figure = warriors.createFigure(new THREE.Color(def.color ?? '#242019'), 1.05);
      const y = heightAt(def.x, def.z);
      figure.position.set(def.x, y, def.z);
      figure.rotation.y = def.facing;
      this.group.add(figure);

      const texture = new THREE.CanvasTexture(drawCompanionLabel(def.name, def.line));
      texture.colorSpace = THREE.SRGBColorSpace;
      const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, fog: true });
      const sprite = new THREE.Sprite(material);
      sprite.scale.set(9, 2.25, 1);
      sprite.position.set(def.x, y + 3.1, def.z);
      this.group.add(sprite);
    }
  }
}
