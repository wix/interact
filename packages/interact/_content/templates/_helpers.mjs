export function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Builds the pitfalls block for a trigger template.
 * Iterates trigger.pitfalls from YAML, resolving each fragment section.
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

/**
 * Builds a Prettier-compatible padded markdown table.
 * @param {string[]} headers — column header labels
 * @param {string[][]} rows — array of rows, each an array of cell strings
 */
export function buildMarkdownTable(headers, rows) {
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => (r[i] || '').length)),
  );
  return [
    `| ${headers.map((h, i) => h.padEnd(widths[i])).join(' | ')} |`,
    `| ${widths.map((w) => `:${'-'.repeat(w - 1)}`).join(' | ')} |`,
    ...rows.map((r) => `| ${r.map((c, i) => (c || '').padEnd(widths[i])).join(' | ')} |`),
  ].join('\n');
}

/**
 * Common variable descriptions.
 * - mode 'suffix': arg is appended after base (separated by space)
 * - mode 'override': arg replaces base entirely
 * - no mode: variable takes no argument
 */
const COMMON_VARS = {
  SOURCE_KEY: {
    base: "identifier matching the element's key (`data-interact-key` for web, `interactKey` for React).",
    mode: 'suffix',
  },
  TARGET_KEY: {
    base: "identifier matching the element's key on the element that animates.",
    mode: 'override',
  },
  EFFECT_NAME: { base: 'unique string identifier for a `keyframeEffect`.' },
  NAMED_EFFECT_DEFINITION: {
    base: 'object with properties of pre-built effect from `@wix/motion-presets`. Refer to motion-presets rules for available presets and their options.',
  },
  KEYFRAMES: {
    base: 'array of keyframe objects (e.g. `[{ opacity: 0 }, { opacity: 1 }]`). Property names in camelCase.',
  },
  FILL_MODE: {
    base: "fill mode for the animation (`'none'`, `'forwards'`, `'backwards'`, `'both'`).",
    mode: 'override',
  },
  DURATION_MS: { base: 'animation duration in milliseconds.' },
  EASING_FUNCTION: {
    base: 'CSS easing string or named easing from `@wix/motion`.',
    mode: 'override',
  },
  DELAY_MS: { base: 'optional delay before the effect starts, in milliseconds.' },
  ITERATIONS: {
    base: 'optional. Number of iterations, or `Infinity` for continuous loops.',
    mode: 'override',
  },
  ALTERNATE_BOOL: {
    base: 'optional. `true` to alternate direction on every other iteration (within a single playback).',
    mode: 'suffix',
  },
  UNIQUE_EFFECT_ID: {
    base: 'optional. String identifier used by `animationEnd` triggers for chaining, and by sequences for referencing effects from the top-level `effects` map.',
  },
  CUSTOM_EFFECT_CALLBACK: {
    base: 'function with signature `(element: HTMLElement, progress: number) => void`. Called on each animation frame with the target element and `progress` from 0 to 1.',
  },
  TRANSITION_DURATION_MS: {
    base: 'optional number. Milliseconds for smoothing (interpolating) between progress updates. The animation does not jump to the new progress value instantly; instead it transitions over this duration. Use to add inertia/lag to the effect, making it feel more physical (e.g. `200`–`600`).',
  },
  TRANSITION_EASING: {
    base: 'optional string. CSS easing or named easing from `@wix/motion`. Adds a natural deceleration feel when used with `transitionDuration`.',
  },
  CENTERED_TO_TARGET: {
    base: '`true` or `false`. See **Centering with `centeredToTarget`** above.',
  },
  HIT_AREA: {
    base: "`'self'` (track pointer within source element) or `'root'` (track pointer anywhere in viewport).",
  },
};

/**
 * Returns a formatted variable description line.
 * For 'suffix' mode vars, `extra` is appended after the base description.
 * For 'override' mode vars, `extra` replaces the base description.
 * For vars with no mode, `extra` is ignored.
 */
export function varLine(name, extra) {
  const v = COMMON_VARS[name];
  if (!v) throw new Error(`Unknown common variable: ${name}`);
  let desc = v.base;
  if (extra !== undefined && v.mode) {
    desc = v.mode === 'suffix' ? `${v.base} ${extra}` : extra;
  }
  return `- \`[${name}]\` — ${desc}`;
}
