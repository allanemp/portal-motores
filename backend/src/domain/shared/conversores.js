// Helpers puros usados pelas entidades para normalizar a entrada.

function isEmpty(value) {
  return value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
}

// Aceita número ou string numérica ("10.5"); qualquer outra coisa vira NaN.
function toNumber(value) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim() !== '') return Number(value);
  return NaN;
}

module.exports = { isEmpty, toNumber };
