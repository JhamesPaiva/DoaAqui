var erroMural = false;
// Busca o feed público (já filtrado no servidor: só aprovados e não removidos) e
// adapta os nomes de campo da API pros nomes que o resto da tela já usa
// (descricao->desc, bairro->local, dataPublicacao->data), pra não precisar
// mexer em desenhaGrade/detalhe.js por causa da mudança de fonte de dados.
async function carregarItensPublicos() {
  var resposta = await apiFetch("/itens/listar.php");
  erroMural = !resposta.ok;
  if (!resposta.ok) {
    mostraAviso("Não foi possível carregar os itens do mural.");
    itens = [];
    return;
  }

  itens = resposta.itens.map(function (i) {
    return {
      id: i.id,
      titulo: i.titulo,
      categoria: i.categoria,
      desc: i.descricao,
      local: i.bairro,
      status: i.status,
      doador: i.doador,
      contato: i.contato,
      img: i.fotoUrl ? (UPLOADS_BASE + i.fotoUrl) : (imagensCategoria[i.categoria] || imagensCategoria["Móveis"]),
      novo: false,
      data: formataData(i.dataPublicacao)
    };
  });
}

function itensFiltrados() {
  return itens.filter(function (i) {
    var texto = (i.titulo + " " + i.desc).toLowerCase();
    if (filtroAtual.busca && texto.indexOf(filtroAtual.busca) === -1) return false;
    if (!filtroAtual.categorias.has(i.categoria)) return false;
    if (!filtroAtual.status.has(i.status)) return false;
    if (filtroAtual.local && i.local !== filtroAtual.local) return false;
    return true;
  });
}

function desenhaGrade() {
  var grade = document.getElementById("items-grid");
  grade.setAttribute("aria-busy", "false");
  var lista = itensFiltrados();
  if (typeof desenhaFiltrosAtivos === "function") desenhaFiltrosAtivos();
  var contador = document.getElementById("results-count");

  if (erroMural) {
    contador.textContent = "O mural está temporariamente indisponível.";
    grade.innerHTML = '<div class="empty-state"><b>Vamos tentar de novo?</b><p>Não foi possível carregar as doações. Verifique sua conexão e tente novamente.</p><button type="button" class="btn btn-forest" id="retry-feed">Tentar novamente</button></div>';
    document.getElementById("stat-total").textContent = "—";
    document.getElementById("stat-disponiveis").textContent = "—";
    document.getElementById("retry-feed").addEventListener("click", async function () {
      this.disabled = true; this.textContent = "Carregando…";
      await carregarCategoriasEBairros();
      preencheSelect("f-category", categoriasParaNovaDoacao(categorias), true); preencheSelect("f-location", bairros, true);
      await carregarItensPublicos(); desenhaFiltroCategoria(); desenhaFiltroLocal(); desenhaGrade();
    });
    return;
  }
  if (lista.length === 0) {
    contador.textContent = "Nenhum item encontrado com esses filtros.";
  } else if (lista.length === 1) {
    contador.textContent = "1 item encontrado";
  } else {
    contador.textContent = lista.length + " itens encontrados";
  }

  if (lista.length === 0) {
    grade.innerHTML = '<div class="empty-state"><b>Nada por aqui ainda</b>Tente ajustar os filtros ou volte mais tarde — novas doações podem aparecer a qualquer momento.</div>';
  } else {
    grade.replaceChildren();
    lista.forEach(function(it,index){
      var card=document.createElement('article');card.className='card';card.setAttribute('role','button');card.tabIndex=0;card.setAttribute('aria-haspopup','dialog');card.setAttribute('aria-label','Ver doação: '+it.titulo);card.dataset.id=it.id;card.style.setProperty('--arrival-delay',Math.min(index,4)*25+'ms');
      var photo=document.createElement('div');photo.className='photo';
      var image=document.createElement('img');image.src=it.img;image.alt=it.titulo;image.loading='lazy';image.width=480;image.height=360;
      image.addEventListener('error',function(){image.src=imagensCategoria[it.categoria]||imagensCategoria['Móveis'];},{once:true});
      var status=document.createElement('span');status.className='status-tag '+classeStatus(it.status);status.textContent=it.status;photo.append(image,status);
      var body=document.createElement('div');body.className='body';
      var category=document.createElement('span');category.className='cat-label';category.textContent=it.categoria;
      var title=document.createElement('h3');title.textContent=it.titulo;
      var desc=document.createElement('p');desc.className='desc';desc.textContent=it.desc;
      var meta=document.createElement('div');meta.className='meta';
      var location=document.createElement('span');location.className='card-location';location.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/></svg>';location.append(document.createTextNode(it.local));
      var date=document.createElement('span');date.className='card-date';date.textContent=it.data ? 'Publicado em '+it.data : '';
      meta.append(location,date);var link=document.createElement('span');link.className='card-link';link.textContent='Ver doação';
      body.append(category,title,desc,meta,link);card.append(photo,body);grade.append(card);
    });
  }

  grade.querySelectorAll(".card").forEach(function (card) {
    card.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); abreDetalhe(Number(card.dataset.id)); }
    });
    card.addEventListener("click", function () {
      abreDetalhe(Number(card.dataset.id));
    });
  });

  document.getElementById("stat-total").textContent = itens.length;
  document.getElementById("stat-disponiveis").textContent = itens.filter(function (i) { return i.status === "Disponível"; }).length;
}
