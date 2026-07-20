# Lock Toggle

A native checkbox preserves lock state while Interact moves the thumb and swaps the labels.

**Tags:** activate, click, checkbox, opacity, transform

## Markup

```html
<interact-element data-interact-key="lock-toggle">
  <label class="toggle">
    <input class="toggle-input" type="checkbox" />
    <span class="track" aria-hidden="true"><span class="slider"></span></span>
    <span class="labels">
      <span class="label-locked">Locked</span>
      <span class="label-unlocked">Unlocked</span>
    </span>
  </label>
</interact-element>
```

## Essential styles

```css
interact-element {
  display: contents;
}

.toggle {
  display: flex;
  align-items: center;
  gap: 0.75rem;
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
  width: 5rem;
  height: 2.5rem;
  flex: 0 0 auto;
  background-color: #000;
}

.slider {
  position: absolute;
  top: 0.25rem;
  left: 0.25rem;
  width: 2rem;
  height: 2rem;
  background-color: #fff;
  transform: translateX(0);
}

.labels {
  display: grid;
  overflow: clip;
}

.labels > span {
  grid-area: 1 / 1;
}

.label-locked {
  opacity: 1;
  transform: translateY(0);
}

.label-unlocked {
  opacity: 0;
  transform: translateY(100%);
}

.toggle-input:focus-visible + .track {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
```

## Interact config

```js
const config = {
  effects: {
    'slider-move': {
      keyframeEffect: {
        name: 'lock-slider-move',
        keyframes: [{ transform: 'translateX(0)' }, { transform: 'translateX(2.5rem)' }],
      },
      duration: 350,
      easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
      fill: 'both',
      triggerType: 'alternate',
    },
    'track-color': {
      keyframeEffect: {
        name: 'lock-track-color',
        keyframes: [{ backgroundColor: '#000' }, { backgroundColor: '#777' }],
      },
      duration: 350,
      easing: 'ease',
      fill: 'both',
      triggerType: 'alternate',
    },
    'locked-label': {
      keyframeEffect: {
        name: 'locked-label',
        keyframes: [
          { opacity: 1, transform: 'translateY(0)' },
          { opacity: 0, transform: 'translateY(-100%)' },
        ],
      },
      duration: 300,
      easing: 'ease-out',
      fill: 'both',
      triggerType: 'alternate',
    },
    'unlocked-label': {
      keyframeEffect: {
        name: 'unlocked-label',
        keyframes: [
          { opacity: 0, transform: 'translateY(100%)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
      },
      duration: 300,
      easing: 'ease-out',
      fill: 'both',
      triggerType: 'alternate',
    },
  },
  interactions: [
    {
      key: 'lock-toggle',
      trigger: 'activate',
      effects: [
        { selector: '.slider', effectId: 'slider-move' },
        { selector: '.track', effectId: 'track-color' },
        { selector: '.label-locked', effectId: 'locked-label' },
        { selector: '.label-unlocked', effectId: 'unlocked-label' },
      ],
    },
  ],
};
```
