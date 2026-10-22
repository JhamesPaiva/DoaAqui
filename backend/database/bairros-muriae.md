# Bairros de Muriaé

Lista consultada em 15/10/2026. 78 nomes consolidados; não é um cadastro territorial oficial em tempo real.

Fontes:
- Prefeitura, bairros da zona urbana: https://muriae.mg.gov.br/02-10-muriae-bairros-da-zona-urbana/
- Câmara Municipal, Lei 5.540/2017, Anexo A, tabela I: https://sapl.muriae.mg.leg.br/media/sapl/public/normajuridica/2017/5526/lei_5.540_-2017_planta_de_valores_genericos_-_iptu.pdf
- Relação postal complementar: https://cepbrasil.org/minas-gerais/muriae/

Critérios: união dos nomes urbanos encontrados; excluídos logradouros, área rural genérica e distritos. Colety/Coleti, Edgard/Edgar Miranda, Chácara Brum/Doutor Brum, Chácara Gávea/da Gávea, Chácara Leblon/Leblom e São José/Patrimônio São José foram consolidados. Inconfidência I e II permanecem como opções específicas além do nome geral presente na fonte postal. Regiões urbanas nomeadas pela Prefeitura também foram mantidas. Novos loteamentos podem exigir revisão futura.

Execute uma vez: php backend/tools/atualizar-bairros.php (na raiz do projeto). Pode repetir sem duplicar. Usa somente INSERT/SELECT; dispensa ALTER e senha de administrador. O configurador de instalações novas aplica este arquivo após o seed, preservando os IDs usados nos exemplos. Na instalação manual, aplique bairros-muriae.sql depois de seed.sql. Não execute o seed inteiro sobre um banco existente.

Os bairros preexistentes são preservados, inclusive Bela Vista e Vila Nova do seed original, para não romper vínculos ou apagar dados do usuário. Nenhum bairro inativo é reativado automaticamente. API, criação, edição e filtros usam a tabela bairro e a ordenação do banco.
