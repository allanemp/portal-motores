// Ids vêm da URL; qualquer coisa que não seja inteiro positivo
// não pode existir no banco, então é tratada como "não encontrado".
function idValido(id) {
  return Number.isInteger(id) && id > 0;
}

module.exports = { idValido };
