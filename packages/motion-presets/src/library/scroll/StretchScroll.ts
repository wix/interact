import { cssEasings as easings } from '@wix/motion';
import type { AnimationFillMode, ScrubAnimationOptions, StretchScroll, DomApi } from '../../types';
import { roundNumber, toKeyframeValue } from '../../utils';
import { SCROLL_RANGES } from '../../consts';

export const schema = {
  range: { type: 'enum', values: SCROLL_RANGES, default: 'out' },
  stretch: { type: 'number', min: -1, max: 1, default: 0.6 },
} as const;

const opacityKeyframesMap = {
  in: [
    { opacity: 0, offset: 0 },
    { opacity: 1, offset: 0.65 },
  ],
  out: [
    { opacity: 1, offset: 0.35 },
    { opacity: 0, offset: 1 },
  ],
  continuous: [
    { opacity: 0, offset: 0 },
    { opacity: 1, offset: 0.325 },
    { opacity: 1, offset: 0.7 },
    { opacity: 0, offset: 1 },
  ],
};

// CSS eases each keyframe interval on its own, so these sample the WAAPI fade (eased as a whole) over two keyframes
const CSS_FADE_IN_EASING =
  'linear(0 0%, 0 33.9%, 0.0472 35.6%, 0.1041 37.3%, 0.173 39%, 0.2557 40.7%, 0.3539 42.4%, 0.4681 44.1%, 0.5964 45.8%, 0.7335 47.5%, 0.871 49.2%, 1 50.9%, 1 100%)';
const CSS_FADE_OUT_EASING =
  'linear(0 0%, 0 45.1%, 0.1458 46.9%, 0.2918 48.7%, 0.4315 50.5%, 0.5575 52.3%, 0.6668 54.1%, 0.7595 55.9%, 0.8372 57.7%, 0.902 59.5%, 0.9558 61.3%, 1 63%, 1 100%)';

const cssOpacityMap = {
  in: { easing: CSS_FADE_IN_EASING, keyframes: [{ opacity: 0 }, { opacity: 1 }] },
  out: { easing: CSS_FADE_OUT_EASING, keyframes: [{ opacity: 1 }, { opacity: 0 }] },
};

export function getNames(options: ScrubAnimationOptions) {
  const { range = schema.range.default } = options.namedEffect as StretchScroll;
  const { suffix = '' } = options;
  return [
    `motion-stretchScrollScale${range === 'continuous' ? '-continuous' : ''}`,
    `motion-stretchScrollOpacity-${range}`,
  ].map((name) => name + suffix);
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const { stretch = schema.stretch.default, range = schema.range.default } =
    options.namedEffect as StretchScroll;
  const easing = range === 'continuous' ? 'linear' : 'backInOut';
  const fill = (
    range === 'out' ? 'forwards' : range === 'in' ? 'backwards' : options.fill
  ) as AnimationFillMode;

  const scaleX = 1 - stretch;
  const scaleY = 1 + stretch;

  const [stretchScrollScale, stretchScrollOpacity] = getNames(options);

  const isOut = range === 'out';
  const roundedScaleX = roundNumber(scaleX);
  const roundedScaleY = roundNumber(scaleY);

  const prefix = `--motion-stretch${options.suffix || ''}`;
  const scaleXFrom = `${prefix}-scale-x-from`;
  const scaleYFrom = `${prefix}-scale-y-from`;
  const scaleXTo = `${prefix}-scale-x-to`;
  const scaleYTo = `${prefix}-scale-y-to`;
  const transFrom = `${prefix}-trans-from`;
  const transTo = `${prefix}-trans-to`;

  const custom = {
    [scaleXFrom]: isOut ? 1 : roundedScaleX,
    [scaleYFrom]: isOut ? 1 : roundedScaleY,
    [scaleXTo]: isOut ? roundedScaleX : 1,
    [scaleYTo]: isOut ? roundedScaleY : 1,
    [transFrom]: isOut ? 0 : `calc(-100% * (1 - ${roundedScaleY}))`,
    [transTo]: isOut ? `calc(100% * (1 - ${roundedScaleY}))` : 0,
  };

  const stretchKeyframes = [
    {
      scale: `${toKeyframeValue(custom, scaleXFrom, asWeb)} ${toKeyframeValue(
        custom,
        scaleYFrom,
        asWeb,
      )}`,
      translate: `0 ${toKeyframeValue(custom, transFrom, asWeb)}`,
    },
    {
      scale: `${toKeyframeValue(custom, scaleXTo, asWeb)} ${toKeyframeValue(
        custom,
        scaleYTo,
        asWeb,
      )}`,
      translate: `0 ${toKeyframeValue(custom, transTo, asWeb)}`,
    },
  ];

  if (range === 'continuous') {
    stretchKeyframes.forEach((frame) => {
      Object.assign(frame, { easing: easings.backInOut });
    });

    stretchKeyframes.push({
      scale: `${toKeyframeValue(custom, scaleXFrom, asWeb)} ${toKeyframeValue(
        custom,
        scaleYFrom,
        asWeb,
      )}`,
      translate: `0 calc(100% * (1 - ${toKeyframeValue(custom, scaleYFrom, asWeb)}))`,
    });
  }

  return [
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
      easing,
      keyframes: opacityKeyframesMap[range] || opacityKeyframesMap.out,
      ...(!asWeb && cssOpacityMap[range as keyof typeof cssOpacityMap]),
    },
  ];
}
