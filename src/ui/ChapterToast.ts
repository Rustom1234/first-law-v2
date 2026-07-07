import type { Section } from '../content/types';

const VISIBLE_MS = 2200;

/** A small "chapter reached" flourish, shown once per section the first time you get there. */
export class ChapterToast {
  private readonly el: HTMLElement;
  private readonly seen = new Set<string>();
  private hideTimer = 0;

  constructor(container: HTMLElement) {
    container.classList.add('chapter-toast');
    this.el = document.createElement('p');
    this.el.className = 'chapter-toast__text';
    container.appendChild(this.el);
  }

  update(progress: number, sections: Section[]): void {
    for (const section of sections) {
      const center = (section.start + section.end) / 2;
      const halfWidth = (section.end - section.start) / 2;
      if (Math.abs(progress - center) < halfWidth * 0.25 && !this.seen.has(section.id)) {
        this.seen.add(section.id);
        this.show(section.heading);
        break;
      }
    }
  }

  private show(heading: string): void {
    this.el.textContent = heading;
    this.el.classList.remove('chapter-toast__text--visible');
    // Force reflow so re-triggering the animation on rapid chapter changes restarts cleanly.
    void this.el.offsetWidth;
    this.el.classList.add('chapter-toast__text--visible');

    window.clearTimeout(this.hideTimer);
    this.hideTimer = window.setTimeout(() => {
      this.el.classList.remove('chapter-toast__text--visible');
    }, VISIBLE_MS);
  }
}
