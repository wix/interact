# Configuration Structure

The `InteractConfig` object is the heart of `@wix/interact`. This guide explains how to organize and structure complex interactions efficiently.

## Basic Configuration Structure

```typescript
import type { InteractConfig } from '@wix/interact';

const config: InteractConfig = {
  effects: {
    // Reusable effect definitions
  },
  conditions: {
    // Reusable condition definitions
  },
  interactions: [
    // Array of interaction definitions
  ],
};
```

## Anatomy of an Interaction

Each interaction defines a complete cause-and-effect relationship:

```typescript
{
    key: 'trigger-element',           // What element triggers the interaction
    selector: '.clickable-area',          // Optional: Custom selector within source
    trigger: 'hover',                     // What user action starts it
    conditions: ['desktop-only'],         // Optional conditions to check
    effects: [                            // Array of effects to apply
        {
            key: 'animated-element',
            selector: '.animation-target', // Optional: Custom selector within target
            namedEffect: 'FadeIn',
            duration: 300
        }
    ]
}
```

Time-based playback (`once`, `repeat`, `alternate`, `state`) is set with `triggerType` on each time effect, or with `triggerType` on a sequence object when using `sequences`. Optional `params` on the interaction are for observer options (`viewEnter` / `pageVisible`), pointer/`animationEnd` settings, and other non-playback trigger configuration.

## Element Selection with Selectors

The `selector` property allows you to specify exactly which element should be used for interactions, instead of being limited to the first child element.

### How Element Selection Works

Note that while `Interaction.key` defaults to `Effect.key` if it's missing, `selector` and `listContainer` are not inherited from the Interaction's config to the Effect's config.

The system follows this priority order for selecting elements:

1. **List Container** (if specified): `listContainer: '.item-list'`. Matches child elements of the selected container using `selector`, or all its immediate children if not specified.
2. **Custom Selector** (if specified): `selector: '.my-element'`.
3. **First Child** (fallback): The first child element of the interact-element.

### Basic Selector Usage

```typescript
const config: InteractConfig = {
  interactions: [
    {
      key: 'card-container',
      selector: '.card-image', // Select the image within the card
      trigger: 'hover',
      effects: [
        {
          key: 'card-container',
          selector: '.card-overlay', // Select the overlay within the card
          namedEffect: 'FadeIn',
          duration: 300,
        },
      ],
    },
  ],
};
```

### Selector vs ListContainer

- **`selector`**: Selects all matching elements using CSS selector (`querySelectorAll`)
- **`listContainer`**: Selects a container for targeting its child elements for list-based interactions
- **Combined**: Use both to select elements within list items

```typescript
// Using selector with listContainer
{
    key: 'product-grid',
    listContainer: '.products',         // Container holding all product items
    selector: '.product-image',         // querySelectorAll finds all images as list items
    trigger: 'hover',
    effects: [
        {
            key: 'product-grid',
            listContainer: '.products',
            selector: '.product-overlay', // querySelectorAll finds all overlays as list items
            namedEffect: {
              type: 'FadeIn'
            },
            duration: 200
        }
    ]
}
```

## Organizing Simple Interactions

### Inline Effects (Small Projects)

For simple interactions, define effects directly:

```typescript
const simpleConfig: InteractConfig = {
  interactions: [
    {
      key: 'button-1',
      trigger: 'hover',
      effects: [
        {
          key: 'button-1',
          namedEffect: {
            type: 'Scale',
          },
          duration: 200,
          easing: 'ease-out',
        },
      ],
    },
    {
      key: 'button-2',
      trigger: 'click',
      effects: [
        {
          key: 'modal',
          keyframeEffect: {
            name: 'scale-button',
            keyframes: [
              { opacity: '0', transform: 'scale(0.9)' },
              { opacity: '1', transform: 'scale(1)' },
            ],
          },
          duration: 300,
        },
      ],
    },
  ],
};
```

## Organizing Complex Interactions

### Reusable Effects

For larger projects, define effects separately and reference them:

