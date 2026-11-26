import { getCssUnits } from '@wix/motion';
import type {
  TimeEffect,
  StateEffect,
  EffectBase,
  HandlerObjectMap,
  InteractOptions,
  ScrollStateParams,
  EventTriggerConfigEnterLeave,
} from '../types';
import { addHandlerToMap, removeElementFromHandlerMap } from './utilities';
import { createTimeEffectHandler, createTransitionHandler } from './effectHandlers';

/*
 * The scrollState trigger is active while the scroller is scrolled past `offset` (Form 1), or past
 * `offset` and last scrolled toward `direction` (Form 2). Each threshold crossing feeds the shared
 * effect handlers as an enter or a leave event.
 *
 * Tier 2 (Form 1, scroll-timeline browsers): a hidden sentinel element runs an empty scroll-driven
 * CSS animation that is active only past the offset, so `animationstart` / `animationend` report
 * the crossings without a scroll listener. The sentinel is a separate element so its `animation`
 * never overrides the page's own animations on the scroller.
 *
 * Tier 3 (Form 2, or no scroll timelines): one passive scroll listener per scroller. The offset is
 * sampled from a ScrollTimeline where one exists, so every CSS unit works, and resolved to pixels
 * otherwise.
 */

type Axis = NonNullable<ScrollStateParams['axis']>;
type ScrollerType = NonNullable<ScrollStateParams['scroller']>;
type StateListener = (isActive: boolean) => void;

const ENTER_EVENT = 'scrollstate:enter';
const LEAVE_EVENT = 'scrollstate:leave';
const ENTER_LEAVE: EventTriggerConfigEnterLeave = { enter: [ENTER_EVENT], leave: [LEAVE_EVENT] };

const SENTINEL_KEYFRAMES = 'intrct-scrl-sentinel';
const SENTINEL_STYLE =
  'position:fixed;top:0;left:0;width:0;height:0;overflow:hidden;visibility:hidden;pointer-events:none;';
const SCROLL_TIMELINE_ATTR = 'data-interact-scroll-timeline';

const handlerMap = new WeakMap() as HandlerObjectMap;

let supportsScrollTimeline: boolean | undefined;
let supportsTimelineScope: boolean | undefined;

function canUseSentinel(scrollerEl: HTMLElement | null): boolean {
  if (supportsScrollTimeline === undefined) {
    supportsScrollTimeline = !!window.CSS?.supports?.(
      '(animation-timeline: scroll()) and (animation-range: 0% 100%)',
    );
    supportsTimelineScope = !!window.CSS?.supports?.('timeline-scope: --x');
  }

  // a scroller other than the root is reached through a named timeline scoped to :root
  return supportsScrollTimeline && (!scrollerEl || !!supportsTimelineScope);
}

function isScrollContainer(overflow: string): boolean {
  return overflow !== 'visible' && overflow !== 'clip';
}

/**
 * The element whose scroll position drives the trigger, or null for the root scroller.
 */
function getScrollerElement(source: HTMLElement, scroller: ScrollerType): HTMLElement | null {
  if (scroller === 'self') {
    return source;
  }

  if (scroller === 'nearest') {
    const { body, documentElement } = document;

    for (let el = source.parentElement; el && el !== body && el !== documentElement; ) {
      const { overflowX, overflowY } = getComputedStyle(el);

      if (isScrollContainer(overflowX) || isScrollContainer(overflowY)) {
        return el;
      }

      el = el.parentElement;
    }
  }

  return null;
}

function getRootScrollingElement(): HTMLElement {
  return (document.scrollingElement || document.documentElement) as HTMLElement;
}

function getOffsetCss(offset: ScrollStateParams['offset'] = 0): string {
  return typeof offset === 'number' ? `${offset}px` : `${offset.value}${getCssUnits(offset.unit)}`;
}

// past the offset by any amount counts as past it, so scrolled exactly to the offset is not
function getRangeStart(offsetCss: string): string {
  return `calc(${offsetCss} + 0.1px)`;
}

const scrollerIds = new WeakMap<HTMLElement, number>();
let nextScrollerId = 0;

function getScrollerId(scrollerEl: HTMLElement): number {
  let id = scrollerIds.get(scrollerEl);

  if (id === undefined) {
    id = nextScrollerId++;
    scrollerIds.set(scrollerEl, id);
  }

  return id;
}

