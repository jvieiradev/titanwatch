# 🏛️ Arquitetura do Sistema - Titan Watch

## Índice

1. [Visão Geral](#visão-geral)
2. [Decisões Arquiteturais](#decisões-arquiteturais)
3. [Microserviços Detalhados](#microserviços-detalhados)
4. [Padrões de Comunicação](#padrões-de-comunicação)
5. [Gestão de Dados](#gestão-de-dados)
6. [Segurança](#segurança)
7. [Observabilidade](#observabilidade)
8. [Escalabilidade](#escalabilidade)

---

## Visão Geral

O PDP utiliza arquitetura de microserviços com diferentes padrões arquiteturais para demonstrar e comparar abordagens variadas de design de software.

### Diagrama de Alto Nível

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENTE (React + TypeScript)               │
│                         Frontend Web App                        │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY (Nginx)                          │
│  • Roteamento        • Rate Limiting      • Load Balancing      │
│  • Auth Check        • SSL Termination    • Logging             │
└──┬────────┬────────┬────────┬────────┬────────┬────────┬────────┘
   │        │        │        │        │        │        │
   │ REST   │ REST   │ REST   │ REST   │ GraphQL│ REST   │ REST
   │        │        │        │        │        │        │
   ▼        ▼        ▼        ▼        ▼        ▼        ▼
┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐
│Auth  ││Jaeger││Kaiju ││Track ││Event ││Maint.││Shatt.││Analyt│
│Svc   ││Svc   ││Svc   ││Svc   ││Svc   ││Svc   ││Svc   ││Svc   │
│      ││      ││      ││      ││      ││      ││      ││      │
│Go    ││Node  ││Python││Go    ││Java  ││Node  ││Node  ││Python│
└──┬───┘└──┬───┘└──┬───┘└──┬───┘└──┬───┘└──┬───┘└──┬───┘└──┬───┘
   │       │       │       │       │       │       │       │
   ▼       ▼       ▼       ▼       ▼       ▼       ▼       ▼
┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐
│PG    ││PG    ││Mongo ││Time  ││Mongo ││PG +  ││PG    ││PG +  │
│      ││      ││      ││ScaleD││+ PG  ││Redis ││      ││Redis │
└──────┘└──────┘└──────┘└──────┘└──┬───┘└──┬───┘└──────┘└──────┘
                                   │       │
                         ┌─────────┴───────┴─────────┐
                         │                           │
                         ▼                           ▼
                  ┌─────────────┐           ┌─────────────┐
                  │   Kafka     │           │  RabbitMQ   │
                  │ (Events)    │           │ (Commands)  │
                  └──────┬──────┘           └──────┬──────┘
                         │                         │
                ┌────────┼────────┐       ┌────────┼
                ▼        ▼        ▼       ▼        ▼        
          ┌────────┐┌────────┐┌────────┐┌────────┐┌────────┐
          │Analytics│Event   ││Other   ││Notif.  ││ Maint. │
          │Consumer │Project ││Consume ││Worker  ││ Worker │
          └────────┘└────────┘└────────┘└────────┘└────────┘
```

---

## Decisões Arquiteturais

### Por que Microserviços?

**Benefícios:**
- ✅ Desenvolvimento independente de cada serviço
- ✅ Deploy independente
- ✅ Tecnologias diferentes por serviço (poliglota)
- ✅ Escalabilidade granular
- ✅ Isolamento de falhas
- ✅ Facilita testes de diferentes padrões

**Trade-offs:**
- ❌ Complexidade operacional aumentada
- ❌ Latência de rede entre serviços
- ❌ Consistência eventual
- ❌ Debugging mais complexo

### Por que Múltiplas Arquiteturas?

Este projeto usa intencionalmente diferentes arquiteturas para:
1. **Aprendizado** - Entender quando usar cada padrão
2. **Comparação** - Ver diferenças práticas na implementação
3. **Portfolio** - Demonstrar conhecimento variado
4. **Adequação** - Cada serviço tem padrão mais apropriado

---

## Microserviços Detalhados

### 1. Auth Service

**Arquitetura:** Clean Architecture  
**Linguagem:** Go  
**Framework:** Chi  
**Database:** PostgreSQL + Redis

#### Por que Clean Architecture?

- Segurança é crítica - precisa de camadas bem isoladas
- Regras de negócio complexas (validações, tokens, sessões)
- Testabilidade essencial
- Múltiplas fontes de dados (DB + Cache)

#### Estrutura

```
auth-service/
├── domain/          # Regras de negócio puras
│   ├── entity/      # User, Session
│   ├── repository/  # Interfaces
│   └── service/     # Domain services
├── usecase/         # Casos de uso
│   ├── login.go
│   ├── register.go
│   └── refresh.go
├── infrastructure/  # Implementações
│   ├── database/    # PostgreSQL
│   ├── cache/       # Redis
│   └── crypto/      # JWT, bcrypt
└── delivery/        # Controllers
    └── http/
```

#### Fluxo de Login

```
HTTP Request → Handler → Use Case → Domain Service → Repository
                  ↓
            Valida JWT ← Domain Entity ← Database
                  ↓
            HTTP Response
```

---

### 2. Jaeger Service

**Arquitetura:** Clean Architecture  
**Linguagem:** Node.js + TypeScript  
**Framework:** Express  
**Database:** PostgreSQL

#### Por que Clean Architecture?

- CRUD com regras de negócio (validações de integridade)
- Ciclo de vida complexo (status, manutenções)
- Múltiplas validações de domínio
- Facilita testes unitários

#### Camadas

```typescript
// Domain Layer
class Jaeger {
  updateIntegrity(damage: number): Result<void> {
    if (this.integrity - damage < 0) {
      return Result.fail('Cannot go below 0');
    }
    this.integrity -= damage;
    return Result.ok();
  }
}

// Use Case Layer
class UpdateJaegerUseCase {
  execute(dto: UpdateJaegerDTO): Promise<Result<Jaeger>> {
    // Orchestrates domain logic
  }
}

// Infrastructure Layer
class PostgresJaegerRepository implements IJaegerRepository {
  // Database implementation
}
```

---

### 3. Kaiju Service

**Arquitetura:** Hexagonal (Ports & Adapters)  
**Linguagem:** Python  
**Framework:** FastAPI  
**Database:** MongoDB

#### Por que Hexagonal?

- Múltiplas fontes de detecção (satélites, sensores, sonar)
- Algoritmos de análise intercambiáveis
- Facilita mock para testes
- Flexibilidade para adicionar novos detectores

#### Estrutura

```
kaiju-service/
├── domain/
│   ├── model/          # Core domain
│   │   └── kaiju.py
│   └── ports/          # Interfaces
│       ├── kaiju_repository.py
│       ├── detection_service.py
│       └── behavior_analyzer.py
├── application/
│   └── use_cases/
└── adapters/
    ├── inbound/        # Primary adapters
    │   └── rest/
    └── outbound/       # Secondary adapters
        ├── repositories/
        │   └── mongo_kaiju_repository.py
        ├── detection/
        │   ├── satellite_detector.py
        │   └── sensor_detector.py
        └── analyzers/
            └── ml_analyzer.py
```

#### Fluxo de Detecção

```
REST API → Use Case → Domain Model
                ↓
          Detection Port → Satellite Adapter
                         → Sensor Adapter
                ↓
          Save via Repository Port → MongoDB Adapter
```

**Vantagem:** Trocar `satellite_detector` por `radar_detector` sem alterar core!

---

### 4. Tracking Service

**Arquitetura:** CQRS (Command Query Responsibility Segregation)  
**Linguagem:** Go  
**Framework:** Gin  
**Database:** TimescaleDB

#### Por que CQRS?

- **Escrita massiva** - Milhares de posições por segundo
- **Leituras complexas** - Agregações, heatmaps, trajetórias
- Padrões completamente diferentes (write vs read)
- Performance crítica em ambos lados

#### Separação Write/Read

```
┌─────────────┐              ┌─────────────┐
│ Write API   │              │  Read API   │
│             │              │             │
│ POST /pos   │              │ GET /trails │
└──────┬──────┘              └──────┬──────┘
       │                            │
       ▼                            ▼
┌─────────────┐              ┌─────────────┐
│ Write Model │              │ Read Model  │
│             │              │             │
│ Simple      │              │ Denormalized│
│ Inserts     │              │ + Cached    │
└──────┬──────┘              └──────┬──────┘
       │                            │
       ▼                            ▼
┌─────────────────────────────────────┐
│      TimescaleDB Hypertable         │
│                                     │
│  Continuous Aggregates ────────┐    │
│  (auto-generated views)        │    │
└────────────────────────────────┴────┘
```

#### Vantagens

- Write otimizado para INSERT (batch, sem joins)
- Read otimizado para SELECT (agregações pré-computadas)
- Cache independente para reads
- Escalabilidade separada

---

### 5. Event Service

**Arquitetura:** Event Sourcing + CQRS  
**Linguagem:** Java  
**Framework:** Spring Boot  
**Databases:** MongoDB (events) + PostgreSQL (projections)  
**Messaging:** Kafka

#### Por que Event Sourcing?

- **Auditoria completa** - Nunca deletar eventos
- **Reconstrução de estado** - Replay de eventos
- **Análise temporal** - Ver estado em qualquer momento
- **Event-Driven** - Notificar outros serviços

#### Fluxo

```
Command → Aggregate → Events → Event Store (MongoDB)
                                      ↓
                                  Publish to Kafka
                                      ↓
                        ┌─────────────┼─────────────┐
                        ▼             ▼             ▼
                  Projection1   Projection2   Analytics
                  (PostgreSQL)  (PostgreSQL)   Consumer
```

#### Exemplo

```java
// Command
RecordCombatCommand command = new RecordCombatCommand(
  jaegerId, kaijuId, location
);

// Aggregate processa e gera eventos
CombatAggregate aggregate = new CombatAggregate();
aggregate.handle(command);
// → CombatStartedEvent

// Event Store persiste
eventStore.save(event);

// Publica no Kafka
kafka.publish("combat.events", event);

// Projections consomem e atualizam views
projectionUpdater.handle(event);
// → UPDATE combat_statistics SET ...
```

---

### 6. Maintenance Service

**Arquitetura:** Saga Pattern (Orchestrated)  
**Linguagem:** Node.js + TypeScript  
**Framework:** NestJS  
**Databases:** PostgreSQL + Redis  
**Messaging:** RabbitMQ

#### Por que Saga?

- **Processo longo** - Múltiplos passos (aprovação → agendamento → execução)
- **Transação distribuída** - Coordena múltiplos serviços
- **Compensação** - Rollback em caso de falha
- **Estado intermediário** - Precisa ser persistido

#### Saga Steps

```
1. Check Availability
   ├─ Success → 2
   └─ Fail → Compensate: None

2. Request Approval
   ├─ Success → 3
   └─ Fail → Compensate: Release lock

3. Allocate Resources
   ├─ Success → 4
   └─ Fail → Compensate: Cancel approval + Release

4. Schedule
   ├─ Success → 5
   └─ Fail → Compensate: Deallocate + Cancel + Release

5. Execute
   ├─ Success → Complete
   └─ Fail → Compensate: Rollback all
```

#### State Management

```typescript
class MaintenanceSaga {
  private state: SagaState; // Stored in Redis
  
  async execute() {
    for (const step of this.steps) {
      try {
        await step.execute();
        this.state.markCompleted(step);
      } catch (error) {
        await this.compensate();
        throw error;
      }
    }
  }
  
  async compensate() {
    // Executa compensações na ordem reversa
    for (const step of this.state.completedSteps.reverse()) {
      await step.compensate();
    }
  }
}
```

---

### 7. Shatterdome Service

**Arquitetura:** DDD (Domain-Driven Design)  
**Linguagem:** Node.js + TypeScript  
**Framework:** Apollo Server (GraphQL)  
**Database:** PostgreSQL

#### Por que DDD?

- **Domínio rico** - Regras complexas de alocação
- **Agregados** - Shatterdome é aggregate root
- **Invariantes** - Não pode exceder capacidade
- **Domain Events** - Publicar quando alocar Jaeger

#### Tactical Patterns

```typescript
// Aggregate Root
class Shatterdome {
  private allocations: JaegerAllocation[];
  private capacity: Capacity;
  
  // Invariante protegida
  allocateJaeger(jaegerId: JaegerId): Result<void> {
    if (!this.capacity.canAllocate()) {
      return Result.fail(new CapacityExceededError());
    }
    
    this.allocations.push(new JaegerAllocation(jaegerId));
    this.capacity.decrease();
    
    // Domain Event
    this.addEvent(new JaegerAllocatedEvent(this.id, jaegerId));
    
    return Result.ok();
  }
}

// Value Object
class Capacity {
  constructor(
    private readonly max: number,
    private current: number
  ) {}
  
  canAllocate(): boolean {
    return this.current < this.max;
  }
}

// Domain Service
class AllocationService {
  canAllocate(shatterdome: Shatterdome, jaeger: Jaeger): boolean {
    // Lógica complexa que envolve múltiplas entidades
  }
}
```

---

### 8. Analytics Service

**Arquitetura:** Lambda Architecture  
**Linguagem:** Python  
**Framework:** Apache Spark  
**Databases:** PostgreSQL + Redis  
**Messaging:** Kafka

#### Por que Lambda?

- **Batch + Real-time** - Precisa de ambos
- **Volume massivo** - Histórico completo + stream
- **ML** - Treinar modelos e fazer predições
- **Agregações complexas** - Spark é ideal

#### Três Camadas

```
┌──────────────────────────────────────────────────────┐
│                  SERVING LAYER                       │
│            (PostgreSQL + Redis Cache)                │
│                                                      │
│  Combina resultados do Batch + Speed                 │
└────────────┬─────────────────────┬───────────────────┘
             │                     │
    ┌────────▼────────┐   ┌───────▼────────┐
    │  BATCH LAYER    │   │  SPEED LAYER   │
    │                 │   │                │
    │  Apache Spark   │   │ Kafka Streams  │
    │  Daily Jobs     │   │ Real-time      │
    │                 │   │                │
    │  Full History   │   │  Last N hours  │
    └────────┬────────┘   └───────┬────────┘
             │                    │
             └────────┬───────────┘
                      ▼
            ┌──────────────────┐
            │   DATA SOURCE    │
            │  (Event Store)   │
            └──────────────────┘
```

---

## Padrões de Comunicação

### Síncrono (REST/GraphQL)

**Quando usar:**
- Cliente precisa de resposta imediata
- Operações CRUD simples
- Queries

**Serviços:**
- Auth, Jaeger, Kaiju, Tracking (REST)
- Shatterdome (GraphQL)

### Assíncrono (Message Queue)

**Quando usar:**
- Fire-and-forget
- Background processing
- Desacoplamento temporal

**Tecnologia:** RabbitMQ

**Uso:**
- Maintenance Service (workflow)
- Notification Worker
- Report Worker

### Event Streaming

**Quando usar:**
- Event Sourcing
- Analytics
- Múltiplos consumidores
- Replay de eventos

**Tecnologia:** Kafka

**Uso:**
- Event Service → Analytics
- Event Service → Projections
- Real-time updates

---

## Gestão de Dados

### Database per Service

Cada serviço tem seu próprio banco de dados:

| Serviço | Database | Por quê |
|---------|----------|---------|
| Auth | PostgreSQL | Transações ACID, relacional |
| Jaeger | PostgreSQL | Relacional, joins |
| Kaiju | MongoDB | Schema flexível, documents |
| Tracking | TimescaleDB | Time-series, agregações |
| Event (store) | MongoDB | Append-only, flexible schema |
| Event (projections) | PostgreSQL | Queries complexas |
| Maintenance | PostgreSQL | Transações |
| Shatterdome | PostgreSQL | Relacional, DDD |

### Consistência

**Eventual Consistency** em transações distribuídas via:
- Saga Pattern (Maintenance)
- Event Sourcing (Event Service)
- Message Queue (async updates)

---

## Segurança

### Autenticação

```
1. User → Auth Service: Login
2. Auth Service → JWT Token
3. User → API Gateway + JWT
4. API Gateway → Validate Token (Auth Service)
5. API Gateway → Forward to Service (with user context)
```

### Autorização

- **RBAC** (Role-Based Access Control)
- Roles: Admin, Operator, Analyst, Viewer
- Middleware valida permissões por endpoint

### Segredos

- Variáveis de ambiente
- Kubernetes Secrets (produção)
- Nunca commit em código

---

## Observabilidade

### Logs

- Estruturados (JSON)
- Correlation ID em todas requests
- ELK Stack (opcional)

### Métricas

- Prometheus coleta
- Grafana visualiza
- Métricas por serviço:
  - Request rate
  - Error rate
  - Latency (p50, p95, p99)
  - Business metrics

### Tracing

- Distributed tracing (Jaeger - opcional)
- Rastreia requests entre serviços

---

## Escalabilidade

### Horizontal Scaling

Cada serviço pode escalar independentemente:

```yaml
# docker-compose scale
docker-compose up -d --scale jaeger-service=3
```

### Load Balancing

- Nginx (API Gateway)
- Round-robin entre réplicas

### Cache Strategy

- Redis para dados frequentes
- TTL configurável
- Cache-aside pattern

---

## Referências

- [Clean Architecture - Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Hexagonal Architecture - Alistair Cockburn](https://alistair.cockburn.us/hexagonal-architecture/)
- [CQRS - Martin Fowler](https://martinfowler.com/bliki/CQRS.html)
- [Event Sourcing - Martin Fowler](https://martinfowler.com/eaaDev/EventSourcing.html)
- [Saga Pattern - Chris Richardson](https://microservices.io/patterns/data/saga.html)
- [DDD - Eric Evans](https://www.domainlanguage.com/ddd/)
- [Lambda Architecture - Nathan Marz](http://nathanmarz.com/blog/how-to-beat-the-cap-theorem.html)

---

**Última atualização:** 14/12/2025