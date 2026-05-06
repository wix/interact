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
    '<div class="footer-brand">' + '<h2>● Interact</h2>' + '<p>© ' + YEAR + '</p>' + '</div>';

  var linksInner =
    '<div class="footer-links">' +
    '<a href="' +
    NPM +
    '" target="_blank" rel="noopener noreferrer" class="footer-link">NPM</a>' +
    '<a href="' +
    REPO +
    '" target="_blank" rel="noopener noreferrer" class="footer-link">Github</a>' +
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
  footer.className = 'site-footer';
  footer.innerHTML = brand + links;
  el.replaceWith(footer);
})();
