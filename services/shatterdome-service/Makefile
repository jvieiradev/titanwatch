.PHONY: help dev build start test lint clean

help:
	@echo "Shatterdome Service - Available Commands"
	@echo "  make dev      - Start in development mode"
	@echo "  make build    - Build TypeScript"
	@echo "  make start    - Start production server"
	@echo "  make test     - Run tests"
	@echo "  make lint     - Run linter"
	@echo "  make clean    - Clean build artifacts"

dev:
	docker-compose up --build

build:
	npm run build

start:
	npm start

test:
	npm test

lint:
	npm run lint

clean:
	rm -rf dist node_modules coverage
	docker-compose down -v
