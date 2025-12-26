package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/jvieiradev/titanwatch/auth-service/internal/domain/entity"
)

// SessionRepository define o contrato para operações de sessão
type SessionRepository interface {
	// Create cria uma nova sessão
	Create(ctx context.Context, session *entity.Session) error

	// GetByRefreshToken busca sessão por refresh token
	GetByRefreshToken(ctx context.Context, refreshToken string) (*entity.Session, error)

	// GetByUserID busca todas as sessões de um usuário
	GetByUserID(ctx context.Context, userID uuid.UUID) ([]*entity.Session, error)

	// Update atualiza uma sessão
	Update(ctx context.Context, session *entity.Session) error

	// Delete deleta uma sessão
	Delete(ctx context.Context, id uuid.UUID) error

	// RevokeAllByUserID revoga todas as sessões de um usuário
	RevokeAllByUserID(ctx context.Context, userID uuid.UUID) error

	// DeleteExpired deleta sessões expiradas
	DeleteExpired(ctx context.Context) error
}
