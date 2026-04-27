import type {
  AnimationData,
  AnimationDataForScrub,
  AnimationOptions,
  MeasureCallback,
  RangeOffset,
  TimeAnimationOptions,
  TriggerVariant,
  UnitLengthPercentage,
} from '../types';
import { getCssUnits, getEasing } from '../utils';
import fastdom from 'fastdom';
import { getRegisteredEffect } from './registry';

function getElement(id: string | null, ownerDocument?: Document): HTMLElement | null {
  return id ? (ownerDocument || document).getElementById(id) : null;
}

function getElementMotionPart(element: Element | null, part: string) {
  if (element?.matches(`[data-motion-part~="${part}"]`)) {
    return element;
  }
  return element?.querySelector(`[data-motion-part~="${part}"]`);
}

function getDirection(effect: AnimationData): KeyframeEffectOptions['direction'] {
  const alternate = effect.alternate ? 'alternate' : '';
  return effect.reversed
    ? (`${alternate ? `${alternate}-` : ''}reverse` as 'reverse' | 'alternate-reverse')
    : alternate || 'normal';
}

function getLength(length: UnitLengthPercentage): string {
  return `${length.value}${getCssUnits(length.unit)}`;
}

function getRange(range: RangeOffset, add: string | undefined, isEnd?: boolean) {
  // according to the CSS spec if the end range is a <length> then it is calculated from the start of the named range
  // our model assumes that <length> in end range is calculated from the end of the named range
  return `${range.name || 'cover'} ${
    isEnd && range.offset!.unit !== 'percentage'
      ? `calc(100% + ${getLength(range.offset!)}${add ? ` + ${add}` : ''})`
      : add
        ? `calc(${getLength(range.offset!)} + ${add})`
        : getLength(range.offset!)
  }`;
}

function getRanges(effect: AnimationDataForScrub) {
  return {
    start: getRange(effect.startOffset!, effect.startOffsetAdd),
    end: getRange(effect.endOffset!, effect.endOffsetAdd, true),
  };
}

function measure(target: HTMLElement | null): MeasureCallback {
  return (fn) => fastdom.measure(() => fn(target));
}

function mutate(target: HTMLElement | null): MeasureCallback {
  return (fn) => fastdom.mutate(() => fn(target));
}

function getNamedEffect(animation: AnimationOptions) {
  if (animation.namedEffect) {
    const effectName = animation.namedEffect.type;
    return typeof effectName === 'string' ? getRegisteredEffect(effectName) : null;
  } else if (animation.keyframeEffect) {
    const effect = (animation_: AnimationOptions) => {
      const { name, keyframes } = animation_.keyframeEffect!;

      return [{ ...animation_, name, keyframes }];
    };
    const getNames = (animation_: AnimationOptions) => {
      const { effectId } = animation_;
      const { name } = animation_.keyframeEffect!;
      const uid = name || effectId;

      return uid ? [uid] : [];
    };
    return { web: effect, style: effect, getNames };
  } else if (animation.customEffect) {
    return (animation_: AnimationOptions) => [{ ...animation_, keyframes: [] }];
  }
  return null;
}

function getEffectsData(
  animations: AnimationData[],
  trigger?: Partial<TriggerVariant>,
  effectId?: string,
) {
  // process each AnimationData object into a KeyframeEffect object
  return animations.map((effect, index) => {
    // prepare the KeyframeEffectOptions object
    const effectOptions = {
      fill: effect.fill,
      easing: getEasing(effect.easing),
      iterations: effect.iterations === 0 ? Infinity : effect.iterations || 1,
      composite: effect.composite,
      direction: getDirection(effect),
    } as KeyframeEffectOptions & { rangeStart: string; rangeEnd: string };

    // if this is a time-based animation then set the duration and delay as time values
    if (isNotAScrubTrigger(trigger)) {
      effectOptions.duration = effect.duration as number;
      effectOptions.delay = (effect as TimeAnimationOptions).delay || 0;
    } else {
      // if ViewTimeline is supported AND this is a view-progress trigger
      if (window.ViewTimeline && trigger?.trigger === 'view-progress') {
        // set duration to 'auto'
        effectOptions.duration = 'auto';
      } else {
        // if ViewTimeline not supported then put a 100ms value in duration get a progress we can easily relate to
        // we split the duration to 99.99ms and delay of 0.01ms to get the fill-mode effect working
        effectOptions.duration = 99.99;
        effectOptions.delay = 0.01;
      }
    }

    return {
      effect,
      options: effectOptions,
      id: effectId && `${effectId}-${index + 1}`,
      part: effect.part,
    };
  });
}

function isNotAScrubTrigger(trigger?: Partial<TriggerVariant>) {
  return !trigger || (trigger.trigger !== 'pointer-move' && trigger.trigger !== 'view-progress');
}

export {
  isNotAScrubTrigger,
  getElement,
  getElementMotionPart,
  getNamedEffect,
  getEffectsData,
  measure,
  mutate,
  getDirection,
  getLength,
  getRanges,
};
