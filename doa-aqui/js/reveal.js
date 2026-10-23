/* Reveal page sections as they enter the viewport, without hiding content when JS is unavailable. */
(function () {
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var selector = [
    '.hero-copy', '.hero-art', '.purpose-band', '.mural-head', '.search-box', '.filters', '#items-grid', '.grid .card',
    '.how > .wrap > h2', '.how > .wrap > .sub', '.how-photo', '.step', '.donate-close .wrap > *',
    '.profile-heading', '.profile-identity', '.profile-details', '.profile-activity', '.profile-actions', '.profile-danger',
    '.admin-head', '.admin-stat', '.admin-panel', '.admin-table tbody tr',
    '.legal-page .wrap > :not(.legal-back)', '.community-count', '.footer-grid > div', '.footer-nav', '.foot-bottom'
  ].join(',');

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('reveal-active');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -32px 0px' });

  function reveal(target) {
    target.classList.add('reveal-active');
    observer.unobserve(target);
  }

  function observeTarget(target) {
    if (target.classList.contains('reveal-target')) return;
    target.classList.add('reveal-target');

    var bounds = target.getBoundingClientRect();
    if (bounds.top < window.innerHeight && bounds.bottom > 0) {
      reveal(target);
    } else {
      observer.observe(target);
      target.addEventListener('focusin', function () { reveal(target); }, { once: true });
    }
  }

  function collect(root) {
    if (root.nodeType !== 1) return;
    if (root.matches(selector)) observeTarget(root);
    root.querySelectorAll(selector).forEach(observeTarget);
  }

  function revealVisibleTargets() {
    document.querySelectorAll('.reveal-target:not(.reveal-active)').forEach(function (target) {
      var bounds = target.getBoundingClientRect();
      if (bounds.top < window.innerHeight && bounds.bottom > 0) reveal(target);
    });
  }

  collect(document.documentElement);
  new MutationObserver(function (records) {
    var visibilityChanged = records.some(function (record) {
      return record.type === 'attributes' && record.attributeName === 'hidden';
    });
    records.forEach(function (record) {
      record.addedNodes.forEach(collect);
    });
    if (visibilityChanged) revealVisibleTargets();
  }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
})();
