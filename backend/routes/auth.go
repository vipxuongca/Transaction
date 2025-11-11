package routes

import (
    "finance/database"
    "github.com/gin-gonic/gin"
    "golang.org/x/crypto/bcrypt"
    "github.com/golang-jwt/jwt/v5"
    "net/http"
    "time"
)

var JWT_SECRET = []byte("your_secret_here")

func Register(c *gin.Context) {
    type Body struct {
        Email    string `json:"email"`
        Password string `json:"password"`
    }
    var body Body
    c.BindJSON(&body)

    hash, _ := bcrypt.GenerateFromPassword([]byte(body.Password), 10)
    _, err := database.DB.Exec("INSERT INTO users(email, password) VALUES (?,?)", body.Email, string(hash))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"message": "email exists"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "registered"})
}

func Login(c *gin.Context) {
    type Body struct {
        Email    string `json:"email"`
        Password string `json:"password"`
    }
    var body Body
    c.BindJSON(&body)

    var id int
    var hash string
    database.DB.QueryRow("SELECT id, password FROM users WHERE email=?", body.Email).Scan(&id, &hash)

    if bcrypt.CompareHashAndPassword([]byte(hash), []byte(body.Password)) != nil {
        c.JSON(http.StatusBadRequest, gin.H{"message": "invalid credentials"})
        return
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
        "user_id": id,
        "exp":     time.Now().Add(time.Hour * 72).Unix(),
    })
    tokenString, _ := token.SignedString(JWT_SECRET)

    c.JSON(http.StatusOK, gin.H{"token": tokenString})
}
