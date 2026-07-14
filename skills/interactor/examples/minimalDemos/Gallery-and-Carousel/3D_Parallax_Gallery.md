# 3D Parallax Gallery

A hover-triggered and pointer-driven animation for gallery items in a grid/gallery, flex/carousel, layered composition layout. It uses opacity, transform to create the motion and transition between visual states.

**Tags:** trigger: hover, pointerMove; layout: grid/gallery, flex/carousel, layered composition; motion: opacity, transform

## Markup

```html
<wix-interact-element data-wix-path="grid-container">
    <div class="grid-container" id="grid-container"></div>
</wix-interact-element>
```

## Essential styles

```css
:root {
        --max-rotate: 40;
        --pointer-latency: 0ms;
        --pointer-direction: -1;
    }
    body {
        margin: 0;
        padding: 40px;
        background: #111;
        font-family: 'Inter', sans-serif;
        overflow: hidden; 
    }
    .grid-container {
        display: grid;
        gap: 20px;
        perspective: 2000px;
        grid-template-columns: repeat(8, 1fr); 
        grid-auto-rows: 1fr;
    }
    wix-interact-element {
        display: block;
        position: relative;
        border-radius: 20px;
        overflow: visible;
        transform-style: preserve-3d;
        cursor: pointer;
    }
    .card-inner {
        width: 100%;
        aspect-ratio: 1 / 1;
        border-radius: 20px;
        background-size: cover;
        background-position: center;
        box-shadow: 0 10px 20px rgba(0,0,0,0.5);
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        padding: 16px;
        box-sizing: border-box;
        color: white;
        font-weight: 500;
        transition: transform var(--pointer-latency) ease-out;
    }
    .card-content {
        opacity: 0;
        transform: translateY(12px);
    }
    .card-content h3 { margin: 0 0 2px 0; }
    .card-content p { margin: 0; }
    @media(max-width: 1200px) {
        .grid-container {
            grid-template-columns: repeat(4, 1fr);
        }
    }
    @media(max-width: 750px) {
        .grid-container {
            grid-template-columns: repeat(2, 1fr);
        }
    }
```

## Interact config

```js
const container = document.getElementById('grid-container');

const numCards = 32;

const interactions = [];

const cardInnerElements = [];

for (let i = 0; i < numCards; i++) {
        const cardPath = `card-${i + 1}`;
        const contentPath = `card-content-${i + 1}`;

        const cardWrapper = document.createElement('wix-interact-element');
        cardWrapper.setAttribute('data-wix-path', cardPath);

        const inner = document.createElement('div');
        inner.classList.add('card-inner');
        inner.style.backgroundImage = `linear-gradient(180deg,#0003,#000c), url('IMAGE_URL')`;
        cardInnerElements.push(inner);

        const contentWrapper = document.createElement('wix-interact-element');
        contentWrapper.setAttribute('data-wix-path', contentPath);

        const content = document.createElement('div');
        content.classList.add('card-content');
        content.id = contentPath;
        content.innerHTML = `<h3>Card ${i + 1}</h3><p>Demo text</p>`;

        contentWrapper.appendChild(content);
        inner.appendChild(contentWrapper);
        cardWrapper.appendChild(inner);
        container.appendChild(cardWrapper);

        
        interactions.push({
            key: cardPath,
            trigger: 'hover',
            params: { type: 'alternate' },
            effects: [{
                key: contentPath,
                keyframeEffect: {
                    name: `content-reveal-${i + 1}`,
                    keyframes: [
                        { opacity: 0, transform: 'translateY(12px)' },
                        { opacity: 1, transform: 'translateY(0)' }
                    ]
                },
                duration: 300,
                easing: 'ease',
                fill: 'both'
            }]
        });
    }

interactions.push({
        key: 'grid-container',
        trigger: 'pointerMove',
        effects: [{
            key: 'grid-container',
            customEffect: (element, progress) => {
                const style = getComputedStyle(document.documentElement);
                const maxRotate = parseFloat(style.getPropertyValue('--max-rotate')) || 40;
                const direction = parseFloat(style.getPropertyValue('--pointer-direction')) || -1;
                const percentX = progress.x;
                const percentY = progress.y;

                cardInnerElements.forEach(innerEl => {
                    innerEl.style.transform = `rotateX(${percentY * maxRotate * direction}deg) rotateY(${-percentX * maxRotate * direction}deg) scale(1)`;
                });
            }
        }]
    });

const config = { interactions };
```
