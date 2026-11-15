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

type RangeValue = { rangeName?: string; offset?: CSSNumericValue | null } | string;
type ScrollTimelineAnimation = Animation & {
  rangeStart?: RangeValue;
  rangeEnd?: RangeValue;
  timeline:
    | (AnimationTimeline & {
        startOffset?: CSSNumericValue | null;
        endOffset?: CSSNumericValue | null;
      })
    | null;
};

const MAX_CLAMP_ATTEMPTS = 10;

function isOutEffect(effect: ScrubEffect) {
  return (effect as { namedEffect?: { range?: string } }).namedEffect?.range === 'out';
}

function toPixels(value: CSSNumericValue | null | undefined): number | null {
  return value instanceof CSSUnitValue && value.unit === 'px' ? value.value : null;
}

function toCoverPercentage(offset: CSSNumericValue, coverLength: number): number | null {
  if (offset instanceof CSSUnitValue) {
    if (offset.unit === 'percent') return offset.value;
    if (offset.unit === 'px') return (offset.value / coverLength) * 100;
    return null;
  }
  if (offset instanceof CSSMathSum) {
    let total = 0;
    for (const value of offset.values) {
      const percentage = toCoverPercentage(value, coverLength);
      if (percentage === null) return null;
      total += percentage;
    }
    return total;
  }
  return null;
}

function clampOutRangeStart(animation: ScrollTimelineAnimation): boolean {
  const { rangeStart, rangeEnd, timeline } = animation;
  const coverStart = toPixels(timeline?.startOffset);
  const coverEnd = toPixels(timeline?.endOffset);

  if (coverStart === null || coverEnd === null) return false;

  const coverLength = coverEnd - coverStart;

  if (
    coverLength <= 0 ||
    typeof rangeStart !== 'object' ||
    rangeStart.rangeName !== 'cover' ||
    !rangeStart.offset ||
    typeof rangeEnd !== 'object' ||
    rangeEnd.rangeName !== 'cover' ||
    !rangeEnd.offset
  ) {
    return true;
  }

  const start = toCoverPercentage(rangeStart.offset, coverLength);
  const end = toCoverPercentage(rangeEnd.offset, coverLength);
  const progressAtTop = (-coverStart / coverLength) * 100;

  if (start !== null && end !== null && progressAtTop > start && progressAtTop < end) {
    animation.rangeStart = `cover ${progressAtTop}%`;
  }

  return true;
}

function clampOutRangeStarts(animations: Animation[], attempt = 1) {
  requestAnimationFrame(() => {
    const pending = animations.filter(
      (animation) => !clampOutRangeStart(animation as ScrollTimelineAnimation),
    );

    if (pending.length && attempt < MAX_CLAMP_ATTEMPTS) {
      clampOutRangeStarts(pending, attempt + 1);
    }
  });
}

function addViewProgressHandler(
  source: HTMLElement,
  target: HTMLElement,
  effect: ScrubEffect,
  __: ViewEnterParams,
  { selectorCondition }: InteractOptions,
): void {
  if (selectorCondition && !target.matches(selectorCondition)) return;

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

    if (animationGroup && isOutEffect(effect) && 'CSSUnitValue' in window) {
      clampOutRangeStarts(animationGroup.animations);
    }

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
