import type {
  AnimationFillMode,
  DomApi,
  ScrubAnimationOptions,
  SkewPanScroll,
  EffectTwoSides,
} from '../../types';
import { toKeyframeValue, parseDirection } from '../../utils';
import { SCROLL_RANGES, TWO_SIDES_DIRECTIONS } from '../../consts';

export const schema = {
  direction: { type: 'enum', values: TWO_SIDES_DIRECTIONS, default: 'left' },
  range: { type: 'enum', values: SCROLL_RANGES, default: 'in' },
  skew: { type: 'number', default: 10 },
} as const;

const DIRECTION_MAP = {
  right: -1,
  left: 1,
};

export function getNames({ suffix = '' }: ScrubAnimationOptions) {
  return ['motion-skewPanScroll'].map((name) => name + suffix);
}

export function prepare(_: ScrubAnimationOptions, dom?: DomApi) {
  if (dom) {
    let left = 0;
    dom.measure((target) => {
      if (!target) {
        return;
      }
      left = target.getBoundingClientRect().left;
    });
    dom.mutate((target) => {
      target?.style.setProperty('--motion-left', `${left}px`);
    });
  }
}

export function web(options: ScrubAnimationOptions, dom?: DomApi) {
  prepare(options, dom);

  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const { suffix = '' } = options;
  const namedEffect = options.namedEffect as SkewPanScroll;
  const toDirection = parseDirection<EffectTwoSides>(
    namedEffect?.direction,
    TWO_SIDES_DIRECTIONS,
    schema.direction.default,
  );
  const { skew = schema.skew.default, range = schema.range.default } = namedEffect;
  const fromDirection: EffectTwoSides = toDirection === 'left' ? 'right' : 'left';
  const direction = range === 'out' ? toDirection : fromDirection;
  const easing = 'linear';
  const fill = (
    range === 'out' ? 'forwards' : range === 'in' ? 'backwards' : options.fill
  ) as AnimationFillMode;

  const skewX = skew * DIRECTION_MAP[fromDirection];
  const startXLeft = `calc(${toKeyframeValue(
    {},
    '--motion-left',
    false,
    'calc(100vw - 100%)',
  )} * -1 - 100%)`;
  const endXLeft = `calc(100vw - ${toKeyframeValue({}, '--motion-left', false, '0px')})`;
  const [startX, endX] = direction === 'left' ? [startXLeft, endXLeft] : [endXLeft, startXLeft];

  const fromValues = {
    skew: range === 'out' ? 0 : skewX,
    translate: range === 'out' ? 0 : startX,
  };
  const toValues = {
    skew: range === 'in' ? 0 : -skewX,
    translate: range === 'in' ? 0 : range === 'out' ? startX : endX,
  };

  const [skewPanScroll] = getNames(options);

  const custom = {
    [`--motion-skewpan-start-x${suffix}`]: fromValues.translate,
    [`--motion-skewpan-end-x${suffix}`]: toValues.translate,
    [`--motion-skewpan-from-skew${suffix}`]: `${fromValues.skew}deg`,
    [`--motion-skewpan-to-skew${suffix}`]: `${toValues.skew}deg`,
  };

  return [
    {
      ...options,
      name: skewPanScroll,
      fill,
      easing,
      custom,
      keyframes: [
        {
          transform: `translateX(${toKeyframeValue(
            custom,
            `--motion-skewpan-start-x${suffix}`,
            asWeb,
          )}) skewX(${toKeyframeValue(
            custom,
            `--motion-skewpan-from-skew${suffix}`,
            asWeb,
          )}) rotate(${toKeyframeValue({}, '--motion-rotate', false, '0')})`,
        },
        {
          transform: `translateX(${toKeyframeValue(
            custom,
            `--motion-skewpan-end-x${suffix}`,
            asWeb,
          )}) skewX(${toKeyframeValue(
            custom,
            `--motion-skewpan-to-skew${suffix}`,
            asWeb,
          )}) rotate(${toKeyframeValue({}, '--motion-rotate', false, '0')})`,
        },
      ],
    },
  ];
}
