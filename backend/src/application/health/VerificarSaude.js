// Depende de qualquer objeto com o método ping() (porta), não do MySQL diretamente.
class VerificarSaude {
  constructor({ database }) {
    this.database = database;
  }

  async executar() {
    try {
      await this.database.ping();
      return { status: 'ok', database: 'ok' };
    } catch (err) {
      console.error('Health check falhou:', err.code || err.message);
      return { status: 'error', database: 'error' };
    }
  }
}

module.exports = { VerificarSaude };
