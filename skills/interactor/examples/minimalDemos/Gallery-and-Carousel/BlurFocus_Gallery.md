# BlurFocus Gallery

A hover-triggered animation for gallery items in a grid/gallery, layered composition layout. It uses layered transforms to create the motion and transition between visual states.

**Tags:** trigger: hover; layout: grid/gallery, layered composition; motion: custom animation

## Markup

```html
<section class="grid-container">
</section>
```

## Essential styles

```css
:root {
  --blur-intensity: 12px;
}
body {
  margin:0;
  padding:40px;
  background:#111;
  font-family:'Inter', sans-serif;
  color:white;
  overflow-x:hidden;
}

.grid-container {
  display:grid;
  grid-template-columns: repeat(8, 1fr);
  grid-auto-rows:180px;
  gap:40px;
  width:100%;
}

wix-interact-element {
  display:block;
  position:relative;
  overflow:hidden;
  width:100%;
  height:100%;
  border-radius:2px;
  cursor:pointer;
  z-index: 1; 
}

.card-inner {
  width:100%;
  height:100%;
  position:relative;
  border-radius:2px;
}

.card-bg {
  position:absolute;
  top:0;
  left:0;
  width:100%;
  height:100%;
  background-size:cover;
  background-position:center;
  transition: filter 300ms ease;
  will-change: filter; 
}

.grid-container:has(wix-interact-element:hover) .card-bg {
  filter: blur(var(--blur-intensity));
}
wix-interact-element:hover .card-bg {
  filter: none !important;
}

.card-overlay {
  position:absolute;
  inset:0;
  background:rgba(0,0,0,0.2);
  z-index:1;
  border-radius:2px;
}

.card-content {
  position:absolute;
  bottom:12px;
  left:12px;
  right:12px;
  opacity:0;
  transform:translateY(10px);
  z-index:2;
  line-height:1.2;
  text-shadow:0 2px 6px rgba(0,0,0,0.5);
  will-change: opacity, transform; 
}

.card-content h3 {margin:0 0 3px 0; font-size:1rem;}
.card-content p {margin:0; font-size:0.85rem;}

@media(max-width:1200px){.grid-container{grid-template-columns: repeat(4,1fr);}}
@media(max-width:800px){.grid-container{grid-template-columns: repeat(2,1fr);}}
```

## Interact config

```js
const container = document.querySelector('.grid-container');

const ROWS = 4;

const COLS = 8;

const CARD_COUNT = ROWS*COLS;

const wildNatureSeeds = [
    'forest', 'mountain', 'river', 'jungle', 'desert', 'waterfall', 'canyon', 'prairie',
    'volcano', 'ice', 'valley', 'rainforest', 'beach', 'cliff', 'glacier', 'savanna',
    'woods', 'stream', 'sunset', 'meadow', 'ocean', 'hills', 'swamp', 'rocks', 
    'pond', 'flowers', 'trees', 'fog', 'autumn', 'spring', 'winter', 'summer'
  ];

for(let i=0;i<CARD_COUNT;i++){
    const cardId = i + 1;
    const card=document.createElement('wix-interact-element');
    card.setAttribute('data-wix-path','card-'+cardId);

    const inner=document.createElement('div');
    inner.classList.add('card-inner');

    const bg=document.createElement('div');
    bg.classList.add('card-bg');
    bg.style.backgroundImage=`url('IMAGE_URL')`;

    const overlay=document.createElement('div');
    overlay.classList.add('card-overlay');

    const content=document.createElement('div');
    content.classList.add('card-content');
    content.innerHTML=`<h3>Card ${cardId}</h3><p>Hover to see info</p>`;

    inner.appendChild(bg);
    inner.appendChild(overlay);
    inner.appendChild(content);
    card.appendChild(inner);
    container.appendChild(card);
  }

const interactions = [];

const DURATION = 300;

const EASING = 'ease';

for (let i = 1; i <= CARD_COUNT; i++) {
    const effects = [];

    
    effects.push({
      key: `card-${i}`,
      selector: '.card-inner',
      transition: {
        duration: DURATION,
        easing: EASING,
        styleProperties: [{ name: 'transform', value: 'scale(1.05)' }]
      }
    });

    
    effects.push({
      key: `card-${i}`,
      selector: '.card-overlay',
      transition: {
        duration: DURATION,
        easing: EASING,
        styleProperties: [{ name: 'background', value: 'rgba(0,0,0,0.35)' }]
      }
    });
    
    
    effects.push({
      key: `card-${i}`,
      selector: '.card-content',
      transition: {
        duration: DURATION,
        easing: EASING,
        styleProperties: [
            { name: 'opacity', value: '1' },
            { name: 'transform', value: 'translateY(0)' }
        ]
      }
    });

    
    effects.push({
        key: `card-${i}`,
        transition: {
            duration: 0,
            styleProperties: [{ name: 'z-index', value: '999' }]
        }
    });

    interactions.push({
      key: `card-${i}`,
      trigger: 'hover',
      params: { type: 'alternate' },
      effects: effects
    });
  }

const config = { interactions };
```
