// NOT PRODUCTION READY — background-scroll presets are experimental and excluded from public documentation.
import type {
  BgCloseUp,
  DomApi,
  RangeOffset,
  AnimationExtraOptions,
  ScrubAnimationOptions,
} from '../../types';
import { measureCompHeight } from './utils';
import { toKeyframeValue, suffixNames, suffixCustomProperties } from '../../utils';

const DEFAULTS: Required<BgCloseUp> = {
  type: 'BgCloseUp',
  depth: 80,
};

export const schema = {
  depth: { type: 'number', default: DEFAULTS.depth },
};

export function getNames(options: ScrubAnimationOptions) {
  return suffixNames(['motion-bgCloseUpOpacity', 'motion-bgCloseUpZoom'], options.suffix);
}

export function prepare(_: ScrubAnimationOptions, dom?: DomApi) {
  const measures = {
    '--motion-comp-height': '0px',
    '--motion-comp-half-height': '0px',
  };
  if (dom) {
    measureCompHeight(measures, dom, true);
  }
  return measures;
}

export function web(options: ScrubAnimationOptions & AnimationExtraOptions, dom?: DomApi) {
  options.measures = prepare(options, dom);

  return style(options, true);
}

export const parts = ['MEDIA_CLIP', 'MEDIA_WRAPPER'];

export function style(options: ScrubAnimationOptions & AnimationExtraOptions, asWeb = false) {
  const easing = 'linear';
  const { depth = DEFAULTS.depth } = options.namedEffect as BgCloseUp;

  const custom = { '--motion-trans-z': `${depth}px` };

  const [bgCloseUpOpacity, bgCloseUpZoom] = getNames(options);

  const animations = [
    {
      ...options,
      name: bgCloseUpOpacity,
      easing,
      part: 'MEDIA_CLIP',
      startOffset: {
        name: 'cover',
        offset: { unit: 'percentage', value: 0 },
      } as RangeOffset,
      get startOffsetAdd() {
        return `calc(50vh + ${toKeyframeValue(
          options.measures || {},
          '--motion-comp-half-height',
          asWeb,
        )})`;
      },
      endOffset: {
        name: 'cover',
        offset: { unit: 'percentage', value: 0 },
      } as RangeOffset,
      get endOffsetAdd() {
        return `calc(100vh + ${toKeyframeValue(
          options.measures || {},
          '--motion-comp-height',
          asWeb,
        )})`;
      },
      keyframes: [
        {
          opacity: 1,
        },
        {
          opacity: 0,
        },
      ],
    },
    {
      ...options,
      name: bgCloseUpZoom,
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
        return `calc(100vh + ${toKeyframeValue(
          options.measures || {},
          '--motion-comp-height',
          asWeb,
        )})`;
      },
      keyframes: [
        {
          transform: 'perspective(100px) translateZ(0px)',
        },
        {
          transform: `perspective(100px) translateZ(${toKeyframeValue(
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
