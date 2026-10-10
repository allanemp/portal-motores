const { FabricanteRepository } = require('../../domain/fabricante/FabricanteRepository');

class MySqlFabricanteRepository extends FabricanteRepository {
  constructor({ database }) {
    super();
    this.db = database;
  }

  async listar() {
    return this.db.query('SELECT id, nome FROM fabricantes ORDER BY nome');
  }

  async existe(id) {
    const rows = await this.db.query('SELECT 1 FROM fabricantes WHERE id = ?', [id]);
    return rows.length > 0;
  }
}

module.exports = { MySqlFabricanteRepository };
