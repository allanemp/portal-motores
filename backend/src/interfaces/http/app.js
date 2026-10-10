const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const { openApiSpec } = require('./docs/openapi');
const { createRoutes } = require('./routes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

// Recebe os controllers prontos: o app não sabe de onde vêm os dados
// (MySQL em produção, repositórios em memória nos testes).
function createApp({ controllers, corsOrigin }) {
  const app = express();

  app.disable('x-powered-by');
  app.use(cors({ origin: corsOrigin }));
  app.use(express.json());

  // Documentação: Swagger UI em /api/docs e a especificação em /api/docs.json.
  app.get('/api/docs.json', (req, res) => res.json(openApiSpec));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, { customSiteTitle: 'API Motores — Docs' }));

  app.use('/api', createRoutes(controllers));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
