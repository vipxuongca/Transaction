package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"github.com/go-chi/chi/v5"
	"transaction/models"
)

var (
	Repo      *transactions.Repository
	JWTSecret []byte
)

// InitHandler initializes repository and secret (called from main).
func InitHandler(repo *transactions.Repository, secret []byte) {
	Repo = repo
	JWTSecret = secret
}

// Helper: write JSON responses
func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if data != nil {
		_ = json.NewEncoder(w).Encode(data)
	}
}

func GetReport(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("user_id").(primitive.ObjectID)
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}

	now := time.Now().UTC()
	start := time.Date(now.Year(), now.Month()-5, 1, 0, 0, 0, 0, time.UTC)
	end := now

	result, err := Repo.GetMonthlySummary(r.Context(), userID, start, end)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func DeleteTransaction(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("user_id").(primitive.ObjectID)
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}

	idStr := chi.URLParam(r, "id")
	id, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid id"})
		return
	}

	deleted, err := Repo.DeleteTransaction(r.Context(), id, userID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	if !deleted {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func ListTransactions(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("user_id").(primitive.ObjectID)
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}

	list, _, err := Repo.ListTransactions(r.Context(), transactions.ListOptions{
		UserID:    userID,
		Limit:     50,
		SortField: "date",
		SortOrder: -1,
	})
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, list)
}

func CreateTransaction(w http.ResponseWriter, r *http.Request) {
	var body struct {
		AmountCents int64  `json:"amount_cents"`
		Type        string `json:"type"`
		Description string `json:"description"`
		Category    string `json:"category"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid body"})
		return
	}

	userID, ok := r.Context().Value("user_id").(primitive.ObjectID)
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}

	tx := &transactions.Transaction{
		UserID:      userID,
		Type:        transactions.TransactionType(body.Type),
		AmountCents: body.AmountCents,
		Category:    body.Category,
		Notes:       body.Description,
		Currency:    "VND",
		Date:        time.Now().UTC(),
	}

	res, err := Repo.CreateTransaction(r.Context(), tx)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusCreated, res)
}
