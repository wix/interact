import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const animationMock = {
  play: vi.fn(),
  cancel: vi.fn(),
  onFinish: vi.fn(),
  onAbort: vi.fn(),
  pause: vi.fn(),
  reverse: vi.fn(),
  progress: vi.fn(),
  isCSS: false,
  playState: 'idle',
};

vi.mock('@wix/motion', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@wix/motion')>()),
  getAnimation: vi.fn(() => animationMock),
}));

vi.mock('fastdom', () => ({
  default: {
    measure: vi.fn((cb) => cb()),
    mutate: vi.fn((cb) => cb()),
  },
}));

const stateEffect = {
  effectId: 'header-hidden',
  transition: { duration: 300, styleProperties: [{ name: 'translate', value: '0 -100%' }] },
};

const timeEffect = {
  effectId: 'fade',
  duration: 300,
  keyframeEffect: { name: 'fade', keyframes: [{ opacity: 0 }] },
};

function getSentinels(): HTMLElement[] {
  return Array.from(document.body.querySelectorAll('[aria-hidden="true"]')) as HTMLElement[];
}

function getSentinelStyle(): string {
  return document.head.querySelector('style[data-interact-scroll-state]')?.textContent ?? '';
}

function dispatchAnimationEvent(element: Element, type: string) {
  const event = new Event(type, { bubbles: true });
  Object.defineProperty(event, 'animationName', { value: 'intrct-scrl-sentinel' });
  element.dispatchEvent(event);
}

function setScrollMetrics(
  element: HTMLElement,
  metrics: Partial<
    Record<
      'scrollTop' | 'scrollLeft' | 'scrollHeight' | 'scrollWidth' | 'clientHeight' | 'clientWidth',
      number
    >
  >,
) {
  Object.entries(metrics).forEach(([name, value]) => {
    Object.defineProperty(element, name, { value, configurable: true, writable: true });
  });
}

