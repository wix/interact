# Icon Pill Slider

A hover-triggered, click-triggered and viewport-entry animation for layered visual elements in a grid/gallery, flex/carousel, list/repeater layout. It uses transform, clip-path, width to create the motion and transition between visual states.

**Tags:** trigger: hover, click, viewEnter; layout: grid/gallery, flex/carousel, list/repeater; motion: transform, clip-path, width

## Markup

```html
<header class="header">
    <a href="#" class="header-logo">
      <div class="logo-icon">
        <svg viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="11" cy="15" r="9" stroke="#1a1a1a" stroke-width="2" fill="none"/>
          <circle cx="19" cy="15" r="9" stroke="#1a1a1a" stroke-width="2" fill="none"/>
        </svg>
      </div>
      <span class="logo-text">Powerlabs</span>
    </a>

    <nav class="header-nav">
      <a href="#">Shop</a>
      <a href="#">About</a>
      <a href="#">Contact</a>
      <a href="#">Services</a>
    </nav>

    <button class="header-menu-btn">
      <span></span><span></span><span></span><span></span>
    </button>
  </header>

  <section class="services-section">
    <h2 class="services-heading">Our services</h2>
    <p class="services-subtitle">Element moves across the screen from side to side.</p>

    <div class="services-list">

      <interact-element data-interact-key="svc-0">
        <div class="service-item">
          <div class="service-pill">
            <p class="service-pill-desc">Sustainable energy solutions for industrial and commercial power generation.</p>
            <div class="service-icon-circle">
              <div class="icon-fill"></div>
              <span class="material-symbols-outlined">bolt</span>
            </div>
          </div>
          <span class="service-name">Power Plants</span>
          <span class="service-toggle"></span>
        </div>
      </interact-element>

      <interact-element data-interact-key="svc-1">
        <div class="service-item">
          <div class="service-pill">
            <p class="service-pill-desc">Advanced protection systems for residential and smart home environments.</p>
            <div class="service-icon-circle">
              <div class="icon-fill"></div>
              <span class="material-symbols-outlined">deployed_code</span>
            </div>
          </div>
          <span class="service-name">Home Security</span>
          <span class="service-toggle"></span>
        </div>
      </interact-element>

      <interact-element data-interact-key="svc-2">
        <div class="service-item">
          <div class="service-pill">
            <p class="service-pill-desc">End-to-end manufacturing solutions with cutting-edge automation technology.</p>
            <div class="service-icon-circle">
              <div class="icon-fill"></div>
              <span class="material-symbols-outlined">diamond</span>
            </div>
          </div>
          <span class="service-name">Production</span>
          <span class="service-toggle"></span>
        </div>
      </interact-element>

      <interact-element data-interact-key="svc-3">
        <div class="service-item">
          <div class="service-pill">
            <p class="service-pill-desc">Intelligent grid management and real-time energy distribution monitoring.</p>
            <div class="service-icon-circle">
              <div class="icon-fill"></div>
              <span class="material-symbols-outlined">electric_meter</span>
            </div>
          </div>
          <span class="service-name">Smart Grid</span>
          <span class="service-toggle"></span>
        </div>
      </interact-element>

      <interact-element data-interact-key="svc-4">
        <div class="service-item">
          <div class="service-pill">
            <p class="service-pill-desc">Strategic consulting for renewable integration and carbon-neutral transitions.</p>
            <div class="service-icon-circle">
              <div class="icon-fill"></div>
              <span class="material-symbols-outlined">eco</span>
            </div>
          </div>
          <span class="service-name">Green Energy</span>
          <span class="service-toggle"></span>
        </div>
      </interact-element>

    </div>
  </section>
```

## Essential styles

