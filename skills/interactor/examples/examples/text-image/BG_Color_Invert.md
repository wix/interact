# BG Color Invert

A tall "About Us" section where the background flips from white to black mid-scroll, simultaneously inverting all text colors while four portrait images and parallax inner layers slide up in staggered phases driven by viewProgress.

**Tags:** viewProgress, parallax, stagger, fade, opacity, transform, reveal

## Markup

```html
<interact-element data-interact-key="section">
  <section class="about-section">

    <interact-element data-interact-key="bg">
      <div class="bg-layer"></div>
    </interact-element>

    <interact-element data-interact-key="img1" class="img-pos img-1-pos">
      <div class="scroll-image">
        <interact-element data-interact-key="img1-inner" class="img-inner">
          <img src="" />
        </interact-element>
      </div>
    </interact-element>

    <interact-element data-interact-key="img2" class="img-pos img-2-pos">
      <div class="scroll-image">
        <interact-element data-interact-key="img2-inner" class="img-inner">
          <img src="" />
        </interact-element>
      </div>
    </interact-element>

    <interact-element data-interact-key="img3" class="img-pos img-3-pos">
      <div class="scroll-image">
        <interact-element data-interact-key="img3-inner" class="img-inner">
          <img src="" />
        </interact-element>
      </div>
    </interact-element>

    <interact-element data-interact-key="img4" class="img-pos img-4-pos">
      <div class="scroll-image">
        <interact-element data-interact-key="img4-inner" class="img-inner">
          <img src="" />
        </interact-element>
      </div>
    </interact-element>

    <div class="text-layer">
      <interact-element data-interact-key="text1">
        <div class="small-text-left">
          <p>What started as a small idea in a cramped studio apartment has grown into something we never could have imagined.</p>
        </div>
      </interact-element>

      <interact-element data-interact-key="text2">
        <div class="small-text-right">
          <p>Founded in 2012, our company was born out of a simple belief: that great design and thoughtful technology could reshape the way people experience everyday life.</p>
        </div>
      </interact-element>

      <interact-element data-interact-key="big-text">
        <div class="big-text-area">
          <p>In those early days, it was just three of us — sketching wireframes on napkins, debating pixels over cold coffee, and chasing a vision that most people said was too ambitious. We didn't have investors or a roadmap. What we had was conviction.</p>
        </div>
      </interact-element>
    </div>

  </section>
</interact-element>
```

## Essential styles

```css
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

body {
    font-family: 'Vend Sans', sans-serif;
    background: #ffffff;
    color: #000000;
    -webkit-font-smoothing: antialiased;
}

interact-element { display: block; }

interact-element[data-interact-key="text1"] {
    margin-top: -10vh;
}

interact-element[data-interact-key="text2"] {
    margin-top: calc(35vh + 120px);
}

interact-element[data-interact-key="big-text"] {
    margin-top: calc(60vh - 30px);
}

.about-section {
    position: relative;
    min-height: 380vh;
    padding: 110vh 8vw 108vh;
    overflow: clip;
}

.bg-layer {
    position: absolute;
    inset: 0;
    background-color: #ffffff;
}

.img-pos {
    position: absolute;
    pointer-events: none;
    top: 0;
    aspect-ratio: 3 / 4;
}

.img-1-pos { right: 6vw;  width: 21vw; }
.img-2-pos { left: calc(7vw + 30px);   width: 26vw; }
.img-3-pos { right: 14vw; width: 34vw; }
.img-4-pos { left: 10vw;  width: 28vw; }

.scroll-image {
    width: 100%;
    height: 100%;
    border-radius: 0;
    overflow: clip;
    position: relative;
}

.scroll-image::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.18);
}

.img-inner {
    display: block;
    width: 100%;
    height: 250%;
}

.scroll-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.text-layer {
    position: relative;
    min-height: 180vh;
    padding: 0;
    display: flex;
    flex-direction: column;
}

.small-text-left {
    margin-left: 120px;
}

.small-text-left p {
    font-size: clamp(1.25rem, 1.48vw, 1.43rem);
    line-height: 1.19;
    font-weight: 400;
    max-width: 380px;
}

.small-text-right {
    margin-left: auto;
    margin-right: 150px;
    width: fit-content;
}

.small-text-right p {
    font-size: clamp(1.25rem, 1.48vw, 1.43rem);
    line-height: 1.19;
    font-weight: 400;
    max-width: 380px;
}

@media (max-width: 768px) {
    .img-1-pos { width: 34.1vw; }
    .img-2-pos { width: 42.3vw; }
    .img-3-pos { width: 44.2vw; top: -350px; }
    .img-4-pos { width: 36.4vw; top: calc(51vh - 550px); }

    .small-text-left { margin-left: 0; }
    .small-text-right { margin-right: 0; }

    interact-element[data-interact-key="big-text"] {
        margin-top: calc(45vh - 22px);
    }
}

.big-text-area p {
    font-family: 'Vend Sans', sans-serif;
    font-size: clamp(1.9rem, 4.2vw, 3.6rem);
    font-weight: 400;
    line-height: 1.18;
    letter-spacing: -0.01em;
}
```

