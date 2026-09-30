import { toKeyframeValue } from './utils';

export const MOTION_BLUR_NAME = 'motion-blur';
export const MOTION_FADE_NAME = 'motion-fade';

// a single keyframe - the animation ends at the element's own opacity
export function getMotionFade(
  params: {
    opacity?: number;
  },
  asWeb: boolean = false,
  suffix: string = '',
) {
  const { opacity = 0 } = params;
  const custom = {
    [`--motion-opacity${suffix}`]: opacity,
  };
  const opacity_ = toKeyframeValue(custom, `--motion-opacity${suffix}`, asWeb, '0');

  return {
    name: `${MOTION_FADE_NAME}${suffix}`,
    custom,
    keyframes: [{ offset: 0, opacity: opacity_ }],
  };
}

export function getMotionBlur(
  params: {
    blur?: number;
  },
  asWeb: boolean = false,
  suffix: string = '',
) {
  const { blur = 0 } = params;
  const custom = {
    [`--motion-blur${suffix}`]: `${blur}px`,
  };
  const blur_ = toKeyframeValue(custom, `--motion-blur${suffix}`, asWeb, '0px');

  return {
    name: `${MOTION_BLUR_NAME}${suffix}`,
    composite: 'add' as const,
    custom,
    keyframes: [{ filter: `blur(${blur_})` }, { filter: `blur(0px)` }],
  };
}
