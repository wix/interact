# Classic Horizontal Scroll

Eight full-viewport panels translate horizontally as the user scrolls vertically, driven by a `viewProgress` trigger on a tall sticky section that maps scroll progress to `translateX` on the panel track.

**Tags:** viewProgress, sticky, flex, transform, horizontal-scroll

## Markup

```html
<interact-element data-interact-key="#scroll-container">
  <section id="scroll-container">
    <div class="sticky-wrapper">
      <interact-element data-interact-key="#horizontal-track">
        <div id="horizontal-track">
          <div class="panel">
            <img src="" class="panel-background" />
            <div class="panel-content">
              <h2>Panel One</h2>
              <p>Sample text provides enough length to demonstrate this animated content layout.</p>
            </div>
          </div>
          <div class="panel">
            <img src="" class="panel-background" />
            <div class="panel-content">
              <h2>Panel Two</h2>
              <p>
                This effect is powered by the @wix/interact library using a viewProgress trigger.
              </p>
            </div>
          </div>
          <div class="panel">
            <img src="" class="panel-background" />
            <div class="panel-content">
              <h2>Panel Three</h2>
              <p>
                The entire animation is defined declaratively, with no manual scroll event
                listeners.
              </p>
            </div>
          </div>
          <div class="panel">
            <img src="" class="panel-background" />
            <div class="panel-content">
              <h2>Panel Four</h2>
              <p>The contain range maps scroll progress within a sticky section perfectly.</p>
            </div>
          </div>
          <div class="panel">
            <img src="" class="panel-background" />
            <div class="panel-content">
              <h2>Panel Five</h2>
              <p>Sample text provides enough length to demonstrate this animated content layout.</p>
            </div>
          </div>
        </div>
      </interact-element>
    </div>
  </section>
</interact-element>
```

## Essential styles

```css
:root {
  --panel-w: 100vw;
  --panel-h: 100vh;
  --panel-gap: 0px;
  --outer-pad: 0px;
  --section-height: 800vh;
}

body {
  margin: 0;
  overflow-x: clip;
}

#scroll-container {
  height: var(--section-height);
  position: relative;
}

.sticky-wrapper {
  position: sticky;
  top: 0;
  height: 100vh;
  width: 100%;
  overflow: clip;
  display: flex;
  align-items: center;
  padding-block: var(--outer-pad);
  box-sizing: border-box;
}

#horizontal-track {
  display: flex;
  gap: var(--panel-gap);
  height: var(--panel-h);
  width: calc(var(--panel-w) * 8 + var(--panel-gap) * 7);
  padding-inline: var(--outer-pad);
}

.panel {
  width: var(--panel-w);
  height: 100%;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  padding: 4rem;
  box-sizing: border-box;
  text-align: left;
  position: relative;
  overflow: clip;
}

.panel-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

.panel-content {
  position: relative;
  z-index: 2;
  padding: 2rem;
  margin: -4rem;
  padding-top: 6rem;
  padding-left: 4rem;
  padding-right: 4rem;
  width: calc(100% + 8rem);
}

.panel h2 {
  margin: 0;
}

.panel p {
  max-width: 60%;
  width: auto;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .panel {
    padding: 2rem;
  }

  .panel-content {
    margin: -2rem;
    width: calc(100% + 4rem);
    padding: 4rem 2rem 2rem 2rem;
  }
}
```

## Interact config

```js
const config = {
  interactions: [
    {
      key: '#scroll-container',
      trigger: 'viewProgress',
      effects: [
        {
          key: '#horizontal-track',
          keyframeEffect: {
            name: 'horizontal-scroll',
            keyframes: [
              { transform: 'translateX(0)' },
              { transform: 'translateX(calc(-100% + 100vw))' },
            ],
          },
          rangeStart: { name: 'contain', offset: { unit: 'percentage', value: 0 } },
          rangeEnd: { name: 'contain', offset: { unit: 'percentage', value: 100 } },
          easing: 'linear',
          fill: 'both',
        },
      ],
    },
  ],
};
```
