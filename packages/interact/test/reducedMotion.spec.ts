import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Interact, add } from '../src/index';
import type { InteractConfig } from '../src/types';
import type { NamedEffect } from '@wix/motion';

// Mock @wix/motion module
vi.mock('@wix/motion', () => {
  const mock: any = {
    getWebAnimation: vi.fn().mockReturnValue({
      play: vi.fn(),
      cancel: vi.fn(),
      onFinish: vi.fn(),
      onAbort: vi.fn(),
      pause: vi.fn(),
      reverse: vi.fn(),
      progress: vi.fn(),
      persist: vi.fn(),
      isCSS: false,
      playState: 'idle',
      ready: Promise.resolve(),
    }),
    getElementCSSAnimation: vi.fn().mockReturnValue(null),
    prepareAnimation: vi.fn(),
    getScrubScene: vi.fn().mockReturnValue({}),
    getEasing: vi.fn().mockImplementation((v) => v),
    getAnimation: vi.fn().mockImplementation((target, options, trigger, reducedMotion) => {
      return mock.getWebAnimation(target, options, trigger, { reducedMotion });
    }),
    getCSSAnimation: vi.fn().mockReturnValue([]),
    registerEffects: vi.fn(),
    getSequence: vi.fn(),
    createAnimationGroups: vi.fn().mockReturnValue([]),
    Sequence: class {},
  };

  return mock;
});

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

describe('reduced motion detection', () => {
  let originalMatchMedia: typeof window.matchMedia;

  function mockMatchMedia(matchingQueries: string[] = []) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation(
        (query: string) =>
          ({
            matches: matchingQueries.includes(query),
            media: query,
            onchange: null,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
          }) as unknown as MediaQueryList,
      ),
    });
  }

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
    mockMatchMedia();
  });

  afterEach(() => {
    vi.clearAllMocks();
    Interact.destroy();
    Interact.forceReducedMotion = undefined;
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: originalMatchMedia,
    });
  });

  describe('Interact.forceReducedMotion', () => {
    it('should be detected from the browser when not set explicitly', () => {
      mockMatchMedia([REDUCED_MOTION_QUERY]);

      expect(Interact.forceReducedMotion).toBe(true);
    });

    it('should be false when the browser has no reduced-motion preference', () => {
      expect(Interact.forceReducedMotion).toBe(false);
    });

    it('should prefer an explicit true over a no-preference browser setting', () => {
      Interact.forceReducedMotion = true;

      expect(Interact.forceReducedMotion).toBe(true);
    });

    it('should prefer an explicit false over a reduce browser setting', () => {
      mockMatchMedia([REDUCED_MOTION_QUERY]);
      Interact.forceReducedMotion = false;

      expect(Interact.forceReducedMotion).toBe(false);
    });

    it('should go back to browser detection when reset to undefined', () => {
      mockMatchMedia([REDUCED_MOTION_QUERY]);
      Interact.forceReducedMotion = false;
      expect(Interact.forceReducedMotion).toBe(false);

      Interact.forceReducedMotion = undefined;

      expect(Interact.forceReducedMotion).toBe(true);
    });

    it('should pick up a preference that changes after the first read', () => {
      expect(Interact.forceReducedMotion).toBe(false);

      mockMatchMedia([REDUCED_MOTION_QUERY]);

      expect(Interact.forceReducedMotion).toBe(true);
    });

    it('should not throw when matchMedia is unavailable', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: undefined,
      });

      expect(() => Interact.forceReducedMotion).not.toThrow();
      expect(Interact.forceReducedMotion).toBe(false);
    });
  });

  describe('handlers', () => {
    function createHoverInteraction(): InteractConfig {
      return {
        interactions: [
          {
            trigger: 'hover',
            key: 'logo-hover',
            effects: [{ key: 'logo-hover', effectId: 'logo-arc-in' }],
          },
        ],
        effects: {
          'logo-arc-in': {
            namedEffect: {
              type: 'ArcIn',
              direction: 'right',
              power: 'medium',
            } as NamedEffect,
            duration: 1200,
          },
        },
      };
    }

    it('should pass reducedMotion=true to getWebAnimation when the browser prefers reduced motion', async () => {
      const { getWebAnimation } = await import('@wix/motion');
      mockMatchMedia([REDUCED_MOTION_QUERY]);

      Interact.create(createHoverInteraction());

      const element = document.createElement('div');
      add(element, 'logo-hover');

      expect(getWebAnimation).toHaveBeenCalledWith(element, expect.any(Object), undefined, {
        reducedMotion: true,
      });
    });

    it('should pass reducedMotion=false when the browser has no preference', async () => {
      const { getWebAnimation } = await import('@wix/motion');

      Interact.create(createHoverInteraction());

      const element = document.createElement('div');
      add(element, 'logo-hover');

      expect(getWebAnimation).toHaveBeenCalledWith(element, expect.any(Object), undefined, {
        reducedMotion: false,
      });
    });

    it('should skip viewProgress effects when the browser prefers reduced motion', async () => {
      const { getAnimation } = await import('@wix/motion');
      mockMatchMedia([REDUCED_MOTION_QUERY]);

      Interact.create({
        interactions: [
          {
            trigger: 'viewProgress',
            key: 'logo-scroll',
            effects: [
              {
                key: 'logo-scroll',
                effectId: 'parallax',
                keyframeEffect: {
                  name: 'parallax',
                  keyframes: [{ opacity: '0' }, { opacity: '1' }],
                },
              },
            ],
          },
        ],
        effects: {},
      });

      const element = document.createElement('div');
      add(element, 'logo-scroll');

      expect(getAnimation).not.toHaveBeenCalled();
    });
  });
});
