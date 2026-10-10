// Validação do corpo de criação/edição de motor.
// Função pura (não acessa o banco): recebe o body e devolve
// { errors: [...mensagens], data: {...valores normalizados} }.
// Regras que dependem do banco (fabricante existe, código único) ficam no controller.

const FREQUENCIAS = [50, 60];
const POLOS = [2, 4, 6, 8];

// Aceita número ou string numérica ("10.5"); qualquer outra coisa vira NaN.
function toNumber(value) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim() !== '') return Number(value);
  return NaN;
}

function isEmpty(value) {
  return value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
}

function requiredText(body, field, maxLength, errors) {
  const value = body[field];
  if (isEmpty(value)) {
    errors.push(`${field} é obrigatório`);
    return undefined;
  }
  if (typeof value !== 'string') {
    errors.push(`${field} deve ser um texto`);
    return undefined;
  }
  const text = value.trim();
  if (text.length > maxLength) errors.push(`${field} deve ter no máximo ${maxLength} caracteres`);
  return text;
}

function optionalText(body, field, maxLength, errors) {
  const value = body[field];
  if (isEmpty(value)) return null;
  if (typeof value !== 'string') {
    errors.push(`${field} deve ser um texto`);
    return null;
  }
  const text = value.trim();
  if (text.length > maxLength) errors.push(`${field} deve ter no máximo ${maxLength} caracteres`);
  return text;
}

function validateMotor(body) {
  const errors = [];
  const data = {};

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { errors: ['corpo da requisição deve ser um objeto JSON'], data };
  }

  data.codigo = requiredText(body, 'codigo', 30, errors);
  data.modelo = requiredText(body, 'modelo', 80, errors);
  data.tensao = requiredText(body, 'tensao', 30, errors);
  data.carcaca = optionalText(body, 'carcaca', 20, errors);
  data.grau_protecao = optionalText(body, 'grau_protecao', 10, errors);

  const fabricanteId = toNumber(body.fabricante_id);
  if (isEmpty(body.fabricante_id)) {
    errors.push('fabricante_id é obrigatório');
  } else if (!Number.isInteger(fabricanteId) || fabricanteId <= 0) {
    errors.push('fabricante_id deve ser um número inteiro válido');
  }
  data.fabricante_id = fabricanteId;

  const potencia = toNumber(body.potencia_cv);
  if (isEmpty(body.potencia_cv)) {
    errors.push('potencia_cv é obrigatório');
  } else if (Number.isNaN(potencia)) {
    errors.push('potencia_cv deve ser um número');
  } else if (potencia <= 0) {
    errors.push('potencia_cv deve ser maior que zero');
  } else if (potencia > 999999.99) {
    errors.push('potencia_cv deve ser no máximo 999999.99');
  }
  data.potencia_cv = potencia;

  const frequencia = toNumber(body.frequencia_hz);
  if (!FREQUENCIAS.includes(frequencia)) {
    errors.push('frequencia_hz deve ser 50 ou 60');
  }
  data.frequencia_hz = frequencia;

  const polos = toNumber(body.polos);
  if (!POLOS.includes(polos)) {
    errors.push('polos deve ser 2, 4, 6 ou 8');
  }
  data.polos = polos;

  const rotacao = toNumber(body.rotacao_rpm);
  if (isEmpty(body.rotacao_rpm)) {
    errors.push('rotacao_rpm é obrigatório');
  } else if (!Number.isInteger(rotacao)) {
    errors.push('rotacao_rpm deve ser um número inteiro');
  } else if (rotacao <= 0) {
    errors.push('rotacao_rpm deve ser maior que zero');
  } else if (rotacao > 100000) {
    errors.push('rotacao_rpm deve ser no máximo 100000');
  }
  data.rotacao_rpm = rotacao;

  if (isEmpty(body.preco)) {
    data.preco = null;
  } else {
    const preco = toNumber(body.preco);
    if (Number.isNaN(preco)) {
      errors.push('preco deve ser um número');
    } else if (preco < 0) {
      errors.push('preco não pode ser negativo');
    } else if (preco > 9999999999.99) {
      errors.push('preco deve ser no máximo 9999999999.99');
    }
    data.preco = preco;
  }

  return { errors, data };
}

module.exports = { validateMotor };
