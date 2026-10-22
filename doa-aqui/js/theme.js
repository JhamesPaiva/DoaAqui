(function () {
  'use strict';
  var key = 'doaaqui-theme';
  var root = document.documentElement;
  var preference = null;
  var system = window.matchMedia('(prefers-color-scheme: dark)');
  try { preference = localStorage.getItem(key); } catch (_) {}
  if (preference !== 'dark' && preference !== 'light') preference = null;

  function apply(theme) {
    root.dataset.theme = theme;
    var button = document.getElementById('theme-toggle');
    if (button) {
      button.setAttribute('aria-checked', String(theme === 'dark'));
      button.title = theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro';
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#151820' : '#BE1768';
  }

  // Apply before styles render, avoiding a light flash on subsequent visits.
  apply(preference || (system.matches ? 'dark' : 'light'));
  document.addEventListener('DOMContentLoaded', function () {
    var button = document.getElementById('theme-toggle');
    if (!button) return;
    apply(root.dataset.theme);
    button.hidden = false;
    button.addEventListener('click', function () {
      preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
      apply(preference);
      try { localStorage.setItem(key, preference); } catch (_) {}
    });
  });
  system.addEventListener('change', function () {
    if (!preference) apply(system.matches ? 'dark' : 'light');
  });
  window.addEventListener('storage', function (event) {
    if (event.key !== key && event.key !== null) return;
    preference = event.newValue === 'dark' || event.newValue === 'light' ? event.newValue : null;
    apply(preference || (system.matches ? 'dark' : 'light'));
  });
})();
