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
  FOUR_DIRECTIONS,
  parseDirection,
} from '../../utils';

const DEFAULT_DIRECTION: EffectFourDirections = 'right';

export function getNames(options: ScrubAnimationOptions) {
  const { range = 'in' } = options.namedEffect as ShuttersScroll;
  return [`motion-shuttersScroll-${range === 'continuous' ? '-continuous' : ''}`];
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as ShuttersScroll;
  const direction = parseDirection(namedEffect?.direction, FOUR_DIRECTIONS, DEFAULT_DIRECTION);
  const { shutters = 12, staggered = true, range = 'in' } = namedEffect;
  const fill = (
    range === 'out' ? 'forwards' : range === 'in' ? 'backwards' : options.fill
  ) as AnimationFillMode;

  const easing = range === 'in' ? getEasing('sineIn') : getEasing('sineOut');

  const directionOpp = getOppositeDirection(FOUR_DIRECTIONS, direction);

  const { clipStart, clipEnd } = getShuttersClipPaths(
    range === 'out' ? directionOpp : direction,
    shutters,
    staggered,
  );

  const custom = {
    '--motion-shutters-clip-start': range === 'out' ? clipEnd : clipStart,
    '--motion-shutters-clip-end': range === 'out' ? clipStart : clipEnd,
  };

  const [shuttersScroll] = getNames(options);

  const keyframes: {
    clipPath: string | number;
    easing?: string;
    offset?: number;
  }[] = [
    {
      clipPath: toKeyframeValue(custom, '--motion-shutters-clip-start', asWeb),
      easing,
    },
    {
      clipPath: toKeyframeValue(custom, '--motion-shutters-clip-end', asWeb),
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
      '--motion-shutters-clip-opp-end': oppClipEnd,
      '--motion-shutters-clip-opp-start': oppClipStart,
    });

    const secondOffset = staggered ? 0.55 : 0.6;
    keyframes.push(
      {
        clipPath: toKeyframeValue(custom, '--motion-shutters-clip-end', asWeb),
        offset: secondOffset,
        easing,
      },
      {
        clipPath: toKeyframeValue(custom, '--motion-shutters-clip-opp-end', asWeb),
        offset: secondOffset,
        easing,
      },
      {
        clipPath: toKeyframeValue(custom, '--motion-shutters-clip-opp-start', asWeb),
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
