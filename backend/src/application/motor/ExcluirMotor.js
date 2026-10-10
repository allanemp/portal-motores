const { NotFoundError } = require('../../domain/shared/errors');
const { idValido } = require('./idValido');

class ExcluirMotor {
  constructor({ motorRepository }) {
    this.motorRepository = motorRepository;
  }

  async executar(id) {
    const removido = idValido(id) && (await this.motorRepository.excluir(id));
    if (!removido) throw new NotFoundError('Motor não encontrado');
  }
}

module.exports = { ExcluirMotor };
