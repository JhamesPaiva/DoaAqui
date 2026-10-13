function abreDetalhe(id) {
  var it = null;
  for (var i = 0; i < itens.length; i++) {
    if (itens[i].id === id) { it = itens[i]; break; }
  }
  if (!it) return;

  var corpo = document.getElementById("detail-body");
  corpo.innerHTML =
    '<img class="detail-photo" src="' + it.img + '" alt="' + it.titulo + '">' +
    '<div class="detail-tags">' +
      '<span class="pill pill-cat">' + it.categoria + '</span>' +
      '<span class="pill pill-status-' + classeStatus(it.status).replace('status-', '') + '">' + it.status + '</span>' +
    '</div>' +
    '<h2 style="font-size:22px;margin-bottom:10px;">' + it.titulo + '</h2>' +
    '<p class="detail-desc">' + it.desc + '</p>' +
    '<div class="detail-meta">' +
      '<div><b>' + it.local + '</b>Localização</div>' +
      '<div><b>' + it.doador + '</b>Doador(a)</div>' +
      '<div><b>' + it.data + '</b>Publicado em</div>' +
      '<div><b>' + it.contato + '</b>Contato</div>' +
    '</div>' +
    '<div class="modal-actions">' +
      (it.status === 'Disponível' && it.contato ? '<a class="btn btn-forest" href="https://wa.me/55' + it.contato.replace(/\D/g, '') + '" target="_blank" rel="noopener">Conversar pelo WhatsApp</a>' : '<p class="hint">' + (it.status === 'Reservado' ? 'Este item está reservado.' : it.status === 'Doado' ? 'Este item já encontrou uma nova casa.' : 'Contato não informado.') + '</p>') +
    '</div>';

  document.getElementById("detail-overlay").classList.add("open");
}
