# DoaAqui — especificação de redesign visual

Data: 13/10/2026  
Status: proposta para implementação; este documento não altera o site.  
Referência: captura integral de Para Quem Doar enviada pelo usuário.  
Projeto: `D:\Documentos\EXTENSÃO 2026 4P\DoaAqui`.

## 1. Objetivo e direção

Reformular a identidade do DoaAqui para transmitir acolhimento, proximidade e movimento, com uma aparência consistente na página pública, nos formulários, nos detalhes das doações e na administração.

**Conceito: “O que circula por aqui transforma a vida de alguém.”** A conexão entre o “aqui” do doador e o “aqui” de quem recebe orienta a composição: dois círculos que se aproximam, imagens de objetos e informações reais de localização. O círculo funciona como elemento de identidade nas áreas institucionais; o catálogo mantém fotografias retangulares para mostrar bem os itens.

A referência inspira a linguagem visual. A estrutura e os textos devem atender a uma plataforma de doação de objetos entre pessoas, preservando suas funcionalidades existentes.

## 2. Leitura da referência

| Elemento observado | Efeito visual | Aplicação no DoaAqui |
|---|---|---|
| Hero com degradê magenta, violeta e azul | Cria uma abertura marcante e alegre | Reservar um campo de cor expressivo para a abertura |
| Foto circular com pequenas sobreposições | Aproxima a comunicação das pessoas | Composição com objetos de doação ou imagem autorizada de uma entrega |
| Títulos arredondados e fortes | Linguagem amigável, menos corporativa | Adotar uma família arredondada e hierarquia consistente |
| Círculos parcialmente cortados nas bordas | Dá continuidade e movimento ao conjunto | Usar poucos círculos em posições planejadas, sem interferir na leitura |
| Faixa branca após o hero | Separa campanha e informação institucional | Explicar objetivamente o propósito local do DoaAqui |
| Fundo cinza-azulado claro | Une as seções e reduz o excesso de branco | Base para descoberta e mural |
| Cards brancos com títulos magenta | Facilita distinguir conteúdo e ação | Cards de itens com foto, localização, categoria e status |
| Imagem e texto sobrepostos no blog | Cria uma seção editorial diferente do catálogo | Adaptar para explicar a jornada de uma doação, sem inventar um blog |
| Rodapé em degradê laranja e coral | Encerra a página com energia | Encerramento acolhedor com navegação e marca própria |

O principal aprendizado é a repetição coerente de uma linguagem ao longo da página. A identidade aparece nas imagens, nas formas, na tipografia e nos controles, não apenas nas cores.

### Aspectos a melhorar na adaptação

- A captura apresenta textos auxiliares e botões visualmente pequenos. No DoaAqui, aumentar legibilidade e área de toque.
- O bloco de descoberta tem muito espaço vazio. Reduzir sua altura e antecipar o acesso às doações.
- Carrosséis escondem parte do conteúdo. O mural principal deve ser uma grade navegável, com todos os resultados acessíveis.
- Texto dentro de círculos limita a largura e dificulta a adaptação ao celular. Reservar círculos principalmente para imagens e decoração.
- Tons claros e contornos finos precisam de avaliação de contraste em implementação.

A imagem permite analisar composição e aparência. Não permite confirmar a fonte exata, os valores de CSS, as animações ou o comportamento no celular. Os valores seguintes são propostas de projeto, não medições do site de referência.

## 3. Sistema visual proposto

### Cores

| Papel | Valor inicial | Uso |
|---|---|---|
| Magenta expressivo | `#EE278D` | Formas e áreas de destaque |
| Magenta de ação | `#BE1768` | Botões sólidos e links em fundo claro |
| Azul | `#36A9D6` | Extremidade do degradê e detalhes |
| Violeta | `#8264B5` | Transição do degradê |
| Fundo principal | `#EEF3F5` | Descoberta e mural |
| Superfície | `#FFFFFF` | Cards, menus e formulários |
| Texto principal | `#263342` | Títulos funcionais e corpo |
| Texto secundário | `#52616F` | Metadados e instruções |
| Borda | `#CBD5DC` | Separadores e campos |
| Laranja / coral | `#F6A315` / `#ED4D40` | Rodapé decorativo |

Degradê principal: magenta → violeta → azul, em direção predominantemente horizontal. Usar uma região de maior contraste atrás do texto ou um tratamento localizado de fundo. Não presumir que texto branco será legível em toda a extensão do degradê.

O rodapé pode ter uma área laranja decorativa e uma região mais escura para os links. Validar contraste mínimo de 4,5:1 para texto comum e 3:1 para texto grande; ajustar os valores onde necessário. As cores de status têm função própria e sempre acompanham um rótulo textual.

