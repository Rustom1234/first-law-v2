import type { Section } from './types';

/** Binds "where in the world / when in the scroll" to "what the resume says." Editing the journey
 * timing touches this file; editing the actual words touches resume.ts; neither touches scene code.
 *
 * `region` names the physical/visual zone this chapter's content sits in (tied to a fixed spot on
 * the terrain and a fixed atmosphere theme in scene/regions.ts). Chapter order is chronological
 * (Welcome -> About -> Education -> Experience -> Projects -> Paper -> Contact); zone names are
 * historical leftovers from an earlier chapter order and no longer need to match the content. */
export const SECTIONS: Section[] = [
  {
    id: 'approach',
    region: 'approach',
    dataRef: 'profile',
    heading: 'Welcome',
    flavor: 'Every journey starts beside a fire. This one ends with a resume.',
    start: -0.02,
    end: 0.07,
    fadeIn: 0.03,
    fadeOut: 0.03,
  },
  {
    id: 'about',
    region: 'about',
    dataRef: 'about',
    heading: 'About Me',
    flavor: 'Say one thing for your narrator, say he tells it straight.',
    start: 0.05,
    end: 0.16,
    fadeIn: 0.04,
    fadeOut: 0.04,
  },
  {
    id: 'education',
    region: 'north',
    dataRef: 'education',
    heading: 'Education',
    flavor: 'Lessons learned in the cold, marked by waystones.',
    start: 0.14,
    end: 0.35,
    fadeIn: 0.04,
    fadeOut: 0.04,
  },
  {
    id: 'experience',
    region: 'war',
    dataRef: 'experience',
    heading: 'Work Experience',
    flavor: 'Campaigns fought and won. You have to be realistic about these things.',
    start: 0.33,
    end: 0.55,
    fadeIn: 0.04,
    fadeOut: 0.04,
  },
  {
    id: 'projects',
    region: 'archive',
    dataRef: 'projects',
    heading: 'Projects',
    flavor: 'Trophies from the road, each one paid for in full.',
    start: 0.53,
    end: 0.79,
    fadeIn: 0.04,
    fadeOut: 0.04,
  },
  {
    id: 'paper',
    region: 'education',
    dataRef: 'paper',
    heading: 'Research',
    flavor: 'A relic from the archives, sealed and cited.',
    start: 0.77,
    end: 0.87,
    fadeIn: 0.03,
    fadeOut: 0.03,
  },
  {
    id: 'contact',
    region: 'parley',
    dataRef: 'contact',
    heading: 'Contact',
    flavor: 'The fire is lit and the table is set. Sit a while.',
    start: 0.85,
    end: 1.02,
    fadeIn: 0.04,
    fadeOut: 0.05,
  },
];
