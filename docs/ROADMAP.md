# 🗺️ Roadmap de Desenvolvimento - Titan Watch

## Visão Geral

Este roadmap detalha o plano de desenvolvimento completo do PDP, dividido em fases incrementais com entregas mensuráveis.

**Duração Total Estimada:** 28 semanas (~7 meses)  
**Status Atual:** FASE 0 - Setup Inicial

---

## 📊 Progresso Geral

```
FASE 0: ████████████████████░░  90% - Setup Inicial
FASE 1: ░░░░░░░░░░░░░░░░░░░░  0%  - Serviços Core
FASE 2: ░░░░░░░░░░░░░░░░░░░░  0%  - Dados e Rastreamento
FASE 3: ░░░░░░░░░░░░░░░░░░░░  0%  - Eventos e Processos
FASE 4: ░░░░░░░░░░░░░░░░░░░░  0%  - Workers
FASE 5: ░░░░░░░░░░░░░░░░░░░░  0%  - Analytics e Frontend
FASE 6: ░░░░░░░░░░░░░░░░░░░░  0%  - Refinamento
```

---

## 🚀 FASE 0: Setup Inicial (Semana 1-2)

**Objetivo:** Preparar ambiente de desenvolvimento e infraestrutura base

### Semana 1: Estrutura e Configuração

- [ ] Criar estrutura de repositórios
- [ ] Configurar `.gitignore` global
- [ ] Criar `docker-compose.yml` base
- [ ] Configurar databases (PostgreSQL, MongoDB, Redis, TimescaleDB)
- [ ] Configurar RabbitMQ
- [ ] Configurar Kafka + Zookeeper
- [ ] Criar `.env.example`
- [ ] Documentar variáveis de ambiente

**Entregas:**
- ✅ Estrutura de pastas completa
- 🔄 Databases rodando em containers
- 🔄 Message brokers funcionais

### Semana 2: Infraestrutura e Monitoring

- [ ] Configurar Nginx como API Gateway
- [ ] Setup Prometheus para métricas
- [ ] Setup Grafana com dashboards básicos
- [ ] Configurar ELK Stack (opcional)
- [ ] Criar scripts de inicialização (`setup.sh`, `start-all.sh`)
- [ ] Criar Makefile com comandos úteis
- [ ] Documentar processo de setup local

**Entregas:**
- ⬜ API Gateway configurado
- ⬜ Monitoring básico funcional
- ⬜ Scripts de automação prontos
- ⬜ Documentação de setup completa

---

## 🏗️ FASE 1: Fundação - Serviços Core (Semana 3-6)

**Objetivo:** Implementar serviços fundamentais com Clean Architecture

### Sprint 1.1: Auth Service (Semana 3)

**Tech Stack:** Go + Chi + PostgreSQL + Redis + JWT

#### Tarefas
- [ ] **Setup do projeto**
  - [ ] Estrutura de pastas Clean Architecture
  - [ ] Configurar Go modules
  - [ ] Setup de migrations
  - [ ] Configurar testes

- [ ] **Domain Layer**
  - [ ] Entity: User
  - [ ] Repository interface: IUserRepository
  - [ ] Value Objects: Email, Password, Token

- [ ] **Use Cases**
  - [ ] RegisterUser
  - [ ] Login
  - [ ] Logout
  - [ ] RefreshToken
  - [ ] VerifyToken

- [ ] **Infrastructure Layer**
  - [ ] PostgresUserRepository
  - [ ] RedisTokenStore
  - [ ] JWT service
  - [ ] Password hashing (bcrypt)

- [ ] **Delivery Layer**
  - [ ] HTTP handlers
  - [ ] Middleware de autenticação
  - [ ] Rotas e servidor

- [ ] **Testes**
  - [ ] Unit tests (domain + use cases)
  - [ ] Integration tests (repository)
  - [ ] E2E tests (API)

