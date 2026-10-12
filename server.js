
const express = require("express");
const Database = require("better-sqlite3");
const path = require("path");

console.log("SERVER FILE STARTED");

const app = express();
const PORT = process.env.PORT || 3000;

// Database
const db = new Database(path.join(__dirname, "riyadvi.db"));

// Create tables without deleting existing records
db.exec(`
  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS consultations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    service TEXT NOT NULL,
    message TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS health_checkups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT DEFAULT '',
    website TEXT DEFAULT '',
    answers TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS lead_magnets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    resource TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT DEFAULT '',
    position TEXT NOT NULL,
    resume TEXT DEFAULT '',
    cover_letter TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Allow requests from the GitHub Pages frontend
app.use((req, res, next) => {
  const allowedOrigin =
    "https://harishiniselvakumar2004-spec.github.io";

  if (req.headers.origin === allowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// Serve static files if requested
app.use(express.static(__dirname));

// Status API
app.get("/api/status", (req, res) => {
  res.json({
    success: true,
    message: "Riyadvi backend is running!"
  });
});

// Contact API
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
    const result = db.prepare(`
      INSERT INTO contacts (name, email, message)
      VALUES (?, ?, ?)
    `).run(name.trim(), email.trim(), message.trim());

    return res.status(201).json({
      success: true,
      message: "Your message has been saved successfully!",
      id: result.lastInsertRowid
    });
  } catch (error) {
    console.error("Contact error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not save your message."
    });
  }
});

// Consultation API
app.post("/api/consultation", (req, res) => {
  const { name, email, phone, service, message } = req.body;

  if (
    typeof name !== "string" || !name.trim() ||
    typeof email !== "string" || !email.trim() ||
    typeof phone !== "string" || !phone.trim() ||
    typeof service !== "string" || !service.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: "Please fill in all required fields."
    });
  }

  try {
    const result = db.prepare(`
      INSERT INTO consultations
        (name, email, phone, service, message)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      name.trim(),
      email.trim(),
      phone.trim(),
      service.trim(),
      typeof message === "string" ? message.trim() : ""
    );

    return res.status(201).json({
      success: true,
      message: "Consultation request submitted successfully!",
      id: result.lastInsertRowid
    });
  } catch (error) {
    console.error("Consultation error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not save consultation request."
    });
  }
});

// Health checkup API
app.post("/api/health-checkup", (req, res) => {
  const { name, email, company, website, answers } = req.body;

  if (
    typeof name !== "string" || !name.trim() ||
    typeof email !== "string" || !email.trim() ||
    answers === undefined ||
    answers === null ||
    typeof answers !== "object" ||
    Array.isArray(answers)
  ) {
    return res.status(400).json({
      success: false,
      message: "Name, email, and answers are required."
    });
  }

  try {
    const result = db.prepare(`
      INSERT INTO health_checkups
        (name, email, company, website, answers)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      name.trim(),
      email.trim(),
      typeof company === "string" ? company.trim() : "",
      typeof website === "string" ? website.trim() : "",
      JSON.stringify(answers)
    );

    return res.status(201).json({
      success: true,
      message: "Health checkup submitted successfully!",
      id: result.lastInsertRowid
    });
  } catch (error) {
    console.error("Health checkup error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not save health checkup."
    });
  }
});

// Lead magnet API
app.post("/api/lead-magnet", (req, res) => {
  const { name, email, resource } = req.body;

  if (
    typeof name !== "string" || !name.trim() ||
    typeof email !== "string" || !email.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: "Name and email are required."
    });
  }

  try {
    const result = db.prepare(`
      INSERT INTO lead_magnets (name, email, resource)
      VALUES (?, ?, ?)
    `).run(
      name.trim(),
      email.trim(),
      typeof resource === "string" ? resource.trim() : ""
    );

    return res.status(201).json({
      success: true,
      message: "Lead magnet request submitted successfully!",
      id: result.lastInsertRowid
    });
  } catch (error) {
    console.error("Lead magnet error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not save lead magnet request."
    });
  }
});

// Job application API
app.post("/api/applications", (req, res) => {
  const {
    name,
    email,
    phone,
    position,
    resume,
    cover_letter
  } = req.body;

  if (
    typeof name !== "string" || !name.trim() ||
    typeof email !== "string" || !email.trim() ||
    typeof position !== "string" || !position.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: "Name, email, and position are required."
    });
  }

  try {
    const result = db.prepare(`
      INSERT INTO applications
        (name, email, phone, position, resume, cover_letter)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      name.trim(),
      email.trim(),
      typeof phone === "string" ? phone.trim() : "",
      position.trim(),
      typeof resume === "string" ? resume.trim() : "",
      typeof cover_letter === "string" ? cover_letter.trim() : ""
    );

    return res.status(201).json({
      success: true,
      message: "Job application submitted successfully!",
      id: result.lastInsertRowid
    });
  } catch (error) {
    console.error("Application error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not save job application."
    });
  }
});

// Start server
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`SERVER LISTENING SUCCESSFULLY on port ${PORT}`);
});

server.on("error", (error) => {
  console.error("SERVER LISTEN ERROR:", error);
});
