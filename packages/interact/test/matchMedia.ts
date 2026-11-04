const NO_PREFERENCE = '(prefers-reduced-motion: no-preference)';
const REDUCE = '(prefers-reduced-motion: reduce)';

// a browser without a reduced-motion preference, unless `matches` matches reduce
export function withNoReducedMotionPreference(
  matches: (query: string) => boolean,
): (query: string) => boolean {
  return (query) => {
    if (matches(query)) {
      return true;
    }
    if (!query.endsWith(NO_PREFERENCE) || matches(REDUCE)) {
      return false;
    }
    const rest = query.slice(0, -NO_PREFERENCE.length).replace(/ and $/, '');
    return !rest || matches(rest);
  };
}

export function createMediaQueryList(query: string, matches: boolean): MediaQueryList {
  return {
    matches,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  } as unknown as MediaQueryList;
}
