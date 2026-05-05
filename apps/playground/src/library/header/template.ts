import type { ComponentDefinition } from '../types';
import css from './header.css?inline';

export const header: ComponentDefinition = {
  id: 'header',
  name: 'Header',
  description: 'Heading with subtitle text',
  keys: [
    { key: 'header', label: 'Header (root)' },
    { key: 'header-title', label: 'Title' },
    { key: 'header-subtitle', label: 'Subtitle' },
  ],
  css,
  html: `
    <interact-element data-interact-key="header">
      <div class="header">
        <interact-element data-interact-key="header-title">
          <h1 class="header-title">Section Heading</h1>
        </interact-element>
        <interact-element data-interact-key="header-subtitle">
          <p class="header-subtitle">A supporting subtitle that provides context for the section content below.</p>
        </interact-element>
      </div>
    </interact-element>
  `,
};
