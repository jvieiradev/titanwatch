package service

import (
	"errors"
	"regexp"
	"strings"
)

var (
	ErrInvalidEmail            = errors.New("email inválido")
	ErrPasswordTooShort        = errors.New("senha deve ter no mínimo 8 caracteres")
	ErrPasswordTooWeak         = errors.New("senha muito fraca - deve conter letras maiúsculas, minúsculas e números")
	ErrNameTooShort            = errors.New("nome deve ter no mínimo 2 caracteres")
	ErrNameTooLong             = errors.New("nome deve ter no máximo 100 caracteres")
)

// ValidationService fornece validações de domínio
type ValidationService struct{}

// NewValidationService cria uma nova instância
func NewValidationService() *ValidationService {
	return &ValidationService{}
}

// ValidateEmail valida formato de email
func (v *ValidationService) ValidateEmail(email string) error {
	email = strings.TrimSpace(strings.ToLower(email))

	if email == "" {
		return ErrInvalidEmail
	}

	// Regex básico para validação de email
	emailRegex := regexp.MustCompile(`^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$`)
	if !emailRegex.MatchString(email) {
		return ErrInvalidEmail
	}

	return nil
}

// ValidatePassword valida força da senha
func (v *ValidationService) ValidatePassword(password string) error {
	if len(password) < 8 {
		return ErrPasswordTooShort
	}

	hasUpper := regexp.MustCompile(`[A-Z]`).MatchString(password)
	hasLower := regexp.MustCompile(`[a-z]`).MatchString(password)
	hasNumber := regexp.MustCompile(`[0-9]`).MatchString(password)

	if !hasUpper || !hasLower || !hasNumber {
		return ErrPasswordTooWeak
	}

	return nil
}

// ValidateName valida nome do usuário
func (v *ValidationService) ValidateName(name string) error {
	name = strings.TrimSpace(name)

	if len(name) < 2 {
		return ErrNameTooShort
	}

	if len(name) > 100 {
		return ErrNameTooLong
	}

	return nil
}

// NormalizeEmail normaliza email (lowercase, trim)
func (v *ValidationService) NormalizeEmail(email string) string {
	return strings.TrimSpace(strings.ToLower(email))
}
