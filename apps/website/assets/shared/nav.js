/**
 * Shared navigation — single source of truth across all pages.
 *
 * Options via data attributes on the placeholder:
 *   data-interact   — wrap logo + CTA in <interact-element> for entrance animations
 */
(function () {
  var LINKS = [
    { label: 'Docs', href: '#' },
    { label: 'Examples', href: '/examples.html' },
  ];
  var REPO = 'https://github.com/wix-incubator/interact';

  var el = document.getElementById('shared-nav');
  if (!el) return;

  var useInteract = el.hasAttribute('data-interact');
  var path = window.location.pathname.replace(/\/index\.html$/, '/');

  function isActive(href) {
    if (href === '/') return path === '/' || path === '/index.html';
    return path.indexOf(href) === 0;
  }

  var linksHtml = '';
  for (var i = 0; i < LINKS.length; i++) {
    var link = LINKS[i];
    var active = isActive(link.href);
    linksHtml +=
      '<a href="' +
      link.href +
      '" class="nav-link' +
      (active ? ' is-active' : '') +
      '">' +
      link.label +
      '</a>';
  }

  var logoHtml = '<a href="/" class="nav-logo">● Interact</a>';
  var ctaHtml =
    '<a href="' +
    REPO +
    '" target="_blank" rel="noopener noreferrer" class="nav-cta">Go to Repository ↗</a>';

  var logo = useInteract
    ? '<interact-element data-interact-key="nav-logo" data-interact-initial="true">' +
      logoHtml +
      '</interact-element>'
    : logoHtml;

  var cta = useInteract
    ? '<interact-element data-interact-key="nav-cta" data-interact-initial="true">' +
      ctaHtml +
      '</interact-element>'
    : ctaHtml;

  var nav = document.createElement('nav');
  nav.className = 'site-nav';
  nav.innerHTML =
    logo +
    '<div class="nav-actions">' +
    '<div class="nav-links">' +
    linksHtml +
    '</div>' +
    cta +
    '</div>';

  el.replaceWith(nav);
})();
