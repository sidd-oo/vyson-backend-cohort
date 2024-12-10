const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(":memory:", () => {
    console.log("Connection Established");
})

const usersTable = `CREATE TABLE IF NOT EXISTS users(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
)`

const todoTable = `CREATE TABLE IF NOT EXISTS todos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    user_id INTEGER NOT NULL,
                    is_completed BOOLEAN DEFAULT 0 NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES users (id)
)`

db.run(usersTable, (error) => {
    if (error) throw error;
    console.log("Users Table created successfully.")
})

db.run(todoTable, (error) => {
    if (error) throw error;
    console.log("Todo Table created successfully.")
})

db.close((err) => {
    if (err) {
        throw new Error(err);
    }
    console.log("Connection closed");
});