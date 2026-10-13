/* Shared interaction and accessibility layer for the visual identity. */
(function () {
  document.querySelectorAll('[data-donate]').forEach(function(button) {
    button.addEventListener('click', function() { document.getElementById('btn-open-form').click(); });
  });
  document.querySelectorAll('.admin-table').forEach(function(table) {
    function labelCells() {
      var headings=Array.from(table.querySelectorAll('thead th')).map(function(th){return th.textContent;});
      table.querySelectorAll('tbody tr').forEach(function(row){Array.from(row.cells).forEach(function(cell,index){
        if(cell.colSpan===1) cell.dataset.label=headings[index] || '';
        var status=cell.querySelector('select');if(status)status.setAttribute('aria-label','Status de '+row.cells[0].textContent);
      });});
    }
    labelCells(); var body=table.querySelector('tbody');if(body)new MutationObserver(labelCells).observe(body,{childList:true,subtree:true});
  });
  var menu = document.querySelector('.menu-toggle');
  var nav = document.getElementById('main-nav');
  var filterToggle = document.getElementById('filter-toggle');
  if (filterToggle) {
    filterToggle.addEventListener('click', function () {
      var expanded = document.querySelector('.filters').classList.toggle('is-open');
      filterToggle.setAttribute('aria-expanded', String(expanded));
      filterToggle.textContent = expanded ? 'Ocultar filtros' : 'Mostrar filtros';
    });
  }
  if (menu && nav) {
    menu.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      menu.setAttribute('aria-expanded', String(open));
      menu.textContent = open ? 'Fechar menu' : 'Menu';
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { nav.classList.remove('is-open'); menu.setAttribute('aria-expanded','false'); menu.textContent='Menu'; }
    });
  }
  document.addEventListener('keydown',function(e){if(e.key==='Escape')window.doacaoAposLogin=false;});
  document.querySelectorAll('[data-close],.overlay').forEach(function(el){el.addEventListener('click',function(e){if(e.target===el || el.hasAttribute('data-close'))window.doacaoAposLogin=false;});});
  var active = null, previousFocus = null;
  var overlays = Array.from(document.querySelectorAll('.overlay'));
  overlays.forEach(function (overlay) {
    var modal = overlay.querySelector('.modal'), title = overlay.querySelector('.modal-head h3');
    modal.setAttribute('role','dialog'); modal.setAttribute('aria-modal','true'); modal.tabIndex=-1;
    if (title) { title.id=overlay.id+'-title'; modal.setAttribute('aria-labelledby',title.id); }
  });
  function focusable(el) { return Array.from(el.querySelectorAll('a[href],button,input,select,textarea,[tabindex="0"]')).filter(function(x){return !x.disabled && x.getClientRects().length;}); }
  function syncDialogs() {
    var open=overlays.find(function(o){return o.classList.contains('open');});
    if(open && open!==active) {
      if(!active) previousFocus=document.activeElement;
      active=open; document.body.style.overflow='hidden';
      Array.from(document.body.children).forEach(function(el){if(!el.classList.contains('overlay') && !el.classList.contains('toast') && el.tagName!=='SCRIPT')el.inert=true;});
      var first=open.querySelector('input:not([type=hidden]),select,textarea');
      (first || focusable(open)[0] || open.querySelector('.modal')).focus();
    } else if(!open && active) {
      active=null;document.body.style.overflow='';
      Array.from(document.body.children).forEach(function(el){el.inert=false;});
      if(previousFocus && previousFocus.isConnected) previousFocus.focus();
    }
  }
  var watcher = new MutationObserver(syncDialogs);
  overlays.forEach(function(o){watcher.observe(o,{attributes:true,attributeFilter:['class']});});
  document.addEventListener('keydown',function(e){
    if(e.key!=='Tab'||!active)return;
    var all=focusable(active);if(!all.length){e.preventDefault();return;}
    var first=all[0],last=all[all.length-1];
    if(e.shiftKey && document.activeElement===first){e.preventDefault();last.focus();}
    if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus();}
  });
  if('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    var reveal=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add('reveal-active');reveal.unobserve(entry.target);}});},{threshold:.1});
    document.querySelectorAll('.hero h1,.hero-bottom,.stat,.mural-head,.search-box,.step,.footer-grid>div,.admin-stat').forEach(function(el){reveal.observe(el);});
  }
})();
