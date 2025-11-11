package routes

import (
	"finance/database"
	"github.com/gin-gonic/gin"
	"net/http"
)

func GetReport(c *gin.Context) {
	userID := c.GetInt("user_id")

	var totalIncome float64
	var totalExpense float64

	database.DB.QueryRow(`
        SELECT COALESCE(SUM(amount), 0) 
        FROM transactions 
        WHERE user_id = ? AND type = 'income'`,
		userID).Scan(&totalIncome)

	database.DB.QueryRow(`
        SELECT COALESCE(SUM(amount), 0) 
        FROM transactions 
        WHERE user_id = ? AND type = 'expense'`,
		userID).Scan(&totalExpense)

	c.JSON(http.StatusOK, gin.H{
		"income":  totalIncome,
		"expense": totalExpense,
		"balance": totalIncome - totalExpense,
	})
}
