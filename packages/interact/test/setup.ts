import { createMediaQueryList, withNoReducedMotionPreference } from './matchMedia';

if (typeof window !== 'undefined' && !window.matchMedia) {
  const matches = withNoReducedMotionPreference(() => false);
  window.matchMedia = (query: string) => createMediaQueryList(query, matches(query));
}
