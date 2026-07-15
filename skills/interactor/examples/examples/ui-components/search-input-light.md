# Search Input Light

A collapsed search pill icon that expands into a full input bar on click, revealing a staggered suggestion list with hover transitions on both the pill and each suggestion item.

**Tags:** click, hover, opacity, transform, reveal, stagger, fade, border-radius

## Markup

```html
<div class="search-wrapper">
  <interact-element data-interact-key="search-pill">
    <div class="search-pill" id="search-pill">
      <interact-element data-interact-key="search-icon">
        <button type="button" class="search-icon-btn" id="search-icon-btn" aria-label="Search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </interact-element>
      <div class="input-wrap" id="input-wrap">
        <label for="search-input" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">Search</label>
        <input
          type="search"
          class="search-input"
          id="search-input"
          placeholder="Search..."
          autocomplete="off"
          spellcheck="false"
          tabindex="-1"
        />
      </div>
    </div>
  </interact-element>

  <div class="suggestions" id="suggestions">
    <interact-element data-interact-key="sug-0"><button type="button" class="suggestion-item" style="--i:0">Getting started</button></interact-element>
    <interact-element data-interact-key="sug-1"><button type="button" class="suggestion-item" style="--i:1">API reference</button></interact-element>
    <interact-element data-interact-key="sug-2"><button type="button" class="suggestion-item" style="--i:2">Configuration guide</button></interact-element>
    <interact-element data-interact-key="sug-3"><button type="button" class="suggestion-item" style="--i:3">Troubleshooting</button></interact-element>
    <interact-element data-interact-key="sug-4"><button type="button" class="suggestion-item" style="--i:4">Animation examples</button></interact-element>
    <interact-element data-interact-key="sug-5"><button type="button" class="suggestion-item" style="--i:5">Migration guide</button></interact-element>
    <interact-element data-interact-key="sug-6"><button type="button" class="suggestion-item" style="--i:6">Keyboard shortcuts</button></interact-element>
    <interact-element data-interact-key="sug-7"><button type="button" class="suggestion-item" style="--i:7">FAQ</button></interact-element>
    <div class="no-results" id="no-results">No results</div>
  </div>
</div>
```

## Essential styles

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

interact-element { display: contents; }

body {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e0e0e0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  padding: 24px 24px calc(24px + 18vh) 24px;
}

.search-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.search-pill {
  display: flex;
  align-items: center;
  width: 60px;
  height: 60px;
  padding: 0 8px;
  border-radius: 9999px;
  background: #000;
  border: 1px solid #ffd7823f;
  overflow: clip;
}

.search-pill:focus-within {
  border-color: #ffd78255;
}

.search-icon-btn {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border: none;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
  outline: none;
  color: #ffd782;
}

.search-icon-btn:focus-visible {
  box-shadow: 0 0 0 2px #ffd782;
}

.search-icon-btn svg {
  width: 20px;
  height: 20px;
}

.input-wrap {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  opacity: 0;
}

.input-wrap.active {
  pointer-events: auto;
}

.search-input {
  width: 100%;
  height: 56px;
  border: none;
  background: transparent;
  color: #ffd782;
  font-family: inherit;
  font-size: 15px;
  font-weight: 400;
  outline: none;
  letter-spacing: 0.01em;
}

.search-input::placeholder {
  color: #ffd78244;
}

.search-input::-webkit-search-cancel-button {
  -webkit-appearance: none;
  display: none;
}

.suggestions {
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  width: 340px;
  z-index: 100;
  padding: 4px 0;
  visibility: hidden;
  pointer-events: none;
}

.suggestions.visible {
  visibility: visible;
  pointer-events: auto;
}

