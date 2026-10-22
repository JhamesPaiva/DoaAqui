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
photoForm.addEventListener('submit', async function (event) {
  event.preventDefault();
  var file = document.getElementById('profile-photo').files[0];
  var feedback = document.getElementById('photo-feedback');
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { feedback.textContent = 'Escolha uma imagem de até 5 MB.'; return; }
  var button = photoForm.querySelector('button');
  button.disabled = true; button.textContent = 'Salvando…';
  var data = new FormData(); data.append('foto', file);
  var result = await apiFetch('/auth/foto.php', {metodo:'POST', corpo:data});
  button.disabled = false; button.textContent = 'Salvar foto';
  feedback.textContent = result.ok ? 'Foto de perfil atualizada!' : result.erro;
  if (result.ok) { sessao = result.usuario; atualizaCabecalho(); renderProfileAvatar(document.getElementById('profile-avatar'), sessao); photoForm.reset(); }
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
