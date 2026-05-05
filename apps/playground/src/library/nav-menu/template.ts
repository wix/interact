import type { ComponentDefinition } from '../types';
import css from './nav-menu.css?inline';

export const navMenu: ComponentDefinition = {
  id: 'nav-menu',
  name: 'Nav Menu',
  description: 'Horizontal navigation bar with text anchors',
  keys: [
    { key: 'nav-menu', label: 'Nav (root)' },
    {
      key: 'nav-menu-item',
      label: 'Menu Item',
      isList: true,
      parentKey: 'nav-menu',
      listContainer: '.nav-menu',
      listItemSelector: '.nav-menu-item',
    },
  ],
  css,
  html: `
    <interact-element data-interact-key="nav-menu">
      <nav class="nav-menu">
        <a class="nav-menu-item active">Home</a>
        <a class="nav-menu-item">Features</a>
        <a class="nav-menu-item">Pricing</a>
        <a class="nav-menu-item">Docs</a>
        <a class="nav-menu-item">Blog</a>
      </nav>
    </interact-element>
  `,
};
