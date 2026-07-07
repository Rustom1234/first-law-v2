import type { ResumeData } from '../content/types';

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

/** No-WebGL / static-tier path: same resume data, a normal scrollable page. Nearly free because
 * OverlayManager already builds content from plain DOM, this just lays it out without the 3D canvas. */
export function renderFallback(root: HTMLElement, resume: ResumeData): void {
  root.innerHTML = '';
  root.classList.add('fallback-page');

  const header = el('header', 'fallback-header');
  header.appendChild(el('h1', 'fallback-name', resume.profile.name));
  header.appendChild(el('p', 'fallback-tagline', resume.profile.tagline));
  root.appendChild(header);

  const experienceSection = el('section', 'fallback-section');
  experienceSection.appendChild(el('h2', 'fallback-heading', 'Experience'));
  for (const entry of resume.experience) {
    const item = el('article', 'fallback-item');
    const title = el('p', 'fallback-item__title', `${entry.title}, ${entry.org}`);
    title.appendChild(el('span', 'fallback-item__period', entry.period));
    item.appendChild(title);
    item.appendChild(el('p', 'fallback-item__blurb', entry.blurb));
    experienceSection.appendChild(item);
  }
  root.appendChild(experienceSection);

  const projectsSection = el('section', 'fallback-section');
  projectsSection.appendChild(el('h2', 'fallback-heading', 'Projects'));
  for (const entry of resume.projects) {
    const wrapper = entry.link ? el('a', 'fallback-item fallback-item--link') : el('article', 'fallback-item');
    if (entry.link && wrapper instanceof HTMLAnchorElement) {
      wrapper.href = entry.link;
      wrapper.target = '_blank';
      wrapper.rel = 'noopener noreferrer';
    }
    wrapper.appendChild(el('p', 'fallback-item__title', entry.title));
    wrapper.appendChild(el('p', 'fallback-item__blurb', entry.blurb));
    projectsSection.appendChild(wrapper);
  }
  root.appendChild(projectsSection);

  const educationSection = el('section', 'fallback-section');
  educationSection.appendChild(el('h2', 'fallback-heading', 'Education'));
  for (const entry of resume.education) {
    const item = el('article', 'fallback-item');
    const title = el('p', 'fallback-item__title', `${entry.title}, ${entry.org}`);
    title.appendChild(el('span', 'fallback-item__period', entry.period));
    item.appendChild(title);
    item.appendChild(el('p', 'fallback-item__blurb', entry.blurb));
    educationSection.appendChild(item);
  }
  root.appendChild(educationSection);

  const contactSection = el('section', 'fallback-section');
  contactSection.appendChild(el('h2', 'fallback-heading', 'Contact'));
  const links = el('div', 'fallback-links');
  for (const link of resume.profile.links ?? []) {
    const anchor = el('a', 'fallback-link', link.label);
    anchor.href = link.url;
    links.appendChild(anchor);
  }
  contactSection.appendChild(links);
  root.appendChild(contactSection);
}
