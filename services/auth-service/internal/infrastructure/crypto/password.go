package crypto

import (
	"golang.org/x/crypto/bcrypt"
)

// PasswordService lida com hashing e verificação de senhas
type PasswordService struct {
	cost int
}

// NewPasswordService cria uma nova instância
func NewPasswordService() *PasswordService {
	return &PasswordService{
		cost: bcrypt.DefaultCost,
	}
}

// Hash gera um hash da senha
func (p *PasswordService) Hash(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), p.cost)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

// Compare verifica se a senha corresponde ao hash
func (p *PasswordService) Compare(hashedPassword, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}
