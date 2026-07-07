import type {
  EducationEntry,
  ExperienceEntry,
  PaperEntry,
  ProjectEntry,
  Profile,
  ResumeData,
  Section,
} from '../content/types';
import { opacityFor } from './fade';

interface TrackedSection {
  section: Section;
  el: HTMLElement;
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function initials(name: string): string {
  const cleaned = name.replace(/^TODO:\s*/i, '');
  return cleaned
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export class OverlayManager {
  private readonly container: HTMLElement;
  private readonly tracked: TrackedSection[] = [];

  constructor(container: HTMLElement) {
    this.container = container;
  }

  build(resume: ResumeData, sections: Section[]): void {
    for (const section of sections) {
      const card = this.buildCard(resume, section);
      this.container.appendChild(card);
      this.tracked.push({ section, el: card });
    }
  }

  update(progress: number): void {
    for (const { section, el: card } of this.tracked) {
      const opacity = opacityFor(progress, section);
      card.style.opacity = opacity.toFixed(3);
      card.style.transform = `translateY(${(1 - opacity) * 16}px)`;
      const interactive = opacity > 0.05;
      card.style.pointerEvents = interactive ? 'auto' : 'none';
      card.setAttribute('aria-hidden', interactive ? 'false' : 'true');
    }
  }

  private buildCard(resume: ResumeData, section: Section): HTMLElement {
    const card = el('section', `dispatch-card dispatch-card--${section.id} dispatch-card--${section.dataRef}`);
    card.setAttribute('aria-label', section.heading);
    card.appendChild(el('h2', 'dispatch-card__heading', section.heading));

    const body = el('div', 'dispatch-card__body');
    card.appendChild(body);

    switch (section.dataRef) {
      case 'profile':
        this.renderProfile(body, resume.profile);
        break;
      case 'about':
        this.renderAbout(body, resume.profile);
        break;
      case 'experience':
        this.renderExperience(body, resume.experience);
        break;
      case 'projects':
        this.renderProjects(body, resume.projects);
        break;
      case 'education':
        this.renderEducation(body, resume.education);
        break;
      case 'paper':
        this.renderPaper(body, resume.paper);
        break;
      case 'contact':
        this.renderContact(body, resume.profile);
        break;
    }

    return card;
  }

  private renderProfile(body: HTMLElement, profile: Profile): void {
    body.appendChild(el('p', 'dispatch-name', profile.name));
    body.appendChild(el('p', 'dispatch-tagline', profile.tagline));
  }

  private renderAbout(body: HTMLElement, profile: Profile): void {
    const layout = el('div', 'about-layout');

    if (profile.portrait) {
      const frame = el('div', 'about-portrait');
      const img = document.createElement('img');
      img.src = profile.portrait;
      img.alt = profile.name;
      frame.appendChild(img);
      layout.appendChild(frame);
    } else {
      const frame = el('div', 'about-portrait about-portrait--placeholder', initials(profile.name));
      layout.appendChild(frame);
    }

    const text = el('div', 'about-text');
    for (const paragraph of profile.bio) {
      text.appendChild(el('p', 'about-bio', paragraph));
    }
    layout.appendChild(text);

    body.appendChild(layout);
  }

  private renderExperience(body: HTMLElement, entries: ExperienceEntry[]): void {
    const list = el('div', 'dispatch-scroll');
    for (const entry of entries) {
      const item = el('article', 'dispatch-item dispatch-item--with-logo');

      if (entry.logo) {
        const logo = document.createElement('img');
        logo.className = 'dispatch-item__logo';
        logo.src = entry.logo;
        logo.alt = entry.org;
        item.appendChild(logo);
      } else {
        item.appendChild(el('div', 'dispatch-item__logo dispatch-item__logo--placeholder', initials(entry.org)));
      }

      const content = el('div', 'dispatch-item__content');
      const titleLine = el('p', 'dispatch-item__title', entry.title);
      titleLine.appendChild(el('span', 'dispatch-item__period', entry.period));
      content.appendChild(titleLine);
      content.appendChild(el('p', 'dispatch-item__org', entry.org));
      content.appendChild(el('p', 'dispatch-item__blurb', entry.blurb));
      item.appendChild(content);

      list.appendChild(item);
    }
    body.appendChild(list);
  }

  private renderProjects(body: HTMLElement, entries: ProjectEntry[]): void {
    const grid = el('div', 'trophy-grid');
    for (const entry of entries) {
      const wrapper = entry.link ? el('a', 'trophy-card trophy-card--link') : el('article', 'trophy-card');
      if (entry.link && wrapper instanceof HTMLAnchorElement) {
        wrapper.href = entry.link;
        wrapper.target = '_blank';
        wrapper.rel = 'noopener noreferrer';
      }

      if (entry.image) {
        const thumb = document.createElement('img');
        thumb.className = 'trophy-card__thumb';
        thumb.src = entry.image;
        thumb.alt = entry.title;
        wrapper.appendChild(thumb);
      } else {
        wrapper.appendChild(el('div', 'trophy-card__thumb trophy-card__thumb--placeholder', initials(entry.title)));
      }

      const titleLine = el('p', 'trophy-card__title', entry.title);
      if (entry.period) titleLine.appendChild(el('span', 'dispatch-item__period', entry.period));
      wrapper.appendChild(titleLine);
      wrapper.appendChild(el('p', 'trophy-card__blurb', entry.blurb));

      if (entry.tags?.length) {
        const tags = el('div', 'trophy-card__tags');
        for (const tag of entry.tags) tags.appendChild(el('span', 'trophy-card__tag', tag));
        wrapper.appendChild(tags);
      }

      grid.appendChild(wrapper);
    }
    body.appendChild(grid);
  }

  private renderEducation(body: HTMLElement, entries: EducationEntry[]): void {
    const list = el('div', 'dispatch-scroll');
    entries.forEach((entry, i) => {
      const item = el('article', 'dispatch-item dispatch-item--trial');
      item.appendChild(el('span', 'dispatch-item__trial-mark', String(i + 1)));
      const titleLine = el('p', 'dispatch-item__title', entry.title);
      titleLine.appendChild(el('span', 'dispatch-item__period', entry.period));
      item.appendChild(titleLine);
      item.appendChild(el('p', 'dispatch-item__org', entry.org));
      item.appendChild(el('p', 'dispatch-item__blurb', entry.blurb));

      const hasDetails = Boolean(entry.gpa) || Boolean(entry.coursework?.length);
      if (hasDetails) {
        const details = el('div', 'dispatch-item__details');
        if (entry.gpa) details.appendChild(el('p', 'dispatch-item__gpa', `GPA: ${entry.gpa}`));
        if (entry.coursework?.length) {
          const courseworkList = el('ul', 'dispatch-item__coursework');
          for (const course of entry.coursework) courseworkList.appendChild(el('li', undefined, course));
          details.appendChild(courseworkList);
        }

        const toggle = el('button', 'dispatch-item__toggle', 'Coursework & GPA ▾');
        toggle.type = 'button';
        toggle.addEventListener('click', () => {
          const isOpen = details.classList.toggle('dispatch-item__details--open');
          toggle.textContent = isOpen ? 'Coursework & GPA ▴' : 'Coursework & GPA ▾';
        });
        item.appendChild(toggle);
        item.appendChild(details);
      }

      list.appendChild(item);
    });
    body.appendChild(list);
  }

  private renderPaper(body: HTMLElement, paper: PaperEntry): void {
    const relic = el('div', 'relic-card');
    relic.appendChild(el('div', 'relic-seal'));

    const wrapper = paper.link ? el('a', 'relic-body relic-body--link') : el('div', 'relic-body');
    if (paper.link && wrapper instanceof HTMLAnchorElement) {
      wrapper.href = paper.link;
      wrapper.target = '_blank';
      wrapper.rel = 'noopener noreferrer';
    }

    wrapper.appendChild(el('p', 'relic-title', paper.title));
    const meta = el('p', 'relic-meta', `${paper.venue} · ${paper.date}`);
    wrapper.appendChild(meta);
    wrapper.appendChild(el('p', 'relic-authors', paper.authors));
    wrapper.appendChild(el('p', 'relic-abstract', paper.abstract));

    relic.appendChild(wrapper);
    body.appendChild(relic);
  }

  private renderContact(body: HTMLElement, profile: Profile): void {
    body.appendChild(el('p', 'dispatch-tagline', 'Reach me:'));
    const list = el('div', 'dispatch-links');
    for (const link of profile.links ?? []) {
      const anchor = el('a', 'dispatch-link', link.label);
      anchor.href = link.url;
      if (!link.url.startsWith('mailto:')) {
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
      }
      list.appendChild(anchor);
    }
    body.appendChild(list);
  }
}
