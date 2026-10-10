const express = require('express');
const cors = require('cors');
const { createRoutes } = require('./routes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

// Recebe os controllers prontos: o app não sabe de onde vêm os dados
// (MySQL em produção, repositórios em memória nos testes).
function createApp({ controllers, corsOrigin }) {
  const app = express();

  app.disable('x-powered-by');
  app.use(cors({ origin: corsOrigin }));
  app.use(express.json());

  app.use('/api', createRoutes(controllers));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
