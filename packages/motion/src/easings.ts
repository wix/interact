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

export const cubicBezierCalc = (t: string, x1: number, y1: number, x2: number, y2: number) => {
  const cx1 = 3 * x1;
  const cx2 = 3 * (x2 - 2 * x1);
  const cx3 = 1 - 3 * x2 + 3 * x1;
  const cy1 = 3 * y1;
  const cy2 = 3 * (y2 - 2 * y1);
  const cy3 = 1 - 3 * y2 + 3 * y1;

  let t_val: string;

  if (cx3 === 0) {
    // degenerate curve - x(s) is quadratic (or linear when cx2 is also 0), not cubic
    t_val =
      cx2 === 0
        ? `(${t} / ${cx1})`
        : `((sqrt(max(0, ${cx1 * cx1} + ${4 * cx2} * ${t})) - ${cx1}) / ${2 * cx2})`;
  } else {
    const shift = cx2 / (3 * cx3);
    const qNum = 2 * Math.pow(cx2, 3) - 9 * cx1 * cx2 * cx3;
    const qDen = 54 * Math.pow(cx3, 3);
    const p_3 = (3 * cx3 * cx1 - cx2 * cx2) / (9 * cx3 * cx3);
    const q_2 = `((${qNum} - ${27 * cx3 * cx3} * ${t}) / ${qDen})`;

    if (p_3 < 0) {
      // casus irreducibilis - Cardano's cube roots would be complex here, so use the trigonometric form
      const m = 2 * Math.sqrt(-p_3);

      let rootIdx = 0;
      for (const k of [0, 1, 2]) {
        const inDomain = [0, 0.25, 0.5, 0.75, 1].every((t) => {
          const arg = Math.min(
            Math.max((2 * (qNum - 27 * cx3 * cx3 * t)) / (qDen * p_3 * m), -1),
            1,
          );
          const root = m * Math.cos((Math.acos(arg) - k * 2 * Math.PI) / 3) - shift;

          return root >= -1e-6 && root <= 1 + 1e-6;
        });

        if (inDomain) rootIdx = k;
      }
      // clamping guards acos against arguments pushed just outside [-1, 1] by float error
      const angle = `(acos(clamp(-1, ${2 / (p_3 * m)} * ${q_2}, 1)) - ${360 * rootIdx}deg) / 3`;

      t_val = `(${m} * cos(${angle}) - ${shift})`;
    } else {
      const sqrt = `sqrt(pow(${q_2}, 2) + ${Math.pow(p_3, 3)})`;
      t_val = `(pow(${sqrt} - ${q_2}, 1 / 3) - pow(${sqrt} + ${q_2}, 1 / 3) - ${shift})`;
    }
  }

  return `(${cy3} * pow(${t_val}, 3) + ${cy2} * pow(${t_val}, 2) + ${cy1} * ${t_val})`;
};

