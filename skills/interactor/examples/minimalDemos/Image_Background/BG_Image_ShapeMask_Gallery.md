# BG Image ShapeMask Gallery

A scroll-driven animation for gallery items in a sticky scroll section, grid/gallery, flex/carousel layout. It uses clip-path, transform, filter to create the motion and transition between visual states.

**Tags:** trigger: viewProgress; layout: sticky scroll section, grid/gallery, flex/carousel; motion: clip-path, transform, filter

## Markup

```html
<interact-element data-interact-key="scroll-section">
    <section class="scroll-section">
      <div class="sticky-container">

        <interact-element data-interact-key="bg-idle">
          <div class="bg-layer bg-idle"></div>
        </interact-element>

        <interact-element data-interact-key="bg-education">
          <div class="bg-layer bg-education"></div>
        </interact-element>

        <interact-element data-interact-key="bg-conservation">
          <div class="bg-layer bg-conservation"></div>
        </interact-element>

        <interact-element data-interact-key="bg-agriculture">
          <div class="bg-layer bg-agriculture"></div>
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
      height: 500vh;
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
                key: 'bg-education',
                fill: 'both',
                easing: 'cubic-bezier(0.37, 0, 0.63, 1)',
                transitionDuration: 1500,
                transitionEasing: 'ease-out',
                keyframeEffect: {
                  name: 'reveal-education',
                  keyframes: [
                    { clipPath: 'circle(0% at 50% 50%)',   transform: 'scale(1.2)',  offset: 0 },
                    { clipPath: 'circle(0% at 50% 50%)',   transform: 'scale(1.17)', offset: 0.10 },
                    { clipPath: 'circle(150% at 50% 50%)', transform: 'scale(1.06)', offset: 0.33 },
                    { clipPath: 'circle(150% at 50% 50%)', transform: 'scale(1.0)',  offset: 1 },
                  ],
                },
                rangeStart: { name: 'entry', offset: { value: 0, unit: 'percentage' } },
                rangeEnd:   { name: 'exit',  offset: { value: 0, unit: 'percentage' } },
              },

              
              {
                key: 'bg-conservation',
                fill: 'both',
                easing: 'cubic-bezier(0.37, 0, 0.63, 1)',
                transitionDuration: 1500,
                transitionEasing: 'ease-out',
                keyframeEffect: {
                  name: 'reveal-conservation',
                  keyframes: [
                    { clipPath: 'circle(0% at 50% 50%)',   transform: 'scale(1.2)',  offset: 0 },
                    { clipPath: 'circle(0% at 50% 50%)',   transform: 'scale(1.09)', offset: 0.38 },
                    { clipPath: 'circle(150% at 50% 50%)', transform: 'scale(1.02)', offset: 0.62 },
                    { clipPath: 'circle(150% at 50% 50%)', transform: 'scale(1.0)',  offset: 1 },
                  ],
                },
                rangeStart: { name: 'entry', offset: { value: 0, unit: 'percentage' } },
                rangeEnd:   { name: 'exit',  offset: { value: 0, unit: 'percentage' } },
              },

              
              {
                key: 'bg-agriculture',
                fill: 'both',
                easing: 'cubic-bezier(0.37, 0, 0.63, 1)',
                transitionDuration: 1500,
                transitionEasing: 'ease-out',
                keyframeEffect: {
                  name: 'reveal-agriculture',
                  keyframes: [
                    { clipPath: 'circle(0% at 50% 50%)',   transform: 'scale(1.15)', offset: 0 },
                    { clipPath: 'circle(0% at 50% 50%)',   transform: 'scale(1.08)', offset: 0.66 },
                    { clipPath: 'circle(150% at 50% 50%)', transform: 'scale(1.0)',  offset: 0.90 },
                    { clipPath: 'circle(150% at 50% 50%)', transform: 'scale(1.0)',  offset: 1 },
                  ],
                },
                rangeStart: { name: 'entry', offset: { value: 0, unit: 'percentage' } },
                rangeEnd:   { name: 'exit',  offset: { value: 0, unit: 'percentage' } },
              },

              
              {
                key: 'bg-idle',
                fill: 'both',
                easing: 'cubic-bezier(0.37, 0, 0.63, 1)',
                transitionDuration: 1500,
                transitionEasing: 'ease-out',
                keyframeEffect: {
                  name: 'blur-idle',
                  keyframes: [
                    { filter: 'blur(0px)',  offset: 0 },
                    { filter: 'blur(0px)',  offset: 0.10 },
                    { filter: 'blur(30px)', offset: 0.33 },
                    { filter: 'blur(30px)', offset: 1 },
                  ],
                },
                rangeStart: { name: 'entry', offset: { value: 0, unit: 'percentage' } },
                rangeEnd:   { name: 'exit',  offset: { value: 0, unit: 'percentage' } },
              },

              
              {
                key: 'bg-education',
                fill: 'both',
                easing: 'cubic-bezier(0.37, 0, 0.63, 1)',
                transitionDuration: 1500,
                transitionEasing: 'ease-out',
                keyframeEffect: {
                  name: 'blur-education',
                  keyframes: [
                    { filter: 'blur(0px)',  offset: 0 },
                    { filter: 'blur(0px)',  offset: 0.38 },
                    { filter: 'blur(30px)', offset: 0.62 },
                    { filter: 'blur(30px)', offset: 1 },
                  ],
                },
                rangeStart: { name: 'entry', offset: { value: 0, unit: 'percentage' } },
                rangeEnd:   { name: 'exit',  offset: { value: 0, unit: 'percentage' } },
              },

              
              {
                key: 'bg-conservation',
                fill: 'both',
                easing: 'cubic-bezier(0.37, 0, 0.63, 1)',
                transitionDuration: 1500,
                transitionEasing: 'ease-out',
                keyframeEffect: {
                  name: 'blur-conservation',
                  keyframes: [
                    { filter: 'blur(0px)',  offset: 0 },
                    { filter: 'blur(0px)',  offset: 0.66 },
                    { filter: 'blur(30px)', offset: 0.90 },
                    { filter: 'blur(30px)', offset: 1 },
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