```typescript
const complexConfig: InteractConfig = {
  effects: {
    // Reusable effect definitions
    'button-hover': {
      keyframeEffect: {
        name: 'button-hover',
        keyframes: [
          { transform: 'scale(1)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
          { transform: 'scale(1.05)', boxShadow: '0 8px 16px rgba(0,0,0,0.15)' },
        ],
      },
      duration: 200,
      easing: 'ease-out',
    },
    'card-entrance': {
      keyframeEffect: {
        name: 'card-entrance',
        keyframes: [
          { opacity: '0', transform: 'translateY(30px)' },
          { opacity: '1', transform: 'translateY(0)' },
        ],
      },
      duration: 600,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
    },
    'modal-open': {
      keyframeEffect: {
        name: 'modal-open',
        keyframes: [
          { opacity: '0', transform: 'scale(0.95)' },
          { opacity: '1', transform: 'scale(1)' },
        ],
      },
      duration: 300,
      easing: 'ease-out',
    },
  },

  interactions: [
    {
      key: 'btn-primary',
      trigger: 'hover',
      effects: [
        {
          key: 'btn-primary',
          effectId: 'button-hover', // Reference to reusable effect
        },
      ],
    },
    {
      key: 'product-card',
      trigger: 'viewEnter',
      params: { threshold: 0.3 },
      effects: [
        {
          key: 'product-card',
          effectId: 'card-entrance',
        },
      ],
    },
  ],
};
```

## Conditional Interactions

### Defining Conditions

Create reusable conditions for responsive design:

```typescript
const responsiveConfig: InteractConfig = {
  conditions: {
    'desktop-only': {
      type: 'media',
      predicate: '(min-width: 768px)',
    },
    'mobile-only': {
      type: 'media',
      predicate: '(max-width: 767px)',
    },
    'prefers-motion': {
      type: 'media',
      predicate: '(prefers-reduced-motion: no-preference)',
    },
    'large-container': {
      type: 'container',
      predicate: '(min-width: 600px)',
    },
  },

  interactions: [
    // Desktop hover effects
    {
      key: 'hero-image',
      trigger: 'hover',
      conditions: ['desktop-only', 'prefers-motion'],
      effects: [
        {
          key: 'hero-image',
          namedEffect: {
            type: 'Scale',
          },
          duration: 400,
        },
      ],
    },

    // Mobile tap effects
    {
      key: 'hero-image',
      trigger: 'click',
      conditions: ['mobile-only'],
      effects: [
        {
          key: 'hero-image',
          namedEffect: {
            type: 'Pulse',
          },
          duration: 300,
        },
      ],
    },
  ],
};
```

### Using Conditions in Effects

Apply conditions at the effect level:

```typescript
{
    key: 'animated-section',
    trigger: 'viewEnter',
    effects: [
        // Basic fade for all devices
        {
            key: 'animated-section',
            namedEffect: {
                type: 'FadeIn'
            },
            duration: 600
        },
        // Enhanced animation only on desktop
        {
            key: 'animated-section',
            selector: ' .particles',
            namedEffect: {
                type: 'SlideUp'
            },
            duration: 800,
            delay: 200,
            conditions: ['desktop-only', 'prefers-motion']
        }
    ]
}
```

## Modular Configuration Patterns

### Feature-Based Organization

Organize by features or components:

```typescript
// buttons.ts
export const buttonInteractions = [
  {
    key: 'btn-primary',
    trigger: 'hover',
    effects: [{ key: 'btn-primary', effectId: 'button-hover' }],
  },
  {
    key: 'btn-secondary',
    trigger: 'hover',
    effects: [{ key: 'btn-secondary', effectId: 'button-hover-secondary' }],
  },
];

// cards.ts
export const cardInteractions = [
  {
    key: 'card',
    trigger: 'viewEnter',
    effects: [{ key: 'card', effectId: 'card-entrance' }],
  },
];

// main.ts
import { buttonInteractions } from './buttons';
import { cardInteractions } from './cards';
import { commonEffects } from './effects';
import { mediaConditions } from './conditions';

const config: InteractConfig = {
  effects: commonEffects,
  conditions: mediaConditions,
  interactions: [...buttonInteractions, ...cardInteractions],
};
```

### Component-Specific Configurations

Create configurations for specific components:

