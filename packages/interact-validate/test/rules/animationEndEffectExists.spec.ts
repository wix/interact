import { describe, expect, it } from 'vitest';
import { validateInteractConfig } from '../../src';

describe('animationEndEffectExists — ANIMATION_END_EFFECT_NOT_FOUND', () => {
  it('emits no errors when the animationEnd params.effectId resolves to a defined effect', () => {
    const result = validateInteractConfig({
      effects: { fade: { namedEffect: { type: 'FadeIn' } } },
      interactions: [
        {
          key: 'el',
          trigger: 'animationEnd',
          params: { effectId: 'fade' },
          effects: [{ namedEffect: { type: 'SlideIn' } }],
        },
      ],
    });
    expect(result.errors.filter((e) => e.code === 'ANIMATION_END_EFFECT_NOT_FOUND')).toHaveLength(
      0,
    );
  });

  it('emits ANIMATION_END_EFFECT_NOT_FOUND when params.effectId is not defined', () => {
    const result = validateInteractConfig({
      interactions: [
        {
          key: 'el',
          trigger: 'animationEnd',
          params: { effectId: 'ghost' },
          effects: [{ namedEffect: { type: 'SlideIn' } }],
        },
      ],
    });
    const errs = result.errors.filter((e) => e.code === 'ANIMATION_END_EFFECT_NOT_FOUND');
    expect(errs).toHaveLength(1);
    expect(errs[0].severity).toBe('error');
    expect(errs[0].path).toContain('params');
  });
});
