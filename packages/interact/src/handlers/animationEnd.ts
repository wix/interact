import type { AnimationGroup } from '@wix/motion';
import { getAnimation, getElementCSSAnimation, getElementAnimation } from '@wix/motion';
import type { AnimationEndParams, TimeEffect, HandlerObjectMap, InteractOptions } from '../types';
import {
  effectToAnimationOptions,
  addHandlerToMap,
  removeElementFromHandlerMap,
} from './utilities';

const handlerMap = new WeakMap() as HandlerObjectMap;

function addAnimationEndHandler(
  source: HTMLElement,
  target: HTMLElement,
  effect: TimeEffect,
  params: AnimationEndParams,
  {
    reducedMotion,
    selectorCondition,
    animation: preCreatedAnimation,
    sourceAnimationOptions,
  }: InteractOptions,
): void {
  const animation = (preCreatedAnimation ||
    getAnimation(
      target,
      effectToAnimationOptions(effect),
      undefined,
      reducedMotion,
    )) as AnimationGroup | null;

  // Early return if animation is null, no handler attached
  if (!animation) {
    return;
  }

  const { effectId } = params;

  const handler = (event: Event) => {
    if (selectorCondition && !target.matches(selectorCondition)) return;

    // Resolve the source AnimationGroup at event time so we always see the
    // latest set of animations (they may not exist at setup time).
    const sourceGroup = sourceAnimationOptions
      ? (getElementCSSAnimation(source, sourceAnimationOptions) as AnimationGroup | null)
      : effectId
        ? (getElementAnimation(source, effectId) as AnimationGroup | null)
        : null;

    if (sourceGroup) {
      const animName = (event as AnimationEvent).animationName;
      // For CSS animations the event carries animationName; for the synthetic
      // WAAPI event it is undefined. Build the set of names the group owns.
      const groupNames = sourceGroup.animations.map(
        (a: Animation) => (a as CSSAnimation).animationName ?? undefined,
      );

      // If this event belongs to a different CSS animation, skip it.
      if (animName !== undefined && !groupNames.includes(animName)) return;

      // Wait until every animation in the group has finished.
      if (sourceGroup.animations.some((a: Animation) => a.playState === 'running')) return;
    } else if (effectId) {
      // Fallback when the source group cannot be resolved (e.g. CSS keyframeEffect
      // whose name equals the effectId, or when animations are gone post-finish).
      const animName = (event as AnimationEvent).animationName;
      if (animName !== undefined && !animName.startsWith(effectId)) return;
    }

    animation.play();
  };

  const cleanup = () => {
    animation.cancel();
    source.removeEventListener('animationend', handler);
  };

  const handlerObj = { source, target, cleanup };
  addHandlerToMap(handlerMap, source, handlerObj);
  addHandlerToMap(handlerMap, target, handlerObj);

  source.addEventListener('animationend', handler);
}

function removeAnimationEndHandler(element: HTMLElement): void {
  removeElementFromHandlerMap(handlerMap, element);
}

export default {
  add: addAnimationEndHandler,
  remove: removeAnimationEndHandler,
};
