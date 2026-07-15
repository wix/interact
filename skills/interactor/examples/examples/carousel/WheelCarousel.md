# Wheel Carousel

12 image cards arranged in a circle spin continuously on `viewEnter`, while hovering any card scales its image up slightly.

**Tags:** viewEnter, hover, carousel, loop, rotate, scale, transform

## Markup

```html
<section class="arc-viewport">
  <interact-element data-interact-key="#wheel">
    <div id="wheel" class="wheel">
      <interact-element data-interact-key="#card-1">
        <div id="card-1" class="card">
          <interact-element data-interact-key="#card-1-img">
            <img id="card-1-img" src="" />
          </interact-element>
        </div>
      </interact-element>

      <interact-element data-interact-key="#card-2">
        <div id="card-2" class="card">
          <interact-element data-interact-key="#card-2-img">
            <img id="card-2-img" src="" />
          </interact-element>
        </div>
      </interact-element>

      <interact-element data-interact-key="#card-3">
        <div id="card-3" class="card">
          <interact-element data-interact-key="#card-3-img">
            <img id="card-3-img" src="" />
          </interact-element>
        </div>
      </interact-element>

      <interact-element data-interact-key="#card-4">
        <div id="card-4" class="card">
          <interact-element data-interact-key="#card-4-img">
            <img id="card-4-img" src="" />
          </interact-element>
        </div>
      </interact-element>

      <interact-element data-interact-key="#card-5">
        <div id="card-5" class="card">
          <interact-element data-interact-key="#card-5-img">
            <img id="card-5-img" src="" />
          </interact-element>
        </div>
      </interact-element>

      <interact-element data-interact-key="#card-6">
        <div id="card-6" class="card">
          <interact-element data-interact-key="#card-6-img">
            <img id="card-6-img" src="" />
          </interact-element>
        </div>
      </interact-element>

      <interact-element data-interact-key="#card-7">
        <div id="card-7" class="card">
          <interact-element data-interact-key="#card-7-img">
            <img id="card-7-img" src="" />
          </interact-element>
        </div>
      </interact-element>

      <interact-element data-interact-key="#card-8">
        <div id="card-8" class="card">
          <interact-element data-interact-key="#card-8-img">
            <img id="card-8-img" src="" />
          </interact-element>
        </div>
      </interact-element>

      <interact-element data-interact-key="#card-9">
        <div id="card-9" class="card">
          <interact-element data-interact-key="#card-9-img">
            <img id="card-9-img" src="" />
          </interact-element>
        </div>
      </interact-element>

      <interact-element data-interact-key="#card-10">
        <div id="card-10" class="card">
          <interact-element data-interact-key="#card-10-img">
            <img id="card-10-img" src="" />
          </interact-element>
        </div>
      </interact-element>

      <interact-element data-interact-key="#card-11">
        <div id="card-11" class="card">
          <interact-element data-interact-key="#card-11-img">
            <img id="card-11-img" src="" />
          </interact-element>
        </div>
      </interact-element>

      <interact-element data-interact-key="#card-12">
        <div id="card-12" class="card">
          <interact-element data-interact-key="#card-12-img">
            <img id="card-12-img" src="" />
          </interact-element>
        </div>
      </interact-element>
    </div>
  </interact-element>
  <div class="fade-bottom"></div>
</section>

<section class="copy">
  <div class="headline">25% Off All<br />Top Rated Headphones</div>
  <div class="sub">Explore Limited Time Offers</div>
  <a class="cta" href="#">Get Started</a>
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
    background: #0a0a0f;
    color: #f0f0f5;
    font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
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
    background: linear-gradient(to right, #0a0a0f, transparent);
}
.arc-viewport::after {
    right: 0;
    background: linear-gradient(to left, #0a0a0f, transparent);
}

.fade-bottom {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 45%;
    background: linear-gradient(to top, #0a0a0f 8%, transparent);
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
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), 0 12px 40px rgba(0, 0, 0, 0.25);
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
    margin-left: calc((var(--r) * 0.866 - var(--cs) / 2) * 1vmin);
    margin-top: calc((var(--r) * 0.5 - var(--cs) / 2) * 1vmin);
    z-index: 150;
}
#card-3 {
    margin-left: calc((var(--r) * 0.5 - var(--cs) / 2) * 1vmin);
    margin-top: calc((var(--r) * 0.866 - var(--cs) / 2) * 1vmin);
    z-index: 187;
}
#card-4 {
    margin-left: calc((var(--r) * 0 - var(--cs) / 2) * 1vmin);
    margin-top: calc((var(--r) * 1 - var(--cs) / 2) * 1vmin);
    z-index: 200;
}
#card-5 {
    margin-left: calc((var(--r) * -0.5 - var(--cs) / 2) * 1vmin);
    margin-top: calc((var(--r) * 0.866 - var(--cs) / 2) * 1vmin);
    z-index: 187;
}
#card-6 {
    margin-left: calc((var(--r) * -0.866 - var(--cs) / 2) * 1vmin);
    margin-top: calc((var(--r) * 0.5 - var(--cs) / 2) * 1vmin);
    z-index: 150;
}
#card-7 {
    margin-left: calc((var(--r) * -1 - var(--cs) / 2) * 1vmin);
    margin-top: calc((var(--r) * 0 - var(--cs) / 2) * 1vmin);
    z-index: 100;
}
#card-8 {
    margin-left: calc((var(--r) * -0.866 - var(--cs) / 2) * 1vmin);
    margin-top: calc((var(--r) * -0.5 - var(--cs) / 2) * 1vmin);
    z-index: 50;
}
#card-9 {
    margin-left: calc((var(--r) * -0.5 - var(--cs) / 2) * 1vmin);
    margin-top: calc((var(--r) * -0.866 - var(--cs) / 2) * 1vmin);
    z-index: 13;
}
#card-10 {
    margin-left: calc((var(--r) * 0 - var(--cs) / 2) * 1vmin);
    margin-top: calc((var(--r) * -1 - var(--cs) / 2) * 1vmin);
    z-index: 0;
}
#card-11 {
    margin-left: calc((var(--r) * 0.5 - var(--cs) / 2) * 1vmin);
    margin-top: calc((var(--r) * -0.866 - var(--cs) / 2) * 1vmin);
    z-index: 13;
}
#card-12 {
    margin-left: calc((var(--r) * 0.866 - var(--cs) / 2) * 1vmin);
    margin-top: calc((var(--r) * -0.5 - var(--cs) / 2) * 1vmin);
    z-index: 50;
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
    background: #34d399;
    color: #042;
    border-radius: 12px;
    font-weight: 600;
    font-size: 15px;
    text-decoration: none;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.cta:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(52, 211, 153, 0.3);
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
                { key: "#card-1", effectId: "card-counter" },
                { key: "#card-2", effectId: "card-counter" },
                { key: "#card-3", effectId: "card-counter" },
                { key: "#card-4", effectId: "card-counter" },
                { key: "#card-5", effectId: "card-counter" },
                { key: "#card-6", effectId: "card-counter" },
                { key: "#card-7", effectId: "card-counter" },
                { key: "#card-8", effectId: "card-counter" },
                { key: "#card-9", effectId: "card-counter" },
                { key: "#card-10", effectId: "card-counter" },
                { key: "#card-11", effectId: "card-counter" },
                { key: "#card-12", effectId: "card-counter" },
            ],
        },
        {
            key: "#card-1",
            trigger: "hover",
            effects: [{ key: "#card-1-img", effectId: "img-hover", triggerType: "alternate" }],
        },
        {
            key: "#card-2",
            trigger: "hover",
            effects: [{ key: "#card-2-img", effectId: "img-hover", triggerType: "alternate" }],
        },
        {
            key: "#card-3",
            trigger: "hover",
            effects: [{ key: "#card-3-img", effectId: "img-hover", triggerType: "alternate" }],
        },
        {
            key: "#card-4",
            trigger: "hover",
            effects: [{ key: "#card-4-img", effectId: "img-hover", triggerType: "alternate" }],
        },
        {
            key: "#card-5",
            trigger: "hover",
            effects: [{ key: "#card-5-img", effectId: "img-hover", triggerType: "alternate" }],
        },
        {
            key: "#card-6",
            trigger: "hover",
            effects: [{ key: "#card-6-img", effectId: "img-hover", triggerType: "alternate" }],
        },
        {
            key: "#card-7",
            trigger: "hover",
            effects: [{ key: "#card-7-img", effectId: "img-hover", triggerType: "alternate" }],
        },
        {
            key: "#card-8",
            trigger: "hover",
            effects: [{ key: "#card-8-img", effectId: "img-hover", triggerType: "alternate" }],
        },
        {
            key: "#card-9",
            trigger: "hover",
            effects: [{ key: "#card-9-img", effectId: "img-hover", triggerType: "alternate" }],
        },
        {
            key: "#card-10",
            trigger: "hover",
            effects: [{ key: "#card-10-img", effectId: "img-hover", triggerType: "alternate" }],
        },
        {
            key: "#card-11",
            trigger: "hover",
            effects: [{ key: "#card-11-img", effectId: "img-hover", triggerType: "alternate" }],
        },
        {
            key: "#card-12",
            trigger: "hover",
            effects: [{ key: "#card-12-img", effectId: "img-hover", triggerType: "alternate" }],
        },
    ],
}
```
