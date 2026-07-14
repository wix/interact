# CasperGallery

A pointer-driven animation for gallery items in a grid/gallery, layered composition, 3D scene layout. It uses layered transforms to create the motion and transition between visual states.

**Tags:** trigger: mousemove; layout: grid/gallery, layered composition, 3D scene; motion: custom animation

## Markup

```html
<main id="image-container" class="relative h-screen w-screen overflow-hidden bg-gray-50">
    <div class="pointer-events-none absolute left-1/2 top-8 z-20 -translate-x-1/2 rounded-lg bg-white/70 px-4 py-2 text-sm font-medium text-gray-700 shadow-md backdrop-blur-sm">
      Move your mouse over the screen
    </div>
  </main>
```

## Essential styles

```css
body {
      margin: 0;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    .mouse-image {
      position: absolute;
      left: 0;
      top: 0;
      width: 120px;
      aspect-ratio: 1;
      object-fit: cover;
      opacity: 0;
      transform: translate3d(0, 0, 0) scale(0);
      transform-origin: center;
      will-change: transform, opacity;
    }
```

## Animation logic

```js
const imageContainer = document.getElementById('image-container');
      const imageCount = 250;
      const maxDistance = 200;
      const maxScale = 3.6;
      const smoothing = 0.2;
      const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

      for (let index = 1; index <= imageCount; index += 1) {
        const image = document.createElement('img');

        image.className = 'mouse-image shadow-sm';
        image.decoding = 'async';
        image.loading = index > 40 ? 'lazy' : 'eager';
        imageContainer.appendChild(image);
      }

      const images = Array.from(document.querySelectorAll('.mouse-image'));
      let containerWidth = 0;
      let containerHeight = 0;
      let imageWidth = 120;
      let imageHeight = 120;

      function resetImage(image) {
        image.startOffsetX = -imageWidth + Math.random() * (containerWidth / 2);
        image.startOffsetY = containerHeight - imageHeight / 2 - Math.random() * (containerHeight / 2);
        image.velocity = 0.5 + Math.random() * 1.5;
        image.currentX = image.startOffsetX;
        image.currentY = image.startOffsetY;
        image.currentScale = 0;
      }

      function updateDimensions() {
        const containerRect = imageContainer.getBoundingClientRect();
        const imageRect = images[0].getBoundingClientRect();

        containerWidth = containerRect.width;
        containerHeight = containerRect.height;
        imageWidth = imageRect.width || imageWidth;
        imageHeight = imageRect.height || imageHeight;

        images.forEach(resetImage);
      }

      document.addEventListener('mousemove', (event) => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
      });

      
      if ('ResizeObserver' in window) {
        new ResizeObserver(updateDimensions).observe(images[0]);
      }

      updateDimensions();
      requestAnimationFrame(animateImages);

      function animateImages() {
        images.forEach((image) => {
          image.currentX += image.velocity;
          image.currentY -= image.velocity;

          if (image.currentX > containerWidth || image.currentY < -imageHeight) {
            resetImage(image);
          }

          const imageCenterX = image.currentX + imageWidth / 2;
          const imageCenterY = image.currentY + imageHeight / 2;
          const distance = Math.hypot(mouse.x - imageCenterX, mouse.y - imageCenterY);
          const targetScale = Math.max(0, maxScale * (1 - distance / maxDistance));

          image.currentScale += (targetScale - image.currentScale) * smoothing;
          image.style.opacity = image.currentScale > 0.01 ? '1' : '0';
          image.style.transform = `translate3d(${image.currentX}px, ${image.currentY}px, 0) scale(${image.currentScale})`;
        });

        requestAnimationFrame(animateImages);
      }
```