### Tipografia

Escolher uma família sans-serif arredondada, com boa leitura em português e pesos regular, semibold e bold. Nunito Sans é uma candidata visual; a escolha final deve ser testada com os textos reais. Não é uma identificação da fonte da referência.

| Uso | Desktop | Celular | Entrelinha |
|---|---|---|---|
| Título principal | 48–56 px | 34–40 px | 1,1–1,15 |
| Título de seção | 32–40 px | 26–30 px | 1,15–1,25 |
| Título de card | 19–22 px | 19–22 px | 1,3 |
| Texto corrido | 16–18 px | 16 px | 1,5–1,65 |
| Informação auxiliar | 14 px | 14 px | 1,45 |
| Botões e campos | 16 px | 16 px | 1,25–1,5 |

Evitar títulos gigantes que empurrem o mural para baixo e pesos muito leves sobre fundos coloridos. Manter o texto principal do hero curto.

### Espaçamento e formas

- Conteúdo central com largura máxima de 1.200 px.
- Margens laterais: 20 px no celular, 32 px no tablet e pelo menos 40 px no desktop.
- Escala de espaçamento: 4, 8, 12, 16, 24, 32, 48, 64 e 96 px.
- Distância entre seções: 64–96 px no desktop; 40–56 px no celular.
- Cards: cantos de 16 px. Campos: 10–12 px. Botões principais: formato de cápsula.
- Botões com altura mínima de 48 px; demais alvos de toque com pelo menos 44 × 44 px.
- Sombras suaves somente para separar superfícies que precisam parecer elevadas.
- Limitar ornamentos a áreas institucionais. Não colocar círculos atrás de campos, tabelas ou informações importantes.

## 4. Estrutura da página inicial

### 4.1 Cabeçalho

Marca DoaAqui à esquerda; “Encontrar doações” e “Como funciona” no centro; acesso à conta e botão “Quero doar” à direita. O cabeçalho compartilha o fundo do hero, com versão da marca que tenha contraste adequado.

Quando autenticado, mostrar “Minhas doações” e o menu de conta. O acesso administrativo aparece apenas para o perfil correspondente. No celular, usar menu compacto com rótulo acessível e manter a ação principal fácil de encontrar.

### 4.2 Abertura

Layout de duas colunas: mensagem e ações à esquerda, composição fotográfica circular à direita. Essa inversão em relação à referência antecipa a proposta e a ação durante a leitura.

**Texto proposto:**

> Doe aqui. Faça circular.
>
> Dê um novo destino ao que você não usa e encontre doações perto de você.

Ação principal: **Quero doar**. Ação secundária: **Encontrar doações**, que leva ao mural.

O botão de doar abre o fluxo existente; se for necessário entrar na conta, preservar a intenção e retomar o cadastro da doação após a autenticação.

Altura desejada do conjunto de abertura: aproximadamente 520–640 px no desktop, ajustada ao conteúdo. Imagem principal com 320–420 px de diâmetro. Usar no máximo três elementos circulares de apoio e evitar sobreposição com texto.

Usar uma única composição estática nesta versão. Indicadores de carrossel só devem existir se houver campanhas reais e navegação implementada.

### 4.3 Faixa de propósito

Uma faixa branca, curta e legível conecta a abertura ao mural:

> Um espaço para conectar quem quer doar a quem precisa de um item em Muriaé.

Confirmar o recorte geográfico nos conteúdos finais. Não incluir selos, auditoria, parceiros ou números de impacto que o projeto não possa comprovar.

### 4.4 Descoberta e mural

Título: **Encontre sua próxima doação**.

Texto: “Busque um item e filtre por categoria, bairro ou disponibilidade.”

Campo de busca amplo, com rótulo visível e exemplo: “Ex.: livros, cadeira, roupas”. Abaixo, filtros de categoria, bairro e status com os valores reais da aplicação. Mostrar a quantidade de resultados e a opção “Limpar filtros” quando houver seleção.

O bloco de descoberta e a grade devem formar uma área contínua: evitar um grande espaço decorativo entre pesquisar e visualizar resultados.

**Grade:** três colunas em telas largas, duas em tablets e uma em celulares. Não duplicar anúncios para preencher espaço. Uma única doação deve continuar com largura razoável, sem ocupar toda a tela.

### 4.5 Card de doação

Ordem das informações:

1. Foto em proporção 4:3.
2. Categoria e status textual.
3. Nome do item em até duas linhas na listagem.
4. Bairro/localização.
5. Resumo curto da descrição.
6. Ação “Ver doação”.

