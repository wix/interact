import type { CurveIn, TimeAnimationOptions, DomApi, EffectFourDirections } from '../../types';
import { toKeyframeValue, parseDirection, parseLength, getEntranceFill } from '../../utils';
import { FOUR_DIRECTIONS } from '../../consts';

export const schema = {
  depth: { type: 'length', default: { value: 900, unit: 'px' } },
  from: { type: 'enum', values: FOUR_DIRECTIONS, default: 'right' },
  perspective: { type: 'number', min: 0, default: 200 },
} as const;

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return ['motion-curveIn', 'motion-fadeIn'].map((name) => name + suffix);
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
  const direction = parseDirection<EffectFourDirections>(
    namedEffect?.from,
    FOUR_DIRECTIONS,
    schema.from.default,
  );
  const depth = parseLength(namedEffect.depth, schema.depth.default);
  const { perspective = schema.perspective.default } = namedEffect;
  const [curveIn, fadeIn] = getNames(options);

  const { rotationX, rotationY } = PARAMS_MAP[direction];
  const depthValue = `${depth.value}${depth.unit === 'percentage' ? '%' : depth.unit}`;

  const custom = {
    '--motion-perspective': `${perspective}px`,
    '--motion-rotate-x': `${rotationX}deg`,
    '--motion-rotate-y': `${rotationY}deg`,
    '--motion-depth-negative': `calc(-1 * ${depthValue})`,
    '--motion-depth-positive': depthValue,
  };

  const easing = 'quadOut';

  return [
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
}
