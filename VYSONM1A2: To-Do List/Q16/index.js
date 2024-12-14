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
    status TEXT CHECK(status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending' NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
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

const randomDate = () => {
    const currentDate = new Date();
    const randomDays = Math.floor(Math.random() * 61) - 30;
    currentDate.setDate(currentDate.getDate() + randomDays);
    return currentDate.toISOString();
};

const runScript = () => {
    db.serialize(async () => {
        db.serialize(async () => {
            const totalUsers = 10;
            const totalTodos = 25;
            try {
                // Create tables
                console.log("Creating Users and Todos tables...");
                await asyncRunQuery(db, usersTable);
                await asyncRunQuery(db, todoTable);

                // Insert initial data for users
                const userQuery = `INSERT INTO users(name, email) VALUES(?, ?)`;
                const nameVal = ["Bobby", "Samir", "Sonnu", "Deepa", "Govind", "Mini", "Yash"];
                for (let i = 0; i < nameVal.length; i++) {
                    await asyncRunQuery(db, userQuery, [nameVal[i], `${nameVal[i].toLowerCase()}@gmail.com`]);
                }

                // Insert initial data for todos with random created_at date
                const todoQuery = `INSERT INTO todos(title, user_id, status, created_at) VALUES(?, ?, ?, ?)`;
                for (let i = 0; i < totalTodos; i++) {
                    const userId = Math.floor(Math.random() * totalUsers) + 1;
                    const status = ["pending", "in_progress"][Math.floor(Math.random() * 2)];
                    const createdAt = randomDate();
                    await asyncRunQuery(db, todoQuery, [`Todo ${i + 1}`, userId, status, createdAt]);
                }
                console.log("Initial data inserted successfully.");

                // Query to find users who have not completed any todos within the last month
                const query = `
                   SELECT users.id, users.name, users.email
                    FROM users
                    LEFT JOIN todos ON users.id = todos.user_id
                        AND todos.status = 'completed' 
                        AND todos.created_at >= datetime('now', '-30 days')
                    WHERE todos.id IS NULL;`;
                const result = await asyncAllQuery(db, query);
                console.log("Users who have not completed any todos within the last month:");
                console.table(result);
            } catch (error) {
                console.error(error);
            } finally {
                db.close((err) => {
                    if (err) throw err;
                    console.log("Connection closed");
                });
            }
        })
    })
};
runScript()