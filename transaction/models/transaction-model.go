package transactions

import (
	"context"
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// TransactionType enumerates allowed types.
type TransactionType string

const (
	TransactionIncome  TransactionType = "income"
	TransactionExpense TransactionType = "expense"
)

// Transaction represents a financial transaction stored in Mongo.
type Transaction struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID      primitive.ObjectID `bson:"user_id,omitempty" json:"user_id"`           // Owner
	Type        TransactionType    `bson:"type" json:"type"`                           // income | expense
	AmountCents int64              `bson:"amount_cents" json:"amount_cents"`           // store money in cents
	Currency    string             `bson:"currency" json:"currency"`                   // "USD", "THB", etc.
	Category    string             `bson:"category,omitempty" json:"category"`         // user-defined category
	Notes       string             `bson:"notes,omitempty" json:"notes"`
	Date        time.Time          `bson:"date" json:"date"`                           // transaction date/time
	Tags        []string           `bson:"tags,omitempty" json:"tags"`
	CreatedAt   time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt   time.Time          `bson:"updated_at" json:"updated_at"`
}

// Validate simple (caller may perform more checks).
func (t *Transaction) Validate() error {
	if t.UserID.IsZero() {
		return errors.New("user_id is required")
	}
	if t.Type != TransactionIncome && t.Type != TransactionExpense {
		return errors.New("invalid transaction type")
	}
	if t.AmountCents == 0 {
		return errors.New("amount_cents must be non-zero")
	}
	if t.Currency == "" {
		return errors.New("currency is required")
	}
	return nil
}

// Repository provides DB operations for transactions.
type Repository struct {
	Coll *mongo.Collection
	// default timeout for operations
	OpTimeout time.Duration
}

// NewRepository constructs repository and ensures indexes.
func NewRepository(db *mongo.Database, CollectionName string, OpTimeout time.Duration) (*Repository, error) {
	Coll := db.Collection(CollectionName)
	r := &Repository{Coll: Coll, OpTimeout: OpTimeout}

	// create indexes: user_id + date, user_id + category, user_id + type
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	indexes := []mongo.IndexModel{
		{
			Keys: bson.D{{Key: "user_id", Value: 1}, {Key: "date", Value: -1}},
			Options: options.Index().
				SetBackground(true).
				SetName("user_date_idx"),
		},
		{
			Keys: bson.D{{Key: "user_id", Value: 1}, {Key: "category", Value: 1}},
			Options: options.Index().
				SetBackground(true).
				SetName("user_category_idx"),
		},
		{
			Keys: bson.D{{Key: "user_id", Value: 1}, {Key: "type", Value: 1}},
			Options: options.Index().
				SetBackground(true).
				SetName("user_type_idx"),
		},
	}

	_, err := Coll.Indexes().CreateMany(ctx, indexes)
	if err != nil {
		return nil, err
	}
	return r, nil
}

// CreateTransaction inserts a new transaction (sets timestamps).
func (r *Repository) CreateTransaction(ctx context.Context, t *Transaction) (*Transaction, error) {
	if t == nil {
		return nil, errors.New("transaction is nil")
	}
	if err := t.Validate(); err != nil {
		return nil, err
	}

	now := time.Now().UTC()
	t.CreatedAt = now
	t.UpdatedAt = now
	if t.Date.IsZero() {
		t.Date = now
	}

	ctx, cancel := context.WithTimeout(ctx, r.OpTimeout)
	defer cancel()

	res, err := r.Coll.InsertOne(ctx, t)
	if err != nil {
		return nil, err
	}
	if oid, ok := res.InsertedID.(primitive.ObjectID); ok {
		t.ID = oid
	}
	return t, nil
}

// GetByID retrieves a transaction by its ID and owner userID.
func (r *Repository) GetByID(ctx context.Context, id primitive.ObjectID, userID primitive.ObjectID) (*Transaction, error) {
	ctx, cancel := context.WithTimeout(ctx, r.OpTimeout)
	defer cancel()

	var out Transaction
	filter := bson.M{"_id": id, "user_id": userID}
	err := r.Coll.FindOne(ctx, filter).Decode(&out)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &out, nil
}

// UpdateTransaction updates allowed fields (amount, category, notes, date, tags, type).
// It returns the updated document.
func (r *Repository) UpdateTransaction(ctx context.Context, id primitive.ObjectID, userID primitive.ObjectID, update bson.M) (*Transaction, error) {
	update["updated_at"] = time.Now().UTC()
	updateDoc := bson.M{"$set": update}

	ctx, cancel := context.WithTimeout(ctx, r.OpTimeout)
	defer cancel()

	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)
	filter := bson.M{"_id": id, "user_id": userID}

	var updated Transaction
	err := r.Coll.FindOneAndUpdate(ctx, filter, updateDoc, opts).Decode(&updated)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &updated, nil
}

