import type {
  AnimationFillMode,
  DomApi,
  ScrubAnimationOptions,
  SkewPanScroll,
  EffectTwoSides,
} from '../../types';
import { toKeyframeValue, parseDirection, suffixNames, suffixCustomProperties } from '../../utils';
import { SCROLL_RANGES, TWO_SIDES_DIRECTIONS } from '../../consts';

const DEFAULTS: Required<SkewPanScroll> = {
  type: 'SkewPanScroll',
  direction: 'left',
  range: 'in',
  skew: 10,
};

export const schema = {
  direction: { type: 'enum', values: TWO_SIDES_DIRECTIONS, default: DEFAULTS.direction },
  range: { type: 'enum', values: SCROLL_RANGES, default: DEFAULTS.range },
  skew: { type: 'number', default: DEFAULTS.skew },
};

const DIRECTION_MAP = {
  right: -1,
  left: 1,
};

export function getNames(options: ScrubAnimationOptions) {
  return suffixNames(['motion-skewPanScroll'], options.suffix);
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
  const direction = parseDirection(
    namedEffect?.direction,
    TWO_SIDES_DIRECTIONS,
    DEFAULTS.direction,
  );
  const { skew = DEFAULTS.skew, range = DEFAULTS.range } = namedEffect;
  // direction is where the element moves to - it comes from the opposite side, and continues to direction on out
  const from: EffectTwoSides =
    range === 'out' ? direction : direction === 'left' ? 'right' : 'left';
  const easing = 'linear';
  const fill = (
    range === 'out' ? 'forwards' : range === 'in' ? 'backwards' : options.fill || 'both'
  ) as AnimationFillMode;

  const skewX = skew * DIRECTION_MAP[from];
  const startXLeft = `calc(${toKeyframeValue(
    {},
    '--motion-left',
    false,
    'calc(100vw - 100%)',
  )} * -1 - 100%)`;
  const endXLeft = `calc(100vw - ${toKeyframeValue({}, '--motion-left', false, '0px')})`;
  const [startX, endX] = from === 'left' ? [startXLeft, endXLeft] : [endXLeft, startXLeft];

  const fromValues = {
    skew: range === 'out' ? 0 : skewX,
    translate: range === 'out' ? 0 : startX,
  };
  const toValues = {
    // leaning into the movement, flipping as it passes its layout position, so out ends like continuous
    skew: range === 'in' ? 0 : range === 'out' ? skewX : -skewX,
    translate: range === 'in' ? 0 : range === 'out' ? startX : endX,
  };

  const [skewPanScroll] = getNames(options);

  const custom = {
    '--motion-skewpan-start-x': fromValues.translate,
    '--motion-skewpan-end-x': toValues.translate,
    '--motion-skewpan-from-skew': `${fromValues.skew}deg`,
    '--motion-skewpan-to-skew': `${toValues.skew}deg`,
  };

  const animations = [
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

  return suffixCustomProperties(animations, options.suffix);
}
