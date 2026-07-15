# Diagonal Slideshow

Scroll-driven slideshow where each slide title travels diagonally from a small top-left genesis position through a large centered hold to a small bottom-right exit, while background images wipe in from below using a clip-path reveal.

**Tags:** viewProgress, fixed, gallery, opacity, transform, clip-path, reveal, scale, stagger

## Markup

```html
<div class="slideshow" role="region" aria-roledescription="slideshow" aria-label="Image slideshow">
  <div class="sr-only" aria-live="polite" aria-atomic="true"></div>

  <div class="bg-layer">
    <div class="bg-panel" style="z-index:10;clip-path:inset(0%);filter:brightness(1)">
      <img src="https://images.unsplash.com/photo-1555255707-c07966088b7b?q=80&w=2532&auto=format&fit=crop" alt="Soul Matters">
      <div class="overlay"></div><div class="noise"></div><div class="scanlines"></div>
    </div>
    <div class="bg-panel" style="z-index:0;clip-path:inset(100% 0% 0% 0%);filter:brightness(0.6)">
      <img src="https://images.unsplash.com/photo-1506452819137-0422416856b8?q=80&w=2573&auto=format&fit=crop" alt="Void Walker">
      <div class="overlay"></div><div class="noise"></div><div class="scanlines"></div>
    </div>
    <div class="bg-panel" style="z-index:0;clip-path:inset(100% 0% 0% 0%);filter:brightness(0.6)">
      <img src="https://images.unsplash.com/photo-1535868463750-c78d9543614f?q=80&w=2676&auto=format&fit=crop" alt="Neon Dust">
      <div class="overlay"></div><div class="noise"></div><div class="scanlines"></div>
    </div>
    <div class="bg-panel" style="z-index:0;clip-path:inset(100% 0% 0% 0%);filter:brightness(0.6)">
      <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" alt="Cyber Zen">
      <div class="overlay"></div><div class="noise"></div><div class="scanlines"></div>
    </div>
  </div>

  <div class="ui-layer">
    <div class="top-row">
      <div class="top-left"><div class="clip-box"><span class="category">Genesis</span></div></div>
      <div class="top-center">
        <div class="clip-box"><span class="number">001</span></div>
        <span class="idx-label" aria-hidden="true">INDEX</span>
      </div>
      <div class="top-right"><div class="clip-box"><span class="subtitle-text">Matter</span></div></div>
    </div>
    <div class="bottom-row">
      <div class="indicators" role="tablist" aria-label="Slide navigation">
        <div class="dot active" style="width:64px" role="tab" aria-selected="true" tabindex="0" aria-label="Slide 1: Soul Matters"></div>
        <div class="dot" style="width:24px" role="tab" aria-selected="false" tabindex="-1" aria-label="Slide 2: Void Walker"></div>
        <div class="dot" style="width:24px" role="tab" aria-selected="false" tabindex="-1" aria-label="Slide 3: Neon Dust"></div>
        <div class="dot" style="width:24px" role="tab" aria-selected="false" tabindex="-1" aria-label="Slide 4: Cyber Zen"></div>
      </div>
      <div class="bottom-right">
        <div class="clip-box"><p class="description">The internal architecture of silence.</p></div>
      </div>
    </div>
  </div>

  <div class="title-layer">
    <interact-element data-interact-key="title-0">
      <div class="title-el" style="opacity:1">Soul Matters<div class="title-underline"></div></div>
    </interact-element>
    <interact-element data-interact-key="title-1">
      <div class="title-el">Void Walker<div class="title-underline"></div></div>
    </interact-element>
    <interact-element data-interact-key="title-2">
      <div class="title-el">Neon Dust<div class="title-underline"></div></div>
    </interact-element>
    <interact-element data-interact-key="title-3">
      <div class="title-el">Cyber Zen<div class="title-underline"></div></div>
    </interact-element>
  </div>

  <button class="chevron" type="button" aria-label="Scroll to next slide">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  </button>
</div>

<div class="scroll-track">
  <interact-element data-interact-key="section-0"><div class="scroll-section"></div></interact-element>
  <interact-element data-interact-key="section-1"><div class="scroll-section"></div></interact-element>
  <interact-element data-interact-key="section-2"><div class="scroll-section"></div></interact-element>
  <interact-element data-interact-key="section-3"><div class="scroll-section"></div></interact-element>
  <div class="scroll-section"></div>
  <div class="scroll-section"></div>
</div>
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
.bg-panel .noise      {
  position: absolute; inset: 0; opacity: .2; pointer-events: none;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
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

## Animation logic

The title diagonal path (start/end positions, scale) is computed at runtime by measuring DOM element bounding rects after fonts load. Background image transitions and title movement are both driven by a single scroll handler using `requestAnimationFrame`.

```js
const SLIDES = [
  { id:1, number:'001', category:'Genesis', subtitle:'Matter', title:'Soul Matters',
    description:'The internal architecture of silence.',
    image:'https://images.unsplash.com/photo-1555255707-c07966088b7b?q=80&w=2532&auto=format&fit=crop' },
  { id:2, number:'002', category:'Process', subtitle:'Form', title:'Void Walker',
    description:'Echoes from the deep static.',
    image:'https://images.unsplash.com/photo-1506452819137-0422416856b8?q=80&w=2573&auto=format&fit=crop' },
  { id:3, number:'003', category:'Entropy', subtitle:'Void', title:'Neon Dust',
    description:'Fragments of a digital memory.',
    image:'https://images.unsplash.com/photo-1535868463750-c78d9543614f?q=80&w=2676&auto=format&fit=crop' },
  { id:4, number:'004', category:'Synthesis', subtitle:'Light', title:'Cyber Zen',
    description:'Harmonic resonance in the machine.',
    image:'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop' },
];

