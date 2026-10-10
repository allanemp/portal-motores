const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const { PrismaClient } = require('../../../generated/prisma');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Cria o Prisma Client e concentra o que é "conexão com o banco":
// ping (health check) e espera inicial pelo MySQL.
// O Prisma 7 conecta por um driver adapter; para MySQL o oficial é o do MariaDB.
class PrismaDatabase {
  constructor(config) {
    const adapter = new PrismaMariaDb({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      connectionLimit: 10,
      // MySQL 8 usa caching_sha2_password; sem TLS o driver precisa buscar a chave pública.
      allowPublicKeyRetrieval: true,
    });
    this.client = new PrismaClient({ adapter });
  }

  async ping() {
    // Tagged template: o Prisma envia como consulta parametrizada.
    await this.client.$queryRaw`SELECT 1`;
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

module.exports = { PrismaDatabase };
