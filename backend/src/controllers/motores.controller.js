const motoresRepository = require('../repositories/motores.repository');
const fabricantesRepository = require('../repositories/fabricantes.repository');
const { validateMotor } = require('../validators/motor.validator');
const { HttpError } = require('../middlewares/errorHandler');

// Converte o :id da URL; qualquer valor que não seja inteiro positivo
// é tratado como motor inexistente (404).
function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(404, 'Motor não encontrado');
  }
  return id;
}

async function list(req, res) {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  res.json(await motoresRepository.findAll(search));
}

async function getById(req, res) {
  const motor = await motoresRepository.findById(parseId(req.params.id));
  if (!motor) throw new HttpError(404, 'Motor não encontrado');
  res.json(motor);
}

// Validação completa: regras de formato + regras que dependem do banco.
// Retorna os dados normalizados prontos para gravar.
async function validarDados(body, ignoreId) {
  const { errors, data } = validateMotor(body);

  // Só consulta o fabricante se o id em si já é válido.
  if (Number.isInteger(data.fabricante_id) && data.fabricante_id > 0) {
    if (!(await fabricantesRepository.exists(data.fabricante_id))) {
      errors.push('fabricante_id não existe');
    }
  }

  if (errors.length > 0) {
    throw new HttpError(400, 'Dados inválidos', errors);
  }

  if (await motoresRepository.codigoEmUso(data.codigo, ignoreId)) {
    throw new HttpError(409, 'Código já cadastrado');
  }

  return data;
}

async function create(req, res) {
  const data = await validarDados(req.body);
  const id = await motoresRepository.create(data);
  res.status(201).json(await motoresRepository.findById(id));
}

async function update(req, res) {
  const id = parseId(req.params.id);
  if (!(await motoresRepository.findById(id))) {
    throw new HttpError(404, 'Motor não encontrado');
  }
  const data = await validarDados(req.body, id);
  await motoresRepository.update(id, data);
  res.json(await motoresRepository.findById(id));
}

async function remove(req, res) {
  const removed = await motoresRepository.remove(parseId(req.params.id));
  if (!removed) throw new HttpError(404, 'Motor não encontrado');
  res.status(204).end();
}

module.exports = { list, getById, create, update, remove };
