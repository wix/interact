import type {
  BgPan,
  DomApi,
  RangeOffset,
  AnimationExtraOptions,
  ScrubAnimationOptions,
} from '../../types';
import { toKeyframeValue, suffixNames, suffixCustomProperties } from '../../utils';
import { measureCompHeight, withPartStyles } from './utils';

export function getNames(options: ScrubAnimationOptions) {
  return suffixNames(['motion-bgPan'], options.suffix);
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
  const { direction = 'left', speed = 0.2 } = options.namedEffect as BgPan;
  const offsetPercentage = ((50 * speed) / (1 + speed)) | 0;

  const custom = {
    '--motion-trans-x': direction === 'left' ? `${offsetPercentage}%` : `${-offsetPercentage}%`,
  };

  const [bgPan] = getNames(options);

  const animations = [
    {
      ...options,
      name: bgPan,
      custom,
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
          transform: `translateX(${toKeyframeValue(custom, '--motion-trans-x', asWeb)})`,
        },
        {
          transform: `translateX(calc(-1 * ${toKeyframeValue(custom, '--motion-trans-x', asWeb)}))`,
        },
      ],
    },
  ];

  return withPartStyles(
    suffixCustomProperties(animations, options.suffix),
    options,
    {
      MEDIA_WRAPPER: {
        position: 'relative',
        width: `${100 * (1 + speed)}%`,
        left: `-${50 * speed}%`,
      },
    },
    asWeb,
  );
}
