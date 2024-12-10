const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(":memory:", () => {
    console.log("Connection Established");
});

const usersTable = `CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
)`;

const todoTable = `CREATE TABLE IF NOT EXISTS todos(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    is_completed BOOLEAN DEFAULT 0 NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id)
)`;

const asyncRunQuery = (db, query, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(query, params, (error, rows) => {
            if (error) { reject(error) }
            else {
                resolve(rows)
            }

        })
    })
}

const asyncAllQuery = (db, query, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(query, params, (error, rows) => {
            if (error) { reject(error) }
            else {
                resolve(rows)
            }
        })
    })
}
const runScript = () => {
    db.serialize(async () => {
        try {
            await asyncRunQuery(db, usersTable);
            // console.log("Users Table created successfully.");
            const nameVal = ["Bobby", "Samir", "Sonnu", "Deepa", "Govind", "Mini", "Yash"];
            const userQuery = `INSERT INTO users(name, email) VALUES(?, ?)`;

            for (let i = 0; i < 5; i++) {
                await asyncRunQuery(db, userQuery, [nameVal[i], `${nameVal[i]}@gmail.com`])
            }

            await asyncRunQuery(db, todoTable);
            console.log("Todo Table created successfully.");
            const todoQuery = `INSERT INTO todos(title, user_id, is_completed) VALUES(?, ?, ?)`;
            const titleVal = "TODO";
            for (let i = 0; i < 10; i++) {
                await asyncRunQuery(db, todoQuery, [titleVal + i, Math.floor(Math.random() * 5) + 1, Math.random() < 0.5])
            }

            const todos = await asyncAllQuery(db, `SELECT * FROM todos LIMIT 1`);
            console.log("Initial Todo Table", todos);

            // UPDATE is_completed by Id
            const updateByIdQuery = `UPDATE todos SET is_completed = 1 WHERE id = 1`;
            await asyncRunQuery(db, updateByIdQuery);
            const updatedTodo = await asyncAllQuery(db, `SELECT * FROM todos LIMIT 1`);
            console.log("Updated Table", updatedTodo);
        } catch (error) {
            console.error(error);
        } finally {
            db.close((err) => {
                if (err) throw err;
                console.log("Connection closed");
            });
        }
    });
}

runScript()