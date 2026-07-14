# Icon Pill Slider Scroll

A scroll-driven animation for layered visual elements in a grid/gallery, flex/carousel, list/repeater layout. It uses width, transform to create the motion and transition between visual states.

**Tags:** trigger: viewProgress; layout: grid/gallery, flex/carousel, list/repeater; motion: width, transform

## Markup

```html
<header class="header">
    <a href="#" class="header-logo">
      <div class="logo-icon">
        <svg viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="11" cy="15" r="9" stroke="#ddd" stroke-width="2" fill="none"/>
          <circle cx="19" cy="15" r="9" stroke="#ddd" stroke-width="2" fill="none"/>
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
    <p class="services-subtitle">Scroll to explore each service.</p>

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
        </div>
      </interact-element>

      <interact-element data-interact-key="svc-5">
        <div class="service-item">
          <div class="service-pill">
            <p class="service-pill-desc">Predictive analytics and machine learning for infrastructure optimization.</p>
            <div class="service-icon-circle">
              <div class="icon-fill"></div>
              <span class="material-symbols-outlined">model_training</span>
            </div>
          </div>
          <span class="service-name">AI Systems</span>
        </div>
      </interact-element>

      <interact-element data-interact-key="svc-6">
        <div class="service-item">
          <div class="service-pill">
            <p class="service-pill-desc">Cloud-native platforms for scalable energy data processing and storage.</p>
            <div class="service-icon-circle">
              <div class="icon-fill"></div>
              <span class="material-symbols-outlined">cloud_sync</span>
            </div>
          </div>
          <span class="service-name">Cloud Infra</span>
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

    html {
      scroll-snap-type: y proximity;
    }

    body {
      font-family: 'Roboto Mono', monospace;
      background: #0d0d0d;
      color: #ddd;
      -webkit-font-smoothing: antialiased;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 40px;
      background: #0d0d0d;
    }

    .header-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: #ddd;
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
    }

    .header-nav a {
      font-family: 'Roboto Mono', monospace;
      font-size: 11px;
      font-weight: 400;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      text-decoration: none;
      color: #ddd;
      padding: 0 16px;
      border-left: 1px solid #444;
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
      background: #ddd;
      border-radius: 50%;
    }

    .services-section {
      width: calc(100vw - 60px);
      margin: 90vh auto 80vh;
      background: #161616;
      border-radius: 24px;
      padding: 15vh;
    }

    .services-heading {
      font-family: 'Cutive', serif;
      font-size: 36px;
      font-weight: 400;
      letter-spacing: -0.5px;
      color: #ebebeb;
      margin-bottom: 14px;
    }

    .services-subtitle {
      font-family: 'Roboto Mono', monospace;
      font-size: 11px;
      font-weight: 400;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      color: #999;
      margin-bottom: 12vh;
    }

    .services-list {
      display: flex;
      flex-direction: column;
      gap: 16vh;
    }

    .service-item {
      position: relative;
      height: 115px;
      display: flex;
      align-items: center;
    }

    .service-pill {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 115px;
      background: #222;
      box-shadow: inset 0 0 0 1.5px #3a3a3a;
      border: none;
      border-radius: 58px;
      display: flex;
      align-items: center;
      padding: 0 36px;
      overflow: clip;
    }

    .service-pill-desc {
      font-family: 'Roboto Mono', monospace;
      font-size: 12px;
      font-weight: 400;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      line-height: 1.7;
      color: #aaa;
      margin: 0;
      width: 38vw;
      flex-shrink: 0;
    }

    .service-icon-circle {
      position: absolute;
      right: 0;
      top: 0;
      width: 115px;
      height: 115px;
      border-radius: 50%;
      border: 1.5px solid #3a3a3a;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
    }

    .icon-fill {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: #161616;
      z-index: 0;
    }

    .service-icon-circle .material-symbols-outlined {
      font-size: 44px;
      color: #ebebeb;
      position: relative;
      z-index: 1;
    }

    .service-name {
      font-family: 'Cutive', serif;
      font-size: 64px;
      font-weight: 400;
      letter-spacing: -1.5px;
      line-height: 1.1;
      margin-left: 147px;
      color: #ebebeb;
    }

    interact-element {
      scroll-snap-align: center;
    }

    @media (max-width: 768px) {
      .services-heading {
        font-size: 31px;
      }

      .service-name {
        font-size: 27px;
        letter-spacing: -0.5px;
        margin-left: 135px;
      }

      .services-section {
        padding: 15vh 4.8vw;
      }
    }
```

## Interact config

```js
const ITEM_COUNT = 7;

const interactions = [];

for (let i = 0; i < ITEM_COUNT; i++) {
      interactions.push({
        key: `svc-${i}`,
        trigger: 'viewProgress',
        effects: [
          {
            selector: '.service-pill',
            rangeStart: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
            rangeEnd: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
            fill: 'both',
            keyframeEffect: {
              name: `pillExpand${i}`,
              keyframes: [
                { offset: 0, width: '115px' },
                { offset: 0.20, width: '115px' },
                { offset: 0.40, width: '100%' },
                { offset: 0.60, width: '100%' },
                { offset: 0.80, width: '115px' },
                { offset: 1, width: '115px' },
              ],
            },
          },
          {
            selector: '.icon-fill',
            rangeStart: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
            rangeEnd: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
            fill: 'both',
            keyframeEffect: {
              name: `fillColor${i}`,
              keyframes: [
                { offset: 0, background: '#161616' },
                { offset: 0.20, background: '#161616' },
                { offset: 0.40, background: '#222222' },
                { offset: 0.60, background: '#222222' },
                { offset: 0.80, background: '#161616' },
                { offset: 1, background: '#161616' },
              ],
            },
          },
          {
            selector: '.service-icon-circle',
            rangeStart: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
            rangeEnd: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
            fill: 'both',
            keyframeEffect: {
              name: `iconSpin${i}`,
              keyframes: [
                { offset: 0, transform: 'rotate(0deg)' },
                { offset: 0.20, transform: 'rotate(0deg)' },
                { offset: 0.80, transform: 'rotate(360deg)' },
                { offset: 1, transform: 'rotate(360deg)' },
              ],
            },
          },
        ],
      });
    }

const config = { interactions };
```
