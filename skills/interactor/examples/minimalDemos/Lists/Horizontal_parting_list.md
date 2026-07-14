# Horizontal Parting List

A scroll-driven animation for list items in a grid/gallery, flex/carousel, list/repeater layout. It uses width, height, border-radius, opacity, transform to create the motion and transition between visual states.

**Tags:** trigger: viewProgress; layout: grid/gallery, flex/carousel, list/repeater; motion: width, height, border-radius, opacity, transform

## Markup

```html
<div class="fixed-layer">
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
        <img class="sq-img hero-img">
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
        <div class="expand-overlay"><p class="expand-desc"></p></div>
      </div>
    </interact-element>
  </div>

  <interact-element data-interact-key="hero-text" class="hero-text-layer">
    <div class="hero-overlay">
      <h1 class="hero-name">ALEX RIVIERA</h1>
      <p class="hero-role">Creative Director</p>
    </div>
  </interact-element>

  <main>
    <div class="hero-spacer"></div>

    <interact-element data-interact-key="scroll-zone">
      <div class="scroll-zone">
        <div class="items-frame">
          <div class="projects-row">
            <interact-element data-interact-key="p0"><div class="project-col"><span class="half-top">DUSK RISING</span><span class="half-bottom">EDITORIAL</span></div></interact-element>
            <interact-element data-interact-key="p1"><div class="project-col"><span class="half-top">NEON DRIFT</span><span class="half-bottom">COMMERCIAL</span></div></interact-element>
            <interact-element data-interact-key="p2"><div class="project-col"><span class="half-top">STILL WATERS</span><span class="half-bottom">FASHION</span></div></interact-element>
            <interact-element data-interact-key="p3"><div class="project-col"><span class="half-top">PAPER CRANE</span><span class="half-bottom">BRANDING</span></div></interact-element>
            <interact-element data-interact-key="p4"><div class="project-col"><span class="half-top">ECHO CHAMBER</span><span class="half-bottom">MUSIC VIDEO</span></div></interact-element>
            <interact-element data-interact-key="p5"><div class="project-col"><span class="half-top">GLASS HOUSE</span><span class="half-bottom">ARCHITECTURE</span></div></interact-element>
            <interact-element data-interact-key="p6"><div class="project-col"><span class="half-top">WILD LIGHT</span><span class="half-bottom">PHOTOGRAPHY</span></div></interact-element>
            <interact-element data-interact-key="p7"><div class="project-col"><span class="half-top">SLOW BURN</span><span class="half-bottom">FILM</span></div></interact-element>
            <interact-element data-interact-key="p8"><div class="project-col"><span class="half-top">DEEP CURRENT</span><span class="half-bottom">CAMPAIGN</span></div></interact-element>
            <interact-element data-interact-key="p9"><div class="project-col"><span class="half-top">SILVER LINE</span><span class="half-bottom">EDITORIAL</span></div></interact-element>
            <interact-element data-interact-key="p10"><div class="project-col"><span class="half-top">FIRST SNOW</span><span class="half-bottom">SHORT FILM</span></div></interact-element>
            <interact-element data-interact-key="p11"><div class="project-col"><span class="half-top">OPEN FIELD</span><span class="half-bottom">BRANDING</span></div></interact-element>
          </div>
        </div>
      </div>
    </interact-element>

    <div class="end-spacer"></div>
  </main>

  <button class="read-more-btn" id="readMoreBtn">Read more</button>

  <div class="custom-cursor" id="cursor">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <line x1="8" y1="2" x2="8" y2="14" stroke="#111" stroke-width="2"/>
      <line x1="2" y1="8" x2="14" y2="8" stroke="#111" stroke-width="2"/>
    </svg>
  </div>
```

## Essential styles

