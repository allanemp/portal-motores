const { FREQUENCIAS_VALIDAS, POLOS_VALIDOS } = require('../../../domain/motor/Motor');

// Especificação OpenAPI 3 da API, servida pelo Swagger UI em /api/docs
// (e em JSON puro em /api/docs.json).
// As opções de frequência e polos vêm do domínio, para a doc não divergir das regras.

const idParam = {
  name: 'id',
  in: 'path',
  required: true,
  description: 'Id do motor',
  schema: { type: 'integer', minimum: 1 },
  example: 1,
};

const respostas = {
  validacao: {
    description: 'Dados inválidos',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErroValidacao' },
        example: { error: 'Dados inválidos', details: ['potencia_cv deve ser maior que zero'] },
      },
    },
  },
  naoEncontrado: {
    description: 'Motor não encontrado',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/Erro' },
        example: { error: 'Motor não encontrado' },
      },
    },
  },
  conflito: {
    description: 'Já existe outro motor com o mesmo código',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/Erro' },
        example: { error: 'Código já cadastrado' },
      },
    },
  },
  motor: (description) => ({
    description,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/Motor' } } },
  }),
};

const corpoMotor = {
  required: true,
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/MotorInput' },
      example: {
        codigo: 'WEG-W22-030',
        modelo: 'W22 IR3 Premium 30 cv',
        fabricante_id: 1,
        potencia_cv: 30,
        tensao: '380/660V',
        frequencia_hz: 60,
        polos: 4,
        rotacao_rpm: 1770,
        carcaca: '200L',
        grau_protecao: 'IP55',
        preco: 15900.0,
      },
    },
  },
};

const openApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'Portal de Motores Elétricos — API',
    version: '1.0.0',
    description:
      'API REST para cadastro de motores elétricos e consulta de fabricantes.\n\n' +
      'Erros seguem o formato `{ "error": "...", "details": [...] }` (details só em 400).',
  },
  servers: [{ url: '/api', description: 'Esta API (mesma origem do Swagger UI)' }],
  // A API não tem autenticação (fora do escopo do teste).
  security: [],
  tags: [
    { name: 'Motores', description: 'CRUD de motores elétricos' },
    { name: 'Fabricantes', description: 'Fabricantes disponíveis para o cadastro' },
    { name: 'Health', description: 'Situação da API e do banco' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        operationId: 'verificarSaude',
        summary: 'Verifica a API e a conexão com o banco',
        responses: {
          200: {
            description: 'API e banco funcionando',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Health' },
                example: { status: 'ok', database: 'ok' },
              },
            },
          },
          503: {
            description: 'Banco indisponível',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Health' },
                example: { status: 'error', database: 'error' },
              },
            },
          },
        },
      },
    },
    '/fabricantes': {
      get: {
        tags: ['Fabricantes'],
        operationId: 'listarFabricantes',
        summary: 'Lista os fabricantes (ordenados por nome)',
        responses: {
          200: {
            description: 'Lista de fabricantes',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Fabricante' } },
              },
            },
          },
        },
      },
    },
    '/motores': {
      get: {
        tags: ['Motores'],
        operationId: 'listarMotores',
        summary: 'Lista os motores, com busca opcional',
        parameters: [
          {
            name: 'search',
            in: 'query',
            required: false,
            description: 'Filtra por trecho do código **ou** do modelo (sem diferenciar maiúsculas).',
            schema: { type: 'string' },
            example: 'W22',
          },
        ],
        responses: {
          200: {
            description: 'Lista de motores (vazia se nada for encontrado)',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Motor' } },
              },
            },
          },
        },
      },
      post: {
        tags: ['Motores'],
        operationId: 'criarMotor',
        summary: 'Cadastra um motor',
        requestBody: corpoMotor,
        responses: {
          201: respostas.motor('Motor criado (com id gerado)'),
          400: respostas.validacao,
          409: respostas.conflito,
        },
      },
    },
    '/motores/{id}': {
      parameters: [idParam],
      get: {
        tags: ['Motores'],
        operationId: 'buscarMotor',
        summary: 'Busca um motor pelo id',
        responses: {
          200: respostas.motor('Motor encontrado'),
          404: respostas.naoEncontrado,
        },
      },
      put: {
        tags: ['Motores'],
        operationId: 'atualizarMotor',
        summary: 'Atualiza um motor (envia todos os campos)',
        requestBody: corpoMotor,
        responses: {
          200: respostas.motor('Motor atualizado'),
          400: respostas.validacao,
          404: respostas.naoEncontrado,
          409: respostas.conflito,
        },
      },
      delete: {
        tags: ['Motores'],
        operationId: 'excluirMotor',
        summary: 'Exclui um motor',
        responses: {
          204: { description: 'Motor excluído (sem corpo)' },
          404: respostas.naoEncontrado,
        },
      },
    },
  },
  components: {
    schemas: {
      Health: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['ok', 'error'] },
          database: { type: 'string', enum: ['ok', 'error'] },
        },
      },
      Fabricante: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          nome: { type: 'string', example: 'WEG' },
        },
      },
      MotorInput: {
        type: 'object',
        required: ['codigo', 'modelo', 'fabricante_id', 'potencia_cv', 'tensao', 'frequencia_hz', 'polos', 'rotacao_rpm'],
        properties: {
          codigo: { type: 'string', maxLength: 30, description: 'Único entre os motores' },
          modelo: { type: 'string', maxLength: 80 },
          fabricante_id: { type: 'integer', minimum: 1, description: 'Precisa existir em /fabricantes' },
          potencia_cv: { type: 'number', exclusiveMinimum: 0, maximum: 999999.99 },
          tensao: { type: 'string', maxLength: 30, example: '220/380V' },
          frequencia_hz: { type: 'integer', enum: FREQUENCIAS_VALIDAS },
          polos: { type: 'integer', enum: POLOS_VALIDOS },
          rotacao_rpm: { type: 'integer', minimum: 1, maximum: 100000 },
          carcaca: { type: ['string', 'null'], maxLength: 20, example: '132M' },
          grau_protecao: { type: ['string', 'null'], maxLength: 10, example: 'IP55' },
          preco: { type: ['number', 'null'], minimum: 0 },
        },
      },
      Motor: {
        allOf: [
          { $ref: '#/components/schemas/MotorInput' },
          {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              fabricante_nome: { type: 'string', example: 'WEG' },
              criado_em: { type: 'string', format: 'date-time' },
            },
          },
        ],
      },
      Erro: {
        type: 'object',
        properties: { error: { type: 'string' } },
      },
      ErroValidacao: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Dados inválidos' },
          details: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
};

module.exports = { openApiSpec };
