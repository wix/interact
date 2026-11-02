import { describe, expect, test } from 'vitest';

import {
  angleDirection,
  axisDirection,
  sideDirection,
  spinDirection,
  toMotionRange,
} from '../directions';

describe('opposite', () => {
  test('axis keeps its direction', () => {
    expect(axisDirection.opposite('vertical')).toBe('vertical');
  });

  test('spin swaps', () => {
    expect(spinDirection.opposite('clockwise')).toBe('counter-clockwise');
    expect(spinDirection.opposite('counter-clockwise')).toBe('clockwise');
  });

  test('four-sides uses the opposite side', () => {
    expect(sideDirection.opposite('top')).toBe('bottom');
    expect(sideDirection.opposite('left')).toBe('right');
  });

  test('angle uses the opposite side or turns the angle around', () => {
    expect(angleDirection.opposite('right')).toBe('left');
    expect(angleDirection.opposite('45deg')).toBe('calc(180deg + 45deg)');
    expect(angleDirection.opposite('calc(10deg + 5deg)')).toBe('calc(180deg + (10deg + 5deg))');
  });
});

describe('parse', () => {
  test('keywords, falling back to the given or the kind default', () => {
    expect(sideDirection.parse(' Top ')).toBe('top');
    expect(sideDirection.parse('nope', 'bottom')).toBe('bottom');
    expect(sideDirection.parse(undefined)).toBe('right');
    expect(axisDirection.parse(undefined)).toBe('vertical');
    expect(spinDirection.parse('nope')).toBe('clockwise');
  });

  test('angles accept side keywords, numbers and css angles', () => {
    expect(angleDirection.parse('left')).toBe('left');
    expect(angleDirection.parse(45)).toBe('45deg');
    expect(angleDirection.parse('30')).toBe('30deg');
    expect(angleDirection.parse('0.5turn')).toBe('0.5turn');
    expect(angleDirection.parse('calc(10deg + 5deg)')).toBe('calc(10deg + 5deg)');
    expect(angleDirection.parse('nope', 90)).toBe('90deg');
  });
});

describe('toMotionRange', () => {
  test('a side moves away from it, along its axis', () => {
    expect(toMotionRange(sideDirection, 'left', 'in')).toEqual({
      fromSign: 1,
      toSign: 0,
      vertical: false,
      movementAngle: '0deg',
    });
    expect(toMotionRange(sideDirection, 'bottom', 'in')).toEqual({
      fromSign: -1,
      toSign: 0,
      vertical: true,
      movementAngle: '90deg',
    });
  });

  test('continuous ends at the opposite sign', () => {
    expect(toMotionRange(sideDirection, 'right', 'continuous')).toMatchObject({
      fromSign: -1,
      toSign: 1,
    });
    expect(toMotionRange(sideDirection, 'left', 'continuous')).toMatchObject({
      fromSign: 1,
      toSign: -1,
    });
  });

  test('axes, spins and angles', () => {
    expect(toMotionRange(axisDirection, 'horizontal', 'in')).toMatchObject({
      vertical: false,
      movementAngle: '0deg',
    });
    expect(toMotionRange(spinDirection, 'counter-clockwise', 'in')).toEqual({
      fromSign: 1,
      toSign: 0,
      vertical: false,
      movementAngle: '0deg',
    });
    expect(toMotionRange(angleDirection, '45deg', 'in')).toMatchObject({
      fromSign: -1,
      movementAngle: '45deg',
    });
  });
});
