# Product Stroll List

A scroll-driven animation for list items in a sticky scroll section, flex/carousel, list/repeater layout. It uses transform, clip-path, opacity, width to create the motion and transition between visual states.

**Tags:** trigger: viewProgress; layout: sticky scroll section, flex/carousel, list/repeater; motion: transform, clip-path, opacity, width

## Markup

```html
<a href="#product-section" class="sr-only">Skip to product showcase</a>

  <main id="product-section">
  <interact-element data-interact-key="section">
    <section class="product-section">
      <div class="sticky-wrap">

        <interact-element data-interact-key="hero-gradient">
          <div class="hero-gradient"></div>
        </interact-element>

        <interact-element data-interact-key="hero-text">
          <header class="hero-content">
            <h1>
              <span class="mask-wrap h1-word"><span class="h1-word-inner" data-word="0">CAMERA,</span></span>
              <span class="mask-wrap h1-word"><span class="h1-word-inner" data-word="1">REDEFINED</span></span>
            </h1>
            <div class="hero-lines">
              <div class="mask-wrap"><span class="line-inner" data-line="0">Pro-grade photography in your pocket.</span></div>
              <div class="mask-wrap"><span class="line-inner" data-line="1">Capture every detail, every moment,</span></div>
              <div class="mask-wrap"><span class="line-inner" data-line="2">every time.</span></div>
            </div>
          </header>
        </interact-element>

        <interact-element data-interact-key="phone">
          <div class="phone-wrapper">
            <div class="phone-body">
              <div class="phone-notch"></div>
              <div class="phone-screen">
                <div class="screen-photo"></div>
                <div class="screen-photo-2"></div>
                <div class="screen-viewfinder">
                  <div class="vf-top">
                    <span>200 MP</span>
                    <span class="vf-badge">REC</span>
                  </div>
                  <div class="vf-crosshair"></div>
                  <div class="vf-bottom">
                    <span>0.5x</span>
                    <span>1x</span>
                    <span class="vf-active">3x</span>
                    <span>10x</span>
                    <span>100x</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </interact-element>

        <interact-element data-interact-key="float-cards">
          <div class="float-cards">
            <div class="fcard" data-card="0">
              <div class="fcard-inner">
                <span class="fcard-value">200 MP</span>
                <span class="fcard-label">Main Sensor</span>
              </div>
            </div>
            <div class="fcard" data-card="1">
              <div class="fcard-inner">
                <span class="fcard-value">8K Video</span>
                <span class="fcard-label">30fps Recording</span>
              </div>
            </div>
            <div class="fcard" data-card="2">
              <div class="fcard-inner">
                <span class="fcard-value">100x</span>
                <span class="fcard-label">Space Zoom</span>
              </div>
            </div>
          </div>
        </interact-element>

        <interact-element data-interact-key="gaming">
          <div class="gaming-container">
            <h2 class="gaming-title">Pro <span>Camera System</span></h2>
            <div class="phone-slot"></div>
            <div class="specs-layout">

              <ul class="specs-col left-col">
                <li class="spec-item" data-i="0">
                  <div class="spec-icon"></div>
                  <div class="spec-text">
                    <h4>200MP Main Sensor</h4>
                    <p>Ultra-high resolution detail</p>
                  </div>
                </li>
                <li class="spec-item" data-i="1">
                  <div class="spec-icon"></div>
                  <div class="spec-text">
                    <h4>OIS + EIS</h4>
                    <p>Dual stabilization system</p>
                  </div>
                </li>
                <li class="spec-item" data-i="2">
                  <div class="spec-icon"></div>
                  <div class="spec-text">
                    <h4>8K Video at 30fps</h4>
                    <p>Cinema-grade capture</p>
                  </div>
                </li>
                <li class="spec-item" data-i="3">
                  <div class="spec-icon"></div>
                  <div class="spec-text">
                    <h4>100x Space Zoom</h4>
                    <p>Incredible telephoto reach</p>
                  </div>
                </li>
              </ul>

              <div class="specs-center"></div>

              <ul class="specs-col right-col">
                <li class="spec-item" data-i="4">
                  <div class="spec-icon"></div>
                  <div class="spec-text">
                    <h4>Night Mode AI</h4>
                    <p>Low-light mastery</p>
                  </div>
                </li>
                <li class="spec-item" data-i="5">
                  <div class="spec-icon"></div>
                  <div class="spec-text">
                    <h4>ProRAW &amp; ProRes</h4>
                    <p>Professional formats</p>
                  </div>
                </li>
                <li class="spec-item" data-i="6">
                  <div class="spec-icon"></div>
                  <div class="spec-text">
                    <h4>4K Slow-Mo</h4>
                    <p>240fps capture</p>
                  </div>
                </li>
                <li class="spec-item" data-i="7">
                  <div class="spec-icon"></div>
                  <div class="spec-text">
                    <h4>AI Scene Detection</h4>
                    <p>Smart optimization</p>
                  </div>
                </li>
              </ul>

            </div>
          </div>
        </interact-element>

      </div>
    </section>
  </interact-element>

  </main>

  <footer class="spacer">
    <span class="sr-only">End of product showcase. Scroll up to replay the animation.</span>
  </footer>
```

