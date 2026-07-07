export interface Profile {
  name: string;
  tagline: string;
  portrait?: string;
  bio: string[];
  email?: string;
  links?: { label: string; url: string }[];
  resumeUrl?: string;
}

export interface ExperienceEntry {
  title: string;
  org: string;
  logo?: string;
  period: string;
  blurb: string;
  tags?: string[];
}

export interface ProjectEntry {
  title: string;
  image?: string;
  period?: string;
  blurb: string;
  tags?: string[];
  link?: string;
}

export interface EducationEntry {
  title: string;
  org: string;
  logo?: string;
  period: string;
  blurb: string;
  gpa?: string;
  activities?: string[];
  coursework?: string[];
}

export interface PaperEntry {
  title: string;
  venue: string;
  date: string;
  authors: string;
  abstract: string;
  link?: string;
  image?: string;
}

export interface ResumeData {
  profile: Profile;
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  education: EducationEntry[];
  paper: PaperEntry;
}

export type DataRef = 'profile' | 'about' | 'experience' | 'projects' | 'education' | 'paper' | 'contact';

export interface Section {
  id: string;
  region: string;
  dataRef: DataRef;
  heading: string;
  /** Scroll-progress band [start, end] this section is meant to occupy, with crossfade widths at each edge. */
  start: number;
  end: number;
  fadeIn: number;
  fadeOut: number;
}
