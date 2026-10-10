const { z } = require('zod');
const { isEmpty, toNumber } = require('../shared/conversores');

// Schema Zod com as regras de formato do motor.
// O "preprocess" normaliza a entrada antes da validação:
// textos são aparados (trim), números aceitam string numérica ("10.5")
// e vazios viram undefined (obrigatório) ou null (opcional).

const FREQUENCIAS_VALIDAS = [50, 60];
const POLOS_VALIDOS = [2, 4, 6, 8];

const paraTexto = (v) => (typeof v === 'string' ? v.trim() : v);
const paraNumero = (v) => (isEmpty(v) ? undefined : toNumber(v));
const paraNumeroOuNull = (v) => (isEmpty(v) ? null : toNumber(v));
const paraTextoOuNull = (v) => (isEmpty(v) ? null : paraTexto(v));

// Mensagem de tipo inválido: "obrigatório" se o valor não veio, senão a mensagem de formato.
const tipoInvalido = (campo, mensagemFormato) => (issue) =>
  issue.input === undefined || issue.input === null ? `${campo} é obrigatório` : mensagemFormato;

function textoObrigatorio(campo, max) {
  return z.preprocess(
    paraTexto,
    z
      .string({ error: tipoInvalido(campo, `${campo} deve ser um texto`) })
      .min(1, `${campo} é obrigatório`)
      .max(max, `${campo} deve ter no máximo ${max} caracteres`),
  );
}

function textoOpcional(campo, max) {
  return z.preprocess(
    paraTextoOuNull,
    z
      .string({ error: `${campo} deve ser um texto` })
      .max(max, `${campo} deve ter no máximo ${max} caracteres`)
      .nullable(),
  );
}

function numeroObrigatorio(campo) {
  return z.number({ error: tipoInvalido(campo, `${campo} deve ser um número`) });
}

function umaDasOpcoes(campo, opcoes, mensagem) {
  return z.preprocess(
    paraNumero,
    z.number({ error: mensagem }).refine((v) => opcoes.includes(v), mensagem),
  );
}

const motorSchema = z.object(
  {
    codigo: textoObrigatorio('codigo', 30),
    modelo: textoObrigatorio('modelo', 80),
    fabricante_id: z.preprocess(
      paraNumero,
      numeroObrigatorio('fabricante_id')
        .int('fabricante_id deve ser um número inteiro válido')
        .positive('fabricante_id deve ser um número inteiro válido'),
    ),
    potencia_cv: z.preprocess(
      paraNumero,
      numeroObrigatorio('potencia_cv')
        .gt(0, 'potencia_cv deve ser maior que zero')
        .max(999999.99, 'potencia_cv deve ser no máximo 999999.99'), // DECIMAL(8,2)
    ),
    tensao: textoObrigatorio('tensao', 30),
    frequencia_hz: umaDasOpcoes('frequencia_hz', FREQUENCIAS_VALIDAS, 'frequencia_hz deve ser 50 ou 60'),
    polos: umaDasOpcoes('polos', POLOS_VALIDOS, 'polos deve ser 2, 4, 6 ou 8'),
    rotacao_rpm: z.preprocess(
      paraNumero,
      numeroObrigatorio('rotacao_rpm')
        .int('rotacao_rpm deve ser um número inteiro')
        .gt(0, 'rotacao_rpm deve ser maior que zero')
        .max(100000, 'rotacao_rpm deve ser no máximo 100000'),
    ),
    carcaca: textoOpcional('carcaca', 20),
    grau_protecao: textoOpcional('grau_protecao', 10),
    preco: z.preprocess(
      paraNumeroOuNull,
      z
        .number({ error: 'preco deve ser um número' })
        .min(0, 'preco não pode ser negativo')
        .max(9999999999.99, 'preco deve ser no máximo 9999999999.99') // DECIMAL(12,2)
        .nullable(),
    ),
  },
  { error: 'corpo da requisição deve ser um objeto JSON' },
);

module.exports = { motorSchema, FREQUENCIAS_VALIDAS, POLOS_VALIDOS };
