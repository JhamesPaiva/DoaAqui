# 🤝 Doa Aqui — Mural de Doações Solidárias

Projeto de extensão universitária desenvolvido para o curso de **Análise e Desenvolvimento de Sistemas**, na disciplina **Extensão Universitária III**.

O **Doa Aqui** é uma plataforma web que conecta pessoas que querem doar itens (roupas, móveis, eletrônicos, livros e brinquedos) com pessoas da comunidade que precisam desses itens — de forma simples, direta e sem burocracia.

> Protótipo de demonstração, desenvolvido como exercício acadêmico com potencial de gerar impacto social real na comunidade atendida pela equipe.

---

## 📌 Sobre o projeto

Muitas vezes existem, dentro da própria comunidade, itens em bom estado que deixaram de ser úteis para quem os possui — e do outro lado, pessoas que poderiam se beneficiar deles. O Doa Aqui nasce para reduzir esse desencontro, aproximando doador e interessado com o mínimo de atrito possível.

O sistema é dividido em duas áreas:

- **Área Pública** — qualquer pessoa pode navegar pelo mural de doações, filtrar itens por categoria, localização e status, e entrar em contato direto com o doador via WhatsApp.
- **Área Administrativa** — responsável pela moderação dos anúncios (aprovação, rejeição, edição e remoção) e pelo acompanhamento de métricas sociais do projeto.

---

## ✨ Funcionalidades

### Área pública
- 🧵 Mural com listagem de itens disponíveis para doação
- 🔎 Busca e filtros por categoria, localização (bairro) e status
- 📸 Cadastro de item com título, categoria, descrição, bairro e foto
- 💬 Contato direto com o doador via WhatsApp
- 🟢 Status visível do item: **Disponível**, **Reservado** ou **Doado**

### Área administrativa
- ✅ Aprovação, rejeição, edição ou remoção de anúncios
- 🔄 Alteração de status de qualquer item
- 📊 Métricas sociais: total de doações, itens já doados, categorias mais doadas

---

## 🧱 Tecnologias utilizadas

| Camada | Tecnologia |
|---|---|
| Front-end | HTML5, CSS3, JavaScript |
| Back-end | PHP puro (sem framework) |
| Banco de dados | MySQL |
| Modelagem do banco | [dbdiagram.io](https://dbdiagram.io) (DBML) |

> O front-end (`index.html` / `admin.html`) fala com o back-end PHP (pasta `/backend`)
> através da API em `js/api.js`. Sessão, itens, moderação e "Minhas doações" vêm do
> backend; `localStorage` é usado apenas para guardar a preferência de tema.

---

## 🗄️ Modelagem do banco de dados

O banco foi modelado em **DBML** e é composto por 8 tabelas:

| Tabela | Responsabilidade |
|---|---|
| `usuario` | Cadastro de doadores, interessados e administradores |
| `aceite_termo` | Versão e data/hora do aceite dos Termos pela conta |
| `categoria` | Categorias de itens; Alimentos permanece para anúncios legados, mas não pode ser usada em novas doações |
| `bairro` | Localizações usadas no filtro de busca |
| `item` | Anúncios de doação publicados |
| `item_foto` | Fotos de cada item (preparado para múltiplas imagens no futuro) |
| `moderacao` | Auditoria das ações do administrador sobre os anúncios |
| `historico_status` | Histórico de mudanças de status de cada item |

Principais decisões de modelagem:
- Uso de **ENUMs** para campos de valores fixos (`status`, `tipo`, `acao`), garantindo integridade no banco
- **Soft delete** em `item` (`removido_em`), preservando o histórico mesmo após remoção pelo admin
- Índices nos campos usados em filtros (`status`, `id_categoria`, `id_bairro`) para manter buscas rápidas
- Métricas sociais (RF10) calculadas via consultas SQL agregadas, sem tabela dedicada

O schema operacional (MySQL 8+) está em
[`../backend/database/schema.sql`](../backend/database/schema.sql). Os modelos e
documentos históricos estão em [`../docs/academico`](../docs/academico), fora da
instalação ativa; consulte o README dessa pasta antes de usar qualquer SQL antigo.

---

## 📋 Requisitos do sistema

O levantamento completo de requisitos funcionais e não funcionais está em
[`../docs/academico/Documento_de_Requisitos_DoaAqui.docx`](../docs/academico/Documento_de_Requisitos_DoaAqui.docx).

**Principais requisitos funcionais:**
- RF01 — Cadastrar item para doação com foto, descrição e categoria
- RF02/RF03 — Buscar e filtrar itens por categoria e localização
- RF04/RF05 — Exibir e atualizar o status do item
- RF06 — Contato direto entre doador e interessado
- RF07/RF08/RF09 — Moderação e gestão de anúncios pelo administrador
- RF10 — Geração de métricas sobre as doações realizadas

---

## 🚀 Como executar

O front-end agora depende do back-end (pasta `/backend`) rodando — sem ele, o mural
fica vazio e login/cadastro não funcionam.

**1. Suba o back-end primeiro** (veja o `README.md` dentro de `/backend` para o
passo a passo completo — schema, seed, `.env`):
```bash
cd backend
php -S localhost:8000 -t public
```

**2. Sirva o front-end por um servidor HTTP** — não abra `index.html` direto como
arquivo (`file://`), porque a API usa cookie de sessão com CORS, e isso exige uma
origem HTTP de verdade:
```bash
cd doa-aqui
python3 -m http.server 8080
```
Acesse `http://localhost:8080`.

**3. Confira se as origens batem**: `js/api.js` lê `doaaqui-api-base` e
`doaaqui-uploads-base` dos metadados HTML (com fallback local para
`http://localhost:8000`), e o `.env` do backend precisa ter
`CORS_ALLOWED_ORIGIN=http://localhost:8080` (ou a porta que você usar). Se as duas
pontas não baterem exatamente, o navegador bloqueia a requisição por CORS.

O passo a passo de banco de dados (schema, seed, credenciais de teste) está no
`README.md` dentro de `/backend`.

---

## 👥 Equipe

| Nome |
|---|
| André de Castro |
| Arthur Belinato |
| Cloviano Albuini |
| Jhames Paiva |

**Disciplina:** Extensão Universitária III
**Curso:** Análise e Desenvolvimento de Sistemas
**Professor orientador:** Aldecir de Almeida Fonseca

---

## 📄 Licença

Este projeto foi desenvolvido para fins acadêmicos como parte da disciplina de Extensão Universitária III. Sinta-se livre para estudar, adaptar e reutilizar o código para fins educacionais.

## Organização atual da interface

- `index.html`: mural, filtros, login, cadastro e criação de doações.
- `admin.html`: moderação e edição.
- `perfil.html`: informações da conta, foto e exclusão.
- `termos.html` e `privacidade.html`: documentos demonstrativos com dados fictícios explicitamente identificados; revise controlador, contatos e práticas reais antes de publicar.
- `assets/`: imagens e ícones utilizados pela interface.
- `css/`: estilos compartilhados e `legal.css`, usado somente nas páginas de Termos e Privacidade.
- `js/`: módulos por responsabilidade; `reveal.js` cuida da entrada ao rolar e `legal.js` da autenticação/rodapé nas páginas legais. Preserve a ordem de carregamento declarada no HTML.

Consulte [arquitetura](../docs/ARQUITETURA.md) e [documentação de design](../docs/design/README.md). O material acadêmico está em [docs/academico](../docs/academico/README.md), fora da pasta servida pelo frontend.
