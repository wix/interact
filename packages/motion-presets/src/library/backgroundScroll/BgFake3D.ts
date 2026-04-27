import type {
  BgFake3D,
  RangeOffset,
  AnimationExtraOptions,
  ScrubAnimationOptions,
  DomApi,
} from '../../types';
import { roundNumber, toKeyframeValue } from '../../utils';
import { measureCompHeight, getScaleFromPerspectiveAndZ } from './utils';

const PERSPECTIVE = 100;

export function getNames(_: ScrubAnimationOptions) {
  return ['motion-bgFake3DParallax', 'motion-bgFake3DStretch', 'motion-bgFake3DZoom'];
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

export function style(options: ScrubAnimationOptions & AnimationExtraOptions, asWeb = false) {
  const { stretch = 1.3, zoom = 100 / 6 } = options.namedEffect as BgFake3D;
  const scale = getScaleFromPerspectiveAndZ(zoom, PERSPECTIVE);

  const custom = {
    '--motion-scale-y': stretch,
    '--motion-trans-z': `${roundNumber(zoom)}px`,
    '--motion-trans-y-factor': roundNumber(-0.1 * (2 - scale)),
  };

  const [bgFake3DParallax, bgFake3DStretch, bgFake3DZoom] = getNames(options);
  const { measures = { '--motion-comp-height': '0px' } } = options;

  return [
    {
      ...options,
      name: bgFake3DParallax,
      part: 'BG_IMG',
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
      part: 'BG_IMG',
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
      part: 'BG_IMG',
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
}
