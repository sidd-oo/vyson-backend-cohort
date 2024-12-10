import sqlite3 from 'sqlite3';

const db = new sqlite3.Database("url_shortener.db", (err) => {
    if (err) {
        throw new Error(err);
    }
    console.log("Connection established");
});

const insertURLs = rowCount => (
    db.run(`CREATE TABLE IF NOT EXISTS url_shortener (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    original_url TEXT NOT NULL,
    short_code TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
)`, (error) => {
        if (error) throw error;
        db.serialize(() => {
            const query = "INSERT INTO url_shortener(original_url, short_code) VALUES(?, ?)";
            for (let i = 0; i < rowCount; i++) {
                const original_url = `https://example${i + 1}.com`;
                const short_code = `exp${i + 1}`
                db.run(query, [original_url, short_code], (error) => {
                    if (error) throw error;
                })
            }

            db.all(`SELECT * FROM url_shortener`, (error, table) => {
                if (error) throw error;
                console.table(table)
               
                db.close((err) => {
                    if (err) {
                        throw new Error(err);
                    }
                    console.log("Connection closed");
                });
            })
        })

    }))

insertURLs(1001);

