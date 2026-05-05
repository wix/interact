import type { ComponentDefinition } from '../types';
import css from './card.css?inline';

export const card: ComponentDefinition = {
  id: 'card',
  name: 'Card',
  description: 'Image, title, text, and CTA button',
  keys: [
    { key: 'card', label: 'Card (root)' },
    { key: 'card-image', label: 'Image' },
    { key: 'card-title', label: 'Title' },
    { key: 'card-cta', label: 'CTA Button' },
  ],
  css,
  html: `
    <interact-element data-interact-key="card">
      <div class="card">
        <interact-element data-interact-key="card-image">
          <div class="card-image">480 × 200</div>
        </interact-element>
        <div class="card-body">
          <interact-element data-interact-key="card-title">
            <h3 class="card-title">Card Title</h3>
          </interact-element>
          <p class="card-text">A brief description of the content goes here. This card component supports hover, click, and scroll animations.</p>
          <interact-element data-interact-key="card-cta">
            <a class="card-cta">Learn More</a>
          </interact-element>
        </div>
      </div>
    </interact-element>
  `,
};
