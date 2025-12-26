package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"github.com/google/uuid"
	"github.com/jvieiradev/titanwatch/auth-service/internal/delivery/http/dto"
	"github.com/jvieiradev/titanwatch/auth-service/internal/domain/entity"
	"github.com/jvieiradev/titanwatch/auth-service/internal/usecase"
	pkgerrors "github.com/jvieiradev/titanwatch/auth-service/pkg/errors"
)

type AuthHandler struct {
	registerUseCase     *usecase.RegisterUserUseCase
	loginUseCase        *usecase.LoginUseCase
	logoutUseCase       *usecase.LogoutUseCase
	refreshTokenUseCase *usecase.RefreshTokenUseCase
	verifyTokenUseCase  *usecase.VerifyTokenUseCase
}

func NewAuthHandler(
	registerUseCase *usecase.RegisterUserUseCase,
	loginUseCase *usecase.LoginUseCase,
	logoutUseCase *usecase.LogoutUseCase,
	refreshTokenUseCase *usecase.RefreshTokenUseCase,
	verifyTokenUseCase *usecase.VerifyTokenUseCase,
) *AuthHandler {
	return &AuthHandler{
		registerUseCase:     registerUseCase,
		loginUseCase:        loginUseCase,
		logoutUseCase:       logoutUseCase,
		refreshTokenUseCase: refreshTokenUseCase,
		verifyTokenUseCase:  verifyTokenUseCase,
	}
}

// Register handler
func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req dto.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	input := usecase.RegisterUserInput{
		Email:    req.Email,
		Password: req.Password,
		Name:     req.Name,
		Role:     entity.UserRole(req.Role),
	}

	output, err := h.registerUseCase.Execute(r.Context(), input)
	if err != nil {
		handleUseCaseError(w, err)
		return
	}

	respondWithJSON(w, http.StatusCreated, dto.SuccessResponse{
		Message: "User registered successfully",
		Data: dto.UserDTO{
			ID:    output.UserID,
			Email: output.Email,
			Name:  output.Name,
			Role:  output.Role,
		},
	})
}

// Login handler
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req dto.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	input := usecase.LoginInput{
		Email:    req.Email,
		Password: req.Password,
	}

	output, err := h.loginUseCase.Execute(r.Context(), input)
	if err != nil {
		handleUseCaseError(w, err)
		return
	}

	respondWithJSON(w, http.StatusOK, dto.AuthResponse{
		AccessToken:  output.AccessToken,
		RefreshToken: output.RefreshToken,
		User: dto.UserDTO{
			ID:    output.User.ID,
			Email: output.User.Email,
			Name:  output.User.Name,
			Role:  output.User.Role,
		},
	})
}

// Logout handler
func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	// Extrair userID do contexto (colocado pelo middleware)
	userID, ok := r.Context().Value("user_id").(string)
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	userUUID, err := uuid.Parse(userID)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	input := usecase.LogoutInput{
		UserID: userUUID,
	}

	if err := h.logoutUseCase.Execute(r.Context(), input); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to logout")
		return
	}

	respondWithJSON(w, http.StatusOK, dto.SuccessResponse{
		Message: "Logged out successfully",
	})
}

// RefreshToken handler
func (h *AuthHandler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	var req dto.RefreshTokenRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	input := usecase.RefreshTokenInput{
		RefreshToken: req.RefreshToken,
	}

	output, err := h.refreshTokenUseCase.Execute(r.Context(), input)
	if err != nil {
		handleUseCaseError(w, err)
		return
	}

	respondWithJSON(w, http.StatusOK, dto.RefreshTokenResponse{
		AccessToken:  output.AccessToken,
		RefreshToken: output.RefreshToken,
	})
}

// VerifyToken handler
func (h *AuthHandler) VerifyToken(w http.ResponseWriter, r *http.Request) {
	// Extrair token do header Authorization
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		respondWithError(w, http.StatusUnauthorized, "Missing authorization header")
		return
	}

	tokenParts := strings.Split(authHeader, " ")
	if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
		respondWithError(w, http.StatusUnauthorized, "Invalid authorization header format")
		return
	}

	input := usecase.VerifyTokenInput{
		AccessToken: tokenParts[1],
	}

	output, err := h.verifyTokenUseCase.Execute(r.Context(), input)
	if err != nil {
		handleUseCaseError(w, err)
		return
	}

	respondWithJSON(w, http.StatusOK, dto.VerifyTokenResponse{
		Valid:  output.Valid,
		UserID: output.UserID.String(),
		Email:  output.Email,
		Role:   output.Role,
	})
}

// Helper functions

func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	response, err := json.Marshal(payload)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(`{"error": "Internal server error"}`))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	w.Write(response)
}

func respondWithError(w http.ResponseWriter, code int, message string) {
	respondWithJSON(w, code, dto.ErrorResponse{
		Error:   http.StatusText(code),
		Message: message,
	})
}

func handleUseCaseError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, pkgerrors.ErrUserNotFound):
		respondWithError(w, http.StatusNotFound, err.Error())
	case errors.Is(err, pkgerrors.ErrUserAlreadyExists):
		respondWithError(w, http.StatusConflict, err.Error())
	case errors.Is(err, pkgerrors.ErrInvalidCredentials):
		respondWithError(w, http.StatusUnauthorized, err.Error())
	case errors.Is(err, pkgerrors.ErrInvalidToken):
		respondWithError(w, http.StatusUnauthorized, err.Error())
	case errors.Is(err, pkgerrors.ErrExpiredToken):
		respondWithError(w, http.StatusUnauthorized, err.Error())
	case errors.Is(err, pkgerrors.ErrTokenRevoked):
		respondWithError(w, http.StatusUnauthorized, err.Error())
	case errors.Is(err, pkgerrors.ErrUserInactive):
		respondWithError(w, http.StatusForbidden, err.Error())
	default:
		respondWithError(w, http.StatusInternalServerError, "Internal server error")
	}
}
