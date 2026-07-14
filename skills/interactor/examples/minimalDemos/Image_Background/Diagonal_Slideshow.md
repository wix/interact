# Diagonal Slideshow

A scroll-driven and click-triggered animation for layered visual elements in a flex/carousel, layered composition layout. It uses transform, opacity, top to create the motion and transition between visual states.

**Tags:** trigger: viewProgress, click; layout: flex/carousel, layered composition; motion: transform, opacity, top

## Markup

```html
<div class="slideshow" id="slideshow">
    <div id="liveRegion" class="sr-only"></div>

    <div class="bg-layer" id="bgLayer"></div>

    <div class="ui-layer">

      <div class="top-row">
        <div class="top-left"><div class="clip-box" id="catBox"></div></div>
        <div class="top-center">
          <div class="clip-box" id="numBox"></div>
          <span class="idx-label">INDEX</span>
        </div>
        <div class="top-right"><div class="clip-box" id="subBox"></div></div>
      </div>

      <div class="bottom-row">
        <div class="indicators" id="indicators"></div>
        <div class="bottom-right"><div class="clip-box" id="descBox"></div></div>
      </div>
    </div>

    <div class="title-layer" id="titleLayer"></div>

    <button class="chevron" id="chevronBtn" type="button">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
           fill="none" stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round">
        <path d="m6 9 6 6 6-6"/>
      </svg>
    </button>
  </div>

  <div class="scroll-track" id="scrollTrack"></div>
```

