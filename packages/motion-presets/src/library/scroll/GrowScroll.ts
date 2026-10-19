import type {
  AnimationFillMode,
  GrowScroll,
  ScrubAnimationOptions,
  DomApi,
  EffectNineDirections,
} from '../../types';
import { toKeyframeValue, parseDirection } from '../../utils';
import { NINE_DIRECTIONS, SCROLL_RANGES } from '../../consts';

const MAX_Y_TRAVEL = 40;
const EPSILON = 0.01;

export const schema = {
  pivot: { type: 'enum', values: NINE_DIRECTIONS, default: 'center' },
  range: { type: 'enum', values: SCROLL_RANGES, default: 'in' },
  scale: { type: 'number', min: 0, default: 0.25 },
  speed: { type: 'number', min: 0, default: 1 },
} as const;

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

export function getNames({ suffix = '' }: ScrubAnimationOptions) {
  return ['motion-growScroll'].map((name) => name + suffix);
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const { suffix = '' } = options;
  const namedEffect = options.namedEffect as GrowScroll;
  const {
    range = schema.range.default,
    scale: inputScale = schema.scale.default,
    speed = schema.speed.default,
  } = namedEffect;
  const direction = parseDirection<EffectNineDirections>(
    namedEffect?.pivot,
    NINE_DIRECTIONS,
    schema.pivot.default,
  );
  const easing = 'linear';
  const fill = (
    range === 'out' ? 'forwards' : range === 'in' ? 'backwards' : options.fill
  ) as AnimationFillMode;

  const invScale = 1 / Math.max(inputScale, EPSILON);
  const scale = range === 'in' ? Math.min(inputScale, invScale) : Math.max(inputScale, invScale);
  const scaleFrom = scale;
  const scaleTo = scale;
  const travelY = 1 / Math.max(speed, EPSILON) - 1;
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

  const [growScroll] = getNames(options);

  const custom = {
    [`--motion-travel-from${suffix}`]: `${fromValues.travel}vh`,
    [`--motion-travel-to${suffix}`]: `${toValues.travel}vh`,
    [`--motion-grow-from${suffix}`]: fromValues.scale,
    [`--motion-grow-to${suffix}`]: toValues.scale,
    [`--motion-trans-x${suffix}`]: `${trnsX}%`,
    [`--motion-trans-y${suffix}`]: `${trnsY}%`,
  };

  return [
    {
      ...options,
      name: growScroll,
      fill,
      easing,
      startOffsetAdd,
      endOffsetAdd,
      custom,
      keyframes: [
        {
          transform: `translateY(${toKeyframeValue(
            custom,
            `--motion-travel-from${suffix}`,
            asWeb,
          )}) translate(${toKeyframeValue(custom, `--motion-trans-x${suffix}`, asWeb)}, ${toKeyframeValue(
            custom,
            `--motion-trans-y${suffix}`,
            asWeb,
          )}) scale(${toKeyframeValue(
            custom,
            `--motion-grow-from${suffix}`,
            asWeb,
          )}) translate(calc(-1 * ${toKeyframeValue(
            custom,
            `--motion-trans-x${suffix}`,
            asWeb,
          )}), calc(-1 * ${toKeyframeValue(
            custom,
            `--motion-trans-y${suffix}`,
            asWeb,
          )})) rotate(${toKeyframeValue({}, '--motion-rotate', false, '0')})`,
        },
        {
          transform: `translateY(${toKeyframeValue(
            custom,
            `--motion-travel-to${suffix}`,
            asWeb,
          )}) translate(${toKeyframeValue(custom, `--motion-trans-x${suffix}`, asWeb)}, ${toKeyframeValue(
            custom,
            `--motion-trans-y${suffix}`,
            asWeb,
          )}) scale(${toKeyframeValue(
            custom,
            `--motion-grow-to${suffix}`,
            asWeb,
          )}) translate(calc(-1 * ${toKeyframeValue(
            custom,
            `--motion-trans-x${suffix}`,
            asWeb,
          )}), calc(-1 * ${toKeyframeValue(
            custom,
            `--motion-trans-y${suffix}`,
            asWeb,
          )})) rotate(${toKeyframeValue({}, '--motion-rotate', false, '0')})`,
        },
      ],
    },
  ];
}
