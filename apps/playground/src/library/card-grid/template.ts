import type { ComponentDefinition } from '../types';
import css from './card-grid.css?inline';

function gridItem(title: string, text: string): string {
  return `
    <div class="card-grid-item">
      <div class="card-grid-item-image">240×120</div>
      <div class="card-grid-item-body">
        <h4 class="card-grid-item-title">${title}</h4>
        <p class="card-grid-item-text">${text}</p>
      </div>
    </div>
  `;
}

export const cardGrid: ComponentDefinition = {
  id: 'card-grid',
  name: 'Card Grid',
  description: '3-column responsive grid of cards',
  keys: [
    { key: 'card-grid', label: 'Grid (root)' },
    {
      key: 'card-grid-item',
      label: 'Grid Item',
      isList: true,
      parentKey: 'card-grid',
      listContainer: '.card-grid',
      listItemSelector: '.card-grid-item',
    },
  ],
  css,
  html: `
    <interact-element data-interact-key="card-grid">
      <div class="card-grid">
        ${gridItem('Fade In', 'Smooth entrance animation')}
        ${gridItem('Slide Up', 'Slide from below viewport')}
        ${gridItem('Scale', 'Grow from zero to full')}
        ${gridItem('Rotate', 'Spin into position')}
        ${gridItem('Blur', 'Focus reveal effect')}
        ${gridItem('Bounce', 'Playful spring motion')}
      </div>
    </interact-element>
  `,
};
