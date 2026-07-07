import * as THREE from 'three';

export interface GroundScriptContent {
  heading: string;
  flavor?: string;
  paragraphs: string[];
}

const CANVAS_W = 1024;
const CANVAS_H = 2048;
const MARGIN = 70;

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const attempt = line ? `${line} ${word}` : word;
    if (ctx.measureText(attempt).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = attempt;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** The chapter text inked directly onto the terrain, like directions written across a map:
 * dark ink, a heading rule, body copy stretched along the road so the camera's shallow
 * angle reads it roughly square. Scrolling then pushes the writing past underfoot instead
 * of a card floating over the world. */
function drawScriptCanvas(content: GroundScriptContent): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

  const maxWidth = CANVAS_W - MARGIN * 2;
  let y = 150;

  // Ink on stone/sand needs contrast without looking like printed vinyl: a warm
  // near-black with a faint pale offset underneath, like paint settled into the ground.
  const inkShadow = (draw: () => void) => {
    ctx.save();
    ctx.shadowColor = 'rgba(244, 228, 188, 0.5)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetY = 3;
    draw();
    ctx.restore();
  };

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  ctx.font = '700 104px Georgia, "Times New Roman", serif';
  ctx.fillStyle = '#3a1d0e';
  inkShadow(() => ctx.fillText(content.heading.toUpperCase(), CANVAS_W / 2, y));
  y += 46;

  // Heading rule with a diamond, the same mark a hand-drawn map would use.
  ctx.strokeStyle = 'rgba(58, 29, 14, 0.85)';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(MARGIN + 60, y);
  ctx.lineTo(CANVAS_W - MARGIN - 60, y);
  ctx.stroke();
  ctx.save();
  ctx.translate(CANVAS_W / 2, y);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = '#3a1d0e';
  ctx.fillRect(-14, -14, 28, 28);
  ctx.restore();
  y += 120;

  if (content.flavor) {
    ctx.font = 'italic 58px Georgia, "Times New Roman", serif';
    ctx.fillStyle = 'rgba(74, 38, 16, 0.95)';
    for (const line of wrapText(ctx, content.flavor, maxWidth)) {
      inkShadow(() => ctx.fillText(line, CANVAS_W / 2, y));
      y += 84;
    }
    y += 60;
  }

  ctx.font = '400 66px Georgia, "Times New Roman", serif';
  ctx.fillStyle = '#2a170b';
  for (const paragraph of content.paragraphs) {
    for (const line of wrapText(ctx, paragraph, maxWidth)) {
      inkShadow(() => ctx.fillText(line, CANVAS_W / 2, y));
      y += 96;
    }
    y += 70;
  }

  return canvas;
}

export class GroundScript {
  readonly mesh: THREE.Mesh;

  /** width/length are world units; length runs along the road (-z). The plane is
   * subdivided and every vertex dropped onto the terrain so the writing follows
   * the ground's swells instead of floating or clipping through them. */
  constructor(
    content: GroundScriptContent,
    center: { x: number; z: number },
    width: number,
    length: number,
    heightAt: (x: number, z: number) => number,
  ) {
    const texture = new THREE.CanvasTexture(drawScriptCanvas(content));
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;

    const geometry = new THREE.PlaneGeometry(width, length, 16, 32);
    geometry.rotateX(-Math.PI / 2);

    const positions = geometry.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < positions.count; i++) {
      const wx = center.x + positions.getX(i);
      const wz = center.z + positions.getZ(i);
      positions.setY(i, heightAt(wx, wz) + 0.18);
    }
    geometry.computeVertexNormals();

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      fog: true,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(center.x, 0, center.z);
    this.mesh.renderOrder = 1;
  }
}
