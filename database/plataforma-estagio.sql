USE railway;

-- ========================
-- LIMPEZA
-- ========================
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS candidaturas;
DROP TABLE IF EXISTS vaga_habilidades;
DROP TABLE IF EXISTS usuario_habilidades;
DROP TABLE IF EXISTS vagas;
DROP TABLE IF EXISTS empresas;
DROP TABLE IF EXISTS alunos;
DROP TABLE IF EXISTS perfis;
DROP TABLE IF EXISTS habilidades;
DROP TABLE IF EXISTS usuarios;

SET FOREIGN_KEY_CHECKS = 1;

-- ========================
-- USUÁRIOS (BASE)
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
-- ALUNOS (RA)
-- ========================
CREATE TABLE alunos (
  usuario_id INT PRIMARY KEY,
  ra VARCHAR(50) NOT NULL UNIQUE,

  CONSTRAINT fk_aluno_usuario
    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id)
    ON DELETE CASCADE
);

-- ========================
-- EMPRESAS (CNPJ)
-- ========================
CREATE TABLE empresas (
  usuario_id INT PRIMARY KEY,
  cnpj VARCHAR(20) NOT NULL UNIQUE,

  CONSTRAINT fk_empresa_usuario
    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id)
    ON DELETE CASCADE
);

-- ========================
-- PERFIS (ALUNOS)
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
-- VAGAS (EMPRESAS)
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
-- CANDIDATURAS (ALUNOS)
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