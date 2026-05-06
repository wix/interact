export function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Builds the pitfalls block for a trigger template.
 * Iterates trigger.pitfalls from data, resolving each fragment section.
 * When `wrapped` is true, wraps non-empty output with leading/trailing newlines
 * (the common pattern used by event-trigger, viewenter, and viewprogress templates).
 */
export function buildPitfallsBlock(trigger, fragments, { wrapped = false } = {}) {
  if (!trigger.pitfalls?.length) return '';
  const content = trigger.pitfalls
    .map((p) => fragments.get(`pitfalls/${p.id}`, p.section || trigger.name))
    .join('\n');
  return wrapped ? `\n${content}\n` : content;
}

const COMMON_VARS = {
  SOURCE_KEY: (suffix) =>
    `identifier matching the element's key (\`data-interact-key\` for web, \`interactKey\` for React).${suffix ? ` ${suffix}` : ''}`,
  TARGET_KEY: (desc) =>
    desc || "identifier matching the element's key on the element that animates.",
  EFFECT_NAME: () => 'unique string identifier for a `keyframeEffect`.',
  NAMED_EFFECT_DEFINITION: () =>
    'object with properties of pre-built effect from `@wix/motion-presets`. Refer to motion-presets rules for available presets and their options.',
  KEYFRAMES: () =>
    'array of keyframe objects (e.g. `[{ opacity: 0 }, { opacity: 1 }]`). Property names in camelCase.',
  FILL_MODE: (desc) =>
    desc || "fill mode for the animation (`'none'`, `'forwards'`, `'backwards'`, `'both'`).",
  DURATION_MS: () => 'animation duration in milliseconds.',
  EASING_FUNCTION: (desc) =>
    desc || 'CSS easing string or named easing from `@wix/motion`.',
  DELAY_MS: () => 'optional delay before the effect starts, in milliseconds.',
  ITERATIONS: (desc) =>
    desc || 'optional. Number of iterations, or `Infinity` for continuous loops.',
  ALTERNATE_BOOL: (suffix) =>
    `optional. \`true\` to alternate direction on every other iteration (within a single playback).${suffix ? ` ${suffix}` : ''}`,
  UNIQUE_EFFECT_ID: () =>
    'optional. String identifier used by `animationEnd` triggers for chaining, and by sequences for referencing effects from the top-level `effects` map.',
  CUSTOM_EFFECT_CALLBACK: () =>
    'function with signature `(element: HTMLElement, progress: number) => void`. Called on each animation frame with the target element and `progress` from 0 to 1.',
  TRANSITION_DURATION_MS: () =>
    'optional number. Milliseconds for smoothing (interpolating) between progress updates. The animation does not jump to the new progress value instantly; instead it transitions over this duration. Use to add inertia/lag to the effect, making it feel more physical (e.g. `200`–`600`).',
  TRANSITION_EASING: () =>
    'optional string. CSS easing or named easing from `@wix/motion`. Adds a natural deceleration feel when used with `transitionDuration`.',
  CENTERED_TO_TARGET: () =>
    '`true` or `false`. See **Centering with `centeredToTarget`** above.',
  HIT_AREA: () =>
    "`'self'` (track pointer within source element) or `'root'` (track pointer anywhere in viewport).",
};

export function varLine(name, extra) {
  const fn = COMMON_VARS[name];
  if (!fn) throw new Error(`Unknown common variable: ${name}`);
  return `- \`[${name}]\` — ${fn(extra)}`;
}
