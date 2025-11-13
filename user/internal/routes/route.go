package routes

import (
	"github.com/go-chi/chi/v5"
	"oauth-service/internal/handler"
)

func Register(r *chi.Mux) {
	r.Get("/auth/google/login", handlers.GoogleLogin)
	r.Get("/auth/google/callback", handlers.GoogleCallback)
	r.Get("/user/profile", handlers.GetUserProfile)

}
