package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type User struct {
    ID           primitive.ObjectID `bson:"_id,omitempty"`
    Email        string             `bson:"email"`
    Password     string             `bson:"password,omitempty"`  // optional for OAuth
    GoogleID     string             `bson:"googleId,omitempty"` // unique if exists
    OAuthProvider string            `bson:"oauthProvider,omitempty"`
    Name         string             `bson:"name,omitempty"`
}