**Critérios de Aceite:**
- ✅ Usuário pode se registrar
- ✅ Usuário pode fazer login e receber JWT
- ✅ Token pode ser validado
- ✅ Refresh token funcional
- ✅ Coverage > 80%
- ✅ Documentação Swagger

**Entrega:** API de autenticação funcional com tokens JWT

---

### Sprint 1.2: Jaeger Service (Semana 4)

**Tech Stack:** Node.js + TypeScript + Express + PostgreSQL

#### Tarefas
- [ ] **Setup do projeto**
  - [ ] Estrutura Clean Architecture
  - [ ] TypeScript + ESLint + Prettier
  - [ ] Jest para testes
  - [ ] TypeORM para database

- [ ] **Domain Layer**
  - [ ] Entity: Jaeger, Pilot
  - [ ] Repository: IJaegerRepository
  - [ ] Value Objects: JaegerId, IntegrityLevel
  - [ ] Domain validations

- [ ] **Use Cases**
  - [ ] CreateJaeger
  - [ ] UpdateJaeger
  - [ ] GetJaeger
  - [ ] ListJaegers (com filtros)
  - [ ] DeleteJaeger
  - [ ] UpdateIntegrity

- [ ] **Infrastructure**
  - [ ] PostgresJaegerRepository
  - [ ] Migrations e seeds
  - [ ] Cache com Redis (opcional)

- [ ] **Application Layer**
  - [ ] Controllers
  - [ ] DTOs
  - [ ] Validators (class-validator)
  - [ ] Error handling

- [ ] **API**
  - [ ] Rotas REST completas
  - [ ] Middleware de autenticação (integração com Auth)
  - [ ] Swagger documentation
  - [ ] Request validation

- [ ] **Testes**
  - [ ] Unit tests completos
  - [ ] Integration tests
  - [ ] E2E tests

**Critérios de Aceite:**
- ✅ CRUD completo de Jaegers
- ✅ Validações de negócio funcionando
- ✅ Integração com Auth Service
- ✅ Filtros e paginação
- ✅ Coverage > 80%
- ✅ Swagger completo

**Entrega:** API REST de Jaegers com autenticação

---

### Sprint 1.3: Shatterdome Service (Semana 5-6)

**Tech Stack:** Node.js + TypeScript + Apollo Server + GraphQL + PostgreSQL

#### Tarefas
- [ ] **Setup do projeto**
  - [ ] Apollo Server
  - [ ] GraphQL schema
  - [ ] TypeGraphQL ou Codegen
  - [ ] TypeORM

- [ ] **Domain Layer (DDD)**
  - [ ] Aggregate: Shatterdome
  - [ ] Entity: Commander, Personnel
  - [ ] Value Objects: Location, Capacity, Coordinates
  - [ ] Domain Services: AllocationService
  - [ ] Domain Events: JaegerAllocated, CapacityExceeded
  - [ ] Repository: IShatterdomeRepository

- [ ] **Application Layer (CQRS)**
  - [ ] Commands:
    - [ ] CreateShatterdomeCommand
    - [ ] AllocateJaegerCommand
    - [ ] DeallocateJaegerCommand
  - [ ] Queries:
    - [ ] GetShatterdomeQuery
    - [ ] ListShatterdomesQuery
  - [ ] Command/Query Handlers

- [ ] **Infrastructure**
  - [ ] PostgresShatterdomeRepository
  - [ ] Mappers (Domain <-> Persistence)
  - [ ] Event publisher (opcional)

- [ ] **GraphQL API**
  - [ ] Schema definition
  - [ ] Queries
    - [ ] shatterdome(id)
    - [ ] shatterdomes(filters)
    - [ ] shatterdomesByStatus
  - [ ] Mutations
    - [ ] createShatterdome
    - [ ] updateShatterdome
    - [ ] allocateJaeger
    - [ ] deallocateJaeger
  - [ ] Resolvers
  - [ ] DataLoaders (N+1 problem)

- [ ] **Integração**
  - [ ] Cliente HTTP para Jaeger Service
  - [ ] Validar disponibilidade de Jaeger
  - [ ] Autenticação GraphQL

