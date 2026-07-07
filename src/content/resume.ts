import type { ResumeData } from './types';

/**
 * TODO(rustom): This is the only file with real content in it. Everything marked
 * TODO below is a placeholder, not a fabricated fact, replace it with your actual
 * history. Nothing here is wired into the 3D scene itself, only into the overlay
 * panels, so you can edit freely without touching any Three.js code. Project
 * images go in public/projects/ and are referenced by path, e.g. "/projects/foo.jpg".
 */
export const resume: ResumeData = {
  profile: {
    name: 'Rustom Dubash',
    tagline: 'AI engineer. Builds things, ships things.', // TODO: your real tagline
    portrait: undefined, // TODO: path to a portrait image, e.g. "/portrait.jpg"
    bio: [
      'TODO: two or three sentences on who you are, what you care about building, and how you got here.',
      'TODO: a second paragraph if you want more texture, otherwise delete this line.',
    ],
    email: 'rustommdubash@gmail.com',
    links: [
      { label: 'Email', url: 'mailto:rustommdubash@gmail.com' },
      // TODO: add GitHub / LinkedIn / other links you want listed
    ],
  },

  experience: [
    {
      title: 'TODO: Role title',
      org: 'TODO: Company / org',
      period: 'TODO: 2024 - Present',
      blurb: 'TODO: one or two lines on what you actually did and shipped here.',
      tags: ['TODO'],
    },
    {
      title: 'TODO: Role title 2',
      org: 'TODO: Company / org',
      period: 'TODO: dates',
      blurb: 'TODO: one or two lines on what you actually did and shipped here.',
      tags: ['TODO'],
    },
    {
      title: 'TODO: Role title 3',
      org: 'TODO: Company / org',
      period: 'TODO: dates',
      blurb: 'TODO: one or two lines on what you actually did and shipped here.',
      tags: ['TODO'],
    },
    {
      title: 'TODO: Role title 4',
      org: 'TODO: Company / org',
      period: 'TODO: dates',
      blurb: 'TODO: one or two lines on what you actually did and shipped here.',
      tags: ['TODO'],
    },
    {
      title: 'TODO: Role title 5',
      org: 'TODO: Company / org',
      period: 'TODO: dates',
      blurb: 'TODO: one or two lines on what you actually did and shipped here.',
      tags: ['TODO'],
    },
  ],

  projects: [
    {
      title: 'Outreach Desk',
      image: undefined, // TODO: "/projects/outreach-desk.jpg"
      period: 'TODO: dates',
      blurb: 'TODO: what Outreach Desk does and what you built.',
      tags: ['TODO'],
      link: undefined, // TODO: repo or demo link
    },
    {
      title: 'Pixel Agents',
      image: undefined, // TODO: "/projects/pixel-agents.jpg"
      period: 'TODO: dates',
      blurb: 'TODO: what the pixel-agents office work is and what you built.',
      tags: ['TODO'],
      link: undefined, // TODO: repo or demo link
    },
    {
      title: 'TODO: Project 3',
      image: undefined,
      period: 'TODO: dates',
      blurb: 'TODO: description.',
      tags: ['TODO'],
      link: undefined,
    },
    {
      title: 'TODO: Project 4',
      image: undefined,
      period: 'TODO: dates',
      blurb: 'TODO: description.',
      tags: ['TODO'],
      link: undefined,
    },
    {
      title: 'TODO: Project 5',
      image: undefined,
      period: 'TODO: dates',
      blurb: 'TODO: description.',
      tags: ['TODO'],
      link: undefined,
    },
    {
      title: 'TODO: Project 6',
      image: undefined,
      period: 'TODO: dates',
      blurb: 'TODO: description.',
      tags: ['TODO'],
      link: undefined,
    },
    {
      title: 'TODO: Project 7',
      image: undefined,
      period: 'TODO: dates',
      blurb: 'TODO: description.',
      tags: ['TODO'],
      link: undefined,
    },
    {
      title: 'TODO: Project 8',
      image: undefined,
      period: 'TODO: dates',
      blurb: 'TODO: description.',
      tags: ['TODO'],
      link: undefined,
    },
    {
      title: 'TODO: Project 9',
      image: undefined,
      period: 'TODO: dates',
      blurb: 'TODO: description.',
      tags: ['TODO'],
      link: undefined,
    },
    {
      title: 'TODO: Project 10',
      image: undefined,
      period: 'TODO: dates',
      blurb: 'TODO: description.',
      tags: ['TODO'],
      link: undefined,
    },
  ],

  education: [
    {
      title: 'TODO: Degree name',
      org: 'TODO: University / school',
      period: 'TODO: dates',
      blurb: 'CrySyS Lab coursework (concluded July 2026).', // TODO: add more detail if you want it
    },
    {
      title: 'TODO: Degree / program 2',
      org: 'TODO: University / school',
      period: 'TODO: dates',
      blurb: 'TODO: description.',
    },
    {
      title: 'TODO: Degree / program 3 (delete this entry if you only have 2)',
      org: 'TODO: University / school',
      period: 'TODO: dates',
      blurb: 'TODO: description.',
    },
  ],

  paper: {
    title: 'TODO: Paper title',
    venue: 'TODO: journal / conference',
    date: 'TODO: date',
    authors: 'TODO: author list',
    abstract: 'TODO: one or two sentences on what the paper is about and what it found.',
    link: undefined, // TODO: arXiv / DOI / publisher link
  },
};
