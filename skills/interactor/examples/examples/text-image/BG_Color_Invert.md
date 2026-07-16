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
        <interact-element data-interact-key="img1-inner">
          <div class="img-inner"><img src="" alt="" /></div>
        </interact-element>
      </div>
    </interact-element>

    <interact-element data-interact-key="img2" class="img-pos img-2-pos">
      <div class="scroll-image">
        <interact-element data-interact-key="img2-inner">
          <div class="img-inner"><img src="" alt="" /></div>
        </interact-element>
      </div>
    </interact-element>

    <interact-element data-interact-key="img3" class="img-pos img-3-pos">
      <div class="scroll-image">
        <interact-element data-interact-key="img3-inner">
          <div class="img-inner"><img src="" alt="" /></div>
        </interact-element>
      </div>
    </interact-element>

    <interact-element data-interact-key="img4" class="img-pos img-4-pos">
      <div class="scroll-image">
        <interact-element data-interact-key="img4-inner">
          <div class="img-inner"><img src="" alt="" /></div>
        </interact-element>
      </div>
    </interact-element>

    <div class="text-layer">
      <interact-element data-interact-key="text1">
        <div class="small-text-left">
          <p>Sample text provides enough length to demonstrate this animated content layout.</p>
        </div>
      </interact-element>

      <interact-element data-interact-key="text2">
        <div class="small-text-right">
          <p>Sample text provides enough length to demonstrate this animated content layout.</p>
        </div>
      </interact-element>

      <interact-element data-interact-key="big-text">
        <div class="big-text-area">
          <p>Sample text provides enough length to demonstrate this animated content layout.</p>
        </div>
      </interact-element>
    </div>
  </section>
</interact-element>
```

## Essential styles

```css
interact-element {
  display: block;
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
}

.img-pos {
  position: absolute;
  top: 0;
  aspect-ratio: 3 / 4;
  pointer-events: none;
}

.img-1-pos {
  right: 6vw;
  width: 21vw;
}

.img-2-pos {
  left: 7vw;
  width: 26vw;
}

.img-3-pos {
  right: 14vw;
  width: 34vw;
}

.img-4-pos {
  left: 10vw;
  width: 28vw;
}

.scroll-image {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: clip;
}

.img-inner {
  width: 100%;
  height: 250%;
}

.scroll-image img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.text-layer {
  position: relative;
  min-height: 180vh;
  display: flex;
  flex-direction: column;
}

interact-element[data-interact-key='text2'] {
  margin-top: 35vh;
}

interact-element[data-interact-key='big-text'] {
  margin-top: 60vh;
}

.small-text-right {
  margin-left: auto;
}

@media (max-width: 768px) {
  .img-pos {
    width: 42vw;
  }

  interact-element[data-interact-key='big-text'] {
    margin-top: 45vh;
  }
}
```

## Interact config

```js
const cover = (s, e) => ({
  rangeStart: { name: 'cover', offset: { value: s, unit: 'percentage' } },
  rangeEnd: { name: 'cover', offset: { value: e, unit: 'percentage' } },
});