const START_END_SCALE = window.innerWidth < 768 ? 0.644 : 0.56;

// titleAnimData: per-title { startX, startY, endX, endY, genesisX, genesisY }
// computed after document.fonts.ready by measuring .category, .description, and title bounding rects.

function updateVisuals(panels, underlineEls, displayedSlide, swapText, updateDots) {
  const scrollY = window.scrollY;
  const sectionH = window.innerHeight;
  const rawProgress = scrollY / sectionH;
  const slideIndex = Math.min(Math.floor(rawProgress), SLIDES.length - 1);
  const localProg = Math.min(rawProgress - slideIndex, 1);

  panels.forEach((p, i) => {
    if (i < slideIndex) {
      p.style.zIndex = '0'; p.style.clipPath = 'inset(0%)'; p.style.filter = 'brightness(0.6)';
    } else if (i === slideIndex) {
      p.style.zIndex = '10'; p.style.clipPath = 'inset(0%)'; p.style.filter = 'brightness(1)';
    } else if (i === slideIndex + 1 && localProg > 0.35) {
      const wipeProgress = Math.min((localProg - 0.35) / 0.65, 1);
      p.style.zIndex = '11';
      p.style.clipPath = `inset(${(1 - wipeProgress) * 100}% 0% 0% 0%)`;
      p.style.filter = `brightness(${0.6 + wipeProgress * 0.4})`;
    } else {
      p.style.zIndex = '0'; p.style.clipPath = 'inset(100% 0% 0% 0%)'; p.style.filter = 'brightness(0.6)';
    }
  });

  underlineEls.forEach((ul, i) => {
    if (i === slideIndex) {
      if (localProg >= 0.35 && localProg <= 0.80) {
        ul.style.transform = `scaleX(${(localProg - 0.35) / 0.45})`;
      } else {
        ul.style.transform = localProg > 0.80 ? 'scaleX(1)' : 'scaleX(0)';
      }
    } else {
      ul.style.transform = i < slideIndex ? 'scaleX(1)' : 'scaleX(0)';
    }
  });

  const target = Math.min(Math.max(0, slideIndex), SLIDES.length - 1);
  if (target !== displayedSlide) {
    swapText(target);
    updateDots(target);
    return target;
  }
  return displayedSlide;
}

function animateTitlesFallback(titleEls, titleAnimData) {
  const scrollY = window.scrollY;
  const sectionH = window.innerHeight;
  const rawProgress = scrollY / sectionH;
  const slideIndex = Math.min(Math.floor(rawProgress), SLIDES.length - 1);
  const localProg = Math.min(rawProgress - slideIndex, 1);

  function lerp(a, b, t) { return a + (b - a) * t; }

  titleEls.forEach((el, i) => {
    const d = titleAnimData[i];
    if (i === slideIndex) {
      let x, y, scale;
      if (i !== 0 && localProg <= 0.07) {
        const t = localProg / 0.07;
        x = lerp(d.startX, d.genesisX, t); y = lerp(d.startY, d.genesisY, t); scale = START_END_SCALE;
      } else if (localProg <= 0.15) {
        x = d.genesisX; y = d.genesisY; scale = START_END_SCALE;
      } else if (localProg <= 0.35) {
        const t = (localProg - 0.15) / 0.20;
        x = lerp(d.genesisX, 0, t); y = lerp(d.genesisY, 0, t); scale = lerp(START_END_SCALE, 1.2, t);
      } else if (localProg <= 0.80) {
        x = 0; y = 0; scale = 1.2;
      } else {
        const t = (localProg - 0.80) / 0.20;
        x = lerp(0, d.endX, t); y = lerp(0, d.endY, t); scale = lerp(1.2, START_END_SCALE, t);
      }
      el.style.transform = `translate(${x}vw, ${y}vh) scale(${scale})`;
      el.style.opacity = '1';
    } else if (i < slideIndex) {
      el.style.transform = `translate(${d.endX}vw, ${d.endY}vh) scale(${START_END_SCALE})`;
      el.style.opacity = '1';
    } else {
      el.style.opacity = '0';
    }
  });
}

let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => { updateVisuals(); animateTitlesFallback(); ticking = false; });
    ticking = true;
  }
}, { passive: true });
```
