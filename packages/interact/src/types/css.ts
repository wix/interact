export type ListPropName = 'animation' | 'transition' | 'animation-composition';

export type CoordLists = {
  key: string;
  childSelector?: string;
  props: Record<ListPropName, { fallback: string; customProps: string[] }>;
};

export type ListCustomProps = {
  key: string;
  childSelector?: string;
  statePropsToInvalidate: Set<string>;
} & Record<ListPropName, string>;

export type RuleObj = {
  key: string;
  childSelector?: string;
  declarations: { name: string; value: string | number }[];
  media?: string;
  states?: string[];
  selectorCondition?: string;
  addInitialSelector?: boolean;
};
