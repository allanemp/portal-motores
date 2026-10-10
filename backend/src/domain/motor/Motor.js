const { ValidationError } = require('../shared/errors');
const { isEmpty, toNumber } = require('../shared/conversores');

const FREQUENCIAS_VALIDAS = [50, 60];
const POLOS_VALIDOS = [2, 4, 6, 8];

const LIMITES = {
  codigo: 30,
  modelo: 80,
  tensao: 30,
  carcaca: 20,
  grau_protecao: 10,
  potenciaMax: 999999.99, // DECIMAL(8,2)
  precoMax: 9999999999.99, // DECIMAL(12,2)
  rotacaoMax: 100000,
};

// Entidade Motor: concentra as invariantes do negócio.
// Só é possível obter um Motor através de Motor.criar(), que garante
// que todo Motor existente em memória é válido.
class Motor {
  constructor(props) {
    this.id = props.id ?? null;
    this.codigo = props.codigo;
    this.modelo = props.modelo;
    this.fabricanteId = props.fabricanteId;
    this.potenciaCv = props.potenciaCv;
    this.tensao = props.tensao;
    this.frequenciaHz = props.frequenciaHz;
    this.polos = props.polos;
    this.rotacaoRpm = props.rotacaoRpm;
    this.carcaca = props.carcaca;
    this.grauProtecao = props.grauProtecao;
    this.preco = props.preco;
    Object.freeze(this);
  }

  // Recebe os dados crus (formato da API, snake_case), valida e normaliza.
  // Lança ValidationError com TODAS as mensagens de uma vez.
  static criar(dados, id = null) {
    const erros = [];

    if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
      throw new ValidationError(['corpo da requisição deve ser um objeto JSON']);
    }

    const props = {
      id,
      codigo: textoObrigatorio(dados, 'codigo', LIMITES.codigo, erros),
      modelo: textoObrigatorio(dados, 'modelo', LIMITES.modelo, erros),
      tensao: textoObrigatorio(dados, 'tensao', LIMITES.tensao, erros),
      carcaca: textoOpcional(dados, 'carcaca', LIMITES.carcaca, erros),
      grauProtecao: textoOpcional(dados, 'grau_protecao', LIMITES.grau_protecao, erros),
      fabricanteId: validarFabricanteId(dados.fabricante_id, erros),
      potenciaCv: validarPotencia(dados.potencia_cv, erros),
      frequenciaHz: validarOpcao(dados.frequencia_hz, FREQUENCIAS_VALIDAS, 'frequencia_hz deve ser 50 ou 60', erros),
      polos: validarOpcao(dados.polos, POLOS_VALIDOS, 'polos deve ser 2, 4, 6 ou 8', erros),
      rotacaoRpm: validarRotacao(dados.rotacao_rpm, erros),
      preco: validarPreco(dados.preco, erros),
    };

    if (erros.length > 0) throw new ValidationError(erros);
    return new Motor(props);
  }
}

function textoObrigatorio(dados, campo, max, erros) {
  const valor = dados[campo];
  if (isEmpty(valor)) {
    erros.push(`${campo} é obrigatório`);
    return null;
  }
  return validarTexto(valor, campo, max, erros);
}

function textoOpcional(dados, campo, max, erros) {
  const valor = dados[campo];
  if (isEmpty(valor)) return null;
  return validarTexto(valor, campo, max, erros);
}

function validarTexto(valor, campo, max, erros) {
  if (typeof valor !== 'string') {
    erros.push(`${campo} deve ser um texto`);
    return null;
  }
  const texto = valor.trim();
  if (texto.length > max) erros.push(`${campo} deve ter no máximo ${max} caracteres`);
  return texto;
}

function validarFabricanteId(valor, erros) {
  if (isEmpty(valor)) {
    erros.push('fabricante_id é obrigatório');
    return null;
  }
  const id = toNumber(valor);
  if (!Number.isInteger(id) || id <= 0) {
    erros.push('fabricante_id deve ser um número inteiro válido');
    return null;
  }
  return id;
}

function validarPotencia(valor, erros) {
  if (isEmpty(valor)) {
    erros.push('potencia_cv é obrigatório');
    return null;
  }
  const potencia = toNumber(valor);
  if (Number.isNaN(potencia)) erros.push('potencia_cv deve ser um número');
  else if (potencia <= 0) erros.push('potencia_cv deve ser maior que zero');
  else if (potencia > LIMITES.potenciaMax) erros.push(`potencia_cv deve ser no máximo ${LIMITES.potenciaMax}`);
  return potencia;
}

function validarOpcao(valor, opcoes, mensagem, erros) {
  const numero = toNumber(valor);
  if (!opcoes.includes(numero)) erros.push(mensagem);
  return numero;
}

function validarRotacao(valor, erros) {
  if (isEmpty(valor)) {
    erros.push('rotacao_rpm é obrigatório');
    return null;
  }
  const rotacao = toNumber(valor);
  if (!Number.isInteger(rotacao)) erros.push('rotacao_rpm deve ser um número inteiro');
  else if (rotacao <= 0) erros.push('rotacao_rpm deve ser maior que zero');
  else if (rotacao > LIMITES.rotacaoMax) erros.push(`rotacao_rpm deve ser no máximo ${LIMITES.rotacaoMax}`);
  return rotacao;
}

function validarPreco(valor, erros) {
  if (isEmpty(valor)) return null;
  const preco = toNumber(valor);
  if (Number.isNaN(preco)) erros.push('preco deve ser um número');
  else if (preco < 0) erros.push('preco não pode ser negativo');
  else if (preco > LIMITES.precoMax) erros.push(`preco deve ser no máximo ${LIMITES.precoMax}`);
  return preco;
}

module.exports = { Motor, FREQUENCIAS_VALIDAS, POLOS_VALIDOS };
