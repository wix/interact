import type { ArcIn, TimeAnimationOptions, EffectFourDirections, DomApi } from '../../types';
import { toKeyframeValue, parseDirection, parseLength, getEntranceFill } from '../../utils';
import { FOUR_DIRECTIONS } from '../../consts';

const ROTATION_ANGLE = 80;

export const schema = {
  depth: { type: 'length', default: { value: 100, unit: 'px' } },
  from: { type: 'enum', values: FOUR_DIRECTIONS, default: 'right' },
  perspective: { type: 'number', min: 0, default: 800 },
} as const;

const DIRECTION_MAP: Record<EffectFourDirections, { x: number; y: number; sign: number }> = {
  top: { x: 1, y: 0, sign: 1 },
  right: { x: 0, y: 1, sign: 1 },
  bottom: { x: 1, y: 0, sign: -1 },
  left: { x: 0, y: 1, sign: -1 },
};

export function web(options: TimeAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return ['motion-fadeIn', 'motion-arcIn'].map((name) => name + suffix);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as ArcIn;
  const direction = parseDirection<EffectFourDirections>(
    namedEffect?.from,
    FOUR_DIRECTIONS,
    schema.from.default,
  );

  const depth = parseLength(namedEffect.depth, schema.depth.default);
  const { perspective = schema.perspective.default } = namedEffect;
  const [fadeIn, arcIn] = getNames(options);

  const easing = options.easing || 'quintInOut';

  const { x, y, sign } = DIRECTION_MAP[direction];
  const depthValue = `${depth.value}${depth.unit === 'percentage' ? '%' : depth.unit}`;

  const custom = {
    '--motion-perspective': `${perspective}px`,
    '--motion-arc-x': `${x}`,
    '--motion-arc-y': `${y}`,
    '--motion-arc-sign': `${sign}`,
    '--motion-depth-negative': `calc(-1 * ${depthValue})`,
    '--motion-depth-positive': depthValue,
  };

  return [
    {
      ...options,
      fill: getEntranceFill(options),
      name: fadeIn,
      duration: options.duration! * 0.7,
      easing: 'sineIn',
      custom: {},
      keyframes: [{ offset: 0, opacity: 0 }],
    },
    {
      ...options,
      fill: getEntranceFill(options),
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
