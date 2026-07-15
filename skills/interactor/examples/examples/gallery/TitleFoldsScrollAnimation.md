# Title Folds Scroll Animation

Sticky cards scale up from 75% as they enter the viewport, with the heading, line, top-right stack, and content container each revealing independently via scroll-driven viewProgress animations.

**Tags:** viewProgress, sticky, flex, transform, scale, reveal, stagger

## Markup

```html
<main class="scroll-section">
  <div class="cards-repeater">
    <interact-element data-interact-key="#card-1">
      <div class="card" id="card-1">
        <div class="card-content">
          <div class="horizontal-line"></div>
          <h2 class="heading-text">Heading 1</h2>
          <div class="top-right-stack">
            <span>text 1</span>
            <span>text 2</span>
          </div>
          <div class="content-container">
            <img class="main-image" src="">
            <div class="bottom-text-stack">
              <span class="small-text">Small Text</span>
              <span class="big-text">Big Text</span>
            </div>
            <svg class="arrow-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="23.5" stroke="white"/><path d="M24 16V32M24 32L30 26M24 32L18 26" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
        </div>
      </div>
    </interact-element>

    <interact-element data-interact-key="#card-2">
      <div class="card" id="card-2">
        <div class="card-content">
          <div class="horizontal-line"></div>
          <h2 class="heading-text">Heading 2</h2>
          <div class="top-right-stack">
            <span>text 1</span>
            <span>text 2</span>
          </div>
          <div class="content-container">
            <img class="main-image" src="">
            <div class="bottom-text-stack">
              <span class="small-text">Small Text</span>
              <span class="big-text">Big Text</span>
            </div>
            <svg class="arrow-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="23.5" stroke="white"/><path d="M24 16V32M24 32L30 26M24 32L18 26" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
        </div>
      </div>
    </interact-element>

    <interact-element data-interact-key="#card-3">
      <div class="card" id="card-3">
        <div class="card-content">
          <div class="horizontal-line"></div>
          <h2 class="heading-text">Heading 3</h2>
          <div class="top-right-stack">
            <span>text 1</span>
            <span>text 2</span>
          </div>
          <div class="content-container">
            <img class="main-image" src="">
            <div class="bottom-text-stack">
              <span class="small-text">Small Text</span>
              <span class="big-text">Big Text</span>
            </div>
            <svg class="arrow-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="23.5" stroke="white"/><path d="M24 16V32M24 32L30 26M24 32L18 26" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
        </div>
      </div>
    </interact-element>

    <interact-element data-interact-key="#card-4">
      <div class="card" id="card-4">
        <div class="card-content">
          <div class="horizontal-line"></div>
          <h2 class="heading-text">Heading 4</h2>
          <div class="top-right-stack">
            <span>text 1</span>
            <span>text 2</span>
          </div>
          <div class="content-container">
            <img class="main-image" src="">
            <div class="bottom-text-stack">
              <span class="small-text">Small Text</span>
              <span class="big-text">Big Text</span>
            </div>
            <svg class="arrow-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="23.5" stroke="white"/><path d="M24 16V32M24 32L30 26M24 32L18 26" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
        </div>
      </div>
    </interact-element>

    <interact-element data-interact-key="#card-5">
      <div class="card" id="card-5">
        <div class="card-content">
          <div class="horizontal-line"></div>
          <h2 class="heading-text">Heading 5</h2>
          <div class="top-right-stack">
            <span>text 1</span>
            <span>text 2</span>
          </div>
          <div class="content-container">
            <img class="main-image" src="">
            <div class="bottom-text-stack">
              <span class="small-text">Small Text</span>
              <span class="big-text">Big Text</span>
            </div>
            <svg class="arrow-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="23.5" stroke="white"/><path d="M24 16V32M24 32L30 26M24 32L18 26" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
        </div>
      </div>
    </interact-element>
  </div>
</main>
<section class="next-section">
  <p>Next Section</p>
</section>
```

## Essential styles