function getScrollerKey(scrollerEl: HTMLElement | null, axis: Axis): string {
  return `${scrollerEl ? getScrollerId(scrollerEl) : 'root'}|${axis}`;
}

/*
 * Tier 2: CSS phase events
 */

type Sentinel = {
  element: HTMLElement;
  isActive: boolean;
  listeners: Set<StateListener>;
  timeline?: { name: string; scrollerEl: HTMLElement; axis: Axis };
};

const sentinels = new Map<string, Sentinel>();
let sentinelStyleEl: HTMLStyleElement | null = null;

function renderSentinelStyle() {
  const timelinesByScroller = new Map<HTMLElement, NonNullable<Sentinel['timeline']>[]>();

  sentinels.forEach(({ timeline }) => {
    if (!timeline) return;

    const timelines = timelinesByScroller.get(timeline.scrollerEl) || [];
    // sentinels of one scroller and axis share its timeline
    if (!timelines.some(({ name }) => name === timeline.name)) {
      timelines.push(timeline);
    }
    timelinesByScroller.set(timeline.scrollerEl, timelines);
  });

  const rules = [`@keyframes ${SENTINEL_KEYFRAMES} {}`];
  const names: string[] = [];

  timelinesByScroller.forEach((timelines, scrollerEl) => {
    const declarations = timelines.map(
      ({ name, axis }) => `${name} ${axis === 'x' ? 'inline' : 'block'}`,
    );
    names.push(...timelines.map(({ name }) => name));
    rules.push(
      `[${SCROLL_TIMELINE_ATTR}="${getScrollerId(scrollerEl)}"] { scroll-timeline: ${declarations.join(', ')}; }`,
    );
  });

  if (names.length) {
    rules.push(`:root { timeline-scope: ${names.join(', ')}; }`);
  }

  if (!sentinelStyleEl) {
    sentinelStyleEl = document.createElement('style');
    sentinelStyleEl.setAttribute('data-interact-scroll-state', '');
    document.head.appendChild(sentinelStyleEl);
  }

  sentinelStyleEl.textContent = rules.join('\n');
}

function createSentinel(
  key: string,
  scrollerEl: HTMLElement | null,
  axis: Axis,
  offsetCss: string,
): Sentinel {
  const element = document.createElement('div');
  const sentinel: Sentinel = { element, isActive: false, listeners: new Set() };
  let timelineCss = `scroll(root ${axis === 'x' ? 'inline' : 'block'})`;

  if (scrollerEl) {
    const id = getScrollerId(scrollerEl);
    sentinel.timeline = { name: `--intrct-tl-${id}-${axis}`, scrollerEl, axis };
    timelineCss = sentinel.timeline.name;
    scrollerEl.setAttribute(SCROLL_TIMELINE_ATTR, String(id));
  }

  // Scroll progress is clamped to [0%, 100%], so the after phase is unreachable: at or below the
  // offset is "before", past it is "active". If the scroll range shrinks to the offset or below,
  // the animation goes idle and fires animationcancel.
  const rangeEnd = `max(calc(${offsetCss} + 1px), calc(100% + 1px))`;

  element.setAttribute('aria-hidden', 'true');
  element.setAttribute(
    'style',
    SENTINEL_STYLE +
      `animation-name:${SENTINEL_KEYFRAMES};animation-duration:auto;animation-fill-mode:none;` +
      `animation-timeline:${timelineCss};animation-range:${getRangeStart(offsetCss)} ${rangeEnd};`,
  );

  const setActive = (isActive: boolean) => (event: Event) => {
    if (event.target !== element) return;

    // the sentinel is internal, so its events don't reach the page's listeners
    event.stopPropagation();

    if (sentinel.isActive !== isActive) {
      sentinel.isActive = isActive;
      sentinel.listeners.forEach((listener) => listener(isActive));
    }
  };

  element.addEventListener('animationstart', setActive(true));
  element.addEventListener('animationend', setActive(false));
  element.addEventListener('animationcancel', setActive(false));

  sentinels.set(key, sentinel);
  renderSentinelStyle();
  document.body.appendChild(element);

  return sentinel;
}

