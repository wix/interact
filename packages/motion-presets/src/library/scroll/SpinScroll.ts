import type { DomApi, ScrubAnimationOptions, SpinScroll } from '../../types';
import {
  toKeyframeValue,
  parseKeywordLazy,
  suffixNames,
  suffixCustomProperties,
  getScrollFill,
  completeScrollOffsets,
} from '../../utils';
import { SCROLL_RANGES, SPIN_DIRECTIONS } from '../../consts';

const DEFAULTS: Required<SpinScroll> = {
  type: 'SpinScroll',
  direction: 'clockwise',
  range: 'in',
  scale: 1,
  spins: 0.15,
};

export const schema = {
  direction: { type: 'enum', values: SPIN_DIRECTIONS, default: DEFAULTS.direction },
  range: { type: 'enum', values: SCROLL_RANGES, default: DEFAULTS.range },
  scale: { type: 'number', min: 0, default: DEFAULTS.scale },
  spins: { type: 'number', min: 0, default: DEFAULTS.spins },
};

const DIRECTION_MAP = {
  clockwise: 1,
  'counter-clockwise': -1,
};

export function getNames(options: ScrubAnimationOptions) {
  return suffixNames(['motion-spinScroll'], options.suffix);
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as SpinScroll;
  const direction = parseKeywordLazy(namedEffect?.direction, SPIN_DIRECTIONS, DEFAULTS.direction);
  const { spins = DEFAULTS.spins, scale = DEFAULTS.scale, range = DEFAULTS.range } = namedEffect;
  const easing = 'linear';
  const fill = getScrollFill(options, range);
  const offsets = completeScrollOffsets(options as ScrubAnimationOptions, range);

  const spinDirection = DIRECTION_MAP[direction];
  const rotationZ = spins * 360;
  const isIn = range === 'in';

  const isContinuous = range === 'continuous';

  const fromValue = range === 'out' ? 0 : -rotationZ;
  const toValue = isIn ? 0 : rotationZ;

  const [spinScroll] = getNames(options);

  const custom = {
    '--motion-spin-from': `${spinDirection * fromValue}deg`,
    '--motion-spin-to': `${spinDirection * toValue}deg`,
    '--motion-spin-scale-from': range === 'out' ? 1 : scale,
    '--motion-spin-scale-to': isIn ? 1 : scale,
  };

  const rotate = toKeyframeValue({}, '--motion-rotate', false, '0deg');
  const keyframes = [
    {
      transform: `scale(${toKeyframeValue(
        custom,
        '--motion-spin-scale-from',
        asWeb,
      )}) rotate(calc(${rotate} + ${toKeyframeValue(custom, '--motion-spin-from', asWeb)}))`,
    },
    {
      transform: `scale(${toKeyframeValue(
        custom,
        '--motion-spin-scale-to',
        asWeb,
      )}) rotate(calc(${rotate} + ${toKeyframeValue(custom, '--motion-spin-to', asWeb)}))`,
    },
  ];

  if (isContinuous) {
    keyframes.splice(1, 0, { transform: `scale(1) rotate(${rotate})` });
  }

  const animations = [
    {
      ...options,
      name: spinScroll,
      fill,
      ...offsets,
      easing,
      custom,
      keyframes,
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}