## Essential styles

```css
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'DM Sans', system-ui, sans-serif;
      background: var(--bg);
      color: var(--text);
      -webkit-font-smoothing: antialiased;
    }

    .spacer {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(0, 0, 0, 0.12);
      font-size: 0.72rem;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      background: var(--bg);
    }

    

    .product-section {
      height: 300vh;
      position: relative;
    }

    .sticky-wrap {
      position: sticky;
      top: 0;
      height: 100vh;
      overflow: clip;
      background: #ffffff;
    }

    .hero-gradient {
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, #000000 0%, #727272 35%, #E6E6E6 65%, #FFFFFF 100%);
      z-index: 1;
    }

    

    .mask-wrap {
      overflow: clip;
      position: relative;
    }

    

    .hero-content {
      position: absolute;
      left: 5%;
      top: 5%;
      z-index: 7;
    }

    .hero-content h1 {
      font-family: 'Outfit', sans-serif;
      font-size: clamp(3rem, 9.6vw, 11rem);
      font-weight: 600;
      line-height: 1;
      letter-spacing: -0.04em;
      text-transform: uppercase;
      color: #ffffff;
      white-space: nowrap;
      display: flex;
      gap: 0.22em;
    }

    .h1-word {
      display: inline-block;
      padding: 0.08em 0 0.12em;
    }

    .h1-word-inner {
      display: block;
    }

    .hero-lines {
      margin-top: clamp(1rem, 2vw, 2rem);
      max-width: 320px;
    }

    .hero-lines .mask-wrap {
      padding-bottom: 0.2em;
    }

    .line-inner {
      display: block;
      font-size: clamp(0.82rem, 1vw, 1rem);
      color: rgba(255, 255, 255, 0.85);
      font-weight: 500;
      line-height: 1.24;
    }

    

    .phone-wrapper {
      position: absolute;
      left: 50%;
      top: 50%;
      width: clamp(286px, 23.4vw, 416px);
      aspect-ratio: 9 / 19.5;
      z-index: 5;
    }

    .phone-body {
      width: 100%;
      height: 100%;
      border-radius: 42px;
      background: linear-gradient(165deg, #3a3a4c, #1e1e2e);
      padding: 10px;
      position: relative;
      box-shadow:
        0 25px 70px rgba(0, 0, 0, 0.18),
        0 8px 24px rgba(0, 0, 0, 0.12),
        0 0 0 1px rgba(0, 0, 0, 0.06);
    }

    .phone-notch {
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      width: 28%;
      height: 24px;
      background: #1e1e2e;
      border-radius: 0 0 16px 16px;
      z-index: 3;
    }

    .phone-screen {
      width: 100%;
      height: 100%;
      border-radius: 33px;
      background: #111120;
      overflow: clip;
      position: relative;
    }

    .screen-photo {
      position: absolute;
      inset: 0;
      background: var(--landscape) center / cover no-repeat;
    }

    .screen-photo-2 {
      position: absolute;
      inset: 0;
      z-index: 1;
      clip-path: inset(0 100% 0 0);
      overflow: hidden;
    }

    .screen-photo-2::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 225%;
      height: 50%;
      transform: translate(-50%, -50%) rotate(90deg);
      background: var(--landscape-2) center / cover no-repeat;
    }

    .screen-viewfinder {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 16% 8% 8%;
    }

    .vf-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: 'Outfit', sans-serif;
      font-size: clamp(0.42rem, 0.9vw, 0.58rem);
      color: rgba(255, 255, 255, 0.85);
      font-weight: 500;
      letter-spacing: 0.08em;
      text-shadow: 0 1px 4px rgba(0,0,0,0.4);
    }

    .vf-top .vf-badge {
      background: rgba(255, 60, 60, 0.85);
      padding: 2px 8px;
      border-radius: 4px;
      font-size: clamp(0.38rem, 0.75vw, 0.5rem);
      font-weight: 600;
      letter-spacing: 0.06em;
    }

    .vf-crosshair {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 44px;
      height: 44px;
      border: 1.5px solid rgba(255, 255, 255, 0.7);
      border-radius: 50%;
      box-shadow: 0 0 0 1px rgba(0,0,0,0.15);
    }

    .vf-crosshair::before,
    .vf-crosshair::after {
      content: '';
      position: absolute;
      background: rgba(255, 255, 255, 0.7);
    }

    .vf-crosshair::before {
      width: 1px;
      height: 10px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .vf-crosshair::after {
      width: 10px;
      height: 1px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .vf-bottom {
      display: flex;
      justify-content: center;
      gap: clamp(12px, 2vw, 24px);
      font-family: 'Outfit', sans-serif;
      font-size: clamp(0.4rem, 0.8vw, 0.55rem);
      color: rgba(255, 255, 255, 0.55);
      font-weight: 500;
      letter-spacing: 0.06em;
      text-shadow: 0 1px 4px rgba(0,0,0,0.3);
    }

    .vf-bottom .vf-active {
      color: #fff;
    }

    

    .float-cards {
      position: absolute;
      left: 50%;
      top: 50%;
      width: clamp(286px, 23.4vw, 416px);
      aspect-ratio: 9 / 19.5;
      z-index: 6;
      pointer-events: none;
      transform: translate(-50%, -18vh);
    }

    .fcard {
      position: absolute;
      background: rgba(255, 255, 255, 0.5);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      clip-path: inset(0 0 0 0 round 14px);
      box-shadow:
        0 8px 32px rgba(0, 0, 0, 0.18),
        0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .fcard-inner {
      padding: clamp(12px, 1.5vw, 20px) clamp(15px, 1.75vw, 25px);
      display: flex;
      flex-direction: column;
      gap: 3px;
      white-space: nowrap;
    }

    .fcard-value {
      font-family: 'Outfit', sans-serif;
      font-size: clamp(1rem, 1.6vw, 1.38rem);
      font-weight: 700;
      color: var(--text);
    }

    .fcard-label {
      font-size: clamp(0.6rem, 0.82vw, 0.75rem);
      color: var(--text-dim);
      text-transform: uppercase;
      letter-spacing: 0.14em;
      font-weight: 400;
    }

    .fcard:nth-child(1) {
      top: 8%;
      right: -28%;
    }

    .fcard:nth-child(2) {
      top: 38%;
      left: -26%;
    }

    .fcard:nth-child(3) {
      bottom: 40%;
      right: -22%;
    }

    

    .gaming-container {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, 100vh);
      width: 80vw;
      padding: clamp(2.8rem, 4.8vw, 4.8rem) clamp(2.5rem, 5vw, 5.5rem) calc(clamp(2.8rem, 4.8vw, 4.8rem) + 10vh);
      border-radius: clamp(1rem, 2vw, 1.8rem);
      background: rgba(0, 0, 0, 0.025);
      z-index: 2;
    }

    .gaming-title {
      font-family: 'Outfit', sans-serif;
      font-size: clamp(1.2rem, 2vw, 1.8rem);
      font-weight: 700;
      text-align: center;
      letter-spacing: -0.01em;
      margin-bottom: clamp(2rem, 3.5vw, 3.4rem);
      color: var(--text);
      opacity: 0;
    }

    .gaming-title span {
      color: var(--text);
    }

    .specs-layout {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: clamp(1.5rem, 3vw, 3rem);
    }

    .specs-col {
      flex: 1;
      max-width: 320px;
      display: flex;
      flex-direction: column;
      gap: clamp(1.4rem, 2.2vw, 2rem);
      list-style: none;
    }

    .specs-center {
      width: clamp(140px, 20vw, 300px);
      flex-shrink: 0;
    }

    .spec-item {
      display: flex;
      align-items: center;
      gap: clamp(0.8rem, 1.2vw, 1.1rem);
      opacity: 0;
    }

    .spec-icon {
      width: clamp(2rem, 2.8vw, 2.6rem);
      height: clamp(2rem, 2.8vw, 2.6rem);
      border-radius: clamp(0.4rem, 0.6vw, 0.55rem);
      background: rgba(0, 0, 0, 0.04);
      flex-shrink: 0;
      position: relative;
    }

    .spec-icon::after {
      content: '';
      position: absolute;
      inset: 30%;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(0,0,0,0.2), rgba(0,0,0,0.08));
    }

    .spec-text h4 {
      font-family: 'Outfit', sans-serif;
      font-size: clamp(0.72rem, 0.95vw, 0.88rem);
      font-weight: 600;
      letter-spacing: 0.01em;
      margin-bottom: 0.1rem;
      color: var(--text);
    }

    .spec-text p {
      font-size: clamp(0.6rem, 0.75vw, 0.72rem);
      color: var(--text-dim);
      line-height: 1.4;
      font-weight: 300;
    }

    .specs-col.right-col .spec-item {
      flex-direction: row-reverse;
    }

    .specs-col.right-col .spec-text {
      text-align: right;
    }

    
    .phone-slot {
      display: none;
    }

    

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
      }
    }

    

    @media (max-width: 860px) {
      .hero-content {
        top: 7.5%;
        left: 5%;
        right: 5%;
        text-align: center;
      }
      .hero-content h1 {
        justify-content: center;
      }
      .hero-lines {
        margin-left: auto;
        margin-right: auto;
      }
      .hero-content h1 {
        font-size: clamp(2.5rem, 11vw, 4.5rem);
        white-space: normal;
        flex-wrap: wrap;
        gap: 0;
      }
      .h1-word {
        display: block;
        width: 100%;
      }
      .hero-lines {
        max-width: none;
      }
      .line-inner {
        font-size: clamp(0.98rem, 1.2vw, 1.2rem);
      }
      
      .float-cards {
        transform: translate(-50%, -7vh);
      }

      
      .gaming-container {
        width: 92vw;
        padding: 40px 30px;
      }
      .gaming-title {
        font-size: clamp(1.24rem, 4.68vw, 1.56rem);
        margin-bottom: 0;
      }
      
      .phone-slot {
        display: block;
        height: 164px;
        margin: 75px 0;
        flex-shrink: 0;
      }
      .specs-center { display: none; }
      .specs-layout {
        gap: clamp(0.6rem, 1.8vw, 1.2rem);
      }
      .specs-col {
        max-width: 50%;
        gap: clamp(1.4rem, 3vw, 2.2rem);
      }
      .spec-item { gap: 0.6rem; }
      .spec-icon {
        width: 2.07rem;
        height: 2.07rem;
      }
      .spec-text h4 { font-size: 0.95rem; }
      .spec-text p  { font-size: 0.78rem; }
    }
```

