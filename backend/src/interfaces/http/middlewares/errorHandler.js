const { ValidationError, NotFoundError, ConflictError } = require('../../../domain/shared/errors');

// Única parte do sistema que sabe traduzir erros de domínio em status HTTP.

function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Rota não encontrada' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ValidationError) {
    return res.status(400).json({ error: err.message, details: err.details });
  }
  if (err instanceof NotFoundError) {
    return res.status(404).json({ error: err.message });
  }
  if (err instanceof ConflictError) {
    return res.status(409).json({ error: err.message });
  }

  // JSON malformado no corpo da requisição (gerado pelo express.json()).
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Dados inválidos', details: ['JSON malformado'] });
  }

  // Segurança extra: se duas requisições cadastrarem o mesmo código ao mesmo tempo,
  // a pré-checagem passa nas duas e quem barra é a UNIQUE KEY do banco.
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'Código já cadastrado' });
  }

  // Detalhes do erro só no log do servidor, nunca na resposta.
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor' });
}

module.exports = { notFoundHandler, errorHandler };
