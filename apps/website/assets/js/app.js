import {
  renderSidebarItems,
  renderSections,
  initLazyLoading,
  initDblClickExpand,
} from './renderer.js';
import { initSidebar } from './sidebar.js';
import { openModal, initModal } from './modal.js';

document.addEventListener('DOMContentLoaded', () => {
  const categoryList = document.getElementById('categoryList');
  const contentScroll = document.getElementById('contentScroll');

  renderSidebarItems(categoryList);
  renderSections(contentScroll);
  initLazyLoading();

  // Reveal footer when content is scrolled to the bottom
  const footer = document.querySelector('body > footer');
  if (footer && contentScroll) {
    contentScroll.addEventListener('scroll', () => {
      const atBottom =
        contentScroll.scrollHeight - contentScroll.scrollTop - contentScroll.clientHeight < 80;
      footer.classList.toggle('visible', atBottom);
    });
  }
  initDblClickExpand(openModal);
  initSidebar();
  initModal();
});