```css
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    html {
      overflow-y: scroll;
      scrollbar-width: none;
      scroll-snap-type: y mandatory;
    }
    html::-webkit-scrollbar { display: none; }
    body {
      background: #fff;
      color: #111;
      font-family: 'Space Mono', monospace;
      -webkit-font-smoothing: antialiased;
      overflow-x: clip;
    }

    interact-element { display: block; }

    
    .fixed-layer {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 50;
    }

    .fixed-layer interact-element[data-interact-key="ind"] {
      position: absolute;
      inset: 0;
      z-index: 2;
    }

    .fixed-layer interact-element[data-interact-key="square"] {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .hero-text-layer {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 60;
      mix-blend-mode: difference;
    }

    .square-frame {
      width: 100vw;
      height: 100vh;
      position: relative;
      overflow: clip;
      background: #111;
    }

    .sq-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      visibility: hidden;
    }
    .sq-img.hero-img { visibility: visible; }

    
    .hero-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .hero-name {
      font-family: 'Doto', sans-serif;
      font-weight: 900;
      font-size: clamp(50px, 10vw, 140px);
      letter-spacing: -1px;
      line-height: 1;
      color: #fff;
    }

    .hero-role {
      font-size: 12px;
      letter-spacing: 5px;
      text-transform: uppercase;
      color: rgba(255,255,255,0.5);
      margin-top: 16px;
    }

    
    .indicators {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .ind-left,
    .ind-right {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      display: grid;
      font-family: 'Space Mono', monospace;
      font-size: 17px;
      font-weight: 700;
      letter-spacing: 1px;
      color: #000;
    }

    .ind-left { top: 40px; }
    .ind-right { bottom: 40px; }

    .ind-item {
      grid-row: 1;
      grid-column: 1;
      visibility: hidden;
      padding: 2px 6px;
    }

    
    .hero-spacer { height: 100vh; }

    
    .scroll-zone { height: 1200vh; }

    .items-frame {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      width: 100vw;
      overflow: clip;
      z-index: 10;
      pointer-events: none;
    }

    .projects-row {
      display: flex;
      height: 100%;
    }

    .projects-row > interact-element {
      min-width: 60vw;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .project-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: clamp(32px, 4vw, 48px);
      color: #e0e0e0;
    }

    main { position: relative; }

    .snap-marker {
      position: absolute;
      left: 0;
      width: 1px;
      height: 1px;
      scroll-snap-align: start;
      pointer-events: none;
    }

    .half-top,
    .half-bottom {
      font-family: 'Doto', sans-serif;
      font-size: clamp(75px, 8.94vw, 105px);
      font-weight: 900;
      letter-spacing: -1px;
      text-transform: uppercase;
      line-height: 1;
      white-space: nowrap;
    }

    
    .end-spacer { height: 100vh; }

    .read-more-btn { display: none; }

    
    @media (min-width: 769px) and (max-width: 1240px) {
      .half-top,
      .half-bottom {
        font-size: clamp(60px, 7vw, 85px);
      }

      .project-col {
        gap: 36px;
      }
    }

    
    @media (max-width: 768px) {
      .ind-left { top: 30px; }
      .ind-right { bottom: 30px; }

      .ind-left,
      .ind-right {
        font-size: 13px;
      }

      .half-top,
      .half-bottom {
        font-size: 47px;
      }

      .project-col {
        gap: 128px;
      }

      .projects-row > interact-element {
        min-width: 80vw;
      }

      .hero-name {
        font-size: clamp(36px, 9vw, 60px);
      }

      .hero-role {
        font-size: 10px;
        letter-spacing: 3px;
      }

      html, body { cursor: auto !important; }
      .custom-cursor { display: none !important; }

      .read-more-btn {
        display: block;
        position: fixed;
        top: calc(50% + 218px);
        left: 50%;
        transform: translateX(-50%);
        z-index: 15;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease, transform 0.2s ease;
        font-family: 'Space Mono', monospace;
        font-size: 11px;
        letter-spacing: 2px;
        text-transform: uppercase;
        color: #111;
        background: transparent;
        border: 1px solid #aaa;
        border-radius: 20px;
        padding: 8px 20px;
        white-space: nowrap;
        -webkit-tap-highlight-color: transparent;
      }

      .read-more-btn.visible {
        opacity: 1;
        pointer-events: auto;
      }

      .read-more-btn.visible:hover {
        transform: translateX(-50%) scale(1.12);
      }

      .read-more-btn.visible:active {
        transform: translateX(-50%) scale(0.97);
      }
    }
    
    html, body { cursor: none; }
    .square-frame { pointer-events: auto; touch-action: pan-y; transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
    .project-col { pointer-events: auto; }

    .custom-cursor {
      position: fixed;
      left: 0; top: 0;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #fff;
      border: 1.5px solid #222;
      pointer-events: none;
      z-index: 200;
      display: flex;
      align-items: center;
      justify-content: center;
      transform: translate(-50%, -50%);
      transition: width 0.3s ease, height 0.3s ease;
      opacity: 0;
    }

    .custom-cursor svg { transition: transform 0.4s ease; }
    .custom-cursor svg line { transition: opacity 0.3s ease; }

    body.on-item:not(.expanded).cursor-hover .custom-cursor {
      width: 72px;
      height: 72px;
    }

    body.on-item:not(.expanded).cursor-hover .custom-cursor svg line {
      opacity: 0.55;
    }

    body.expanded .custom-cursor svg {
      transform: rotate(45deg);
    }

    
    .expand-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.55);
      opacity: 0;
      transition: opacity 0.3s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 5;
      padding: 12%;
    }

    body.expanded .expand-overlay {
      opacity: 1;
      transition: opacity 0.5s ease;
    }

    body.expanded .square-frame {
      transform: scale(var(--expand-scale, 2));
    }

    .expand-desc {
      color: rgba(255, 255, 255, 0.9);
      font-family: 'Space Mono', monospace;
      font-size: var(--desc-font-size, 8px);
      line-height: 1.6;
      text-align: center;
      opacity: 0;
      transform: translateY(10px);
      transition: opacity 0.3s ease, transform 0.3s ease;
    }

    body.expanded .expand-desc {
      opacity: 1;
      transform: translateY(0);
      transition: opacity 0.4s ease 0.25s, transform 0.4s ease 0.25s;
    }

    .projects-row { transition: opacity 0.3s ease; }
    body.expanded .projects-row { opacity: 0; }

    html.scroll-locked {
      overflow: hidden !important;
      scroll-snap-type: none !important;
    }
```

