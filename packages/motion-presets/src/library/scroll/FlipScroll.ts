import type { AnimationFillMode, DomApi, FlipScroll, ScrubAnimationOptions } from '../../types';
import { toKeyframeValue, parseDirection } from '../../utils';
import { AXIS_DIRECTIONS, SCROLL_RANGES } from '../../consts';

export const schema = {
  angle: { type: 'number', default: 240 },
  direction: { type: 'enum', values: AXIS_DIRECTIONS, default: 'horizontal' },
  perspective: { type: 'number', min: 0, default: 800 },
  range: { type: 'enum', values: SCROLL_RANGES, default: 'continuous' },
} as const;

const ROTATE_DIRECTION_MAP = {
  vertical: 'rotateX',
  horizontal: 'rotateY',
};

export function getNames({ suffix = '' }: ScrubAnimationOptions) {
  return ['motion-flipScroll'].map((name) => name + suffix);
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as FlipScroll;
  const direction = parseDirection<(typeof AXIS_DIRECTIONS)[number]>(
    namedEffect?.direction,
    AXIS_DIRECTIONS,
    schema.direction.default,
  );
  const {
    angle = schema.angle.default,
    range = schema.range.default,
    perspective = schema.perspective.default,
  } = namedEffect;

  const rotationAxis = ROTATE_DIRECTION_MAP[direction];

  const fromValue = range === 'out' ? 0 : -angle;
  const toValue = range === 'in' ? 0 : angle;
  const easing = 'linear';
  const fill = (
    range === 'out' ? 'forwards' : range === 'in' ? 'backwards' : options.fill
  ) as AnimationFillMode;

  const [flipScroll] = getNames(options);

  const custom = {
    '--motion-perspective': `${perspective}px`,
    '--motion-flip-from': `${rotationAxis}(${fromValue}deg)`,
    '--motion-flip-to': `${rotationAxis}(${toValue}deg)`,
  };

  return [
    {
      ...options,
      name: flipScroll,
      fill,
      easing,
      custom,
      keyframes: [
        {
          transform: `perspective(${toKeyframeValue(custom, '--motion-perspective', asWeb)}) ${toKeyframeValue(
            custom,
            '--motion-flip-from',
            asWeb,
          )} rotate(${toKeyframeValue({}, '--motion-rotate', false, '0deg')})`,
        },
        {
          transform: `perspective(${toKeyframeValue(custom, '--motion-perspective', asWeb)}) ${toKeyframeValue(
            custom,
            '--motion-flip-to',
            asWeb,
          )} rotate(${toKeyframeValue({}, '--motion-rotate', false, '0deg')})`,
        },
      ],
    },
  ];
}
