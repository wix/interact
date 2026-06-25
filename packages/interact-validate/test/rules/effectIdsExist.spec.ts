import { describe, expect, it } from 'vitest';
import { validateInteractConfig } from '../../src';

describe('effectIdsExist — EFFECT_ID_NOT_FOUND', () => {
  it('emits no warnings when an effectId reference resolves to a defined effect', () => {
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
    expect(errs[0].severity).toBe('warning');
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

describe('effectIdsExist — ANIMATION_END_EFFECT_NOT_FOUND', () => {
  it('emits no errors when the animationEnd params.effectId resolves to a defined effect', () => {
    const result = validateInteractConfig({
      effects: { fade: { namedEffect: { type: 'FadeIn' } } },
      interactions: [
        {
          key: 'el',
          trigger: 'animationEnd',
          params: { effectId: 'fade' },
          effects: [{ namedEffect: { type: 'SlideIn' }, duration: 400 }],
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
          effects: [{ namedEffect: { type: 'SlideIn' }, duration: 400 }],
        },
      ],
    });
    const errs = result.errors.filter((e) => e.code === 'ANIMATION_END_EFFECT_NOT_FOUND');
    expect(errs).toHaveLength(1);
    expect(errs[0].severity).toBe('error');
    expect(errs[0].path).toContain('params');
  });
});
