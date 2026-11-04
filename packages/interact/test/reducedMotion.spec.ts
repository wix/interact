import { describe, expect, it } from 'vitest';
import {
  REDUCED_MOTION_NO_PREFERENCE as NO_PREFERENCE,
  REDUCED_MOTION_REDUCE as REDUCE,
  getReducedMotionPolicy,
  getReducedMotionVariants,
} from '../src/core/reducedMotion';
import { createTransitionCSS, transitionEffectToTransitionsList } from '../src/utils';
import type { Effect } from '../src/types';

const slide = {
  effectId: 'slide',
  key: 'target',
  selector: '.item',
  conditions: ['desktop'],
  triggerType: 'alternate' as const,
  keyframeEffect: { name: 'slide', keyframes: [{ translate: '-10px' }, { translate: '0' }] },
  duration: 800,
  delay: 100,
  easing: 'ease-in',
};

const effects: Record<string, Effect> = {
  fade: {
    key: 'elsewhere',
    conditions: ['mobile'],
    reducedMotionPolicy: 'cancel',
    keyframeEffect: { name: '', keyframes: [{ opacity: 0 }, { opacity: 1 }] },
    duration: 300,
  },
  dim: { transition: { duration: 200, styleProperties: [{ name: 'opacity', value: '0.5' }] } },
  scrub: { keyframeEffect: { name: 'scrub', keyframes: [{ opacity: 0 }] } },
};

const { keyframeEffect, duration, delay, easing, ...scrubSlide } = slide;

const options = { effects };

