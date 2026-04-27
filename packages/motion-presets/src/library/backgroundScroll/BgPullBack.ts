import type {
  BgPullBack,
  DomApi,
  RangeOffset,
  AnimationExtraOptions,
  ScrubAnimationOptions,
} from '../../types';
import { toKeyframeValue } from '../../utils';
import { measureCompHeight } from './utils';

export function getNames(_: ScrubAnimationOptions) {
  return ['motion-bgPullBack'];
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
  const easing = 'linear';
  const { scale = 50 } = options.namedEffect as BgPullBack;

  const custom = {
    '--motion-trans-z': `${scale}px`,
    // TODO: (ameerf) - remove and use only scale once CSS round is widely available
    '--motion-trans-y': `-${(scale / 3) | 0}%`,
  };

  const [bgPullBack] = getNames(options);

  return [
    {
      ...options,
      name: bgPullBack,
      easing,
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
}
