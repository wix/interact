import { describe, expect, test } from 'vitest';
import * as TurnIn from '../TurnIn';
import { layer, run } from './testUtils';

describe('TurnIn', () => {
  test.each([
    ['top-left', -1, '-50%', '-50%'],
    ['bottom-left', -1, '-50%', '50%'],
    ['top-right', 1, '50%', '-50%'],
    ['bottom-right', 1, '50%', '50%'],
  ])('%s pivot turns from the top around its corner', (pivot, from, x, y) => {
    const { custom } = layer(run(TurnIn, { pivot }), 'motion-trans-rot');
    expect(custom['--motion-trans-rot-from']).toBe(from);
    expect(custom['--motion-trans-rot-origin-x']).toBe(x);
    expect(custom['--motion-trans-rot-origin-y']).toBe(y);
    expect(custom['--motion-trans-rot-angle']).toBe('50deg');
  });

  test('defaults to the top-left pivot', () => {
    expect(layer(run(TurnIn), 'motion-trans-rot').custom['--motion-trans-rot-origin-x']).toBe(
      '-50%',
    );
  });
});
