import { afterEach, describe, expect, it, vi } from 'vitest';
import { Interact, add } from '../src/index';
import type { InteractConfig } from '../src/types';
import type { NamedEffect } from '@wix/motion';

// Mock @wix/motion module
vi.mock('@wix/motion', async () => {
  const { toCSSPropertyName } = await vi.importActual<typeof import('@wix/motion')>('@wix/motion');
  const mock: any = {
    getWebAnimation: vi.fn().mockReturnValue({
      play: vi.fn(),
      cancel: vi.fn(),
      onFinish: vi.fn(),
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
    registerEffects: vi.fn(),
    toCSSPropertyName,
  };

  return mock;
});

const REDUCE_QUERY = '(prefers-reduced-motion: reduce)';

function mockMatchMedia(matches: boolean | undefined) {
  const mql = {
    matches,
    media: REDUCE_QUERY,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  } as unknown as MediaQueryList;
  const matchMedia = matches === undefined ? undefined : vi.fn().mockReturnValue(mql);

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: matchMedia,
  });

  return matchMedia!;
}

describe('reduced motion', () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    Interact.forceReducedMotion = undefined;
    Interact.destroy();
    vi.clearAllMocks();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: originalMatchMedia,
    });
  });

  describe('resolution', () => {
    it('should detect the client preference when no override is set', () => {
      const matchMedia = mockMatchMedia(true);

      expect(Interact.reducedMotion).toBe(true);
      expect(matchMedia).toHaveBeenCalledWith(REDUCE_QUERY);
    });

    it('should resolve to false when the client does not prefer reduced motion', () => {
      mockMatchMedia(false);

      expect(Interact.reducedMotion).toBe(false);
    });

    it('should let an explicit false override a matching client preference', () => {
      mockMatchMedia(true);
      Interact.forceReducedMotion = false;

      expect(Interact.reducedMotion).toBe(false);
    });

    it('should let an explicit true override a non-matching client preference', () => {
      const matchMedia = mockMatchMedia(false);
      Interact.forceReducedMotion = true;

      expect(Interact.reducedMotion).toBe(true);
      expect(matchMedia).not.toHaveBeenCalled();
    });

    it('should resolve to false without throwing when matchMedia is unavailable', () => {
      mockMatchMedia(undefined);

      expect(() => Interact.reducedMotion).not.toThrow();
      expect(Interact.reducedMotion).toBe(false);
    });

    it('should cache the MediaQueryList across reads', () => {
      const matchMedia = mockMatchMedia(true);

      expect(Interact.reducedMotion).toBe(true);
      expect(Interact.reducedMotion).toBe(true);
      expect(Interact.reducedMotion).toBe(true);

      expect(matchMedia).toHaveBeenCalledTimes(1);
    });

    it('should drop the cached MediaQueryList on destroy', () => {
      mockMatchMedia(true);
      expect(Interact.reducedMotion).toBe(true);

      Interact.destroy();
      mockMatchMedia(false);

      expect(Interact.reducedMotion).toBe(false);
    });
  });

  describe('handlers', () => {
    const config: InteractConfig = {
      interactions: [
        {
          trigger: 'hover',
          key: 'logo-hover',
          effects: [{ key: 'logo-hover', effectId: 'logo-arc-in' }],
        },
      ],
      effects: {
        'logo-arc-in': {
          namedEffect: { type: 'ArcIn', direction: 'right', power: 'medium' } as NamedEffect,
          duration: 1200,
        },
      },
    };

    it('should pass the detected preference to the animation layer', async () => {
      const { getWebAnimation } = await import('@wix/motion');
      mockMatchMedia(true);
      Interact.create(config);

      const element = document.createElement('div');
      add(element, 'logo-hover');

      expect(getWebAnimation).toHaveBeenCalledWith(element, expect.any(Object), undefined, {
        reducedMotion: true,
      });
    });
  });
});