```typescript
// NavbarConfig.ts
export const createNavbarConfig = (navbarId: string): InteractConfig => ({
  effects: {
    'nav-slide': {
      keyframeEffect: {
        name: 'nav-slide',
        keyframes: [{ transform: 'translateY(-100%)' }, { transform: 'translateY(0)' }],
      },
      duration: 300,
      easing: 'ease-out',
    },
  },
  interactions: [
    {
      key: navbarId,
      selector: '.nav-toggle',
      trigger: 'click',
      effects: [
        {
          key: navbarId,
          selector: '.nav-menu',
          effectId: 'nav-slide',
        },
      ],
    },
  ],
});

// Usage
const navConfig = createNavbarConfig('main-nav');
Interact.create(navConfig);
```

## Advanced Configuration Patterns

TBD

## Performance Considerations

### Lazy Loading Configurations

Load configurations on demand:

```typescript
const loadFeatureConfig = async (featureName: string): Promise<InteractConfig> => {
  const module = await import(`./features/${featureName}/interactions.js`);
  return module.default;
};

// Usage
const heroConfig = await loadFeatureConfig('hero');
Interact.create(heroConfig);
```

## Real-World Example: E-commerce Product Page

```typescript
const productPageConfig: InteractConfig = {
  effects: {
    'product-image-zoom': {
      keyframeEffect: {
        name: 'product-image-zoom',
        keyframes: [{ transform: 'scale(1)' }, { transform: 'scale(1.1)' }],
      },
      duration: 300,
      easing: 'ease-out',
    },
    'add-to-cart-success': {
      keyframeEffect: {
        name: 'add-to-cart-success',
        keyframes: [
          { backgroundColor: '#ef4444', transform: 'scale(1)' },
          { transform: 'scale(1.05)' },
          { backgroundColor: '#10b981', transform: 'scale(1)' },
        ],
      },
      duration: 600,
      easing: 'ease-in-out',
    },
    'review-entrance': {
      keyframeEffect: {
        name: 'review-entrance',
        keyframes: [
          { opacity: '0', transform: 'translateY(20px)' },
          { opacity: '1', transform: 'translateY(0)' },
        ],
      },
      duration: 500,
      easing: 'ease-out',
    },
  },

  conditions: {
    desktop: {
      type: 'media',
      predicate: '(min-width: 1024px)',
    },
    'touch-device': {
      type: 'media',
      predicate: '(hover: none)',
    },
  },

  interactions: [
    // Product image hover (desktop only)
    {
      key: 'product-image',
      trigger: 'hover',
      conditions: ['desktop'],
      effects: [
        {
          key: 'product-image',
          selector: 'img',
          effectId: 'product-image-zoom',
        },
      ],
    },

    // Add to cart success animation
    {
      key: 'add-to-cart-btn',
      trigger: 'click',
      effects: [
        {
          key: 'add-to-cart-btn',
          effectId: 'add-to-cart-success',
        },
      ],
    },

    // Staggered review animations
    {
      key: 'review-1',
      trigger: 'viewEnter',
      params: { threshold: 0.2 },
      effects: [
        {
          key: 'review-1',
          effectId: 'review-entrance',
          delay: 0,
        },
      ],
    },
    {
      key: 'review-2',
      trigger: 'viewEnter',
      params: { threshold: 0.2 },
      effects: [
        {
          key: 'review-2',
          effectId: 'review-entrance',
          delay: 100,
        },
      ],
    },
  ],
};
```

## Advanced Selector Examples

### Card Component with Multiple Interactive Areas

