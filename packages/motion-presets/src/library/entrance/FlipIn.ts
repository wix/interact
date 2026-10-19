import { parseDirection, toKeyframeValue, getEntranceFill } from '../../utils';
import type {
  EffectFourDirections,
  EffectTwoAxes,
  FlipIn,
  TimeAnimationOptions,
} from '../../types';
import { AXIS_DIRECTIONS } from '../../consts';

export const schema = {
  angle: { type: 'number', default: 90 },
  direction: { type: 'enum', values: AXIS_DIRECTIONS, default: 'vertical' },
  perspective: { type: 'number', min: 0, default: 800 },
} as const;

const AXIS_TO_DIRECTION: Record<EffectTwoAxes, EffectFourDirections> = {
  vertical: 'top',
  horizontal: 'left',
};

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return ['motion-fadeIn', 'motion-flipIn'].map((name) => name + suffix);
}

function getRotateFrom(direction: EffectFourDirections, rotate: number) {
  return {
    x: ROTATE_MAP[direction].x * rotate,
    y: ROTATE_MAP[direction].y * rotate,
  };
}

const ROTATE_MAP: Record<EffectFourDirections, { x: number; y: number }> = {
  top: { x: 1, y: 0 },
  right: { x: 0, y: 1 },
  bottom: { x: -1, y: 0 },
  left: { x: 0, y: -1 },
};

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as FlipIn;
  const axis = parseDirection<EffectTwoAxes>(
    namedEffect?.direction,
    AXIS_DIRECTIONS,
    schema.direction.default,
  );
  const direction = AXIS_TO_DIRECTION[axis];
  const { angle = schema.angle.default, perspective = schema.perspective.default } = namedEffect;
  const [fadeIn, flipIn] = getNames(options);
  const easing = options.easing || 'backOut';

  const from = getRotateFrom(direction, angle);

  const custom = {
    '--motion-perspective': `${perspective}px`,
    '--motion-rotate-x': `${from.x}deg`,
    '--motion-rotate-y': `${from.y}deg`,
  };

  return [
    {
      ...options,
      easing: 'quadOut',
      name: fadeIn,
      fill: getEntranceFill(options),
      custom: {},
      keyframes: [{ offset: 0, opacity: 0 }],
    },
    {
      ...options,
      easing,
      name: flipIn,
      fill: getEntranceFill(options),
      custom,
      keyframes: [
        {
          transform: `perspective(${toKeyframeValue(custom, '--motion-perspective', asWeb)}) rotate(var(--motion-rotate, 0deg)) rotateX(var(--motion-rotate-x, ${custom['--motion-rotate-x']})) rotateY(var(--motion-rotate-y, ${custom['--motion-rotate-y']}))`,
        },
        {
          transform: `perspective(${toKeyframeValue(custom, '--motion-perspective', asWeb)}) rotate(var(--motion-rotate, 0deg)) rotateX(0deg) rotateY(0deg)`,
        },
      ],
    },
  ];
}
