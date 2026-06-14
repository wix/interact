import { describe, expect, it } from 'vitest';
import { validateInteractConfig } from '../../src';

describe('triggerEffectCompatible — TRIGGER_EFFECT_INCOMPATIBLE', () => {
  describe('valid combinations', () => {
    it('emits no errors for a time effect on a discrete trigger', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'viewEnter',
            effects: [{ namedEffect: { type: 'FadeIn' }, duration: 400, delay: 100 }],
          },
        ],
      });
      expect(result.errors.filter((e) => e.code === 'TRIGGER_EFFECT_INCOMPATIBLE')).toHaveLength(0);
    });

    it('emits no errors for a scrub effect on a viewProgress trigger', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'viewProgress',
            effects: [{ namedEffect: { type: 'FadeIn' }, rangeStart: { name: 'entry' } }],
          },
        ],
      });
      expect(result.errors.filter((e) => e.code === 'TRIGGER_EFFECT_INCOMPATIBLE')).toHaveLength(0);
    });

    it('emits no errors for a scrub effect on a pointerMove trigger', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'pointerMove',
            effects: [{ namedEffect: { type: 'ParallaxMove' }, rangeEnd: { name: 'exit' } }],
          },
        ],
      });
      expect(result.errors.filter((e) => e.code === 'TRIGGER_EFFECT_INCOMPATIBLE')).toHaveLength(0);
    });
  });

  describe('time fields on scrub trigger', () => {
    it('emits TRIGGER_EFFECT_INCOMPATIBLE for duration on viewProgress', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'viewProgress',
            effects: [{ namedEffect: { type: 'FadeIn' }, duration: 500 }],
          },
        ],
      });
      const errs = result.errors.filter((e) => e.code === 'TRIGGER_EFFECT_INCOMPATIBLE');
      expect(errs.length).toBeGreaterThan(0);
      expect(errs[0].severity).toBe('warning');
      expect(errs[0].path).toContain('duration');
    });

    it('emits TRIGGER_EFFECT_INCOMPATIBLE for delay on pointerMove', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'pointerMove',
            effects: [{ namedEffect: { type: 'FadeIn' }, delay: 200 }],
          },
        ],
      });
      expect(
        result.errors.some(
          (e) => e.code === 'TRIGGER_EFFECT_INCOMPATIBLE' && e.path.includes('delay'),
        ),
      ).toBe(true);
    });
  });

  describe('state fields on scrub trigger', () => {
    it('emits TRIGGER_EFFECT_INCOMPATIBLE for stateAction on viewProgress', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'viewProgress',
            effects: [{ stateAction: 'add' }],
          },
        ],
      });
      expect(
        result.errors.some(
          (e) => e.code === 'TRIGGER_EFFECT_INCOMPATIBLE' && e.path.includes('stateAction'),
        ),
      ).toBe(true);
    });
  });

  describe('scrub fields on discrete trigger', () => {
    it('emits TRIGGER_EFFECT_INCOMPATIBLE for rangeStart on viewEnter', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'viewEnter',
            effects: [{ namedEffect: { type: 'FadeIn' }, rangeStart: { name: 'entry' } }],
          },
        ],
      });
      const errs = result.errors.filter((e) => e.code === 'TRIGGER_EFFECT_INCOMPATIBLE');
      expect(errs.length).toBeGreaterThan(0);
      expect(errs[0].path).toContain('rangeStart');
    });

    it('emits TRIGGER_EFFECT_INCOMPATIBLE for transitionDuration on click', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'click',
            effects: [{ namedEffect: { type: 'FadeIn' }, transitionDuration: 300 }],
          },
        ],
      });
      expect(
        result.errors.some(
          (e) => e.code === 'TRIGGER_EFFECT_INCOMPATIBLE' && e.path.includes('transitionDuration'),
        ),
      ).toBe(true);
    });
  });
});
