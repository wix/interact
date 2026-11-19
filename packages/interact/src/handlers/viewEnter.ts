import type { AnimationGroup } from '@wix/motion';
import { getAnimation } from '@wix/motion';
import type {
  TimeEffect,
  HandlerObject,
  HandlerObjectMap,
  ViewEnterParams,
  InteractOptions,
} from '../types';
import {
  effectToAnimationOptions,
  registerHandler,
  removeElementFromHandlerMap,
} from './utilities';
import fastdom from 'fastdom';

const SAFE_OBSERVER_CONFIG: IntersectionObserverInit = {
  root: null,
  rootMargin: '0px 0px -10% 0px',
  threshold: [0],
};

// Exit observer config for repeat/state types - watches when element is completely out of view
const EXIT_OBSERVER_CONFIG: IntersectionObserverInit = {
  root: null,
  rootMargin: '0px',
  threshold: [0],
};

const DEFAULT_THRESHOLD = 0.2;

/**
 * Converts an `inset` value to a CSS `rootMargin` string.
 *
 * `inset` is one-dimensional: a single value applies to both top and bottom,
 * two space-separated values set top and bottom independently.
 * The inset direction is the inverse of rootMargin: a positive inset shrinks
 * the intersection root (triggers later), so values are negated.
 *
 * Examples:
 *   "20%"      → "-20% 0px -20%"
 *   "10% 30%"  → "-10% 0px -30%"
 */
function insetToRootMargin(inset: string): string {
  const parts = inset.trim().split(/\s+/);
  const top = parts[0];
  const bottom = parts.length > 1 ? parts[1] : parts[0];

  const negate = (value: string): string => {
    if (value.startsWith('-')) {
      return value.slice(1);
    }
    return parseFloat(value) ? `-${value}` : value;
  };

  return `${negate(top)} 0px ${negate(bottom)}`;
}

type ViewObserver = {
  observer: IntersectionObserver;
  sampled: WeakSet<HTMLElement>;
};

type ViewHandler = HandlerObject & {
  handler: NonNullable<HandlerObject['handler']>;
  entry: ViewObserver;
  observeExit: boolean;
  observing: boolean;
};

const observers: Record<string, ViewObserver> = {};
const handlerMap: HandlerObjectMap<ViewHandler> = new WeakMap();
let viewEnterOptions: Partial<ViewEnterParams> = {};
let sharedExitObserver: IntersectionObserver | null = null;

function setOptions(options: Partial<ViewEnterParams>) {
  viewEnterOptions = options;
}

function getObservingHandlers(source: HTMLElement): ViewHandler[] {
  return [...(handlerMap.get(source) ?? [])].filter(
    (registered) => registered.source === source && registered.observing,
  );
}

function stopObserving(registered: ViewHandler) {
  if (!registered.observing) {
    return;
  }

  registered.observing = false;
  const { source, entry, observeExit } = registered;
  const remaining = getObservingHandlers(source);
  if (!remaining.some((peer) => peer.entry === entry)) {
    entry.observer.unobserve(source);
    entry.sampled.delete(source);
  }
  if (observeExit && !remaining.some((peer) => peer.observeExit)) {
    sharedExitObserver?.unobserve(source);
  }
}

function getExitObserver() {
  if (sharedExitObserver) {
    return sharedExitObserver;
  }

  sharedExitObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const target = entry.target as HTMLElement;

      if (!entry.isIntersecting) {
        for (const registered of getObservingHandlers(target)) {
          if (registered.observeExit) {
            registered.handler(false, true);
          }
        }
      }
    });
  }, EXIT_OBSERVER_CONFIG);

  return sharedExitObserver;
}

