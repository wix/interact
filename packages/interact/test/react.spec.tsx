import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { useRef, useEffect } from 'react';
import { Interaction, createInteractRef, Interact } from '../src/react';
import * as domApi from '../src/dom/api';
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

describe('interact (react)', () => {
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
        trigger: 'hover',
        key: 'logo-hover',
        effects: [
          {
            key: 'logo-hover',
            effectId: 'logo-arc-in',
            triggerType: 'alternate',
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
    },
  });

  beforeEach(() => {
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
        return { replace: vi.fn(), insertRule: vi.fn() };
      }
    };

    // Mock adoptedStyleSheets
    if (!document.adoptedStyleSheets) {
      document.adoptedStyleSheets = [];
    }

    // Mock matchMedia for condition testing
    mockMQLs = new Map();
    mockMatchMedia();
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

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    // Clear Interact instances to ensure test isolation
    Interact.destroy();
    // Reset forceReducedMotion to default
    Interact.forceReducedMotion = undefined;
  });

  describe('createInteractRef', () => {
    beforeEach(() => {
      Interact.create(getMockConfig());
    });

    it('should call add() when ref receives a DOM node', () => {
      const addSpy = vi.spyOn(domApi, 'add');
      const interactKey = 'logo-click';
      const ref = createInteractRef(interactKey);

      const element = document.createElement('div');
      const child = document.createElement('div');
      element.append(child);

      ref(element);

      expect(addSpy).toHaveBeenCalledWith(element, interactKey);
    });

    it('should call remove() when ref receives null (React 18 unmount pattern)', () => {
      const removeSpy = vi.spyOn(domApi, 'remove');
      const interactKey = 'logo-click';
      const ref = createInteractRef(interactKey);

      // First mount
      const element = document.createElement('div');
      const child = document.createElement('div');
      element.append(child);
      ref(element);

      // Then unmount (React 18 pattern: ref(null))
      ref(null);

      expect(removeSpy).toHaveBeenCalledWith(interactKey);
    });

    it('should return a cleanup function that calls remove() (React 19 pattern)', () => {
      const removeSpy = vi.spyOn(domApi, 'remove');
      const interactKey = 'logo-click';
      const ref = createInteractRef(interactKey);

      const element = document.createElement('div');
      const child = document.createElement('div');
      element.append(child);

      const cleanup = ref(element);

      // Clear previous calls
      removeSpy.mockClear();

      // Call cleanup (React 19 pattern)
      cleanup();

      expect(removeSpy).toHaveBeenCalledWith(interactKey);
    });

    it('should work with the same key across multiple renders', () => {
      const addSpy = vi.spyOn(domApi, 'add');
      const interactKey = 'logo-click';
      const ref = createInteractRef(interactKey);

      const element1 = document.createElement('div');
      element1.append(document.createElement('div'));
      ref(element1);

      // Unmount
      ref(null);

      // Re-mount with new element
      const element2 = document.createElement('div');
      element2.append(document.createElement('div'));
      ref(element2);

      expect(addSpy).toHaveBeenCalledTimes(2);
      expect(addSpy).toHaveBeenNthCalledWith(1, element1, interactKey);
      expect(addSpy).toHaveBeenNthCalledWith(2, element2, interactKey);
    });
  });

  describe('Interaction component', () => {
    beforeEach(() => {
      Interact.create(getMockConfig());
    });

    it('should render the correct HTML tag based on tagName prop', () => {
      const { container } = render(
        <Interaction tagName="section" interactKey="logo-click">
          <div>Content</div>
        </Interaction>,
      );

      expect(container.querySelector('section')).not.toBeNull();
    });

    it('should set data-interact-key attribute on the element', () => {
      const { container } = render(
        <Interaction tagName="div" interactKey="logo-click">
          <span>Content</span>
        </Interaction>,
      );

      const element = container.firstChild as HTMLElement;
      expect(element.getAttribute('data-interact-key')).toBe('logo-click');
    });

    it('should pass through additional props to the rendered element', () => {
      const { container } = render(
        <Interaction
          tagName="div"
          interactKey="logo-click"
          className="test-class"
          id="test-id"
          data-testid="custom-data"
        >
          <span>Content</span>
        </Interaction>,
      );

      const element = container.firstChild as HTMLElement;
      expect(element.className).toBe('test-class');
      expect(element.id).toBe('test-id');
      expect(element.getAttribute('data-testid')).toBe('custom-data');
    });

    it('should render children correctly', () => {
      const { container } = render(
        <Interaction tagName="div" interactKey="logo-click">
          <span className="child-1">First</span>
          <span className="child-2">Second</span>
        </Interaction>,
      );

      expect(container.querySelector('.child-1')).not.toBeNull();
      expect(container.querySelector('.child-2')).not.toBeNull();
      expect(container.querySelector('.child-1')?.textContent).toBe('First');
      expect(container.querySelector('.child-2')?.textContent).toBe('Second');
    });

    it('should forward ref to the underlying element', () => {
      const refValue = { current: null as HTMLDivElement | null };

      function TestComponent() {
        const ref = useRef<HTMLDivElement>(null);
        useEffect(() => {
          refValue.current = ref.current;
        });

        return (
          <Interaction tagName="div" interactKey="logo-click" ref={ref}>
            <span>Content</span>
          </Interaction>
        );
      }

      const { container } = render(<TestComponent />);

      // After render, the ref should point to the actual element
      const element = container.firstChild as HTMLElement;
      // Note: We need to access ref after render is complete
      expect(element.getAttribute('data-interact-key')).toBe('logo-click');
    });

    it('should call add() on mount with the correct interactKey', () => {
      const addSpy = vi.spyOn(domApi, 'add');

      render(
        <Interaction tagName="div" interactKey="logo-hover">
          <span>Content</span>
        </Interaction>,
      );

      expect(addSpy).toHaveBeenCalledWith(expect.any(HTMLElement), 'logo-hover');
    });

    it('should call remove() on unmount', () => {
      const removeSpy = vi.spyOn(domApi, 'remove');

      const { unmount } = render(
        <Interaction tagName="div" interactKey="logo-hover">
          <span>Content</span>
        </Interaction>,
      );

      removeSpy.mockClear();
      unmount();

      expect(removeSpy).toHaveBeenCalledWith('logo-hover');
    });

    it('should handle re-renders without duplicate add() calls', () => {
      const addSpy = vi.spyOn(domApi, 'add');

      const { rerender } = render(
        <Interaction tagName="div" interactKey="logo-click">
          <span>Content 1</span>
        </Interaction>,
      );

      const initialAddCount = addSpy.mock.calls.length;

      // Re-render with different children
      rerender(
        <Interaction tagName="div" interactKey="logo-click">
          <span>Content 2</span>
        </Interaction>,
      );

      // add() should not be called again on re-render
      expect(addSpy.mock.calls.length).toBe(initialAddCount);
    });
  });

  describe('integration tests', () => {
    it('should set up hover interactions when using Interaction component', async () => {
      const { getWebAnimation } = await import('@wix/motion');

      Interact.create(getMockConfig());

      render(
        <Interaction tagName="div" interactKey="logo-hover">
          <div className="inner">Hover me</div>
        </Interaction>,
      );

      // The interaction should already be set up
      // Check if the animation was created
      expect(getWebAnimation).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        expect.any(Object),
        undefined,
        { reducedMotion: false },
      );
    });

    it('should set up click interactions when using Interaction component', async () => {
      const { getWebAnimation } = await import('@wix/motion');

      Interact.create(getMockConfig());

      const { container } = render(
        <Interaction tagName="div" interactKey="logo-click">
          <button className="btn">Click me</button>
        </Interaction>,
      );

      const btnElement = container.querySelector('.btn') as HTMLElement;

      // Verify the component is rendered correctly
      expect(btnElement).not.toBeNull();
      expect(container.firstChild).toHaveProperty('dataset');

      expect(getWebAnimation).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        expect.any(Object),
        undefined,
        { reducedMotion: false },
      );
    });

    it('should set up viewEnter interactions when using Interaction component', async () => {
      const { getWebAnimation } = await import('@wix/motion');

      Interact.create(getMockConfig());

      render(
        <Interaction tagName="div" interactKey="logo-entrance">
          <div>Entrance animation target</div>
        </Interaction>,
      );

      expect(getWebAnimation).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        expect.any(Object),
        undefined,
        { reducedMotion: false },
      );
    });

    it('should set up viewEnter interactions with alternate type and reverse on exit', async () => {
      const { getWebAnimation } = await import('@wix/motion');
      const mockAnimation = (getWebAnimation as any)();

      // Capture observer callbacks
      const observerCallbacks: Array<(entries: Partial<IntersectionObserverEntry>[]) => void> = [];
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

      Interact.create(alternateConfig);

      const { container } = render(
        <Interaction tagName="div" interactKey="logo-alternate">
          <div>Alternate animation target</div>
        </Interaction>,
      );

      expect(getWebAnimation).toHaveBeenCalled();
      expect(mockAnimation.persist).toHaveBeenCalled();

      const targetElement = container.firstChild as HTMLElement;

      // Simulate first entry - should play
      const mainObserverCallback = observerCallbacks[0];
      mainObserverCallback([{ target: targetElement, isIntersecting: true }]);
      expect(mockAnimation.play).toHaveBeenCalled();

      mockAnimation.reverse.mockClear();

      // Simulate exit - should reverse
      mainObserverCallback([{ target: targetElement, isIntersecting: false }]);
      expect(mockAnimation.reverse).toHaveBeenCalled();

      mockAnimation.reverse.mockClear();

      // Simulate re-entry - should reverse again
      mainObserverCallback([{ target: targetElement, isIntersecting: true }]);
      expect(mockAnimation.reverse).toHaveBeenCalled();
    });

    it('should set up viewEnter interactions with repeat type and pause+reset on exit', async () => {
      const viewEnterHandler = (await import('../src/handlers/viewEnter')).default;
      viewEnterHandler.reset();

      const { getWebAnimation } = await import('@wix/motion');
      const mockAnimation = (getWebAnimation as any)();

      // Capture observer callbacks
      const observerCallbacks: Array<(entries: Partial<IntersectionObserverEntry>[]) => void> = [];
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

      Interact.create(repeatConfig);

      const { container } = render(
        <Interaction tagName="div" interactKey="logo-repeat">
          <div>Repeat animation target</div>
        </Interaction>,
      );

      expect(getWebAnimation).toHaveBeenCalled();
      expect(mockAnimation.persist).toHaveBeenCalled();

      const targetElement = container.firstChild as HTMLElement;

      // Simulate first entry - should play
      const mainObserverCallback = observerCallbacks[0];
      mainObserverCallback([{ target: targetElement, isIntersecting: true }]);
      expect(mockAnimation.play).toHaveBeenCalled();

      mockAnimation.pause.mockClear();
      mockAnimation.progress.mockClear();

      // Simulate exit via exit observer - should pause and reset progress
      const exitObserverCallback = observerCallbacks[1];
      exitObserverCallback([{ target: targetElement, isIntersecting: false }]);
      expect(mockAnimation.pause).toHaveBeenCalled();
      expect(mockAnimation.progress).toHaveBeenCalledWith(0);
    });

    it('should set up viewEnter interactions with state type and pause on exit', async () => {
      const viewEnterHandler = (await import('../src/handlers/viewEnter')).default;
      viewEnterHandler.reset();

      const { getWebAnimation } = await import('@wix/motion');
      const mockAnimation = (getWebAnimation as any)();

      // Capture observer callbacks
      const observerCallbacks: Array<(entries: Partial<IntersectionObserverEntry>[]) => void> = [];
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

      Interact.create(stateConfig);

      const { container } = render(
        <Interaction tagName="div" interactKey="logo-state">
          <div>State animation target</div>
        </Interaction>,
      );

      expect(getWebAnimation).toHaveBeenCalled();
      expect(mockAnimation.persist).toHaveBeenCalled();

      const targetElement = container.firstChild as HTMLElement;

      // Simulate first entry - should play
      const mainObserverCallback = observerCallbacks[0];
      mainObserverCallback([{ target: targetElement, isIntersecting: true }]);
      expect(mockAnimation.play).toHaveBeenCalled();

      mockAnimation.pause.mockClear();
      mockAnimation.progress.mockClear();

      // Simulate exit via exit observer - should pause (but NOT reset progress)
      const exitObserverCallback = observerCallbacks[1];
      exitObserverCallback([{ target: targetElement, isIntersecting: false }]);
      expect(mockAnimation.pause).toHaveBeenCalled();
      expect(mockAnimation.progress).not.toHaveBeenCalled();
    });

    it('should clean up interactions properly on component unmount', () => {
      Interact.create(getMockConfig());

      const { unmount } = render(
        <Interaction tagName="div" interactKey="logo-click">
          <div>Content</div>
        </Interaction>,
      );

      const controller = Interact.getController('logo-click');
      expect(controller).toBeDefined();

      const disconnectSpy = vi.spyOn(controller!, 'disconnect');

      unmount();

      expect(disconnectSpy).toHaveBeenCalled();
    });

    it('should work with conditions/media queries', () => {
      const config: InteractConfig = {
        conditions: {
          desktop: {
            type: 'media',
            predicate: 'min-width: 1024px',
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
      };

      mockMatchMedia(['min-width: 1024px']);
      const instance = Interact.create(config);

      render(
        <Interaction tagName="button" interactKey="responsive-button">
          <span>Click me</span>
        </Interaction>,
      );

      // Verify matchMedia was called
      expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 1024px)');

      // Verify listener was stored
      expect(instance.mediaQueryListeners.size).toBe(1);
    });

    it('should work with multiple Interaction components (source/target pattern)', async () => {
      const { getWebAnimation } = await import('@wix/motion');

      const config: InteractConfig = {
        interactions: [
          {
            trigger: 'click',
            key: 'source-button',
            effects: [
              {
                key: 'target-element',
                effectId: 'animate-target',
              },
            ],
          },
        ],
        effects: {
          'animate-target': {
            namedEffect: {
              type: 'FadeIn',
              power: 'medium',
            } as NamedEffect,
            duration: 300,
          },
        },
      };

      Interact.create(config);

      render(
        <>
          <Interaction tagName="button" interactKey="source-button">
            <span>Trigger</span>
          </Interaction>
          <Interaction tagName="div" interactKey="target-element">
            <span>Target</span>
          </Interaction>
        </>,
      );

      // Both controllers should be registered
      expect(Interact.getController('source-button')).toBeDefined();
      expect(Interact.getController('target-element')).toBeDefined();

      // Animation should be created for the target
      expect(getWebAnimation).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        expect.any(Object),
        undefined,
        { reducedMotion: false },
      );
    });
  });

  describe('destroy Interact', () => {
    it('should clean up all React components interactions', () => {
      Interact.create(getMockConfig());

      render(
        <Interaction tagName="div" interactKey="logo-hover">
          <span>Hover</span>
        </Interaction>,
      );

      render(
        <Interaction tagName="div" interactKey="logo-click">
          <span>Click</span>
        </Interaction>,
      );

      expect(Interact.controllerCache.size).toBeGreaterThan(0);

      Interact.destroy();

      expect(Interact.controllerCache.size).toBe(0);
      expect(Interact.instances.length).toBe(0);
    });
  });

  describe('reduced motion', () => {
    it('should pass reducedMotion=true to getWebAnimation when forceReducedMotion is true', async () => {
      const { getWebAnimation } = await import('@wix/motion');

      Interact.forceReducedMotion = true;
      Interact.create(getMockConfig());

      render(
        <Interaction tagName="div" interactKey="logo-hover">
          <span>Content</span>
        </Interaction>,
      );

      expect(getWebAnimation).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        expect.any(Object),
        undefined,
        { reducedMotion: true },
      );
    });
  });

  describe('ref callback behavior', () => {
    it('should support function refs', () => {
      Interact.create(getMockConfig());

      let capturedElement: HTMLElement | null = null;
      const refCallback = (node: HTMLDivElement | null) => {
        capturedElement = node;
      };

      const { container } = render(
        <Interaction tagName="div" interactKey="logo-click" ref={refCallback}>
          <span>Content</span>
        </Interaction>,
      );

      expect(capturedElement).toBe(container.firstChild);
    });

    it('should support object refs (useRef)', () => {
      Interact.create(getMockConfig());

      function TestComponent() {
        const ref = useRef<HTMLDivElement>(null);

        return (
          <Interaction tagName="div" interactKey="logo-click" ref={ref}>
            <span>Content</span>
          </Interaction>
        );
      }

      const { container } = render(<TestComponent />);

      // The component should render without errors
      expect(container.firstChild).not.toBeNull();
    });
  });

  describe('different tag types', () => {
    beforeEach(() => {
      Interact.create(getMockConfig());
    });

    it('should render as button', () => {
      const { container } = render(
        <Interaction tagName="button" interactKey="logo-click">
          Click
        </Interaction>,
      );

      expect(container.querySelector('button')).not.toBeNull();
    });

    it('should render as span', () => {
      const { container } = render(
        <Interaction tagName="span" interactKey="logo-click">
          Text
        </Interaction>,
      );

      expect(container.querySelector('span')).not.toBeNull();
    });

    it('should render as article', () => {
      const { container } = render(
        <Interaction tagName="article" interactKey="logo-click">
          Article content
        </Interaction>,
      );

      expect(container.querySelector('article')).not.toBeNull();
    });

    it('should render as anchor with href', () => {
      // Note: href prop requires type assertion due to generic type inference limitations
      const { container } = render(
        <Interaction tagName="a" interactKey="logo-click" {...{ href: 'https://example.com' }}>
          Link
        </Interaction>,
      );

      const anchor = container.querySelector('a');
      expect(anchor).not.toBeNull();
      expect(anchor?.getAttribute('href')).toBe('https://example.com');
    });
  });
});
