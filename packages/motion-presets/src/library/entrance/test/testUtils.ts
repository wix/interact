import type { AnimationData, TimeAnimationOptions } from '../../../types';

type Preset = { web: (options: TimeAnimationOptions) => AnimationData[] };

export function run(preset: Preset, namedEffect: Record<string, unknown> = {}, duration = 1000) {
  return preset.web({ duration, namedEffect } as TimeAnimationOptions);
}

export function layer(animations: AnimationData[], name: string) {
  const animation = animations.find((a) => a.name === name);
  if (!animation) {
    throw new Error(`missing layer ${name}`);
  }
  return animation as AnimationData & { custom: Record<string, string | number> };
}
