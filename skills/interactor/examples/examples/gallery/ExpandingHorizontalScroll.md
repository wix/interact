# Expanding Horizontal Scroll

Four full-viewport panels are stacked offscreen to the right inside a 700vh sticky section; as the user scrolls, each panel slides horizontally to fill the screen in sequence while its thumbnail image scales up, driven entirely by `viewProgress`.

**Tags:** viewProgress, viewEnter, sticky, transform, opacity, scale, stagger, reveal

## Markup

```html
<div class="intro-section">
  <h1>Scroll</h1>
</div>

<interact-element data-interact-key="#scroll-section">
  <div id="scroll-section">
    <div id="sticky-container">
      <h1 class="static-title">
        <span class="title-letter">P</span><span class="title-letter">a</span
        ><span class="title-letter">n</span><span class="title-letter">e</span
        ><span class="title-letter">l</span><span class="title-letter">s</span>
      </h1>

      <interact-element data-interact-key="#dynamic-paragraph">
        <p id="dynamic-paragraph" class="dynamic-paragraph"></p>
      </interact-element>

      <interact-element data-interact-key="#box4">
        <div id="box4" class="box box4" style="left:90vw;z-index:40;">
          <interact-element data-interact-key="#image4">
            <img id="image4" src="" class="panel-image" />
          </interact-element>
        </div>
      </interact-element>

      <interact-element data-interact-key="#box3">
        <div id="box3" class="box box3" style="left:80vw;z-index:30;">
          <interact-element data-interact-key="#image3">
            <img id="image3" src="" class="panel-image" />
          </interact-element>
        </div>
      </interact-element>

      <interact-element data-interact-key="#box2">
        <div id="box2" class="box box2" style="left:70vw;z-index:20;">
          <interact-element data-interact-key="#image2">
            <img id="image2" src="" class="panel-image" />
          </interact-element>
        </div>
      </interact-element>

      <interact-element data-interact-key="#box1">
        <div id="box1" class="box box1" style="left:60vw;z-index:10;">
          <interact-element data-interact-key="#image1">
            <img id="image1" src="" class="panel-image" />
          </interact-element>
        </div>
      </interact-element>
    </div>
  </div>
</interact-element>

<div class="outro-section">
  <h2>Done</h2>
</div>
```

## Essential styles

