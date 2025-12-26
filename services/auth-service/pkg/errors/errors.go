package errors

import "errors"

// Domain errors
var (
	// User errors
	ErrUserNotFound      = errors.New("usuário não encontrado")
	ErrUserAlreadyExists = errors.New("usuário já existe")
	ErrUserInactive      = errors.New("usuário inativo")

	// Auth errors
	ErrInvalidCredentials = errors.New("credenciais inválidas")
	ErrInvalidToken       = errors.New("token inválido")
	ErrExpiredToken       = errors.New("token expirado")
	ErrTokenRevoked       = errors.New("token revogado")

	// Session errors
	ErrSessionNotFound = errors.New("sessão não encontrada")
	ErrSessionExpired  = errors.New("sessão expirada")
	ErrSessionRevoked  = errors.New("sessão revogada")

	// Generic errors
	ErrInternalServer = errors.New("erro interno do servidor")
	ErrBadRequest     = errors.New("requisição inválida")
)