- [ ] **Testes**
  - [ ] Unit tests (domain + application)
  - [ ] Integration tests (GraphQL)
  - [ ] E2E tests

**Critérios de Aceite:**
- ✅ GraphQL API funcional
- ✅ Regras de alocação implementadas
- ✅ Domain Events publicados
- ✅ Integração com Jaeger Service
- ✅ Coverage > 75%
- ✅ GraphQL Playground documentado

**Entrega:** API GraphQL de Shatterdomes com DDD

---

## 📊 FASE 2: Dados e Rastreamento (Semana 7-10)

**Objetivo:** Implementar serviços de dados com arquiteturas especializadas

### Sprint 2.1: Kaiju Service (Semana 7-8)

**Tech Stack:** Python + FastAPI + MongoDB

#### Tarefas
- [ ] **Setup**
  - [ ] FastAPI project structure
  - [ ] MongoDB connection
  - [ ] Pytest setup
  - [ ] Pydantic models

- [ ] **Domain (Hexagonal - Core)**
  - [ ] Model: Kaiju
  - [ ] Ports (Interfaces):
    - [ ] IKaijuRepository
    - [ ] IDetectionService
    - [ ] IBehaviorAnalyzer
    - [ ] IThreatCalculator

- [ ] **Application (Use Cases)**
  - [ ] DetectKaiju
  - [ ] AnalyzeBehavior
  - [ ] CalculateThreatLevel
  - [ ] TrackKaiju

- [ ] **Adapters - Inbound**
  - [ ] REST API (FastAPI)
    - [ ] Controllers
    - [ ] Routes
    - [ ] Request/Response models

- [ ] **Adapters - Outbound**
  - [ ] MongoKaijuRepository
  - [ ] Satellite detector (mock)
  - [ ] Sensor detector (mock)
  - [ ] ML Behavior Analyzer (mock)
  - [ ] Simple Threat Calculator

- [ ] **Testes**
  - [ ] Unit tests with mocks
  - [ ] Integration tests
  - [ ] Tests com diferentes adapters

**Critérios de Aceite:**
- ✅ CRUD de Kaijus
- ✅ Sistema de detecção plugável
- ✅ Análise comportamental básica
- ✅ Fácil trocar implementações
- ✅ Coverage > 80%

**Entrega:** API de Kaijus com arquitetura Hexagonal

---

### Sprint 2.2: Tracking Service (Semana 9-10)

**Tech Stack:** Go + Gin + TimescaleDB + Redis

#### Tarefas
- [ ] **Setup**
  - [ ] Estrutura CQRS (2 apps)
  - [ ] TimescaleDB setup
  - [ ] Redis para cache
  - [ ] Migrations

- [ ] **Write Side**
  - [ ] Domain: Position
  - [ ] Use Case: RecordPosition
  - [ ] Repository: TimescaleWriter (otimizado INSERT)
  - [ ] API: POST /positions (alta performance)
  - [ ] Batch insert support

- [ ] **Read Side**
  - [ ] Domain: Trail, Heatmap
  - [ ] Use Cases:
    - [ ] GetTrail
    - [ ] GetHeatmap
    - [ ] PredictTrajectory
  - [ ] Repository: TimescaleReader (otimizado SELECT)
  - [ ] Cache layer (Redis)
  - [ ] API: GET endpoints complexos

- [ ] **Database**
  - [ ] Hypertables
  - [ ] Continuous aggregates
  - [ ] Retention policies
  - [ ] Indexes otimizados

- [ ] **Worker**
  - [ ] Aggregator (background)
  - [ ] Hourly aggregations
  - [ ] Daily summaries

- [ ] **Testes**
  - [ ] Load tests (write)
  - [ ] Performance tests (read)
  - [ ] Integration tests

**Critérios de Aceite:**
- ✅ Escrita de alta performance (> 1000 pos/s)
- ✅ Leituras otimizadas com cache
- ✅ Agregações automáticas
- ✅ APIs separadas (write/read)
- ✅ Coverage > 70%