```css
:root {
    --background-color: #111;
    --card-background: #1a1a1a;
    --text-color: #fff;
    --line-color: #fff;
    --font-family: 'Helvetica', 'Arial', sans-serif;
}

body {
    margin: 0;
    background-color: var(--background-color);
    color: var(--text-color);
    font-family: var(--font-family);
    overscroll-behavior-y: none;
}

.scroll-section {
    height: 6300px;
    position: relative;
}

interact-element {
    display: block;
    position: sticky;
    top: 0;
}

.cards-repeater {
    display: flex;
    flex-direction: column;
    gap: 500px;
    padding-top: 100vh;
}

.card {
    width: 100%;
    height: 95vh;
    background-color: var(--card-background);
    overflow: hidden;
    transform-origin: bottom center;
    border-radius: 24px;
}

.card-content {
    position: relative;
    width: 100%;
    height: 100%;
}

.horizontal-line {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 6px;
    background-color: var(--line-color);
    transform-origin: left;
}

.heading-text {
    position: absolute;
    top: 20px;
    left: 20px;
    font-size: 80px;
    font-weight: bold;
    margin: 0;
    line-height: 1;
    transform-origin: top left;
}

.top-right-stack {
    position: absolute;
    top: 20px;
    right: 20px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    transform-origin: top right;
}

.top-right-stack span {
    font-size: 14px;
    opacity: 0.8;
}

.content-container {
    position: absolute;
    top: 120px;
    left: 20px;
    right: 20px;
    bottom: 20px;
    border-radius: 12px;
    overflow: hidden;
}

.main-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 12px;
}

.bottom-text-stack {
    position: absolute;
    bottom: 20px;
    left: 20px;
    display: flex;
    flex-direction: column;
}

.small-text {
    font-size: 16px;
    opacity: 0.7;
}

.big-text {
    font-size: 24px;
    font-weight: 500;
}

.arrow-icon {
    position: absolute;
    bottom: 20px;
    right: 20px;
    width: 48px;
    height: 48px;
}

.next-section {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.next-section p {
    font-size: 32px;
    font-weight: bold;
}
```

## Interact config

```js
const CARD_SCALE_START = 0.75;

const commonRange = {
    rangeStart: { name: 'entry', offset: { unit: 'percentage', value: 0 } },
    rangeEnd: { name: 'entry', offset: { unit: 'percentage', value: 100 } },
    easing: 'linear',
    fill: 'both'
};

{
    effects: {
        'card-scale': {
            keyframeEffect: { name: 'card-scale-effect', keyframes: [{ transform: `scale(${CARD_SCALE_START})` }, { transform: 'scale(1)' }] },
            ...commonRange
        },
        'heading-scale': {
            keyframeEffect: { name: 'heading-scale-effect', keyframes: [{ transform: 'scale(2.0)' }, { transform: 'scale(1)' }] },
            ...commonRange
        },
        'line-reveal': {
            keyframeEffect: { name: 'line-reveal-effect', keyframes: [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }] },
            ...commonRange
        },
        'top-stack-reveal': {
            keyframeEffect: { name: 'top-stack-reveal-effect', keyframes: [{ transform: 'scale(0.3)' }, { transform: 'scale(1)' }] },
            ...commonRange
        },
        'content-slide-up': {
            keyframeEffect: { name: 'content-slide-up-effect', keyframes: [{ transform: 'translateY(400px)' }, { transform: 'translateY(0px)' }] },
            ...commonRange
        }
    },
    interactions: [
        {
            key: '#card-1',
            trigger: 'viewProgress',
            effects: [
                { key: '#card-1', effectId: 'card-scale' },
                { key: '#card-1 .heading-text', effectId: 'heading-scale' },
                { key: '#card-1 .horizontal-line', effectId: 'line-reveal' },
                { key: '#card-1 .top-right-stack', effectId: 'top-stack-reveal' },
                { key: '#card-1 .content-container', effectId: 'content-slide-up' }
            ]
        },
        {
            key: '#card-2',
            trigger: 'viewProgress',
            effects: [
                { key: '#card-2', effectId: 'card-scale' },
                { key: '#card-2 .heading-text', effectId: 'heading-scale' },
                { key: '#card-2 .horizontal-line', effectId: 'line-reveal' },
                { key: '#card-2 .top-right-stack', effectId: 'top-stack-reveal' },
                { key: '#card-2 .content-container', effectId: 'content-slide-up' }
            ]
        },
        {
            key: '#card-3',
            trigger: 'viewProgress',
            effects: [
                { key: '#card-3', effectId: 'card-scale' },
                { key: '#card-3 .heading-text', effectId: 'heading-scale' },
                { key: '#card-3 .horizontal-line', effectId: 'line-reveal' },
                { key: '#card-3 .top-right-stack', effectId: 'top-stack-reveal' },
                { key: '#card-3 .content-container', effectId: 'content-slide-up' }
            ]
        },
        {
            key: '#card-4',
            trigger: 'viewProgress',
            effects: [
                { key: '#card-4', effectId: 'card-scale' },
                { key: '#card-4 .heading-text', effectId: 'heading-scale' },
                { key: '#card-4 .horizontal-line', effectId: 'line-reveal' },
                { key: '#card-4 .top-right-stack', effectId: 'top-stack-reveal' },
                { key: '#card-4 .content-container', effectId: 'content-slide-up' }
            ]
        },
        {
            key: '#card-5',
            trigger: 'viewProgress',
            effects: [
                { key: '#card-5', effectId: 'card-scale' },
                { key: '#card-5 .heading-text', effectId: 'heading-scale' },
                { key: '#card-5 .horizontal-line', effectId: 'line-reveal' },
                { key: '#card-5 .top-right-stack', effectId: 'top-stack-reveal' },
                { key: '#card-5 .content-container', effectId: 'content-slide-up' }
            ]
        }
    ]
}
```
