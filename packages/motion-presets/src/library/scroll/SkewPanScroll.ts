import type { DomApi, ScrubAnimationOptions, SkewPanScroll } from '../../types';
import {
  toKeyframeValue,
  parseKeywordLazy,
  suffixNames,
  suffixCustomProperties,
  getScrollFill,
  completeScrollOffsets,
} from '../../utils';
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
  right: 1,
  left: -1,
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
  const direction = parseKeywordLazy(
    namedEffect?.direction,
    TWO_SIDES_DIRECTIONS,
    DEFAULTS.direction,
  );
  const { skew = DEFAULTS.skew, range = DEFAULTS.range } = namedEffect;
  const easing = 'linear';
  const fill = getScrollFill(options, range);
  const offsets = completeScrollOffsets(options as ScrubAnimationOptions, range);

  const skewX = skew * DIRECTION_MAP[direction];
  const leftX = `calc(${toKeyframeValue(
    {},
    '--motion-left',
    false,
    'calc(100vw - 100%)',
  )} * -1 - 100%)`;
  const rightX = `calc(100vw - ${toKeyframeValue({}, '--motion-left', false, '0px')})`;
  const [startX, endX] = direction === 'left' ? [rightX, leftX] : [leftX, rightX];

  const fromValues = {
    skew: range === 'out' ? 0 : skewX,
    translate: range === 'out' ? '0px' : startX,
  };
  const toValues = {
    skew: range === 'in' ? 0 : -skewX,
    translate: range === 'in' ? '0px' : endX,
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
      ...offsets,
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
          )}) rotate(${toKeyframeValue({}, '--motion-rotate', false, '0deg')})`,
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
          )}) rotate(${toKeyframeValue({}, '--motion-rotate', false, '0deg')})`,
        },
      ],
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}
