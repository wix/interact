import type { ScrubAnimationOptions, StretchScroll, DomApi } from '../../types';
import {
  toKeyframeValue,
  suffixNames,
  suffixCustomProperties,
  getScrollFill,
  completeScrollOffsets,
} from '../../utils';
import { SCROLL_RANGES } from '../../consts';

const FADE_EASINGS = {
  in: 'linear(0 0%, 0 33.9%, 0.0472 35.6%, 0.1041 37.3%, 0.173 39%, 0.2557 40.7%, 0.3539 42.4%, 0.4681 44.1%, 0.5964 45.8%, 0.7335 47.5%, 0.871 49.2%, 1 50.9%, 1 100%)',
  out: 'linear(0 0%, 0 43.75%, 0.3927 50%, 0.7746 56.25%, 0.987 62.5%, 1 68.75%, 1 100%)',
  continuous:
    'linear(0 0%, 1 31.25%, 1 71.88%, 0.6073 75%, 0.2254 78.13%, 0.013 81.25%, 0 84.38%, 0 100%)',
};

// backInOut sampled at 16 points
const CONTINUOUS_EASING =
  'linear(0 0%, -0.0452 6.25%, -0.0774 12.5%, -0.0923 18.75%, -0.0828 25%, -0.0361 31.25%, 0.0725 37.5%, 0.2881 43.75%, 0.6067 50%, 0.8551 56.25%, 0.9919 62.5%, 1.0609 68.75%, 1.0892 75%, 1.0907 81.25%, 1.0734 87.5%, 1.0421 93.75%, 1 100%)';

const DEFAULTS: Required<StretchScroll> = {
  type: 'StretchScroll',
  range: 'out',
  stretch: 0.6,
};

export const schema = {
  range: { type: 'enum', values: SCROLL_RANGES, default: DEFAULTS.range },
  stretch: { type: 'number', min: -1, max: 1, default: DEFAULTS.stretch },
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
  const isContinuous = range === 'continuous';
  const easing = isContinuous ? 'linear' : 'backInOut';
  const fill = getScrollFill(options, range);
  const offsets = completeScrollOffsets(options as ScrubAnimationOptions, range);

  const scaleX = 1 - stretch;
  const scaleY = 1 + stretch;
  const travel = `${100 * stretch}%`;

  const [stretchScrollScale, stretchScrollOpacity] = getNames(options);

  const isOut = range === 'out';

  const custom = {
    '--motion-stretch-scale-x-from': isOut ? 1 : scaleX,
    '--motion-stretch-scale-y-from': isOut ? 1 : scaleY,
    '--motion-stretch-scale-x-to': isOut || isContinuous ? scaleX : 1,
    '--motion-stretch-scale-y-to': isOut || isContinuous ? scaleY : 1,
    '--motion-stretch-trans-from': isOut ? '0px' : travel,
    '--motion-stretch-trans-to': range === 'in' ? '0px' : `calc(-1 * ${travel})`,
  };

  const rotate = toKeyframeValue({}, '--motion-rotate', false, '0deg');
  const getTransform = (edge: 'from' | 'to') =>
    `translateY(${toKeyframeValue(
      custom,
      `--motion-stretch-trans-${edge}`,
      asWeb,
    )}) scale(${toKeyframeValue(
      custom,
      `--motion-stretch-scale-x-${edge}`,
      asWeb,
    )}, ${toKeyframeValue(custom, `--motion-stretch-scale-y-${edge}`, asWeb)}) rotate(${rotate})`;

  const stretchKeyframes: { transform: string; easing?: string }[] = [
    { transform: getTransform('from') },
    { transform: getTransform('to') },
  ];

  if (isContinuous) {
    stretchKeyframes.splice(1, 0, { transform: `translateY(0px) scale(1, 1) rotate(${rotate})` });
    stretchKeyframes.slice(0, 2).forEach((frame) => {
      frame.easing = CONTINUOUS_EASING;
    });
  }

  const animations = [
    {
      ...options,
      name: stretchScrollScale,
      fill,
      ...offsets,
      easing,
      custom,
      keyframes: stretchKeyframes,
    },
    {
      ...options,
      name: stretchScrollOpacity,
      fill,
      ...offsets,
      easing: FADE_EASINGS[range],
      keyframes: isOut ? [{ opacity: 1 }, { opacity: 0 }] : [{ opacity: 0 }, { opacity: 1 }],
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}
