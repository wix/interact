import type { ComponentDefinition } from '../types';
import css from './carousel.css?inline';

function slide(title: string): string {
  return `
    <div class="carousel-slide">
      <div class="carousel-slide-overlay"></div>
      <h3 class="carousel-title">${title}</h3>
    </div>
  `;
}

export const carousel: ComponentDefinition = {
  id: 'carousel',
  name: 'Carousel',
  description: 'Horizontal image carousel with title overlay',
  keys: [
    { key: 'carousel', label: 'Carousel (root)' },
    {
      key: 'carousel-slide',
      label: 'Slide',
      isList: true,
      parentKey: 'carousel',
      listContainer: '.carousel-track',
      listItemSelector: '.carousel-slide',
    },
    { key: 'carousel-title', label: 'Slide Title' },
  ],
  css,
  html: `
    <interact-element data-interact-key="carousel">
      <div class="carousel">
        <div class="carousel-track">
          ${slide('Entrance Animations')}
          ${slide('Scroll Effects')}
          ${slide('Hover Transitions')}
          ${slide('Mouse Tracking')}
        </div>
        <div class="carousel-dots">
          <div class="carousel-dot active"></div>
          <div class="carousel-dot"></div>
          <div class="carousel-dot"></div>
          <div class="carousel-dot"></div>
        </div>
      </div>
    </interact-element>
  `,
};
