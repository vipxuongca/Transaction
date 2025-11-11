package main

import (
    "finance/database"
    "finance/routes"
    "finance/middleware"

    "github.com/gin-contrib/cors"
    "github.com/gin-gonic/gin"
    "time"
)

func main() {
    database.Connect()

    r := gin.Default()

    r.Use(cors.New(cors.Config{
        AllowOrigins:     []string{"http://localhost:5173"},
        AllowMethods:     []string{"GET", "POST", "DELETE", "PUT", "OPTIONS"},
        AllowHeaders:     []string{"Authorization", "Content-Type"},
        ExposeHeaders:    []string{"Content-Length"},
        AllowCredentials: true,
        MaxAge:           12 * time.Hour,
    }))

    r.POST("/register", routes.Register)
    r.POST("/login", routes.Login)

    auth := r.Group("/")
    auth.Use(middleware.Auth())

    auth.POST("/transactions", routes.CreateTransaction)
    auth.GET("/transactions", routes.GetTransactions)
    auth.DELETE("/transactions/:id", routes.DeleteTransaction)
    auth.GET("/reports", routes.GetReport)

    r.Run(":8080")
}
