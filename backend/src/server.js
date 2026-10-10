const app = require('./app');
const env = require('./config/env');
const { waitForDatabase } = require('./db/pool');

async function start() {
  if (!env.db.password) {
    console.warn('DB_PASSWORD não definida. Confira as variáveis de ambiente.');
  }

  try {
    await waitForDatabase();
  } catch (err) {
    console.error('Não foi possível conectar ao MySQL. Encerrando.', err.message);
    process.exit(1);
  }

  app.listen(env.port, () => {
    console.log(`API rodando em http://localhost:${env.port}/api`);
  });
}

start();
