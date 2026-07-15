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
            <img src="https://images.unsplash.com/photo-1439405326854-014607f694d7?q=80&w=1920&auto=format&fit=crop" alt="Ocean View" class="panel-background">
            <div class="panel-content">
              <h2>Panel One</h2>
              <p>As you scroll down, the panels will slide horizontally from right to left.</p>
            </div>
          </div>
          <div class="panel">
            <img src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=1920&auto=format&fit=crop" alt="Misty Lake" class="panel-background">
            <div class="panel-content">
              <h2>Panel Two</h2>
              <p>This effect is powered by the @wix/interact library using a viewProgress trigger.</p>
            </div>
          </div>
          <div class="panel">
            <img src="https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=1920&auto=format&fit=crop" alt="Forest" class="panel-background">
            <div class="panel-content">
              <h2>Panel Three</h2>
              <p>The entire animation is defined declaratively, with no manual scroll event listeners.</p>
            </div>
          </div>
          <div class="panel">
            <img src="https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80&w=1920&auto=format&fit=crop" alt="Meadow" class="panel-background">
            <div class="panel-content">
              <h2>Panel Four</h2>
              <p>The contain range maps scroll progress within a sticky section perfectly.</p>
            </div>
          </div>
          <div class="panel">
            <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1920&auto=format&fit=crop" alt="Misty Mountains" class="panel-background">
            <div class="panel-content">
              <h2>Panel Five</h2>
              <p>Linear easing ensures a direct 1:1 relationship between vertical scroll and horizontal movement.</p>
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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');

:root {
    --panel-w: 100vw;
    --panel-h: 100vh;
    --panel-gap: 0px;
    --outer-pad: 0px;
    --section-height: 800vh;
}

body {
    margin: 0;
    font-family: 'Inter', sans-serif;
    background-color: #1a1a1a;
    color: #f0f2f5;
    overflow-x: hidden;
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
    overflow: hidden;
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
    will-change: transform;
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
    overflow: hidden;
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
    color: #ffffff;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 60%);
    padding: 2rem;
    margin: -4rem;
    padding-top: 6rem;
    padding-left: 4rem;
    padding-right: 4rem;
    width: calc(100% + 8rem);
}

.panel h2 {
    font-size: clamp(1.5rem, calc(var(--panel-w) * 0.03), 4rem);
    margin: 0;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

.panel p {
    font-size: clamp(0.875rem, calc(var(--panel-w) * 0.0125), 1.5rem);
    max-width: 60%;
    width: auto;
    opacity: 0.9;
    margin-top: 1rem;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
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

    .panel h2 {
        font-size: 2.5rem;
    }

    .panel p {
        font-size: 1.125rem;
    }
}
```

## Interact config

```js
{
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
                            { transform: 'translateX(calc(-100% + 100vw))' }
                        ]
                    },
                    rangeStart: { name: 'contain', offset: { unit: 'percentage', value: 0 } },
                    rangeEnd: { name: 'contain', offset: { unit: 'percentage', value: 100 } },
                    easing: 'linear',
                    fill: 'both'
                }
            ]
        }
    ]
}
```
