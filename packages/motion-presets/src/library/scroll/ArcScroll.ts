import type { ArcScroll, AnimationFillMode, DomApi, ScrubAnimationOptions } from '../../types';
import { toKeyframeValue, parseDirection } from '../../utils';
import { AXIS_DIRECTIONS, SCROLL_RANGES } from '../../consts';

const ROTATION = 68;

export const schema = {
  direction: { type: 'enum', values: AXIS_DIRECTIONS, default: 'horizontal' },
  perspective: { type: 'number', min: 0, default: 500 },
  range: { type: 'enum', values: SCROLL_RANGES, default: 'in' },
} as const;

const ROTATE_DIRECTION_MAP = {
  vertical: 'rotateX',
  horizontal: 'rotateY',
};

export function getNames({ suffix = '' }: ScrubAnimationOptions) {
  return ['motion-arcScroll'].map((name) => name + suffix);
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const { suffix = '' } = options;
  const namedEffect = options.namedEffect as ArcScroll;
  const direction = parseDirection<(typeof AXIS_DIRECTIONS)[number]>(
    namedEffect?.direction,
    AXIS_DIRECTIONS,
    schema.direction.default,
  );
  const { range = schema.range.default, perspective = schema.perspective.default } = namedEffect;
  const fill = (
    range === 'out' ? 'forwards' : range === 'in' ? 'backwards' : options.fill
  ) as AnimationFillMode;

  const rotateAxis = ROTATE_DIRECTION_MAP[direction];
  const fromValue = range === 'out' ? 0 : -ROTATION;
  const toValue = range === 'in' ? 0 : ROTATION;
  const easing = 'linear';

  const [arcScroll] = getNames(options);

  const custom = {
    [`--motion-perspective${suffix}`]: `${perspective}px`,
    [`--motion-arc-from${suffix}`]: `${rotateAxis}(${fromValue}deg)`,
    [`--motion-arc-to${suffix}`]: `${rotateAxis}(${toValue}deg)`,
  };

  return [
    {
      ...options,
      name: arcScroll,
      fill,
      easing,
      custom,
      keyframes: [
        {
          transform: `perspective(${toKeyframeValue(custom, `--motion-perspective${suffix}`, asWeb)}) translateZ(-300px) ${toKeyframeValue(
            custom,
            `--motion-arc-from${suffix}`,
            asWeb,
          )} translateZ(300px) rotate(${toKeyframeValue({}, '--motion-rotate', false, '0deg')})`,
        },
        {
          transform: `perspective(${toKeyframeValue(custom, `--motion-perspective${suffix}`, asWeb)}) translateZ(-300px) ${toKeyframeValue(
            custom,
            `--motion-arc-to${suffix}`,
            asWeb,
          )} translateZ(300px) rotate(${toKeyframeValue({}, '--motion-rotate', false, '0deg')})`,
        },
      ],
    },
  ];
}
