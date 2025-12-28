# 🤖 Jaeger Service

Serviço de gerenciamento de Jaegers (robôs gigantes) do Titan Watch, implementado com **Clean Architecture** usando Node.js, TypeScript e Express.

## 📋 Visão Geral

- **Arquitetura**: Clean Architecture
- **Stack**: Node.js 20+ | TypeScript | Express | TypeORM | PostgreSQL
- **Padrões**: Repository Pattern, Use Cases, Value Objects
- **Sprint**: 1.2 (Fase 1)

## 🏗️ Arquitetura

```
src/
├── domain/              # Camada de Domínio (regras de negócio)
│   ├── entities/        # Jaeger, Pilot
│   ├── value-objects/   # JaegerMark, IntegrityLevel
│   ├── repositories/    # Interfaces
│   └── services/        # Validações de domínio
├── usecases/            # Casos de Uso
├── infrastructure/      # Implementações externas
│   ├── database/        # TypeORM entities, repositories
│   └── config/          # DataSource config
├── application/         # Controllers, DTOs, Validators
├── api/                 # Rotas, Middlewares
└── server.ts            # Entry point
```

## 🚀 Quick Start

### Desenvolvimento (Docker - Recomendado)

```bash
# Instalar dependências
npm install

# Iniciar serviço
make dev
# ou
docker-compose up --build
```

O serviço estará disponível em `http://localhost:8002`

### Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Criar .env
cp .env.example .env

# Iniciar apenas o PostgreSQL
docker-compose up -d postgres-jaeger

# Build
npm run build

# Executar migrations
npm run migration:run

# Iniciar servidor
npm run dev
```

## 📡 API Endpoints

### Health Check
```bash
GET /health
```

### Jaegers

```bash
# Criar Jaeger
POST /api/v1/jaegers
{
  "name": "Gipsy Danger",
  "mark": 3,
  "height": 79,
  "weight": 1980,
  "powerCore": "Nuclear Vortex Turbine",
  "weapons": ["Chain Sword", "Plasma Cannon"],
  "baseLocation": "Hong Kong Shatterdome"
}

# Listar Jaegers (com filtros e paginação)
GET /api/v1/jaegers?page=1&limit=10&status=active&mark=3

# Buscar Jaeger por ID
GET /api/v1/jaegers/:id

# Atualizar Jaeger
PUT /api/v1/jaegers/:id
{
  "powerCore": "Enhanced Nuclear Core",
  "baseLocation": "Tokyo Shatterdome"
}

# Atualizar integridade
PATCH /api/v1/jaegers/:id/integrity
{
  "integrityLevel": 85
}

# Deletar Jaeger
DELETE /api/v1/jaegers/:id
```

## 🧪 Testes

```bash
# Todos os testes
npm test

# Testes unitários
npm run test:unit

# Testes de integração
npm run test:integration

# Testes E2E
npm run test:e2e

# Com coverage
npm test -- --coverage
```

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Inicia em modo desenvolvimento
npm run build            # Compila TypeScript
npm start                # Inicia servidor de produção

# Database
npm run migration:generate -- ./migrations/MigrationName
npm run migration:run    # Executa migrations
npm run migration:revert # Reverte última migration

# Code Quality
npm run lint             # Executa ESLint
npm run lint:fix         # Fix automático
npm run format           # Formata código com Prettier
npm run format:check     # Verifica formatação

# Docker
make dev                 # Inicia com Docker
docker-compose down      # Para containers
docker-compose down -v   # Para e remove volumes
```

## 📦 Variáveis de Ambiente

Copie `.env.example` para `.env` e ajuste conforme necessário:

```env
NODE_ENV=development
PORT=8002
DB_HOST=localhost
DB_PORT=5432
DB_NAME=jaeger_db
DB_USER=titanwatch
DB_PASSWORD=titanwatch_secret
```

## ✅ Critérios de Aceite (Sprint 1.2)

- ✅ CRUD completo de Jaegers
- ✅ Validações de negócio funcionando
- ✅ Clean Architecture implementada
- ✅ TypeORM + PostgreSQL integrados
- ✅ Filtros e paginação
- ⬜ Integração com Auth Service
- ⬜ Swagger documentation
- ⬜ Coverage > 80%

## 🎯 Próximos Passos

1. Implementar autenticação (integração com Auth Service)
2. Adicionar Swagger/OpenAPI documentation
3. Implementar testes (unit, integration, E2E)
4. Adicionar validadores (class-validator)
5. Implementar gestão de pilotos

## 📚 Domain Model

### Jaeger
- **Entidade Principal**: Representa um robô gigante
- **Value Objects**: JaegerMark (geração), IntegrityLevel (0-100%)
- **Status**: active, maintenance, damaged, decommissioned
- **Business Rules**:
  - Pode ser deployado se: status=active, integrity>=70%, tem pilotos
  - Precisa manutenção se: >30 dias, integrity<70%, ou a cada 5 deployments

### Pilot
- **Entidade**: Representa um piloto de Jaeger
- **Status**: active, injured, retired, kia
- **Business Rules**:
  - Compatibilidade drift >= 50% para pilotar
  - Máximo 2 pilotos por Jaeger
  - Promove de Cadet→Ranger (100h) ou Ranger→Marshal (500h)

## 🐛 Troubleshooting

### Erro de conexão com banco
```bash
docker-compose down -v
docker-compose up --build
```

### Porta em uso
Altere `PORT` no `.env` ou `ports` no `docker-compose.yml`

### Limpar tudo
```bash
make clean
```

---

**Desenvolvido como parte do Sprint 1.2 do Titan Watch Project**
