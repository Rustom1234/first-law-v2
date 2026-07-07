import * as THREE from 'three';

function drawCrowTexture(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 32;
  const ctx = canvas.getContext('2d')!;
  ctx.strokeStyle = 'rgba(15,14,12,0.9)';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(4, 10);
  ctx.quadraticCurveTo(32, 26, 60, 10);
  ctx.stroke();
  return canvas;
}

interface Crow {
  sprite: THREE.Sprite;
  radius: number;
  speed: number;
  phase: number;
  height: number;
}

export class Ambient {
  readonly group = new THREE.Group();
  private readonly crows: Crow[] = [];
  private readonly center: THREE.Vector3;

  constructor(center: { x: number; z: number; y: number }, count = 6) {
    this.center = new THREE.Vector3(center.x, center.y, center.z);
    const texture = new THREE.CanvasTexture(drawCrowTexture());
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, fog: true });

    for (let i = 0; i < count; i++) {
      const sprite = new THREE.Sprite(material);
      sprite.scale.set(2.2, 1.1, 1);
      const radius = 14 + Math.random() * 10;
      const speed = 0.15 + Math.random() * 0.1;
      const phase = Math.random() * Math.PI * 2;
      const height = 10 + Math.random() * 6;
      this.crows.push({ sprite, radius, speed, phase, height });
      this.group.add(sprite);
    }
  }

  update(elapsed: number): void {
    for (const crow of this.crows) {
      const angle = elapsed * crow.speed + crow.phase;
      crow.sprite.position.set(
        this.center.x + Math.cos(angle) * crow.radius,
        this.center.y + crow.height + Math.sin(elapsed * 0.6 + crow.phase) * 1.2,
        this.center.z + Math.sin(angle) * crow.radius,
      );
    }
  }
}