```css
body {
  margin: 0;
  overflow-x: clip;
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
  margin: 0;
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
  overflow: clip;
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
}

.panel-image {
  position: absolute;
  bottom: 10vh;
  left: 0;
  width: 10vw;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  transform-origin: left bottom;
}

.static-title {
  position: absolute;
  top: 10vh;
  left: 5vw;
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
const box1Left = 100 - 4 * imageWidthVW + 'vw'; // '60vw'
const box2Left = 100 - 3 * imageWidthVW + 'vw'; // '70vw'
const box3Left = 100 - 2 * imageWidthVW + 'vw'; // '80vw'
const box4Left = 100 - imageWidthVW + 'vw'; // '90vw'
const finalImageLeftVW = Math.max(5, 45 - imageWidthVW * maxScale); // 5

const storyTexts = ['Intro', 'Panel one', 'Panel two', 'Panel three', 'Panel four'];
const config = {
  interactions: [
    {
      key: '#scroll-section',
      trigger: 'viewEnter',
      params: { threshold: 0.05 },
      sequences: [
        {
          offset: 50,
          triggerType: 'once',
          effects: [
            {
              selector: '.title-letter',
              keyframeEffect: {
                name: 'title-letter-in',
                keyframes: [
                  { opacity: 0, transform: 'translateY(20px)' },
                  { opacity: 1, transform: 'translateY(0px)' },
                ],
              },
              duration: 400,
              easing: 'ease-out',
              fill: 'both',
            },
          ],
        },
      ],
    },

    {
      key: '#scroll-section',
      trigger: 'viewProgress',
      effects: [
        {
          key: '#box1',
          keyframeEffect: { name: 'box1-move', keyframes: [{ left: box1Left }, { left: '0vw' }] },
          rangeStart: { name: 'cover', offset: { value: pauseStartPercent, unit: 'percentage' } },
          rangeEnd: {
            name: 'cover',
            offset: { value: pauseStartPercent + panelDurationPercent, unit: 'percentage' },
          },
          easing: 'linear',
          fill: 'both',
        },
      ],
    },
    {
      key: '#scroll-section',
      trigger: 'viewProgress',
      effects: [
        {
          key: '#box2',
          keyframeEffect: { name: 'box2-move', keyframes: [{ left: box2Left }, { left: '0vw' }] },
          rangeStart: {
            name: 'cover',
            offset: { value: pauseStartPercent + panelDurationPercent, unit: 'percentage' },
          },
          rangeEnd: {
            name: 'cover',
            offset: { value: pauseStartPercent + 2 * panelDurationPercent, unit: 'percentage' },
          },
          easing: 'linear',
          fill: 'both',
        },
      ],
    },
    {
      key: '#scroll-section',
      trigger: 'viewProgress',
      effects: [
        {
          key: '#box3',
          keyframeEffect: { name: 'box3-move', keyframes: [{ left: box3Left }, { left: '0vw' }] },
          rangeStart: {
            name: 'cover',
            offset: { value: pauseStartPercent + 2 * panelDurationPercent, unit: 'percentage' },
          },
          rangeEnd: {
            name: 'cover',
            offset: { value: pauseStartPercent + 3 * panelDurationPercent, unit: 'percentage' },
          },
          easing: 'linear',
          fill: 'both',
        },
      ],
    },
    {
      key: '#scroll-section',
      trigger: 'viewProgress',
      effects: [
        {
          key: '#box4',
          keyframeEffect: { name: 'box4-move', keyframes: [{ left: box4Left }, { left: '0vw' }] },
          rangeStart: {
            name: 'cover',
            offset: { value: pauseStartPercent + 3 * panelDurationPercent, unit: 'percentage' },
          },
          rangeEnd: {
            name: 'cover',
            offset: { value: pauseStartPercent + 4 * panelDurationPercent, unit: 'percentage' },
          },
          easing: 'linear',
          fill: 'both',
        },
      ],
    },

    {
      key: '#scroll-section',
      trigger: 'viewProgress',
      effects: [
        {
          key: '#image1',
          keyframeEffect: {
            name: 'image1-lifecycle',
            keyframes: [
              { transform: 'translateX(0vw) scale(1)' },
              { transform: `translateX(${finalImageLeftVW}vw) scale(${maxScale})` },
              { transform: `translateX(${finalImageLeftVW}vw) scale(0)` },
            ],
          },
          rangeStart: { name: 'cover', offset: { value: pauseStartPercent, unit: 'percentage' } },
          rangeEnd: {
            name: 'cover',
            offset: { value: pauseStartPercent + 2 * panelDurationPercent, unit: 'percentage' },
          },
          easing: 'linear',
          fill: 'both',
        },
      ],
    },
    {
      key: '#scroll-section',
      trigger: 'viewProgress',
      effects: [
        {
          key: '#image2',
          keyframeEffect: {
            name: 'image2-lifecycle',
            keyframes: [
              { transform: 'translateX(0vw) scale(1)' },
              { transform: `translateX(${finalImageLeftVW}vw) scale(${maxScale})` },
              { transform: `translateX(${finalImageLeftVW}vw) scale(0)` },
            ],
          },
          rangeStart: {
            name: 'cover',
            offset: { value: pauseStartPercent + panelDurationPercent, unit: 'percentage' },
          },
          rangeEnd: {
            name: 'cover',
            offset: { value: pauseStartPercent + 3 * panelDurationPercent, unit: 'percentage' },
          },
          easing: 'linear',
          fill: 'both',
        },
      ],
    },
    {
      key: '#scroll-section',
      trigger: 'viewProgress',
      effects: [
        {
          key: '#image3',
          keyframeEffect: {
            name: 'image3-lifecycle',
            keyframes: [
              { transform: 'translateX(0vw) scale(1)' },
              { transform: `translateX(${finalImageLeftVW}vw) scale(${maxScale})` },
              { transform: `translateX(${finalImageLeftVW}vw) scale(0)` },
            ],
          },
          rangeStart: {
            name: 'cover',
            offset: { value: pauseStartPercent + 2 * panelDurationPercent, unit: 'percentage' },
          },
          rangeEnd: {
            name: 'cover',
            offset: { value: pauseStartPercent + 4 * panelDurationPercent, unit: 'percentage' },
          },
          easing: 'linear',
          fill: 'both',
        },
      ],
    },
    {
      key: '#scroll-section',
      trigger: 'viewProgress',
      effects: [
        {
          key: '#image4',
          keyframeEffect: {
            name: 'image4-scale-up',
            keyframes: [
              { transform: 'translateX(0vw) scale(1)' },
              { transform: `translateX(${finalImageLeftVW}vw) scale(${maxScale})` },
            ],
          },
          rangeStart: {
            name: 'cover',
            offset: { value: pauseStartPercent + 3 * panelDurationPercent, unit: 'percentage' },
          },
          rangeEnd: {
            name: 'cover',
            offset: { value: pauseStartPercent + 4 * panelDurationPercent, unit: 'percentage' },
          },
          easing: 'linear',
          fill: 'both',
        },
      ],
    },

    {
      key: '#scroll-section',
      trigger: 'viewProgress',
      effects: [
        {
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
            el.textContent = storyTexts[textIndex];
          },
          rangeStart: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
          fill: 'both',
        },
      ],
    },
  ],
};
```
