// Erro com status HTTP conhecido, lançado pelos controllers.
class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Rota não encontrada' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    const body = { error: err.message };
    if (err.details) body.details = err.details;
    return res.status(err.status).json(body);
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

module.exports = { HttpError, notFoundHandler, errorHandler };
