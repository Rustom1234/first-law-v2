interface Ember {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

/** A shiny ember trail that follows the cursor everywhere on the site. Self-contained:
 * owns its own canvas and rAF loop, just construct it once and call dispose() to stop. */
export class CursorTrail {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private embers: Ember[] = [];
  private rafId = 0;
  private running = true;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'cursor-trail';
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d')!;

    window.addEventListener('mousemove', this.handleMove);
    window.addEventListener('resize', this.handleResize);
    this.rafId = requestAnimationFrame(this.frame);
  }

  private handleMove = (e: MouseEvent): void => {
    const spawnCount = 1 + Math.round(Math.random());
    for (let i = 0; i < spawnCount; i++) {
      this.embers.push({
        x: e.clientX + (Math.random() - 0.5) * 4,
        y: e.clientY + (Math.random() - 0.5) * 4,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.3 - Math.random() * 0.5,
        life: 0,
        maxLife: 0.5 + Math.random() * 0.4,
        size: 1.5 + Math.random() * 2,
      });
    }
    if (this.embers.length > 200) this.embers.splice(0, this.embers.length - 200);
  };

  private handleResize = (): void => {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  };

  private frame = (): void => {
    if (!this.running) return;
    const dt = 1 / 60;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.embers = this.embers.filter((e) => e.life < e.maxLife);
    for (const e of this.embers) {
      e.life += dt;
      e.x += e.vx;
      e.y += e.vy;
      const t = e.life / e.maxLife;
      const alpha = 1 - t;
      const hue = 30 + t * 20;
      this.ctx.beginPath();
      this.ctx.arc(e.x, e.y, e.size * (1 - t * 0.5), 0, Math.PI * 2);
      this.ctx.fillStyle = `hsla(${hue}, 90%, 65%, ${alpha * 0.8})`;
      this.ctx.fill();
    }

    this.rafId = requestAnimationFrame(this.frame);
  };

  dispose(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
    window.removeEventListener('mousemove', this.handleMove);
    window.removeEventListener('resize', this.handleResize);
    this.canvas.remove();
  }
}