function subscribeSentinel(
  scrollerEl: HTMLElement | null,
  axis: Axis,
  offsetCss: string,
  listener: StateListener,
): () => void {
  const key = `${getScrollerKey(scrollerEl, axis)}|${offsetCss}`;
  const sentinel = sentinels.get(key) || createSentinel(key, scrollerEl, axis, offsetCss);

  sentinel.listeners.add(listener);

  if (sentinel.isActive) {
    listener(true);
  }

  return () => {
    if (!sentinel.listeners.delete(listener) || sentinel.listeners.size) return;

    sentinel.element.remove();
    sentinels.delete(key);

    const timeline = sentinel.timeline;
    if (
      timeline &&
      ![...sentinels.values()].some((s) => s.timeline?.scrollerEl === timeline.scrollerEl)
    ) {
      timeline.scrollerEl.removeAttribute(SCROLL_TIMELINE_ATTR);
    }

    renderSentinelStyle();
  };
}

/*
 * Tier 3: passive scroll listener
 */

type ScrollSource = {
  element: HTMLElement;
  axis: Axis;
  position: number;
  maxPosition: number;
  // sign of the last non-zero scroll delta, latched while idle
  direction: -1 | 0 | 1;
  subscribers: Set<() => void>;
  destroy: () => void;
};

const scrollSources = new Map<string, ScrollSource>();

function measure(source: ScrollSource) {
  const { element, axis } = source;
  // in RTL scrollLeft is ≤ 0, so measure from the inline start
  const position = axis === 'x' ? Math.abs(element.scrollLeft) : element.scrollTop;
  const maxPosition =
    axis === 'x'
      ? element.scrollWidth - element.clientWidth
      : element.scrollHeight - element.clientHeight;
  // clamping drops overscroll, so a rubber-band bounce doesn't flip the direction
  const clamped = Math.min(Math.max(position, 0), Math.max(maxPosition, 0));
  const delta = clamped - source.position;

  if (delta) {
    source.direction = delta > 0 ? 1 : -1;
  }

  source.position = clamped;
  source.maxPosition = maxPosition;
}

function subscribeScroll(
  scrollerEl: HTMLElement | null,
  axis: Axis,
  update: (source: ScrollSource) => void,
): () => void {
  const key = getScrollerKey(scrollerEl, axis);
  let source = scrollSources.get(key);

  if (!source) {
    const controller = new AbortController();
    let frameId = 0;
    const created: ScrollSource = {
      element: scrollerEl || getRootScrollingElement(),
      axis,
      position: 0,
      maxPosition: 0,
      direction: 0,
      subscribers: new Set(),
      destroy: () => {
        controller.abort();
        cancelAnimationFrame(frameId);
      },
    };

    measure(created);
    // the initial position is not a scroll, so it sets no direction
    created.direction = 0;

    (scrollerEl || window).addEventListener(
      'scroll',
      () => {
        if (frameId) return;

        frameId = requestAnimationFrame(() => {
          frameId = 0;
          measure(created);
          created.subscribers.forEach((subscriber) => subscriber());
        });
      },
      { passive: true, signal: controller.signal },
    );

    source = created;
    scrollSources.set(key, source);
  }

  const resolved = source;
  const subscriber = () => update(resolved);

  resolved.subscribers.add(subscriber);
  subscriber();

  return () => {
    if (!resolved.subscribers.delete(subscriber) || resolved.subscribers.size) return;

    resolved.destroy();
    scrollSources.delete(key);
  };
}

function getOffsetPx(offset: ScrollStateParams['offset'] = 0, source: ScrollSource): number {
  if (typeof offset === 'number') {
    return offset;
  }

  const { value, unit } = offset;
  const { innerWidth, innerHeight } = window;

  switch (unit) {
    case 'percentage':
      return (value / 100) * source.maxPosition;
    case 'vh':
      return (value / 100) * innerHeight;
    case 'vw':
      return (value / 100) * innerWidth;
    case 'vmin':
      return (value / 100) * Math.min(innerWidth, innerHeight);
    case 'vmax':
      return (value / 100) * Math.max(innerWidth, innerHeight);
    case 'rem':
      return value * parseFloat(getComputedStyle(document.documentElement).fontSize);
    case 'em':
      return value * parseFloat(getComputedStyle(source.element).fontSize);
    default:
      return value;
  }
}

/**
 * Whether the scroller is past the offset. Samples a ScrollTimeline where one exists, so the
 * offset resolves exactly as in CSS; otherwise resolves it to pixels.
 */
