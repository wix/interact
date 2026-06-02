import { describe, expect, it } from 'vitest';
import { validateInteractConfig } from '../../src';

describe('conditionPredicateRequired — CONDITION_PREDICATE_REQUIRED', () => {
  it('emits no errors for a media condition with a predicate', () => {
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
    expect(result.errors.filter((e) => e.code === 'CONDITION_PREDICATE_REQUIRED')).toHaveLength(0);
  });

  it('emits no errors for a container condition with a predicate', () => {
    const result = validateInteractConfig({
      conditions: { cont: { type: 'container', predicate: '(min-width: 200px)' } },
      interactions: [
        {
          key: 'el',
          trigger: 'viewEnter',
          conditions: ['cont'],
          effects: [{ namedEffect: { type: 'FadeIn' } }],
        },
      ],
    });
    expect(result.errors.filter((e) => e.code === 'CONDITION_PREDICATE_REQUIRED')).toHaveLength(0);
  });

  it('emits no errors for a selector condition (predicate is optional for selector)', () => {
    const result = validateInteractConfig({
      conditions: { sel: { type: 'selector' } },
      interactions: [
        {
          key: 'el',
          trigger: 'viewEnter',
          conditions: ['sel'],
          effects: [{ namedEffect: { type: 'FadeIn' } }],
        },
      ],
    });
    expect(result.errors.filter((e) => e.code === 'CONDITION_PREDICATE_REQUIRED')).toHaveLength(0);
  });

  it('emits CONDITION_PREDICATE_REQUIRED for a media condition without a predicate', () => {
    const result = validateInteractConfig({
      conditions: { mq: { type: 'media' } },
      interactions: [
        {
          key: 'el',
          trigger: 'viewEnter',
          conditions: ['mq'],
          effects: [{ namedEffect: { type: 'FadeIn' } }],
        },
      ],
    });
    const err = result.errors.find((e) => e.code === 'CONDITION_PREDICATE_REQUIRED');
    expect(err).toBeDefined();
    expect(err?.severity).toBe('error');
    expect(err?.path).toEqual(['conditions', 'mq', 'predicate']);
    expect(err?.message).toContain('"mq"');
  });

  it('emits CONDITION_PREDICATE_REQUIRED for a container condition without a predicate', () => {
    const result = validateInteractConfig({
      conditions: { cont: { type: 'container' } },
      interactions: [
        {
          key: 'el',
          trigger: 'viewEnter',
          conditions: ['cont'],
          effects: [{ namedEffect: { type: 'FadeIn' } }],
        },
      ],
    });
    const err = result.errors.find((e) => e.code === 'CONDITION_PREDICATE_REQUIRED');
    expect(err).toBeDefined();
    expect(err?.path).toEqual(['conditions', 'cont', 'predicate']);
  });
});
