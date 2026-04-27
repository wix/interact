# FadeIn

Simple opacity transition that brings elements into view with a clean, professional appearance.

## Overview

**Category**: Entrance  
**Complexity**: Simple  
**Performance**: GPU Optimized  
**Mobile Friendly**: Yes

### Best Use Cases

- Subtle content reveals for professional interfaces
- Modal and overlay appearances
- Loading state transitions
- Progressive disclosure in forms and wizards

### Target Elements

- Any DOM element requiring gentle introduction
- Content blocks, cards, and panels
- Text elements and typography
- Images and media that should appear smoothly

## Configuration

### TypeScript Interface

```typescript
export type FadeIn = BaseDataItemLike<'FadeIn'>;
```

### Parameters

FadeIn has no configurable parameters - it provides a pure opacity transition from 0 to 1.

| Parameter | Type | Default | Description                      | Examples |
| --------- | ---- | ------- | -------------------------------- | -------- |
| _None_    | -    | -       | FadeIn uses no custom parameters | -        |

## Usage Examples

### Basic Usage

```typescript
import { getWebAnimation } from '@wix/motion';

const animation = getWebAnimation(element, {
  type: 'TimeAnimationOptions',
  namedEffect: {
    type: 'FadeIn',
  },
  duration: 600,
  easing: 'easeOut',
});

await animation.play();
```

### Advanced Configuration

```typescript
// Slower, more dramatic fade
const dramaticFade = getWebAnimation(element, {
  type: 'TimeAnimationOptions',
  namedEffect: { type: 'FadeIn' },
  duration: 1200,
  delay: 300,
  easing: 'quintOut',
});

// Quick, snappy fade
const quickFade = getWebAnimation(element, {
  type: 'TimeAnimationOptions',
  namedEffect: { type: 'FadeIn' },
  duration: 300,
  easing: 'cubicOut',
});
```

### CSS Mode

```typescript
import { getCSSAnimation } from '@wix/motion';

const cssRules = getCSSAnimation('elementId', {
  type: 'TimeAnimationOptions',
  namedEffect: { type: 'FadeIn' },
  duration: 500,
});

// Generates optimized CSS keyframes for better performance
```

## Common Patterns

### Sequential Content Reveal

```typescript
// Reveal content blocks one after another
const contentBlocks = document.querySelectorAll('.content-block');
contentBlocks.forEach((block, index) => {
  getWebAnimation(block, {
    type: 'TimeAnimationOptions',
    namedEffect: { type: 'FadeIn' },
    duration: 500,
    delay: index * 200, // 200ms stagger
  }).play();
});
```

### Modal Backdrop

```typescript
// Fade in modal backdrop
const backdropFade = getWebAnimation(backdrop, {
  type: 'TimeAnimationOptions',
  namedEffect: { type: 'FadeIn' },
  duration: 300,
  easing: 'easeOut',
});

// Fade in modal content with slight delay
const modalFade = getWebAnimation(modalContent, {
  type: 'TimeAnimationOptions',
  namedEffect: { type: 'FadeIn' },
  duration: 400,
  delay: 150,
  easing: 'easeOut',
});
```

### Loading State Transition

```typescript
// Hide loading, show content
async function showContent() {
  // Fade out loading spinner
  await getWebAnimation(loadingSpinner, {
    type: 'TimeAnimationOptions',
    namedEffect: { type: 'FadeIn' }, // Will be reversed
    duration: 200,
    fill: 'backwards',
  }).reverse();

  // Fade in actual content
  await getWebAnimation(content, {
    type: 'TimeAnimationOptions',
    namedEffect: { type: 'FadeIn' },
    duration: 400,
    easing: 'easeOut',
  }).play();
}
```

### Image Gallery Reveal

```typescript
// Reveal images after they load
images.forEach((img, index) => {
  img.addEventListener('load', () => {
    getWebAnimation(img, {
      type: 'TimeAnimationOptions',
      namedEffect: { type: 'FadeIn' },
      duration: 600,
      delay: index * 100,
    }).play();
  });
});
```

## Related Animations

### Same Category

- **[BlurIn](blur-in.md)** - Adds blur-to-focus effect to the fade
- **[DropIn](drop-in.md)** - Combines fade with subtle scale effect

### Other Categories

- **[FadeScroll](../scroll/fade-scroll.md)** - Scroll-driven fade effects
- **[Pulse](../ongoing/pulse.md)** - Ongoing fade-based attention effect

### Complementary Effects

- **Before**: Loading spinners, skeleton screens
- **After**: Content interactions, hover states
- **Alongside**: Background color transitions, shadow animations

## Troubleshooting

### Common Issues

- **Element not visible**: Ensure initial opacity is set to 0 in CSS
- **Animation not smooth**: Check for conflicting CSS transitions
- **Flash of content**: Use `visibility: hidden` initially if needed

### Debug Tips

- Use browser dev tools to inspect animation timeline
- Verify element has proper positioning context
- Check for CSS transform conflicts

---

## Interactive Example

▶️ **[Try it in Storybook](../../playground/)** - Experiment with FadeIn timing and easing

---

**[Back to Entrance Animations](../) | [Back to All Presets](../../)**
