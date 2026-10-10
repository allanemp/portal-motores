const { test } = require('node:test');
const assert = require('node:assert/strict');
const { PrismaMotorRepository, escapeLike } = require('../src/infrastructure/repositories/PrismaMotorRepository');
const { ConflictError, ValidationError } = require('../src/domain/shared/errors');

// Prisma Client falso: registra as chamadas para conferirmos o que é enviado.
function prismaFalso(sobrescrever = {}) {
  const chamadas = [];
  const motor = {
    findMany: async (args) => (chamadas.push(args), []),
    create: async () => ({ id: 1 }),
    ...sobrescrever,
  };
  return { prisma: { motor }, chamadas };
}

test('busca envia o termo como dado (filtro contains), nunca como SQL', async () => {
  const { prisma, chamadas } = prismaFalso();
  const ataque = "' OR 1=1 --";
  await new PrismaMotorRepository({ prisma }).listar(ataque);

  assert.deepEqual(chamadas[0].where, {
    OR: [{ codigo: { contains: ataque } }, { modelo: { contains: ataque } }],
  });
});

test('escapeLike neutraliza curingas do LIKE', () => {
  assert.equal(escapeLike('50%'), '50\\%');
  assert.equal(escapeLike('a_b'), 'a\\_b');
  assert.equal(escapeLike('c:\\x'), 'c:\\\\x');
});

test('converte Decimal e camelCase para o formato da API', async () => {
  const registro = {
    id: 1, codigo: 'A', modelo: 'M', fabricanteId: 2, fabricante: { nome: 'WEG' },
    potenciaCv: { toString: () => '10.50' }, tensao: '220V', frequenciaHz: 60, polos: 4,
    rotacaoRpm: 1730, carcaca: null, grauProtecao: 'IP55', preco: null, criadoEm: new Date(0),
  };
  const { prisma } = prismaFalso({ findMany: async () => [registro] });
  const [motor] = await new PrismaMotorRepository({ prisma }).listar('');

  assert.equal(motor.potencia_cv, 10.5);
  assert.equal(motor.fabricante_nome, 'WEG');
  assert.equal(motor.grau_protecao, 'IP55');
  assert.equal(motor.preco, null);
});

test('traduz erros do Prisma para erros de domínio', async () => {
  const falhaCom = (code) => async () => {
    throw Object.assign(new Error(code), { code });
  };
  const repoUnique = new PrismaMotorRepository(prismaFalso({ create: falhaCom('P2002') }));
  await assert.rejects(repoUnique.criar({}), ConflictError);

  const repoFk = new PrismaMotorRepository(prismaFalso({ create: falhaCom('P2003') }));
  await assert.rejects(repoFk.criar({}), ValidationError);
});
