package usecase

import (
	"context"
	"fmt"

	"github.com/jvieiradev/titanwatch/auth-service/internal/domain/entity"
	"github.com/jvieiradev/titanwatch/auth-service/internal/domain/repository"
	"github.com/jvieiradev/titanwatch/auth-service/internal/domain/service"
	"github.com/jvieiradev/titanwatch/auth-service/internal/infrastructure/crypto"
	pkgerrors "github.com/jvieiradev/titanwatch/auth-service/pkg/errors"
)

type LoginInput struct {
	Email    string
	Password string
}

type LoginOutput struct {
	AccessToken  string
	RefreshToken string
	User         UserDTO
}

type UserDTO struct {
	ID    string
	Email string
	Name  string
	Role  string
}

type LoginUseCase struct {
	userRepo          repository.UserRepository
	sessionRepo       repository.SessionRepository
	passwordService   *crypto.PasswordService
	jwtService        *crypto.JWTService
	validationService *service.ValidationService
}

func NewLoginUseCase(
	userRepo repository.UserRepository,
	sessionRepo repository.SessionRepository,
	passwordService *crypto.PasswordService,
	jwtService *crypto.JWTService,
	validationService *service.ValidationService,
) *LoginUseCase {
	return &LoginUseCase{
		userRepo:          userRepo,
		sessionRepo:       sessionRepo,
		passwordService:   passwordService,
		jwtService:        jwtService,
		validationService: validationService,
	}
}

func (uc *LoginUseCase) Execute(ctx context.Context, input LoginInput) (*LoginOutput, error) {
	// Normalizar email
	input.Email = uc.validationService.NormalizeEmail(input.Email)

	// Buscar usuário por email
	user, err := uc.userRepo.GetByEmail(ctx, input.Email)
	if err != nil {
		return nil, pkgerrors.ErrInvalidCredentials
	}

	// Verificar se usuário está ativo
	if !user.IsActive {
		return nil, pkgerrors.ErrUserInactive
	}

	// Verificar senha
	if err := uc.passwordService.Compare(user.PasswordHash, input.Password); err != nil {
		return nil, pkgerrors.ErrInvalidCredentials
	}

	// Gerar access token
	accessToken, err := uc.jwtService.GenerateAccessToken(user.ID, user.Email, string(user.Role))
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token: %w", err)
	}

	// Gerar refresh token
	refreshToken, expiresAt, err := uc.jwtService.GenerateRefreshToken(user.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to generate refresh token: %w", err)
	}

	// Criar sessão
	session := entity.NewSession(user.ID, refreshToken, expiresAt)
	if err := uc.sessionRepo.Create(ctx, session); err != nil {
		return nil, fmt.Errorf("failed to create session: %w", err)
	}

	return &LoginOutput{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User: UserDTO{
			ID:    user.ID.String(),
			Email: user.Email,
			Name:  user.Name,
			Role:  string(user.Role),
		},
	}, nil
}
