USE railway;

-- ========================
-- LIMPEZA (opcional)
-- ========================
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS candidaturas;
DROP TABLE IF EXISTS vaga_habilidades;
DROP TABLE IF EXISTS usuario_habilidades;
DROP TABLE IF EXISTS vagas;
DROP TABLE IF EXISTS perfis;
DROP TABLE IF EXISTS habilidades;
DROP TABLE IF EXISTS usuarios;

SET FOREIGN_KEY_CHECKS = 1;

-- ========================
-- USUÁRIOS
-- ========================
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  tipo ENUM('aluno', 'empresa') NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- PERFIL (apenas alunos)
-- ========================
CREATE TABLE perfis (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNIQUE,
  bio TEXT,
  linkedin VARCHAR(255),
  github VARCHAR(255),

  CONSTRAINT fk_perfil_usuario
    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id)
    ON DELETE CASCADE
);

-- ========================
-- HABILIDADES
-- ========================
CREATE TABLE habilidades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL UNIQUE
);

-- ========================
-- USUÁRIO x HABILIDADES (N:N)
-- ========================
CREATE TABLE usuario_habilidades (
  usuario_id INT,
  habilidade_id INT,

  PRIMARY KEY (usuario_id, habilidade_id),

  CONSTRAINT fk_usuario_habilidade_usuario
    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_usuario_habilidade_habilidade
    FOREIGN KEY (habilidade_id)
    REFERENCES habilidades(id)
    ON DELETE CASCADE
);

-- ========================
-- VAGAS
-- ========================
CREATE TABLE vagas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  descricao TEXT NOT NULL,
  empresa_id INT NOT NULL,
  localizacao VARCHAR(150),
  tipo ENUM('remoto', 'presencial', 'hibrido'),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_vaga_empresa
    FOREIGN KEY (empresa_id)
    REFERENCES usuarios(id)
    ON DELETE CASCADE
);

-- ========================
-- VAGA x HABILIDADES (N:N)
-- ========================
CREATE TABLE vaga_habilidades (
  vaga_id INT,
  habilidade_id INT,

  PRIMARY KEY (vaga_id, habilidade_id),

  CONSTRAINT fk_vaga_habilidade_vaga
    FOREIGN KEY (vaga_id)
    REFERENCES vagas(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_vaga_habilidade_habilidade
    FOREIGN KEY (habilidade_id)
    REFERENCES habilidades(id)
    ON DELETE CASCADE
);

-- ========================
-- CANDIDATURAS
-- ========================
CREATE TABLE candidaturas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  vaga_id INT NOT NULL,
  status ENUM('pendente', 'aprovado', 'rejeitado') DEFAULT 'pendente',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE (usuario_id, vaga_id),

  CONSTRAINT fk_candidatura_usuario
    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_candidatura_vaga
    FOREIGN KEY (vaga_id)
    REFERENCES vagas(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_pedidos_usuario ON pedidos(id_usuario);
CREATE INDEX idx_pagamento_pedido ON pagamentos(id_pedido);
CREATE INDEX idx_produto_nome ON produtos(nome);
