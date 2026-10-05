import type { EffectFourDirections, EffectSpinDirection, EffectTwoAxes } from './types';
import { AXIS_DIRECTIONS, FOUR_DIRECTIONS, SPIN_DIRECTIONS } from './consts';
import { CSS_CALC_REGEX, parseKeywordLazy, stripCalc } from './utils';

// how a directional preset reads its direction - each kind is its own export, so a preset bundles only its kind
export type DirectionKind<T extends string | number = string> = {
  // sided directions name a side, so entrance and ongoing presets start from the opposite one
  sided: boolean;
  parse(direction: number | string | undefined, defaultDirection?: T): string;
  opposite(direction: string): string;
  // the 2d direction of the motion as a css angle
  movementAngle(direction: string): string;
};

const CSS_ANGLE_REGEX = /^(-?\d*\.?\d+)(deg|rad|grad|turn)$/;

// the axis of each side - the side's sign is MotionRange.fromSign
const DIRECTION_2D_MAP: Record<string, string> = {
  top: '90deg',
  left: '0deg',
  bottom: '90deg',
  right: '0deg',
  vertical: '90deg',
  horizontal: '0deg',
};

const toMovementAngle = (direction: string) => DIRECTION_2D_MAP[direction] || direction;

const oppositeSide = (side: string) =>
  FOUR_DIRECTIONS[(FOUR_DIRECTIONS.findIndex((d) => d === side) + 2) % 4];

function parseDirectionAngle(direction: number | string | undefined, defaultValue: number) {
  if (typeof direction === 'number') {
    return `${direction}deg`;
  }

  if (typeof direction === 'string') {
    const trimmed = direction.trim().toLowerCase();
    if (CSS_ANGLE_REGEX.test(trimmed) || CSS_CALC_REGEX.test(trimmed)) {
      return trimmed;
    }
    if (trimmed && !isNaN(Number(trimmed))) {
      return `${Number(trimmed)}deg`;
    }
  }

  return `${defaultValue}deg`;
}

export const axisDirection: DirectionKind<EffectTwoAxes> = {
  sided: false,
  parse: (direction, defaultDirection) =>
    parseKeywordLazy(direction, AXIS_DIRECTIONS, defaultDirection || 'vertical'),
  opposite: (direction) => direction,
  movementAngle: toMovementAngle,
};

export const spinDirection: DirectionKind<EffectSpinDirection> = {
  sided: false,
  parse: (direction, defaultDirection) =>
    parseKeywordLazy(direction, SPIN_DIRECTIONS, defaultDirection || 'clockwise'),
  opposite: (direction) =>
    SPIN_DIRECTIONS[(SPIN_DIRECTIONS.findIndex((d) => d === direction) + 1) % 2],
  movementAngle: () => '0deg',
};

export const sideDirection: DirectionKind<EffectFourDirections> = {
  sided: true,
  parse: (direction, defaultDirection) =>
    parseKeywordLazy(direction, FOUR_DIRECTIONS, defaultDirection || 'right'),
  opposite: oppositeSide,
  movementAngle: toMovementAngle,
};

// a side keyword or a css angle
export const angleDirection: DirectionKind<number> = {
  sided: true,
  parse: (direction, defaultDirection) =>
    parseKeywordLazy(direction, FOUR_DIRECTIONS, '') ||
    parseDirectionAngle(direction, defaultDirection || 0),
  opposite: (direction) =>
    FOUR_DIRECTIONS.some((side) => side === direction)
      ? oppositeSide(direction)
      : `calc(180deg + ${stripCalc(direction)})`,
  movementAngle: toMovementAngle,
};
