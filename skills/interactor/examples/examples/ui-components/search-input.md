# Search Input

A native disclosure reveals a search field while Interact expands the control and moves its icon.

**Tags:** activate, click, interest, hover, search, width, transform

## Markup

```html
<interact-element data-interact-key="search">
  <details class="search-control">
    <summary aria-label="Open search">
      <svg
        class="search-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    </summary>
    <div class="input-wrap">
      <label class="sr-only" for="search-input">Search</label>
      <input id="search-input" type="search" autocomplete="off" placeholder="Search…" />
    </div>
  </details>
</interact-element>
```

## Essential styles

```css
interact-element {
  display: contents;
}

.search-control {
  display: grid;
  grid-template-columns: 3rem minmax(0, 1fr);
  align-items: center;
  width: 3rem;
  min-height: 3rem;
  overflow: clip;
}

.search-control summary {
  display: grid;
  width: 3rem;
  height: 3rem;
  place-items: center;
  cursor: pointer;
  list-style: none;
}

.search-control summary:focus-visible,
.search-control input:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

.search-icon {
  width: 1.25rem;
  height: 1.25rem;
  transform: rotate(0);
}

.input-wrap {
  min-width: 0;
  padding-right: 0.5rem;
}

.search-control:not([open]) .input-wrap {
  visibility: hidden;
  pointer-events: none;
}

.input-wrap input {
  width: 100%;
  min-height: 2.5rem;
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
const config = {
  effects: {
    expand: {
      keyframeEffect: {
        name: 'search-expand',
        keyframes: [{ width: '3rem' }, { width: '20rem' }],
      },
      duration: 400,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'both',
      triggerType: 'alternate',
    },
  },
  interactions: [
    {
      key: 'search',
      selector: 'summary',
      trigger: 'activate',
      effects: [{ effectId: 'expand' }],
    },
    {
      key: 'search',
      selector: 'summary',
      trigger: 'interest',
      effects: [
        {
          selector: '.search-icon',
          stateAction: 'toggle',
          transition: {
            duration: 200,
            easing: 'ease-out',
            styleProperties: [{ name: 'transform', value: 'rotate(12deg)' }],
          },
        },
      ],
    },
  ],
};
```
