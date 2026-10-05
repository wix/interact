import type { DomApi, Fold, TimeAnimationOptions } from '../../types';
import { FOUR_DIRECTIONS } from '../../consts';
import {
  MOTION_3D_TRANSFORM_NAME,
  MOTION_LAYOUT_ROTATION_NAME,
  getMotion3dTransform,
  useLayoutRotation,
} from '../../transformUtils';
import type { LoopPoint } from '../../easingUtils';
import { getEasingFamily } from '../../utils';
import { useDirectionalPreset } from '../../presetUtils';
import { ongoingGroup } from '../../ongoingGroup';

const DEFAULT_EASING = 'cubicInOut';

const DEFAULTS: Required<Fold> = {
  type: 'Fold',
  angle: 15,
  iterationDelay: 0,
  perspective: 800,
  pivot: 'top',
};

export const schema = {
  angle: { type: 'number', min: 0, default: DEFAULTS.angle },
  iterationDelay: { type: 'number', min: 0, default: DEFAULTS.iterationDelay },
  perspective: { type: 'number', min: 0, default: DEFAULTS.perspective },
  pivot: { type: 'enum', values: FOUR_DIRECTIONS, default: DEFAULTS.pivot },
};

// a damped fold, first towards the viewer
const SHAPE: LoopPoint[] = [
  [0, 0],
  [1, 0.1],
  [-0.7, 0.302],
  [0.6, 0.504],
  [-0.3, 0.686],
  [0.2, 0.847],
  [-0.05, 1.049],
  [0, 1.189],
].map(([value, time]) => [value, time / 1.189]);

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return [MOTION_LAYOUT_ROTATION_NAME, MOTION_3D_TRANSFORM_NAME].map((name) => name + suffix);
}

export function web(options: TimeAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const { easing = DEFAULT_EASING, namedEffect, suffix } = options as TimeAnimationOptions<Fold>;
  const {
    angle = DEFAULTS.angle,
    perspective = DEFAULTS.perspective,
    pivot = DEFAULTS.pivot,
  } = namedEffect!;
  const ease = getEasingFamily(easing);

  const foldOptions = {
    ...options,
    composite: 'add',
    namedEffect: {
      ...namedEffect,
      angle,
      // folds around its pivot side
      direction: pivot,
      perspective,
      pivot,
    },
  } as TimeAnimationOptions;

  return [
    // the layout rotation comes first, so the pivot is on the element's rotated side
    useLayoutRotation(foldOptions, ongoingGroup, { composite: 'replace' }, asWeb, suffix),
    useDirectionalPreset(
      getMotion3dTransform,
      foldOptions,
      ongoingGroup,
      {
        defaultDirection: DEFAULTS.pivot,
        directionType: 'four-sides',
        pivotType: 'four-sides',
        defaultPivot: DEFAULTS.pivot,
        loop: { shape: SHAPE, easings: [ease.out, 'sineInOut'] },
      },
      asWeb,
      suffix,
    ),
  ];
}