function createOffsetTest(
  scrollerEl: HTMLElement | null,
  axis: Axis,
  params: ScrollStateParams,
): { isPast: (source: ScrollSource) => boolean; ready: Promise<unknown>; cleanup?: () => void } {
  if (!('ScrollTimeline' in window)) {
    return {
      isPast: (source) => source.position > getOffsetPx(params.offset, source),
      ready: Promise.resolve(),
    };
  }

  const ScrollTimelineCtor = (window as any).ScrollTimeline;
  const animation = new Animation(
    new KeyframeEffect(null, [], { fill: 'forwards', duration: 'auto' } as KeyframeEffectOptions),
    new ScrollTimelineCtor({
      source: scrollerEl || getRootScrollingElement(),
      axis: axis === 'x' ? 'inline' : 'block',
    }),
  );
  const ranged = animation as Animation & { rangeStart: string; rangeEnd: string };

  ranged.rangeStart = getRangeStart(getOffsetCss(params.offset));
  ranged.rangeEnd = '100%';
  animation.play();

  return {
    // progress is null before the range, which starts just past the offset
    isPast: () => animation.effect!.getComputedTiming().progress != null,
    ready: animation.ready,
    cleanup: () => animation.cancel(),
  };
}

function subscribeScrollListener(
  scrollerEl: HTMLElement | null,
  axis: Axis,
  params: ScrollStateParams,
  listener: StateListener,
): () => void {
  const offsetTest = createOffsetTest(scrollerEl, axis, params);
  const wantedDirection = params.direction === 'start' ? -1 : 1;
  let unsubscribe: (() => void) | undefined;
  let isCancelled = false;

  offsetTest.ready.then(() => {
    if (isCancelled) return;

    unsubscribe = subscribeScroll(scrollerEl, axis, (source) => {
      const isPast = offsetTest.isPast(source);
      listener(isPast && (!params.direction || source.direction === wantedDirection));
    });
  });

  return () => {
    isCancelled = true;
    unsubscribe?.();
    offsetTest.cleanup?.();
  };
}

function addScrollStateHandler(
  source: HTMLElement,
  target: HTMLElement,
  effect: (TimeEffect | StateEffect) & EffectBase,
  params: ScrollStateParams,
  { targetController, selectorCondition, animation: preCreatedAnimation }: InteractOptions,
) {
  const isTransition =
    (effect as StateEffect).transition || (effect as StateEffect).transitionProperties;

  let handler: ((event: Event) => void) | null;
  let effectCleanup: (() => void) | undefined;
  let once = false;

  if (isTransition) {
    handler = createTransitionHandler(
      target,
      targetController!,
      effect as StateEffect & EffectBase & { effectId: string },
      selectorCondition,
      ENTER_LEAVE,
    );
  } else {
    const timeEffectHandler = createTimeEffectHandler(
      target,
      effect as TimeEffect & EffectBase,
      selectorCondition,
      ENTER_LEAVE,
      preCreatedAnimation,
    );
    handler = timeEffectHandler?.handler ?? null;
    effectCleanup = timeEffectHandler?.cleanup;
    // a 'once' animation replays on every enter, so the trigger detaches after the first
    once = (effect as TimeEffect).triggerType === 'once';
  }

  if (!handler) {
    return;
  }

  const resolvedHandler = handler;
  const axis = params.axis || 'y';
  const scrollerEl = getScrollerElement(source, params.scroller || 'root');
  let isActive = false;
  let isDone = false;
  let unsubscribe: (() => void) | undefined;

  const listener: StateListener = (active) => {
    if (isDone || active === isActive) return;

    isActive = active;
    resolvedHandler(new Event(active ? ENTER_EVENT : LEAVE_EVENT));

    if (active && once) {
      isDone = true;
      unsubscribe?.();
    }
  };

  unsubscribe =
    !params.direction && canUseSentinel(scrollerEl)
      ? subscribeSentinel(scrollerEl, axis, getOffsetCss(params.offset), listener)
      : subscribeScrollListener(scrollerEl, axis, params, listener);

  // the first state may already have completed a 'once' trigger
  if (isDone) {
    unsubscribe();
  }

  const cleanup = () => {
    unsubscribe?.();
    effectCleanup?.();
  };

  const handlerObj = { source, target, cleanup };
  addHandlerToMap(handlerMap, source, handlerObj);
  addHandlerToMap(handlerMap, target, handlerObj);
}

function removeScrollStateHandler(element: HTMLElement) {
  removeElementFromHandlerMap(handlerMap, element);
}

export default {
  add: addScrollStateHandler,
  remove: removeScrollStateHandler,
};
