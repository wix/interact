# On Off Toggle

A native checkbox preserves on/off state while Interact moves its thumb and fades the state labels.

**Tags:** activate, click, checkbox, opacity, transform

## Markup

```html
<interact-element data-interact-key="power-toggle">
  <label class="toggle">
    <input class="toggle-input" type="checkbox" checked />
    <span class="track" aria-hidden="true">
      <span class="state state-on">On</span>
      <span class="slider"></span>
      <span class="state state-off">Off</span>
    </span>
    <span class="sr-only">Power</span>
  </label>
</interact-element>
```

## Essential styles

```css
interact-element {
  display: contents;
}

.toggle {
  cursor: pointer;
}

.toggle-input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.track {
  position: relative;
  display: flex;
  width: 7rem;
  height: 3rem;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.75rem;
  background-color: #777;
}

.slider {
  position: absolute;
  top: 0.25rem;
  left: 3.75rem;
  width: 3rem;
  height: 2.5rem;
  background-color: #fff;
  transform: translateX(0);
}

.state-on {
  opacity: 1;
}

.state-off {
  opacity: 0;
}

.toggle-input:focus-visible + .track {
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
const config = {
  effects: {
    'slider-move': {
      keyframeEffect: {
        name: 'power-slider-move',
        keyframes: [{ transform: 'translateX(0)' }, { transform: 'translateX(-3.5rem)' }],
      },
      duration: 350,
      easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
      fill: 'both',
      triggerType: 'alternate',
      reversed: true,
    },
    'track-color': {
      keyframeEffect: {
        name: 'power-track-color',
        keyframes: [{ backgroundColor: '#000' }, { backgroundColor: '#777' }],
      },
      duration: 350,
      easing: 'ease',
      fill: 'both',
      triggerType: 'alternate',
      reversed: true,
    },
    'on-label': {
      keyframeEffect: {
        name: 'power-on-label',
        keyframes: [{ opacity: 0 }, { opacity: 1 }],
      },
      duration: 250,
      easing: 'ease',
      fill: 'both',
      triggerType: 'alternate',
      reversed: true,
    },
    'off-label': {
      keyframeEffect: {
        name: 'power-off-label',
        keyframes: [{ opacity: 1 }, { opacity: 0 }],
      },
      duration: 250,
      easing: 'ease',
      fill: 'both',
      triggerType: 'alternate',
      reversed: true,
    },
  },
  interactions: [
    {
      key: 'power-toggle',
      trigger: 'activate',
      effects: [
        { selector: '.slider', effectId: 'slider-move' },
        { selector: '.track', effectId: 'track-color' },
        { selector: '.state-on', effectId: 'on-label' },
        { selector: '.state-off', effectId: 'off-label' },
      ],
    },
  ],
};
```
