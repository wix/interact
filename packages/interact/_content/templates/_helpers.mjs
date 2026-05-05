export function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function when(condition, content) {
  return condition ? content : '';
}

/**
 * Builds the pitfalls block for a trigger template.
 * Iterates trigger.pitfalls from YAML, resolving each fragment section.
 * Returns empty string if no pitfalls; raw content otherwise (caller handles spacing).
 */
export function buildPitfallsBlock(trigger, fragments) {
  if (!trigger.pitfalls?.length) return '';
  return trigger.pitfalls
    .map((p) => fragments.get(`pitfalls/${p.id}`, p.section || trigger.name))
    .join('\n');
}

const COMMON_VARS = {
  SOURCE_KEY: (suffix) =>
    `- \`[SOURCE_KEY]\` — identifier matching the element's key (\`data-interact-key\` for web, \`interactKey\` for React). ${suffix}`,
  TARGET_KEY: (desc) => `- \`[TARGET_KEY]\` — ${desc}`,
  EFFECT_NAME: () => '- `[EFFECT_NAME]` — unique string identifier for a `keyframeEffect`.',
  NAMED_EFFECT_DEFINITION: () =>
    '- `[NAMED_EFFECT_DEFINITION]` — object with properties of pre-built effect from `@wix/motion-presets`. Refer to motion-presets rules for available presets and their options.',
  KEYFRAMES: () =>
    '- `[KEYFRAMES]` — array of keyframe objects (e.g. `[{ opacity: 0 }, { opacity: 1 }]`). Property names in camelCase.',
  FILL_MODE: (desc) => `- \`[FILL_MODE]\` — ${desc}`,
  DURATION_MS: () => '- `[DURATION_MS]` — animation duration in milliseconds.',
  EASING_FUNCTION: (desc) =>
    `- \`[EASING_FUNCTION]\` — ${desc || 'CSS easing string or named easing from `@wix/motion`.'}`,
  DELAY_MS: () => '- `[DELAY_MS]` — optional delay before the effect starts, in milliseconds.',
  ITERATIONS: (desc) =>
    `- \`[ITERATIONS]\` — ${desc || 'optional. Number of iterations, or `Infinity` for continuous loops.'}`,
  ALTERNATE_BOOL: (suffix) =>
    `- \`[ALTERNATE_BOOL]\` — optional. \`true\` to alternate direction on every other iteration (within a single playback).${suffix || ''}`,
  UNIQUE_EFFECT_ID: () =>
    '- `[UNIQUE_EFFECT_ID]` — optional. String identifier used by `animationEnd` triggers for chaining, and by sequences for referencing effects from the top-level `effects` map.',
  CUSTOM_EFFECT_CALLBACK: () =>
    '- `[CUSTOM_EFFECT_CALLBACK]` — function with signature `(element: HTMLElement, progress: number) => void`. Called on each animation frame with the target element and `progress` from 0 to 1.',
  TRANSITION_DURATION_MS: () =>
    '- `[TRANSITION_DURATION_MS]` — optional number. Milliseconds for smoothing (interpolating) between progress updates. The animation does not jump to the new progress value instantly; instead it transitions over this duration. Use to add inertia/lag to the effect, making it feel more physical (e.g. `200`–`600`).',
  TRANSITION_EASING: () =>
    '- `[TRANSITION_EASING]` — optional string. CSS easing or named easing from `@wix/motion`. Adds a natural deceleration feel when used with `transitionDuration`.',
  CENTERED_TO_TARGET: () =>
    '- `[CENTERED_TO_TARGET]` — `true` or `false`. See **Centering with `centeredToTarget`** above.',
  HIT_AREA: () =>
    "- `[HIT_AREA]` — `'self'` (track pointer within source element) or `'root'` (track pointer anywhere in viewport).",
};

/** Returns a common variable description line. */
export function varLine(name, ...args) {
  const fn = COMMON_VARS[name];
  if (!fn) throw new Error(`Unknown common variable: ${name}`);
  return fn(...args);
}
