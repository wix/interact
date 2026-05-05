export interface ComponentKey {
  key: string;
  label: string;
  isList?: boolean;
  parentKey?: string;
  listContainer?: string;
  listItemSelector?: string;
}

export interface ComponentDefinition {
  id: string;
  name: string;
  description: string;
  keys: ComponentKey[];
  html: string;
  css: string;
}
