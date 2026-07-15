# Scroll Mask Reveal

As the page scrolls, inline image thumbnails embedded within a sticky text block reveal horizontally by animating their `max-width`, `margin-right`, and `opacity` from hidden to visible, creating a staggered masked photo-reveal effect woven between words.

**Tags:** viewProgress, sticky, opacity, reveal, stagger, mask, inline-image

## Markup

```html
<interact-element data-interact-key="scroll-track">
    <main class="track">
        <section class="sticky-content">

            <p class="sr-only">
                Visual storytelling creates a deep and lasting impact on the soul.
                Good design moves us forward, while rhythm guides the eye.
                Every pixel matters in the end result.
            </p>

            <article class="text-block" aria-hidden="true">

                <span class="italic-text">Visual</span>
                <span>storytelling</span>
                <interact-element data-interact-key="mask-1">
                    <div class="image-mask">
                        <img src="https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=400&auto=format&fit=crop" alt="">
                    </div>
                </interact-element>
                <span>creates</span>
                <span>a</span>
                <span>deep</span>
                <interact-element data-interact-key="mask-2">
                    <div class="image-mask">
                        <img src="https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?q=80&w=400&auto=format&fit=crop" alt="">
                    </div>
                </interact-element>
                <span>and</span>
                <span>lasting</span>
                <span>impact</span>
                <interact-element data-interact-key="mask-3">
                    <div class="image-mask">
                        <img src="https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=400&auto=format&fit=crop" alt="">
                    </div>
                </interact-element>
                <span>on</span>
                <span>the</span>
                <span>soul.</span>
                <span>Good</span>
                <span>design</span>
                <interact-element data-interact-key="mask-4">
                    <div class="image-mask">
                        <img src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=400&auto=format&fit=crop" alt="">
                    </div>
                </interact-element>
                <span>moves</span>
                <span>us</span>
                <span>forward,</span>
                <interact-element data-interact-key="mask-5">
                    <div class="image-mask">
                        <img src="https://images.unsplash.com/photo-1533158326339-7f3cf2404354?q=80&w=400&auto=format&fit=crop" alt="">
                    </div>
                </interact-element>
                <span>while</span>
                <span class="italic-text">rhythm</span>
                <span>guides</span>
                <interact-element data-interact-key="mask-6">
                    <div class="image-mask">
                        <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=400&auto=format&fit=crop" alt="">
                    </div>
                </interact-element>
                <span>the</span>
                <span>eye.</span>
                <span>Every</span>
                <interact-element data-interact-key="mask-7">
                    <div class="image-mask">
                        <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop" alt="">
                    </div>
                </interact-element>
                <span>pixel</span>
                <span>matters</span>
                <span>in</span>
                <span>the</span>
                <span>end</span>
                <interact-element data-interact-key="mask-8">
                    <div class="image-mask">
                        <img src="https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=400&auto=format&fit=crop" alt="">
                    </div>
                </interact-element>
                <span>result.</span>

            </article>
        </section>
    </main>
</interact-element>
```

## Essential styles

```css
body {
    margin: 0;
    background-color: #ffffff;
    color: #000;
    font-family: 'Fraunces', serif;
    font-weight: 300;
    overflow-x: hidden;
}

.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
}

.track {
    height: 600vh;
    position: relative;
}

.sticky-content {
    position: sticky;
    top: 0;
    height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    overflow: hidden;
    background: linear-gradient(to bottom right, #ffffff, #e0f2fe);
    padding-top: 15vh;
    padding-left: 5vw;
    padding-right: 5vw;
    box-sizing: border-box;
}

.text-block {
    display: block;
    text-align: left;
    font-size: max(30px, 3.5vw);
    line-height: 1.6;
    letter-spacing: 0.02em;
    max-width: 100%;
}

@media (max-width: 768px) {
    .text-block {
        font-size: max(30px, 3.5vw);
        line-height: 1.84;
    }
}

.text-block span {
    margin-right: 0.25em;
    display: inline-block;
}

.italic-text {
    font-style: italic;
    font-weight: 300;
}

interact-element {
    display: inline;
}

.image-mask {
    height: 1.2em;
    overflow: hidden;
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    vertical-align: middle;
    max-width: 0px;
    margin-right: 0px;
    opacity: 0;
    position: relative;
    top: -0.1em;
    will-change: max-width, margin-right, opacity;
}

@media (max-width: 768px) {
    .image-mask {
        height: 1.38em;
    }
}

@media (prefers-reduced-motion: reduce) {
    .image-mask {
        opacity: 1 !important;
        margin-right: 0.4em !important;
        max-width: 125px !important;
        transition: none !important;
    }

    @media (max-width: 768px) {
        .image-mask {
            max-width: 25px !important;
        }
    }
}

.image-mask img {
    height: 100%;
    width: auto;
    min-width: 180px;
    object-fit: cover;
    object-position: left center;
}
```

## Interact config

```js
const isMobile = window.innerWidth < 768;
const revealWidth = isMobile ? '25px' : '125px';

const leftRevealKeyframes = [
    { maxWidth: '0px', marginRight: '0px', opacity: 0 },
    { maxWidth: revealWidth, marginRight: '0.4em', opacity: 1 }
];

const createEffect = (key, startOffset, endOffset) => ({
    key,
    fill: 'both',
    rangeStart: { name: 'cover', offset: { value: startOffset, unit: 'percentage' } },
    rangeEnd: { name: 'cover', offset: { value: endOffset, unit: 'percentage' } },
    keyframeEffect: {
        name: `reveal-${key}`,
        keyframes: leftRevealKeyframes
    }
});

const config = {
    interactions: [
        {
            key: 'scroll-track',
            trigger: 'viewProgress',
            effects: [
                createEffect('mask-1', 15, 25),
                createEffect('mask-2', 23, 33),
                createEffect('mask-3', 31, 41),
                createEffect('mask-4', 39, 49),
                createEffect('mask-5', 47, 57),
                createEffect('mask-6', 55, 65),
                createEffect('mask-7', 63, 73),
                createEffect('mask-8', 71, 81)
            ]
        }
    ]
};
```
