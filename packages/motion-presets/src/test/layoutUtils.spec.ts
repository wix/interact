import { describe, expect, test } from 'vitest';

import type { Layout } from '../layoutUtils';
import {
  getOffscreenDistance,
  getOffscreenTravel,
  getOffscreenTravels,
  getOppositeDirection,
  measureLayout,
} from '../layoutUtils';

function fakeDom(target: HTMLElement) {
  return {
    measure: (fn: (target: HTMLElement) => void) => fn(target),
    mutate: (fn: (target: HTMLElement) => void) => fn(target),
  } as any;
}

function define(element: HTMLElement, props: Record<string, unknown>) {
  Object.entries(props).forEach(([key, value]) =>
    Object.defineProperty(element, key, { value, configurable: true }),
  );
}

function createTarget() {
  const parent = document.createElement('div');
  const target = document.createElement('div');
  parent.append(target);
  define(parent, {
    offsetWidth: 800,
    offsetHeight: 600,
    offsetLeft: 0,
    offsetTop: 0,
    offsetParent: null,
  });
  define(target, {
    offsetWidth: 100,
    offsetHeight: 50,
    offsetLeft: 30,
    offsetTop: 40,
    offsetParent: parent,
  });
  target.getBoundingClientRect = () => ({ left: 130, top: 140, width: 120, height: 70 }) as DOMRect;
  return target;
}

describe('measureLayout', () => {
  test('returns an unmeasured layout without a dom', () => {
    expect(measureLayout()).toEqual({
      measured: false,
      left: 0,
      top: 0,
      width: 0,
      height: 0,
      containerWidth: 0,
      containerHeight: 0,
    });
  });

  test('viewport: position from the bounding rect, size from the layout size', () => {
    const target = createTarget();
    const layout = measureLayout(fakeDom(target));

    expect(layout).toEqual({
      measured: true,
      left: 130,
      top: 140,
      width: 100,
      height: 50,
      containerWidth: window.innerWidth,
      containerHeight: window.innerHeight,
    });
    expect(target.style.getPropertyValue('--motion-left')).toBe('130px');
    expect(target.style.getPropertyValue('--motion-top')).toBe('140px');
    expect(target.style.getPropertyValue('--motion-width')).toBe('100px');
    expect(target.style.getPropertyValue('--motion-height')).toBe('50px');
    expect(target.style.getPropertyValue('--motion-container-width')).toBe('');
    expect(target.style.getPropertyValue('--motion-container-height')).toBe('');
  });

  test('parent: position is the offset within the offset parent, container is its size', () => {
    const target = createTarget();
    const layout = measureLayout(fakeDom(target), 'parent');

    expect(layout).toMatchObject({
      measured: true,
      left: 30,
      top: 40,
      containerWidth: 800,
      containerHeight: 600,
    });
    expect(target.style.getPropertyValue('--motion-left')).toBe('30px');
    expect(target.style.getPropertyValue('--motion-container-width')).toBe('800px');
    expect(target.style.getPropertyValue('--motion-container-height')).toBe('600px');
  });

  test('does not set anything when there is no target', () => {
    const dom = { measure: (fn: any) => fn(null), mutate: (fn: any) => fn(null) } as any;
    expect(measureLayout(dom).measured).toBe(false);
  });
});

describe('getOffscreenTravel', () => {
  test('sides use the measured position with far-enough fallbacks', () => {
    expect(getOffscreenTravel('left')).toBe(
      'calc(var(--motion-left, calc(100vw - 100%)) + var(--motion-width, 100%))',
    );
    expect(getOffscreenTravel('right')).toBe(
      'calc(var(--motion-container-width, 100vw) - var(--motion-left, 0px))',
    );
    expect(getOffscreenTravel('top')).toBe(
      'calc(var(--motion-top, calc(100vh - 100%)) + var(--motion-height, 100%))',
    );
    expect(getOffscreenTravel('bottom')).toBe(
      'calc(var(--motion-container-height, 100vh) - var(--motion-top, 0px))',
    );
  });

  test('corners use the nearer of their sides along the diagonal', () => {
    expect(getOffscreenTravel('top-right')).toBe(
      `calc(min(${getOffscreenTravel('top')}, ${getOffscreenTravel('right')}) * ${Math.SQRT2})`,
    );
  });
});

describe('getOffscreenTravels', () => {
  test('travel comes from the opposite side, toTravel goes to the direction side', () => {
    expect(getOffscreenTravels('right')).toEqual({
      travel: getOffscreenTravel('left'),
      toTravel: getOffscreenTravel('right'),
    });
    expect(getOffscreenTravels('bottom-left')).toEqual({
      travel: getOffscreenTravel('top-right'),
      toTravel: getOffscreenTravel('bottom-left'),
    });
  });
});

describe('getOffscreenDistance', () => {
  const layout: Layout = {
    measured: true,
    left: 100,
    top: 50,
    width: 40,
    height: 20,
    containerWidth: 800,
    containerHeight: 600,
  };

  test('sides', () => {
    expect(getOffscreenDistance(layout, 'left')).toBe(140);
    expect(getOffscreenDistance(layout, 'right')).toBe(700);
    expect(getOffscreenDistance(layout, 'top')).toBe(70);
    expect(getOffscreenDistance(layout, 'bottom')).toBe(550);
  });

  test('corners use the nearer side along the diagonal', () => {
    expect(getOffscreenDistance(layout, 'top-left')).toBeCloseTo(70 * Math.SQRT2);
    expect(getOffscreenDistance(layout, 'bottom-right')).toBeCloseTo(550 * Math.SQRT2);
  });
});

describe('getOppositeDirection', () => {
  test('sides and corners', () => {
    expect(getOppositeDirection('top')).toBe('bottom');
    expect(getOppositeDirection('left')).toBe('right');
    expect(getOppositeDirection('top-left')).toBe('bottom-right');
    expect(getOppositeDirection('bottom-left')).toBe('top-right');
  });
});
