import type {
  CurveIn,
  TimeAnimationOptions,
  DomApi,
  EffectFourDirections,
  LengthValue,
} from '../../types';
import {
  toKeyframeValue,
  parseDirection,
  parseLengthLazy,
  getEntranceFill,
  suffixNames,
  suffixCustomProperties,
} from '../../utils';
import { FOUR_DIRECTIONS } from '../../consts';

const DEFAULTS: Required<CurveIn> = {
  type: 'CurveIn',
  depth: { value: 900, unit: 'px' },
  from: 'right',
  perspective: 200,
};

export const schema = {
  depth: { type: 'length', default: DEFAULTS.depth },
  from: { type: 'enum', values: FOUR_DIRECTIONS, default: DEFAULTS.from },
  perspective: { type: 'number', min: 0, default: DEFAULTS.perspective },
};

export function getNames(options: TimeAnimationOptions) {
  return suffixNames(['motion-curveIn', 'motion-fadeIn'], options.suffix);
}

const PARAMS_MAP: Record<EffectFourDirections, { rotationX: string; rotationY: string }> = {
  top: { rotationX: '180', rotationY: '0' },
  right: { rotationX: '0', rotationY: '180' },
  bottom: { rotationX: '-180', rotationY: '0' },
  left: { rotationX: '0', rotationY: '-180' },
};

export function web(options: TimeAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as CurveIn;
  const from = parseDirection(namedEffect?.from, FOUR_DIRECTIONS, DEFAULTS.from);
  const depth = parseLengthLazy(namedEffect.depth, DEFAULTS.depth as LengthValue);
  const { perspective = DEFAULTS.perspective } = namedEffect;
  const [curveIn, fadeIn] = getNames(options);

  const { rotationX, rotationY } = PARAMS_MAP[from];

  const custom = {
    '--motion-perspective': `${perspective}px`,
    '--motion-rotate-x': `${rotationX}deg`,
    '--motion-rotate-y': `${rotationY}deg`,
    '--motion-depth-negative': `calc(-1 * ${depth})`,
    '--motion-depth-positive': depth,
  };

  const easing = 'quadOut';

  const animations = [
    {
      ...options,
      name: curveIn,
      fill: getEntranceFill(options),
      easing,
      custom,
      keyframes: [
        {
          transform: `perspective(${toKeyframeValue(custom, '--motion-perspective', asWeb)}) translateZ(${toKeyframeValue(custom, '--motion-depth-negative', asWeb)}) rotateX(${toKeyframeValue(
            custom,
            '--motion-rotate-x',
            asWeb,
          )}) rotateY(${toKeyframeValue(
            custom,
            '--motion-rotate-y',
            asWeb,
          )}) translateZ(${toKeyframeValue(custom, '--motion-depth-positive', asWeb)}) rotateZ(var(--motion-rotate, 0deg))`,
        },
        {
          transform: `perspective(${toKeyframeValue(custom, '--motion-perspective', asWeb)}) translateZ(${toKeyframeValue(custom, '--motion-depth-negative', asWeb)}) rotateX(0deg) rotateY(0deg) translateZ(${toKeyframeValue(custom, '--motion-depth-positive', asWeb)}) rotateZ(var(--motion-rotate, 0deg))`,
        },
      ],
    },
    {
      ...options,
      name: fadeIn,
      fill: getEntranceFill(options),
      easing,
      custom: {},
      keyframes: [{ offset: 0, opacity: 0 }],
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}
