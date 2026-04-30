import type { ComponentDefinition } from '../types';
import css from './card-list.css?inline';

function listItem(title: string, text: string): string {
  return `
    <div class="card-list-item">
      <div class="card-list-item-image">64×64</div>
      <div class="card-list-item-content">
        <h4 class="card-list-item-title">${title}</h4>
        <p class="card-list-item-text">${text}</p>
      </div>
    </div>
  `;
}

export const cardList: ComponentDefinition = {
  id: 'card-list',
  name: 'Card List',
  description: 'Vertical list of cards',
  keys: [
    { key: 'card-list', label: 'List (root)' },
    {
      key: 'card-list-item',
      label: 'List Item',
      isList: true,
      parentKey: 'card-list',
      listContainer: '.card-list',
      listItemSelector: '.card-list-item',
    },
  ],
  css,
  html: `
    <interact-element data-interact-key="card-list">
      <div class="card-list">
        ${listItem('Animation Basics', 'Get started with keyframe animations and easing')}
        ${listItem('Scroll Effects', 'Create scroll-driven parallax and reveal effects')}
        ${listItem('Hover States', 'Design interactive hover transitions')}
        ${listItem('Sequencing', 'Orchestrate staggered animation sequences')}
      </div>
    </interact-element>
  `,
};