A altura da imagem é uniforme; o corpo cresce de maneira consistente. Títulos longos podem ser limitados na grade, mas ficam completos no detalhe. Preservar o acesso ao conteúdo integral da descrição.

Não recortar objetos agressivamente para encaixá-los em círculos. Quando necessário, usar imagem contida sobre fundo neutro. Para itens sem imagem, apresentar um marcador honesto “Sem foto do item”, mantendo a proporção visual.

Na interação, aplicar uma elevação discreta ou alteração de borda, sem saltos de layout. Evitar vários links e botões redundantes para a mesma ação.

### 4.6 Como funciona

Título: **Uma doação, um novo começo**.

Apresentar a sequência já existente, com números grandes e pequenos elementos circulares de apoio:

1. **Publique ou encontre:** cadastre o que deseja doar ou explore os itens do mural.
2. **Combine a retirada:** converse com a outra pessoa pelo contato disponível.
3. **Atualize a doação:** mantenha o status do item atualizado.

Associar o conjunto a uma imagem de objetos ou a uma ilustração da troca. No celular, os passos aparecem na ordem de leitura, sem sobreposições.

### 4.7 Encerramento e rodapé

Mensagem curta: **Tem algo parado por aí?**

Complemento: “Pode ser o que alguém está procurando.” Botão: **Quero doar**.

Rodapé com marca, descrição breve, navegação e informações institucionais reais. Links de políticas e contato só aparecem quando houver destinos válidos. Não reproduzir logos, slogans institucionais ou vínculos de Globo e Benfeitoria.

## 5. Padrão para todas as telas

### Detalhe da doação

Em desktop, foto e informações lado a lado; em celular, foto antes do conteúdo. Mostrar título completo, status, categoria, bairro, descrição e contato conforme as regras atuais de visibilidade. A ação de contato deve explicar seu destino, por exemplo “Conversar pelo WhatsApp”.

Itens indisponíveis não podem exibir uma ação que sugira disponibilidade. A foto deve permitir entender o estado do objeto; a decoração não compete com ela.

### Entrar e criar conta

Mesmos títulos, campos, botões e espaçamentos do restante do site. Usar rótulos visíveis, instruções junto ao campo e mensagens de erro específicas. Preservar os valores preenchidos após uma falha, exceto informações que a aplicação precise limpar por segurança.

Largura de referência de 440 px em desktop; no celular, ocupar a largura disponível com margens adequadas. Não inventar recuperação de senha ou login social sem implementação correspondente.

### Publicar e editar doação

Formulário de aproximadamente 640 px em desktop. Agrupar informações do item, localização e fotografia. Manter os campos existentes e o suporte atual a uma foto, com prévia e opção clara de substituição.

Exibir limites reais de formato e tamanho de arquivo. Botão com texto correspondente à operação: “Publicar doação” ou “Salvar alterações”. Explicar a necessidade de aprovação quando o fluxo exigir moderação.

### Minhas doações

Usar os mesmos cards e status do mural, acrescentando ações adequadas ao estado do anúncio. Diferenciar publicação pendente, rejeitada e aprovada da disponibilidade do item: “Reservado” não é um estado de moderação.

Exibir o motivo de rejeição quando disponível. Preservar atualização de status e cancelamento previstos pelo sistema, sem apresentar ações impossíveis para o estado atual.

### Administração

Compartilhar fonte, cores funcionais, campos, botões e mensagens. Usar superfícies neutras e densidade adequada para trabalhar com listas; reservar o magenta para ações e identificação.

Padronizar resumo, fila de aprovação, itens publicados, edição, rejeição e histórico. Ações destrutivas devem ser visualmente distintas da aprovação. No celular, adaptar tabelas ou listas em blocos legíveis, sem comprimir todas as colunas.

O painel não precisa repetir as fotografias e os grandes círculos da página pública para pertencer à mesma identidade.

## 6. Estados e comportamento

| Estado | Resultado esperado |
|---|---|
| Carregando mural | Estrutura de carregamento estável e indicação textual acessível |
| Nenhum resultado | Explicação e ação “Limpar filtros” quando aplicável |
| Nenhuma doação publicada | Convite para cadastrar a primeira doação; sem anúncios fictícios |
| Erro de conexão | Mensagem compreensível e botão “Tentar novamente” |
| Envio em andamento | Evitar duplicação e indicar a operação em curso |
| Sucesso | Mensagem concreta sobre o que aconteceu e o próximo passo |
| Campo inválido | Erro junto ao campo, associado ao controle |
| Sessão encerrada | Explicar a necessidade de entrar novamente e preservar a intenção quando possível |

