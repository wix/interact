# Expanding Horizontal Scroll

Four full-viewport colored panels are stacked offscreen to the right inside a 700vh sticky section; as the user scrolls, each panel slides horizontally to fill the screen in sequence while its thumbnail image scales up dramatically, driven entirely by `viewProgress`.

**Tags:** viewProgress, viewEnter, sticky, transform, opacity, scale, stagger, reveal

## Markup

```html
<div class="intro-section">
  <h1>Scroll Down</h1>
  <p>An animation will begin.</p>
</div>

<interact-element data-interact-key="#scroll-section">
  <div id="scroll-section">
    <div id="sticky-container">
      <h1 class="static-title">
        <interact-element data-interact-key=".title-letter-0"><span class="title-letter title-letter-0">T</span></interact-element><interact-element data-interact-key=".title-letter-1"><span class="title-letter title-letter-1">h</span></interact-element><interact-element data-interact-key=".title-letter-2"><span class="title-letter title-letter-2">e</span></interact-element><interact-element data-interact-key=".title-letter-3"><span class="title-letter title-letter-3">&nbsp;</span></interact-element><interact-element data-interact-key=".title-letter-4"><span class="title-letter title-letter-4">S</span></interact-element><interact-element data-interact-key=".title-letter-5"><span class="title-letter title-letter-5">t</span></interact-element><interact-element data-interact-key=".title-letter-6"><span class="title-letter title-letter-6">o</span></interact-element><interact-element data-interact-key=".title-letter-7"><span class="title-letter title-letter-7">r</span></interact-element><interact-element data-interact-key=".title-letter-8"><span class="title-letter title-letter-8">y</span></interact-element><interact-element data-interact-key=".title-letter-9"><span class="title-letter title-letter-9">&nbsp;</span></interact-element><interact-element data-interact-key=".title-letter-10"><span class="title-letter title-letter-10">o</span></interact-element><interact-element data-interact-key=".title-letter-11"><span class="title-letter title-letter-11">f</span></interact-element><interact-element data-interact-key=".title-letter-12"><span class="title-letter title-letter-12">&nbsp;</span></interact-element><interact-element data-interact-key=".title-letter-13"><span class="title-letter title-letter-13">P</span></interact-element><interact-element data-interact-key=".title-letter-14"><span class="title-letter title-letter-14">a</span></interact-element><interact-element data-interact-key=".title-letter-15"><span class="title-letter title-letter-15">n</span></interact-element><interact-element data-interact-key=".title-letter-16"><span class="title-letter title-letter-16">e</span></interact-element><interact-element data-interact-key=".title-letter-17"><span class="title-letter title-letter-17">l</span></interact-element><interact-element data-interact-key=".title-letter-18"><span class="title-letter title-letter-18">s</span></interact-element>
      </h1>

      <interact-element data-interact-key="#dynamic-paragraph">
        <p id="dynamic-paragraph" class="dynamic-paragraph"></p>
      </interact-element>

      <interact-element data-interact-key="#box4">
        <div id="box4" class="box box4" style="left: 90vw; z-index: 40;">
          <interact-element data-interact-key="#image4">
            <img id="image4" src="IMAGE_URL" alt="Image 4" class="panel-image">
          </interact-element>
        </div>
      </interact-element>

      <interact-element data-interact-key="#box3">
        <div id="box3" class="box box3" style="left: 80vw; z-index: 30;">
          <interact-element data-interact-key="#image3">
            <img id="image3" src="IMAGE_URL" alt="Image 3" class="panel-image">
          </interact-element>
        </div>
      </interact-element>

      <interact-element data-interact-key="#box2">
        <div id="box2" class="box box2" style="left: 70vw; z-index: 20;">
          <interact-element data-interact-key="#image2">
            <img id="image2" src="IMAGE_URL" alt="Image 2" class="panel-image">
          </interact-element>
        </div>
      </interact-element>

      <interact-element data-interact-key="#box1">
        <div id="box1" class="box box1" style="left: 60vw; z-index: 10;">
          <interact-element data-interact-key="#image1">
            <img id="image1" src="IMAGE_URL" alt="Image 1" class="panel-image">
          </interact-element>
        </div>
      </interact-element>
    </div>
  </div>
</interact-element>

<div class="outro-section">
  <h2>Animation Complete</h2>
  <p>You have scrolled through 600vh.</p>
</div>
```

## Essential styles

