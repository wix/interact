# Integration Guides

Framework-specific integration guides and migration documentation for `@wix/interact`.

## Package Entry Points

`@wix/interact` provides three entry points optimized for different use cases:

| Entry Point           | Use Case           | Key Exports                 |
| --------------------- | ------------------ | --------------------------- |
| `@wix/interact/react` | React applications | `Interact`, `Interaction`   |
| `@wix/interact/web`   | Web Components     | `Interact`                  |
| `@wix/interact`       | Vanilla JS         | `Interact`, `add`, `remove` |

## Framework Integration

### React

- [**React Integration**](react.md) - Complete React setup guide
  - [Interaction Component](react.md#the-interaction-component) - React component for interactive elements
  - [createInteractRef](react.md#the-createinteractref-function) - Ref callback for manual control
  - [Configuration Patterns](react.md#configuration-patterns) - useEffect and custom hooks
  - [TypeScript Support](react.md#typescript-support) - Full type inference
  - [SSR Compatibility](react.md#server-side-rendering-ssr) - Next.js and other SSR frameworks

### Vanilla JavaScript

- [**Vanilla JS Integration**](vanilla-js.md) - Direct DOM usage
  - [Basic Setup](vanilla-js.md#setup) - No framework required
  - [Dynamic Content](vanilla-js.md#dynamic) - Adding interactions to dynamic content
  - [Event Management](vanilla-js.md#events) - Manual event handling
  - [Module Systems](vanilla-js.md#modules) - ES6, CommonJS, UMD usage

### Other Frameworks

- [**Vue.js Integration**](other-frameworks.md#vue) - Vue-specific patterns
- [**Angular Integration**](other-frameworks.md#angular) - Angular service approach
- [**Svelte Integration**](other-frameworks.md#svelte) - Svelte action usage
- [**Web Components**](other-frameworks.md#web-components) - Framework-agnostic usage

## Migration Guides

### From Other Libraries

- [**From GSAP**](migration.md#gsap) - Migrating GSAP animations
- [**From Framer Motion**](migration.md#framer) - React animation migration
- [**From Animate.css**](migration.md#animate-css) - CSS animation migration
- [**From AOS**](migration.md#aos) - Scroll animation migration
- [**From Lottie**](migration.md#lottie) - Complex animation migration

### Version Migration

- [**Upgrading from v0.x**](migration.md#version-upgrade) - Breaking changes and migration path

## Build Tools & Bundlers

### Webpack

- [**Webpack Setup**](build-tools.md#webpack) - Configuration and optimization
- [**Code Splitting**](build-tools.md#code-splitting) - Lazy loading interactions
- [**Bundle Analysis**](build-tools.md#analysis) - Size optimization

### Vite

- [**Vite Configuration**](build-tools.md#vite) - Modern build setup
- [**Development Mode**](build-tools.md#dev-mode) - Fast development experience
- [**Production Optimization**](build-tools.md#production) - Build optimization

### Other Bundlers

- [**Rollup**](build-tools.md#rollup) - Library bundling
- [**Parcel**](build-tools.md#parcel) - Zero-config setup
- [**esbuild**](build-tools.md#esbuild) - Fast builds

## Development Environment

### Testing

- [**Testing Interactions**](testing.md) - Comprehensive testing guide
  - [Unit Testing](testing.md#unit) - Testing individual interactions
  - [Integration Testing](testing.md#integration) - Testing interaction flows
  - [Visual Testing](testing.md#visual) - Animation regression testing
  - [Performance Testing](testing.md#performance) - Animation performance
  - [Accessibility Testing](testing.md#accessibility) - Inclusive testing

### Debugging

- [**Debugging Guide**](debugging.md) - Development tools and techniques
  - [Browser DevTools](debugging.md#devtools) - Inspection and debugging
  - [Animation Inspector](debugging.md#inspector) - Animation debugging
  - [Performance Profiling](debugging.md#profiling) - Performance analysis
  - [Common Issues](debugging.md#issues) - Troubleshooting guide

### Development Tools

- [**Development Workflow**](development-tools.md) - Tools and extensions
- [**Browser Extensions**](development-tools.md#extensions) - Helpful browser tools
- [**VS Code Setup**](development-tools.md#vscode) - Editor configuration
- [**Linting and Formatting**](development-tools.md#linting) - Code quality tools

## Server-Side Rendering

### Next.js

- [**Next.js Integration**](ssr.md#nextjs) - SSR and SSG support
- [**Hydration Issues**](ssr.md#hydration) - Avoiding hydration mismatches
- [**Performance Optimization**](ssr.md#performance) - SSR performance

### Nuxt.js

- [**Nuxt.js Setup**](ssr.md#nuxtjs) - Vue SSR integration
- [**Plugin Configuration**](ssr.md#plugins) - Nuxt plugin setup

### Universal Considerations

- [**SSR Best Practices**](ssr.md#best-practices) - General SSR guidelines
- [**Client-Side Hydration**](ssr.md#hydration-strategies) - Hydration strategies

## Progressive Enhancement

### Core Principles

- [**Progressive Enhancement**](progressive-enhancement.md) - Graceful degradation
- [**Fallback Strategies**](progressive-enhancement.md#fallbacks) - No-JS experience
- [**Feature Detection**](progressive-enhancement.md#detection) - Browser capability detection

### Implementation

- [**CSS Fallbacks**](progressive-enhancement.md#css) - CSS-only alternatives
- [**Reduced Motion**](progressive-enhancement.md#reduced-motion) - Accessibility preferences
- [**Network Awareness**](progressive-enhancement.md#network) - Adaptive loading

## Browser Support

### Compatibility

- [**Browser Support Matrix**](browser-support.md) - Supported browsers
- [**Polyfills**](browser-support.md#polyfills) - Required polyfills for older browsers
- [**Feature Detection**](browser-support.md#detection) - Runtime capability detection

### Legacy Support

- [**Internet Explorer**](browser-support.md#ie) - IE11 support (with polyfills)
- [**Mobile Browsers**](browser-support.md#mobile) - iOS Safari, Chrome Mobile
- [**Progressive Enhancement**](browser-support.md#enhancement) - Graceful fallbacks

## Performance Optimization

### Bundle Optimization

- [**Tree Shaking**](performance.md#tree-shaking) - Eliminating unused code
- [**Dynamic Imports**](performance.md#dynamic-imports) - Lazy loading
- [**Bundle Analysis**](performance.md#analysis) - Size optimization

### Runtime Performance

- [**Animation Performance**](performance.md#animation) - Smooth animations
- [**Memory Management**](performance.md#memory) - Avoiding memory leaks
- [**Event Optimization**](performance.md#events) - Efficient event handling

## Deployment

### CDN Usage

- [**CDN Integration**](deployment.md#cdn) - Using with CDNs
- [**Caching Strategies**](deployment.md#caching) - Optimal caching

### Production Checklist

- [**Pre-deployment Checklist**](deployment.md#checklist) - Production readiness
- [**Monitoring**](deployment.md#monitoring) - Performance monitoring
- [**Error Tracking**](deployment.md#errors) - Error handling in production

## Quick Reference

### Installation Commands

```bash
# npm
npm install @wix/interact

# yarn
yarn add @wix/interact

# pnpm
pnpm add @wix/interact
```

### Entry Point Imports

```typescript
// React applications (recommended for React)
import { Interact, Interaction, createInteractRef, InteractRef } from '@wix/interact/react';

// Web Components
import { Interact, add, remove } from '@wix/interact/web';

// Vanilla JavaScript
import { Interact, add, remove } from '@wix/interact';
```

### Basic Integration

**React:**

```tsx
import { useEffect } from 'react';
import { Interact, Interaction } from '@wix/interact/react';

const config = {
  /* your config */
};

function App() {
  useEffect(() => {
    const instance = Interact.create(config);
    return () => instance.destroy();
  }, []);

  return (
    <Interaction tagName="div" interactKey="my-element">
      Interactive content
    </Interaction>
  );
}
```

**Web Components:**

```typescript
import { Interact } from '@wix/interact/web';

const config = {
  /* your config */
};

// Initialize
Interact.create(config);
```

```html
<interact-element data-interact-key="my-element">
  <div>Interactive content</div>
</interact-element>
```

**Vanilla:**

```typescript
import { Interact, add } from '@wix/interact';

const config = {
  /* your config */
};

// Initialize
Interact.create(config);

add(document.querySelector('[data-interact-key="my-element"]'));
```

```html
<div data-interact-key="my-element">Interactive content</div>
```

**Vue:**

```vue
<template>
  <interact-element data-interact-key="my-element">
    <div>Interactive content</div>
  </interact-element>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { Interact } from '@wix/interact/web';

const config = {
  /* your config */
};

onMounted(() => {
  Interact.create(config);
});

onUnmounted(() => {
  Interact.destroy();
});
</script>
```

**Angular:**

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Interact } from '@wix/interact/web';

@Component({
  template: `
    <interact-element data-interact-key="my-element">
      <div>Interactive content</div>
    </interact-element>
  `,
})
export class MyComponent implements OnInit, OnDestroy {
  ngOnInit() {
    Interact.create(config);
  }

  ngOnDestroy() {
    Interact.destroy();
  }
}
```

For detailed examples and step-by-step instructions, explore the specific integration guides above.
