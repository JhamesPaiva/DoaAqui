(async function () {
  var state=document.getElementById('profile-state');
  var content=document.getElementById('profile-content');
  var response=await apiFetch('/auth/me.php');
  if(!response.ok){state.textContent='Não foi possível carregar seu perfil. Atualize a página para tentar novamente.';return;}
  if(!response.usuario){window.location.replace('index.html?perfil=1');return;}
  sessao=response.usuario;atualizaCabecalho();
  document.getElementById('profile-name').textContent=sessao.nome;
  renderProfileAvatar(document.getElementById('profile-avatar'), sessao);
  document.getElementById('profile-email').textContent=sessao.email;
  document.getElementById('profile-fullname').textContent=sessao.nome;
  document.getElementById('profile-phone').textContent=sessao.telefone||'Não informado';
  document.getElementById('profile-type').textContent=sessao.tipo==='admin'?'Administrador':'Membro da comunidade';
  document.getElementById('profile-admin').hidden=sessao.tipo!=='admin';
  content.hidden=false;state.hidden=true;
  var donations=await apiFetch('/meus-anuncios/listar.php');
  if(donations.ok){
    document.getElementById('profile-pending').textContent=donations.pendentes.length;
    document.getElementById('profile-published').textContent=donations.publicados.length;
    document.getElementById('profile-donated').textContent=donations.publicados.filter(function(item){return item.status==='Doado';}).length;
  }else{document.getElementById('profile-stats-note').textContent='Não foi possível carregar o resumo das doações.';}
})();
function mostraAviso(message){document.getElementById('profile-state').textContent=message;}
var profileMenu=document.querySelector('.menu-toggle');
profileMenu.addEventListener('click',function(){var open=document.getElementById('main-nav').classList.toggle('is-open');profileMenu.setAttribute('aria-expanded',String(open));profileMenu.textContent=open?'Fechar menu':'Menu';});

var photoForm = document.getElementById('profile-photo-form');
var photoInput = document.getElementById('profile-photo');
var photoEditor = document.getElementById('profile-photo-editor');
var editPhotoButton = document.getElementById('edit-profile-photo');
var cancelPhotoButton = document.getElementById('cancel-profile-photo');
var savePhotoButton = document.getElementById('save-profile-photo');
var photoName = document.getElementById('profile-photo-name');
var photoFeedback = document.getElementById('photo-feedback');
var defaultPhotoName = photoName.textContent;
var photoSaving = false;

function resetPhotoEditor() {
  photoForm.reset();
  photoName.textContent = defaultPhotoName;
  photoFeedback.textContent = '';
  photoFeedback.hidden = true;
  savePhotoButton.disabled = true;
}

function setPhotoEditorOpen(open) {
  photoEditor.hidden = !open;
  editPhotoButton.hidden = open;
  editPhotoButton.setAttribute('aria-expanded', String(open));
}

editPhotoButton.addEventListener('click', function () {
  resetPhotoEditor();
  setPhotoEditorOpen(true);
  photoInput.focus();
});

cancelPhotoButton.addEventListener('click', function () {
  resetPhotoEditor();
  setPhotoEditorOpen(false);
  editPhotoButton.focus();
});

photoInput.addEventListener('change', function () {
  var file = photoInput.files[0];
  var validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  photoFeedback.textContent = '';
  photoFeedback.hidden = true;
  savePhotoButton.disabled = true;
  if (!file) {
    photoName.textContent = defaultPhotoName;
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    photoInput.value = '';
    photoName.textContent = defaultPhotoName;
    photoFeedback.textContent = 'Escolha uma imagem de até 5 MB.';
    photoFeedback.hidden = false;
    return;
  }
  if (file.type && validTypes.indexOf(file.type) === -1) {
    photoInput.value = '';
    photoName.textContent = defaultPhotoName;
    photoFeedback.textContent = 'Escolha uma imagem JPG, PNG ou WEBP.';
    photoFeedback.hidden = false;
    return;
  }
  photoName.textContent = file.name;
  savePhotoButton.disabled = false;
});

photoForm.addEventListener('submit', async function (event) {
  event.preventDefault();
  var file = photoInput.files[0];
  if (!file || photoSaving) return;
  if (file.size > 5 * 1024 * 1024) {
    photoFeedback.textContent = 'Escolha uma imagem de até 5 MB.';
    photoFeedback.hidden = false;
    return;
  }
  photoSaving = true;
  savePhotoButton.disabled = true;
  cancelPhotoButton.disabled = true;
  photoInput.disabled = true;
  savePhotoButton.textContent = 'Salvando…';
  var data = new FormData(); data.append('foto', file);
  try {
    var result = await apiFetch('/auth/foto.php', {metodo:'POST', corpo:data});
    if (result.ok) {
      sessao = result.usuario;
      atualizaCabecalho();
      renderProfileAvatar(document.getElementById('profile-avatar'), sessao);
      resetPhotoEditor();
      setPhotoEditorOpen(false);
      photoFeedback.textContent = 'Foto de perfil atualizada!';
      photoFeedback.hidden = false;
      editPhotoButton.focus();
    } else {
      photoFeedback.textContent = result.erro || 'Não foi possível salvar a foto. Tente novamente.';
      photoFeedback.hidden = false;
      savePhotoButton.disabled = false;
    }
  } catch (error) {
    photoFeedback.textContent = 'Não foi possível salvar a foto. Verifique sua conexão e tente novamente.';
    photoFeedback.hidden = false;
    savePhotoButton.disabled = false;
  } finally {
    photoSaving = false;
    cancelPhotoButton.disabled = false;
    photoInput.disabled = false;
    savePhotoButton.textContent = 'Salvar foto';
  }
});
var deleteDialog = document.getElementById('delete-account-dialog');
var deleteForm = document.getElementById('delete-account-form');
var deletingAccount = false;
document.getElementById('open-delete-account').addEventListener('click', function () {
  deleteForm.reset(); document.getElementById('delete-feedback').textContent = ''; deleteDialog.showModal(); document.getElementById('cancel-delete-account').focus();
});
document.getElementById('cancel-delete-account').addEventListener('click', function () { deleteDialog.close(); });
deleteDialog.addEventListener('cancel', function (event) { if (deletingAccount) event.preventDefault(); });
deleteForm.addEventListener('submit', async function (event) {
  event.preventDefault(); if (deletingAccount) return;
  deletingAccount = true;
  var button = deleteForm.querySelector('button[type=submit]');
  button.disabled = true; document.getElementById('cancel-delete-account').disabled = true; button.textContent = 'Excluindo…';
  var result = await apiFetch('/auth/excluir.php', {metodo:'POST', corpo:{senha:document.getElementById('delete-password').value}});
  if (result.ok) { window.location.replace('index.html'); return; }
  deletingAccount = false; button.disabled = false; document.getElementById('cancel-delete-account').disabled = false; button.textContent = 'Excluir definitivamente';
  document.getElementById('delete-feedback').textContent = result.erro;
});
