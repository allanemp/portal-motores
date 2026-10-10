// Contrato (porta) do repositório de motores.
// O domínio e os casos de uso dependem DESTA abstração, não do MySQL
// (Princípio da Inversão de Dependência). A implementação concreta fica em
// infrastructure/repositories/MySqlMotorRepository.js e os testes usam uma em memória.
//
// Leituras devolvem um objeto "de consulta" já no formato da API
// (inclui fabricante_nome e criado_em); escritas recebem a entidade Motor.
class MotorRepository {
  /** @returns {Promise<object[]>} */
  async listar(busca) { throw new Error('não implementado'); }

  /** @returns {Promise<object|null>} */
  async buscarPorId(id) { throw new Error('não implementado'); }

  /** @returns {Promise<boolean>} true se outro motor (id diferente de ignorarId) já usa o código */
  async codigoEmUso(codigo, ignorarId) { throw new Error('não implementado'); }

  /** @returns {Promise<number>} id gerado */
  async criar(motor) { throw new Error('não implementado'); }

  async atualizar(motor) { throw new Error('não implementado'); }

  /** @returns {Promise<boolean>} true se algo foi removido */
  async excluir(id) { throw new Error('não implementado'); }
}

module.exports = { MotorRepository };
