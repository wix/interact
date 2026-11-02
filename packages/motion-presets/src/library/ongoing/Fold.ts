import type { AnimationData, DomApi, Fold, TimeAnimationOptions } from '../../types';
import { CENTER_AND_FOUR_DIRECTIONS, FOUR_DIRECTIONS } from '../../consts';
import {
  getMotion3dTransform,
  getMotionLayoutRotation,
  pivotToTransformOrigin,
  mergeTransformLayers,
} from '../../transformUtils';
import type { LoopPoint } from '../../easingUtils';
import { getLoopOverrides } from '../../easingUtils';
import { getEasingFamily, parseKeywordLazy } from '../../utils';
import { sideDirection, toMotionRange } from '../../directions';

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

export function getNames(options: TimeAnimationOptions) {
  return style(options).map(({ name }) => name!);
}

export function web(options: TimeAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function layers(options: TimeAnimationOptions, asWeb = false): AnimationData[] {
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

  const side = sideDirection.opposite(sideDirection.parse(pivot, DEFAULTS.pivot));
  const transformOrigin = pivotToTransformOrigin(
    parseKeywordLazy(pivot, CENTER_AND_FOUR_DIRECTIONS, DEFAULTS.pivot),
  );

  return [
    // the layout rotation comes first, so the pivot is on the element's rotated side
    {
      ...foldOptions,
      composite: 'replace',
      ...getLoopOverrides(foldOptions),
      ...getMotionLayoutRotation({}, asWeb, suffix),
    },
    {
      ...foldOptions,
      ...getLoopOverrides(foldOptions, { shape: SHAPE, easings: [ease.out, 'sineInOut'] }),
      ...getMotion3dTransform(
        toMotionRange(sideDirection, side, 'in'),
        { angle, perspective, transformOrigin },
        asWeb,
        suffix,
      ),
    },
  ];
}

export function style(...args: Parameters<typeof layers>): AnimationData[] {
  return mergeTransformLayers(layers(...args), args[0].suffix);
}