## Essential styles

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { margin: 0; font-family: system-ui, -apple-system, sans-serif; background: #000; overscroll-behavior: none; }
    ::selection { background: white; color: black; }

    
    .slideshow {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      overflow: clip;
      background: #000;
      color: #fff;
      z-index: 1;
      pointer-events: none;
    }

    
    .scroll-track {
      position: relative;
      z-index: 0;
    }
    .scroll-track interact-element {
      display: block;
    }
    .scroll-section {
      height: 100vh;
    }

    
    .bg-layer { position: absolute; inset: 0; z-index: 0; }

    .bg-panel {
      position: absolute; inset: 0;
      will-change: clip-path, filter;
    }
    .bg-panel img {
      width: 100%; height: 100%; object-fit: cover; display: block;
    }
    .bg-panel .overlay   { position: absolute; inset: 0; background: rgba(0,0,0,.4); }

    .bg-panel .scanlines  {
      position: absolute; inset: 0; pointer-events: none; z-index: 1;
      background:
        linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,.25) 50%),
        linear-gradient(90deg, rgba(255,0,0,.06), rgba(0,255,0,.02), rgba(0,0,255,.06));
      background-size: 100% 4px, 3px 100%;
    }

    
    .ui-layer {
      position: relative; z-index: 30;
      width: 100%; height: 100%;
      padding: 1.5rem;
      display: flex; flex-direction: column; justify-content: space-between;
      pointer-events: none;
      filter: drop-shadow(0 1px 3px rgba(0,0,0,.5));
    }
    @media (min-width: 768px) { .ui-layer { padding: 3rem; } }

    
    .top-row, .bottom-row {
      display: flex; justify-content: space-between; align-items: flex-start; width: 100%;
    }
    .bottom-row { align-items: flex-end; }

    
    .clip-box { overflow: hidden; position: relative; }
    .top-left   .clip-box { height: 1.6em; }
    .top-center .clip-box { text-align: center; height: 1.8em; }
    .top-right  .clip-box { text-align: right; }
    .bottom-right .clip-box { text-align: right; }

    .top-center {
      position: absolute; left: 50%; top: 1.5rem;
      transform: translateX(-50%);
    }
    @media (min-width: 768px) { .top-center { top: 3rem; } }

    
    .category, .subtitle-text {
      display: block;
      font-family: 'Roboto Flex', sans-serif;
      font-size: .875rem; letter-spacing: .2em; text-transform: uppercase; font-weight: 700; opacity: .8;
    }
    @media (min-width: 768px) { .category, .subtitle-text { font-size: 1rem; } }

    .number { display: block; font-size: 1.5rem; font-family: ui-monospace, monospace; letter-spacing: -.05em; }
    .idx-label { font-size: 10px; letter-spacing: .2em; opacity: .6; font-family: ui-monospace, monospace; display: block; text-align: center; margin-top: .5em; }
    .subtitle-rule { display: none; }

    .description {
      font-size: .75rem; max-width: 250px; text-align: right; opacity: .7;
      line-height: 1.6; font-family: ui-monospace, monospace;
    }

    
    .bottom-right { display: block; }
    @media (max-width: 767px) {
      .bottom-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 45px;
      }
      .bottom-right { order: -1; }
      .bottom-right .clip-box { text-align: left; }
      .description { text-align: left; }
    }

    
    .indicators { display: flex; gap: .5rem; align-items: flex-end; padding-bottom: .25rem; pointer-events: auto; }
    .dot {
      height: 3px; border-radius: 9999px; background: rgba(255,255,255,.3); transition: width .7s ease-out, background .3s; cursor: pointer;
    }
    .dot.active { background: #fff; }

    
    .title-layer {
      position: absolute; inset: 0; z-index: 20;
      display: flex; align-items: center; justify-content: center;
      pointer-events: none; overflow: clip;
    }

    .title-layer interact-element {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }

    .title-el {
      position: relative;
      font-family: 'Instrument Serif', serif;
      font-size: clamp(3rem, 10vw, 10rem);
      font-weight: 400; letter-spacing: -.02em;
      color: #fff; mix-blend-mode: overlay;
      white-space: nowrap; line-height: 1;
      text-shadow: 0 0 30px rgba(0,0,0,.5);
      will-change: transform;
      opacity: 0;
      pointer-events: auto;
      user-select: text;
      cursor: text;
    }
    .title-underline {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background: #fff;
      transform: scaleX(0);
      transform-origin: left;
      will-change: transform;
    }

    
    .category, .subtitle-text, .number, .idx-label, .description {
      pointer-events: auto;
      user-select: text;
      cursor: text;
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

    
    .chevron {
      position: absolute; bottom: 1.5rem; left: 50%; transform: translateX(-50%);
      z-index: 30; opacity: .5;
      animation: pulse 2s ease-in-out infinite;
      cursor: pointer;
      pointer-events: auto;
      border: none;
      background: none;
      color: inherit;
      padding: 0;
      font: inherit;
    }
    .chevron:focus-visible {
      outline: 2px solid #fff;
      outline-offset: 4px;
      border-radius: 2px;
    }
    .dot:focus-visible {
      outline: 2px solid #fff;
      outline-offset: 2px;
    }
    @keyframes pulse { 0%,100% { opacity:.5 } 50% { opacity:.8 } }
    .chevron svg { width: 24px; height: 24px; }
```

## Interact config

```js
const SLIDES = [
      { id:1, number:'001', category:'Genesis', subtitle:'Matter', title:'Soul Matters',
        description:'The internal architecture of silence.',
        image:'IMAGE_URL' },
      { id:2, number:'002', category:'Process', subtitle:'Form', title:'Void Walker',
        description:'Echoes from the deep static.',
        image:'IMAGE_URL' },
      { id:3, number:'003', category:'Entropy', subtitle:'Void', title:'Neon Dust',
        description:'Fragments of a digital memory.',
        image:'IMAGE_URL' },
      { id:4, number:'004', category:'Synthesis', subtitle:'Light', title:'Cyber Zen',
        description:'Harmonic resonance in the machine.',
        image:'IMAGE_URL' },
    ];

const titleLayer = document.getElementById('titleLayer');

const subBox     = document.getElementById('subBox');

const indWrap    = document.getElementById('indicators');

const chevronBtn = document.getElementById('chevronBtn');

const scrollTrack = document.getElementById('scrollTrack');

const underlineEls = [];

const titleEls = SLIDES.map((s, i) => {
      const wrapper = document.createElement('interact-element');
      wrapper.setAttribute('data-interact-key', `title-${i}`);
      const el = document.createElement('div');
      el.className = 'title-el';
      el.textContent = s.title;
      const underline = document.createElement('div');
      underline.className = 'title-underline';
      el.appendChild(underline);
      underlineEls.push(underline);
      wrapper.appendChild(el);
      titleLayer.appendChild(wrapper);
      return el;
    });

SLIDES.forEach((_, i) => {
      const wrapper = document.createElement('interact-element');
      wrapper.setAttribute('data-interact-key', `section-${i}`);
      const section = document.createElement('div');
      section.className = 'scroll-section';
      wrapper.appendChild(section);
      scrollTrack.appendChild(wrapper);
    });

for (let s = 0; s < 2; s++) {
      const spacer = document.createElement('div');
      spacer.className = 'scroll-section';
      scrollTrack.appendChild(spacer);
    }

let curCat, curNum, curSub, curDesc;

const catRect = curCat.getBoundingClientRect();

const subBoxRect = subBox.getBoundingClientRect();

const descElRect = curDesc.getBoundingClientRect();

const indRect = indWrap.getBoundingClientRect();

const vwUnit = window.innerWidth / 100;

const vhUnit = window.innerHeight / 100;

const isMobile = window.innerWidth < 768;

const START_END_SCALE = isMobile ? 0.644 : 0.56;

const lastIdx = SLIDES.length - 1;

const titleAnimData = titleEls.map((el, i) => {
      const rect = el.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      
      const genesisGap = isMobile ? 45 : 50;
      const gx = (catRect.left + (w * START_END_SCALE) / 2 - window.innerWidth / 2) / vwUnit;
      const gy = (catRect.bottom + genesisGap + (h * START_END_SCALE) / 2 - window.innerHeight / 2) / vhUnit;

      
      const endGap = isMobile ? 10 : 20;
      const alignRight = subBoxRect.right;
      const alignBottom = descElRect.height > 0 ? (descElRect.top - endGap) : (indRect.top - 30);
      const endRightX = (alignRight - (w * START_END_SCALE) / 2 - window.innerWidth / 2) / vwUnit;
      const endBottomY = (alignBottom - (h * START_END_SCALE) / 2 - window.innerHeight / 2) / vhUnit;

      
      const halfWVw = (w * START_END_SCALE / 2) / vwUnit;
      const halfHVh = (h * START_END_SCALE / 2) / vhUnit;

      
      const offEntryX = -(50 + halfWVw + 2);
      const offEntryY = -(50 + halfHVh + 2);
      
      const offExitX  = 50 + halfWVw + 2;
      const offExitY  = 50 + halfHVh + 2;

      
      
      const sx = i === 0 ? gx : offEntryX;
      const sy = i === 0 ? gy : offEntryY;

      
      
      const ex = i === lastIdx ? endRightX : offExitX;
      const ey = i === lastIdx ? endBottomY : offExitY;

      
      const genesisT = `translate(${gx.toFixed(2)}vw, ${gy.toFixed(2)}vh) scale(${START_END_SCALE})`;

      
      
      
      const kf = i === 0
        ? [
            { transform: genesisT,                       opacity: 1, offset: 0 },
            { transform: genesisT,                       opacity: 1, offset: 0.15 },
            { transform: 'translate(0, 0) scale(1.2)',   opacity: 1, offset: 0.35 },
            { transform: 'translate(0, 0) scale(1.2)',   opacity: 1, offset: 0.80 },
            { transform: `translate(${ex.toFixed(2)}vw, ${ey.toFixed(2)}vh) scale(${START_END_SCALE})`, opacity: 1, offset: 1 }
          ]
        : [
            { transform: `translate(${sx.toFixed(2)}vw, ${sy.toFixed(2)}vh) scale(${START_END_SCALE})`, opacity: 1, offset: 0 },
            { transform: genesisT,                       opacity: 1, offset: 0.07 },
            { transform: genesisT,                       opacity: 1, offset: 0.15 },
            { transform: 'translate(0, 0) scale(1.2)',   opacity: 1, offset: 0.35 },
            { transform: 'translate(0, 0) scale(1.2)',   opacity: 1, offset: 0.80 },
            { transform: `translate(${ex.toFixed(2)}vw, ${ey.toFixed(2)}vh) scale(${START_END_SCALE})`, opacity: 1, offset: 1 }
          ];

      return {
        startX: sx, startY: sy, endX: ex, endY: ey,
        genesisX: gx, genesisY: gy,
        keyframes: kf
      };
    });

titleEls[0].style.opacity = '1';

titleEls[0].style.transform = titleAnimData[0].keyframes[0].transform;

chevronBtn.addEventListener('click', () => {
      const sectionH = window.innerHeight;
      const currentSection = Math.round(window.scrollY / sectionH);
      const next = Math.min(currentSection + 1, SLIDES.length - 1);
      window.scrollTo({ top: next * sectionH, behavior: 'smooth' });
    });

const interactions = SLIDES.map((_, i) => ({
          key: `section-${i}`,
          trigger: 'viewProgress',
          effects: [{
            key: `title-${i}`,
            rangeStart: { name: 'exit', offset: { value: 0, type: 'percentage' } },
            rangeEnd:   { name: 'exit', offset: { value: 100, type: 'percentage' } },
            fill: 'forwards',
            keyframeEffect: {
              name: `titleDiag${i}`,
              keyframes: titleAnimData[i].keyframes
            }
          }]
        }));

const config = { interactions };
```
