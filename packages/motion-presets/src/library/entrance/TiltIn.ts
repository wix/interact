import {
  getClipPolygonParams,
  toKeyframeValue,
  parseDirection,
  parseLengthOrCalc,
  getEntranceFill,
} from '../../utils';
import type { TiltIn, TimeAnimationOptions, EffectTwoSides } from '../../types';
import { TWO_SIDES_DIRECTIONS } from '../../consts';

export const schema = {
  depth: { type: 'length', default: { value: 100, unit: 'px' } },
  from: { type: 'enum', values: TWO_SIDES_DIRECTIONS, default: 'left' },
  perspective: { type: 'number', min: 0, default: 800 },
} as const;

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return ['motion-fadeIn', 'motion-tiltInRotate', 'motion-tiltInClip'].map((name) => name + suffix);
}

const ROTATION_MAP = {
  left: 30,
  right: -30,
};

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const { suffix = '' } = options;
  const namedEffect = options.namedEffect as TiltIn;
  const direction = parseDirection<EffectTwoSides>(
    namedEffect?.from,
    TWO_SIDES_DIRECTIONS,
    schema.from.default,
  );
  const depth = parseLengthOrCalc(namedEffect.depth, schema.depth.default);
  const { perspective = schema.perspective.default } = namedEffect;
  const [fadeIn, tiltInRotate, tiltInClip] = getNames(options);

  const easing = options.easing || 'cubicOut';
  const clipStart = getClipPolygonParams({ direction: 'top', minimum: 0 });
  const rotationZ = ROTATION_MAP[direction];
  const clipEnd = getClipPolygonParams({ direction: 'initial' });
  const depthValue =
    typeof depth === 'string'
      ? depth
      : `${depth.value}${depth.unit === 'percentage' ? '%' : depth.unit}`;

  const rotateCustom = {
    [`--motion-perspective${suffix}`]: `${perspective}px`,
    [`--motion-depth-negative${suffix}`]: `calc(${depthValue} * -1)`,
    [`--motion-depth-positive${suffix}`]: depthValue,
  };

  const clipCustom = {
    [`--motion-rotate-z${suffix}`]: `${rotationZ}deg`,
    [`--motion-clip-start${suffix}`]: clipStart,
  };

  return [
    {
      ...options,
      name: fadeIn,
      fill: getEntranceFill(options),
      duration: options.duration! * 0.2,
      easing: 'cubicOut',
      custom: {},
      keyframes: [{ offset: 0, opacity: 0 }],
    },
    {
      ...options,
      name: tiltInRotate,
      fill: getEntranceFill(options),
      easing,
      custom: rotateCustom,
      keyframes: [
        {
          transform: `perspective(${toKeyframeValue(rotateCustom, `--motion-perspective${suffix}`, asWeb)}) translateZ(${toKeyframeValue(rotateCustom, `--motion-depth-negative${suffix}`, asWeb)}) rotateX(-90deg) translateZ(${toKeyframeValue(rotateCustom, `--motion-depth-positive${suffix}`, asWeb)}) rotate(var(--motion-rotate, 0deg))`,
        },
        {
          transform: `perspective(${toKeyframeValue(rotateCustom, `--motion-perspective${suffix}`, asWeb)}) translateZ(${toKeyframeValue(rotateCustom, `--motion-depth-negative${suffix}`, asWeb)}) rotateX(0deg) translateZ(${toKeyframeValue(rotateCustom, `--motion-depth-positive${suffix}`, asWeb)}) rotate(var(--motion-rotate, 0deg))`,
        },
      ],
    },
    {
      ...options,
      name: tiltInClip,
      fill: getEntranceFill(options),
      easing,
      composite: 'add' as const,
      duration: options.duration! * 0.8,
      custom: clipCustom,
      keyframes: [
        {
          clipPath: `var(--motion-clip-start${suffix}, ${clipCustom[`--motion-clip-start${suffix}`]})`,
          transform: `rotateZ(${toKeyframeValue(clipCustom, `--motion-rotate-z${suffix}`, asWeb)})`,
        },
        {
          clipPath: clipEnd,
          transform: `rotateZ(0deg)`,
        },
      ],
    },
  ];
}
