const FOUR_DIRECTIONS = ['top', 'right', 'bottom', 'left'] as const;
const AXIS_DIRECTIONS = ['horizontal', 'vertical'] as const;
const SCROLL_RANGES = ['in', 'out', 'continuous'] as const;
const SPIN_DIRECTIONS = ['clockwise', 'counter-clockwise'] as const;
const TWO_SIDES_DIRECTIONS = ['left', 'right'] as const;
const EIGHT_DIRECTIONS = [
  'top',
  'right',
  'bottom',
  'left',
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
] as const;
const NINE_DIRECTIONS = [
  'top',
  'top-right',
  'right',
  'bottom-right',
  'bottom',
  'bottom-left',
  'left',
  'top-left',
  'center',
] as const;
const CENTER_AND_FOUR_DIRECTIONS = ['center', 'top', 'right', 'bottom', 'left'] as const;
const FOUR_CORNERS_DIRECTIONS = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const;
const SHAPES = ['rectangle', 'ellipse', 'circle', 'diamond', 'window'] as const;

export {
  CENTER_AND_FOUR_DIRECTIONS,
  FOUR_DIRECTIONS,
  AXIS_DIRECTIONS,
  SCROLL_RANGES,
  SPIN_DIRECTIONS,
  TWO_SIDES_DIRECTIONS,
  EIGHT_DIRECTIONS,
  NINE_DIRECTIONS,
  FOUR_CORNERS_DIRECTIONS,
  SHAPES,
};
