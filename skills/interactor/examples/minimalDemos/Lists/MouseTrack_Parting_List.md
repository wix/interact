# MouseTrack Parting List

A pointer-driven animation for list items in a grid/gallery, flex/carousel, list/repeater layout. It uses width, transform to create the motion and transition between visual states.

**Tags:** trigger: pointerMove; layout: grid/gallery, flex/carousel, list/repeater; motion: width, transform

## Markup

```html
<interact-element data-interact-key="page">
    <div class="page-wrapper">

      <interact-element data-interact-key="ind">
        <div class="indicators">
          <div class="ind-left">
            <span class="ind-item n0">ITEM (1)</span>
            <span class="ind-item n1">ITEM (2)</span>
            <span class="ind-item n2">ITEM (3)</span>
            <span class="ind-item n3">ITEM (4)</span>
            <span class="ind-item n4">ITEM (5)</span>
            <span class="ind-item n5">ITEM (6)</span>
            <span class="ind-item n6">ITEM (7)</span>
            <span class="ind-item n7">ITEM (8)</span>
            <span class="ind-item n8">ITEM (9)</span>
            <span class="ind-item n9">ITEM (10)</span>
            <span class="ind-item n10">ITEM (11)</span>
            <span class="ind-item n11">ITEM (12)</span>
          </div>
          <div class="ind-right">
            <span class="ind-item y0">(2024)</span>
            <span class="ind-item y1">(2024)</span>
            <span class="ind-item y2">(2023)</span>
            <span class="ind-item y3">(2025)</span>
            <span class="ind-item y4">(2023)</span>
            <span class="ind-item y5">(2024)</span>
            <span class="ind-item y6">(2025)</span>
            <span class="ind-item y7">(2023)</span>
            <span class="ind-item y8">(2024)</span>
            <span class="ind-item y9">(2025)</span>
            <span class="ind-item y10">(2023)</span>
            <span class="ind-item y11">(2024)</span>
          </div>
        </div>
      </interact-element>

      <interact-element data-interact-key="square">
        <div class="square-frame">
          <img class="sq-img proj-img-0">
          <img class="sq-img proj-img-1">
          <img class="sq-img proj-img-2">
          <img class="sq-img proj-img-3">
          <img class="sq-img proj-img-4">
          <img class="sq-img proj-img-5">
          <img class="sq-img proj-img-6">
          <img class="sq-img proj-img-7">
          <img class="sq-img proj-img-8">
          <img class="sq-img proj-img-9">
          <img class="sq-img proj-img-10">
          <img class="sq-img proj-img-11">
        </div>
      </interact-element>

      <div class="projects-section">
        <interact-element data-interact-key="p0"><div class="project-row"><span class="half-left">DUSK RISING</span><span class="half-right">EDITORIAL</span></div></interact-element>
        <interact-element data-interact-key="p1"><div class="project-row"><span class="half-left">NEON DRIFT</span><span class="half-right">COMMERCIAL</span></div></interact-element>
        <interact-element data-interact-key="p2"><div class="project-row"><span class="half-left">STILL WATERS</span><span class="half-right">FASHION</span></div></interact-element>
        <interact-element data-interact-key="p3"><div class="project-row"><span class="half-left">PAPER CRANE</span><span class="half-right">BRANDING</span></div></interact-element>
        <interact-element data-interact-key="p4"><div class="project-row"><span class="half-left">ECHO CHAMBER</span><span class="half-right">MUSIC VIDEO</span></div></interact-element>
        <interact-element data-interact-key="p5"><div class="project-row"><span class="half-left">GLASS HOUSE</span><span class="half-right">ARCHITECTURE</span></div></interact-element>
        <interact-element data-interact-key="p6"><div class="project-row"><span class="half-left">WILD LIGHT</span><span class="half-right">PHOTOGRAPHY</span></div></interact-element>
        <interact-element data-interact-key="p7"><div class="project-row"><span class="half-left">SLOW BURN</span><span class="half-right">FILM</span></div></interact-element>
        <interact-element data-interact-key="p8"><div class="project-row"><span class="half-left">DEEP CURRENT</span><span class="half-right">CAMPAIGN</span></div></interact-element>
        <interact-element data-interact-key="p9"><div class="project-row"><span class="half-left">SILVER LINE</span><span class="half-right">EDITORIAL</span></div></interact-element>
        <interact-element data-interact-key="p10"><div class="project-row"><span class="half-left">FIRST SNOW</span><span class="half-right">SHORT FILM</span></div></interact-element>
        <interact-element data-interact-key="p11"><div class="project-row"><span class="half-left">OPEN FIELD</span><span class="half-right">BRANDING</span></div></interact-element>
      </div>

    </div>
  </interact-element>
```

