import type {
  AnimationData,
  AnimationDataForScrub,
  AnimationEffectAPI,
  AnimationOptions,
  SequenceOptions,
  TriggerVariant,
} from '../types';
import { getJsEasingInCSS } from '../utils';
import { getEffectsData, getRanges, getNamedEffect, isNotAScrubTrigger } from './common';

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
  sequenceOptions?: SequenceOptions,
) {
  const { duration, delay, iterations = 1, fill, easing = 'linear', direction } = data.options;
  const animationName = data.effect.name;
  const isAutoDuration = duration === 'auto';

  let delayStr = `${delay ?? 0}ms`;

  if (sequenceOptions?.sequenceId && typeof sequenceOptions?.offsetEasing === 'string') {
    const { delay: seqDelay, offset, offsetEasing, sequenceId } = sequenceOptions;
    const calcEasing = getJsEasingInCSS(offsetEasing);

    if (calcEasing) {
      const baseDelay = (delay ?? 0) + (seqDelay ?? 0);

      if (offset) {
        const easing = calcEasing(
          `(var(--motion-${sequenceId}-index, 0) / var(--motion-${sequenceId}-last, 1))`,
        );
        const stagger = `(${baseDelay} + ${easing} * ${offset ?? 0} * var(--motion-${sequenceId}-last, 1))`;
        delayStr = `calc(${stagger} * 1ms)`;
      } else {
        delayStr = `${baseDelay}ms`;
      }
    }
  }

  return `${animationName} ${isAutoDuration ? 'auto' : `${duration}ms`}${
    isAutoDuration ? ' ' : ` ${delayStr} `
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
  sequenceOptions?: SequenceOptions,
) {
  // get the preset for the given animation options
  const namedEffect = getNamedEffect(animationOptions) as AnimationEffectAPI<any> | null;

  const animationsData = getCSSAnimationEffect(namedEffect, animationOptions);
  const data = getEffectsData(animationsData, trigger, animationOptions.effectId, true);
  const isViewProgress = trigger?.trigger === 'view-progress';

  return data.map((item, index) => {
    const { start, end }: { start?: string; end?: string } = isViewProgress
      ? getRanges(item.effect as AnimationDataForScrub)
      : {};

    return {
      target: getAnimationTarget(target, item.part),
      animation: getAnimationAsCSS(item, isViewProgress, sequenceOptions),
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
