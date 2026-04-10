# Examples & Patterns

Practical examples and common interaction patterns for `@wix/interact`. All examples are ready to copy and use in your projects.

## Quick Start Examples

### Basic Entrance Animation

```typescript
import { Interact } from '@wix/interact/web';

const config = {
  interactions: [
    {
      trigger: 'viewEnter',
      key: 'hero',
      effects: [{ effectId: 'fade-in' }],
    },
  ],
  effects: {
    'fade-in': {
      duration: 1000,
      keyframeEffect: {
        name: 'fade-in',
        keyframes: [
          { opacity: 0, transform: 'translateY(20px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
      },
    },
  },
};

Interact.create(config);
```

```html
<interact-element data-interact-key="hero">
  <div class="hero-content">Welcome to our site!</div>
</interact-element>
```

## Example Categories

### 🎬 **Entrance Animations**

Perfect for landing pages and content reveals.

- [**Fade Animations**](entrance-animations.md#fade) - Opacity transitions
- [**Slide Animations**](entrance-animations.md#slide) - Directional movement
- [**Scale Animations**](entrance-animations.md#scale) - Size transitions
- [**Rotate Animations**](entrance-animations.md#rotate) - Rotation effects
- [**Complex Sequences**](entrance-animations.md#sequences) - Multi-step animations

### 🖱️ **Click Interactions**

Interactive elements that respond to user clicks.

- [**Button Feedback**](click-interactions.md#buttons) - Visual feedback on press
- [**Toggle States**](click-interactions.md#toggles) - On/off interactions
- [**Progressive Disclosure**](click-interactions.md#disclosure) - Reveal content
- [**Action Confirmations**](click-interactions.md#confirmations) - Success states

### 🎯 **Hover Effects**

Subtle feedback for interactive elements.

- [**Card Hover Effects**](hover-effects.md#cards) - Elevation and highlighting
- [**Button Hover States**](hover-effects.md#buttons) - Interactive feedback
- [**Image Overlays**](hover-effects.md#images) - Content reveals
- [**Navigation Hovers**](hover-effects.md#navigation) - Menu interactions

### 📜 **Scroll Animations**

Effects triggered by scroll position and progress.

- [**Parallax Effects**](scroll-animations.md#parallax) - Background movement
- [**Progress Indicators**](scroll-animations.md#progress) - Scroll-based bars
- [**Staggered Reveals**](scroll-animations.md#staggered) - Sequential animations
- [**Scroll-driven Timelines**](scroll-animations.md#timelines) - Complex sequences

### 📱 **Responsive Interactions**

Adaptive animations for different screen sizes.

- [**Mobile-first Animations**](responsive-interactions.md#mobile) - Touch-friendly effects
- [**Desktop Enhancements**](responsive-interactions.md#desktop) - Mouse-specific interactions
- [**Conditional Effects**](responsive-interactions.md#conditional) - Media query based
- [**Container Queries**](responsive-interactions.md#container) - Element-based conditions

### 📋 **List Patterns**

Comprehensive patterns for lists and dynamic content.

- [**Entrance Animations**](list-patterns.md#entrance-animations) - Fade, slide, scale effects
- [**Staggered Effects**](list-patterns.md#staggered-effects) - Progressive delays and waves
- [**Hover Interactions**](list-patterns.md#hover-interactions) - Card lifts, zooms, overlays
- [**Dynamic Management**](list-patterns.md#dynamic-list-management) - Add/remove animations
- [**Infinite Scroll**](list-patterns.md#infinite-scroll) - Load more patterns
- [**Filtering & Sorting**](list-patterns.md#filtering--sorting) - Animated transitions
- [**Grid Layouts**](list-patterns.md#grid-layouts) - Masonry and responsive grids
- [**Real-World Examples**](list-patterns.md#real-world-examples) - E-commerce and more

### 🎼 **Sequence Animations**

Coordinated multi-element animations with staggered timing via `Interaction.sequences`.

- [**Staggered List Entrance**](list-patterns.md#sequence-based-staggering) - Easing-driven stagger for list items
- [**Cross-Element Orchestration**](../guides/sequences.md#cross-element-sequences) - Effects targeting different keys in one sequence
- [**Click-Triggered Sequence**](../guides/sequences.md#click-triggered-multi-element-orchestration) - Button-triggered multi-element cascade
- [**Easing Comparison**](../guides/sequences.md#what-is-a-sequence) - Linear vs quadIn vs sineOut offset curves

## Advanced Patterns

### 🔄 **Animation Sequences**

Complex multi-step animations. For staggered coordinated sequences, see [Sequence Animations](#-sequence-animations) above.

- [**Chained Effects**](advanced-patterns.md#chaining) - Sequential animations
- [**Parallel Effects**](advanced-patterns.md#parallel) - Simultaneous animations
- [**Conditional Sequences**](advanced-patterns.md#conditional) - Branching logic
- [**Loop Animations**](advanced-patterns.md#loops) - Repeating effects

### 🎭 **State Management**

Managing complex interaction states.

- [**Multi-state Elements**](advanced-patterns.md#multi-state) - Multiple effect states
- [**State Transitions**](advanced-patterns.md#transitions) - Smooth state changes
- [**Global State**](advanced-patterns.md#global) - Cross-element coordination
- [**Persistent States**](advanced-patterns.md#persistent) - Maintaining state

### 🧩 **Component Patterns**

Reusable interaction components.

- [**Interactive Cards**](component-patterns.md#cards) - Complete card interactions
- [**Navigation Components**](component-patterns.md#navigation) - Menu and nav effects
- [**Form Elements**](component-patterns.md#forms) - Input and validation feedback
- [**Modal Dialogs**](component-patterns.md#modals) - Overlay interactions

## Real-world Examples

### E-commerce

- [**Product Gallery**](real-world.md#product-gallery) - Image hover and click effects
- [**Add to Cart**](real-world.md#add-to-cart) - Button feedback and confirmation
- [**Shopping Cart**](real-world.md#shopping-cart) - Item addition/removal animations

### Landing Pages

- [**Hero Sections**](real-world.md#hero-sections) - Impressive entrance animations
- [**Feature Highlights**](real-world.md#features) - Scroll-triggered reveals
- [**Call-to-Action**](real-world.md#cta) - Engaging button interactions

### Dashboards

- [**Data Visualization**](real-world.md#data-viz) - Chart and graph animations
- [**Status Updates**](real-world.md#status) - Real-time feedback effects
- [**Interactive Tables**](real-world.md#tables) - Row hover and selection

## Performance Examples

### Optimized Animations

- [**GPU Acceleration**](performance-examples.md#gpu) - Transform-based animations
- [**Efficient Selectors**](performance-examples.md#selectors) - Optimal element targeting
- [**Minimal Reflows**](performance-examples.md#reflows) - Layout-safe animations
- [**Debounced Events**](performance-examples.md#debouncing) - Event optimization

## Code Templates

### Basic Templates

```typescript
// Entrance animation template
const entranceConfig = {
  interactions: [
    {
      trigger: 'viewEnter',
      key: 'element',
      params: { type: 'once', threshold: 0.1 },
      effects: [{ effectId: 'entrance-effect' }],
    },
  ],
  effects: {
    'entrance-effect': {
      duration: 800,
      easing: 'ease-out',
      keyframeEffect: {
        name: 'entrance-effect', // Put your effect's name here
        keyframes: [
          // Add your keyframes here
        ],
      },
    },
  },
};

// Hover interaction template
const hoverConfig = {
  interactions: [
    {
      trigger: 'hover',
      key: 'element',
      effects: [{ effectId: 'hover-effect' }],
    },
  ],
  effects: {
    'hover-effect': {
      duration: 200,
      keyframeEffect: {
        name: 'hover-effect', // Put your effect's name here
        keyframes: [
          // Add your hover keyframes here
        ],
      },
    },
  },
};
```

## Testing Examples

### Unit Tests

- [**Testing Configurations**](testing-examples.md#config) - Validate interaction setup
- [**Mock Animations**](testing-examples.md#mocks) - Testing without real animations
- [**State Assertions**](testing-examples.md#state) - Verify effect states

### Integration Tests

- [**End-to-end Tests**](testing-examples.md#e2e) - Full interaction testing
- [**Performance Tests**](testing-examples.md#performance) - Animation performance
- [**Accessibility Tests**](testing-examples.md#a11y) - Inclusive interaction testing

## Next Steps

- **Try the Examples** - Copy and modify examples for your use case
- **Explore Patterns** - Learn from common interaction patterns
- **Check Performance** - Use the performance examples for optimization
- **Read the Guides** - Understand the concepts behind the examples

For more detailed information, see the [API Reference](../api/README.md) or [Integration Guides](../integration/README.md).
