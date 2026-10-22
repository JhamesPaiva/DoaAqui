// Autenticação de verdade — fala com /api/auth/*. A sessão em si é o cookie HttpOnly
// que o navegador já manda sozinho em toda requisição (ver api.js); a variável
// "sessao" aqui é só uma cópia local, pra tela renderizar sem precisar perguntar
// pro servidor toda hora.

async function carregarSessao() {
  var resposta = await apiFetch("/auth/me.php");
  sessao = (resposta.ok && resposta.usuario) ? resposta.usuario : null;
  atualizaCabecalho();
}

async function cadastrarUsuario(nome, email, senha, telefone) {
  var resposta = await apiFetch("/auth/cadastro.php", {
    metodo: "POST",
    corpo: { nome: nome, email: email, senha: senha, telefone: telefone }
  });
  if (!resposta.ok) return { ok: false, erro: resposta.erro };

  sessao = resposta.usuario;
  return { ok: true, usuario: sessao };
}

async function logarUsuario(email, senha) {
  var resposta = await apiFetch("/auth/login.php", {
    metodo: "POST",
    corpo: { email: email, senha: senha }
  });
  if (!resposta.ok) return { ok: false, erro: resposta.erro };

  sessao = resposta.usuario;
  return { ok: true, usuario: sessao };
}

async function sairUsuario() {
  await apiFetch("/auth/logout.php", { metodo: "POST" });
  sessao = null;
  atualizaCabecalho();
  mostraAviso("Sessão encerrada.");
  if (["admin", "perfil"].includes(document.body.dataset.pagina)) {
    window.location.href = "index.html";
  }
}

// Exige apenas estar logado (qualquer tipo). Usado antes de publicar um item.
// Confia na sessão já carregada em memória — carregarSessao() sempre roda
// no bootstrap da página, antes de qualquer interação ficar disponível.
function exigirLogin() {
  if (sessao) return true;
  mostraAviso("Faça login para anunciar uma doação.");
  window.doacaoAposLogin = true;
  abreLogin();
  return false;
}

// Exige estar logado como admin. Usado no carregamento do painel administrativo.
function exigirAdmin() {
  if (sessao && sessao.tipo === "admin") return true;
  window.location.href = "index.html?login=admin";
  return false;
}

function abreLogin() {
  var form = document.getElementById("login-form");
  if (!form) return;
  form.reset();
  document.getElementById("login-overlay").classList.add("open");
}

function abreCadastro() {
  var form = document.getElementById("cadastro-form");
  if (!form) return;
  form.reset();
  document.getElementById("cadastro-overlay").classList.add("open");
}

function atualizaCabecalho() {
  var cont = document.getElementById("auth-area");
  if (!cont) return;
  var navAdmin = document.getElementById("nav-admin");

  if (sessao) {
    if (navAdmin) navAdmin.style.display = sessao.tipo === "admin" ? "" : "none";
    var inicial = sessao.nome.trim().charAt(0).toUpperCase();
    var primeiroNome = sessao.nome.trim().split(" ")[0];
    var mostraMeusAnuncios = !["admin", "perfil"].includes(document.body.dataset.pagina);
    cont.innerHTML =
      '<div class="auth-user">' +
        '<a class="user-chip profile-link" href="perfil.html" aria-label="Abrir meu perfil"><span class="avatar"></span><span class="profile-shortname"></span></a>' +
        (mostraMeusAnuncios ? '<button type="button" class="link-btn" id="btn-mine">Minhas doações</button>' : '') +
        '<button type="button" class="link-btn" id="btn-logout">Sair</button>' +
      '</div>';
    renderProfileAvatar(cont.querySelector('.profile-link .avatar'), sessao);
    cont.querySelector('.profile-shortname').textContent = primeiroNome;
    cont.querySelector('.profile-link').title = 'Perfil de ' + sessao.nome;
    document.getElementById("btn-logout").addEventListener("click", sairUsuario);
    var btnMine = document.getElementById("btn-mine");
    if (btnMine) {
      btnMine.addEventListener("click", function () {
        if (typeof abreMeusAnuncios === "function") abreMeusAnuncios();
      });
    }
  } else {
    if (navAdmin) navAdmin.style.display = "none";
    cont.innerHTML =
      '<div class="auth-links">' +
        '<a href="#" id="btn-open-login">Entrar</a>' +
        '<a href="#" id="btn-open-cadastro">Cadastrar</a>' +
      '</div>';
    document.getElementById("btn-open-login").addEventListener("click", function (e) { e.preventDefault(); abreLogin(); });
    document.getElementById("btn-open-cadastro").addEventListener("click", function (e) { e.preventDefault(); abreCadastro(); });
  }
}

