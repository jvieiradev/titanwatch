package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"

	_ "github.com/lib/pq"
	"github.com/jvieiradev/titanwatch/auth-service/pkg/config"
)

func main() {
	if len(os.Args) < 2 {
		log.Fatal("Usage: go run cmd/migrate/main.go [up|down]")
	}

	direction := os.Args[1]
	if direction != "up" && direction != "down" {
		log.Fatal("Direction must be 'up' or 'down'")
	}

	// Carregar configurações
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Conectar ao banco
	db, err := sql.Open("postgres", cfg.GetDSN())
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}

	log.Println("Connected to database successfully")

	// Executar migrations
	if direction == "up" {
		if err := migrateUp(db); err != nil {
			log.Fatalf("Migration up failed: %v", err)
		}
		log.Println("Migrations up completed successfully!")
	} else {
		if err := migrateDown(db); err != nil {
			log.Fatalf("Migration down failed: %v", err)
		}
		log.Println("Migrations down completed successfully!")
	}
}

func migrateUp(db *sql.DB) error {
	files, err := getMigrationFiles("up")
	if err != nil {
		return err
	}

	for _, file := range files {
		log.Printf("Running migration: %s", file)
		if err := executeMigrationFile(db, file); err != nil {
			return fmt.Errorf("failed to execute %s: %w", file, err)
		}
	}

	return nil
}

func migrateDown(db *sql.DB) error {
	files, err := getMigrationFiles("down")
	if err != nil {
		return err
	}

	// Executar migrations down em ordem reversa
	for i := len(files) - 1; i >= 0; i-- {
		file := files[i]
		log.Printf("Reverting migration: %s", file)
		if err := executeMigrationFile(db, file); err != nil {
			return fmt.Errorf("failed to execute %s: %w", file, err)
		}
	}

	return nil
}

func getMigrationFiles(direction string) ([]string, error) {
	migrationsDir := "migrations"
	files, err := os.ReadDir(migrationsDir)
	if err != nil {
		return nil, fmt.Errorf("failed to read migrations directory: %w", err)
	}

	var migrationFiles []string
	for _, file := range files {
		if file.IsDir() {
			continue
		}

		if strings.HasSuffix(file.Name(), fmt.Sprintf(".%s.sql", direction)) {
			migrationFiles = append(migrationFiles, filepath.Join(migrationsDir, file.Name()))
		}
	}

	sort.Strings(migrationFiles)
	return migrationFiles, nil
}

func executeMigrationFile(db *sql.DB, filePath string) error {
	content, err := os.ReadFile(filePath)
	if err != nil {
		return fmt.Errorf("failed to read file: %w", err)
	}

	_, err = db.Exec(string(content))
	if err != nil {
		return fmt.Errorf("failed to execute SQL: %w", err)
	}

	return nil
}
