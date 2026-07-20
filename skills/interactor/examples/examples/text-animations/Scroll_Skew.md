# Scroll Skew

Eleven stacked ghost layers of large display text progressively skew along the X axis as they scroll through the viewport, creating a depth-gradient warp effect that straightens at mid-scroll.

**Tags:** viewProgress, transform, stagger, typography, parallax, rotate

## Markup

```html
<div class="h-[60vh] flex items-center justify-center">
  <p>Scroll down to see the interaction ↓</p>
</div>

<div
  class="min-h-screen flex flex-col items-center justify-center max-w-4xl mx-auto px-6 py-24 gap-24"
>
  <div class="grid place-items-center w-full relative perspective-1000">
    <div class="stack-cell z-0 pointer-events-none">
      <interact-element data-interact-key="header-ghost-10">
        <h1 class="text-6xl md:text-8xl leading-tight whitespace-nowrap text-center">
          WARPING<br />REALITY
        </h1>
      </interact-element>
    </div>

    <div class="stack-cell z-0 pointer-events-none">
      <interact-element data-interact-key="header-ghost-9">
        <h1 class="text-6xl md:text-8xl leading-tight whitespace-nowrap text-center">
          WARPING<br />REALITY
        </h1>
      </interact-element>
    </div>

    <div class="stack-cell z-0 pointer-events-none">
      <interact-element data-interact-key="header-ghost-8">
        <h1 class="text-6xl md:text-8xl leading-tight whitespace-nowrap text-center">
          WARPING<br />REALITY
        </h1>
      </interact-element>
    </div>

    <div class="stack-cell z-0 pointer-events-none">
      <interact-element data-interact-key="header-ghost-7">
        <h1 class="text-6xl md:text-8xl leading-tight whitespace-nowrap text-center">
          WARPING<br />REALITY
        </h1>
      </interact-element>
    </div>

    <div class="stack-cell z-0 pointer-events-none">
      <interact-element data-interact-key="header-ghost-6">
        <h1 class="text-6xl md:text-8xl leading-tight whitespace-nowrap text-center">
          WARPING<br />REALITY
        </h1>
      </interact-element>
    </div>

    <div class="stack-cell z-0 pointer-events-none">
      <interact-element data-interact-key="header-ghost-5">
        <h1 class="text-6xl md:text-8xl leading-tight whitespace-nowrap text-center">
          WARPING<br />REALITY
        </h1>
      </interact-element>
    </div>

    <div class="stack-cell z-0 pointer-events-none">
      <interact-element data-interact-key="header-ghost-4">
        <h1 class="text-6xl md:text-8xl leading-tight whitespace-nowrap text-center">
          WARPING<br />REALITY
        </h1>
      </interact-element>
    </div>

    <div class="stack-cell z-10 pointer-events-none">
      <interact-element data-interact-key="header-ghost-3">
        <h1 class="text-6xl md:text-8xl leading-tight whitespace-nowrap text-center">
          WARPING<br />REALITY
        </h1>
      </interact-element>
    </div>

    <div class="stack-cell z-20 pointer-events-none">
      <interact-element data-interact-key="header-ghost-2">
        <h1 class="text-6xl md:text-8xl leading-tight whitespace-nowrap text-center">
          WARPING<br />REALITY
        </h1>
      </interact-element>
    </div>

    <div class="stack-cell z-30 pointer-events-none">
      <interact-element data-interact-key="header-ghost-1">
        <h1 class="text-6xl md:text-8xl leading-tight whitespace-nowrap text-center">
          WARPING<br />REALITY
        </h1>
      </interact-element>
    </div>

    <div class="stack-cell z-40">
      <interact-element data-interact-key="skew-header">
        <h1 class="text-6xl md:text-8xl leading-tight whitespace-nowrap text-center">
          WARPING<br />REALITY
        </h1>
      </interact-element>
    </div>
  </div>

  <interact-element data-interact-key="skew-text" class="block max-w-xl mx-auto z-50 relative">
    <p class="text-xl md:text-2xl text-center leading-relaxed">
      Sample text provides enough length to demonstrate this animated content layout.
    </p>
  </interact-element>
</div>

<div class="h-[50vh] flex items-center justify-center">
  <p>Scroll up ↑</p>
</div>
```

## Essential styles

```css
html {
  scroll-behavior: smooth;
}
body {
  overflow-x: clip;
}
.stack-cell {
  grid-column: 1 / -1;
  grid-row: 1 / -1;
}
```

## Interact config

