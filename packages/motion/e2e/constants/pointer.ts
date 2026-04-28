export const POINTER_IDS = {
  area: 'pointer-area',
  yAxisArea: 'y-axis-area',
  compositeArea: 'composite-area',
  namedArea: 'named-area',
  customArea: 'custom-area',
  xAxisTarget: 'x-axis-target',
  yAxisTarget: 'y-axis-target',
  compositeTarget: 'composite-target',
  namedTarget: 'named-target',
  customTarget: 'custom-target',
} as const;

export const POINTER_TEST_IDS = {
  area: 'pointer-area',
  yAxisArea: 'y-axis-area',
  compositeArea: 'composite-area',
  namedArea: 'named-area',
  customArea: 'custom-area',
  progressDisplay: 'pointer-progress-display',
} as const;

export const POINTER_SELECTORS = {
  area: `[data-testid="${POINTER_TEST_IDS.area}"]`,
  yAxisArea: `[data-testid="${POINTER_TEST_IDS.yAxisArea}"]`,
  compositeArea: `[data-testid="${POINTER_TEST_IDS.compositeArea}"]`,
  namedArea: `[data-testid="${POINTER_TEST_IDS.namedArea}"]`,
  customArea: `[data-testid="${POINTER_TEST_IDS.customArea}"]`,
} as const;
