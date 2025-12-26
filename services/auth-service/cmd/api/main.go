package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/jvieiradev/titanwatch/auth-service/internal/delivery/http/handler"
	"github.com/jvieiradev/titanwatch/auth-service/internal/delivery/http/middleware"
	"github.com/jvieiradev/titanwatch/auth-service/internal/delivery/http/router"
	"github.com/jvieiradev/titanwatch/auth-service/internal/domain/service"
	"github.com/jvieiradev/titanwatch/auth-service/internal/infrastructure/cache"
	"github.com/jvieiradev/titanwatch/auth-service/internal/infrastructure/crypto"
	"github.com/jvieiradev/titanwatch/auth-service/internal/infrastructure/database"
	"github.com/jvieiradev/titanwatch/auth-service/internal/usecase"
	"github.com/jvieiradev/titanwatch/auth-service/pkg/config"
)

func main() {
	// Carregar configurações
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	log.Printf("Starting Auth Service in %s mode...", cfg.Env)

	// Conectar ao PostgreSQL
	db, err := database.NewPostgresConnection(cfg.GetDSN())
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()
	log.Println("✓ Connected to PostgreSQL")

	// Conectar ao Redis
	redisClient, err := cache.NewRedisClient(cfg.GetRedisAddr(), cfg.Redis.Password, cfg.Redis.DB)
	if err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}
	defer redisClient.Close()
	log.Println("✓ Connected to Redis")

	// Inicializar serviços de infraestrutura
	passwordService := crypto.NewPasswordService()
	jwtService := crypto.NewJWTService(
		cfg.JWT.Secret,
		cfg.JWT.AccessTokenExpiry,
		cfg.JWT.RefreshTokenExpiry,
	)
	log.Println("✓ Initialized crypto services")

	// Inicializar repositórios
	userRepo := database.NewPostgresUserRepository(db)
	sessionRepo := database.NewPostgresSessionRepository(db)
	log.Println("✓ Initialized repositories")

	// Inicializar domain services
	validationService := service.NewValidationService()

	// Inicializar use cases
	registerUseCase := usecase.NewRegisterUserUseCase(userRepo, passwordService, validationService)
	loginUseCase := usecase.NewLoginUseCase(userRepo, sessionRepo, passwordService, jwtService, validationService)
	logoutUseCase := usecase.NewLogoutUseCase(sessionRepo)
	refreshTokenUseCase := usecase.NewRefreshTokenUseCase(userRepo, sessionRepo, jwtService)
	verifyTokenUseCase := usecase.NewVerifyTokenUseCase(userRepo, jwtService)
	log.Println("✓ Initialized use cases")

	// Inicializar handlers
	authHandler := handler.NewAuthHandler(
		registerUseCase,
		loginUseCase,
		logoutUseCase,
		refreshTokenUseCase,
		verifyTokenUseCase,
	)

	// Inicializar middlewares
	authMiddleware := middleware.NewAuthMiddleware(jwtService)

	// Configurar rotas
	r := router.SetupRoutes(authHandler, authMiddleware)
	log.Println("✓ Routes configured")

	// Iniciar servidor HTTP
	addr := fmt.Sprintf("%s:%s", cfg.Server.Host, cfg.Server.Port)
	server := &http.Server{
		Addr:         addr,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Canal para capturar erros do servidor
	serverErrors := make(chan error, 1)

	// Iniciar servidor em goroutine
	go func() {
		log.Printf("🚀 Auth Service listening on %s", addr)
		serverErrors <- server.ListenAndServe()
	}()

	// Canal para capturar sinais do OS
	shutdown := make(chan os.Signal, 1)
	signal.Notify(shutdown, os.Interrupt, syscall.SIGTERM)

	// Bloquear até receber erro ou sinal de shutdown
	select {
	case err := <-serverErrors:
		log.Fatalf("Server error: %v", err)
	case sig := <-shutdown:
		log.Printf("Received signal %v, starting graceful shutdown...", sig)

		// Dar tempo para requisições em andamento finalizarem
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()

		if err := server.Shutdown(ctx); err != nil {
			log.Printf("Error during shutdown: %v", err)
			server.Close()
		}

		log.Println("✓ Server stopped gracefully")
	}
}
