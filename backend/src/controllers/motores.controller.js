const motoresRepository = require('../repositories/motores.repository');
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

module.exports = { list, getById };
