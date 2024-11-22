import sqlite3 from 'sqlite3';

const shortCodes = ["exp999", "exp120", "exp878", "exp400", "exp98"];
const db = new sqlite3.Database("url_shortener.db", (err) => {
    if (err) {
        throw new Error(err);
    }
    console.log("Connection established");
});


const closeDBconnection = () => {
    db.close((err) => {
        if (err) {
            throw new Error(err);
        }
        console.log("Connection closed");
    });
}

const insertAndFetchShortCode = rowCount => (
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
            //Loop 1M times
            fetchOriginalURLs(shortCodes, rowCount, 1000000).then(() => {
                closeDBconnection();
            })

        })
    }))

const fetchOriginalURLs = async (shortCodes, rowCount, loopCount) => {
    const commaSeparatedShortCodesStr = new Array(shortCodes.length).fill('?').join(",");
    const query = `SELECT original_url FROM url_shortener WHERE short_code IN (${commaSeparatedShortCodesStr})`
    const startTime = Date.now();
    for (let i = 0; i < loopCount; i++) {
        await new Promise((resolve, reject) => {
            db.all(query, shortCodes, (error, rows) => {
                if (error) reject(error);
                resolve(rows)
            })
        })
    }
    console.log(`Time taken for fetching original_url for ${shortCodes.length} number of short_code is ${(Date.now() - startTime) / 1000}secs for the ${rowCount} number of table entries.`)
}

insertAndFetchShortCode(1000)
