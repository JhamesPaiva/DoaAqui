var inputFoto = document.getElementById("f-foto");
var dicaFoto = document.getElementById("f-foto-hint");
var dicaFotoPadrao = dicaFoto ? dicaFoto.textContent : "";

if (inputFoto && dicaFoto) {
  inputFoto.addEventListener("change", function () {
    dicaFoto.textContent = inputFoto.files[0] ? inputFoto.files[0].name : dicaFotoPadrao;
  });
}

function leFormularioNovoItem() {
  return {
    titulo: document.getElementById("f-title").value.trim(),
    categoria: document.getElementById("f-category").value,
    local: document.getElementById("f-location").value,
    desc: document.getElementById("f-desc").value.trim(),
    contato: document.getElementById("f-contact").value.trim(),
    contatoPublico: document.getElementById("f-public-contact").checked,
    arquivoFoto: inputFoto && inputFoto.files[0] ? inputFoto.files[0] : null
  };
}

// Envia a foto pro backend antes de criar o item, e devolve a URL que veio de lá.
// Retorna "" se não havia foto, ou null se o envio falhou (o aviso já é mostrado aqui).
async function enviaFotoSeHouver(arquivo) {
  if (!arquivo) return "";

  var formData = new FormData();
  formData.append("foto", arquivo);

  var resposta = await apiFetch("/itens/upload-foto.php", { metodo: "POST", corpo: formData });
  if (!resposta.ok) {
    mostraAviso(resposta.erro);
    return null;
  }
  return resposta.url;
}

async function publicaItem(dados) {
  if (!dados.titulo || !dados.categoria || !dados.local || !dados.desc) return false;

  var fotoUrl = await enviaFotoSeHouver(dados.arquivoFoto);
  if (fotoUrl === null) return false; // upload falhou, aviso já mostrado

  var resposta = await apiFetch("/itens/criar.php", {
    metodo: "POST",
    corpo: {
      titulo: dados.titulo,
      categoria: dados.categoria,
      bairro: dados.local,
      descricao: dados.desc,
      contato: dados.contato,
      contatoPublico: dados.contatoPublico,
      fotoUrl: fotoUrl
    }
  });

  if (!resposta.ok) {
    mostraAviso(resposta.erro);
    return false;
  }
  return true;
}

document.getElementById("new-item-form").addEventListener("submit", async function (e) {
  e.preventDefault();
  if (typeof exigirLogin === "function" && !exigirLogin()) return;

  var dados = leFormularioNovoItem();
  var submitButton = e.target.querySelector("button[type=submit]");
  if (submitButton.disabled) return;
  submitButton.disabled = true;
  submitButton.textContent = "Publicando…";
  var publicado;
  try { publicado = await publicaItem(dados); } finally { submitButton.disabled = false; submitButton.textContent = "Publicar doação"; }
  if (!publicado) return;

  e.target.reset();
  if (dicaFoto) dicaFoto.textContent = dicaFotoPadrao;
  fechaModais();
  mostraAviso("Doação publicada! Aguardando aprovação da moderação.");
  if (typeof carregarEDesenhaAdmin === "function") await carregarEDesenhaAdmin();
});
