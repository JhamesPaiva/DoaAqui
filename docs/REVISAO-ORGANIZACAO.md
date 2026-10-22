# Organização aplicada — 16/10/2026

## Alterações concluídas

- Excluídas dez folhas CSS não referenciadas: admin, base, cabecalho, como-funciona, hero, modal, mural, responsivo, rodape e toast.
- Preservadas as seis folhas ativas e sua ordem, inclusive os temas e as melhorias recentes.
- Três documentos visuais movidos para `docs/design/`.
- Quatro entregáveis acadêmicos movidos para `docs/academico/`, fora da pasta pública do frontend.
- Seed ilustrativo com hashes falsos arquivado em `docs/academico/historico/`; os scripts operacionais permanecem em `backend/database/`.
- Sete uploads e três sessões retirados somente do índice Git; arquivos físicos preservados. A exclusão no índice ficará registrada no próximo commit. Nenhum commit ou histórico foi reescrito.
- Regras de dados locais consolidadas em `backend/.gitignore`; regras de ferramentas e sistema centralizadas no `.gitignore` da raiz. Removido o `.gitignore` redundante do frontend.
- Criados marcadores `.gitkeep` para as pastas de sessões e fotos de perfil.
- Eliminada a cópia da lista completa de bairros no seed. `bairros-muriae.sql` é a fonte única, aplicada pelo configurador após o seed e pelo atualizador em instalações existentes.
- Atualizados READMEs, índice de documentação, mapa de arquitetura e referências aos documentos movidos.
- `executar.bat` já havia sido removido; os atalhos atuais continuam na raiz.

## Verificações

- 48 arquivos PHP e 18 JavaScript sem erros de sintaxe.
- 80 referências locais das páginas HTML verificadas, sem arquivo ausente.
- Links locais do índice e dos documentos Markdown verificados, sem destino ausente.
- Classes de Services, Repositories, Security e Support possuem consumidores no backend: nenhuma removida como supostamente morta.
- Mural, página administrativa e perfil retornaram HTTP 200; APIs de itens e bairros também.
- Confirmado que uploads e sessões retirados do índice continuam no disco e são ignorados pelo Git.
- O configurador foi validado sintaticamente, mas não executado de novo: recriar o banco existente não faz parte desta organização.

## O que foi preservado e por quê

- Banco, `.env`, usuários, anúncios, uploads e sessões: dados reais, não arquivos temporários descartáveis.
- Tabela `item_foto`: há referência na exclusão de conta; remover exige migração e revisão funcional.
- SQL acadêmico: documento histórico, separado da instalação atual.
- Serviços, repositórios e rotas: têm responsabilidades e referências reais.
- CSS ativo: várias camadas complementares; consolidar exige refatoração com comparação visual, não apenas excluir arquivos.
- Pares BAT/PowerShell: atalhos e implementação são complementares.

## Recuperação e limites

Cópias anteriores dos arquivos removidos, movidos e editados nesta organização estão em `D:\Documentos\Musicas\doaaqui-organizacao-backup-20261016`. Esse é um backup de código/documentos, não do banco nem de dados pessoais. O backup do antigo executar.bat está separado na mesma pasta Musicas.

Arquivos de sessão e fotos ainda podem existir em commits antigos. A organização não remove dados do histórico remoto. As mudanças anteriores do usuário e as funcionalidades recentes foram preservadas; nenhum commit foi criado.

Para próximos trabalhos de arquitetura e migração de dados, consulte [ARQUITETURA.md](ARQUITETURA.md).
