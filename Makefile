# ===================================================================
# TITAN WATCH - Main Makefile
# ===================================================================
#
# This Makefile provides convenient commands for managing the
# Titan Watch microservices architecture.
#
# Usage:
#   make help           Show this help message
#   make setup          Initial project setup
#   make up             Start all services
#   make down           Stop all services
#   make logs           View logs
#
# ===================================================================

.PHONY: help setup up down restart logs clean test

# Default target
.DEFAULT_GOAL := help

# ===================================================================
# COLORS
# ===================================================================

BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m # No Color

# ===================================================================
# HELP
# ===================================================================

help: ## Show this help message
	@echo ""
	@echo "$(BLUE)🤖 TITAN WATCH - Available Commands$(NC)"
	@echo ""
	@echo "$(GREEN)Setup & Initialization:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(GREEN)Quick Links:$(NC)"
	@echo "  Grafana:      http://localhost:3000 (admin/titanwatch_secret)"
	@echo "  Prometheus:   http://localhost:9090"
	@echo "  RabbitMQ:     http://localhost:15672 (titanwatch/titanwatch_secret)"
	@echo "  API Gateway:  http://localhost:80"
	@echo ""

# ===================================================================
# SETUP & INITIALIZATION
# ===================================================================

setup: ## Run initial project setup
	@echo "$(BLUE)Running initial setup...$(NC)"
	@chmod +x setup.sh
	@./setup.sh

init: setup ## Alias for setup

# ===================================================================
# INFRASTRUCTURE MANAGEMENT
# ===================================================================

infra-up: ## Start infrastructure services only
	@echo "$(BLUE)Starting infrastructure services...$(NC)"
	@docker-compose up -d
	@echo "$(GREEN)✓ Infrastructure services started$(NC)"

infra-down: ## Stop infrastructure services
	@echo "$(BLUE)Stopping infrastructure services...$(NC)"
	@docker-compose down
	@echo "$(GREEN)✓ Infrastructure services stopped$(NC)"

infra-restart: ## Restart infrastructure services
	@echo "$(BLUE)Restarting infrastructure services...$(NC)"
	@docker-compose restart
	@echo "$(GREEN)✓ Infrastructure services restarted$(NC)"

infra-logs: ## View infrastructure logs
	@docker-compose logs -f

infra-ps: ## Show infrastructure service status
	@docker-compose ps

# ===================================================================
# ALL SERVICES MANAGEMENT
# ===================================================================

up: ## Start all services (infrastructure + applications)
	@echo "$(BLUE)Starting all services...$(NC)"
	@chmod +x start-all.sh
	@./start-all.sh

down: ## Stop all services
	@echo "$(BLUE)Stopping all services...$(NC)"
	@docker-compose down
	@cd services/auth-service && docker-compose down || true
	@echo "$(GREEN)✓ All services stopped$(NC)"

restart: ## Restart all services
	@$(MAKE) down
	@$(MAKE) up

start: up ## Alias for up

stop: down ## Alias for down

# ===================================================================
# LOGS
# ===================================================================

logs: ## View logs from all services
	@docker-compose logs -f

logs-infra: infra-logs ## View infrastructure logs only

logs-auth: ## View Auth Service logs
	@cd services/auth-service && docker-compose logs -f

# ===================================================================
# CLEANING
# ===================================================================

clean: ## Stop services and remove volumes (WARNING: deletes all data)
	@echo "$(RED)⚠️  This will delete all data. Are you sure? [y/N]$(NC)" && read ans && [ $${ans:-N} = y ]
	@echo "$(BLUE)Cleaning all data...$(NC)"
	@docker-compose down -v
	@cd services/auth-service && docker-compose down -v || true
	@echo "$(GREEN)✓ All data cleaned$(NC)"

clean-images: ## Remove all project images
	@echo "$(BLUE)Removing Docker images...$(NC)"
	@docker-compose down --rmi all
	@cd services/auth-service && docker-compose down --rmi all || true
	@echo "$(GREEN)✓ Images removed$(NC)"

prune: ## Clean up Docker system (images, containers, volumes, networks)
	@echo "$(RED)⚠️  This will clean up Docker system. Continue? [y/N]$(NC)" && read ans && [ $${ans:-N} = y ]
	@docker system prune -af --volumes

# ===================================================================
# MONITORING
# ===================================================================

grafana: ## Open Grafana in browser
	@echo "$(BLUE)Opening Grafana...$(NC)"
	@xdg-open http://localhost:3000 || open http://localhost:3000 || start http://localhost:3000

prometheus: ## Open Prometheus in browser
	@echo "$(BLUE)Opening Prometheus...$(NC)"
	@xdg-open http://localhost:9090 || open http://localhost:9090 || start http://localhost:9090

rabbitmq: ## Open RabbitMQ Management in browser
	@echo "$(BLUE)Opening RabbitMQ...$(NC)"
	@xdg-open http://localhost:15672 || open http://localhost:15672 || start http://localhost:15672

# ===================================================================
# DATABASE MANAGEMENT
# ===================================================================

db-psql: ## Connect to PostgreSQL
	@docker exec -it titanwatch-postgres psql -U titanwatch -d titanwatch

db-mongo: ## Connect to MongoDB
	@docker exec -it titanwatch-mongodb mongosh -u titanwatch -p titanwatch_secret --authenticationDatabase admin

db-redis: ## Connect to Redis CLI
	@docker exec -it titanwatch-redis redis-cli -a titanwatch_secret

db-timescale: ## Connect to TimescaleDB
	@docker exec -it titanwatch-timescaledb psql -U titanwatch -d tracking_db

# ===================================================================
# TESTING
# ===================================================================

