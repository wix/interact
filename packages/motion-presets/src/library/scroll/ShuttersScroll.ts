import type {
  ScrubAnimationOptions,
  ShuttersScroll,
  DomApi,
  EffectFourDirections,
} from '../../types';
import {
  getOppositeDirection,
  getEasing,
  toKeyframeValue,
  parseKeywordLazy,
  suffixNames,
  suffixCustomProperties,
  getScrollFill,
  completeScrollOffsets,
} from '../../utils';
import { FOUR_DIRECTIONS, SCROLL_RANGES } from '../../consts';

const CONTINUOUS_HOLD = 0.2;
const CONTINUOUS_STAGGERED_HOLD = 0.1;

const DEFAULTS: Required<ShuttersScroll> = {
  type: 'ShuttersScroll',
  direction: 'right',
  range: 'in',
  shutters: 12,
  staggered: true,
};

export const schema = {
  direction: { type: 'enum', values: FOUR_DIRECTIONS, default: DEFAULTS.direction },
  range: { type: 'enum', values: SCROLL_RANGES, default: DEFAULTS.range },
  shutters: { type: 'number', min: 1, int: true, default: DEFAULTS.shutters },
  staggered: { type: 'bool', default: DEFAULTS.staggered },
};

function toPolygon(rects: number[][], fillRule: string) {
  const points = rects.flatMap(([x, y, w, h]) =>
    [
      [x, y],
      [x + w, y],
      [x + w, y + h],
      [x, y + h],
      [x, y],
    ].map(([px, py]) => `${px}% ${py}%`),
  );
  return `polygon(${fillRule}, ${points.join(', ')})`;
}

// strips at every shutter line, growing from zero size against the direction (staggered - growing by their order)
// continuous shifts the strips a shutter back and doubles their size, so evenodd clips each by its neighbor
function getShuttersClipPaths(
  direction: EffectFourDirections,
  shutters: number,
  staggered: boolean,
  continuous: boolean,
) {
  const vertical = direction === 'top' || direction === 'bottom' ? 1 : 0;
  const fromSign = direction === 'top' || direction === 'left' ? 1 : -1;
  const toSign = continuous ? -fromSign : 0;
  const stagger = staggered ? 1 : 0;

  const toRect = (x: number, y: number, shortSide: number) => [
    x,
    y,
    (vertical + (1 - vertical) * shortSide) * 100,
    (1 - vertical + vertical * shortSide) * 100,
  ];

  const start: number[][] = [];
  const end: number[][] = [];
  const opposite: number[][] = [];
  for (let i = 0; i <= shutters; i++) {
    const offset = (i - toSign) / shutters;
    const x = (1 - vertical) * offset * 100;
    const y = vertical * offset * 100;
    start.push(toRect(x, y, 0));

    const factor = ((1 - fromSign) * i + (1 + fromSign) * (shutters - i)) / (2 * shutters);
    end.push(
      toRect(
        x,
        y,
        (toSign - fromSign) / shutters - stagger * fromSign * factor * (factor + 1 / shutters),
      ),
    );

    const oppositeFactor = 1 - factor;
    opposite.push(
      toRect(
        x,
        y,
        fromSign / shutters + fromSign * oppositeFactor * (oppositeFactor + 1 / shutters),
      ),
    );
  }

  const fillRule = toSign ? 'evenodd' : 'nonzero';
  const middle = start.map((rect, i) => rect.map((value, j) => (value + end[i][j]) / 2));

  return {
    clipStart: toPolygon(start, fillRule),
    clipEnd: toPolygon(end, fillRule),
    clipMiddle: toPolygon(middle, fillRule),
    clipOpposite: toPolygon(opposite, fillRule),
  };
}

export function getNames(options: ScrubAnimationOptions) {
  const { range = DEFAULTS.range, staggered = DEFAULTS.staggered } =
    options.namedEffect as ShuttersScroll;
  const continuous = range === 'continuous' ? `-continuous${staggered ? '-staggered' : ''}` : '';
  return suffixNames([`motion-shuttersScroll-${continuous}`], options.suffix);
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as ShuttersScroll;
  const direction = parseKeywordLazy(namedEffect?.direction, FOUR_DIRECTIONS, DEFAULTS.direction);
  const {
    shutters = DEFAULTS.shutters,
    staggered = DEFAULTS.staggered,
    range = DEFAULTS.range,
  } = namedEffect;
  const fill = getScrollFill(options, range);
  const offsets = completeScrollOffsets(options as ScrubAnimationOptions, range);
  const isContinuous = range === 'continuous';

  const { clipStart, clipEnd, clipMiddle, clipOpposite } = getShuttersClipPaths(
    range === 'out' ? getOppositeDirection([...FOUR_DIRECTIONS], direction) : direction,
    shutters,
    staggered,
    isContinuous && !staggered,
  );

  const custom = {
    '--motion-shutters-clip-start': range === 'out' ? clipEnd : clipStart,
    '--motion-shutters-clip-end': range === 'out' ? clipStart : clipEnd,
    ...(isContinuous &&
      (staggered
        ? { '--motion-shutters-clip-opp': clipOpposite }
        : { '--motion-shutters-clip-middle': clipMiddle })),
  };

  const [shuttersScroll] = getNames(options);

  const clip = (name: string) => toKeyframeValue(custom, `--motion-shutters-clip-${name}`, asWeb);
  const sineOut = getEasing('sineOut');
  const keyframes: {
    clipPath: string | number;
    easing?: string;
    offset?: number;
  }[] = [
    { clipPath: clip('start'), easing: range === 'in' ? getEasing('sineIn') : sineOut },
    { clipPath: clip('end') },
  ];

  if (isContinuous && staggered) {
    const move = (1 - CONTINUOUS_STAGGERED_HOLD) / 2;
    keyframes[1].offset = move;
    keyframes.push(
      { clipPath: clip('opp'), offset: 1 - move, easing: sineOut },
      { clipPath: clip('start') },
    );
  } else if (isContinuous) {
    const move = (1 - CONTINUOUS_HOLD) / 2;
    keyframes.splice(
      1,
      0,
      { clipPath: clip('middle'), offset: move },
      { clipPath: clip('middle'), offset: 1 - move, easing: sineOut },
    );
  }

  const animations = [
    {
      ...options,
      name: shuttersScroll,
      fill,
      ...offsets,
      easing: 'linear',
      custom,
      keyframes,
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}
