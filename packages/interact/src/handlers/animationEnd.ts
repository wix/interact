import type { AnimationGroup } from '@wix/motion';
import { getAnimation, getElementCSSAnimation } from '@wix/motion';
import type { AnimationEndParams, TimeEffect, HandlerObjectMap, InteractOptions } from '../types';
import {
  effectToAnimationOptions,
  addHandlerToMap,
  removeElementFromHandlerMap,
} from './utilities';

const handlerMap = new WeakMap() as HandlerObjectMap;
type AnimationEndLatch = {
  // events of matching targets only — see `latchAnimationEnd`
  sourceSelector?: string;
  // the latest `animationend` of each animation, by event target
  events: Map<EventTarget, Map<string, Event>>;
  cleanup: () => void;
};

// per latched element, the latches recording the `animationend` events that happened on it or a
// descendant while a trigger was held back (see `latchAnimationEnd`)
const latches = new WeakMap<HTMLElement, AnimationEndLatch[]>();

function getAnimationEndKey(event: Event) {
  return (event as AnimationEvent).animationName || `#${(event as CustomEvent).detail?.effectId}`;
}

/**
 * The latched events a listener on `source` would have received: those of `source` itself, and the
 * bubbling ones of its descendants — recorded by a latch on `source`, or by a latch covering a
 * subtree (with a `sourceSelector`) on one of its ancestors.
 */
function getLatchedEvents(source: HTMLElement): Event[] {
  const latched: Event[] = [];

  for (let element: HTMLElement | null = source; element; element = element.parentElement) {
    latches.get(element)?.forEach(({ sourceSelector, events }) => {
      // a latch on a single source serves that source only
      if (element !== source && !sourceSelector) {
        return;
      }

      events.forEach((targetEvents, eventTarget) => {
        targetEvents.forEach((event) => {
          if (eventTarget === source || (event.bubbles && source.contains(eventTarget as Node))) {
            latched.push(event);
          }
        });
      });
    });
  }

  return latched;
}

function removeLatches(element: HTMLElement): void {
  latches.get(element)?.forEach(({ cleanup }) => cleanup());
  latches.delete(element);
}

function addAnimationEndHandler(
  source: HTMLElement,
  target: HTMLElement,
  effect: TimeEffect,
  params: AnimationEndParams,
  { selectorCondition, animation: preCreatedAnimation, sourceAnimationOptions }: InteractOptions,
): void {
  const animation = (preCreatedAnimation ||
    getAnimation(target, effectToAnimationOptions(effect))) as AnimationGroup | null;

  // Early return if animation is null, no handler attached
  if (!animation) {
    return;
  }

  const { effectId } = params;

  const matches = (event: Event) => {
    if (selectorCondition && !target.matches(selectorCondition)) return false;

    const animName = (event as AnimationEvent).animationName;
    const eventEffectId = (event as CustomEvent).detail?.effectId;

    const sourceAnimationGroup = sourceAnimationOptions
      ? getElementCSSAnimation(source, sourceAnimationOptions)
      : null;

    if (sourceAnimationGroup) {
      if (sourceAnimationGroup.playState === 'running') return false;
      if (animName && !sourceAnimationGroup.hasAnimationName(animName)) {
        return false;
      } else if (
        eventEffectId &&
        eventEffectId !== effectId &&
        !sourceAnimationGroup.hasAnimationId(eventEffectId)
      ) {
        return false;
      }
    }

    return true;
  };

  const handler = (event: Event) => {
    if (matches(event)) {
      animation.play();
    }
  };

  const cleanup = () => {
    animation.cancel();
    source.removeEventListener('animationend', handler);
  };

  const handlerObj = { source, target, cleanup };
  addHandlerToMap(handlerMap, source, handlerObj);
  addHandlerToMap(handlerMap, target, handlerObj);

  source.addEventListener('animationend', handler);

  // The source's animation ended while this trigger was held back (see `latchAnimationEnd`) — that
  // event is gone, so play now if one of them would have triggered it.
  if (getLatchedEvents(source).some(matches)) {
    animation.play();
  }
}

/**
 * Latches the `animationend` events of `source` and its descendants while an `animationEnd`
 * interaction is held back (e.g. by a deferred or async plugin). A trigger later attached to
 * `source` or a descendant replays the events it would have received, playing once if any of them
 * matches its filter, so an animation that ended while held back still chains.
 *
 * Latching an ancestor covers sources that do not exist yet (e.g. created by the plugin holding the
 * trigger back): `sourceSelector` then limits the recorded events to those of the elements matching
 * it and their descendants, so other triggers in the subtree replay nothing. It listens in the capture phase, so the
 * non-bubbling `animationend` that `@wix/motion` dispatches for a WAAPI animation is recorded from
 * an ancestor too.
 */
function latchAnimationEnd(
  source: HTMLElement,
  _params?: AnimationEndParams,
  sourceSelector?: string,
): () => void {
  let sourceLatches = latches.get(source);

  if (sourceLatches?.some((latch) => latch.sourceSelector === sourceSelector)) {
    return () => {};
  }

  if (!sourceLatches) {
    sourceLatches = [];
    latches.set(source, sourceLatches);
  }

  const events = new Map<EventTarget, Map<string, Event>>();
  const listener = (event: Event) => {
    const target = event.target as HTMLElement;

    if (sourceSelector) {
      // an event of a matching element, or of its descendant (heard by the element if it bubbles)
      const match = target.closest(sourceSelector);

      if (!match || match === source || !source.contains(match)) {
        return;
      }
    }

    let targetEvents = events.get(target);

    if (!targetEvents) {
      targetEvents = new Map();
      events.set(target, targetEvents);
    }

    // keep the latest event of each animation
    targetEvents.set(getAnimationEndKey(event), event);
  };
  const latch: AnimationEndLatch = {
    sourceSelector,
    events,
    cleanup: () => source.removeEventListener('animationend', listener, true),
  };

  source.addEventListener('animationend', listener, true);
  sourceLatches.push(latch);

  return () => {
    const current = latches.get(source);
    const index = current ? current.indexOf(latch) : -1;

    if (index !== -1) {
      latch.cleanup();
      current!.splice(index, 1);

      if (!current!.length) {
        latches.delete(source);
      }
    }
  };
}

function removeAnimationEndHandler(element: HTMLElement): void {
  removeElementFromHandlerMap(handlerMap, element);
  removeLatches(element);
}

export default {
  add: addAnimationEndHandler,
  remove: removeAnimationEndHandler,
  latch: latchAnimationEnd,
  latchesSubtree: true,
};
