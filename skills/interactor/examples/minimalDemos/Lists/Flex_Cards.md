# Flex Cards

A viewport-entry, scroll-driven and click-triggered animation for cards in a grid/gallery, flex/carousel, list/repeater layout. It uses width, transform, opacity to create the motion and transition between visual states.

**Tags:** trigger: viewEnter, viewProgress, click; layout: grid/gallery, flex/carousel, list/repeater; motion: width, transform, opacity

## Markup

```html
<div class="page">
    <a href="#items-list" class="sr-only">Skip to projects</a>
    <nav class="nav">
      <div class="nav-group">
        <a href="#" class="nav-brand">forma°</a>
        <a href="#">design collective</a>
      </div>
      <div></div>
      <div class="nav-group">
        <a href="#">threads</a>
        <a href="#">behance</a>
      </div>
      <div>
        <span class="nav-location">brooklyn, ny</span>
      </div>
    </nav>

    <div class="h1-section">
      <div class="clip-mask">
        <interact-element data-interact-key="h1-line1" data-interact-initial="true">
          <div><h1>Recent work</h1></div>
        </interact-element>
      </div>
      <div class="clip-mask">
        <interact-element data-interact-key="h1-line2" data-interact-initial="true">
          <div><h1>2018/present</h1></div>
        </interact-element>
      </div>
      <div class="clip-mask">
        <interact-element data-interact-key="h1-sub" data-interact-initial="true">
          <p class="h1-sub">Selected projects from our studio</p>
        </interact-element>
      </div>
    </div>

    <section>
      <div class="items-list" id="items-list"></div>
    </section>
  </div>
```

## Essential styles

```css
* { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background: #f2f0ed;
      color: #000;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    interact-element { display: block; }

    .page {
      max-width: 1400px;
      margin: 0 auto;
      padding: 40px 24px 120px;
      min-height: 100vh;
    }

    .nav {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 80px;
      font-size: 12px;
      letter-spacing: 0.02em;
    }
    .nav-group { display: flex; gap: 40px; }
    .nav a {
      color: #595959;
      text-decoration: none;
      transition: color 0.2s;
    }
    .nav a:hover { color: #000; }
    .nav a:focus-visible { outline: 2px solid #000; outline-offset: 2px; }
    .nav-brand { font-weight: 600; color: #000 !important; }
    .nav-location { font-size: 11px; color: #757575; }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      border: 0;
    }
    .sr-only:focus {
      position: fixed;
      top: 12px;
      left: 12px;
      width: auto;
      height: auto;
      padding: 8px 16px;
      margin: 0;
      overflow: visible;
      clip: auto;
      background: #000;
      color: #fff;
      font-size: 14px;
      z-index: 100;
      border-radius: 4px;
    }

    .clip-mask { overflow: clip; }

    h1 {
      font-size: clamp(56px, 9vw, 120px);
      font-weight: 900;
      line-height: 0.92;
      letter-spacing: -0.03em;
      text-transform: uppercase;
    }
    .h1-section {
      margin-bottom: 80px;
      text-align: center;
    }
    .h1-sub {
      font-size: 14px;
      font-weight: 400;
      color: #757575;
      margin-top: 16px;
      letter-spacing: 0.04em;
    }

    .items-list {
      display: grid;
      grid-template-columns: 1fr 1fr;
      align-items: start;
      gap: 0;
    }
    .items-list > interact-element {
      margin-right: -1px;
      margin-bottom: -1px;
    }

    .item-block {
      cursor: pointer;
      user-select: none;
      padding: 48px 32px;
      position: relative;
      height: 100%;
      border: 1px solid #d4d0cc;
    }
    .item-block:focus-visible {
      outline: 2px solid #000;
      outline-offset: -2px;
    }

    .item-num {
      font-size: 11px;
      letter-spacing: 0.08em;
      color: #757575;
      text-transform: uppercase;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
    }
    .item-year {
      font-size: 11px;
      color: #757575;
      font-weight: 500;
    }

    .item-client {
      font-size: clamp(32px, 4.5vw, 64px);
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1;
      margin-bottom: 10px;
      transition: letter-spacing 500ms cubic-bezier(0.16, 1, 0.3, 1);
    }
    .item-block:hover .item-client {
      letter-spacing: 0.01em;
    }

    .item-type {
      font-size: 14px;
      color: #6b6b6b;
      font-weight: 400;
      line-height: 1.4;
    }

    .item-accent {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 3px;
      background: #000;
      transform: scaleX(0);
      transform-origin: left center;
      transition: transform 500ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    .item-block:hover .item-accent {
      transform: scaleX(1);
      transition: transform 350ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    .item-expand {
      display: grid;
      grid-template-rows: 0fr;
      opacity: 0;
      overflow: hidden;
    }
    .expand-inner { overflow: hidden; }
    .expand-content {
      padding: 28px 0 8px;
    }
    .expand-image {
      margin-bottom: 20px;
    }
    .expand-image img {
      width: 100%;
      height: auto;
      display: block;
      border-radius: 4px;
    }
    .expand-text p {
      font-size: 14px;
      line-height: 1.75;
      color: #595959;
    }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
      }
    }

    @media (max-width: 768px) {
      .page { padding: 24px 48px 80px; }
      .nav { padding-bottom: 48px; flex-wrap: wrap; gap: 12px; }
      .nav-group { gap: 20px; }
      .h1-section { margin-bottom: 48px; }
      .items-list {
        grid-template-columns: 1fr;
      }
      .items-list > interact-element {
        margin-right: 0;
      }
      .item-block {
        border-left: none;
        border-right: none;
      }
      .item-block {
        padding: 32px 16px;
      }
    }
```

