<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="80" alt="Nest Logo" /></a>
</p>

# FinTrack API

Sistema de organização financeira pessoal com integração ao **Open Finance Brasil** via [Pluggy](https://pluggy.ai) e assistente de IA via **Google Gemini 2.0 Flash**.

## Stack

| Tecnologia | Versão | Uso |
|---|---|---|
| NestJS | 11 | Framework REST API |
| TypeScript | 5.9 (strict) | Linguagem |
| PostgreSQL | 16 | Banco de dados |
| Prisma | 7.8 | ORM |
| Redis | 7 | Filas de jobs |
| BullMQ | 5 | Processamento assíncrono |
| Pluggy SDK | 0.85 | Agregador Open Finance |
| Google Gemini 2.0 Flash | — | IA generativa (gratuito) |
| JWT + Passport | — | Autenticação |
| Docker Compose | — | Infraestrutura local |

## Arquitetura

```
src/
├── shared/                    # SharedKernel (DDD)
│   ├── domain/               # Entity, AggregateRoot, ValueObject, Either
│   └── infrastructure/       # PrismaService, QueueModule, GlobalExceptionFilter
└── modules/
    ├── identity/             # Usuários e autenticação
    ├── banking/              # Conexões bancárias (Pluggy)
    ├── financial/            # Transações e relatórios
    ├── budgeting/            # Orçamentos por categoria
    ├── goals/                # Metas financeiras
    ├── financing/            # Simulação de financiamentos
    └── ai-assistant/         # Chat e insights com Gemini
```

Cada módulo segue **DDD + Clean Architecture**:
```
módulo/
├── domain/          # Entidades, Value Objects, repositórios (interfaces)
├── application/     # Use Cases, DTOs, ports (interfaces de adapters)
└── infrastructure/  # Repositórios Prisma, adapters externos, controllers HTTP
```

---

## Setup

### Pré-requisitos

- Node.js 20+
- Docker Desktop

### Instalação

```bash
git clone <repo>
cd fintrack-api
npm install
```

### Variáveis de ambiente

Copie o `.env` e preencha as credenciais:

```env
DATABASE_URL="postgresql://fintrack:fintrack_pass@localhost:5433/fintrack"
REDIS_URL="redis://localhost:6380"

JWT_SECRET="troque-por-string-longa-e-aleatória"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_EXPIRES_IN="30d"

# Obtidos no dashboard do Pluggy (https://dashboard.pluggy.ai)
PLUGGY_CLIENT_ID=""
PLUGGY_CLIENT_SECRET=""
PLUGGY_WEBHOOK_SECRET=""

# Obtido no Google AI Studio (https://aistudio.google.com) — gratuito
GEMINI_API_KEY=""

PORT=3000
NODE_ENV=development
```

### Subir infraestrutura

```bash
docker-compose up -d                    # PostgreSQL (5433) + Redis (6380)
npx prisma migrate dev --name init      # Criar tabelas
npm run start:dev                       # API em modo watch
```

A API sobe em `http://localhost:3000`
Swagger UI disponível em **`http://localhost:3000/docs`**

---

## Autenticação

Todos os endpoints (exceto `/auth/register` e `/auth/login`) requerem JWT.

**Fluxo:**
1. `POST /api/v1/auth/register` → cria conta
2. `POST /api/v1/auth/login` → obtém `accessToken` (7 dias) e `refreshToken` (30 dias)
3. Adicione o header: `Authorization: Bearer {accessToken}`

---

## Endpoints

### Prefixo global: `/api/v1`

---

### 🔐 Auth — `/auth`

> Sem autenticação necessária

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/auth/register` | Registrar novo usuário |
| `POST` | `/auth/login` | Autenticar e obter tokens |

#### `POST /auth/register`

Cria uma nova conta. Retorna `accessToken` e `refreshToken`.

```json
// Body
{
  "email": "joao@email.com",
  "name": "João Silva",
  "password": "MinhaSenh@123"
}

// Response 201
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci..."
}
```

#### `POST /auth/login`

```json
// Body
{
  "email": "joao@email.com",
  "password": "MinhaSenh@123"
}

// Response 200
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci..."
}
```

---

### 🏦 Banking — `/connections`

> Requer autenticação JWT

Integração com bancos via **Pluggy** (Open Finance Brasil autorizado pelo Banco Central).

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/connections` | Registrar conexão bancária |
| `POST` | `/connections/webhook` | Receber eventos do Pluggy |

#### `POST /connections`

Após o usuário autorizar o acesso pelo **widget do Pluggy**, registre o `itemId` retornado. A sincronização de contas e transações ocorre automaticamente em background via fila BullMQ.

```json
// Body
{
  "itemId": "abc-123-pluggy-item-id"
}

// Response 201
{
  "id": "uuid",
  "userId": "uuid",
  "itemId": "abc-123-pluggy-item-id",
  "status": "PENDING"
}
```

#### `POST /connections/webhook`

Endpoint chamado automaticamente pelo Pluggy quando há atualização nos dados bancários. No evento `item/updated`, dispara re-sincronização de transações.

```json
// Body (enviado pelo Pluggy)
{
  "event": "item/updated",
  "itemId": "abc-123-pluggy-item-id"
}

// Response 200
{ "received": true }
```

---

### 💳 Financial — `/transactions`

