# Pulse

Smooth scaling animation that creates a rhythmic breathing effect. Perfect for call-to-action buttons, notifications, and elements requiring gentle attention.

## Overview

**Category**: Ongoing  
**Complexity**: Simple  
**Performance**: GPU Optimized  
**Mobile Friendly**: Yes

### Best Use Cases

- Call-to-action buttons and primary actions
- Notification badges and indicators
- Loading states and processing indicators
- Heartbeat effects and status indicators
- Gentle attention-seeking elements

### Target Elements

- Buttons, badges, and small interactive elements
- Icons and status indicators
- Small to medium-sized content blocks
- Elements requiring subtle emphasis

## Configuration

### TypeScript Interface

```typescript
export type Pulse = BaseDataItemLike<'Pulse'> & {
  intensity?: number;
};
```

### Parameters

| Parameter        | Type     | Default | Description                                  | Examples                   |
| ---------------- | -------- | ------- | -------------------------------------------- | -------------------------- |
| `intensity`      | `number` | `1.0`   | Multiplier for scale amount                  | `0.5`, `1.0`, `1.5`, `2.0` |
| `iterationDelay` | `number` | `0`     | Idle time (ms) appended after each iteration | `0`, `500`, `1000`         |

### Intensity Control

The `intensity` parameter multiplies the base scale amount:

- `intensity: 0.5` - Half the normal scale change
- `intensity: 1.0` - Standard scale change (default)
- `intensity: 1.5` - 50% more scale change
- `intensity: 2.0` - Double the scale change

## Usage Examples

### Basic Usage

```typescript
import { getWebAnimation } from '@wix/motion';

const animation = getWebAnimation(element, {
  type: 'TimeAnimationOptions',
  namedEffect: {
    type: 'Pulse',
  },
  duration: 1500,
  iterations: Infinity,
  alternate: true,
});

await animation.play();
```

### Intensity Customization

```typescript
// Fine-tuned pulse with custom intensity
const customPulse = getWebAnimation(element, {
  type: 'TimeAnimationOptions',
  namedEffect: {
    type: 'Pulse',
    intensity: 0.7,
  },
  duration: 1800,
  iterations: Infinity,
  alternate: true,
});

// Exaggerated pulse for dramatic effect
const dramaticPulse = getWebAnimation(element, {
  type: 'TimeAnimationOptions',
  namedEffect: {
    type: 'Pulse',
    intensity: 2.5,
  },
  duration: 1200,
  iterations: Infinity,
  alternate: true,
});
```

### Duration Variations

```typescript
// Fast heartbeat effect
const heartbeat = getWebAnimation(element, {
  type: 'TimeAnimationOptions',
  namedEffect: {
    type: 'Pulse',
  },
  duration: 800, // Fast pulse
  iterations: Infinity,
  alternate: true,
});

// Slow breathing effect
const breathe = getWebAnimation(element, {
  type: 'TimeAnimationOptions',
  namedEffect: {
    type: 'Pulse',
  },
  duration: 3000, // Slow, relaxed pulse
  iterations: Infinity,
  alternate: true,
});
```

## Common Patterns

### Call-to-Action Button

```typescript
// CTA button that pulses to draw attention
function createPulsingCTA(button) {
  const pulseAnimation = getWebAnimation(button, {
    type: 'TimeAnimationOptions',
    namedEffect: {
      type: 'Pulse',
      intensity: 1.2,
    },
    duration: 1500,
    iterations: Infinity,
    alternate: true,
  });

  // Start pulsing
  pulseAnimation.play();

  // Stop pulsing on interaction
  button.addEventListener('mouseenter', () => {
    pulseAnimation.pause();
  });

  button.addEventListener('mouseleave', () => {
    pulseAnimation.play();
  });

  return pulseAnimation;
}
```

### Notification Badge

