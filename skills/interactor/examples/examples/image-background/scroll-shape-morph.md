# Scroll Shape Morph

Five SVG mask shapes fade in and out sequentially over a sticky text card as the page scrolls, morphing the card's visible silhouette through rectangle, rounded-corner, oval, L-shape, and jagged geometric forms.

**Tags:** viewProgress, sticky, opacity, reveal, stagger, fade

## Markup

```html
<div class="bg-image"></div>

<interact-element data-interact-key="scroll-driver" class="scroll-driver">
  <div class="sticky-stage">
    <div class="center-container">
      <interact-element data-interact-key="mask-1" class="shape-wrap">
        <div>
          <svg viewBox="0 0 519 479" preserveAspectRatio="none" fill="none">
            <path d="M0 0H518.5V479H0V0Z" fill="#fff" />
          </svg>
        </div>
      </interact-element>

      <interact-element data-interact-key="mask-2" class="shape-wrap">
        <div>
          <svg viewBox="0 0 525 495" preserveAspectRatio="none" fill="none">
            <path
              d="M0 200C0 89.5431 89.5431 0 200 0H525V295C525 405.457 435.457 495 325 495H0V200Z"
              fill="#fff"
            />
          </svg>
        </div>
      </interact-element>

      <interact-element data-interact-key="mask-3" class="shape-wrap">
        <div>
          <svg viewBox="0 0 501 495" preserveAspectRatio="none" fill="none">
            <rect width="501" height="495" rx="247.5" fill="#fff" />
          </svg>
        </div>
      </interact-element>

      <interact-element data-interact-key="mask-4" class="shape-wrap">
        <div>
          <svg viewBox="0 0 501 495" preserveAspectRatio="none" fill="none">
            <path
              d="M365 0C376.046 0 385.001 8.95431 385.001 20V110H481C492.046 110 501.001 118.954 501.001 130V475C501.001 486.046 492.046 495 481.001 495H136.001C124.955 495 116.001 486.046 116.001 475V385H20.001C8.95528 385 0 376.046 0 365V20C3.86565e-06 8.95447 8.95453 0.000263872 20 0H365Z"
              fill="#fff"
            />
          </svg>
        </div>
      </interact-element>

      <interact-element data-interact-key="mask-5" class="shape-wrap">
        <div>
          <svg viewBox="0 0 501 495" preserveAspectRatio="none" fill="none">
            <path
              d="M249.568 43.6777L286.817 0H481C492.046 2.9185e-06 501 8.95431 501 20V180.287L428.079 247.5L501 314.713V475C501 486.046 492.046 495 481 495H288.681L251.432 451.322L214.183 495H20C8.95432 495 1.89637e-05 486.046 0 475V314.713L72.9199 247.5L0 180.287V20C0 8.95431 8.95431 1.49578e-07 20 0H212.319L249.568 43.6777Z"
              fill="#fff"
            />
          </svg>
        </div>
      </interact-element>

      <div class="text-overlay">
        <div class="text-inner">
          <p class="label">Architecture Studio</p>
          <h2 class="title">Shaping<br />Space & Light</h2>
          <p class="description">
            Sample text provides enough length to demonstrate this animated content layout.
            <a href="#">Start a project</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</interact-element>
```

## Essential styles

```css
interact-element {
  display: block;
}

html,
body {
  height: 100%;
  overflow-x: clip;
}

.bg-image {
  position: fixed;
  inset: 0;
  background-image: url('');
  background-position: center;
  background-size: cover;
}

.scroll-driver {
  position: relative;
  height: 500vh;
}

.sticky-stage {
  position: sticky;
  top: 0;
  display: flex;
  height: 100vh;
  align-items: center;
  justify-content: center;
  overflow: clip;
}

.center-container {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.shape-wrap {
  position: absolute;
  inset: -5%;
}

.shape-wrap > div,
.shape-wrap svg {
  width: 100%;
  height: 100%;
}

.text-overlay {
  position: relative;
  pointer-events: none;
}

.text-inner {
  pointer-events: auto;
  padding: clamp(3rem, 6vw, 6rem) clamp(3rem, 7vw, 8rem);
}
```

## Interact config

```js
const range = {
  rangeStart: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
  rangeEnd: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
};

function slice(key, start, end) {
  const kf = [];
  if (start > 0) kf.push({ opacity: 0, offset: 0 }, { opacity: 0, offset: start - 0.001 });
  kf.push({ opacity: 1, offset: start }, { opacity: 1, offset: end });
  if (end < 1) kf.push({ opacity: 0, offset: end + 0.001 }, { opacity: 0, offset: 1 });
  return { key, keyframeEffect: { name: key, keyframes: kf }, fill: 'both', ...range };
}

const config = {
  interactions: [
    {
      key: 'scroll-driver',
      trigger: 'viewProgress',
      effects: [
        slice('mask-1', 0, 0.2),
        slice('mask-2', 0.2, 0.4),
        slice('mask-3', 0.4, 0.6),
        slice('mask-4', 0.6, 0.8),
        slice('mask-5', 0.8, 1),
      ],
    },
  ],
};
```
