import { getScrubScene } from '@wix/motion';
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

function addPointerMoveHandler(
  source: HTMLElement,
  target: HTMLElement,
  effect: ScrubEffect,
  options: PointerMoveParams = {},
  { reducedMotion }: InteractOptions,
) {
  if (reducedMotion) {
    return;
  }

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
    });
    let disposed = false;
    const cleanup = () => {
      disposed = true;
      pointer.destroy();
    };

    const handlerObj = { source, target, cleanup };

    addHandlerToMap(pointerManagerMap, source, handlerObj);
    addHandlerToMap(pointerManagerMap, target, handlerObj);

    void Promise.all(
      scenes.map((s) => (s as { ready?: Promise<void> }).ready || Promise.resolve()),
    ).then(
      () => {
        if (disposed) return;
        pointer.start();
      },
      () => undefined,
    );
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
