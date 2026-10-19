import type {
  AnimationFillMode,
  DomApi,
  ScrubAnimationOptions,
  ShapeScroll,
  ShapeType,
} from '../../types';
import { toKeyframeValue, getEasing } from '../../utils';
import { SCROLL_RANGES, SHAPES } from '../../consts';

export const schema = {
  range: { type: 'enum', values: SCROLL_RANGES, default: 'in' },
  shape: { type: 'enum', values: SHAPES, default: 'circle' },
  start: { type: 'number', min: 0, max: 1, default: 0.5 },
} as const;

const RESPONSIVE_SHAPES_MAP: Record<
  ShapeType,
  (clipFactor: number) => [string, string] | string[]
> = {
  diamond: (clipFactor: number) => {
    const clip = clipFactor / 2;
    const clipNeg = 100 - clip;
    return [
      `polygon(50% ${clip}%, ${clipNeg}% 50%, 50% ${clipNeg}%, ${clip}% 50%)`,
      'polygon(50% -50%, 150% 50%, 50% 150%, -50% 50%)',
    ];
  },
  window: (clipFactor: number) => [
    `inset(${clipFactor / 2}% round 50% 50% 0% 0%)`,
    'inset(-20% round 50% 50% 0% 0%)',
  ],
  rectangle: (clipFactor: number) => [`inset(${clipFactor}%)`, `inset(0%)`],
  circle: (clipFactor: number) => [`circle(${100 - clipFactor}%)`, `circle(75%)`],
  ellipse: (clipFactor: number) => {
    const clip = 50 - clipFactor / 2;
    return [`ellipse(${clip}% ${clip}%)`, `ellipse(75% 75%)`];
  },
};

export function getNames(options: ScrubAnimationOptions) {
  const { range = schema.range.default } = options.namedEffect as ShapeScroll;
  const { suffix = '' } = options;
  return [`motion-shapeScroll${range === 'continuous' ? '-continuous' : ''}${suffix}`];
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const { start: startOpen = schema.start.default, range = schema.range.default } =
    options.namedEffect as ShapeScroll;
  let { shape = schema.shape.default } = options.namedEffect as ShapeScroll;
  if (!(shape in RESPONSIVE_SHAPES_MAP)) {
    shape = schema.shape.default;
  }

  const fill = (
    range === 'out' ? 'forwards' : range === 'in' ? 'backwards' : options.fill
  ) as AnimationFillMode;

  const [start, end] = RESPONSIVE_SHAPES_MAP[shape]((1 - startOpen) * 100);

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

  return [
    {
      ...options,
      name: shapeScroll,
      fill,
      easing: 'linear',
      custom,
      keyframes,
    },
  ];
}
