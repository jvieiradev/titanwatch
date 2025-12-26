.PHONY: help run build test test-unit test-integration test-e2e coverage clean docker-up docker-down migrate-up migrate-down

help: ## Mostra este help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ==================== Comandos Locais (sem Docker) ====================

run: ## Executa a aplicação localmente (sem Docker)
	go run cmd/api/main.go

build: ## Compila a aplicação
	go build -o bin/auth-service cmd/api/main.go

migrate-up: ## Executa migrations localmente
	@echo "Running migrations..."
	go run cmd/migrate/main.go up

migrate-down: ## Reverte migrations localmente
	@echo "Reverting migrations..."
	go run cmd/migrate/main.go down

deps: ## Baixa dependências
	go mod download
	go mod tidy

lint: ## Executa linter
	golangci-lint run

# ==================== Comandos Docker (Recomendado) ====================

docker-dev: ## Sobe TUDO com Docker (PostgreSQL + Redis + App com hot-reload)
	docker-compose up --build

docker-dev-d: ## Sobe TUDO com Docker em background
	docker-compose up --build -d

docker-logs: ## Mostra logs dos containers
	docker-compose logs -f

docker-logs-app: ## Mostra logs apenas da aplicação
	docker-compose logs -f auth-service

docker-down: ## Para todos os containers
	docker-compose down

docker-clean: ## Para containers e remove volumes
	docker-compose down -v

docker-restart: ## Reinicia a aplicação
	docker-compose restart auth-service

docker-rebuild: ## Rebuild e restart da aplicação
	docker-compose up --build -d auth-service

docker-shell: ## Acessa shell do container da aplicação
	docker-compose exec auth-service sh

docker-migrate-up: ## Executa migrations via Docker
	docker-compose exec auth-service go run cmd/migrate/main.go up

docker-migrate-down: ## Reverte migrations via Docker
	docker-compose exec auth-service go run cmd/migrate/main.go down

docker-test: ## Executa testes dentro do container
	docker-compose exec auth-service go test -v -race ./...

# ==================== Produção ====================

docker-prod-build: ## Build imagem de produção
	docker build -t titanwatch-auth-service:latest -f Dockerfile .

docker-prod-up: ## Sobe ambiente de produção
	docker-compose -f docker-compose.prod.yml up -d

docker-prod-down: ## Para ambiente de produção
	docker-compose -f docker-compose.prod.yml down

# ==================== Testes ====================

test: ## Executa todos os testes
	go test -v -race -coverprofile=coverage.txt -covermode=atomic ./...

test-unit: ## Executa testes unitários
	go test -v -race ./tests/unit/...

test-integration: ## Executa testes de integração
	go test -v -race ./tests/integration/...

test-e2e: ## Executa testes E2E
	go test -v -race ./tests/e2e/...

coverage: test ## Gera relatório de cobertura
	go tool cover -html=coverage.txt -o coverage.html
	@echo "Coverage report generated: coverage.html"

# ==================== Limpeza ====================

clean: ## Limpa arquivos compilados
	rm -rf bin/
	rm -f coverage.txt coverage.html
	rm -rf tmp/

# ==================== Atalhos ====================

dev: docker-dev-d docker-logs-app ## Inicia ambiente completo e mostra logs
