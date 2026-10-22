-- ==================================================================
-- SEED DE EXEMPLO ORIGINAL — como veio junto do schema.sql submetido,
-- preservado aqui sem alteração (inclusive os hashes falsos, que não
-- servem pra login de verdade). Para testar login de verdade, use
-- database/seed.sql, que tem senhas reais com bcrypt.
-- ==================================================================

-- DADOS DE EXEMPLO (SEED) - opcional, use apenas para testes
-- IDs deixados a cargo do AUTO_INCREMENT (comecam em 1)
-- ==================================================================

INSERT INTO `bairro` (`nome`) VALUES
  ('Centro'),
  ('São José'),
  ('Granbery');

INSERT INTO `usuario` (`nome`, `email`, `senha_hash`, `telefone_whatsapp`, `tipo`) VALUES
  ('André de Castro', 'andre@email.com', '$2b$12$hashfake0000000000000', '(32) 99973-0986', 'admin'),
  ('Maria Souza', 'maria@email.com', '$2b$12$hashfake0000000000001', '(32) 98888-1122', 'comum'),
  ('João Pereira', 'joao@email.com', '$2b$12$hashfake0000000000002', '(32) 97777-3344', 'comum');

INSERT INTO `categoria` (`nome`) VALUES
  ('Roupas'),
  ('Móveis'),
  ('Alimentos'),
  ('Eletrônicos'),
  ('Livros'),
  ('Brinquedos');

-- Observacao: os IDs abaixo assumem a ordem de insercao acima:
-- usuario 1 = André (admin), 2 = Maria, 3 = João
-- categoria 1 = Roupas, 2 = Moveis, 3 = Alimentos
-- bairro 1 = Centro, 2 = Sao Jose

INSERT INTO `item`
  (`id_usuario_doador`, `id_categoria`, `id_bairro`, `titulo`, `status`, `status_moderacao`)
VALUES
  (2, 2, 1, 'Fogão 4 bocas', 'Disponivel', 'Aprovado'),
  (3, 1, 2, 'Casacos infantis', 'Reservado', 'Aprovado'),
