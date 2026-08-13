import type { Path, SemanticIssue, AnySequence } from '../types';

// `generate()` compiles a sequence's stagger into a `calc()` delay driven by
// `--motion-<sequenceId>-index` custom properties, so `offsetEasing` has to be a string it can
// turn into CSS math. A `(p: number) => number` function has no CSS equivalent, and the whole
// sequence is dropped from the generated CSS — it still animates once Interact initializes, but
// nothing is pre-rendered, so a `viewEnter` sequence loses its FOUC-prevention rules.
export function checkFunctionOffsetEasing(path: Path, sequence: AnySequence): SemanticIssue[] {
  if (typeof sequence.offsetEasing !== 'function') return [];

  return [
    {
      code: 'custom',
      params: { domainCode: 'FUNCTION_OFFSET_EASING' },
      path: [...path, 'offsetEasing'],
      message:
        'A function `offsetEasing` cannot be expressed in CSS, so `generate()` omits this sequence from the generated CSS (an entrance sequence loses FOUC prevention). Use a named easing, `cubic-bezier(...)`, or `linear(...)`.',
    },
  ];
}