// DeleteTransaction deletes a transaction by id and owner. Returns whether deleted.
func (r *Repository) DeleteTransaction(ctx context.Context, id primitive.ObjectID, userID primitive.ObjectID) (bool, error) {
	ctx, cancel := context.WithTimeout(ctx, r.OpTimeout)
	defer cancel()

	res, err := r.Coll.DeleteOne(ctx, bson.M{"_id": id, "user_id": userID})
	if err != nil {
		return false, err
	}
	return res.DeletedCount > 0, nil
}

// ListOptions controls listing behavior.
type ListOptions struct {
	UserID      primitive.ObjectID
	Type        *TransactionType
	Category    *string
	StartDate   *time.Time
	EndDate     *time.Time
	Tags        []string
	Skip        int64
	Limit       int64
	SortField   string // e.g. "date", "amount_cents"
	SortOrder   int    // 1 asc, -1 desc
	MinAmount   *int64
	MaxAmount   *int64
}

// ListTransactions returns transactions matching filters with pagination.
func (r *Repository) ListTransactions(ctx context.Context, opts ListOptions) ([]Transaction, int64, error) {
	ctx, cancel := context.WithTimeout(ctx, r.OpTimeout)
	defer cancel()

	filter := bson.M{"user_id": opts.UserID}
	if opts.Type != nil {
		filter["type"] = *opts.Type
	}
	if opts.Category != nil {
		filter["category"] = *opts.Category
	}
	if opts.StartDate != nil || opts.EndDate != nil {
		dateCond := bson.M{}
		if opts.StartDate != nil {
			dateCond["$gte"] = *opts.StartDate
		}
		if opts.EndDate != nil {
			dateCond["$lte"] = *opts.EndDate
		}
		filter["date"] = dateCond
	}
	if len(opts.Tags) > 0 {
		// match any of the tags
		filter["tags"] = bson.M{"$in": opts.Tags}
	}
	if opts.MinAmount != nil || opts.MaxAmount != nil {
		amtCond := bson.M{}
		if opts.MinAmount != nil {
			amtCond["$gte"] = *opts.MinAmount
		}
		if opts.MaxAmount != nil {
			amtCond["$lte"] = *opts.MaxAmount
		}
		filter["amount_cents"] = amtCond
	}

	// count total
	total, err := r.Coll.CountDocuments(ctx, filter)
	if err != nil {
		return nil, 0, err
	}

	findOpts := options.Find()
	if opts.Limit > 0 {
		findOpts.SetLimit(opts.Limit)
	}
	findOpts.SetSkip(opts.Skip)
	sortField := "date"
	if opts.SortField != "" {
		sortField = opts.SortField
	}
	order := -1
	if opts.SortOrder == 1 {
		order = 1
	}
	findOpts.SetSort(bson.D{{Key: sortField, Value: order}})

	cursor, err := r.Coll.Find(ctx, filter, findOpts)
	if err != nil {
		return nil, 0, err
	}
	defer cursor.Close(ctx)

	var res []Transaction
	for cursor.Next(ctx) {
		var t Transaction
		if err := cursor.Decode(&t); err != nil {
			return nil, 0, err
		}
		res = append(res, t)
	}
	if err := cursor.Err(); err != nil {
		return nil, 0, err
	}
	return res, total, nil
}

// MonthlySummaryRow is a simple aggregation result for monthly totals.
type MonthlySummaryRow struct {
	Year       int    `bson:"year" json:"year"`
	Month      int    `bson:"month" json:"month"`
	Type       string `bson:"type" json:"type"`
	TotalCents int64  `bson:"total_cents" json:"total_cents"`
	Count      int64  `bson:"count" json:"count"`
}

// GetMonthlySummary returns totals grouped by year-month and type for a user in a date range.
func (r *Repository) GetMonthlySummary(ctx context.Context, userID primitive.ObjectID, start, end time.Time) ([]MonthlySummaryRow, error) {
	ctx, cancel := context.WithTimeout(ctx, r.OpTimeout)
	defer cancel()

	match := bson.M{"user_id": userID, "date": bson.M{"$gte": start, "$lte": end}}
	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: match}},
		{{
			Key: "$group",
			Value: bson.M{
				"_id": bson.M{
					"year": bson.M{"$year": "$date"},
					"month": bson.M{"$month": "$date"},
					"type":  "$type",
				},
				"total_cents": bson.M{"$sum": "$amount_cents"},
				"count":       bson.M{"$sum": 1},
			},
		}},
		{{
			Key: "$project",
			Value: bson.M{
				"year":        "$_id.year",
				"month":       "$_id.month",
				"type":        "$_id.type",
				"total_cents": "$total_cents",
				"count":       "$count",
				"_id":         0,
			},
		}},
		{{Key: "$sort", Value: bson.D{{Key: "year", Value: 1}, {Key: "month", Value: 1}}}},
	}

	cursor, err := r.Coll.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var out []MonthlySummaryRow
	for cursor.Next(ctx) {
		var row MonthlySummaryRow
		if err := cursor.Decode(&row); err != nil {
			return nil, err
		}
		out = append(out, row)
	}
	if err := cursor.Err(); err != nil {
		return nil, err
	}
	return out, nil
}
