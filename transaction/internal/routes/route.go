package routes

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	appmw "transaction/internal/utils"
	"transaction/internal/handlers"
)

// RegisterRoutes configures all API routes.
func RegisterRoutes() http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Route("/api", func(api chi.Router) {
		// Protected routes (JWT)
		api.Group(func(protected chi.Router) {
			protected.Use(appmw.VerifyToken)

			// Transactions
			protected.Route("/transaction", func(tr chi.Router) {
				tr.Post("/", handlers.CreateTransaction)
				tr.Get("/", handlers.ListTransactions)
				tr.Delete("/{id}", handlers.DeleteTransaction)
			})

			// Reports
			protected.Get("/reports", handlers.GetReport)
		})
	})

	return r
}
