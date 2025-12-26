package entity

import (
	"time"

	"github.com/google/uuid"
)

// Session representa uma sessão de autenticação
type Session struct {
	ID           uuid.UUID
	UserID       uuid.UUID
	RefreshToken string
	ExpiresAt    time.Time
	CreatedAt    time.Time
	IsRevoked    bool
	RevokedAt    *time.Time
}

// NewSession cria uma nova sessão
func NewSession(userID uuid.UUID, refreshToken string, expiresAt time.Time) *Session {
	return &Session{
		ID:           uuid.New(),
		UserID:       userID,
		RefreshToken: refreshToken,
		ExpiresAt:    expiresAt,
		CreatedAt:    time.Now(),
		IsRevoked:    false,
		RevokedAt:    nil,
	}
}

// Revoke revoga a sessão
func (s *Session) Revoke() {
	now := time.Now()
	s.IsRevoked = true
	s.RevokedAt = &now
}

// IsExpired verifica se a sessão está expirada
func (s *Session) IsExpired() bool {
	return time.Now().After(s.ExpiresAt)
}

// IsValid verifica se a sessão é válida (não revogada e não expirada)
func (s *Session) IsValid() bool {
	return !s.IsRevoked && !s.IsExpired()
}
