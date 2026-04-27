import type { ArcIn, TimeAnimationOptions, EffectFourDirections, DomApi } from '../../types';
import { toKeyframeValue, parseDirection, parseLength } from '../../utils';
import { FOUR_DIRECTIONS } from '../../consts';

const ROTATION_ANGLE = 80;
const DEFAULT_DIRECTION: EffectFourDirections = 'right';
const DEFAULT_DEPTH = { value: 200, unit: 'px' };

const DIRECTION_MAP: Record<EffectFourDirections, { x: number; y: number; sign: number }> = {
  top: { x: 1, y: 0, sign: 1 },
  right: { x: 0, y: 1, sign: 1 },
  bottom: { x: 1, y: 0, sign: -1 },
  left: { x: 0, y: 1, sign: -1 },
};

export function web(options: TimeAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function getNames(_: TimeAnimationOptions) {
  return ['motion-fadeIn', 'motion-arcIn'];
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as ArcIn;
  const direction = parseDirection(namedEffect?.direction, FOUR_DIRECTIONS, DEFAULT_DIRECTION);

  const depth = parseLength(namedEffect.depth, DEFAULT_DEPTH);
  const { perspective = 800 } = namedEffect;
  const [fadeIn, arcIn] = getNames(options);

  const easing = options.easing || 'quintInOut';

  const { x, y, sign } = DIRECTION_MAP[direction];
  const depthValue = `${depth.value}${depth.unit === 'percentage' ? '%' : depth.unit}`;

  const custom = {
    '--motion-perspective': `${perspective}px`,
    '--motion-arc-x': `${x}`,
    '--motion-arc-y': `${y}`,
    '--motion-arc-sign': `${sign}`,
    '--motion-depth-negative': `calc(-1 * ${depthValue} / 2)`,
    '--motion-depth-positive': `calc(${depthValue} / 2)`,
  };

  return [
    {
      ...options,
      name: fadeIn,
      duration: options.duration! * 0.7,
      easing: 'sineIn',
      custom: {},
      keyframes: [{ offset: 0, opacity: 0 }],
    },
    {
      ...options,
      name: arcIn,
      easing,
      custom,
      keyframes: [
        {
          transform: `perspective(${toKeyframeValue(custom, '--motion-perspective', asWeb)}) translateZ(${toKeyframeValue(custom, '--motion-depth-negative', asWeb)}) rotateX(calc(${toKeyframeValue(
            custom,
            '--motion-arc-x',
            asWeb,
          )} * ${toKeyframeValue(
            custom,
            '--motion-arc-sign',
            asWeb,
          )} * ${ROTATION_ANGLE}deg)) rotateY(calc(${toKeyframeValue(
            custom,
            '--motion-arc-y',
            asWeb,
          )} * ${toKeyframeValue(
            custom,
            '--motion-arc-sign',
            asWeb,
          )} * ${ROTATION_ANGLE}deg)) translateZ(${toKeyframeValue(custom, '--motion-depth-positive', asWeb)}) rotate(var(--motion-rotate, 0deg))`,
        },
        {
          transform: `perspective(${toKeyframeValue(custom, '--motion-perspective', asWeb)}) translateZ(${toKeyframeValue(custom, '--motion-depth-negative', asWeb)}) rotateX(0deg) rotateY(0deg) translateZ(${toKeyframeValue(custom, '--motion-depth-positive', asWeb)}) rotate(var(--motion-rotate, 0deg))`,
        },
      ],
    },
  ];
}
