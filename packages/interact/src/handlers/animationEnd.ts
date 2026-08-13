import type { AnimationGroup } from '@wix/motion';
import { getAnimation, getElementCSSAnimation } from '@wix/motion';
import type { AnimationEndParams, TimeEffect, HandlerObjectMap, InteractOptions } from '../types';
import {
  effectToAnimationOptions,
  addHandlerToMap,
  removeElementFromHandlerMap,
} from './utilities';
import { matchesSelectorCondition } from '../utils';

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
    if (selectorCondition && !matchesSelectorCondition(target, selectorCondition)) return;

    const animName = (event as AnimationEvent).animationName;
    const eventEffectId = (event as CustomEvent).detail?.effectId;

    const sourceAnimationGroup = sourceAnimationOptions
      ? getElementCSSAnimation(source, sourceAnimationOptions)
      : null;

    if (sourceAnimationGroup) {
      if (sourceAnimationGroup.playState === 'running') return;
      if (animName && !sourceAnimationGroup.hasAnimationName(animName)) {
        return;
      } else if (
        eventEffectId &&
        eventEffectId !== effectId &&
        !sourceAnimationGroup.hasAnimationId(eventEffectId)
      ) {
        return;
      }
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
