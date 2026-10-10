class ListarMotores {
  constructor({ motorRepository }) {
    this.motorRepository = motorRepository;
  }

  async executar(busca) {
    const termo = typeof busca === 'string' ? busca.trim() : '';
    return this.motorRepository.listar(termo);
  }
}

module.exports = { ListarMotores };
