import {
  getClipPolygonParams,
  toKeyframeValue,
  parseDirection,
  parseLength,
  getEntranceFill,
  suffixNames,
  suffixCustomProperties,
} from '../../utils';
import type { TiltIn, TimeAnimationOptions, LengthValue } from '../../types';
import { TWO_SIDES_DIRECTIONS } from '../../consts';

const DEFAULTS: Required<TiltIn> = {
  type: 'TiltIn',
  depth: { value: 100, unit: 'px' },
  from: 'left',
  perspective: 800,
};

export const schema = {
  depth: { type: 'length', default: DEFAULTS.depth },
  from: { type: 'enum', values: TWO_SIDES_DIRECTIONS, default: DEFAULTS.from },
  perspective: { type: 'number', min: 0, default: DEFAULTS.perspective },
};

export function getNames(options: TimeAnimationOptions) {
  return suffixNames(['motion-fadeIn', 'motion-tiltInRotate', 'motion-tiltInClip'], options.suffix);
}

const ROTATION_MAP = {
  left: 30,
  right: -30,
};

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as TiltIn;
  const direction = parseDirection(namedEffect?.from, TWO_SIDES_DIRECTIONS, DEFAULTS.from);
  const depth = parseLength(namedEffect.depth, DEFAULTS.depth as LengthValue);
  const { perspective = DEFAULTS.perspective } = namedEffect;
  const [fadeIn, tiltInRotate, tiltInClip] = getNames(options);

  const easing = options.easing || 'cubicOut';
  const clipStart = getClipPolygonParams({ direction: 'top', minimum: 0 });
  const rotationZ = ROTATION_MAP[direction];
  const clipEnd = getClipPolygonParams({ direction: 'initial' });
  const depthValue = `${depth.value}${depth.unit === 'percentage' ? '%' : depth.unit}`;

  const rotateCustom = {
    '--motion-perspective': `${perspective}px`,
    '--motion-depth-negative': `calc(${depthValue} * -1)`,
    '--motion-depth-positive': depthValue,
  };

  const clipCustom = {
    '--motion-rotate-z': `${rotationZ}deg`,
    '--motion-clip-start': clipStart,
  };

  const animations = [
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
          transform: `perspective(${toKeyframeValue(rotateCustom, '--motion-perspective', asWeb)}) translateZ(${toKeyframeValue(rotateCustom, '--motion-depth-negative', asWeb)}) rotateX(-90deg) translateZ(${toKeyframeValue(rotateCustom, '--motion-depth-positive', asWeb)}) rotate(var(--motion-rotate, 0deg))`,
        },
        {
          transform: `perspective(${toKeyframeValue(rotateCustom, '--motion-perspective', asWeb)}) translateZ(${toKeyframeValue(rotateCustom, '--motion-depth-negative', asWeb)}) rotateX(0deg) translateZ(${toKeyframeValue(rotateCustom, '--motion-depth-positive', asWeb)}) rotate(var(--motion-rotate, 0deg))`,
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
          clipPath: `var(--motion-clip-start, ${clipCustom['--motion-clip-start']})`,
          transform: `rotateZ(${toKeyframeValue(clipCustom, '--motion-rotate-z', asWeb)})`,
        },
        {
          clipPath: clipEnd,
          transform: `rotateZ(0deg)`,
        },
      ],
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}
