# Smiley Nav

Two native disclosure menus with Interact motion on their labels and links.

**Tags:** details, interest, hover, navigation, transform

## Markup

```html
<nav class="nav-tabs" aria-label="Primary">
  <interact-element data-interact-key="nav-features">
    <details class="nav-menu">
      <summary><span class="tab-label">Features</span></summary>
      <div class="menu">
        <a href="#"><span class="link-label">Item A</span></a>
        <a href="#"><span class="link-label">Item B</span></a>
      </div>
    </details>
  </interact-element>
  <interact-element data-interact-key="nav-services">
    <details class="nav-menu">
      <summary><span class="tab-label">Services</span></summary>
      <div class="menu">
        <a href="#"><span class="link-label">Item C</span></a>
        <a href="#"><span class="link-label">Item D</span></a>
      </div>
    </details>
  </interact-element>
</nav>
```

## Essential styles

```css
interact-element {
  display: contents;
}

.nav-tabs {
  display: flex;
  gap: 1rem;
}

.nav-menu {
  position: relative;
}

.nav-menu summary {
  min-height: 2.75rem;
  padding: 0.75rem;
  cursor: pointer;
}

.menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1;
  display: flex;
  min-width: 10rem;
  flex-direction: column;
}

.nav-menu:not([open]) .menu {
  visibility: hidden;
  pointer-events: none;
}

.menu a {
  min-height: 2.5rem;
  padding: 0.5rem;
}

.nav-menu summary:focus-visible,
.menu a:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

.tab-label,
.link-label {
  display: inline-block;
  transform: translate(0);
}
```

## Interact config

```js
const menuKeys = ['nav-features', 'nav-services'];

const config = {
  interactions: menuKeys.flatMap((key) => [
    {
      key,
      selector: 'summary',
      trigger: 'interest',
      effects: [
        {
          selector: '.tab-label',
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
      key,
      trigger: 'interest',
      listContainer: '.menu',
      effects: [
        {
          selector: '.link-label',
          stateAction: 'toggle',
          transition: {
            duration: 160,
            easing: 'ease-out',
            styleProperties: [{ name: 'transform', value: 'translateX(4px)' }],
          },
        },
      ],
    },
  ]),
};
```
