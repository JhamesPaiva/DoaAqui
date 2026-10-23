# Privacidade e operação do DoaAqui

Este documento registra o comportamento observado no código em 23/10/2026 e as
decisões que a instituição responsável precisa tomar antes de publicar o serviço.
É um inventário técnico, não um parecer jurídico nem uma confirmação de
conformidade integral com a LGPD.

## Dados e usos implementados

| Dado | Uso no sistema | Exposição/armazenamento observado |
|---|---|---|
| Nome, e-mail e telefone | Cadastro, acesso e administração dos anúncios | Banco de dados; o nome e telefone da conta não aparecem no feed público |
| Senha | Autenticação | Hash salvo no banco; a senha não deve ser registrada em logs |
| Aceite dos Termos | Registro da versão aceita no cadastro | `aceite_termo`; removido junto com a conta |
| Título, descrição, categoria e bairro | Moderação e anúncio | Feed público após aprovação |
| WhatsApp para contato | Combinar a doação | Só o feed público o recebe quando a pessoa marca a autorização por anúncio |
| Fotos de anúncio | Ilustrar o item | Arquivo público depois do upload; links são removidos ao excluir anúncio/conta e arquivo órfão é apagado |
| Foto de perfil | Identificar a conta na experiência autenticada | Referência em `storage/profile_photos`; arquivo em uploads; apagados ao excluir a conta |
| Sessão, token CSRF, IP e e-mail usado no login | Acesso, proteção contra CSRF e limitação de tentativas | Cookie de sessão e controles do backend; logs do servidor dependem da hospedagem |
| Tema escolhido | Preferência de interface | `localStorage` do navegador |

O código revisado não configura analytics, publicidade, pixels ou fontes
remotas. O site usa fonte do sistema. O link de WhatsApp transfere a navegação
para serviço externo quando a pessoa escolhe abrir o contato.

## Controles implementados nesta revisão

- A política de privacidade e os Termos estão acessíveis no rodapé e no cadastro.
- O cadastro exige aceite dos Termos e grava a versão/data em `aceite_termo`.
- A autorização para publicar WhatsApp é separada e explícita por anúncio; o
  contato fica oculto por padrão e anúncios antigos continuam ocultos após a
  migração.
- O feed público não devolve nome, telefone da conta nem contato não autorizado.
- Exclusão de conta remove os registros relacionados em transação, foto de
  perfil e fotos de anúncio não referenciadas. Remover anúncio publicado oculta
  contato/foto e mantém histórico mínimo de moderação.
- Conteúdo dinâmico da API é escapado antes de compor HTML e os modais recebem
  semântica de diálogo, foco inicial, retorno de foco, fechamento por Escape e
  contenção de Tab.
- API e endereço de uploads são configuráveis por metadados por ambiente; o
  fallback local permanece adequado somente para desenvolvimento.

## Decisões necessárias antes da publicação

1. Informar a pessoa jurídica ou natural que será controladora, endereço/canal
   de privacidade e canal de suporte. Definir quem responde aos pedidos dos
   titulares e eventual encarregado, conforme o enquadramento da operação.
2. Mapear hospedagem, banco, e-mail, backups, monitoramento e outros operadores;
   documentar finalidade, local de armazenamento e eventual transferência
   internacional de dados.
3. Definir e documentar uma base legal adequada para cada finalidade. A caixa de
   aceite dos Termos não substitui essa análise; a autorização do WhatsApp trata
   da exibição pública daquele contato.
4. Aprovar prazos para sessão, tentativas de login, logs HTTP/PHP, moderação,
   backups e solicitações de exclusão. Definir como expurgar backups ao vencer o
   prazo e como responder quando dados ainda estiverem em cópias de segurança.
5. Definir faixa etária e participação de menores, regras de moderação e um
   processo de denúncia/retirada de conteúdo e atendimento a incidentes.
6. Confirmar o procedimento para solicitações LGPD, incluindo confirmação,
   acesso, correção, informação sobre compartilhamento, revogação quando
   aplicável e eliminação nos limites legais.
7. Preparar produção com HTTPS, origem CORS exata, endereços reais nos metadados
   `doaaqui-api-base` e `doaaqui-uploads-base`, credenciais próprias, seed de
   demonstração desativado e política de backup/retention operacional.
8. A migração existente foi escrita para uma execução única em banco que já
   possui as tabelas. Fazer backup, conferir o schema e planejar rollback antes
   de aplicá-la a dados reais.

## Referências oficiais

- [Lei nº 13.709/2018 (LGPD), texto compilado — Planalto](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm)
- [Direitos dos titulares — ANPD](https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados-1/direito-dos-titulares)
- [Resolução CD/ANPD nº 2/2022 — agentes de tratamento de pequeno porte](https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/resolucao-cd-anpd-no-2-de-27-de-janeiro-de-2022)
