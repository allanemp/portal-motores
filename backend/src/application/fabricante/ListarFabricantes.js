class ListarFabricantes {
  constructor({ fabricanteRepository }) {
    this.fabricanteRepository = fabricanteRepository;
  }

  async executar() {
    return this.fabricanteRepository.listar();
  }
}

module.exports = { ListarFabricantes };