**Entrega:** Sistema de tracking com CQRS e time-series

---

## ⚡ FASE 3: Eventos e Processos (Semana 11-15)

### Sprint 3.1: Event Service (Semana 11-13)

**Tech Stack:** Java + Spring Boot + MongoDB + PostgreSQL + Kafka

#### Tarefas
- [ ] **Setup**
  - [ ] Spring Boot project
  - [ ] MongoDB (Event Store)
  - [ ] PostgreSQL (Projections)
  - [ ] Kafka setup

- [ ] **Write Side (Command)**
  - [ ] Aggregates:
    - [ ] CombatAggregate
    - [ ] KaijuSpottingAggregate
  - [ ] Commands
  - [ ] Command Handlers
  - [ ] Event Store (MongoDB)
  - [ ] Kafka publisher

- [ ] **Events**
  - [ ] CombatStartedEvent
  - [ ] CombatEndedEvent
  - [ ] KaijuSpottedEvent
  - [ ] JaegerDeployedEvent
  - [ ] EvacuationOrderedEvent

- [ ] **Read Side (Query)**
  - [ ] Projections:
    - [ ] CombatProjection
    - [ ] TimelineProjection
    - [ ] StatisticsProjection
  - [ ] Query Handlers
  - [ ] PostgreSQL optimized schema
  - [ ] Kafka consumer (update projections)

- [ ] **API**
  - [ ] Command endpoints (POST)
  - [ ] Query endpoints (GET)
  - [ ] Event replay endpoint

- [ ] **Testes**
  - [ ] Event sourcing tests
  - [ ] Projection tests
  - [ ] Replay tests

**Critérios de Aceite:**
- ✅ Eventos persistidos permanentemente
- ✅ Projeções atualizadas em tempo real
- ✅ Event replay funcional
- ✅ Auditoria completa
- ✅ Coverage > 75%

**Entrega:** Sistema de eventos com Event Sourcing

---

### Sprint 3.2: Maintenance Service (Semana 14-15)

**Tech Stack:** Node.js + NestJS + PostgreSQL + Redis + RabbitMQ

#### Tarefas
- [ ] **Setup**
  - [ ] NestJS project
  - [ ] RabbitMQ setup
  - [ ] Redis (saga state)
  - [ ] PostgreSQL

- [ ] **Domain**
  - [ ] Entity: MaintenanceRequest
  - [ ] Saga: MaintenanceSaga
  - [ ] Events

- [ ] **Saga Orchestrator**
  - [ ] SagaStep definition
  - [ ] Orchestrator logic
  - [ ] State management (Redis)
  - [ ] Compensation handlers

- [ ] **Saga Steps**
  1. [ ] Check Jaeger Availability
  2. [ ] Request Approval
  3. [ ] Allocate Resources
  4. [ ] Schedule Maintenance
  5. [ ] Execute Maintenance
  6. [ ] Complete & Notify

- [ ] **RabbitMQ**
  - [ ] Queues setup
  - [ ] Publishers
  - [ ] Consumers
  - [ ] Dead letter queue

- [ ] **Integration**
  - [ ] Jaeger Service client
  - [ ] Notification worker integration

- [ ] **Testes**
  - [ ] Saga happy path
  - [ ] Compensation tests
  - [ ] Failure scenarios

**Critérios de Aceite:**
- ✅ Workflow completo funcional
- ✅ Compensações automáticas
- ✅ Estado da saga persistido
- ✅ Integração com outros serviços
- ✅ Coverage > 70%

**Entrega:** Sistema de manutenção com Saga Pattern

---

## 🔄 FASE 4: Workers e Background (Semana 16-17)

### Sprint 4.1: Background Workers

#### Notification Worker (Node.js)
- [ ] RabbitMQ consumer
- [ ] Email service (mock)
- [ ] SMS service (mock)
- [ ] Push notification service (mock)
- [ ] Retry logic
- [ ] Error handling

