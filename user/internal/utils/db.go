package utils

import (
	"context"
	"log"
	"sync"
	"time"

	"oauth-service/config"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	clientInstance     *mongo.Client
	clientInstanceErr  error
	mongoOnce          sync.Once
)

// GetDB initializes (once) and returns a MongoDB database instance.
func GetDB() *mongo.Database {
	mongoOnce.Do(func() {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()


		clientOptions := options.Client().ApplyURI(config.MongoURI)
		clientInstance, clientInstanceErr = mongo.Connect(ctx, clientOptions)
		if clientInstanceErr != nil {
			log.Fatal("MongoDB connection error:", clientInstanceErr)
		}

		if err := clientInstance.Ping(ctx, nil); err != nil {
			log.Fatal("MongoDB ping failed:", err)
		}
	})

	if clientInstanceErr != nil {
		log.Fatal(clientInstanceErr)
	}

	// Use the same database name as your system
	return clientInstance.Database("users")
}
