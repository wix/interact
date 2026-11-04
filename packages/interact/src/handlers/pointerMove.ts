import { getScrubScene, getJsEasing } from '@wix/motion';
import { Pointer } from 'kuliso';
import type { PointerMoveParams, ScrubEffect, HandlerObjectMap, InteractOptions } from '../types';
import {
  effectToAnimationOptions,
  addHandlerToMap,
  removeElementFromHandlerMap,
} from './utilities';

const pointerManagerMap = new WeakMap() as HandlerObjectMap;
let pointerOptionsGetter: () => Partial<PointerConfig> = () => ({});

function registerOptionsGetter(getter: () => Partial<PointerConfig>) {
  pointerOptionsGetter = getter;
}

// namedEffect presets apply their own CSS transition, so only smooth progress for the rest
function getTransitionOptions(effect: ScrubEffect): {
  transitionDuration?: number;
  transitionEasing?: (t: number) => number;
} {
  if (!('keyframeEffect' in effect || 'customEffect' in effect) || !effect.transitionDuration) {
    return {};
  }

  return {
    transitionDuration: effect.transitionDuration,
    transitionEasing: getJsEasing(effect.transitionEasing),
  };
}

function addPointerMoveHandler(
  source: HTMLElement,
  target: HTMLElement,
  effect: ScrubEffect,
  options: PointerMoveParams = {},
  { selectorCondition }: InteractOptions,
) {
  if (selectorCondition && !target.matches(selectorCondition)) return;

  const triggerParams = {
    trigger: 'pointer-move' as const,
    element: source,
    axis: options.axis ?? 'y',
  };

  const scene = getScrubScene(target, effectToAnimationOptions(effect), triggerParams);

  if (scene) {
    const scenes = Array.isArray(scene) ? scene : [scene];
    const pointer = new Pointer({
      root: options.hitArea === 'self' ? source : undefined,
      scenes,
      ...pointerOptionsGetter(),
      ...getTransitionOptions(effect),
    });
    const cleanup = () => {
      pointer.destroy();
    };

    const handlerObj = { source, target, cleanup };

    addHandlerToMap(pointerManagerMap, source, handlerObj);
    addHandlerToMap(pointerManagerMap, target, handlerObj);

    Promise.all(
      scenes.map((s) => (s as { ready?: Promise<void> }).ready || Promise.resolve()),
    ).then(() => {
      pointer.start();
    });
  }
}

function removePointerMoveHandler(element: HTMLElement) {
  removeElementFromHandlerMap(pointerManagerMap, element);
}

export default {
  add: addPointerMoveHandler,
  remove: removePointerMoveHandler,
  registerOptionsGetter,
};
