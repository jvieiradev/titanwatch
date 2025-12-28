# 🏢 Shatterdome Service

Serviço de gerenciamento de Shatterdomes (bases de Jaegers) do Titan Watch, implementado com **DDD + CQRS + GraphQL**.

## 📋 Visão Geral

- **Arquitetura**: Domain-Driven Design (DDD) + CQRS
- **API**: GraphQL (Apollo Server)
- **Stack**: Node.js 20+ | TypeScript | Apollo Server | TypeORM | PostgreSQL
- **Sprint**: 1.3 (Fase 1)

## 🏗️ Arquitetura (DDD + CQRS)

```
src/
├── domain/                    # Domain Layer (DDD)
│   ├── aggregates/           # Shatterdome (Aggregate Root)
│   ├── entities/             # Commander
│   ├── value-objects/        # Location, Capacity, Coordinates
│   ├── events/               # Domain Events
│   ├── services/             # AllocationService
│   └── repositories/         # Interfaces
├── application/              # Application Layer (CQRS)
│   ├── commands/             # Commands + Handlers
│   └── queries/              # Queries + Handlers
├── infrastructure/           # Infrastructure
│   ├── database/             # TypeORM entities, repositories
│   └── config/               # DataSource
├── graphql/                  # GraphQL Layer
│   ├── schema/               # GraphQL schema
│   └── resolvers/            # Resolvers
└── server.ts                 # Entry point
```

## 🚀 Quick Start

### Desenvolvimento (Docker)

```bash
# Instalar dependências
npm install

# Iniciar serviço
make dev
# ou
docker-compose up --build
```

GraphQL Playground: `http://localhost:8003/graphql`

### Desenvolvimento Local

```bash
npm install
cp .env.example .env

# Iniciar apenas PostgreSQL
docker-compose up -d postgres-shatterdome

# Build e start
npm run build
npm run dev
```

## 📡 GraphQL API

### Queries

```graphql
# Buscar Shatterdome por ID
query {
  shatterdome(id: "uuid") {
    id
    name
    location {
      city
      country
      coordinates {
        latitude
        longitude
      }
    }
    capacity {
      total
      current
      available
    }
    status
    allocatedJaegers
    canAllocateJaeger
  }
}

# Listar Shatterdomes (com filtros)
query {
  shatterdomes(status: ACTIVE, hasCapacity: true) {
    id
    name
    location { city country }
    capacity { total current available }
    status
  }
}
```

### Mutations

```graphql
# Criar Shatterdome
mutation {
  createShatterdome(input: {
    name: "Hong Kong Shatterdome"
    city: "Hong Kong"
    country: "China"
    latitude: 22.3964
    longitude: 114.1095
    totalCapacity: 10
  }) {
    id
    name
    status
  }
}

# Alocar Jaeger
mutation {
  allocateJaeger(input: {
    shatterdomeId: "uuid"
    jaegerId: "uuid"
  }) {
    id
    capacity { current available }
    allocatedJaegers
  }
}

# Desalocar Jaeger
mutation {
  deallocateJaeger(input: {
    shatterdomeId: "uuid"
    jaegerId: "uuid"
  }) {
    id
    capacity { current available }
  }
}
```

## 🎯 Domain Model (DDD)

### Aggregate Root: Shatterdome
- **Entities**: Commander
- **Value Objects**: Location, Capacity, Coordinates
- **Domain Events**: JaegerAllocated, JaegerDeallocated, CapacityExceeded

### Regras de Negócio (Invariantes)

- Shatterdome só pode alocar Jaegers se status = ACTIVE
- Capacidade não pode ser excedida (gera CapacityExceededEvent)
- Shatterdome não pode ser descomissionado com Jaegers alocados
- Coordenadas devem ser válidas (lat: -90 a 90, lon: -180 a 180)

### Domain Events

Eventos de domínio são disparados automaticamente:
- `JaegerAllocatedEvent` - Quando um Jaeger é alocado
- `JaegerDeallocatedEvent` - Quando um Jaeger é desalocado
- `CapacityExceededEvent` - Quando tentativa de alocação excede capacidade

## 🧪 CQRS Pattern

### Commands (Write Side)
- `CreateShatterdomeCommand` - Cria novo Shatterdome
- `AllocateJaegerCommand` - Aloca Jaeger ao Shatterdome
- `DeallocateJaegerCommand` - Remove Jaeger do Shatterdome

### Queries (Read Side)
- `GetShatterdomeQuery` - Busca Shatterdome por ID
- `ListShatterdomesQuery` - Lista Shatterdomes com filtros

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Inicia em modo desenvolvimento
npm run build            # Compila TypeScript
npm start                # Inicia servidor de produção

# Code Quality
npm run lint             # Executa ESLint
npm run format           # Formata código

# Docker
make dev                 # Inicia com Docker
docker-compose down      # Para containers
```

## ✅ Critérios de Aceite (Sprint 1.3)

- ✅ GraphQL API funcional
- ✅ DDD implementado (Aggregates, Entities, Value Objects, Domain Events)
- ✅ CQRS implementado (Commands/Queries separados)
- ✅ Regras de alocação implementadas
- ✅ Domain Events publicados
- ⬜ Integração com Jaeger Service
- ⬜ DataLoaders (N+1 problem)
- ⬜ Autenticação GraphQL
- ⬜ Coverage > 75%

## 🎯 Próximos Passos

1. Implementar DataLoaders para otimização de queries
2. Adicionar autenticação GraphQL
3. Integração com Jaeger Service para validar disponibilidade
4. Implementar testes (unit, integration, E2E)
5. Adicionar Event Publisher para publicar domain events

## 📚 Padrões Implementados

### DDD (Domain-Driven Design)
- **Aggregate Root**: Shatterdome protege invariantes
- **Entities**: Commander com identidade própria
- **Value Objects**: Location, Capacity, Coordinates (imutáveis)
- **Domain Events**: Eventos de negócio
- **Domain Services**: AllocationService para lógica complexa

### CQRS
- **Commands**: Operações de escrita com validações
- **Queries**: Operações de leitura otimizadas
- **Handlers**: Separação clara de responsabilidades

### GraphQL
- **Type-safe**: Schema strongly typed
- **Queries**: Busca de dados
- **Mutations**: Modificação de dados
- **Resolvers**: Lógica de resolução

---

**Desenvolvido como parte do Sprint 1.3 do Titan Watch Project**
