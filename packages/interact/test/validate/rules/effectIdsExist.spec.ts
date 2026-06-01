import { describe, expect, it } from 'vitest';
import { validateInteractConfig } from '../../../src/validate';

describe('effectIdsExist — EFFECT_ID_NOT_FOUND', () => {
  it('emits no errors when an effectId reference resolves to a defined effect', () => {
    const result = validateInteractConfig({
      effects: { fade: { namedEffect: { type: 'FadeIn' } } },
      interactions: [{ key: 'el', trigger: 'viewEnter', effects: [{ effectId: 'fade' }] }],
    });
    expect(result.errors.filter((e) => e.code === 'EFFECT_ID_NOT_FOUND')).toHaveLength(0);
  });

  it('emits EFFECT_ID_NOT_FOUND when an effectId reference has no matching definition', () => {
    const result = validateInteractConfig({
      interactions: [{ key: 'el', trigger: 'viewEnter', effects: [{ effectId: 'missing' }] }],
    });
    const errs = result.errors.filter((e) => e.code === 'EFFECT_ID_NOT_FOUND');
    expect(errs).toHaveLength(1);
    expect(errs[0].severity).toBe('error');
    expect(errs[0].path).toContain('effectId');
  });

  it('emits EFFECT_ID_NOT_FOUND for an effectId inside a sequence', () => {
    const result = validateInteractConfig({
      interactions: [
        {
          key: 'el',
          trigger: 'viewEnter',
          sequences: [{ effects: [{ effectId: 'ghost' }] }],
        },
      ],
    });
    expect(result.errors.some((e) => e.code === 'EFFECT_ID_NOT_FOUND')).toBe(true);
  });
});
