-- Executado automaticamente pelo container MySQL na primeira subida
-- (somente quando o volume de dados está vazio).
SET NAMES utf8mb4;

CREATE TABLE fabricantes (
  id     INT AUTO_INCREMENT PRIMARY KEY,
  nome   VARCHAR(80) NOT NULL,
  UNIQUE KEY uk_fabricante_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE motores (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  codigo         VARCHAR(30)   NOT NULL,
  modelo         VARCHAR(80)   NOT NULL,
  fabricante_id  INT           NOT NULL,
  potencia_cv    DECIMAL(8,2)  NOT NULL,   -- ex.: 10.00
  tensao         VARCHAR(30)   NOT NULL,   -- ex.: "220/380V"
  frequencia_hz  SMALLINT      NOT NULL,   -- 50 ou 60
  polos          TINYINT       NOT NULL,   -- 2, 4, 6 ou 8
  rotacao_rpm    INT           NOT NULL,   -- ex.: 1730
  carcaca        VARCHAR(20)   NULL,       -- ex.: "132M"
  grau_protecao  VARCHAR(10)   NULL,       -- ex.: "IP55"
  preco          DECIMAL(12,2) NULL,
  criado_em      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_motor_codigo (codigo),
  CONSTRAINT fk_motor_fabricante
    FOREIGN KEY (fabricante_id) REFERENCES fabricantes (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
