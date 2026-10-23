var ultimoFocoModal = null;

function abrirModal(alvo) {
  var overlay = typeof alvo === "string" ? document.getElementById(alvo) : alvo;
  if (!overlay) return;
  var jaAberto = document.querySelector(".overlay.open");
  if (jaAberto && jaAberto !== overlay) fechaModais();
  if (!overlay.classList.contains("open")) ultimoFocoModal = document.activeElement;
  var modal = overlay.querySelector(".modal");
  if (modal) {
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    var titulo = modal.querySelector("h2, h3");
    if (titulo) {
      if (!titulo.id) titulo.id = overlay.id + "-titulo";
      modal.setAttribute("aria-labelledby", titulo.id);
    }
  }
  overlay.classList.add("open");
  overlay.setAttribute("aria-hidden", "false");
  var primeiroControle = modal && Array.from(modal.querySelectorAll("button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex='0']")).find(function (elemento) { return elemento.getClientRects().length > 0; });
  if (primeiroControle) primeiroControle.focus();
  else if (modal) { modal.tabIndex = -1; modal.focus(); }
}

function fechaModais() {
  var haviaModal = false;
  document.querySelectorAll(".overlay.open").forEach(function (o) {
    haviaModal = true;
    o.classList.remove("open");
    o.setAttribute("aria-hidden", "true");
  });
  if (haviaModal && ultimoFocoModal && ultimoFocoModal.isConnected) ultimoFocoModal.focus();
  ultimoFocoModal = null;
}

document.querySelectorAll("[data-close]").forEach(function (el) {
  el.addEventListener("click", fechaModais);
});

document.querySelectorAll(".overlay").forEach(function (o) {
  o.setAttribute("aria-hidden", "true");
  o.addEventListener("click", function (e) {
    if (e.target === o) fechaModais();
  });
});

document.addEventListener("keydown", function (e) {
  var aberto = document.querySelector(".overlay.open");
  if (!aberto) return;
  if (e.key === "Escape") { fechaModais(); return; }
  if (e.key !== "Tab") return;
  var controles = Array.from(aberto.querySelectorAll("button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex='0']")).filter(function (elemento) { return elemento.getClientRects().length > 0 && elemento.getAttribute("aria-hidden") !== "true"; });
  if (!controles.length) { e.preventDefault(); return; }
  var primeiro = controles[0];
  var ultimo = controles[controles.length - 1];
  if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
  else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
});

document.getElementById("btn-open-form").addEventListener("click", function () {
  if (typeof exigirLogin === "function" && !exigirLogin()) return;
  abrirModal("form-overlay");
});

var timerAviso;
function mostraAviso(msg) {
  var caixa = document.getElementById("toast");
  document.getElementById("toast-text").textContent = msg;
  caixa.classList.add("show");
  clearTimeout(timerAviso);
  timerAviso = setTimeout(function () { caixa.classList.remove("show"); }, 3200);
}
