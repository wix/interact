import { cssEasings as easings } from '@wix/motion';
import type { AnimationFillMode, ScrubAnimationOptions, StretchScroll, DomApi } from '../../types';
import { roundNumber, toKeyframeValue } from '../../utils';

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

export function getNames(options: ScrubAnimationOptions) {
  const { range = 'out' } = options.namedEffect as StretchScroll;
  return [
    `motion-stretchScrollScale${range === 'continuous' ? '-continuous' : ''}`,
    `motion-stretchScrollOpacity-${range}`,
  ];
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const { stretch = 0.6, range = 'out' } = options.namedEffect as StretchScroll;
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
    },
  ];
}
