const mysql = require('mysql2/promise');
const env = require('../config/env');

// O pool não abre conexão na criação; ela acontece na primeira consulta.
const pool = mysql.createPool({
  ...env.db,
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
  // DECIMAL vem como string por padrão no mysql2; aqui pedimos número
  // para o JSON sair como { "potencia_cv": 10 } e não "10.00".
  decimalNumbers: true,
  // DATETIME sem fuso: devolve como texto para não sofrer conversão de timezone.
  dateStrings: true,
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Mesmo com o healthcheck do compose, tentamos algumas vezes antes de desistir.
// Assim a API também funciona se for iniciada antes do banco (fora do Docker, por exemplo).
async function waitForDatabase({ retries = 10, delayMs = 3000 } = {}) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await pool.query('SELECT 1');
      console.log('Conectado ao MySQL.');
      return;
    } catch (err) {
      console.warn(`MySQL indisponível (tentativa ${attempt}/${retries}): ${err.code || err.message}`);
      if (attempt === retries) throw err;
      await sleep(delayMs);
    }
  }
}

module.exports = { pool, waitForDatabase };
