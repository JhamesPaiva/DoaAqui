// A área legal compartilha o cabeçalho e o rodapé da página principal.
(function () {
  var authArea = document.getElementById("auth-area");
  var adminLink = document.getElementById("nav-admin");

  function adicionarLink(container, texto, href, classe, ariaLabel) {
    var link = document.createElement("a");
    link.href = href;
    link.textContent = texto;
    if (classe) link.className = classe;
    if (ariaLabel) link.setAttribute("aria-label", ariaLabel);
    container.appendChild(link);
    return link;
  }

  function mostrarVisitante() {
    if (!authArea) return;
    authArea.replaceChildren();
    var links = document.createElement("div");
    links.className = "auth-links";
    adicionarLink(links, "Entrar", "index.html?acao=entrar");
    adicionarLink(links, "Cadastrar", "index.html?acao=cadastrar");
    authArea.appendChild(links);
    if (adminLink) adminLink.hidden = true;
  }

  function mostrarPessoa(usuario) {
    if (!authArea) return;
    authArea.replaceChildren();
    var actions = document.createElement("div");
    actions.className = "auth-user";

    var nome = String(usuario.nome || "Pessoa").trim();
    var primeiroNome = nome.split(/\s+/)[0] || "Pessoa";
    var profile = document.createElement("a");
    profile.className = "user-chip profile-link";
    profile.href = "perfil.html";
    profile.setAttribute("aria-label", "Abrir meu perfil");
    profile.title = "Perfil de " + nome;
    var avatar = document.createElement("span");
    avatar.className = "avatar";
    avatar.textContent = nome.charAt(0).toUpperCase();
    var shortName = document.createElement("span");
    shortName.className = "profile-shortname";
    shortName.textContent = primeiroNome;
    profile.append(avatar, shortName);
    actions.appendChild(profile);

    if (usuario.tipo !== "admin") {
      adicionarLink(actions, "Minhas doações", "index.html?minhas=1", "link-btn");
    }

    var logout = document.createElement("button");
    logout.type = "button";
    logout.className = "link-btn";
    logout.textContent = "Sair";
    logout.addEventListener("click", async function () {
      logout.disabled = true;
      var resposta = await apiFetch("/auth/logout.php", { metodo: "POST" });
      if (resposta.ok) {
        mostrarVisitante();
      } else {
        logout.disabled = false;
      }
    });
    actions.appendChild(logout);
    authArea.appendChild(actions);

    if (adminLink) adminLink.hidden = usuario.tipo !== "admin";
  }

  async function carregarDadosDoRodape() {
    var rodapeStats = document.getElementById("legal-community-count");
    if (!rodapeStats) return;
    var resposta = await apiFetch("/itens/listar.php");
    if (!resposta.ok || !Array.isArray(resposta.itens)) return;
    document.getElementById("stat-total").textContent = String(resposta.itens.length);
    document.getElementById("stat-disponiveis").textContent = String(
      resposta.itens.filter(function (item) { return item.status === "Disponível"; }).length
    );
    rodapeStats.hidden = false;
  }

  async function iniciar() {
    mostrarVisitante();
    var resultados = await Promise.all([
      apiFetch("/auth/me.php"),
      carregarDadosDoRodape()
    ]);
    var sessao = resultados[0];
    if (sessao.ok && sessao.usuario) mostrarPessoa(sessao.usuario);
  }

  iniciar();
})();
