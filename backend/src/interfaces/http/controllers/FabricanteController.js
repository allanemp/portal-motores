class FabricanteController {
  constructor({ listarFabricantes }) {
    this.listarFabricantes = listarFabricantes;
  }

  listar = async (req, res) => {
    res.json(await this.listarFabricantes.executar());
  };
}

module.exports = { FabricanteController };
