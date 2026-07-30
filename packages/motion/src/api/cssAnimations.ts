import type {
  AnimationData,
  AnimationDataForScrub,
  AnimationEffectAPI,
  AnimationOptions,
  TriggerVariant,
} from '../types';
import {
  getEffectsData,
  getRanges,
  getNamedEffect,
  isNotAScrubTrigger,
  getReducedMotionOptions,
} from './common';

function getAnimationTarget(target: string | null, part: string | undefined) {
  return target ? `#${target}${part ? `[data-motion-part~="${part}"]` : ''}` : '';
}

function getAnimationAsCSS(
  data: {
    effect: AnimationData;
    options: KeyframeEffectOptions;
    id: string | undefined;
    part: string | undefined;
  },
  isRunning?: boolean,
) {
  const { duration, delay, iterations = 1, fill, easing = 'linear', direction } = data.options;
  const animationName = data.effect.name;
  const isAutoDuration = duration === 'auto';

  return `${animationName} ${isAutoDuration ? 'auto' : `${duration}ms`}${
    isAutoDuration ? ' ' : ` ${delay || 1}ms `
  }${easing}${fill && fill !== 'none' ? ` ${fill}` : ''} ${
    !iterations || iterations === Infinity ? 'infinite' : iterations
  }${direction === 'normal' ? '' : ` ${direction}`} ${isRunning ? '' : 'paused'}`;
}

function getCSSAnimationEffect(
  preset: AnimationEffectAPI<any> | null,
  animation: AnimationOptions,
  trigger?: Partial<TriggerVariant>,
): AnimationData[] {
  if (preset?.style) {
    // validate duration is a number over 0
    if (isNotAScrubTrigger(trigger)) {
      animation.duration = animation.duration || 1;
    }

    return preset.style(animation);
  }

  return [];
}

function getCSSAnimation(
  target: string | null,
  animationOptions: AnimationOptions,
  trigger?: TriggerVariant,
  options?: { reducedMotion?: boolean },
) {
  // get the preset for the given animation options
  const namedEffect = getNamedEffect(animationOptions) as AnimationEffectAPI<any> | null;

  let effectOptions = animationOptions;

  if (options?.reducedMotion) {
    // pass a copy - getCSSAnimationEffect() mutates the duration of the options it gets
    const reduced = getReducedMotionOptions({ ...animationOptions }, trigger);

    if (!reduced) {
      return [];
    }

    effectOptions = reduced;
  }

  const animationsData = getCSSAnimationEffect(namedEffect, effectOptions);
  const data = getEffectsData(animationsData, trigger, animationOptions.effectId, true);
  const isViewProgress = trigger?.trigger === 'view-progress';

  return data.map((item, index) => {
    const { start, end }: { start?: string; end?: string } = isViewProgress
      ? getRanges(item.effect as AnimationDataForScrub)
      : {};

    return {
      target: getAnimationTarget(target, item.part),
      animation: getAnimationAsCSS(item, isViewProgress),
      composition: item.options.composite,
      custom: item.effect.custom,
      name: item.effect.name,
      keyframes: item.effect.keyframes,
      id: item.id && `${item.id}-${index + 1}`,
      animationTimeline: isViewProgress ? `--${trigger?.id}` : '',
      animationRange: start || end ? `${start} ${end}` : '',
    };
  });
}

export { getCSSAnimation, getCSSAnimationEffect, getAnimationAsCSS };
