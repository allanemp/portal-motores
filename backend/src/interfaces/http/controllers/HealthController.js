class HealthController {
  constructor({ verificarSaude }) {
    this.verificarSaude = verificarSaude;
  }

  verificar = async (req, res) => {
    const resultado = await this.verificarSaude.executar();
    res.status(resultado.status === 'ok' ? 200 : 503).json(resultado);
  };
}

module.exports = { HealthController };
