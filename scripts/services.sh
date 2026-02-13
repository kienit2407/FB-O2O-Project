#!/bin/bash

# FaB-O2O Microservices Management Script

SERVICES=("api-gateway" "auth-service" "user-service" "merchant-service" "order-service" "ride-service" "payment-service" "notification-service" "promotion-service" "search-service")

case $1 in
  install)
    echo "📦 Installing dependencies for all services..."
    for service in "${SERVICES[@]}"; do
      echo "  → $service"
      cd "apps/$service" && pnpm install --ignore-workspace && cd ../..
    done
    cd "apps/ai-service" && pip install -r requirements.txt
    echo "✅ Installation complete!"
    ;;

  dev)
    if [ -z "$2" ]; then
      echo "🚀 Starting all services in development mode..."
      for service in "${SERVICES[@]}"; do
        cd "apps/$service" && pnpm dev &
      done
      echo "✅ All services started!"
    else
      echo "🚀 Starting $2 in development mode..."
      cd "apps/$2" && pnpm dev
    fi
    ;;

  build)
    echo "🔨 Building all services..."
    for service in "${SERVICES[@]}"; do
      echo "  → $service"
      cd "apps/$service" && pnpm build && cd ../..
    done
    echo "✅ Build complete!"
    ;;

  docker)
    echo "🐳 Starting Docker Compose..."
    docker-compose up -d
    echo "✅ Docker Compose started!"
    ;;

  docker-stop)
    echo "🛑 Stopping Docker Compose..."
    docker-compose down
    echo "✅ Docker Compose stopped!"
    ;;

  status)
    echo "📊 Services Status:"
    echo ""
    echo "NestJS Services:"
    for service in "${SERVICES[@]}"; do
      if [ -d "apps/$service" ]; then
        echo "  ✅ $service"
      else
        echo "  ❌ $service (missing)"
      fi
    done
    echo ""
    echo "Python Services:"
    if [ -d "apps/ai-service" ]; then
      echo "  ✅ ai-service"
    else
      echo "  ❌ ai-service (missing)"
    fi
    echo ""
    echo "Frontend:"
    if [ -d "apps/web" ]; then
      echo "  ✅ web (React)"
    else
      echo "  ❌ web (React) (missing)"
    fi
    if [ -d "apps/mobile" ]; then
      echo "  ✅ mobile (Flutter)"
    else
      echo "  ❌ mobile (Flutter) (missing)"
    fi
    ;;

  *)
    echo "FaB-O2O Microservices Management"
    echo ""
    echo "Usage: ./scripts/services.sh [command] [service]"
    echo ""
    echo "Commands:"
    echo "  install          Install dependencies for all services"
    echo "  dev [service]    Start all services or specific service in dev mode"
    echo "  build            Build all services"
    echo "  docker           Start Docker Compose (all services + infra)"
    echo "  docker-stop      Stop Docker Compose"
    echo "  status           Show services status"
    echo ""
    echo "Examples:"
    echo "  ./scripts/services.sh install"
    echo "  ./scripts/services.sh dev"
    echo "  ./scripts/services.sh dev auth-service"
    echo "  ./scripts/services.sh docker"
    ;;
esac
