-- ==================================================================
-- SEED — dados de teste para desenvolvimento local
-- Rode DEPOIS do schema.sql. Nunca use este arquivo em produção.
--
-- Senhas em texto puro (só pra você testar o login), os hashes abaixo
-- foram gerados de verdade com password_hash() do PHP:
--   admin@doaaqui.com / admin123   (tipo admin — mesmas credenciais do mock do front-end)
--   maria@email.com   / maria123
--   joao@email.com    / joao123
-- ==================================================================

USE doaaqui;

INSERT INTO `bairro` (`nome`) VALUES
  ('Centro'),
  ('São José'),
  ('Vila Nova'),
  ('Bela Vista');

INSERT INTO `usuario` (`nome`, `email`, `senha_hash`, `telefone_whatsapp`, `tipo`) VALUES
  ('Administrador', 'admin@doaaqui.com', '$2y$10$.s5AVUR./vo4yMk7ZOkXYu21RDSNax46xguppVtmQFV6NV1qsdEGi', '(32) 99900-0000', 'admin'),
  ('Maria Souza', 'maria@email.com', '$2y$10$9f7XaTtuLdDpeFz8Y5lOZu.9ZMsDa7bOTzCJoDKAdCySaXZfMTKu2', '(32) 98888-1122', 'comum'),
  ('João Pereira', 'joao@email.com', '$2y$10$lO0C4oDufcQ0g4jXfixg.uGYK9L/xCdAG7MKD6xOeSrH8sphKgP8a', '(32) 97777-3344', 'comum');

INSERT INTO `categoria` (`nome`) VALUES
  ('Roupas'),
  ('Móveis'),
  ('Eletrônicos'),
  ('Livros'),
  ('Brinquedos');

-- usuario 1 = Administrador (admin), 2 = Maria, 3 = João
-- categoria 1 = Roupas, 2 = Móveis, 3 = Eletrônicos
-- bairro    1 = Centro, 2 = São José

INSERT INTO `item`
  (`id_usuario_doador`, `id_categoria`, `id_bairro`, `titulo`, `descricao`, `status`, `status_moderacao`)
VALUES
  (2, 2, 1, 'Fogão 4 bocas', 'Usado, funcionando, poucas marcas de uso.', 'Disponivel', 'Aprovado'),
  (3, 1, 2, 'Casacos infantis', 'Tamanhos 4 a 8, bom estado.', 'Reservado', 'Aprovado');

-- Após este seed, aplique bairros-muriae.sql para completar o catálogo.
