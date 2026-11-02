import { describe, expect, test } from 'vitest';

import * as mouse from '..';
import type { MouseAnimation, Progress } from '../../../types';

const CENTER: Progress = { x: 0.5, y: 0.5, v: { x: 0, y: 0 }, active: true };

function transformAt(namedEffect: MouseAnimation, progress: Partial<Progress>) {
  const target = document.createElement('div');
  const create = mouse[namedEffect.type] as unknown as (
    options: object,
  ) => (target: HTMLElement) => { progress(p: Progress): void };
  create({ namedEffect })(target).progress({ ...CENTER, ...progress });
  return target.style.transform;
}

describe('mouse presets', () => {
  test.each(Object.entries(mouse))('%s exposes its schema on the factory', (_, preset) => {
    expect(typeof preset).toBe('function');
    expect(preset.schema).toBeTypeOf('object');
  });

  test.each([
    [{ value: 200, unit: 'px' }, '200px'],
    ['2em', '2em'],
    [50, '50px'],
    ['calc(10px + 5%)', 'calc(10px + 5%)'],
  ])('TrackMouse travel %j', (travel, length) => {
    expect(transformAt({ type: 'TrackMouse', travel }, { x: 1, y: 0.25 })).toBe(
      `translateX(calc(${length} * 1)) translateY(calc(${length} * -0.5)) rotate(var(--motion-rotate, 0deg))`,
    );
  });

  test('TrackMouse direction limits the movement', () => {
    expect(transformAt({ type: 'TrackMouse', direction: 'horizontal' }, { x: 1, y: 1 })).toBe(
      'translateX(calc(200px * 1)) translateY(calc(200px * 0)) rotate(var(--motion-rotate, 0deg))',
    );
  });

  test('BounceMouse passes its travel to TrackMouse', () => {
    expect(transformAt({ type: 'BounceMouse' }, { x: 0 })).toBe(
      'translateX(calc(80px * -1)) translateY(calc(80px * 0)) rotate(var(--motion-rotate, 0deg))',
    );
  });

  test.each([
    ['center-horizontal', { x: 1 }, 'rotateY(5deg)'],
    ['center-vertical', { y: 1 }, 'rotateX(-5deg)'],
    ['top', { y: 1 }, 'translateY(-50%) rotateX(-5deg)'],
  ] as const)('SwivelMouse pivot %s', (pivot, progress, expected) => {
    expect(transformAt({ type: 'SwivelMouse', pivot }, progress)).toContain(expected);
  });
});
