import type { AnimationGroup, ScrubScrollScene } from '@wix/motion';
import {
  getAnimation,
  getElementCSSAnimation,
  getScrubScene,
  watchViewTimeline,
} from '@wix/motion';
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

type ScrollPath = { ready: Promise<unknown>; stop: () => void };

function addViewProgressHandler(
  source: HTMLElement,
  target: HTMLElement,
  effect: ScrubEffect,
  __: ViewEnterParams,
  { reducedMotion, selectorCondition }: InteractOptions,
): void {
  if (reducedMotion) {
    return;
  }

  if (selectorCondition && !target.matches(selectorCondition)) return;

  const triggerParams = (useViewTimeline: boolean) => ({
    trigger: 'view-progress' as const,
    element: source,
    useViewTimeline,
  });

  const effectOptions = effectToAnimationOptions(effect);

  // CSS from generate() runs on its own view timeline. Inside a horizontal slider that timeline is
  // stuck too, but the fallback stacked on top of it would only cover it while the fallback fills.
  if ('ViewTimeline' in window && getElementCSSAnimation(target, effectOptions)) {
    getAnimation(target, effectOptions, triggerParams(true));
    return;
  }

  // Use ViewTimeline for modern browsers
  const playOnViewTimeline = (): ScrollPath | undefined => {
    const animationGroup = getAnimation(
      target,
      effectOptions,
      triggerParams(true),
    ) as AnimationGroup | null;

    if (!animationGroup || animationGroup.isCSS) return;

    animationGroup.play();

    return {
      ready: animationGroup.ready,
      stop: () => {
        animationGroup.ready.then(() => {
          animationGroup.cancel();
        });
      },
    };
  };

  // Page-based fallback: no ViewTimeline, or the source's scroller doesn't scroll on its axis
  const scrubOnScroll = (): ScrollPath | undefined => {
    const scene = getScrubScene(target, effectOptions, triggerParams(false));

    if (!scene) return;

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

    let stopped = false;
    const ready = Promise.all(
      (scenes as ScrubScrollScene[]).map((s) => s.ready || Promise.resolve()),
    ).then(() => {
      if (!stopped) scroll.start();
    });

    return {
      ready,
      stop: () => {
        stopped = true;
        scroll.destroy();
        // destroy() leaves a frame that is already scheduled, which then ticks the removed effect;
        // a switch to the native timeline stops the fallback mid-scroll, when such a frame is likely
        scroll.tick = () => {};
      },
    };
  };

  let path: ScrollPath | undefined;

  // the path follows layout changes, e.g. a slider below a breakpoint, or content that arrives later
  const unwatch = watchViewTimeline(source, (useViewTimeline) => {
    const previous = path;
    path = useViewTimeline ? playOnViewTimeline() : scrubOnScroll();
    // keep the previous path until the new one runs, so the effect doesn't drop out for a frame
    (path?.ready ?? Promise.resolve()).then(() => previous?.stop());
  });

  if (!path) {
    unwatch();
    return;
  }

  const cleanup = () => {
    unwatch();
    path?.stop();
  };

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
