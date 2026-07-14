# Left Panel 3d Door Reveal

A scroll-driven animation for layered visual elements in a flex/carousel, layered composition, 3D scene layout. It uses transform, opacity to create the motion and transition between visual states.

**Tags:** trigger: viewProgress; layout: flex/carousel, layered composition, 3D scene; motion: transform, opacity

## Markup

```html
<header class="header">
    <div class="header__logo">Nexus</div>
    <div class="header__actions"></div>
  </header>

  <section class="hero">
    <interact-element data-interact-key="hero-img">
      <div class="hero__img-wrap">
        <img
          class="hero__img"
        />
      </div>
    </interact-element>
    <div class="hero__gradient"></div>
    <interact-element data-interact-key="hero-darken">
      <div class="hero__darken"></div>
    </interact-element>

  </section>

  <div class="spacer"></div>

  <interact-element data-interact-key="driver">
    <div class="driver"></div>
  </interact-element>

  <div class="circle-wrap">
    <interact-element data-interact-key="circle-reveal">
      <div class="circle"></div>
    </interact-element>
  </div>

  <interact-element data-interact-key="s2-content">
    <section class="section-two">
      <p class="section-two__label">Why Nexus</p>
      <h2 class="section-two__title">Built<br/>Different.</h2>
      <div class="section-two__rule"></div>
      <p class="section-two__intro">Performance without compromise. Architecture without limits. Next-generation silicon delivering unprecedented power per watt — unified memory, silent thermals, and all-day battery. Every component engineered to disappear so all you experience is absolute focus.</p>
    </section>
  </interact-element>
```

## Essential styles

```css
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background: #000;
      color: #fff;
      -webkit-font-smoothing: antialiased;
      overflow-x: clip;
    }

    interact-element { display: block; }

    
    .header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 32px 52px;
      mix-blend-mode: difference;
      color: #fff;
    }

    .header__logo {
      font-size: 1.4rem;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
    }

    .header__actions {
      display: flex;
      align-items: center;
      gap: 28px;
      font-size: 0.7rem;
      font-weight: 500;
      letter-spacing: 0.18em;
      text-transform: uppercase;
    }

    .header__search {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      display: flex;
      align-items: center;
    }

    .header__search svg {
      width: 17px;
      height: 17px;
    }

    
    .hero {
      position: fixed;
      inset: 0;
      z-index: 1;
    }

    .hero__img-wrap {
      position: absolute;
      inset: 0;
    }

    .hero__img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center 15%;
      transform-origin: center center;
    }

    .hero__gradient {
      position: absolute;
      inset: 0;
      background:
        linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 30%),
        linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.35) 100%);
    }

    .hero__darken {
      position: absolute;
      inset: 0;
      background: #000;
      opacity: 0.4;
    }

    
    .spacer { height: 100vh; }

    .driver { height: 120vh; }

    
    .circle-wrap {
      position: fixed;
      inset: 0;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      padding-left: 0;
      pointer-events: none;
    }

    .circle-wrap interact-element {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      width: 100%;
      height: 100%;
    }

    .circle {
      width: 80vh;
      height: 100vh;
      flex-shrink: 0;
      border-radius: 0;
      background: #fff;
      transform-origin: right center;
      backface-visibility: hidden;
    }

    
    .section-two {
      position: fixed;
      z-index: 4;
      top: 0;
      left: 0;
      width: 80vh;
      height: 100vh;
      color: #000;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 8vh;
      pointer-events: none;
      transform-origin: right center;
      backface-visibility: hidden;
    }

    .section-two a { pointer-events: auto; }

    .section-two__label {
      font-size: 0.6rem;
      font-weight: 500;
      letter-spacing: 0.35em;
      text-transform: uppercase;
      color: #999;
      margin-bottom: 3vh;
    }

    .section-two__title {
      font-size: clamp(3rem, 7.5vh, 6.5rem);
      font-weight: 700;
      letter-spacing: -0.04em;
      line-height: 1;
      color: #000;
      margin-bottom: 4vh;
    }

    .section-two__rule {
      width: 40px;
      height: 1px;
      background: rgba(0,0,0,0.15);
      margin-bottom: 4vh;
    }

    .section-two__intro {
      font-size: clamp(0.95rem, 1.7vh, 1.2rem);
      font-weight: 400;
      line-height: 1.8;
      color: #555;
      max-width: 48ch;
      letter-spacing: 0.005em;
    }

    
    @media (max-width: 1024px) {
      .section-two__title { font-size: clamp(2.5rem, 6vh, 4.5rem); }
      .section-two { padding: 6vh; }
    }

    @media (max-width: 768px) {
      .header { padding: 20px 20px; }
      .header__logo { font-size: 1.3rem; }
      .circle { width: 100vw; height: 100vh; transform-origin: right center; }
      .section-two {
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
        padding: 24px;
        padding-top: 100px;
        transform-origin: right center;
      }
      .section-two__title { font-size: clamp(2.2rem, 8vw, 3.5rem); }
      .section-two__intro { font-size: 0.95rem; max-width: none; }
    }

    @media (max-width: 480px) {
      .header { padding: 16px 16px; }
      .section-two { padding: 20px; padding-top: 80px; }
      .section-two__title { font-size: clamp(2rem, 9vw, 3rem); }
      .section-two__intro { font-size: 0.85rem; line-height: 1.65; }
      .section-two__label { margin-bottom: 2vh; }
    }
```

