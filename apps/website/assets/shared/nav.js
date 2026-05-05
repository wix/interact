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

  // Build links
  var linksHtml = '';
  for (var i = 0; i < LINKS.length; i++) {
    var link = LINKS[i];
    var active = isActive(link.href);
    linksHtml +=
      '<a href="' +
      link.href +
      '" class="text-sm font-light hover:opacity-70 transition-opacity no-underline text-white' +
      (active ? ' opacity-80' : '') +
      '">' +
      link.label +
      '</a>';
  }

  var logoHtml =
    '<a href="/" class="text-sm font-medium tracking-wide uppercase no-underline text-white">● Interact</a>';
  var ctaHtml =
    '<a href="' +
    REPO +
    '" target="_blank" class="text-sm font-medium border border-black px-6 py-2 rounded-full bg-white text-off-black hover:bg-black hover:text-white hover:border-white transition-colors duration-300 no-underline">Go to Repository ↗</a>';

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
  nav.className =
    'fixed top-0 w-full z-50 px-6 py-6 md:px-12 flex justify-between items-center text-white';
  nav.style.cssText =
    'background:linear-gradient(to bottom,#111111,transparent);line-height:1.5;-webkit-font-smoothing:antialiased;font-family:Inter,system-ui,sans-serif';

  nav.innerHTML =
    logo +
    '<div class="flex items-center gap-10">' +
    '<div class="hidden md:flex items-center gap-10">' +
    linksHtml +
    '</div>' +
    cta +
    '</div>';

  el.replaceWith(nav);
})();
