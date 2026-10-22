// "Meus anúncios" — área do doador logado (RF05: atualizar status do próprio item).
// Fica só em index.html; não depende do painel administrativo.

var meusPendentesAtuais = [];
var meusPublicadosAtuais = [];

async function abreMeusAnuncios() {
  await desenhaMeusAnuncios();
  document.getElementById("mine-overlay").classList.add("open");
}

async function desenhaMeusAnuncios() {
  var corpo = document.getElementById("mine-body");
  if (!sessao) { corpo.innerHTML = ""; return; }

  var resposta = await apiFetch("/meus-anuncios/listar.php");
  if (!resposta.ok) {
    corpo.innerHTML = '<p class="empty-admin">Não foi possível carregar seus anúncios.</p>';
    return;
  }

  meusPendentesAtuais = resposta.pendentes;
  meusPublicadosAtuais = resposta.publicados;

  var html = "";

  html += '<h4 class="mine-subtitle">Aguardando moderação</h4>';
  if (meusPendentesAtuais.length === 0) {
    html += '<p class="empty-admin">Nenhum anúncio aguardando aprovação.</p>';
  } else {
    html += '<table class="admin-table"><thead><tr><th>Item</th><th>Categoria</th><th>Ações</th></tr></thead><tbody>';
    for (var i = 0; i < meusPendentesAtuais.length; i++) {
      html += '<tr><td>' + meusPendentesAtuais[i].titulo + '</td><td>' + meusPendentesAtuais[i].categoria + '</td>';
      html += '<td><button class="icon-btn reject" data-cancelar="' + meusPendentesAtuais[i].id_item + '">Cancelar</button></td></tr>';
    }
    html += '</tbody></table>';
  }

  html += '<h4 class="mine-subtitle">Publicados</h4>';
  if (meusPublicadosAtuais.length === 0) {
    html += '<p class="empty-admin">Você ainda não tem itens publicados.</p>';
  } else {
    html += '<table class="admin-table"><thead><tr><th>Item</th><th>Categoria</th><th>Status</th><th>Ações</th></tr></thead><tbody>';
    for (var j = 0; j < meusPublicadosAtuais.length; j++) {
      var it = meusPublicadosAtuais[j];
      html += '<tr><td>' + it.titulo + '</td><td>' + it.categoria + '</td>';
      html += '<td><select class="status-select" data-mine-status="' + it.id_item + '">';
      html += '<option' + (it.status === "Disponível" ? ' selected' : '') + '>Disponível</option>';
      html += '<option' + (it.status === "Reservado" ? ' selected' : '') + '>Reservado</option>';
      html += '<option' + (it.status === "Doado" ? ' selected' : '') + '>Doado</option>';
      html += '</select></td><td><button type="button" class="icon-btn remove" data-remover-proprio="' + it.id_item + '">Excluir doação</button></td></tr>';
    }
    html += '</tbody></table>';
  }

  corpo.innerHTML = html;
  corpo.querySelectorAll('.admin-table').forEach(function(table){
    var headers=Array.from(table.querySelectorAll('th')).map(function(th){return th.textContent;});
    table.querySelectorAll('tbody tr').forEach(function(row){Array.from(row.cells).forEach(function(cell,i){cell.dataset.label=headers[i];});});
  });
  corpo.querySelectorAll('[data-remover-proprio]').forEach(function(button){
    button.addEventListener('click',function(){removeDoacaoPropria(Number(button.dataset.removerProprio),button);});
  });

  corpo.querySelectorAll("[data-cancelar]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      cancelaPendenteProprio(Number(btn.dataset.cancelar), btn);
    });
  });

  corpo.querySelectorAll("[data-mine-status]").forEach(function (sel) {
    sel.addEventListener("change", function () {
      mudaStatusProprio(Number(sel.dataset.mineStatus), sel.value);
    });
  });
}

