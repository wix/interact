let overlay;
let titleEl;
let iframe;
let codeBtn;
let previewPanel;
let codePanel;
let cmEditor = null;
let cmWrapper = null;
let originalSource = '';
let htmlSource = '';
let isCodeMode = false;

const CLOSE_SVG = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg>`;
const CODE_SVG = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="5,3 1,8 5,13"/><polyline points="11,3 15,8 11,13"/></svg>`;
const RESET_SVG = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 4v5h5"/><path d="M3.51 10a6 6 0 1 0 .49-5.87L1 7"/></svg>`;
const CHEVRON_UP_SVG = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4,10 8,6 12,10"/></svg>`;
const CHEVRON_DOWN_SVG = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4,6 8,10 12,6"/></svg>`;
const CLOSE_SM_SVG = `<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg>`;

// --- Search state ---
let searchBar = null;
let searchInput = null;
let searchCount = null;
let searchMarks = [];
let searchMatches = [];
let searchIndex = -1;

function buildModalDOM() {
  overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.setAttribute('tabindex', '-1');

  const wrapper = document.createElement('div');
  wrapper.className = 'modal-wrapper';

  titleEl = document.createElement('div');
  titleEl.className = 'modal-title';

  const container = document.createElement('div');
  container.className = 'modal-container';

  previewPanel = document.createElement('div');
  previewPanel.className = 'modal-panel modal-preview';

  iframe = document.createElement('iframe');
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
  previewPanel.appendChild(iframe);
  container.appendChild(previewPanel);

  codePanel = document.createElement('div');
  codePanel.className = 'modal-panel modal-code';

  const codeToolbar = document.createElement('div');
  codeToolbar.className = 'code-toolbar';

  const resetBtn = document.createElement('button');
  resetBtn.className = 'code-reset-btn';
  resetBtn.textContent = 'Reset';
  resetBtn.addEventListener('click', resetCode);
  codeToolbar.appendChild(resetBtn);

  codePanel.appendChild(codeToolbar);

  cmWrapper = document.createElement('div');
  cmWrapper.className = 'code-editor-wrap';
  codePanel.appendChild(cmWrapper);

  // Custom search bar
  searchBar = document.createElement('div');
  searchBar.className = 'code-search-bar';

  searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Find...';
  searchInput.addEventListener('input', runSearch);
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) searchPrev();
      else searchNext();
    }
    if (e.key === 'Escape') closeSearch();
  });

  searchCount = document.createElement('span');
  searchCount.className = 'code-search-count';

  const searchNav = document.createElement('div');
  searchNav.className = 'code-search-nav';

  const prevBtn = document.createElement('button');
  prevBtn.innerHTML = CHEVRON_UP_SVG;
  prevBtn.setAttribute('aria-label', 'Previous match');
  prevBtn.addEventListener('click', searchPrev);

  const nextBtn = document.createElement('button');
  nextBtn.innerHTML = CHEVRON_DOWN_SVG;
  nextBtn.setAttribute('aria-label', 'Next match');
  nextBtn.addEventListener('click', searchNext);

  searchNav.appendChild(prevBtn);
  searchNav.appendChild(nextBtn);

  const searchCloseBtn = document.createElement('button');
  searchCloseBtn.className = 'code-search-close';
  searchCloseBtn.innerHTML = CLOSE_SM_SVG;
  searchCloseBtn.setAttribute('aria-label', 'Close search');
  searchCloseBtn.addEventListener('click', closeSearch);

  searchBar.appendChild(searchInput);
  searchBar.appendChild(searchCount);
  searchBar.appendChild(searchNav);
  searchBar.appendChild(searchCloseBtn);
  codePanel.appendChild(searchBar);

  container.appendChild(codePanel);

  const actions = document.createElement('div');
  actions.className = 'modal-actions';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'modal-btn modal-btn-close';
  closeBtn.innerHTML = CLOSE_SVG;
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.addEventListener('click', closeModal);

  codeBtn = document.createElement('button');
  codeBtn.className = 'modal-btn modal-btn-code';
  codeBtn.innerHTML = CODE_SVG;
  codeBtn.setAttribute('aria-label', 'Toggle code');
  codeBtn.addEventListener('click', toggleCodeMode);

  actions.appendChild(closeBtn);
  actions.appendChild(codeBtn);

  wrapper.appendChild(titleEl);
  wrapper.appendChild(container);
  wrapper.appendChild(actions);
  overlay.appendChild(wrapper);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  document.body.appendChild(overlay);
}

function ensureEditor() {
  if (cmEditor) return;
  cmEditor = CodeMirror(cmWrapper, {
    value: '',
    mode: 'htmlmixed',
    theme: 'material-darker',
    lineNumbers: true,
    lineWrapping: false,
    tabSize: 2,
    indentWithTabs: false,
    matchBrackets: true,
    autoCloseTags: true,
    scrollbarStyle: 'native',
    extraKeys: {
      'Cmd-F': () => openSearch(),
      'Ctrl-F': () => openSearch(),
    },
  });
}

function resetCode() {
  if (!cmEditor) return;
  cmEditor.setValue(originalSource);
  htmlSource = originalSource;
}

