# Corner Gallery

Fullscreen images reveal by scaling from a random corner on click or wheel scroll, with a slow Ken Burns pan-zoom effect and a film-grain projector overlay; text details fade in on hover.

**Tags:** click, hover, gallery, opacity, transform, scale, kenburns, sequential, reveal

## Markup

```html
<interact-element data-interact-key="container">
  <div id="collage-container">
    <div id="projector-overlay"></div>
    <div class="fragment" style="transform-origin: 0 0;transform: scale(1);transition: transform 0.9s cubic-bezier(0.25,1,0.5,1)">
      <div class="content-image kenburns kenburns-tr"></div>
      <div class="text-overlay">
        <h1>Explore Vistas</h1>
        <p>Click or Scroll to discover new images.</p>
      </div>
    </div>
    <div class="fragment" style="transform-origin: 100% 100%;transform: scale(0);transition: transform 1.1s cubic-bezier(0.25,1,0.5,1)">
      <div class="content-image kenburns kenburns-bl"></div>
      <div class="text-overlay">
        <h1>Explore Vistas</h1>
        <p>Click or Scroll to discover new images.</p>
      </div>
    </div>
    <div class="fragment" style="transform-origin: 50% 0;transform: scale(0);transition: transform 1.0s cubic-bezier(0.25,1,0.5,1)">
      <div class="content-image kenburns kenburns-br"></div>
      <div class="text-overlay">
        <h1>Explore Vistas</h1>
        <p>Click or Scroll to discover new images.</p>
      </div>
    </div>
  </div>
</interact-element>

<div id="progress-indicator">
  <div class="progress-dot active"></div>
  <div class="progress-dot"></div>
  <div class="progress-dot"></div>
</div>
```

## Essential styles

```css
html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

#collage-container {
    width: 100%;
    height: 100%;
    position: relative;
    cursor: pointer;
}

.fragment {
    position: absolute;
    overflow: hidden;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
}

.fragment .content-image {
    width: 100%;
    height: 100%;
}

.text-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 20px 40px;
    box-sizing: border-box;
    opacity: 0;
    transition: opacity 0.4s ease-in-out;
    pointer-events: none;
}

#collage-container:hover .text-overlay {
    opacity: 1;
}

.text-overlay h1 {
    margin: 0 0 5px 0;
    font-size: 2.5rem;
    font-weight: 900;
}

.text-overlay p {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 400;
}

@keyframes kenburns-tr {
    0% { transform: scale(1.0) translate(0, 0); }
    100% { transform: scale(1.25) translate(5%, -5%); }
}
@keyframes kenburns-br {
    0% { transform: scale(1.0) translate(0, 0); }
    100% { transform: scale(1.25) translate(5%, 5%); }
}
@keyframes kenburns-tl {
    0% { transform: scale(1.0) translate(0, 0); }
    100% { transform: scale(1.25) translate(-5%, -5%); }
}
@keyframes kenburns-bl {
    0% { transform: scale(1.0) translate(0, 0); }
    100% { transform: scale(1.25) translate(-5%, 5%); }
}

.content-image.kenburns {
    animation-duration: 15s;
    animation-timing-function: ease-out;
    animation-fill-mode: forwards;
}
.kenburns-tr { animation-name: kenburns-tr; }
.kenburns-br { animation-name: kenburns-br; }
.kenburns-tl { animation-name: kenburns-tl; }
.kenburns-bl { animation-name: kenburns-bl; }

#collage-container:hover .content-image.kenburns {
    animation-play-state: paused;
}

#progress-indicator {
    position: fixed;
    top: 50%;
    right: 25px;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 12px;
    z-index: 10;
}

.progress-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
    cursor: pointer;
}

.progress-dot.active {
    transform: scale(1.5);
}

#projector-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 5;
    opacity: 1;
    animation: flicker 0.15s infinite alternate;
}

@keyframes flicker {
    0% { opacity: 0.05; } 20% { opacity: 0.02; } 40% { opacity: 0.08; }
    60% { opacity: 0.01; } 80% { opacity: 0.06; } 100% { opacity: 0.03; }
}
```

## Interact config

```js
const fragments = /* select existing '.fragment' elements */ [];
const dots = /* select existing '.progress-dot' elements */ [];
let activeIndex = 0;

function initializeExistingGallery() {
  // Mark fragments[0] as visible.
  // Mark dots[0] as active.
}

function showExistingFragment(index) {
  // Scale fragments[activeIndex] to 0.
  // Scale fragments[index] to 1.
  // Move active class from dots[activeIndex] to dots[index].
  activeIndex = index;
}

function showNextExistingFragment() {
  showExistingFragment((activeIndex + 1) % fragments.length);
}

// Optional app handlers:
// on wheel or progress-dot activation, call showExistingFragment(index).

{
  interactions: [
    {
      key: 'container',
      trigger: 'viewEnter',
      effects: [{
        triggerType: 'once',
        duration: 0,
        customEffect: initializeExistingGallery,
      }],
    },
    {
      key: 'container',
      trigger: 'click',
      effects: [{
        triggerType: 'repeat',
        duration: 0,
        customEffect: showNextExistingFragment,
      }],
    },
  ],
}
```
