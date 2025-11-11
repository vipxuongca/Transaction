package routes

import (
	"finance/database"
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
)

type TransactionBody struct {
	Amount      float64 `json:"amount"`
	Description string  `json:"description"`
	Type        string  `json:"type"` // "income" or "expense"
}

func CreateTransaction(c *gin.Context) {
	userID := c.GetInt("user_id")

	var body TransactionBody
	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid input"})
		return
	}

	_, err := database.DB.Exec(
		"INSERT INTO transactions(user_id, amount, description, type) VALUES (?, ?, ?, ?)",
		userID, body.Amount, body.Description, body.Type,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to create transaction"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "created"})
}

func GetTransactions(c *gin.Context) {
	userID := c.GetInt("user_id")

	rows, err := database.DB.Query(
		"SELECT id, amount, description, type FROM transactions WHERE user_id = ?",
		userID,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to fetch"})
		return
	}
	defer rows.Close()

	transactions := []gin.H{}

	for rows.Next() {
		var (
			id          int
			amount      float64
			description string
			tType       string
		)

		rows.Scan(&id, &amount, &description, &tType)

		transactions = append(transactions, gin.H{
			"id":          id,
			"amount":      amount,
			"description": description,
			"type":        tType,
		})
	}

	c.JSON(http.StatusOK, transactions)
}

func DeleteTransaction(c *gin.Context) {
	userID := c.GetInt("user_id")
	idStr := c.Param("id")

	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid id"})
		return
	}

	// Ensure user can only delete their own record
	_, err = database.DB.Exec(
		"DELETE FROM transactions WHERE id = ? AND user_id = ?",
		id, userID,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to delete"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}
