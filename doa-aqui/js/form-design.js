/* Rich form layouts share the existing forms and backend contracts. */
(function () {
  var settings = {
    'login-overlay': {type:'account',title:'Bom ter você de volta.',copy:'Suas doações. Suas conexões. Novas histórias para continuar.',heading:'Entre na sua conta',intro:'Acompanhe o que você já colocou em movimento.'},
    'cadastro-overlay': {type:'account',title:'Toda boa troca começa com alguém.',copy:'Faça parte de uma comunidade que dá novos destinos ao que já existe.',heading:'Vamos nos conhecer?',intro:'Crie sua conta para doar e acompanhar seus anúncios.'},
    'form-overlay': {type:'donation',title:'Uma nova história começa aqui.',copy:'Conte um pouco sobre o item. Uma boa descrição ajuda a encontrar a pessoa certa.',heading:'O que você quer doar?',intro:'Preencha os detalhes e prepare seu item para um novo começo.'},
    'edit-overlay': {type:'donation',title:'Cada detalhe faz diferença.',copy:'Mantenha as informações do anúncio claras e atualizadas.',heading:'Vamos ajustar seu anúncio',intro:'Revise os detalhes antes de salvar as alterações.'},
    'reject-overlay': {type:'compact',heading:'Revisar publicação',intro:'Explique o que precisa ser ajustado. Essa orientação ajuda o doador a melhorar o anúncio.'}
  };
  Object.keys(settings).forEach(function(id){
    var overlay=document.getElementById(id);if(!overlay)return;
    var config=settings[id],modal=overlay.querySelector('.modal'),body=overlay.querySelector('.modal-body'),head=overlay.querySelector('.modal-head');
    modal.classList.add('form-studio', 'studio-'+config.type);
    head.querySelector('h3').textContent=config.heading;
    var intro=body.querySelector('.form-intro');if(intro)intro.remove();
    var subtitle=document.createElement('p');subtitle.className='studio-intro';subtitle.textContent=config.intro;head.querySelector('h3').after(subtitle);
    if(config.type!=='compact'){
      var aside=document.createElement('aside');aside.className='studio-story';
      aside.innerHTML='<div class="studio-brand"><img src="assets/brand.svg" alt="" width="32" height="32">DoaAqui</div><div class="story-copy"><p class="story-title"></p><p class="story-description"></p></div>';
      aside.querySelector('.story-title').textContent=config.title;aside.querySelector('.story-description').textContent=config.copy;
      if(config.type==='account'){
        var picture=document.createElement('div');picture.className='story-picture';picture.innerHTML='<img src="assets/objetos-doacao.png" alt="Composição ilustrativa de objetos para doação" width="1536" height="1024"><span aria-hidden="true">Daqui para<br>um novo começo.</span>';aside.append(picture);
      }else{
        var summary=document.createElement('div');summary.className='donation-preview';summary.innerHTML='<span class="preview-label">Seu anúncio começa assim</span><div class="preview-picture" aria-hidden="true">↗</div><strong class="preview-title">Um item. Muitas possibilidades.</strong><span class="preview-category">Categoria e bairro</span><p>Depois de aprovado, ele aparece no mural da comunidade.</p>';aside.append(summary);
        var prefix=id==='edit-overlay'?'e':'f';
        function update(){var title=document.getElementById(prefix+'-title'),category=document.getElementById(prefix+'-category'),location=document.getElementById(prefix+'-location');summary.querySelector('.preview-title').textContent=title.value.trim()||'Um item. Muitas possibilidades.';summary.querySelector('.preview-category').textContent=[category.value,location.value].filter(Boolean).join(' · ')||'Categoria e bairro';}
        modal.addEventListener('input',update);modal.addEventListener('change',update);new MutationObserver(update).observe(overlay,{attributes:true,attributeFilter:['class']});
      }
      modal.prepend(aside);
    }
    var form=body.querySelector('form');if(!form)return;
    var alert=document.createElement('p');alert.className='form-feedback';alert.id=form.id+'-feedback';alert.setAttribute('role','alert');alert.hidden=true;form.prepend(alert);
    if(config.type==='donation'){
      var first=form.querySelector('.field');var section=document.createElement('div');section.className='form-section-heading';section.innerHTML='<span aria-hidden="true">01</span><div><h4>Sobre o item</h4><p>O essencial para conhecer sua doação.</p></div>';first.before(section);
      var upload=form.querySelector('input[type=file]');if(upload){var sectionPhoto=section.cloneNode(true);sectionPhoto.querySelector('span').textContent='02';sectionPhoto.querySelector('h4').textContent='Mostre os detalhes';sectionPhoto.querySelector('p').textContent='Uma foto ajuda a visualizar o estado do item.';upload.closest('.field').before(sectionPhoto);}
    }
    form.querySelectorAll('input[type=password]').forEach(function(input){var shell=document.createElement('div');shell.className='password-control';input.before(shell);shell.append(input);var toggle=document.createElement('button');toggle.type='button';toggle.className='password-toggle';toggle.textContent='Mostrar';toggle.setAttribute('aria-label','Mostrar '+(input.id==='c-confirma'?'confirmação de senha':'senha'));toggle.setAttribute('aria-pressed','false');toggle.addEventListener('click',function(){var visible=input.type==='password';input.type=visible?'text':'password';toggle.textContent=visible?'Ocultar':'Mostrar';toggle.setAttribute('aria-pressed',String(visible));toggle.setAttribute('aria-label',(visible?'Ocultar ':'Mostrar ')+(input.id==='c-confirma'?'confirmação de senha':'senha'));});shell.append(toggle);});
    form.querySelectorAll('input:not([type=hidden]):not([type=file]),select,textarea').forEach(function(input){var error=document.createElement('span');error.className='field-error';error.id=input.id+'-error';error.hidden=true;input.closest('.field').append(error);input.setAttribute('aria-describedby',[input.getAttribute('aria-describedby'),error.id].filter(Boolean).join(' '));function validate(){var invalid=!input.validity.valid;input.setAttribute('aria-invalid',String(invalid));error.hidden=!invalid;error.textContent=invalid?input.validationMessage:'';}input.addEventListener('blur',function(){if(input.value)validate();});input.addEventListener('input',function(){input.setCustomValidity('');if(input.getAttribute('aria-invalid')==='true')validate();alert.hidden=true;});input.addEventListener('invalid',validate);});
    form.addEventListener('submit',function(event){if(!form.checkValidity()){event.preventDefault();event.stopImmediatePropagation();var invalid=form.querySelector(':invalid');if(invalid)invalid.focus();}},true);form.noValidate=true;
    form.addEventListener('reset',function(){alert.hidden=true;form.querySelectorAll('[aria-invalid]').forEach(function(input){input.removeAttribute('aria-invalid');input.setCustomValidity('');});form.querySelectorAll('.field-error').forEach(function(error){error.hidden=true;});form.querySelectorAll('.password-toggle').forEach(function(toggle){toggle.previousElementSibling.type='password';toggle.textContent='Mostrar';toggle.setAttribute('aria-pressed','false');});});
  });
  window.formFeedback=function(form,message,fieldId){var feedback=form.querySelector('.form-feedback');if(feedback){feedback.textContent=message;feedback.hidden=false;}if(fieldId){var input=document.getElementById(fieldId);input.setAttribute('aria-invalid','true');input.focus();}};
  document.querySelectorAll('.form-studio input[type=file]').forEach(function(input){
    input.removeAttribute('style');input.className='studio-file';var label=input.previousElementSibling;
    if(!label || !label.classList.contains('upload-box'))return;
    var zone=document.createElement('div');zone.className='upload-zone';label.before(zone);zone.append(label,input);label.insertAdjacentHTML('afterbegin','<span class="upload-symbol" aria-hidden="true">＋</span>');
    var preview=document.createElement('img');preview.className='studio-upload-preview';preview.alt='Prévia da foto selecionada';preview.hidden=true;zone.append(preview);
    var remove=document.createElement('button');remove.type='button';remove.className='remove-photo';remove.textContent='Remover foto selecionada';remove.hidden=true;zone.after(remove);
    var photoUrl;
    function refresh(){if(photoUrl)URL.revokeObjectURL(photoUrl);var file=input.files[0];var valid=!file||(['image/jpeg','image/png','image/webp'].includes(file.type)&&file.size<=5*1024*1024);input.setCustomValidity(valid?'':'Escolha uma imagem JPG, PNG ou WEBP de até 5 MB.');if(!valid){window.formFeedback(input.form,input.validationMessage);input.value='';input.setCustomValidity('');file=null;}preview.hidden=!file;remove.hidden=!file;zone.classList.toggle('has-photo',!!file);if(file){photoUrl=URL.createObjectURL(file);preview.src=photoUrl;}else preview.removeAttribute('src');}
    input.addEventListener('change',refresh);input.form.addEventListener('reset',function(){setTimeout(refresh,0);});remove.addEventListener('click',function(){input.value='';input.setCustomValidity('');input.dispatchEvent(new Event('change',{bubbles:true}));input.focus();});
  });
})();