```typescript
const cardConfig: InteractConfig = {
  effects: {
    'card-lift': {
      keyframeEffect: {
        name: 'card-lift',
        keyframes: [
          { transform: 'translateY(0px)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
          { transform: 'translateY(-4px)', boxShadow: '0 8px 16px rgba(0,0,0,0.15)' },
        ],
      },
      duration: 200,
      easing: 'ease-out',
    },
    'image-zoom': {
      keyframeEffect: {
        name: 'image-zoom',
        keyframes: [{ transform: 'scale(1)' }, { transform: 'scale(1.05)' }],
      },
      duration: 300,
      easing: 'ease-out',
    },
    'button-pulse': {
      keyframeEffect: {
        name: 'button-pulse',
        keyframes: [
          { transform: 'scale(1)' },
          { transform: 'scale(1.1)' },
          { transform: 'scale(1)' },
        ],
      },
      duration: 400,
      easing: 'ease-in-out',
    },
  },

  interactions: [
    // Hover on card image triggers card lift
    {
      key: 'product-card',
      selector: '.card-image', // Trigger area: just the image
      trigger: 'hover',
      effects: [
        {
          key: 'product-card',
          selector: '.card-container', // Effect target: entire card
          effectId: 'card-lift',
        },
        {
          key: 'product-card',
          selector: '.card-image img', // Effect target: image itself
          effectId: 'image-zoom',
        },
      ],
    },

    // Click on CTA button
    {
      key: 'product-card',
      selector: '.cta-button', // Trigger area: CTA button
      trigger: 'click',
      effects: [
        {
          key: 'product-card',
          selector: '.cta-button', // Effect target: button itself
          effectId: 'button-pulse',
        },
      ],
    },
  ],
};
```

### Navigation Menu with Nested Selectors

```typescript
const navConfig: InteractConfig = {
  effects: {
    'dropdown-slide': {
      keyframeEffect: {
        name: 'dropdown-slide',
        keyframes: [
          { opacity: '0', transform: 'translateY(-10px)' },
          { opacity: '1', transform: 'translateY(0)' },
        ],
      },
      duration: 250,
      easing: 'ease-out',
    },
    'menu-item-highlight': {
      keyframeEffect: {
        name: 'menu-item-highlight',
        keyframes: [
          { backgroundColor: 'transparent' },
          { backgroundColor: 'rgba(0, 123, 255, 0.1)' },
        ],
      },
      duration: 150,
      easing: 'ease-out',
    },
  },

  interactions: [
    // Hover on main menu items
    {
      key: 'main-nav',
      listContainer: 'nav',
      selector: '.nav-item[data-has-dropdown]', // Only items with dropdowns
      trigger: 'hover',
      effects: [
        {
          key: 'main-nav',
          listContainer: 'nav',
          selector: '.nav-item[data-has-dropdown] .dropdown-menu',
          effectId: 'dropdown-slide',
        },
        {
          key: 'main-nav',
          listContainer: 'nav',
          selector: '.nav-item[data-has-dropdown]',
          effectId: 'menu-item-highlight',
        },
      ],
    },
  ],
};
```

### Gallery with Dynamic Item Selection

```typescript
const galleryConfig: InteractConfig = {
  effects: {
    'image-overlay': {
      keyframeEffect: {
        name: 'image-overlay',
        keyframes: [{ opacity: '0' }, { opacity: '1' }],
      },
      duration: 300,
      easing: 'ease-in-out',
    },
  },

  interactions: [
    // Gallery items with list container and selector
    {
      key: 'image-gallery',
      listContainer: '.gallery-grid', // Container holding all gallery items
      selector: '.gallery-item img', // querySelectorAll finds all matching images as list items
      trigger: 'hover',
      effects: [
        {
          key: 'image-gallery',
          listContainer: '.gallery-grid',
          selector: '.gallery-item .overlay', // querySelectorAll finds all matching overlays as list items
          effectId: 'image-overlay',
        },
      ],
    },
  ],
};
```

## Best Practices

### Configuration Organization

1. **Start simple** - Use inline effects for prototypes
2. **Extract reusable effects** as your project grows
3. **Group by feature** rather than by type

### Accessibility

1. **Use `activate` instead of `click`** for keyboard accessibility (Enter/Space)
2. **Use `interest` instead of `hover`** for keyboard accessibility (Focus)
3. **Or enable `allowA11yTriggers` globally** to make existing triggers accessible

### Performance Tips

1. **Reuse effects** instead of duplicating them
2. **Use conditions** to avoid unnecessary animations
3. **Lazy load** configurations for large applications
4. **Validate in development** to catch errors early

## Next Steps

Now that you understand configuration structure:

- **[Custom Elements](./custom-elements.md)** - Learn about `<interact-element>`
- **[State Management](./state-management.md)** - Advanced state handling
- **[Conditions and Media Queries](./conditions-and-media-queries.md)** - Responsive interactions
