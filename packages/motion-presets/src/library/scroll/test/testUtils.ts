import type { AnimationData, DomApi, ScrubAnimationOptions } from '../../../types';

export function scrollOptions(
  namedEffect: Record<string, unknown>,
  extra: Partial<ScrubAnimationOptions> = {},
) {
  return { namedEffect, ...extra } as ScrubAnimationOptions;
}

export function byName(animations: AnimationData[], name: string): any {
  return animations.find((animation) => animation.name === name)!;
}

// runs measure/mutate synchronously on the given element
export function fakeDom(target: HTMLElement): DomApi {
  return {
    measure: (fn) => fn(target),
    mutate: (fn) => fn(target),
  } as DomApi;
}
