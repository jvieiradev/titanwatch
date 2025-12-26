package entity

import (
	"time"

	"github.com/google/uuid"
)

// User representa um usuário do sistema
type User struct {
	ID           uuid.UUID
	Email        string
	PasswordHash string
	Name         string
	Role         UserRole
	IsActive     bool
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

// UserRole representa os papéis disponíveis no sistema
type UserRole string

const (
	RoleAdmin    UserRole = "admin"
	RoleOperator UserRole = "operator"
	RoleAnalyst  UserRole = "analyst"
	RoleViewer   UserRole = "viewer"
)

// NewUser cria uma nova instância de User
func NewUser(email, passwordHash, name string, role UserRole) *User {
	now := time.Now()
	return &User{
		ID:           uuid.New(),
		Email:        email,
		PasswordHash: passwordHash,
		Name:         name,
		Role:         role,
		IsActive:     true,
		CreatedAt:    now,
		UpdatedAt:    now,
	}
}

// Deactivate desativa o usuário
func (u *User) Deactivate() {
	u.IsActive = false
	u.UpdatedAt = time.Now()
}

// Activate ativa o usuário
func (u *User) Activate() {
	u.IsActive = true
	u.UpdatedAt = time.Now()
}

// UpdatePassword atualiza o hash da senha
func (u *User) UpdatePassword(newPasswordHash string) {
	u.PasswordHash = newPasswordHash
	u.UpdatedAt = time.Now()
}

// UpdateProfile atualiza informações do perfil
func (u *User) UpdateProfile(name string) {
	u.Name = name
	u.UpdatedAt = time.Now()
}

// HasRole verifica se o usuário tem uma determinada role
func (u *User) HasRole(role UserRole) bool {
	return u.Role == role
}

// IsValidRole verifica se a role é válida
func IsValidRole(role UserRole) bool {
	switch role {
	case RoleAdmin, RoleOperator, RoleAnalyst, RoleViewer:
		return true
	default:
		return false
	}
}
