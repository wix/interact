export function initSidebar() {
  const categoryList = document.getElementById('categoryList');
  const contentScroll = document.getElementById('contentScroll');
  if (!categoryList || !contentScroll) return;

  const allItems = () => Array.from(document.querySelectorAll('.category-item'));
  const sections = () => Array.from(document.querySelectorAll('.category-section'));

  let isProgrammaticScroll = false;
  let currentIndex = 0;
  let contentScrollTimeout;
  let sidebarScrollTimeout;

  function navigateToCategory(index, fromSidebarScroll = false) {
    const items = allItems();
    if (index < 0 || index >= items.length) return;

    const item = items[index];
    const targetId = item.dataset.target;
    const targetSection = document.getElementById(targetId);
    if (!targetSection) return;

    isProgrammaticScroll = true;
    currentIndex = index;

    items.forEach((i) => i.classList.remove('active'));
    item.classList.add('active');

    if (!fromSidebarScroll) {
      item.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    setTimeout(() => {
      isProgrammaticScroll = false;
    }, 1000);
  }

  categoryList.addEventListener('click', (e) => {
    const item = e.target.closest('.category-item');
    if (!item) return;
    const items = allItems();
    const index = items.indexOf(item);
    if (index !== -1) navigateToCategory(index);
  });

  contentScroll.addEventListener('scroll', () => {
    if (isProgrammaticScroll) return;

    clearTimeout(contentScrollTimeout);
    contentScrollTimeout = setTimeout(() => {
      if (isProgrammaticScroll) return;

      const secs = sections();
      const items = allItems();
      let activeSection = null;
      let minDistance = Infinity;

      secs.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const contentRect = contentScroll.getBoundingClientRect();
        const sectionTop = rect.top - contentRect.top;
        const distance = Math.abs(sectionTop);

        if (distance < minDistance) {
          minDistance = distance;
          activeSection = section;
        }
      });

      if (activeSection) {
        const targetId = activeSection.id;
        const newIndex = items.findIndex((item) => item.dataset.target === targetId);

        if (newIndex !== -1 && newIndex !== currentIndex) {
          currentIndex = newIndex;
          items.forEach((i) => i.classList.remove('active'));
          items[currentIndex].classList.add('active');

          isProgrammaticScroll = true;
          items[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => {
            isProgrammaticScroll = false;
          }, 500);
        }
      }
    }, 150);
  });

  categoryList.addEventListener('scroll', () => {
    if (isProgrammaticScroll) return;

    clearTimeout(sidebarScrollTimeout);
    sidebarScrollTimeout = setTimeout(() => {
      if (isProgrammaticScroll) return;

      const items = allItems();
      const rect = categoryList.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      let closestIndex = 0;
      let minDist = Infinity;

      items.forEach((item, index) => {
        const r = item.getBoundingClientRect();
        const dist = Math.abs(r.top + r.height / 2 - centerY);
        if (dist < minDist) {
          minDist = dist;
          closestIndex = index;
        }
      });

      if (closestIndex !== currentIndex) {
        navigateToCategory(closestIndex, true);
      }
    }, 200);
  });

  document.addEventListener('keydown', (e) => {
    if (document.querySelector('.modal-overlay.open')) return;
    if (e.key === 'ArrowDown' || e.key === 'j') {
      e.preventDefault();
      navigateToCategory(currentIndex + 1);
    } else if (e.key === 'ArrowUp' || e.key === 'k') {
      e.preventDefault();
      navigateToCategory(currentIndex - 1);
    }
  });
}