## Essential styles

```css
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    html, body {
      height: 100vh;
      overflow: hidden;
    }

    body {
      background: #fff;
      color: #111;
      font-family: 'Space Mono', monospace;
      -webkit-font-smoothing: antialiased;
    }

    interact-element { display: block; }

    .page-wrapper {
      width: 100vw;
      height: 100vh;
      position: relative;
    }

    
    interact-element[data-interact-key="square"] {
      position: fixed;
      left: 50%;
      top: 0;
      z-index: 40;
      pointer-events: none;
    }

    .square-frame {
      width: 120px;
      height: 120px;
      position: relative;
      overflow: clip;
      background: #111;
      margin-left: -60px;
    }

    .sq-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      visibility: hidden;
    }

    
    interact-element[data-interact-key="ind"] {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 50;
      pointer-events: none;
    }

    .indicators {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 36px;
      height: 120px;
    }

    .ind-left,
    .ind-right {
      display: grid;
      font-family: 'Space Mono', monospace;
      font-size: 17px;
      font-weight: 700;
      letter-spacing: 1px;
      color: #000;
    }

    .ind-item {
      grid-row: 1;
      grid-column: 1;
      visibility: hidden;
      padding: 2px 6px;
    }

    
    .projects-section {
      display: flex;
      flex-direction: column;
      height: 100vh;
      padding: 5vh 0;
      position: relative;
      z-index: 10;
    }

    .projects-section > interact-element {
      flex: 1;
      display: flex;
      align-items: center;
    }

    .project-row {
      display: flex;
      width: 100%;
      color: #e0e0e0;
    }

    .half-left,
    .half-right {
      flex: 1;
      font-family: 'Doto', sans-serif;
      font-size: clamp(26px, 3.8vw, 56px);
      font-weight: 900;
      letter-spacing: -1px;
      text-transform: uppercase;
      line-height: 1;
      white-space: nowrap;
    }

    .half-left {
      text-align: right;
      padding-right: 24px;
    }

    .half-right {
      text-align: left;
      padding-left: 24px;
    }

    
    @media (max-width: 768px) {
      .square-frame {
        width: 80px;
        height: 80px;
        margin-left: -40px;
      }

      interact-element[data-interact-key="ind"] {
        bottom: 0;
      }

      .indicators {
        height: 100%;
        align-items: flex-end;
        padding: 0 0 40px 0;
      }

      .ind-left,
      .ind-right {
        font-size: 13px;
        flex: 1;
      }

      .ind-left {
        justify-items: end;
        padding-right: 10px;
      }

      .ind-right {
        justify-items: start;
        padding-left: 10px;
      }

      .half-left,
      .half-right {
        font-size: 20px;
      }

      .half-left { padding-right: 10px; }
      .half-right { padding-left: 10px; }

      .projects-section {
        height: calc(100vh - 80px);
        padding: 3vh 0 0 0;
      }

      .projects-section > interact-element {
        pointer-events: auto;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
      }
    }
```

## Interact config

