const mysql = require('mysql2/promise');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Encapsula o pool do mysql2. O pool não abre conexão na criação;
// ela acontece na primeira consulta.
class MySqlDatabase {
  constructor(config) {
    this.pool = mysql.createPool({
      ...config,
      waitForConnections: true,
      connectionLimit: 10,
      charset: 'utf8mb4',
      // DECIMAL vem como string por padrão no mysql2; aqui pedimos número
      // para o JSON sair como { "potencia_cv": 10 } e não "10.00".
      decimalNumbers: true,
      // DATETIME sem fuso: devolve como texto para não sofrer conversão de timezone.
      dateStrings: true,
    });
  }

  // Sempre com placeholders "?": o driver envia os valores separados do SQL,
  // então texto vindo da requisição nunca vira código SQL.
  async query(sql, params = []) {
    const [rows] = await this.pool.query(sql, params);
    return rows;
  }

  async ping() {
    await this.pool.query('SELECT 1');
  }

  // Mesmo com o healthcheck do compose, tentamos algumas vezes antes de desistir.
  // Assim a API também funciona se for iniciada antes do banco (fora do Docker, por exemplo).
  async waitUntilReady({ retries = 10, delayMs = 3000 } = {}) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await this.ping();
        console.log('Conectado ao MySQL.');
        return;
      } catch (err) {
        console.warn(`MySQL indisponível (tentativa ${attempt}/${retries}): ${err.code || err.message}`);
        if (attempt === retries) throw err;
        await sleep(delayMs);
      }
    }
  }
}

module.exports = { MySqlDatabase };
