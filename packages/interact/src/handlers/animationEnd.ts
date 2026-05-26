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

    const animName = (event as AnimationEvent).animationName;
    const eventEffectId = (event as CustomEvent).detail?.effectId;

    const sourceGroup = (sourceAnimationOptions
      ? getElementCSSAnimation(source, sourceAnimationOptions) as AnimationGroup | null
      : getElementAnimation(source, effectId) as AnimationGroup | null)?.animations;

    if (sourceGroup && sourceGroup.length) {
      if (sourceGroup.some((a: Animation) => a.playState === 'running')) {
        return;
      }
      if (animName) {
        const groupNames = sourceGroup.map(
          (a: Animation) => (a as CSSAnimation).animationName,
        );
        if (!groupNames.includes(animName)) {
          return;
        }
      } else if (eventEffectId) {
        const groupIds = sourceGroup.map(
          (a: Animation) => a.id,
        );
        if (eventEffectId !== effectId && !groupIds.includes(eventEffectId)) {
          return;
        }
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
