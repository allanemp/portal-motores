const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createApp } = require('../src/interfaces/http/app');
const { buildControllers } = require('../src/container');
const { criarRepositorios } = require('./support/inMemoryRepositories');

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

let app;
let database;

beforeEach(() => {
  database = { ping: async () => {} };
  const controllers = buildControllers({ database, ...criarRepositorios() });
  app = createApp({ controllers, corsOrigin: 'http://localhost:4200' });
});

test('GET /api/health', async () => {
  const res = await request(app).get('/api/health').expect(200);
  assert.deepEqual(res.body, { status: 'ok', database: 'ok' });
});

test('GET /api/health com banco fora do ar devolve 503', async () => {
  database.ping = async () => {
    throw new Error('ECONNREFUSED');
  };
  const res = await request(app).get('/api/health').expect(503);
  assert.deepEqual(res.body, { status: 'error', database: 'error' });
});

test('GET /api/fabricantes', async () => {
  const res = await request(app).get('/api/fabricantes').expect(200);
  assert.deepEqual(res.body.map((f) => f.nome), ['Siemens', 'WEG']);
});

test('fluxo completo de CRUD', async () => {
  const criado = await request(app).post('/api/motores').send(valido).expect(201);
  assert.ok(criado.body.id);
  assert.equal(criado.body.fabricante_nome, 'WEG');

  const id = criado.body.id;
  await request(app).get(`/api/motores/${id}`).expect(200);

  const lista = await request(app).get('/api/motores').expect(200);
  assert.equal(lista.body.length, 1);

  const busca = await request(app).get('/api/motores').query({ search: 'w22' }).expect(200);
  assert.equal(busca.body.length, 1);
  const semResultado = await request(app).get('/api/motores').query({ search: 'xyz' }).expect(200);
  assert.equal(semResultado.body.length, 0);

  const atualizado = await request(app)
    .put(`/api/motores/${id}`)
    .send({ ...valido, modelo: 'W22 Plus' })
    .expect(200);
  assert.equal(atualizado.body.modelo, 'W22 Plus');

  await request(app).delete(`/api/motores/${id}`).expect(204);
  await request(app).get(`/api/motores/${id}`).expect(404);
  await request(app).delete(`/api/motores/${id}`).expect(404);
});

test('POST inválido devolve 400 no formato do contrato', async () => {
  const res = await request(app)
    .post('/api/motores')
    .send({ ...valido, potencia_cv: 0 })
    .expect(400);
  assert.deepEqual(res.body, { error: 'Dados inválidos', details: ['potencia_cv deve ser maior que zero'] });
});

test('POST com fabricante inexistente devolve 400', async () => {
  const res = await request(app)
    .post('/api/motores')
    .send({ ...valido, fabricante_id: 99 })
    .expect(400);
  assert.deepEqual(res.body.details, ['fabricante_id não existe']);
});

test('código duplicado devolve 409 (criação e edição)', async () => {
  await request(app).post('/api/motores').send(valido).expect(201);
  await request(app).post('/api/motores').send(valido).expect(409);

  const outro = await request(app)
    .post('/api/motores')
    .send({ ...valido, codigo: 'WEG-02' })
    .expect(201);
  await request(app).put(`/api/motores/${outro.body.id}`).send(valido).expect(409);
  // Manter o próprio código na edição é permitido.
  await request(app).put(`/api/motores/${outro.body.id}`).send({ ...valido, codigo: 'WEG-02' }).expect(200);
});

test('ids inexistentes ou inválidos devolvem 404', async () => {
  await request(app).get('/api/motores/999').expect(404);
  await request(app).get('/api/motores/abc').expect(404);
  await request(app).put('/api/motores/999').send(valido).expect(404);
});

test('JSON malformado devolve 400', async () => {
  await request(app)
    .post('/api/motores')
    .set('Content-Type', 'application/json')
    .send('{invalido')
    .expect(400);
});

test('CORS liberado para o front', async () => {
  const res = await request(app).get('/api/health').set('Origin', 'http://localhost:4200');
  assert.equal(res.headers['access-control-allow-origin'], 'http://localhost:4200');
});
