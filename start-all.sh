#!/bin/bash

# ===================================================================
# TITAN WATCH - Start All Services Script
# ===================================================================
#
# This script starts all infrastructure and application services
#
# Usage:
#   ./start-all.sh [OPTIONS]
#
# Options:
#   --build     Build images before starting
#   --clean     Remove volumes before starting (fresh start)
#   --detach    Run in detached mode (default)
#   --logs      Follow logs after starting
#
# ===================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default options
BUILD=false
CLEAN=false
DETACH=true
FOLLOW_LOGS=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --build)
            BUILD=true
            shift
            ;;
        --clean)
            CLEAN=true
            shift
            ;;
        --detach)
            DETACH=true
            shift
            ;;
        --logs)
            FOLLOW_LOGS=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--build] [--clean] [--detach] [--logs]"
            exit 1
            ;;
    esac
done

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
echo "              🤖 TITAN WATCH - Starting All Services                  "
echo "======================================================================="
echo ""

# ===================================================================
# 1. Check if setup has been run
# ===================================================================

if [ ! -f .env ]; then
    log_error ".env file not found. Please run ./setup.sh first."
    exit 1
fi

# ===================================================================
# 2. Clean volumes if requested
# ===================================================================

if [ "$CLEAN" = true ]; then
    log_warning "Cleaning all volumes (this will delete all data)..."
    docker-compose down -v
    log_success "Volumes cleaned"
    echo ""
fi

# ===================================================================
# 3. Start Infrastructure Services
# ===================================================================

log_info "Starting infrastructure services..."

if [ "$BUILD" = true ]; then
    docker-compose up --build -d
else
    docker-compose up -d
fi

log_success "Infrastructure services started"

echo ""

# ===================================================================
# 4. Wait for Infrastructure to be Ready
# ===================================================================

log_info "Waiting for infrastructure to be ready..."

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

# Wait for other services
log_info "Waiting for other infrastructure services..."
sleep 15

echo ""

# ===================================================================
# 5. Start Application Services
# ===================================================================

log_info "Starting application services..."

# Start Auth Service
if [ -d "services/auth-service" ]; then
    log_info "Starting Auth Service..."
    cd services/auth-service
    if [ "$BUILD" = true ]; then
        docker-compose up --build -d
    else
        docker-compose up -d
    fi
    cd ../..
    log_success "Auth Service started"
fi

# Start Jaeger Service (when implemented)
# if [ -d "services/jaeger-service" ]; then
#     log_info "Starting Jaeger Service..."
#     cd services/jaeger-service
#     docker-compose up -d
#     cd ../..
#     log_success "Jaeger Service started"
# fi

# Start Shatterdome Service (when implemented)
# if [ -d "services/shatterdome-service" ]; then
#     log_info "Starting Shatterdome Service..."
#     cd services/shatterdome-service
#     docker-compose up -d
#     cd ../..
#     log_success "Shatterdome Service started"
# fi

# Add other services as they are implemented...

echo ""

# ===================================================================
# 6. Display Service Status
# ===================================================================

log_info "Checking service status..."
echo ""

docker-compose ps

echo ""

# ===================================================================
# 7. Display Access Information
# ===================================================================

echo "======================================================================="
echo "              🎉 ALL SERVICES STARTED!                                "
echo "======================================================================="
echo ""
echo "📊 Monitoring & Management:"
echo "  • Grafana:         http://localhost:3000 (admin/titanwatch_secret)"
echo "  • Prometheus:      http://localhost:9090"
echo "  • RabbitMQ:        http://localhost:15672 (titanwatch/titanwatch_secret)"
echo ""
echo "🌐 API Gateway:"
echo "  • Nginx:           http://localhost:80"
echo ""
echo "🔧 Application Services:"
echo "  • Auth Service:    http://localhost:8001"
echo "  • API Docs:        http://localhost:8001/swagger"
echo ""
echo "Useful Commands:"
echo "----------------"
echo "  • View logs:           docker-compose logs -f"
echo "  • View specific logs:  docker-compose logs -f <service-name>"
echo "  • Stop all:            docker-compose down"
echo "  • Restart service:     docker-compose restart <service-name>"
echo ""
echo "======================================================================="

# ===================================================================
# 8. Follow Logs if Requested
# ===================================================================

if [ "$FOLLOW_LOGS" = true ]; then
    echo ""
    log_info "Following logs (press Ctrl+C to exit)..."
    echo ""
    docker-compose logs -f
fi
