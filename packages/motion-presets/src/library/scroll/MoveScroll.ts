import type { AnimationFillMode, DomApi, MoveScroll, ScrubAnimationOptions } from '../../types';
import {
  getCssUnits,
  transformPolarToXY,
  toKeyframeValue,
  parseLength,
  parseDirection,
} from '../../utils';

const DEFAULT_ANGLE = 120;
const DEFAULT_DISTANCE = { value: 400, unit: 'px' };

export function getNames(_: ScrubAnimationOptions) {
  return ['motion-moveScroll'];
}

export function web(options: ScrubAnimationOptions, _?: DomApi, config?: Record<string, any>) {
  return style(options, config, true);
}

export function style(options: ScrubAnimationOptions, config?: Record<string, any>, asWeb = false) {
  const namedEffect = options.namedEffect as MoveScroll;
  const angle = parseDirection(namedEffect?.angle, [], DEFAULT_ANGLE, true);
  const { range = 'in' } = namedEffect;

  const easing = 'linear';
  const fill = (
    range === 'out' ? 'forwards' : range === 'in' ? 'backwards' : options.fill
  ) as AnimationFillMode;

  const distance = parseLength(namedEffect.distance, DEFAULT_DISTANCE);

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
}
