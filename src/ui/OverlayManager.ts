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
import { clamp } from '../lib/math';

interface TrackedSection {
  section: Section;
  el: HTMLElement;
}

interface ScrollTrack {
  section: Section;
  viewport: HTMLElement;
  track: HTMLElement;
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
  private readonly scrollTracks: ScrollTrack[] = [];
  private readonly mobileQuery = window.matchMedia('(max-width: 720px)');
  private isMobile = this.mobileQuery.matches;

  constructor(container: HTMLElement) {
    this.container = container;
    this.mobileQuery.addEventListener('change', (e) => {
      this.isMobile = e.matches;
    });
  }

  build(resume: ResumeData, sections: Section[]): void {
    for (const section of sections) {
      // Experiment: the About chapter's text is written on the terrain itself
      // (scene/GroundScript.ts), so its overlay card is not built.
      if (section.dataRef === 'about') continue;
      const card = this.buildCard(resume, section);
      this.container.appendChild(card);
      this.tracked.push({ section, el: card });
    }
  }

  update(progress: number): void {
    const opacities = this.tracked.map(({ section }) => opacityFor(progress, section));

    // On narrow viewports every card occupies the same full-width slot (see the 720px
    // breakpoint in overlay.css), so the normal cross-fade leaves two sections' text
    // stacked mid-transition. Only the section closest to full visibility stays shown.
    let visibleIndex = -1;
    if (this.isMobile) {
      let max = -1;
      opacities.forEach((o, i) => {
        if (o > max) {
          max = o;
          visibleIndex = i;
        }
      });
    }

    this.tracked.forEach(({ el: card }, i) => {
      const opacity = this.isMobile && i !== visibleIndex ? 0 : opacities[i];
      card.style.opacity = opacity.toFixed(3);
      // A custom property, not style.transform: the positioned card variants (approach/
      // about/contact/projects/paper) each carry their own centering transform in CSS, and
      // composing translateY() here would overwrite it instead of stacking with it.
      card.style.setProperty('--fade-y', `${(1 - opacity) * 16}px`);
      const interactive = opacity > 0.05;
      card.style.pointerEvents = interactive ? 'auto' : 'none';
      card.setAttribute('aria-hidden', interactive ? 'false' : 'true');
    });

    // One scroll gesture drives both the journey and any long list: rather than a nested
    // scrollbar, the list's own position is a direct function of progress within its chapter's band.
    // The track only moves once the card has fully faded in and finishes moving before fade-out
    // starts, so the first entry is never partway scrolled off when the card becomes visible.
    for (const { section, viewport, track } of this.scrollTracks) {
      const activeSpan = section.end - section.start - section.fadeIn - section.fadeOut;
      const t = activeSpan > 0
        ? clamp((progress - (section.start + section.fadeIn)) / activeSpan, 0, 1)
        : 0;
      const overflow = Math.max(0, track.scrollHeight - viewport.clientHeight);
      track.style.transform = `translateY(${-overflow * t}px)`;
    }
  }

  /** Wraps content that may be taller than its card in a clipped viewport + a track that
   * this.update() translates directly from scroll progress, instead of overflow:auto. */
  private buildScrollWrapper(section: Section, trackClassName: string): { viewport: HTMLElement; track: HTMLElement } {
    const viewport = el('div', 'dispatch-viewport');
    const track = el('div', trackClassName);
    viewport.appendChild(track);
    this.scrollTracks.push({ section, viewport, track });
    return { viewport, track };
  }

  private buildCard(resume: ResumeData, section: Section): HTMLElement {
    const card = el('section', `dispatch-card dispatch-card--${section.id} dispatch-card--${section.dataRef}`);
    card.setAttribute('aria-label', section.heading);
    card.appendChild(el('h2', 'dispatch-card__heading', section.heading));
    if (section.flavor) card.appendChild(el('p', 'dispatch-card__flavor', section.flavor));

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
        this.renderExperience(body, section, resume.experience);
        break;
      case 'projects':
        this.renderProjects(body, section, resume.projects);
        break;
      case 'education':
        this.renderEducation(body, section, resume.education);
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
    if (profile.intro) body.appendChild(el('p', 'dispatch-intro', profile.intro));
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

  private renderExperience(body: HTMLElement, section: Section, entries: ExperienceEntry[]): void {
    const { viewport, track: list } = this.buildScrollWrapper(section, 'dispatch-track');
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
    body.appendChild(viewport);
  }

  private renderProjects(body: HTMLElement, section: Section, entries: ProjectEntry[]): void {
    const { viewport, track: grid } = this.buildScrollWrapper(section, 'trophy-grid');
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
    body.appendChild(viewport);
  }

  private renderEducation(body: HTMLElement, section: Section, entries: EducationEntry[]): void {
    const { viewport, track: list } = this.buildScrollWrapper(section, 'dispatch-track');
    entries.forEach((entry, i) => {
      const item = el('article', 'dispatch-item dispatch-item--trial');

      if (entry.logo) {
        const logo = document.createElement('img');
        logo.className = 'dispatch-item__logo dispatch-item__logo--trial';
        logo.src = entry.logo;
        logo.alt = entry.org;
        item.appendChild(logo);
      } else {
        item.appendChild(el('span', 'dispatch-item__trial-mark', String(i + 1)));
      }

      // School name is the bold headline, the program/degree sits under it (swapped from
      // the field names, since entry.org holds the school and entry.title the program).
      const titleLine = el('p', 'dispatch-item__title', entry.org);
      titleLine.appendChild(el('span', 'dispatch-item__period', entry.period));
      item.appendChild(titleLine);
      item.appendChild(el('p', 'dispatch-item__org', entry.title));
      item.appendChild(el('p', 'dispatch-item__blurb', entry.blurb));

      if (entry.gpa) item.appendChild(el('p', 'dispatch-item__gpa dispatch-item__gpa--visible', `GPA: ${entry.gpa}`));

      const hasDropdown = Boolean(entry.activities?.length) || Boolean(entry.coursework?.length);
      if (hasDropdown) {
        const details = el('div', 'dispatch-item__details');
        if (entry.activities?.length) {
          const activitiesList = el('ul', 'dispatch-item__coursework');
          for (const activity of entry.activities) activitiesList.appendChild(el('li', undefined, activity));
          details.appendChild(activitiesList);
        }
        if (entry.coursework?.length) {
          const courseworkList = el('ul', 'dispatch-item__coursework');
          for (const course of entry.coursework) courseworkList.appendChild(el('li', undefined, course));
          details.appendChild(courseworkList);
        }

        const toggle = el('button', 'dispatch-item__toggle', 'Coursework & Activities ▾');
        toggle.type = 'button';
        toggle.addEventListener('click', () => {
          const isOpen = details.classList.toggle('dispatch-item__details--open');
          toggle.textContent = isOpen ? 'Coursework & Activities ▴' : 'Coursework & Activities ▾';
        });
        item.appendChild(toggle);
        item.appendChild(details);
      }

      list.appendChild(item);
    });
    body.appendChild(viewport);
  }

  private renderPaper(body: HTMLElement, paper: PaperEntry): void {
    const relic = el('div', 'relic-card');

    if (paper.image) {
      const graph = document.createElement('img');
      graph.className = 'relic-graph';
      graph.src = paper.image;
      graph.alt = `Figure from ${paper.title}`;
      relic.appendChild(graph);
    } else {
      relic.appendChild(el('div', 'relic-seal'));
    }

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

    if (profile.resumeUrl) {
      const download = el('a', 'contact-resume-link', 'Download Resume');
      download.href = profile.resumeUrl;
      download.download = '';
      body.appendChild(download);
    }
  }
}
