import { categories } from './config.js';

const EXPAND_SVG = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="10,2 14,2 14,6"/><polyline points="6,14 2,14 2,10"/><line x1="14" y1="2" x2="9" y2="7"/><line x1="2" y1="14" x2="7" y2="9"/></svg>`;

const IFRAME_BASE_WIDTH = 800;
const IFRAME_COMPACT_WIDTH = 500;

// Single shared observer — computes scale for all card iframes
const scaleObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const iframe = entry.target.querySelector('.card-iframe');
    if (!iframe) continue;
    const isCompact = entry.target.closest('.example-card')?.classList.contains('compact');
    const baseWidth = isCompact ? IFRAME_COMPACT_WIDTH : IFRAME_BASE_WIDTH;
    const scale = entry.contentRect.width / baseWidth;
    iframe.style.transform = `scale(${scale})`;
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
  iframe.dataset.src = example.htmlPath;
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
  iframe.setAttribute('loading', 'lazy');
  iframe.setAttribute('tabindex', '-1');
  iframe.title = example.title;

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
  } else {
    const grid = document.createElement('div');
    grid.className = category.compact ? 'examples-grid compact' : 'examples-grid';
    category.examples.forEach((ex) => {
      grid.appendChild(createExampleCard(ex, category.id, category.compact));
    });
    section.appendChild(grid);
  }

  return section;
}

export function renderSidebarItems(container) {
  categories.forEach((cat, index) => {
    const item = document.createElement('div');
    item.className = 'category-item' + (index === 0 ? ' active' : '');
    item.dataset.target = cat.id;
    item.textContent = cat.title;
    container.appendChild(item);
  });
}

export function renderSections(container) {
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
