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
    getScrubScene: vi.fn().mockReturnValue({}),
    getEasing: vi.fn().mockImplementation((v) => v),
    getAnimation: vi.fn().mockImplementation((target, options, trigger, reducedMotion) => {
      return mock.getWebAnimation(target, options, trigger, {
        reducedMotion,
      });
    }),
    registerEffects: vi.fn(),
    getRegisteredEffect: vi.fn(),
    toCSSPropertyName,
  };

  return mock;
});

// Mock kuliso module
vi.mock('kuliso', () => {
  const MockPointer = vi.fn(function (this: any) {
    this.start = vi.fn();
    this.destroy = vi.fn();
  }) as any;
  return { Pointer: MockPointer };
});

// Mock fizban module
vi.mock('fizban', () => {
  const MockScroll = vi.fn(function (this: any) {
    this.start = vi.fn();
    this.end = vi.fn();
  }) as any;
  return { Scroll: MockScroll };
});

// Shared mock MQL storage
let mockMQLs: Map<string, MediaQueryList>;

function mockMatchMedia(matchingQueries: string[] = []) {
  mockMQLs = new Map();

  window.matchMedia = vi.fn((query: string) => {
    const matches = matchingQueries.includes(query);
    const mql = {
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as unknown as MediaQueryList;

    mockMQLs.set(query, mql);
    return mql;
  });
}

describe('Interaction-level conditions in addEffectsForTarget', () => {
  let instance: Interact;

  beforeEach(() => {
    vi.clearAllMocks();
    mockMQLs = new Map();
  });

  afterEach(() => {
    if (instance) {
      instance.destroy();
    }
  });

  describe('when target is added after source', () => {
    it('should skip effect when interaction-level media condition does not match', async () => {
      const { getWebAnimation } = await import('@wix/motion');

      // Mock matchMedia to simulate desktop NOT matching
      mockMatchMedia([]); // Empty array = no conditions match

      const config: InteractConfig = {
        conditions: {
          desktop: {
            type: 'media',
            predicate: '(min-width: 1024px)',
          },
        },
        interactions: [
          {
            trigger: 'click',
            key: 'button',
            // Interaction-level condition (NOT effect-level)
            conditions: ['desktop'],
            effects: [
              {
                key: 'target',
                effectId: 'slide-effect',
              },
            ],
          },
        ],
        effects: {
          'slide-effect': {
            namedEffect: {
              type: 'SlideIn',
              direction: 'right',
              power: 'medium',
            } as NamedEffect,
            duration: 500,
          },
        },
      };

      instance = Interact.create(config);

      const targetElement = document.createElement('div');
      const sourceElement = document.createElement('div');

      // Add source first
      add(sourceElement, 'button');

      // Add target second (this triggers addEffectsForTarget)
      add(targetElement, 'target');

      // Should NOT create animation because interaction condition doesn't match
      expect(getWebAnimation).not.toHaveBeenCalled();
    });

    it('should apply effect when interaction-level media condition matches', async () => {
      const { getWebAnimation } = await import('@wix/motion');

      // Mock matchMedia to simulate desktop matching
      // Note: getMediaQuery wraps predicates in parens, so (min-width: 1024px) becomes ((min-width: 1024px))
      mockMatchMedia(['((min-width: 1024px))']);

      const config: InteractConfig = {
        conditions: {
          desktop: {
            type: 'media',
            predicate: '(min-width: 1024px)',
          },
        },
        interactions: [
          {
            trigger: 'click',
            key: 'button',
            // Interaction-level condition (NOT effect-level)
            conditions: ['desktop'],
            effects: [
              {
                key: 'target',
                effectId: 'slide-effect',
              },
            ],
          },
        ],
        effects: {
          'slide-effect': {
            namedEffect: {
              type: 'SlideIn',
              direction: 'right',
              power: 'medium',
            } as NamedEffect,
            duration: 500,
          },
        },
      };

      instance = Interact.create(config);

      const targetElement = document.createElement('div');
      const sourceElement = document.createElement('div');

      // Add source first
      add(sourceElement, 'button');

      // Add target second (this triggers addEffectsForTarget)
      add(targetElement, 'target');

      // Should create animation because interaction condition matches
      expect(getWebAnimation).toHaveBeenCalledTimes(1);
      expect(getWebAnimation).toHaveBeenCalledWith(
        targetElement,
        expect.objectContaining({
          namedEffect: expect.objectContaining({
            type: 'SlideIn',
            direction: 'right',
          }),
        }),
        undefined,
        { reducedMotion: undefined },
      );
    });

    it('should only apply effect when interaction-level media condition matches', async () => {
      const { getWebAnimation } = await import('@wix/motion');

      // Only mobile matches
      // Note: getMediaQuery wraps predicates in parens
      mockMatchMedia(['((max-width: 767px))']);

      const config: InteractConfig = {
        conditions: {
          desktop: {
            type: 'media',
            predicate: '(min-width: 1024px)',
          },
          mobile: {
            type: 'media',
            predicate: '(max-width: 767px)',
          },
        },
        interactions: [
          {
            trigger: 'click',
            key: 'button',
            conditions: ['desktop'],
            effects: [
              {
                key: 'target',
                effectId: 'desktop-effect',
              },
            ],
          },
          {
            trigger: 'click',
            key: 'button',
            conditions: ['mobile'],
            effects: [
              {
                key: 'target',
                effectId: 'mobile-effect',
              },
            ],
          },
        ],
        effects: {
          'desktop-effect': {
            namedEffect: {
              type: 'SlideIn',
              direction: 'right',
              power: 'medium',
            } as NamedEffect,
            duration: 500,
          },
          'mobile-effect': {
            namedEffect: {
              type: 'BounceIn',
              direction: 'center',
              power: 'hard',
            } as NamedEffect,
            duration: 300,
          },
        },
      };

      instance = Interact.create(config);

      const targetElement = document.createElement('div');
      const sourceElement = document.createElement('div');

      // Add source first
      add(sourceElement, 'button');

      // Add target second (this triggers addEffectsForTarget)
      add(targetElement, 'target');

      // Should only create mobile animation
      expect(getWebAnimation).toHaveBeenCalledTimes(1);
      expect(getWebAnimation).toHaveBeenCalledWith(
        targetElement,
        expect.objectContaining({
          namedEffect: expect.objectContaining({
            type: 'BounceIn',
            direction: 'center',
          }),
        }),
        undefined,
        { reducedMotion: undefined },
      );
    });

    it('should apply effect when interaction has no conditions', async () => {
      const { getWebAnimation } = await import('@wix/motion');

      mockMatchMedia([]);

      const config: InteractConfig = {
        interactions: [
          {
            trigger: 'click',
            key: 'button',
            // No conditions on interaction
            effects: [
              {
                key: 'target',
                effectId: 'default-effect',
              },
            ],
          },
        ],
        effects: {
          'default-effect': {
            namedEffect: {
              type: 'FadeIn',
              power: 'medium',
            } as NamedEffect,
            duration: 400,
          },
        },
      };

      instance = Interact.create(config);

      const targetElement = document.createElement('div');
      const sourceElement = document.createElement('div');

      // Add source first
      add(sourceElement, 'button');

      // Add target second
      add(targetElement, 'target');

      // Should create animation because no conditions to check
      expect(getWebAnimation).toHaveBeenCalledTimes(1);
      expect(getWebAnimation).toHaveBeenCalledWith(
        targetElement,
        expect.objectContaining({
          namedEffect: expect.objectContaining({
            type: 'FadeIn',
          }),
        }),
        undefined,
        { reducedMotion: undefined },
      );
    });

    it('should skip effect with non-matching interaction conditions on the trigger', async () => {
      const { getWebAnimation } = await import('@wix/motion');

      // Only tablet matches
      mockMatchMedia(['((min-width: 768px) and (max-width: 1023px))']);

      const config: InteractConfig = {
        conditions: {
          desktop: {
            type: 'media',
            predicate: '(min-width: 1024px)',
          },
          tablet: {
            type: 'media',
            predicate: '(min-width: 768px) and (max-width: 1023px)',
          },
        },
        interactions: [
          {
            trigger: 'click',
            key: 'button',
            conditions: ['desktop'], // Interaction-level: won't match
            effects: [
              {
                key: 'target',
                effectId: 'effect-with-tablet',
                conditions: ['tablet'], // Effect-level: would match, but interaction doesn't
              },
            ],
          },
        ],
        effects: {
          'effect-with-tablet': {
            namedEffect: {
              type: 'SlideIn',
              direction: 'right',
              power: 'medium',
            } as NamedEffect,
            duration: 500,
          },
        },
      };

      instance = Interact.create(config);

      const targetElement = document.createElement('div');
      const sourceElement = document.createElement('div');

      // Add source first
      add(sourceElement, 'button');

      // Add target second
      add(targetElement, 'target');

      // Should NOT create animation because interaction-level condition doesn't match
      // (even though effect-level condition would match)
      expect(getWebAnimation).not.toHaveBeenCalled();
    });
  });
});

describe('reducedMotionHandling at runtime', () => {
  const REDUCE = '(prefers-reduced-motion: reduce)';
  const NO_PREFERENCE = '(prefers-reduced-motion: no-preference)';
  let instance: Interact;

  const slide = {
    namedEffect: { type: 'SlideIn', direction: 'right', power: 'medium' } as NamedEffect,
    duration: 500,
    delay: 100,
  };

  const createConfig = (reducedMotionHandling: string): InteractConfig => ({
    effects: {
      fade: { namedEffect: { type: 'FadeIn' } as NamedEffect, duration: 300 },
    },
    interactions: [
      {
        trigger: 'click',
        key: 'button',
        effects: [{ ...slide, reducedMotionHandling }],
      },
    ],
  });

  const addButton = () => {
    const element = document.createElement('div');
    add(element, 'button');
    return element;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    instance?.destroy();
  });

  it('plays the effect as is when motion is not reduced', async () => {
    const { getWebAnimation } = await import('@wix/motion');
    mockMatchMedia([NO_PREFERENCE]);
    instance = Interact.create(createConfig('collapse'));

    addButton();

    expect(getWebAnimation).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ duration: 500, delay: 100 }),
      undefined,
      expect.anything(),
    );
  });

  it('plays the collapsed effect when motion is reduced', async () => {
    const { getWebAnimation } = await import('@wix/motion');
    mockMatchMedia([REDUCE]);
    instance = Interact.create(createConfig('collapse'));

    addButton();

    expect(getWebAnimation).toHaveBeenCalledTimes(1);
    expect(getWebAnimation).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ duration: 0, delay: 100, namedEffect: slide.namedEffect }),
      undefined,
      expect.anything(),
    );
  });

  it('plays the replacement when motion is reduced', async () => {
    const { getWebAnimation } = await import('@wix/motion');
    mockMatchMedia([REDUCE]);
    instance = Interact.create(createConfig('fade'));

    addButton();

    const [, options] = vi.mocked(getWebAnimation).mock.calls[0];
    expect(options).toMatchObject({ duration: 300, namedEffect: { type: 'FadeIn' } });
    expect(options).not.toHaveProperty('delay');
  });

  it('skips a cancelled effect when motion is reduced', async () => {
    const { getWebAnimation } = await import('@wix/motion');
    mockMatchMedia([REDUCE]);
    instance = Interact.create(createConfig('cancel'));

    addButton();

    expect(getWebAnimation).not.toHaveBeenCalled();
  });

  it('listens on the media of every variant', () => {
    mockMatchMedia([NO_PREFERENCE]);
    instance = Interact.create(createConfig('collapse'));

    addButton();

    [REDUCE, NO_PREFERENCE].forEach((query) =>
      expect(mockMQLs.get(query)!.addEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function),
      ),
    );
  });

  it('lets an earlier variation win when the effect is cancelled', async () => {
    const { getWebAnimation } = await import('@wix/motion');
    mockMatchMedia([REDUCE]);
    instance = Interact.create({
      effects: {},
      interactions: [
        {
          trigger: 'click',
          key: 'button',
          effects: [
            { key: 'target', ...slide, duration: 200 },
            { key: 'target', ...slide, reducedMotionHandling: 'cancel' },
          ],
        },
      ],
    });

    add(document.createElement('div'), 'target');
    addButton();

    expect(getWebAnimation).toHaveBeenCalledTimes(1);
    expect(getWebAnimation).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ duration: 200 }),
      undefined,
      expect.anything(),
    );
  });

  describe('forced', () => {
    afterEach(() => {
      Interact.forceReducedMotion = false;
    });

    it('plays the reduced outcome regardless of the media', async () => {
      const { getWebAnimation } = await import('@wix/motion');
      mockMatchMedia([NO_PREFERENCE]);
      Interact.forceReducedMotion = true;
      instance = Interact.create(createConfig('collapse'));

      addButton();

      expect(getWebAnimation).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ duration: 0 }),
        undefined,
        expect.anything(),
      );
    });

    it('skips a cancelled effect regardless of the media', async () => {
      const { getWebAnimation } = await import('@wix/motion');
      mockMatchMedia([NO_PREFERENCE]);
      Interact.forceReducedMotion = true;
      instance = Interact.create(createConfig('cancel'));

      addButton();

      expect(getWebAnimation).not.toHaveBeenCalled();
    });
  });
});
