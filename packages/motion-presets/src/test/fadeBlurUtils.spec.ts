import { describe, expect, test } from 'vitest';

import { MOTION_BLUR_NAME, MOTION_FADE_NAME, getMotionBlur, getMotionFade } from '../fadeBlurUtils';

describe('getMotionFade', () => {
  for (const asWeb of [false, true]) {
    test(`asWeb=${asWeb}`, () => {
      expect(getMotionFade({ opacity: 0.2 }, asWeb, '-s')).toMatchSnapshot();
    });
  }

  test('a single keyframe from the opacity, defaulting to 0', () => {
    const data = getMotionFade({}, true, '-s');
    expect(data.name).toBe(`${MOTION_FADE_NAME}-s`);
    expect(data.keyframes).toEqual([{ offset: 0, opacity: 0 }]);
    expect(getMotionFade({}, false).keyframes).toEqual([
      { offset: 0, opacity: 'var(--motion-opacity, 0)' },
    ]);
  });
});

describe('getMotionBlur', () => {
  for (const asWeb of [false, true]) {
    test(`asWeb=${asWeb}`, () => {
      expect(getMotionBlur({ blur: 8 }, asWeb, '-s')).toMatchSnapshot();
    });
  }

  test('added on top, from the blur to none', () => {
    const data = getMotionBlur({ blur: 8 }, true, '-s');
    expect(data.name).toBe(`${MOTION_BLUR_NAME}-s`);
    expect(data.composite).toBe('add');
    expect(data.keyframes).toEqual([{ filter: 'blur(8px)' }, { filter: 'blur(0px)' }]);
  });
});
