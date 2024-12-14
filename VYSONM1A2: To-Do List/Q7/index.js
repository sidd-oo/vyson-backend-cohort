
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
    due_date DATE NOT NULL,
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
            console.log("Users Table created successfully.");
            const nameVal = ["Bobby", "Samir", "Sonnu", "Deepa", "Govind", "Mini", "Yash"];
            const userQuery = `INSERT INTO users(name, email) VALUES(?, ?)`;

            for (let i = 0; i < 5; i++) {
                await asyncRunQuery(db, userQuery, [nameVal[i], `${nameVal[i]}@gmail.com`])
            }

            const users = await asyncAllQuery(db, `SELECT * FROM users`);
            console.table(users);


            await asyncRunQuery(db, todoTable);
            console.log("Todo Table created successfully.");
            const todoQuery = `INSERT INTO todos(title, user_id, is_completed, due_date) VALUES(?, ?, ?, ?)`;
            const titleVal = "TODO";
            const randomFutureDate = () => new Date(Date.now() + (Math.random() * 2 - 1) * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];


            for (let i = 0; i < 10; i++) {
                await asyncRunQuery(db, todoQuery, [titleVal + i, Math.floor(Math.random() * 5) + 1, Math.random() < 0.5, randomFutureDate()])
            }

            const todos = await asyncAllQuery(db, `SELECT * FROM todos`);
            console.table(todos);

            // Fetch the todos count each user has, grouped by user_id.
            const fetchtodosCount = `SELECT user_id, COUNT(*) AS todo_count
                                     FROM todos
                                     GROUP BY user_id;`
            const fetchtodosCountRes = await asyncAllQuery(db, fetchtodosCount);
            console.table(fetchtodosCountRes);
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