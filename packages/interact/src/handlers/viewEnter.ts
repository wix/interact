import type { AnimationGroup } from '@wix/motion';
import { getAnimation } from '@wix/motion';
import type { TimeEffect, HandlerObjectMap, ViewEnterParams, InteractOptions } from '../types';
import {
  effectToAnimationOptions,
  addHandlerToMap,
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

const observers: Record<string, IntersectionObserver> = {};
const handlerMap = new WeakMap() as HandlerObjectMap;
const elementFirstRun = new WeakSet<HTMLElement>();
const elementObserverMap = new WeakMap<HTMLElement, IntersectionObserver>();
let viewEnterOptions: Partial<ViewEnterParams> = {};
let sharedExitObserver: IntersectionObserver | null = null;

function setOptions(options: Partial<ViewEnterParams>) {
  viewEnterOptions = options;
}

function invokeHandlers(target: HTMLElement, isIntersecting: boolean) {
  const handlers = handlerMap.get(target);
  handlers?.forEach(({ source, handler }) => {
    if (source === target) {
      handler!(isIntersecting);
    }
  });
}

function getExitObserver() {
  if (sharedExitObserver) {
    return sharedExitObserver;
  }

  sharedExitObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const target = entry.target as HTMLElement;

      if (!entry.isIntersecting) {
        // Element has completely exited the view
        invokeHandlers(target, false);
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

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const target = entry.target as HTMLElement;
      const isFirstRun = !elementFirstRun.has(target);

      if (isFirstRun) {
        elementFirstRun.add(target);

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
                observer.unobserve(target);
                const safeObserver = getObserver(options, true);
                elementObserverMap.set(target, safeObserver);
                safeObserver.observe(target);
              });
            }
          });
          return;
        }
      }

      const type = options.type || 'once';

      if (entry.isIntersecting || (type === 'alternate' && !isFirstRun)) {
        // For alternate type, handle exit using same observer as entry
        invokeHandlers(target, entry.isIntersecting);

        if (type === 'once') {
          observer.unobserve(entry.target);
          elementFirstRun.delete(target);
        }
      }
      // Note: repeat and state exit handling is done by a separate exit observer
      // that watches when element is completely out of view
    });
  }, config);

  observers[key] = observer;

  return observer;
}

function addViewEnterHandler(
  source: HTMLElement,
  target: HTMLElement,
  effect: TimeEffect,
  options: ViewEnterParams = {},
  { reducedMotion, selectorCondition, animation: preCreatedAnimation }: InteractOptions = {},
) {
  const mergedOptions = { ...viewEnterOptions, ...options };
  const type = mergedOptions.type || 'once';
  const animation = (preCreatedAnimation ||
    getAnimation(
      target,
      effectToAnimationOptions(effect),
      undefined,
      reducedMotion,
    )) as AnimationGroup | null;

  // Early return if animation is null, no observer created
  if (!animation) {
    return;
  }

  const observer = getObserver(mergedOptions);

  // Persist animation for non-once types to prevent auto-cleanup
  if (type !== 'once') {
    // Use persist() if available (Web Animations API)
    (animation as AnimationGroup & { persist?: () => void }).persist?.();
  }

  // Track initial play state for alternate type
  let isInitialPlay = true;

  const handler = (isIntersecting?: boolean) => {
    if (selectorCondition && !target.matches(selectorCondition)) return;

    if (type === 'once') {
      if (isIntersecting) {
        animation.play(() => {
          const setEnterStart = () => {
            target.dataset.interactEnter = 'start';
          };

          if (animation.isCSS) {
            fastdom.mutate(() => {
              // delay for next tick to prevent content flashing
              requestAnimationFrame(setEnterStart);
            });

            const setEnterDone = () => {
              fastdom.mutate(() => {
                target.dataset.interactEnter = 'done';
              });
            };

            animation.onFinish(setEnterDone);
            animation.onAbort(setEnterDone);
          } else {
            fastdom.mutate(setEnterStart);
          }
        });
      }
    } else if (type === 'alternate') {
      if (isInitialPlay && isIntersecting) {
        isInitialPlay = false;
        animation.play();
      } else if (!isInitialPlay) {
        // On subsequent entry/exit reverse the animation
        animation.reverse();
      }
    } else if (type === 'repeat') {
      if (isIntersecting) {
        // On entry, reset progress to 0 before playing since the exit is a separate observer/range
        animation.progress(0);
        animation.play();
      } else {
        // On exit (completely out of view), pause and reset
        animation.pause();
        animation.progress(0);
      }
    } else if (type === 'state') {
      if (isIntersecting) {
        // Resume or start playing
        animation.play();
      } else {
        // On exit (completely out of view), just pause
        animation.pause();
      }
    }
  };

  const cleanup = () => {
    const currentObserver = elementObserverMap.get(source) || observer;
    currentObserver.unobserve(source);

    if (type === 'repeat' || type === 'state') {
      // Clean up exit observer if it exists
      const exitObserver = getExitObserver();
      exitObserver.unobserve(source);
    }

    animation.cancel();
    elementFirstRun.delete(source);
    elementObserverMap.delete(source);
  };
  const handlerObj = { source, target, handler, cleanup };

  addHandlerToMap(handlerMap, source, handlerObj);
  addHandlerToMap(handlerMap, target, handlerObj);

  elementObserverMap.set(source, observer);
  observer.observe(source);

  // For repeat and state types, set up a separate exit observer
  // that watches when element is completely out of view
  if (type === 'repeat' || type === 'state') {
    const exitObserver = getExitObserver();
    exitObserver.observe(source);
  }
}

function removeViewEnterHandler(element: HTMLElement) {
  removeElementFromHandlerMap(handlerMap, element);
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
