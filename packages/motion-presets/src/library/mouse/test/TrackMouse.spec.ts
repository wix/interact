import { describe, expect, test } from 'vitest';

import createTrackMouse from '../TrackMouse';
import type { TrackMouse as TrackMouseType } from '../../../types';

function getTransform(namedEffect: Record<string, unknown>, x: number, y: number) {
  const target = { style: {} } as HTMLElement;
  const animation = createTrackMouse({
    id: 'test-id',
    namedEffect: { type: 'TrackMouse', ...namedEffect } as TrackMouseType,
  })(target);
  animation.progress({ x, y });
  return target.style.transform;
}

describe('TrackMouse', () => {
  test('numeric distance', () => {
    expect(getTransform({ distance: { value: 100, unit: 'px' } }, 0, 0.75)).toBe(
      'translateX(-100px) translateY(50px) rotate(var(--motion-rotate, 0deg))',
    );
  });

  test('default distance', () => {
    expect(getTransform({ inverted: true }, 0.25, 1)).toBe(
      'translateX(100px) translateY(-200px) rotate(var(--motion-rotate, 0deg))',
    );
  });

  test('calc() distance', () => {
    expect(getTransform({ distance: 'calc(10vh + 20px)', inverted: true }, 0, 0.75)).toBe(
      'translateX(calc(1 * calc(10vh + 20px))) translateY(calc(-0.5 * calc(10vh + 20px))) rotate(var(--motion-rotate, 0deg))',
    );
  });

  test('calc() distance with axis', () => {
    expect(getTransform({ distance: 'calc(10vh + 20px)', axis: 'horizontal' }, 0.75, 0)).toBe(
      'translateX(calc(0.5 * calc(10vh + 20px))) translateY(calc(0 * calc(10vh + 20px))) rotate(var(--motion-rotate, 0deg))',
    );
  });
});
