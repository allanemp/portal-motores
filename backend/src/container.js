// Composition root: único lugar que conhece as implementações concretas
// e liga as dependências (injeção de dependência manual, sem framework).
const { RegrasCadastroMotor } = require('./application/motor/RegrasCadastroMotor');
const { ListarMotores } = require('./application/motor/ListarMotores');
const { BuscarMotor } = require('./application/motor/BuscarMotor');
const { CriarMotor } = require('./application/motor/CriarMotor');
const { AtualizarMotor } = require('./application/motor/AtualizarMotor');
const { ExcluirMotor } = require('./application/motor/ExcluirMotor');
const { ListarFabricantes } = require('./application/fabricante/ListarFabricantes');
const { VerificarSaude } = require('./application/health/VerificarSaude');
const { MotorController } = require('./interfaces/http/controllers/MotorController');
const { FabricanteController } = require('./interfaces/http/controllers/FabricanteController');
const { HealthController } = require('./interfaces/http/controllers/HealthController');

// Recebe database e repositórios para que os testes possam trocar por versões em memória.
function buildControllers({ database, motorRepository, fabricanteRepository }) {
  const regrasCadastroMotor = new RegrasCadastroMotor({ motorRepository, fabricanteRepository });

  return {
    motorController: new MotorController({
      listarMotores: new ListarMotores({ motorRepository }),
      buscarMotor: new BuscarMotor({ motorRepository }),
      criarMotor: new CriarMotor({ motorRepository, regrasCadastroMotor }),
      atualizarMotor: new AtualizarMotor({ motorRepository, regrasCadastroMotor }),
      excluirMotor: new ExcluirMotor({ motorRepository }),
    }),
    fabricanteController: new FabricanteController({
      listarFabricantes: new ListarFabricantes({ fabricanteRepository }),
    }),
    healthController: new HealthController({
      verificarSaude: new VerificarSaude({ database }),
    }),
  };
}

module.exports = { buildControllers };
