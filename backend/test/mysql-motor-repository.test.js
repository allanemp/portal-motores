const { test } = require('node:test');
const assert = require('node:assert/strict');
const { MySqlMotorRepository, escapeLike } = require('../src/infrastructure/repositories/MySqlMotorRepository');

test('escapeLike neutraliza curingas do LIKE', () => {
  assert.equal(escapeLike('50%'), '50\\%');
  assert.equal(escapeLike('a_b'), 'a\\_b');
  assert.equal(escapeLike('c:\\x'), 'c:\\\\x');
});

test('busca envia o termo como parâmetro, nunca concatenado no SQL', async () => {
  const chamadas = [];
  const database = { query: async (sql, params) => (chamadas.push({ sql, params }), []) };
  const repo = new MySqlMotorRepository({ database });

  const ataque = "' OR 1=1 --";
  await repo.listar(ataque);

  assert.ok(!chamadas[0].sql.includes(ataque));
  assert.deepEqual(chamadas[0].params, [`%${ataque}%`, `%${ataque}%`]);
});
