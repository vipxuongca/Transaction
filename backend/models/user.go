package models

type User struct {
	ID         int    `json:"id"`
	Email      string `json:"email"`
	Password   string `json:"-"` // do not expose password
	Provider   string `json:"provider"`
	ProviderID string `json:"provider_id"`
}
