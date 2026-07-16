# Mindshift Transition

Two theatrical panels slide in from opposite sides as the page scrolls, concealing the headline while revealing subtext beneath.

**Tags:** viewProgress, sticky, opacity, transform, reveal, fade, stagger

## Markup

```html
<div class="scroll-hint">Scroll down</div>

<interact-element data-interact-key="scroll-stage">
  <div class="sticky-container">
    <interact-element data-interact-key="mask-l">
      <div class="mask mask-left"></div>
    </interact-element>

    <interact-element data-interact-key="mask-r">
      <div class="mask mask-right"></div>
    </interact-element>

    <div class="text-container">
      <interact-element data-interact-key="text-main">
        <div class="text text-1">CHANGE<br />MINDS.</div>
      </interact-element>

      <interact-element data-interact-key="text-sub">
        <div class="text text-2">Start with<br />your own.</div>
      </interact-element>
    </div>
  </div>
</interact-element>
```

## Essential styles

```css
body {
  margin: 0;
  height: 300vh;
  overflow-x: clip;
}

.sticky-container {
  position: sticky;
  top: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: clip;
}

.mask {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 90%;
  z-index: 10;
}

.mask-left {
  left: 0;
  border-radius: 0 50% 50% 0;
}

.mask-right {
  right: 0;
  border-radius: 50% 0 0 50%;
}

.text-container {
  position: relative;
  z-index: 20;
  text-align: center;
  width: 95%;
  max-width: 1400px;
}

.text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  pointer-events: none;
}

.text-1 {
  font-size: clamp(2.5rem, 12vw, 9rem);
  line-height: 0.85;
}

.text-2 {
  font-size: clamp(1.2rem, 5vw, 3.5rem);
  line-height: 1.1;
}

.scroll-hint {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.7rem;
  z-index: 30;
}
```

## Interact config

```js
const config = {
  interactions: [
    {
      key: 'scroll-stage',
      trigger: 'viewProgress',
      effects: [
        {
          key: 'mask-l',
          fill: 'both',
          rangeStart: { name: 'entry', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'exit', offset: { value: 0, unit: 'percentage' } },
          keyframeEffect: {
            name: 'mask-slide-left',
            keyframes: [
              { transform: 'translateX(-120%)', offset: 0 },
              { transform: 'translateX(-120%)', offset: 0.2 },
              { transform: 'translateX(-10%)', offset: 1 },
            ],
          },
        },
        {
          key: 'mask-r',
          fill: 'both',
          rangeStart: { name: 'entry', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'exit', offset: { value: 0, unit: 'percentage' } },
          keyframeEffect: {
            name: 'mask-slide-right',
            keyframes: [
              { transform: 'translateX(120%)', offset: 0 },
              { transform: 'translateX(120%)', offset: 0.2 },
              { transform: 'translateX(10%)', offset: 1 },
            ],
          },
        },
        {
          key: 'text-main',
          fill: 'both',
          rangeStart: { name: 'entry', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'exit', offset: { value: 0, unit: 'percentage' } },
          keyframeEffect: {
            name: 'fade-out-main',
            keyframes: [
              { opacity: 1, transform: 'translate(-50%, -50%)', offset: 0 },
              { opacity: 1, transform: 'translate(-50%, -50%)', offset: 0.4 },
              { opacity: 0, transform: 'translate(-50%, calc(-50% - 40px))', offset: 0.7 },
              { opacity: 0, transform: 'translate(-50%, calc(-50% - 40px))', offset: 1 },
            ],
          },
        },
        {
          key: 'text-sub',
          fill: 'both',
          rangeStart: { name: 'entry', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'exit', offset: { value: 0, unit: 'percentage' } },
          keyframeEffect: {
            name: 'fade-in-sub',
            keyframes: [
              { opacity: 0, transform: 'translate(-50%, calc(-50% + 20px))', offset: 0 },
              { opacity: 0, transform: 'translate(-50%, calc(-50% + 20px))', offset: 0.6 },
              { opacity: 1, transform: 'translate(-50%, -50%)', offset: 0.95 },
              { opacity: 1, transform: 'translate(-50%, -50%)', offset: 1 },
            ],
          },
        },
      ],
    },
  ],
};
```
