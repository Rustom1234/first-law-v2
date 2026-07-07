import { damp, clamp } from '../lib/math';

const DAMP_LAMBDA = 4.5;

export class ScrollController {
  private smoothed = 0;
  private raw = 0;
  private readonly scrollContainer: HTMLElement;
  readonly reducedMotion: boolean;

  constructor(scrollContainer: HTMLElement, reducedMotion: boolean) {
    this.reducedMotion = reducedMotion;
    this.scrollContainer = scrollContainer;
    this.readRaw();
  }

  private readRaw(): void {
    const maxScroll = this.scrollContainer.scrollHeight - window.innerHeight;
    this.raw = maxScroll > 0 ? clamp(window.scrollY / maxScroll, 0, 1) : 0;
  }

  /** Returns the damped 0..1 progress to drive the camera/overlays this frame. */
  update(dt: number): number {
    this.readRaw();
    if (this.reducedMotion) {
      this.smoothed = this.raw;
    } else {
      this.smoothed = damp(this.smoothed, this.raw, DAMP_LAMBDA, dt);
    }
    return this.smoothed;
  }

  get progress(): number {
    return this.smoothed;
  }
}
