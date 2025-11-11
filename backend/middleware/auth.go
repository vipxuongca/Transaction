package middleware

import (
    "github.com/gin-gonic/gin"
    "github.com/golang-jwt/jwt/v5"
    "net/http"
)

var JWT_SECRET = []byte("ebfcc22492fd39599a27ec8b44f4ec05")

func Auth() gin.HandlerFunc {
    return func(c *gin.Context) {
        tokenString := c.GetHeader("Authorization")
        token, _ := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
            return JWT_SECRET, nil
        })

        if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
            c.Set("user_id", claims["user_id"])
            c.Next()
        } else {
            c.JSON(http.StatusUnauthorized, gin.H{"message": "unauthorized"})
            c.Abort()
        }
    }
}