var formCadastro = document.getElementById("cadastro-form");
if (formCadastro) {
  formCadastro.addEventListener("submit", async function (e) {
    e.preventDefault();
    var nome = document.getElementById("c-nome").value.trim();
    var email = document.getElementById("c-email").value.trim();
    var senha = document.getElementById("c-senha").value;
    var confirma = document.getElementById("c-confirma").value;
    var telefone = document.getElementById("c-telefone").value.trim();

    if (senha.length < 4) { formFeedback(formCadastro,"Use pelo menos 4 caracteres na senha.","c-senha"); return; }
    if (senha !== confirma) { formFeedback(formCadastro,"As senhas não coincidem. Confira os dois campos.","c-confirma"); return; }

    var button = formCadastro.querySelector('button[type=submit]');
    if (button.disabled) return;
    var originalLabel=button.textContent;button.disabled=true;button.textContent='Aguarde…';
    var r;
    try { r = await cadastrarUsuario(nome, email, senha, telefone); } finally {button.disabled=false;button.textContent=originalLabel;}
    if (!r.ok) { formFeedback(formCadastro,r.erro); return; }

    fechaModais();
    atualizaCabecalho();
    if (new URLSearchParams(window.location.search).get("perfil") === "1") { window.location.href="perfil.html"; return; }
    if (window.doacaoAposLogin) { window.doacaoAposLogin = false; document.getElementById("form-overlay").classList.add("open"); }
    mostraAviso("Conta criada! Bem-vindo(a), " + r.usuario.nome.split(" ")[0] + ".");
  });
}

var formLogin = document.getElementById("login-form");
if (formLogin) {
  formLogin.addEventListener("submit", async function (e) {
    e.preventDefault();
    var email = document.getElementById("l-email").value.trim();
    var senha = document.getElementById("l-senha").value;

    var button = formLogin.querySelector('button[type=submit]');
    if (button.disabled) return;
    var originalLabel=button.textContent;button.disabled=true;button.textContent='Aguarde…';
    var r;
    try { r = await logarUsuario(email, senha); } finally {button.disabled=false;button.textContent=originalLabel;}
    if (!r.ok) { formFeedback(formLogin,r.erro); return; }

    fechaModais();
    atualizaCabecalho();
    if (new URLSearchParams(window.location.search).get("perfil") === "1") { window.location.href="perfil.html"; return; }
    if (window.doacaoAposLogin) { window.doacaoAposLogin = false; document.getElementById("form-overlay").classList.add("open"); }
    mostraAviso("Bem-vindo(a) de volta, " + r.usuario.nome.split(" ")[0] + "!");
  });
}

var linkIrCadastro = document.getElementById("link-ir-cadastro");
if (linkIrCadastro) {
  linkIrCadastro.addEventListener("click", function (e) { e.preventDefault(); fechaModais(); abreCadastro(); });
}
var linkIrLogin = document.getElementById("link-ir-login");
if (linkIrLogin) {
  linkIrLogin.addEventListener("click", function (e) { e.preventDefault(); fechaModais(); abreLogin(); });
}

function renderProfileAvatar(element, user) {
  element.textContent = user.nome.trim().charAt(0).toUpperCase();
  if (!/^\/uploads\/[a-f0-9]{32}\.(jpg|jpeg|png|webp)$/.test(user.fotoUrl || '')) return;
  var image = document.createElement('img');
  image.src = UPLOADS_BASE + user.fotoUrl; image.alt = '';
  image.addEventListener('error', function () { element.textContent = user.nome.trim().charAt(0).toUpperCase(); });
  element.replaceChildren(image);
}
