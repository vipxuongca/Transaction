package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

var (
	RedirectURI        string
	GoogleClientID     string
	GoogleClientSecret string
	MongoURI           string
	Port               string
)

func LoadConfig() {
	dir, _ := os.Getwd()
	log.Println("Current working directory:", dir)

	env := os.Getenv("ENV")
	if env == "" {
		env = "development"
	}

	err := godotenv.Load(".env." + env)
	if err != nil {
		log.Printf("Could not load .env file: %v. Falling back to system environment variables.", err)
	}

	Port = os.Getenv("PORT")
	RedirectURI = os.Getenv("GOOGLE_REDIRECT_URI")
	GoogleClientID = os.Getenv("GOOGLE_CLIENT_ID")
	GoogleClientSecret = os.Getenv("GOOGLE_CLIENT_SECRET")
	MongoURI = os.Getenv("MONGO_CLUSTER_URI")

	if GoogleClientID == "" || GoogleClientSecret == "" || RedirectURI == "" {
		log.Fatal("Missing required Google OAuth environment variables")
	}

	// for _, k := range []string{"GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REDIRECT_URI"} {
	// 	log.Printf("%s='%s'", k, os.Getenv(k))
	// }

	// log.Println("redirect: ", RedirectURI)
	// log.Println("clientid: ", GoogleClientID)
	// log.Println("secret: ", GoogleClientSecret)
}