async function cancelaPendenteProprio(id, button) {
  var item = buscaPorId(meusPendentesAtuais, id, 'id_item');
  if (!item || button.disabled) return;
  button.disabled = true;
  if (!(await confirmaExclusaoPropria(item, button, true))) {
    button.disabled = false; button.focus(); return;
  }
  button.textContent = 'Cancelando…';
  try {
    var resposta = await apiFetch('/meus-anuncios/cancelar.php', { metodo:'POST', corpo:{id:id} });
    if (!resposta.ok) { mostraAviso(resposta.erro); button.focus(); return; }
    await desenhaMeusAnuncios();
    mostraAviso('Anúncio "' + item.titulo + '" cancelado.');
    var nextAction = document.querySelector('#mine-body button, #mine-body select') || document.querySelector('#mine-overlay [data-close]');
    if (nextAction) nextAction.focus();
  } finally {
    button.disabled = false;
    button.textContent = 'Cancelar';
  }
}

async function mudaStatusProprio(id, novoStatus) {
  var it = buscaPorId(meusPublicadosAtuais, id, "id_item");

  var resposta = await apiFetch("/meus-anuncios/status.php", { metodo: "POST", corpo: { id: id, status: novoStatus } });
  if (!resposta.ok) {
    mostraAviso(resposta.erro);
    await desenhaMeusAnuncios();
    return;
  }

  await desenhaMeusAnuncios();
  mostraAviso('Status de "' + (it ? it.titulo : "item") + '" atualizado para ' + novoStatus + '.');
}

async function removeDoacaoPropria(id, button) {
  var item = buscaPorId(meusPublicadosAtuais, id, 'id_item');
  if (!item || button.disabled) return;
  button.disabled = true;
  if (!(await confirmaExclusaoPropria(item, button))) { button.disabled = false; button.focus(); return; }
  button.disabled = true;
  button.textContent = 'Excluindo…';
  try {
    var resposta = await apiFetch('/meus-anuncios/remover.php', { metodo:'POST', corpo:{id:id} });
    if (!resposta.ok) { mostraAviso(resposta.erro); return; }
    await desenhaMeusAnuncios();
    await carregarItensPublicos();
    desenhaGrade();
    mostraAviso('Doação excluída do mural.');
    var nextAction = document.querySelector('#mine-body button, #mine-body select') || document.querySelector('#mine-overlay [data-close]');
    if (nextAction) nextAction.focus();
  } finally {
    button.disabled = false;
    button.textContent = 'Excluir doação';
  }
}

function confirmaExclusaoPropria(item, button, pendente) {
  return new Promise(function(resolve) {
    var box=document.createElement('div');box.className='owner-remove-confirm';box.setAttribute('role','group');box.setAttribute('aria-label',pendente ? 'Confirmar cancelamento do anúncio' : 'Confirmar exclusão da doação');
    var message=document.createElement('p');message.textContent=pendente ? 'Cancelar "'+item.titulo+'"? O anúncio sairá da fila de análise e de Minhas doações.' : 'Excluir "'+item.titulo+'"? O anúncio sairá do mural e de Minhas doações.';
    var actions=document.createElement('div');actions.className='modal-actions';
    var cancel=document.createElement('button');cancel.type='button';cancel.className='btn btn-ghost btn-sm';cancel.textContent=pendente ? 'Manter anúncio' : 'Manter doação';
    var confirm=document.createElement('button');confirm.type='button';confirm.className='btn btn-brick btn-sm';confirm.textContent=pendente ? 'Confirmar cancelamento' : 'Confirmar exclusão';
    actions.append(cancel,confirm);box.append(message,actions);button.after(box);
    var observer=new MutationObserver(function(){if(!document.getElementById('mine-overlay').classList.contains('open'))finish(false);});
    function finish(confirmed){observer.disconnect();box.remove();resolve(confirmed);}
    observer.observe(document.getElementById('mine-overlay'),{attributes:true,attributeFilter:['class']});
    cancel.addEventListener('click',function(){finish(false);});confirm.addEventListener('click',function(){finish(true);});cancel.focus();
  });
}
