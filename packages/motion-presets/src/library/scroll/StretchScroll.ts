import type { ScrubAnimationOptions, StretchScroll, DomApi } from '../../types';
import { SCROLL_RANGES } from '../../consts';
import {
  MOTION_SCALE_NAME,
  MOTION_TRANS_ROT_NAME,
  getMotionScale,
  getMotionTransRot,
  MOTION_LAYOUT_ROTATION_NAME,
  useLayoutRotation,
} from '../../transformUtils';
import { linearEasing } from '../../easingUtils';
import { getMotionFade, MOTION_FADE_NAME } from '../../fadeBlurUtils';
import {
  useBasicPreset,
  useDirectionalPreset,
  useDirectionalPresetAsBasic,
} from '../../presetUtils';
import { scrollGroup } from '../../scrollGroup';

// samples of the previous implementation: fading over 0 -> 65% (in) or 35% -> 100% (out) keyframes with 'backInOut'
const FADE_EASING = linearEasing([
  [0, 0],
  [0, 33.9],
  [0.0472, 35.6],
  [0.1041, 37.3],
  [0.173, 39],
  [0.2557, 40.7],
  [0.3539, 42.4],
  [0.4681, 44.1],
  [0.5964, 45.8],
  [0.7335, 47.5],
  [0.871, 49.2],
  [1, 50.9],
  [1, 100],
]);
const FADE_OUT_EASING = linearEasing([
  [0, 0],
  [0, 45.1],
  [0.1458, 46.9],
  [0.2918, 48.7],
  [0.4315, 50.5],
  [0.5575, 52.3],
  [0.6668, 54.1],
  [0.7595, 55.9],
  [0.8372, 57.7],
  [0.902, 59.5],
  [0.9558, 61.3],
  [1, 63],
  [1, 100],
]);
// previously a linear fade over each half of continuous, holding the fully visible state in the middle
const FADE_CONTINUOUS_EASING = linearEasing([
  [0, 0],
  [1, 62.5],
  [1, 100],
]);

const EASING = 'backInOut';
const DIRECTION = 'top';
const DEFAULTS: Required<StretchScroll> = {
  type: 'StretchScroll',
  range: 'out',
  stretch: 0.6,
};

export const schema = {
  range: { type: 'enum', values: SCROLL_RANGES, default: DEFAULTS.range },
  stretch: { type: 'number', min: -1, max: 1, default: DEFAULTS.stretch },
};

export function getNames({ suffix = '' }: ScrubAnimationOptions) {
  return [
    MOTION_FADE_NAME,
    MOTION_TRANS_ROT_NAME,
    MOTION_SCALE_NAME,
    MOTION_LAYOUT_ROTATION_NAME,
  ].map((name) => name + suffix);
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const { namedEffect, suffix = '' } = options as ScrubAnimationOptions<StretchScroll>;
  const { stretch = DEFAULTS.stretch } = namedEffect!;

  const scaleX = 1 - stretch;
  const scaleY = 1 + stretch;

  // the element moves up by the extra height it is stretched by
  // using the scale custom-property in the computation if not a web animation
  // TODO - not so safe that it relies on matching the name here - need to standardize var-naming
  const stretchY = asWeb ? scaleY : `var(--motion-scale${suffix}-scale-y, 1)`;

  // the movement is directional (always moving up), while the stretch itself is not
  const translateOptions = {
    ...options,
    namedEffect: {
      ...namedEffect,
      direction: DIRECTION,
      travel: `calc(100% * (${stretchY} - 1))`,
    },
  } as ScrubAnimationOptions;
  const scaleOptions = {
    ...options,
    namedEffect: {
      ...namedEffect,
      scale: { x: scaleX, y: scaleY },
    },
  } as ScrubAnimationOptions;

  return [
    useBasicPreset(getMotionFade, options, scrollGroup, asWeb, suffix, {
      defaultRange: DEFAULTS.range,
      easing: FADE_EASING,
      outEasing: FADE_OUT_EASING,
      continuousEasing: FADE_CONTINUOUS_EASING,
    }),
    useDirectionalPreset(
      getMotionTransRot,
      translateOptions,
      scrollGroup,
      {
        defaultDirection: DIRECTION,
        defaultRange: DEFAULTS.range,
        directionType: 'four-sides',
        easing: EASING,
        outEasing: EASING,
      },
      asWeb,
      suffix,
    ),
    useDirectionalPresetAsBasic(
      getMotionScale,
      scaleOptions,
      scrollGroup,
      {
        defaultRange: DEFAULTS.range,
        easing: EASING,
        outEasing: EASING,
      },
      asWeb,
      suffix,
    ),
    // the layout rotation comes last, so the stretch and its movement are along the screen's axes
    useLayoutRotation(
      translateOptions,
      scrollGroup,
      { defaultRange: DEFAULTS.range },
      asWeb,
      suffix,
    ),
  ];
}