describe('scrollState handler', () => {
  let scrollStateHandler: any;
  let source: HTMLElement;
  let target: HTMLElement;
  let targetController: { toggleEffect: ReturnType<typeof vi.fn> };
  let frames: FrameRequestCallback[];
  let cssSupports: ReturnType<typeof vi.fn>;

  const flushFrames = () => {
    const pending = frames;
    frames = [];
    pending.forEach((cb) => cb(0));
  };

  const add = (effect: any, params: any = {}, options: any = {}) =>
    scrollStateHandler.add(source, target, effect, params, { targetController, ...options });

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    scrollStateHandler = (await import('../src/handlers/scrollState')).default;

    document.head.innerHTML = '';
    document.body.innerHTML = '';
    source = document.createElement('header');
    target = document.createElement('div');
    source.appendChild(target);
    document.body.appendChild(source);

    targetController = { toggleEffect: vi.fn() };

    frames = [];
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => frames.push(cb));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());

    cssSupports = vi.fn().mockReturnValue(true);
    vi.stubGlobal('CSS', { supports: cssSupports });

    setScrollMetrics(document.documentElement, {
      scrollTop: 0,
      scrollLeft: 0,
      scrollHeight: 2000,
      scrollWidth: 1000,
      clientHeight: 500,
      clientWidth: 1000,
    });
  });

  afterEach(() => {
    scrollStateHandler.remove(source);
    scrollStateHandler.remove(target);
    vi.unstubAllGlobals();
    delete (window as any).ScrollTimeline;
  });

  describe('CSS phase events (Form 1 with scroll timelines)', () => {
    it('runs a sentinel animation on the root timeline, active just past the offset', () => {
      add(stateEffect, { offset: 80 });

      const [sentinel] = getSentinels();
      const style = sentinel.getAttribute('style')!;

      expect(style).toContain('animation-name:intrct-scrl-sentinel');
      expect(style).toContain('animation-timeline:scroll(root block)');
      expect(style).toContain(
        'animation-range:calc(80px + 0.1px) max(calc(80px + 1px), calc(100% + 1px))',
      );
      expect(getSentinelStyle()).toContain('@keyframes intrct-scrl-sentinel {}');
    });

    it('maps the x axis to the inline timeline and CSS units to the range', () => {
      add(stateEffect, { offset: { value: 10, unit: 'vh' }, axis: 'x' });

      const style = getSentinels()[0].getAttribute('style')!;

      expect(style).toContain('animation-timeline:scroll(root inline)');
      expect(style).toContain('animation-range:calc(10vh + 0.1px)');
    });

    it('adds the state on animationstart and removes it on animationend / animationcancel', () => {
      add(stateEffect, { offset: 80 });
      const [sentinel] = getSentinels();

      dispatchAnimationEvent(sentinel, 'animationstart');
      expect(targetController.toggleEffect).toHaveBeenLastCalledWith(
        'header-hidden',
        'add',
        undefined,
      );

      dispatchAnimationEvent(sentinel, 'animationend');
      expect(targetController.toggleEffect).toHaveBeenLastCalledWith(
        'header-hidden',
        'remove',
        undefined,
      );

      dispatchAnimationEvent(sentinel, 'animationstart');
      dispatchAnimationEvent(sentinel, 'animationcancel');
      expect(targetController.toggleEffect).toHaveBeenCalledTimes(4);
      expect(targetController.toggleEffect).toHaveBeenLastCalledWith(
        'header-hidden',
        'remove',
        undefined,
      );
    });

    it('fires only on a change of state', () => {
      add(stateEffect, { offset: 80 });
      const [sentinel] = getSentinels();

      dispatchAnimationEvent(sentinel, 'animationstart');
      dispatchAnimationEvent(sentinel, 'animationstart');
      dispatchAnimationEvent(sentinel, 'animationend');
      dispatchAnimationEvent(sentinel, 'animationcancel');

      expect(targetController.toggleEffect).toHaveBeenCalledTimes(2);
    });

    it("keeps the sentinel's events from the page", () => {
      const bodyListener = vi.fn();
      document.body.addEventListener('animationstart', bodyListener);

      add(stateEffect, { offset: 80 });
      dispatchAnimationEvent(getSentinels()[0], 'animationstart');

      expect(bodyListener).not.toHaveBeenCalled();
    });

    it('plays a TimeEffect forward on enter and reverses it on leave', () => {
      add(timeEffect, { offset: 80 });
      const [sentinel] = getSentinels();

      dispatchAnimationEvent(sentinel, 'animationstart');
      expect(animationMock.play).toHaveBeenCalledTimes(1);

      dispatchAnimationEvent(sentinel, 'animationend');
      expect(animationMock.reverse).toHaveBeenCalledTimes(1);
    });

    it('detaches a once TimeEffect after the first enter', () => {
      add({ ...timeEffect, triggerType: 'once' }, { offset: 80 });
      const [sentinel] = getSentinels();

      dispatchAnimationEvent(sentinel, 'animationstart');
      expect(animationMock.play).toHaveBeenCalledTimes(1);
      expect(getSentinels()).toHaveLength(0);
    });

    it('drives a pre-created sequence animation', () => {
      const sequence = { ...animationMock, play: vi.fn(), reverse: vi.fn() };
      add({ triggerType: 'alternate' }, { offset: 80 }, { animation: sequence });
      const [sentinel] = getSentinels();

      dispatchAnimationEvent(sentinel, 'animationstart');
      dispatchAnimationEvent(sentinel, 'animationend');

      expect(sequence.play).toHaveBeenCalledTimes(1);
      expect(sequence.reverse).toHaveBeenCalledTimes(1);
    });

    it('shares one sentinel per threshold and enters late subscribers that are already active', () => {
      const otherTarget = document.createElement('div');
      document.body.appendChild(otherTarget);
      const otherController = { toggleEffect: vi.fn() };

      add(stateEffect, { offset: 80 });
      dispatchAnimationEvent(getSentinels()[0], 'animationstart');

      scrollStateHandler.add(
        source,
        otherTarget,
        stateEffect,
        { offset: 80 },
        {
          targetController: otherController,
        },
      );

      expect(getSentinels()).toHaveLength(1);
      expect(otherController.toggleEffect).toHaveBeenCalledWith('header-hidden', 'add', undefined);

      add(stateEffect, { offset: 120 });
      expect(getSentinels()).toHaveLength(2);

      scrollStateHandler.remove(otherTarget);
      expect(getSentinels()).toHaveLength(2);

      scrollStateHandler.remove(source);
      expect(getSentinels()).toHaveLength(0);
    });

    it('reaches a self scroller through a named timeline scoped to :root', () => {
      add(stateEffect, { offset: 80, scroller: 'self' });

      const id = source.getAttribute('data-interact-scroll-timeline');
      const style = getSentinels()[0].getAttribute('style')!;

      expect(id).not.toBeNull();
      expect(style).toContain(`animation-timeline:--intrct-tl-${id}-y`);
      expect(getSentinelStyle()).toContain(
        `[data-interact-scroll-timeline="${id}"] { scroll-timeline: --intrct-tl-${id}-y block; }`,
      );
      expect(getSentinelStyle()).toContain(`:root { timeline-scope: --intrct-tl-${id}-y; }`);
    });

    it('merges both axes of one scroller into one scroll-timeline declaration', () => {
      add(stateEffect, { offset: 80, scroller: 'self' });
      add(stateEffect, { offset: 80, scroller: 'self', axis: 'x' });

      const id = source.getAttribute('data-interact-scroll-timeline');

      expect(getSentinelStyle()).toContain(
        `scroll-timeline: --intrct-tl-${id}-y block, --intrct-tl-${id}-x inline;`,
      );
    });

    it('removes the timeline attribute with the last sentinel of its scroller', () => {
      add(stateEffect, { offset: 80, scroller: 'self' });
      scrollStateHandler.remove(source);

      expect(source.hasAttribute('data-interact-scroll-timeline')).toBe(false);
      expect(getSentinelStyle()).not.toContain('timeline-scope');
    });

    it('resolves the nearest scroll container ancestor', () => {
      const scroller = document.createElement('div');
      scroller.style.overflowY = 'auto';
      document.body.appendChild(scroller);
      scroller.appendChild(source);

      add(stateEffect, { offset: 80, scroller: 'nearest' });

      expect(scroller.hasAttribute('data-interact-scroll-timeline')).toBe(true);
      expect(source.hasAttribute('data-interact-scroll-timeline')).toBe(false);
    });

    it('falls back to the root timeline when nearest has no scroll container ancestor', () => {
      add(stateEffect, { offset: 80, scroller: 'nearest' });

      expect(getSentinels()[0].getAttribute('style')).toContain(
        'animation-timeline:scroll(root block)',
      );
    });

    it('uses the scroll listener for a non-root scroller without timeline-scope', () => {
      cssSupports.mockImplementation((query: string) => !query.startsWith('timeline-scope'));

      add(stateEffect, { offset: 80, scroller: 'self' });

      expect(getSentinels()).toHaveLength(0);
    });
  });

  describe('scroll listener', () => {
    const scrollTo = (position: number, element: HTMLElement = document.documentElement) => {
      element.scrollTop = position;
      (element === document.documentElement ? window : element).dispatchEvent(new Event('scroll'));
      flushFrames();
    };

    const ready = () => new Promise((resolve) => setTimeout(resolve));

    beforeEach(() => {
      cssSupports.mockReturnValue(false);
    });

    it('is used without scroll timelines', async () => {
      add(stateEffect, { offset: 80 });
      await ready();

      expect(getSentinels()).toHaveLength(0);

      scrollTo(80);
      expect(targetController.toggleEffect).not.toHaveBeenCalled();

      scrollTo(81);
      expect(targetController.toggleEffect).toHaveBeenLastCalledWith(
        'header-hidden',
        'add',
        undefined,
      );

      scrollTo(10);
      expect(targetController.toggleEffect).toHaveBeenLastCalledWith(
        'header-hidden',
        'remove',
        undefined,
      );
    });

    it('enters on attach when the page is already past the offset', async () => {
      document.documentElement.scrollTop = 300;
      add(stateEffect, { offset: 80 });
      await ready();

      expect(targetController.toggleEffect).toHaveBeenCalledWith('header-hidden', 'add', undefined);
    });

    it('is used for Form 2 even with scroll timelines', async () => {
      cssSupports.mockReturnValue(true);
      add(stateEffect, { offset: 80, direction: 'end' });
      await ready();

      expect(getSentinels()).toHaveLength(0);
    });

    it('Form 2: active past the offset while scrolling toward the direction, latched while idle', async () => {
      add(stateEffect, { offset: 120, direction: 'end' });
      await ready();

      scrollTo(100);
      expect(targetController.toggleEffect).not.toHaveBeenCalled();

      scrollTo(200);
      expect(targetController.toggleEffect).toHaveBeenLastCalledWith(
        'header-hidden',
        'add',
        undefined,
      );

      scrollTo(200);
      expect(targetController.toggleEffect).toHaveBeenCalledTimes(1);

      scrollTo(180);
      expect(targetController.toggleEffect).toHaveBeenLastCalledWith(
        'header-hidden',
        'remove',
        undefined,
      );

      scrollTo(300);
      expect(targetController.toggleEffect).toHaveBeenCalledTimes(3);

      scrollTo(50);
      expect(targetController.toggleEffect).toHaveBeenCalledTimes(4);
    });

    it('Form 2: direction start', async () => {
      add(stateEffect, { offset: 120, direction: 'start' });
      await ready();

      scrollTo(400);
      expect(targetController.toggleEffect).not.toHaveBeenCalled();

      scrollTo(300);
      expect(targetController.toggleEffect).toHaveBeenLastCalledWith(
        'header-hidden',
        'add',
        undefined,
      );
    });

    it('Form 2: starts inactive past the offset until a scroll sets the direction', async () => {
      document.documentElement.scrollTop = 400;
      add(stateEffect, { offset: 120, direction: 'end' });
      await ready();

      expect(targetController.toggleEffect).not.toHaveBeenCalled();
    });

    it('Form 2: ignores overscroll past the end of the scroll range', async () => {
      add(stateEffect, { offset: 120, direction: 'end' });
      await ready();

      scrollTo(1500);
      expect(targetController.toggleEffect).toHaveBeenCalledTimes(1);

      // max scroll is 2000 - 500 = 1500; a bounce reports 1540 then 1500
      scrollTo(1540);
      scrollTo(1500);
      expect(targetController.toggleEffect).toHaveBeenCalledTimes(1);
    });

    it('resolves a percentage offset against the scroll range', async () => {
      add(stateEffect, { offset: { value: 10, unit: 'percentage' } });
      await ready();

      scrollTo(150);
      expect(targetController.toggleEffect).not.toHaveBeenCalled();

      scrollTo(151);
      expect(targetController.toggleEffect).toHaveBeenCalledTimes(1);
    });

    it('measures an RTL x axis from the inline start', async () => {
      add(stateEffect, { offset: 80, axis: 'x', direction: 'end' });
      await ready();

      setScrollMetrics(document.documentElement, { scrollWidth: 3000 });
      document.documentElement.scrollLeft = -100;
      window.dispatchEvent(new Event('scroll'));
      flushFrames();

      expect(targetController.toggleEffect).toHaveBeenLastCalledWith(
        'header-hidden',
        'add',
        undefined,
      );
    });

    it('listens on a self scroller', async () => {
      setScrollMetrics(source, { scrollTop: 0, scrollHeight: 1000, clientHeight: 200 });
      add(stateEffect, { offset: 80, scroller: 'self' });
      await ready();

      scrollTo(90, source);
      expect(targetController.toggleEffect).toHaveBeenCalledTimes(1);
    });

    it('shares one listener per scroller and removes it with the last subscriber', async () => {
      const removeSpy = vi.spyOn(AbortController.prototype, 'abort');

      add(stateEffect, { offset: 80 });
      add(timeEffect, { offset: 120 });
      await ready();

      scrollTo(100);
      expect(targetController.toggleEffect).toHaveBeenCalledTimes(1);
      expect(animationMock.play).not.toHaveBeenCalled();

      scrollTo(130);
      expect(animationMock.play).toHaveBeenCalledTimes(1);

      scrollStateHandler.remove(source);
      expect(removeSpy).toHaveBeenCalledTimes(1);
    });

    it('samples a ScrollTimeline where one exists', async () => {
      let progress: number | null = null;
      const sampler = {
        play: vi.fn(),
        cancel: vi.fn(),
        ready: Promise.resolve(),
        effect: { getComputedTiming: () => ({ progress }) },
      } as any;
      const ScrollTimeline = vi.fn();
      (window as any).ScrollTimeline = ScrollTimeline;
      vi.stubGlobal('KeyframeEffect', vi.fn());
      vi.stubGlobal(
        'Animation',
        vi.fn(function () {
          return sampler;
        }),
      );

      add(stateEffect, { offset: { value: 5, unit: 'rem' } });
      await ready();

      expect(ScrollTimeline).toHaveBeenCalledWith({
        source: document.scrollingElement || document.documentElement,
        axis: 'block',
      });
      expect(sampler.rangeStart).toBe('calc(5rem + 0.1px)');
      expect(sampler.rangeEnd).toBe('100%');
      expect(sampler.play).toHaveBeenCalled();

      progress = 0.2;
      scrollTo(100);
      expect(targetController.toggleEffect).toHaveBeenCalledTimes(1);

      scrollStateHandler.remove(source);
      expect(sampler.cancel).toHaveBeenCalled();
    });
  });
});
