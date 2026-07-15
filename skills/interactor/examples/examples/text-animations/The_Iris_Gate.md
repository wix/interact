# The Iris Gate

Four triangular white mask panels slide inward from all four edges as the user scrolls, closing like an iris shutter to obscure the initial bold headline and reveal a softer italic message underneath.

**Tags:** viewProgress, sticky, clip-path, transform, opacity, reveal, stagger

## Markup

```html
<div class="scroll-hint">Scroll down for symmetry</div>

<interact-element data-interact-key="scroll-scene">
    <div class="scroll-wrapper">
        <div class="sticky-container">

            <interact-element data-interact-key="center-dot">
                <div class="center-fix"></div>
            </interact-element>

            <interact-element data-interact-key="mask-L">
                <div class="mask mask-left"></div>
            </interact-element>
            <interact-element data-interact-key="mask-R">
                <div class="mask mask-right"></div>
            </interact-element>
            <interact-element data-interact-key="mask-T">
                <div class="mask mask-top"></div>
            </interact-element>
            <interact-element data-interact-key="mask-B">
                <div class="mask mask-bottom"></div>
            </interact-element>

            <div class="text-container">
                <interact-element data-interact-key="primary-text">
                    <div class="text text-1">
                        CHANGE<br>MINDS.
                    </div>
                </interact-element>
                <interact-element data-interact-key="secondary-text">
                    <div class="text text-2">
                        Start with<br>your own.
                    </div>
                </interact-element>
            </div>

        </div>
    </div>
</interact-element>
```

## Essential styles

```css
:root {
    --bg-color: #000000;
    --mask-color: #ffffff;
    --text-primary: #ffffff;
    --text-secondary: #000000;
    --mask-size: 160vmax;
}

body {
    margin: 0;
    background-color: var(--bg-color);
    overflow-x: clip;
    -webkit-font-smoothing: antialiased;
}

.scroll-wrapper {
    height: 1200vh;
    position: relative;
}

.sticky-container {
    position: sticky;
    top: 0;
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: clip;
    background-color: var(--bg-color);
}

.center-fix {
    position: absolute;
    width: 12px;
    height: 12px;
    background: var(--mask-color);
    z-index: 15;
    border-radius: 50%;
    opacity: 0;
    pointer-events: none;
}

.mask {
    position: absolute;
    width: var(--mask-size);
    height: var(--mask-size);
    background-color: var(--mask-color);
    z-index: 10;
    top: 50%;
    left: 50%;
    margin-left: calc(var(--mask-size) / -2);
    margin-top: calc(var(--mask-size) / -2);
    outline: 1px solid transparent;
    pointer-events: none;
    will-change: transform;
}

.mask-left { clip-path: polygon(0% 0%, 50% 50%, 0% 100%); }
.mask-right { clip-path: polygon(100% 0%, 100% 100%, 50% 50%); }
.mask-top { clip-path: polygon(0% 0%, 100% 0%, 50% 50%); }
.mask-bottom { clip-path: polygon(0% 100%, 50% 50%, 100% 100%); }

.text-container {
    position: relative;
    z-index: 20;
    text-align: center;
    width: 85%;
    max-width: 1200px;
}

.text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    pointer-events: none;
    will-change: opacity, transform;
}

.text-1 {
    font-family: 'Oswald', sans-serif;
    font-size: clamp(2.5rem, 14vw, 10rem);
    line-height: 0.85;
    text-transform: uppercase;
    color: var(--text-primary);
    letter-spacing: -0.04em;
}

.text-2 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.25rem, 6vw, 4.5rem);
    color: var(--text-secondary);
    line-height: 1.1;
    font-weight: 400;
    font-style: italic;
    opacity: 0;
}

.scroll-hint {
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.7rem;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
    z-index: 50;
    pointer-events: none;
    font-family: sans-serif;
    text-align: center;
    width: 100%;
}
```

## Interact config