export const jsEasingsInCSS = {
  linear: (t: string) => t,
  ease: (t: string) => cubicBezierCalc(t, 0.25, 0.1, 0.25, 1),
  easeIn: (t: string) => cubicBezierCalc(t, 0.42, 0, 1, 1),
  easeOut: (t: string) => cubicBezierCalc(t, 0, 0, 0.58, 1),
  easeInOut: (t: string) => cubicBezierCalc(t, 0.42, 0, 0.58, 1),
  sineIn: (t: string) => `(1 - cos(${t} * 90deg))`,
  sineOut: (t: string) => `(sin(${t} * 90deg))`,
  sineInOut: (t: string) => `((1 - cos(${t} * 180deg)) / 2)`,
  quadIn: (t: string) => `(${t} * ${t})`,
  quadOut: (t: string) => `(1 - (1 - ${t}) * (1 - ${t}))`,
  quadInOut: (t: string) =>
    `(round(${t}) * (1 - (-2 * ${t} + 2) * (-2 * ${t} + 2) / 2) + (1 - round(${t})) * 2 * ${t} * ${t})`,
  cubicIn: (t: string) => `pow(${t}, 3)`,
  cubicOut: (t: string) => `(1 - pow(1 - ${t}, 3))`,
  cubicInOut: (t: string) =>
    `(round(${t}) * (1 - pow(-2 * ${t} + 2, 3) / 2) + (1 - round(${t})) * 4 * pow(${t}, 3))`,
  quartIn: (t: string) => `pow(${t}, 4)`,
  quartOut: (t: string) => `(1 - pow(1 - ${t}, 4))`,
  quartInOut: (t: string) =>
    `(round(${t}) * (1 - pow(-2 * ${t} + 2, 4) / 2) + (1 - round(${t})) * 8 * pow(${t}, 4))`,
  quintIn: (t: string) => `pow(${t}, 5)`,
  quintOut: (t: string) => `(1 - pow(1 - ${t}, 5))`,
  quintInOut: (t: string) =>
    `(round(${t}) * (1 - pow(-2 * ${t} + 2, 5) / 2) + (1 - round(${t})) * 16 * pow(${t}, 5))`,
  expoIn: (t: string) => `(pow(2, 10 * ${t} - 10) - pow(2, -10) * (1 - ${t}))`,
  expoOut: (t: string) => `(1 - pow(2, -10 * ${t}) + pow(2, -10) * ${t})`,
  expoInOut: (t: string) =>
    `((round(${t}) * (2 - pow(2, -20 * ${t} + 10)) + (1 - round(${t})) * pow(2, 20 * ${t} - 10)) / 2)`,
  circIn: (t: string) => `(1 - sqrt(1 - ${t} * ${t}))`,
  circOut: (t: string) => `sqrt(1 - (${t} - 1) * (${t} - 1))`,
  circInOut: (t: string) =>
    `((round(${t}) * (sqrt(max(0, (3 - 2 * ${t}) * (2 * ${t} - 1))) + 1) + (1 - round(${t})) * (1 - sqrt(max(0, 1 - 4 * ${t} * ${t})))) / 2)`,
  backIn: (t: string) => `(2.70158 * pow(${t}, 3) - 1.70158 * ${t} * ${t})`,
  backOut: (t: string) => `(1 + 2.70158 * pow(${t} - 1, 3) + 1.70158 * (${t} - 1) * (${t} - 1))`,
  backInOut: (t: string) =>
    `((round(${t}) * (2 + (2 * ${t} - 2) * (2 * ${t} - 2) * (2.5949095 + 3.5949095 * (2 * ${t} - 2))) + (1 - round(${t})) * 4 * ${t} * ${t} * (3.5949095 * 2 * ${t} - 2.5949095)) / 2)`,
};

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

export const scrubTransitionEasings = {
  linear: 'linear',
  easeOut: 'cubic-bezier(0, 0, 0.58, 1)',
  hardBackOut: 'cubic-bezier(0.58, 2.5, 0, 0.95)',
  elastic:
    'linear( 0, 0.2178 2.1%, 1.1144 8.49%, 1.2959 10.7%, 1.3463 11.81%, 1.3705 12.94%, 1.3726, 1.3643 14.48%, 1.3151 16.2%, 1.0317 21.81%, 0.941 24.01%, 0.8912 25.91%, 0.8694 27.84%, 0.8698 29.21%, 0.8824 30.71%, 1.0122 38.33%, 1.0357, 1.046 42.71%, 1.0416 45.7%, 0.9961 53.26%, 0.9839 57.54%, 0.9853 60.71%, 1.0012 68.14%, 1.0056 72.24%, 0.9981 86.66%, 1 )',
  bounce:
    'linear( 0, 0.0039, 0.0157, 0.0352, 0.0625 9.09%, 0.1407, 0.25, 0.3908, 0.5625, 0.7654, 1, 0.8907, 0.8125 45.45%, 0.7852, 0.7657, 0.7539, 0.75, 0.7539, 0.7657, 0.7852, 0.8125 63.64%, 0.8905, 1 72.73%, 0.9727, 0.9532, 0.9414, 0.9375, 0.9414, 0.9531, 0.9726, 1, 0.9883, 0.9844, 0.9883, 1 )',
} as const;
