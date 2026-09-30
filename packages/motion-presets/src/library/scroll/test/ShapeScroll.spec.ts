import { describe, expect, test } from 'vitest';
import * as ShapeScroll from '../ShapeScroll';
import { getEasing } from '../../../utils';
import { mirrorEasing } from '../../../easingUtils';
import { scrollOptions } from './testUtils';

const shapeOf = (namedEffect: Record<string, unknown>) =>
  ShapeScroll.style(scrollOptions({ type: 'ShapeScroll', ...namedEffect }), true)[0] as any;

describe('ShapeScroll', () => {
  test('uses circInOut on both in and out', () => {
    expect(shapeOf({ range: 'in' }).easing).toBe(getEasing('circInOut'));
    expect(shapeOf({ range: 'out' }).easing).toBe(mirrorEasing('circInOut'));
  });

  test('starts the shape from `start`', () => {
    expect(shapeOf({ start: 0.3 }).custom['--motion-shape-from']).toBe(0.3);
  });
});
