import { z } from 'zod';

export const Keyframe = z.record(z.string(), z.union([z.string(), z.number()]));

export const LengthPercentage = z
  .object({
    value: z.number(),
    unit: z.enum(['px', 'em', 'rem', 'vh', 'vw', 'vmin', 'vmax', 'percentage']),
  })
  .strict();

export const RangeOffset = z
  .object({
    name: z
      .enum(['entry', 'exit', 'contain', 'cover', 'entry-crossing', 'exit-crossing'])
      .optional(),
    offset: LengthPercentage.optional(),
  })
  .strict();

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

export const Condition = z
  .object({
    type: z.enum(['media', 'container', 'selector']),
    predicate: z.string().min(1),
  })
  .strict()
  .refine((condition) => condition.type !== 'media' || isValidMediaQuery(condition.predicate), {
    message: 'Invalid media query',
    path: ['predicate'],
  });