```css
body {
  margin: 0;
  font-family: "Inter", sans-serif;
  overflow-x: hidden;
  background-color: #111827;
  color: #f3f4f6;
}

.intro-section,
.outro-section {
  height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  flex-direction: column;
  padding: 0 1rem;
  box-sizing: border-box;
}

.intro-section h1,
.outro-section h2 {
  font-size: clamp(3rem, 7vw, 5rem);
  font-weight: 700;
  color: white;
  margin: 0;
}

.intro-section p,
.outro-section p {
  font-size: 1.25rem;
  color: #d1d5db;
  margin-top: 1rem;
}

#scroll-section {
  position: relative;
  width: 100%;
  height: 700vh;
}

#sticky-container {
  position: sticky;
  top: 0;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.box {
  position: absolute;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  padding-bottom: 10vh;
  font-size: 6rem;
  font-weight: 700;
  color: white;
}

.box1 { background-color: #BE123C; }
.box2 { background-color: #DB2777; }
.box3 { background-color: #7E22CE; }
.box4 { background-color: #4338CA; }

.panel-image {
  position: absolute;
  bottom: 10vh;
  left: 0;
  width: 10vw;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.3),
    0 4px 6px -4px rgb(0 0 0 / 0.3);
  transform-origin: left bottom;
}

.static-title {
  position: absolute;
  top: 10vh;
  left: 5vw;
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  z-index: 50;
}

.title-letter {
  display: inline-block;
  opacity: 0;
  transform: translateY(20px);
}

.dynamic-paragraph {
  position: absolute;
  top: 20vh;
  left: 5vw;
  font-size: 1.25rem;
  color: #d1d5db;
  z-index: 50;
  max-width: 300px;
  opacity: 1;
}
```

## Interact config

