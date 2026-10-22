# DoaAqui — redesign Faça circular

Implementado em 13/10/2026 a partir de `SPEC-REDESIGN-DOAAQUI.md` e da captura de Para Quem Doar fornecida pelo usuário.

## Entrega

- Abertura em degradê magenta, violeta e azul, imagem circular e ações de doar e explorar.
- Tipografia Nunito Sans, botões arredondados, fundo claro e cards com padrão consistente.
- Descoberta, busca, filtros, instruções de uso e encerramento reorganizados.
- Formulários, autenticação, detalhes, minhas doações e administração com a mesma identidade.
- Tabelas administrativas convertidas em blocos rotulados em telas pequenas.
- Publicação retomada depois do login quando iniciada por “Quero doar”. Cancelar a janela descarta essa intenção.
- Prévia da foto selecionada e bloqueio do botão durante a publicação para evitar duplicação.
- Detalhes de itens reservados/doado mostram indisponibilidade; contato por WhatsApp aparece para itens disponíveis.

O CSS compartilhado anterior permanece como base funcional. `css/circular.css` concentra a nova identidade e suas adaptações responsivas. O backend e seu contrato de API foram preservados.

## Verificação realizada

- Revisão visual no navegador em desktop, tablet e celular: 1440, 1024, 768 e 390 px; medição adicional de largura em 320 px.
- Ausência de transbordamento horizontal global nas medidas verificadas, inclusive administração em 320 e 390 px.
- Busca com resultado, busca vazia, limpeza de filtros e filtro de bairro.
- Login de conta existente e retomada automática do formulário de publicação.
- Publicação de um registro explicitamente temporário, presença em Minhas doações, aprovação administrativa e alteração para Doado, com histórico correspondente.
- Registro temporário retirado do mural pela API de remoção da aplicação. O histórico de auditoria dessas operações permanece no banco, conforme o comportamento do sistema.
- Inspeção de detalhes de item reservado, sem botão que indique disponibilidade.
- Nenhum erro de console registrado no painel durante a inspeção.
- Verificação de sintaxe dos scripts alterados e de espaços inválidos no diff.

## Limites da validação

A seleção/envio de uma nova fotografia e a criação de uma nova conta não foram exercitados de ponta a ponta. O cadastro e os endpoints de upload existentes foram preservados. As transições respeitam a preferência de movimento reduzido; não foi realizada auditoria completa com leitor de tela.

As verificações visuais foram realizadas pelo navegador disponível nesta sessão. Não se declara aprovação no inspetor automatizado da skill de design: suas restrições genéricas sobre degradês, círculos e cards conflitam com a referência e a especificação aprovadas pelo usuário.

## Imagens e conteúdo

A composição ilustrativa de objetos já existente foi reutilizada no hero e em Como funciona. Nenhuma fotografia de beneficiário, logo de parceiro ou selo foi extraído da referência. As listagens exibem suas fotos reais ou o marcador “Sem foto do item”. Os totais vêm da API.

Nunito Sans é carregada pelo Google Fonts, com fontes de sistema como alternativa. Não foram adicionados frameworks ou bibliotecas de componentes.

## Cópia anterior e execução

Cópia anterior do frontend: `D:\Documentos\Musicas\doaaqui-backup-before-circular`.

Abrir `http://localhost:8080/`. Nas próximas sessões, iniciar pelo arquivo `iniciar-doaaqui.bat` na raiz do projeto, com o MySQL disponível.
