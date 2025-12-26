package usecase

import (
	"context"
	"fmt"

	"github.com/jvieiradev/titanwatch/auth-service/internal/domain/entity"
	"github.com/jvieiradev/titanwatch/auth-service/internal/domain/repository"
	"github.com/jvieiradev/titanwatch/auth-service/internal/infrastructure/crypto"
	pkgerrors "github.com/jvieiradev/titanwatch/auth-service/pkg/errors"
)

type RefreshTokenInput struct {
	RefreshToken string
}

type RefreshTokenOutput struct {
	AccessToken  string
	RefreshToken string
}

type RefreshTokenUseCase struct {
	userRepo    repository.UserRepository
	sessionRepo repository.SessionRepository
	jwtService  *crypto.JWTService
}

func NewRefreshTokenUseCase(
	userRepo repository.UserRepository,
	sessionRepo repository.SessionRepository,
	jwtService *crypto.JWTService,
) *RefreshTokenUseCase {
	return &RefreshTokenUseCase{
		userRepo:    userRepo,
		sessionRepo: sessionRepo,
		jwtService:  jwtService,
	}
}

func (uc *RefreshTokenUseCase) Execute(ctx context.Context, input RefreshTokenInput) (*RefreshTokenOutput, error) {
	// Buscar sessão pelo refresh token
	session, err := uc.sessionRepo.GetByRefreshToken(ctx, input.RefreshToken)
	if err != nil {
		return nil, pkgerrors.ErrInvalidToken
	}

	// Verificar se sessão é válida
	if !session.IsValid() {
		if session.IsRevoked {
			return nil, pkgerrors.ErrTokenRevoked
		}
		return nil, pkgerrors.ErrExpiredToken
	}

	// Buscar usuário
	user, err := uc.userRepo.GetByID(ctx, session.UserID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	// Verificar se usuário está ativo
	if !user.IsActive {
		return nil, pkgerrors.ErrUserInactive
	}

	// Gerar novo access token
	accessToken, err := uc.jwtService.GenerateAccessToken(user.ID, user.Email, string(user.Role))
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token: %w", err)
	}

	// Gerar novo refresh token
	newRefreshToken, expiresAt, err := uc.jwtService.GenerateRefreshToken(user.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to generate refresh token: %w", err)
	}

	// Revogar sessão antiga
	session.Revoke()
	if err := uc.sessionRepo.Update(ctx, session); err != nil {
		return nil, fmt.Errorf("failed to revoke old session: %w", err)
	}

	// Criar nova sessão
	newSession := entity.NewSession(user.ID, newRefreshToken, expiresAt)
	if err := uc.sessionRepo.Create(ctx, newSession); err != nil {
		return nil, fmt.Errorf("failed to create new session: %w", err)
	}

	return &RefreshTokenOutput{
		AccessToken:  accessToken,
		RefreshToken: newRefreshToken,
	}, nil
}
