# Capsule Dropdown

A pill-shaped dropdown button that opens a staggered menu on click, with hover effects that highlight the button and individual options in gold.

**Tags:** hover, click, flex, opacity, transform, fade, stagger

## Markup

```html
<div class="dropdown" id="dropdown">
  <interact-element data-interact-key="btn-trigger">
    <button
      type="button"
      class="dropdown-btn"
      aria-expanded="false"
      aria-haspopup="listbox"
      aria-controls="dropdown-listbox"
      id="dropdown-trigger"
    >
      <span class="btn-label">Select Team</span>
      <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  </interact-element>

  <div
    class="dropdown-menu"
    role="listbox"
    id="dropdown-listbox"
    aria-labelledby="dropdown-trigger"
    aria-hidden="true"
  >
    <interact-element data-interact-key="opt-1-trigger">
      <div class="dropdown-option" role="option" data-value="Design" tabindex="-1">
        <svg class="option-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="13.5" cy="6.5" r="2.5" />
          <path d="M17.5 10.5l3-3" />
          <path d="M3 21.5l8.5-8.5" />
          <path d="M11.5 13L15 9.5" />
        </svg>
        Design
      </div>
    </interact-element>
    <interact-element data-interact-key="opt-2-trigger">
      <div class="dropdown-option" role="option" data-value="Engineering" tabindex="-1">
        <svg class="option-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
        Engineering
      </div>
    </interact-element>
    <interact-element data-interact-key="opt-3-trigger">
      <div class="dropdown-option" role="option" data-value="Marketing" tabindex="-1">
        <svg class="option-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
        Marketing
      </div>
    </interact-element>
    <interact-element data-interact-key="opt-4-trigger">
      <div class="dropdown-option" role="option" data-value="Analytics" tabindex="-1">
        <svg class="option-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
        Analytics
      </div>
    </interact-element>
    <interact-element data-interact-key="opt-5-trigger">
      <div class="dropdown-option" role="option" data-value="Support" tabindex="-1">
        <svg class="option-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
        </svg>
        Support
      </div>
    </interact-element>
  </div>
</div>
```

## Essential styles

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

interact-element { display: contents; }

body {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0b0b0b;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  padding: 24px;
}

.dropdown {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dropdown-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 280px;
  height: 60px;
  padding: 0 24px;
  border: 0.5px solid #ffd7823f;
  border-radius: 9999px;
  background: #000;
  color: #a3a3a3;
  font-family: inherit;
  font-size: 15px;
  font-weight: 400;
  cursor: pointer;
  text-align: left;
  -webkit-tap-highlight-color: transparent;
  box-shadow: 0 4px 24px rgba(0,0,0,0.4);
}

.dropdown-btn:focus-visible {
  box-shadow: 0 0 0 3px #ffd782;
}

.dropdown.open .dropdown-btn {
  border-color: #ffd78255;
  color: #ffd782;
}

.dropdown.has-selection .dropdown-btn {
  color: #ffd782;
}

.chevron {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  color: #ffd78266;
  transition: transform 300ms ease;
}

.dropdown.open .chevron {
  color: #ffd782;
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  right: 0;
  border: 0.5px solid #ffd7823f;
  border-radius: 24px;
  background: #000;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-6px);
  transition: opacity 220ms ease, visibility 220ms ease, transform 220ms ease;
  z-index: 100;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 1.5px;
}

.dropdown.open .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-menu > interact-element { --i: 0; }
.dropdown-menu > interact-element:nth-child(2) { --i: 1; }
.dropdown-menu > interact-element:nth-child(3) { --i: 2; }
.dropdown-menu > interact-element:nth-child(4) { --i: 3; }
.dropdown-menu > interact-element:nth-child(5) { --i: 4; }

.dropdown-option {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  height: 38px;
  padding: 0 12px;
  border: none;
  background: transparent;
  color: #a3a3a3;
  font-family: inherit;
  font-size: 14px;
  font-weight: 400;
  text-align: left;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  outline: none;
  border-radius: 16px;
  opacity: 0;
  transform: translateY(-4px);
  transition: opacity 180ms ease-out calc(var(--i) * 40ms),
              transform 180ms ease-out calc(var(--i) * 40ms);
}

.dropdown.open .dropdown-option {
  opacity: 1;
  transform: translateY(0);
}

.dropdown-option:focus-visible {
  box-shadow: inset 0 0 0 2px #ffd782;
}

.dropdown-option .option-icon {
  flex-shrink: 0;
  width: 17px;
  height: 17px;
  color: #a3a3a3;
  opacity: 0.5;
}

.dropdown-option[aria-selected="true"] {
  background: #ffd78210;
  color: #ffd782;
}

.dropdown-option[aria-selected="true"] .option-icon {
  color: #ffd782;
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .dropdown-menu, .dropdown-option, .chevron { transition: none !important; }
}
```

## Interact config

```js
{
  interactions: [
    {
      key: 'btn-trigger',
      trigger: 'hover',
      effects: [
        {
          stateAction: 'toggle',
          transition: {
            duration: 300,
            easing: 'ease',
            styleProperties: [
              { name: 'border-color', value: '#ffd78255' },
              { name: 'color', value: '#ffd782' },
              { name: 'transform', value: 'translateY(-6px)' },
              { name: 'box-shadow', value: '0 4px 20px rgba(0,0,0,0.5), 0 0 5px rgba(255,215,130,0.02)' }
            ]
          }
        },
        {
          stateAction: 'toggle',
          selector: '.chevron',
          transition: {
            duration: 300,
            easing: 'ease',
            styleProperties: [
              { name: 'color', value: '#ffd782' }
            ]
          }
        }
      ]
    },
    ...['opt-1', 'opt-2', 'opt-3', 'opt-4', 'opt-5'].map(id => ({
      key: `${id}-trigger`,
      trigger: 'hover',
      effects: [
        {
          stateAction: 'toggle',
          transition: {
            duration: 200,
            easing: 'ease-out',
            styleProperties: [
              { name: 'background-color', value: '#ffd78210' },
              { name: 'color', value: '#ffd782' }
            ]
          }
        },
        {
          stateAction: 'toggle',
          selector: '.option-icon',
          transition: {
            duration: 200,
            easing: 'ease',
            styleProperties: [
              { name: 'color', value: '#ffd782' },
              { name: 'opacity', value: '1' },
              { name: 'transform', value: 'scale(1.2) rotate(-8deg)' }
            ]
          }
        }
      ]
    })),
  ]
}
```
