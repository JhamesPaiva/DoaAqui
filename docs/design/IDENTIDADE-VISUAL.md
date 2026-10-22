# Identidade visual do DoaAqui

Atualização de 13/10/2026. Direção: “Doe aqui. Viva ali.” Os objetos do mural entram na frase da abertura como uma janela para sua próxima casa. O nome DoaAqui e a comunidade de Muriaé orientam o texto; busca, filtros e doações reais são a interação central.

## Sistema

- Azul profundo `#1a2039`, rosa `#f9a3c0`, superfícies claras `#f5f6f9` e texto `#1a2039`.
- General Sans via Fontshare, com Arial como alternativa local.
- Estilos compartilhados em `css/identidade.css`, usados por `index.html` e `admin.html`. As folhas antigas foram mantidas como referência, mas essas páginas não as carregam.
- Marca vetorial e favicon em `assets/brand.svg`.
- Formulários, botões, estados de anúncio, filtros, tabelas e janelas usam o mesmo sistema.
- Menu e filtros expansíveis no celular; tabelas administrativas mantêm suas colunas em uma região com rolagem horizontal.
- Foco visível, diálogos com nome acessível, foco contido na janela e devolvido ao fechar, suporte a Escape, abertura dos anúncios por teclado e preferência de movimento reduzido.
- O mural diferencia erro de conexão de uma lista vazia e permite tentar novamente.

## Origem dos recursos

Direção sorteada pelo Taste Skill: `sentence-as-layout`, seed `1492320333`, General Sans, Navy and pink. Nenhum novo sorteio. A lista de anúncios preserva a composição funcional de catálogo; o painel administrativo usa as mesmas cores e controles, sem aplicar a direção editorial a tabelas de gestão. As superfícies claras do catálogo e dos formulários favorecem leitura prolongada.

Taste Skill: https://github.com/Leonxlnx/taste-skill, revisão `6dbbb03c9b56b6564ab79c5fed45737e30ba8051`. Utilizado como orientação de trabalho; nenhum script desse repositório é executado pelo site.

`assets/objetos-doacao.png`: imagem gerada com a ferramenta integrada de geração de imagens. Uso ilustrativo, indicado na legenda; não representa anúncios, pessoas ou doações reais. Não foram usadas fotos externas. Os seis SVGs de categorias foram desenhados para indicar explicitamente “Sem foto do item”; substituem as antigas fotos aleatórias. A imagem enviada pelo doador continua sendo prioritária.

Prompt da imagem: “Use case: ads-marketing. Create a polished photorealistic editorial still-life image for the Brazilian community donation website DoaAqui. Landscape 1536x1024. Four beautiful ordinary pre-owned objects arranged together as a welcoming composition: a warm honey wood chair on left, a neatly folded pale pink knitted sweater on its seat, stack of four colorful books at center bottom, small cream teddy bear on right next to a simple navy desk lamp. Solid dusty rose studio wall and floor, soft sunlight from upper left, natural subtle shadows, tactile realistic materials, art direction of a premium circular economy editorial. Wide balanced composition, generous room around the objects, all objects fully visible, no people, no text, no letters, no brand logos, no watermark. The objects are symbolic illustrations for donations, not specific real listings.”

## Validação e limites

Verificação de sintaxe de todos os JavaScripts; preservação dos IDs usados pela aplicação; ausência de IDs duplicados e de referências locais ausentes. O verificador de estilos do Taste Skill não encontrou falhas na nova folha. O aviso de contorno em `status-select` é intencional: trata-se de um campo de formulário.

Prévia visual e interações verificadas em navegador com respostas de API isoladas para testes: busca, alteração e limpeza de filtros, detalhes, login, painel administrativo e edição de anúncio. Esses dados e o servidor de testes ficam fora do projeto e não são publicados no mural real. Conferidos layouts de 390, 768 e 1440 pixels. O estado de servidor indisponível também foi observado.

O inspetor automatizado da skill não iniciou o navegador neste ambiente (`spawn EPERM`); a revisão foi feita com o navegador integrado. PHP/MySQL não estavam ativos durante esta revisão; autenticação real, gravação de anúncios, upload e moderação no banco ainda precisam ser validados com o ambiente do projeto em execução. O backend não foi modificado.

### Crítica visual

ROUND 1
Seen in one second: título rosa e janela de objetos sobre azul profundo.
Idea (one sentence): a passagem “aqui / ali” do nome DoaAqui transforma a doação em uma frase com objetos visíveis.
Live thing: buscar doações, filtrar e consultar detalhes do mural.
Layout words by section: hero=frase / mural=catálogo / como-funciona=imagem e instruções / footer=nome ampliado.
Scores: design 6.5 · usability 7 · creativity 7 · content 8 → overall 6.9.
Caps applied: menos de quatro fotografias distintas; imagens reais dependem das doações cadastradas.
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. Seção Como funciona no desktop: atributo de altura da imagem criou uma coluna excessiva; corrigido dimensionamento proporcional.
2. Cabeçalho mobile autenticado: nome e ações comprimiam o botão de doação; nome ocultado em telas estreitas e ações reorganizadas.
3. Mural mobile: filtros ocupavam a primeira tela e cartões pequenos dificultavam leitura; filtros expansíveis e uma coluna de anúncios.

ROUND 2
Seen in one second: “Doe aqui. Viva ali.” com objetos, seguida de um catálogo legível.
Idea (one sentence): a passagem entre casas é expressa pelo nome, pela frase e pela imagem ilustrativa.
Live thing: busca, filtros e detalhes preservados.
Layout words by section: hero=frase / mural=catálogo / como-funciona=imagem e instruções / footer=nome ampliado.
Scores: design 6.5 · usability 8 · creativity 7 · content 8 → overall 7.2.
Caps applied: piso de quatro fotografias distintas da skill não atendido; não se criaram anúncios ou fotos fictícias para elevar a nota.
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. Mural com dados de teste sem fotos: ícones são menos ricos que fotografias reais; exibir as fotos enviadas pelos doadores quando existentes.
2. Dependência de fonte externa: queda de rede pode usar Arial; alternativa de sistema já configurada.
3. Operações reais dependem da API PHP/MySQL; teste visual isolado não substitui teste integrado.

A nota é uma autoavaliação pela rubrica da skill, não uma certificação. O catálogo de doações e sua honestidade têm prioridade sobre o número de imagens exigido pela rubrica editorial.
