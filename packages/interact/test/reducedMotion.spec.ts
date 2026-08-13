import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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

  describe('reactivity', () => {
    beforeEach(() => {
      (window as any).IntersectionObserver ??= class {
        observe() {}
        unobserve() {}
        disconnect() {}
      };
    });

    it('should call update() for viewProgress on preference change, not for viewEnter + once', () => {
      const mql = {
        matches: true,
        media: REDUCE_QUERY,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      } as unknown as MediaQueryList;
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: vi.fn().mockReturnValue(mql),
      });

      const vpConfig: InteractConfig = {
        interactions: [
          {
            trigger: 'viewProgress',
            key: 'vp-key',
            effects: [{ key: 'vp-key', effectId: 'vp-fx' }],
          },
        ],
        effects: { 'vp-fx': { namedEffect: { type: 'FadeIn' } as NamedEffect, duration: 300 } },
      };
      const veConfig: InteractConfig = {
        interactions: [
          { trigger: 'viewEnter', key: 've-key', effects: [{ key: 've-key', effectId: 've-fx' }] },
        ],
        effects: { 've-fx': { namedEffect: { type: 'FadeIn' } as NamedEffect, duration: 300 } },
      };

      const vpInstance = Interact.create(vpConfig);
      const veInstance = Interact.create(veConfig);

      add(document.createElement('div'), 'vp-key');
      add(document.createElement('div'), 've-key');

      expect(vpInstance.mediaQueryListeners.size).toBe(1);
      expect(veInstance.mediaQueryListeners.size).toBe(0);

      const vpController = Interact.controllerCache.get('vp-key')!;
      const vpUpdateSpy = vi.spyOn(vpController, 'update').mockImplementation(() => {});

      const [[, changeHandler]] = (mql.addEventListener as any).mock.calls;
      changeHandler({} as any);

      expect(vpUpdateSpy).toHaveBeenCalledTimes(1);
    });

    it('should not register a prefers-reduced-motion listener when forceReducedMotion is set', () => {
      Interact.forceReducedMotion = true;
      const mql = {
        matches: true,
        media: REDUCE_QUERY,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      } as unknown as MediaQueryList;
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: vi.fn().mockReturnValue(mql),
      });

      const config: InteractConfig = {
        interactions: [
          {
            trigger: 'viewProgress',
            key: 'vp-key',
            effects: [{ key: 'vp-key', effectId: 'vp-fx' }],
          },
        ],
        effects: { 'vp-fx': { namedEffect: { type: 'FadeIn' } as NamedEffect, duration: 300 } },
      };

      const instance = Interact.create(config);
      add(document.createElement('div'), 'vp-key');

      expect(instance.mediaQueryListeners.size).toBe(0);
    });

    it('should remove the prefers-reduced-motion listener on destroy', () => {
      const mql = {
        matches: true,
        media: REDUCE_QUERY,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      } as unknown as MediaQueryList;
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: vi.fn().mockReturnValue(mql),
      });

      const config: InteractConfig = {
        interactions: [
          {
            trigger: 'viewProgress',
            key: 'vp-key',
            effects: [{ key: 'vp-key', effectId: 'vp-fx' }],
          },
        ],
        effects: { 'vp-fx': { namedEffect: { type: 'FadeIn' } as NamedEffect, duration: 300 } },
      };

      const instance = Interact.create(config);
      add(document.createElement('div'), 'vp-key');

      expect(mql.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
      expect(instance.mediaQueryListeners.size).toBe(1);

      instance.destroy();

      expect(mql.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
      expect(instance.mediaQueryListeners.size).toBe(0);
    });

    // The reduced-motion listener is only ever registered on the *source* key, since `add()` reads
    // `triggers`. Both connect orderings must therefore rebind a cross-key scrub from the source:
    // 'target first' attaches via the source's `_addInteraction`, 'source first' via the target's
    // `addEffectsForTarget` — and only the former is the obvious case.
    it.each([
      ['target first', true],
      ['source first', false],
    ])(
      'should re-attach a cross-key scrub handler when the source rebinds (%s)',
      async (_label, targetFirst) => {
        const { getAnimation } = await import('@wix/motion');
        // take the ViewTimeline branch of addViewProgressHandler, which is fully mocked
        (window as any).ViewTimeline ??= class {};

        // `matches: false` so the handler actually attaches — this is about whether the rebind
        // reaches a cross-key target, not about the flag suppressing anything
        const mql = {
          matches: false,
          media: REDUCE_QUERY,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        } as unknown as MediaQueryList;
        Object.defineProperty(window, 'matchMedia', {
          writable: true,
          configurable: true,
          value: vi.fn().mockReturnValue(mql),
        });

        const config: InteractConfig = {
          interactions: [
            {
              trigger: 'viewProgress',
              key: 'src-key',
              effects: [{ key: 'tgt-key', effectId: 'vp-fx' }],
            },
          ],
          effects: { 'vp-fx': { namedEffect: { type: 'FadeIn' } as NamedEffect, duration: 300 } },
        };

        const instance = Interact.create(config);
        const targetEl = document.createElement('div');
        const sourceEl = document.createElement('div');

        if (targetFirst) {
          add(targetEl, 'tgt-key');
          add(sourceEl, 'src-key');
        } else {
          add(sourceEl, 'src-key');
          add(targetEl, 'tgt-key');
        }

        // the listener lives on the source key only — a target-only key has no `triggers` entry
        const listenerIds = () => [...instance.mediaQueryListeners.keys()];
        expect(listenerIds()).toContain('src-key::reducedMotion');
        expect(listenerIds()).not.toContain('tgt-key::reducedMotion');

        const attachCount = () =>
          (getAnimation as any).mock.calls.filter((args: unknown[]) => args[0] === targetEl).length;

        expect(attachCount()).toBe(1);

        const { handler } = instance.mediaQueryListeners.get('src-key::reducedMotion')!;
        vi.clearAllMocks();
        handler();

        // exactly once: the rebind reaches the cross-key target, and does not double-attach
        expect(attachCount()).toBe(1);
        expect(listenerIds()).toContain('src-key::reducedMotion');
      },
    );
  });
});
