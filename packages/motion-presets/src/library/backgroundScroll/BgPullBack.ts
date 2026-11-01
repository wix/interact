// NOT PRODUCTION READY — background-scroll presets are experimental and excluded from public documentation.
import type {
  BgPullBack,
  DomApi,
  RangeOffset,
  AnimationExtraOptions,
  ScrubAnimationOptions,
} from '../../types';
import type { LengthValue } from '../../utils';
import {
  getCssUnits,
  parseLength,
  toKeyframeValue,
  suffixNames,
  suffixCustomProperties,
} from '../../utils';
import { measureCompHeight } from './utils';

const DEFAULTS: Required<BgPullBack> = {
  type: 'BgPullBack',
  depth: { value: 50, unit: 'px' },
};

export const schema = {
  depth: { type: 'length', default: DEFAULTS.depth },
};

export function getNames(options: ScrubAnimationOptions) {
  return suffixNames(['motion-bgPullBack'], options.suffix);
}

export function prepare(_: ScrubAnimationOptions, dom?: DomApi) {
  const measures = { '--motion-comp-height': '0px' };
  if (dom) {
    measureCompHeight(measures, dom, true);
  }
  return measures;
}

export function web(options: ScrubAnimationOptions & AnimationExtraOptions, dom?: DomApi) {
  options.measures = prepare(options, dom);

  return style(options, true);
}

export const parts = ['MEDIA_WRAPPER'];

export function style(options: ScrubAnimationOptions & AnimationExtraOptions, asWeb = false) {
  const easing = 'linear';
  const depth = parseLength(
    (options.namedEffect as BgPullBack).depth,
    DEFAULTS.depth as LengthValue,
  );

  const custom = {
    '--motion-trans-z': `${depth.value}${getCssUnits(depth.unit)}`,
    // TODO: (ameerf) - remove and use only depth once CSS round is widely available
    '--motion-trans-y': `-${(depth.value / 3) | 0}%`,
  };

  const [bgPullBack] = getNames(options);

  const animations = [
    {
      ...options,
      name: bgPullBack,
      custom,
      easing,
      part: 'MEDIA_WRAPPER',
      startOffset: {
        name: 'cover',
        offset: { unit: 'percentage', value: 0 },
      } as RangeOffset,
      endOffset: {
        name: 'cover',
        offset: { unit: 'percentage', value: 0 },
      } as RangeOffset,
      get endOffsetAdd() {
        return `${toKeyframeValue(options.measures || {}, '--motion-comp-height', asWeb)}`;
      },
      keyframes: [
        {
          transform: `perspective(100px) translate3d(0px, ${toKeyframeValue(
            custom,
            '--motion-trans-y',
            asWeb,
          )}, ${toKeyframeValue(custom, '--motion-trans-z', asWeb)})`,
        },
        {
          transform: 'perspective(100px) translate3d(0px, 0px, 0px)',
        },
      ],
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}
