const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Motor } = require('../src/domain/motor/Motor');
const { ValidationError } = require('../src/domain/shared/errors');

const valido = {
  codigo: 'WEG-01',
  modelo: 'W22',
  fabricante_id: 1,
  potencia_cv: 10,
  tensao: '220/380V',
  frequencia_hz: 60,
  polos: 4,
  rotacao_rpm: 1730,
};

function errosDe(dados) {
  try {
    Motor.criar(dados);
    return [];
  } catch (err) {
    assert.ok(err instanceof ValidationError);
    return err.details;
  }
}

test('cria motor válido e normaliza a entrada', () => {
  const motor = Motor.criar({ ...valido, codigo: '  WEG-01 ', potencia_cv: '7.5', carcaca: '', preco: '' });
  assert.equal(motor.codigo, 'WEG-01');
  assert.equal(motor.potenciaCv, 7.5);
  assert.equal(motor.carcaca, null);
  assert.equal(motor.preco, null);
  assert.ok(Object.isFrozen(motor));
});

test('exige campos obrigatórios', () => {
  const erros = errosDe({});
  for (const campo of ['codigo', 'modelo', 'fabricante_id', 'potencia_cv', 'tensao', 'rotacao_rpm']) {
    assert.ok(erros.includes(`${campo} é obrigatório`), `faltou erro de ${campo}`);
  }
});

test('potencia_cv deve ser maior que zero', () => {
  assert.deepEqual(errosDe({ ...valido, potencia_cv: 0 }), ['potencia_cv deve ser maior que zero']);
  assert.deepEqual(errosDe({ ...valido, potencia_cv: -3 }), ['potencia_cv deve ser maior que zero']);
});

test('frequencia_hz só aceita 50 ou 60', () => {
  assert.deepEqual(errosDe({ ...valido, frequencia_hz: 55 }), ['frequencia_hz deve ser 50 ou 60']);
  assert.deepEqual(errosDe({ ...valido, frequencia_hz: '50' }), []);
});

test('polos só aceita 2, 4, 6 ou 8', () => {
  assert.deepEqual(errosDe({ ...valido, polos: 3 }), ['polos deve ser 2, 4, 6 ou 8']);
  for (const polos of [2, 4, 6, 8]) assert.deepEqual(errosDe({ ...valido, polos }), []);
});

test('rotacao_rpm deve ser inteiro maior que zero', () => {
  assert.deepEqual(errosDe({ ...valido, rotacao_rpm: 0 }), ['rotacao_rpm deve ser maior que zero']);
  assert.deepEqual(errosDe({ ...valido, rotacao_rpm: 17.5 }), ['rotacao_rpm deve ser um número inteiro']);
});

test('rejeita tipos errados e textos longos', () => {
  const erros = errosDe({ ...valido, codigo: 123, modelo: 'x'.repeat(81), potencia_cv: 'abc' });
  assert.deepEqual(erros, [
    'codigo deve ser um texto',
    'modelo deve ter no máximo 80 caracteres',
    'potencia_cv deve ser um número',
  ]);
});

test('rejeita corpo que não é objeto', () => {
  assert.deepEqual(errosDe(null), ['corpo da requisição deve ser um objeto JSON']);
  assert.deepEqual(errosDe([1, 2]), ['corpo da requisição deve ser um objeto JSON']);
});