```css
*, *::before, *::after {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Roboto Mono', monospace;
      background: #ffffff;
      color: #1a1a1a;
      -webkit-font-smoothing: antialiased;
    }

    
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 40px;
      background: #fff;
    }

    .header-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: #1a1a1a;
    }

    .logo-icon {
      display: flex;
      align-items: center;
    }

    .logo-icon svg {
      width: 30px;
      height: 30px;
    }

    .logo-text {
      font-family: 'Roboto Mono', monospace;
      font-weight: 500;
      font-size: 14px;
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    .header-nav {
      display: flex;
      align-items: center;
      gap: 0;
    }

    .header-nav a {
      font-family: 'Roboto Mono', monospace;
      font-size: 11px;
      font-weight: 400;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      text-decoration: none;
      color: #1a1a1a;
      padding: 0 16px;
      border-left: 1px solid #1a1a1a;
    }

    .header-nav a:first-child {
      border-left: 1px solid #1a1a1a;
    }

    .header-nav a:last-child {
      border-right: none;
    }

    .header-menu-btn {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 6px;
    }

    .header-menu-btn span {
      width: 5px;
      height: 5px;
      background: #1a1a1a;
      border-radius: 50%;
    }

    
    .services-section {
      width: calc(100vw - 60px);
      height: auto;
      margin: 30px auto;
      background: #f3ece4;
      border-radius: 24px;
      padding: 60px 70px 70px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .services-heading {
      font-family: 'Cutive', serif;
      font-size: 32px;
      font-weight: 400;
      letter-spacing: -0.5px;
      margin-bottom: 14px;
    }

    .services-subtitle {
      font-family: 'Roboto Mono', monospace;
      font-size: 10px;
      font-weight: 400;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      color: #1a1a1a;
      margin-bottom: 50px;
    }

    .services-list {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .service-item {
      position: relative;
      height: 88px;
      display: flex;
      align-items: center;
    }

    .service-pill {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 88px;
      background: #ffffff;
      box-shadow: inset 0 0 0 1.5px #b5b0aa;
      border: none;
      border-radius: 44px;
      display: flex;
      align-items: center;
      padding: 0 28px;
      overflow: hidden;
      z-index: 1;
    }

    .service-pill-desc {
      font-family: 'Roboto Mono', monospace;
      font-size: 10px;
      font-weight: 400;
      text-transform: uppercase;
      letter-spacing: 1px;
      line-height: 1.6;
      color: #1a1a1a;
      margin: 0;
      width: 38vw;
      flex-shrink: 0;
    }

    .service-icon-circle {
      position: absolute;
      right: 0;
      top: 0;
      width: 88px;
      height: 88px;
      border-radius: 50%;
      border: 1.5px solid #b5b0aa;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
    }

    .icon-fill {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: #f3ece4;
      z-index: 0;
    }

    .service-icon-circle .material-symbols-outlined {
      font-size: 35px;
      color: #1a1a1a;
      position: relative;
      z-index: 1;
    }

    .service-name {
      font-family: 'Cutive', serif;
      font-size: 55px;
      font-weight: 400;
      letter-spacing: -1.5px;
      line-height: 1.1;
      margin-left: 118px;
    }

    .service-toggle {
      display: block;
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 22px;
      height: 22px;
      z-index: 0;
      cursor: pointer;
    }

    .service-toggle::before,
    .service-toggle::after {
      content: '';
      position: absolute;
      background: #b5b0aa;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border-radius: 1px;
    }

    .service-toggle::before {
      width: 18px;
      height: 1.5px;
    }

    .service-toggle::after {
      width: 1.5px;
      height: 18px;
    }

    @media (max-width: 768px) {
      .service-name {
        font-size: 28px;
        letter-spacing: -0.5px;
      }

      .services-section {
        padding: 40px 30px;
      }

      .service-name {
        margin-left: 100px;
      }
    }
```

## Interact config

```js
const ITEM_COUNT = 5;

const SLEEK = 'cubic-bezier(0.16, 1, 0.3, 1)';

const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';

function makeHoverEffects() {
      return [
        {
          selector: '.service-pill',
          transition: {
            duration: 900,
            easing: SLEEK,
            styleProperties: [
              { name: 'width', value: '100%' },
            ],
          },
        },
        {
          selector: '.icon-fill',
          transition: {
            duration: 900,
            easing: SLEEK,
            styleProperties: [
              { name: 'background', value: '#ffffff' },
            ],
          },
        },
      ];
    }

function makeSpinEffect(i) {
      return {
        selector: '.service-icon-circle',
        duration: 900,
        easing: SLEEK,
        fill: 'none',
        keyframeEffect: {
          name: `iconSpin${i}`,
          keyframes: [
            { transform: 'rotate(0deg)' },
            { transform: 'rotate(360deg)' },
          ],
        },
      };
    }

const interactions = [];

for (let i = 0; i < ITEM_COUNT; i++) {
      interactions.push(
        {
          key: `svc-${i}`,
          trigger: 'hover',
          conditions: ['desktop'],
          params: { method: 'toggle' },
          effects: makeHoverEffects(),
        },
        {
          key: `svc-${i}`,
          trigger: 'hover',
          conditions: ['desktop'],
          params: { type: 'alternate' },
          effects: [makeSpinEffect(i)],
        },
        {
          key: `svc-${i}`,
          trigger: 'click',
          conditions: ['mobile'],
          params: { method: 'toggle' },
          effects: makeHoverEffects(),
        },
        {
          key: `svc-${i}`,
          trigger: 'click',
          conditions: ['mobile'],
          params: { type: 'alternate' },
          effects: [makeSpinEffect(i)],
        },
        {
          key: `svc-${i}`,
          trigger: 'viewEnter',
          params: { type: 'once', threshold: 0.05 },
          effects: [
            {
              selector: '.service-item',
              duration: 600,
              delay: i * 150,
              easing: EASE_OUT,
              fill: 'both',
              keyframeEffect: {
                name: `entrance${i}`,
                keyframes: [
                  { clipPath: 'inset(0 100% 0 0)', transform: 'translateX(-15px)' },
                  { clipPath: 'inset(0 0 0 0)', transform: 'translateX(0)' },
                ],
              },
            },
          ],
        },
      );
    }

const config = {
      conditions: {
        desktop: { type: 'media', predicate: '(min-width: 769px)' },
        mobile: { type: 'media', predicate: '(max-width: 768px)' },
      },
      interactions,
    };
```
