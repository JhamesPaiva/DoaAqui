// Placeholders de foto por categoria — o backend ainda não faz upload real (RNF06 fica
// pra uma próxima fase), então toda foto de item continua sendo um placeholder por categoria.
const imagensCategoria = {
  "Roupas": "https://picsum.photos/seed/doaaqui-roupas/600/420",
  "Móveis": "https://picsum.photos/seed/doaaqui-moveis/600/420",
  "Alimentos": "https://picsum.photos/seed/doaaqui-alimentos/600/420",
  "Eletrônicos": "https://picsum.photos/seed/doaaqui-eletro/600/420",
  "Livros": "https://picsum.photos/seed/doaaqui-livros/600/420",
  "Brinquedos": "https://picsum.photos/seed/doaaqui-brinquedos/600/420"
};

// Estado em memória, preenchido pelas chamadas à API nos scripts de inicialização
// (init-mural.js / init-admin.js) — nada aqui é mockado, tudo vem do backend agora.
var itens = [];
var categorias = [];
var bairros = [];
var sessao = null;

var filtroAtual = {
  busca: "",
  categorias: new Set(),
  status: new Set(["Disponível", "Reservado"]),
  local: ""
};
