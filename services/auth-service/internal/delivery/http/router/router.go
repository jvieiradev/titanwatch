package router

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"

	"github.com/jvieiradev/titanwatch/auth-service/internal/delivery/http/handler"
	"github.com/jvieiradev/titanwatch/auth-service/internal/delivery/http/middleware"
)

// SetupRoutes configura todas as rotas da aplicação
func SetupRoutes(
	authHandler *handler.AuthHandler,
	authMiddleware *middleware.AuthMiddleware,
) *chi.Mux {
	r := chi.NewRouter()

	// Middlewares globais
	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.RealIP)
	r.Use(chimiddleware.Recoverer)
	r.Use(middleware.Logger)
	r.Use(middleware.NewCORS().Handler)

	// Health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(200)
		w.Write([]byte("OK"))
	})

	// API routes
	r.Route("/api/v1", func(r chi.Router) {
		// Rotas públicas de autenticação
		r.Route("/auth", func(r chi.Router) {
			r.Post("/register", authHandler.Register)
			r.Post("/login", authHandler.Login)
			r.Post("/refresh", authHandler.RefreshToken)
			r.Get("/verify", authHandler.VerifyToken)

			// Rotas protegidas
			r.Group(func(r chi.Router) {
				r.Use(authMiddleware.Authenticate)
				r.Post("/logout", authHandler.Logout)
			})
		})
	})

	return r
}
