/**
 * Shared footer — single source of truth across all pages.
 *
 * Options via data attributes on the placeholder:
 *   data-interact   — wrap elements in <interact-element> for entrance animations
 */
(function () {
  var REPO = 'https://github.com/wix-incubator/interact';
  var NPM = 'https://www.npmjs.com/package/@wix/interact';
  var YEAR = new Date().getFullYear();

  var el = document.getElementById('shared-footer');
  if (!el) return;

  var useInteract = el.hasAttribute('data-interact');

  var brandInner =
    '<div>' +
    '<h2 class="text-lg font-medium uppercase">● Interact</h2>' +
    '<p class="text-sm text-gray-400 mt-2">© ' +
    YEAR +
    '</p>' +
    '</div>';

  var linksInner =
    '<div class="flex gap-6">' +
    '<a href="' +
    NPM +
    '" target="_blank" class="text-lg font-light hover:text-gray-500 transition-colors no-underline text-white">NPM</a>' +
    '<a href="' +
    REPO +
    '" target="_blank" class="text-lg font-light hover:text-gray-500 transition-colors no-underline text-white">Github</a>' +
    '</div>';

  var brand = useInteract
    ? '<interact-element data-interact-key="footer-brand" data-interact-initial="true">' +
      brandInner +
      '</interact-element>'
    : brandInner;

  var links = useInteract
    ? '<interact-element data-interact-key="footer-link" data-interact-initial="true">' +
      linksInner +
      '</interact-element>'
    : linksInner;

  var footer = document.createElement('footer');
  footer.className =
    'bg-off-black text-white py-12 px-6 md:px-12 border-t border-gray-800 flex justify-between items-end';
  footer.innerHTML = brand + links;
  el.replaceWith(footer);
})();
