import type { ComponentDefinition } from './types';

import { card } from './card/template';
import { cardList } from './card-list/template';
import { cardGrid } from './card-grid/template';
import { heroSection } from './hero-section/template';
import { figure } from './figure/template';
import { header } from './header/template';
import { navMenu } from './nav-menu/template';
import { carousel } from './carousel/template';

export const components: ComponentDefinition[] = [
  card,
  cardList,
  cardGrid,
  heroSection,
  figure,
  header,
  navMenu,
  carousel,
];

export function getComponent(id: string): ComponentDefinition | undefined {
  return components.find((c) => c.id === id);
}

export type { ComponentDefinition, ComponentKey } from './types';
