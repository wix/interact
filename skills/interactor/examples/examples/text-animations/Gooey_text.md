# Gooey Text

A blurred circle continuously sweeps across text inside a high-contrast filter container, creating a gooey ink-spreading effect that fades in when the scene enters view.

**Tags:** viewEnter, loop, blur, filter, opacity, fade

## Markup

```html
<div class="scene">
  <interact-element data-interact-key="scene-root" class="scene-root">
    <div class="gooey-filter">
      <h1 class="gooey-text">INTERACT</h1>
      <interact-element data-interact-key="auto-circle" aria-hidden="true">
        <div class="moving-circle"></div>
      </interact-element>
    </div>
  </interact-element>
</div>
```

## Essential styles

```css
body {
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  overflow: clip;
}

.scene {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scene-root {
  width: 100%;
  height: 100%;
  position: absolute;
  inset: 0;
  z-index: 10;
}

interact-element {
  display: contents;
}

.gooey-filter {
  filter: contrast(50);
  overflow: clip;
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gooey-text {
  filter: blur(8px);
  z-index: 10;
  position: relative;
  font-size: 13rem;
  line-height: 1;
}

.moving-circle {
  position: absolute;
  top: 50%;
  left: 0;
  width: 175px;
  height: 175px;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(30px);
  transform: translateY(-50%);
  z-index: 20;
}

@media (prefers-reduced-motion: reduce) {
  .moving-circle {
    display: none;
  }
}
```

## Interact config

```js
const config = {
  conditions: {
    'motion-ok': { type: 'media', predicate: '(prefers-reduced-motion: no-preference)' },
  },
  interactions: [
    {
      key: 'scene-root',
      trigger: 'viewEnter',
      effects: [
        {
          key: 'auto-circle',
          keyframeEffect: {
            name: 'PassThrough',
            keyframes: [{ left: '-20%' }, { left: '120%' }],
          },
          duration: 4000,
          easing: 'ease-in-out',
          iterations: Infinity,
          fill: 'both',
          composite: 'replace',
          conditions: ['motion-ok'],
        },
        {
          key: 'scene-root',
          namedEffect: { type: 'FadeIn' },
          duration: 1000,
          fill: 'both',
        },
      ],
    },
  ],
};
```
