# Scroll 3D Animation

A scroll-driven animation for layered visual elements in a flex/carousel, layered composition, 3D scene layout. It uses transform to create the motion and transition between visual states.

**Tags:** trigger: viewProgress; layout: flex/carousel, layered composition, 3D scene; motion: transform

## Markup

```html
<wix-interact-element data-wix-path="intro-section">
  <section class="intro">
    <div class="text-block">
      <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">Title 01</h1>
      <p class="text-base md:text-lg leading-relaxed">
        Scroll-driven 3D animation with horizontal subtle movement.
      </p>
    </div>

    <wix-interact-element data-wix-path="panel-wrapper">
      <div class="panel-wrapper">
        <wix-interact-element data-wix-path="#panel-0"><div class="panel" id="panel-0"><img></div></wix-interact-element>
        <wix-interact-element data-wix-path="#panel-1"><div class="panel" id="panel-1"><img></div></wix-interact-element>
        <wix-interact-element data-wix-path="#panel-2"><div class="panel" id="panel-2"><img></div></wix-interact-element>
        <wix-interact-element data-wix-path="#panel-3"><div class="panel" id="panel-3"><img></div></wix-interact-element>
        <wix-interact-element data-wix-path="#panel-4"><div class="panel" id="panel-4"><img></div></wix-interact-element>
        <wix-interact-element data-wix-path="#panel-5"><div class="panel" id="panel-5"><img></div></wix-interact-element>
        <wix-interact-element data-wix-path="#panel-6"><div class="panel" id="panel-6"><img></div></wix-interact-element>
      </div>
    </wix-interact-element>
  </section>
</wix-interact-element>
```

## Essential styles

```css
:root { --panel-gap: 120; }

body {
  margin: 0;
  background: black;
  color: white;
  font-family: 'Inter', sans-serif;
  overflow-x: hidden;
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
  border-radius: 10px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
}

wix-interact-element {
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

      panel.style.width = `${45 + progress * 20}vw`;
      panel.style.height = `${30 + progress * 12}vw`;
      
      panel.style.translate = `0 0 calc(var(--panel-gap) * ${-i} * 1px)`;

      const scale = 0.75 + progress * 0.4;
      const xEnd = (i - (totalPanels - 1) / 2) * 20;

      const baseTransform = `scale(${scale})`;

      panelEffects.push({
        key: `#${panel.id}`, 
        keyframeEffect: {
          name: `panel-move-${i}`,
          keyframes: [
            { transform: `translateX(-50%) translateX(0px) ${baseTransform}` },
            { transform: `translateX(-50%) translateX(${xEnd}px) ${baseTransform}` }
          ]
        },
        
        rangeStart: { name: 'cover', offset: { type: 'percentage', value: 0 }},
        rangeEnd: { name: 'cover', offset: { type: 'percentage', value: 100 }},
        easing: 'linear', 
        fill: 'both'
      });
    });

const config = {
      interactions: [{
        key: 'intro-section', 
        trigger: 'viewProgress',
        effects: [
          
          {
            key: 'panel-wrapper',
            keyframeEffect: {
              name: 'wrapper-rotation',
              keyframes: [
                { transform: 'translateY(-50%) rotateY(-180deg)' },
                { transform: 'translateY(-50%) rotateY(0deg)' }
              ]
            },
            rangeStart: { name: 'cover', offset: { type: 'percentage', value: 0 }},
            rangeEnd: { name: 'cover', offset: { type: 'percentage', value: 50 }},
            easing: 'ease-out',
            fill: 'both'
          },
          
          ...panelEffects
        ]
      }]
    };
```
