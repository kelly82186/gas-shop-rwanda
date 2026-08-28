import dotenv from "dotenv";
import express from "express";
import mysql from "mysql2";
import cors from "cors";
import pkg from "google-auth-library";

dotenv.config();

const { OAuth2Client } = pkg;
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const app = express();
const port = Number(process.env.PORT || 5000);

// ✅ ENV DEBUG
console.log("ENV CHECK:");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_NAME:", process.env.DB_NAME);

// ✅ DATABASE CONNECTION
const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, // ✅ FIXED
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
}).promise();

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("🔥 Gas Shop API is running...");
});

// ✅ TEST ROUTE
app.get("/health", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ status: "ok" });
  } catch {
    res.status(500).json({ error: "Database not connected" });
  }
});

// ================== MESSAGES ==================
app.post("/messages", async (req, res) => {
  const { name, email, phone = "", subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "All fields required" });
  }

  try {
    await db.query(
      "INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)",
      [name, email, phone, subject, message]
    );

    res.status(201).json({ message: "Message saved" });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/messages", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM contact_messages ORDER BY id DESC");
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Error loading messages" });
  }
});

// ================== AUTH ==================
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields required" });
  }

  try {
    const [existing] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const [result] = await db.query(
      "INSERT INTO users (name, email, PASSWORD, role) VALUES (?, ?, ?, 'user')",
      [username, email, password]
    );

    res.json({ message: "Registered", id: result.insertId });
  } catch {
    res.status(500).json({ error: "Register failed" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const [users] = await db.query(
      "SELECT * FROM users WHERE (name = ? OR email = ?) AND PASSWORD = ?",
      [username, username, password]
    );

    if (!users.length) {
      return res.status(401).json({ error: "Invalid login" });
    }

    res.json({ user: users[0] });
  } catch {
    res.status(500).json({ error: "Login error" });
  }
});

// ================== PRODUCTS ==================
app.get("/products", async (req, res) => {
  try {
    const [products] = await db.query("SELECT * FROM products ORDER BY id DESC");
    res.json(products);
  } catch {
    res.status(500).json({ error: "Cannot load products" });
  }
});

app.post("/products", async (req, res) => {
  const { name, price, description = "", image = "", category = "" } = req.body;

  if (!name || price == null) {
    return res.status(400).json({ error: "Name and price required" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO products (name, description, price, image, category) VALUES (?, ?, ?, ?, ?)",
      [name, description, price, image, category]
    );

    res.json({ id: result.insertId });
  } catch {
    res.status(500).json({ error: "Cannot add product" });
  }
});

// ================== SERVER START ==================
app.listen(port, async () => {
  try {
    await db.query("SELECT 1");
    console.log("✅ Connected to MySQL");
    console.log(`🚀 Server running on port ${port}`);
  } catch (error) {
    console.error(
      `❌ Database connection failed for ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
      error.code || error.message
    );
  }
});
