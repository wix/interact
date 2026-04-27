import type { Shape, ShapeIn, TimeAnimationOptions } from '../../types';
import { toKeyframeValue } from '../../utils';

export function getNames(_: TimeAnimationOptions) {
  return ['motion-fadeIn', 'motion-shapeIn'];
}

const shapes: Record<Shape, { start: string; end: string }> = {
  diamond: {
    start: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)',
    end: 'polygon(50% -50%, 150% 50%, 50% 150%, -50% 50%)',
  },
  window: {
    start: 'inset(50% round 50% 50% 0% 0%)',
    end: 'inset(-20% round 50% 50% 0% 0%)',
  },
  rectangle: { start: 'inset(50%)', end: 'inset(0%)' },
  circle: { start: 'circle(0%)', end: 'circle(75%)' },
  ellipse: { start: 'ellipse(0% 0%)', end: 'ellipse(75% 75%)' },
};

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const { shape = 'rectangle' } = options.namedEffect as ShapeIn;
  const [fadeIn, shapeIn] = getNames(options);
  const easing = options.easing || 'cubicInOut';

  const { start, end } = shapes[shape];

  const custom = {
    '--motion-shape-start': start,
    '--motion-shape-end': end,
  };

  return [
    {
      ...options,
      name: fadeIn,
      easing: 'quadOut',
      duration: options.duration! * 0.8,
      custom: {},
      keyframes: [{ offset: 0, opacity: 0 }],
    },
    {
      ...options,
      name: shapeIn,
      easing,
      custom,
      keyframes: [
        {
          clipPath: toKeyframeValue(custom, '--motion-shape-start', asWeb),
        },
        {
          clipPath: toKeyframeValue(custom, '--motion-shape-end', asWeb),
        },
      ],
    },
  ];
}
