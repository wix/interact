import type { DomApi, Poke, TimeAnimationOptions } from '../../types';
import { FOUR_DIRECTIONS } from '../../consts';
import {
  MOTION_LAYOUT_ROTATION_NAME,
  MOTION_TRANS_ROT_NAME,
  getMotionTransRot,
  useLayoutRotation,
} from '../../transformUtils';
import type { LoopPoint } from '../../easingUtils';
import { useDirectionalPreset } from '../../presetUtils';
import { ongoingGroup } from '../../ongoingGroup';
import { sideDirection } from '../../directions';

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

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return [MOTION_TRANS_ROT_NAME, MOTION_LAYOUT_ROTATION_NAME].map((name) => name + suffix);
}

export function web(options: TimeAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const { namedEffect, suffix } = options as TimeAnimationOptions<Poke>;
  const { travel = DEFAULTS.travel } = namedEffect!;

  const pokeOptions = {
    ...options,
    namedEffect: {
      ...namedEffect,
      travel,
    },
  } as TimeAnimationOptions;

  return [
    useDirectionalPreset(
      getMotionTransRot,
      pokeOptions,
      ongoingGroup,
      {
        defaultDirection: DEFAULTS.direction,
        directionType: sideDirection,
        loop: { shape: SHAPE },
      },
      asWeb,
      suffix,
    ),
    useLayoutRotation(pokeOptions, ongoingGroup, {}, asWeb, suffix),
  ];
}
