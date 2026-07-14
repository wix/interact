# Mirror Hover Galery

A hover-triggered animation for layered visual elements in a grid/gallery, layered composition layout. It uses transform, opacity to create the motion and transition between visual states.

**Tags:** trigger: hover; layout: grid/gallery, layered composition; motion: transform, opacity

## Markup

```html
<section class="grid-container"></section>
```

## Essential styles

```css
:root {
  --stagger-delay: 0;
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
  border-radius:5px;
  cursor:pointer;
}

.card-inner {
  width:100%;
  height:100%;
  position:relative;
  border-radius:5px;
}

.card-bg {
  position:absolute;
  top:0;
  left:0;
  width:100%;
  height:100%;
  background-size:cover;
  background-position:center;
  
  transition: background-image 0.3s ease;
}

.card-overlay {
  position:absolute;
  inset:0;
  background:rgba(0,0,0,0.2);
  z-index:1;
  border-radius:5px;
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
  pointer-events:none;
  
}

.card-content h3 {margin:0 0 3px 0; font-size:1rem;}
.card-content p {margin:0; font-size:0.85rem;}

@media(max-width:1200px){
  .grid-container{grid-template-columns: repeat(4,1fr);}
}
@media(max-width:800px){
  .grid-container{grid-template-columns: repeat(2,1fr);}
}
```

## Interact config

```js
const container = document.querySelector('.grid-container');

const ROWS = 4;

const COLS = 8;

const CARD_COUNT = ROWS*COLS;

const originalImages = [];

const natureSeeds = [
  'forest', 'mountain', 'river', 'wild', 'jungle', 'desert', 'waterfall', 'canyon', 'prairie', 'lake',
  'volcano', 'ice', 'valley', 'rainforest', 'beach', 'cliff', 'glacier', 'savanna', 'woods', 'stream',
  'sunset', 'meadow', 'ocean', 'hills', 'swamp', 'rocks', 'pond', 'flowers', 'trees', 'night',
  'fog', 'autumn', 'spring', 'winter', 'summer', 'mist', 'cave', 'sky', 'riverbank', 'island'
];

for(let i=1;i<=CARD_COUNT;i++){
  const card=document.createElement('wix-interact-element');
  card.dataset.wixPath='card-'+i;
  card.innerHTML = `
    <div class="card-inner" id="card-inner-${i}">
      <div class="card-bg" id="card-bg-${i}"></div>
      <div class="card-overlay" id="card-overlay-${i}"></div>
      <div class="card-content" id="card-content-${i}">
        <h3>Title ${i}</h3>
        <p>Subtitle for card ${i}</p>
      </div>
    </div>
  `;

  const bg=card.querySelector('.card-bg');
  const seedIndex = (i - 1) % natureSeeds.length;
  const seed = natureSeeds[seedIndex];
  const imgUrl=`IMAGE_URL`;
  bg.style.backgroundImage=`url('${imgUrl}')`;
  originalImages.push(imgUrl);

  container.appendChild(card);
}

const interactions = [];

for (let i = 1; i <= CARD_COUNT; i++) {
  interactions.push({
    key: `card-${i}`,
    trigger: 'hover',
    params: { type: 'alternate' },
    effects: [
      
      {
        key: `#card-inner-${i}`,
        keyframeEffect: {
            name: `card-zoom-${i}`,
            keyframes: [{ transform: 'scale(1.05)' }]
        },
        duration: 300,
        easing: 'ease-out',
        fill: 'both'
      },
      
      {
        key: `#card-overlay-${i}`,
        transition: {
            duration: 300,
            easing: 'ease-out',
            styleProperties: [{ name: 'background', value: 'rgba(0,0,0,0.45)' }]
        },
        fill: 'both'
      },
      
      {
        key: `#card-content-${i}`,
        keyframeEffect: {
            name: `text-reveal-${i}`,
            keyframes: [{ opacity: 1, transform: 'translateY(0)' }]
        },
        duration: 300,
        easing: 'ease-out',
        fill: 'both'
      },
      
      {
        key: `card-${i}`,
        transition: {
            duration: 0, 
            styleProperties: [{ name: 'z-index', value: '10' }]
        },
        fill: 'both'
      }
    ]
  });
}

const config = { interactions };
```
