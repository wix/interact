import type { CurveIn, TimeAnimationOptions, DomApi } from '../../types';
import { toKeyframeValue, parseDirection, parseLength } from '../../utils';
import { TWO_SIDES_DIRECTIONS } from '../../consts';

const DEFAULT_DEPTH = { value: 300, unit: 'px' };
const DIRECTIONS = [...TWO_SIDES_DIRECTIONS, 'pseudoLeft', 'pseudoRight'] as const;
const DEFAULT_DIRECTION: (typeof DIRECTIONS)[number] = 'right';

export function getNames(_: TimeAnimationOptions) {
  return ['motion-curveIn', 'motion-fadeIn'];
}

const PARAMS_MAP = {
  pseudoRight: { rotationX: '180', rotationY: '0' },
  right: { rotationX: '0', rotationY: '180' },
  pseudoLeft: { rotationX: '-180', rotationY: '0' },
  left: { rotationX: '0', rotationY: '-180' },
};

export function web(options: TimeAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as CurveIn;
  const direction = parseDirection(namedEffect?.direction, DIRECTIONS, DEFAULT_DIRECTION);
  const depth = parseLength(namedEffect.depth, DEFAULT_DEPTH);
  const { perspective = 200 } = namedEffect;
  const [curveIn, fadeIn] = getNames(options);

  const { rotationX, rotationY } = PARAMS_MAP[direction];
  const depthValue = `${depth.value}${depth.unit === 'percentage' ? '%' : depth.unit}`;

  const custom = {
    '--motion-perspective': `${perspective}px`,
    '--motion-rotate-x': `${rotationX}deg`,
    '--motion-rotate-y': `${rotationY}deg`,
    '--motion-depth-negative': `calc(${depthValue} * -3)`,
    '--motion-depth-positive': `calc(${depthValue} * 3)`,
  };

  const easing = 'quadOut';

  return [
    {
      ...options,
      name: curveIn,
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
      easing,
      custom: {},
      keyframes: [{ offset: 0, opacity: 0 }],
    },
  ];
}
