import type {
  AnimationFillMode,
  DomApi,
  ScrubAnimationOptions,
  ShapeScroll,
  ShapeType,
} from '../../types';
import { toKeyframeValue, getEasing, suffixNames, suffixCustomProperties } from '../../utils';
import { SCROLL_RANGES, SHAPES } from '../../consts';

const DEFAULTS: Required<ShapeScroll> = {
  type: 'ShapeScroll',
  range: 'in',
  shape: 'circle',
  start: 0.667,
};

export const schema = {
  range: { type: 'enum', values: SCROLL_RANGES, default: DEFAULTS.range },
  shape: { type: 'enum', values: SHAPES, default: DEFAULTS.shape },
  start: { type: 'number', min: 0, max: 1, default: DEFAULTS.start },
};

const lerpPercentage = (from: number, to: number, factor: number) =>
  `${from + (to - from) * factor}%`;

// each shape from fully clipped (0) to fully revealed (1)
const SHAPES_MAP: Record<ShapeType, (factor: number) => string> = {
  diamond: (factor) => {
    const minPoint = lerpPercentage(50, -50, factor);
    const maxPoint = lerpPercentage(50, 150, factor);
    return `polygon(50% ${minPoint}, ${maxPoint} 50%, 50% ${maxPoint}, ${minPoint} 50%)`;
  },
  window: (factor) => `inset(${lerpPercentage(50, -20, factor)} round 50% 50% 0% 0%)`,
  rectangle: (factor) => `inset(${lerpPercentage(50, 0, factor)})`,
  circle: (factor) => `circle(${lerpPercentage(0, 75, factor)})`,
  ellipse: (factor) => `ellipse(${lerpPercentage(0, 75, factor)} ${lerpPercentage(0, 75, factor)})`,
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
  const { start = DEFAULTS.start, range = DEFAULTS.range } = options.namedEffect as ShapeScroll;
  let { shape = DEFAULTS.shape } = options.namedEffect as ShapeScroll;
  if (!(shape in SHAPES_MAP)) {
    shape = DEFAULTS.shape;
  }

  const fill = (
    range === 'out' ? 'forwards' : range === 'in' ? 'backwards' : options.fill || 'both'
  ) as AnimationFillMode;

  const [from, to] = [SHAPES_MAP[shape](start), SHAPES_MAP[shape](1)];

  const [shapeScroll] = getNames(options);

  const custom = {
    '--motion-clip-from': range === 'out' ? to : from,
    '--motion-clip-to': range === 'out' ? from : to,
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
      easing: 'linear',
      custom,
      keyframes,
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}
