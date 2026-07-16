# Dropdown Light

A native disclosure menu with Interact motion on its summary and options.

**Tags:** details, interest, hover, transform, menu

## Markup

```html
<interact-element data-interact-key="team-dropdown">
  <details class="dropdown">
    <summary>
      <span class="summary-label">Select team</span>
    </summary>
    <div class="dropdown-menu">
      <button type="button"><span class="option-label">Design</span></button>
      <button type="button"><span class="option-label">Engineering</span></button>
      <button type="button"><span class="option-label">Support</span></button>
    </div>
  </details>
</interact-element>
```

## Essential styles

```css
interact-element {
  display: contents;
}

.dropdown {
  position: relative;
  width: 17rem;
}

.dropdown summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 3rem;
  padding: 0 0.75rem;
  cursor: pointer;
  list-style: none;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1;
  display: flex;
  width: 100%;
  flex-direction: column;
}

.dropdown:not([open]) .dropdown-menu {
  visibility: hidden;
  pointer-events: none;
}

.dropdown-menu button {
  min-height: 2.5rem;
  text-align: left;
  cursor: pointer;
}

.dropdown summary:focus-visible,
.dropdown-menu button:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

.summary-label,
.option-label {
  display: inline-block;
  transform: translate(0);
}
```

## Interact config

```js
const config = {
  interactions: [
    {
      key: 'team-dropdown',
      selector: 'summary',
      trigger: 'interest',
      effects: [
        {
          selector: '.summary-label',
          stateAction: 'toggle',
          transition: {
            duration: 200,
            easing: 'ease-out',
            styleProperties: [{ name: 'transform', value: 'translateY(-2px)' }],
          },
        },
      ],
    },
    {
      key: 'team-dropdown',
      trigger: 'interest',
      listContainer: '.dropdown-menu',
      effects: [
        {
          selector: '.option-label',
          stateAction: 'toggle',
          transition: {
            duration: 160,
            easing: 'ease-out',
            styleProperties: [{ name: 'transform', value: 'translateX(4px)' }],
          },
        },
      ],
    },
  ],
};
```
