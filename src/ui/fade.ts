import { bandFade } from '../lib/math';
import type { Section } from '../content/types';

export function opacityFor(progress: number, section: Section): number {
  return bandFade(progress, section.start, section.end, section.fadeIn, section.fadeOut);
}