## Interact config

```js
const off = (v) => ({ name: 'cover', offset: { value: v, unit: 'percentage' } });

const SWIPE_EASE = 'cubic-bezier(0.6, 0, 0.74, 0)';

const PHONE_INITIAL        = 'translate(-50%, -18vh) rotate(0deg) scale(1)';

const PHONE_INITIAL_MOBILE = 'translate(-50%, -7vh) rotate(0deg) scale(1)';

const PHONE_FINAL          = 'translate(-50%, -50%) rotate(-90deg) scale(0.575)';

const PHONE_FINAL_MOBILE   = 'translate(-50%, calc(-50% - 15vh)) rotate(-90deg) scale(0.575)';

const GAMING_FINAL_DESKTOP = 'translate(-50%, -50%)';

const GAMING_FINAL_MOBILE  = 'translate(-50%, calc(-15vh - 225px))';

const wordEffects = [0, 1].map(i => ({
      key: 'hero-text',
      selector: `[data-word="${i}"]`,
      rangeStart: off(26 + i * 1.5),
      rangeEnd:   off(32 + i * 1.5),
      fill: 'both',
      easing: SWIPE_EASE,
      keyframeEffect: {
        name: `word-swipe-${i}`,
        keyframes: [
          { transform: 'translateY(0)' },
          { transform: 'translateY(-130%)' },
        ],
      },
    }));

const lineEffects = [0, 1, 2].map(i => ({
      key: 'hero-text',
      selector: `[data-line="${i}"]`,
      rangeStart: off(27),
      rangeEnd:   off(32),
      fill: 'both',
      easing: SWIPE_EASE,
      keyframeEffect: {
        name: `line-swipe-${i}`,
        keyframes: [
          { transform: 'translateY(0)' },
          { transform: 'translateY(-130%)' },
        ],
      },
    }));

const cardEffects = [0, 1, 2].map(i => ({
      key: 'float-cards',
      selector: `[data-card="${i}"]`,
      rangeStart: off(27),
      rangeEnd:   off(33),
      fill: 'both',
      easing: SWIPE_EASE,
      keyframeEffect: {
        name: `card-close-${i}`,
        keyframes: [
          { clipPath: 'inset(0 0 0 0 round 14px)' },
          { clipPath: 'inset(0 0 100% 0 round 14px)' },
        ],
      },
    }));

const leftSpecs = [0, 1, 2, 3].map(i => ({
      key: 'gaming',
      selector: `[data-i="${i}"]`,
      rangeStart: off(49 + i * 2),
      rangeEnd:   off(55 + i * 2),
      fill: 'both',
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      keyframeEffect: {
        name: `spec-l-${i}`,
        keyframes: [
          { opacity: '0', transform: 'translateX(-28px)' },
          { opacity: '1', transform: 'translateX(0)' },
        ],
      },
    }));

const rightSpecs = [4, 5, 6, 7].map(i => ({
      key: 'gaming',
      selector: `[data-i="${i}"]`,
      rangeStart: off(49 + (i - 4) * 2),
      rangeEnd:   off(55 + (i - 4) * 2),
      fill: 'both',
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      keyframeEffect: {
        name: `spec-r-${i}`,
        keyframes: [
          { opacity: '0', transform: 'translateX(28px)' },
          { opacity: '1', transform: 'translateX(0)' },
        ],
      },
    }));

const config = {
      conditions: {
        mobile:  { type: 'media', predicate: '(max-width: 860px)' },
        desktop: { type: 'media', predicate: '(min-width: 861px)' },
      },
      interactions: [
        {
          key: 'section',
          trigger: 'viewProgress',
          effects: [
            {
              key: 'hero-gradient',
              rangeStart: off(26),
              rangeEnd:   off(39),
              fill: 'both',
              easing: 'ease-out',
              keyframeEffect: {
                name: 'gradient-fade',
                keyframes: [
                  { opacity: '1' },
                  { opacity: '0' },
                ],
              },
            },

            ...wordEffects,

            ...lineEffects,
            ...cardEffects,

            {
              key: 'phone',
              conditions: ['desktop'],
              rangeStart: off(28),
              rangeEnd:   off(48),
              fill: 'both',
              easing: 'cubic-bezier(0.33, 1, 0.68, 1)',
              keyframeEffect: {
                name: 'phone-transform-desktop',
                keyframes: [
                  { transform: PHONE_INITIAL },
                  { transform: PHONE_FINAL },
                ],
              },
            },
            {
              key: 'phone',
              conditions: ['mobile'],
              rangeStart: off(28),
              rangeEnd:   off(48),
              fill: 'both',
              easing: 'cubic-bezier(0.33, 1, 0.68, 1)',
              keyframeEffect: {
                name: 'phone-transform-mobile',
                keyframes: [
                  { transform: PHONE_INITIAL_MOBILE },
                  { transform: PHONE_FINAL_MOBILE },
                ],
              },
            },

            {
              key: 'phone',
              selector: '.screen-photo',
              rangeStart: off(28),
              rangeEnd:   off(48),
              fill: 'both',
              easing: 'cubic-bezier(0.33, 1, 0.68, 1)',
              keyframeEffect: {
                name: 'photo-counter-rotate',
                keyframes: [
                  { transform: 'rotate(0deg) scale(1.1)' },
                  { transform: 'rotate(90deg) scale(3.65)' },
                ],
              },
            },

            {
              key: 'phone',
              selector: '.screen-photo-2',
              rangeStart: off(48),
              rangeEnd:   off(56),
              fill: 'both',
              easing: 'cubic-bezier(0.33, 1, 0.68, 1)',
              keyframeEffect: {
                name: 'photo-reveal',
                keyframes: [
                  { clipPath: 'inset(0 100% 0 0)' },
                  { clipPath: 'inset(0 0 0 0)' },
                ],
              },
            },

            {
              key: 'gaming',
              conditions: ['desktop'],
              rangeStart: off(34),
              rangeEnd:   off(48),
              fill: 'both',
              easing: 'cubic-bezier(0.33, 1, 0.68, 1)',
              keyframeEffect: {
                name: 'gaming-slide-desktop',
                keyframes: [
                  { transform: 'translate(-50%, 100vh)' },
                  { transform: GAMING_FINAL_DESKTOP },
                ],
              },
            },
            {
              key: 'gaming',
              conditions: ['mobile'],
              rangeStart: off(34),
              rangeEnd:   off(48),
              fill: 'both',
              easing: 'cubic-bezier(0.33, 1, 0.68, 1)',
              keyframeEffect: {
                name: 'gaming-slide-mobile',
                keyframes: [
                  { transform: 'translate(-50%, 100vh)' },
                  { transform: GAMING_FINAL_MOBILE },
                ],
              },
            },

            {
              key: 'gaming',
              selector: '.gaming-title',
              rangeStart: off(46),
              rangeEnd:   off(54),
              fill: 'both',
              easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
              keyframeEffect: {
                name: 'title-in',
                keyframes: [
                  { opacity: '0', transform: 'translateY(18px)' },
                  { opacity: '1', transform: 'translateY(0)' },
                ],
              },
            },

            ...leftSpecs,
            ...rightSpecs,
          ],
        },
      ],
    };
```
