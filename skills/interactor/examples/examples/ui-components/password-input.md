# Password Input

A password field whose eye follows the pointer; activating the eye animates it and toggles native password visibility.

**Tags:** activate, click, interest, hover, pointerMove, customEffect, input

## Markup

```html
<div class="password-control">
  <label class="sr-only" for="password">Password</label>
  <input id="password" type="password" autocomplete="current-password" />
  <interact-element data-interact-key="eye-button">
    <button
      class="eye-button"
      type="button"
      aria-label="Show password"
      aria-pressed="false"
      aria-controls="password"
    >
      <svg class="eye" viewBox="0 0 36 24" aria-hidden="true">
        <path d="M3 12s5-8 15-8 15 8 15 8-5 8-15 8S3 12 3 12Z" fill="none" stroke="currentColor" />
        <circle class="pupil" cx="18" cy="12" r="4" fill="currentColor" />
        <path class="lid" d="M3 12s5-8 15-8 15 8 15 8" fill="none" stroke="currentColor" />
      </svg>
    </button>
  </interact-element>
</div>
```

## Essential styles

```css
interact-element {
  display: contents;
}

.password-control {
  display: flex;
  align-items: center;
  width: min(100%, 20rem);
}

.password-control input {
  min-width: 0;
  min-height: 3rem;
  flex: 1;
}

.eye-button {
  display: grid;
  width: 3rem;
  height: 3rem;
  flex: 0 0 auto;
  place-items: center;
  cursor: pointer;
}

.eye {
  width: 2rem;
  height: 1.5rem;
  overflow: visible;
  transform: scale(1);
}

.lid {
  opacity: 1;
  transform-origin: 18px 12px;
}

.password-control input:focus-visible,
.eye-button:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: clip;
  clip-path: inset(50%);
  white-space: nowrap;
}
```

## Interact config

```js
const togglePassword = (button, progress) => {
  if (progress !== 1) return;

  const input = button.closest('.password-control').querySelector('input');
  const shouldShow = input.type === 'password';
  input.type = shouldShow ? 'text' : 'password';
  button.setAttribute('aria-pressed', String(shouldShow));
  button.setAttribute('aria-label', shouldShow ? 'Hide password' : 'Show password');
};

const trackPupil = (eye, progress) => {
  const pupil = eye.querySelector('.pupil');

  if (progress === null) {
    pupil.setAttribute('cx', '18');
    pupil.setAttribute('cy', '12');
    return;
  }

  pupil.setAttribute('cx', String(18 + (progress.x - 0.5) * 6));
  pupil.setAttribute('cy', String(12 + (progress.y - 0.5) * 3));
};

const config = {
  conditions: {
    'hover-capable': { type: 'media', predicate: '(hover: hover)' },
  },
  interactions: [
    {
      key: 'eye-button',
      trigger: 'interest',
      effects: [
        {
          selector: '.eye',
          stateAction: 'toggle',
          transition: {
            duration: 180,
            easing: 'ease-out',
            styleProperties: [{ name: 'transform', value: 'scale(1.08)' }],
          },
        },
      ],
    },
    {
      key: 'eye-button',
      trigger: 'activate',
      effects: [
        {
          duration: 1,
          triggerType: 'repeat',
          fill: 'both',
          customEffect: togglePassword,
        },
        {
          selector: '.lid',
          stateAction: 'toggle',
          transition: {
            duration: 180,
            easing: 'ease-in-out',
            styleProperties: [{ name: 'transform', value: 'scaleY(0.1)' }],
          },
        },
      ],
    },
    {
      key: 'eye-button',
      trigger: 'pointerMove',
      params: { hitArea: 'root' },
      conditions: ['hover-capable'],
      effects: [
        {
          selector: '.eye',
          customEffect: trackPupil,
          centeredToTarget: true,
          transitionDuration: 120,
          transitionEasing: 'easeOut',
          fill: 'both',
        },
      ],
    },
  ],
};
```