const config = {
  conditions: {
    desktop: { type: 'media', predicate: '(min-width: 769px)' },
    mobile: { type: 'media', predicate: '(max-width: 768px)' },
  },
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
              { backgroundColor: '#000000', offset: 1 },
            ],
          },
          fill: 'both',
          ...cover(0, 100),
        },
        {
          key: 'text1',
          keyframeEffect: {
            name: 'c1',
            keyframes: [
              { color: '#000000', offset: 0 },
              { color: '#000000', offset: 0.415 },
              { color: '#ffffff', offset: 0.485 },
              { color: '#ffffff', offset: 1 },
            ],
          },
          fill: 'both',
          ...cover(0, 100),
        },
        {
          key: 'text2',
          keyframeEffect: {
            name: 'c2',
            keyframes: [
              { color: '#000000', offset: 0 },
              { color: '#000000', offset: 0.415 },
              { color: '#ffffff', offset: 0.485 },
              { color: '#ffffff', offset: 1 },
            ],
          },
          fill: 'both',
          ...cover(0, 100),
        },
        {
          key: 'big-text',
          keyframeEffect: {
            name: 'c3',
            keyframes: [
              { color: '#000000', offset: 0 },
              { color: '#000000', offset: 0.415 },
              { color: '#ffffff', offset: 0.485 },
              { color: '#ffffff', offset: 1 },
            ],
          },
          fill: 'both',
          ...cover(0, 100),
        },
        {
          key: 'img1',
          keyframeEffect: {
            name: 'p1',
            keyframes: [
              { opacity: 0, transform: 'translateY(145vh)', offset: 0 },
              { opacity: 0, transform: 'translateY(145vh)', offset: 0.18 },
              { opacity: 0, transform: 'translateY(120vh)', offset: 0.26 },
              { opacity: 0.5, transform: 'translateY(115vh)', offset: 0.275 },
              { opacity: 1, transform: 'translateY(111vh)', offset: 0.29 },
              { opacity: 1, transform: 'translateY(58vh)', offset: 0.46 },
              { opacity: 1, transform: 'translateY(58vh)', offset: 1 },
            ],
          },
          fill: 'both',
          ...cover(0, 100),
        },
        {
          key: 'img2',
          keyframeEffect: {
            name: 'p2',
            keyframes: [
              { opacity: 0, transform: 'translateY(185vh)', offset: 0 },
              { opacity: 0, transform: 'translateY(185vh)', offset: 0.3 },
              { opacity: 0, transform: 'translateY(157vh)', offset: 0.35 },
              { opacity: 0.5, transform: 'translateY(148vh)', offset: 0.365 },
              { opacity: 1, transform: 'translateY(140vh)', offset: 0.38 },
              { opacity: 1, transform: 'translateY(62vh)', offset: 0.52 },
              { opacity: 1, transform: 'translateY(62vh)', offset: 1 },
            ],
          },
          fill: 'both',
          ...cover(0, 100),
        },
        {
          key: 'img3',
          keyframeEffect: {
            name: 'p3',
            keyframes: [
              { opacity: 0, transform: 'translateY(240vh)', offset: 0 },
              { opacity: 0, transform: 'translateY(240vh)', offset: 0.4 },
              { opacity: 0, transform: 'translateY(216vh)', offset: 0.48 },
              { opacity: 0.5, transform: 'translateY(211vh)', offset: 0.495 },
              { opacity: 1, transform: 'translateY(206vh)', offset: 0.51 },
              { opacity: 1, transform: 'translateY(167vh)', offset: 0.64 },
              { opacity: 1, transform: 'translateY(130vh)', offset: 0.76 },
              { opacity: 1, transform: 'translateY(130vh)', offset: 1 },
            ],
          },
          fill: 'both',
          ...cover(0, 100),
        },
        {
          key: 'img4',
          conditions: ['mobile'],
          keyframeEffect: {
            name: 'p4-mobile',
            keyframes: [
              { opacity: 0, transform: 'translateY(300vh)', offset: 0 },
              { opacity: 0, transform: 'translateY(300vh)', offset: 0.54 },
              { opacity: 0, transform: 'translateY(262vh)', offset: 0.65 },
              { opacity: 0.5, transform: 'translateY(252vh)', offset: 0.68 },
              { opacity: 1, transform: 'translateY(245vh)', offset: 0.7 },
              { opacity: 1, transform: 'translateY(231vh)', offset: 0.74 },
              { opacity: 1, transform: 'translateY(231vh)', offset: 1 },
            ],
          },
          fill: 'both',
          ...cover(0, 100),
        },
        {
          key: 'img4',
          conditions: ['desktop'],
          keyframeEffect: {
            name: 'p4-desktop',
            keyframes: [
              { opacity: 0, transform: 'translateY(300vh)', offset: 0 },
              { opacity: 0, transform: 'translateY(300vh)', offset: 0.54 },
              { opacity: 0, transform: 'translateY(271vh)', offset: 0.59 },
              { opacity: 0.5, transform: 'translateY(262vh)', offset: 0.605 },
              { opacity: 1, transform: 'translateY(254vh)', offset: 0.62 },
              { opacity: 1, transform: 'translateY(185vh)', offset: 0.74 },
              { opacity: 1, transform: 'translateY(185vh)', offset: 1 },
            ],
          },
          fill: 'both',
          ...cover(0, 100),
        },
        {
          key: 'img1-inner',
          keyframeEffect: {
            name: 'ip1',
            keyframes: [
              { transform: 'translateY(-36%)', offset: 0 },
              { transform: 'translateY(0%)', offset: 1 },
            ],
          },
          fill: 'both',
          ...cover(15, 75),
        },
        {
          key: 'img2-inner',
          keyframeEffect: {
            name: 'ip2',
            keyframes: [
              { transform: 'translateY(-36%)', offset: 0 },
              { transform: 'translateY(0%)', offset: 1 },
            ],
          },
          fill: 'both',
          ...cover(15, 75),
        },
        {
          key: 'img3-inner',
          keyframeEffect: {
            name: 'ip3',
            keyframes: [
              { transform: 'translateY(-26%)', offset: 0 },
              { transform: 'translateY(0%)', offset: 1 },
            ],
          },
          fill: 'both',
          ...cover(15, 75),
        },
        {
          key: 'img4-inner',
          keyframeEffect: {
            name: 'ip4',
            keyframes: [
              { transform: 'translateY(-26%)', offset: 0 },
              { transform: 'translateY(0%)', offset: 1 },
            ],
          },
          fill: 'both',
          ...cover(15, 75),
        },
      ],
    },
  ],
};
```
