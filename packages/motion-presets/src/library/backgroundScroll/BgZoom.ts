import type {
  AnimationData,
  BgZoom,
  RangeOffset,
  AnimationExtraOptions,
  ScrubAnimationOptions,
  DomApi,
} from '../../types';
import { roundNumber, toKeyframeValue } from '../../utils';
import { measureCompHeight, getScaleFromPerspectiveAndZ } from './utils';

const PERSPECTIVE = 100;
const DEFAULT_ZOOM = 40;
const ZOOM_OUT_FACTOR = 0.375; // 15/40 - this for using the same scale of values in the data
const DIRECTION_TO_PARAMS = {
  in: {
    easing: 'sineIn',
    fromY: '20svh',
  },
  out: {
    easing: 'sineInOut',
    fromY: '0px',
  },
};

export function getNames(options: ScrubAnimationOptions) {
  const { direction = 'in' } = options.namedEffect as BgZoom;
  const names = ['motion-bgZoomMedia', 'motion-bgZoomImg'];

  if (direction === 'in') {
    names.splice(1, 0, 'motion-bgZoomParallax');
  }

  return names;
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
  let { direction = 'in', zoom = DEFAULT_ZOOM } = options.namedEffect as BgZoom;
  const isIn = direction === 'in';
  if (!isIn) {
    direction = 'out';
    zoom *= ZOOM_OUT_FACTOR;
  }

  const { easing, fromY } = DIRECTION_TO_PARAMS[direction];
  const fromZ = isIn ? 0 : zoom / 1.3;
  const toZ = isIn ? zoom : -zoom;
  const toScale = roundNumber(getScaleFromPerspectiveAndZ(toZ, PERSPECTIVE));

  const custom = {
    '--motion-zoom-over-pers': (0.5 * zoom) / PERSPECTIVE,
    '--motion-scale-to': toScale,
    '--motion-trans-y-from': fromY,
    '--motion-trans-z-from': `${roundNumber(fromZ)}px`,
    '--motion-trans-z-to': `${roundNumber(toZ)}px`,
  };

  const { measures = { '--motion-comp-height': '0px' } } = options;

  const animations: AnimationData[] = [
    {
      ...options,
      part: 'BG_MEDIA',
      easing: 'linear',
      startOffset: {
        name: 'cover',
        offset: { unit: 'percentage', value: 0 },
      } as RangeOffset,
      endOffset: {
        name: 'cover',
        offset: { unit: 'percentage', value: 0 },
      } as RangeOffset,
      keyframes: [
        {
          transform: 'translate3d(0, 0, 0)',
        },
        {
          transform: 'translate3d(0, 0, 0)',
        },
      ],
    },
    {
      ...options,
      easing,
      part: 'BG_IMG',
      composite: isIn ? ('add' as const) : ('replace' as const),
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
          transform: `perspective(${PERSPECTIVE}px) translateZ(${toKeyframeValue(
            custom,
            '--motion-trans-z-from',
            asWeb,
          )})`,
        },
        {
          transform: `perspective(${PERSPECTIVE}px) translateZ(${toKeyframeValue(
            custom,
            '--motion-trans-z-to',
            asWeb,
          )})`,
        },
      ],
    },
  ];

  if (isIn) {
    animations.splice(1, 0, {
      ...options,
      part: 'BG_IMG',
      easing: 'linear',
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
            transform: `translateY(${toKeyframeValue(custom, '--motion-trans-y-from', asWeb)})`,
          },
          {
            transform: `translateY(calc(${toKeyframeValue(
              custom,
              '--motion-scale-to',
              asWeb,
            )} * (-0.2 * ${toKeyframeValue(
              measures,
              '--motion-comp-height',
              false,
              measures['--motion-comp-height'] as string,
            )} + ${toKeyframeValue(
              custom,
              '--motion-zoom-over-pers',
              asWeb,
            )} * max(0px, 100lvh - ${toKeyframeValue(
              measures,
              '--motion-comp-height',
              false,
              measures['--motion-comp-height'] as string,
            )}))))`,
          },
        ];
      },
    });
  }

  const names = getNames(options);
  animations.forEach((animation, index) => {
    animation.name = names[index];
  });

  return animations;
}
