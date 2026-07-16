# Scroll 3D Animation

Seven landscape panels arranged in a 3D z-depth stack rotate into view as the user scrolls, then fan out horizontally across the screen.

**Tags:** viewProgress, 3d, rotate, transform, stagger, scroll

## Markup

```html
<interact-element data-interact-key="intro-section">
  <section class="intro">
    <div class="text-block">
      <h1>Title 01</h1>
      <p>Scroll-driven 3D animation with horizontal subtle movement.</p>
    </div>

    <interact-element data-interact-key="panel-wrapper">
      <div class="panel-wrapper">
        <interact-element data-interact-key="#panel-0">
          <div class="panel" id="panel-0" style="width:45vw;height:30vw;">
            <img src="" />
          </div>
        </interact-element>
        <interact-element data-interact-key="#panel-1">
          <div class="panel" id="panel-1" style="width:48.3vw;height:32vw;">
            <img src="" />
          </div>
        </interact-element>
        <interact-element data-interact-key="#panel-2">
          <div class="panel" id="panel-2" style="width:51.7vw;height:34vw;">
            <img src="" />
          </div>
        </interact-element>
        <interact-element data-interact-key="#panel-3">
          <div class="panel" id="panel-3" style="width:55vw;height:36vw;">
            <img src="" />
          </div>
        </interact-element>
        <interact-element data-interact-key="#panel-4">
          <div class="panel" id="panel-4" style="width:58.3vw;height:38vw;">
            <img src="" />
          </div>
        </interact-element>
        <interact-element data-interact-key="#panel-5">
          <div class="panel" id="panel-5" style="width:61.7vw;height:40vw;">
            <img src="" />
          </div>
        </interact-element>
        <interact-element data-interact-key="#panel-6">
          <div class="panel" id="panel-6" style="width:65vw;height:42vw;">
            <img src="" />
          </div>
        </interact-element>
      </div>
    </interact-element>
  </section>
</interact-element>
```

## Essential styles

```css
:root {
  --panel-gap: 120;
}

body {
  margin: 0;
  overflow-x: clip;
}

.intro {
  height: 300vh;
  position: relative;
  padding: 20px;
}

.text-block {
  position: fixed;
  top: 50%;
  left: 3%;
  transform: translateY(-50%);
  z-index: 10;
  width: 18%;
  min-width: 200px;
}

.panel-wrapper {
  position: fixed;
  top: 50%;
  left: calc(3% + 18% + 1%);
  transform: translateY(-50%);
  perspective: 2000px;
  transform-style: preserve-3d;
  display: flex;
  justify-content: center;
  align-items: center;
  width: calc(100% - (3% + 18% + 4%));
}

.panel {
  position: absolute;
  left: 50%;
  transform-style: preserve-3d;
  transform: translateX(-50%);
}

.panel img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

interact-element {
  display: contents;
}

@media (max-width: 1280px) {
  .text-block {
    position: static;
    width: 90%;
    margin: 20px auto 10px;
    text-align: center;
    transform: none;
  }

  .panel-wrapper {
    position: static;
    perspective: none;
    transform: none;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .panel {
    position: relative;
    left: auto;
    width: 90%;
    height: auto;
    max-width: 700px;
    transform: none;
  }
}
```

## Interact config

```js
const panels = Array.from(document.querySelectorAll('.panel'));
const totalPanels = panels.length;
const panelEffects = [];

panels.forEach((panel, i) => {
  const progress = totalPanels > 1 ? i / (totalPanels - 1) : 1;
  const scale = 0.75 + progress * 0.4;
  const xEnd = (i - (totalPanels - 1) / 2) * 20;
  const baseTransform = `scale(${scale})`;

  panelEffects.push({
    key: `#${panel.id}`,
    keyframeEffect: {
      name: `panel-move-${i}`,
      keyframes: [
        { transform: `translateX(-50%) translateX(0px) ${baseTransform}` },
        { transform: `translateX(-50%) translateX(${xEnd}px) ${baseTransform}` },
      ],
    },
    rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 0 } },
    rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 100 } },
    easing: 'linear',
    fill: 'both',
  });
});

const config = {
  interactions: [
    {
      key: 'intro-section',
      trigger: 'viewProgress',
      effects: [
        {
          key: 'panel-wrapper',
          keyframeEffect: {
            name: 'wrapper-rotation',
            keyframes: [
              { transform: 'translateY(-50%) rotateY(-180deg)' },
              { transform: 'translateY(-50%) rotateY(0deg)' },
            ],
          },
          rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 0 } },
          rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 50 } },
          easing: 'ease-out',
          fill: 'both',
        },
        ...panelEffects,
      ],
    },
  ],
};
```