```js
{
    effects: {
        'shutter-L': {
            key: 'mask-L',
            fill: 'both',
            composite: 'replace',
            rangeStart: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
            rangeEnd: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
            keyframeEffect: {
                name: 'close-L',
                keyframes: [
                    { offset: 0.0, transform: 'translateX(-85vmax) scale(1.1)' },
                    { offset: 0.85, transform: 'translateX(0px) scale(1.1)' },
                    { offset: 1.0, transform: 'translateX(10px) scale(1.1)' }
                ]
            }
        },
        'shutter-R': {
            key: 'mask-R',
            fill: 'both',
            composite: 'replace',
            rangeStart: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
            rangeEnd: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
            keyframeEffect: {
                name: 'close-R',
                keyframes: [
                    { offset: 0.0, transform: 'translateX(85vmax) scale(1.1)' },
                    { offset: 0.85, transform: 'translateX(0px) scale(1.1)' },
                    { offset: 1.0, transform: 'translateX(-10px) scale(1.1)' }
                ]
            }
        },
        'shutter-T': {
            key: 'mask-T',
            fill: 'both',
            composite: 'replace',
            rangeStart: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
            rangeEnd: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
            keyframeEffect: {
                name: 'close-T',
                keyframes: [
                    { offset: 0.0, transform: 'translateY(-85vmax) scale(1.1)' },
                    { offset: 0.85, transform: 'translateY(0px) scale(1.1)' },
                    { offset: 1.0, transform: 'translateY(10px) scale(1.1)' }
                ]
            }
        },
        'shutter-B': {
            key: 'mask-B',
            fill: 'both',
            composite: 'replace',
            rangeStart: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
            rangeEnd: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
            keyframeEffect: {
                name: 'close-B',
                keyframes: [
                    { offset: 0.0, transform: 'translateY(85vmax) scale(1.1)' },
                    { offset: 0.85, transform: 'translateY(0px) scale(1.1)' },
                    { offset: 1.0, transform: 'translateY(-10px) scale(1.1)' }
                ]
            }
        },
        'fade-text-1': {
            key: 'primary-text',
            fill: 'both',
            rangeStart: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
            rangeEnd: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
            keyframeEffect: {
                name: 'out-1',
                keyframes: [
                    { offset: 0.0, opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
                    { offset: 0.75, opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
                    { offset: 0.82, opacity: 0, transform: 'translate(-50%, -50%) scale(0.85)' },
                    { offset: 1.0, opacity: 0, transform: 'translate(-50%, -50%) scale(0.85)' }
                ]
            }
        },
        'fade-text-2': {
            key: 'secondary-text',
            fill: 'both',
            rangeStart: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
            rangeEnd: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
            keyframeEffect: {
                name: 'in-2',
                keyframes: [
                    { offset: 0.0, opacity: 0, transform: 'translate(-50%, -50%) scale(1.2)' },
                    { offset: 0.85, opacity: 0, transform: 'translate(-50%, -50%) scale(1.2)' },
                    { offset: 0.95, opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
                    { offset: 1.0, opacity: 1, transform: 'translate(-50%, -50%) scale(1)' }
                ]
            }
        },
        'center-dot-reveal': {
            key: 'center-dot',
            fill: 'both',
            rangeStart: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
            rangeEnd: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
            keyframeEffect: {
                name: 'dot-in',
                keyframes: [
                    { offset: 0.0, opacity: 0 },
                    { offset: 0.7, opacity: 0 },
                    { offset: 0.82, opacity: 1 },
                    { offset: 1.0, opacity: 1 }
                ]
            }
        }
    },
    interactions: [
        {
            key: 'scroll-scene',
            trigger: 'viewProgress',
            effects: [
                { effectId: 'shutter-L' },
                { effectId: 'shutter-R' },
                { effectId: 'shutter-T' },
                { effectId: 'shutter-B' },
                { effectId: 'fade-text-1' },
                { effectId: 'fade-text-2' },
                { effectId: 'center-dot-reveal' }
            ]
        }
    ]
}
```
