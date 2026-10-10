const { FabricanteRepository } = require('../../domain/fabricante/FabricanteRepository');

class PrismaFabricanteRepository extends FabricanteRepository {
  constructor({ prisma }) {
    super();
    this.prisma = prisma;
  }

  async listar() {
    return this.prisma.fabricante.findMany({
      select: { id: true, nome: true },
      orderBy: { nome: 'asc' },
    });
  }

  async existe(id) {
    const total = await this.prisma.fabricante.count({ where: { id } });
    return total > 0;
  }
}

module.exports = { PrismaFabricanteRepository };
