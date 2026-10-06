function fechaModais() {
  document.querySelectorAll(".overlay").forEach(function (o) { o.classList.remove("open"); });
}

document.querySelectorAll("[data-close]").forEach(function (el) {
  el.addEventListener("click", fechaModais);
});

document.querySelectorAll(".overlay").forEach(function (o) {
  o.addEventListener("click", function (e) {
    if (e.target === o) fechaModais();
  });
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") fechaModais();
});

document.getElementById("btn-open-form").addEventListener("click", function () {
  if (typeof exigirLogin === "function" && !exigirLogin()) return;
  document.getElementById("form-overlay").classList.add("open");
});

var timerAviso;
function mostraAviso(msg) {
  var caixa = document.getElementById("toast");
  document.getElementById("toast-text").textContent = msg;
  caixa.classList.add("show");
  clearTimeout(timerAviso);
  timerAviso = setTimeout(function () { caixa.classList.remove("show"); }, 3200);
}