> Requer autenticação JWT

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/transactions` | Listar transações (paginado + filtros) |
| `GET` | `/transactions/report` | Relatório de gastos por categoria |

#### `GET /transactions`

Query params opcionais: `page` (padrão: 1), `limit` (padrão: 20), `from` (ISO 8601), `to` (ISO 8601).

```
GET /transactions?page=1&limit=5&from=2026-06-01
```

#### `GET /transactions/report`

Agrupa transações por categoria. Padrão: mês atual.

```json
// Response 200
{
  "totalIncome": 5000.00,
  "totalExpenses": 3200.50,
  "categories": [
    { "categoryId": "uuid", "name": "Alimentação", "total": 850.00, "count": 12 },
    { "categoryId": "uuid", "name": "Transporte", "total": 420.00, "count": 8 }
  ]
}
```

---

### 💰 Budgeting — `/budgets`

> Requer autenticação JWT

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/budgets` | Criar orçamento por categoria |
| `GET` | `/budgets` | Listar orçamentos |
| `DELETE` | `/budgets/:id` | Excluir orçamento |

#### `POST /budgets`

```json
// Body
{
  "categoryId": "uuid-da-categoria",
  "limitAmount": 500.00,
  "period": "MONTHLY",
  "startDate": "2026-06-01"
}
```

`period`: `"MONTHLY"` | `"WEEKLY"` | `"YEARLY"`

---

### 🎯 Goals — `/goals`

> Requer autenticação JWT

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/goals` | Criar meta financeira |
| `GET` | `/goals` | Listar metas com % de progresso |

#### `POST /goals`

```json
// Body
{
  "name": "Reserva de Emergência",
  "type": "EMERGENCY_FUND",
  "targetAmount": 30000.00,
  "deadline": "2027-12-31"
}
```

`type`: `"EMERGENCY_FUND"` | `"TRAVEL"` | `"PROPERTY"` | `"VEHICLE"` | `"OTHER"`

#### `GET /goals`

```json
// Response 200
[
  {
    "id": "uuid",
    "name": "Reserva de Emergência",
    "type": "EMERGENCY_FUND",
    "targetAmount": 30000.00,
    "currentAmount": 8500.00,
    "progressPercentage": 28.33,
    "deadline": "2027-12-31T00:00:00.000Z"
  }
]
```

---

### 🏠 Financing — `/financing`

> Requer autenticação JWT

Simulação de financiamentos imobiliários com tabelas SAC e PRICE.

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/financing/simulations` | Criar simulação (persiste parcelas) |
| `GET` | `/financing/simulations` | Listar simulações |
| `GET` | `/financing/simulations/:id/installments` | Ver parcelas mês a mês |
| `POST` | `/financing/compare` | Comparar SAC vs PRICE (sem persistir) |

#### `POST /financing/simulations`

```json
// Body
{
  "name": "Apartamento Centro",
  "propertyValue": 500000.00,
  "downPayment": 100000.00,
  "loanMonths": 360,
  "monthlyRate": 0.8,
  "amortizationType": "SAC"
}
```

`amortizationType`: `"SAC"` | `"PRICE"`

**SAC** (Sistema de Amortização Constante): parcelas decrescentes, amortização fixa.
**PRICE** (Tabela PRICE): parcelas fixas, juros maiores no início.

#### `POST /financing/compare`

```json
// Body
{
  "loanAmount": 400000.00,
  "monthlyRate": 0.8,
  "months": 360
}

// Response 200
{
  "sac": { "totalPaid": 685432.10, "totalInterest": 285432.10 },
  "price": { "totalPaid": 724810.50, "totalInterest": 324810.50 },
  "recommendation": "SAC",
  "savings": 39378.40
}
```

---

### 🤖 AI Assistant — `/ai`

> Requer autenticação JWT
> Powered by **Google Gemini 2.0 Flash** (gratuito: 1500 req/dia no Google AI Studio)

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/ai/sessions` | Criar nova sessão de chat |
| `GET` | `/ai/sessions` | Listar sessões |
| `POST` | `/ai/sessions/:sessionId/messages` | Enviar mensagem ao assistente |
| `GET` | `/ai/sessions/:sessionId/messages` | Histórico de mensagens |
| `GET` | `/ai/insights` | Insights automáticos do mês atual |

#### `POST /ai/sessions/:sessionId/messages`

```json
// Body
{
  "message": "Quanto gastei em alimentação esse mês?"
}

// Response 201
{
  "userMessage": { "id": "uuid", "role": "user", "content": "Quanto gastei em alimentação esse mês?" },
  "assistantMessage": { "id": "uuid", "role": "model", "content": "Com base nos seus dados, você gastou R$ 850,00 em alimentação em junho..." }
}
```

O assistente tem acesso às últimas **20 mensagens** da sessão como contexto.

#### `GET /ai/insights`

Analisa as transações do mês atual por categoria e gera um relatório com padrões de gastos, variações e recomendações personalizadas em português.

---

## Processamento assíncrono (BullMQ)

| Fila | Jobs | Disparado por |
|---|---|---|
| `sync-queue` | `sync-accounts`, `sync-transactions`, `sync-investments` | Criação de conexão ou webhook Pluggy |
| `ai-queue` | `categorize-transactions` | Novas transações sincronizadas |
| `notification-queue` | `budget-alert`, `goal-reached` | Limites e metas atingidos |

Todos os jobs têm **3 tentativas** com **backoff exponencial** (2s base).

---

## Testes

```bash
npm test              # Unit tests
npm run test:cov      # Com cobertura (mínimo 70%)
```

---

## Comandos úteis

```bash
npm run start:dev          # Dev com watch mode
npm run build              # Build produção
npx prisma studio          # Interface visual do banco
npx prisma migrate dev     # Aplicar migrations
docker-compose up -d       # Subir PostgreSQL + Redis
docker-compose down        # Derrubar containers
```
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