```typescript
// Badge that pulses when there are new notifications
class NotificationBadge {
  constructor(element) {
    this.element = element;
    this.pulseAnimation = null;
    this.count = 0;
  }

  updateCount(newCount) {
    this.count = newCount;

    if (newCount > 0) {
      this.startPulsing();
    } else {
      this.stopPulsing();
    }
  }

  startPulsing() {
    if (this.pulseAnimation) return;

    this.pulseAnimation = getWebAnimation(this.element, {
      type: 'TimeAnimationOptions',
      namedEffect: {
        type: 'Pulse',
        intensity: 1.3,
      },
      duration: 1000,
      iterations: Infinity,
      alternate: true,
    });

    this.pulseAnimation.play();
  }

  stopPulsing() {
    if (this.pulseAnimation) {
      this.pulseAnimation.cancel();
      this.pulseAnimation = null;
    }
  }
}
```

### Loading Indicator

```typescript
// Pulse-based loading indicator
function createLoadingPulse(element) {
  return getWebAnimation(element, {
    type: 'TimeAnimationOptions',
    namedEffect: {
      type: 'Pulse',
      intensity: 1.5,
    },
    duration: 1200,
    iterations: Infinity,
    alternate: true,
    easing: 'easeInOut',
  });
}

// Usage with loading states
async function performAsyncOperation() {
  const loadingElement = document.querySelector('.loading-indicator');
  const pulseAnimation = createLoadingPulse(loadingElement);

  pulseAnimation.play();

  try {
    await someAsyncOperation();
  } finally {
    pulseAnimation.cancel();
  }
}
```

### Status Indicator

```typescript
// Server status indicator with different pulse patterns
function createStatusIndicator(element, status) {
  const configs = {
    online: {
      namedEffect: { type: 'Pulse', intensity: 0.8 },
      duration: 2000,
    },
    warning: {
      namedEffect: { type: 'Pulse', intensity: 1.2 },
      duration: 1000,
    },
    error: {
      namedEffect: { type: 'Pulse', intensity: 1.5 },
      duration: 600,
    },
  };

  const config = configs[status] || configs.online;

  return getWebAnimation(element, {
    type: 'TimeAnimationOptions',
    ...config,
    iterations: Infinity,
    alternate: true,
  });
}
```

### Heartbeat Effect

```typescript
// Medical or fitness app heartbeat visualization
function createHeartbeat(element, bpm = 60) {
  const durationMs = (60 / bpm) * 1000; // Convert BPM to milliseconds

  return getWebAnimation(element, {
    type: 'TimeAnimationOptions',
    namedEffect: {
      type: 'Pulse',
      intensity: 1.8,
    },
    duration: durationMs / 2, // Each pulse is half the beat duration
    iterations: Infinity,
    alternate: true,
    easing: 'easeInOut',
  });
}

// Usage
const heartIcon = document.querySelector('.heart-icon');
const heartbeat = createHeartbeat(heartIcon, 72); // 72 BPM
heartbeat.play();
```

## Related Animations

### Same Category

- **[Breathe](breathe.md)** - Combines scaling with gentle movement
- **[Bounce](bounce.md)** - More dynamic vertical movement
- **[Rubber](rubber.md)** - Elastic scaling variation

### Other Categories

- **[DropIn](../entrance/drop-in.md)** - One-time scale entrance
- **[ScaleMouse](../mouse/scale-mouse.md)** - Mouse-driven scaling

### Complementary Effects

- **Before**: Element reveals, entrance animations
- **After**: Click animations, state changes
- **Alongside**: Color transitions, glow effects

## Troubleshooting

### Common Issues

- **Pulse too aggressive**: Reduce intensity
- **Animation conflicts**: Check for competing CSS transitions
- **Performance problems**: Limit number of concurrent pulses

### Debug Tips

- Monitor frame rate with browser dev tools
- Use animation inspector to verify timing
- Test on actual devices for performance validation

---

## Interactive Example

▶️ **[Try it in Storybook](../../playground/)** - Experiment with Pulse intensity and timing

---

**[Back to Ongoing Animations](../) | [Back to All Presets](../../)**
