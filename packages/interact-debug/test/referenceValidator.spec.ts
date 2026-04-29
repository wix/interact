import { describe, it, expect } from 'vitest';
import { validateReferences } from '../src/validate/referenceValidator';
import type { InteractConfig } from '../src/types';

function makeConfig(overrides?: Partial<InteractConfig>): InteractConfig {
  return {
    effects: {
      fadeIn: {
        keyframeEffect: { name: 'fade', keyframes: [{ opacity: 0 }, { opacity: 1 }] },
        duration: 500,
      } as any,
    },
    interactions: [{ key: 'hero', trigger: 'viewEnter', effects: [{ effectId: 'fadeIn' }] } as any],
    ...overrides,
  };
}

describe('validateReferences', () => {
  it('passes when all references resolve', () => {
    const result = validateReferences(makeConfig());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('errors when effectId references non-existent effect', () => {
    const result = validateReferences(
      makeConfig({
        interactions: [
          { key: 'hero', trigger: 'viewEnter', effects: [{ effectId: 'missing' }] } as any,
        ],
      }),
    );
    expect(result.errors.some((e) => e.rule === 'effect-ref-missing')).toBe(true);
  });

  it('errors when condition reference is undefined', () => {
    const config = makeConfig({
      conditions: { desktop: { type: 'media', predicate: '(min-width: 1024px)' } },
      interactions: [
        {
          key: 'hero',
          trigger: 'viewEnter',
          conditions: ['missing'],
          effects: [{ effectId: 'fadeIn' }],
        } as any,
      ],
    });
    const result = validateReferences(config);
    expect(result.errors.some((e) => e.rule === 'condition-ref-missing')).toBe(true);
  });

  it('errors when sequenceId references non-existent sequence', () => {
    const config = makeConfig({
      sequences: {},
      interactions: [
        { key: 'hero', trigger: 'viewEnter', sequences: [{ sequenceId: 'missing' }] } as any,
      ],
    });
    const result = validateReferences(config);
    expect(result.errors.some((e) => e.rule === 'sequence-ref-missing')).toBe(true);
  });

  it('warns on orphaned effect', () => {
    const config = makeConfig({
      effects: {
        fadeIn: {
          keyframeEffect: { name: 'fade', keyframes: [{ opacity: 0 }] },
          duration: 500,
        } as any,
        unused: { namedEffect: { type: 'FadeIn' }, duration: 300 } as any,
      },
    });
    const result = validateReferences(config);
    expect(
      result.warnings.some((w) => w.rule === 'orphan-effect' && w.message.includes('unused')),
    ).toBe(true);
  });

  it('warns on orphaned condition', () => {
    const config = makeConfig({
      conditions: { desktop: { type: 'media' }, unused: { type: 'selector' } },
    });
    const result = validateReferences(config);
    expect(
      result.warnings.some((w) => w.rule === 'orphan-condition' && w.message.includes('unused')),
    ).toBe(true);
  });

  it('warns on orphaned sequence', () => {
    const config = makeConfig({
      sequences: {
        entrance: { effects: [{ effectId: 'fadeIn' }] } as any,
      },
    });
    const result = validateReferences(config);
    expect(result.warnings.some((w) => w.rule === 'orphan-sequence')).toBe(true);
  });

  it('warns when cross-key effect targets non-existent key', () => {
    const config = makeConfig({
      interactions: [
        {
          key: 'hero',
          trigger: 'viewEnter',
          effects: [{ effectId: 'fadeIn', key: 'other' }],
        } as any,
      ],
    });
    const result = validateReferences(config);
    expect(result.warnings.some((w) => w.rule === 'cross-key-missing')).toBe(true);
  });

  it('does not warn on cross-key when target key exists', () => {
    const config = makeConfig({
      interactions: [
        {
          key: 'hero',
          trigger: 'viewEnter',
          effects: [{ effectId: 'fadeIn', key: 'banner' }],
        } as any,
        { key: 'banner', trigger: 'hover', effects: [] } as any,
      ],
    });
    const result = validateReferences(config);
    expect(result.warnings.filter((w) => w.rule === 'cross-key-missing')).toHaveLength(0);
  });

  it('validates animationEnd params.effectId reference', () => {
    const config = makeConfig({
      interactions: [
        { key: 'hero', trigger: 'animationEnd', params: { effectId: 'nonexistent' } } as any,
      ],
    });
    const result = validateReferences(config);
    expect(result.errors.some((e) => e.rule === 'animationEnd-effect-ref')).toBe(true);
  });

  it('skips orphan detection when scope is provided', () => {
    const config = makeConfig({
      effects: {
        fadeIn: {
          keyframeEffect: { name: 'fade', keyframes: [{ opacity: 0 }] },
          duration: 500,
        } as any,
        unused: { namedEffect: { type: 'FadeIn' }, duration: 300 } as any,
      },
    });
    const result = validateReferences(config, { key: 'hero' });
    expect(result.warnings.filter((w) => w.rule === 'orphan-effect')).toHaveLength(0);
  });

  // ── Condition refs moved from configValidator ───────────────────────────

  it('errors when interaction references undefined condition', () => {
    const result = validateReferences({
      effects: {
        fadeIn: {
          keyframeEffect: { name: 'fade', keyframes: [{ opacity: 0 }, { opacity: 1 }] },
          duration: 500,
        },
      } as any,
      conditions: { desktop: { type: 'media', predicate: '(min-width: 1024px)' } },
      interactions: [
        {
          key: 'hero',
          trigger: 'viewEnter',
          conditions: ['nonexistent'],
          effects: [{ effectId: 'fadeIn' }],
        } as any,
      ],
    });
    expect(result.errors.some((e) => e.rule === 'condition-ref-missing')).toBe(true);
  });

  it('accepts interaction referencing a valid condition', () => {
    const result = validateReferences({
      effects: {
        fadeIn: {
          keyframeEffect: { name: 'fade', keyframes: [{ opacity: 0 }, { opacity: 1 }] },
          duration: 500,
        },
      } as any,
      conditions: { desktop: { type: 'media', predicate: '(min-width: 1024px)' } },
      interactions: [
        {
          key: 'hero',
          trigger: 'viewEnter',
          conditions: ['desktop'],
          effects: [{ effectId: 'fadeIn' }],
        } as any,
      ],
    });
    expect(result.valid).toBe(true);
  });

  it('errors when effect references undefined condition', () => {
    const result = validateReferences({
      effects: {} as any,
      conditions: {},
      interactions: [
        {
          key: 'hero',
          trigger: 'viewEnter',
          effects: [
            {
              keyframeEffect: { name: 'fade', keyframes: [{ opacity: 0 }, { opacity: 1 }] },
              duration: 500,
              conditions: ['missing'],
            },
          ],
        } as any,
      ],
    });
    expect(result.errors.some((e) => e.rule === 'condition-ref-missing')).toBe(true);
  });

  it('errors when sequence references non-existent sequence', () => {
    const result = validateReferences({
      effects: {} as any,
      sequences: {},
      interactions: [
        { key: 'hero', trigger: 'viewEnter', sequences: [{ sequenceId: 'missing' }] } as any,
      ],
    });
    expect(result.errors.some((e) => e.rule === 'sequence-ref-missing')).toBe(true);
  });

  it('errors when conditions inside sequences reference undefined condition', () => {
    const result = validateReferences({
      effects: {} as any,
      conditions: {},
      interactions: [
        {
          key: 'hero',
          trigger: 'viewEnter',
          sequences: [
            {
              conditions: ['missing'],
              effects: [
                {
                  keyframeEffect: { name: 'fade', keyframes: [{ opacity: 0 }, { opacity: 1 }] },
                  duration: 500,
                },
              ],
            },
          ],
        } as any,
      ],
    });
    expect(result.errors.some((e) => e.rule === 'condition-ref-missing')).toBe(true);
  });
});
