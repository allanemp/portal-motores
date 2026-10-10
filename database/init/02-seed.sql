-- Dados iniciais: 3 fabricantes e 12 motores.
SET NAMES utf8mb4;

INSERT INTO fabricantes (id, nome) VALUES
  (1, 'WEG'),
  (2, 'Siemens'),
  (3, 'ABB');

INSERT INTO motores
  (codigo, modelo, fabricante_id, potencia_cv, tensao, frequencia_hz, polos, rotacao_rpm, carcaca, grau_protecao, preco)
VALUES
  ('WEG-W22-001', 'W22 IR3 Premium 1 cv',   1,   1.00, '220/380V',      60, 4, 1720, '80',   'IP55',  1250.00),
  ('WEG-W22-005', 'W22 IR3 Premium 5 cv',   1,   5.00, '220/380V',      60, 4, 1745, '100L', 'IP55',  3180.50),
  ('WEG-W22-010', 'W22 IR3 Premium 10 cv',  1,  10.00, '220/380/440V',  60, 4, 1760, '132S', 'IP55',  5420.00),
  ('WEG-W22-020', 'W22 IR4 Super Premium',  1,  20.00, '380/660V',      60, 2, 3550, '160M', 'IP66', 11890.00),
  ('WEG-W21-075', 'W21 Alto Rendimento',    1,   7.50, '220/380V',      60, 6, 1160, '132M', 'IP55',     NULL),
  ('SIE-1LE1-003','1LE1 SIMOTICS GP 3 cv',  2,   3.00, '220/380V',      60, 4, 1730, '90L',  'IP55',  2390.00),
  ('SIE-1LE1-015','1LE1 SIMOTICS GP 15 cv', 2,  15.00, '380/660V',      60, 4, 1765, '160M', 'IP55',  8750.00),
  ('SIE-1LA7-050','1LA7 Standard',          2,  50.00, '440V',          60, 8,  880, '250M', 'IP55', 32500.00),
  ('SIE-1LE0-002','1LE0 Basic Line',        2,   2.00, '220/380V',      50, 2, 2850, NULL,   NULL,       NULL),
  ('ABB-M3BP-025','M3BP Process Performance',3,  25.00, '380/660V',     60, 4, 1775, '180M', 'IP55', 14200.00),
  ('ABB-M2BAX-01','M2BAX General Purpose',  3,   1.50, '220/380V',      60, 2, 3420, '80',   'IP55',  1480.00),
  ('ABB-M3AA-100','M3AA Aluminium 100 cv',  3, 100.00, '440V',          60, 6, 1185, '315S', 'IP56', 68900.00);
