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

type RegisterUserInput struct {
	Email    string
	Password string
	Name     string
	Role     entity.UserRole
}

type RegisterUserOutput struct {
	UserID string
	Email  string
	Name   string
	Role   string
}

type RegisterUserUseCase struct {
	userRepo          repository.UserRepository
	passwordService   *crypto.PasswordService
	validationService *service.ValidationService
}

func NewRegisterUserUseCase(
	userRepo repository.UserRepository,
	passwordService *crypto.PasswordService,
	validationService *service.ValidationService,
) *RegisterUserUseCase {
	return &RegisterUserUseCase{
		userRepo:          userRepo,
		passwordService:   passwordService,
		validationService: validationService,
	}
}

func (uc *RegisterUserUseCase) Execute(ctx context.Context, input RegisterUserInput) (*RegisterUserOutput, error) {
	// Normalizar email
	input.Email = uc.validationService.NormalizeEmail(input.Email)

	// Validar dados
	if err := uc.validationService.ValidateEmail(input.Email); err != nil {
		return nil, fmt.Errorf("validation error: %w", err)
	}

	if err := uc.validationService.ValidateName(input.Name); err != nil {
		return nil, fmt.Errorf("validation error: %w", err)
	}

	if err := uc.validationService.ValidatePassword(input.Password); err != nil {
		return nil, fmt.Errorf("validation error: %w", err)
	}

	// Validar role
	if !entity.IsValidRole(input.Role) {
		return nil, fmt.Errorf("validation error: invalid role")
	}

	// Verificar se email já existe
	exists, err := uc.userRepo.EmailExists(ctx, input.Email)
	if err != nil {
		return nil, fmt.Errorf("failed to check email existence: %w", err)
	}
	if exists {
		return nil, pkgerrors.ErrUserAlreadyExists
	}

	// Hash da senha
	passwordHash, err := uc.passwordService.Hash(input.Password)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Criar usuário
	user := entity.NewUser(input.Email, passwordHash, input.Name, input.Role)

	// Salvar no banco
	if err := uc.userRepo.Create(ctx, user); err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	return &RegisterUserOutput{
		UserID: user.ID.String(),
		Email:  user.Email,
		Name:   user.Name,
		Role:   string(user.Role),
	}, nil
}
