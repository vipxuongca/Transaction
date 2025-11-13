package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"time"
	// "log"
	"fmt"

	"oauth-service/config"
	"oauth-service/internal/utils"
	"oauth-service/models"

	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

var googleOAuthConfig *oauth2.Config

func InitGoogleOAuth() {
	googleOAuthConfig = &oauth2.Config{
		RedirectURL:  config.RedirectURI,
		ClientID:     config.GoogleClientID,
		ClientSecret: config.GoogleClientSecret,
		Scopes:       []string{"openid", "profile", "email"},
		Endpoint:     google.Endpoint,
	}
}

// Redirects user to Google OAuth login page
func GoogleLogin(w http.ResponseWriter, r *http.Request) {
	url := googleOAuthConfig.AuthCodeURL("state-token", oauth2.AccessTypeOffline)

	// log.Println("url is: ",url)
	// log.Println("Redirect is: ",googleOAuthConfig)
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

// Handles Google OAuth callback
func GoogleCallback(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Query().Get("code")
	if code == "" {
		http.Error(w, "Missing code in request", http.StatusBadRequest)
		return
	}

	// Exchange authorization code for token
	token, err := googleOAuthConfig.Exchange(context.Background(), code)
	if err != nil {
		http.Error(w, "Failed to exchange token", http.StatusInternalServerError)
		return
	}

	client := googleOAuthConfig.Client(context.Background(), token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v3/userinfo")
	if err != nil {
		http.Error(w, "Failed to get user info", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	var googleUser struct {
		Sub   string `json:"sub"`
		Email string `json:"email"`
		Name  string `json:"name"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&googleUser); err != nil {
		http.Error(w, "Failed to decode user info", http.StatusInternalServerError)
		return
	}

	db := utils.GetDB()
	fmt.Println("Connected to DB:", db.Name())
	usersColl := db.Collection("users")

	var existingUser models.User
	err = usersColl.FindOne(context.Background(), bson.M{"googleId": googleUser.Sub}).Decode(&existingUser)
	if err == mongo.ErrNoDocuments {
		// If Google ID not found, check if email exists
		err = usersColl.FindOne(context.Background(), bson.M{"email": googleUser.Email}).Decode(&existingUser)
		if err == mongo.ErrNoDocuments {
			// Create new user
			newUser := models.User{
				Email:         googleUser.Email,
				GoogleID:      googleUser.Sub,
				OAuthProvider: "google",
				Name:          googleUser.Name,
			}
			res, _ := usersColl.InsertOne(context.Background(), newUser)
			existingUser.ID = res.InsertedID.(primitive.ObjectID)
			existingUser.Email = newUser.Email
		} else {
			// Attach Google account to existing email
			update := bson.M{"$set": bson.M{
				"googleId":      googleUser.Sub,
				"oauthProvider": "google",
			}}
			_, err = usersColl.UpdateByID(context.Background(), existingUser.ID, update)
			if err != nil {
				http.Error(w, "Failed to update user", http.StatusInternalServerError)
				return
			}
			// Ensure we still have the latest user data
			err = usersColl.FindOne(context.Background(), bson.M{"_id": existingUser.ID}).Decode(&existingUser)
			if err != nil {
				http.Error(w, "Failed to reload user", http.StatusInternalServerError)
				return
			}
		}

	} else if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	// check userId
	if existingUser.ID.IsZero() {
		http.Error(w, "User ID missing after Google login", http.StatusInternalServerError)
		return
	}

	// Generate JWT
	jwtSecret := []byte(os.Getenv("JWT_SECRET"))
	jwtToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id": existingUser.ID.Hex(),
		"email":   googleUser.Email,
		"exp":     time.Now().Add(60 * time.Minute).Unix(),
	})

	tokenString, err := jwtToken.SignedString(jwtSecret)
	if err != nil {
		http.Error(w, "Failed to generate JWT", http.StatusInternalServerError)
		return
	}

	// Return token to the frontend popup via postMessage
	html := `
		<script>
			window.opener.postMessage({
				token: "` + tokenString + `",
				email: "` + googleUser.Email + `"
			}, "http://localhost:5173");
			window.close();
		</script>`
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Write([]byte(html))
}

func GetUserProfile(w http.ResponseWriter, r *http.Request) {
	tokenString := r.Header.Get("Authorization")
	if tokenString == "" {
		http.Error(w, "Missing token", http.StatusUnauthorized)
		return
	}

	token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("JWT_SECRET")), nil
	})
	if err != nil || !token.Valid {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	claims := token.Claims.(jwt.MapClaims)
	email := claims["email"].(string)

	db := utils.GetDB()
	usersColl := db.Collection("user")

	var user models.User
	if err := usersColl.FindOne(context.Background(), bson.M{"email": email}).Decode(&user); err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(user)
}
