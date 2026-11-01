import type { AnimationFillMode, DomApi, ScrubAnimationOptions, SpinScroll } from '../../types';
import { toKeyframeValue, parseDirection, suffixNames, suffixCustomProperties } from '../../utils';
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
  const direction = parseDirection(namedEffect?.direction, SPIN_DIRECTIONS, DEFAULTS.direction);
  const { spins = DEFAULTS.spins, scale = DEFAULTS.scale, range = DEFAULTS.range } = namedEffect;
  const easing = 'linear';
  const fill = (
    range === 'out' ? 'forwards' : range === 'in' ? 'backwards' : options.fill || 'both'
  ) as AnimationFillMode;

  const spinDirection = DIRECTION_MAP[direction];
  const rotationZ = spins * 360;
  const isOut = range === 'out';

  const fromValue = isOut ? 0 : -rotationZ;
  const toValue = range === 'in' ? 0 : rotationZ;

  const [spinScroll] = getNames(options);

  const custom = {
    '--motion-spin-from': `${spinDirection * fromValue}deg`,
    '--motion-spin-to': `${spinDirection * toValue}deg`,
    '--motion-spin-scale-from': isOut ? 1 : scale,
    '--motion-spin-scale-to': range === 'in' ? 1 : scale,
  };

  const getTransform = (scaleKey: string, spinKey: string) =>
    `scale(${toKeyframeValue(custom, scaleKey, asWeb)}) rotate(calc(${toKeyframeValue(
      {},
      '--motion-rotate',
      false,
      '0deg',
    )} + ${toKeyframeValue(custom, spinKey, asWeb)}))`;

  const keyframes = [
    { transform: getTransform('--motion-spin-scale-from', '--motion-spin-from') },
    { transform: getTransform('--motion-spin-scale-to', '--motion-spin-to') },
  ];

  if (range === 'continuous') {
    keyframes.splice(1, 0, {
      transform: `scale(1) rotate(${toKeyframeValue({}, '--motion-rotate', false, '0deg')})`,
    });
  }

  const animations = [
    {
      ...options,
      name: spinScroll,
      fill,
      easing,
      custom,
      keyframes,
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}
