import type { DomApi, Flip, TimeAnimationOptions } from '../../types';
import { AXIS_DIRECTIONS } from '../../consts';
import {
  MOTION_3D_TRANSFORM_NAME,
  MOTION_LAYOUT_ROTATION_NAME,
  getMotion3dTransform,
  useLayoutRotation,
} from '../../transformUtils';
import { useDirectionalPreset } from '../../presetUtils';
import { ongoingGroup } from '../../ongoingGroup';
import { axisDirection } from '../../directions';

const DEFAULT_EASING = 'linear';
const ANGLE = 360;

const DEFAULTS: Required<Flip> = {
  type: 'Flip',
  direction: 'horizontal',
  iterationDelay: 0,
  perspective: 800,
};

export const schema = {
  direction: { type: 'enum', values: AXIS_DIRECTIONS, default: DEFAULTS.direction },
  iterationDelay: { type: 'number', min: 0, default: DEFAULTS.iterationDelay },
  perspective: { type: 'number', min: 0, default: DEFAULTS.perspective },
};

// a full flip - starting a turn away from rest, which looks the same
const SHAPE: [number, number][] = [
  [1, 0],
  [0, 1],
];

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return [MOTION_LAYOUT_ROTATION_NAME, MOTION_3D_TRANSFORM_NAME].map((name) => name + suffix);
}

export function web(options: TimeAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const { easing = DEFAULT_EASING, namedEffect, suffix } = options as TimeAnimationOptions<Flip>;
  const { perspective = DEFAULTS.perspective } = namedEffect!;

  const flipOptions = {
    ...options,
    composite: 'add',
    namedEffect: {
      ...namedEffect,
      angle: ANGLE,
      perspective,
    },
  } as TimeAnimationOptions;

  return [
    // the layout rotation comes first, so the flip is along the element's rotated axes
    useLayoutRotation(flipOptions, ongoingGroup, { composite: 'replace' }, asWeb, suffix),
    useDirectionalPreset(
      getMotion3dTransform,
      flipOptions,
      ongoingGroup,
      {
        defaultDirection: DEFAULTS.direction,
        directionType: axisDirection,
        loop: { shape: SHAPE, easings: [easing] },
      },
      asWeb,
      suffix,
    ),
  ];
}
