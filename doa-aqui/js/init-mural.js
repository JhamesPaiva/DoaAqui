(async function () {
  await carregarSessao();
  await carregarCategoriasEBairros();

  preencheSelect("f-category", categorias, true);
  preencheSelect("f-location", bairros, true);

  await carregarItensPublicos();
  desenhaFiltroCategoria();
  desenhaFiltroLocal();
  desenhaGrade();

  var params = new URLSearchParams(window.location.search);
  if (params.get("login") === "admin") {
    mostraAviso("Faça login como administrador para acessar o painel.");
    abreLogin();
  }
})();
