import type {
  AnimationFillMode,
  DomApi,
  ScrubAnimationOptions,
  SkewPanScroll,
  EffectTwoSides,
} from '../../types';
import { toKeyframeValue, parseDirection } from '../../utils';
import { TWO_SIDES_DIRECTIONS } from '../../consts';

const DEFAULT_DIRECTION: EffectTwoSides = 'right';

const DIRECTION_MAP = {
  right: -1,
  left: 1,
};

export function getNames(_: ScrubAnimationOptions) {
  return ['motion-skewPanScroll'];
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
  const namedEffect = options.namedEffect as SkewPanScroll;
  const direction = parseDirection(namedEffect?.direction, TWO_SIDES_DIRECTIONS, DEFAULT_DIRECTION);
  const { skew = 10, range = 'in' } = namedEffect;
  const easing = 'linear';
  const fill = (
    range === 'out' ? 'forwards' : range === 'in' ? 'backwards' : options.fill
  ) as AnimationFillMode;

  const skewX = skew * DIRECTION_MAP[direction];
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
    '--motion-skewpan-start-x': fromValues.translate,
    '--motion-skewpan-end-x': toValues.translate,
    '--motion-skewpan-from-skew': `${fromValues.skew}deg`,
    '--motion-skewpan-to-skew': `${toValues.skew}deg`,
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
            '--motion-skewpan-start-x',
            asWeb,
          )}) skewX(${toKeyframeValue(
            custom,
            '--motion-skewpan-from-skew',
            asWeb,
          )}) rotate(${toKeyframeValue({}, '--motion-rotate', false, '0')})`,
        },
        {
          transform: `translateX(${toKeyframeValue(
            custom,
            '--motion-skewpan-end-x',
            asWeb,
          )}) skewX(${toKeyframeValue(
            custom,
            '--motion-skewpan-to-skew',
            asWeb,
          )}) rotate(${toKeyframeValue({}, '--motion-rotate', false, '0')})`,
        },
      ],
    },
  ];
}
