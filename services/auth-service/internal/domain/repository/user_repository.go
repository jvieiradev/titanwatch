package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/jvieiradev/titanwatch/auth-service/internal/domain/entity"
)

// UserRepository define o contrato para operações de usuário
type UserRepository interface {
	// Create cria um novo usuário
	Create(ctx context.Context, user *entity.User) error

	// GetByID busca usuário por ID
	GetByID(ctx context.Context, id uuid.UUID) (*entity.User, error)

	// GetByEmail busca usuário por email
	GetByEmail(ctx context.Context, email string) (*entity.User, error)

	// Update atualiza um usuário
	Update(ctx context.Context, user *entity.User) error

	// Delete deleta um usuário
	Delete(ctx context.Context, id uuid.UUID) error

	// List lista usuários com paginação
	List(ctx context.Context, limit, offset int) ([]*entity.User, error)

	// EmailExists verifica se um email já está cadastrado
	EmailExists(ctx context.Context, email string) (bool, error)
}
