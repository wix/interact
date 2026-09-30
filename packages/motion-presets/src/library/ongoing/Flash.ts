import type { DomApi, Flash, TimeAnimationOptions } from '../../types';
import { MOTION_FADE_NAME, getMotionFade, useBasicPreset } from '../../utils';

const DEFAULT_EASING = 'cubicInOut';

const DEFAULTS: Required<Flash> = {
  type: 'Flash',
  iterationDelay: 0,
};

export const schema = {
  iterationDelay: { type: 'number', min: 0, default: DEFAULTS.iterationDelay },
};

// fades out and back in
const SHAPE: [number, number][] = [
  [0, 0],
  [1, 0.5],
  [0, 1],
];

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return [MOTION_FADE_NAME + suffix];
}

export function web(options: TimeAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const { easing = DEFAULT_EASING, suffix } = options;

  return [
    useBasicPreset(getMotionFade, options, 'ongoing', asWeb, suffix, { loop: { shape: SHAPE, easings: [easing] } }),
  ];
}