## Interact config

```js
const isMobile = window.matchMedia('(max-width: 768px)').matches;

const cover = (s, e) => ({
    rangeStart: { name: 'cover', offset: { value: s, unit: 'percentage' } },
    rangeEnd:   { name: 'cover', offset: { value: e, unit: 'percentage' } }
});

const config = {
    interactions: [
        {
            key: 'section',
            trigger: 'viewProgress',
            effects: [
                {
                    key: 'bg',
                    keyframeEffect: {
                        name: 'bg-shift',
                        keyframes: [
                            { backgroundColor: '#ffffff', offset: 0 },
                            { backgroundColor: '#ffffff', offset: 0.415 },
                            { backgroundColor: '#000000', offset: 0.485 },
                            { backgroundColor: '#000000', offset: 1 }
                        ]
                    },
                    fill: 'both',
                    ...cover(0, 100)
                },
                {
                    key: 'text1',
                    keyframeEffect: {
                        name: 'c1',
                        keyframes: [
                            { color: '#000000', offset: 0 },
                            { color: '#000000', offset: 0.415 },
                            { color: '#ffffff', offset: 0.485 },
                            { color: '#ffffff', offset: 1 }
                        ]
                    },
                    fill: 'both',
                    ...cover(0, 100)
                },
                {
                    key: 'text2',
                    keyframeEffect: {
                        name: 'c2',
                        keyframes: [
                            { color: '#000000', offset: 0 },
                            { color: '#000000', offset: 0.415 },
                            { color: '#ffffff', offset: 0.485 },
                            { color: '#ffffff', offset: 1 }
                        ]
                    },
                    fill: 'both',
                    ...cover(0, 100)
                },
                {
                    key: 'big-text',
                    keyframeEffect: {
                        name: 'c3',
                        keyframes: [
                            { color: '#000000', offset: 0 },
                            { color: '#000000', offset: 0.415 },
                            { color: '#ffffff', offset: 0.485 },
                            { color: '#ffffff', offset: 1 }
                        ]
                    },
                    fill: 'both',
                    ...cover(0, 100)
                },
                {
                    key: 'img1',
                    keyframeEffect: {
                        name: 'p1',
                        keyframes: [
                            { opacity: 0, transform: 'translateY(145vh)',  offset: 0 },
                            { opacity: 0, transform: 'translateY(145vh)',  offset: 0.18 },
                            { opacity: 0, transform: 'translateY(120vh)',  offset: 0.26 },
                            { opacity: 0.5, transform: 'translateY(115vh)', offset: 0.275 },
                            { opacity: 1, transform: 'translateY(111vh)',  offset: 0.29 },
                            { opacity: 1, transform: 'translateY(58vh)',   offset: 0.46 },
                            { opacity: 1, transform: 'translateY(58vh)',   offset: 1 }
                        ]
                    },
                    fill: 'both',
                    ...cover(0, 100)
                },
                {
                    key: 'img2',
                    keyframeEffect: {
                        name: 'p2',
                        keyframes: [
                            { opacity: 0, transform: 'translateY(185vh)',  offset: 0 },
                            { opacity: 0, transform: 'translateY(185vh)',  offset: 0.30 },
                            { opacity: 0, transform: 'translateY(157vh)',  offset: 0.35 },
                            { opacity: 0.5, transform: 'translateY(148vh)', offset: 0.365 },
                            { opacity: 1, transform: 'translateY(140vh)',  offset: 0.38 },
                            { opacity: 1, transform: 'translateY(62vh)',   offset: 0.52 },
                            { opacity: 1, transform: 'translateY(62vh)',   offset: 1 }
                        ]
                    },
                    fill: 'both',
                    ...cover(0, 100)
                },
                {
                    key: 'img3',
                    keyframeEffect: {
                        name: 'p3',
                        keyframes: [
                            { opacity: 0, transform: 'translateY(240vh)',  offset: 0 },
                            { opacity: 0, transform: 'translateY(240vh)',  offset: 0.40 },
                            { opacity: 0, transform: 'translateY(216vh)',  offset: 0.48 },
                            { opacity: 0.5, transform: 'translateY(211vh)', offset: 0.495 },
                            { opacity: 1, transform: 'translateY(206vh)',  offset: 0.51 },
                            { opacity: 1, transform: 'translateY(167vh)',  offset: 0.64 },
                            { opacity: 1, transform: 'translateY(130vh)',  offset: 0.76 },
                            { opacity: 1, transform: 'translateY(130vh)',  offset: 1 }
                        ]
                    },
                    fill: 'both',
                    ...cover(0, 100)
                },
                {
                    key: 'img4',
                    keyframeEffect: {
                        name: 'p4',
                        keyframes: isMobile ? [
                            { opacity: 0, transform: 'translateY(300vh)',  offset: 0 },
                            { opacity: 0, transform: 'translateY(300vh)',  offset: 0.54 },
                            { opacity: 0, transform: 'translateY(262vh)',  offset: 0.65 },
                            { opacity: 0.5, transform: 'translateY(252vh)', offset: 0.68 },
                            { opacity: 1, transform: 'translateY(245vh)',  offset: 0.70 },
                            { opacity: 1, transform: 'translateY(231vh)',  offset: 0.74 },
                            { opacity: 1, transform: 'translateY(231vh)',  offset: 1 }
                        ] : [
                            { opacity: 0, transform: 'translateY(300vh)',  offset: 0 },
                            { opacity: 0, transform: 'translateY(300vh)',  offset: 0.54 },
                            { opacity: 0, transform: 'translateY(271vh)',  offset: 0.59 },
                            { opacity: 0.5, transform: 'translateY(262vh)', offset: 0.605 },
                            { opacity: 1, transform: 'translateY(254vh)',  offset: 0.62 },
                            { opacity: 1, transform: 'translateY(185vh)',  offset: 0.74 },
                            { opacity: 1, transform: 'translateY(185vh)',  offset: 1 }
                        ]
                    },
                    fill: 'both',
                    ...cover(0, 100)
                },
                {
                    key: 'img1-inner',
                    keyframeEffect: {
                        name: 'ip1',
                        keyframes: [
                            { transform: 'translateY(-36%)', offset: 0 },
                            { transform: 'translateY(0%)',   offset: 1 }
                        ]
                    },
                    fill: 'both',
                    ...cover(15, 75)
                },
                {
                    key: 'img2-inner',
                    keyframeEffect: {
                        name: 'ip2',
                        keyframes: [
                            { transform: 'translateY(-36%)', offset: 0 },
                            { transform: 'translateY(0%)',   offset: 1 }
                        ]
                    },
                    fill: 'both',
                    ...cover(15, 75)
                },
                {
                    key: 'img3-inner',
                    keyframeEffect: {
                        name: 'ip3',
                        keyframes: [
                            { transform: 'translateY(-26%)', offset: 0 },
                            { transform: 'translateY(0%)',   offset: 1 }
                        ]
                    },
                    fill: 'both',
                    ...cover(15, 75)
                },
                {
                    key: 'img4-inner',
                    keyframeEffect: {
                        name: 'ip4',
                        keyframes: [
                            { transform: 'translateY(-26%)', offset: 0 },
                            { transform: 'translateY(0%)',   offset: 1 }
                        ]
                    },
                    fill: 'both',
                    ...cover(15, 75)
                }
            ]
        }
    ]
};
```
