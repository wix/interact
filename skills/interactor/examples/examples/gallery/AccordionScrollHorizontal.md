# Accordion Scroll Horizontal

Hover over any panel to expand it — vertically on mobile, horizontally on desktop — while a title and subtitle fade up from the bottom.

**Tags:** hover, gallery, flex, accordion, responsive, height, transform, opacity, reveal, stagger

## Markup

```html
<main id="feature-container" class="feature-container">

    <interact-element data-interact-key="col-1">
        <div id="column-1" class="feature-column" tabindex="0">
            <interact-element data-interact-key="txt-1">
                <div class="feature-text-group">
                    <p class="feature-bottom-subtitle">Italian Alps</p>
                    <h2 class="feature-bottom-title">Serene Lakes</h2>
                </div>
            </interact-element>
            <img src="" class="feature-image">
        </div>
    </interact-element>

    <interact-element data-interact-key="col-2">
        <div id="column-2" class="feature-column" tabindex="0">
            <interact-element data-interact-key="txt-2">
                <div class="feature-text-group">
                    <p class="feature-bottom-subtitle">Arid Climate</p>
                    <h2 class="feature-bottom-title">Vast Deserts</h2>
                </div>
            </interact-element>
            <img src="" class="feature-image">
        </div>
    </interact-element>

    <interact-element data-interact-key="col-3">
        <div id="column-3" class="feature-column" tabindex="0">
            <interact-element data-interact-key="txt-3">
                <div class="feature-text-group">
                    <p class="feature-bottom-subtitle">Tropical Paradise</p>
                    <h2 class="feature-bottom-title">Lush Rainforests</h2>
                </div>
            </interact-element>
            <img src="" class="feature-image">
        </div>
    </interact-element>

    <interact-element data-interact-key="col-4">
        <div id="column-4" class="feature-column" tabindex="0">
            <interact-element data-interact-key="txt-4">
                <div class="feature-text-group">
                    <p class="feature-bottom-subtitle">Coastal Views</p>
                    <h2 class="feature-bottom-title">Ocean Cliffs</h2>
                </div>
            </interact-element>
            <img src="" class="feature-image">
        </div>
    </interact-element>

    <interact-element data-interact-key="col-5">
        <div id="column-5" class="feature-column" tabindex="0">
            <interact-element data-interact-key="txt-5">
                <div class="feature-text-group">
                    <p class="feature-bottom-subtitle">Metropolitan Area</p>
                    <h2 class="feature-bottom-title">Urban Landscapes</h2>
                </div>
            </interact-element>
            <img src="" class="feature-image">
        </div>
    </interact-element>

    <interact-element data-interact-key="col-6">
        <div id="column-6" class="feature-column" tabindex="0">
            <interact-element data-interact-key="txt-6">
                <div class="feature-text-group">
                    <p class="feature-bottom-subtitle">Night Sky</p>
                    <h2 class="feature-bottom-title">The Aurora</h2>
                </div>
            </interact-element>
            <img src="" class="feature-image">
        </div>
    </interact-element>

</main>
```

## Essential styles

```css
:root {
    --panel-default-width: 220px;
    --panel-open-width: 600px;
    --panel-speed: 1;
}

html {
    overflow-x: hidden;
    margin: 0;
    padding: 0;
}

body {
    font-family: 'Inter', sans-serif;
    background-color: #f8f9fa;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
}

.feature-container {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    width: 100%;
    padding: 1.25rem;
    box-sizing: border-box;
}

.feature-column {
    width: 100%;
    max-height: 25vh;
    overflow: hidden;
    position: relative;
    z-index: 1;
    cursor: pointer;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    border-radius: 1.5rem;
    background: #eee;
}

.feature-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    pointer-events: none;
}

.feature-column:hover .feature-image {
    transform: scale(1.08);
}

.feature-text-group {
    position: absolute;
    bottom: 1.5rem;
    left: 1.5rem;
    right: 1.5rem;
    opacity: 0;
    transform: translateY(20px);
    z-index: 10;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
    line-height: 1.2;
    pointer-events: none;
}

.feature-bottom-subtitle {
    font-size: 0.75rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.8);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 0.25rem;
}

.feature-bottom-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: white;
    white-space: nowrap;
}

.feature-column::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%);
    opacity: 0;
    transition: opacity 0.5s ease;
    pointer-events: none;
}

.feature-column:hover::after {
    opacity: 1;
}

@media (min-width: 769px) {
    body.desktop-layout {
        height: 100vh;
        display: flex;
        align-items: center;
        overflow: hidden;
    }

    .desktop-layout .feature-container {
        flex-direction: row;
        height: 80vh;
        width: auto;
        margin: 0 auto;
        padding: 1rem 5vw;
        gap: 1rem;
        overflow-x: auto;
        scrollbar-width: none;
    }

    .desktop-layout .feature-container::-webkit-scrollbar {
        display: none;
    }

    .desktop-layout .feature-column {
        width: var(--panel-default-width, 220px);
        max-height: none;
        height: 100%;
        flex-shrink: 0;
    }
}
```

## Interact config

```js
const rootStyle = getComputedStyle(document.documentElement);
const panelDefaultWidth = rootStyle.getPropertyValue('--panel-default-width').trim() || '220px';
const panelOpenWidth = rootStyle.getPropertyValue('--panel-open-width').trim() || '600px';
const panelSpeed = parseFloat(rootStyle.getPropertyValue('--panel-speed')) || 1;

const config = {
    effects: {
        'v-expand': {
            keyframeEffect: {
                name: 'v-exp',
                keyframes: [
                    { maxHeight: '25vh' },
                    { maxHeight: '75vh', zIndex: 10 }
                ]
            },
            duration: Math.round(600 / panelSpeed),
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
            fill: 'both'
        },
        'h-expand': {
            keyframeEffect: {
                name: 'h-exp',
                keyframes: [
                    { width: panelDefaultWidth },
                    { width: panelOpenWidth, zIndex: 10 }
                ]
            },
            duration: Math.round(600 / panelSpeed),
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
            fill: 'both'
        },
        'reveal': {
            keyframeEffect: {
                name: 't-rev',
                keyframes: [
                    { opacity: 0, transform: 'translateY(20px)' },
                    { opacity: 1, transform: 'translateY(0)' }
                ]
            },
            duration: Math.round(400 / panelSpeed),
            delay: Math.round(150 / panelSpeed),
            easing: 'ease-out',
            fill: 'both'
        }
    },
    conditions: {
        'mobile': { type: 'media', predicate: '(max-width: 768px)' },
        'desktop': { type: 'media', predicate: '(min-width: 769px)' }
    },
    interactions: []
};

for (let i = 1; i <= 6; i++) {
    const colKey = `col-${i}`;
    const txtKey = `txt-${i}`;

    config.interactions.push({
        key: colKey,
        trigger: 'hover',
        conditions: ['mobile'],
        effects: [
            { key: colKey, effectId: 'v-expand', triggerType: 'alternate' },
            { key: txtKey, effectId: 'reveal', triggerType: 'alternate' }
        ]
    });

    config.interactions.push({
        key: colKey,
        trigger: 'hover',
        conditions: ['desktop'],
        effects: [
            { key: colKey, effectId: 'h-expand', triggerType: 'alternate' },
            { key: txtKey, effectId: 'reveal', triggerType: 'alternate' }
        ]
    });
}
```
