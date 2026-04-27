import { getClipPolygonParams, toKeyframeValue, parseDirection, parseLength } from '../../utils';
import type { TiltIn, TimeAnimationOptions, EffectTwoSides } from '../../types';
import { TWO_SIDES_DIRECTIONS } from '../../consts';

const DEFAULT_DIRECTION: EffectTwoSides = 'left';
const DEFAULT_DEPTH = { value: 200, unit: 'px' };

export function getNames(_: TimeAnimationOptions) {
  return ['motion-fadeIn', 'motion-tiltInRotate', 'motion-tiltInClip'];
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
  const direction = parseDirection(namedEffect?.direction, TWO_SIDES_DIRECTIONS, DEFAULT_DIRECTION);
  const depth = parseLength(namedEffect.depth, DEFAULT_DEPTH);
  const { perspective = 800 } = namedEffect;
  const [fadeIn, tiltInRotate, tiltInClip] = getNames(options);

  const easing = options.easing || 'cubicOut';
  const clipStart = getClipPolygonParams({ direction: 'top', minimum: 0 });
  const rotationZ = ROTATION_MAP[direction];
  const clipEnd = getClipPolygonParams({ direction: 'initial' });
  const depthValue = `${depth.value}${depth.unit === 'percentage' ? '%' : depth.unit}`;

  const rotateCustom = {
    '--motion-perspective': `${perspective}px`,
    '--motion-depth-negative': `calc(${depthValue} / 2 * -1)`,
    '--motion-depth-positive': `calc(${depthValue} / 2)`,
  };

  const clipCustom = {
    '--motion-rotate-z': `${rotationZ}deg`,
    '--motion-clip-start': clipStart,
  };

  return [
    {
      ...options,
      name: fadeIn,
      duration: options.duration! * 0.2,
      easing: 'cubicOut',
      custom: {},
      keyframes: [{ offset: 0, opacity: 0 }],
    },
    {
      ...options,
      name: tiltInRotate,
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
}
