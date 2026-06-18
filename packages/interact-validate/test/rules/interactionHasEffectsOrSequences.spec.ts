import { describe, expect, it } from 'vitest';
import { validateInteractConfig } from '../../src';

describe('interactionHasEffectsOrSequences — INTERACTION_EMPTY', () => {
  it('emits no errors when an interaction has at least one effect', () => {
    const result = validateInteractConfig({
      interactions: [
        {
          key: 'el',
          trigger: 'viewEnter',
          effects: [{ namedEffect: { type: 'FadeIn' }, duration: 400 }],
        },
      ],
    });
    expect(result.errors.filter((e) => e.code === 'INTERACTION_EMPTY')).toHaveLength(0);
  });

  it('emits no errors when an interaction has at least one sequence', () => {
    const result = validateInteractConfig({
      interactions: [
        {
          key: 'el',
          trigger: 'viewEnter',
          sequences: [{ effects: [{ namedEffect: { type: 'FadeIn' }, duration: 400 }] }],
        },
      ],
    });
    expect(result.errors.filter((e) => e.code === 'INTERACTION_EMPTY')).toHaveLength(0);
  });

  it('emits INTERACTION_EMPTY when an interaction has neither effects nor sequences', () => {
    const result = validateInteractConfig({
      interactions: [{ key: 'el', trigger: 'viewEnter' }],
    });
    const errs = result.errors.filter((e) => e.code === 'INTERACTION_EMPTY');
    expect(errs).toHaveLength(1);
    expect(errs[0].severity).toBe('error');
    expect(errs[0].path).toEqual(['interactions', 0]);
  });

  it('emits one INTERACTION_EMPTY per offending interaction', () => {
    // INTERACTION_EMPTY is emitted by superRefine on viewEnter/pageVisible/animationEnd.
    // State interactions (hover/click/…) use .min(1) — enforced structurally by the schema.
    const result = validateInteractConfig({
      interactions: [
        { key: 'a', trigger: 'viewEnter' },
        {
          key: 'b',
          trigger: 'viewEnter',
          effects: [{ namedEffect: { type: 'FadeIn' }, duration: 400 }],
        },
        { key: 'c', trigger: 'pageVisible' },
      ],
    });
    const errs = result.errors.filter((e) => e.code === 'INTERACTION_EMPTY');
    expect(errs).toHaveLength(2);
  });
});
