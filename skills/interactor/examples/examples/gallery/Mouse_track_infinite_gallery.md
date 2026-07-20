# Mouse Track Infinite Gallery

A responsive image grid where hovering an item blurs and scales its image while fading its caption.

**Tags:** hover, gallery, filter, blur, transform, scale, opacity

## Markup

```html
<div id="gallery-content">
  <div class="gallery-item">
    <interact-element data-interact-key="item-0">
      <div class="cursor-pointer">
        <div class="img-wrapper">
          <interact-element data-interact-key="img-0">
            <img src="" class="gallery-img" />
          </interact-element>
        </div>
        <div class="text-wrapper">
          <interact-element data-interact-key="txt-0">
            <div class="gallery-text">NEON VOID</div>
          </interact-element>
        </div>
      </div>
    </interact-element>
  </div>

  <div class="gallery-item">
    <interact-element data-interact-key="item-1">
      <div class="cursor-pointer">
        <div class="img-wrapper">
          <interact-element data-interact-key="img-1">
            <img src="" class="gallery-img" />
          </interact-element>
        </div>
        <div class="text-wrapper">
          <interact-element data-interact-key="txt-1">
            <div class="gallery-text">URBAN ECHO</div>
          </interact-element>
        </div>
      </div>
    </interact-element>
  </div>

  <div class="gallery-item">
    <interact-element data-interact-key="item-2">
      <div class="cursor-pointer">
        <div class="img-wrapper">
          <interact-element data-interact-key="img-2">
            <img src="" class="gallery-img" />
          </interact-element>
        </div>
        <div class="text-wrapper">
          <interact-element data-interact-key="txt-2">
            <div class="gallery-text">SILENT FORM</div>
          </interact-element>
        </div>
      </div>
    </interact-element>
  </div>

  <div class="gallery-item">
    <interact-element data-interact-key="item-3">
      <div class="cursor-pointer">
        <div class="img-wrapper">
          <interact-element data-interact-key="img-3">
            <img src="" class="gallery-img" />
          </interact-element>
        </div>
        <div class="text-wrapper">
          <interact-element data-interact-key="txt-3">
            <div class="gallery-text">LIQUID TIME</div>
          </interact-element>
        </div>
      </div>
    </interact-element>
  </div>

  <div class="gallery-item">
    <interact-element data-interact-key="item-4">
      <div class="cursor-pointer">
        <div class="img-wrapper">
          <interact-element data-interact-key="img-4">
            <img src="" class="gallery-img" />
          </interact-element>
        </div>
        <div class="text-wrapper">
          <interact-element data-interact-key="txt-4">
            <div class="gallery-text">GLASS SOUL</div>
          </interact-element>
        </div>
      </div>
    </interact-element>
  </div>
</div>
```

## Essential styles

```css
body {
  margin: 0;
}

#gallery-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.gallery-item {
  min-width: 0;
}

.img-wrapper {
  aspect-ratio: 1;
  overflow: clip;
}

.gallery-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform-origin: center;
}

.text-wrapper {
  pointer-events: none;
}
```

## Interact config

```js
const HOVER_BLUR = 8;
const totalItems = 5;
const interactions = [];

for (let i = 0; i < totalItems; i++) {
  const itemKey = `item-${i}`;
  const imgKey = `img-${i}`;
  const txtKey = `txt-${i}`;

  interactions.push({
    key: itemKey,
    trigger: 'hover',
    effects: [
      {
        key: imgKey,
        transition: {
          duration: 600,
          easing: 'ease-out',
          styleProperties: [
            { name: 'filter', value: `blur(${HOVER_BLUR}px)` },
            { name: 'transform', value: 'scale(0.95)' },
          ],
        },
      },
      {
        key: txtKey,
        transition: {
          duration: 500,
          easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
          styleProperties: [{ name: 'opacity', value: '0.4' }],
        },
      },
    ],
  });
}

const config = { interactions };
```
