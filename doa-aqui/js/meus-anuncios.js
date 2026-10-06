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
    html += '<table class="admin-table"><thead><tr><th>Item</th><th>Categoria</th><th>Status</th></tr></thead><tbody>';
    for (var j = 0; j < meusPublicadosAtuais.length; j++) {
      var it = meusPublicadosAtuais[j];
      html += '<tr><td>' + it.titulo + '</td><td>' + it.categoria + '</td>';
      html += '<td><select class="status-select" data-mine-status="' + it.id_item + '">';
      html += '<option' + (it.status === "Disponível" ? ' selected' : '') + '>Disponível</option>';
      html += '<option' + (it.status === "Reservado" ? ' selected' : '') + '>Reservado</option>';
      html += '<option' + (it.status === "Doado" ? ' selected' : '') + '>Doado</option>';
      html += '</select></td></tr>';
    }
    html += '</tbody></table>';
  }

  corpo.innerHTML = html;

  corpo.querySelectorAll("[data-cancelar]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      cancelaPendenteProprio(Number(btn.dataset.cancelar));
    });
  });

  corpo.querySelectorAll("[data-mine-status]").forEach(function (sel) {
    sel.addEventListener("change", function () {
      mudaStatusProprio(Number(sel.dataset.mineStatus), sel.value);
    });
  });
}

async function cancelaPendenteProprio(id) {
  var p = buscaPorId(meusPendentesAtuais, id, "id_item");
  if (!p) return;
  var confirmado = window.confirm('Cancelar o anúncio "' + p.titulo + '"? Ele sai da fila de moderação.');
  if (!confirmado) return;

  var resposta = await apiFetch("/meus-anuncios/cancelar.php", { metodo: "POST", corpo: { id: id } });
  if (!resposta.ok) { mostraAviso(resposta.erro); return; }

  await desenhaMeusAnuncios();
  mostraAviso('Anúncio "' + p.titulo + '" cancelado.');
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
