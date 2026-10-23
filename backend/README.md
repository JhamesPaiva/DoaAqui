# Doa Aqui — Backend (PHP puro)

Backend da Fase 1+2 do projeto: base de dados (itens, categorias, bairros) e
autenticação (cadastro, login, sessão). PHP puro, sem framework e sem Composer —
só a biblioteca padrão do PHP + PDO.

## Requisitos

- PHP 8.1 ou superior, com as extensões `pdo_mysql`, `mbstring` e `fileinfo`
- MySQL 8+ ou MariaDB 10.6+
- Um servidor web (Apache/Nginx) **ou**, para desenvolvimento local, o servidor
  embutido do PHP (`php -S`)

## Estrutura

```
backend/
├── config/config.php     → carrega o .env, endurece exibição de erros
├── src/
│   ├── Database/         → conexão PDO única (Conexao.php)
│   ├── Http/              → Request, Response, Auth (sessão), Validador
│   ├── Repositories/      → 1 classe por tabela, só SQL preparado
│   ├── Services/          → regra de negócio (AuthService, ItemService)
│   ├── Security/          → LoginThrottle (bloqueio por força bruta)
│   └── Support/           → Enums (mapeia status do banco ↔ front-end)
├── public/                → ÚNICO diretório que deve ficar acessível pela internet
│   └── api/               → os endpoints de fato
└── database/
    ├── schema.sql          → script de criação das tabelas, sem dados
    └── seed.sql            → contas e anúncios de demonstração (não usar em produção)
```

**Importante:** ao publicar em produção, aponte o document root do Apache/Nginx
para `backend/public/`, nunca para `backend/` inteiro — `config/`, `src/`, `.env`
e `database/` não podem ser acessíveis por URL.

## Configuração local

1. Copie o arquivo de exemplo e preencha com suas credenciais:
   ```bash
   cp .env.example .env
   ```

2. Crie o banco e um usuário de aplicação com **privilégio mínimo** (nunca use
   root na aplicação — só SELECT/INSERT/UPDATE/DELETE, sem DDL):
   ```sql
   CREATE DATABASE doaaqui CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'doaaqui_app'@'localhost' IDENTIFIED BY 'escolha-uma-senha-forte';
   GRANT SELECT, INSERT, UPDATE, DELETE ON doaaqui.* TO 'doaaqui_app'@'localhost';
   FLUSH PRIVILEGES;
   ```
   Preencha `DB_USER`/`DB_PASS` no `.env` com esse usuário, não com root.

3. Rode o schema e os dados locais — **atenção ao charset do cliente mysql**, senão os
   acentos corrompem ao inserir (isso me pegou nos testes: o `mysql` CLI usa
   `latin1` por padrão, mesmo com a tabela em `utf8mb4`):
   ```bash
   mysql --default-character-set=utf8mb4 -u root < database/schema.sql
   mysql --default-character-set=utf8mb4 -u root doaaqui < database/seed.sql
   mysql --default-character-set=utf8mb4 -u root doaaqui < database/bairros-muriae.sql
   ```
   Para atualizar uma instalação anterior, faça backup e aplique uma vez
   `database/migrations/2026-10-23-privacidade.sql`. A migração oculta contatos
   de anúncios antigos até que cada titular autorize a exibição novamente.
   Em produção, crie um banco vazio e aplique somente `schema.sql` e os dados
   institucionais necessários; não importe `seed.sql`, que contém contas de teste.
   `schema.sql` é só a criação das tabelas (sem dado nenhum). O seed de exemplo
   *original* que veio junto do schema entregue (com hashes de senha falsos, só
   estrutural) está preservado à parte em `../docs/academico/historico/schema_seed_exemplo_original.sql`,
   caso você queira comparar — não use os dois seeds juntos.

4. Suba o servidor embutido do PHP apontando pra `public/`. **Importante:** o
   servidor embutido não lê o arquivo `.user.ini` (isso só funciona em PHP-FPM
   de produção), então pro upload de foto funcionar com arquivos maiores que 2MB
   em desenvolvimento local, suba assim, elevando o limite na hora:
   ```bash
   php -S localhost:8000 -t public -d upload_max_filesize=5M -d post_max_size=6M
   ```
   Em produção com PHP-FPM, o `public/.user.ini` já cuida disso sozinho. Em Apache
   com `mod_php`, ajuste via `php_value` na configuração do site (não em `.htaccess`,
   caso `mod_php` não esteja carregado, a diretiva quebra a config do Apache).

