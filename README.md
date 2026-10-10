# Portal de Motores Elétricos

Cadastro de motores elétricos com listagem, busca, criação, edição e exclusão.

- **API REST** em Node.js 22 + Express 5 + MySQL 8.4 (driver `mysql2`), validação com **Zod**
- **Front-end** em Angular 22 (standalone components, Reactive Forms, signals)
- **Docker Compose** sobe banco, API e front com um único comando

## Como subir

Pré-requisito: Docker com Docker Compose v2.

```bash
git clone <url-do-repositorio>
cd portal-motores
docker compose up -d --build
```

Não é preciso criar `.env`: o `docker-compose.yml` tem valores padrão para todas as variáveis.
Na primeira subida o MySQL cria as tabelas e carrega o seed (3 fabricantes e 12 motores).
A API só sobe depois que o banco estiver pronto (healthcheck), e o front só depois da API.

Acompanhar até tudo ficar `healthy`:

```bash
docker compose ps
```

Depois acesse **http://localhost:4200**.

### Como parar

```bash
docker compose down        # para e remove os containers (os dados ficam no volume)
docker compose down -v     # também apaga o volume: na próxima subida o seed é recarregado
```

### Portas

| Serviço            | URL / porta                     |
| ------------------ | ------------------------------- |
| Front-end Angular  | http://localhost:4200           |
| API Node           | http://localhost:3000/api       |
| MySQL              | localhost:3306                  |

### Variáveis de ambiente (opcional)

Para trocar algum valor, copie `.env.example` para `.env` e edite. O `.env` está no `.gitignore`.

| Variável           | Padrão                  | Uso                               |
| ------------------ | ----------------------- | --------------------------------- |
| `DB_NAME`          | `motores`               | nome do banco                     |
| `DB_USER`          | `motores`               | usuário da aplicação              |
| `DB_PASSWORD`      | `motores_dev`           | senha do usuário da aplicação     |
| `DB_ROOT_PASSWORD` | `root_dev`              | senha do root do MySQL            |
| `API_PORT`         | `3000`                  | porta publicada da API no host    |
| `CORS_ORIGIN`      | `http://localhost:4200` | origem liberada no CORS           |

## API

Base: `http://localhost:3000/api`

| Método | Rota                     | Retorno                                                 |
| ------ | ------------------------ | ------------------------------------------------------- |
| GET    | `/health`                | 200 `{ "status": "ok", "database": "ok" }` (503 se o banco cair) |
| GET    | `/fabricantes`           | 200 array de fabricantes                                |
| GET    | `/motores`               | 200 array de motores (com `fabricante_nome`)            |
| GET    | `/motores?search=texto`  | 200 array filtrado por código **ou** modelo             |
| GET    | `/motores/:id`           | 200 motor ou 404                                        |
| POST   | `/motores`               | 201 motor criado (com `id`)                             |
| PUT    | `/motores/:id`           | 200 motor atualizado, ou 404                            |
| DELETE | `/motores/:id`           | 204, ou 404                                             |

Erros:

- **400** validação: `{ "error": "Dados inválidos", "details": ["potencia_cv deve ser maior que zero"] }`
- **404** não encontrado: `{ "error": "Motor não encontrado" }`
- **409** código duplicado: `{ "error": "Código já cadastrado" }`

Exemplo:

```bash
curl -X POST http://localhost:3000/api/motores \
  -H 'Content-Type: application/json' \
  -d '{"codigo":"WEG-NOVO","modelo":"W22","fabricante_id":1,"potencia_cv":10,
       "tensao":"220/380V","frequencia_hz":60,"polos":4,"rotacao_rpm":1760}'
```

### Regras de validação (no servidor)

| Campo           | Regra                                            |
| --------------- | ------------------------------------------------ |
| `codigo`        | obrigatório, único, até 30 caracteres            |
| `modelo`        | obrigatório, até 80 caracteres                   |
| `fabricante_id` | obrigatório, inteiro, precisa existir            |
| `potencia_cv`   | obrigatório, maior que zero                      |
| `tensao`        | obrigatório, até 30 caracteres                   |
| `frequencia_hz` | 50 ou 60                                         |
| `polos`         | 2, 4, 6 ou 8                                     |
| `rotacao_rpm`   | inteiro maior que zero                           |
| `carcaca`, `grau_protecao`, `preco` | opcionais; `preco` não pode ser negativo |

Números podem vir como número ou string numérica (`"10.5"`); textos são aparados (`trim`).
Todas as mensagens de erro de formato são devolvidas de uma vez em `details`.

## Estrutura

```
├── docker-compose.yml
├── .env.example
├── database/init/          # 01-schema.sql e 02-seed.sql (executados pelo MySQL na 1ª subida)
├── backend/
│   ├── src/
│   │   ├── domain/         # entidade Motor, schema Zod, erros e contratos de repositório
│   │   ├── application/    # casos de uso (ListarMotores, CriarMotor, ...)
│   │   ├── infrastructure/ # MySQL: pool, repositórios, config por env
│   │   ├── interfaces/http/# Express: app, rotas, controllers, tratamento de erros
│   │   ├── container.js    # composition root (injeção de dependência)
│   │   └── server.js
│   └── test/
└── frontend/src/app/
    ├── core/               # models e services HTTP (únicos que usam HttpClient)
    ├── shared/toast/       # avisos de sucesso/erro
    └── features/motores/   # página, tabela e formulário
```

