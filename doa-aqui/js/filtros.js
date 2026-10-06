function desenhaFiltroCategoria() {
  var cont = document.getElementById("category-filters");
  var html = "";
  var cats = listaCategorias();
  for (var i = 0; i < cats.length; i++) {
    html += '<label class="chip-option"><input type="checkbox" class="cat-filter" value="' + cats[i] + '" checked> ' + cats[i] + '</label>';
  }
  cont.innerHTML = html;
  filtroAtual.categorias = new Set(cats);

  var boxes = cont.querySelectorAll(".cat-filter");
  boxes.forEach(function (cb) {
    cb.addEventListener("change", function () {
      if (cb.checked) filtroAtual.categorias.add(cb.value);
      else filtroAtual.categorias.delete(cb.value);
      desenhaGrade();
    });
  });
}

function desenhaFiltroLocal() {
  var sel = document.getElementById("location-filter");
  var html = '<option value="">Todos os bairros</option>';
  for (var j = 0; j < bairros.length; j++) {
    html += '<option value="' + bairros[j] + '">' + bairros[j] + '</option>';
  }
  sel.innerHTML = html;
}

document.getElementById("search-form").addEventListener("submit", function (e) {
  e.preventDefault();
  filtroAtual.busca = document.getElementById("search-input").value.trim().toLowerCase();
  desenhaGrade();
  document.getElementById("mural").scrollIntoView({ behavior: "smooth" });
});

document.querySelectorAll(".status-filter").forEach(function (cb) {
  cb.addEventListener("change", function () {
    if (cb.checked) filtroAtual.status.add(cb.value);
    else filtroAtual.status.delete(cb.value);
    desenhaGrade();
  });
});

document.getElementById("location-filter").addEventListener("change", function (e) {
  filtroAtual.local = e.target.value;
  desenhaGrade();
});

document.getElementById("clear-filters").addEventListener("click", function () {
  filtroAtual = {
    busca: "",
    categorias: new Set(listaCategorias()),
    status: new Set(["Disponível", "Reservado", "Doado"]),
    local: ""
  };
  document.getElementById("search-input").value = "";
  document.getElementById("location-filter").value = "";
  document.querySelectorAll(".cat-filter").forEach(function (cb) { cb.checked = true; });
  document.querySelectorAll(".status-filter").forEach(function (cb) { cb.checked = true; });
  desenhaGrade();
});
