(async function () {
  await carregarSessao();
  if (typeof exigirAdmin !== "function" || !exigirAdmin()) return;

  await carregarCategoriasEBairros();
  preencheSelect("f-category", categorias, true);
  preencheSelect("f-location", bairros, true);
  preencheSelect("e-category", categorias, false);
  preencheSelect("e-location", bairros, false);

  await carregarEDesenhaAdmin();
})();