## Interact config

```js
const config = {
      interactions: [

        
        {
          key: 'driver',
          trigger: 'viewProgress',
          effects: [
            
            {
              key: 's2-content',
              selector: '.section-two',
              keyframeEffect: {
                name: 'text-door-open',
                keyframes: [
                  { transform: 'perspective(1200px) rotateY(0deg)' },
                  { transform: 'perspective(1200px) rotateY(-89.5deg)' },
                ],
              },
              rangeStart: { name: 'entry', offset: { value: 12, unit: 'percentage' } },
              rangeEnd:   { name: 'entry', offset: { value: 80, unit: 'percentage' } },
              easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
              fill: 'both',
            },
            
            {
              key: 's2-content',
              selector: '.section-two',
              keyframeEffect: {
                name: 'text-fade',
                keyframes: [
                  { opacity: 1 },
                  { opacity: 0 },
                ],
              },
              rangeStart: { name: 'entry', offset: { value: 55, unit: 'percentage' } },
              rangeEnd:   { name: 'entry', offset: { value: 72, unit: 'percentage' } },
              fill: 'both',
            },
            
            {
              key: 'circle-reveal',
              selector: '.circle',
              keyframeEffect: {
                name: 'door-open',
                keyframes: [
                  { transform: 'perspective(1200px) rotateY(0deg)' },
                  { transform: 'perspective(1200px) rotateY(-89.5deg)' },
                ],
              },
              rangeStart: { name: 'entry', offset: { value: 12, unit: 'percentage' } },
              rangeEnd:   { name: 'entry', offset: { value: 80, unit: 'percentage' } },
              easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
              fill: 'both',
            },
            
            {
              key: 'circle-reveal',
              selector: '.circle',
              keyframeEffect: {
                name: 'door-fade',
                keyframes: [
                  { opacity: 1 },
                  { opacity: 0 },
                ],
              },
              rangeStart: { name: 'entry', offset: { value: 78, unit: 'percentage' } },
              rangeEnd:   { name: 'entry', offset: { value: 84, unit: 'percentage' } },
              fill: 'both',
            },
            
            {
              key: 'hero-img',
              keyframeEffect: {
                name: 'img-settle',
                keyframes: [
                  { transform: 'scale(1.15)' },
                  { transform: 'scale(1)' },
                ],
              },
              rangeStart: { name: 'entry', offset: { value: 20, unit: 'percentage' } },
              rangeEnd:   { name: 'entry', offset: { value: 100, unit: 'percentage' } },
              easing: 'ease-out',
              fill: 'both',
            },
            
            {
              key: 'hero-darken',
              keyframeEffect: {
                name: 'darken-lift',
                keyframes: [
                  { opacity: 0.4 },
                  { opacity: 0 },
                ],
              },
              rangeStart: { name: 'entry', offset: { value: 60, unit: 'percentage' } },
              rangeEnd:   { name: 'entry', offset: { value: 100, unit: 'percentage' } },
              easing: 'ease-out',
              fill: 'both',
            },
          ],
        },

      ],
    };
```