/* Field-only refinement: retain native controls, names, labels and validation. */
(function () {
  var paths={
    email:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>',
    person:'<circle cx="12" cy="8" r="3.5"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/>',
    lock:'<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/>',
    phone:'<path d="m8 3 2 5-3 2a16 16 0 0 0 7 7l2-3 5 2v3a2 2 0 0 1-2 2A18 18 0 0 1 3 5a2 2 0 0 1 2-2Z"/>',
    location:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
    category:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    text:'<path d="M5 5h14M5 10h14M5 15h9M5 20h6"/>',
    item:'<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 5v9l9 5 9-5V8M12 13v9M7.5 5.5l9 5"/>'
  };
  document.querySelectorAll('.form-studio .field').forEach(function(field){
    var input=field.querySelector('input:not([type=hidden]):not([type=file]),select,textarea');if(!input)return;
    var label=field.querySelector('label[for="'+input.id+'"]');if(!label)return;
    var shell=document.createElement('div');shell.className='control-surface';
    if(input.tagName==='TEXTAREA')shell.classList.add('control-multiline');
    if(input.tagName==='SELECT')shell.classList.add('control-select');
    var control=input.closest('.password-control')||input;
    label.before(shell);shell.append(label,control);label.classList.add('control-label');
    var kind=/senha|confirma/.test(input.id)?'lock':input.type==='email'?'email':/nome/.test(input.id)?'person':/telefone|contact/.test(input.id)?'phone':/location/.test(input.id)?'location':/category/.test(input.id)?'category':input.tagName==='TEXTAREA'?'text':'item';
    var icon=document.createElement('span');icon.className='control-icon';icon.setAttribute('aria-hidden','true');icon.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'+paths[kind]+'</svg>';shell.append(icon);
    function sync(){shell.classList.toggle('has-value',!!input.value);}
    input.addEventListener('input',sync);input.addEventListener('change',sync);input.form.addEventListener('reset',function(){setTimeout(sync,0);});
    var overlay=field.closest('.overlay');if(overlay)new MutationObserver(sync).observe(overlay,{attributes:true,attributeFilter:['class']});sync();
  });
})();
