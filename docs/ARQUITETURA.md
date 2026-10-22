# Organização do DoaAqui

## Mapa

- Raiz: README e pares BAT/PowerShell para iniciar e configurar. Os BAT são atalhos; não duplicam a lógica PowerShell.
- doa-aqui/: somente a interface e seu README. HTML/CSS/JavaScript sem framework ou etapa de build.
- backend/public/: raiz pública da API e uploads. Nunca servir backend/ inteiro.
- backend/src/Http: protocolo, validação e autenticação; Services: regras de negócio; Repositories: consultas; Database: conexão; Security: limitação de tentativas; Support: conversões de status.
- backend/database/: schema operacional, seed de desenvolvimento e catálogo único de bairros.
- backend/tools/: comandos PHP de configuração/manutenção.
- backend/storage/: estado local gravável, não versionado; .gitkeep mantém pastas vazias.
- docs/design/: decisões e referências visuais; docs/academico/: entregáveis e SQL histórico.

## CSS ativo e precedência

identidade.css → circular.css → profile.css → form-design.css (mural/admin) → theme.css → polish-ui.css (mural/admin).

As seis folhas possuem responsabilidades e regras complementares. Foram excluídas dez folhas antigas não carregadas. As camadas atuais não foram concatenadas nem reordenadas: isso mudaria a precedência de regras, especialmente no tema escuro. Uma futura consolidação deve extrair variáveis e componentes com comparação visual por página.

## JavaScript e API

dados.js guarda o estado; api.js concentra fetch e CSRF; auth.js concentra sessão; cada página usa seu inicializador. Os módulos de mural, filtros, detalhes, modais e administração são consumidores dessas funções. form-design.js monta controles; polish-ui.js acrescenta prévia e filtros; interface.js cuida da interação acessível. Essa ordem deve permanecer explícita no HTML.

As rotas PHP são pequenas entradas HTTP. As classes do backend têm referências no código e foram mantidas. Não adicionar framework, bundler ou novas pastas para substituir separações que já funcionam.

## Dados locais

Sessões, logs, bloqueio de tentativas, referências de perfil e uploads ficam fora dos novos commits. .env permanece local. Remover arquivos do índice Git não remove versões de commits anteriores. Não reescrever histórico automaticamente.

Backup operacional precisa do banco, uploads e storage/profile_photos juntos. Nenhuma limpeza de imagens por nome ou data: uma imagem pode estar vinculada a anúncio removido, histórico ou perfil. A tabela item_foto, embora reservada para expansão, é referenciada pela exclusão de conta e não pode ser removida isoladamente.

## Melhorias estruturais para outra etapa

- Migrar referência da foto de perfil do JSON para MySQL, com migração autorizada por administrador do banco e transferência dos vínculos existentes.
- Extrair a transação de exclusão de conta da rota para um serviço/repositório, com testes de integridade e sessões. Não alterar essa operação destrutiva numa limpeza de arquivos.
- Centralizar padrões de componentes CSS preservando aparência e responsividade.
- Revisar imagens órfãs com inventário cruzado no banco antes de qualquer exclusão física.

Essas alterações têm impacto funcional e não são equivalentes à remoção de arquivos sem uso.
