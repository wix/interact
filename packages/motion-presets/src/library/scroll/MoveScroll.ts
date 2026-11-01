import type { AnimationFillMode, DomApi, MoveScroll, ScrubAnimationOptions } from '../../types';
import {
  getCssUnits,
  transformPolarToXY,
  toKeyframeValue,
  parseLength,
  suffixNames,
  suffixCustomProperties,
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
  travel: { type: 'lengthObject', default: DEFAULTS.travel },
};

export function getNames(options: ScrubAnimationOptions) {
  return suffixNames(['motion-moveScroll'], options.suffix);
}

export function web(options: ScrubAnimationOptions, _?: DomApi, config?: Record<string, any>) {
  return style(options, config, true);
}

export function style(options: ScrubAnimationOptions, config?: Record<string, any>, asWeb = false) {
  const namedEffect = options.namedEffect as MoveScroll;
  const { direction = DEFAULTS.direction, range = DEFAULTS.range } = namedEffect;
  // direction is where the element moves to, the angle is where it moves from
  const angle = range === 'out' ? direction : direction + 180;

  const easing = 'linear';
  const fill = (
    range === 'out' ? 'forwards' : range === 'in' ? 'backwards' : options.fill || 'both'
  ) as AnimationFillMode;

  const distance = parseLength(namedEffect.travel, DEFAULTS.travel);

  let [travelX, travelY] = transformPolarToXY(angle, distance.value);
  const unit = getCssUnits(distance.unit);

  let startOffsetAdd = '',
    endOffsetAdd = '';
  if (!config?.ignoreScrollMoveOffsets) {
    if (travelY < 0 && range !== 'out') {
      startOffsetAdd = `${travelY}${unit}`;
      if (range !== 'in') {
        endOffsetAdd = `${Math.abs(travelY)}${unit}`;
      }
    }
    if (travelY > 0 && range === 'out') {
      endOffsetAdd = `${Math.abs(travelY)}${unit}`;
    }
  }

  [travelX, travelY] = [travelX, travelY].map(Math.round);
  const fromValue = {
    x: range === 'out' ? 0 : travelX,
    y: range === 'out' ? 0 : travelY,
  };
  const toValue = {
    x: range === 'in' ? 0 : range === 'out' ? travelX : -travelX,
    y: range === 'in' ? 0 : range === 'out' ? travelY : -travelY,
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