function toggleCodeMode() {
  isCodeMode = !isCodeMode;

  if (isCodeMode) {
    try {
      ensureEditor();
      cmEditor.setValue(htmlSource);
      previewPanel.classList.add('hidden');
      codePanel.classList.add('visible');
      codeBtn.classList.add('active');
      setTimeout(() => cmEditor.refresh(), 20);
    } catch (e) {
      console.error('[modal] toggleCodeMode error:', e);
      isCodeMode = false; // revert
    }
  } else {
    closeSearch();
    htmlSource = cmEditor.getValue();
    iframe.removeAttribute('src');
    iframe.srcdoc = htmlSource;
    previewPanel.classList.remove('hidden');
    codePanel.classList.remove('visible');
    codeBtn.classList.remove('active');
  }
}

// --- Search functions ---
function openSearch() {
  if (!searchBar) return;
  searchBar.classList.add('open');
  searchInput.focus();
  searchInput.select();
}

function closeSearch() {
  if (!searchBar) return;
  searchBar.classList.remove('open');
  searchInput.value = '';
  clearSearchMarks();
  searchCount.textContent = '';
  searchCount.classList.remove('has-matches');
  if (cmEditor) cmEditor.focus();
}

function clearSearchMarks() {
  searchMarks.forEach((m) => m.clear());
  searchMarks = [];
  searchMatches = [];
  searchIndex = -1;
}

function runSearch() {
  if (!cmEditor) return;
  clearSearchMarks();

  const query = searchInput.value;
  if (!query) {
    searchCount.textContent = '';
    searchCount.classList.remove('has-matches');
    return;
  }

  const cursor = cmEditor.getSearchCursor(query, null, { caseFold: true });
  while (cursor.findNext()) {
    searchMatches.push({ from: cursor.from(), to: cursor.to() });
    searchMarks.push(
      cmEditor.markText(cursor.from(), cursor.to(), { className: 'cm-search-match' }),
    );
  }

  if (searchMatches.length > 0) {
    searchIndex = 0;
    highlightCurrent();
    searchCount.classList.add('has-matches');
  } else {
    searchCount.textContent = 'No results';
    searchCount.classList.remove('has-matches');
  }
}

function highlightCurrent() {
  // Reset all to base highlight
  searchMarks.forEach((m) => m.clear());
  searchMarks = searchMatches.map((m, i) =>
    cmEditor.markText(m.from, m.to, {
      className: i === searchIndex ? 'cm-search-match-current' : 'cm-search-match',
    }),
  );

  searchCount.textContent = `${searchIndex + 1} of ${searchMatches.length}`;
  cmEditor.scrollIntoView(searchMatches[searchIndex].from, 100);
}

function searchNext() {
  if (searchMatches.length === 0) return;
  searchIndex = (searchIndex + 1) % searchMatches.length;
  highlightCurrent();
}

function searchPrev() {
  if (searchMatches.length === 0) return;
  searchIndex = (searchIndex - 1 + searchMatches.length) % searchMatches.length;
  highlightCurrent();
}

export function openModal(title, htmlPath) {
  if (!overlay) buildModalDOM();

  isCodeMode = false;
  previewPanel.classList.remove('hidden');
  codePanel.classList.remove('visible');
  codeBtn.classList.remove('active');

  titleEl.textContent = title;
  iframe.src = htmlPath + `?_=${Date.now()}`;
  iframe.removeAttribute('srcdoc');

  // Listen for Escape inside the modal iframe (it captures focus on click)
  iframe.addEventListener('load', function onLoad() {
    try {
      iframe.contentDocument.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
      });
    } catch (e) { /* cross-origin */ }
    iframe.removeEventListener('load', onLoad);
  });

  fetch(htmlPath)
    .then((r) => r.text())
    .then((text) => {
      originalSource = text;
      htmlSource = text;
    })
    .catch(() => {
      originalSource = '';
      htmlSource = '';
    });

  requestAnimationFrame(() => {
    overlay.classList.add('open');
    overlay.focus();
  });

  document.body.style.overflow = 'hidden';
}

export function closeModal() {
  if (!overlay) return;

  overlay.classList.remove('open');
  document.body.style.overflow = '';

  setTimeout(() => {
    iframe.src = 'about:blank';
    iframe.removeAttribute('srcdoc');
    originalSource = '';
    htmlSource = '';
    isCodeMode = false;
    previewPanel.classList.remove('hidden');
    codePanel.classList.remove('visible');
    codeBtn.classList.remove('active');
    if (cmEditor) cmEditor.setValue('');
  }, 350);
}

export function initModal() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  document.addEventListener('click', (e) => {
    // Expand button opens modal
    const expandBtn = e.target.closest('.expand-btn');
    if (expandBtn) {
      const card = expandBtn.closest('.example-card');
      if (card) openModal(card.dataset.title, card.dataset.htmlPath);
      return;
    }

    // Label opens modal
    const label = e.target.closest('.example-label');
    if (label) {
      const wrapper = label.closest('.example-card-wrapper');
      const card = wrapper?.querySelector('.example-card');
      if (card) openModal(card.dataset.title, card.dataset.htmlPath);
    }
  });

}
