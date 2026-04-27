import type {
  BgPan,
  DomApi,
  RangeOffset,
  AnimationExtraOptions,
  ScrubAnimationOptions,
} from '../../types';
import { toKeyframeValue } from '../../utils';
import { measureCompHeight } from './utils';

export function getNames(_: ScrubAnimationOptions) {
  return ['motion-bgPan'];
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
  const { direction = 'left', speed = 0.2 } = options.namedEffect as BgPan;
  const offsetPercentage = ((50 * speed) / (1 + speed)) | 0;

  const custom = {
    '--motion-trans-x': direction === 'left' ? `${offsetPercentage}%` : `${-offsetPercentage}%`,
  };

  const [bgPan] = getNames(options);

  return [
    {
      ...options,
      name: bgPan,
      part: 'BG_MEDIA',
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
}
