export const SCROLL_IDS = {
  viewProgressTarget: 'view-progress-target',
  scrubSceneTarget: 'scrub-scene-target',
  nativeCustomTarget: 'native-custom-target',
  scrubCard1: 'scrub-card-1',
  scrubCard2: 'scrub-card-2',
  scrubCard3: 'scrub-card-3',
} as const;

export const SCROLL_TEST_IDS = {
  viewProgressTarget: 'view-progress-target',
  scrubSceneTarget: 'scrub-scene-target',
  nativeCustomTarget: 'native-custom-target',
  scrubCard1: 'scrub-card-1',
  progressDisplay: 'progress-display',
} as const;

export const SCROLL_SELECTORS = {
  viewProgressTarget: `[data-testid="${SCROLL_TEST_IDS.viewProgressTarget}"]`,
  scrubSceneTarget: `[data-testid="${SCROLL_TEST_IDS.scrubSceneTarget}"]`,
  nativeCustomTarget: `[data-testid="${SCROLL_TEST_IDS.nativeCustomTarget}"]`,
  scrubCard1: `[data-testid="${SCROLL_TEST_IDS.scrubCard1}"]`,
} as const;