### Credenciais de teste (vindas do `seed.sql`)

| E-mail | Senha | Tipo |
|---|---|---|
| admin@doaaqui.com | admin123 | admin |
| maria@email.com | maria123 | comum |
| joao@email.com | joao123 | comum |

(As mesmas credenciais de admin que já existiam no mock do front-end.)

## Segurança aplicada (e por quê)

| Medida | Onde | Por quê |
|---|---|---|
| SQL só com prepared statements, `PDO::ATTR_EMULATE_PREPARES => false` | `Conexao.php`, todos os Repositories | Elimina SQL injection na origem — nenhuma string de usuário é concatenada numa query |
| Senha com `password_hash`/`password_verify` (bcrypt) | `AuthService` | Nunca guarda nem compara senha em texto puro |
| Sessão com `HttpOnly`, `SameSite=Lax`, `Secure` condicional a HTTPS | `Auth::iniciarSessao()` | Javascript não lê o cookie (mitiga roubo de sessão via XSS); mitiga CSRF de origem cruzada |
| `session_regenerate_id(true)` no login | `Auth::logar()` | Evita fixação de sessão |
| Token CSRF exigido em toda rota POST/PUT/DELETE | `Auth::exigirCsrf()` | Cookie de sessão sozinho não é suficiente pra autorizar uma ação — protege contra CSRF mesmo com o SameSite |
| Bloqueio após 5 tentativas de login erradas (por e-mail+IP, 15 min) | `LoginThrottle` | Dificulta força bruta e credential stuffing |
| Erros de PHP/exceções nunca aparecem na resposta HTTP | `config.php`, `bootstrap.php` (`set_exception_handler`) | Não vaza stack trace, caminho de arquivo nem query SQL pro cliente |
| Mensagem de erro genérica e igual pra "e-mail não existe" e "senha errada" | `AuthService::logar()` | Não permite descobrir quais e-mails têm conta cadastrada |
| `.env` fora do webroot, fora do Git | estrutura de pastas, `.gitignore` | Credenciais de banco nunca vão pro controle de versão nem ficam expostas por URL |
| Usuário de banco com privilégio mínimo (sem DDL) | grants do MySQL (ver "Configuração") | Mesmo que a aplicação seja comprometida, quem invadir não consegue alterar a estrutura do banco |
| `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`, sem `X-Powered-By` | `Response::cabecalhosSeguranca()` | Mitiga MIME sniffing, clickjacking, e não expõe a versão do PHP rodando |
| CORS restrito a uma origem exata (nunca `*`) | `bootstrap.php` | Só o front-end configurado pode chamar a API com credenciais |
| Validação de entrada (tamanho, e-mail, whitelist de categoria/bairro) | `Validador`, `Services` | Rejeita dado malformado antes de chegar no banco |

| Validação real de tipo de arquivo (finfo + getimagesize, nunca a extensão/Content-Type do cliente), nome gerado no servidor, pasta de upload sem execução de script | `UploadService`, `public/uploads/.htaccess` | Impede upload de arquivo disfarçado de imagem, path traversal e execução de script via upload |

## Endpoints disponíveis

Toda resposta é JSON. Exceto cadastro e login, rotas que alteram dados exigem sessão e token CSRF obtido em cadastro/login/me.

| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| GET | `/api/categorias/listar.php` | — | Lista categorias ativas |
| GET | `/api/bairros/listar.php` | — | Lista bairros ativos |
| GET | `/api/itens/listar.php` | — | Feed público (só itens aprovados e não removidos) |
| POST | `/api/itens/criar.php` | login + CSRF | Publica item novo (entra como `Pendente`); aceita `fotoUrl` opcional |
| POST | `/api/itens/upload-foto.php` | login + CSRF | Envia a foto do item (`multipart/form-data`, campo `foto`) — devolve `{ url }` pra usar em `fotoUrl` |
| POST | `/api/auth/cadastro.php` | — | Cria conta (`tipo: comum`) e já loga |
| POST | `/api/auth/login.php` | — | Login por e-mail/senha |
| POST | `/api/auth/logout.php` | login + CSRF | Encerra a sessão |
| POST | `/api/auth/foto.php` | login + CSRF | Atualiza foto de perfil |
| POST | `/api/auth/excluir.php` | login + CSRF + senha | Exclui a própria conta |
| POST | `/api/meus-anuncios/remover.php` | login + CSRF | Remove doação publicada própria |
| GET | `/api/auth/me.php` | — | Retorna o usuário da sessão atual (ou `null`) |
| GET | `/api/admin/pendentes.php` | admin | Fila de moderação |
| GET | `/api/admin/publicados.php` | admin | Todos os itens aprovados (qualquer status) |
| POST | `/api/admin/aprovar.php` | admin + CSRF | Aprova um item pendente — `{ id }` |
| POST | `/api/admin/rejeitar.php` | admin + CSRF | Rejeita um item pendente — `{ id, observacao? }` |
| POST | `/api/admin/editar.php` | admin + CSRF | Edita um item publicado — `{ id, titulo, categoria, bairro, descricao, contato, fotoUrl? }` |
| POST | `/api/admin/remover.php` | admin + CSRF | Soft delete de um item publicado — `{ id }` |
| POST | `/api/admin/status.php` | admin + CSRF | Troca o status de qualquer item — `{ id, status }` |
| GET | `/api/admin/historico.php?item_id=` | admin | Histórico de status de um item |
| GET | `/api/admin/metricas.php` | admin | Contagens (RF10) + categorias mais doadas |
| GET | `/api/admin/log.php` | admin | Últimas ações de moderação |
| GET | `/api/meus-anuncios/listar.php` | login | Pendentes + publicados do usuário logado |
| POST | `/api/meus-anuncios/cancelar.php` | login + CSRF | Cancela (apaga) um pendente próprio — `{ id }` |
| POST | `/api/meus-anuncios/status.php` | login + CSRF | Troca o status de um item próprio (RF05) — `{ id, status }` |

`/api/admin/status.php` e `/api/meus-anuncios/status.php` chamam a mesma regra de
negócio (`ItemService::mudarStatus`) — a única diferença é que a rota de admin
pode alterar qualquer item, e a de "meus anúncios" só deixa o dono mexer no
próprio (checagem de posse, devolve 403 senão).

## O que ainda falta (próximas etapas)

- Múltiplas fotos por item (a tabela `item_foto` já existe no schema, pensada
  pra isso — hoje só é usado o campo `foto_url` de uma foto só, igual ao protótipo).

### Foto de perfil e exclusão da conta
A foto usa o upload validado (JPG, PNG ou WEBP, até 5 MB). O vínculo com o usuário fica em `storage/profile_photos/<id>.json`, fora da pasta pública; as imagens ficam em `public/uploads`. Preserve ambas as pastas nos backups e permita escrita pelo PHP. Não é necessário alterar o banco.

A exclusão exige sessão, CSRF e senha atual; remove o cadastro, os anúncios e os registros relacionados em uma transação. Outras sessões deixam de acessar a conta na próxima requisição. A imagem de perfil atual é apagada; arquivos de anúncios sem outro vínculo também são removidos. Backups e logs de infraestrutura seguem os prazos configurados pela operação e precisam constar no Aviso de Privacidade.

## Preparação para produção e privacidade

- Configure `CORS_ALLOWED_ORIGIN` com a origem HTTPS exata do front-end.
- Em `doa-aqui/index.html`, `admin.html` e `perfil.html`, troque os metadados
  `doaaqui-api-base` e `doaaqui-uploads-base` pelos endereços HTTPS reais.
- Use HTTPS em todo o site e API; revise domínio, cookies `Secure`, CORS e
  política de segurança de conteúdo no ambiente publicado.
- Não publique as credenciais de teste do seed, `.env`, logs, pastas `src/`,
  `config/` ou `database/`. Crie administradores com credenciais próprias.
- Defina o controlador, canal para direitos LGPD, fornecedores e localidades de
  armazenamento, bases legais por finalidade e prazos de retenção/backup. Os
  documentos em `doa-aqui/privacidade.html` e `doa-aqui/termos.html` usam dados
  fictícios identificados como demonstração; revise-os com as informações e
  práticas reais antes de publicar.
- Consulte [o inventário de privacidade e operação](../docs/PRIVACIDADE-OPERACAO.md)
  para dados observados no código e decisões ainda pendentes.
