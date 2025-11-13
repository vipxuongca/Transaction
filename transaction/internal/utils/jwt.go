package utils

import (
	"context"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

var JWTSecret []byte

// InitJWT sets the JWT secret key (called from main).
func InitJWT(secret []byte) {
	JWTSecret = secret
}

// VerifyToken ensures the request has a valid JWT.
func VerifyToken(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if !strings.HasPrefix(authHeader, "Bearer ") {
			http.Error(w, "missing or invalid token", http.StatusUnauthorized)
			return
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

		claims := jwt.MapClaims{}
		token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
			return JWTSecret, nil
		})
		if err != nil || !token.Valid {
			http.Error(w, "invalid token", http.StatusUnauthorized)
			return
		}

		idStr, ok := claims["user_id"].(string)
		if !ok {
			http.Error(w, "invalid token payload", http.StatusUnauthorized)
			return
		}

		userID, err := primitive.ObjectIDFromHex(idStr)
		if err != nil {
			http.Error(w, "invalid user id", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), "user_id", userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
