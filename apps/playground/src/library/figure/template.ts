import type { ComponentDefinition } from '../types';
import css from './figure.css?inline';

export const figure: ComponentDefinition = {
  id: 'figure',
  name: 'Figure',
  description: 'Image with caption',
  keys: [
    { key: 'figure', label: 'Figure (root)' },
    { key: 'figure-image', label: 'Image' },
    { key: 'figure-caption', label: 'Caption' },
  ],
  css,
  html: `
    <interact-element data-interact-key="figure">
      <figure class="figure">
        <interact-element data-interact-key="figure-image">
          <div class="figure-image">480 × 280</div>
        </interact-element>
        <interact-element data-interact-key="figure-caption">
          <figcaption class="figure-caption">An example figure caption — animate on scroll or hover to reveal.</figcaption>
        </interact-element>
      </figure>
    </interact-element>
  `,
};