```js
const config = {
  interactions: [
    {
      key: 'skew-header',
      trigger: 'viewProgress',
      effects: [
        {
          rangeStart: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
          fill: 'both',
          composite: 'add',
          keyframeEffect: {
            name: 'header-main-skew',
            keyframes: [{ transform: 'skewX(45deg)' }, { transform: 'skewX(-45deg)' }],
          },
        },
      ],
    },
    {
      key: 'header-ghost-1',
      trigger: 'viewProgress',
      effects: [
        {
          rangeStart: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
          fill: 'both',
          composite: 'add',
          keyframeEffect: {
            name: 'header-ghost-1-skew',
            keyframes: [
              { transform: 'skewX(48deg) translateX(-8px)' },
              { transform: 'skewX(-48deg) translateX(8px)' },
            ],
          },
        },
      ],
    },
    {
      key: 'header-ghost-2',
      trigger: 'viewProgress',
      effects: [
        {
          rangeStart: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
          fill: 'both',
          composite: 'add',
          keyframeEffect: {
            name: 'header-ghost-2-skew',
            keyframes: [
              { transform: 'skewX(51deg) translateX(-16px)' },
              { transform: 'skewX(-51deg) translateX(16px)' },
            ],
          },
        },
      ],
    },
    {
      key: 'header-ghost-3',
      trigger: 'viewProgress',
      effects: [
        {
          rangeStart: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
          fill: 'both',
          composite: 'add',
          keyframeEffect: {
            name: 'header-ghost-3-skew',
            keyframes: [
              { transform: 'skewX(54deg) translateX(-24px)' },
              { transform: 'skewX(-54deg) translateX(24px)' },
            ],
          },
        },
      ],
    },
    {
      key: 'header-ghost-4',
      trigger: 'viewProgress',
      effects: [
        {
          rangeStart: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
          fill: 'both',
          composite: 'add',
          keyframeEffect: {
            name: 'header-ghost-4-skew',
            keyframes: [
              { transform: 'skewX(57deg) translateX(-32px)' },
              { transform: 'skewX(-57deg) translateX(32px)' },
            ],
          },
        },
      ],
    },
    {
      key: 'header-ghost-5',
      trigger: 'viewProgress',
      effects: [
        {
          rangeStart: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
          fill: 'both',
          composite: 'add',
          keyframeEffect: {
            name: 'header-ghost-5-skew',
            keyframes: [
              { transform: 'skewX(60deg) translateX(-40px)' },
              { transform: 'skewX(-60deg) translateX(40px)' },
            ],
          },
        },
      ],
    },
    {
      key: 'header-ghost-6',
      trigger: 'viewProgress',
      effects: [
        {
          rangeStart: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
          fill: 'both',
          composite: 'add',
          keyframeEffect: {
            name: 'header-ghost-6-skew',
            keyframes: [
              { transform: 'skewX(63deg) translateX(-48px)' },
              { transform: 'skewX(-63deg) translateX(48px)' },
            ],
          },
        },
      ],
    },
    {
      key: 'header-ghost-7',
      trigger: 'viewProgress',
      effects: [
        {
          rangeStart: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
          fill: 'both',
          composite: 'add',
          keyframeEffect: {
            name: 'header-ghost-7-skew',
            keyframes: [
              { transform: 'skewX(66deg) translateX(-56px)' },
              { transform: 'skewX(-66deg) translateX(56px)' },
            ],
          },
        },
      ],
    },
    {
      key: 'header-ghost-8',
      trigger: 'viewProgress',
      effects: [
        {
          rangeStart: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
          fill: 'both',
          composite: 'add',
          keyframeEffect: {
            name: 'header-ghost-8-skew',
            keyframes: [
              { transform: 'skewX(69deg) translateX(-64px)' },
              { transform: 'skewX(-69deg) translateX(64px)' },
            ],
          },
        },
      ],
    },
    {
      key: 'header-ghost-9',
      trigger: 'viewProgress',
      effects: [
        {
          rangeStart: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
          fill: 'both',
          composite: 'add',
          keyframeEffect: {
            name: 'header-ghost-9-skew',
            keyframes: [
              { transform: 'skewX(72deg) translateX(-72px)' },
              { transform: 'skewX(-72deg) translateX(72px)' },
            ],
          },
        },
      ],
    },
    {
      key: 'header-ghost-10',
      trigger: 'viewProgress',
      effects: [
        {
          rangeStart: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
          fill: 'both',
          composite: 'add',
          keyframeEffect: {
            name: 'header-ghost-10-skew',
            keyframes: [
              { transform: 'skewX(75deg) translateX(-80px)' },
              { transform: 'skewX(-75deg) translateX(80px)' },
            ],
          },
        },
      ],
    },
    {
      key: 'skew-text',
      trigger: 'viewProgress',
      effects: [
        {
          rangeStart: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
          fill: 'both',
          composite: 'add',
          keyframeEffect: {
            name: 'text-skew',
            keyframes: [{ transform: 'skewX(-45deg)' }, { transform: 'skewX(45deg)' }],
          },
        },
      ],
    },
  ],
};
```
