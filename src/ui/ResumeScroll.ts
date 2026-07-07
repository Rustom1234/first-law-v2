import { smoothstep } from '../lib/math';
import type { Profile } from '../content/types';

const RISE_START = 0.86;
const RISE_END = 0.98;

/** The finale: a giant scroll rises from the bottom like a sunrise as the journey ends,
 * carrying a real download-resume button. */
export class ResumeScroll {
  private readonly container: HTMLElement;
  private readonly el: HTMLElement;

  constructor(container: HTMLElement, profile: Profile) {
    this.container = container;
    container.classList.add('resume-scroll');

    const rod = document.createElement('div');
    rod.className = 'resume-scroll__rod';
    container.appendChild(rod);

    this.el = document.createElement('div');
    this.el.className = 'resume-scroll__body';

    const heading = document.createElement('p');
    heading.className = 'resume-scroll__heading';
    heading.textContent = 'The Full Account';
    this.el.appendChild(heading);

    if (profile.resumeUrl) {
      const link = document.createElement('a');
      link.className = 'resume-scroll__button';
      link.href = profile.resumeUrl;
      link.download = '';
      link.textContent = 'Download Resume';
      this.el.appendChild(link);
    }

    container.appendChild(this.el);
  }

  update(progress: number): void {
    const t = smoothstep(RISE_START, RISE_END, progress);
    this.container.style.transform = `translateY(${(1 - t) * 100}%)`;
    this.container.style.opacity = t > 0.02 ? '1' : '0';
  }
}
