import type { ComponentDefinition } from '../types';
import css from './hero-section.css?inline';

export const heroSection: ComponentDefinition = {
  id: 'hero-section',
  name: 'Hero Section',
  description: 'Full-width section with background, title, and text',
  keys: [
    { key: 'hero', label: 'Hero (root)' },
    { key: 'hero-image', label: 'Background' },
    { key: 'hero-title', label: 'Title' },
    { key: 'hero-text', label: 'Text' },
  ],
  css,
  html: `
    <interact-element data-interact-key="hero">
      <div class="hero">
        <interact-element data-interact-key="hero-image">
          <div class="hero-image"></div>
        </interact-element>
        <div class="hero-content">
          <interact-element data-interact-key="hero-title">
            <h1 class="hero-title">Bring Your Site to Life</h1>
          </interact-element>
          <interact-element data-interact-key="hero-text">
            <p class="hero-text">Create stunning scroll-driven animations, hover effects, and interactive experiences with a simple configuration-driven approach.</p>
          </interact-element>
        </div>
      </div>
    </interact-element>
  `,
};