## Decisões

**Arquitetura do back-end (DDD / Clean Architecture / SOLID).** As dependências apontam para dentro:
`interfaces/http → application → domain`, e `infrastructure` implementa os contratos do domínio.

- *Domínio*: a entidade `Motor` só pode ser criada por `Motor.criar()`, que valida com o schema Zod — todo `Motor` em memória é válido. Os erros (`ValidationError`, `NotFoundError`, `ConflictError`) não conhecem HTTP.
- *Aplicação*: um caso de uso por operação (responsabilidade única). Regras que dependem do banco (fabricante existe, código único) ficam em `RegrasCadastroMotor`, compartilhada por criar e editar.
- *Inversão de dependência*: casos de uso recebem repositórios pelo construtor e dependem dos contratos `MotorRepository`/`FabricanteRepository`. Em produção o `container.js` injeta as implementações MySQL; nos testes, implementações em memória — por isso os testes de rota rodam sem banco.
- *Interface HTTP*: controllers finos, só traduzem req/res. O `errorHandler` é o único lugar que transforma erro de domínio em status (400/404/409/500).
- Leituras devolvem um objeto de consulta já no formato da API (com `fabricante_nome` via JOIN); escritas usam a entidade. É uma separação simples entre leitura e escrita, sem criar uma entidade só para exibição.
- O Zod fica no domínio: é uma biblioteca pura (sem I/O), e o schema descreve as invariantes do motor. As mensagens são customizadas para seguir o contrato (`"campo deve ..."`).

**Segurança.**
- Todo SQL usa placeholders `?` do `mysql2`; nada vindo da requisição é concatenado.
- Na busca, os curingas do `LIKE` (`%`, `_`, `\`) são escapados: buscar `%` procura o caractere literal, não "tudo".
- Erros 500 não expõem detalhes (ficam só no log). `x-powered-by` desligado. Container da API roda como usuário `node`.
- CORS liberado apenas para `http://localhost:4200`.

**Credenciais.** O enunciado exige subir sem `.env`, então o compose tem valores padrão (`${DB_PASSWORD:-motores_dev}`), iguais aos do `.env.example`. São senhas de **desenvolvimento local**, nunca estão no código da aplicação (a API lê tudo de `process.env`) e podem ser sobrescritas criando um `.env`. Em produção, o caminho seria remover os padrões e usar um gerenciador de segredos.

**Banco e inicialização.**
- Schema exatamente como o enunciado, sem ajustes.
- Schema e seed via `/docker-entrypoint-initdb.d` (rodam só com volume vazio; `down -v` reseta).
- Healthcheck com `mysqladmin ping` via TCP: durante a inicialização o MySQL roda sem rede, então o serviço só fica `healthy` depois que o seed terminou. A API usa `depends_on: service_healthy` **e** tem retentativa de conexão no código, para funcionar também fora do Docker.
- `decimalNumbers: true` no driver, para `potencia_cv`/`preco` saírem como número no JSON.
- Código duplicado: checagem antes de gravar (mensagem clara) + a `UNIQUE KEY` como garantia final em caso de concorrência (`ER_DUP_ENTRY` → 409).

**API.**
- `:id` que não é inteiro positivo (ex.: `/motores/abc`) devolve 404: não existe motor com esse id.
- `DELETE` devolve 204 (sem corpo).
- Express 5, que encaminha erros de funções `async` para o handler sem `try/catch` em cada rota.

**Front-end.**
- Tela única: busca + botão "Novo motor" + formulário (abre acima da tabela) + tabela.
- Busca com `debounceTime(300)` e `switchMap` (cancela a requisição anterior enquanto o usuário digita).
- Página "inteligente" (`MotoresPage`) e tabela de apresentação (`MotoresTable`, só recebe dados e emite eventos).
- O formulário repete as regras do servidor para dar retorno imediato, mas o servidor continua sendo a validação de verdade. Erros do servidor voltam para o campo correspondente (ex.: 409 marca o campo código).
- Estados: carregando, lista vazia ("Nenhum motor encontrado"), erro de conexão com botão de tentar de novo, botão de salvar/excluir desabilitado durante a requisição.
- Exclusão com `confirm()` nativo do navegador: simples e suficiente para o escopo.
- Em Docker o front é compilado e servido por nginx (em vez de `ng serve`): sobe mais rápido e é como iria para produção.

## Testes (back-end)

```bash
cd backend
npm install
npm test
```

Cobrem a entidade (regras de validação), todas as rotas HTTP com repositórios em memória (CRUD, 400/404/409, JSON malformado, CORS, health com banco fora) e a parametrização do SQL de busca.

## Desenvolvimento sem Docker (opcional)

```bash
# com um MySQL rodando e o schema/seed aplicados
cd backend && npm install
DB_HOST=localhost DB_USER=motores DB_PASSWORD=motores_dev DB_NAME=motores npm run dev

cd frontend && npm install && npm start   # http://localhost:4200
```
