import type { Section } from '../content/types';

const RUNES = ['ᛟ', 'ᚦ', 'ᛒ', 'ᛊ', 'ᛈ', 'ᚱ', 'ᛗ'];

export class Progress {
  private readonly fill: HTMLElement;
  private readonly marks: HTMLElement[] = [];
  private readonly sections: Section[];

  constructor(container: HTMLElement, sections: Section[]) {
    this.sections = sections;
    container.classList.add('rune-track');

    const rail = document.createElement('div');
    rail.className = 'rune-track__rail';
    this.fill = document.createElement('div');
    this.fill.className = 'rune-track__fill';
    rail.appendChild(this.fill);
    container.appendChild(rail);

    const marksContainer = document.createElement('div');
    marksContainer.className = 'rune-track__marks';
    sections.forEach((section, i) => {
      const mark = document.createElement('span');
      mark.className = 'rune-track__mark';
      mark.textContent = RUNES[i % RUNES.length];
      mark.title = section.heading;
      marksContainer.appendChild(mark);
      this.marks.push(mark);
    });
    container.appendChild(marksContainer);
  }

  update(progress: number): void {
    this.fill.style.height = `${progress * 100}%`;

    let activeIndex = 0;
    let closestDistance = Infinity;
    this.sections.forEach((section, i) => {
      const center = (section.start + section.end) / 2;
      const distance = Math.abs(progress - center);
      if (distance < closestDistance) {
        closestDistance = distance;
        activeIndex = i;
      }
    });

    this.marks.forEach((mark, i) => mark.classList.toggle('rune-track__mark--active', i === activeIndex));
  }
}
