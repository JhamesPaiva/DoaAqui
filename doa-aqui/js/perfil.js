(async function () {
  var state=document.getElementById('profile-state');
  var content=document.getElementById('profile-content');
  var response=await apiFetch('/auth/me.php');
  if(!response.ok){state.textContent='Não foi possível carregar seu perfil. Atualize a página para tentar novamente.';return;}
  if(!response.usuario){window.location.replace('index.html?perfil=1');return;}
  sessao=response.usuario;atualizaCabecalho();
  document.getElementById('profile-name').textContent=sessao.nome;
  document.getElementById('profile-avatar').textContent=sessao.nome.trim().charAt(0).toUpperCase();
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
