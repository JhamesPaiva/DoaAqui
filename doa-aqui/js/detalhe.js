function abreDetalhe(id) {
  var it = null;
  for (var i = 0; i < itens.length; i++) {
    if (itens[i].id === id) { it = itens[i]; break; }
  }
  if (!it) return;

  var corpo = document.getElementById("detail-body");
  var contatoPublico = String(it.contato || "");
  var numeroWhatsApp = contatoPublico.replace(/\D/g, "");
  var foto = it.img;
  corpo.innerHTML =
    '<img class="detail-photo" src="' + htmlSeguro(foto) + '" alt="' + htmlSeguro(it.titulo) + '">' +
    '<div class="detail-tags">' +
      '<span class="pill pill-cat">' + htmlSeguro(it.categoria) + '</span>' +
      '<span class="pill pill-status-' + htmlSeguro(classeStatus(it.status).replace('status-', '')) + '">' + htmlSeguro(it.status) + '</span>' +
    '</div>' +
    '<h2 style="font-size:22px;margin-bottom:10px;">' + htmlSeguro(it.titulo) + '</h2>' +
    '<p class="detail-desc">' + htmlSeguro(it.desc) + '</p>' +
    '<div class="detail-meta">' +
      '<div><b>' + htmlSeguro(it.local) + '</b>Localização</div>' +
      '<div><b>' + htmlSeguro(it.doador) + '</b>Doador(a)</div>' +
      '<div><b>' + htmlSeguro(it.data) + '</b>Publicado em</div>' +
      (contatoPublico ? '<div><b>' + htmlSeguro(contatoPublico) + '</b>WhatsApp público</div>' : '') +
    '</div>' +
    '<div class="modal-actions">' +
      (it.status === 'Disponível' && contatoPublico && numeroWhatsApp ? '<a class="btn btn-forest" href="https://wa.me/55' + htmlSeguro(numeroWhatsApp) + '" target="_blank" rel="noopener">Conversar pelo WhatsApp</a>' : '<p class="hint">' + (it.status === 'Reservado' ? 'Este item está reservado.' : it.status === 'Doado' ? 'Este item já encontrou uma nova casa.' : 'O doador não publicou um contato para este anúncio.') + '</p>') +
    '</div>';

  abrirModal("detail-overlay");
}
