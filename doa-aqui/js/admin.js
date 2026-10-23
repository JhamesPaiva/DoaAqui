// Estado local só pra não precisar refazer fetch a cada clique dentro da mesma tela —
// sempre recarregado do zero via carregarEDesenhaAdmin() depois de qualquer ação.
var pendentesAtuais = [];
var publicadosAtuais = [];

async function carregarEDesenhaAdmin() {
  var respPendentes = await apiFetch("/admin/pendentes.php");
  var respPublicados = await apiFetch("/admin/publicados.php");
  var respMetricas = await apiFetch("/admin/metricas.php");
  var respLog = await apiFetch("/admin/log.php");

  pendentesAtuais = respPendentes.ok ? respPendentes.pendentes : [];
  publicadosAtuais = respPublicados.ok ? respPublicados.publicados : [];

  document.getElementById("pending-count").textContent = pendentesAtuais.length;

  if (respMetricas.ok) {
    document.getElementById("a-stat-pend").textContent = respMetricas.pendentes;
    document.getElementById("a-stat-disp").textContent = respMetricas.disponiveis;
    document.getElementById("a-stat-doado").textContent = respMetricas.doados;
    document.getElementById("a-stat-total").textContent = respMetricas.total;
    desenhaCategoriasMaisDoadas(respMetricas.categoriasMaisDoadas);
  }

  desenhaFilaPendente();
  desenhaPublicados();
  desenhaLogModeracao(respLog.ok ? respLog.log : []);
}

function desenhaFilaPendente() {
  var corpoPendente = document.querySelector("#pending-table tbody");

  if (pendentesAtuais.length === 0) {
    corpoPendente.innerHTML = '<tr><td colspan="4"><div class="empty-admin">Nenhum item aguardando moderação.</div></td></tr>';
  } else {
    var html = "";
    for (var i = 0; i < pendentesAtuais.length; i++) {
      var p = pendentesAtuais[i];
      html += '<tr><td><div class="row-item">' + htmlSeguro(p.titulo) + '</div></td>';
      html += '<td>' + htmlSeguro(p.categoria) + '</td>';
      html += '<td>' + htmlSeguro(p.bairro) + '</td>';
      html += '<td><div class="row-actions">';
      html += '<button class="icon-btn approve" data-approve="' + htmlSeguro(p.id_item) + '">Aprovar</button>';
      html += '<button class="icon-btn reject" data-reject="' + htmlSeguro(p.id_item) + '">Rejeitar</button>';
      html += '</div></td></tr>';
    }
    corpoPendente.innerHTML = html;
  }

  corpoPendente.querySelectorAll("[data-approve]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      aprovaItem(Number(btn.dataset.approve));
    });
  });

  corpoPendente.querySelectorAll("[data-reject]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      abreRejeicao(Number(btn.dataset.reject));
    });
  });
}

async function aprovaItem(id) {
  var p = buscaPorId(pendentesAtuais, id, "id_item");

  var resposta = await apiFetch("/admin/aprovar.php", { metodo: "POST", corpo: { id: id } });
  if (!resposta.ok) { mostraAviso(resposta.erro); return; }

  await carregarEDesenhaAdmin();
  mostraAviso('"' + (p ? p.titulo : "Item") + '" aprovado e publicado no mural.');
}

function abreRejeicao(id) {
  var p = buscaPorId(pendentesAtuais, id, "id_item");
  if (!p) return;
  document.getElementById("r-id").value = id;
  document.getElementById("r-obs").value = "";
  abrirModal("reject-overlay");
}

document.getElementById("reject-form").addEventListener("submit", async function (e) {
  e.preventDefault();
  var id = Number(document.getElementById("r-id").value);
  var obs = document.getElementById("r-obs").value.trim();
  var p = buscaPorId(pendentesAtuais, id, "id_item");

  var resposta = await apiFetch("/admin/rejeitar.php", { metodo: "POST", corpo: { id: id, observacao: obs } });
  fechaModais();
  if (!resposta.ok) { mostraAviso(resposta.erro); return; }

  await carregarEDesenhaAdmin();
  mostraAviso('"' + (p ? p.titulo : "Item") + '" rejeitado.');
});

