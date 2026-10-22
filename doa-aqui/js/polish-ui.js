/* Shared, progressive enhancements for the donation experience. */
(function () {
  document.querySelectorAll('.studio-donation').forEach(function (modal) {
    var form = modal.querySelector('form');
    if (!form || form.id !== 'new-item-form') return;
    var summary = modal.querySelector('.donation-preview');
    var picture = summary.querySelector('.preview-picture');
    picture.textContent = '';
    picture.removeAttribute('aria-hidden');
    var image = document.createElement('img'); image.alt = 'Prévia do item no anúncio'; image.hidden = true;
    var placeholder = document.createElement('span'); placeholder.textContent = 'Sua foto aparece aqui';
    picture.append(image, placeholder);
    var description = document.createElement('p'); description.className = 'preview-description';
    summary.querySelector('.preview-category').after(description);
    summary.querySelector('.preview-label').textContent = 'Prévia do seu anúncio';
    var progress = document.createElement('div'); progress.className = 'donation-progress';
    var label = document.createElement('p'); label.id = 'donation-progress-label';
    var meter = document.createElement('progress'); meter.max = 4; meter.value = 0; meter.setAttribute('aria-labelledby', label.id);
    var checklist = document.createElement('ul'); checklist.className = 'donation-checklist';
    var fields = ['f-title','f-category','f-location','f-desc'].map(function (id) { return document.getElementById(id); });
    var names = ['Nome','Categoria','Bairro','Descrição'];
    names.forEach(function (name) { var item=document.createElement('li'); item.textContent=name; checklist.append(item); });
    progress.append(label,meter,checklist); form.prepend(progress);
    var mobile = document.createElement('details'); mobile.className = 'mobile-donation-preview';
    var toggle = document.createElement('summary'); toggle.textContent = 'Ver prévia do anúncio'; mobile.append(toggle); progress.after(mobile);
    var story = modal.querySelector('.studio-story'); var compact = matchMedia('(max-width:720px)');
    function position() { if(compact.matches)mobile.append(summary);else story.append(summary); }
    compact.addEventListener('change',position); position();
    var photo = document.getElementById('f-foto'), currentFile, objectUrl;
    function update() {
      summary.querySelector('.preview-title').textContent = fields[0].value.trim() || 'Um item. Muitas possibilidades.';
      summary.querySelector('.preview-category').textContent = [fields[1].value, fields[2].value].filter(Boolean).join(' · ') || 'Categoria e bairro';
      var count = 0;
      fields.forEach(function (field,index) {
        var complete = !!field.value.trim() && field.validity.valid;
        if(complete) count++;
        checklist.children[index].classList.toggle('is-complete',complete);
        checklist.children[index].setAttribute('aria-label',names[index]+(complete ? ': preenchido' : ': pendente'));
      });
      meter.value=count; label.textContent=count===4 ? 'Informações prontas para revisão' : count+' de 4 informações preenchidas';
      description.textContent=document.getElementById('f-desc').value.trim() || 'A descrição do estado do item aparecerá aqui.';
      var file=photo.files[0];
      if(file!==currentFile){
        if(objectUrl)URL.revokeObjectURL(objectUrl);
        currentFile=file; objectUrl=null;
        if(file && file.size<=5*1024*1024 && ['image/jpeg','image/png','image/webp'].includes(file.type)) objectUrl=URL.createObjectURL(file);
        image.hidden=!objectUrl;placeholder.hidden=!!objectUrl;
        if(objectUrl)image.src=objectUrl;else image.removeAttribute('src');
      }
    }
    form.addEventListener('input',update);form.addEventListener('change',update);
    form.addEventListener('reset',function(){setTimeout(function(){currentFile=undefined; if(objectUrl)URL.revokeObjectURL(objectUrl);objectUrl=null;image.hidden=true;image.removeAttribute('src');placeholder.hidden=false;update();},0);});
    new MutationObserver(update).observe(modal.closest('.overlay'),{attributes:true,attributeFilter:['class']});update();
  });
})();

function desenhaFiltrosAtivos() {
  var container=document.getElementById('active-filters'); if(!container)return;
  var hadFocus=container.contains(document.activeElement); container.replaceChildren();
  function chip(text,remove){
    var button=document.createElement('button');button.type='button';button.className='active-filter';button.textContent=text+' ×';button.setAttribute('aria-label','Remover filtro: '+text);
    button.addEventListener('click',function(){remove();desenhaGrade();});container.append(button);
  }
  if(filtroAtual.busca)chip('Busca: '+filtroAtual.busca,function(){filtroAtual.busca='';document.getElementById('search-input').value='';});
  if(filtroAtual.local)chip(filtroAtual.local,function(){filtroAtual.local='';document.getElementById('location-filter').value='';});
  if(filtroAtual.categorias.size!==listaCategorias().length)chip('Categorias: '+(filtroAtual.categorias.size ? Array.from(filtroAtual.categorias).join(', ') : 'nenhuma'),function(){filtroAtual.categorias=new Set(listaCategorias());document.querySelectorAll('.cat-filter').forEach(function(c){c.checked=true;});});
  if(filtroAtual.status.size!==3)chip('Status: '+(filtroAtual.status.size ? Array.from(filtroAtual.status).join(', ') : 'nenhum'),function(){filtroAtual.status=new Set(['Disponível','Reservado','Doado']);document.querySelectorAll('.status-filter').forEach(function(c){c.checked=true;});});
  container.hidden=!container.childElementCount;
  if(hadFocus){var next=container.querySelector('button')||document.getElementById('search-input');next.focus();}
}
