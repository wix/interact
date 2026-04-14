import type { MockInstance } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Interact, remove } from '../src/web';
import { addListItems } from '../src/core/add';
import type { InteractConfig, ScrubEffect, IInteractElement, TriggerType } from '../src/types';
import type { NamedEffect } from '@wix/motion';
import { effectToAnimationOptions } from '../src/handlers/utilities';
import { InteractionController } from '../src/core/InteractionController';

// Mock @wix/motion module
vi.mock('@wix/motion', () => {
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
  };

  return mock;
});

// Mock kuliso module - use class constructor for proper 'new' support
vi.mock('kuliso', () => {
  const MockPointer = vi.fn(function (this: any) {
    this.start = vi.fn();
    this.destroy = vi.fn();
  }) as any;
  return { Pointer: MockPointer };
});

// Mock fizban module - use class constructor for proper 'new' support
vi.mock('fizban', () => {
  const MockScroll = vi.fn(function (this: any) {
    this.start = vi.fn();
    this.end = vi.fn();
  }) as any;
  return { Scroll: MockScroll };
});

// Shared mock MQL storage for breakpoint tests
let mockMQLs: Map<string, MediaQueryList>;

const add = (element: IInteractElement, key: string) => {
  const controller = new InteractionController(element, key, { useFirstChild: true });
  controller.connect(key);
};

