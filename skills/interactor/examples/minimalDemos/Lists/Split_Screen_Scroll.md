# Split Screen Scroll

A scroll-driven animation for layered visual elements in a sticky scroll section, flex/carousel, list/repeater layout. It uses transform, filter to create the motion and transition between visual states.

**Tags:** trigger: viewProgress; layout: sticky scroll section, flex/carousel, list/repeater; motion: transform, filter

## Markup

```html
<div class="left-panel">
    <div class="left-inner">
      <div class="left-bg"></div>
      <div class="left-overlay"></div>
      <h1>The<br>Lineup</h1>
    </div>
  </div>

  <div class="right-panel">
    <div class="services-list">

      <interact-element data-interact-key="s0">
        <div class="service-item">
          <span class="service-time">22:00</span>
          <span class="service-number">Main Stage</span>
          <h2 class="service-title">Daft<br>Punk</h2>
          <p class="service-desc">The iconic duo returns for an exclusive headline set blending live instrumentation with their legendary electronic sound.</p>
        </div>
      </interact-element>

      <interact-element data-interact-key="s1">
        <div class="service-item">
          <span class="service-time">20:00</span>
          <span class="service-number">Main Stage</span>
          <h2 class="service-title">Kendrick<br>Lamar</h2>
          <p class="service-desc">Pulitzer prize-winning artist bringing raw lyricism and explosive energy to close out Saturday night.</p>
        </div>
      </interact-element>

      <interact-element data-interact-key="s2">
        <div class="service-item">
          <span class="service-time">18:00</span>
          <span class="service-number">Horizon Stage</span>
          <h2 class="service-title">Peggy<br>Gou</h2>
          <p class="service-desc">Seoul-born, Berlin-based DJ and producer delivering a hypnotic blend of house, techno, and disco.</p>
        </div>
      </interact-element>

      <interact-element data-interact-key="s3">
        <div class="service-item">
          <span class="service-time">16:30</span>
          <span class="service-number">Horizon Stage</span>
          <h2 class="service-title">Jamie<br>XX</h2>
          <p class="service-desc">Crafting immersive soundscapes that blur the lines between UK bass, ambient, and dancefloor euphoria.</p>
        </div>
      </interact-element>

      <interact-element data-interact-key="s4">
        <div class="service-item">
          <span class="service-time">15:00</span>
          <span class="service-number">Grove Stage</span>
          <h2 class="service-title">Floating<br>Points</h2>
          <p class="service-desc">A journey through jazz, classical, and electronic — expect the unexpected from this boundary-pushing producer.</p>
        </div>
      </interact-element>

      <interact-element data-interact-key="s5">
        <div class="service-item">
          <span class="service-time">13:30</span>
          <span class="service-number">Grove Stage</span>
          <h2 class="service-title">Overmono</h2>
          <p class="service-desc">Brothers Tom and Ed Russell fusing breakbeat, garage, and techno into peak-time festival anthems.</p>
        </div>
      </interact-element>

    </div>
  </div>
```

## Essential styles

```css
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      background: #000;
      color: #fff;
      font-family: 'Inter', sans-serif;
      -webkit-font-smoothing: antialiased;
    }

    interact-element { display: block; }

    
    .left-panel {
      position: fixed;
      left: 0;
      top: 0;
      width: 50%;
      height: 100vh;
      z-index: 10;
    }

    .left-inner {
      width: 100%;
      height: 100%;
      position: relative;
      display: flex;
      align-items: flex-end;
      padding: 60px;
      overflow: clip;
    }

    .left-bg {
      position: absolute;
      inset: 0;
      background: linear-gradient(to right, #0d5a2e 0%, rgba(13, 90, 46, 0) 100%);
    }

    .left-overlay {
      display: none;
    }

    .left-inner h1 {
      font-family: 'Boldonse', sans-serif;
      font-size: clamp(4.5rem, 8vw, 8rem);
      font-weight: 400;
      line-height: 1.4;
      text-transform: uppercase;
      letter-spacing: -2px;
      position: relative;
      z-index: 1;
    }

    
    .right-panel {
      margin-left: 50%;
      width: 50%;
      padding: 100vh 40px 80vh 40px;
      overflow-x: clip;
    }

    .services-list {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .service-item {
      background: #000;
      padding: 48px 40px;
      text-align: center;
      position: relative;
    }

    .service-time {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-family: 'Boldonse', sans-serif;
      font-size: clamp(5rem, 8vw, 10rem);
      font-weight: 400;
      color: #2a2a2a;
      letter-spacing: 2px;
      line-height: 1.1;
      white-space: nowrap;
      pointer-events: none;
      z-index: 0;
    }

    .service-number {
      display: inline-block;
      border: 1px solid rgba(255, 255, 255, 0.4);
      padding: 4px 12px;
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 1px;
      margin-bottom: 24px;
      position: relative;
      z-index: 1;
    }

    .service-title {
      font-family: 'Boldonse', sans-serif;
      font-size: clamp(2rem, 3.5vw, 3.2rem);
      font-weight: 400;
      text-transform: uppercase;
      line-height: 1.5;
      letter-spacing: 0px;
      margin-bottom: 20px;
      position: relative;
      z-index: 1;
    }

    .service-desc {
      font-family: 'Courier New', Courier, monospace;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      line-height: 1.8;
      color: #fff;
      max-width: 380px;
      margin: 0 auto;
      position: relative;
      z-index: 1;
    }

    
    @media (max-width: 1024px) {
      .left-panel {
        position: sticky;
        top: 0;
        width: 100%;
        height: 40vh;
      }

      .left-inner {
        align-items: center;
        justify-content: center;
      }

      .left-inner h1 {
        text-align: center;
      }

      .left-bg {
        background: linear-gradient(to bottom, #0d5a2e 0%, rgba(13, 90, 46, 0) 100%);
      }

      .right-panel {
        margin-left: 0;
        width: 100%;
        padding: 60vh 30px 80vh 30px;
      }

    }

    
    @media (max-width: 900px) {
      .left-panel {
        height: 35vh;
      }

      .left-inner h1 {
        font-size: clamp(2.8rem, 9vw, 4.5rem);
      }

      .right-panel {
        padding: 55vh 24px 80vh 24px;
      }
    }

    
    @media (max-width: 768px) {
      .left-panel {
        position: sticky;
        top: 0;
        width: 100%;
        height: 30vh;
      }

      .left-inner {
        padding: 40px;
        align-items: center;
        justify-content: center;
      }

      .left-inner h1 {
        font-size: clamp(2.5rem, 10vw, 4rem);
        text-align: center;
      }

      .left-bg {
        background: linear-gradient(to bottom, #0d5a2e 0%, rgba(13, 90, 46, 0) 100%);
      }

      .right-panel {
        margin-left: 0;
        width: 100%;
        padding: 50vh 20px 80vh 20px;
      }

      .service-item {
        padding: 36px 24px;
      }

      .service-title {
        font-size: clamp(1.6rem, 6vw, 2.4rem);
      }

      .service-desc {
        font-size: 0.7rem;
        max-width: 100%;
      }

      .service-time {
        font-size: clamp(4.5rem, 20vw, 8rem);
      }
    }
```

