package main

import (
	"log"
	"net/http"
	"oauth-service/config"
	"oauth-service/internal/handler"
)

func main() {
	config.LoadConfig()
	handlers.InitGoogleOAuth()

	http.HandleFunc("/auth/google/login", handlers.GoogleLogin)
	http.HandleFunc("/auth/google/callback", handlers.GoogleCallback)

	log.Printf("Server running on port %s", config.Port)
	if err := http.ListenAndServe(":"+config.Port, nil); err != nil {
		log.Fatal(err)
	}
}
