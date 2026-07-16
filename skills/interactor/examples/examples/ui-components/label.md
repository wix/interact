# Label

Accessible pill-shaped checkbox labels that scale and highlight on hover, with a checkmark icon revealed via CSS transition when toggled.

**Tags:** hover, click, transform, opacity, scale

## Markup

```html
<nav aria-label="Skill selection" class="pill-container">
  <div class="pill-wrapper">
    <input type="checkbox" id="pill-0" class="hidden-checkbox" checked aria-hidden="true" />
    <interact-element data-interact-key="pill-0">
      <label
        for="pill-0"
        class="pill"
        tabindex="0"
        role="button"
        aria-pressed="true"
        aria-label="Toggle Web Design"
      >
        <span class="pill-inner">
          <svg
            class="check-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Web Design
        </span>
      </label>
    </interact-element>
  </div>
  <div class="pill-wrapper">
    <input type="checkbox" id="pill-1" class="hidden-checkbox" aria-hidden="true" />
    <interact-element data-interact-key="pill-1">
      <label
        for="pill-1"
        class="pill"
        tabindex="0"
        role="button"
        aria-pressed="false"
        aria-label="Toggle App Development"
      >
        <span class="pill-inner">
          <svg
            class="check-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          App Development
        </span>
      </label>
    </interact-element>
  </div>
  <div class="pill-wrapper">
    <input type="checkbox" id="pill-2" class="hidden-checkbox" aria-hidden="true" />
    <interact-element data-interact-key="pill-2">
      <label
        for="pill-2"
        class="pill"
        tabindex="0"
        role="button"
        aria-pressed="false"
        aria-label="Toggle UI/UX"
      >
        <span class="pill-inner">
          <svg
            class="check-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          UI/UX
        </span>
      </label>
    </interact-element>
  </div>
  <div class="pill-wrapper">
    <input type="checkbox" id="pill-3" class="hidden-checkbox" aria-hidden="true" />
    <interact-element data-interact-key="pill-3">
      <label
        for="pill-3"
        class="pill"
        tabindex="0"
        role="button"
        aria-pressed="false"
        aria-label="Toggle Branding &amp; Logo"
      >
        <span class="pill-inner">
          <svg
            class="check-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Branding &amp; Logo
        </span>
      </label>
    </interact-element>
  </div>
  <div class="pill-wrapper">
    <input type="checkbox" id="pill-4" class="hidden-checkbox" checked aria-hidden="true" />
    <interact-element data-interact-key="pill-4">
      <label
        for="pill-4"
        class="pill"
        tabindex="0"
        role="button"
        aria-pressed="true"
        aria-label="Toggle Illustration"
      >
        <span class="pill-inner">
          <svg
            class="check-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Illustration
        </span>
      </label>
    </interact-element>
  </div>
  <div class="pill-wrapper">
    <input type="checkbox" id="pill-5" class="hidden-checkbox" aria-hidden="true" />
    <interact-element data-interact-key="pill-5">
      <label
        for="pill-5"
        class="pill"
        tabindex="0"
        role="button"
        aria-pressed="false"
        aria-label="Toggle Motion Graphics"
      >
        <span class="pill-inner">
          <svg
            class="check-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Motion Graphics
        </span>
      </label>
    </interact-element>
  </div>
</nav>
```

## Essential styles

```css
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  list-style: none;
}

body {
  font-weight: 400;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-x: hidden;
  padding: 20px;
}

interact-element {
  display: inline-flex;
}

.pill-container {
  max-width: 820px;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 24px 16px;
  justify-content: center;
}

@media (min-width: 640px) {
  .pill-container {
    gap: 12px;
    padding: 40px;
  }
}

.pill-wrapper {
  display: flex;
  flex: 0 0 auto;
}

.hidden-checkbox {
  position: absolute;
  opacity: 0;
  pointer-events: none;
  width: 0;
  height: 0;
}

.pill {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  height: 48px;
  padding: 0 30px;
  border-radius: 9999px;
  position: relative;
  user-select: none;
  border: 1.5px solid transparent;
  transform-style: preserve-3d;
  transition: border-color 0.3s ease;
  outline: none;
}

@media (min-width: 640px) {
  .pill {
    height: 56px;
    padding: 0 40px;
  }
}

.hidden-checkbox:checked + interact-element .pill {
  border-width: 0.5px;
}

.pill-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  font-size: 14px;
  font-weight: 400;
  white-space: nowrap;
}

@media (min-width: 640px) {
  .pill-inner {
    font-size: 16px;
  }
}

.check-icon {
  width: 0;
  height: 13px;
  opacity: 0;
  overflow: hidden;
  flex-shrink: 0;
  transition:
    width 0.3s ease,
    opacity 0.25s ease,
    margin 0.3s ease;
}

.hidden-checkbox:checked + interact-element .check-icon {
  width: 13px;
  opacity: 1;
  margin-right: 6px;
  transition-delay: 0.08s;
}

@media (prefers-reduced-motion: reduce) {
  .pill,
  .check-icon {
    transition: none !important;
  }
}
```

## Interact config

```js
const pillKeys = ['pill-0', 'pill-1', 'pill-2', 'pill-3', 'pill-4', 'pill-5'];

{
  interactions: pillKeys.flatMap((key) => [
    {
      key,
      trigger: 'hover',
      effects: [
        {
          stateAction: 'toggle',
          transition: {
            duration: 250,
            easing: 'ease-out',
            styleProperties: [{ name: 'transform', value: 'scale(1.04)' }],
          },
        },
      ],
    },
  ]);
}
```
