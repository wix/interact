# Click Interactions

Click interactions provide immediate feedback and trigger actions. This guide covers patterns using the `click` trigger.

## Table of Contents

- [Button Feedback](#button-feedback)
- [Toggle States](#toggle-states)
- [Progressive Disclosure](#progressive-disclosure)
- [Action Confirmations](#action-confirmations)
- [Modal & Dialog Triggers](#modal--dialog-triggers)
- [Menu Interactions](#menu-interactions)
- [Real-World Examples](#real-world-examples)

## Button Feedback

### Simple Click Pulse

Button pulses when clicked.

```typescript
import { Interact } from '@wix/interact/web';

const config = {
  interactions: [
    {
      key: 'pulse-button',
      trigger: 'click',
      effects: [
        {
          key: 'pulse-button',
          keyframeEffect: {
            name: 'pulse',
            keyframes: [
              { transform: 'scale(1)' },
              { transform: 'scale(0.95)' },
              { transform: 'scale(1)' },
            ],
          },
          duration: 200,
          easing: 'ease-in-out',
        },
      ],
    },
  ],
};

Interact.create(config);
```

```html
<interact-element data-interact-key="pulse-button">
  <button>Click Me</button>
</interact-element>
```

### Ripple Effect

Material design-style ripple on click.

```typescript
{
    key: 'ripple-button',
    trigger: 'click',
    effects: [{
        key: 'ripple-button',
        selector: '.ripple-overlay',
        keyframeEffect: {
            name: 'ripple',
            keyframes: [
                {
                    transform: 'scale(0)',
                    opacity: '0.5'
                },
                {
                    transform: 'scale(2)',
                    opacity: '0'
                }
            ]
        },
        duration: 600,
        easing: 'ease-out'
    }]
}
```

```html
<interact-element data-interact-key="ripple-button">
  <button class="ripple-btn">
    <span class="btn-text">Click Me</span>
    <span class="ripple-overlay"></span>
  </button>
</interact-element>
```

```css
.ripple-btn {
  position: relative;
  overflow: hidden;
}

.ripple-overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  border-radius: 50%;
  background: rgb(255 255 255 / 0.5);
  pointer-events: none;
}
```

### Color Flash

Button flashes color on click.

```typescript
{
    key: 'flash-button',
    trigger: 'click',
    effects: [{
        key: 'flash-button',
        keyframeEffect: {
            name: 'color-flash',
            keyframes: [
                { backgroundColor: '#3b82f6' },
                { backgroundColor: '#10b981' },
                { backgroundColor: '#3b82f6' }
            ]
        },
        duration: 400,
        easing: 'ease-in-out'
    }]
}
```

### Shake on Error

Button shakes when action fails.

```typescript
{
    key: 'shake-button',
    trigger: 'click',
    effects: [{
        key: 'shake-button',
        keyframeEffect: {
            name: 'shake',
            keyframes: [
                { transform: 'translateX(0)' },
                { transform: 'translateX(-10px)' },
                { transform: 'translateX(10px)' },
                { transform: 'translateX(-10px)' },
                { transform: 'translateX(10px)' },
                { transform: 'translateX(0)' }
            ]
        },
        duration: 400,
        easing: 'ease-in-out'
    }]
}
```

## Toggle States

### Simple Toggle

Toggle between two states.

```typescript
{
    key: 'toggle-switch',
    trigger: 'click',
    effects: [{
        key: 'toggle-switch',
        transition: {
            duration: 300,
            easing: 'ease-in-out',
            styleProperties: [
                { name: 'backgroundColor', value: '#10b981' },
                { name: 'transform', value: 'translateX(20px)' }
            ]
        },
        effectId: 'toggle-on'
    }]
}
```

```html
<interact-element data-interact-key="toggle-switch">
  <div class="toggle-container">
    <div class="toggle-knob"></div>
  </div>
</interact-element>
```

```css
.toggle-container {
  width: 48px;
  height: 24px;
  background: #d1d5db;
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.3s;
}

.toggle-knob {
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.3s;
}

interact-element:state(toggle-on) .toggle-container {
  background: #10b981;
}
```

### Checkbox Animation

Custom checkbox with animation.

```typescript
{
    key: 'checkbox',
    trigger: 'click',
    effects: [{
        key: 'checkbox',
        selector: '.checkmark',
        keyframeEffect: {
            name: 'check-draw',
            keyframes: [
                { transform: 'scale(0) rotate(45deg)', opacity: '0' },
                { transform: 'scale(1) rotate(45deg)', opacity: '1' }
            ]
        },
        duration: 300,
        easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        effectId: 'checked'
    }]
}
```

```html
<interact-element data-interact-key="checkbox">
  <label class="checkbox-label">
    <input type="checkbox" hidden />
    <div class="checkbox-box">
      <svg class="checkmark" viewBox="0 0 24 24">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
      </svg>
    </div>
    <span>Accept terms</span>
  </label>
</interact-element>
```

### Like Button

Heart animation for like button.

```typescript
{
    key: 'like-button',
    trigger: 'click',
    effects: [{
        key: 'like-button',
        selector: '.heart-icon',
        keyframeEffect: {
            name: 'heart-beat',
            keyframes: [
                { transform: 'scale(1)', fill: '#9ca3af' },
                { transform: 'scale(1.3)', fill: '#ef4444' },
                { transform: 'scale(1)', fill: '#ef4444' }
            ]
        },
        duration: 400,
        easing: 'ease-out',
        effectId: 'liked'
    }]
}
```

## Progressive Disclosure

### Expand/Collapse Content

Click to reveal hidden content.

```typescript
{
    key: 'accordion-trigger',
    selector: '.accordion-header',
    trigger: 'click',
    effects: [{
        key: 'accordion-trigger',
        selector: '.accordion-content',
        keyframeEffect: {
            name: 'expand',
            keyframes: [
                {
                    maxHeight: '0',
                    opacity: '0',
                    transform: 'translateY(-10px)'
                },
                {
                    maxHeight: '500px',
                    opacity: '1',
                    transform: 'translateY(0)'
                }
            ]
        },
        duration: 400,
        easing: 'ease-out',
        effectId: 'expanded'
    }]
}
```

```html
<interact-element data-interact-key="accordion-trigger">
  <div class="accordion">
    <div class="accordion-header">
      <h3>Click to expand</h3>
      <span class="icon">▼</span>
    </div>
    <div class="accordion-content">
      <p>This content is revealed when clicked</p>
    </div>
  </div>
</interact-element>
```

### Read More Button

Expand text content on click.

```typescript
{
    key: 'read-more',
    selector: '.read-more-btn',
    trigger: 'click',
    effects: [
        // Expand content
        {
            key: 'read-more',
            selector: '.hidden-content',
            keyframeEffect: {
                name: 'reveal-text',
                keyframes: [
                    { maxHeight: '0', opacity: '0' },
                    { maxHeight: '300px', opacity: '1' }
                ]
            },
            duration: 500,
            easing: 'ease-out',
            effectId: 'revealed'
        },
        // Change button text via CSS
        {
            key: 'read-more',
            selector: '.read-more-btn',
            transition: {
                duration: 300,
                styleProperties: [
                    { name: 'transform', value: 'rotate(180deg)' }
                ]
            }
        }
    ]
}
```

### Tab Switching

Switch between tabs on click.

```typescript
const tabsConfig = {
  interactions: [
    {
      key: 'tab-1',
      selector: '.tab-button',
      trigger: 'click',
      effects: [
        {
          key: 'tab-content-1',
          keyframeEffect: {
            name: 'tab-fade-in',
            keyframes: [
              { opacity: '0', transform: 'translateY(10px)' },
              { opacity: '1', transform: 'translateY(0)' },
            ],
          },
          duration: 300,
          easing: 'ease-out',
        },
      ],
    },
    {
      key: 'tab-2',
      selector: '.tab-button',
      trigger: 'click',
      effects: [
        {
          key: 'tab-content-2',
          keyframeEffect: {
            name: 'tab-fade-in',
            keyframes: [
              { opacity: '0', transform: 'translateY(10px)' },
              { opacity: '1', transform: 'translateY(0)' },
            ],
          },
          duration: 300,
          easing: 'ease-out',
        },
      ],
    },
  ],
};
```

## Action Confirmations

### Success Animation

Show success state after action.

```typescript
{
    key: 'submit-btn',
    trigger: 'click',
    effects: [
        // Button color change
        {
            key: 'submit-btn',
            keyframeEffect: {
                name: 'success-flash',
                keyframes: [
                    { backgroundColor: '#3b82f6' },
                    { backgroundColor: '#10b981' }
                ]
            },
            duration: 400,
            easing: 'ease-out',
            effectId: 'submitted'
        },
        // Show checkmark
        {
            key: 'submit-btn',
            selector: '.checkmark-icon',
            keyframeEffect: {
                name: 'checkmark-appear',
                keyframes: [
                    { opacity: '0', transform: 'scale(0)' },
                    { opacity: '1', transform: 'scale(1)' }
                ]
            },
            duration: 300,
            delay: 200,
            easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
        }
    ]
}
```

### Loading State

Show loading spinner on click.

```typescript
{
    key: 'async-button',
    trigger: 'click',
    effects: [
        // Disable button appearance
        {
            key: 'async-button',
            transition: {
                duration: 200,
                styleProperties: [
                    { name: 'opacity', value: '0.6' },
                    { name: 'cursor', value: 'wait' }
                ]
            },
            effectId: 'loading'
        },
        // Show spinner
        {
            key: 'async-button',
            selector: '.spinner',
            keyframeEffect: {
                name: 'spinner-appear',
                keyframes: [
                    { opacity: '0', transform: 'scale(0)' },
                    { opacity: '1', transform: 'scale(1)' }
                ]
            },
            duration: 300,
            easing: 'ease-out'
        }
    ]
}
```

```css
.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

### Copy to Clipboard Feedback

Visual feedback when copying text.

```typescript
{
    key: 'copy-button',
    trigger: 'click',
    effects: [
        {
            key: 'copy-button',
            selector: '.copy-icon',
            keyframeEffect: {
                name: 'copy-bounce',
                keyframes: [
                    { transform: 'scale(1)' },
                    { transform: 'scale(1.2)' },
                    { transform: 'scale(1)' }
                ]
            },
            duration: 300,
            easing: 'ease-out'
        },
        {
            key: 'copy-feedback',
            keyframeEffect: {
                name: 'feedback-appear',
                keyframes: [
                    { opacity: '0', transform: 'translateY(10px)' },
                    { opacity: '1', transform: 'translateY(0)' }
                ]
            },
            duration: 200,
            easing: 'ease-out',
            effectId: 'copied'
        }
    ]
}
```

## Modal & Dialog Triggers

### Open Modal

Click button to show modal with animation.

```typescript
{
    key: 'open-modal-btn',
    trigger: 'click',
    effects: [
        // Show overlay
        {
            key: 'modal-overlay',
            keyframeEffect: {
                name: 'overlay-fade',
                keyframes: [
                    { opacity: '0' },
                    { opacity: '1' }
                ]
            },
            duration: 300,
            easing: 'ease-out'
        },
        // Show modal
        {
            key: 'modal-dialog',
            keyframeEffect: {
                name: 'modal-scale',
                keyframes: [
                    {
                        opacity: '0',
                        transform: 'scale(0.9) translateY(-20px)'
                    },
                    {
                        opacity: '1',
                        transform: 'scale(1) translateY(0)'
                    }
                ]
            },
            duration: 400,
            delay: 100,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
        }
    ]
}
```

### Close Modal

Click to close with exit animation.

```typescript
{
    key: 'close-modal-btn',
    trigger: 'click',
    effects: [
        // Hide modal
        {
            key: 'modal-dialog',
            keyframeEffect: {
                name: 'modal-exit',
                keyframes: [
                    {
                        opacity: '1',
                        transform: 'scale(1)'
                    },
                    {
                        opacity: '0',
                        transform: 'scale(0.9)'
                    }
                ]
            },
            duration: 300,
            easing: 'ease-in'
        },
        // Hide overlay
        {
            key: 'modal-overlay',
            keyframeEffect: {
                name: 'overlay-exit',
                keyframes: [
                    { opacity: '1' },
                    { opacity: '0' }
                ]
            },
            duration: 300,
            delay: 100,
            easing: 'ease-in'
        }
    ]
}
```

### Notification Toast

Show temporary notification on action.

```typescript
{
    key: 'show-toast-btn',
    trigger: 'click',
    effects: [{
        key: 'toast-notification',
        keyframeEffect: {
            name: 'toast-slide-in',
            keyframes: [
                {
                    opacity: '0',
                    transform: 'translateY(100%) scale(0.9)'
                },
                {
                    opacity: '1',
                    transform: 'translateY(0) scale(1)'
                }
            ]
        },
        duration: 400,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
    }]
}
```

## Menu Interactions

### Mobile Menu Toggle

Toggle mobile navigation menu.

```typescript
{
    key: 'menu-toggle',
    trigger: 'click',
    effects: [
        // Hamburger icon animation
        {
            key: 'menu-toggle',
            selector: '.menu-icon',
            keyframeEffect: {
                name: 'icon-transform',
                keyframes: [
                    { transform: 'rotate(0deg)' },
                    { transform: 'rotate(90deg)' }
                ]
            },
            duration: 300,
            easing: 'ease-out',
            effectId: 'menu-open'
        },
        // Menu slide in
        {
            key: 'mobile-menu',
            keyframeEffect: {
                name: 'menu-slide',
                keyframes: [
                    { transform: 'translateX(-100%)' },
                    { transform: 'translateX(0)' }
                ]
            },
            duration: 400,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
        },
        // Overlay fade
        {
            key: 'menu-overlay',
            keyframeEffect: {
                name: 'overlay-fade',
                keyframes: [
                    { opacity: '0' },
                    { opacity: '0.5' }
                ]
            },
            duration: 400,
            easing: 'ease-out'
        }
    ]
}
```

### Dropdown Menu

Click to toggle dropdown.

```typescript
{
    key: 'dropdown-trigger',
    trigger: 'click',
    effects: [
        {
            key: 'dropdown-trigger',
            selector: '.dropdown-menu',
            keyframeEffect: {
                name: 'dropdown-appear',
                keyframes: [
                    {
                        opacity: '0',
                        transform: 'translateY(-10px) scale(0.95)'
                    },
                    {
                        opacity: '1',
                        transform: 'translateY(0) scale(1)'
                    }
                ]
            },
            duration: 200,
            easing: 'ease-out',
            effectId: 'dropdown-open'
        },
        {
            key: 'dropdown-trigger',
            selector: '.arrow-icon',
            keyframeEffect: {
                name: 'arrow-rotate',
                keyframes: [
                    { transform: 'rotate(0deg)' },
                    { transform: 'rotate(180deg)' }
                ]
            },
            duration: 200,
            easing: 'ease-out'
        }
    ]
}
```

## Real-World Examples

### Add to Cart Button

Complete add-to-cart interaction.

```typescript
const addToCartConfig = {
  interactions: [
    {
      key: 'add-to-cart',
      trigger: 'click',
      effects: [
        // Button scale feedback
        {
          key: 'add-to-cart',
          keyframeEffect: {
            name: 'button-press',
            keyframes: [
              { transform: 'scale(1)' },
              { transform: 'scale(0.95)' },
              { transform: 'scale(1)' },
            ],
          },
          duration: 200,
          easing: 'ease-out',
        },
        // Change button color
        {
          key: 'add-to-cart',
          keyframeEffect: {
            name: 'success-color',
            keyframes: [{ backgroundColor: '#3b82f6' }, { backgroundColor: '#10b981' }],
          },
          duration: 300,
          delay: 200,
          easing: 'ease-out',
          effectId: 'added',
        },
        // Show cart badge update
        {
          key: 'cart-badge',
          keyframeEffect: {
            name: 'badge-pop',
            keyframes: [
              { transform: 'scale(1)' },
              { transform: 'scale(1.5)' },
              { transform: 'scale(1)' },
            ],
          },
          duration: 400,
          delay: 300,
          easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        },
        // Show success message
        {
          key: 'success-toast',
          keyframeEffect: {
            name: 'toast-appear',
            keyframes: [
              { opacity: '0', transform: 'translateY(20px)' },
              { opacity: '1', transform: 'translateY(0)' },
            ],
          },
          duration: 300,
          delay: 400,
          easing: 'ease-out',
        },
      ],
    },
  ],
};
```

```html
<interact-element data-interact-key="add-to-cart">
  <button class="add-to-cart-btn">Add to Cart</button>
</interact-element>

<interact-element data-interact-key="cart-badge">
  <div class="cart-icon">
    <span class="badge">2</span>
  </div>
</interact-element>

<interact-element data-interact-key="success-toast">
  <div class="toast">Item added to cart!</div>
</interact-element>
```

### Contact Form Submit

Form submission with validation feedback.

```typescript
const formConfig = {
  interactions: [
    {
      key: 'submit-form',
      trigger: 'click',
      effects: [
        // Disable button
        {
          key: 'submit-form',
          transition: {
            duration: 200,
            styleProperties: [
              { name: 'opacity', value: '0.6' },
              { name: 'cursor', value: 'not-allowed' },
            ],
          },
          effectId: 'submitting',
        },
        // Show loading spinner
        {
          key: 'submit-form',
          selector: '.spinner',
          keyframeEffect: {
            name: 'spinner-show',
            keyframes: [
              { opacity: '0', transform: 'scale(0)' },
              { opacity: '1', transform: 'scale(1)' },
            ],
          },
          duration: 200,
          easing: 'ease-out',
        },
        // Success message (after delay)
        {
          key: 'form-message',
          keyframeEffect: {
            name: 'message-appear',
            keyframes: [
              {
                opacity: '0',
                transform: 'translateY(-10px) scale(0.95)',
              },
              {
                opacity: '1',
                transform: 'translateY(0) scale(1)',
              },
            ],
          },
          duration: 400,
          delay: 1000, // Wait for form processing
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        },
      ],
    },
  ],
};
```

## Best Practices

### Click Feedback Timing

- **Immediate feedback**: 0-100ms (button press)
- **Action completion**: 300-500ms (toggle, modal)
- **Network actions**: Show loading state immediately

### User Experience Tips

✅ **Do:**

- Provide immediate visual feedback
- Use appropriate timing for action type
- Show loading states for async actions
- Provide success/error feedback
- Make interactive elements obvious (cursor, hover states)

❌ **Avoid:**

- Delayed click responses (feels laggy)
- Animations that block user actions
- Multiple rapid clicks without debouncing
- Unclear state changes

## See Also

- [Hover Effects](./hover-effects.md) - Mouse interaction patterns
- [State Management](../guides/state-management.md) - Managing toggle states
- [Understanding Triggers](../guides/understanding-triggers.md) - Click trigger details
