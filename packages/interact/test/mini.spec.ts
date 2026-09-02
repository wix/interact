import type { MockInstance } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Interact, add, remove } from '../src/index';
import { addListItems } from '../src/core/add';
import type { InteractConfig, ScrubEffect, TriggerType, IInteractElement } from '../src/types';
import type { NamedEffect } from '@wix/motion';
import { effectToAnimationOptions } from '../src/handlers/utilities';
import TRIGGER_TO_HANDLER_MODULE_MAP from '../src/handlers';

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
      return mock.getWebAnimation(target, options, trigger, {
        reducedMotion,
      });
    }),
    registerEffects: vi.fn(),
    toCSSPropertyName,
  };

  return mock;
});

// Mock kuliso module
vi.mock('kuliso', () => ({
  Pointer: vi.fn().mockImplementation(() => ({
    start: vi.fn(),
    destroy: vi.fn(),
  })),
}));

// Mock fizban module
vi.mock('fizban', () => ({
  Scroll: vi.fn().mockImplementation(() => ({
    start: vi.fn(),
    end: vi.fn(),
  })),
}));

// Shared mock MQL storage for breakpoint tests
let mockMQLs: Map<string, MediaQueryList>;

describe('interact (mini)', () => {
  let element: HTMLElement;
  let mockConfig: InteractConfig;
  const getMockConfig: () => InteractConfig = () => ({
    interactions: [
      {
        trigger: 'viewEnter',
        key: 'logo-entrance',
        params: {
          threshold: 0.2,
        },
        effects: [
          {
            key: 'logo-entrance',
            effectId: 'logo-arc-in',
          },
          {
            key: 'logo-click',
            effectId: 'logo-bounce',
          },
        ],
      },
      {
        trigger: 'viewEnter',
        key: 'logo-loop',
        effects: [
          {
            key: 'logo-loop',
            triggerType: 'state',
            effectId: 'logo-poke',
          },
        ],
      },
      {
        trigger: 'animationEnd',
        key: 'logo-animation-end',
        params: {
          effectId: 'logo-arc-in',
        },
        effects: [
          {
            key: 'logo-animation-end',
            effectId: 'logo-poke',
          },
        ],
      },
      {
        trigger: 'pointerMove',
        key: 'logo-mouse',
        params: {
          hitArea: 'root',
        },
        effects: [
          {
            key: 'logo-mouse',
            effectId: 'logo-track-mouse',
          },
        ],
      },
      {
        trigger: 'click',
        key: 'logo-click',
        effects: [
          {
            key: 'logo-click',
            effectId: 'logo-bounce',
            triggerType: 'alternate',
          },
        ],
      },
      {
        trigger: 'click',
        key: 'logo-click',
        effects: [
          {
            key: 'logo-click',
            effectId: 'logo-transition-hover',
            stateAction: 'toggle',
          },
        ],
      },
      {
        trigger: 'hover',
        key: 'logo-hover',
        effects: [
          {
            key: 'logo-hover',
            effectId: 'logo-arc-in',
            triggerType: 'alternate',
          },
          {
            key: 'logo-hover',
            effectId: 'logo-arc-in',
            triggerType: 'alternate',
            namedEffect: {
              type: 'ArcIn',
              direction: 'left',
              power: 'hard',
            } as NamedEffect,
          },
        ],
      },
      {
        trigger: 'hover',
        key: 'logo-hover',
        effects: [
          {
            key: 'logo-hover',
            effectId: 'logo-transition-hover',
            stateAction: 'toggle',
          },
        ],
      },
      {
        trigger: 'viewProgress',
        key: 'logo-scroll',
        effects: [
          {
            key: 'logo-scroll',
            effectId: 'logo-fade-scroll',
          },
        ],
      },
      {
        trigger: 'click',
        key: 'logo-click-container',
        listContainer: '#logo-list',
        effects: [
          {
            effectId: 'logo-bounce',
          },
        ],
      },
      {
        trigger: 'viewEnter',
        key: 'logo-view-container',
        effects: [
          {
            listContainer: '#logo-list',
            effectId: 'logo-bounce',
          },
        ],
      },
      {
        trigger: 'viewProgress',
        key: 'logo-scroll-container',
        listContainer: '#logo-scroll-list',
        effects: [
          {
            listContainer: '#logo-scroll-list',
            effectId: 'logo-fade-scroll',
          },
        ],
      },
      {
        trigger: 'viewProgress',
        key: 'logo-scroll-container',
        effects: [
          {
            key: 'logo-scroll-items',
            listContainer: '#logo-scroll-list',
            effectId: 'logo-fade-scroll',
          },
        ],
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
      'logo-arc-in-with-target': {
        key: 'logo-hover',
        namedEffect: {
          type: 'ArcIn',
          direction: 'right',
          power: 'medium',
        } as NamedEffect,
        duration: 1200,
      },
      'logo-track-mouse': {
        namedEffect: {
          type: 'TrackMouse',
          distance: { value: 20, unit: 'px' },
          axis: 'both',
          power: 'medium',
        } as NamedEffect,
        transitionDuration: 300,
        transitionEasing: 'easeOut',
        centeredToTarget: true,
      },
      'logo-bounce': {
        namedEffect: {
          type: 'BounceIn',
          power: 'hard',
          direction: 'center',
          distanceFactor: 1.2,
        } as NamedEffect,
        duration: 500,
      },
      'logo-fade-scroll': {
        namedEffect: {
          type: 'FadeScroll',
          range: 'in',
          opacity: 0,
        } as NamedEffect,
        rangeStart: {
          name: 'contain',
          offset: { value: -10, unit: 'percentage' },
        },
        rangeEnd: {
          name: 'contain',
          offset: { value: 110, unit: 'percentage' },
        },
      },
      'logo-transition-hover': {
        transition: {
          duration: 300,
          styleProperties: [{ name: 'opacity', value: '0' }],
        },
      },
      'logo-poke': {
        namedEffect: {
          type: 'Poke',
          direction: 'left',
          power: 'medium',
        } as NamedEffect,
        duration: 500,
      },
    },
  });

  beforeEach(() => {
    element = document.createElement('div');

    // Mock Web Animations API (enough for real @wix/motion when vi.doUnmock('@wix/motion') is used)
    (window as any).KeyframeEffect = class KeyframeEffect {
      constructor(element: Element | null, keyframes: any[], options: any = {}) {
        const timing = {
          delay: options?.delay ?? 0,
          duration: typeof options?.duration === 'number' ? options.duration : 100,
          iterations: options?.iterations ?? 1,
          easing: options?.easing ?? 'linear',
          fill: options?.fill ?? 'none',
          direction: options?.direction ?? 'normal',
        };
        const effect = {
          target: element,
          element,
          keyframes,
          options,
          setKeyframes: vi.fn(function (this: any, k: any) {
            this.keyframes = k;
          }),
          updateTiming: vi.fn(function (this: any, updates: any) {
            Object.assign(timing, updates);
          }),
          getTiming: vi.fn(() => ({ ...timing })),
          getComputedTiming: vi.fn(() => {
            const delay = Number(timing.delay) || 0;
            const duration = Number(timing.duration) || 0;
            const iterations = Number(timing.iterations) || 1;
            const activeDuration = duration * iterations;
            return {
              progress: 0,
              currentIteration: 0,
              activeDuration,
              endTime: delay + activeDuration,
            };
          }),
        };
        return effect;
      }
    };

    // Mock ViewTimeline
    (window as any).ViewTimeline = class ViewTimeline {
      constructor(options: any) {
        return { ...options };
      }
    };

    // Mock Animation
    (window as any).Animation = class Animation {
      constructor(effect: any, timeline: any) {
        return {
          effect,
          timeline,
          play: vi.fn(),
          pause: vi.fn(),
          reverse: vi.fn(),
          cancel: vi.fn(),
          playState: 'idle',
          currentTime: null as number | null,
          ready: Promise.resolve(),
          finished: Promise.resolve(),
        };
      }
    };

    (window as any).CSSAnimation = class CSSAnimation extends (window as any).Animation {};

    // Mock IntersectionObserver
    (window as any).IntersectionObserver = class IntersectionObserver {
      constructor(callback: any, options: any) {
        return { callback, options, observe: vi.fn(), unobserve: vi.fn() };
      }
    };

    // Mock CSSStyleSheet
    (window as any).CSSStyleSheet = class CSSStyleSheet {
      constructor() {
        return { replaceSync: vi.fn(), insertRule: vi.fn() };
      }
    };

    // Mock PointerEvent
    (window as any).PointerEvent = class PointerEvent extends MouseEvent {
      pointerType: string;
      constructor(type: string, eventInitDict?: PointerEventInit) {
        super(type, eventInitDict);
        this.pointerType = eventInitDict?.pointerType || '';
      }
    };

    // Mock adoptedStyleSheets
    if (!document.adoptedStyleSheets) {
      document.adoptedStyleSheets = [];
    }

    // Mock matchMedia for condition testing
    mockMQLs = new Map();
    mockMatchMedia();

    // Reset allowA11yTriggers to false to maintain test consistency
    Interact.allowA11yTriggers = false;
  });

  function mockMatchMedia(matchingQueries: string[] = []) {
    const queryRule = `(${matchingQueries.join(') and (')})`;
    const mockMQL = (query: string) => {
      // Return existing MQL if already created for this query
      if (mockMQLs.has(query)) {
        return mockMQLs.get(query)!;
      }

      const mql = {
        matches: queryRule === query,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
      } as unknown as MediaQueryList;

      mockMQLs.set(query, mql);
      return mql;
    };

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation(mockMQL),
    });
  }

  function createCascadingTestConfig(
    conditions: Record<string, any> = {},
    matchingConditions: string[] = [],
  ): InteractConfig {
    mockMatchMedia(matchingConditions);

    return {
      conditions: {
        desktop: {
          type: 'media',
          predicate: 'min-width: 1024px',
        },
        mobile: {
          type: 'media',
          predicate: 'max-width: 767px',
        },
        tablet: {
          type: 'media',
          predicate: '(min-width: 768px) and (max-width: 1023px)',
        },
        ...conditions,
      },
      interactions: [
        {
          trigger: 'click',
          key: 'cascade-source',
          effects: [
            {
              key: 'cascade-target',
              effectId: 'default-effect',
            },
            {
              key: 'cascade-target',
              effectId: 'default-effect',
              conditions: ['desktop'],
              namedEffect: {
                type: 'SlideIn',
                direction: 'right',
                power: 'medium',
              } as NamedEffect,
              duration: 800,
            },
            {
              key: 'cascade-target',
              effectId: 'default-effect',
              conditions: ['mobile'],
              namedEffect: {
                type: 'BounceIn',
                direction: 'center',
                power: 'hard',
              } as NamedEffect,
              duration: 600,
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
          duration: 500,
        },
      },
    };
  }

  afterEach(() => {
    vi.clearAllMocks();
    // Clear Interact instances to ensure test isolation
    Interact.destroy();
    // Reset forceReducedMotion to default
    Interact.forceReducedMotion = false;
    // Reset allowA11yTriggers to default false for test isolation
    Interact.allowA11yTriggers = false;
  });

  describe('destroy Interact instance', () => {
    it('should clear an instance entire cache', () => {
      const instance = Interact.create(getMockConfig());

      element = document.createElement('div');
      element.dataset.interactKey = 'logo-entrance';

      add(element, 'logo-entrance');

      expect(Object.keys(instance.dataCache.interactions).length).toBe(11);
      expect(instance.controllers.size).toBe(1);
      expect(Interact.instances.length).toBe(1);

      instance.destroy();

      expect(Object.keys(instance.dataCache.interactions).length).toBe(0);
      expect(instance.controllers.size).toBe(0);
      expect(Interact.instances.length).toBe(0);
      expect(Interact.controllerCache.size).toBe(1);
    });
  });

  describe('destroy Interact', () => {
    it('should clear all instances', () => {
      Interact.create(getMockConfig());
      Interact.create(getMockConfig());

      expect(Interact.instances.length).toBe(2);

      Interact.destroy();

      expect(Interact.instances.length).toBe(0);
    });

    it('should clear all elements from cache', () => {
      Interact.create(getMockConfig());

      element = document.createElement('div');

      add(element, 'logo-hover');

      expect(Interact.controllerCache.size).toBeGreaterThan(0);

      Interact.destroy();

      expect(Interact.controllerCache.size).toBe(0);
    });

    it('should call disconnect on all cached elements', () => {
      Interact.create(getMockConfig());

      const key1 = 'logo-hover';
      const element1 = document.createElement('div');
      element1.dataset.interactKey = key1;

      const key2 = 'logo-click';
      const element2 = document.createElement('div');
      element2.dataset.interactKey = key2;

      add(element1, key1);
      add(element2, key2);
      const controller1 = Interact.getController(key1);
      const controller2 = Interact.getController(key2);

      const disconnectSpy1 = vi.spyOn(controller1!, 'disconnect');
      const disconnectSpy2 = vi.spyOn(controller2!, 'disconnect');

      Interact.destroy();

      expect(disconnectSpy1).toHaveBeenCalled();
      expect(disconnectSpy2).toHaveBeenCalled();
    });

    it('should clean up interactions after destroy', () => {
      Interact.create(getMockConfig());

      element = document.createElement('div');

      add(element, 'logo-click');

      Interact.destroy();

      // After destroy, getInstance should return undefined
      expect(Interact.getInstance('logo-click')).toBeUndefined();

      // Re-create instance and verify it works independently
      Interact.create(getMockConfig());
      const newElement = document.createElement('div');

      const newAddEventListenerSpy = vi.spyOn(newElement, 'addEventListener');
      add(newElement, 'logo-click');

      expect(newAddEventListenerSpy).toHaveBeenCalled();
      expect(Interact.getInstance('logo-click')).toBeDefined();
    });
  });

  describe('reduced motion', () => {
    it('should pass reducedMotion=true to getWebAnimation when forceReducedMotion is true', async () => {
      const { getWebAnimation } = await import('@wix/motion');
      Interact.forceReducedMotion = true;
      Interact.create({
        interactions: [
          {
            trigger: 'hover',
            key: 'logo-hover',
            effects: [
              {
                key: 'logo-hover',
                effectId: 'logo-arc-in',
              },
            ],
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
      });

      element = document.createElement('div');

      add(element, 'logo-hover');

      expect(getWebAnimation).toHaveBeenCalledWith(element, expect.any(Object), undefined, {
        reducedMotion: true,
      });

      Interact.forceReducedMotion = false;

      Interact.destroy();
    });
  });

  describe('add interaction', () => {
    beforeEach(() => {
      mockConfig = getMockConfig();
      Interact.create(mockConfig);
    });
    afterEach(() => {
      Interact.destroy();
      vi.clearAllMocks();
    });

    describe('hover', () => {
      it('should add handler for hover trigger with alternate type', async () => {
        const { getWebAnimation } = await import('@wix/motion');

        element = document.createElement('div');

        const addEventListenerSpy = vi.spyOn(element, 'addEventListener');
        expect(getWebAnimation).toHaveBeenCalledTimes(0);

        add(element, 'logo-hover');

        expect(addEventListenerSpy).toHaveBeenCalledTimes(4);
        expect(addEventListenerSpy).toHaveBeenCalledWith(
          'mouseenter',
          expect.any(Function),
          expect.objectContaining({
            passive: true,
          }),
        );

        expect(addEventListenerSpy).toHaveBeenCalledWith(
          'mouseleave',
          expect.any(Function),
          expect.objectContaining({
            passive: true,
          }),
        );

        expect(getWebAnimation).toHaveBeenCalledTimes(1);
        expect(getWebAnimation).toHaveBeenCalledWith(
          element,
          expect.objectContaining({
            namedEffect: expect.objectContaining({
              type: 'ArcIn',
              direction: 'left',
              power: 'hard',
            }),
          }),
          undefined,
          { reducedMotion: false },
        );
      });
    });

    describe('click', () => {
      it('should add handler for click trigger', () => {
        element = document.createElement('div');

        const addEventListenerSpy = vi.spyOn(element, 'addEventListener');

        add(element, 'logo-click');

        expect(addEventListenerSpy).toHaveBeenCalledTimes(2);
        expect(addEventListenerSpy).toHaveBeenCalledWith(
          'click',
          expect.any(Function),
          expect.objectContaining({
            passive: true,
          }),
        );
      });
    });

    describe('viewEnter', () => {
      it('should add handler for viewEnter trigger', async () => {
        const { getWebAnimation } = await import('@wix/motion');
        element = document.createElement('div');

        add(element, 'logo-entrance');

        expect(getWebAnimation).toHaveBeenCalledTimes(1);
        expect(getWebAnimation).toHaveBeenCalledWith(
          expect.any(HTMLElement),
          expect.any(Object),
          undefined,
          { reducedMotion: false },
        );
      });

      it('should add handler for viewEnter trigger when target is added before source', async () => {
        const { getWebAnimation: getWebAnimationFn } = await import('@wix/motion');
        const getWebAnimation = getWebAnimationFn as unknown as MockInstance;
        element = document.createElement('div');
        element.id = 'logo-entrance';
        element.dataset.interactKey = 'logo-entrance';

        const elementClick = document.createElement('div');
        elementClick.id = 'logo-click';
        elementClick.dataset.interactKey = 'logo-click';

        add(elementClick, 'logo-click');
        add(element, 'logo-entrance');

        expect(getWebAnimation).toHaveBeenCalledTimes(3);
        expect(getWebAnimation.mock.calls[0][0]).toBe(elementClick);
        expect(getWebAnimation.mock.calls[1][0]).toBe(element);
        expect(getWebAnimation.mock.calls[2][0]).toBe(elementClick);
        expect(getWebAnimation.mock.calls[0][3]).toMatchObject({
          reducedMotion: false,
        });
        expect(getWebAnimation.mock.calls[1][3]).toMatchObject({
          reducedMotion: false,
        });
        expect(getWebAnimation.mock.calls[2][3]).toMatchObject({
          reducedMotion: false,
        });
      });

      it('should add handler for viewEnter trigger with alternate type and reverse on exit', async () => {
        const { getWebAnimation } = await import('@wix/motion');
        const mockAnimation = (getWebAnimation as any)();

        // Capture observer callbacks
        const observerCallbacks: Array<(entries: Partial<IntersectionObserverEntry>[]) => void> =
          [];
        const IntersectionObserverMock = vi.fn(function (this: any, cb: any) {
          observerCallbacks.push(cb);
          this.observe = vi.fn();
          this.unobserve = vi.fn();
          this.disconnect = vi.fn();
        }) as any;
        (window as any).IntersectionObserver = IntersectionObserverMock;

        const alternateConfig: InteractConfig = {
          interactions: [
            {
              trigger: 'viewEnter',
              key: 'logo-alternate',
              effects: [{ key: 'logo-alternate', effectId: 'logo-arc-in' }],
            },
          ],
          effects: {
            'logo-arc-in': {
              namedEffect: { type: 'ArcIn', direction: 'right', power: 'medium' } as NamedEffect,
              duration: 1200,
              triggerType: 'alternate',
            },
          },
        };

        Interact.destroy();
        Interact.create(alternateConfig);

        element = document.createElement('div');
        add(element, 'logo-alternate');

        expect(getWebAnimation).toHaveBeenCalledTimes(2); // 1 for the creation of mockAnimation above
        expect(mockAnimation.persist).toHaveBeenCalled();

        // Simulate first entry - should play
        const mainObserverCallback = observerCallbacks[0];
        mainObserverCallback([{ target: element, isIntersecting: true }]);
        expect(mockAnimation.play).toHaveBeenCalled();

        mockAnimation.reverse.mockClear();

        // Simulate exit - should reverse
        mainObserverCallback([{ target: element, isIntersecting: false }]);
        expect(mockAnimation.reverse).toHaveBeenCalled();

        mockAnimation.reverse.mockClear();

        // Simulate re-entry - should reverse again
        mainObserverCallback([{ target: element, isIntersecting: true }]);
        expect(mockAnimation.reverse).toHaveBeenCalled();
      });

      it('should add handler for viewEnter trigger with repeat type and pause+reset on exit', async () => {
        const viewEnterHandler = (await import('../src/handlers/viewEnter')).default;
        viewEnterHandler.reset();

        const { getWebAnimation } = await import('@wix/motion');
        const mockAnimation = (getWebAnimation as any)();

        // Capture observer callbacks
        const observerCallbacks: Array<(entries: Partial<IntersectionObserverEntry>[]) => void> =
          [];
        const IntersectionObserverMock = vi.fn(function (this: any, cb: any) {
          observerCallbacks.push(cb);
          this.observe = vi.fn();
          this.unobserve = vi.fn();
          this.disconnect = vi.fn();
        }) as any;
        (window as any).IntersectionObserver = IntersectionObserverMock;

        const repeatConfig: InteractConfig = {
          interactions: [
            {
              trigger: 'viewEnter',
              key: 'logo-repeat',
              effects: [{ key: 'logo-repeat', effectId: 'logo-arc-in' }],
            },
          ],
          effects: {
            'logo-arc-in': {
              namedEffect: { type: 'ArcIn', direction: 'right', power: 'medium' } as NamedEffect,
              duration: 1200,
              triggerType: 'repeat',
            },
          },
        };

        Interact.destroy();
        Interact.create(repeatConfig);

        element = document.createElement('div');
        add(element, 'logo-repeat');

        expect(getWebAnimation).toHaveBeenCalledTimes(2); // 1 for the creation of mockAnimation above
        expect(mockAnimation.persist).toHaveBeenCalled();

        // Simulate first entry - should play
        const mainObserverCallback = observerCallbacks[0];
        mainObserverCallback([{ target: element, isIntersecting: true }]);
        expect(mockAnimation.play).toHaveBeenCalled();

        mockAnimation.pause.mockClear();
        mockAnimation.progress.mockClear();

        // Simulate exit via exit observer - should pause and reset progress
        const exitObserverCallback = observerCallbacks[1];
        exitObserverCallback([{ target: element, isIntersecting: false }]);
        expect(mockAnimation.pause).toHaveBeenCalled();
        expect(mockAnimation.progress).toHaveBeenCalledWith(0);
      });

      it('should add handler for viewEnter trigger with state type and pause on exit', async () => {
        const viewEnterHandler = (await import('../src/handlers/viewEnter')).default;
        viewEnterHandler.reset();

        const { getWebAnimation } = await import('@wix/motion');
        const mockAnimation = (getWebAnimation as any)();

        // Capture observer callbacks
        const observerCallbacks: Array<(entries: Partial<IntersectionObserverEntry>[]) => void> =
          [];
        const IntersectionObserverMock = vi.fn(function (this: any, cb: any) {
          observerCallbacks.push(cb);
          this.observe = vi.fn();
          this.unobserve = vi.fn();
          this.disconnect = vi.fn();
        }) as any;
        (window as any).IntersectionObserver = IntersectionObserverMock;

        const stateConfig: InteractConfig = {
          interactions: [
            {
              trigger: 'viewEnter',
              key: 'logo-state',
              effects: [{ key: 'logo-state', effectId: 'logo-arc-in' }],
            },
          ],
          effects: {
            'logo-arc-in': {
              namedEffect: { type: 'ArcIn', direction: 'right', power: 'medium' } as NamedEffect,
              duration: 1200,
              triggerType: 'state',
            },
          },
        };

        Interact.destroy();
        Interact.create(stateConfig);

        element = document.createElement('div');
        add(element, 'logo-state');

        expect(getWebAnimation).toHaveBeenCalledTimes(2); // 1 for the creation of mockAnimation above
        expect(mockAnimation.persist).toHaveBeenCalled();

        // Simulate first entry - should play
        const mainObserverCallback = observerCallbacks[0];
        mainObserverCallback([{ target: element, isIntersecting: true }]);
        expect(mockAnimation.play).toHaveBeenCalled();

        mockAnimation.pause.mockClear();
        mockAnimation.progress.mockClear();

        // Simulate exit via exit observer - should pause (but NOT reset progress)
        const exitObserverCallback = observerCallbacks[1];
        exitObserverCallback([{ target: element, isIntersecting: false }]);
        expect(mockAnimation.pause).toHaveBeenCalled();
        expect(mockAnimation.progress).not.toHaveBeenCalled();
      });
    });

    describe('animationEnd', () => {
      it('should add handler for animationEnd trigger', async () => {
        const { getWebAnimation } = await import('@wix/motion');
        element = document.createElement('div');

        add(element, 'logo-animation-end');

        expect(getWebAnimation).toHaveBeenCalledTimes(1);
        expect(getWebAnimation).toHaveBeenCalledWith(
          expect.any(HTMLElement),
          expect.any(Object),
          undefined,
          { reducedMotion: false },
        );
      });
    });

    describe('pointerMove', () => {
      it('should add handler for pointerMove trigger', async () =>
        new Promise(async (done) => {
          const { getScrubScene } = await import('@wix/motion');
          const { Pointer } = await import('kuliso');
          const pointerInstance = {
            start: vi.fn(),
            destroy: vi.fn(),
          };
          Pointer.mockImplementation(function (this: any) {
            Object.assign(this, pointerInstance);
          });

          element = document.createElement('div');

          add(element, 'logo-mouse');

          expect(getScrubScene).toHaveBeenCalledTimes(1);
          expect(getScrubScene).toHaveBeenCalledWith(
            expect.any(HTMLElement),
            expect.objectContaining(
              effectToAnimationOptions(getMockConfig().effects['logo-track-mouse'] as ScrubEffect),
            ),
            expect.objectContaining({
              trigger: 'pointer-move',
            }),
          );
          setTimeout(() => {
            expect(pointerInstance.start).toHaveBeenCalled();
            done(void 0);
          }, 0);
        }));

      it('should add handler for pointerMove trigger with keyframeEffect', async () =>
        new Promise(async (done) => {
          const { getScrubScene } = await import('@wix/motion');
          const { Pointer } = await import('kuliso');
          const pointerInstance = {
            start: vi.fn(),
            destroy: vi.fn(),
          };
          Pointer.mockImplementation(function (this: any) {
            Object.assign(this, pointerInstance);
          });

          const keyframeEffectConfig: InteractConfig = {
            interactions: [
              {
                trigger: 'pointerMove',
                key: 'keyframe-mouse',
                params: {
                  hitArea: 'root',
                  axis: 'x',
                },
                effects: [
                  {
                    key: 'keyframe-mouse',
                    effectId: 'keyframe-track-mouse',
                  },
                ],
              },
            ],
            effects: {
              'keyframe-track-mouse': {
                keyframeEffect: {
                  name: 'custom-pointer-move',
                  keyframes: [
                    { transform: 'translateX(-50px)' },
                    { transform: 'translateX(50px)' },
                  ],
                },
              },
            },
          };

          Interact.destroy();
          Interact.create(keyframeEffectConfig);

          element = document.createElement('div');

          add(element, 'keyframe-mouse');

          expect(getScrubScene).toHaveBeenCalledWith(
            expect.any(HTMLElement),
            expect.objectContaining({
              keyframeEffect: expect.objectContaining({
                name: 'custom-pointer-move',
                keyframes: [{ transform: 'translateX(-50px)' }, { transform: 'translateX(50px)' }],
              }),
            }),
            expect.objectContaining({
              trigger: 'pointer-move',
              axis: 'x',
            }),
          );
          setTimeout(() => {
            expect(pointerInstance.start).toHaveBeenCalled();
            done(void 0);
          }, 0);
        }));
    });

    describe('viewProgress', () => {
      it('should add handler for viewProgress trigger with native ViewTimeline support', async () => {
        const { getAnimation } = await import('@wix/motion');

        element = document.createElement('div');

        add(element, 'logo-scroll');

        expect(getAnimation).toHaveBeenCalledTimes(1);
        expect(getAnimation).toHaveBeenCalledWith(
          expect.any(HTMLElement),
          expect.objectContaining(
            effectToAnimationOptions(getMockConfig().effects['logo-fade-scroll'] as ScrubEffect),
          ),
          expect.objectContaining({
            trigger: 'view-progress',
          }),
        );
      });

      it('should add handler for viewProgress trigger with fizban polyfill', async () =>
        new Promise(async (done) => {
          // Remove ViewTimeline support
          delete (window as any).ViewTimeline;
          const { getScrubScene } = await import('@wix/motion');
          const { Scroll } = await import('fizban');
          const scrollInstance = {
            start: vi.fn(),
            destroy: vi.fn(),
          };
          Scroll.mockImplementation(function (this: any) {
            Object.assign(this, scrollInstance);
          });

          element = document.createElement('div');

          add(element, 'logo-scroll');

          expect((globalThis as any).ViewTimeline).toBeUndefined();

          expect(getScrubScene).toHaveBeenCalledTimes(1);
          expect(getScrubScene).toHaveBeenCalledWith(
            expect.any(HTMLElement),
            expect.objectContaining(
              effectToAnimationOptions(getMockConfig().effects['logo-fade-scroll'] as ScrubEffect),
            ),
            expect.objectContaining({
              trigger: 'view-progress',
            }),
          );
          setTimeout(() => {
            expect(scrollInstance.start).toHaveBeenCalled();
            Scroll.mockRestore();
            done(void 0);
          }, 0);
        }));
    });

    describe('listContainer', () => {
      it('should add a handler per list item for click trigger with listContainer', () => {
        element = document.createElement('div');
        const ul = document.createElement('ul');
        ul.id = 'logo-list';
        const li = document.createElement('li');
        const li2 = li.cloneNode(true);
        ul.append(li);
        ul.append(li2);
        element.append(ul);

        const addEventListenerSpy = vi.spyOn(li, 'addEventListener');
        const addEventListenerSpy2 = vi.spyOn(li2, 'addEventListener');

        add(element, 'logo-click-container');

        expect(addEventListenerSpy).toHaveBeenCalledTimes(1);
        expect(addEventListenerSpy2).toHaveBeenCalledTimes(1);
        expect(addEventListenerSpy).toHaveBeenCalledWith(
          'click',
          expect.any(Function),
          expect.objectContaining({
            passive: true,
          }),
        );
        expect(addEventListenerSpy2).toHaveBeenCalledWith(
          'click',
          expect.any(Function),
          expect.objectContaining({
            passive: true,
          }),
        );
      });

      it('should add a handler per list item for viewEnter trigger with listContainer in effect', async () => {
        const { getWebAnimation: getWebAnimationFn } = await import('@wix/motion');
        const getWebAnimation = getWebAnimationFn as unknown as MockInstance;
        element = document.createElement('div');
        const ul = document.createElement('ul');
        ul.id = 'logo-list';
        const li = document.createElement('li');
        const li2 = li.cloneNode(true);
        ul.append(li);
        ul.append(li2);
        element.append(ul);

        add(element, 'logo-view-container');

        expect(getWebAnimation).toHaveBeenCalledTimes(2);
        expect(getWebAnimation.mock.calls[0][0]).toBe(li);
        expect(getWebAnimation.mock.calls[1][0]).toBe(li2);
      });

      it('should add a handler per newly added list item for click trigger with listContainer', () => {
        const key = 'logo-click-container';
        element = document.createElement('div');
        element.dataset.interactKey = key;
        const ul = document.createElement('ul');
        ul.id = 'logo-list';
        const li = document.createElement('li');
        const li2 = li.cloneNode(true);
        ul.append(li);
        ul.append(li2);
        element.append(ul);

        const addEventListenerSpy = vi.spyOn(li, 'addEventListener');
        const addEventListenerSpy2 = vi.spyOn(li2, 'addEventListener');

        add(element, key);

        expect(addEventListenerSpy).toHaveBeenCalledTimes(1);
        expect(addEventListenerSpy2).toHaveBeenCalledTimes(1);
        expect(addEventListenerSpy).toHaveBeenCalledWith(
          'click',
          expect.any(Function),
          expect.objectContaining({
            passive: true,
          }),
        );
        expect(addEventListenerSpy2).toHaveBeenCalledWith(
          'click',
          expect.any(Function),
          expect.objectContaining({
            passive: true,
          }),
        );

        const li3 = document.createElement('li');
        ul.append(li3);
        const addEventListenerSpy3 = vi.spyOn(li3, 'addEventListener');

        const controller = Interact.getController(key);
        addListItems(controller!, '#logo-list', [li3]);

        expect(addEventListenerSpy3).toHaveBeenCalledTimes(1);
        expect(addEventListenerSpy3).toHaveBeenCalledWith(
          'click',
          expect.any(Function),
          expect.objectContaining({
            passive: true,
          }),
        );
      });

      it('should add a handler per newly added list item for viewProgress trigger but not add same interaction twice', async () => {
        const { getAnimation } = await import('@wix/motion');

        const keySource = 'logo-scroll-container';
        const keyTarget = 'logo-scroll-items';
        element = document.createElement('div');
        element.dataset.interactKey = keySource;
        const targetElement = document.createElement('div');
        targetElement.dataset.interactKey = keyTarget;
        const ul = document.createElement('ul');
        ul.id = 'logo-scroll-list';
        const li = document.createElement('li');
        const li2 = li.cloneNode(true);
        ul.append(li);
        ul.append(li2);
        targetElement.append(ul);

        add(element, keySource);
        expect(getAnimation).toHaveBeenCalledTimes(0);

        add(targetElement, keyTarget);

        expect(getAnimation).toHaveBeenCalledTimes(2);
        expect(getAnimation).toHaveBeenCalledWith(
          li,
          expect.objectContaining(
            effectToAnimationOptions(getMockConfig().effects['logo-fade-scroll'] as ScrubEffect),
          ),
          expect.objectContaining({
            trigger: 'view-progress',
          }),
        );
        expect(getAnimation).toHaveBeenCalledWith(
          li2,
          expect.objectContaining(
            effectToAnimationOptions(getMockConfig().effects['logo-fade-scroll'] as ScrubEffect),
          ),
          expect.objectContaining({
            trigger: 'view-progress',
          }),
        );

        const li3 = document.createElement('li');
        ul.append(li3);
        element.append(ul);

        const controller = Interact.getController(keyTarget);
        addListItems(controller!, '#logo-scroll-list', [li3]);

        expect(getAnimation).toHaveBeenCalledTimes(3);
        expect(getAnimation).toHaveBeenCalledWith(
          li3,
          expect.objectContaining(
            effectToAnimationOptions(getMockConfig().effects['logo-fade-scroll'] as ScrubEffect),
          ),
          expect.objectContaining({
            trigger: 'view-progress',
          }),
        );
      });
    });
  });

  describe('remove interaction', () => {
    beforeEach(() => {
      Interact.create(getMockConfig());
    });
    afterEach(() => {
      Interact.destroy();
    });

    it('should remove event listeners', () => {
      const key = 'logo-click';
      element = document.createElement('div');
      element.dataset.interactKey = key;

      const addEventListenerSpy = vi.spyOn(element, 'addEventListener');

      add(element, key);

      const signals = addEventListenerSpy.mock.calls
        .map((call) => (call[2] as AddEventListenerOptions)?.signal)
        .filter(Boolean) as AbortSignal[];

      expect(signals.length).toBe(2);
      expect(signals.filter((signal) => signal.aborted)).toHaveLength(0);

      remove(key);

      expect(signals.filter((signal) => signal.aborted)).toHaveLength(2);
    });

    it('should do nothing if key does not exist', () => {
      expect(() => remove('non-existent-key')).not.toThrow();
    });

    it('should cleanup pointer effects', async () => {
      const { Pointer } = await import('kuliso');
      const pointerInstance = {
        start: vi.fn(),
        destroy: vi.fn(),
      };
      Pointer.mockImplementation(function (this: any) {
        Object.assign(this, pointerInstance);
      });

      const key = 'logo-mouse';
      element = document.createElement('div');
      element.dataset.interactKey = key;

      add(element, key);
      remove(key);

      expect(pointerInstance.destroy).toHaveBeenCalledTimes(1);
    });
  });

  describe('effect cascading logic', () => {
    describe('basic cascading behavior', () => {
      it('should apply only first matching effect for same target', async () => {
        const { getWebAnimation } = await import('@wix/motion');
        const config = createCascadingTestConfig({}, ['min-width: 1024px']);

        Interact.create(config);

        const sourceElement = document.createElement('div');
        const targetElement = document.createElement('div');

        const addEventListenerSpy = vi.spyOn(sourceElement, 'addEventListener');

        add(sourceElement, 'cascade-source');
        add(targetElement, 'cascade-target');

        expect(addEventListenerSpy).toHaveBeenCalledTimes(1);
        expect(addEventListenerSpy).toHaveBeenCalledWith(
          'click',
          expect.any(Function),
          expect.objectContaining({
            passive: true,
          }),
        );

        // Should create animation with desktop effect (first matching condition)
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
          { reducedMotion: false },
        );
      });

      it('should apply default effect when no conditions match', async () => {
        const { getWebAnimation } = await import('@wix/motion');
        const config = createCascadingTestConfig({}, []); // No matching conditions

        Interact.create(config);

        const sourceElement = document.createElement('div');
        const targetElement = document.createElement('div');

        add(sourceElement, 'cascade-source');
        add(targetElement, 'cascade-target');

        // Should create animation with default effect
        expect(getWebAnimation).toHaveBeenCalledTimes(1);
        expect(getWebAnimation).toHaveBeenCalledWith(
          targetElement,
          expect.objectContaining({
            namedEffect: expect.objectContaining({
              type: 'FadeIn',
              power: 'medium',
            }),
          }),
          undefined,
          { reducedMotion: false },
        );
      });

      it('should apply mobile effect when mobile condition matches', async () => {
        const { getWebAnimation } = await import('@wix/motion');
        const config = createCascadingTestConfig({}, ['max-width: 767px']);

        Interact.create(config);

        const sourceElement = document.createElement('div');
        const targetElement = document.createElement('div');

        add(sourceElement, 'cascade-source');
        add(targetElement, 'cascade-target');

        // Should create animation with mobile effect
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
          { reducedMotion: false },
        );
      });
    });

    describe('element addition order', () => {
      it('should work when source is added before target', async () => {
        const { getWebAnimation } = await import('@wix/motion');
        const config = createCascadingTestConfig({}, ['min-width: 1024px']);

        Interact.create(config);

        const sourceElement = document.createElement('div');
        const targetElement = document.createElement('div');

        // Add source first
        add(sourceElement, 'cascade-source');
        // Add target second
        add(targetElement, 'cascade-target');

        expect(getWebAnimation).toHaveBeenCalledTimes(1);
        expect(getWebAnimation).toHaveBeenCalledWith(
          targetElement,
          expect.objectContaining({
            namedEffect: expect.objectContaining({
              type: 'SlideIn',
            }),
          }),
          undefined,
          { reducedMotion: false },
        );
      });

      it('should work when target is added before source', async () => {
        const { getWebAnimation } = await import('@wix/motion');
        const config = createCascadingTestConfig({}, ['min-width: 1024px']);

        Interact.create(config);

        const sourceElement = document.createElement('div');
        const targetElement = document.createElement('div');

        // Add target first
        add(targetElement, 'cascade-target');
        // Add source second
        add(sourceElement, 'cascade-source');

        expect(getWebAnimation).toHaveBeenCalledTimes(1);
        expect(getWebAnimation).toHaveBeenCalledWith(
          targetElement,
          expect.objectContaining({
            namedEffect: expect.objectContaining({
              type: 'SlideIn',
            }),
          }),
          undefined,
          { reducedMotion: false },
        );
      });
    });

    describe('complex cascading scenarios', () => {
      it('should handle multiple targets with different conditions', async () => {
        const { getWebAnimation } = await import('@wix/motion');

        const complexConfig: InteractConfig = {
          conditions: {
            desktop: {
              type: 'media',
              predicate: 'min-width: 1024px',
            },
            mobile: {
              type: 'media',
              predicate: 'max-width: 767px',
            },
          },
          interactions: [
            {
              trigger: 'click',
              key: 'multi-source-1',
              effects: [
                {
                  key: 'cascade-target-1',
                  effectId: 'desktop-effect',
                  conditions: ['desktop'],
                },
                {
                  key: 'cascade-target-2',
                  effectId: 'mobile-effect',
                  conditions: ['mobile'],
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
              duration: 800,
            },
            'mobile-effect': {
              namedEffect: {
                type: 'BounceIn',
                direction: 'center',
                power: 'hard',
              } as NamedEffect,
              duration: 600,
            },
          },
        };

        mockMatchMedia(['min-width: 1024px']); // Only desktop matches
        Interact.create(complexConfig);

        const sourceElement = document.createElement('div');
        const target1Element = document.createElement('div');
        const target2Element = document.createElement('div');

        add(sourceElement, 'multi-source-1');
        add(target1Element, 'cascade-target-1');
        add(target2Element, 'cascade-target-2');

        // Only desktop effect should be applied (mobile condition doesn't match)
        expect(getWebAnimation).toHaveBeenCalledTimes(1);
        expect(getWebAnimation).toHaveBeenCalledWith(
          target1Element,
          expect.objectContaining({
            namedEffect: expect.objectContaining({
              type: 'SlideIn',
            }),
          }),
          undefined,
          { reducedMotion: false },
        );

        // Should not be called for mobile effect since condition doesn't match
        expect(getWebAnimation).not.toHaveBeenCalledWith(
          target2Element,
          expect.objectContaining({
            namedEffect: expect.objectContaining({
              type: 'BounceIn',
            }),
          }),
          undefined,
          { reducedMotion: false },
        );
      });

      it('should handle effects with multiple conditions', async () => {
        const { getWebAnimation } = await import('@wix/motion');

        const multiConditionConfig: InteractConfig = {
          conditions: {
            desktop: {
              type: 'media',
              predicate: 'min-width: 1024px',
            },
            'high-res': {
              type: 'media',
              predicate: 'min-resolution: 2dppx',
            },
          },
          interactions: [
            {
              trigger: 'click',
              key: 'cascade-source',
              effects: [
                {
                  key: 'cascade-target',
                  effectId: 'premium-effect',
                },
                {
                  key: 'cascade-target',
                  effectId: 'premium-effect',
                  conditions: ['desktop', 'high-res'],
                },
              ],
            },
          ],
          effects: {
            'premium-effect': {
              namedEffect: {
                type: 'Poke',
                direction: 'left',
                power: 'hard',
              } as NamedEffect,
              duration: 1000,
            },
          },
        };

        // Both conditions match
        mockMatchMedia(['min-width: 1024px', 'min-resolution: 2dppx']);
        Interact.create(multiConditionConfig);

        const sourceElement = document.createElement('div');
        const targetElement = document.createElement('div');

        add(sourceElement, 'cascade-source');
        add(targetElement, 'cascade-target');

        // Premium effect should be applied since both conditions match
        expect(getWebAnimation).toHaveBeenCalledTimes(1);
        expect(getWebAnimation).toHaveBeenCalledWith(
          targetElement,
          expect.objectContaining({
            namedEffect: expect.objectContaining({
              type: 'Poke',
            }),
          }),
          undefined,
          { reducedMotion: false },
        );
      });
    });

    describe('condition matching edge cases', () => {
      it('should handle missing conditions gracefully', async () => {
        const { getWebAnimation } = await import('@wix/motion');

        const configWithMissingCondition: InteractConfig = {
          conditions: {
            desktop: {
              type: 'media',
              predicate: 'min-width: 1024px',
            },
          },
          interactions: [
            {
              trigger: 'click',
              key: 'cascade-source',
              effects: [
                {
                  key: 'cascade-target',
                  effectId: 'default-effect',
                },
                {
                  key: 'cascade-target',
                  effectId: 'default-effect',
                  conditions: ['nonexistent-condition'],
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
              duration: 500,
            },
          },
        };

        mockMatchMedia(['min-width: 1024px']);
        Interact.create(configWithMissingCondition);

        const sourceElement = document.createElement('div');
        const targetElement = document.createElement('div');

        add(sourceElement, 'cascade-source');
        add(targetElement, 'cascade-target');

        // Should fall back to default effect since condition doesn't exist
        expect(getWebAnimation).toHaveBeenCalledTimes(1);
        expect(getWebAnimation).toHaveBeenCalledWith(
          targetElement,
          expect.objectContaining({
            namedEffect: expect.objectContaining({
              type: 'FadeIn',
            }),
          }),
          undefined,
          { reducedMotion: false },
        );
      });

      it('should handle empty conditions array', async () => {
        const { getWebAnimation } = await import('@wix/motion');

        const configWithEmptyConditions: InteractConfig = {
          conditions: {},
          interactions: [
            {
              trigger: 'click',
              key: 'cascade-source',
              effects: [
                {
                  key: 'cascade-target',
                  effectId: 'always-applied-effect',
                  conditions: [],
                },
              ],
            },
          ],
          effects: {
            'always-applied-effect': {
              namedEffect: {
                type: 'Spin',
                direction: 'clockwise',
                power: 'medium',
              } as NamedEffect,
              duration: 1000,
            },
          },
        };

        mockMatchMedia([]);
        Interact.create(configWithEmptyConditions);

        const sourceElement = document.createElement('div');
        const targetElement = document.createElement('div');

        add(sourceElement, 'cascade-source');
        add(targetElement, 'cascade-target');

        // Effect should be applied since empty conditions array should always match
        expect(getWebAnimation).toHaveBeenCalledTimes(1);
        expect(getWebAnimation).toHaveBeenCalledWith(
          expect.any(HTMLElement),
          expect.objectContaining({
            namedEffect: expect.objectContaining({
              type: 'Spin',
            }),
          }),
          undefined,
          { reducedMotion: false },
        );
      });
    });
  });

  describe('selector functionality', () => {
    let sourceElement: HTMLElement;
    let targetElement: HTMLElement;

    beforeEach(() => {
      // Create source element with multiple child elements
      sourceElement = document.createElement('div');
      sourceElement.innerHTML = `
        <div class="first-child">First Child</div>
        <button class="trigger-button">Click Me</button>
        <div class="other-element">Other</div>
        <div class="list-container">
          <div class="list-item">Item 1</div>
          <div class="list-item">Item 2</div>
          <div class="list-item">Item 3</div>
        </div>
      `;

      // Create target element with multiple child elements
      targetElement = document.createElement('div');
      targetElement.innerHTML = `
        <div class="first-child">Target First</div>
        <div class="animation-target">Animation Target</div>
        <div class="overlay">Overlay</div>
        <div class="nested">
          <span class="deep-target">Deep Target</span>
        </div>
      `;
    });

    describe('basic selector functionality', () => {
      it('should use selector instead of firstElementChild for source', () => {
        const config: InteractConfig = {
          effects: {
            'test-effect': {
              keyframeEffect: {
                name: 'test',
                keyframes: [{ opacity: '0' }, { opacity: '1' }],
              },
              duration: 300,
            },
          },
          interactions: [
            {
              key: 'selector-source',
              selector: '.trigger-button',
              trigger: 'click',
              effects: [
                {
                  key: 'selector-target',
                  effectId: 'test-effect',
                },
              ],
            },
          ],
        };

        Interact.create(config);

        const triggerButton = sourceElement.querySelector('.trigger-button') as HTMLElement;

        const triggerSpy = vi.spyOn(triggerButton, 'addEventListener');
        const sourceElementSpy = vi.spyOn(sourceElement, 'addEventListener');

        add(sourceElement, 'selector-source');
        add(targetElement, 'selector-target');

        // Should add event listener to the selected element, not firstElementChild
        expect(triggerSpy).toHaveBeenCalledWith('click', expect.any(Function), expect.any(Object));
        expect(sourceElementSpy).not.toHaveBeenCalled();
      });

      it('should use selector instead of firstElementChild for target', async () => {
        const { getWebAnimation } = await import('@wix/motion');

        const config: InteractConfig = {
          effects: {
            'test-effect': {
              keyframeEffect: {
                name: 'test',
                keyframes: [{ opacity: '0' }, { opacity: '1' }],
              },
              duration: 300,
            },
          },
          interactions: [
            {
              key: 'selector-source',
              trigger: 'click',
              effects: [
                {
                  key: 'selector-target',
                  selector: '.animation-target',
                  effectId: 'test-effect',
                },
              ],
            },
          ],
        };

        Interact.create(config);

        add(sourceElement, 'selector-source');
        add(targetElement, 'selector-target');

        const animationTarget = targetElement.querySelector('.animation-target') as HTMLElement;

        // Should create animation on the selected element, not firstElementChild
        expect(getWebAnimation).toHaveBeenCalledWith(
          animationTarget,
          expect.any(Object),
          undefined,
          { reducedMotion: false },
        );
      });

      it('should fall back to firstElementChild when no selector is provided', () => {
        const config: InteractConfig = {
          effects: {
            'test-effect': {
              keyframeEffect: {
                name: 'test',
                keyframes: [{ opacity: '0' }, { opacity: '1' }],
              },
              duration: 300,
            },
          },
          interactions: [
            {
              key: 'fallback-source',
              trigger: 'click',
              effects: [
                {
                  key: 'fallback-target',
                  effectId: 'test-effect',
                },
              ],
            },
          ],
        };

        Interact.create(config);

        const sourceElementSpy = vi.spyOn(sourceElement, 'addEventListener');

        add(sourceElement, 'fallback-source');
        add(targetElement, 'fallback-target');

        // Should add event listener to the source element
        expect(sourceElementSpy).toHaveBeenCalledWith(
          'click',
          expect.any(Function),
          expect.any(Object),
        );
      });
    });

    describe('selector with listContainer', () => {
      it('should use selector within listContainer items', () => {
        const config: InteractConfig = {
          effects: {
            'list-effect': {
              keyframeEffect: {
                name: 'list-test',
                keyframes: [{ transform: 'scale(1)' }, { transform: 'scale(1.1)' }],
              },
              duration: 200,
            },
          },
          interactions: [
            {
              key: 'list-source',
              listContainer: '.list-container',
              selector: '.list-item',
              trigger: 'hover',
              effects: [
                {
                  listContainer: '.list-container',
                  selector: '.list-item',
                  effectId: 'list-effect',
                },
              ],
            },
          ],
        };

        Interact.create(config);

        // Set up spies before adding interactions
        const listItems = Array.from(sourceElement.querySelectorAll('.list-item')) as HTMLElement[];

        const spies = listItems.map((item) => vi.spyOn(item, 'addEventListener'));

        add(sourceElement, 'list-source');

        // Should add event listeners to each list item
        spies.forEach((spy) => {
          expect(spy).toHaveBeenCalledWith('mouseenter', expect.any(Function), expect.any(Object));
        });
      });

      it('should handle listContainer without selector (all children)', () => {
        const config: InteractConfig = {
          effects: {
            'container-effect': {
              keyframeEffect: {
                name: 'container-test',
                keyframes: [{ opacity: '0.5' }, { opacity: '1' }],
              },
              duration: 150,
            },
          },
          interactions: [
            {
              key: 'container-source',
              listContainer: '.list-container',
              trigger: 'click',
              effects: [
                {
                  listContainer: '.list-container',
                  effectId: 'container-effect',
                },
              ],
            },
          ],
        };

        Interact.create(config);

        // Set up spies before adding interactions
        const containerChildren = Array.from(
          sourceElement.querySelector('.list-container')?.children || [],
        ) as HTMLElement[];

        const spies = containerChildren.map((child) => vi.spyOn(child, 'addEventListener'));

        add(sourceElement, 'container-source');

        // Should add event listeners to all children of the container
        spies.forEach((spy) => {
          expect(spy).toHaveBeenCalledWith('click', expect.any(Function), expect.any(Object));
        });
      });
    });

    describe('selector error handling', () => {
      let consoleSpy: MockInstance;

      beforeEach(() => {
        consoleSpy = vi.spyOn(console, 'warn').mockImplementation((message) => {
          console.log(message);
        });
      });

      afterEach(() => {
        consoleSpy.mockRestore();
      });

      it('should warn when selector does not match any elements', () => {
        const config: InteractConfig = {
          effects: {
            'test-effect': {
              keyframeEffect: {
                name: 'test',
                keyframes: [{ opacity: '0' }, { opacity: '1' }],
              },
              duration: 300,
            },
          },
          interactions: [
            {
              key: 'invalid-source',
              selector: '.non-existent-element',
              trigger: 'click',
              effects: [
                {
                  key: 'invalid-target',
                  effectId: 'test-effect',
                },
              ],
            },
          ],
        };

        Interact.create(config);

        add(sourceElement, 'invalid-source');
        add(targetElement, 'invalid-target');

        expect(consoleSpy).toHaveBeenCalledWith(
          'Interact: No elements found for selector ".non-existent-element"',
        );
      });

      it('should warn when listContainer selector does not match', () => {
        const config: InteractConfig = {
          effects: {
            'test-effect': {
              keyframeEffect: {
                name: 'test',
                keyframes: [{ opacity: '0' }, { opacity: '1' }],
              },
              duration: 300,
            },
          },
          interactions: [
            {
              key: 'invalid-container-source',
              listContainer: '.non-existent-container',
              trigger: 'click',
              effects: [
                {
                  key: 'invalid-container-target',
                  effectId: 'test-effect',
                },
              ],
            },
          ],
        };

        Interact.create(config);

        add(sourceElement, 'invalid-container-source');
        add(targetElement, 'invalid-container-target');

        expect(consoleSpy).toHaveBeenCalledWith(
          'Interact: No container found for list container ".non-existent-container"',
        );
      });

      it('should gracefully handle invalid selectors without breaking interactions', () => {
        const config: InteractConfig = {
          effects: {
            'valid-effect': {
              keyframeEffect: {
                name: 'valid',
                keyframes: [{ opacity: '0' }, { opacity: '1' }],
              },
              duration: 300,
            },
          },
          interactions: [
            {
              key: 'mixed-source',
              selector: '.non-existent',
              trigger: 'click',
              effects: [
                {
                  key: 'mixed-target',
                  effectId: 'valid-effect',
                },
              ],
            },
            {
              key: 'valid-source',
              selector: '.trigger-button',
              trigger: 'click',
              effects: [
                {
                  key: 'valid-target',
                  effectId: 'valid-effect',
                },
              ],
            },
          ],
        };

        Interact.create(config);

        // Set up spy before adding interactions
        const triggerButton = sourceElement.querySelector('.trigger-button') as HTMLElement;
        const spy = vi.spyOn(triggerButton, 'addEventListener');

        // This should not throw and should allow other interactions to work
        expect(() => {
          add(sourceElement, 'mixed-source');
          add(sourceElement, 'valid-source');
          add(targetElement, 'mixed-target');
          add(targetElement, 'valid-target');
        }).not.toThrow();

        // Valid interaction should still work
        expect(spy).toHaveBeenCalled();
      });
    });

    describe('complex selector scenarios', () => {
      it('should handle nested selectors', async () => {
        const { getWebAnimation } = await import('@wix/motion');

        const config: InteractConfig = {
          effects: {
            'nested-effect': {
              keyframeEffect: {
                name: 'nested',
                keyframes: [{ color: 'black' }, { color: 'blue' }],
              },
              duration: 200,
            },
          },
          interactions: [
            {
              key: 'nested-source',
              selector: '.other-element',
              trigger: 'click',
              effects: [
                {
                  key: 'nested-target',
                  selector: '.nested .deep-target',
                  effectId: 'nested-effect',
                },
              ],
            },
          ],
        };

        Interact.create(config);

        const addEventListenerSpy = vi.spyOn(
          sourceElement.querySelector('.other-element') as HTMLElement,
          'addEventListener',
        );

        add(sourceElement, 'nested-source');
        add(targetElement, 'nested-target');

        const deepTarget = targetElement.querySelector('.nested .deep-target') as HTMLElement;

        expect(addEventListenerSpy).toHaveBeenCalledWith(
          'click',
          expect.any(Function),
          expect.any(Object),
        );

        expect(getWebAnimation).toHaveBeenCalledWith(deepTarget, expect.any(Object), undefined, {
          reducedMotion: false,
        });
      });

      it('should handle attribute selectors', () => {
        // Add data attributes to test elements
        const buttonWithData = sourceElement.querySelector('.trigger-button') as HTMLElement;
        buttonWithData.setAttribute('data-interactive', 'true');
        buttonWithData.setAttribute('data-category', 'primary');

        const config: InteractConfig = {
          effects: {
            'attr-effect': {
              keyframeEffect: {
                name: 'attr',
                keyframes: [{ backgroundColor: 'white' }, { backgroundColor: 'lightblue' }],
              },
              duration: 300,
            },
          },
          interactions: [
            {
              key: 'attr-source',
              selector: '[data-interactive="true"][data-category="primary"]',
              trigger: 'click',
              effects: [
                {
                  key: 'attr-target',
                  selector: '[class*="animation"]',
                  effectId: 'attr-effect',
                },
              ],
            },
          ],
        };

        Interact.create(config);

        // Set up spy before adding interactions
        const spy = vi.spyOn(buttonWithData, 'addEventListener');

        add(sourceElement, 'attr-source');
        add(targetElement, 'attr-target');

        expect(spy).toHaveBeenCalledWith('click', expect.any(Function), expect.any(Object));
      });
    });

    describe('selector inheritance and priority', () => {
      it('should not inherit selector from interaction to effect', async () => {
        const { getWebAnimation } = await import('@wix/motion');

        const config: InteractConfig = {
          effects: {
            'inherit-effect': {
              keyframeEffect: {
                name: 'inherit',
                keyframes: [{ opacity: '0' }, { opacity: '1' }],
              },
              duration: 300,
            },
          },
          interactions: [
            {
              key: 'inherit-source',
              selector: '.trigger-button', // Interaction has selector
              trigger: 'click',
              effects: [
                {
                  key: 'inherit-target',
                  // Effect has no selector - should use firstElementChild, not inherit
                  effectId: 'inherit-effect',
                },
              ],
            },
          ],
        };

        Interact.create(config);

        add(sourceElement, 'inherit-source');
        add(targetElement, 'inherit-target');

        // Effect should target firstElementChild, not the interaction's selector
        expect(getWebAnimation).toHaveBeenCalledWith(targetElement, expect.any(Object), undefined, {
          reducedMotion: false,
        });
      });
    });

    describe('selector cleanup', () => {
      it('should clean up selector-based interactions on remove', () => {
        const config: InteractConfig = {
          effects: {
            'cleanup-effect': {
              keyframeEffect: {
                name: 'cleanup',
                keyframes: [{ opacity: '0' }, { opacity: '1' }],
              },
              duration: 300,
            },
          },
          interactions: [
            {
              key: 'cleanup-source',
              selector: '.trigger-button',
              trigger: 'click',
              effects: [
                {
                  key: 'cleanup-target',
                  selector: '.animation-target',
                  effectId: 'cleanup-effect',
                },
              ],
            },
          ],
        };

        Interact.create(config);

        const triggerButton = sourceElement.querySelector('.trigger-button') as HTMLElement;
        const addEventListenerSpy = vi.spyOn(triggerButton, 'addEventListener');

        add(sourceElement, 'cleanup-source');
        add(targetElement, 'cleanup-target');

        remove('cleanup-source');

        expect(
          addEventListenerSpy.mock.calls
            .map((call) => (call[2] as AddEventListenerOptions)?.signal)
            .filter((signal): signal is AbortSignal => !!signal?.aborted),
        ).toHaveLength(1);
      });
    });
  });

  describe('element caching', () => {
    it('should cache element in controllerCache even when no instance was found for it', () => {
      const keyWithoutInstance = 'key-without-instance';
      element.dataset.interactKey = keyWithoutInstance;
      add(element, keyWithoutInstance);
      const controller = Interact.getController(keyWithoutInstance);

      expect(Interact.controllerCache.has(keyWithoutInstance)).toBe(true);
      expect(Interact.controllerCache.get(keyWithoutInstance)).toBe(controller);
    });
  });

  describe('setup', () => {
    afterEach(() => {
      Interact.setup({
        scrollOptionsGetter: () => ({}),
        pointerOptionsGetter: () => ({}),
      });
    });

    it('should register scroll options getter', () => {
      const scrollOptionsGetter = vi.fn().mockReturnValue({});
      const spy = vi.spyOn(TRIGGER_TO_HANDLER_MODULE_MAP.viewProgress, 'registerOptionsGetter');

      Interact.setup({ scrollOptionsGetter });

      expect(spy).toHaveBeenCalledWith(scrollOptionsGetter);
    });

    it('should register pointer options getter', () => {
      const pointerOptionsGetter = vi.fn().mockReturnValue({});
      const spy = vi.spyOn(TRIGGER_TO_HANDLER_MODULE_MAP.pointerMove, 'registerOptionsGetter');

      Interact.setup({ pointerOptionsGetter });

      expect(spy).toHaveBeenCalledWith(pointerOptionsGetter);
    });
  });

  describe('selector condition type', () => {
    it('should pass selectorCondition to handler when condition type is selector', async () => {
      const config: InteractConfig = {
        conditions: {
          active: {
            type: 'selector',
            predicate: '.active',
          },
        },
        interactions: [
          {
            trigger: 'click',
            key: 'selector-test',
            effects: [
              {
                key: 'selector-test',
                effectId: 'test-effect',
                conditions: ['active'],
              },
            ],
          },
        ],
        effects: {
          'test-effect': {
            namedEffect: {
              type: 'FadeIn',
              power: 'medium',
            } as NamedEffect,
            duration: 500,
          },
        },
      };

      Interact.create(config);

      const testElement = document.createElement('div');

      add(testElement, 'selector-test');

      // The handler should have received selectorCondition
      // We verify by checking the animation is created (condition doesn't block setup)
      const { getWebAnimation } = await import('@wix/motion');
      expect(getWebAnimation).toHaveBeenCalled();
    });

    it('should skip handler execution when element does not match selector condition', async () => {
      const { getWebAnimation } = await import('@wix/motion');
      const mockAnimation = {
        play: vi.fn(),
        cancel: vi.fn(),
        onFinish: vi.fn(),
        reverse: vi.fn(),
        progress: vi.fn(),
        playState: 'idle',
        isCSS: false,
      };
      (getWebAnimation as any).mockReturnValue(mockAnimation);

      const config: InteractConfig = {
        conditions: {
          active: {
            type: 'selector',
            predicate: '.active',
          },
        },
        interactions: [
          {
            trigger: 'click',
            key: 'selector-skip-test',
            effects: [
              {
                key: 'selector-skip-test',
                effectId: 'skip-effect',
                conditions: ['active'],
              },
            ],
          },
        ],
        effects: {
          'skip-effect': {
            namedEffect: {
              type: 'FadeIn',
              power: 'medium',
            } as NamedEffect,
            duration: 500,
          },
        },
      };

      Interact.create(config);

      const testElement = document.createElement('div');

      add(testElement, 'selector-skip-test');

      // Simulate click - animation should NOT play because element doesn't match .active
      testElement.dispatchEvent(new PointerEvent('click', { pointerType: 'mouse', bubbles: true }));

      expect(mockAnimation.play).not.toHaveBeenCalled();
    });

    it('should execute handler when element matches selector condition', async () => {
      const { getWebAnimation } = await import('@wix/motion');
      const mockAnimation = {
        play: vi.fn(),
        cancel: vi.fn(),
        onFinish: vi.fn(),
        reverse: vi.fn(),
        progress: vi.fn(),
        playState: 'idle',
        isCSS: false,
      };
      (getWebAnimation as any).mockReturnValue(mockAnimation);

      const config: InteractConfig = {
        conditions: {
          active: {
            type: 'selector',
            predicate: '.active',
          },
        },
        interactions: [
          {
            trigger: 'click',
            key: 'selector-match-test',
            effects: [
              {
                key: 'selector-match-test',
                effectId: 'match-effect',
                conditions: ['active'],
              },
            ],
          },
        ],
        effects: {
          'match-effect': {
            namedEffect: {
              type: 'FadeIn',
              power: 'medium',
            } as NamedEffect,
            duration: 500,
          },
        },
      };

      Interact.create(config);

      const testElement = document.createElement('div');
      testElement.classList.add('active'); // div HAS .active class

      add(testElement, 'selector-match-test');

      // Simulate click - animation SHOULD play because element matches .active
      testElement.dispatchEvent(new PointerEvent('click', { pointerType: 'mouse', bubbles: true }));

      expect(mockAnimation.play).toHaveBeenCalled();
    });

    it('should not apply selector condition type to media query listeners', () => {
      // Selector conditions should NOT create matchMedia listeners (only media conditions do)
      const config: InteractConfig = {
        conditions: {
          active: {
            type: 'selector',
            predicate: '.active',
          },
        },
        interactions: [
          {
            trigger: 'click',
            key: 'no-mql-test',
            conditions: ['active'],
            effects: [
              {
                key: 'no-mql-test',
                effectId: 'no-mql-effect',
              },
            ],
          },
        ],
        effects: {
          'no-mql-effect': {
            namedEffect: {
              type: 'FadeIn',
              power: 'medium',
            } as NamedEffect,
            duration: 500,
          },
        },
      };

      const instance = Interact.create(config);

      const testElement = document.createElement('div');

      add(testElement, 'no-mql-test');

      // Selector conditions should NOT create media query listeners
      expect(instance.mediaQueryListeners.size).toBe(0);
      // matchMedia should not be called for selector type conditions
      expect(window.matchMedia).not.toHaveBeenCalledWith('.active');
    });
  });

  describe('breakpoint media query listeners', () => {
    let instance: Interact;
    let testElement: HTMLElement;

    beforeEach(() => {
      // Clear existing MQLs and reset the mock for a fresh state
      mockMQLs.clear();
      mockMatchMedia();
    });

    afterEach(() => {
      Interact.destroy();
    });

    const createResponsiveConfig = (): InteractConfig => ({
      conditions: {
        desktop: {
          type: 'media',
          predicate: 'min-width: 768px',
        },
      },
      interactions: [
        {
          trigger: 'click',
          key: 'responsive-button',
          conditions: ['desktop'],
          effects: [
            {
              key: 'responsive-button',
              effectId: 'test-effect',
            },
          ],
        },
      ],
      effects: {
        'test-effect': {
          namedEffect: {
            type: 'FadeIn',
            power: 'medium',
          } as NamedEffect,
          duration: 500,
        },
      },
    });

    it('should set up a media query listener when interaction has conditions', () => {
      const config = createResponsiveConfig();
      instance = Interact.create(config);

      testElement = document.createElement('div');
      add(testElement, 'responsive-button');

      // Verify matchMedia was called with the condition predicate
      expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 768px)');

      // Verify listener was stored in instance
      expect(instance.mediaQueryListeners.size).toBe(1);
      expect(instance.mediaQueryListeners.has('responsive-button::trigger::0')).toBe(true);

      // Verify addEventListener was called on the MQL
      const mql = mockMQLs.get('(min-width: 768px)');
      expect(mql?.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should call reconcile (re-add) when media query changes', () => {
      const config = createResponsiveConfig();
      instance = Interact.create(config);

      testElement = document.createElement('div');
      add(testElement, 'responsive-button');

      // Get the stored handler
      const listenerEntry = instance.mediaQueryListeners.get('responsive-button::trigger::0');
      expect(listenerEntry).toBeDefined();

      // Spy on clearInteractionStateForKey to verify reconcile behavior
      const clearStateSpy = vi.spyOn(instance, 'clearInteractionStateForKey');

      // Simulate media query change by calling the handler with a mock event
      const mockEvent = { matches: true, media: '(min-width: 768px)' } as MediaQueryListEvent;
      listenerEntry!.handler(mockEvent);

      // Verify reconcile was triggered (clearInteractionStateForKey is called during reconcile)
      expect(clearStateSpy).toHaveBeenCalledWith('responsive-button');
    });

    it('should properly remove event listeners when instance is destroyed', () => {
      const config = createResponsiveConfig();
      instance = Interact.create(config);

      testElement = document.createElement('div');
      add(testElement, 'responsive-button');

      const mql = mockMQLs.get('(min-width: 768px)');
      expect(mql).toBeDefined();

      // Verify listener was added
      expect(mql!.addEventListener).toHaveBeenCalled();

      // Destroy the instance
      instance.destroy();

      // Verify removeEventListener was called
      expect(mql!.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));

      // Verify the listeners map is cleared
      expect(instance.mediaQueryListeners.size).toBe(0);
    });

    it('should not create duplicate listeners when add() is called twice', () => {
      const config = createResponsiveConfig();
      instance = Interact.create(config);

      testElement = document.createElement('div');

      // Call add twice
      add(testElement, 'responsive-button');
      add(testElement, 'responsive-button');

      // Should still only have one listener
      expect(instance.mediaQueryListeners.size).toBe(1);

      // addEventListener should only be called once
      const mql = mockMQLs.get('(min-width: 768px)');
      expect(mql?.addEventListener).toHaveBeenCalledTimes(1);
    });

    it('should remove listeners when element is deleted', () => {
      const config = createResponsiveConfig();
      instance = Interact.create(config);

      testElement = document.createElement('div');
      add(testElement, 'responsive-button');

      const mql = mockMQLs.get('(min-width: 768px)');
      expect(instance.mediaQueryListeners.size).toBe(1);

      // Delete the element
      instance.deleteController('responsive-button');

      // Verify listener was removed
      expect(mql!.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
      expect(instance.mediaQueryListeners.size).toBe(0);
    });

    it('should remove previous condition interactions when media query changes even if element is still connected', () => {
      // Create config with two interactions that have mutually exclusive conditions
      const config: InteractConfig = {
        conditions: {
          desktop: {
            type: 'media',
            predicate: 'min-width: 1024px',
          },
          mobile: {
            type: 'media',
            predicate: 'max-width: 767px',
          },
        },
        interactions: [
          {
            trigger: 'click',
            key: 'responsive-element',
            conditions: ['desktop'],
            effects: [
              {
                key: 'responsive-element',
                effectId: 'desktop-effect',
              },
            ],
          },
          {
            trigger: 'hover',
            key: 'responsive-element',
            conditions: ['mobile'],
            effects: [
              {
                key: 'responsive-element',
                effectId: 'mobile-effect',
              },
            ],
          },
        ],
        effects: {
          'desktop-effect': {
            namedEffect: {
              type: 'FadeIn',
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

      // Initially desktop matches
      mockMatchMedia(['min-width: 1024px']);
      instance = Interact.create(config);

      testElement = document.createElement('div');

      // Simulate element being connected to DOM
      Object.defineProperty(testElement, 'isConnected', {
        value: true,
        writable: true,
      });

      const addEventListenerSpy = vi.spyOn(testElement, 'addEventListener');

      add(testElement, 'responsive-element');

      // Verify desktop interaction (click) is added, not mobile (hover)
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'click',
        expect.any(Function),
        expect.any(Object),
      );
      expect(addEventListenerSpy).not.toHaveBeenCalledWith(
        'mouseenter',
        expect.any(Function),
        expect.any(Object),
      );

      const clickSignals = addEventListenerSpy.mock.calls
        .map((call) => (call[2] as AddEventListenerOptions)?.signal)
        .filter(Boolean) as AbortSignal[];

      // Clear spy for next assertions
      addEventListenerSpy.mockClear();

      // Now simulate media query change to mobile
      const desktopMql = mockMQLs.get('(min-width: 1024px)');
      const mobileMql = mockMQLs.get('(max-width: 767px)');

      // Update MQL matches values
      (desktopMql as any).matches = false;
      (mobileMql as any).matches = true;

      // Get the stored handler and trigger it
      const listenerEntry = instance.mediaQueryListeners.get('responsive-element::trigger::0');
      expect(listenerEntry).toBeDefined();

      // Simulate media query change event
      const mockEvent = { matches: false, media: '(min-width: 1024px)' } as MediaQueryListEvent;
      listenerEntry!.handler(mockEvent);

      // The old click signals should be aborted
      expect(clickSignals.filter((signal) => signal.aborted)).toHaveLength(1);

      // The new hover handler should be added
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'mouseenter',
        expect.any(Function),
        expect.any(Object),
      );
    });
  });

  describe('a11y - accessible triggers', () => {
    let a11yElement: HTMLElement;

    function getA11yConfig(trigger: TriggerType, key: string): InteractConfig {
      return {
        interactions: [
          {
            trigger,
            key,
            effects: [{ effectId: 'test-effect' }],
          },
        ],
        effects: {
          'test-effect': {
            namedEffect: { type: 'BounceIn', power: 'medium' } as NamedEffect,
            duration: 500,
          },
        },
      };
    }

    afterEach(() => {
      Interact.destroy();
    });

    describe('activate trigger', () => {
      it('should add both click and keydown listeners', () => {
        Interact.create(getA11yConfig('activate', 'activate-div'));
        a11yElement = document.createElement('div');

        const addEventListenerSpy = vi.spyOn(a11yElement, 'addEventListener');

        add(a11yElement, 'activate-div');

        expect(addEventListenerSpy).toHaveBeenCalledWith(
          'click',
          expect.any(Function),
          expect.any(Object),
        );
        expect(addEventListenerSpy).toHaveBeenCalledWith(
          'keydown',
          expect.any(Function),
          expect.any(Object),
        );
      });

      it('should not double-invoke handler when Enter triggers both keydown and click', async () => {
        const { getWebAnimation } = await import('@wix/motion');
        const mockPlay = (getWebAnimation as any)().play;
        mockPlay.mockClear();

        Interact.create(getA11yConfig('activate', 'activate-handler-test'));
        a11yElement = document.createElement('div');

        const button = document.createElement('button');
        a11yElement.append(button);

        add(a11yElement, 'activate-handler-test');

        // Simulate browser behavior: Enter key triggers keydown AND synthesized click with no pointerType
        button.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter', bubbles: true }));
        button.dispatchEvent(new MouseEvent('click', { bubbles: true }));

        expect(mockPlay).toHaveBeenCalledTimes(1);
      });
    });

    describe('interest trigger', () => {
      it('should add focusin listener alongside mouseenter', () => {
        Interact.create(getA11yConfig('interest', 'interest-test'));
        a11yElement = document.createElement('div');

        const addEventListenerSpy = vi.spyOn(a11yElement, 'addEventListener');

        add(a11yElement, 'interest-test');

        expect(addEventListenerSpy).toHaveBeenCalledWith(
          'mouseenter',
          expect.any(Function),
          expect.any(Object),
        );
        expect(addEventListenerSpy).toHaveBeenCalledWith(
          'focusin',
          expect.any(Function),
          expect.any(Object),
        );
      });
    });

    describe('click trigger with allowA11yTriggers flag', () => {
      it('should NOT add keydown listener when flag is false', () => {
        Interact.create(getA11yConfig('click', 'click-no-flag'));
        Interact.setup({ allowA11yTriggers: false });
        a11yElement = document.createElement('div');

        const addEventListenerSpy = vi.spyOn(a11yElement, 'addEventListener');

        add(a11yElement, 'click-no-flag');

        expect(addEventListenerSpy).toHaveBeenCalledWith(
          'click',
          expect.any(Function),
          expect.any(Object),
        );
        expect(addEventListenerSpy).not.toHaveBeenCalledWith(
          'keydown',
          expect.any(Function),
          expect.any(Object),
        );
      });

      it('should add keydown listener when flag is true', () => {
        Interact.setup({ allowA11yTriggers: true });
        Interact.create(getA11yConfig('click', 'click-with-flag'));
        a11yElement = document.createElement('div');

        const addEventListenerSpy = vi.spyOn(a11yElement, 'addEventListener');

        add(a11yElement, 'click-with-flag');

        expect(addEventListenerSpy).toHaveBeenCalledWith(
          'click',
          expect.any(Function),
          expect.any(Object),
        );
        expect(addEventListenerSpy).toHaveBeenCalledWith(
          'keydown',
          expect.any(Function),
          expect.any(Object),
        );
      });

      it('should make the source focusable so the keydown listener is reachable', () => {
        Interact.setup({ allowA11yTriggers: true });
        Interact.create(getA11yConfig('click', 'click-tabindex'));
        a11yElement = document.createElement('div');

        expect(a11yElement.tabIndex).toBe(-1);

        add(a11yElement, 'click-tabindex');

        expect(a11yElement.tabIndex).toBe(0);
      });
    });

    describe('hover trigger with allowA11yTriggers flag', () => {
      it('should NOT add focusin listener when flag is false', () => {
        Interact.setup({ allowA11yTriggers: false });
        Interact.create(getA11yConfig('hover', 'hover-no-flag'));
        a11yElement = document.createElement('interact-element') as IInteractElement;

        const addEventListenerSpy = vi.spyOn(a11yElement, 'addEventListener');

        add(a11yElement, 'hover-no-flag');

        expect(addEventListenerSpy).toHaveBeenCalledWith(
          'mouseenter',
          expect.any(Function),
          expect.any(Object),
        );
        expect(addEventListenerSpy).not.toHaveBeenCalledWith(
          'focusin',
          expect.any(Function),
          expect.any(Object),
        );
      });

      it('should add focusin listener when flag is true', () => {
        Interact.setup({ allowA11yTriggers: true });
        Interact.create(getA11yConfig('hover', 'hover-with-flag'));
        a11yElement = document.createElement('div');

        const addEventListenerSpy = vi.spyOn(a11yElement, 'addEventListener');

        add(a11yElement, 'hover-with-flag');

        expect(addEventListenerSpy).toHaveBeenCalledWith(
          'mouseenter',
          expect.any(Function),
          expect.any(Object),
        );
        expect(addEventListenerSpy).toHaveBeenCalledWith(
          'focusin',
          expect.any(Function),
          expect.any(Object),
        );
      });
    });
  });

  describe('configuration defaults', () => {
    describe('scroll animation range defaults', () => {
      it('should use default range values when rangeStart and rangeEnd are not provided', () => {
        const scrubEffect: ScrubEffect = {
          namedEffect: { type: 'FadeScroll', range: 'in', opacity: 0 } as NamedEffect,
        };

        const result = effectToAnimationOptions(scrubEffect) as {
          startOffset: any;
          endOffset: any;
        };

        expect(result.startOffset).toEqual({
          name: 'cover',
          offset: { value: 0, unit: 'percentage' },
        });
        expect(result.endOffset).toEqual({
          name: 'cover',
          offset: { value: 100, unit: 'percentage' },
        });
      });

      it('should use provided rangeStart and rangeEnd values when supplied', () => {
        const scrubEffect: ScrubEffect = {
          namedEffect: { type: 'FadeScroll', range: 'in', opacity: 0 } as NamedEffect,
          rangeStart: { name: 'contain', offset: { value: 10, unit: 'percentage' } },
          rangeEnd: { name: 'entry', offset: { value: 90, unit: 'percentage' } },
        };

        const result = effectToAnimationOptions(scrubEffect) as {
          startOffset: any;
          endOffset: any;
        };

        expect(result.startOffset).toEqual({
          name: 'contain',
          offset: { value: 10, unit: 'percentage' },
        });
        expect(result.endOffset).toEqual({
          name: 'entry',
          offset: { value: 90, unit: 'percentage' },
        });
      });

      it('should use rangeStart.name for endOffset.name when only rangeStart is provided', () => {
        const scrubEffect: ScrubEffect = {
          namedEffect: { type: 'FadeScroll', range: 'in', opacity: 0 } as NamedEffect,
          rangeStart: { name: 'entry', offset: { value: 25, unit: 'percentage' } },
        };

        const result = effectToAnimationOptions(scrubEffect) as {
          startOffset: any;
          endOffset: any;
        };

        expect(result.startOffset).toEqual({
          name: 'entry',
          offset: { value: 25, unit: 'percentage' },
        });
        expect(result.endOffset).toEqual({
          name: 'entry',
          offset: { value: 100, unit: 'percentage' },
        });
      });

      it('should use default offset when only rangeStart.name is provided', () => {
        const scrubEffect: ScrubEffect = {
          namedEffect: { type: 'FadeScroll', range: 'in', opacity: 0 } as NamedEffect,
          rangeStart: { name: 'exit' },
        };

        const result = effectToAnimationOptions(scrubEffect) as {
          startOffset: any;
          endOffset: any;
        };

        expect(result.startOffset).toEqual({
          name: 'exit',
          offset: { value: 0, unit: 'percentage' },
        });
        expect(result.endOffset).toEqual({
          name: 'exit',
          offset: { value: 100, unit: 'percentage' },
        });
      });

      it('should use default startOffset.name when only rangeEnd is provided', () => {
        const scrubEffect: ScrubEffect = {
          namedEffect: { type: 'FadeScroll', range: 'in', opacity: 0 } as NamedEffect,
          rangeEnd: { name: 'exit', offset: { value: 75, unit: 'percentage' } },
        };

        const result = effectToAnimationOptions(scrubEffect) as {
          startOffset: any;
          endOffset: any;
        };

        expect(result.startOffset).toEqual({
          name: 'cover',
          offset: { value: 0, unit: 'percentage' },
        });
        expect(result.endOffset).toEqual({
          name: 'exit',
          offset: { value: 75, unit: 'percentage' },
        });
      });
    });

    describe('keyframeEffect name defaults', () => {
      it('should assign effectId as keyframeEffect.name when keyframeEffect has no name', () => {
        const timeEffect = {
          keyframeEffect: {
            keyframes: [{ opacity: '0' }, { opacity: '1' }],
          },
          duration: 500,
          effectId: 'my-effect-id',
        };

        const result = effectToAnimationOptions(timeEffect as any) as {
          keyframeEffect?: { name?: string };
        };

        expect(result.keyframeEffect?.name).toBe('my-effect-id');
      });

      it('should handle keyframeEffect without name and without effectId', () => {
        const timeEffect = {
          keyframeEffect: {
            keyframes: [{ opacity: '0' }, { opacity: '1' }],
          },
          duration: 500,
        };

        const result = effectToAnimationOptions(timeEffect as any) as {
          keyframeEffect?: { name?: string };
        };

        expect(result.keyframeEffect?.name).toBeUndefined();
      });
    });
  });

  describe('null animation handling', () => {
    describe('click handler', () => {
      it('should not add event listeners when animation is null', async () => {
        const { getAnimation } = await import('@wix/motion');
        (getAnimation as any).mockReturnValueOnce(null);

        const config: InteractConfig = {
          interactions: [
            {
              trigger: 'click',
              key: 'null-click-test',
              effects: [
                {
                  key: 'null-click-test',
                  effectId: 'null-effect',
                },
              ],
            },
          ],
          effects: {
            'null-effect': {
              namedEffect: {
                type: 'NonExistentEffect' as any,
              } as NamedEffect,
              duration: 500,
            },
          },
        };

        Interact.create(config);

        const testElement = document.createElement('div');
        const addEventListenerSpy = vi.spyOn(testElement, 'addEventListener');

        add(testElement, 'null-click-test');

        expect(addEventListenerSpy).not.toHaveBeenCalledWith(
          'click',
          expect.any(Function),
          expect.any(Object),
        );
      });
    });

    describe('hover handler', () => {
      it('should not add event listeners when animation is null', async () => {
        const { getAnimation } = await import('@wix/motion');
        (getAnimation as any).mockReturnValueOnce(null);

        const config: InteractConfig = {
          interactions: [
            {
              trigger: 'hover',
              key: 'null-hover-test',
              effects: [
                {
                  key: 'null-hover-test',
                  effectId: 'null-effect',
                },
              ],
            },
          ],
          effects: {
            'null-effect': {
              namedEffect: {
                type: 'NonExistentEffect' as any,
              } as NamedEffect,
              duration: 500,
            },
          },
        };

        Interact.create(config);

        const testElement = document.createElement('div');
        const addEventListenerSpy = vi.spyOn(testElement, 'addEventListener');

        add(testElement, 'null-hover-test');

        expect(addEventListenerSpy).not.toHaveBeenCalledWith(
          'mouseenter',
          expect.any(Function),
          expect.any(Object),
        );
        expect(addEventListenerSpy).not.toHaveBeenCalledWith(
          'mouseleave',
          expect.any(Function),
          expect.any(Object),
        );
      });
    });

    describe('animationEnd handler', () => {
      it('should not add event listener when animation is null', async () => {
        const { getAnimation } = await import('@wix/motion');
        (getAnimation as any).mockReturnValueOnce(null);

        const config: InteractConfig = {
          interactions: [
            {
              trigger: 'animationEnd',
              key: 'null-animation-end-test',
              params: {
                effectId: 'null-effect',
              },
              effects: [
                {
                  key: 'null-animation-end-test',
                  effectId: 'null-effect',
                },
              ],
            },
          ],
          effects: {
            'null-effect': {
              namedEffect: {
                type: 'NonExistentEffect' as any,
              } as NamedEffect,
              duration: 500,
            },
          },
        };

        Interact.create(config);

        const testElement = document.createElement('div');
        const addEventListenerSpy = vi.spyOn(testElement, 'addEventListener');

        add(testElement, 'null-animation-end-test');

        expect(addEventListenerSpy).not.toHaveBeenCalledWith('animationend', expect.any(Function));
      });

      // ── effectId filtering tests ──────────────────────────────────────────

      // jsdom does not expose AnimationEvent; create one manually.
      function createCSSAnimationEndEvent(animationName: string): Event {
        const event = new Event('animationend');
        Object.defineProperty(event, 'animationName', { value: animationName });
        return event;
      }

      // Shared config for filtering tests: source effect is a named preset (ArcIn)
      // with two CSS animation names: 'motion-fadeIn' and 'motion-arcIn'.
      function buildAnimEndConfig(): InteractConfig {
        return {
          interactions: [
            {
              trigger: 'animationEnd',
              key: 'anim-end-el',
              params: { effectId: 'src-effect' },
              effects: [{ key: 'anim-end-el', effectId: 'tgt-effect' }],
            },
          ],
          effects: {
            'src-effect': {
              namedEffect: { type: 'ArcIn' as any } as NamedEffect,
              duration: 1000,
            },
            'tgt-effect': {
              namedEffect: { type: 'FadeIn' as any } as NamedEffect,
              duration: 500,
            },
          },
        };
      }

      afterEach(async () => {
        // Restore getElementCSSAnimation to the default (null) so no state leaks
        // between tests in this block. vi.clearAllMocks() only clears call history,
        // not mockReturnValue implementations.
        const { getElementCSSAnimation } = await import('@wix/motion');
        (getElementCSSAnimation as any).mockReturnValue(null);
      });

      it('should NOT trigger play() when animationend fires for an animation not in the source group', async () => {
        const { getAnimation, getElementCSSAnimation } = await import('@wix/motion');

        const playMock = vi.fn();
        (getAnimation as any).mockReturnValueOnce({
          play: playMock,
          cancel: vi.fn(),
          isCSS: false,
          playState: 'idle',
          ready: Promise.resolve(),
        });

        // Source group contains 'motion-arcIn'; listener should ignore others.
        (getElementCSSAnimation as any).mockReturnValue({
          playState: 'finished',
          hasAnimationName: (name: string) => name === 'motion-arcIn',
          hasAnimationId: () => false,
        });

        Interact.create(buildAnimEndConfig());
        const el = document.createElement('div');
        add(el, 'anim-end-el');

        el.dispatchEvent(createCSSAnimationEndEvent('unrelated-animation'));

        expect(playMock).not.toHaveBeenCalled();
      });

      it('should trigger play() when the matching CSS animation in the source group finishes', async () => {
        const { getAnimation, getElementCSSAnimation } = await import('@wix/motion');

        const playMock = vi.fn();
        (getAnimation as any).mockReturnValueOnce({
          play: playMock,
          cancel: vi.fn(),
          isCSS: false,
          playState: 'idle',
          ready: Promise.resolve(),
        });

        (getElementCSSAnimation as any).mockReturnValue({
          playState: 'finished',
          hasAnimationName: (name: string) => name === 'motion-arcIn',
          hasAnimationId: () => false,
        });

        Interact.create(buildAnimEndConfig());
        const el = document.createElement('div');
        add(el, 'anim-end-el');

        el.dispatchEvent(createCSSAnimationEndEvent('motion-arcIn'));

        expect(playMock).toHaveBeenCalledOnce();
      });

      it('should NOT trigger play() when first animation in a multi-animation group finishes but others are still running', async () => {
        const { getAnimation, getElementCSSAnimation } = await import('@wix/motion');

        const playMock = vi.fn();
        (getAnimation as any).mockReturnValueOnce({
          play: playMock,
          cancel: vi.fn(),
          isCSS: false,
          playState: 'idle',
          ready: Promise.resolve(),
        });

        const fadeAnim = { animationName: 'motion-fadeIn', playState: 'finished' };
        const arcAnim = { animationName: 'motion-arcIn', playState: 'running' };
        const anims3 = [fadeAnim, arcAnim];
        (getElementCSSAnimation as any).mockReturnValue({
          get playState() {
            return anims3.some((a) => a.playState === 'running') ? 'running' : 'finished';
          },
          hasAnimationName: (name: string) => anims3.some((a) => a.animationName === name),
          hasAnimationId: () => false,
        });

        Interact.create(buildAnimEndConfig());
        const el = document.createElement('div');
        add(el, 'anim-end-el');

        // First animation in the ArcIn group ends – should NOT trigger yet.
        el.dispatchEvent(createCSSAnimationEndEvent('motion-fadeIn'));

        expect(playMock).not.toHaveBeenCalled();
      });

      it('should trigger play() only once when the last animation in the group finishes', async () => {
        const { getAnimation, getElementCSSAnimation } = await import('@wix/motion');

        const playMock = vi.fn();
        (getAnimation as any).mockReturnValueOnce({
          play: playMock,
          cancel: vi.fn(),
          isCSS: false,
          playState: 'idle',
          ready: Promise.resolve(),
        });

        const fadeAnim = { animationName: 'motion-fadeIn', playState: 'finished' };
        const arcAnim = { animationName: 'motion-arcIn', playState: 'running' };
        const anims4 = [fadeAnim, arcAnim];
        (getElementCSSAnimation as any).mockReturnValue({
          get playState() {
            return anims4.some((a) => a.playState === 'running') ? 'running' : 'finished';
          },
          hasAnimationName: (name: string) => anims4.some((a) => a.animationName === name),
          hasAnimationId: () => false,
        });

        Interact.create(buildAnimEndConfig());
        const el = document.createElement('div');
        add(el, 'anim-end-el');

        // First animation finishes – still waiting for the second.
        el.dispatchEvent(createCSSAnimationEndEvent('motion-fadeIn'));
        expect(playMock).not.toHaveBeenCalled();

        // Second animation finishes – now the whole group is done.
        arcAnim.playState = 'finished';
        el.dispatchEvent(createCSSAnimationEndEvent('motion-arcIn'));
        expect(playMock).toHaveBeenCalledOnce();
      });

      it('should trigger play() on a synthetic WAAPI animationend (no animationName) when all source animations are done', async () => {
        const { getAnimation, getElementCSSAnimation } = await import('@wix/motion');

        const playMock = vi.fn();
        (getAnimation as any).mockReturnValueOnce({
          play: playMock,
          cancel: vi.fn(),
          isCSS: false,
          playState: 'idle',
          ready: Promise.resolve(),
        });

        // WAAPI animations have no animationName; all in 'finished' state.
        (getElementCSSAnimation as any).mockReturnValue({
          playState: 'finished',
          hasAnimationName: () => false,
          hasAnimationId: () => false,
        });

        Interact.create(buildAnimEndConfig());
        const el = document.createElement('div');
        add(el, 'anim-end-el');

        // Synthetic CustomEvent dispatched by AnimationGroup.onFinish for WAAPI animations.
        el.dispatchEvent(new CustomEvent('animationend', { detail: { effectId: 'src-effect' } }));

        expect(playMock).toHaveBeenCalledOnce();
      });

      it('should NOT trigger play() on a synthetic WAAPI event when source animations are still running', async () => {
        const { getAnimation, getElementCSSAnimation } = await import('@wix/motion');

        const playMock = vi.fn();
        (getAnimation as any).mockReturnValueOnce({
          play: playMock,
          cancel: vi.fn(),
          isCSS: false,
          playState: 'idle',
          ready: Promise.resolve(),
        });

        // One WAAPI animation still running.
        (getElementCSSAnimation as any).mockReturnValue({
          playState: 'running',
          hasAnimationName: () => false,
          hasAnimationId: () => false,
        });

        Interact.create(buildAnimEndConfig());
        const el = document.createElement('div');
        add(el, 'anim-end-el');

        el.dispatchEvent(new CustomEvent('animationend', { detail: { effectId: 'src-effect' } }));

        expect(playMock).not.toHaveBeenCalled();
      });

      it('should trigger unconditionally when source animations cannot be resolved', async () => {
        const { getAnimation, getElementCSSAnimation } = await import('@wix/motion');

        const playMock = vi.fn();
        (getAnimation as any).mockReturnValueOnce({
          play: playMock,
          cancel: vi.fn(),
          isCSS: false,
          playState: 'idle',
          ready: Promise.resolve(),
        });

        // Source group not resolvable (e.g. CSS keyframeEffect not yet running).
        (getElementCSSAnimation as any).mockReturnValue(null);

        Interact.create(buildAnimEndConfig());
        const el = document.createElement('div');
        add(el, 'anim-end-el');

        // When source group cannot be resolved we do not block — any animationend triggers.
        el.dispatchEvent(createCSSAnimationEndEvent('unrelated'));
        expect(playMock).toHaveBeenCalledOnce();
      });

      it('should call getElementCSSAnimation with the source animation options from the data cache', async () => {
        const { getAnimation, getElementCSSAnimation } = await import('@wix/motion');

        const playMock = vi.fn();
        (getAnimation as any).mockReturnValueOnce({
          play: playMock,
          cancel: vi.fn(),
          isCSS: false,
          playState: 'idle',
          ready: Promise.resolve(),
        });
        (getElementCSSAnimation as any).mockReturnValue(null);

        Interact.create(buildAnimEndConfig());
        const el = document.createElement('div');
        add(el, 'anim-end-el');

        // Trigger the handler so getElementCSSAnimation is called.
        el.dispatchEvent(createCSSAnimationEndEvent('anything'));

        expect(getElementCSSAnimation).toHaveBeenCalledWith(
          el,
          expect.objectContaining({
            namedEffect: expect.objectContaining({ type: 'ArcIn' }),
            duration: 1000,
          }),
        );
      });

      it('should resolve sourceAnimationOptions from source element config when source and target differ', async () => {
        const { getAnimation, getElementCSSAnimation } = await import('@wix/motion');

        const playMock = vi.fn();
        (getAnimation as any).mockReturnValueOnce({
          play: playMock,
          cancel: vi.fn(),
          isCSS: false,
          playState: 'idle',
          ready: Promise.resolve(),
        });
        (getElementCSSAnimation as any).mockReturnValue(null);

        // Source element is 'trigger-el'; target element is 'target-el'.
        // The source effect is on 'trigger-el'; the target effect is on 'target-el'.
        const config: InteractConfig = {
          interactions: [
            {
              trigger: 'animationEnd',
              key: 'trigger-el',
              params: { effectId: 'src-fx' },
              effects: [{ key: 'target-el', effectId: 'tgt-fx' }],
            },
          ],
          effects: {
            'src-fx': {
              namedEffect: { type: 'FadeIn' as any } as NamedEffect,
              duration: 800,
            },
            'tgt-fx': {
              namedEffect: { type: 'BounceIn' as any } as NamedEffect,
              duration: 400,
            },
          },
        };

        Interact.create(config);

        const sourceEl = document.createElement('div');
        const targetEl = document.createElement('div');

        // Register target first so the controller cache entry exists when
        // the source is added and tries to look up the target.
        add(targetEl, 'target-el');
        add(sourceEl, 'trigger-el');

        // Fire an animationend on the source element.
        sourceEl.dispatchEvent(createCSSAnimationEndEvent('any'));

        // getElementCSSAnimation must be called with options derived from the
        // SOURCE effect ('src-fx' / FadeIn), not the target effect.
        expect(getElementCSSAnimation).toHaveBeenCalledWith(
          sourceEl,
          expect.objectContaining({
            namedEffect: expect.objectContaining({ type: 'FadeIn' }),
            duration: 800,
          }),
        );
      });
    });

    describe('viewProgress handler', () => {
      it('should not create scroll manager when animation is null', async () => {
        const { getWebAnimation } = await import('@wix/motion');
        (getWebAnimation as any).mockReturnValueOnce(null);

        const config: InteractConfig = {
          interactions: [
            {
              trigger: 'viewProgress',
              key: 'null-viewprogress-test',
              effects: [
                {
                  key: 'null-viewprogress-test',
                  effectId: 'null-effect',
                },
              ],
            },
          ],
          effects: {
            'null-effect': {
              namedEffect: {
                type: 'NonExistentEffect' as any,
              } as NamedEffect,
            },
          },
        };

        Interact.create(config);

        const testElement = document.createElement('div');

        // Should not throw when animation is null
        expect(() => add(testElement, 'null-viewprogress-test')).not.toThrow();
      });
    });
  });

  describe('namedEffect registry (integration)', () => {
    it('should use a registered namedEffect implementation', async () => {
      vi.resetModules();
      vi.doUnmock('@wix/motion');

      const { registerEffects } = await import('@wix/motion');

      const registeredKeyframes = [{ opacity: 0 }, { opacity: 1 }];
      const webSpy = vi.fn(() => [
        {
          name: 'RegisteredTestEffect',
          duration: 100,
          keyframes: registeredKeyframes,
        },
      ]);

      registerEffects({
        RegisteredTestEffect: {
          web: webSpy,
          getNames: () => ['RegisteredTestEffect'],
        },
      });

      const { Interact: RealInteract, add: realAdd } = await import('../src/index');

      RealInteract.create({
        interactions: [
          {
            trigger: 'click',
            key: 'namedEffect-source',
            effects: [
              {
                key: 'namedEffect-target',
                effectId: 'registered-effect',
              },
            ],
          },
        ],
        effects: {
          'registered-effect': {
            namedEffect: { type: 'RegisteredTestEffect' } as NamedEffect,
            duration: 100,
          },
        },
      });

      const sourceElement = document.createElement('div');
      const targetElement = document.createElement('div');
      (targetElement as any).getAnimations = () => [];

      realAdd(sourceElement, 'namedEffect-source');
      realAdd(targetElement, 'namedEffect-target');

      // If the effect wasn't resolved from the registry, Motion would never call this factory.
      expect(webSpy).toHaveBeenCalled();
    });
  });
});
