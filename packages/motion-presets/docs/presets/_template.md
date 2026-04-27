# [Animation Name]

> **Template for individual preset documentation. Remove this note when creating actual preset docs.**

[Brief description of what the animation does and its visual effect]

## Overview

**Category**: [Entrance/Ongoing/Scroll/Mouse/Background Scroll]  
**Complexity**: [Simple/Medium/Complex]  
**Performance**: [GPU Optimized/CPU Efficient/Moderate]  
**Mobile Friendly**: [Yes/No/With Optimization]

### Best Use Cases

- [Primary use case]
- [Secondary use case]
- [Third use case]

### Target Elements

- [Type of elements this works best with]
- [Recommended containers/layouts]

## Configuration

### TypeScript Interface

```typescript
export type [AnimationName] = BaseDataItemLike<'[AnimationName]'> & {
  [property]: [type]; // [description]
  [optionalProperty]?: [type]; // [description]
};
```

### Parameters

| Parameter  | Type     | Default     | Description   | Examples           |
| ---------- | -------- | ----------- | ------------- | ------------------ |
| `[param1]` | `[type]` | `[default]` | [Description] | `[example values]` |
| `[param2]` | `[type]` | `[default]` | [Description] | `[example values]` |

### Directional Support (if applicable)

- **Four directions**: `top`, `right`, `bottom`, `left`
- **Eight directions**: Includes corners like `top-right`, `bottom-left`
- **Angles**: Numeric degrees (0° = up, 90° = right, etc.)

## Usage Examples

### Basic Usage

```typescript
import { getWebAnimation } from '@wix/motion';

const animation = getWebAnimation(element, {
  type: '[TimeAnimationOptions/ScrubAnimationOptions]',
  namedEffect: {
    type: '[AnimationName]',
    // Basic configuration
  },
  duration: 1000, // For time-based animations
  easing: 'easeOut',
});

await animation.play();
```

### Advanced Configuration

```typescript
const advancedAnimation = getWebAnimation(element, {
  type: '[TimeAnimationOptions/ScrubAnimationOptions]',
  namedEffect: {
    type: '[AnimationName]',
    [param1]: [value],
    [param2]: [value],
  },
  duration: 1200,
  delay: 200,
  easing: 'backOut',
});
```

### CSS Mode (if supported)

```typescript
import { getCSSAnimation } from '@wix/motion';

const cssRules = getCSSAnimation('elementId', {
  type: 'TimeAnimationOptions',
  namedEffect: { type: '[AnimationName]' },
  duration: 800,
});

// Insert CSS rules into stylesheet
```

### Scroll Animation (if applicable)

```typescript
const animation = getWebAnimation(
  element,
  {
    type: 'ScrubAnimationOptions',
    namedEffect: {
      type: '[AnimationName]',
      [scrollSpecificParams]: [values],
    },
  },
  {
    trigger: 'view-progress',
    element,
  },
);
```

### Mouse Animation (if applicable)

```typescript
const mouseAnimation = getWebAnimation(
  element,
  {
    type: 'ScrubAnimationOptions',
    namedEffect: {
      type: '[AnimationName]',
      [mouseSpecificParams]: [values],
    },
  },
  {
    trigger: 'pointer-move',
    element: containerElement,
  },
);
```

## Common Patterns

### [Pattern Name 1]

```typescript
// [Description of when to use this pattern]
const [patternExample] = getWebAnimation(element, {
  // Configuration for this pattern
});
```

### [Pattern Name 2]

```typescript
// [Description of when to use this pattern]
const [patternExample] = getWebAnimation(element, {
  // Configuration for this pattern
});
```

### Staggered Animation (if applicable)

```typescript
// [Description of staggering approach]
elements.forEach((el, index) => {
  const animation = getWebAnimation(el, {
    type: 'TimeAnimationOptions',
    namedEffect: { type: '[AnimationName]' },
    duration: 600,
    delay: index * 100, // 100ms stagger
  });
  animation.play();
});
```

## Framework Integration

### React

```typescript
import React, { useEffect, useRef } from 'react';
import { getWebAnimation } from '@wix/motion';

function Animated[Component]({ children }) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const animation = getWebAnimation(elementRef.current, {
      type: 'TimeAnimationOptions',
      namedEffect: { type: '[AnimationName]' },
      duration: 800
    });

    animation.play();

    return () => animation.cancel();
  }, []);

  return (
    <div ref={elementRef}>
      {children}
    </div>
  );
}
```

### Vue

```vue
<template>
  <div ref="element">
    <slot />
  </div>
</template>

<script>
import { getWebAnimation } from '@wix/motion';

export default {
  mounted() {
    const animation = getWebAnimation(this.$refs.element, {
      type: 'TimeAnimationOptions',
      namedEffect: { type: '[AnimationName]' },
      duration: 800,
    });

    animation.play();
  },
};
</script>
```

## Performance Tips

- [Performance tip 1]
- [Performance tip 2]
- [Performance tip 3]

### Mobile Optimization

- [Mobile-specific optimization]
- [Reduced motion alternative]
- [Battery-conscious approach]

## Accessibility

### Reduced Motion Support

```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  // Alternative approach or disabled animation
} else {
  // Full animation experience
}
```

### Focus Management (if applicable)

- [Guidelines for maintaining focus]
- [Screen reader considerations]

## Related Animations

### Same Category

- **[Related Animation 1]** - [Brief comparison]
- **[Related Animation 2]** - [Brief comparison]

### Other Categories

- **[Cross-category Animation 1]** - [When to use instead]
- **[Cross-category Animation 2]** - [How to combine]

### Complementary Effects

- **[Animation that works well before this]**
- **[Animation that works well after this]**
- **[Animation that works well alongside this]**

## Troubleshooting

### Common Issues

- **[Issue 1]**: [Solution]
- **[Issue 2]**: [Solution]
- **[Issue 3]**: [Solution]

### Debug Tips

- [Debug tip 1]
- [Debug tip 2]

---

## Interactive Example

▶️ **[Try it in Storybook](../../playground/)** - [Link to specific story if available]

---

**[Back to [Category] Animations](../[category]/) | [Back to All Presets](../)**
