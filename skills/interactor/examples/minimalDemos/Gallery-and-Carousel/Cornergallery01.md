# Cornergallery01

A page-load and click-triggered animation for gallery items in a grid/gallery, flex/carousel, layered composition layout. It uses layered transforms to create the motion and transition between visual states.

**Tags:** trigger: pageVisible, click; layout: grid/gallery, flex/carousel, layered composition; motion: custom animation

## Markup

```html
<wix-interact-element data-wix-path="container">
      <div id="collage-container">
          <div id="projector-overlay"></div>
      </div>
    </wix-interact-element>

    <div id="progress-indicator"></div>
```

## Essential styles

```css
html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background-color: #000;
            font-family: 'Inter', sans-serif;
        }

        
        #collage-container {
            width: 100%;
            height: 100%;
            position: relative;
            cursor: pointer;
        }

        
        .fragment {
            position: absolute;
            overflow: hidden;
            width: 100%;
            height: 100%;
            left: 0;
            top: 0;
            background-color: #111;
        }

        .fragment .content-image {
            width: 100%;
            height: 100%;
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
        }

        
        .text-overlay {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            padding: 20px 40px;
            box-sizing: border-box;
            background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
            color: #fff;
            opacity: 0;
            transition: opacity 0.4s ease-in-out;
            text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
            pointer-events: none;
        }

        #collage-container:hover .text-overlay {
           opacity: 1;
        }

        .text-overlay h1 {
            margin: 0 0 5px 0;
            font-size: 2.5rem;
            font-weight: 900;
        }

        .text-overlay p {
            margin: 0;
            font-size: 1.2rem;
            font-weight: 400;
        }
        
        
        @keyframes kenburns-tr {
            0% { transform: scale(1.0) translate(0, 0); }
            100% { transform: scale(1.25) translate(5%, -5%); }
        }
        @keyframes kenburns-br {
            0% { transform: scale(1.0) translate(0, 0); }
            100% { transform: scale(1.25) translate(5%, 5%); }
        }
        @keyframes kenburns-tl {
            0% { transform: scale(1.0) translate(0, 0); }
            100% { transform: scale(1.25) translate(-5%, -5%); }
        }
        @keyframes kenburns-bl {
            0% { transform: scale(1.0) translate(0, 0); }
            100% { transform: scale(1.25) translate(-5%, 5%); }
        }

        .content-image.kenburns {
            animation-duration: 15s;
            animation-timing-function: ease-out;
            animation-fill-mode: forwards;
        }
        .kenburns-tr { animation-name: kenburns-tr; }
        .kenburns-br { animation-name: kenburns-br; }
        .kenburns-tl { animation-name: kenburns-tl; }
        .kenburns-bl { animation-name: kenburns-bl; }

        
        #collage-container:hover .content-image.kenburns {
           animation-play-state: paused;
        }

        
        #progress-indicator {
            position: fixed;
            top: 50%;
            right: 25px;
            transform: translateY(-50%);
            display: flex;
            flex-direction: column;
            gap: 12px;
            z-index: 10;
        }

        .progress-dot {
            width: 8px;
            height: 8px;
            background-color: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
            cursor: pointer;
        }

        .progress-dot.active {
            background-color: #ffffff;
            transform: scale(1.5);
        }

        

        @keyframes flicker {
            0% { opacity: 0.05; } 20% { opacity: 0.02; } 40% { opacity: 0.08; }
            60% { opacity: 0.01; } 80% { opacity: 0.06; } 100% { opacity: 0.03; }
        }
```

## Interact config

