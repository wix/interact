# Lumina Orbit Scroll

A scroll-driven animation for image and background layers in a sticky scroll section, flex/carousel, layered composition layout. It uses transform, border-radius, filter, opacity to create the motion and transition between visual states.

**Tags:** trigger: viewProgress; layout: sticky scroll section, flex/carousel, layered composition; motion: transform, border-radius, filter, opacity

## Markup

```html
<interact-element data-interact-key="track">
    <section class="sticky-track">
      <div class="sticky-frame">
        <div class="image-wrapper">
          <img />
          <div class="hero-content">
            <h1>Ethereal</h1>
            <p>Between silence and light</p>
            <a href="#" class="cta-btn">Explore</a>
          </div>
        </div>
      </div>
    </section>
  </interact-element>
```

## Essential styles

```css
* { margin: 0; padding: 0; box-sizing: border-box; }

    interact-element { display: block; }

    body {
      font-family: 'Outfit', sans-serif;
      background: #000;
      color: #fff;
      -webkit-font-smoothing: antialiased;
    }

    .sticky-track {
      height: 500vh;
      position: relative;
    }

    .sticky-frame {
      position: sticky;
      top: 0;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: clip;
    }

    .image-wrapper {
      position: relative;
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1;
    }

    .image-wrapper img {
      position: relative;
      display: block;
      width: 100vw;
      height: 100vh;
      object-fit: cover;
      z-index: 1;
    }

    .hero-content {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 10;
      pointer-events: none;
      gap: 12px;
    }

    .hero-content h1 {
      font-family: 'Playfair Display', serif;
      font-size: clamp(3rem, 10vw, 7.5rem);
      font-weight: 400;
      font-style: italic;
      letter-spacing: 0.12em;
      line-height: 0.95;
      color: #fff;
      text-shadow: 0 2px 40px rgba(0, 0, 0, 0.3);
    }

    .hero-content p {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: clamp(0.75rem, 1.2vw, 0.95rem);
      font-weight: 300;
      letter-spacing: 0.35em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.55);
    }

    .cta-btn {
      display: inline-block;
      margin-top: 16px;
      padding: 11px 40px;
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: clamp(0.7rem, 1vw, 0.85rem);
      font-weight: 400;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      text-decoration: none;
      color: rgba(255, 255, 255, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: 0;
      background: transparent;
      cursor: pointer;
      pointer-events: auto;
      transition: all 0.4s ease;
    }

    .cta-btn:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(255, 255, 255, 0.6);
      letter-spacing: 0.38em;
    }
```

## Interact config

```js
const config = {
      interactions: [
        {
          key: 'track',
          trigger: 'viewProgress',
          effects: [
            {
              selector: 'img',
              keyframeEffect: {
                name: 'orbit-image',
                keyframes: [
                  {
                    transform: 'scale(1.1) perspective(1500px) rotateX(0deg) rotateY(0deg)',
                    borderRadius: '0px',
                    filter: 'brightness(0.5) saturate(1.3) grayscale(0) sepia(0)',
                    opacity: '1',
                    offset: 0,
                  },
                  {
                    transform: 'scale(0.65) perspective(1500px) rotateX(12deg) rotateY(-15deg)',
                    borderRadius: '20px',
                    filter: 'brightness(0.75) saturate(1.1) grayscale(0) sepia(0.1)',
                    opacity: '1',
                    offset: 0.35,
                  },
                  {
                    transform: 'scale(0.4) perspective(1500px) rotateX(-8deg) rotateY(12deg)',
                    borderRadius: '28px',
                    filter: 'brightness(0.8) saturate(0.9) grayscale(0) sepia(0.2)',
                    opacity: '1',
                    offset: 0.5,
                  },
                  {
                    transform: 'scale(0.2) perspective(1500px) rotateX(0deg) rotateY(0deg)',
                    borderRadius: '32px',
                    filter: 'brightness(0.5) saturate(0.3) grayscale(0.4) sepia(0.4)',
                    opacity: '0.6',
                    offset: 0.75,
                  },
                  {
                    transform: 'scale(0.01) perspective(1500px) rotateX(0deg) rotateY(0deg)',
                    borderRadius: '32px',
                    filter: 'brightness(0.3) saturate(0.2) grayscale(0.6) sepia(0.5)',
                    opacity: '0',
                    offset: 1,
                  },
                ],
              },
              rangeStart: { name: 'contain', offset: { value: 0, unit: 'percentage' } },
              rangeEnd:   { name: 'contain', offset: { value: 100, unit: 'percentage' } },
              fill: 'both',
            },
            {
              selector: 'h1',
              keyframeEffect: {
                name: 'title-reveal',
                keyframes: [
                  { opacity: '1', transform: 'translateY(0) scale(1)', offset: 0 },
                  { opacity: '1', transform: 'translateY(0) scale(1)', offset: 0.7 },
                  { opacity: '0.7', transform: 'translateY(-20px) scale(0.95)', offset: 1 },
                ],
              },
              rangeStart: { name: 'contain', offset: { value: 0, unit: 'percentage' } },
              rangeEnd:   { name: 'contain', offset: { value: 100, unit: 'percentage' } },
              fill: 'both',
            },
            {
              selector: '.hero-content p',
              keyframeEffect: {
                name: 'subtitle-fade',
                keyframes: [
                  { opacity: '1', transform: 'translateY(0)', offset: 0 },
                  { opacity: '1', transform: 'translateY(0)', offset: 0.7 },
                  { opacity: '0.5', transform: 'translateY(-10px)', offset: 1 },
                ],
              },
              rangeStart: { name: 'contain', offset: { value: 0, unit: 'percentage' } },
              rangeEnd:   { name: 'contain', offset: { value: 100, unit: 'percentage' } },
              fill: 'both',
            },
          ],
        },
      ],
    };
```
