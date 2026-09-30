import { describe, expect, test } from 'vitest';
import * as FoldIn from '../FoldIn';
import { layer, run } from './testUtils';

describe('FoldIn', () => {
  test.each([
    [undefined, -1, '90deg', '0deg', '0px', '-50%'],
    ['left', -1, '0deg', '-90deg', '-50%', '0px'],
    ['bottom', 1, '90deg', '0deg', '0px', '50%'],
  ])('%s pivot folds in from its side', (pivot, from, x, y, originX, originY) => {
    const { custom } = layer(run(FoldIn, pivot ? { pivot } : {}), 'motion-3d-transform');
    expect(custom['--motion-transform-3d-from']).toBe(from);
    expect(custom['--motion-transform-3d-angle-x']).toBe(x);
    expect(custom['--motion-transform-3d-angle-y']).toBe(y);
    expect(custom['--motion-transform-3d-origin-x']).toBe(originX);
    expect(custom['--motion-transform-3d-origin-y']).toBe(originY);
  });
});
