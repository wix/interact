import type { AnimationData, TimeAnimationOptions } from '../../../types';

type Preset = {
  web: (options: TimeAnimationOptions) => AnimationData[];
  layers?: (options: TimeAnimationOptions, asWeb?: boolean) => AnimationData[];
};

// the preset's layers before they're merged into one transform list
export function run(preset: Preset, namedEffect: Record<string, unknown> = {}, duration = 1000) {
  const options = { duration, namedEffect } as TimeAnimationOptions;
  return preset.layers ? preset.layers(options, true) : preset.web(options);
}

export function layer(animations: AnimationData[], name: string) {
  const animation = animations.find((a) => a.name === name);
  if (!animation) {
    throw new Error(`missing layer ${name}`);
  }
  return animation as AnimationData & { custom: Record<string, string | number> };
}
