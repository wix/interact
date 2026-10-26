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
import { getCssUnits, getEasing, normalizeKeyframes } from '../utils';
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

/**
 * Creates the native ViewTimeline for a view-progress subject, or returns null when the effect has
 * to take the page-based fallback instead: when the browser has no ViewTimeline, or when the
 * subject's scroll container can't scroll on the timeline's axis.
 *
 * A view timeline follows the subject's nearest scroll container, and that can't be overridden.
 * `overflow-x: scroll` (a horizontal slider) makes a box a scroll container on both axes, so a
 * block-axis timeline inside a slider follows a box that never scrolls on that axis, and its
 * progress stays fixed while the page scrolls.
 *
 * This is decided once, when the effect is created. If the layout changes later, e.g. a slider
 * that appears or goes away at a breakpoint, the effect keeps its path until it is created again.
 */
function getViewTimeline(subject: HTMLElement | null): typeof window.ViewTimeline | null {
  if (!window.ViewTimeline) {
    return null;
  }

  // @ts-expect-error
  const timeline = new ViewTimeline({ subject });
  // the browser resolves the scroll container (Chrome already lays out to construct the timeline,
  // so the reads below add no layout of their own)
  const source: Element | null = timeline.source;

  // no box to resolve a scroller from (yet), or the page scrolls the subject
  if (!source || source === source.ownerDocument.scrollingElement) {
    return timeline;
  }

  // the block axis is horizontal in vertical writing modes
  const style = getComputedStyle(source);
  const horizontal = /^(vertical|sideways)/.test(style.writingMode);
  const overflow = horizontal ? style.overflowX : style.overflowY;
  const scrollRange = horizontal
    ? source.scrollWidth - source.clientWidth
    : source.scrollHeight - source.clientHeight;
  const canScroll = (overflow === 'auto' || overflow === 'scroll') && scrollRange > 0;

  return canScroll ? timeline : null;
}

/**
 * Whether a view-progress effect on `subject` runs on a native ViewTimeline. When it's false, drive
 * the effect with the scenes from `getScrubScene()` against the page's scroll.
 */
function canUseViewTimeline(subject: HTMLElement | null): boolean {
  return !!getViewTimeline(subject);
}

function getEffectsData(
  animations: AnimationData[],
  trigger?: Partial<TriggerVariant>,
  effectId?: string,
  viewTimeline?: boolean,
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
      // `viewTimeline` is true when the animation runs on a native view timeline. SSR / CSS
      // generation always passes true, so it emits `duration: auto` for scroll-driven animations.
      if (trigger?.trigger === 'view-progress' && viewTimeline) {
        effectOptions.duration = 'auto';
      } else {
        // if ViewTimeline not supported then put a 100ms value in duration get a progress we can easily relate to
        // we split the duration to 99.99ms and delay of 0.01ms to get the fill-mode effect working
        effectOptions.duration = 99.99;
        effectOptions.delay = 0.01;
      }
    }

    // keyframe property names may be authored in camelCase or kebab-case,
    // WAAPI only understands camelCase
    const keyframes = normalizeKeyframes(effect.keyframes);

    return {
      effect: keyframes === effect.keyframes ? effect : { ...effect, keyframes },
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
  getViewTimeline,
  canUseViewTimeline,
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
