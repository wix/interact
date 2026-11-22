import type { AnimationGroup } from '@wix/motion';
import { getAnimation, getElementCSSAnimation } from '@wix/motion';
import type { AnimationEndParams, TimeEffect, HandlerObjectMap, InteractOptions } from '../types';
import {
  effectToAnimationOptions,
  addHandlerToMap,
  removeElementFromHandlerMap,
} from './utilities';

const handlerMap = new WeakMap() as HandlerObjectMap;
// per source, the latest `animationend` of each animation that ended while its trigger was held
// back (see `latchAnimationEnd`), with the listener recording them
const latches = new WeakMap<HTMLElement, { events: Map<string, Event>; cleanup: () => void }>();

function getAnimationEndKey(event: Event) {
  return (event as AnimationEvent).animationName || `#${(event as CustomEvent).detail?.effectId}`;
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
  const latched = latches.get(source)?.events;

  if (latched && [...latched.values()].some(matches)) {
    animation.play();
  }
}

/**
 * Latches the `animationend` events of `source` while an `animationEnd` interaction on it is held
 * back (e.g. by a deferred or async plugin). A trigger later attached to `source` replays them,
 * playing once if any of them matches its filter, so an animation that ended while held back still
 * chains.
 */
function latchAnimationEnd(source: HTMLElement): void {
  if (latches.has(source)) {
    return;
  }

  const events = new Map<string, Event>();
  const listener = (event: Event) => {
    const key = getAnimationEndKey(event);

    // re-insert to keep the latest event of each animation, in the order they ended
    events.delete(key);
    events.set(key, event);
  };

  source.addEventListener('animationend', listener);
  latches.set(source, {
    events,
    cleanup: () => source.removeEventListener('animationend', listener),
  });
}

function removeAnimationEndHandler(element: HTMLElement): void {
  removeElementFromHandlerMap(handlerMap, element);
  latches.get(element)?.cleanup();
  latches.delete(element);
}

export default {
  add: addAnimationEndHandler,
  remove: removeAnimationEndHandler,
  latch: latchAnimationEnd,
};
