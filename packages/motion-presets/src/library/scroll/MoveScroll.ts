import type { AnimationFillMode, DomApi, MoveScroll, ScrubAnimationOptions } from '../../types';
import {
  getCssUnits,
  transformPolarToXY,
  toKeyframeValue,
  parseLengthOrCalc,
  parseDirection,
} from '../../utils';
import { SCROLL_RANGES } from '../../consts';

export const schema = {
  direction: { type: 'number', default: -60 },
  range: { type: 'enum', values: SCROLL_RANGES, default: 'in' },
  travel: { type: 'length', default: { value: 400, unit: 'px' } },
} as const;

export function getNames({ suffix = '' }: ScrubAnimationOptions) {
  return ['motion-moveScroll'].map((name) => name + suffix);
}

export function web(options: ScrubAnimationOptions, _?: DomApi, config?: Record<string, any>) {
  return style(options, config, true);
}

export function style(options: ScrubAnimationOptions, config?: Record<string, any>, asWeb = false) {
  const { suffix = '' } = options;
  const namedEffect = options.namedEffect as MoveScroll;
  const direction = parseDirection<number>(
    namedEffect?.direction,
    [],
    schema.direction.default,
    true,
  );
  const { range = schema.range.default } = namedEffect;
  const angle = range === 'out' ? direction : direction + 180;

  const easing = 'linear';
  const fill = (
    range === 'out' ? 'forwards' : range === 'in' ? 'backwards' : options.fill
  ) as AnimationFillMode;

  const distance = parseLengthOrCalc(namedEffect.travel, schema.travel.default);
  const isCalc = typeof distance === 'string';

  let [travelX, travelY] = transformPolarToXY(angle, isCalc ? 1 : distance.value);
  const unit = isCalc ? '' : getCssUnits(distance.unit);
  const toLength = (value: number) => (isCalc ? `calc(${value} * ${distance})` : `${value}${unit}`);

  let startOffsetAdd = '',
    endOffsetAdd = '';
  if (!config?.ignoreScrollMoveOffsets) {
    if (travelY < 0 && range !== 'out') {
      startOffsetAdd = toLength(travelY);
      if (range !== 'in') {
        endOffsetAdd = toLength(Math.abs(travelY));
      }
    }
    if (travelY > 0 && range === 'out') {
      endOffsetAdd = toLength(Math.abs(travelY));
    }
  }

  if (!isCalc) {
    [travelX, travelY] = [travelX, travelY].map(Math.round);
  }
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
    [`--motion-move-from-x${suffix}`]: toLength(fromValue.x),
    [`--motion-move-from-y${suffix}`]: toLength(fromValue.y),
    [`--motion-move-to-x${suffix}`]: toLength(toValue.x),
    [`--motion-move-to-y${suffix}`]: toLength(toValue.y),
  };

  // use transform: translate(<value>) and not translate: <value> because of WebKit bug: https://bugs.webkit.org/show_bug.cgi?id=276281
  return [
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
            `--motion-move-from-x${suffix}`,
            asWeb,
          )}, ${toKeyframeValue(
            custom,
            `--motion-move-from-y${suffix}`,
            asWeb,
          )}) rotate(${toKeyframeValue({}, '--motion-rotate', false, '0')})`,
        },
        {
          transform: `translate(${toKeyframeValue(
            custom,
            `--motion-move-to-x${suffix}`,
            asWeb,
          )}, ${toKeyframeValue(
            custom,
            `--motion-move-to-y${suffix}`,
            asWeb,
          )}) rotate(${toKeyframeValue({}, '--motion-rotate', false, '0')})`,
        },
      ],
    },
  ];
}
