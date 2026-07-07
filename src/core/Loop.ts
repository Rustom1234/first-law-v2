const MAX_DELTA = 1 / 20;

export class Loop {
  private running = false;
  private lastTime = 0;
  private rafId = 0;
  private readonly onTick: (dt: number, elapsed: number) => void;
  private elapsed = 0;

  constructor(onTick: (dt: number, elapsed: number) => void) {
    this.onTick = onTick;
    document.addEventListener('visibilitychange', this.handleVisibility);
  }

  private handleVisibility = () => {
    if (document.hidden) {
      this.pause();
    } else {
      this.start();
    }
  };

  private frame = (time: number) => {
    if (!this.running) return;
    const dt = Math.min((time - this.lastTime) / 1000, MAX_DELTA);
    this.lastTime = time;
    this.elapsed += dt;
    this.onTick(dt, this.elapsed);
    this.rafId = requestAnimationFrame(this.frame);
  };

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.frame);
  }

  pause(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  dispose(): void {
    this.pause();
    document.removeEventListener('visibilitychange', this.handleVisibility);
  }
}
