/**
 * @file Easing functions as defined by Robert Penner.
 * @example A playground I made https://codepen.io/tombigel/pen/eYLLVRg
 */

/**
 * Linear easing function.
 * @param t - The time value (between 0 and 1).
 * @returns The eased value.
 */
export const linear = (t: number) => t;

/**
 * Sine-in easing function.
 * @param t - The time value (between 0 and 1).
 * @returns The eased value.
 */
export const sineIn = (t: number) => 1 - Math.cos((t * Math.PI) / 2);

/**
 * Sine-out easing function.
 * @param t - The time value (between 0 and 1).
 * @returns The eased value.
 */
export const sineOut = (t: number) => Math.sin((t * Math.PI) / 2);

/**
 * Sine-in-out easing function.
 * @param t - The time value (between 0 and 1).
 * @returns The eased value.
 */
export const sineInOut = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

/**
 * Quadratic-in easing function.
 * @param t - The time value (between 0 and 1).
 * @returns The eased value.
 */
export const quadIn = (t: number) => t ** 2;

/**
 * Quadratic-out easing function.
 * @param t - The time value (between 0 and 1).
 * @returns The eased value.
 */
export const quadOut = (t: number) => 1 - (1 - t) ** 2;

/**
 * Quadratic-in-out easing function.
 * @param t - The time value (between 0 and 1).
 * @returns The eased value.
 */
export const quadInOut = (t: number) => (t < 0.5 ? 2 * t ** 2 : 1 - (-2 * t + 2) ** 2 / 2);

/**
 * Cubic-in easing function.
 * @param t - The time value (between 0 and 1).
 * @returns The eased value.
 */
export const cubicIn = (t: number) => t ** 3;

/**
 * Cubic-out easing function.
 * @param t - The time value (between 0 and 1).
 * @returns The eased value.
 */
export const cubicOut = (t: number) => 1 - (1 - t) ** 3;

/**
 * Cubic-in-out easing function.
 * @param t - The time value (between 0 and 1).
 * @returns The eased value.
 */
export const cubicInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * Quartic-in easing function.
 * @param t - The time value (between 0 and 1).
 * @returns The eased value.
 */
export const quartIn = (t: number) => t ** 4;

/**
 * Quartic-out easing function.
 * @param t - The time value (between 0 and 1).
 * @returns The eased value.
 */
export const quartOut = (t: number) => 1 - (1 - t) ** 4;

/**
 * Quartic-in-out easing function.
 * @param t - The time value (between 0 and 1).
 * @returns The eased value.
 */
export const quartInOut = (t: number) => (t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2);

/**
 * Quintic-in easing function.
 * @param t - The time value (between 0 and 1).
 * @returns The eased value.
 */
export const quintIn = (t: number) => t ** 5;

/**
 * Quintic-out easing function.
 * @param t - The time value (between 0 and 1).
 * @returns The eased value.
 */
export const quintOut = (t: number) => 1 - (1 - t) ** 5;

/**
 * Quintic-in-out easing function.
 * @param t - The time value (between 0 and 1).
 * @returns The eased value.
 */
export const quintInOut = (t: number) => (t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2);

/**
 * Exponential-in easing function.
 * @param t - The time value (between 0 and 1).
 * @returns The eased value.
 */
export const expoIn = (t: number) => (t === 0 ? 0 : 2 ** (10 * t - 10));

/**
 * Exponential-out easing function.
 * @param t - The time value (between 0 and 1).
 * @returns The eased value.
 */
export const expoOut = (t: number) => (t === 1 ? 1 : 1 - 2 ** (-10 * t));

/**
 * Exponential-in-out easing function.
 * @param t - The time value (between 0 and 1).
 * @returns The eased value.
 */
export const expoInOut = (t: number) =>
  t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? 2 ** (20 * t - 10) / 2 : (2 - 2 ** (-20 * t + 10)) / 2;

/**
 * Circular-in easing function.
 * @param t - The time value (between 0 and 1).
 * @returns The eased value.
 */
export const circIn = (t: number) => 1 - Math.sqrt(1 - t ** 2);

/**
 * Circular-out easing function.
 * @param t - The time value (between 0 and 1).
 * @returns The eased value.
 */
export const circOut = (t: number) => Math.sqrt(1 - (t - 1) ** 2);

/**
 * Circular-in-out easing function.
 * @param t - The time value (between 0 and 1).
 * @returns The eased value.
 */
export const circInOut = (t: number) =>
  t < 0.5 ? (1 - Math.sqrt(1 - 4 * t ** 2)) / 2 : (Math.sqrt(-(2 * t - 3) * (2 * t - 1)) + 1) / 2;

/**
 * Back-in easing function.
 * @param t - The time value (between 0 and 1).
 * @returns The eased value.
 */
export const backIn = (t: number) => 2.70158 * t ** 3 - 1.70158 * t ** 2;

/**
 * Back-out easing function.
 * @param t - The time value (between 0 and 1).
 * @returns The eased value.
 */
export const backOut = (t: number) => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2;

/**
 * Back-in-out easing function.
 * @param t - The time value (between 0 and 1).
 * @param k - The back factor (optional, default is 1.70158 * 1.525).
 * @returns The eased value.
 */
export const backInOut = (t: number, k = 1.70158 * 1.525) =>
  t < 0.5
    ? ((2 * t) ** 2 * ((k + 1) * 2 * t - k)) / 2
    : ((2 * t - 2) ** 2 * ((k + 1) * (t * 2 - 2) + k) + 2) / 2;

export const jsEasings = {
  linear,
  sineIn,
  sineOut,
  sineInOut,
  quadIn,
  quadOut,
  quadInOut,
  cubicIn,
  cubicOut,
  cubicInOut,
  quartIn,
  quartOut,
  quartInOut,
  quintIn,
  quintOut,
  quintInOut,
  expoIn,
  expoOut,
  expoInOut,
  circIn,
  circOut,
  circInOut,
  backIn,
  backOut,
  backInOut,
};

export type JsEasingName = keyof typeof jsEasings;
export type JsEasing = JsEasingName | (string & {});

/**
 * CSS cubic-bezier easings based on PostCSS Easings
 */
export const cssEasings = {
  linear: 'linear',
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  sineIn: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
  sineOut: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
  sineInOut: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
  quadIn: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
  quadOut: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  quadInOut: 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
  cubicIn: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
  cubicOut: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
  cubicInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
  quartIn: 'cubic-bezier(0.895, 0.03, 0.685, 0.22)',
  quartOut: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
  quartInOut: 'cubic-bezier(0.77, 0, 0.175, 1)',
  quintIn: 'cubic-bezier(0.755, 0.05, 0.855, 0.06)',
  quintOut: 'cubic-bezier(0.23, 1, 0.32, 1)',
  quintInOut: 'cubic-bezier(0.86, 0, 0.07, 1)',
  expoIn: 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
  expoOut: 'cubic-bezier(0.19, 1, 0.22, 1)',
  expoInOut: 'cubic-bezier(1, 0, 0, 1)',
  circIn: 'cubic-bezier(0.6, 0.04, 0.98, 0.335)',
  circOut: 'cubic-bezier(0.075, 0.82, 0.165, 1)',
  circInOut: 'cubic-bezier(0.785, 0.135, 0.15, 0.86)',
  backIn: 'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
  backOut: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  backInOut: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

export type CssEasingName = keyof typeof cssEasings;
export type CssEasing = CssEasingName | (string & {});
