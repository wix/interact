export const EFFECTS_TARGET_IDS = {
  namedWaapi: 'named-waapi-target',
  namedCss: 'named-css-target',
  keyframeWaapi: 'keyframe-waapi-target',
  keyframeCss: 'keyframe-css-target',
  customEffect: 'custom-effect-target',
  playback: 'playback-target',
} as const;

export const EFFECTS_TEST_IDS = {
  playbackStateDisplay: 'playback-state-display',
} as const;

export const EFFECTS_NAMES = {
  namedCssEffectType: 'TestScale',
  namedCssKeyframeName: 'test-scale',
  keyframeCssName: 'kf-rotate',
  keyframeWaapiName: 'kf-slide',
  playbackName: 'playback-test',
} as const;
