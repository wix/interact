export type ListPropertyName =
  | 'animation'
  | 'transition'
  | 'animation-composition'
  | 'animation-timeline'
  | 'animation-range';

export type CSSCoordiantedLists = {
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
  addInitialSelector?: boolean;
};
