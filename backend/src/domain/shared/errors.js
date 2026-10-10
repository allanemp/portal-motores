// Erros de domínio/aplicação. Não conhecem HTTP: quem traduz para status
// (400, 404, 409) é a camada de interface (interfaces/http/middlewares/errorHandler.js).

class DomainError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

// Regra de negócio violada; carrega a lista de mensagens por campo.
class ValidationError extends DomainError {
  constructor(details) {
    super('Dados inválidos');
    this.details = details;
  }
}

class NotFoundError extends DomainError {}

class ConflictError extends DomainError {}

module.exports = { DomainError, ValidationError, NotFoundError, ConflictError };
