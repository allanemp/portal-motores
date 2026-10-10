const { Motor } = require('../../domain/motor/Motor');

class CriarMotor {
  constructor({ motorRepository, regrasCadastroMotor }) {
    this.motorRepository = motorRepository;
    this.regras = regrasCadastroMotor;
  }

  async executar(dados) {
    const motor = Motor.criar(dados); // invariantes da entidade (400)
    await this.regras.verificar(motor); // fabricante existe (400) e código único (409)
    const id = await this.motorRepository.criar(motor);
    return this.motorRepository.buscarPorId(id);
  }
}

module.exports = { CriarMotor };
