const { ValidationError } = require('../shared/errors');
const { motorSchema, FREQUENCIAS_VALIDAS, POLOS_VALIDOS } = require('./motor.schema');

// Entidade Motor: concentra as invariantes do negócio.
// Só é possível obter um Motor através de Motor.criar(), que valida os dados
// com o schema Zod; assim todo Motor existente em memória é válido.
class Motor {
  constructor(props) {
    this.id = props.id ?? null;
    this.codigo = props.codigo;
    this.modelo = props.modelo;
    this.fabricanteId = props.fabricanteId;
    this.potenciaCv = props.potenciaCv;
    this.tensao = props.tensao;
    this.frequenciaHz = props.frequenciaHz;
    this.polos = props.polos;
    this.rotacaoRpm = props.rotacaoRpm;
    this.carcaca = props.carcaca;
    this.grauProtecao = props.grauProtecao;
    this.preco = props.preco;
    Object.freeze(this);
  }

  // Recebe os dados crus (formato da API, snake_case), valida e normaliza.
  // Lança ValidationError com TODAS as mensagens de uma vez.
  static criar(dados, id = null) {
    const resultado = motorSchema.safeParse(dados);
    if (!resultado.success) {
      throw new ValidationError(resultado.error.issues.map((issue) => issue.message));
    }

    const d = resultado.data;
    return new Motor({
      id,
      codigo: d.codigo,
      modelo: d.modelo,
      fabricanteId: d.fabricante_id,
      potenciaCv: d.potencia_cv,
      tensao: d.tensao,
      frequenciaHz: d.frequencia_hz,
      polos: d.polos,
      rotacaoRpm: d.rotacao_rpm,
      carcaca: d.carcaca,
      grauProtecao: d.grau_protecao,
      preco: d.preco,
    });
  }
}

module.exports = { Motor, FREQUENCIAS_VALIDAS, POLOS_VALIDOS };
