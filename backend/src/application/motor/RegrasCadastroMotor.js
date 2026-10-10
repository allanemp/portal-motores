const { ValidationError, ConflictError } = require('../../domain/shared/errors');

// Regras que dependem de outros dados persistidos (por isso não ficam na entidade):
// o fabricante precisa existir e o código precisa ser único.
// Compartilhada pelos casos de uso de criar e atualizar (evita duplicação).
class RegrasCadastroMotor {
  constructor({ motorRepository, fabricanteRepository }) {
    this.motorRepository = motorRepository;
    this.fabricanteRepository = fabricanteRepository;
  }

  async verificar(motor) {
    if (!(await this.fabricanteRepository.existe(motor.fabricanteId))) {
      throw new ValidationError(['fabricante_id não existe']);
    }
    if (await this.motorRepository.codigoEmUso(motor.codigo, motor.id ?? 0)) {
      throw new ConflictError('Código já cadastrado');
    }
  }
}

module.exports = { RegrasCadastroMotor };
