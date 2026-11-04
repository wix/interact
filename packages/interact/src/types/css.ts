import type { InteractPluginStyles } from './plugins';
import type { ReducedMotionHandling } from './effects';

/**
 * Options bag for `generate()`. Passed as its single optional 2nd argument, which also accepts a
 * bare boolean for the legacy `useFirstChild` signature.
 */
export type GenerateOptions = {
  /** Whether to use the first child selector (default: `true`). */
  useFirstChild?: boolean;
  /**
   * Map of plugin name → SSR style generator. For every `$<name>` field in the config, the matching
   * generator is called with the field's (opaque) value and a context; its returned CSS is appended.
   */
  plugins?: InteractPluginStyles;
  /**
   * The config's index among several configs whose CSS is on the same page, starting at 0. Suffixes the
   * generated custom properties and timeline names with it so they don't collide with the other configs', and
   * combines the configs' lists and `timeline-scope` where they meet. Configs' CSS must be in index order,
   * and each config's `Interact.create()` must get the same index, since unnamed effects' ids are suffixed too.
   */
  configIndex?: number;
  /**
   * Generates only the reduced-motion outcome of every effect, unconditionally. Must equal the instance's
   * `forceReducedMotion` at runtime. Defaults to `Interact.forceReducedMotion` (see `Interact.setup()`).
   */
  forceReducedMotion?: boolean;
  /**
   * The handling of effects that don't set one along their interaction, sequence or effect. Must equal the
   * instance's `reducedMotionHandling` at runtime. Defaults to `Interact.reducedMotionHandling`.
   */
  reducedMotionHandling?: ReducedMotionHandling;
};

export type ListPropertyName =
  | 'animation'
  | 'transition'
  | 'animation-composition'
  | 'animation-timeline'
  | 'animation-range'
  | 'view-timeline';

export type CSSRuleData = {
  key: string;
  childSelector?: string;
  declarations: { name: string; value: string | number; important?: boolean }[];
  media?: string;
  states?: string[];
  selectorCondition?: string;
  selectorSuffix?: string;
};
