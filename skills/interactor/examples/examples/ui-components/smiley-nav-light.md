# Smiley Nav Light

A two-tab navigation bar that hover-reveals a dropdown panel, using Interact hover transitions and vanilla JS class-toggling for panel slide-in with staggered link fade-up.

**Tags:** hover, flex, opacity, transform, stagger, fade, reveal

## Markup

```html
<div class="nav-wrapper">
  <interact-element data-interact-key="nav-bar">
    <div class="nav-bar" id="nav-bar">
      <div class="nav-tabs">
        <interact-element data-interact-key="tab-features">
          <button type="button" class="nav-tab" data-tab="features">
            Features
            <svg class="chevron" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" /></svg>
          </button>
        </interact-element>
        <interact-element data-interact-key="tab-services">
          <button type="button" class="nav-tab" data-tab="services">
            Services
            <svg class="chevron" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" /></svg>
          </button>
        </interact-element>
      </div>
    </div>
  </interact-element>

  <div class="dropdown-panel" id="dropdown-panel">
    <div class="dropdown-content" data-content="features">
      <div>
        <div class="dropdown-col-header">Group A</div>
        <interact-element data-interact-key="d-0"><button class="dropdown-link" style="--i:0">Item A</button></interact-element>
        <interact-element data-interact-key="d-1"><button class="dropdown-link" style="--i:1">Item B</button></interact-element>
        <interact-element data-interact-key="d-2"><button class="dropdown-link" style="--i:2">Item C</button></interact-element>
      </div>
    </div>

    <div class="dropdown-content" data-content="services">
      <div>
        <div class="dropdown-col-header">Group B</div>
        <interact-element data-interact-key="d-3"><button class="dropdown-link" style="--i:0">Item D</button></interact-element>
        <interact-element data-interact-key="d-4"><button class="dropdown-link" style="--i:1">Item E</button></interact-element>
        <interact-element data-interact-key="d-5"><button class="dropdown-link" style="--i:2">Item F</button></interact-element>
      </div>
    </div>
  </div>
</div>
```

## Essential styles

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

interact-element { display: contents; }

body {
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 80px 24px 24px;
}

.nav-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.nav-bar {
  display: flex;
  align-items: center;
  height: 60px;
  padding: 0 8px;
  border-radius: 24px;
  border: 1px solid;
}

.nav-tabs {
  display: flex;
  align-items: center;
}

.nav-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 40px;
  padding: 0 44px;
  border: none;
  font-size: 15px;
  font-weight: 400;
  cursor: pointer;
  outline: none;
  border-radius: 15px;
  white-space: nowrap;
}

.nav-tab .chevron {
  width: 12px;
  height: 12px;
  stroke: currentColor;
  stroke-width: 1.5;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  transform: rotate(0deg);
}

.nav-tab.active .chevron {
  transform: rotate(180deg);
}

.dropdown-panel {
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  right: 0;
  border-radius: 24px;
  border: 1px solid;
  padding: 28px 40px;
  visibility: hidden;
  pointer-events: none;
  opacity: 0;
  min-height: 180px;
}

.dropdown-panel.open {
  visibility: visible;
  pointer-events: auto;
  opacity: 1;
}

.dropdown-panel::before {
  content: '';
  position: absolute;
  top: -14px;
  left: 0;
  right: 0;
  height: 14px;
}

.dropdown-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0 40px;
  position: absolute;
  inset: 28px 40px;
  opacity: 0;
  transform: translateX(-20px);
  pointer-events: none;
  transition: opacity 350ms ease-out, transform 350ms ease-out;
}

.dropdown-content.active {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
}

.dropdown-content.slide-left {
  transform: translateX(20px);
}

.dropdown-col-header {
  font-size: 11px;
  font-weight: 300;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0 12px 12px;
}

.dropdown-link {
  display: flex;
  align-items: center;
  width: 100%;
  height: 38px;
  padding: 0 12px;
  border: none;
  font-size: 14px;
  font-weight: 400;
  text-align: left;
  cursor: pointer;
  outline: none;
  border-radius: 12px;
  opacity: 0;
  transform: translateY(-4px);
  transition: opacity 180ms ease-out calc(var(--i, 0) * 40ms), transform 180ms ease-out calc(var(--i, 0) * 40ms);
}

.dropdown-panel.open .dropdown-link {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .dropdown-link, .dropdown-content { transition: none !important; }
}

```

## Interact config

```js
const TOTAL_LINKS = 6;
const linkHovers = Array.from({ length: TOTAL_LINKS }, (_, i) => ({
  key: `d-${i}`,
  trigger: 'hover',
  effects: [{
    stateAction: 'toggle',
    transition: {
      duration: 200,
      easing: 'ease-out',
      styleProperties: [
            { name: 'transform', value: 'translateY(-2px)' }
          ]
    }
  }]
}));

{
  interactions: [
    {
      key: 'nav-bar',
      trigger: 'hover',
      effects: [{
        stateAction: 'toggle',
        transition: {
          duration: 300,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          styleProperties: [
            { name: 'transform', value: 'translateY(-2px)' }
          ]
        }
      }]
    },
    ...['features', 'services'].map(name => ({
      key: `tab-${name}`,
      trigger: 'hover',
      effects: [{
        stateAction: 'toggle',
        transition: {
          duration: 250,
          easing: 'ease-out',
          styleProperties: [
            { name: 'transform', value: 'translateY(-2px)' }
          ]
        }
      }]
    })),
    ...linkHovers
  ]
}
```

## Animation logic

```js
const dropdownPanel = document.getElementById('dropdown-panel');
const tabs = document.querySelectorAll('.nav-tab');
const contents = document.querySelectorAll('.dropdown-content');
const tabNames = ['features', 'services'];
let activeTab = null;

tabs.forEach(tab => {
  tab.addEventListener('mouseenter', () => {
    const name = tab.dataset.tab;
    if (activeTab === name) return;
    openDropdown(name);
  });
});

const navWrapper = document.querySelector('.nav-wrapper');
let closeTimer = null;
navWrapper.addEventListener('mouseleave', () => {
  closeTimer = setTimeout(() => { if (activeTab) closeDropdown(); }, 120);
});
navWrapper.addEventListener('mouseenter', () => {
  if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
});

function openDropdown(name) {
  const prevIdx = activeTab ? tabNames.indexOf(activeTab) : -1;
  const nextIdx = tabNames.indexOf(name);

  contents.forEach(c => {
    if (c.dataset.content === activeTab) {
      c.classList.remove('active');
      c.classList.toggle('slide-left', nextIdx < prevIdx);
    }
  });

  activeTab = name;
  tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name));

  const incoming = document.querySelector(`.dropdown-content[data-content="${name}"]`);
  if (prevIdx >= 0 && nextIdx < prevIdx) {
    incoming.classList.add('slide-left');
    incoming.offsetHeight;
    incoming.classList.remove('slide-left');
  } else {
    incoming.classList.remove('slide-left');
  }
  incoming.classList.add('active');
  dropdownPanel.classList.add('open');
}

function closeDropdown() {
  activeTab = null;
  tabs.forEach(t => t.classList.remove('active'));
  contents.forEach(c => c.classList.remove('active', 'slide-left'));
  dropdownPanel.classList.remove('open');
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && activeTab) closeDropdown();
});
```
