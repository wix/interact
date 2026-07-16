# Looping Sphere Gallery

A 3D sphere composed of image cards rotates continuously via CSS animation while scrolling drives a camera zoom that flies through the sphere, with an overlay fade keyed to scroll progress.

**Tags:** viewProgress, hover, gallery, 3d, loop, transform, opacity, rotate, scale

## Markup

```html
<div class="hint">SCROLL TO ZOOM · HOVER TO INSPECT</div>

<div class="viewport">
  <interact-element data-interact-key="scene">
    <div class="scene">
      <div class="sphere">
        <div
          class="item"
          style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(0.0px) translateY(500.0px) translateZ(0.0px) rotateY(0.0deg) rotateX(-90.0deg)"
        >
          <div class="item-content">
            <div class="face front">
              <div class="overlay"></div>
              <h3>CYBER CORE</h3>
            </div>
            <div class="face back">
              <div class="overlay"></div>
              <h3>SYSTEM 00</h3>
            </div>
          </div>
        </div>
        <div
          class="item"
          style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(242.6px) translateY(409.1px) translateZ(-154.3px) rotateY(122.5deg) rotateX(-54.9deg)"
        >
          <div class="item-content">
            <div class="face front">
              <div class="overlay"></div>
              <h3>ABSTRACT A</h3>
            </div>
            <div class="face back">
              <div class="overlay"></div>
              <h3>SYSTEM 05</h3>
            </div>
          </div>
        </div>
        <div
          class="item"
          style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(163.5px) translateY(318.2px) translateZ(-349.3px) rotateY(154.9deg) rotateX(-39.5deg)"
        >
          <div class="item-content">
            <div class="face front">
              <div class="overlay"></div>
              <h3>DATA MESH</h3>
            </div>
            <div class="face back">
              <div class="overlay"></div>
              <h3>SYSTEM 10</h3>
            </div>
          </div>
        </div>
        <div
          class="item"
          style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(-169.2px) translateY(-9.1px) translateZ(-470.4px) rotateY(-160.2deg) rotateX(1.0deg)"
        >
          <div class="item-content">
            <div class="face front">
              <div class="overlay"></div>
              <h3>DEEP SPACE</h3>
            </div>
            <div class="face back">
              <div class="overlay"></div>
              <h3>SYSTEM 28</h3>
            </div>
          </div>
        </div>
        <div
          class="item"
          style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(-334.3px) translateY(-336.4px) translateZ(-158.4px) rotateY(-115.4deg) rotateX(42.3deg)"
        >
          <div class="item-content">
            <div class="face front">
              <div class="overlay"></div>
              <h3>DATA MESH</h3>
            </div>
            <div class="face back">
              <div class="overlay"></div>
              <h3>SYSTEM 46</h3>
            </div>
          </div>
        </div>
        <div
          class="item"
          style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(0.0px) translateY(-500.0px) translateZ(0.0px) rotateY(0.0deg) rotateX(90.0deg)"
        >
          <div class="item-content">
            <div class="face front">
              <div class="overlay"></div>
              <h3>NATURE X</h3>
            </div>
            <div class="face back">
              <div class="overlay"></div>
              <h3>SYSTEM 55</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  </interact-element>
</div>

<interact-element data-interact-key="zoom-track">
  <div class="zoom-track"></div>
</interact-element>
```

## Essential styles

```css
html,
body {
  margin: 0;
  scrollbar-width: none;
}
html::-webkit-scrollbar,
body::-webkit-scrollbar {
  display: none;
}

.viewport {
  position: fixed;
  inset: 0;
  perspective: 800px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

interact-element[data-interact-key='scene'] {
  display: block;
  transform-style: preserve-3d;
}

interact-element[data-interact-key='zoom-track'] {
  display: block;
}

.zoom-track {
  height: 500vh;
}

.scene {
  position: relative;
  transform-style: preserve-3d;
  width: 0;
  height: 0;
}

.sphere {
  position: absolute;
  transform-style: preserve-3d;
  width: 0;
  height: 0;
  animation: spinSphere 40s linear infinite;
}

@keyframes spinSphere {
  from {
    transform: rotateY(0deg);
  }
  to {
    transform: rotateY(360deg);
  }
}

.sphere:has(.item:hover) {
  animation-play-state: paused;
}

.item {
  position: absolute;
  transform-style: preserve-3d;
  cursor: pointer;
  pointer-events: auto;
}

.item:hover {
  z-index: 10;
}

.item-content {
  width: 200%;
  height: 200%;
  position: absolute;
  left: -50%;
  top: -50%;
  transform-style: preserve-3d;
  scale: 0.5;
  transition: scale 0.3s ease-out;
}

.item:hover .item-content {
  scale: 0.575;
}

.face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  text-align: center;
  overflow: hidden;
  padding-bottom: 16px;
}

.face.front .overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50%;
  pointer-events: none;
  transition: height 0.3s;
}

.item:hover .face.front .overlay {
  height: 80%;
}

.face.front h3 {
  position: relative;
  z-index: 2;
  margin: 0;
  font-size: 24px;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 2px;
  opacity: 0;
  transition: opacity 0.3s;
}

.item:hover .face h3 {
  opacity: 1;
}

.face.back {
  transform: rotateY(180deg);
}

.face.back .overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.face.back h3 {
  position: relative;
  z-index: 2;
  margin: 0;
  font-size: 20px;
  letter-spacing: 4px;
  opacity: 0;
  transition: opacity 0.3s;
}

.hint {
  position: fixed;
  top: 20px;
  left: 20px;
  font-size: 12px;
  pointer-events: none;
  z-index: 100;
}

@media (max-width: 600px) {
  .hud-controls {
    flex-wrap: wrap;
    justify-content: center;
    width: 90%;
    gap: 10px;
  }
}
```

## Interact config

```js
{
  interactions: [
    {
      key: 'zoom-track',
      trigger: 'viewProgress',
      effects: [
        {
          key: 'scene',
          fill: 'both',
          rangeStart: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
          keyframeEffect: {
            name: 'zoom-scene',
            keyframes: [
              { transform: 'translateZ(1200px)' },
              { transform: 'translateZ(0px)' },
              { transform: 'translateZ(-1200px)' },
            ],
          },
        },
        {
          key: 'scene',
          selector: '.overlay',
          fill: 'both',
          rangeStart: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
          keyframeEffect: {
            name: 'overlay-fade',
            keyframes: [
              { opacity: 0, offset: 0 },
              { opacity: 1, offset: 0.35 },
              { opacity: 1, offset: 1 },
            ],
          },
        },
      ],
    },
  ];
}
```
