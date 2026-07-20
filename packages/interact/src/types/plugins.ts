/**
 * Generic plugin bridge types.
 *
 * Interact knows nothing about any specific plugin. A plugin is registered by name via
 * `Interact.use(name, plugin)` and invoked whenever an interaction/effect carries a matching
 * `$`-prefixed field (e.g. `$splitText` → the `splitText` plugin). The plugin receives the raw
 * field value plus a context describing where it was found, and may return a cleanup function that
 * Interact runs on disconnect/teardown.
 */

import { CSSRuleData } from './css';

/**
 * Prefix that marks a config field as plugin config. A field named `$<name>` routes its value to
 * the plugin registered under `<name>`. NOTE: the value here and the `` `$${string}` `` literal in
 * {@link PluginFields} must stay in sync.
 */
export const PLUGIN_FIELD_PREFIX = '$';

export type InteractPluginContext = {
  /** The interaction's (or effect target's) resolved root element. */
  root: HTMLElement;
  /** The interaction (or effect) key the plugin was found under. */
  key: string;
  /** Whether the plugin was declared on an interaction or on an effect. */
  scope: 'interaction' | 'effect';
  /** The full interaction or effect config object the plugin field was found on. */
  config: Record<string, unknown>;
};

/** Called on disconnect/teardown to undo whatever the plugin did (e.g. revert a DOM mutation). */
export type InteractPluginCleanup = () => void;

/**
 * A plugin is a plain callback. It receives the value of its `$`-prefixed config field and a
 * context, and may return a cleanup function. Interact is agnostic to the shape of `value`.
 */
export type InteractPlugin = (
  value: unknown,
  context: InteractPluginContext,
) => void | InteractPluginCleanup;

/**
 * Context passed to a plugin's SSR style generator (see {@link InteractPluginStyleGenerator}).
 * Unlike {@link InteractPluginContext}, there is no live DOM — only the selector that scopes to
 * the element the plugin field is on.
 */
export type InteractPluginStyleContext = {
  /** The interaction (or effect target) key the plugin field was found on. */
  key: string;
  /** Whether the plugin field was declared on an interaction or on an effect. */
  scope: 'interaction' | 'effect';
  /** The full interaction or effect config object the plugin field was found on. */
  config: Record<string, unknown>;
};

/**
 * A plugin's **build-time** styling callback, passed to `generate()` (NOT the same callback given
 * to `Interact.use()`). Given the raw `$`-prefixed field value and a context, it returns initial
 * CSS rule(s) for the element — e.g. hiding the pre-plugin content to prevent FOUC before an
 * entrance animation. Interact emits the returned rules verbatim and never inspects `value`.
 */
export type InteractPluginStyleGenerator = (
  value: unknown,
  context: InteractPluginStyleContext,
) => Pick<CSSRuleData, 'declarations' | 'selectorSuffix'>[];

/** Map of plugin name → SSR style generator, passed as the `plugins` argument to `generate()`. */
export type InteractPluginStyles = Record<string, InteractPluginStyleGenerator>;

/**
 * Consumers augment this interface (via declaration merging) to type the config values of the
 * plugins they register. Keys are the **unprefixed** plugin names, e.g.:
 *
 * ```ts
 * declare module '@wix/interact' {
 *   interface InteractPluginConfigMap { splitText: { container: string } }
 * }
 * ```
 *
 * That types the `$splitText` field. It is intentionally empty by default — Interact ships no
 * built-in plugins.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface InteractPluginConfigMap {}

/**
 * The `$`-prefixed plugin fields allowed on interactions and effects. Plugins registered through
 * augmentation keep their value types (as `$<name>`); any other `$`-prefixed field is still
 * allowed at runtime with an `unknown` value.
 */
export type PluginFields = {
  [K in keyof InteractPluginConfigMap as `$${K & string}`]?: InteractPluginConfigMap[K];
} & {
  [pluginField: `$${string}`]: unknown;
};