#### Maintenance Worker (Node.js)
- [ ] Workflow executor
- [ ] Status updates
- [ ] Database operations
- [ ] Notification triggers

#### Report Worker (Python + Celery)
- [ ] PDF generation
- [ ] Excel export
- [ ] Scheduled reports
- [ ] S3 upload (opcional)

**Critérios de Aceite:**
- ✅ 3 workers funcionais
- ✅ Retry automático
- ✅ Dead letter handling
- ✅ Monitoring de filas

---

## 📊 FASE 5: Analytics e Frontend (Semana 18-24)

### Sprint 5.1: Analytics Service (Semana 18-20)

**Tech Stack:** Python + Apache Spark + Kafka

#### Batch Layer
- [ ] Spark jobs:
  - [ ] Combat statistics
  - [ ] Kaiju patterns
  - [ ] Jaeger efficiency
- [ ] Scheduled execution

#### Speed Layer
- [ ] Kafka Streams:
  - [ ] Real-time alerts
  - [ ] Live statistics
  - [ ] Trend detection

#### Serving Layer
- [ ] REST API
- [ ] Cache (Redis)
- [ ] Aggregated data

#### ML Models (básico)
- [ ] Trajectory prediction
- [ ] Threat classification

---

### Sprint 5.2-5.3: Frontend (Semana 21-24)

**Tech Stack:** React + TypeScript + Mapbox + Tailwind

#### Sprint 5.2: Base (Semana 21-22)
- [ ] Setup React + Vite
- [ ] Authentication flow
- [ ] Routing (React Router)
- [ ] State management (Zustand)
- [ ] API clients
- [ ] Dashboard básico
- [ ] Components library

#### Sprint 5.3: Mapa (Semana 23-24)
- [ ] Mapbox integration
- [ ] Layers:
  - [ ] Shatterdomes
  - [ ] Kaijus
  - [ ] Trails
  - [ ] Events
  - [ ] Jaegers
- [ ] Filters
- [ ] Timeline
- [ ] Interações
- [ ] Real-time updates (WebSocket)

---

## 🎯 FASE 6: Refinamento e Produção (Semana 25-28)

### Sprint 6.1: Qualidade (Semana 25-26)
- [ ] E2E tests (Playwright/Cypress)
- [ ] Load tests (k6)
- [ ] Security audit
- [ ] Code coverage > 80%
- [ ] Performance optimization
- [ ] Documentation review

### Sprint 6.2: DevOps (Semana 27-28)
- [ ] CI/CD pipelines (GitHub Actions)
- [ ] Kubernetes manifests
- [ ] Helm charts
- [ ] Secrets management
- [ ] Backup strategies
- [ ] Disaster recovery plan
- [ ] Production deployment

---

## 📈 Métricas de Sucesso

### Por Sprint
- ✅ Todos os critérios de aceite atendidos
- ✅ Code coverage acima do limite
- ✅ Zero bugs críticos
- ✅ Documentação atualizada
- ✅ Code review aprovado

### Por Fase
- ✅ Integração entre serviços funcional
- ✅ Testes E2E passando
- ✅ Performance dentro dos SLAs
- ✅ Monitoring operacional

### Projeto Final
- ✅ Sistema completo funcionando
- ✅ Documentação completa
- ✅ Portfolio pronto
- ✅ Deploy em produção (opcional)

---

## 🔄 Processo de Desenvolvimento

### Daily
- Commit diário (mínimo)
- Atualizar task board
- Documentar decisões

### Weekly
- Code review
- Atualizar roadmap
- Testar integrações
- Atualizar documentação

### Sprint Review
- Demo funcional
- Retrospectiva
- Ajustar próximo sprint

---

## 📝 Notas

- Roadmap é flexível, ajustar conforme necessário
- Priorizar aprendizado sobre velocidade
- Documentar lições aprendidas
- Não pular testes!

---

**Última atualização:** 2024-12-13  
**Status:** FASE 0 em andamento