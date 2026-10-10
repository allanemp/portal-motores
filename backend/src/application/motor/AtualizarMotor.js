const { Motor } = require('../../domain/motor/Motor');
const { NotFoundError } = require('../../domain/shared/errors');
const { idValido } = require('./idValido');

class AtualizarMotor {
  constructor({ motorRepository, regrasCadastroMotor }) {
    this.motorRepository = motorRepository;
    this.regras = regrasCadastroMotor;
  }

  async executar(id, dados) {
    if (!idValido(id) || !(await this.motorRepository.buscarPorId(id))) {
      throw new NotFoundError('Motor não encontrado');
    }
    const motor = Motor.criar(dados, id);
    await this.regras.verificar(motor);
    await this.motorRepository.atualizar(motor);
    return this.motorRepository.buscarPorId(id);
  }
}

module.exports = { AtualizarMotor };
