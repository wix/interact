# Wheel Carousel

Six image cards arranged in a circle spin continuously on `viewEnter`, while hovering any card scales its image up slightly.

**Tags:** viewEnter, hover, carousel, loop, rotate, scale, transform

## Markup

```html
<section class="arc-viewport">
  <interact-element data-interact-key="#wheel">
    <div id="wheel" class="wheel">
      <div id="card-1" class="card"><img src="" /></div>
      <div id="card-2" class="card"><img src="" /></div>
      <div id="card-3" class="card"><img src="" /></div>
      <div id="card-4" class="card"><img src="" /></div>
      <div id="card-5" class="card"><img src="" /></div>
      <div id="card-6" class="card"><img src="" /></div>
    </div>
  </interact-element>
  <div class="fade-bottom"></div>
</section>

<section class="copy">
  <div class="headline">Sample heading</div>
  <div class="sub">Sample text</div>
  <a class="cta" href="#">Action</a>
</section>
```

## Essential styles

```css
:root {
    --r: 65;
    --cs: 20;
    --cr: 16px;
}

* {
    box-sizing: border-box;
    margin: 0;
}

body {
    overflow-x: hidden;
    min-height: 100vh;
}

.arc-viewport {
    position: relative;
    width: 100%;
    height: 68vh;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: flex-start;
}

.arc-viewport::before,
.arc-viewport::after {
    content: "";
    position: absolute;
    top: 0;
    width: 14%;
    height: 100%;
    z-index: 10;
    pointer-events: none;
}
.arc-viewport::before {
    left: 0;
}
.arc-viewport::after {
    right: 0;
}

.fade-bottom {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 45%;
    z-index: 10;
    pointer-events: none;
}

.wheel {
    position: relative;
    width: calc(var(--r) * 2vmin + var(--cs) * 1vmin);
    height: calc(var(--r) * 2vmin + var(--cs) * 1vmin);
    transform-origin: center center;
    margin-top: 10vh;
    flex-shrink: 0;
}

interact-element {
    display: contents;
}

.card {
    position: absolute;
    width: calc(var(--cs) * 1vmin);
    height: calc(var(--cs) * 1vmin);
    left: 50%;
    top: 50%;
    border-radius: var(--cr);
    overflow: hidden;
    transform-origin: center center;
}

.card img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

#card-1 {
    margin-left: calc((var(--r) * 1 - var(--cs) / 2) * 1vmin);
    margin-top: calc((var(--r) * 0 - var(--cs) / 2) * 1vmin);
    z-index: 100;
}
#card-2 {
    margin-left: calc((var(--r) * 0.5 - var(--cs) / 2) * 1vmin);
    margin-top: calc((var(--r) * 0.866 - var(--cs) / 2) * 1vmin);
    z-index: 187;
}
#card-3 {
    margin-left: calc((var(--r) * -0.5 - var(--cs) / 2) * 1vmin);
    margin-top: calc((var(--r) * 0.866 - var(--cs) / 2) * 1vmin);
    z-index: 187;
}
#card-4 {
    margin-left: calc((var(--r) * -1 - var(--cs) / 2) * 1vmin);
    margin-top: calc((var(--r) * 0 - var(--cs) / 2) * 1vmin);
    z-index: 100;
}
#card-5 {
    margin-left: calc((var(--r) * -0.5 - var(--cs) / 2) * 1vmin);
    margin-top: calc((var(--r) * -0.866 - var(--cs) / 2) * 1vmin);
    z-index: 13;
}
#card-6 {
    margin-left: calc((var(--r) * 0.5 - var(--cs) / 2) * 1vmin);
    margin-top: calc((var(--r) * -0.866 - var(--cs) / 2) * 1vmin);
    z-index: 13;
}

.copy {
    text-align: center;
    padding: 0 1.5rem 5rem;
    position: relative;
    z-index: 20;
    margin-top: -10vh;
}

.headline {
    font-size: clamp(26px, 4.5vw, 56px);
    font-weight: 300;
    letter-spacing: -0.01em;
    line-height: 1.15;
}

.sub {
    opacity: 0.55;
    margin-top: 12px;
    font-size: clamp(13px, 1.6vw, 17px);
    font-weight: 400;
}

.cta {
    display: inline-block;
    margin-top: 24px;
    padding: 14px 26px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 15px;
    transition: transform 0.15s ease;
}
.cta:hover {
    transform: translateY(-1px);
}
.cta:active {
    transform: translateY(1px);
}

@media (max-width: 768px) {
    :root {
        --r: 22;
        --cs: 12;
    }
    .arc-viewport {
        height: 58vh;
    }
    .wheel {
        margin-top: 8vh;
    }
    .copy {
        margin-top: -8vh;
    }
}

@media (max-width: 480px) {
    :root {
        --r: 18;
        --cs: 10;
    }
    .arc-viewport {
        height: 50vh;
    }
    .wheel {
        margin-top: 6vh;
    }
    .copy {
        margin-top: -5vh;
    }
}
```

## Interact config

```js
{
    effects: {
        "wheel-spin": {
            keyframeEffect: {
                name: "wheel-spin-kf",
                keyframes: [
                    { transform: "rotate(0deg)" },
                    { transform: "rotate(360deg)" },
                ],
            },
            duration: 30000,
            iterations: Infinity,
            easing: "linear",
        },
        "card-counter": {
            keyframeEffect: {
                name: "card-counter-kf",
                keyframes: [
                    { transform: "rotate(0deg)" },
                    { transform: "rotate(-360deg)" },
                ],
            },
            duration: 30000,
            iterations: Infinity,
            easing: "linear",
        },
        "img-hover": {
            keyframeEffect: {
                name: "img-hover-kf",
                keyframes: [
                    { transform: "scale(1)" },
                    { transform: "scale(1.1)" },
                ],
            },
            duration: 250,
            easing: "ease-out",
            fill: "both",
        },
    },
    interactions: [
        {
            key: "#wheel",
            trigger: "viewEnter",
            effects: [
                { key: "#wheel", effectId: "wheel-spin" },
                { selector: ".card", effectId: "card-counter" },
            ],
        },
        {
            key: "#wheel",
            trigger: "hover",
            listContainer: ".card",
            effects: [{ selector: "img", effectId: "img-hover", triggerType: "alternate" }],
        },
    ],
}
```