## Interact config

```js
const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

const range = (start, end) => ({
      rangeStart: { name: 'cover', offset: { value: start, unit: 'percentage' } },
      rangeEnd:   { name: 'cover', offset: { value: end,   unit: 'percentage' } },
    });

const dir = (sign) => ({
      x:  sign * 600,
      rY: sign * -65,
    });

function makeKeyframes(name, d, intensity) {
      const s = intensity;
      const x0 = d.x * s;
      const rY0 = d.rY * s;
      return {
        name,
        keyframes: [
          {
            offset: 0,
            transform: `perspective(500px) translateX(${x0}px) translateY(60px) translateZ(${-600 * s}px) rotateY(${rY0}deg) rotateX(${18 * s}deg) rotateZ(${-3 * Math.sign(d.x)}deg)`,
            filter: 'blur(12px)',
          },
          {
            offset: 0.25,
            transform: `perspective(500px) translateX(${x0 * 0.6}px) translateY(10px) translateZ(${-400 * s}px) rotateY(${rY0 * 0.55}deg) rotateX(${12 * s}deg) rotateZ(${-2.2 * Math.sign(d.x)}deg)`,
            filter: 'blur(0px)',
          },
          {
            offset: 0.4,
            transform: `perspective(500px) translateX(${x0 * 0.4}px) translateY(-40px) translateZ(${-200 * s}px) rotateY(${rY0 * 0.35}deg) rotateX(${7 * s}deg) rotateZ(${-1.2 * Math.sign(d.x)}deg)`,
            filter: 'blur(0px)',
          },
          {
            offset: 0.75,
            transform: `perspective(500px) translateX(${x0 * 0.1}px) translateY(-18px) translateZ(${-30 * s}px) rotateY(${rY0 * 0.06}deg) rotateX(${1.2 * s}deg) rotateZ(0deg)`,
            filter: 'blur(0px)',
          },
          {
            offset: 1,
            transform: 'perspective(500px) translateX(0) translateY(0) translateZ(0) rotateY(0deg) rotateX(0deg) rotateZ(0deg)',
            filter: 'blur(0px)',
          },
        ],
      };
    }

const COUNT = 6;

const interactions = [];

for (let i = 0; i < COUNT; i++) {
      const sign = i % 2 === 0 ? 1 : -1;
      const d = dir(sign);

      interactions.push({
        key: `s${i}`,
        trigger: 'viewProgress',
        effects: [
          {
            selector: '.service-number',
            keyframeEffect: makeKeyframes(`num-${i}`, d, 0.6),
            ...range(14, 84),
            fill: 'both',
            easing: EASING,
          },
          {
            selector: '.service-title',
            keyframeEffect: makeKeyframes(`ttl-${i}`, d, 1),
            ...range(20, 90),
            fill: 'both',
            easing: EASING,
          },
          {
            selector: '.service-desc',
            keyframeEffect: makeKeyframes(`dsc-${i}`, d, 0.75),
            ...range(26, 96),
            fill: 'both',
            easing: EASING,
          },
        ],
      });
    }

const config = { interactions };
```