function desenhaPublicados() {
  var corpoPublicado = document.querySelector("#published-table tbody");
  var htmlPub = "";
  for (var k = 0; k < publicadosAtuais.length; k++) {
    var it = publicadosAtuais[k];
    htmlPub += '<tr><td><div class="row-item">' + htmlSeguro(it.titulo) + '</div></td>';
    htmlPub += '<td>' + htmlSeguro(it.categoria) + '</td>';
    htmlPub += '<td>' + htmlSeguro(it.bairro) + '</td>';
    htmlPub += '<td><select class="status-select" data-status-id="' + htmlSeguro(it.id_item) + '">';
    htmlPub += '<option' + (it.status === "Disponível" ? ' selected' : '') + '>Disponível</option>';
    htmlPub += '<option' + (it.status === "Reservado" ? ' selected' : '') + '>Reservado</option>';
    htmlPub += '<option' + (it.status === "Doado" ? ' selected' : '') + '>Doado</option>';
    htmlPub += '</select></td>';
    htmlPub += '<td><div class="row-actions">';
    htmlPub += '<button class="icon-btn history" data-history="' + htmlSeguro(it.id_item) + '">Histórico</button>';
    htmlPub += '<button class="icon-btn edit" data-edit="' + htmlSeguro(it.id_item) + '">Editar</button>';
    htmlPub += '<button class="icon-btn remove" data-remove="' + htmlSeguro(it.id_item) + '">Remover</button>';
    htmlPub += '</div></td></tr>';
  }
  corpoPublicado.innerHTML = htmlPub || '<tr><td colspan="5"><div class="empty-admin">Nenhum item publicado ainda.</div></td></tr>';

  corpoPublicado.querySelectorAll("[data-status-id]").forEach(function (sel) {
    sel.addEventListener("change", function () {
      mudaStatusPublicado(Number(sel.dataset.statusId), sel.value);
    });
  });

  corpoPublicado.querySelectorAll("[data-edit]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      abreEdicao(Number(btn.dataset.edit));
    });
  });

  corpoPublicado.querySelectorAll("[data-remove]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      removeItem(Number(btn.dataset.remove));
    });
  });

  corpoPublicado.querySelectorAll("[data-history]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      abreHistorico(Number(btn.dataset.history));
    });
  });
}

async function mudaStatusPublicado(id, novoStatus) {
  var alvo = buscaPorId(publicadosAtuais, id, "id_item");

  var resposta = await apiFetch("/admin/status.php", { metodo: "POST", corpo: { id: id, status: novoStatus } });
  if (!resposta.ok) {
    mostraAviso(resposta.erro);
    await carregarEDesenhaAdmin();
    return;
  }

  await carregarEDesenhaAdmin();
  mostraAviso('Status de "' + (alvo ? alvo.titulo : "item") + '" atualizado para ' + novoStatus + '.');
}

var inputFotoEdicao = document.getElementById("e-foto");
var dicaFotoEdicao = document.getElementById("e-foto-hint");
var dicaFotoEdicaoPadrao = dicaFotoEdicao ? dicaFotoEdicao.textContent : "";

if (inputFotoEdicao && dicaFotoEdicao) {
  inputFotoEdicao.addEventListener("change", function () {
    dicaFotoEdicao.textContent = inputFotoEdicao.files[0] ? inputFotoEdicao.files[0].name : dicaFotoEdicaoPadrao;
  });
}

function abreEdicao(id) {
  var it = buscaPorId(publicadosAtuais, id, "id_item");
  if (!it) return;
  document.getElementById("e-id").value = it.id_item;
  document.getElementById("e-title").value = it.titulo;
  document.getElementById("e-category").value = it.categoria;
  document.getElementById("e-location").value = it.bairro;
  document.getElementById("e-desc").value = it.descricao;
  document.getElementById("e-contact").value = it.contato_whatsapp || "";
  document.getElementById("e-public-contact").checked = Boolean(it.contato_publico);
  if (inputFotoEdicao) inputFotoEdicao.value = "";
  if (dicaFotoEdicao) dicaFotoEdicao.textContent = dicaFotoEdicaoPadrao;
  abrirModal("edit-overlay");
}

function leFormularioEdicao() {
  return {
    id: Number(document.getElementById("e-id").value),
    titulo: document.getElementById("e-title").value.trim(),
    categoria: document.getElementById("e-category").value,
    bairro: document.getElementById("e-location").value,
    descricao: document.getElementById("e-desc").value.trim(),
    contato: document.getElementById("e-contact").value.trim(),
    exibirContato: document.getElementById("e-public-contact").checked,
    arquivoFoto: inputFotoEdicao && inputFotoEdicao.files[0] ? inputFotoEdicao.files[0] : null
  };
}

document.getElementById("edit-item-form").addEventListener("submit", async function (e) {
  e.preventDefault();
  var dados = leFormularioEdicao();

  // Só sobe uma foto nova se o admin escolheu uma — senão a foto atual do item é mantida.
  var fotoUrl = "";
  if (dados.arquivoFoto) {
    var formData = new FormData();
    formData.append("foto", dados.arquivoFoto);
    var respostaUpload = await apiFetch("/itens/upload-foto.php", { metodo: "POST", corpo: formData });
    if (!respostaUpload.ok) { mostraAviso(respostaUpload.erro); return; }
    fotoUrl = respostaUpload.url;
  }

  var resposta = await apiFetch("/admin/editar.php", {
    metodo: "POST",
    corpo: {
      id: dados.id, titulo: dados.titulo, categoria: dados.categoria,
      bairro: dados.bairro, descricao: dados.descricao, contato: dados.contato, contatoPublico: dados.exibirContato,
      fotoUrl: fotoUrl
    }
  });
  fechaModais();
  if (!resposta.ok) { mostraAviso(resposta.erro); return; }

  await carregarEDesenhaAdmin();
  mostraAviso('"' + dados.titulo + '" atualizado.');
});