test: ## Run all tests
	@echo "$(BLUE)Running tests...$(NC)"
	@$(MAKE) test-auth

test-auth: ## Run Auth Service tests
	@echo "$(BLUE)Running Auth Service tests...$(NC)"
	@cd services/auth-service && make test

test-integration: ## Run integration tests
	@echo "$(BLUE)Running integration tests...$(NC)"
	@cd services/auth-service && make test-integration

test-e2e: ## Run end-to-end tests
	@echo "$(BLUE)Running E2E tests...$(NC)"
	@cd services/auth-service && make test-e2e

# ===================================================================
# DEVELOPMENT
# ===================================================================

dev-auth: ## Start Auth Service in development mode
	@cd services/auth-service && make dev

build: ## Build all services
	@echo "$(BLUE)Building all services...$(NC)"
	@docker-compose build
	@cd services/auth-service && docker-compose build
	@echo "$(GREEN)✓ All services built$(NC)"

rebuild: ## Rebuild all services (no cache)
	@echo "$(BLUE)Rebuilding all services...$(NC)"
	@docker-compose build --no-cache
	@cd services/auth-service && docker-compose build --no-cache
	@echo "$(GREEN)✓ All services rebuilt$(NC)"

# ===================================================================
# UTILITIES
# ===================================================================

ps: ## Show running containers
	@docker ps --filter "name=titanwatch"

stats: ## Show container resource usage
	@docker stats --filter "name=titanwatch"

shell-postgres: ## Access PostgreSQL container shell
	@docker exec -it titanwatch-postgres sh

shell-mongo: ## Access MongoDB container shell
	@docker exec -it titanwatch-mongodb sh

shell-redis: ## Access Redis container shell
	@docker exec -it titanwatch-redis sh

shell-nginx: ## Access Nginx container shell
	@docker exec -it titanwatch-nginx sh

# ===================================================================
# HEALTH CHECKS
# ===================================================================

health: ## Check health of all services
	@echo "$(BLUE)Checking service health...$(NC)"
	@echo ""
	@echo "$(YELLOW)Infrastructure:$(NC)"
	@docker exec titanwatch-postgres pg_isready -U titanwatch && echo "$(GREEN)✓ PostgreSQL$(NC)" || echo "$(RED)✗ PostgreSQL$(NC)"
	@docker exec titanwatch-mongodb mongosh --eval "db.adminCommand('ping')" &> /dev/null && echo "$(GREEN)✓ MongoDB$(NC)" || echo "$(RED)✗ MongoDB$(NC)"
	@docker exec titanwatch-redis redis-cli -a titanwatch_secret ping &> /dev/null && echo "$(GREEN)✓ Redis$(NC)" || echo "$(RED)✗ Redis$(NC)"
	@docker exec titanwatch-timescaledb pg_isready -U titanwatch &> /dev/null && echo "$(GREEN)✓ TimescaleDB$(NC)" || echo "$(RED)✗ TimescaleDB$(NC)"
	@echo ""
	@echo "$(YELLOW)Services:$(NC)"
	@curl -sf http://localhost:3000/api/health &> /dev/null && echo "$(GREEN)✓ Grafana$(NC)" || echo "$(RED)✗ Grafana$(NC)"
	@curl -sf http://localhost:9090/-/healthy &> /dev/null && echo "$(GREEN)✓ Prometheus$(NC)" || echo "$(RED)✗ Prometheus$(NC)"
	@curl -sf http://localhost:80/health &> /dev/null && echo "$(GREEN)✓ Nginx$(NC)" || echo "$(RED)✗ Nginx$(NC)"

# ===================================================================
# DOCUMENTATION
# ===================================================================

docs: ## Open documentation
	@echo "$(BLUE)Documentation available at:$(NC)"
	@echo "  README:        ./README.md"
	@echo "  Architecture:  ./docs/ARCHITECTURE.md"
	@echo "  Roadmap:       ./docs/ROADMAP.md"
	@echo "  Quick Start:   ./QUICK_START.md"

# ===================================================================
# BACKUP & RESTORE
# ===================================================================

backup: ## Backup all databases
	@echo "$(BLUE)Creating database backups...$(NC)"
	@mkdir -p backups
	@docker exec titanwatch-postgres pg_dumpall -U titanwatch > backups/postgres-$$(date +%Y%m%d-%H%M%S).sql
	@docker exec titanwatch-mongodb mongodump --uri="mongodb://titanwatch:titanwatch_secret@localhost:27017/?authSource=admin" --out=/tmp/backup && docker cp titanwatch-mongodb:/tmp/backup backups/mongodb-$$(date +%Y%m%d-%H%M%S)
	@echo "$(GREEN)✓ Backups created in ./backups$(NC)"

# ===================================================================
# VERSION INFO
# ===================================================================

version: ## Show version information
	@echo "$(BLUE)Titan Watch - Version Information$(NC)"
	@echo ""
	@echo "Project Version: 1.0.0"
	@echo "Phase: 0 - Infrastructure Setup"
	@echo ""
	@echo "Docker Version:"
	@docker --version
	@echo ""
	@echo "Docker Compose Version:"
	@docker-compose --version || docker compose version

# ===================================================================
# ENVIRONMENT
# ===================================================================

env: ## Show environment configuration
	@echo "$(BLUE)Environment Configuration:$(NC)"
	@echo ""
	@cat .env 2>/dev/null || echo "$(RED).env file not found. Run 'make setup' first.$(NC)"

env-check: ## Check if .env file exists
	@test -f .env && echo "$(GREEN)✓ .env file exists$(NC)" || echo "$(RED)✗ .env file not found. Run 'make setup' first.$(NC)"
