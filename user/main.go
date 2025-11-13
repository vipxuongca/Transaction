package main

import (
	"log"
	"net/http"

	"github.com/rs/cors"
	"oauth-service/config"
	"oauth-service/internal/handlers"
)

func main() {
	config.LoadConfig()
	handlers.InitGoogleOAuth()

	mux := http.NewServeMux()
	mux.HandleFunc("/auth/google/login", handlers.GoogleLogin)
	mux.HandleFunc("/auth/google/callback", handlers.GoogleCallback)

// cors
	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"}, // frontend origin
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	}).Handler(mux)

	log.Printf("OAuth service running on port %s", config.Port)
	if err := http.ListenAndServe(":"+config.Port, corsHandler); err != nil {
		log.Fatal(err)
	}
}
