package database

import (
    "database/sql"
    _ "modernc.org/sqlite"
    "log"
)

var DB *sql.DB

func Connect() {
    var err error
    DB, err = sql.Open("sqlite", "./finance.db")
    if err != nil {
        log.Fatal(err)
    }

    createTables()
}

func createTables() {
    DB.Exec(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT,
        provider TEXT,
        provider_id TEXT
    )`)

    DB.Exec(`CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        amount REAL,
        description TEXT,
        type TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`)
}
