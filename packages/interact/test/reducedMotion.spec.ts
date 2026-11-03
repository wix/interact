import { describe, expect, it, vi } from 'vitest';
import {
  REDUCED_MOTION_NO_PREFERENCE as NO_PREFERENCE,
  REDUCED_MOTION_REDUCE as REDUCE,
  getEffectKind,
  getReducedMotionHandling,
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
    reducedMotionHandling: 'cancel',
    keyframeEffect: { name: '', keyframes: [{ opacity: 0 }, { opacity: 1 }] },
    duration: 300,
  },
  dim: { transition: { duration: 200, styleProperties: [{ name: 'opacity', value: '0.5' }] } },
  scrub: { keyframeEffect: { name: 'scrub', keyframes: [{ opacity: 0 }] } },
};

const options = { kind: 'time' as const, effects };

describe('reducedMotion', () => {
  describe('getReducedMotionHandling', () => {
    it('takes the most specific level', () => {
      expect(
        getReducedMotionHandling(
          { reducedMotionHandling: 'cancel' },
          { reducedMotionHandling: 'collapse' },
          { reducedMotionHandling: 'fade' },
          { reducedMotionHandling: 'collapse' },
        ),
      ).toBe('cancel');
      expect(
        getReducedMotionHandling(
          {},
          { reducedMotionHandling: 'collapse' },
          { reducedMotionHandling: 'fade' },
          undefined,
        ),
      ).toBe('collapse');
      expect(getReducedMotionHandling({}, undefined, {}, { reducedMotionHandling: 'fade' })).toBe(
        'fade',
      );
    });

    it('defaults to ignore', () => {
      expect(getReducedMotionHandling({}, undefined, {}, {})).toBe('ignore');
    });
  });

  describe('getEffectKind', () => {
    it('is state for transitions, scrub for scrub triggers and time otherwise', () => {
      expect(getEffectKind(effects.dim, 'viewProgress')).toBe('state');
      expect(getEffectKind(slide, 'viewProgress')).toBe('scrub');
      expect(getEffectKind(slide, 'pointerMove')).toBe('scrub');
      expect(getEffectKind(slide, 'hover')).toBe('time');
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
      expect(getReducedMotionVariants(slide, 'collapse', options)).toEqual([
        { ...slide, conditions: ['desktop', NO_PREFERENCE] },
        { ...slide, duration: 0, conditions: ['desktop', REDUCE] },
      ]);
    });

    it('collapses every transition duration and keeps the delays', () => {
      const transitionProperties = [
        { name: 'opacity', value: '0', duration: 200, delay: 50 },
        { name: 'color', value: 'red', duration: 300 },
      ];
      const [, collapsed] = getReducedMotionVariants({ transitionProperties }, 'collapse', {
        ...options,
        kind: 'state',
      });

      expect(collapsed).toEqual({
        transitionProperties: [
          { name: 'opacity', value: '0', duration: 0, delay: 50 },
          { name: 'color', value: 'red', duration: 0 },
        ],
        conditions: [REDUCE],
      });
    });

    it.each([0, Infinity])('falls back to cancel when collapsing %s iterations', (iterations) => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const looping = { ...slide, effectId: `loop-${iterations}`, iterations };

      expect(getReducedMotionVariants(looping, 'collapse', { ...options, warn: true })).toEqual([
        { ...looping, conditions: ['desktop', NO_PREFERENCE] },
      ]);
      expect(warn).toHaveBeenCalledTimes(1);
      warn.mockRestore();
    });

    it('falls back to cancel when collapsing a scrub effect', () => {
      expect(getReducedMotionVariants(slide, 'collapse', { ...options, kind: 'scrub' })).toEqual([
        { ...slide, conditions: ['desktop', NO_PREFERENCE] },
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
    ])('falls back to collapse for %s replacement', (_, handling) => {
      expect(getReducedMotionVariants(slide, handling, options)).toEqual([
        { ...slide, conditions: ['desktop', NO_PREFERENCE] },
        { ...slide, duration: 0, conditions: ['desktop', REDUCE] },
      ]);
    });

    it('accepts a scrub replacement for a scrub effect', () => {
      const [, replaced] = getReducedMotionVariants(slide, 'scrub', { ...options, kind: 'scrub' });

      expect(replaced).toMatchObject({ keyframeEffect: { name: 'scrub' } });
      expect(replaced).not.toHaveProperty('duration');
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