.suggestion-item {
  display: flex;
  align-items: center;
  white-space: pre;
  width: 100%;
  height: 42px;
  padding: 0 24px;
  border: none;
  background: transparent;
  color: #52525b;
  font-family: inherit;
  font-size: 14px;
  font-weight: 400;
  text-align: left;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  outline: none;
  border-radius: 12px;
  opacity: 0;
  transform: translateY(-6px);
  transition: opacity 220ms ease-out calc(var(--i, 0) * 45ms),
              transform 220ms ease-out calc(var(--i, 0) * 45ms);
}

.suggestions.visible .suggestion-item:not(.hidden) {
  opacity: 1;
  transform: translateY(0);
}

.suggestion-item.hidden {
  display: none;
}

.suggestion-item:focus-visible {
  box-shadow: inset 0 0 0 2px #ffd782;
}

.suggestion-item .highlight {
  color: #2563eb;
}

.no-results {
  display: none;
  align-items: center;
  justify-content: center;
  height: 42px;
  padding: 0 24px;
  color: #a1a1aa;
  font-size: 13px;
  font-weight: 300;
}

.no-results.shown {
  display: flex;
}

@media (prefers-reduced-motion: reduce) {
  .suggestion-item { transition: none !important; }
}
```

## Interact config

```js
{
  effects: {
    'pill-expand': {
      keyframeEffect: {
        name: 'pill-expand',
        keyframes: [
          { width: '60px', padding: '0 8px', offset: 0 },
          { width: '340px', padding: '0 12px 0 20px', offset: 1 }
        ]
      },
      duration: 600,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      fill: 'both'
    },
    'input-reveal': {
      keyframeEffect: {
        name: 'input-reveal',
        keyframes: [
          { opacity: 0, marginLeft: '0px', offset: 0 },
          { opacity: 0, marginLeft: '0px', offset: 0.35 },
          { opacity: 1, marginLeft: '12px', offset: 1 }
        ]
      },
      duration: 600,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      fill: 'both'
    },
    'border-glow': {
      keyframeEffect: {
        name: 'border-glow',
        keyframes: [
          { borderColor: '#ffd7823f', offset: 0 },
          { borderColor: '#ffd78255', offset: 1 }
        ]
      },
      duration: 600,
      easing: 'ease',
      fill: 'both'
    },
    'icon-spin': {
      keyframeEffect: {
        name: 'icon-spin',
        keyframes: [
          { transform: 'rotate(0deg) scale(1)', offset: 0 },
          { transform: 'rotate(360deg) scale(1.1)', offset: 0.7 },
          { transform: 'rotate(360deg) scale(1)', offset: 1 }
        ]
      },
      duration: 600,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      fill: 'none'
    }
  },
  interactions: [
    {
      key: 'search-icon',
      trigger: 'click',
      effects: [
        { key: 'search-pill', effectId: 'pill-expand', triggerType: 'alternate' },
        { key: 'search-pill', selector: '.input-wrap', effectId: 'input-reveal', triggerType: 'alternate' },
        { key: 'search-pill', effectId: 'border-glow', triggerType: 'alternate' }
      ]
    },
    {
      key: 'search-pill',
      trigger: 'hover',
      effects: [{
        stateAction: 'toggle',
        transition: {
          duration: 300,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          styleProperties: [
            { name: 'border-color', value: '#ffd78255' }
          ]
        }
      }]
    },
    {
      key: 'search-icon',
      trigger: 'hover',
      effects: [{
        stateAction: 'toggle',
        transition: {
          duration: 300,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          styleProperties: [
            { name: 'transform', value: 'rotate(90deg)' }
          ]
        }
      }]
    },
    ...Array.from({ length: 8 }, (_, i) => ({
      key: `sug-${i}`,
      trigger: 'hover',
      effects: [{
        stateAction: 'toggle',
        transition: {
          duration: 200,
          easing: 'ease-out',
          styleProperties: [
            { name: 'background-color', value: 'rgba(0,0,0,0.06)' },
            { name: 'color', value: '#18181b' },
            { name: 'transform', value: 'translateX(4px)' }
          ]
        }
      }]
    }))
  ]
}
```
