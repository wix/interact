import type { Rule } from '..';
import type { ValidationError } from '../../errors';

// Minimal CSS media query syntactic check — accepts any non-empty string that
// contains balanced parens and only sane top-level tokens. Falls through to
// `window.matchMedia` when available for the strictest possible check.
function isValidMediaQuery(query: string): boolean {
  const q = query.trim();
  if (!q) return false;
  if (typeof globalThis !== 'undefined' && 'matchMedia' in globalThis) {
    try {
      const mql = (globalThis as { matchMedia(q: string): { media: string } }).matchMedia(q);
      // Invalid queries make matchMedia return `media: ''` in most engines.
      return mql.media !== '' || q === 'all';
    } catch {
      return false;
    }
  }
  let depth = 0;
  for (const ch of q) {
    if (ch === '(') depth++;
    else if (ch === ')') {
      depth--;
      if (depth < 0) return false;
    }
  }
  if (depth !== 0) return false;
  return /^[A-Za-z0-9_\-:,()\s.%/<>=]+$/.test(q);
}

export const validMediaQueries: Rule = {
  code: 'INVALID_MEDIA_QUERY',
  defaultSeverity: 'error',
  run: (ctx) => {
    const errors: ValidationError[] = [];
    (ctx.experience.disableWhen ?? []).forEach((condition, i) => {
      if (!isValidMediaQuery(condition.mediaQuery)) {
        errors.push({
          code: 'INVALID_MEDIA_QUERY' as const,
          severity: 'error' as const,
          path: ['disableWhen', i, 'mediaQuery'],
          message: `Invalid media query: ${JSON.stringify(condition.mediaQuery)}.`,
        });
      }
    });
    return errors;
  },
};