```js
const pauseStartPercent = 16.67;
const panelDurationPercent = 16.67;
const maxScale = 4;
const imageWidthVW = 10;
const box1Left = (100 - 4 * imageWidthVW) + 'vw'; // '60vw'
const box2Left = (100 - 3 * imageWidthVW) + 'vw'; // '70vw'
const box3Left = (100 - 2 * imageWidthVW) + 'vw'; // '80vw'
const box4Left = (100 - imageWidthVW) + 'vw';     // '90vw'
const finalImageLeftVW = Math.max(5, 45 - (imageWidthVW * maxScale)); // 5

const storyTexts = [
  "The story begins with a blank canvas, a space of pure potential before the first element arrives.",
  "This is the first panel. It introduces our journey with a bold statement.",
  "The second panel builds on the first, adding complexity and a new layer of color.",
  "Our third panel shifts the mood, introducing a cooler, more introspective tone.",
  "Finally, the fourth panel concludes the story, bringing all the elements into a final, cohesive view.",
];
let currentText = "";

function updateText(el, newText) {
  if (newText !== currentText) {
    el.style.transition = 'opacity 0.3s ease-in-out';
    el.style.opacity = '0';
    setTimeout(() => {
      el.textContent = newText;
      currentText = newText;
      el.style.opacity = '1';
    }, 300);
  }
}

function buildStaggeredTitle() {
  const letterCount = 19;
  const interactions = [];
  for (let i = 0; i < letterCount; i++) {
    interactions.push({
      key: '#scroll-section',
      trigger: 'viewEnter',
      params: { threshold: 0.05 },
      effects: [{
        key: `.title-letter-${i}`,
        triggerType: 'once',
        keyframeEffect: {
          name: `title-letter-in-${i}`,
          keyframes: [
            { opacity: 0, transform: 'translateY(20px)' },
            { opacity: 1, transform: 'translateY(0px)' }
          ]
        },
        duration: 400,
        easing: 'ease-out',
        delay: i * 50,
        fill: 'both'
      }]
    });
  }
  return interactions;
}

{
  interactions: [
    ...buildStaggeredTitle(),

    {
      key: '#scroll-section',
      trigger: 'viewProgress',
      effects: [{
        key: '#box1',
        keyframeEffect: { name: 'box1-move', keyframes: [{ left: box1Left }, { left: '0vw' }] },
        rangeStart: { name: 'cover', offset: { value: pauseStartPercent, unit: 'percentage' } },
        rangeEnd: { name: 'cover', offset: { value: pauseStartPercent + panelDurationPercent, unit: 'percentage' } },
        easing: 'linear', fill: 'both'
      }]
    },
    {
      key: '#scroll-section',
      trigger: 'viewProgress',
      effects: [{
        key: '#box2',
        keyframeEffect: { name: 'box2-move', keyframes: [{ left: box2Left }, { left: '0vw' }] },
        rangeStart: { name: 'cover', offset: { value: pauseStartPercent + panelDurationPercent, unit: 'percentage' } },
        rangeEnd: { name: 'cover', offset: { value: pauseStartPercent + (2 * panelDurationPercent), unit: 'percentage' } },
        easing: 'linear', fill: 'both'
      }]
    },
    {
      key: '#scroll-section',
      trigger: 'viewProgress',
      effects: [{
        key: '#box3',
        keyframeEffect: { name: 'box3-move', keyframes: [{ left: box3Left }, { left: '0vw' }] },
        rangeStart: { name: 'cover', offset: { value: pauseStartPercent + (2 * panelDurationPercent), unit: 'percentage' } },
        rangeEnd: { name: 'cover', offset: { value: pauseStartPercent + (3 * panelDurationPercent), unit: 'percentage' } },
        easing: 'linear', fill: 'both'
      }]
    },
    {
      key: '#scroll-section',
      trigger: 'viewProgress',
      effects: [{
        key: '#box4',
        keyframeEffect: { name: 'box4-move', keyframes: [{ left: box4Left }, { left: '0vw' }] },
        rangeStart: { name: 'cover', offset: { value: pauseStartPercent + (3 * panelDurationPercent), unit: 'percentage' } },
        rangeEnd: { name: 'cover', offset: { value: pauseStartPercent + (4 * panelDurationPercent), unit: 'percentage' } },
        easing: 'linear', fill: 'both'
      }]
    },

    {
      key: '#scroll-section',
      trigger: 'viewProgress',
      effects: [{
        key: '#image1',
        keyframeEffect: {
          name: 'image1-lifecycle',
          keyframes: [
            { transform: 'translateX(0vw) scale(1)' },
            { transform: `translateX(${finalImageLeftVW}vw) scale(${maxScale})` },
            { transform: `translateX(${finalImageLeftVW}vw) scale(0)` }
          ]
        },
        rangeStart: { name: 'cover', offset: { value: pauseStartPercent, unit: 'percentage' } },
        rangeEnd: { name: 'cover', offset: { value: pauseStartPercent + (2 * panelDurationPercent), unit: 'percentage' } },
        easing: 'linear', fill: 'both'
      }]
    },
    {
      key: '#scroll-section',
      trigger: 'viewProgress',
      effects: [{
        key: '#image2',
        keyframeEffect: {
          name: 'image2-lifecycle',
          keyframes: [
            { transform: 'translateX(0vw) scale(1)' },
            { transform: `translateX(${finalImageLeftVW}vw) scale(${maxScale})` },
            { transform: `translateX(${finalImageLeftVW}vw) scale(0)` }
          ]
        },
        rangeStart: { name: 'cover', offset: { value: pauseStartPercent + panelDurationPercent, unit: 'percentage' } },
        rangeEnd: { name: 'cover', offset: { value: pauseStartPercent + (3 * panelDurationPercent), unit: 'percentage' } },
        easing: 'linear', fill: 'both'
      }]
    },
    {
      key: '#scroll-section',
      trigger: 'viewProgress',
      effects: [{
        key: '#image3',
        keyframeEffect: {
          name: 'image3-lifecycle',
          keyframes: [
            { transform: 'translateX(0vw) scale(1)' },
            { transform: `translateX(${finalImageLeftVW}vw) scale(${maxScale})` },
            { transform: `translateX(${finalImageLeftVW}vw) scale(0)` }
          ]
        },
        rangeStart: { name: 'cover', offset: { value: pauseStartPercent + (2 * panelDurationPercent), unit: 'percentage' } },
        rangeEnd: { name: 'cover', offset: { value: pauseStartPercent + (4 * panelDurationPercent), unit: 'percentage' } },
        easing: 'linear', fill: 'both'
      }]
    },
    {
      key: '#scroll-section',
      trigger: 'viewProgress',
      effects: [{
        key: '#image4',
        keyframeEffect: {
          name: 'image4-scale-up',
          keyframes: [
            { transform: 'translateX(0vw) scale(1)' },
            { transform: `translateX(${finalImageLeftVW}vw) scale(${maxScale})` }
          ]
        },
        rangeStart: { name: 'cover', offset: { value: pauseStartPercent + (3 * panelDurationPercent), unit: 'percentage' } },
        rangeEnd: { name: 'cover', offset: { value: pauseStartPercent + (4 * panelDurationPercent), unit: 'percentage' } },
        easing: 'linear', fill: 'both'
      }]
    },

    {
      key: '#scroll-section',
      trigger: 'viewProgress',
      effects: [{
        key: '#dynamic-paragraph',
        customEffect: (el, progress) => {
          const p1End = (pauseStartPercent + panelDurationPercent) / 100;
          const p2End = (pauseStartPercent + 2 * panelDurationPercent) / 100;
          const p3End = (pauseStartPercent + 3 * panelDurationPercent) / 100;
          const p4End = (pauseStartPercent + 4 * panelDurationPercent) / 100;

          let textIndex;
          if (progress >= p4End) {
            textIndex = 4;
          } else if (progress >= p3End) {
            textIndex = 3;
          } else if (progress >= p2End) {
            textIndex = 2;
          } else if (progress >= p1End) {
            textIndex = 1;
          } else {
            textIndex = 0;
          }
          updateText(el, storyTexts[textIndex]);
        },
        rangeStart: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
        rangeEnd: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
        fill: 'both'
      }]
    }
  ]
}
```