function getObserver(options: ViewEnterParams, isSafeMode: boolean = false) {
  const key = JSON.stringify({ ...options, isSafeMode });

  if (observers[key]) {
    return observers[key];
  }

  const threshold = options.threshold ?? DEFAULT_THRESHOLD;

  const config: IntersectionObserverInit = isSafeMode
    ? SAFE_OBSERVER_CONFIG
    : {
        root: null,
        rootMargin: options.inset ? insetToRootMargin(options.inset) : '0px',
        threshold,
      };

  const sampled = new WeakSet<HTMLElement>();
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const target = entry.target as HTMLElement;
      const registered = getObservingHandlers(target).filter((handler) => handler.entry === view);
      if (!registered.length) {
        return;
      }

      const isFirstRun = !sampled.has(target);
      if (isFirstRun) {
        sampled.add(target);

        if (options.useSafeViewEnter && !entry.isIntersecting) {
          fastdom.measure(() => {
            const sourceHeight = entry.boundingClientRect.height;
            const rootHeight = entry.rootBounds?.height;

            if (!rootHeight) {
              return;
            }

            const threshold = Array.isArray(options.threshold)
              ? Math.min(...options.threshold)
              : options.threshold;

            const needsSafeObserver = threshold && sourceHeight * threshold > rootHeight;

            if (needsSafeObserver) {
              fastdom.mutate(() => {
                const active = getObservingHandlers(target).filter(
                  (handler) => handler.entry === view,
                );
                if (!active.length) {
                  return;
                }

                observer.unobserve(target);
                sampled.delete(target);
                const safe = getObserver(options, true);
                for (const handler of active) {
                  handler.entry = safe;
                }
                safe.sampled.add(target);
                safe.observer.observe(target);
              });
            }
          });
          return;
        }
      }

      if (entry.isIntersecting || !isFirstRun) {
        for (const handler of registered) {
          if (handler.observing) {
            handler.handler(entry.isIntersecting);
          }
        }
      }
    });
  }, config);

  const view = { observer, sampled };
  observers[key] = view;
  return view;
}

function addViewEnterHandler(
  source: HTMLElement,
  target: HTMLElement,
  effect: TimeEffect,
  options: ViewEnterParams = {},
  { selectorCondition, animation: preCreatedAnimation }: InteractOptions = {},
) {
  const mergedOptions = { ...viewEnterOptions, ...options };
  const type = effect.triggerType || 'once';
  const animation = (preCreatedAnimation ||
    getAnimation(target, effectToAnimationOptions(effect))) as AnimationGroup | null;

  // Early return if animation is null, no observer created
  if (!animation) {
    return;
  }

  const entry = getObserver(mergedOptions);
  const observeExit = type === 'repeat' || type === 'state';

  // Persist animation for non-once types to prevent auto-cleanup
  if (type !== 'once') {
    // Use persist() if available (Web Animations API)
    (animation as AnimationGroup & { persist?: () => void }).persist?.();
  }

  // Track initial play state for alternate type
  let isInitialPlay = true;

  let onceDone = false;

  let handlerObj: ViewHandler;

  const handler = (isIntersecting?: boolean, isFullExit?: boolean) => {
    if (selectorCondition && !target.matches(selectorCondition)) return;

    if (type === 'once') {
      if (isIntersecting && !onceDone) {
        onceDone = true;

        stopObserving(handlerObj);

        // we delete the handlers only when there is no running animation to cancel
        // allowing remove to find the handler to cleanup ongoing animations
        animation.onFinish(() => dispose(true));

        animation.play(() => {
          const setEnterStart = () => {
            target.dataset.interactEnter = 'start';
          };

          const setEnterDone = () => {
            fastdom.mutate(() => {
              target.dataset.interactEnter = 'done';
            });
          };

          if (animation.isCSS) {
            fastdom.mutate(() => {
              requestAnimationFrame(setEnterStart);
            });

            animation.onFinish(setEnterDone);
            animation.onAbort(setEnterDone);
          } else {
            fastdom.mutate(setEnterStart);
            // Generated CSS holds the element at the first keyframe until "done", e.g. a variant
            // added after a media change, which plays through WAAPI.
            animation.onFinish(setEnterDone);
          }
        });
      }
    } else if (type === 'alternate') {
      if (isInitialPlay && isIntersecting) {
        isInitialPlay = false;
        animation.play();
      } else if (!isInitialPlay) {
        animation.reverse();
      }
    } else if (type === 'repeat') {
      if (isIntersecting) {
        animation.progress(0);
        animation.play();
      } else if (isFullExit) {
        animation.pause();
        animation.progress(0);
      }
    } else if (type === 'state') {
      if (isIntersecting) {
        animation.play();
      } else if (isFullExit) {
        animation.pause();
      }
    }
  };

  const cleanup = () => {
    stopObserving(handlerObj);
    animation.cancel();
  };

  handlerObj = { source, target, handler, cleanup, entry, observeExit, observing: true };
  const dispose = registerHandler(handlerMap, handlerObj);
  entry.observer.observe(source);
  if (observeExit) {
    getExitObserver().observe(source);
  }

  return dispose;
}

function removeViewEnterHandler(element: HTMLElement, untrackedOnly?: boolean) {
  removeElementFromHandlerMap(handlerMap, element, untrackedOnly);
}

function reset() {
  sharedExitObserver = null;
  Object.keys(observers).forEach((key) => delete observers[key]);
}

export default {
  add: addViewEnterHandler,
  remove: removeViewEnterHandler,
  setOptions,
  reset,
};
