import { describe, expect, it } from 'vitest';
import { validateInteractConfig } from '../../../src/validate';

describe('conditionsExist — CONDITION_NOT_FOUND', () => {
  it('emits no errors when all condition references resolve to defined conditions', () => {
    const result = validateInteractConfig({
      conditions: { mq: { type: 'media', predicate: '(min-width: 768px)' } },
      interactions: [
        {
          key: 'el',
          trigger: 'viewEnter',
          conditions: ['mq'],
          effects: [{ namedEffect: { type: 'FadeIn' } }],
        },
      ],
    });
    expect(result.errors.filter((e) => e.code === 'CONDITION_NOT_FOUND')).toHaveLength(0);
  });

  it('emits CONDITION_NOT_FOUND when a condition reference has no matching definition', () => {
    const result = validateInteractConfig({
      interactions: [
        {
          key: 'el',
          trigger: 'viewEnter',
          conditions: ['ghost'],
          effects: [{ namedEffect: { type: 'FadeIn' } }],
        },
      ],
    });
    const errs = result.errors.filter((e) => e.code === 'CONDITION_NOT_FOUND');
    expect(errs).toHaveLength(1);
    expect(errs[0].severity).toBe('error');
    expect(errs[0].path).toContain('conditions');
  });

  it('emits CONDITION_NOT_FOUND for a missing condition referenced on an effect', () => {
    const result = validateInteractConfig({
      interactions: [
        {
          key: 'el',
          trigger: 'viewEnter',
          effects: [{ namedEffect: { type: 'FadeIn' }, conditions: ['noSuchCondition'] }],
        },
      ],
    });
    expect(result.errors.some((e) => e.code === 'CONDITION_NOT_FOUND')).toBe(true);
  });
});
