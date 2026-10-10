const { NotFoundError } = require('../../domain/shared/errors');
const { idValido } = require('./idValido');

class BuscarMotor {
  constructor({ motorRepository }) {
    this.motorRepository = motorRepository;
  }

  async executar(id) {
    const motor = idValido(id) ? await this.motorRepository.buscarPorId(id) : null;
    if (!motor) throw new NotFoundError('Motor não encontrado');
    return motor;
  }
}

module.exports = { BuscarMotor };
