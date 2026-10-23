(async function () {
  await carregarSessao();
  await carregarCategoriasEBairros();

  preencheSelect("f-category", categoriasParaNovaDoacao(categorias), true);
  preencheSelect("f-location", bairros, true);

  await carregarItensPublicos();
  desenhaFiltroCategoria();
  desenhaFiltroLocal();
  desenhaGrade();

  var params = new URLSearchParams(window.location.search);
  if (params.get('perfil') === '1') { if (sessao) { window.location.replace('perfil.html'); return; } abreLogin(); }
  if (params.get('minhas') === '1') { if (sessao) await abreMeusAnuncios(); else abreLogin(); }
  if (params.get("login") === "admin") {
    mostraAviso("Faça login como administrador para acessar o painel.");
    abreLogin();
  }
  var acaoInicial = params.get("acao");
  if (acaoInicial === "entrar") abreLogin();
  if (acaoInicial === "cadastrar") abreCadastro();
  if (acaoInicial === "doar") document.getElementById("btn-open-form").click();
})();