```js
const container = document.getElementById('collage-container');

const progressIndicator = document.getElementById('progress-indicator');

const imageHistory = [];

let currentIndex = -1;

let canAnimate = true;

const throttleTime = 400;

let autoAdvanceTimer = null;

const getRealImageUrl = () => `IMAGE_URL`;

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

function createFragment(imageUrl) {
            const fragment = document.createElement('div');
            fragment.className = 'fragment';

            const origins = ['0 0', '50% 0', '100% 0', '0 50%', '100% 50%', '0 100%', '50% 100%', '100% 100%'];
            const duration = (Math.random() * 0.5 + 0.8).toFixed(2);
            const easing = 'cubic-bezier(0.25, 1, 0.5, 1)';

            fragment.style.transformOrigin = getRandomItem(origins);
            fragment.style.transform = 'scale(0)';
            fragment.style.transition = `transform ${duration}s ${easing}`;

            const content = document.createElement('div');
            content.className = 'content-image kenburns ' + getRandomItem(['kenburns-tr', 'kenburns-br', 'kenburns-tl', 'kenburns-bl']);
            content.style.backgroundImage = `url(${imageUrl})`;
            fragment.appendChild(content);

            const textOverlay = document.createElement('div');
            textOverlay.className = 'text-overlay';
            textOverlay.innerHTML = `<h1>Explore Vistas</h1><p>Click or Scroll to discover new images.</p>`;
            fragment.appendChild(textOverlay);

            return fragment;
        }

function displayImage(imageUrl) {
            const preloader = new Image();
            preloader.onload = () => {
                const oldFragments = container.querySelectorAll('.fragment');
                setTimeout(() => oldFragments.forEach(node => node.remove()), 1500);

                const fragment = createFragment(imageUrl);
                container.appendChild(fragment);
                setTimeout(() => fragment.style.transform = 'scale(1)', 20);
            };

        }

function updateProgressIndicator() {
            progressIndicator.innerHTML = ''; 
            imageHistory.forEach((_, index) => {
                const dot = document.createElement('div');
                dot.className = 'progress-dot';
                dot.dataset.index = index; 
                if (index === currentIndex) dot.classList.add('active');
                dot.addEventListener('click', handleDotClick);
                progressIndicator.appendChild(dot);
            });
        }

function resetAutoAdvanceTimer() {
            clearTimeout(autoAdvanceTimer);
            autoAdvanceTimer = setTimeout(() => {
                if (canAnimate) doNextImage(); 
                else resetAutoAdvanceTimer();
            }, 4000); 
        }

function doInitialLoad() {
            const firstImageUrl = getRealImageUrl();
            imageHistory.push(firstImageUrl);
            currentIndex = 0;
            displayImage(firstImageUrl);
            updateProgressIndicator();
            resetAutoAdvanceTimer();
        }

function doNextImage() {
            if (!canAnimate) return;
            canAnimate = false;

            if (currentIndex < imageHistory.length - 1) {
                currentIndex++;
            } else {
                const newImageUrl = getRealImageUrl();
                imageHistory.push(newImageUrl);
                currentIndex++;
            }
            displayImage(imageHistory[currentIndex]);
            updateProgressIndicator();
            resetAutoAdvanceTimer();
            setTimeout(() => canAnimate = true, throttleTime);
        }

function doGoToImage(index) {
            if (!canAnimate || index === currentIndex) return;
            canAnimate = false;
            currentIndex = index;
            displayImage(imageHistory[currentIndex]);
            updateProgressIndicator();
            resetAutoAdvanceTimer(); 
            setTimeout(() => canAnimate = true, throttleTime);
        }

function handleDotClick(event) {
            const clickedIndex = parseInt(event.target.dataset.index, 10);
            doGoToImage(clickedIndex);
        }

const interactConfig = {
            interactions: [
                {
                    
                    key: 'container',
                    trigger: 'pageVisible',
                    params: { type: 'once' },
                    effects: [{
                        customEffect: () => doInitialLoad()
                    }]
                },
                {
                    
                    key: 'container',
                    trigger: 'click',
                    params: { type: 'repeat' },
                    effects: [{
                        customEffect: () => doNextImage()
                    }]
                }
            ]
        };
```
