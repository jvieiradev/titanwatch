package usecase

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jvieiradev/titanwatch/auth-service/internal/domain/repository"
)

type LogoutInput struct {
	UserID uuid.UUID
}

type LogoutUseCase struct {
	sessionRepo repository.SessionRepository
}

func NewLogoutUseCase(sessionRepo repository.SessionRepository) *LogoutUseCase {
	return &LogoutUseCase{
		sessionRepo: sessionRepo,
	}
}

func (uc *LogoutUseCase) Execute(ctx context.Context, input LogoutInput) error {
	// Revogar todas as sessões do usuário
	if err := uc.sessionRepo.RevokeAllByUserID(ctx, input.UserID); err != nil {
		return fmt.Errorf("failed to revoke sessions: %w", err)
	}

	return nil
}
