import { cssEasings as easings } from '@wix/motion';
import type { AnimationFillMode, ScrubAnimationOptions, StretchScroll, DomApi } from '../../types';
import { roundNumber, toKeyframeValue, suffixNames, suffixCustomProperties } from '../../utils';
import { SCROLL_RANGES } from '../../consts';

const DEFAULTS: Required<StretchScroll> = {
  type: 'StretchScroll',
  range: 'out',
  stretch: 0.6,
};

export const schema = {
  range: { type: 'enum', values: SCROLL_RANGES, default: DEFAULTS.range },
  stretch: { type: 'number', min: -1, max: 1, default: DEFAULTS.stretch },
};

// samples of fading over 0 -> 65% (in) or 35% -> 100% (out) keyframes with 'backInOut',
// as a single easing so the CSS animation matches the web animation
const linearEasing = (points: [number, number][]) =>
  `linear(${points.map(([value, percentage]) => `${value} ${percentage}%`).join(', ')})`;
const FADE_IN_EASING = linearEasing([
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

const opacityMap = {
  in: { easing: FADE_IN_EASING, keyframes: [{ opacity: 0 }, { opacity: 1 }] },
  out: { easing: FADE_OUT_EASING, keyframes: [{ opacity: 1 }, { opacity: 0 }] },
  continuous: {
    easing: 'linear',
    keyframes: [
      { opacity: 0, offset: 0 },
      { opacity: 1, offset: 0.325 },
      { opacity: 1, offset: 0.7 },
      { opacity: 0, offset: 1 },
    ],
  },
};

export function getNames(options: ScrubAnimationOptions) {
  const { range = DEFAULTS.range } = options.namedEffect as StretchScroll;
  return suffixNames(
    [
      `motion-stretchScrollScale${range === 'continuous' ? '-continuous' : ''}`,
      `motion-stretchScrollOpacity-${range}`,
    ],
    options.suffix,
  );
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const { stretch = DEFAULTS.stretch, range = DEFAULTS.range } =
    options.namedEffect as StretchScroll;
  const easing = range === 'continuous' ? 'linear' : 'backInOut';
  const fill = (
    range === 'out' ? 'forwards' : range === 'in' ? 'backwards' : options.fill || 'both'
  ) as AnimationFillMode;

  const scaleX = 1 - stretch;
  const scaleY = 1 + stretch;

  const [stretchScrollScale, stretchScrollOpacity] = getNames(options);

  const isOut = range === 'out';
  const roundedScaleX = roundNumber(scaleX);
  const roundedScaleY = roundNumber(scaleY);

  const custom = {
    '--motion-stretch-scale-x-from': isOut ? 1 : roundedScaleX,
    '--motion-stretch-scale-y-from': isOut ? 1 : roundedScaleY,
    '--motion-stretch-scale-x-to': isOut ? roundedScaleX : 1,
    '--motion-stretch-scale-y-to': isOut ? roundedScaleY : 1,
    '--motion-stretch-trans-from': isOut ? 0 : `calc(-100% * (1 - ${roundedScaleY}))`,
    '--motion-stretch-trans-to': isOut ? `calc(100% * (1 - ${roundedScaleY}))` : 0,
  };

  const stretchKeyframes = [
    {
      scale: `${toKeyframeValue(
        custom,
        '--motion-stretch-scale-x-from',
        asWeb,
      )} ${toKeyframeValue(custom, '--motion-stretch-scale-y-from', asWeb)}`,
      translate: `0 ${toKeyframeValue(custom, '--motion-stretch-trans-from', asWeb)}`,
    },
    {
      scale: `${toKeyframeValue(
        custom,
        '--motion-stretch-scale-x-to',
        asWeb,
      )} ${toKeyframeValue(custom, '--motion-stretch-scale-y-to', asWeb)}`,
      translate: `0 ${toKeyframeValue(custom, '--motion-stretch-trans-to', asWeb)}`,
    },
  ];

  if (range === 'continuous') {
    stretchKeyframes.forEach((frame) => {
      Object.assign(frame, { easing: easings.backInOut });
    });

    stretchKeyframes.push({
      scale: `${toKeyframeValue(
        custom,
        '--motion-stretch-scale-x-from',
        asWeb,
      )} ${toKeyframeValue(custom, '--motion-stretch-scale-y-from', asWeb)}`,
      translate: `0 calc(100% * (1 - ${toKeyframeValue(
        custom,
        '--motion-stretch-scale-y-from',
        asWeb,
      )}))`,
    });
  }

  const animations = [
    {
      ...options,
      name: stretchScrollScale,
      fill,
      easing,
      custom,
      keyframes: stretchKeyframes,
    },
    {
      ...options,
      name: stretchScrollOpacity,
      fill,
      ...(opacityMap[range] || opacityMap.out),
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}
