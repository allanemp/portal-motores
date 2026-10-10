// Adaptador HTTP: só traduz req/res para chamadas aos casos de uso.
// Nenhuma regra de negócio aqui. Erros sobem para o errorHandler (Express 5
// encaminha automaticamente rejeições de funções async).
class MotorController {
  constructor({ listarMotores, buscarMotor, criarMotor, atualizarMotor, excluirMotor }) {
    this.listarMotores = listarMotores;
    this.buscarMotor = buscarMotor;
    this.criarMotor = criarMotor;
    this.atualizarMotor = atualizarMotor;
    this.excluirMotor = excluirMotor;
  }

  listar = async (req, res) => {
    res.json(await this.listarMotores.executar(req.query.search));
  };

  buscar = async (req, res) => {
    res.json(await this.buscarMotor.executar(Number(req.params.id)));
  };

  criar = async (req, res) => {
    res.status(201).json(await this.criarMotor.executar(req.body));
  };

  atualizar = async (req, res) => {
    res.json(await this.atualizarMotor.executar(Number(req.params.id), req.body));
  };

  excluir = async (req, res) => {
    await this.excluirMotor.executar(Number(req.params.id));
    res.status(204).end();
  };
}

module.exports = { MotorController };
