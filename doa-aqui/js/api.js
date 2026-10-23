// Camada única de comunicação com o backend — nenhum outro arquivo do front-end
// chama fetch() diretamente. Para usar outro endereço/porta, configure o metadado
// `doaaqui-api-base` no HTML; o endereço local abaixo é apenas o fallback de desenvolvimento.
//
// IMPORTANTE: como a API usa cookie de sessão + CORS com credenciais, o front-end
// precisa ser servido por um servidor HTTP de verdade (ex: `python3 -m http.server 8080`),
// não aberto direto como arquivo (file://) — e a origem daqui (protocolo+host+porta)
// precisa bater exatamente com CORS_ALLOWED_ORIGIN configurado no .env do backend.
var apiBaseConfigurada = document.querySelector('meta[name="doaaqui-api-base"]');
var API_BASE = (apiBaseConfigurada && apiBaseConfigurada.content.trim()) || "http://localhost:8000/api";
API_BASE = API_BASE.replace(/\/+$/, "");
// Mesma origem do backend, mas sem o "/api" — é onde as fotos enviadas ficam
// publicamente acessíveis (public/uploads/ do backend).
var uploadsBaseConfigurada = document.querySelector('meta[name="doaaqui-uploads-base"]');
var UPLOADS_BASE = (uploadsBaseConfigurada && uploadsBaseConfigurada.content.trim()) || API_BASE.replace(/\/api$/, "");
UPLOADS_BASE = UPLOADS_BASE.replace(/\/+$/, "");

var csrfTokenAtual = null;

async function apiFetch(caminho, opcoes) {
  opcoes = opcoes || {};
  var metodo = opcoes.metodo || "GET";
  // Upload de foto manda FormData, não JSON — nesse caso o Content-Type não pode
  // ser setado à mão (o navegador define o boundary do multipart sozinho).
  var ehFormData = (typeof FormData !== "undefined") && opcoes.corpo instanceof FormData;

  var cabecalhos = ehFormData
    ? Object.assign({}, opcoes.headers || {})
    : Object.assign({ "Content-Type": "application/json" }, opcoes.headers || {});

  // O token CSRF só é enviado em requisições que alteram dado — GET nunca precisa dele.
  if (csrfTokenAtual && metodo !== "GET") {
    cabecalhos["X-CSRF-Token"] = csrfTokenAtual;
  }

  var corpoFinal;
  if (opcoes.corpo === undefined) {
    corpoFinal = undefined;
  } else if (ehFormData) {
    corpoFinal = opcoes.corpo;
  } else {
    corpoFinal = JSON.stringify(opcoes.corpo);
  }

  var resposta;
  try {
    resposta = await fetch(API_BASE + caminho, {
      method: metodo,
      credentials: "include", // manda e recebe o cookie de sessão, mesmo entre origens diferentes
      headers: cabecalhos,
      body: corpoFinal
    });
  } catch (erroDeRede) {
    return { ok: false, status: 0, erro: "Não foi possível conectar ao servidor. Verifique se o backend está rodando." };
  }

  var dados = {};
  try {
    dados = await resposta.json();
  } catch (erroDeParse) {
    dados = {};
  }

  // Toda resposta que traz um csrfToken novo atualiza o token em memória —
  // login, cadastro e /me sempre devolvem o token válido da sessão atual.
  if (dados && dados.csrfToken) {
    csrfTokenAtual = dados.csrfToken;
  }

  if (!resposta.ok) {
    return { ok: false, status: resposta.status, erro: dados.erro || "Erro inesperado no servidor." };
  }

  dados.ok = true;
  dados.status = resposta.status;
  return dados;
}

/** Carrega categorias e bairros ativos do banco — usado nos dois selects de item e no filtro. */
async function carregarCategoriasEBairros() {
  var respCategorias = await apiFetch("/categorias/listar.php");
  var respBairros = await apiFetch("/bairros/listar.php");

  categorias = respCategorias.ok ? respCategorias.categorias.map(function (c) { return c.nome; }) : [];
  bairros = respBairros.ok ? respBairros.bairros.map(function (b) { return b.nome; }) : [];

  if (!respCategorias.ok || !respBairros.ok) {
    mostraAviso("Não foi possível carregar categorias/bairros do servidor.");
  }
}
