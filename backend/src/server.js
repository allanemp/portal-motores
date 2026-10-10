const env = require('./infrastructure/config/env');
const { MySqlDatabase } = require('./infrastructure/database/MySqlDatabase');
const { MySqlMotorRepository } = require('./infrastructure/repositories/MySqlMotorRepository');
const { MySqlFabricanteRepository } = require('./infrastructure/repositories/MySqlFabricanteRepository');
const { buildControllers } = require('./container');
const { createApp } = require('./interfaces/http/app');

async function start() {
  if (!env.db.password) {
    console.warn('DB_PASSWORD não definida. Confira as variáveis de ambiente.');
  }

  const database = new MySqlDatabase(env.db);
  try {
    await database.waitUntilReady();
  } catch (err) {
    console.error('Não foi possível conectar ao MySQL. Encerrando.', err.message);
    process.exit(1);
  }

  const controllers = buildControllers({
    database,
    motorRepository: new MySqlMotorRepository({ database }),
    fabricanteRepository: new MySqlFabricanteRepository({ database }),
  });

  createApp({ controllers, corsOrigin: env.corsOrigin }).listen(env.port, () => {
    console.log(`API rodando em http://localhost:${env.port}/api`);
  });
}

start();