describe('reducedMotion', () => {
  describe('getReducedMotionPolicy', () => {
    it('takes the most specific level', () => {
      expect(getReducedMotionPolicy('cancel', 'ignore', 'fade', 'ignore')).toBe('cancel');
      expect(getReducedMotionPolicy(undefined, 'ignore', 'fade', undefined)).toBe('ignore');
      expect(getReducedMotionPolicy(undefined, undefined, undefined, 'fade')).toBe('fade');
    });

    it('defaults to collapse', () => {
      expect(getReducedMotionPolicy(undefined, undefined, undefined, undefined)).toBe('collapse');
    });
  });

  describe('getReducedMotionVariants', () => {
    it('keeps the effect as is for ignore', () => {
      expect(getReducedMotionVariants(slide, 'ignore', options)).toEqual([slide]);
    });

    it('conditions the effect on no-preference for cancel', () => {
      expect(getReducedMotionVariants(slide, 'cancel', options)).toEqual([
        { ...slide, conditions: ['desktop', NO_PREFERENCE] },
      ]);
    });

    it('collapses the duration only, under reduce', () => {
      const repeating = { ...slide, iterations: 2.5, alternate: true };

      expect(getReducedMotionVariants(repeating, 'collapse', options)).toEqual([
        { ...repeating, conditions: ['desktop', NO_PREFERENCE] },
        { ...repeating, duration: 0, conditions: ['desktop', REDUCE] },
      ]);
    });

    it('collapses every transition duration and keeps the delays', () => {
      const transitionProperties = [
        { name: 'opacity', value: '0', duration: 200, delay: 50 },
        { name: 'color', value: 'red', duration: 300 },
      ];
      const [, collapsed] = getReducedMotionVariants({ transitionProperties }, 'collapse', options);

      expect(collapsed).toEqual({
        transitionProperties: [
          { name: 'opacity', value: '0', duration: 0, delay: 50 },
          { name: 'color', value: 'red', duration: 0 },
        ],
        conditions: [REDUCE],
      });
    });

    it.each([0, Infinity])('falls back to cancel when collapsing %s iterations', (iterations) => {
      const looping = { ...slide, iterations };

      expect(getReducedMotionVariants(looping, 'collapse', options)).toEqual([
        { ...looping, conditions: ['desktop', NO_PREFERENCE] },
      ]);
    });

    it('falls back to cancel when collapsing a scrub effect', () => {
      const scrub = { ...scrubSlide, keyframeEffect };

      expect(getReducedMotionVariants(scrub, 'collapse', options)).toEqual([
        { ...scrub, conditions: ['desktop', NO_PREFERENCE] },
      ]);
    });

    it("replaces the effect's body and keeps its identity and targeting", () => {
      const [, replaced] = getReducedMotionVariants(slide, 'fade', options);

      expect(replaced).toEqual({
        effectId: 'slide',
        key: 'target',
        selector: '.item',
        conditions: ['desktop', REDUCE],
        triggerType: 'alternate',
        keyframeEffect: { name: 'fade', keyframes: [{ opacity: 0 }, { opacity: 1 }] },
        duration: 300,
      });
    });

    it('names an unnamed replacement keyframeEffect by the replacement id without mutating it', () => {
      getReducedMotionVariants(slide, 'fade', options);

      expect((effects.fade as { keyframeEffect: { name: string } }).keyframeEffect.name).toBe('');
    });

    it.each([
      ['an incompatible', 'dim'],
      ['a missing', 'nope'],
    ])('falls back to collapse for %s replacement', (_, policy) => {
      expect(getReducedMotionVariants(slide, policy, options)).toEqual([
        { ...slide, conditions: ['desktop', NO_PREFERENCE] },
        { ...slide, duration: 0, conditions: ['desktop', REDUCE] },
      ]);
    });

    it('accepts a scrub replacement for a scrub effect', () => {
      const scrub = { ...scrubSlide, keyframeEffect };
      const [, replaced] = getReducedMotionVariants(scrub, 'scrub', options);

      expect(replaced).toMatchObject({ keyframeEffect: { name: 'scrub' } });
      expect(replaced).not.toHaveProperty('duration');
    });

    it('splits an ignored effect whose sequence stagger collapses', () => {
      expect(
        getReducedMotionVariants(slide, 'ignore', { ...options, collapsesStagger: true }),
      ).toEqual([
        { ...slide, conditions: ['desktop', NO_PREFERENCE] },
        { ...slide, conditions: ['desktop', REDUCE] },
      ]);
    });

    describe('forced', () => {
      const forced = { ...options, force: true };

      it('keeps the effect for ignore', () => {
        expect(getReducedMotionVariants(slide, 'ignore', forced)).toEqual([slide]);
      });

      it('drops the effect for cancel', () => {
        expect(getReducedMotionVariants(slide, 'cancel', forced)).toEqual([]);
      });

      it('returns the reduced variant only, unconditionally', () => {
        expect(getReducedMotionVariants(slide, 'collapse', forced)).toEqual([
          { ...slide, duration: 0 },
        ]);
      });
    });
  });

  describe('transitions', () => {
    it('keeps a 0ms transition that has a delay', () => {
      expect(
        transitionEffectToTransitionsList({
          transition: {
            duration: 0,
            delay: 100,
            styleProperties: [{ name: 'opacity', value: '0' }],
          },
        }),
      ).toEqual(['opacity 0ms ease 100ms']);
      expect(
        transitionEffectToTransitionsList({
          transitionProperties: [
            { name: 'opacity', value: '0', delay: 100 },
            { name: 'color', value: 'red', duration: 0 },
          ],
        }),
      ).toEqual(['opacity 0ms linear 100ms']);
    });

    it('drops a 0ms transition without a delay', () => {
      expect(
        transitionEffectToTransitionsList({
          transition: { duration: 0, styleProperties: [{ name: 'opacity', value: '0' }] },
        }),
      ).toEqual([]);
    });

    it('renders the runtime transition regardless of the reduced-motion preference', () => {
      const [, transitionRule] = createTransitionCSS({
        key: 'a',
        effectId: 'dim',
        transition: { duration: 200, styleProperties: [{ name: 'opacity', value: '0.5' }] },
      });

      expect(transitionRule).not.toContain('prefers-reduced-motion');
      expect(transitionRule).toContain('transition: opacity 200ms ease');
    });
  });
});
