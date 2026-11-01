// NOT PRODUCTION READY — background-scroll presets are experimental and excluded from public documentation.
import type {
  BgFake3D,
  RangeOffset,
  AnimationExtraOptions,
  ScrubAnimationOptions,
  DomApi,
} from '../../types';
import type { LengthValue } from '../../utils';
import {
  getCssUnits,
  parseLength,
  roundNumber,
  toKeyframeValue,
  suffixNames,
  suffixCustomProperties,
} from '../../utils';
import { measureCompHeight, getScaleFromPerspectiveAndZ } from './utils';

const PERSPECTIVE = 100;

const DEFAULTS: Required<BgFake3D> = {
  type: 'BgFake3D',
  depth: { value: 16.67, unit: 'px' },
  scaleY: 1.3,
};

export const schema = {
  depth: { type: 'length', default: DEFAULTS.depth },
  scaleY: { type: 'number', min: 0, default: DEFAULTS.scaleY },
};

export function getNames(options: ScrubAnimationOptions) {
  return suffixNames(
    ['motion-bgFake3DParallax', 'motion-bgFake3DStretch', 'motion-bgFake3DZoom'],
    options.suffix,
  );
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

export const parts = ['MEDIA'];

export function style(options: ScrubAnimationOptions & AnimationExtraOptions, asWeb = false) {
  const { scaleY = DEFAULTS.scaleY } = options.namedEffect as BgFake3D;
  const depth = parseLength((options.namedEffect as BgFake3D).depth, DEFAULTS.depth as LengthValue);
  const scale = getScaleFromPerspectiveAndZ(depth.value, PERSPECTIVE);

  const custom = {
    '--motion-scale-y': scaleY,
    '--motion-trans-z': `${roundNumber(depth.value)}${getCssUnits(depth.unit)}`,
    '--motion-trans-y-factor': roundNumber(-0.1 * (2 - scale)),
  };

  const [bgFake3DParallax, bgFake3DStretch, bgFake3DZoom] = getNames(options);
  const { measures = { '--motion-comp-height': '0px' } } = options;

  const animations = [
    {
      ...options,
      name: bgFake3DParallax,
      custom,
      part: 'MEDIA',
      easing: 'sineOut',
      startOffset: {
        name: 'cover',
        offset: { unit: 'percentage', value: 0 },
      } as RangeOffset,
      endOffset: {
        name: 'cover',
        offset: { unit: 'percentage', value: 0 },
      } as RangeOffset,
      get endOffsetAdd() {
        return `calc(100svh + ${toKeyframeValue(measures, '--motion-comp-height', asWeb)})`;
      },
      get keyframes() {
        return [
          {
            transform: 'translateY(10svh)',
          },
          {
            transform: `translateY(calc(${toKeyframeValue(
              custom,
              '--motion-trans-y-factor',
              asWeb,
            )} * ${toKeyframeValue(
              measures,
              '--motion-comp-height',
              false,
              measures!['--motion-comp-height'] as string,
            )}))`,
          },
        ];
      },
    },
    {
      ...options,
      name: bgFake3DStretch,
      custom,
      part: 'MEDIA',
      easing: 'linear',
      composite: 'add' as const,
      startOffset: {
        name: 'cover',
        offset: { unit: 'percentage', value: 0 },
      } as RangeOffset,
      endOffset: {
        name: 'cover',
        offset: { unit: 'percentage', value: 0 },
      } as RangeOffset,
      get endOffsetAdd() {
        return `calc(100svh + ${toKeyframeValue(measures, '--motion-comp-height', asWeb)})`;
      },
      keyframes: [
        {
          transform: `scaleY(${toKeyframeValue(custom, '--motion-scale-y', asWeb)})`,
        },
        {
          transform: `scaleY(1)`,
        },
      ],
    },
    {
      ...options,
      name: bgFake3DZoom,
      custom,
      part: 'MEDIA',
      easing: 'sineIn',
      composite: 'add' as const,
      startOffset: {
        name: 'cover',
        offset: { unit: 'percentage', value: 0 },
      } as RangeOffset,
      endOffset: {
        name: 'cover',
        offset: { unit: 'percentage', value: 0 },
      } as RangeOffset,
      get endOffsetAdd() {
        return `calc(100svh + ${toKeyframeValue(measures, '--motion-comp-height', asWeb)})`;
      },
      keyframes: [
        {
          transform: `perspective(${PERSPECTIVE}px) translateZ(0px)`,
        },
        {
          transform: `perspective(${PERSPECTIVE}px) translateZ(${toKeyframeValue(
            custom,
            '--motion-trans-z',
            asWeb,
          )})`,
        },
      ],
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}
