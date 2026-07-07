import { bandFade } from '../lib/math';
import type { Section } from '../content/types';

/** The chronicler's one-line subtitle for the active chapter (idea #1: diegetic framing). */
export class VoiceLine {
  private readonly el: HTMLElement;
  private readonly sections: Section[];
  private currentId: string | null = null;

  constructor(container: HTMLElement, sections: Section[]) {
    this.sections = sections;
    container.classList.add('voice-line');
    this.el = document.createElement('p');
    this.el.className = 'voice-line__text';
    container.appendChild(this.el);
  }

  update(progress: number): void {
    let active: Section | null = null;
    let bestOpacity = 0;
    for (const section of this.sections) {
      const opacity = bandFade(progress, section.start, section.end, section.fadeIn, section.fadeOut);
      if (opacity > bestOpacity) {
        bestOpacity = opacity;
        active = section;
      }
    }

    if (active && active.id !== this.currentId) {
      this.currentId = active.id;
      this.el.textContent = active.voiceLine;
    }

    this.el.style.opacity = bestOpacity > 0.15 ? '1' : '0';
  }
}
