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

const runScript = () => {
    db.serialize(async () => {
        try {
            // Create Users and Todos tables
            await asyncRunQuery(db, usersTable);
            console.log("Users Table created successfully.");

            await asyncRunQuery(db, todoTable);
            console.log("Todos Table created successfully.");

            // Insert initial data
            const userQuery = `INSERT INTO users(name, email) VALUES(?, ?)`;
            const nameVal = ["Bobby", "Samir", "Sonnu", "Deepa", "Govind", "Mini", "Yash"];
            for (let i = 0; i < nameVal.length; i++) {
                await asyncRunQuery(db, userQuery, [nameVal[i], `${nameVal[i].toLowerCase()}@gmail.com`]);
            }

            const todoQuery = `INSERT INTO todos(title, user_id, is_completed) VALUES(?, ?, ?)`;
            for (let i = 0; i < 5; i++) {
                await asyncRunQuery(db, todoQuery, [`Todo ${i + 1}`, (i % 3) + 1, i % 2 === 0]);
            }

            console.log("Initial data inserted successfully.");
            console.table(await asyncAllQuery(db, `SELECT * FROM todos`));

            //  Create a new table with the updated schema 
            const newTodoTable = `CREATE TABLE todos_new (
                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                 title TEXT NOT NULL,
                 user_id INTEGER NOT NULL,
                 status TEXT CHECK(status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending' NOT NULL,
                 created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
                 FOREIGN KEY (user_id) REFERENCES users (id)
             )`;
            await asyncRunQuery(db, newTodoTable);
             console.log("New Todos table created.");

             // Tranfer the data to the new table
             const migrateDataQuery = `INSERT INTO todos_new (id, title, user_id, status, created_at)
                                        SELECT id, title, user_id, 
                                               CASE 
                                                   WHEN is_completed = 1 THEN 'completed'
                                                   ELSE 'pending'
                                               END AS status, 
                                               created_at 
                                        FROM todos`;
             await asyncRunQuery(db, migrateDataQuery);
             console.log("Data migrated to the new Todos table.");

             // Drop the old table and rename the new one
             await asyncRunQuery(db, `DROP TABLE todos`);
             console.log("Old Todos table dropped.");

             await asyncRunQuery(db, `ALTER TABLE todos_new RENAME TO todos`);
             console.log("New Todos table renamed to 'todos'.");

             // Result
             const result = await asyncAllQuery(db, `SELECT * FROM todos`);
             console.table(result);
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