## Interact config

```js
const items = [
      { num: 'N°001', client: 'Verdant', type: 'Sustainability campaign series', year: '2024', img: 'IMAGE_URL', desc: 'A multi-channel sustainability campaign weaving environmental narratives through bold visual design and responsive interactive modules.' },
      { num: 'N°002', client: 'Kinetic', type: 'Motion branding identity suite', year: '2024', img: 'IMAGE_URL', desc: 'A kinetic brand identity system merging typography with motion design to establish a distinctive and evolving visual language.' },
      { num: 'N°003', client: 'AR/K', type: 'Digital commerce platform', year: '2024', img: 'IMAGE_URL', desc: 'A refined commerce platform built around intuitive navigation and expressive product imagery for a contemporary retail brand.' },
      { num: 'N°004', client: 'Passage', type: 'Immersive editorial design', year: '2023', img: 'IMAGE_URL', desc: 'A long-form editorial experience leading readers through curated visual chapters with parallax-driven layouts and rich media.' },
      { num: 'N°005', client: 'Novacell', type: 'Healthtech product showcase', year: '2023', img: 'IMAGE_URL', desc: 'A clinical product showcase for a health technology startup, balancing technical depth with approachable and human-centered design.' },
      { num: 'N°006', client: '3Capital', type: 'Fintech launch experience', year: '2023', img: 'IMAGE_URL', desc: 'A high-energy launch site for a financial technology platform, pairing kinetic interfaces with clear transactional data flows.' }
    ];

const listEl = document.getElementById('items-list');

items.forEach((item, i) => {
      const interactEl = document.createElement('interact-element');
      interactEl.setAttribute('data-interact-key', `item-${i}`);

      interactEl.innerHTML = `
        <div class="item-block">
          <div class="item-num">
            <span>${item.num}</span>
            <span class="item-year">${item.year}</span>
          </div>
          <div class="item-client">${item.client}</div>
          <div class="item-type">${item.type}</div>
          <div class="item-accent"></div>
          <div class="item-expand">
            <div class="expand-inner">
              <div class="expand-content">
                <div class="expand-image"><img></div>
                <div class="expand-text"><p>${item.desc}</p></div>
              </div>
            </div>
          </div>
        </div>
      `;

      listEl.appendChild(interactEl);
    });

const conditions = {
        desktop: { type: 'media', predicate: '(min-width: 769px)' },
        mobile: { type: 'media', predicate: '(max-width: 768px)' }
      };

const interactions = [];

interactions.push({
        key: 'h1-line1',
        trigger: 'viewEnter',
        params: { type: 'once' },
        effects: [{
          keyframeEffect: {
            name: 'h1Flip1',
            keyframes: [
              { transform: 'translateY(100%) rotateX(-15deg)', opacity: '0', offset: 0 },
              { transform: 'translateY(0%) rotateX(0deg)', opacity: '1', offset: 1 }
            ]
          },
          duration: 1000,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'both'
        }]
      });

interactions.push({
        key: 'h1-line2',
        trigger: 'viewEnter',
        params: { type: 'once' },
        effects: [{
          keyframeEffect: {
            name: 'h1Flip2',
            keyframes: [
              { transform: 'translateY(100%) rotateX(-15deg)', opacity: '0', offset: 0 },
              { transform: 'translateY(0%) rotateX(0deg)', opacity: '1', offset: 1 }
            ]
          },
          duration: 1000,
          delay: 150,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'both'
        }]
      });

interactions.push({
        key: 'h1-sub',
        trigger: 'viewEnter',
        params: { type: 'once' },
        effects: [{
          keyframeEffect: {
            name: 'subFade',
            keyframes: [
              { transform: 'translateY(100%)', opacity: '0', offset: 0 },
              { transform: 'translateY(0%)', opacity: '1', offset: 1 }
            ]
          },
          duration: 800,
          delay: 350,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'both'
        }]
      });

items.forEach((_, i) => {
        const key = `item-${i}`;
        const isLeft = i % 2 === 0;

        interactions.push({
          key,
          trigger: 'viewEnter',
          params: { type: 'once' },
          conditions: ['desktop'],
          effects: [{
            keyframeEffect: {
              name: `itemSlideDesktop${i}`,
              keyframes: [
                { transform: `translateX(${isLeft ? '-48px' : '48px'})`, opacity: '0', offset: 0 },
                { transform: 'translateX(0)', opacity: '1', offset: 1 }
              ]
            },
            duration: 800,
            delay: 200 + (Math.floor(i / 2)) * 150,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            fill: 'both'
          }]
        });

        interactions.push({
          key,
          trigger: 'viewEnter',
          params: { type: 'once' },
          conditions: ['mobile'],
          effects: [{
            keyframeEffect: {
              name: `itemSlideMobile${i}`,
              keyframes: [
                { transform: 'translateX(-48px)', opacity: '0', offset: 0 },
                { transform: 'translateX(0)', opacity: '1', offset: 1 }
              ]
            },
            duration: 800,
            delay: 200 + i * 100,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            fill: 'both'
          }]
        });

        interactions.push({
          key,
          trigger: 'viewProgress',
          effects: [{
            selector: '.item-block',
            keyframeEffect: {
              name: `itemScroll${i}`,
              keyframes: [
                { opacity: '0.25', offset: 0 },
                { opacity: '1', offset: 0.3 },
                { opacity: '1', offset: 0.7 },
                { opacity: '0.25', offset: 1 }
              ]
            },
            rangeStart: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
            rangeEnd: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
            fill: 'both',
            easing: 'linear'
          }]
        });

        interactions.push({
          key,
          trigger: 'click',
          effects: [{
            selector: '.item-expand',
            transition: {
              duration: 500,
              easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
              styleProperties: [
                { name: 'grid-template-rows', value: '1fr' },
                { name: 'opacity', value: '1' }
              ]
            }
          }]
        });
      });

const config = { conditions, interactions };
```
