# Radio Buttons

A radio button group where clicking a button springs the selection dot in with a bouncy keyframe animation, and hovering scales the indicator.

**Tags:** click, hover, transform, scale, flex, list

## Markup

```html
<div class="radio-group" role="radiogroup" aria-label="Notification preferences">
  <span
    style="font-size:12px;font-weight:300;letter-spacing:0.08em;text-transform:uppercase;padding:0 4px 10px"
    >Notifications</span
  >
  <interact-element data-interact-key="radio-1">
    <button type="button" class="radio-btn selected" role="radio" aria-checked="true">
      <div class="radio-indicator">
        <div class="ring"></div>
        <svg class="ring-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>
        <div class="dot"></div>
      </div>
      <span class="label">All activity</span>
    </button>
  </interact-element>
  <interact-element data-interact-key="radio-2">
    <button type="button" class="radio-btn" role="radio" aria-checked="false">
      <div class="radio-indicator">
        <div class="ring"></div>
        <svg class="ring-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>
        <div class="dot"></div>
      </div>
      <span class="label">Important only</span>
    </button>
  </interact-element>
  <interact-element data-interact-key="radio-3">
    <button type="button" class="radio-btn" role="radio" aria-checked="false">
      <div class="radio-indicator">
        <div class="ring"></div>
        <svg class="ring-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>
        <div class="dot"></div>
      </div>
      <span class="label">Mentions &amp; replies</span>
    </button>
  </interact-element>
  <interact-element data-interact-key="radio-4">
    <button type="button" class="radio-btn" role="radio" aria-checked="false">
      <div class="radio-indicator">
        <div class="ring"></div>
        <svg class="ring-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>
        <div class="dot"></div>
      </div>
      <span class="label">Direct messages only</span>
    </button>
  </interact-element>
  <interact-element data-interact-key="radio-5">
    <button type="button" class="radio-btn" role="radio" aria-checked="false">
      <div class="radio-indicator">
        <div class="ring"></div>
        <svg class="ring-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>
        <div class="dot"></div>
      </div>
      <span class="label">Nothing</span>
    </button>
  </interact-element>
</div>
```

## Essential styles

```css
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

interact-element {
  display: contents;
}

body {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.radio-group {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 300px;
}

.radio-btn {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 15px 4px;
  border: none;
  cursor: pointer;
  outline: none;
}

.radio-btn:focus-visible {
  border-radius: 8px;
}

.radio-btn .label {
  font-size: 17px;
  font-weight: 400;
}

.radio-indicator {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.radio-indicator .ring {
  position: absolute;
  inset: 0;
  border: 1.5px solid;
  border-radius: 50%;
  transition: border-color 0.75s cubic-bezier(0.22, 1, 0.36, 1);
}

.radio-indicator .ring-svg {
  position: absolute;
  inset: -2px;
  width: 26px;
  height: 26px;
  transform: rotate(-90deg);
  pointer-events: none;
}

.radio-indicator .ring-svg circle {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-dasharray: 63;
  stroke-dashoffset: 63;
  transition: stroke-dashoffset 0.95s cubic-bezier(0.22, 1, 0.36, 1);
}

.radio-btn.selected .radio-indicator .ring-svg circle {
  stroke-dashoffset: 0;
}

.radio-indicator .dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  transform: scale(0);
  transform-origin: center;
  transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}

.radio-btn.selected .radio-indicator .dot {
  transform: scale(1);
}

@media (prefers-reduced-motion: reduce) {
  .label,
  .ring,
  .ring-svg circle,
  .dot {
    transition: none !important;
  }
}
```

## Interact config

```js
const keys = ['radio-1', 'radio-2', 'radio-3', 'radio-4', 'radio-5'];

{
  effects: {
    'dot-pop': {
      keyframeEffect: {
        name: 'dot-pop',
        keyframes: [
          { transform: 'scale(0)', offset: 0 },
          { transform: 'scale(1.4)', offset: 0.25 },
          { transform: 'scale(0.88)', offset: 0.55 },
          { transform: 'scale(1.08)', offset: 0.8 },
          { transform: 'scale(1)', offset: 1 }
        ]
      },
      duration: 750,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      fill: 'none'
    },
    'hover-indicator': {
      transition: {
        duration: 250,
        easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        styleProperties: [
          { name: 'transform', value: 'scale(1.15)' }
        ]
      }
    }
  },
  interactions: [
    ...keys.flatMap(key => [
      {
        key,
        trigger: 'hover',
        effects: [
          { selector: '.radio-indicator', effectId: 'hover-indicator', stateAction: 'toggle' }
        ]
      },
      {
        key,
        trigger: 'click',
        effects: [
          { selector: '.dot', effectId: 'dot-pop', triggerType: 'repeat' }
        ]
      }
    ])
  ]
}
```

## State management

The `.selected` CSS class drives the SVG stroke-dashoffset reveal, dot scale, ring color, and label color via CSS transitions. This plain JS listener keeps radio group exclusivity in sync.

```js
const buttons = document.querySelectorAll('.radio-btn');

buttons.forEach((btn) => {
  btn.addEventListener('click', () => {
    if (btn.classList.contains('selected')) return;

    buttons.forEach((b) => {
      b.classList.remove('selected');
      b.setAttribute('aria-checked', 'false');
    });

    btn.classList.add('selected');
    btn.setAttribute('aria-checked', 'true');
  });
});
```
