import { describe, expect, it } from 'vitest';
import { validateInteractConfig } from '../../../src/validate';

const KEYFRAME_EFFECT_A = { name: 'anim1', keyframes: [{ opacity: '0' }, { opacity: '1' }] };
const KEYFRAME_EFFECT_B = { name: 'anim2', keyframes: [{ opacity: '0' }, { opacity: '1' }] };

describe('uniqueDefinitionIds — DUPLICATE_KEYFRAME_NAME', () => {
  it('emits no errors when all keyframe names are unique', () => {
    const result = validateInteractConfig({
      effects: {
        a: { keyframeEffect: KEYFRAME_EFFECT_A },
        b: { keyframeEffect: KEYFRAME_EFFECT_B },
      },
      interactions: [
        { key: 'el', trigger: 'viewEnter', effects: [{ effectId: 'a' }, { effectId: 'b' }] },
      ],
    });
    expect(result.errors.filter((e) => e.code === 'DUPLICATE_KEYFRAME_NAME')).toHaveLength(0);
  });

  it('emits no errors when effects use different source types', () => {
    const result = validateInteractConfig({
      effects: {
        named: { namedEffect: { type: 'FadeIn' } },
        keyframed: { keyframeEffect: KEYFRAME_EFFECT_A },
      },
      interactions: [
        {
          key: 'el',
          trigger: 'viewEnter',
          effects: [{ effectId: 'named' }, { effectId: 'keyframed' }],
        },
      ],
    });
    expect(result.errors.filter((e) => e.code === 'DUPLICATE_KEYFRAME_NAME')).toHaveLength(0);
  });

  it('emits DUPLICATE_KEYFRAME_NAME when two top-level effects share a keyframe name', () => {
    const result = validateInteractConfig({
      effects: {
        a: { keyframeEffect: { name: 'shared', keyframes: [{ opacity: '0' }] } },
        b: { keyframeEffect: { name: 'shared', keyframes: [{ opacity: '1' }] } },
      },
      interactions: [
        { key: 'el', trigger: 'viewEnter', effects: [{ effectId: 'a' }, { effectId: 'b' }] },
      ],
    });
    const errs = result.errors.filter((e) => e.code === 'DUPLICATE_KEYFRAME_NAME');
    expect(errs).toHaveLength(1);
    expect(errs[0].severity).toBe('warning');
    expect(errs[0].path).toContain('name');
    expect(errs[0].message).toContain('"shared"');
  });

  it('emits one DUPLICATE_KEYFRAME_NAME per extra duplicate (first occurrence is the baseline)', () => {
    const result = validateInteractConfig({
      effects: {
        a: { keyframeEffect: { name: 'dup', keyframes: [{ opacity: '0' }] } },
        b: { keyframeEffect: { name: 'dup', keyframes: [{ opacity: '0.5' }] } },
        c: { keyframeEffect: { name: 'dup', keyframes: [{ opacity: '1' }] } },
      },
      interactions: [
        {
          key: 'el',
          trigger: 'viewEnter',
          effects: [{ effectId: 'a' }, { effectId: 'b' }, { effectId: 'c' }],
        },
      ],
    });
    const errs = result.errors.filter((e) => e.code === 'DUPLICATE_KEYFRAME_NAME');
    expect(errs).toHaveLength(2);
  });
});
