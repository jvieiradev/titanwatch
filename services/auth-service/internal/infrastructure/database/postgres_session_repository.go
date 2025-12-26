package database

import (
	"context"
	"database/sql"
	"errors"

	"github.com/google/uuid"
	"github.com/jvieiradev/titanwatch/auth-service/internal/domain/entity"
	pkgerrors "github.com/jvieiradev/titanwatch/auth-service/pkg/errors"
)

type PostgresSessionRepository struct {
	db *sql.DB
}

func NewPostgresSessionRepository(db *sql.DB) *PostgresSessionRepository {
	return &PostgresSessionRepository{db: db}
}

func (r *PostgresSessionRepository) Create(ctx context.Context, session *entity.Session) error {
	query := `
		INSERT INTO sessions (id, user_id, refresh_token, expires_at, created_at, is_revoked, revoked_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`

	_, err := r.db.ExecContext(ctx, query,
		session.ID,
		session.UserID,
		session.RefreshToken,
		session.ExpiresAt,
		session.CreatedAt,
		session.IsRevoked,
		session.RevokedAt,
	)

	return err
}

func (r *PostgresSessionRepository) GetByRefreshToken(ctx context.Context, refreshToken string) (*entity.Session, error) {
	query := `
		SELECT id, user_id, refresh_token, expires_at, created_at, is_revoked, revoked_at
		FROM sessions
		WHERE refresh_token = $1
	`

	session := &entity.Session{}
	err := r.db.QueryRowContext(ctx, query, refreshToken).Scan(
		&session.ID,
		&session.UserID,
		&session.RefreshToken,
		&session.ExpiresAt,
		&session.CreatedAt,
		&session.IsRevoked,
		&session.RevokedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, pkgerrors.ErrSessionNotFound
		}
		return nil, err
	}

	return session, nil
}

func (r *PostgresSessionRepository) GetByUserID(ctx context.Context, userID uuid.UUID) ([]*entity.Session, error) {
	query := `
		SELECT id, user_id, refresh_token, expires_at, created_at, is_revoked, revoked_at
		FROM sessions
		WHERE user_id = $1
		ORDER BY created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sessions []*entity.Session
	for rows.Next() {
		session := &entity.Session{}
		err := rows.Scan(
			&session.ID,
			&session.UserID,
			&session.RefreshToken,
			&session.ExpiresAt,
			&session.CreatedAt,
			&session.IsRevoked,
			&session.RevokedAt,
		)
		if err != nil {
			return nil, err
		}
		sessions = append(sessions, session)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return sessions, nil
}

func (r *PostgresSessionRepository) Update(ctx context.Context, session *entity.Session) error {
	query := `
		UPDATE sessions
		SET is_revoked = $2, revoked_at = $3
		WHERE id = $1
	`

	result, err := r.db.ExecContext(ctx, query,
		session.ID,
		session.IsRevoked,
		session.RevokedAt,
	)

	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return pkgerrors.ErrSessionNotFound
	}

	return nil
}

func (r *PostgresSessionRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM sessions WHERE id = $1`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return pkgerrors.ErrSessionNotFound
	}

	return nil
}

func (r *PostgresSessionRepository) RevokeAllByUserID(ctx context.Context, userID uuid.UUID) error {
	query := `
		UPDATE sessions
		SET is_revoked = true, revoked_at = NOW()
		WHERE user_id = $1 AND is_revoked = false
	`

	_, err := r.db.ExecContext(ctx, query, userID)
	return err
}

func (r *PostgresSessionRepository) DeleteExpired(ctx context.Context) error {
	query := `DELETE FROM sessions WHERE expires_at < NOW()`

	_, err := r.db.ExecContext(ctx, query)
	return err
}
