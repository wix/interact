import type { AnimationData, DomApi, Poke, TimeAnimationOptions } from '../../types';
import { FOUR_DIRECTIONS } from '../../consts';
import {
  getMotionLayoutRotation,
  getMotionTransRot,
  mergeTransformLayers,
} from '../../transformUtils';
import type { LoopPoint } from '../../easingUtils';
import { getLoopOverrides } from '../../easingUtils';
import { parseCssLength } from '../../utils';
import { sideDirection, toMotionRange } from '../../directions';

const DEFAULTS: Required<Poke> = {
  type: 'Poke',
  direction: 'right',
  iterationDelay: 0,
  travel: { value: 62.5, unit: 'px' },
};

export const schema = {
  direction: { type: 'enum', values: FOUR_DIRECTIONS, default: DEFAULTS.direction },
  iterationDelay: { type: 'number', min: 0, default: DEFAULTS.iterationDelay },
  travel: { type: 'length', default: DEFAULTS.travel },
};

// two pokes towards the direction
const SHAPE: LoopPoint[] = [
  [0, 0],
  [0.28, 0.17],
  [1, 0.32],
  [0.32, 0.48],
  [0.44, 0.56],
  [1, 0.66],
  [0.16, 0.83],
  [0, 1],
];

export function getNames(options: TimeAnimationOptions) {
  return style(options).map(({ name }) => name!);
}

export function web(options: TimeAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function layers(options: TimeAnimationOptions, asWeb = false): AnimationData[] {
  const { namedEffect, suffix } = options as TimeAnimationOptions<Poke>;
  const { travel = DEFAULTS.travel } = namedEffect!;

  const pokeOptions = {
    ...options,
    namedEffect: {
      ...namedEffect,
      travel,
    },
  } as TimeAnimationOptions;

  // the keyframes start at their peak, towards the direction
  const side = sideDirection.opposite(
    sideDirection.parse(namedEffect?.direction, DEFAULTS.direction),
  );

  return [
    {
      ...pokeOptions,
      ...getLoopOverrides(pokeOptions, { shape: SHAPE }),
      ...getMotionTransRot(
        toMotionRange(sideDirection, side, 'in'),
        { travel: parseCssLength(travel, { value: 0, unit: 'px' }) },
        asWeb,
        suffix,
      ),
    },
    {
      ...pokeOptions,
      composite: 'add',
      ...getLoopOverrides(pokeOptions),
      ...getMotionLayoutRotation({}, asWeb, suffix),
    },
  ];
}

export function style(...args: Parameters<typeof layers>): AnimationData[] {
  return mergeTransformLayers(layers(...args), args[0].suffix);
}
