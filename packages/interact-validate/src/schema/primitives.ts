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

// Static regex-based media query validation: balanced parentheses + allowed character set.
// matchMedia is a runtime browser API and is deliberately not used here — this library
// performs static config validation and must work identically in all environments.
function isValidMediaQuery(query: string): boolean {
  const q = query.trim();
  if (!q) return false;
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
  .superRefine((condition, ctx) => {
    // Only validate media query syntax when the predicate has content
    // (empty predicate is caught by the min(1) check above).
    if (
      condition.predicate &&
      condition.type === 'media' &&
      !isValidMediaQuery(condition.predicate)
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Invalid media query',
        path: ['predicate'],
        params: { domainCode: 'INVALID_MEDIA_QUERY' },
      } as any);
    }
  });
