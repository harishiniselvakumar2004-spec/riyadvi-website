
const express = require("express");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const PORT = 3000;

// Database file will be created automatically
const db = new Database("riyadvi.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Backend status
app.get("/api/status", (req, res) => {
  res.json({
    success: true,
    message: "Riyadvi backend is running!"
  });
});

// Save contact form submission
app.post("/api/contact", (req, res) => {
  const { name, email, message } = req.body;

  if (
    typeof name !== "string" || !name.trim() ||
    typeof email !== "string" || !email.trim() ||
    typeof message !== "string" || !message.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: "Please fill in all fields."
    });
  }

  try {
    const saveContact = db.prepare(`
      INSERT INTO contacts (name, email, message)
      VALUES (?, ?, ?)
    `);

    const result = saveContact.run(
      name.trim(),
      email.trim(),
      message.trim()
    );

    res.status(201).json({
      success: true,
      message: "Your message has been saved successfully!",
      id: result.lastInsertRowid
    });
  } catch (error) {
    console.error("Database error:", error.message);
    res.status(500).json({
      success: false,
      message: "Could not save your message."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Riyadvi server running at http://localhost:${PORT}`);
});

app.get("/api/contacts", (req, res) => {
  const contacts = db.prepare(`
    SELECT id, name, email, message, created_at
    FROM contacts
    ORDER BY id DESC
  `).all();

  res.json({
    success: true,
    count: contacts.length,
    contacts
  });
});