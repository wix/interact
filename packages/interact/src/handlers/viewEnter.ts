import type { AnimationGroup } from '@wix/motion';
import { getAnimation } from '@wix/motion';
import type { TimeEffect, HandlerObjectMap, ViewEnterParams, InteractOptions } from '../types';
import {
  effectToAnimationOptions,
  addHandlerToMap,
  removeElementFromHandlerMap,
} from './utilities';
import { matchesSelectorCondition } from '../utils';
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

function invokeHandlers(target: HTMLElement, isIntersecting: boolean, isFullExit?: boolean) {
  const handlers = handlerMap.get(target);
  handlers?.forEach(({ source, handler }) => {
    if (source === target) {
      handler!(isIntersecting, isFullExit);
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
        invokeHandlers(target, false, true);
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
    ? {
        ...SAFE_OBSERVER_CONFIG,
        // Safe mode drops the threshold, but the authored `inset` still decides
        // where in the viewport the trigger fires.
        ...(options.inset ? { rootMargin: insetToRootMargin(options.inset) } : null),
      }
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

            const minThreshold = Array.isArray(threshold) ? Math.min(...threshold) : threshold;

            const needsSafeObserver = minThreshold > 0 && sourceHeight * minThreshold > rootHeight;

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

      if (entry.isIntersecting || !isFirstRun) {
        invokeHandlers(target, entry.isIntersecting);
      }
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
  const type = effect.triggerType || 'once';
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

  let onceDone = false;

  // Declared early so the handler closure can reference it for self-cleanup
  let handlerObj: {
    source: HTMLElement;
    target: HTMLElement;
    handler: typeof handler;
    cleanup: () => void;
  };

  const handler = (isIntersecting?: boolean, isFullExit?: boolean) => {
    if (selectorCondition && !matchesSelectorCondition(target, selectorCondition)) return;

    if (type === 'once') {
      if (isIntersecting && !onceDone) {
        onceDone = true;

        handlerMap.get(source)?.delete(handlerObj);
        handlerMap.get(target)?.delete(handlerObj);

        const remaining = handlerMap.get(source);

        if (!remaining || remaining.size === 0) {
          const currentObserver = elementObserverMap.get(source) || observer;
          currentObserver.unobserve(source);
          elementFirstRun.delete(source);
        }

        animation.play(() => {
          const setEnterStart = () => {
            target.dataset.interactEnter = 'start';
          };

          if (animation.isCSS) {
            fastdom.mutate(() => {
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
    const currentObserver = elementObserverMap.get(source) || observer;
    currentObserver.unobserve(source);

    if (type === 'repeat' || type === 'state') {
      const exitObserver = getExitObserver();
      exitObserver.unobserve(source);
    }

    animation.cancel();
    elementFirstRun.delete(source);
    elementObserverMap.delete(source);
  };

  handlerObj = { source, target, handler, cleanup };

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
