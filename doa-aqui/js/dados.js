const imagensCategoria = {
  "Roupas": "assets/roupas.svg",
  "Móveis": "assets/moveis.svg",
  "Alimentos": "assets/alimentos.svg",
  "Eletrônicos": "assets/eletronicos.svg",
  "Livros": "assets/livros.svg",
  "Brinquedos": "assets/brinquedos.svg"
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
