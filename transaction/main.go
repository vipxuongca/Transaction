package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"transaction/config"
	"transaction/internal/handlers"
	"transaction/internal/routes"
	"transaction/internal/utils"
	"transaction/models"
)

func main() {
	// Load configuration (Mongo URI, Port, etc.)
	config.LoadConfig()

	// Initialize MongoDB
	db := utils.GetDB()

	repo, err := transactions.NewRepository(db, "transactions", 10*time.Second)
	if err != nil {
		log.Fatalf("failed to initialize repository: %v", err)
	}

	// Initialize JWT secret
	secret := []byte(os.Getenv("JWT_SECRET"))
	utils.InitJWT(secret)
	handlers.InitHandler(repo, secret)

	// Register routes
	r := routes.RegisterRoutes()

	log.Printf("Transaction service running on port %s", config.Port)
	if err := http.ListenAndServe(":"+config.Port, r); err != nil {
		log.Fatal(err)
	}
}