```js
const mqMobile = window.matchMedia('(max-width: 768px)');

const mobile = mqMobile.matches;

mqMobile.addEventListener('change', () => location.reload());

const ITEM_COUNT = 12;

const SPLIT = mobile ? 45 : 80;

const PAD = mobile ? 0.03 : 0.05;

const C0 = { name: 'cover', offset: { value: 0, unit: 'percentage' } };

const C1 = { name: 'cover', offset: { value: 100, unit: 'percentage' } };

const step = (1 - 2 * PAD) / ITEM_COUNT;

function cl(v) { return Math.round(Math.max(0.001, Math.min(0.999, v)) * 10000) / 10000; }

const effects = [];

for (let i = 0; i < ITEM_COUNT; i++) {
        const zs = PAD + i * step;
        const zc = PAD + (i + 0.5) * step;
        const ze = PAD + (i + 1) * step;

        const rampIn = cl(zc - step * 1.8);
        const plateauIn = cl(zc - step * 1.0);
        const plateauOut = cl(zc + step * 1.0);
        const rampOut = cl(zc + step * 1.8);

        effects.push({
          key: `p${i}`, selector: '.half-left',
          rangeStart: C0, rangeEnd: C1, fill: 'both',
          keyframeEffect: {
            name: `sL${i}`,
            keyframes: [
              { offset: 0, transform: 'translateX(0)' },
              { offset: rampIn, transform: 'translateX(0)' },
              { offset: plateauIn, transform: `translateX(-${SPLIT}px)` },
              { offset: plateauOut, transform: `translateX(-${SPLIT}px)` },
              { offset: rampOut, transform: 'translateX(0)' },
              { offset: 1, transform: 'translateX(0)' },
            ],
          },
        });

        effects.push({
          key: `p${i}`, selector: '.half-right',
          rangeStart: C0, rangeEnd: C1, fill: 'both',
          keyframeEffect: {
            name: `sR${i}`,
            keyframes: [
              { offset: 0, transform: 'translateX(0)' },
              { offset: rampIn, transform: 'translateX(0)' },
              { offset: plateauIn, transform: `translateX(${SPLIT}px)` },
              { offset: plateauOut, transform: `translateX(${SPLIT}px)` },
              { offset: rampOut, transform: 'translateX(0)' },
              { offset: 1, transform: 'translateX(0)' },
            ],
          },
        });

        const hlKf = [];
        if (i === 0) {
          hlKf.push({ offset: 0, color: '#000' });
        } else {
          hlKf.push({ offset: 0, color: '#e0e0e0' });
          hlKf.push({ offset: cl(zs - 0.001), color: '#e0e0e0' });
          hlKf.push({ offset: cl(zs), color: '#000' });
        }
        if (i === ITEM_COUNT - 1) {
          hlKf.push({ offset: 1, color: '#000' });
        } else {
          hlKf.push({ offset: cl(ze), color: '#000' });
          hlKf.push({ offset: cl(ze + 0.001), color: '#e0e0e0' });
          hlKf.push({ offset: 1, color: '#e0e0e0' });
        }
        effects.push({
          key: `p${i}`, selector: '.project-row',
          rangeStart: C0, rangeEnd: C1, fill: 'both',
          keyframeEffect: { name: `hl${i}`, keyframes: hlKf },
        });

        const imgKf = [];
        if (i === 0) {
          imgKf.push({ offset: 0, visibility: 'visible' });
        } else {
          imgKf.push({ offset: 0, visibility: 'hidden' });
          imgKf.push({ offset: cl(zs - 0.001), visibility: 'hidden' });
          imgKf.push({ offset: cl(zs), visibility: 'visible' });
        }
        if (i === ITEM_COUNT - 1) {
          imgKf.push({ offset: 1, visibility: 'visible' });
        } else {
          imgKf.push({ offset: cl(ze - 0.001), visibility: 'visible' });
          imgKf.push({ offset: cl(ze), visibility: 'hidden' });
          imgKf.push({ offset: 1, visibility: 'hidden' });
        }
        effects.push({
          key: 'square', selector: `.proj-img-${i}`,
          rangeStart: C0, rangeEnd: C1, fill: 'both',
          keyframeEffect: { name: `imgVis${i}`, keyframes: imgKf },
        });

        effects.push({
          key: 'ind', selector: `.n${i}`,
          rangeStart: C0, rangeEnd: C1, fill: 'both',
          keyframeEffect: { name: `nVis${i}`, keyframes: imgKf.map(k => ({ ...k })) },
        });

        effects.push({
          key: 'ind', selector: `.y${i}`,
          rangeStart: C0, rangeEnd: C1, fill: 'both',
          keyframeEffect: { name: `yVis${i}`, keyframes: imgKf.map(k => ({ ...k })) },
        });
      }

const config = {
        interactions: [{
          key: 'page',
          trigger: 'pointerMove',
          params: { hitArea: 'root', axis: 'y' },
          effects,
        }],
      };
```
