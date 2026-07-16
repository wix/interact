# Scroll Paragraph Fade

Each word in a sticky text block fades, rises, and unblurs into view one by one as the user scrolls, creating a staggered word-reveal effect driven by scroll progress.

**Tags:** viewProgress, stagger, fade, blur, opacity, transform, filter

## Markup

```html
<div class="spacer">Scroll Down ↓</div>

<interact-element data-interact-key="scroll-track">
  <div class="scroll-track">
    <div class="sticky-panel">
      <div class="content-block">
        <h2 id="target-eyebrow" class="text-content eyebrow" aria-label="The Philosophy">
          <span class="word" aria-hidden="true">The</span>
          <span class="word" aria-hidden="true">Philosophy</span>
        </h2>
        <h1
          id="target-text"
          class="text-content headline"
          aria-label="Designing interactions shouldn't be a struggle. We want text that flows like water."
        >
          <span class="word" aria-hidden="true">Designing</span>
          <span class="word" aria-hidden="true">interactions</span>
          <span class="word" aria-hidden="true">shouldn't</span>
          <span class="word" aria-hidden="true">be</span>
          <span class="word" aria-hidden="true">a</span>
          <span class="word" aria-hidden="true">struggle.</span>
          <span class="word" aria-hidden="true">We</span>
          <span class="word" aria-hidden="true">want</span>
          <span class="word" aria-hidden="true">text</span>
          <span class="word" aria-hidden="true">that</span>
          <span class="word" aria-hidden="true">flows</span>
          <span class="word" aria-hidden="true">like</span>
          <span class="word" aria-hidden="true">water.</span>
        </h1>
      </div>
    </div>
  </div>
</interact-element>

<div class="spacer">End of Section</div>
```

## Essential styles

```css
::-webkit-scrollbar {
  width: 0px;
}
body {
  -ms-overflow-style: none;
  scrollbar-width: none;
  min-height: 100vh;
  margin: 0;
}

.spacer {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scroll-track {
  position: relative;
  height: 300vh;
}

.sticky-panel {
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  align-items: center;
  padding: 0 5rem;
  overflow: clip;
}

.content-block {
  max-width: 56rem;
}

.text-content {
  line-height: 1.2;
}

.eyebrow {
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.headline {
  font-size: 3.75rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 0.75rem;
}

.word {
  display: inline-block;
  white-space: pre;
  transform-origin: bottom left;
  will-change: transform, opacity;
  opacity: 0.1;
  transform: translateY(20px);
}
```

## Interact config

```js
const wordRevealEffect = (element, progress) => {
  const wordElements = element.querySelectorAll('.word');
  const totalWords = wordElements.length;

  const finishAt = 0.8;
  const effectiveProgress = Math.min(progress / finishAt, 1.0);

  const entrySpeed = 0.1;

  wordElements.forEach((word, index) => {
    const start = (index / totalWords) * (1 - entrySpeed);
    const end = start + entrySpeed;

    let localProgress = (effectiveProgress - start) / (end - start);

    if (localProgress < 0) localProgress = 0;
    if (localProgress > 1) localProgress = 1;

    const eased = 1 - Math.pow(1 - localProgress, 3);

    const y = 40 - 40 * eased;
    const alpha = Math.max(0.1, eased);
    const blur = 10 - 10 * eased;

    word.style.transform = `translate3d(0, ${y}px, 0)`;
    word.style.opacity = alpha;
    word.style.filter = `blur(${blur}px)`;
  });
};

const config = {
  interactions: [
    {
      key: 'scroll-track',
      trigger: 'viewProgress',
      effects: [
        {
          customEffect: wordRevealEffect,
          fill: 'both',
          composite: 'replace',
          rangeStart: { name: 'entry', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'exit', offset: { value: 0, unit: 'percentage' } },
        },
      ],
    },
  ],
};
```
