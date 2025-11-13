package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/rs/cors"
	"transaction/config"
	"transaction/internal/handlers"
	"transaction/internal/routes"
	"transaction/internal/utils"
	"transaction/models"
)

func main() {
	config.LoadConfig()

	db := utils.GetDB()

	repo, err := transactions.NewRepository(db, "transactions", 10*time.Second)
	if err != nil {
		log.Fatalf("failed to initialize repository: %v", err)
	}

	secret := []byte(os.Getenv("JWT_SECRET"))
	utils.InitJWT(secret)
	handlers.InitHandler(repo, secret)

	r := routes.RegisterRoutes()

	// cors set up
	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	}).Handler(r)

	log.Printf("Transaction service running on port %s", config.Port)
	if err := http.ListenAndServe(":"+config.Port, corsHandler); err != nil {
		log.Fatal(err)
	}
}
