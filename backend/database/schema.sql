-- ==================================================================
-- SCRIPT DE CRIACAO DO BANCO DE DADOS - PROJETO DOA AQUI
-- Mural de Doacoes Solidarias - Extensao Universitaria III
-- SGBD: MySQL 8.0+
-- ==================================================================

CREATE DATABASE IF NOT EXISTS doaaqui
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE doaaqui;

-- ------------------------------------------------------------------
-- Tabela: bairro
-- ------------------------------------------------------------------
CREATE TABLE `bairro` (
  `id_bairro` INT PRIMARY KEY AUTO_INCREMENT,
  `nome` VARCHAR(255) UNIQUE NOT NULL,
  `ativo` BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ------------------------------------------------------------------
-- Tabela: usuario
-- ------------------------------------------------------------------
CREATE TABLE `usuario` (
  `id_usuario` INT PRIMARY KEY AUTO_INCREMENT,
  `nome` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `senha_hash` VARCHAR(255) NOT NULL COMMENT 'Armazenar sempre com hash (bcrypt/argon2), nunca em texto puro',
  `telefone_whatsapp` VARCHAR(255) NOT NULL,
  `tipo` ENUM ('comum', 'admin') NOT NULL DEFAULT 'comum',
  `ativo` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Permite desativar conta sem apagar historico',
  `data_cadastro` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ------------------------------------------------------------------
-- Tabela: categoria
-- ------------------------------------------------------------------
CREATE TABLE `categoria` (
  `id_categoria` INT PRIMARY KEY AUTO_INCREMENT,
  `nome` VARCHAR(255) UNIQUE NOT NULL,
  `descricao` VARCHAR(255),
  `ativo` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Permite desativar/ocultar categoria sem apagar itens ja vinculados',
  `data_criacao` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ------------------------------------------------------------------
-- Tabela: item
-- ------------------------------------------------------------------
CREATE TABLE `item` (
  `id_item` INT PRIMARY KEY AUTO_INCREMENT,
  `id_usuario_doador` INT NOT NULL,
  `id_categoria` INT NOT NULL,
  `id_bairro` INT NOT NULL,
  `titulo` VARCHAR(255) NOT NULL,
  `descricao` TEXT COMMENT 'Estado do item e detalhes que ajudam quem for buscar',
  `foto_url` VARCHAR(255) COMMENT 'Upload de imagem ainda nao implementado no prototipo; campo previsto para uso futuro',
  `contato_whatsapp` VARCHAR(255) COMMENT 'Opcional; se nulo, usar usuario.telefone_whatsapp do doador',
  `status` ENUM ('Disponivel', 'Reservado', 'Doado') NOT NULL DEFAULT 'Disponivel',
  `status_moderacao` ENUM ('Pendente', 'Aprovado', 'Rejeitado') NOT NULL DEFAULT 'Pendente',
  `data_publicacao` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Atualiza automaticamente a cada modificacao da linha',
  `removido_em` TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete: nulo = ativo; preenchido = removido pelo admin (RF08), preserva historico',

  CONSTRAINT `item_doador` FOREIGN KEY (`id_usuario_doador`) REFERENCES `usuario` (`id_usuario`),
  CONSTRAINT `item_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id_categoria`),
  CONSTRAINT `item_bairro` FOREIGN KEY (`id_bairro`) REFERENCES `bairro` (`id_bairro`),

  INDEX `item_index_status` (`status`),
  INDEX `item_index_status_moderacao` (`status_moderacao`),
  INDEX `item_index_categoria` (`id_categoria`),
  INDEX `item_index_bairro` (`id_bairro`)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ------------------------------------------------------------------
-- Tabela: item_foto
-- ------------------------------------------------------------------
CREATE TABLE `item_foto` (
  `id_foto` INT PRIMARY KEY AUTO_INCREMENT,
  `id_item` INT NOT NULL,
  `foto_url` VARCHAR(255) NOT NULL,
  `ordem` INT NOT NULL DEFAULT 0 COMMENT 'Define a ordem de exibicao das fotos do item',
  `data_upload` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT `item_fotos` FOREIGN KEY (`id_item`) REFERENCES `item` (`id_item`)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  COMMENT = 'Tabela prevista para quando o upload de multiplas fotos por item for implementado';

-- ------------------------------------------------------------------
-- Tabela: moderacao
-- ------------------------------------------------------------------
CREATE TABLE `moderacao` (
  `id_moderacao` INT PRIMARY KEY AUTO_INCREMENT,
  `id_item` INT NOT NULL,
  `id_admin` INT NOT NULL,
  `acao` ENUM ('Aprovado', 'Rejeitado', 'Editado', 'Removido') NOT NULL,
  `observacao` TEXT,
  `data_acao` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT `moderacao_item` FOREIGN KEY (`id_item`) REFERENCES `item` (`id_item`),
  CONSTRAINT `moderacao_admin` FOREIGN KEY (`id_admin`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ------------------------------------------------------------------
-- Tabela: historico_status
-- ------------------------------------------------------------------
CREATE TABLE `historico_status` (
  `id_historico` INT PRIMARY KEY AUTO_INCREMENT,
  `id_item` INT NOT NULL,
  `status_anterior` ENUM ('Disponivel', 'Reservado', 'Doado'),
  `status_novo` ENUM ('Disponivel', 'Reservado', 'Doado') NOT NULL,
  `alterado_por` INT NOT NULL,
  `data_alteracao` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT `historico_item` FOREIGN KEY (`id_item`) REFERENCES `item` (`id_item`),
  CONSTRAINT `historico_usuario` FOREIGN KEY (`alterado_por`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


-- ==================================================================
-- FIM DO SCRIPT
-- ==================================================================
