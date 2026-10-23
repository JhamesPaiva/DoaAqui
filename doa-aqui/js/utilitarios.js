function listaCategorias() {
  var vistas = [];
  for (var i = 0; i < itens.length; i++) {
    if (vistas.indexOf(itens[i].categoria) === -1) vistas.push(itens[i].categoria);
  }
  return vistas;
}

// Escape untrusted values before placing them in an HTML template.
function htmlSeguro(valor) {
  return String(valor == null ? "" : valor).replace(/[&<>"']/g, function (caractere) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[caractere];
  });
}

// Popula um <select> a partir de uma lista (ex: categorias, bairros).
// comPlaceholder=true adiciona uma opção "Selecione" vazia no topo (formulários de criação);
// comPlaceholder=false deixa só as opções da lista (formulários de edição, já vêm preenchidos).
function preencheSelect(id, lista, comPlaceholder) {
  var sel = document.getElementById(id);
  if (!sel) return;
  var html = comPlaceholder ? '<option value="">Selecione</option>' : "";
  for (var i = 0; i < lista.length; i++) {
    html += "<option>" + htmlSeguro(lista[i]) + "</option>";
  }
  sel.innerHTML = html;
}

// Categorias legadas continuam disponíveis para anúncios existentes e edição,
// mas não podem ser escolhidas ao criar uma nova doação.
function categoriasParaNovaDoacao(lista) {
  return lista.filter(function (nome) {
    return String(nome).trim().toLocaleLowerCase("pt-BR") !== "alimentos";
  });
}

function classeStatus(s) {
  if (s === "Disponível") return "status-disponivel";
  if (s === "Reservado") return "status-reservado";
  return "status-doado";
}

// Formata um timestamp vindo do banco ("2026-09-17 21:51:04") pro formato dd/mm usado na tela.
function formataData(dataIso) {
  if (!dataIso) return "";
  var d = new Date(String(dataIso).replace(" ", "T"));
  if (isNaN(d.getTime())) return dataIso;
  var dia = String(d.getDate()).padStart(2, "0");
  var mes = String(d.getMonth() + 1).padStart(2, "0");
  return dia + "/" + mes;
}

// Busca genérica por id numa lista de objetos vinda da API — o campo do id varia
// conforme o endpoint (ex: "id" no feed público, "id_item" nas rotas de admin),
// então essa função substitui o que antes eram buscaItemPorId/buscaPendentePorId
// (cada um fixo num nome de campo e numa lista específica).
function buscaPorId(lista, id, campoId) {
  campoId = campoId || "id";
  for (var i = 0; i < lista.length; i++) {
    if (lista[i][campoId] === id) return lista[i];
  }
  return null;
}
