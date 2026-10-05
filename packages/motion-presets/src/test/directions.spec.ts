import { describe, expect, test } from 'vitest';

import { angleDirection, axisDirection, sideDirection, spinDirection } from '../directions';

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
