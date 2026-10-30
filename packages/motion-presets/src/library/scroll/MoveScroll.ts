import type { DomApi, MoveScroll, ScrubAnimationOptions } from '../../types';
import {
  getCssUnits,
  transformPolarToXY,
  toKeyframeValue,
  parseLength,
  suffixNames,
  suffixCustomProperties,
  getScrollFill,
  completeScrollOffsets,
} from '../../utils';
import { SCROLL_RANGES } from '../../consts';

const DEFAULTS: Required<MoveScroll> = {
  type: 'MoveScroll',
  direction: -60,
  range: 'in',
  travel: { value: 400, unit: 'px' },
};

export const schema = {
  direction: { type: 'number', default: DEFAULTS.direction },
  range: { type: 'enum', values: SCROLL_RANGES, default: DEFAULTS.range },
  travel: { type: 'length', default: DEFAULTS.travel },
};

export function getNames(options: ScrubAnimationOptions) {
  return suffixNames(['motion-moveScroll'], options.suffix);
}

export function web(options: ScrubAnimationOptions, _?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as MoveScroll;
  const { direction = DEFAULTS.direction, range = DEFAULTS.range } = namedEffect;

  const easing = 'linear';
  const fill = getScrollFill(options, range);
  const offsets = completeScrollOffsets(options as ScrubAnimationOptions, range);

  const travel = parseLength(namedEffect.travel, DEFAULTS.travel);
  const unit = getCssUnits(travel.unit);
  const [travelX, polarY] = transformPolarToXY(direction, travel.value);
  const travelY = direction % 180 ? polarY : 0;

  // moving down - against the scroll - widens the range by the travel
  let startOffsetAdd = '',
    endOffsetAdd = '';
  if (travelY > 0) {
    if (range !== 'out') {
      startOffsetAdd = `${-travelY}${unit}`;
    }
    if (range !== 'in') {
      endOffsetAdd = `${travelY}${unit}`;
    }
  }

  const fromValue = {
    x: range === 'out' ? 0 : -travelX,
    y: range === 'out' ? 0 : -travelY,
  };
  const toValue = {
    x: range === 'in' ? 0 : travelX,
    y: range === 'in' ? 0 : travelY,
  };

  const [moveScroll] = getNames(options);

  const custom = {
    '--motion-move-from-x': `${fromValue.x}${unit}`,
    '--motion-move-from-y': `${fromValue.y}${unit}`,
    '--motion-move-to-x': `${toValue.x}${unit}`,
    '--motion-move-to-y': `${toValue.y}${unit}`,
  };

  // use transform: translate(<value>) and not translate: <value> because of WebKit bug: https://bugs.webkit.org/show_bug.cgi?id=276281
  const animations = [
    {
      ...options,
      name: moveScroll,
      fill,
      ...offsets,
      easing,
      startOffsetAdd,
      endOffsetAdd,
      custom,
      keyframes: [
        {
          transform: `translate(${toKeyframeValue(
            custom,
            '--motion-move-from-x',
            asWeb,
          )}, ${toKeyframeValue(
            custom,
            '--motion-move-from-y',
            asWeb,
          )}) rotate(${toKeyframeValue({}, '--motion-rotate', false, '0')})`,
        },
        {
          transform: `translate(${toKeyframeValue(
            custom,
            '--motion-move-to-x',
            asWeb,
          )}, ${toKeyframeValue(
            custom,
            '--motion-move-to-y',
            asWeb,
          )}) rotate(${toKeyframeValue({}, '--motion-rotate', false, '0')})`,
        },
      ],
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}
