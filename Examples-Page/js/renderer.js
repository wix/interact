import { categories } from './config.js';

const EXPAND_SVG = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="10,2 14,2 14,6"/><polyline points="6,14 2,14 2,10"/><line x1="14" y1="2" x2="9" y2="7"/><line x1="2" y1="14" x2="7" y2="9"/></svg>`;

const IFRAME_BASE_WIDTH = 800;
const IFRAME_COMPACT_WIDTH = 800;
const CACHE_BUST = `?_=${Date.now()}`;

// Single shared observer — computes scale for all card iframes
const scaleObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const iframe = entry.target.querySelector('.card-iframe');
    if (!iframe) continue;
    const customWidth = parseInt(entry.target.dataset.viewportWidth, 10);
    let baseWidth;
    if (customWidth) {
      baseWidth = customWidth;
    } else {
      const isCompact = entry.target.closest('.example-card')?.classList.contains('compact');
      baseWidth = isCompact ? IFRAME_COMPACT_WIDTH : IFRAME_BASE_WIDTH;
    }
    const scale = entry.contentRect.width / baseWidth;
    iframe.style.transform = `translate(-50%, -50%) scale(${scale})`;
  }
});

const PLACEHOLDER_SHAPE_COUNT = 3;

function createPlaceholderPreview(categoryId) {
  const preview = document.createElement('div');
  preview.className = `example-preview preview-${categoryId}`;

  const shapes = document.createElement('div');
  shapes.className = 'preview-shapes';

  const count = categoryId === 'layout' ? 5 : PLACEHOLDER_SHAPE_COUNT;
  for (let i = 0; i < count; i++) {
    const shape = document.createElement('div');
    shape.className = 'preview-shape';
    shapes.appendChild(shape);
  }

  preview.appendChild(shapes);
  return preview;
}

function createExampleCard(example, categoryId, compact) {
  const wrapper = document.createElement('div');
  wrapper.className = 'example-card-wrapper';

  const card = document.createElement('div');
  card.className = compact ? 'example-card compact' : 'example-card';
  card.dataset.htmlPath = example.htmlPath;
  card.dataset.title = example.title;

  const inner = document.createElement('div');
  inner.className = 'example-card-inner';

  // Placeholder (visible while iframe loads)
  const placeholder = createPlaceholderPreview(categoryId);
  inner.appendChild(placeholder);

  // Live iframe preview
  const iframe = document.createElement('iframe');
  iframe.className = 'card-iframe';
  iframe.dataset.src = example.htmlPath + CACHE_BUST;
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
  iframe.setAttribute('loading', 'lazy');
  iframe.setAttribute('tabindex', '-1');
  iframe.title = example.title;

  // Per-example desktop viewport — render iframe at this width so the example
  // sees a real desktop viewport instead of the card's smaller width.
  if (example.viewportWidth) {
    const w = example.viewportWidth;
    const h = example.viewportHeight ?? Math.round((w * 10) / 16);
    iframe.style.width = `${w}px`;
    iframe.style.height = `${h}px`;
    inner.dataset.viewportWidth = String(w);
  }

  iframe.addEventListener('load', () => {
    if (!iframe.src || iframe.src === 'about:blank') return;
    placeholder.style.display = 'none';
    iframe.classList.add('loaded');

    // Auto-scroll for scroll-driven examples
    if (example.autoScroll) {
      startAutoScroll(iframe);
    }

    // Double-click inside iframe opens modal, first click shows hint
    try {
      const doc = iframe.contentDocument;
      let hintTimeout = null;

      doc.addEventListener('click', () => {
        if (card.querySelector('.dblclick-hint')) return;
        const hint = document.createElement('div');
        hint.className = 'dblclick-hint';
        hint.textContent = 'Double-click to expand';
        inner.appendChild(hint);
        requestAnimationFrame(() => hint.classList.add('visible'));

        clearTimeout(hintTimeout);
        hintTimeout = setTimeout(() => {
          hint.classList.remove('visible');
          hint.addEventListener('transitionend', () => hint.remove(), { once: true });
        }, 2000);
      });

      doc.addEventListener('dblclick', () => {
        if (_openModal) _openModal(card.dataset.title, card.dataset.htmlPath);
      });
    } catch (e) {
      // cross-origin — ignore
    }
  });

  inner.appendChild(iframe);

  // Expand button (opens modal)
  const expandBtn = document.createElement('button');
  expandBtn.className = 'expand-btn';
  expandBtn.innerHTML = EXPAND_SVG;
  expandBtn.setAttribute('aria-label', `Open ${example.title}`);
  inner.appendChild(expandBtn);

  card.appendChild(inner);
  scaleObserver.observe(inner);
  wrapper.appendChild(card);

  // Label (also opens modal)
  const label = document.createElement('div');
  label.className = 'example-label';
  label.textContent = example.title;
  wrapper.appendChild(label);

  return wrapper;
}

function startAutoScroll(iframe) {
  let direction = 1;

  function tick() {
    const rect = iframe.getBoundingClientRect();
    if (rect.bottom > -100 && rect.top < window.innerHeight + 100) {
      try {
        const win = iframe.contentWindow;
        const max = win.document.documentElement.scrollHeight - win.innerHeight;
        if (max > 0) {
          if (win.scrollY >= max - 1) direction = -1;
          if (win.scrollY <= 1) direction = 1;
          win.scrollBy(0, direction * 0.5);
        }
      } catch (e) {
        return; // stop if cross-origin or detached
      }
    }
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

function highlightHtml(text) {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Single tokenizer pass — order of alternatives matters
  const re = /(&lt;!--[\s\S]*?--&gt;)|(&lt;\/?[\w-]+)|(\/?&gt;)|("[^"]*")|('[^']*')|(\s)([\w-]+)(=)/g;
  return escaped.replace(re, (m, comment, tag, closeTag, dq, sq, ws, attr, eq) => {
    if (comment) return `<span class="hl-c">${comment}</span>`;
    if (tag) return `<span class="hl-t">${tag}</span>`;
    if (closeTag) return `<span class="hl-t">${closeTag}</span>`;
    if (dq) return `<span class="hl-s">${dq}</span>`;
    if (sq) return `<span class="hl-s">${sq}</span>`;
    if (attr) return `${ws}<span class="hl-a">${attr}</span>${eq}`;
    return m;
  });
}

function createCarouselSliderPanel(iframe) {
  const card = document.createElement('div');
  card.className = 'slider-panel-card';
  card.innerHTML = `
    <div class="panel-title">Controls</div>
    <label>
      <span class="lbl-row"><span class="lbl-name">Perspective</span><span class="val"><span class="val-persp">1200</span>px</span></span>
      <input type="range" data-control="persp" min="400" max="3000" step="50" value="1200">
    </label>
    <label>
      <span class="lbl-row"><span class="lbl-name">Border Radius</span><span class="val"><span class="val-radius">20</span>px</span></span>
      <input type="range" data-control="radius" min="0" max="40" step="1" value="20">
    </label>
    <label>
      <span class="lbl-row"><span class="lbl-name">Rotation Loops</span><span class="val"><span class="val-loops">2</span></span></span>
      <input type="range" data-control="loops" min="1" max="5" step="1" value="2">
    </label>
    <label>
      <span class="lbl-row"><span class="lbl-name">Min Brightness</span><span class="val"><span class="val-dim">35</span>%</span></span>
      <input type="range" data-control="dim" min="10" max="80" step="5" value="35">
    </label>
    <label>
      <span class="lbl-row"><span class="lbl-name">Ring Radius</span><span class="val"><span class="val-ring">380</span>px</span></span>
      <input type="range" data-control="ring" min="250" max="550" step="10" value="380">
    </label>
  `;

  const wireUp = () => {
    const win = iframe.contentWindow;
    const doc = iframe.contentDocument;
    if (!win || !doc) return;

    const set = (sel, fn) => card.querySelector(sel).addEventListener('input', fn);

    set('[data-control="persp"]', (e) => {
      doc.documentElement.style.setProperty('--perspective', e.target.value + 'px');
      card.querySelector('.val-persp').textContent = e.target.value;
    });
    set('[data-control="radius"]', (e) => {
      doc.documentElement.style.setProperty('--card-radius', e.target.value + 'px');
      card.querySelector('.val-radius').textContent = e.target.value;
    });
    set('[data-control="loops"]', (e) => {
      if (win.__cfg) win.__cfg.loops = +e.target.value;
      card.querySelector('.val-loops').textContent = e.target.value;
    });
    set('[data-control="dim"]', (e) => {
      if (win.__cfg) win.__cfg.minB = +e.target.value / 100;
      card.querySelector('.val-dim').textContent = e.target.value;
    });
    set('[data-control="ring"]', (e) => {
      if (win.__cfg) win.__cfg.radius = +e.target.value;
      card.querySelector('.val-ring').textContent = e.target.value;
      if (typeof win.__updateRadius === 'function') win.__updateRadius();
    });
  };

  // Iframe content might already be loaded by the time we attach;
  // wire up on load + try once immediately in case it's ready.
  iframe.addEventListener('load', wireUp);

  return card;
}

function createSourceCodeCard(example) {
  const card = document.createElement('div');
  card.className = 'source-code-card';

  const code = document.createElement('pre');
  code.className = 'source-code-content';
  code.textContent = '// loading source…';
  card.appendChild(code);

  fetch(example.htmlPath + CACHE_BUST)
    .then((res) => res.text())
    .then((text) => { code.innerHTML = highlightHtml(text); })
    .catch(() => { code.textContent = '// Unable to load source'; });

  return card;
}

function createCategorySection(category) {
  const section = document.createElement('section');
  section.className = 'category-section';
  section.id = category.id;

  const header = document.createElement('div');
  header.className = 'category-header';

  const title = document.createElement('h2');
  title.className = 'category-title';
  title.textContent = category.title;

  if (category.docsLink && category.docsLabel) {
    const link = document.createElement('a');
    link.className = 'docs-link';
    link.href = category.docsLink;
    link.textContent = `[${category.docsLabel}]`;
    title.appendChild(link);
  }

  header.appendChild(title);

  const desc = document.createElement('p');
  desc.className = 'category-description';
  desc.textContent = category.description;
  header.appendChild(desc);

  section.appendChild(header);

  if (category.examples.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-category';
    empty.textContent = 'No examples yet — coming soon';
    section.appendChild(empty);
  } else if (category.layout === 'gallery-bento') {
    // Top row: source code card (left) + first example (right, like Labels in UI)
    const top = document.createElement('div');
    top.className = 'gallery-top-row';

    const featuredCard = createExampleCard(category.examples[0], category.id, false);
    top.appendChild(featuredCard);

    const iframe = featuredCard.querySelector('.card-iframe');
    const sidePanel = createCarouselSliderPanel(iframe);
    // Connector lives inside the side panel so it anchors to the panel's vertical middle
    const connector = document.createElement('div');
    connector.className = 'card-connector';
    sidePanel.prepend(connector);
    top.appendChild(sidePanel);

    section.appendChild(top);

    // Bottom: regular grid for remaining examples
    if (category.examples.length > 1) {
      const bottom = document.createElement('div');
      bottom.className = 'examples-grid gallery-bottom';
      for (let i = 1; i < category.examples.length; i++) {
        bottom.appendChild(createExampleCard(category.examples[i], category.id, false));
      }
      section.appendChild(bottom);
    }
  } else {
    const grid = document.createElement('div');
    grid.className = category.compact ? 'examples-grid compact' : 'examples-grid';
    if (category.gridCols) grid.style.gridTemplateColumns = `repeat(${category.gridCols}, 1fr)`;
    if (category.gridGap !== undefined) grid.style.gap = `${category.gridGap}px`;
    category.examples.forEach((ex) => {
      const card = createExampleCard(ex, category.id, category.compact);
      if (ex.colSpan) card.style.gridColumn = `span ${ex.colSpan}`;
      if (ex.rowSpan) {
        card.style.gridRow = `span ${ex.rowSpan}`;
        if (ex.rowSpan > 1) card.classList.add('multi-row');
      }
      grid.appendChild(card);
    });
    section.appendChild(grid);
  }

  return section;
}

export function renderSidebarItems(container) {
  // Hero / welcome entry — sits at the top, active by default
  const welcome = document.createElement('div');
  welcome.className = 'category-item active';
  welcome.dataset.target = 'welcome';
  welcome.textContent = 'Welcome';
  container.appendChild(welcome);

  categories.forEach((cat) => {
    const item = document.createElement('div');
    item.className = 'category-item';
    item.dataset.target = cat.id;
    item.textContent = cat.title;
    container.appendChild(item);
  });
}

function createHeroSection() {
  const section = document.createElement('section');
  section.className = 'hero-section';
  section.id = 'welcome';

  const text = document.createElement('div');
  text.className = 'hero-text';

  const title = document.createElement('h1');
  title.className = 'hero-title';
  title.innerHTML = '<span class="hero-title-accent">Interact</span><br>examples';
  text.appendChild(title);

  const desc = document.createElement('p');
  desc.className = 'hero-description';
  desc.textContent =
    'A live gallery of interactions. Hover, click, and scroll to play — double click any card to view source code.';
  text.appendChild(desc);

  section.appendChild(text);

  const illus = document.createElement('div');
  illus.className = 'hero-illus';
  illus.setAttribute('aria-hidden', 'true');
  illus.innerHTML = `
    <svg viewBox="0 0 785 561" fill="none" xmlns="http://www.w3.org/2000/svg">
      <mask id="hero-arc-mask-1" fill="white">
        <path d="M255.539 48.471C187.766 48.471 122.768 75.3938 74.8456 123.317C26.9228 171.239 9e-6 236.237 3e-6 304.01C-3e-6 371.783 26.9228 436.78 74.8456 484.703C122.768 532.626 187.766 559.549 255.539 559.549L255.539 304.01L255.539 48.471Z"/>
      </mask>
      <path class="hero-arc hero-arc-1" d="M255.539 48.471C187.766 48.471 122.768 75.3938 74.8456 123.317C26.9228 171.239 9e-6 236.237 3e-6 304.01C-3e-6 371.783 26.9228 436.78 74.8456 484.703C122.768 532.626 187.766 559.549 255.539 559.549L255.539 304.01L255.539 48.471Z" stroke="#2F2F2F" stroke-width="3" mask="url(#hero-arc-mask-1)"/>

      <mask id="hero-arc-mask-2" fill="white">
        <path d="M613.975 0.0001C568.642 0.0001 525.166 18.0084 493.111 50.0632C461.057 82.1181 443.048 125.594 443.048 170.926C443.048 216.259 461.057 259.735 493.111 291.789C525.166 323.844 568.642 341.853 613.975 341.853L613.975 170.926L613.975 0.0001Z"/>
      </mask>
      <path class="hero-arc hero-arc-2" d="M613.975 0.0001C568.642 0.0001 525.166 18.0084 493.111 50.0632C461.057 82.1181 443.048 125.594 443.048 170.926C443.048 216.259 461.057 259.735 493.111 291.789C525.166 323.844 568.642 341.853 613.975 341.853L613.975 170.926L613.975 0.0001Z" stroke="#2F2F2F" stroke-width="3" mask="url(#hero-arc-mask-2)"/>

      <mask id="hero-arc-mask-3" fill="white">
        <path d="M511.929 88.4396C466.596 88.4396 423.121 106.448 391.066 138.503C359.011 170.558 341.003 214.033 341.003 259.366C341.003 304.698 359.011 348.174 391.066 380.229C423.121 412.284 466.596 430.292 511.929 430.292L511.929 259.366L511.929 88.4396Z"/>
      </mask>
      <path class="hero-arc hero-arc-3" d="M511.929 88.4396C466.596 88.4396 423.121 106.448 391.066 138.503C359.011 170.558 341.003 214.033 341.003 259.366C341.003 304.698 359.011 348.174 391.066 380.229C423.121 412.284 466.596 430.292 511.929 430.292L511.929 259.366L511.929 88.4396Z" stroke="#2F2F2F" stroke-width="3" mask="url(#hero-arc-mask-3)"/>

      <mask id="hero-arc-mask-4" fill="white">
        <path d="M405.206 0C338.786 0 275.086 26.43 228.12 73.4757C181.155 120.521 154.769 184.329 154.769 250.862C154.769 317.394 181.154 381.202 228.12 428.248C275.086 475.294 338.786 501.724 405.206 501.724L405.206 250.862L405.206 0Z"/>
      </mask>
      <path class="hero-arc hero-arc-4" d="M405.206 0C338.786 0 275.086 26.43 228.12 73.4757C181.155 120.521 154.769 184.329 154.769 250.862C154.769 317.394 181.154 381.202 228.12 428.248C275.086 475.294 338.786 501.724 405.206 501.724L405.206 250.862L405.206 0Z" stroke="#2F2F2F" stroke-width="3" mask="url(#hero-arc-mask-4)"/>

      <path class="hero-dash hero-dash-1" d="M255.256 559.997L733.611 559.997" stroke="#2F2F2F" stroke-width="1.5" stroke-dasharray="23 23"/>
      <path class="hero-dash hero-dash-2" d="M631.833 341.853H741.532" stroke="#2F2F2F" stroke-width="1.5" stroke-dasharray="23 23"/>
      <path class="hero-circle" d="M675.202 383.421C711.89 383.421 741.632 413.162 741.633 449.851C741.633 486.539 711.89 516.281 675.202 516.281C638.514 516.281 608.772 486.539 608.772 449.851C608.772 413.163 638.514 383.421 675.202 383.421Z" stroke="#2F2F2F" stroke-width="1.5"/>
    </svg>
  `;
  section.appendChild(illus);

  return section;
}

export function renderSections(container) {
  container.appendChild(createHeroSection());
  categories.forEach((cat) => {
    container.appendChild(createCategorySection(cat));
  });
}

export function initLazyLoading() {
  const root = document.getElementById('contentScroll');

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const iframe = entry.target.querySelector('.card-iframe');
        if (iframe?.dataset.src) {
          iframe.src = iframe.dataset.src;
          delete iframe.dataset.src;
        }
        observer.unobserve(entry.target);
      }
    },
    { root, rootMargin: '300px' },
  );

  document.querySelectorAll('.example-card-wrapper').forEach((w) => observer.observe(w));
}

// Stored reference so iframe load handlers (which fire async) can call it
let _openModal = null;

export function initDblClickExpand(openModalFn) {
  _openModal = openModalFn;
}
