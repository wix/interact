import type {
  AnimationFillMode,
  ScrubAnimationOptions,
  ShuttersScroll,
  DomApi,
  EffectFourDirections,
} from '../../types';
import {
  getOppositeDirection,
  getShuttersClipPaths,
  getEasing,
  toKeyframeValue,
  parseDirection,
} from '../../utils';
import { FOUR_DIRECTIONS, SCROLL_RANGES } from '../../consts';

export const schema = {
  direction: { type: 'enum', values: FOUR_DIRECTIONS, default: 'right' },
  range: { type: 'enum', values: SCROLL_RANGES, default: 'in' },
  shutters: { type: 'number', min: 1, int: true, default: 12 },
  staggered: { type: 'bool', default: true },
} as const;

export function getNames(options: ScrubAnimationOptions) {
  const { range = schema.range.default, staggered = schema.staggered.default } =
    options.namedEffect as ShuttersScroll;
  const { suffix = '' } = options;
  const stagger = range === 'continuous' && staggered ? '-staggered' : '';
  return [`motion-shuttersScroll-${range}${stagger}${suffix}`];
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const { suffix = '' } = options;
  const namedEffect = options.namedEffect as ShuttersScroll;
  const direction = parseDirection<EffectFourDirections>(
    namedEffect?.direction,
    FOUR_DIRECTIONS,
    schema.direction.default,
  );
  const {
    shutters = schema.shutters.default,
    staggered = schema.staggered.default,
    range = schema.range.default,
  } = namedEffect;
  const fill = (
    range === 'out' ? 'forwards' : range === 'in' ? 'backwards' : options.fill
  ) as AnimationFillMode;

  const easing = range === 'in' ? getEasing('sineIn') : getEasing('sineOut');

  const directionOpp = getOppositeDirection([...FOUR_DIRECTIONS], direction);

  const { clipStart, clipEnd } = getShuttersClipPaths(
    range === 'out' ? directionOpp : direction,
    shutters,
    staggered,
  );

  const custom = {
    [`--motion-shutters-clip-start${suffix}`]: range === 'out' ? clipEnd : clipStart,
    [`--motion-shutters-clip-end${suffix}`]: range === 'out' ? clipStart : clipEnd,
  };

  const [shuttersScroll] = getNames(options);

  const keyframes: {
    clipPath: string | number;
    easing?: string;
    offset?: number;
  }[] = [
    {
      clipPath: toKeyframeValue(custom, `--motion-shutters-clip-start${suffix}`, asWeb),
      easing,
    },
    {
      clipPath: toKeyframeValue(custom, `--motion-shutters-clip-end${suffix}`, asWeb),
    },
  ];

  if (range === 'continuous') {
    keyframes[1].easing = easing;
    keyframes[1].offset = staggered ? 0.45 : 0.4;

    const { clipStart: oppClipStart, clipEnd: oppClipEnd } = getShuttersClipPaths(
      directionOpp,
      shutters,
      staggered,
      true,
    );
    Object.assign(custom, {
      [`--motion-shutters-clip-opp-end${suffix}`]: oppClipEnd,
      [`--motion-shutters-clip-opp-start${suffix}`]: oppClipStart,
    });

    const secondOffset = staggered ? 0.55 : 0.6;
    keyframes.push(
      {
        clipPath: toKeyframeValue(custom, `--motion-shutters-clip-end${suffix}`, asWeb),
        offset: secondOffset,
        easing,
      },
      {
        clipPath: toKeyframeValue(custom, `--motion-shutters-clip-opp-end${suffix}`, asWeb),
        offset: secondOffset,
        easing,
      },
      {
        clipPath: toKeyframeValue(custom, `--motion-shutters-clip-opp-start${suffix}`, asWeb),
      },
    );
  }

  return [
    {
      ...options,
      name: shuttersScroll,
      fill,
      easing: 'linear',
      custom,
      keyframes,
    },
  ];
}
