#!/bin/bash

# ===================================================================
# TITAN WATCH - Initial Setup Script
# ===================================================================
#
# This script performs the initial setup for the Titan Watch project
#
# Usage:
#   ./setup.sh
#
# What it does:
#   1. Checks prerequisites (Docker, Docker Compose)
#   2. Creates .env file from .env.example
#   3. Creates necessary directories
#   4. Sets proper permissions
#   5. Pulls and builds Docker images
#   6. Initializes databases
#   7. Displays access information
#
# ===================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Header
echo "======================================================================="
echo "              🤖 TITAN WATCH - Initial Setup                          "
echo "======================================================================="
echo ""

# ===================================================================
# 1. Check Prerequisites
# ===================================================================

log_info "Checking prerequisites..."

# Check Docker
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed. Please install Docker first."
    exit 1
fi
log_success "Docker found: $(docker --version)"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    log_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi
log_success "Docker Compose found"

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    log_error "Docker daemon is not running. Please start Docker."
    exit 1
fi
log_success "Docker daemon is running"

echo ""

# ===================================================================
# 2. Create Environment File
# ===================================================================

log_info "Setting up environment variables..."

if [ ! -f .env ]; then
    log_info "Creating .env file from .env.example..."
    cp .env.example .env
    log_success ".env file created"
    log_warning "Please review and update .env file with your configuration"
else
    log_warning ".env file already exists, skipping creation"
fi

echo ""

# ===================================================================
# 3. Create Necessary Directories
# ===================================================================

log_info "Creating necessary directories..."

# Create data directories
mkdir -p data/{postgres,mongodb,redis,timescaledb,rabbitmq,kafka,zookeeper,prometheus,grafana}
mkdir -p logs

# Create infrastructure directories (if not exists)
mkdir -p infrastructure/{nginx/{conf.d,ssl},prometheus/alerts,grafana/{provisioning/{datasources,dashboards},dashboards}}

log_success "Directories created"

echo ""

# ===================================================================
# 4. Set Permissions
# ===================================================================

log_info "Setting proper permissions..."

# Make init scripts executable
chmod +x infrastructure/docker/postgres/init-multiple-databases.sh

# Set permissions for data directories (for Linux/macOS)
if [[ "$OSTYPE" != "msys" && "$OSTYPE" != "win32" ]]; then
    chmod -R 755 data/
    chmod -R 755 logs/
fi

log_success "Permissions set"

echo ""

# ===================================================================
# 5. Pull Docker Images
# ===================================================================

log_info "Pulling Docker images (this may take a while)..."

docker-compose pull

log_success "Docker images pulled"

echo ""

# ===================================================================
# 6. Build Custom Images (if any)
# ===================================================================

log_info "Building custom images..."

# Build Auth Service (if exists)
if [ -d "services/auth-service" ]; then
    log_info "Building Auth Service..."
    cd services/auth-service
    docker-compose build
    cd ../..
fi

log_success "Custom images built"

echo ""

# ===================================================================
# 7. Start Infrastructure
# ===================================================================

log_info "Starting infrastructure services..."

docker-compose up -d

log_success "Infrastructure services started"

echo ""

# ===================================================================
# 8. Wait for Services to be Ready
# ===================================================================

log_info "Waiting for services to be ready..."

# Wait for PostgreSQL
log_info "Waiting for PostgreSQL..."
timeout 60 bash -c 'until docker exec titanwatch-postgres pg_isready -U titanwatch &> /dev/null; do sleep 1; done' || {
    log_error "PostgreSQL failed to start"
    exit 1
}
log_success "PostgreSQL is ready"

# Wait for MongoDB
log_info "Waiting for MongoDB..."
timeout 60 bash -c 'until docker exec titanwatch-mongodb mongosh --eval "db.adminCommand(\"ping\")" &> /dev/null; do sleep 1; done' || {
    log_error "MongoDB failed to start"
    exit 1
}
log_success "MongoDB is ready"

# Wait for Redis
log_info "Waiting for Redis..."
timeout 60 bash -c 'until docker exec titanwatch-redis redis-cli -a titanwatch_secret ping &> /dev/null; do sleep 1; done' || {
    log_error "Redis failed to start"
    exit 1
}
log_success "Redis is ready"

# Wait for RabbitMQ
log_info "Waiting for RabbitMQ..."
sleep 10
log_success "RabbitMQ should be ready"

# Wait for Kafka
log_info "Waiting for Kafka..."
sleep 15
log_success "Kafka should be ready"

echo ""

# ===================================================================
# 9. Display Access Information
# ===================================================================

echo "======================================================================="
echo "              🎉 SETUP COMPLETED SUCCESSFULLY!                        "
echo "======================================================================="
echo ""
log_success "Titan Watch infrastructure is now running!"
echo ""
echo "Access Information:"
echo "-------------------"
echo ""
echo "📊 Monitoring & Management:"
echo "  • Grafana:         http://localhost:3000 (admin/titanwatch_secret)"
echo "  • Prometheus:      http://localhost:9090"
echo "  • RabbitMQ:        http://localhost:15672 (titanwatch/titanwatch_secret)"
echo ""
echo "🗄️  Databases:"
echo "  • PostgreSQL:      localhost:5432 (titanwatch/titanwatch_secret)"
echo "  • MongoDB:         localhost:27017 (titanwatch/titanwatch_secret)"
echo "  • Redis:           localhost:6379 (password: titanwatch_secret)"
echo "  • TimescaleDB:     localhost:5433 (titanwatch/titanwatch_secret)"
echo ""
echo "📨 Message Brokers:"
echo "  • RabbitMQ AMQP:   localhost:5672"
echo "  • Kafka:           localhost:29092"
echo "  • Zookeeper:       localhost:2181"
echo ""
echo "🌐 API Gateway:"
echo "  • Nginx:           http://localhost:80"
echo ""
echo "Next Steps:"
echo "-----------"
echo "1. Review and update .env file if needed"
echo "2. Start individual services (see services/*/README.md)"
echo "3. Run 'make help' to see available commands"
echo "4. Check documentation in docs/ folder"
echo ""
echo "To start all services:"
echo "  ./start-all.sh"
echo ""
echo "To stop infrastructure:"
echo "  docker-compose down"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f"
echo ""
echo "======================================================================="
