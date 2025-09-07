const db = require('./db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL,
      student_name TEXT NOT NULL,
      date TEXT NOT NULL,
      status TEXT DEFAULT 'Present',
      latitude REAL,
      longitude REAL,
      marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
});
