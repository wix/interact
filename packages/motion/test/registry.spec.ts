import { describe, expect, test, vi } from 'vitest';
import { registerEffects, getRegisteredEffect } from '../src/api/registry';
import { getNamedEffect } from '../src/api/common';
import type {
  AnimationOptions,
  AnimationEffectAPI,
  TimeAnimationOptions,
  AnimationExtraOptions,
} from '../src/types';
// import { FadeIn, SlideIn, FadeScroll } from '@wix/motion-presets';
import type { ScrubAnimationOptions } from '../src/types';

// Mock fastdom
vi.mock('fastdom', () => ({
  default: {
    measure: vi.fn((fn) => fn()),
    mutate: vi.fn((fn) => fn()),
  },
}));

const FadeIn = {
  style: vi.fn((options: AnimationOptions) => [
    {
      ...options,
      name: 'fade-in',
      keyframes: [{ opacity: 0 }, { opacity: 1 }],
    },
  ]),
  web: vi.fn((options: AnimationOptions) => [
    {
      ...options,
      name: 'fade-in',
      keyframes: [{ opacity: 0 }, { opacity: 1 }],
    },
  ]),
  getNames: vi.fn(() => ['fade-in']),
};

const SlideIn = {
  style: vi.fn((options: AnimationOptions) => [
    {
      ...options,
      name: 'slide-in',
      keyframes: [{ transform: 'translateY(-100%)' }, { transform: 'translateY(0)' }],
    },
  ]),
  web: vi.fn((options: AnimationOptions) => [
    {
      ...options,
      name: 'slide-in',
      keyframes: [{ transform: 'translateY(-100%)' }, { transform: 'translateY(0)' }],
    },
  ]),
  getNames: vi.fn(() => ['slide-in']),
};

const FadeScroll = {
  style: vi.fn((options: AnimationOptions) => [
    {
      ...options,
      name: 'fade-scroll',
      keyframes: [{ opacity: 1 }, { opacity: 0 }],
    },
  ]),
  web: vi.fn((options: AnimationOptions) => [
    {
      ...options,
      name: 'fade-scroll',
      keyframes: [{ opacity: 1 }, { opacity: 0 }],
    },
  ]),
  getNames: vi.fn(() => ['fade-scroll']),
};

describe('Registry Flow', () => {
  describe('registerEffects', () => {
    test('should register effects and retrieve them', () => {
      registerEffects({ FadeIn, SlideIn });

      const retrievedFadeIn = getRegisteredEffect('FadeIn' as any);
      const retrievedSlideIn = getRegisteredEffect('SlideIn' as any);

      expect(retrievedFadeIn).toBe(FadeIn);
      expect(retrievedSlideIn).toBe(SlideIn);
    });

    test('should return null for unregistered effects', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = getRegisteredEffect('NonExistent' as any);

      expect(result).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('NonExistent not found in registry'),
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('getNamedEffect', () => {
    test('should return registered effect for namedEffect animation', () => {
      registerEffects({ FadeIn });

      const animationOptions: AnimationOptions = {
        namedEffect: { type: 'FadeIn', id: 'fade' },
        duration: 1000,
      };

      const result = getNamedEffect(animationOptions);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('web');
      expect(result).toHaveProperty('style');
      expect(result).toHaveProperty('getNames');
    });

    test('should return function for customEffect', () => {
      const animationOptions: AnimationOptions = {
        customEffect: {
          ranges: [{ name: 'opacity', min: 0, max: 1 }],
        },
        duration: 1000,
      };

      const result = getNamedEffect(animationOptions);

      expect(result).toBeDefined();
      expect(typeof result).toBe('function');
    });

    test('should return null for unregistered named effect', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const animationOptions: AnimationOptions = {
        namedEffect: { type: 'UnregisteredEffect' as any, id: 'unknown' },
        duration: 1000,
      };

      const result = getNamedEffect(animationOptions);

      expect(result).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });
  });

  describe('registerEffects -> getNamedEffect integration', () => {
    test('should register and use FadeIn', () => {
      registerEffects({ FadeIn });

      const animationOptions: AnimationOptions = {
        namedEffect: { type: 'FadeIn', id: 'fade-1' },
        duration: 500,
      };

      const effect = getNamedEffect(animationOptions);

      expect(effect).toBeDefined();
      expect(effect).toHaveProperty('web');
      expect(effect).toHaveProperty('style');
      expect(effect).toHaveProperty('getNames');
    });

    test('should register and use FadeScroll', () => {
      registerEffects({ FadeScroll });

      const animationOptions: AnimationOptions = {
        namedEffect: {
          type: 'FadeScroll',
          id: 'scroll-1',
          range: 'in',
          opacity: 0,
        },
      };

      const effect = getNamedEffect(animationOptions) as AnimationEffectAPI<'scrub'>;

      expect(effect).toBeDefined();
      expect(effect).toHaveProperty('web');
      expect(effect).toHaveProperty('style');
      expect(effect).toHaveProperty('getNames');

      const animationData = effect.web(animationOptions as ScrubAnimationOptions);

      expect(animationData).toHaveLength(1);
      expect(animationData[0].keyframes).toBeDefined();
    });

    test('should register multiple effects at once', () => {
      registerEffects({ FadeIn, FadeScroll });

      const fadeOptions: AnimationOptions = {
        namedEffect: { type: 'FadeIn', id: 'f1' },
      };

      const scrollOptions: AnimationOptions = {
        namedEffect: { type: 'FadeScroll', id: 'sc1', range: 'in', opacity: 0 },
      };

      const fadeEffect = getNamedEffect(fadeOptions) as AnimationEffectAPI<'time'>;
      const scrollEffect = getNamedEffect(scrollOptions) as AnimationEffectAPI<'scrub'>;

      expect(fadeEffect).toBeDefined();
      expect(scrollEffect).toBeDefined();

      const fadeData = fadeEffect.web(fadeOptions as TimeAnimationOptions & AnimationExtraOptions);
      const scrollData = scrollEffect.web(scrollOptions as ScrubAnimationOptions);

      expect(fadeData).toHaveLength(1);
      expect(fadeData[0].keyframes).toBeDefined();

      expect(scrollData).toHaveLength(1);
      expect(scrollData[0].keyframes).toBeDefined();
    });
  });
});
