const { Router } = require('express');

// Mapeia URL + método para o método do controller.
function createRoutes({ motorController, fabricanteController, healthController }) {
  const router = Router();

  router.get('/health', healthController.verificar);

  router.get('/fabricantes', fabricanteController.listar);

  router.get('/motores', motorController.listar);
  router.get('/motores/:id', motorController.buscar);
  router.post('/motores', motorController.criar);
  router.put('/motores/:id', motorController.atualizar);
  router.delete('/motores/:id', motorController.excluir);

  return router;
}

module.exports = { createRoutes };
