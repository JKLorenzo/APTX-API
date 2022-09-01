import Database from "better-sqlite3";

export const db = new Database("database.db");

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS USERS (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT,
      password TEXT
    );

    CREATE TABLE IF NOT EXISTS ACCESS_TOKENS (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      token TEXT,
      FOREIGN KEY (user_id) REFERENCES USERS (id) ON UPDATE CASCADE ON DELETE CASCADE
    );
  `);
}