## Interact config

```js
const mqMobile = window.matchMedia('(max-width: 768px)');

const mqTablet = window.matchMedia('(max-width: 1240px)');

let mobile = mqMobile.matches;

const tablet = !mobile && mqTablet.matches;

const SPLIT = mobile ? 80 : tablet ? 100 : 150;

const FINAL_SIZE = mobile ? '180px' : tablet ? '210px' : '280px';

const ITEM_COUNT = 12;

const ITEM_WIDTH = mobile ? 80 : 60;

const HERO_STEPS = 2.6;

const STEPS = ITEM_COUNT + HERO_STEPS;

const step = 1 / STEPS;

const START_TX = 50 + ITEM_WIDTH * (HERO_STEPS - 0.5);

const END_TX = 50 - ITEM_WIDTH / 2 - ITEM_COUNT * ITEM_WIDTH;

const C0 = { name: 'cover', offset: { value: 0, unit: 'percentage' } };

const C1 = { name: 'cover', offset: { value: 100, unit: 'percentage' } };

function cl(v) { return Math.round(Math.max(0.001, Math.min(0.999, v)) * 10000) / 10000; }

const effects = [];

effects.push({
      key: 'square',
      selector: '.square-frame',
      rangeStart: C0, rangeEnd: C1, fill: 'both',
      keyframeEffect: {
        name: 'shrink',
        keyframes: [
          { offset: 0,               width: '100vw', height: '100vh', borderRadius: '0px', boxShadow: '0 0 0 0 rgba(0,0,0,0)' },
          { offset: 0.02,            width: '100vw', height: '100vh', borderRadius: '0px', boxShadow: '0 0 0 0 rgba(0,0,0,0)' },
          { offset: cl(HERO_STEPS * step * 0.65), width: FINAL_SIZE, height: FINAL_SIZE, borderRadius: '0px', boxShadow: '0 0 0 0 rgba(0,0,0,0)' },
          { offset: 1,               width: FINAL_SIZE, height: FINAL_SIZE, borderRadius: '0px', boxShadow: '0 0 0 0 rgba(0,0,0,0)' },
        ],
      },
    });

effects.push({
      key: 'hero-text',
      selector: '.hero-overlay',
      rangeStart: C0, rangeEnd: C1, fill: 'both',
      keyframeEffect: {
        name: 'heroHide',
        keyframes: [
          { offset: 0,              opacity: '1' },
          { offset: 0.01,           opacity: '1' },
          { offset: cl(HERO_STEPS * step * 0.4), opacity: '0' },
          { offset: 1,              opacity: '0' },
        ],
      },
    });

const dissolveStart = HERO_STEPS * step * 0.45;

const dissolveEnd = HERO_STEPS * step * 0.95;

effects.push({
      key: 'square', selector: '.hero-img',
      rangeStart: C0, rangeEnd: C1, fill: 'both',
      keyframeEffect: {
        name: 'heroImgFade',
        keyframes: [
          { offset: 0, opacity: '1' },
          { offset: cl(dissolveStart), opacity: '1' },
          { offset: cl(dissolveEnd), opacity: '0' },
          { offset: cl(dissolveEnd + 0.001), opacity: '0', visibility: 'hidden' },
          { offset: 1, opacity: '0', visibility: 'hidden' },
        ],
      },
    });

effects.push({
      selector: '.projects-row',
      rangeStart: C0, rangeEnd: C1, fill: 'both',
      keyframeEffect: {
        name: 'rowSlide',
        keyframes: [
          { offset: 0, transform: `translateX(${START_TX}vw)` },
          { offset: 1, transform: `translateX(${END_TX}vw)` },
        ],
      },
    });

for (let i = 0; i < ITEM_COUNT; i++) {
      const center = (i + HERO_STEPS) * step;
      const visStart = (i + HERO_STEPS - 0.5) * step;
      const visEnd = (i + HERO_STEPS + 0.5) * step;

      
      const rampIn = cl(center - step * 0.7);
      const plateauIn = cl(center - step * 0.5);
      const plateauOut = cl(center + step * 0.5);
      const rampOut = cl(center + step * 0.7);

      
      effects.push({
        key: `p${i}`, selector: '.half-top',
        rangeStart: C0, rangeEnd: C1, fill: 'both',
        keyframeEffect: {
          name: `sT${i}`,
          keyframes: [
            { offset: 0, transform: 'translateY(0)' },
            { offset: rampIn, transform: 'translateY(0)' },
            { offset: plateauIn, transform: `translateY(-${SPLIT}px)` },
            { offset: plateauOut, transform: `translateY(-${SPLIT}px)` },
            { offset: rampOut, transform: 'translateY(0)' },
            { offset: 1, transform: 'translateY(0)' },
          ],
        },
      });

      
      effects.push({
        key: `p${i}`, selector: '.half-bottom',
        rangeStart: C0, rangeEnd: C1, fill: 'both',
        keyframeEffect: {
          name: `sB${i}`,
          keyframes: [
            { offset: 0, transform: 'translateY(0)' },
            { offset: rampIn, transform: 'translateY(0)' },
            { offset: plateauIn, transform: `translateY(${SPLIT}px)` },
            { offset: plateauOut, transform: `translateY(${SPLIT}px)` },
            { offset: rampOut, transform: 'translateY(0)' },
            { offset: 1, transform: 'translateY(0)' },
          ],
        },
      });

      
      effects.push({
        key: `p${i}`, selector: '.project-col',
        rangeStart: C0, rangeEnd: C1, fill: 'both',
        keyframeEffect: {
          name: `hl${i}`,
          keyframes: [
            { offset: 0, color: '#e0e0e0' },
            { offset: cl(visStart - 0.001), color: '#e0e0e0' },
            { offset: cl(visStart), color: '#000' },
            { offset: cl(visEnd), color: '#000' },
            { offset: cl(visEnd + 0.001), color: '#e0e0e0' },
            { offset: 1, color: '#e0e0e0' },
          ],
        },
      });

      
      const imgKf = [
        { offset: 0, visibility: 'hidden' },
        { offset: cl(visStart - 0.001), visibility: 'hidden' },
        { offset: cl(visStart), visibility: 'visible' },
        { offset: cl(visEnd - 0.001), visibility: 'visible' },
        { offset: cl(visEnd), visibility: 'hidden' },
        { offset: 1, visibility: 'hidden' },
      ];

      if (i === 0) {
        const imgKf0 = [
          { offset: 0, visibility: 'hidden' },
          { offset: cl(dissolveStart - 0.001), visibility: 'hidden' },
          { offset: cl(dissolveStart), visibility: 'visible' },
          { offset: cl(visEnd - 0.001), visibility: 'visible' },
          { offset: cl(visEnd), visibility: 'hidden' },
          { offset: 1, visibility: 'hidden' },
        ];
        effects.push({
          key: 'square', selector: '.proj-img-0',
          rangeStart: C0, rangeEnd: C1, fill: 'both',
          keyframeEffect: { name: 'imgVis0', keyframes: imgKf0 },
        });
        effects.push({
          key: 'square', selector: '.proj-img-0',
          rangeStart: C0, rangeEnd: C1, fill: 'both',
          keyframeEffect: {
            name: 'imgDissolve0',
            keyframes: [
              { offset: 0, opacity: '0' },
              { offset: cl(dissolveStart), opacity: '0' },
              { offset: cl(dissolveEnd), opacity: '1' },
              { offset: 1, opacity: '1' },
            ],
          },
        });
      } else {
        effects.push({
          key: 'square', selector: `.proj-img-${i}`,
          rangeStart: C0, rangeEnd: C1, fill: 'both',
          keyframeEffect: { name: `imgVis${i}`, keyframes: imgKf },
        });
      }

      
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
        key: 'scroll-zone',
        trigger: 'viewProgress',
        effects,
      }],
    };
```
