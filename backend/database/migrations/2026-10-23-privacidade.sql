-- Execute uma única vez nos bancos já existentes.
-- Contatos históricos ficam ocultos até que o titular os autorize novamente.
ALTER TABLE item
  ADD COLUMN contato_publico BOOLEAN NOT NULL DEFAULT FALSE
  COMMENT 'Autorização explícita para exibir o WhatsApp no mural';

UPDATE item SET contato_publico = FALSE;

CREATE TABLE aceite_termo (
  id_aceite BIGINT PRIMARY KEY AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  versao VARCHAR(40) NOT NULL,
  aceito_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT aceite_termo_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuario (id_usuario) ON DELETE CASCADE,
  INDEX aceite_termo_usuario_data (id_usuario, aceito_em)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
