// Contrato (porta) do repositório de fabricantes. Ver MotorRepository.js.
class FabricanteRepository {
  /** @returns {Promise<{id:number, nome:string}[]>} */
  async listar() { throw new Error('não implementado'); }

  /** @returns {Promise<boolean>} */
  async existe(id) { throw new Error('não implementado'); }
}

module.exports = { FabricanteRepository };