var itemParaRemover = null;
var removendoAnuncio = false;
function removeItem(id) {
  if (removendoAnuncio) return;
  var it = buscaPorId(publicadosAtuais, id, 'id_item');
  if (!it) return;
  itemParaRemover = {id:id, titulo:it.titulo};
  document.getElementById('remove-item-title').textContent = it.titulo;
  document.getElementById('remove-error').hidden = true;
  abrirModal('remove-overlay');
}

document.getElementById('confirm-remove').addEventListener('click', async function () {
  if (!itemParaRemover || removendoAnuncio) return;
  var item = itemParaRemover;
  var button = this;
  var error = document.getElementById('remove-error');
  var dialog = document.querySelector('#remove-overlay .modal');
  removendoAnuncio = true;
  button.disabled = true;
  button.textContent = 'Removendo…';
  dialog.setAttribute('aria-busy','true');
  error.hidden = true;
  try {
    var resposta = await apiFetch('/admin/remover.php', {metodo:'POST', corpo:{id:item.id}});
    if (!resposta.ok) {error.textContent=resposta.erro;error.hidden=false;return;}
    document.getElementById('remove-overlay').classList.remove('open');
    itemParaRemover = null;
    await carregarEDesenhaAdmin();
    mostraAviso('"' + item.titulo + '" removido do mural.');
    var heading = document.querySelector('.admin-head h1');
    heading.tabIndex=-1;heading.focus();
  } finally {
    removendoAnuncio = false;
    button.disabled = false;
    button.textContent = 'Sim, remover anúncio';
    dialog.removeAttribute('aria-busy');
  }
});

async function abreHistorico(id) {
  var it = buscaPorId(publicadosAtuais, id, "id_item");
  var resposta = await apiFetch("/admin/historico.php?item_id=" + id);
  var corpo = document.getElementById("history-body");

  var lista = resposta.ok ? resposta.historico : [];
  if (lista.length === 0) {
    corpo.innerHTML = '<p style="color:var(--ink-soft);font-size:14px;">Nenhuma alteração de status registrada para "' + htmlSeguro(it ? it.titulo : "este item") + '" ainda.</p>';
  } else {
    var html = '<ul class="history-list">';
    for (var i = 0; i < lista.length; i++) {
      var h = lista[i];
      html += '<li><span>' + htmlSeguro(h.status_anterior) + ' → ' + htmlSeguro(h.status_novo) + ' (' + htmlSeguro(h.alterado_por_nome) + ')</span><span>' + htmlSeguro(formataData(h.data_alteracao)) + '</span></li>';
    }
    html += '</ul>';
    corpo.innerHTML = html;
  }

  abrirModal("history-overlay");
}

function desenhaCategoriasMaisDoadas(lista) {
  var cont = document.getElementById("top-categories");
  if (!lista || lista.length === 0) {
    cont.innerHTML = '<p style="color:var(--ink-soft);font-size:14px;">Ainda não há itens doados para gerar essa métrica.</p>';
    return;
  }

  var max = lista[0].total;
  var html = "";
  for (var j = 0; j < lista.length; j++) {
    var pct = Math.round((lista[j].total / max) * 100);
    html += '<div class="metric-row">';
    html += '<span class="metric-label">' + htmlSeguro(lista[j].categoria) + '</span>';
    html += '<span class="metric-bar-track"><span class="metric-bar-fill" style="width:' + pct + '%"></span></span>';
    html += '<span class="metric-count">' + htmlSeguro(lista[j].total) + '</span>';
    html += '</div>';
  }
  cont.innerHTML = html;
}

function desenhaLogModeracao(log) {
  var corpo = document.querySelector("#log-table tbody");
  if (!log || log.length === 0) {
    corpo.innerHTML = '<tr><td colspan="4"><div class="empty-admin">Nenhuma ação de moderação registrada ainda.</div></td></tr>';
    return;
  }
  var html = "";
  for (var i = 0; i < log.length; i++) {
    var l = log[i];
    html += '<tr><td><span class="acao-badge ' + htmlSeguro(l.acao) + '">' + htmlSeguro(l.acao) + '</span></td>';
    html += '<td>' + htmlSeguro(l.item_titulo) + '</td>';
    html += '<td>' + htmlSeguro(l.observacao || '—') + '</td>';
    html += '<td>' + htmlSeguro(formataData(l.data_acao)) + '</td></tr>';
  }
  corpo.innerHTML = html;
}
