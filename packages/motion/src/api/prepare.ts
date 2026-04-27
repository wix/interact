import type { AnimationEffectAPI, AnimationOptions, TimeAnimationOptions } from '../types';
import { getElement, getNamedEffect, measure, mutate } from './common';
import fastdom from 'fastdom';

function prepareAnimation(
  target: HTMLElement | string | null,
  animation: AnimationOptions,
  callback?: () => void,
) {
  const preset = getNamedEffect(animation);
  const element = target instanceof HTMLElement ? target : getElement(target);

  if (preset && (preset as AnimationEffectAPI<'time'>).prepare && element) {
    const domApi = { measure: measure(element), mutate: mutate(element) };

    (preset as AnimationEffectAPI<'time'>).prepare!(animation as TimeAnimationOptions, domApi);
  }

  if (callback) {
    fastdom.mutate(callback);
  }
}

export { prepareAnimation };
