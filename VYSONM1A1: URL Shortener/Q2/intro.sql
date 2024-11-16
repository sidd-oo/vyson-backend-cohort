-- [Q2] Add 3-5 rows with sample data and share a screenshot of the table.

CREATE TABLE url_shortener (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    original_url TEXT NOT NULL,
    short_code TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

INSERT INTO url_shortener(original_url, short_code) VALUES ('https://redux.com/', 'redux');
INSERT INTO url_shortener(original_url, short_code) VALUES ('https://react.com/', 'react');
INSERT INTO url_shortener(original_url, short_code) VALUES ('https://remotejobs.com/', 'remotejobs');
INSERT INTO url_shortener(original_url, short_code) VALUES ('https://wellfound.com/', 'wellfound');
INSERT INTO url_shortener(original_url, short_code) VALUES ('https://golang.com/', 'golang');

SELECT * FROM url_shortener

