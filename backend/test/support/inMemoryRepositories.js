const { MotorRepository } = require('../../src/domain/motor/MotorRepository');
const { FabricanteRepository } = require('../../src/domain/fabricante/FabricanteRepository');

// Implementações em memória dos contratos de repositório.
// Permitem testar casos de uso e rotas HTTP sem MySQL.

class InMemoryFabricanteRepository extends FabricanteRepository {
  constructor(fabricantes = [{ id: 1, nome: 'WEG' }, { id: 2, nome: 'Siemens' }]) {
    super();
    this.fabricantes = fabricantes;
  }

  async listar() {
    return [...this.fabricantes].sort((a, b) => a.nome.localeCompare(b.nome));
  }

  async existe(id) {
    return this.fabricantes.some((f) => f.id === id);
  }
}

class InMemoryMotorRepository extends MotorRepository {
  constructor(fabricanteRepository) {
    super();
    this.fabricanteRepository = fabricanteRepository;
    this.motores = new Map();
    this.proximoId = 1;
  }

  paraLeitura(m) {
    const fabricante = this.fabricanteRepository.fabricantes.find((f) => f.id === m.fabricanteId);
    return {
      id: m.id,
      codigo: m.codigo,
      modelo: m.modelo,
      fabricante_id: m.fabricanteId,
      fabricante_nome: fabricante?.nome ?? null,
      potencia_cv: m.potenciaCv,
      tensao: m.tensao,
      frequencia_hz: m.frequenciaHz,
      polos: m.polos,
      rotacao_rpm: m.rotacaoRpm,
      carcaca: m.carcaca,
      grau_protecao: m.grauProtecao,
      preco: m.preco,
      criado_em: '2026-01-01 00:00:00',
    };
  }

  async listar(busca) {
    const termo = (busca || '').toLowerCase();
    return [...this.motores.values()]
      .filter((m) => !termo || m.codigo.toLowerCase().includes(termo) || m.modelo.toLowerCase().includes(termo))
      .map((m) => this.paraLeitura(m));
  }

  async buscarPorId(id) {
    const m = this.motores.get(id);
    return m ? this.paraLeitura(m) : null;
  }

  async codigoEmUso(codigo, ignorarId = 0) {
    return [...this.motores.values()].some((m) => m.codigo === codigo && m.id !== ignorarId);
  }

  async criar(motor) {
    const id = this.proximoId++;
    this.motores.set(id, { ...motor, id });
    return id;
  }

  async atualizar(motor) {
    this.motores.set(motor.id, { ...motor });
  }

  async excluir(id) {
    return this.motores.delete(id);
  }
}

function criarRepositorios() {
  const fabricanteRepository = new InMemoryFabricanteRepository();
  const motorRepository = new InMemoryMotorRepository(fabricanteRepository);
  return { fabricanteRepository, motorRepository };
}

module.exports = { InMemoryFabricanteRepository, InMemoryMotorRepository, criarRepositorios };
