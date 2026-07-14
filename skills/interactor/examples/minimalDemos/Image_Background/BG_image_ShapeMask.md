# BG Image ShapeMask

A scroll-driven animation for image and background layers in a sticky scroll section, flex/carousel, layered composition layout. It uses transform, clip-path to create the motion and transition between visual states.

**Tags:** trigger: viewProgress; layout: sticky scroll section, flex/carousel, layered composition; motion: transform, clip-path

## Markup

```html
<interact-element data-interact-key="scroll-section">
    <section class="scroll-section">
      <div class="sticky-container">

        <interact-element data-interact-key="bg-image">
          <div class="bg-layer bg-image"></div>
        </interact-element>

        <interact-element data-interact-key="bg-black">
          <div class="bg-layer bg-black"></div>
        </interact-element>

        <div class="overlay"></div>

        <div class="content">
          <h2 id="about-heading" class="label">About Us</h2>
          <div class="text-wrap">
            <p class="about-text">
              We build resilient communities<br>
              through <span class="highlight">education</span>, environmental<br>
              <span class="highlight">conservation</span>, and sustainable<br>
              <span class="highlight">agriculture</span> — working alongside<br>
              local leaders across 34 countries.
            </p>
          </div>
          <p class="org-name">Green Horizons Foundation</p>
        </div>

      </div>
    </section>
  </interact-element>
```

## Essential styles

```css
* { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Montserrat', system-ui, -apple-system, sans-serif;
      background: #0a0a0a;
      color: #fff;
      -webkit-font-smoothing: antialiased;
    }

    
    .scroll-section {
      height: 225vh;
      position: relative;
    }

    
    .sticky-container {
      position: sticky;
      top: 0;
      height: 100vh;
      width: 100%;
      overflow: clip;
      display: flex;
      align-items: center;
    }

    
    .bg-layer {
      position: absolute;
      inset: 0;
      background-size: cover;
      background-position: center;
    }

    .bg-black {
      z-index: 1;
      background: #0a0a0a;
      clip-path: circle(0% at 50% 50%);
    }

    
    .overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      z-index: 5;
    }

    
    .content {
      position: absolute;
      inset: 0;
      z-index: 10;
      display: flex;
      flex-direction: column;
      padding: 2.5rem 3rem;
      padding-left: 8vw;
    }

    @media (min-width: 768px) {
      .content { padding-left: 5vw; }
    }

    
    .label {
      font-family: 'Lora', Georgia, serif;
      font-style: italic;
      font-size: 1rem;
      font-weight: 400;
      letter-spacing: 0.02em;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-left: -8vw;
      margin-right: -3rem;
      padding-left: 8vw;
      padding-right: 3rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.35);
    }

    @media (min-width: 768px) {
      .label {
        margin-left: -5vw;
        margin-right: -3rem;
        padding-left: 5vw;
        padding-right: 3rem;
      }
    }
    .label::before {
      content: '';
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #fff;
      flex-shrink: 0;
    }

    
    .text-wrap {
      flex: 1;
      display: flex;
      align-items: center;
    }

    .about-text {
      font-size: clamp(2.07rem, 4vw, 2.62rem);
      font-weight: 300;
      line-height: 1.14;
      letter-spacing: -0.01em;
      color: rgba(255, 255, 255, 0.85);
      max-width: 1200px;
    }

    
    .highlight {
      display: inline;
      font-family: 'Lora', Georgia, serif;
      font-style: italic;
      font-weight: 400;
      color: #fff;
    }

    
    .org-name {
      font-family: 'Lora', Georgia, serif;
      font-style: italic;
      font-size: 1rem;
      font-weight: 400;
      letter-spacing: 0.02em;
      color: #fff;
      padding-bottom: 0.5rem;
    }
```

## Interact config

```js
const config = {
        conditions: {
          motionAllowed: { type: 'media', predicate: '(prefers-reduced-motion: no-preference)' },
        },
        interactions: [

          {
            key: 'scroll-section',
            trigger: 'viewProgress',
            conditions: ['motionAllowed'],
            effects: [
              
              {
                key: 'bg-image',
                fill: 'both',
                easing: 'linear',
                transitionDuration: 1500,
                transitionEasing: 'ease-out',
                keyframeEffect: {
                  name: 'zoom-out-image',
                  keyframes: [
                    { transform: 'scale(1.8)',  offset: 0 },
                    { transform: 'scale(1.0)',  offset: 1 },
                  ],
                },
                rangeStart: { name: 'entry', offset: { value: 0, unit: 'percentage' } },
                rangeEnd:   { name: 'exit',  offset: { value: 0, unit: 'percentage' } },
              },

              
              {
                key: 'bg-black',
                fill: 'both',
                easing: 'cubic-bezier(0.37, 0, 0.63, 1)',
                transitionDuration: 1500,
                transitionEasing: 'ease-out',
                keyframeEffect: {
                  name: 'reveal-black',
                  keyframes: [
                    { clipPath: 'circle(0% at 50% 50%)',   offset: 0 },
                    { clipPath: 'circle(0% at 50% 50%)',   offset: 0.25 },
                    { clipPath: 'circle(150% at 50% 50%)', offset: 0.75 },
                    { clipPath: 'circle(150% at 50% 50%)', offset: 1 },
                  ],
                },
                rangeStart: { name: 'entry', offset: { value: 0, unit: 'percentage' } },
                rangeEnd:   { name: 'exit',  offset: { value: 0, unit: 'percentage' } },
              },
            ],
          },

        ],
      };
```
