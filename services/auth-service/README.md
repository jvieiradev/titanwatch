# Auth Service

Serviço de autenticação e autorização do Titan Watch, implementado com Clean Architecture.

## Tech Stack

- **Linguagem:** Go 1.23+
- **Framework:** Chi Router
- **Database:** PostgreSQL
- **Cache:** Redis
- **Auth:** JWT (JSON Web Tokens)

## Arquitetura

Este serviço segue os princípios da **Clean Architecture**:

```
auth-service/
├── cmd/api/              # Entry point da aplicação
├── internal/
│   ├── domain/           # Regras de negócio puras
│   │   ├── entity/       # User, Session entities
│   │   ├── repository/   # Repository interfaces
│   │   └── service/      # Domain services
│   ├── usecase/          # Casos de uso da aplicação
│   ├── infrastructure/   # Implementações externas
│   │   ├── database/     # PostgreSQL implementation
│   │   ├── cache/        # Redis implementation
│   │   └── crypto/       # JWT, bcrypt
│   └── delivery/         # Controllers e handlers
│       └── http/
├── pkg/                  # Código reutilizável
├── migrations/           # Database migrations
└── tests/                # Testes
    ├── unit/
    ├── integration/
    └── e2e/
```

## Funcionalidades

- ✅ Registro de usuários
- ✅ Login com JWT
- ✅ Logout
- ✅ Refresh Token
- ✅ Verificação de Token
- ✅ Middleware de autenticação

## Getting Started

### Pré-requisitos

**Opção 1 (Recomendado - Apenas Docker):**
- Docker
- Docker Compose
- Make (opcional, mas recomendado)

**Opção 2 (Desenvolvimento Local):**
- Go 1.23+
- Docker & Docker Compose (para PostgreSQL e Redis)
- Make (opcional)

### Instalação Rápida (Com Docker - Recomendado)

**Tudo em um comando:**
```bash
make dev
```

Ou manualmente:
```bash
# Inicia TODOS os serviços (PostgreSQL + Redis + App com hot-reload)
docker-compose up --build

# Ou em background
docker-compose up --build -d

# Ver logs
docker-compose logs -f auth-service
```

✨ **O que isso faz:**
- Sobe PostgreSQL e Redis
- Aguarda os serviços ficarem prontos (health checks)
- Executa as migrations automaticamente
- Inicia a aplicação em modo desenvolvimento

### Instalação Local (Sem Dockerizar a App)

Se preferir rodar a aplicação Go localmente:

1. Copie o arquivo de ambiente:
   ```bash
   cp .env.example .env
   ```
2. Inicie apenas as dependências (PostgreSQL + Redis):
   ```bash
   docker-compose up -d postgres-auth redis-auth
   ```
3. Execute as migrations:
   ```bash
   make migrate-up
   ```
4. Inicie o serviço:
   ```bash
   make run
   ```

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Registrar novo usuário
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/auth/verify` - Verificar token

## Comandos Úteis

### Docker (Recomendado)

```bash
# Desenvolvimento
make docker-dev              # Sobe tudo com logs (foreground)
make docker-dev-d            # Sobe tudo em background
make dev                     # Sobe em background e mostra logs da app

# Logs
make docker-logs             # Logs de todos os containers
make docker-logs-app         # Logs apenas da aplicação

# Gerenciamento
make docker-down             # Para todos os containers
make docker-clean            # Para e remove volumes (limpa DB)
make docker-restart          # Reinicia apenas a aplicação
make docker-rebuild          # Rebuild e restart da aplicação

# Shell e Migrations
make docker-shell            # Acessa shell do container
make docker-migrate-up       # Executa migrations via Docker
make docker-migrate-down     # Reverte migrations via Docker

# Testes
make docker-test             # Executa testes dentro do container

# Produção
make docker-prod-build       # Build imagem de produção
make docker-prod-up          # Sobe ambiente de produção
make docker-prod-down        # Para ambiente de produção
```

### Local (Sem Docker na App)

```bash
# Aplicação
make run                     # Executa localmente
make build                   # Compila binário
make deps                    # Baixa dependências

# Migrations
make migrate-up              # Executa migrations
make migrate-down            # Reverte migrations

# Qualidade
make lint                    # Executa linter
make clean                   # Limpa arquivos compilados
```

## Testes

```bash
# Com Docker
make docker-test             # Testes dentro do container

# Local
make test                    # Todos os testes
make test-unit               # Testes unitários
make test-integration        # Testes de integração
make test-e2e                # Testes E2E
make coverage                # Relatório de cobertura
```

## Arquivos de Configuração

- `.env` - Configuração para desenvolvimento local (localhost)
- `.env.docker` - Configuração para Docker (hostnames dos containers)
- `Dockerfile` - Imagem de produção (multi-stage build)
- `Dockerfile.dev` - Imagem de desenvolvimento
- `docker-compose.yml` - Ambiente de desenvolvimento
- `docker-compose.prod.yml` - Ambiente de produção

## Reiniciar após mudanças

Para aplicar mudanças no código, reinicie o container:

```bash
make docker-restart
```

## Troubleshooting

### Porta já em uso
```bash
# Mude as portas no docker-compose.yml
# Ou pare o serviço que está usando a porta
lsof -i :8001  # Descubra o PID
kill -9 <PID>
```

### Erro de permissão no Docker (WSL)
```bash
# Se estiver no WSL e tiver problemas de permissão
sudo chmod -R 777 tmp/
```

### Limpar tudo e começar do zero
```bash
make docker-clean
docker-compose up --build -d
```

## License

MIT
