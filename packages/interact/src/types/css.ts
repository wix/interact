import type { InteractPluginStyles } from './plugins';

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
};

export type ListPropertyName =
  | 'animation'
  | 'transition'
  | 'animation-composition'
  | 'animation-timeline'
  | 'animation-range';

export type CSSCoordinatedLists = {
  key: string;
  childSelector?: string;
  properties: Partial<Record<ListPropertyName, { fallback: string; varNames: string[] }>>;
};

export type ListCustomProps = {
  key: string;
  childSelector?: string;
} & Record<ListPropertyName, string>;

export type CSSRuleData = {
  key: string;
  childSelector?: string;
  declarations: { name: string; value: string | number }[];
  media?: string;
  states?: string[];
  selectorCondition?: string;
  selectorSuffix?: string;
};
