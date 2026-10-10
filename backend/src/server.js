const env = require('./infrastructure/config/env');
const { PrismaDatabase } = require('./infrastructure/database/PrismaDatabase');
const { PrismaMotorRepository } = require('./infrastructure/repositories/PrismaMotorRepository');
const { PrismaFabricanteRepository } = require('./infrastructure/repositories/PrismaFabricanteRepository');
const { buildControllers } = require('./container');
const { createApp } = require('./interfaces/http/app');

async function start() {
  if (!env.db.password) {
    console.warn('DB_PASSWORD não definida. Confira as variáveis de ambiente.');
  }

  const database = new PrismaDatabase(env.db);
  try {
    await database.waitUntilReady();
  } catch (err) {
    console.error('Não foi possível conectar ao MySQL. Encerrando.', err.message);
    process.exit(1);
  }

  const controllers = buildControllers({
    database,
    motorRepository: new PrismaMotorRepository({ prisma: database.client }),
    fabricanteRepository: new PrismaFabricanteRepository({ prisma: database.client }),
  });

  createApp({ controllers, corsOrigin: env.corsOrigin }).listen(env.port, () => {
    console.log(`API rodando em http://localhost:${env.port}/api`);
  });
}

start();
