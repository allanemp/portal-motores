const { MotorRepository } = require('../../domain/motor/MotorRepository');
const { ConflictError, ValidationError } = require('../../domain/shared/errors');

// O Prisma gera SQL parametrizado: valores (inclusive o termo de busca)
// nunca são concatenados no texto da consulta.

const comFabricante = { fabricante: { select: { nome: true } } };

// O "contains" do Prisma vira LIKE '%termo%' mas NÃO escapa os curingas do LIKE.
// Sem isso, buscar "%" ou "_" retornaria todos os motores.
function escapeLike(texto) {
  return texto.replace(/[\\%_]/g, '\\$&');
}

// Registro do Prisma (camelCase, Decimal) -> formato da API (snake_case, number).
function paraApi(registro) {
  return {
    id: registro.id,
    codigo: registro.codigo,
    modelo: registro.modelo,
    fabricante_id: registro.fabricanteId,
    fabricante_nome: registro.fabricante.nome,
    potencia_cv: Number(registro.potenciaCv),
    tensao: registro.tensao,
    frequencia_hz: registro.frequenciaHz,
    polos: registro.polos,
    rotacao_rpm: registro.rotacaoRpm,
    carcaca: registro.carcaca,
    grau_protecao: registro.grauProtecao,
    preco: registro.preco === null ? null : Number(registro.preco),
    criado_em: registro.criadoEm,
  };
}

// Entidade Motor -> dados de gravação do Prisma.
function paraPrisma(motor) {
  return {
    codigo: motor.codigo,
    modelo: motor.modelo,
    fabricanteId: motor.fabricanteId,
    potenciaCv: motor.potenciaCv,
    tensao: motor.tensao,
    frequenciaHz: motor.frequenciaHz,
    polos: motor.polos,
    rotacaoRpm: motor.rotacaoRpm,
    carcaca: motor.carcaca,
    grauProtecao: motor.grauProtecao,
    preco: motor.preco,
  };
}

// Traduz erros do Prisma para erros de domínio. Cobre corridas entre a
// pré-checagem e a gravação (ex.: dois cadastros simultâneos com o mesmo código).
function traduzirErro(err) {
  if (err.code === 'P2002') return new ConflictError('Código já cadastrado'); // UNIQUE
  if (err.code === 'P2003') return new ValidationError(['fabricante_id não existe']); // FK
  return err;
}

class PrismaMotorRepository extends MotorRepository {
  constructor({ prisma }) {
    super();
    this.prisma = prisma;
  }

  async listar(busca) {
    const termo = busca ? escapeLike(busca) : '';
    const where = termo
      ? { OR: [{ codigo: { contains: termo } }, { modelo: { contains: termo } }] }
      : undefined;
    const registros = await this.prisma.motor.findMany({
      where,
      include: comFabricante,
      orderBy: { codigo: 'asc' },
    });
    return registros.map(paraApi);
  }

  async buscarPorId(id) {
    const registro = await this.prisma.motor.findUnique({ where: { id }, include: comFabricante });
    return registro ? paraApi(registro) : null;
  }

  async codigoEmUso(codigo, ignorarId = 0) {
    const total = await this.prisma.motor.count({ where: { codigo, NOT: { id: ignorarId } } });
    return total > 0;
  }

  async criar(motor) {
    try {
      const criado = await this.prisma.motor.create({ data: paraPrisma(motor), select: { id: true } });
      return criado.id;
    } catch (err) {
      throw traduzirErro(err);
    }
  }

  async atualizar(motor) {
    try {
      await this.prisma.motor.update({ where: { id: motor.id }, data: paraPrisma(motor) });
    } catch (err) {
      throw traduzirErro(err);
    }
  }

  async excluir(id) {
    // deleteMany não lança erro se não achar; devolve quantos removeu.
    const { count } = await this.prisma.motor.deleteMany({ where: { id } });
    return count > 0;
  }
}

module.exports = { PrismaMotorRepository, paraApi, escapeLike };
