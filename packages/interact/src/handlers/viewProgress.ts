import type { AnimationGroup, ScrubScrollScene } from '@wix/motion';
import { getAnimation, getScrubScene } from '@wix/motion';
import { Scroll } from 'fizban';
import type { ViewEnterParams, ScrubEffect, HandlerObjectMap, InteractOptions } from '../types';
import {
  effectToAnimationOptions,
  addHandlerToMap,
  removeElementFromHandlerMap,
} from './utilities';

const scrollManagerMap = new WeakMap() as HandlerObjectMap;
let scrollOptionsGetter: () => Partial<scrollConfig> = () => ({});

function registerOptionsGetter(getter: () => Partial<scrollConfig>) {
  scrollOptionsGetter = getter;
}

function addViewProgressHandler(
  source: HTMLElement,
  target: HTMLElement,
  effect: ScrubEffect,
  __: ViewEnterParams,
  { reducedMotion }: InteractOptions,
): void {
  if (reducedMotion) {
    return;
  }

  const triggerParams = {
    trigger: 'view-progress' as const,
    element: source,
  };

  const effectOptions = effectToAnimationOptions(effect);
  let cleanup;
  if ('ViewTimeline' in window) {
    // Use ViewTimeline for modern browsers
    const animationGroup = getAnimation(
      target,
      effectOptions,
      triggerParams,
    ) as AnimationGroup | null;

    if (animationGroup && !animationGroup.isCSS) {
      animationGroup.play();

      cleanup = () => {
        (animationGroup as AnimationGroup).ready.then(() => {
          animationGroup.cancel();
        });
      };
    }
  } else {
    const scene = getScrubScene(target, effectOptions, triggerParams);

    if (scene) {
      const scenes = Array.isArray(scene) ? scene : [scene];
      const scroll = new Scroll({
        viewSource: source,
        scenes,
        observeViewportEntry: false,
        observeViewportResize: false,
        observeSourcesResize: true,
        root: document.body,
        ...scrollOptionsGetter(),
      });

      cleanup = () => {
        scroll.destroy();
      };

      Promise.all((scenes as ScrubScrollScene[]).map((s) => s.ready || Promise.resolve())).then(
        () => {
          scroll.start();
        },
      );
    }
  }

  if (!cleanup) return;

  const handlerObj = { source, target, cleanup };

  addHandlerToMap(scrollManagerMap, source, handlerObj);
  addHandlerToMap(scrollManagerMap, target, handlerObj);
}

function removeViewProgressHandler(element: HTMLElement): void {
  removeElementFromHandlerMap(scrollManagerMap, element);
}

export default {
  add: addViewProgressHandler,
  remove: removeViewProgressHandler,
  registerOptionsGetter,
};