Modais devem controlar foco, fechar por Escape quando adequado, devolver o foco ao elemento de origem e impedir interação com o fundo. Conteúdos longos rolam dentro da área apropriada sem esconder o botão de fechar.

Usar transições curtas, entre 150 e 220 ms, para estados de controles. Respeitar a preferência de movimento reduzido. Não usar movimento contínuo como requisito da identidade.

## 7. Responsividade e acessibilidade

- Validar em 320, 390, 768, 1024 e 1440 px de largura.
- No celular, apresentar mensagem e ações do hero antes da imagem; reduzir os círculos decorativos.
- Manter a imagem do hero menor para não atrasar excessivamente o mural.
- Transformar filtros extensos em painel expansível com indicação das seleções.
- Não permitir rolagem horizontal na página inteira.
- Usar foco visível em todos os controles e ordem de tabulação previsível.
- Não depender apenas de cor, hover ou ícone para comunicar ações e status.
- Adicionar descrição alternativa útil às fotos; decoração deve ser ignorada por leitores de tela.
- Manter busca, filtros e formulários utilizáveis com zoom de 200%.
- Testar contraste sobre cada fundo real, especialmente nos degradês.

## 8. Imagens e identidade própria

O projeto já possui uma composição de objetos de doação que pode ser avaliada para o hero. Se ela não funcionar no novo enquadramento, preparar um novo ativo antes de implementar a composição final.

Fotografias das listagens devem continuar sendo as enviadas pelos usuários. Ilustrações ou imagens geradas podem representar o conceito institucional, mas nunca substituir a foto de um anúncio ou sugerir beneficiários reais.

Não extrair a fotografia da criança, o personagem, os logos ou os selos da captura. A marca DoaAqui deve manter seu próprio nome e ganhar versões coerentes para fundo claro e colorido. Uma eventual revisão do símbolo precisa ser tratada como entrega própria, com versões em vetor.

## 9. Implementação prevista

Trabalhar sobre o frontend atual em HTML, CSS e JavaScript, preservando a integração PHP/MySQL. Este redesign não exige migração para React, instalação de um template inteiro ou criação de novo banco de dados.

Áreas principais de intervenção:

- `doa-aqui/index.html`: estrutura visual da página e conteúdo dos componentes públicos.
- `doa-aqui/admin.html`: aplicação do padrão visual ao painel e seus formulários.
- `doa-aqui/css/identidade.css`: variáveis de identidade, layouts e componentes compartilhados.
- Scripts de interface: ajustes de navegação, foco e estados apenas quando necessários.

Preservar identificadores utilizados pelo JavaScript ou atualizar todas as referências de forma coordenada. Manter sessões, validação, proteção CSRF e regras de autorização. Não alterar contratos da API por conveniência visual.

Repositórios externos só devem ser incorporados quando resolverem uma necessidade específica. Avaliar licença, compatibilidade com a estrutura existente, tamanho e acessibilidade antes de adicionar dependências.

### Sequência de execução

1. Consolidar variáveis, fonte, imagens e componentes básicos.
2. Implementar cabeçalho, hero, descoberta e cards com dados reais.
3. Aplicar o padrão a detalhes, autenticação e cadastro de doações.
4. Padronizar minhas doações e administração.
5. Revisar telas e estados no navegador, corrigindo diferenças e problemas de adaptação.

## 10. Critérios de aceite

- A página apresenta a linguagem vibrante, arredondada e fotográfica da referência, com identidade DoaAqui.
- Busca e doações são encontradas sem atravessar longos blocos vazios.
- Todos os formulários, modais e estados recebem o mesmo padrão visual.
- Fotos reais, textos longos, ausência de foto e poucos resultados não quebram o layout.
- Busca, filtros, autenticação, cadastro, contato, minhas doações e moderação continuam funcionando.
- Cadastrar uma doação, moderá-la e atualizar seu status são verificados de ponta a ponta em ambiente apropriado.
- Layout revisado nas larguras indicadas, com navegação por teclado e contraste adequado.
- Não existem parceiros inventados, contadores fictícios ou links sem destino funcional.
- Imagens possuem dimensões definidas; carregar imagens fora da primeira tela sob demanda e evitar que a interface salte durante o carregamento.

## 11. Fora desta etapa

Este documento não inclui implementar blog, quiz de recomendação, doações em dinheiro, chat interno, favoritos, novas campanhas ou indicadores de impacto. São possibilidades futuras que exigem escopo e dados próprios.

O resultado desta etapa é uma direção visual executável para remodelar o produto existente. A implementação deve ser acompanhada de revisão visual com capturas reais do DoaAqui, sem tratar a especificação como prova de que o site já foi alterado.
