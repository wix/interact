import type { DomApi, ScrubAnimationOptions, ShapeScroll, ShapeType } from '../../types';
import {
  toKeyframeValue,
  getEasing,
  parseKeywordLazy,
  suffixNames,
  suffixCustomProperties,
  getScrollFill,
  completeScrollOffsets,
} from '../../utils';
import { SCROLL_RANGES, SHAPES } from '../../consts';

const DEFAULTS: Required<ShapeScroll> = {
  type: 'ShapeScroll',
  range: 'in',
  shape: 'circle',
  start: 0.5,
};

export const schema = {
  range: { type: 'enum', values: SCROLL_RANGES, default: DEFAULTS.range },
  shape: { type: 'enum', values: SHAPES, default: DEFAULTS.shape },
  start: { type: 'number', min: 0, max: 1, default: DEFAULTS.start },
};

const RESPONSIVE_SHAPES_MAP: Record<ShapeType, (start: number) => [string, string]> = {
  diamond: (start: number) => {
    const clip = 50 - 100 * start;
    const clipNeg = 100 - clip;
    return [
      `polygon(50% ${clip}%, ${clipNeg}% 50%, 50% ${clipNeg}%, ${clip}% 50%)`,
      'polygon(50% -50%, 150% 50%, 50% 150%, -50% 50%)',
    ];
  },
  window: (start: number) => [
    `inset(${50 - 70 * start}% round 50% 50% 0% 0%)`,
    'inset(-20% round 50% 50% 0% 0%)',
  ],
  rectangle: (start: number) => [`inset(${50 * (1 - start)}%)`, `inset(0%)`],
  circle: (start: number) => [`circle(${75 * start}%)`, `circle(75%)`],
  ellipse: (start: number) => [`ellipse(${75 * start}% ${75 * start}%)`, `ellipse(75% 75%)`],
};

export function getNames(options: ScrubAnimationOptions) {
  const { range = DEFAULTS.range } = options.namedEffect as ShapeScroll;
  return suffixNames(
    [`motion-shapeScroll${range === 'continuous' ? '-continuous' : ''}`],
    options.suffix,
  );
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as ShapeScroll;
  const { start: startFactor = DEFAULTS.start, range = DEFAULTS.range } = namedEffect;
  const shape = parseKeywordLazy(namedEffect.shape, SHAPES, DEFAULTS.shape);
  const fill = getScrollFill(options, range);
  const offsets = completeScrollOffsets(options as ScrubAnimationOptions, range);

  const [start, end] = RESPONSIVE_SHAPES_MAP[shape](startFactor);

  const [shapeScroll] = getNames(options);

  const custom = {
    '--motion-clip-from': range === 'out' ? end : start,
    '--motion-clip-to': range === 'out' ? start : end,
  };

  const easing = getEasing('circInOut');

  const keyframes = [
    {
      clipPath: toKeyframeValue(custom, `--motion-clip-from`, asWeb),
      easing,
    },
    { clipPath: toKeyframeValue(custom, `--motion-clip-to`, asWeb) },
  ];

  if (range === 'continuous') {
    keyframes[1].easing = easing;
    keyframes.push({
      clipPath: toKeyframeValue(custom, `--motion-clip-from`, asWeb),
    });
  }

  const animations = [
    {
      ...options,
      name: shapeScroll,
      fill,
      ...offsets,
      easing: 'linear',
      custom,
      keyframes,
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}
