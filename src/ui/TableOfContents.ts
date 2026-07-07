import type { Section } from '../content/types';
import { RUNES } from '../content/runes';
import { rushScrollTo } from '../lib/math';

/** Persistent top nav: current chapter's rune + plain name always visible, click any
 * chapter to rush-scroll there. Collapses to a dropdown on narrow viewports. */
export class TableOfContents {
  private readonly sections: Section[];
  private readonly toggleRune: HTMLElement;
  private readonly toggleLabel: HTMLElement;
  private readonly toggleButton: HTMLButtonElement;
  private readonly nav: HTMLElement;
  private readonly tabs: HTMLButtonElement[] = [];
  private activeIndex = -1;
  private open = false;

  constructor(container: HTMLElement, sections: Section[]) {
    this.sections = sections;
    container.classList.add('toc');
    this.nav = container;

    this.toggleButton = document.createElement('button');
    this.toggleButton.className = 'toc__toggle';
    this.toggleButton.setAttribute('aria-expanded', 'false');
    this.toggleButton.setAttribute('aria-label', 'Chapter navigation');
    this.toggleRune = document.createElement('span');
    this.toggleRune.className = 'toc__toggle-rune';
    this.toggleLabel = document.createElement('span');
    this.toggleLabel.className = 'toc__toggle-label';
    this.toggleButton.append(this.toggleRune, this.toggleLabel);
    this.toggleButton.addEventListener('click', () => this.setOpen(!this.open));
    container.appendChild(this.toggleButton);

    const list = document.createElement('ul');
    list.className = 'toc__list';
    sections.forEach((section, i) => {
      const item = document.createElement('li');
      const tab = document.createElement('button');
      tab.className = 'toc__tab';
      tab.type = 'button';
      const rune = document.createElement('span');
      rune.className = 'toc__tab-rune';
      rune.textContent = RUNES[i % RUNES.length];
      const label = document.createElement('span');
      label.className = 'toc__tab-label';
      label.textContent = section.heading;
      tab.append(rune, label);
      tab.addEventListener('click', () => this.jumpTo(i));
      item.appendChild(tab);
      list.appendChild(item);
      this.tabs.push(tab);
    });
    container.appendChild(list);

    document.addEventListener('click', (e) => {
      if (this.open && !container.contains(e.target as Node)) this.setOpen(false);
    });
  }

  private setOpen(open: boolean): void {
    this.open = open;
    this.nav.classList.toggle('toc--open', open);
    this.toggleButton.setAttribute('aria-expanded', String(open));
  }

  private jumpTo(index: number): void {
    const section = this.sections[index];
    const target = (section.start + section.end) / 2;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    rushScrollTo(target * maxScroll);
    this.setOpen(false);
  }

  update(progress: number): void {
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

    if (activeIndex !== this.activeIndex) {
      this.activeIndex = activeIndex;
      const section = this.sections[activeIndex];
      this.toggleRune.textContent = RUNES[activeIndex % RUNES.length];
      this.toggleLabel.textContent = section.heading;
      this.tabs.forEach((tab, i) => tab.classList.toggle('toc__tab--active', i === activeIndex));
    }
  }
}
