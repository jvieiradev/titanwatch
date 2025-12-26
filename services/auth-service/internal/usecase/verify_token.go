package usecase

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jvieiradev/titanwatch/auth-service/internal/domain/repository"
	"github.com/jvieiradev/titanwatch/auth-service/internal/infrastructure/crypto"
	pkgerrors "github.com/jvieiradev/titanwatch/auth-service/pkg/errors"
)

type VerifyTokenInput struct {
	AccessToken string
}

type VerifyTokenOutput struct {
	UserID uuid.UUID
	Email  string
	Role   string
	Valid  bool
}

type VerifyTokenUseCase struct {
	userRepo   repository.UserRepository
	jwtService *crypto.JWTService
}

func NewVerifyTokenUseCase(
	userRepo repository.UserRepository,
	jwtService *crypto.JWTService,
) *VerifyTokenUseCase {
	return &VerifyTokenUseCase{
		userRepo:   userRepo,
		jwtService: jwtService,
	}
}

func (uc *VerifyTokenUseCase) Execute(ctx context.Context, input VerifyTokenInput) (*VerifyTokenOutput, error) {
	// Validar token
	claims, err := uc.jwtService.ValidateAccessToken(input.AccessToken)
	if err != nil {
		return nil, err
	}

	// Buscar usuário para garantir que ainda existe e está ativo
	user, err := uc.userRepo.GetByID(ctx, claims.UserID)
	if err != nil {
		return nil, fmt.Errorf("user not found: %w", pkgerrors.ErrInvalidToken)
	}

	// Verificar se usuário está ativo
	if !user.IsActive {
		return nil, pkgerrors.ErrUserInactive
	}

	return &VerifyTokenOutput{
		UserID: user.ID,
		Email:  user.Email,
		Role:   string(user.Role),
		Valid:  true,
	}, nil
}
