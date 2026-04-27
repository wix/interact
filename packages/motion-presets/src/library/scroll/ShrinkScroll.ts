import type {
  AnimationFillMode,
  ScrubAnimationOptions,
  ShrinkScroll,
  DomApi,
  EffectNineDirections,
} from '../../types';
import { toKeyframeValue, parseDirection } from '../../utils';
import { NINE_DIRECTIONS } from '../../consts';

const MAX_Y_TRAVEL = 40;
const DEFAULT_DIRECTION: EffectNineDirections = 'center';

const directionMap = {
  top: [0, -50],
  'top-right': [50, -50],
  right: [50, 0],
  'bottom-right': [50, 50],
  bottom: [0, 50],
  'bottom-left': [-50, 50],
  left: [-50, 0],
  'top-left': [-50, -50],
  center: [0, 0],
};

export function getNames(_: ScrubAnimationOptions) {
  return ['motion-shrinkScroll'];
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as ShrinkScroll;
  const { range = 'in', scale = range === 'in' ? 1.2 : 0.8, speed = 0 } = namedEffect;
  const direction = parseDirection(namedEffect?.direction, NINE_DIRECTIONS, DEFAULT_DIRECTION);
  const easing = 'linear';
  const fill = (
    range === 'out' ? 'forwards' : range === 'in' ? 'backwards' : options.fill
  ) as AnimationFillMode;

  const scaleFrom = scale;
  const scaleTo = scale;
  const travelY = speed;
  const travel = travelY * MAX_Y_TRAVEL;

  const fromValues = {
    scale: range === 'out' ? 1 : scaleFrom,
    travel: range === 'out' ? 0 : -travel,
  };
  const toValues = {
    scale: range === 'in' ? 1 : scaleTo,
    travel: range === 'in' ? 0 : travel,
  };

  const offset = Math.abs(travel);
  const startOffsetAdd = range === 'out' ? '0px' : `${-offset}vh`;
  const endOffsetAdd = range === 'in' ? '0px' : `${offset}vh`;

  const [trnsX, trnsY] = directionMap[direction] || [0, 0];

  const [shrinkScroll] = getNames(options);

  const custom = {
    '--motion-travel-from': `${fromValues.travel}vh`,
    '--motion-travel-to': `${toValues.travel}vh`,
    '--motion-shrink-from': fromValues.scale,
    '--motion-shrink-to': toValues.scale,
    '--motion-trans-x': `${trnsX}%`,
    '--motion-trans-y': `${trnsY}%`,
  };

  return [
    {
      ...options,
      name: shrinkScroll,
      fill,
      easing,
      custom,
      startOffsetAdd,
      endOffsetAdd,
      keyframes: [
        {
          transform: `translateY(${toKeyframeValue(
            custom,
            '--motion-travel-from',
            asWeb,
          )}) translate(${toKeyframeValue(custom, '--motion-trans-x', asWeb)}, ${toKeyframeValue(
            custom,
            '--motion-trans-y',
            asWeb,
          )}) scale(${toKeyframeValue(
            custom,
            '--motion-shrink-from',
            asWeb,
          )}) translate(calc(-1 * ${toKeyframeValue(
            custom,
            '--motion-trans-x',
            asWeb,
          )}), calc(-1 * ${toKeyframeValue(
            custom,
            '--motion-trans-y',
            asWeb,
          )})) rotate(${toKeyframeValue({}, '--motion-rotate', false, '0')})`,
        },
        {
          transform: `translateY(${toKeyframeValue(
            custom,
            '--motion-travel-to',
            asWeb,
          )}) translate(${toKeyframeValue(custom, '--motion-trans-x', asWeb)}, ${toKeyframeValue(
            custom,
            '--motion-trans-y',
            asWeb,
          )}) scale(${toKeyframeValue(
            custom,
            '--motion-shrink-to',
            asWeb,
          )}) translate(calc(-1 * ${toKeyframeValue(
            custom,
            '--motion-trans-x',
            asWeb,
          )}), calc(-1 * ${toKeyframeValue(
            custom,
            '--motion-trans-y',
            asWeb,
          )})) rotate(${toKeyframeValue({}, '--motion-rotate', false, '0')})`,
        },
      ],
    },
  ];
}
