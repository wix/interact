import { suffixLayer, toKeyframeValue } from './utils';

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
    [`--motion-opacity`]: opacity,
  };
  const opacity_ = toKeyframeValue(custom, `--motion-opacity`, asWeb, '0');

  return suffixLayer(
    {
      name: `${MOTION_FADE_NAME}`,
      custom,
      keyframes: [{ offset: 0, opacity: opacity_ }],
    },
    suffix,
  );
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
    [`--motion-blur`]: `${blur}px`,
  };
  const blur_ = toKeyframeValue(custom, `--motion-blur`, asWeb, '0px');

  return suffixLayer(
    {
      name: `${MOTION_BLUR_NAME}`,
      composite: 'add' as const,
      custom,
      keyframes: [{ filter: `blur(${blur_})` }, { filter: `blur(0px)` }],
    },
    suffix,
  );
}