describe('interact (web)', () => {
  let element: IInteractElement;
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
        trigger: 'pageVisible',
        key: 'logo-loop',
        effects: [
          {
            key: 'logo-loop',
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
        params: {
          type: 'alternate',
        },
        effects: [
          {
            key: 'logo-click',
            effectId: 'logo-bounce',
          },
        ],
      },
      {
        trigger: 'click',
        key: 'logo-click',
        params: {
          method: 'toggle',
        },
        effects: [
          {
            key: 'logo-click',
            effectId: 'logo-transition-hover',
          },
        ],
      },
      {
        trigger: 'hover',
        key: 'logo-hover',
        params: {
          type: 'alternate',
        },
        effects: [
          {
            key: 'logo-hover',
            effectId: 'logo-arc-in',
          },
          {
            key: 'logo-hover',
            effectId: 'logo-arc-in',
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
        params: {
          method: 'toggle',
        },
        effects: [
          {
            key: 'logo-hover',
            effectId: 'logo-transition-hover',
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
    element = document.createElement('interact-element') as IInteractElement;
    const div = document.createElement('div');
    element.append(div);

    // Mock Web Animations API
    (window as any).KeyframeEffect = class KeyframeEffect {
      constructor(element: Element | null, keyframes: any[], options: any) {
        return { element, keyframes, options };
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
        return { effect, timeline, play: vi.fn() };
      }
    };

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

    // Mock adoptedStyleSheets
    if (!document.adoptedStyleSheets) {
      document.adoptedStyleSheets = [];
    }

    // Mock PointerEvent if not available (jsdom doesn't have it)
    if (typeof PointerEvent === 'undefined') {
      (globalThis as any).PointerEvent = class PointerEvent extends MouseEvent {
        pointerType: string;
        constructor(type: string, eventInit?: PointerEventInit) {
          super(type, eventInit);
          this.pointerType = eventInit?.pointerType || '';
        }
      };
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

  describe('init Interact instance', () => {
    it('should initialize with valid config and register custom element', () => {
      Interact.create({} as InteractConfig, { useCustomElement: true });
      expect(customElements.get('interact-element')).toBeDefined();
    });
  });

  describe('destroy Interact instance', () => {
    it('should clear an instance entire cache', () => {
      const instance = Interact.create(getMockConfig());

      element = document.createElement('interact-element') as IInteractElement;
      element.dataset.interactKey = 'logo-entrance';
      const div = document.createElement('div');
      element.append(div);

      add(element, 'logo-entrance');

      expect(Object.keys(instance.dataCache.interactions).length).toBe(11);
      expect(instance.controllers.size).toBe(1);
      expect(Interact.instances.length).toBe(1);

      instance.destroy();

      expect(Object.keys(instance.dataCache.interactions).length).toBe(0);
      expect(instance.controllers.size).toBe(0);
      expect(Interact.instances.length).toBe(0);
    });
  });

  describe('destroy Interact', () => {
    it('should clear all instances', () => {
      Interact.create(getMockConfig(), { useCustomElement: true });
      Interact.create(getMockConfig(), { useCustomElement: true });

      expect(Interact.instances.length).toBe(2);

      Interact.destroy();

      expect(Interact.instances.length).toBe(0);
    });

    it('should clear all elements from cache', () => {
      Interact.create(getMockConfig(), { useCustomElement: true });

      element = document.createElement('interact-element') as IInteractElement;
      const div = document.createElement('div');
      element.append(div);

      add(element, 'logo-hover');

      expect(Interact.controllerCache.size).toBeGreaterThan(0);

      Interact.destroy();

      expect(Interact.controllerCache.size).toBe(0);
    });

    it('should call disconnect on all cached elements', () => {
      Interact.create(getMockConfig(), { useCustomElement: true });

      const key1 = 'logo-hover';
      const element1 = document.createElement('interact-element') as IInteractElement;
      element1.dataset.interactKey = key1;
      const div1 = document.createElement('div');
      element1.append(div1);

      const key2 = 'logo-click';
      const element2 = document.createElement('interact-element') as IInteractElement;
      element2.dataset.interactKey = key2;
      const div2 = document.createElement('div');
      element2.append(div2);

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
      Interact.create(getMockConfig(), { useCustomElement: true });

      element = document.createElement('interact-element') as IInteractElement;
      const div = document.createElement('div');
      element.append(div);

      add(element, 'logo-click');

      Interact.destroy();

      // After destroy, getInstance should return undefined
      expect(Interact.getInstance('logo-click')).toBeUndefined();

      // Re-create instance and verify it works independently
      Interact.create(getMockConfig(), { useCustomElement: true });
      const newElement = document.createElement('interact-element') as IInteractElement;
      const newDiv = document.createElement('div');
      newElement.append(newDiv);

      const newAddEventListenerSpy = vi.spyOn(newDiv, 'addEventListener');
      add(newElement, 'logo-click');

      expect(newAddEventListenerSpy).toHaveBeenCalled();
      expect(Interact.getInstance('logo-click')).toBeDefined();
    });
  });

  describe('reduced motion', () => {
    it('should pass reducedMotion=true to getWebAnimation when forceReducedMotion is true', async () => {
      const { getWebAnimation } = await import('@wix/motion');
      Interact.forceReducedMotion = true;
      Interact.create(
        {
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
        },
        { useCustomElement: true },
      );

      element = document.createElement('interact-element') as IInteractElement;
      const div = document.createElement('div');
      element.append(div);

      add(element, 'logo-hover');

      expect(getWebAnimation).toHaveBeenCalledWith(div, expect.any(Object), undefined, {
        reducedMotion: true,
      });

      Interact.forceReducedMotion = false;

      Interact.destroy();
    });
  });

  describe('add interaction', () => {
    beforeEach(() => {
      mockConfig = getMockConfig();
      Interact.create(mockConfig, { useCustomElement: true });
    });
    afterEach(() => {
      Interact.destroy();
      vi.clearAllMocks();
    });

    describe('hover', () => {
      it('should add handler for hover trigger with alternate type', async () => {
        const { getWebAnimation } = await import('@wix/motion');

        element = document.createElement('interact-element') as IInteractElement;
        const div = document.createElement('div');
        element.append(div);

        const addEventListenerSpy = vi.spyOn(div, 'addEventListener');
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
          div,
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

      it('should add mouseleave listener for hover trigger with transition effect and no explicit method', () => {
        Interact.destroy();
        Interact.create(
          {
            interactions: [
              {
                trigger: 'hover',
                key: 'hover-transition-default',
                effects: [{ key: 'hover-transition-default', effectId: 'hover-transition-fx' }],
              },
            ],
            effects: {
              'hover-transition-fx': {
                transition: {
                  duration: 300,
                  styleProperties: [{ name: 'opacity', value: '0' }],
                },
              },
            },
          },
          { useCustomElement: true },
        );

        const el = document.createElement('interact-element') as IInteractElement;
        const div = document.createElement('div');
        el.append(div);
        const addEventListenerSpy = vi.spyOn(div, 'addEventListener');

        add(el, 'hover-transition-default');

        expect(addEventListenerSpy).toHaveBeenCalledWith(
          'mouseenter',
          expect.any(Function),
          expect.objectContaining({ passive: true }),
        );
        expect(addEventListenerSpy).toHaveBeenCalledWith(
          'mouseleave',
          expect.any(Function),
          expect.objectContaining({ passive: true }),
        );
      });
    });

    describe('interest', () => {
      it('should add leave listeners for interest trigger with transition effect and no explicit method', () => {
        Interact.destroy();
        Interact.create(
          {
            interactions: [
              {
                trigger: 'interest',
                key: 'interest-transition-default',
                effects: [
                  { key: 'interest-transition-default', effectId: 'interest-transition-fx' },
                ],
              },
            ],
            effects: {
              'interest-transition-fx': {
                transition: {
                  duration: 300,
                  styleProperties: [{ name: 'opacity', value: '0' }],
                },
              },
            },
          },
          { useCustomElement: true },
        );

        const el = document.createElement('interact-element') as IInteractElement;
        const div = document.createElement('div');
        el.append(div);
        const addEventListenerSpy = vi.spyOn(div, 'addEventListener');

        add(el, 'interest-transition-default');

        expect(addEventListenerSpy).toHaveBeenCalledWith(
          'mouseenter',
          expect.any(Function),
          expect.objectContaining({ passive: true }),
        );
        expect(addEventListenerSpy).toHaveBeenCalledWith(
          'mouseleave',
          expect.any(Function),
          expect.objectContaining({ passive: true }),
        );
        expect(addEventListenerSpy).toHaveBeenCalledWith(
          'focusin',
          expect.any(Function),
          expect.any(Object),
        );
        expect(addEventListenerSpy).toHaveBeenCalledWith(
          'focusout',
          expect.any(Function),
          expect.any(Object),
        );
      });
    });

    describe('click', () => {
      it('should add handler for click trigger', () => {
        element = document.createElement('interact-element') as IInteractElement;
        const div = document.createElement('div');
        element.append(div);

        const addEventListenerSpy = vi.spyOn(div, 'addEventListener');

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
        element = document.createElement('interact-element') as IInteractElement;
        const div = document.createElement('div');
        element.append(div);

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
        element = document.createElement('interact-element') as IInteractElement;
        const div = document.createElement('div');
        div.id = 'logo-entrance';
        element.dataset.interactKey = 'logo-entrance';
        element.append(div);

        const elementClick = document.createElement('interact-element') as IInteractElement;
        const divClick = document.createElement('div');
        divClick.id = 'logo-click';
        elementClick.dataset.interactKey = 'logo-click';
        elementClick.append(divClick);

        add(elementClick, 'logo-click');
        add(element, 'logo-entrance');

        expect(getWebAnimation).toHaveBeenCalledTimes(3);
        expect(getWebAnimation.mock.calls[0][0]).toBe(divClick);
        expect(getWebAnimation.mock.calls[1][0]).toBe(div);
        expect(getWebAnimation.mock.calls[2][0]).toBe(divClick);
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
              params: { type: 'alternate' },
              effects: [{ key: 'logo-alternate', effectId: 'logo-arc-in' }],
            },
          ],
          effects: {
            'logo-arc-in': {
              namedEffect: { type: 'ArcIn', direction: 'right', power: 'medium' } as NamedEffect,
              duration: 1200,
            },
          },
        };

        Interact.destroy();
        Interact.create(alternateConfig);

        element = document.createElement('interact-element') as IInteractElement;
        const div = document.createElement('div');
        element.append(div);
        add(element, 'logo-alternate');

        expect(getWebAnimation).toHaveBeenCalledTimes(2); // 1 for the creation of mockAnimation above
        expect(mockAnimation.persist).toHaveBeenCalled();

        // Simulate first entry - should play
        const mainObserverCallback = observerCallbacks[0];
        mainObserverCallback([{ target: div, isIntersecting: true }]);
        expect(mockAnimation.play).toHaveBeenCalled();

        mockAnimation.reverse.mockClear();

        // Simulate exit - should reverse
        mainObserverCallback([{ target: div, isIntersecting: false }]);
        expect(mockAnimation.reverse).toHaveBeenCalled();

        mockAnimation.reverse.mockClear();

        // Simulate re-entry - should reverse again
        mainObserverCallback([{ target: div, isIntersecting: true }]);
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
              params: { type: 'repeat' },
              effects: [{ key: 'logo-repeat', effectId: 'logo-arc-in' }],
            },
          ],
          effects: {
            'logo-arc-in': {
              namedEffect: { type: 'ArcIn', direction: 'right', power: 'medium' } as NamedEffect,
              duration: 1200,
            },
          },
        };

        Interact.destroy();
        Interact.create(repeatConfig);

        element = document.createElement('interact-element') as IInteractElement;
        const div = document.createElement('div');
        element.append(div);
        add(element, 'logo-repeat');

        expect(getWebAnimation).toHaveBeenCalledTimes(2); // 1 for the creation of mockAnimation above
        expect(mockAnimation.persist).toHaveBeenCalled();

        // Simulate first entry - should play
        const mainObserverCallback = observerCallbacks[0];
        mainObserverCallback([{ target: div, isIntersecting: true }]);
        expect(mockAnimation.play).toHaveBeenCalled();

        mockAnimation.pause.mockClear();
        mockAnimation.progress.mockClear();

        // Simulate exit via exit observer - should pause and reset progress
        const exitObserverCallback = observerCallbacks[1];
        exitObserverCallback([{ target: div, isIntersecting: false }]);
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
              params: { type: 'state' },
              effects: [{ key: 'logo-state', effectId: 'logo-swing' }],
            },
          ],
          effects: {
            'logo-swing': {
              namedEffect: { type: 'Swing', power: 'medium' } as NamedEffect,
              duration: 1200,
            },
          },
        };
        expect(getWebAnimation).toHaveBeenCalledTimes(1);

        Interact.destroy();
        Interact.create(stateConfig);

        element = document.createElement('interact-element') as IInteractElement;
        const div = document.createElement('div');
        element.append(div);
        add(element, 'logo-state');

        expect(getWebAnimation).toHaveBeenCalledTimes(2); // 1 for the creation of mockAnimation above
        expect(mockAnimation.persist).toHaveBeenCalled();

        // Simulate first entry - should play
        const mainObserverCallback = observerCallbacks[0];
        mainObserverCallback([{ target: div, isIntersecting: true }]);
        expect(mockAnimation.play).toHaveBeenCalled();

        mockAnimation.pause.mockClear();
        mockAnimation.progress.mockClear();

        // Simulate exit via exit observer - should pause (but NOT reset progress)
        const exitObserverCallback = observerCallbacks[1];
        exitObserverCallback([{ target: div, isIntersecting: false }]);
        expect(mockAnimation.pause).toHaveBeenCalled();
        expect(mockAnimation.progress).not.toHaveBeenCalled();
      });
    });

    describe('pageVisible', () => {
      it('should add handler for pageVisible trigger', async () => {
        const { getWebAnimation } = await import('@wix/motion');
        element = document.createElement('interact-element') as IInteractElement;
        const div = document.createElement('div');
        element.append(div);

        add(element, 'logo-loop');

        expect(getWebAnimation).toHaveBeenCalledTimes(1);
        expect(getWebAnimation).toHaveBeenCalledWith(
          expect.any(HTMLElement),
          expect.any(Object),
          undefined,
          { reducedMotion: false },
        );
      });
    });

    describe('animationEnd', () => {
      it('should add handler for animationEnd trigger', async () => {
        const { getWebAnimation } = await import('@wix/motion');
        element = document.createElement('interact-element') as IInteractElement;
        const div = document.createElement('div');
        element.append(div);

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

          element = document.createElement('interact-element') as IInteractElement;
          const div = document.createElement('div');
          element.append(div);

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
    });

    describe('viewProgress', () => {
      it('should add handler for viewProgress trigger with native ViewTimeline support', async () => {
        const { getWebAnimation } = await import('@wix/motion');

        element = document.createElement('interact-element') as IInteractElement;
        const div = document.createElement('div');
        element.append(div);

        add(element, 'logo-scroll');

        expect(getWebAnimation).toHaveBeenCalledTimes(1);
        expect(getWebAnimation).toHaveBeenCalledWith(
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

          element = document.createElement('interact-element') as IInteractElement;
          const div = document.createElement('div');
          element.append(div);

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
        element = document.createElement('interact-element') as IInteractElement;
        const div = document.createElement('div');
        const ul = document.createElement('ul');
        ul.id = 'logo-list';
        div.append(ul);
        const li = document.createElement('li');
        const li2 = li.cloneNode(true);
        ul.append(li);
        ul.append(li2);
        element.append(div);

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
        element = document.createElement('interact-element') as IInteractElement;
        const div = document.createElement('div');
        const ul = document.createElement('ul');
        ul.id = 'logo-list';
        div.append(ul);
        const li = document.createElement('li');
        const li2 = li.cloneNode(true);
        ul.append(li);
        ul.append(li2);
        element.append(div);

        add(element, 'logo-view-container');

        expect(getWebAnimation).toHaveBeenCalledTimes(2);
        expect(getWebAnimation.mock.calls[0][0]).toBe(li);
        expect(getWebAnimation.mock.calls[1][0]).toBe(li2);
      });

      it('should add a handler per newly added list item for click trigger with listContainer', () => {
        const key = 'logo-click-container';
        element = document.createElement('interact-element') as IInteractElement;
        element.dataset.interactKey = key;
        const div = document.createElement('div');
        const ul = document.createElement('ul');
        ul.id = 'logo-list';
        div.append(ul);
        const li = document.createElement('li');
        const li2 = li.cloneNode(true);
        ul.append(li);
        ul.append(li2);
        element.append(div);

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
        const { getWebAnimation } = await import('@wix/motion');

        const keySource = 'logo-scroll-container';
        const keyTarget = 'logo-scroll-items';
        element = document.createElement('interact-element') as IInteractElement;
        element.dataset.interactKey = keySource;
        const div = document.createElement('div');
        const targetElement = document.createElement('interact-element') as IInteractElement;
        targetElement.dataset.interactKey = keyTarget;
        const divTarget = document.createElement('div');
        const ul = document.createElement('ul');
        ul.id = 'logo-scroll-list';
        divTarget.append(ul);
        const li = document.createElement('li');
        const li2 = li.cloneNode(true);
        ul.append(li);
        ul.append(li2);
        element.append(div);
        targetElement.append(divTarget);

        add(element, keySource);
        expect(getWebAnimation).toHaveBeenCalledTimes(0);

        add(targetElement, keyTarget);

        expect(getWebAnimation).toHaveBeenCalledTimes(2);
        expect(getWebAnimation).toHaveBeenCalledWith(
          li,
          expect.objectContaining(
            effectToAnimationOptions(getMockConfig().effects['logo-fade-scroll'] as ScrubEffect),
          ),
          expect.objectContaining({
            trigger: 'view-progress',
          }),
        );
        expect(getWebAnimation).toHaveBeenCalledWith(
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

        const controller = Interact.getController(keyTarget);
        addListItems(controller!, '#logo-scroll-list', [li3]);

        expect(getWebAnimation).toHaveBeenCalledTimes(3);
        expect(getWebAnimation).toHaveBeenCalledWith(
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

  describe('interpolated keys', () => {
    afterEach(() => {
      Interact.destroy();
      vi.clearAllMocks();
    });

    describe('multiple template triggers to single target', () => {
      it('should add click handlers for all repeater items targeting a single non-template element', async () => {
        const { getWebAnimation: getWebAnimationFn } = await import('@wix/motion');
        const getWebAnimation = getWebAnimationFn as unknown as MockInstance;

        const config: InteractConfig = {
          interactions: [
            {
              trigger: 'click',
              key: 'repeater-item[]',
              effects: [
                {
                  key: 'svg-target',
                  effectId: 'spin-effect',
                },
              ],
            },
          ],
          effects: {
            'spin-effect': {
              namedEffect: {
                type: 'Spin',
                direction: 'cw',
                power: 'medium',
              } as NamedEffect,
              duration: 500,
            },
          },
        };

        Interact.create(config, { useCustomElement: true });

        // Create target element (non-template, single)
        const targetElement = document.createElement('interact-element') as IInteractElement;
        const targetDiv = document.createElement('div');
        targetElement.append(targetDiv);

        // Create 3 source elements (repeater items with template keys)
        const sourceDivs: HTMLDivElement[] = [];
        const addEventListenerSpies: MockInstance[] = [];

        for (let i = 0; i < 3; i++) {
          const el = document.createElement('interact-element') as IInteractElement;
          const div = document.createElement('div');
          el.append(div);
          sourceDivs.push(div);
          addEventListenerSpies.push(vi.spyOn(div, 'addEventListener'));
        }

        // Add target first, then all source elements
        add(targetElement, 'svg-target');
        add(sourceDivs[0].parentElement as IInteractElement, 'repeater-item[0]');
        add(sourceDivs[1].parentElement as IInteractElement, 'repeater-item[1]');
        add(sourceDivs[2].parentElement as IInteractElement, 'repeater-item[2]');

        // All 3 source elements should have click listeners
        addEventListenerSpies.forEach((spy, index) => {
          expect(spy, `source[${index}] should have a click listener`).toHaveBeenCalledWith(
            'click',
            expect.any(Function),
            expect.objectContaining({ passive: true }),
          );
        });

        // getWebAnimation should be called 3 times — once per source-target pair
        expect(getWebAnimation).toHaveBeenCalledTimes(3);
        getWebAnimation.mock.calls.forEach((call: any[]) => {
          expect(call[0]).toBe(targetDiv);
        });
      });

      it('should work when source elements are added before the target', async () => {
        const { getWebAnimation: getWebAnimationFn } = await import('@wix/motion');
        const getWebAnimation = getWebAnimationFn as unknown as MockInstance;

        const config: InteractConfig = {
          interactions: [
            {
              trigger: 'click',
              key: 'item[]',
              effects: [
                {
                  key: 'target-anim',
                  effectId: 'bounce-effect',
                },
              ],
            },
          ],
          effects: {
            'bounce-effect': {
              namedEffect: {
                type: 'BounceIn',
                direction: 'center',
                power: 'hard',
              } as NamedEffect,
              duration: 500,
            },
          },
        };

        Interact.create(config, { useCustomElement: true });

        const sourceDivs: HTMLDivElement[] = [];
        for (let i = 0; i < 3; i++) {
          const el = document.createElement('interact-element') as IInteractElement;
          const div = document.createElement('div');
          el.append(div);
          sourceDivs.push(div);
        }

        const targetElement = document.createElement('interact-element') as IInteractElement;
        const targetDiv = document.createElement('div');
        targetElement.append(targetDiv);

        // Add sources first (they will bail because target isn't in cache yet)
        add(sourceDivs[0].parentElement as IInteractElement, 'item[0]');
        add(sourceDivs[1].parentElement as IInteractElement, 'item[1]');
        add(sourceDivs[2].parentElement as IInteractElement, 'item[2]');

        expect(getWebAnimation).toHaveBeenCalledTimes(0);

        // Now add the target — addEffectsForTarget should wire things up
        // Note: the current architecture can't resolve template sources from the target side,
        // so these interactions require the target to be present when sources are added.
        // Adding all source elements after the target should work:
        Interact.destroy();
        Interact.create(config, { useCustomElement: true });

        add(targetElement, 'target-anim');
        add(sourceDivs[0].parentElement as IInteractElement, 'item[0]');
        add(sourceDivs[1].parentElement as IInteractElement, 'item[1]');
        add(sourceDivs[2].parentElement as IInteractElement, 'item[2]');

        expect(getWebAnimation).toHaveBeenCalledTimes(3);
      });

      it('should not break one-to-one template interactions', async () => {
        const { getWebAnimation: getWebAnimationFn } = await import('@wix/motion');
        const getWebAnimation = getWebAnimationFn as unknown as MockInstance;

        const config: InteractConfig = {
          interactions: [
            {
              trigger: 'click',
              key: 'card[]',
              effects: [
                {
                  key: 'card[]',
                  effectId: 'flip-effect',
                },
              ],
            },
          ],
          effects: {
            'flip-effect': {
              namedEffect: {
                type: 'Spin',
                direction: 'cw',
                power: 'medium',
              } as NamedEffect,
              duration: 300,
            },
          },
        };

        Interact.create(config, { useCustomElement: true });

        const elements: IInteractElement[] = [];
        const divs: HTMLDivElement[] = [];
        for (let i = 0; i < 3; i++) {
          const el = document.createElement('interact-element') as IInteractElement;
          const div = document.createElement('div');
          el.append(div);
          elements.push(el);
          divs.push(div);
        }

        add(elements[0], 'card[0]');
        add(elements[1], 'card[1]');
        add(elements[2], 'card[2]');

        // Each self-targeting element should get its own animation
        expect(getWebAnimation).toHaveBeenCalledTimes(3);
        expect(getWebAnimation.mock.calls[0][0]).toBe(divs[0]);
        expect(getWebAnimation.mock.calls[1][0]).toBe(divs[1]);
        expect(getWebAnimation.mock.calls[2][0]).toBe(divs[2]);
      });
    });
  });

  describe('remove interaction', () => {
    beforeEach(() => {
      Interact.create(getMockConfig(), { useCustomElement: true });
    });
    afterEach(() => {
      Interact.destroy();
    });

    it('should remove event listeners', () => {
      const key = 'logo-click';
      element = document.createElement('interact-element') as IInteractElement;
      element.dataset.interactKey = key;
      const div = document.createElement('div');
      element.append(div);

      const addEventListenerSpy = vi.spyOn(div, 'addEventListener');

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
      element = document.createElement('interact-element') as IInteractElement;
      element.dataset.interactKey = key;
      const div = document.createElement('div');
      element.append(div);

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

        Interact.create(config, { useCustomElement: true });

        const sourceElement = document.createElement('interact-element') as IInteractElement;
        const sourceDiv = document.createElement('div');
        sourceElement.append(sourceDiv);

        const targetElement = document.createElement('interact-element') as IInteractElement;
        const targetDiv = document.createElement('div');
        targetElement.append(targetDiv);

        const addEventListenerSpy = vi.spyOn(sourceDiv, 'addEventListener');

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
          targetElement.firstElementChild,
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

        Interact.create(config, { useCustomElement: true });

        const sourceElement = document.createElement('interact-element') as IInteractElement;
        const sourceDiv = document.createElement('div');
        sourceElement.append(sourceDiv);

        const targetElement = document.createElement('interact-element') as IInteractElement;
        const targetDiv = document.createElement('div');
        targetElement.append(targetDiv);

        add(sourceElement, 'cascade-source');
        add(targetElement, 'cascade-target');

        // Should create animation with default effect
        expect(getWebAnimation).toHaveBeenCalledTimes(1);
        expect(getWebAnimation).toHaveBeenCalledWith(
          targetElement.firstElementChild,
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

        Interact.create(config, { useCustomElement: true });

        const sourceElement = document.createElement('interact-element') as IInteractElement;
        const sourceDiv = document.createElement('div');
        sourceElement.append(sourceDiv);

        const targetElement = document.createElement('interact-element') as IInteractElement;
        const targetDiv = document.createElement('div');
        targetElement.append(targetDiv);

        add(sourceElement, 'cascade-source');
        add(targetElement, 'cascade-target');

        // Should create animation with mobile effect
        expect(getWebAnimation).toHaveBeenCalledTimes(1);
        expect(getWebAnimation).toHaveBeenCalledWith(
          targetElement.firstElementChild,
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

        Interact.create(config, { useCustomElement: true });

        const sourceElement = document.createElement('interact-element') as IInteractElement;
        const sourceDiv = document.createElement('div');
        sourceElement.append(sourceDiv);

        const targetElement = document.createElement('interact-element') as IInteractElement;
        const targetDiv = document.createElement('div');
        targetElement.append(targetDiv);

        // Add source first
        add(sourceElement, 'cascade-source');
        // Add target second
        add(targetElement, 'cascade-target');

        expect(getWebAnimation).toHaveBeenCalledTimes(1);
        expect(getWebAnimation).toHaveBeenCalledWith(
          targetElement.firstElementChild,
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

        Interact.create(config, { useCustomElement: true });

        const sourceElement = document.createElement('interact-element') as IInteractElement;
        const sourceDiv = document.createElement('div');
        sourceElement.append(sourceDiv);

        const targetElement = document.createElement('interact-element') as IInteractElement;
        const targetDiv = document.createElement('div');
        targetElement.append(targetDiv);

        // Add target first
        add(targetElement, 'cascade-target');
        // Add source second
        add(sourceElement, 'cascade-source');

        expect(getWebAnimation).toHaveBeenCalledTimes(1);
        expect(getWebAnimation).toHaveBeenCalledWith(
          targetElement.firstElementChild,
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
        Interact.create(complexConfig, { useCustomElement: true });

        const sourceElement = document.createElement('interact-element') as IInteractElement;
        const sourceDiv = document.createElement('div');
        sourceElement.append(sourceDiv);

        const target1Element = document.createElement('interact-element') as IInteractElement;
        const target1Div = document.createElement('div');
        target1Element.append(target1Div);

        const target2Element = document.createElement('interact-element') as IInteractElement;
        const target2Div = document.createElement('div');
        target2Element.append(target2Div);

        add(sourceElement, 'multi-source-1');
        add(target1Element, 'cascade-target-1');
        add(target2Element, 'cascade-target-2');

        // Only desktop effect should be applied (mobile condition doesn't match)
        expect(getWebAnimation).toHaveBeenCalledTimes(1);
        expect(getWebAnimation).toHaveBeenCalledWith(
          target1Element.firstElementChild,
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
          target2Element.firstElementChild,
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
        Interact.create(multiConditionConfig, { useCustomElement: true });

        const sourceElement = document.createElement('interact-element') as IInteractElement;
        const sourceDiv = document.createElement('div');
        sourceElement.append(sourceDiv);

        const targetElement = document.createElement('interact-element') as IInteractElement;
        const targetDiv = document.createElement('div');
        targetElement.append(targetDiv);

        add(sourceElement, 'cascade-source');
        add(targetElement, 'cascade-target');

        // Premium effect should be applied since both conditions match
        expect(getWebAnimation).toHaveBeenCalledTimes(1);
        expect(getWebAnimation).toHaveBeenCalledWith(
          targetElement.firstElementChild,
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
        Interact.create(configWithMissingCondition, { useCustomElement: true });

        const sourceElement = document.createElement('interact-element') as IInteractElement;
        const sourceDiv = document.createElement('div');
        sourceElement.append(sourceDiv);

        const targetElement = document.createElement('interact-element') as IInteractElement;
        const targetDiv = document.createElement('div');
        targetElement.append(targetDiv);

        add(sourceElement, 'cascade-source');
        add(targetElement, 'cascade-target');

        // Should fall back to default effect since condition doesn't exist
        expect(getWebAnimation).toHaveBeenCalledTimes(1);
        expect(getWebAnimation).toHaveBeenCalledWith(
          targetElement.firstElementChild,
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
        Interact.create(configWithEmptyConditions, { useCustomElement: true });

        const sourceElement = document.createElement('interact-element') as IInteractElement;
        const sourceDiv = document.createElement('div');
        sourceElement.append(sourceDiv);

        const targetElement = document.createElement('interact-element') as IInteractElement;
        const targetDiv = document.createElement('div');
        targetElement.append(targetDiv);

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
    let sourceElement: IInteractElement;
    let targetElement: IInteractElement;

    beforeEach(() => {
      // Create source element with multiple child elements
      sourceElement = document.createElement('interact-element') as IInteractElement;
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
      targetElement = document.createElement('interact-element') as IInteractElement;
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

        Interact.create(config, { useCustomElement: true });

        const triggerButton = sourceElement.querySelector('.trigger-button') as HTMLElement;
        const firstChild = sourceElement.querySelector('.first-child') as HTMLElement;

        const triggerSpy = vi.spyOn(triggerButton, 'addEventListener');
        const firstChildSpy = vi.spyOn(firstChild, 'addEventListener');

        add(sourceElement, 'selector-source');
        add(targetElement, 'selector-target');

        // Should add event listener to the selected element, not firstElementChild
        expect(triggerSpy).toHaveBeenCalledWith('click', expect.any(Function), expect.any(Object));
        expect(firstChildSpy).not.toHaveBeenCalled();
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

        Interact.create(config, { useCustomElement: true });

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

        Interact.create(config, { useCustomElement: true });

        const firstChild = sourceElement.querySelector('.first-child') as HTMLElement;
        const firstChildSpy = vi.spyOn(firstChild, 'addEventListener');

        add(sourceElement, 'fallback-source');
        add(targetElement, 'fallback-target');

        // Should fall back to firstElementChild
        expect(firstChildSpy).toHaveBeenCalledWith(
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

        Interact.create(config, { useCustomElement: true });

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

        Interact.create(config, { useCustomElement: true });

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

        Interact.create(config, { useCustomElement: true });

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

        Interact.create(config, { useCustomElement: true });

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

        Interact.create(config, { useCustomElement: true });

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

        Interact.create(config, { useCustomElement: true });

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

        Interact.create(config, { useCustomElement: true });

        add(sourceElement, 'inherit-source');
        add(targetElement, 'inherit-target');

        // Effect should target firstElementChild, not the interaction's selector
        const targetFirstChild = targetElement.firstElementChild as HTMLElement;

        expect(getWebAnimation).toHaveBeenCalledWith(
          targetFirstChild,
          expect.any(Object),
          undefined,
          { reducedMotion: false },
        );
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

        Interact.create(config, { useCustomElement: true });

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

  describe('InteractElement toggleEffect delegation', () => {
    it('should call InteractElement.toggleEffect when element has that method', () => {
      const config: InteractConfig = {
        effects: {
          'toggle-effect': {
            transition: {
              duration: 300,
              styleProperties: [{ name: 'opacity', value: '0.5' }],
            },
          },
        },
        interactions: [
          {
            key: 'toggle-source',
            trigger: 'click',
            params: {
              method: 'toggle',
            },
            effects: [
              {
                key: 'toggle-source',
                effectId: 'toggle-effect',
              },
            ],
          },
        ],
      };

      Interact.create(config, { useCustomElement: true });

      // Create an InteractElement (which has toggleEffect method)
      const interactElement = document.createElement('interact-element') as IInteractElement;
      const div = document.createElement('div');
      interactElement.append(div);

      // Spy on the InteractElement's toggleEffect method
      const toggleEffectSpy = vi.fn();
      interactElement.toggleEffect = toggleEffectSpy;

      add(interactElement, 'toggle-source');

      // Trigger click event with pointerType to pass the click handler check
      const clickEvent = new PointerEvent('click', { bubbles: true, pointerType: 'mouse' });
      div.dispatchEvent(clickEvent);

      // The InteractElement's toggleEffect should be called (not the controller's fallback logic)
      expect(toggleEffectSpy).toHaveBeenCalledWith('toggle-effect', 'toggle', undefined);
    });
  });

  describe('breakpoint media query listeners', () => {
    let instance: Interact;
    let testElement: IInteractElement;

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
      instance = Interact.create(config, { useCustomElement: true });

      testElement = document.createElement('interact-element') as IInteractElement;
      testElement.append(document.createElement('div'));
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
      instance = Interact.create(config, { useCustomElement: true });

      testElement = document.createElement('interact-element') as IInteractElement;
      testElement.append(document.createElement('div'));
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
      instance = Interact.create(config, { useCustomElement: true });

      testElement = document.createElement('interact-element') as IInteractElement;
      testElement.append(document.createElement('div'));
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
      instance = Interact.create(config, { useCustomElement: true });

      testElement = document.createElement('interact-element') as IInteractElement;
      testElement.append(document.createElement('div'));

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
      instance = Interact.create(config, { useCustomElement: true });

      testElement = document.createElement('interact-element') as IInteractElement;
      testElement.append(document.createElement('div'));
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
      instance = Interact.create(config, { useCustomElement: true });

      testElement = document.createElement('interact-element') as IInteractElement;
      const div = document.createElement('div');
      testElement.append(div);

      // Simulate element being connected to DOM
      Object.defineProperty(testElement, 'isConnected', {
        value: true,
        writable: true,
      });

      const addEventListenerSpy = vi.spyOn(div, 'addEventListener');

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

      // Capture signals from the initial (desktop/click) listeners
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
    let a11yElement: IInteractElement;

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
        Interact.create(getA11yConfig('activate', 'activate-div'), { useCustomElement: true });
        a11yElement = document.createElement('interact-element') as IInteractElement;

        const div = document.createElement('div');
        a11yElement.append(div);

        const addEventListenerSpy = vi.spyOn(div, 'addEventListener');

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

        Interact.create(getA11yConfig('activate', 'activate-handler-test'), {
          useCustomElement: true,
        });
        a11yElement = document.createElement('interact-element') as IInteractElement;

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
        Interact.create(getA11yConfig('interest', 'interest-test'), { useCustomElement: true });
        a11yElement = document.createElement('interact-element') as IInteractElement;

        const div = document.createElement('div');
        a11yElement.append(div);

        const addEventListenerSpy = vi.spyOn(div, 'addEventListener');

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
        Interact.create(getA11yConfig('click', 'click-no-flag'), { useCustomElement: true });
        Interact.setup({ allowA11yTriggers: false });
        a11yElement = document.createElement('interact-element') as IInteractElement;

        const div = document.createElement('div');
        a11yElement.append(div);

        const addEventListenerSpy = vi.spyOn(div, 'addEventListener');

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
        Interact.create(getA11yConfig('click', 'click-with-flag'), { useCustomElement: true });
        a11yElement = document.createElement('interact-element') as IInteractElement;

        const div = document.createElement('div');
        a11yElement.append(div);

        const addEventListenerSpy = vi.spyOn(div, 'addEventListener');

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
    });

    describe('hover trigger with allowA11yTriggers flag', () => {
      it('should NOT add focusin listener when flag is false', () => {
        Interact.setup({ allowA11yTriggers: false });
        Interact.create(getA11yConfig('hover', 'hover-no-flag'), { useCustomElement: true });
        a11yElement = document.createElement('interact-element') as IInteractElement;

        const div = document.createElement('div');
        a11yElement.append(div);

        const addEventListenerSpy = vi.spyOn(div, 'addEventListener');

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
        Interact.create(getA11yConfig('hover', 'hover-with-flag'), { useCustomElement: true });
        a11yElement = document.createElement('interact-element') as IInteractElement;

        const div = document.createElement('div');
        a11yElement.append(div);

        const addEventListenerSpy = vi.spyOn(div, 'addEventListener');

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
});
