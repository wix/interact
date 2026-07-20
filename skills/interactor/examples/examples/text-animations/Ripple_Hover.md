# Ripple Hover

A stacked heading ripples masked copies of itself upward and downward on hover, creating a liquid echo wave around the main word; on mobile the ripple plays once on scroll into view.

**Tags:** hover, viewEnter, transform, stagger, reveal, typography, responsive

## Markup

```html
<div class="ripple-wrapper">
  <div class="ripple-container">
    <div class="static-mask mask-tiny mask-top">
      <interact-element data-interact-key="h1-u4">
        <div class="h1-copy" style="transform: translateY(105%)">LIQUIDITY</div>
      </interact-element>
    </div>

    <div class="static-mask mask-small mask-top">
      <interact-element data-interact-key="h1-u3">
        <div class="h1-copy" style="transform: translateY(105%)">LIQUIDITY</div>
      </interact-element>
    </div>

    <div class="static-mask mask-med mask-top">
      <interact-element data-interact-key="h1-u2">
        <div class="h1-copy" style="transform: translateY(105%)">LIQUIDITY</div>
      </interact-element>
    </div>

    <div class="static-mask mask-large mask-top">
      <interact-element data-interact-key="h1-u1">
        <div class="h1-copy" style="transform: translateY(105%)">LIQUIDITY</div>
      </interact-element>
    </div>

    <div class="static-mask mask-full">
      <interact-element data-interact-key="h1-trigger">
        <h1 class="h1-base">LIQUIDITY</h1>
      </interact-element>
    </div>

    <div class="static-mask mask-large mask-bottom">
      <interact-element data-interact-key="h1-d1">
        <div class="h1-copy" style="transform: translateY(-105%)">LIQUIDITY</div>
      </interact-element>
    </div>

    <div class="static-mask mask-med mask-bottom">
      <interact-element data-interact-key="h1-d2">
        <div class="h1-copy" style="transform: translateY(-105%)">LIQUIDITY</div>
      </interact-element>
    </div>

    <div class="static-mask mask-small mask-bottom">
      <interact-element data-interact-key="h1-d3">
        <div class="h1-copy" style="transform: translateY(-105%)">LIQUIDITY</div>
      </interact-element>
    </div>

    <div class="static-mask mask-tiny mask-bottom">
      <interact-element data-interact-key="h1-d4">
        <div class="h1-copy" style="transform: translateY(-105%)">LIQUIDITY</div>
      </interact-element>
    </div>
  </div>

  <interact-element data-interact-key="hero-text">
    <div class="content-block">
      <p class="hint">Hover over the word to reveal the echoes.</p>
    </div>
  </interact-element>
</div>
```

## Essential styles

```css
body {
  overflow-x: clip;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.ripple-wrapper {
  position: relative;
  text-align: center;
  width: 100%;
}

.ripple-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  padding: 50px 0;
  font-size: clamp(3rem, 13vw, 8rem);
}

.h1-base {
  font-size: 1em;
  line-height: 0.75;
  margin: 0;
  padding: 0;
  display: block;
  transform: translateY(-0.02em);
}

.static-mask {
  position: relative;
  width: 100%;
  overflow: clip;
  display: flex;
  justify-content: center;
  align-items: center;
}

.mask-top {
  align-items: flex-start;
}
.mask-bottom {
  align-items: flex-end;
}

.mask-full {
  height: 0.75em;
  overflow: visible;
  align-items: center;
  z-index: 10;
}

.h1-copy {
  font-size: 1em;
  line-height: 0.75;
  margin: 0;
  padding: 0;
  display: block;
  will-change: transform;
  transform: translateY(105%);
}

.mask-tiny {
  height: 0.06em;
}
.mask-small {
  height: 0.175em;
}
.mask-med {
  height: 0.3125em;
}
.mask-large {
  height: 0.45em;
}

.content-block {
  max-width: 600px;
  margin-top: 3rem;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.hint {
  font-size: 1.125rem;
  line-height: 1.625;
}
```

## Interact config

```js
const revealBase = {
  duration: 900,
  easing: 'cubic-bezier(0.05, 1, 0.15, 1)',
  fill: 'both',
  composite: 'replace',
};

const revealUpKeyframes = [{ transform: 'translateY(105%)' }, { transform: 'translateY(-0.02em)' }];

const revealDownKeyframes = [
  { transform: 'translateY(-105%)' },
  { transform: 'translateY(-0.02em)' },
];

const rippleSequences = (triggerType) => [
  {
    offset: 54,
    triggerType,
    effects: [
      { key: 'h1-u1', effectId: 'reveal-up' },
      { key: 'h1-u2', effectId: 'reveal-up' },
      { key: 'h1-u3', effectId: 'reveal-up' },
      { key: 'h1-u4', effectId: 'reveal-up' },
    ],
  },
  {
    offset: 54,
    triggerType,
    effects: [
      { key: 'h1-d1', effectId: 'reveal-down' },
      { key: 'h1-d2', effectId: 'reveal-down' },
      { key: 'h1-d3', effectId: 'reveal-down' },
      { key: 'h1-d4', effectId: 'reveal-down' },
    ],
  },
];

const config = {
  conditions: {
    desktop: { type: 'media', predicate: '(min-width: 769px)' },
    mobile: { type: 'media', predicate: '(max-width: 768px)' },
  },
  effects: {
    'reveal-up': {
      keyframeEffect: { name: 'reveal-up', keyframes: revealUpKeyframes },
      ...revealBase,
    },
    'reveal-down': {
      keyframeEffect: { name: 'reveal-down', keyframes: revealDownKeyframes },
      ...revealBase,
    },
    'fade-up': {
      namedEffect: {
        type: 'SlideIn',
        direction: 'bottom',
        initialTranslate: 0.3,
      },
      duration: 1000,
      easing: 'ease-out',
      fill: 'both',
    },
  },
  interactions: [
    {
      key: 'h1-trigger',
      trigger: 'hover',
      conditions: ['desktop'],
      sequences: rippleSequences('alternate'),
    },
    {
      key: 'h1-trigger',
      trigger: 'viewEnter',
      conditions: ['mobile'],
      params: { threshold: 0.5 },
      sequences: rippleSequences('once'),
    },
    {
      key: 'hero-text',
      trigger: 'viewEnter',
      effects: [{ effectId: 'fade-up', delay: 400 }],
    },
  ],
};
```
