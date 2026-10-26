import type {
  AnimationData,
  AnimationDataForScrub,
  AnimationEffectAPI,
  AnimationOptions,
  MouseAnimationFactory,
  MouseAnimationInstance,
  ScrubAnimationOptions,
  TriggerVariant,
  WebAnimationEffectFactory,
} from '../types';
import { CustomAnimation } from '../CustomAnimation';
import { AnimationGroup } from '../AnimationGroup';
import {
  getElement,
  getElementMotionPart,
  measure,
  mutate,
  getRanges,
  getNamedEffect,
  getEffectsData,
  getScrubRange,
  isNotAScrubTrigger,
} from './common';
import { resolveUseViewTimeline } from './viewTimeline';
import fastdom from 'fastdom';

function getWebAnimationEffect(
  preset: AnimationEffectAPI<any> | WebAnimationEffectFactory<any> | null,
  animation: AnimationOptions,
  target: Element | string | null,
  trigger?: Partial<TriggerVariant>,
  options?: Record<string, any>,
): AnimationData[] | MouseAnimationFactory {
  if (preset) {
    // validate duration is a number over 0
    if (isNotAScrubTrigger(trigger)) {
      animation.duration = animation.duration || 1;

      if (options?.reducedMotion) {
        if (animation.iterations === 1 || animation.iterations == undefined) {
          animation = { ...animation, duration: 1 };
        } else {
          return [];
        }
      }
    }

    let domApi;
    if (target instanceof HTMLElement) {
      domApi = { measure: measure(target), mutate: mutate(target) };
    }

    return (preset as AnimationEffectAPI<any>).web
      ? (preset as AnimationEffectAPI<any>).web(animation, domApi, options)
      : (preset as WebAnimationEffectFactory<any>)(animation, domApi, options);
  }

  return [];
}

function getWebAnimation(
  target: Element | string | null,
  animationOptions: AnimationOptions,
  trigger?: Partial<TriggerVariant> & { element?: HTMLElement },
  options?: Record<string, any>,
  ownerDocument?: Document,
): AnimationGroup | MouseAnimationInstance | null {
  const element = typeof target === 'string' ? getElement(target, ownerDocument) : target;

  if (trigger?.trigger === 'pointer-move' && !animationOptions.keyframeEffect) {
    let effectOptions = animationOptions;

    if (animationOptions.customEffect) {
      effectOptions = {
        ...animationOptions,
        namedEffect: { id: '', type: 'CustomMouse' },
      };
    }

    // TODO: need to fix the type here, currently lying about the returned type to be WebAnimationEffectFactory instead of MouseAnimationFactoryCreate
    const mouseAnimationPreset = getNamedEffect(
      effectOptions,
    ) as WebAnimationEffectFactory<'scrub'>;
    const mouseAnimationFactory = getWebAnimationEffect(
      mouseAnimationPreset,
      animationOptions,
      element,
      trigger,
      options,
    ) as MouseAnimationFactory;

    if (typeof mouseAnimationFactory !== 'function') {
      return null;
    }

    return mouseAnimationFactory(element as HTMLElement);
  }

  // get the preset for the given animation options
  const namedEffect = getNamedEffect(animationOptions) as AnimationEffectAPI<any> | null;

  const animationsData = getWebAnimationEffect(
    namedEffect,
    animationOptions,
    element,
    trigger,
    options,
  ) as AnimationData[];

  // Return null if animation data cannot be generated
  if (!animationsData || animationsData.length === 0) {
    return null;
  }

  const isViewProgress = trigger?.trigger === 'view-progress';
  let timeline: typeof window.ViewTimeline | undefined;

  // a ScrubAnimation with view-progress trigger runs on a native ViewTimeline when one can follow its
  // subject (see canUseViewTimeline()), or as the trigger's `useViewTimeline` says
  if (isViewProgress) {
    const subject = trigger.element || getElement(trigger.componentId!);

    if (resolveUseViewTimeline(trigger, subject)) {
      // @ts-expect-error
      timeline = new ViewTimeline({ subject });
    }
  }

  const data = getEffectsData(animationsData, trigger, animationOptions.effectId, !!timeline);

  // generate an Animation object for each data object
  const animations = data.map(({ effect, options: effectOptions, id, part }) => {
    const effectTarget = part ? getElementMotionPart(element, part) : element;

    const keyframeEffect = new KeyframeEffect(effectTarget || null, [], effectOptions);

    // set the keyframes for the KeyframeEffect after measurements and mutations
    fastdom.mutate(() => {
      if ('timing' in effect) {
        keyframeEffect.updateTiming(effect.timing as OptionalEffectTiming);
      }

      keyframeEffect.setKeyframes(effect.keyframes);
    });

    const timingOptions =
      isViewProgress && timeline ? { timeline: timeline as AnimationTimeline } : {};
    const animation: Animation | CustomAnimation =
      typeof effect.customEffect === 'function'
        ? (new CustomAnimation(
            effect.customEffect,
            effectTarget || null,
            effectOptions,
            timingOptions,
          ) as Animation)
        : new Animation(keyframeEffect, timingOptions.timeline);

    // if this is a ScrubAnimation with view-progress trigger and the browser supports the ViewTimeline API
    if (isViewProgress) {
      if (timeline) {
        // set the ranges for the animation after measurements and mutations
        fastdom.mutate(() => {
          const { start, end } = getRanges(effect as AnimationDataForScrub);
          // @ts-expect-error
          animation.rangeStart = start;
          // @ts-expect-error
          animation.rangeEnd = end;

          animation.play();
        });
      } else {
        const { startOffset, endOffset } = animationOptions as ScrubAnimationOptions;

        // set the ranges for the animation after measurements and mutations
        fastdom.mutate(() => {
          const startOffsetToWrite = (effect as AnimationDataForScrub).startOffset || startOffset;
          const endOffsetToWrite = (effect as AnimationDataForScrub).endOffset || endOffset;

          Object.assign(animation, {
            start: getScrubRange(
              startOffsetToWrite!,
              (effect as AnimationDataForScrub).startOffsetAdd,
            ),
            end: getScrubRange(
              endOffsetToWrite!,
              (effect as AnimationDataForScrub).endOffsetAdd,
              true,
            ),
          });
        });
      }
    }

    if (id) {
      animation.id = id;
    }

    return animation;
  });

  // create an AnimationGroup with the generate animations
  return new AnimationGroup(animations, {
    ...animationOptions,
    trigger: { ...(trigger || ({} as Partial<TriggerVariant>)) },
    // make sure the group is ready after all animation targets are measured and mutated
    measured: new Promise((resolve) => fastdom.mutate(resolve)),
  });
}

export { getWebAnimation };
