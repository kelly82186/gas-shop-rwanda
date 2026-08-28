import dotenv from "dotenv";
import express from "express";
import mysql from "mysql2";
import cors from "cors";
import pkg from "google-auth-library";
dotenv.config();

const { OAuth2Client } = pkg;
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const app = express();
const port = Number(process.env.PORT || 5000);

console.log("ENV CHECK:");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("DB_USER:", process.env.DB_USER);   // ✅ correct
console.log("DB_NAME:", process.env.DB_NAME);   // ✅ correct

const db = mysql.createPool({
  host: process.env.DB_HOST,        // ✅ altaria.proxy.rlwy.net
  port: Number(process.env.DB_PORT),// ✅ 3306
  user: process.env.DB_USER,        // ✅ root
  password: process.env.DB_PASSWORD,    // ✅ 123456
  database: process.env.DB_NAME,    // ✅ gas_shop_db
  connectionLimit: 10
})


.promise();

app.listen(port, async () => {
  try {
    await db.query("SELECT 1");
    console.log("Connected to MySQL database");
    console.log(`Server running on port ${port}`);
  } catch (error) {
    console.error(
  `Database connection failed for ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}:`,
  error.code || error.message
);
      process.env.DB_HOST,
      process.env.DB_PORT,
      process.env.DB_NAME,
      error.code || error.message
    );
  }
});

app.post("/messages", async (req, res) => {
  const { name, email, phone = "", subject, message } = req.body;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const normalizedEmail = email?.trim().toLowerCase();
  if (!name?.trim() || !emailPattern.test(normalizedEmail || "") || !subject?.trim() || !message?.trim()) {
    return res.status(400).json({ error: "Please enter a valid email and complete all required fields." });
  }
  try {
    await db.query(
      "INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)",
      [name.trim(), normalizedEmail, phone.trim(), subject.trim(), message.trim()]
    );
    res.status(201).json({ message: "Message received" });
  } catch {
    res.status(500).json({ error: "Could not save message" });
  }
});

app.delete("/messages/:id", async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM contact_messages WHERE id = ?", [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: "Message not found" });
    res.json({ message: "Message deleted" });
  } catch {
    res.status(500).json({ error: "Could not delete message" });
  }
});

app.get("/messages", async (req, res) => {
  try {
    const [messages] = await db.query(
      "SELECT id, name, email, phone, subject, message, created_at AS createdAt FROM contact_messages ORDER BY id DESC"
    );
    res.json(messages);
  } catch {
    res.status(500).json({ error: "Could not load messages" });
  }
});

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  const namePattern = /^[\p{L}]+(?:[ .'-][\p{L}]+)*$/u;
  const gmailPattern = /^[a-zA-Z0-9](?:[a-zA-Z0-9._-]{4,28})@gmail\.com$/i;
  if (!namePattern.test(username?.trim() || "") || username?.includes("@")) {
    return res.status(400).json({ field: "username", error: "Enter a real name, not an email address or username." });
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ field: "password", error: "Password must be at least 8 characters." });
  }
  if (!gmailPattern.test(email?.trim() || "")) {
    return res.status(400).json({ field: "email", error: "Please enter a valid Gmail address." });
  }

  try {
    const [existingUsers] = await db.query(
      "SELECT name, PASSWORD FROM users WHERE LOWER(name) = LOWER(?) OR PASSWORD = ?",
      [username.trim(), password]
    );
    if (existingUsers.some((user) => user.name.toLowerCase() === username.trim().toLowerCase())) {
      return res.status(409).json({ field: "username", error: "This name is already used. Please enter a different name." });
    }
    if (existingUsers.some((user) => user.PASSWORD === password)) {
      return res.status(409).json({ field: "password", error: "This password is already in use. Please choose another password." });
    }

    const [existingEmail] = await db.query("SELECT id FROM users WHERE LOWER(email) = LOWER(?)", [email.trim()]);
    if (existingEmail.length) {
      return res.status(409).json({ field: "email", error: "This email is already registered. Please use another email." });
    }

    const [result] = await db.query(
      "INSERT INTO users (name, email, PASSWORD, role) VALUES (?, ?, ?, 'user')",
      [username.trim(), email.trim().toLowerCase(), password]
    );
    res.status(201).json({ message: "User registered", user: { id: result.insertId, name: username.trim(), username: username.trim(), email, role: "user" } });
  } catch (error) {
    const status = error.code === "ER_DUP_ENTRY" ? 409 : 500;
    res.status(status).json({
      field: status === 409 ? "email" : undefined,
      error: status === 409 ? "This email is already registered. Please use another email." : "Registration failed because the database is not connected. Please start MySQL and try again.",
    });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const [users] = await db.query(
      "SELECT id, name, email, role FROM users WHERE (name = ? OR email = ?) AND PASSWORD = ?",
      [username, username, password]
    );
    const user = users[0];
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    res.json({ message: "Login successful", user: { ...user, username: user.name } });
  } catch {
    res.status(500).json({ error: "Login failed" });
  }
});

app.post("/auth/google", async (req, res) => {
  if (!googleClientId) return res.status(503).json({ error: "Google sign-in is not configured" });

  try {
    const ticket = await googleClient.verifyIdToken({ idToken: req.body.credential, audience: googleClientId });
    const payload = ticket.getPayload();
    if (!payload.email || !payload.email_verified) return res.status(401).json({ error: "Google email is not verified" });
    const [users] = await db.query("SELECT id, name, email, role FROM users WHERE LOWER(email) = LOWER(?)", [payload.email]);
    let user = users[0];

    if (!user) {
      const googleName = payload.name || payload.email.split("@")[0];
      const [result] = await db.query(
        "INSERT INTO users (name, email, PASSWORD, role) VALUES (?, ?, ?, 'user')",
        [googleName, payload.email.toLowerCase(), `google:${payload.sub}`]
      );
      user = { id: result.insertId, name: googleName, email: payload.email.toLowerCase(), role: "user" };
    }

    res.json({ message: "Google login successful", user: { ...user, username: user.name } });
  } catch {
    res.status(401).json({ error: "Google sign-in could not be verified" });
  }
});

app.get("/users", async (req, res) => {
  try {
    const [users] = await db.query("SELECT id, name, email, role, creacte_at FROM users ORDER BY id DESC");
    res.json(users.map((user) => ({ ...user, username: user.name, active: false })));
  } catch {
    res.status(500).json({ error: "Could not load users" });
  }
});

app.delete("/users/:id", async (req, res) => {
  const connection = await db.getConnection();
  try {
    const [users] = await connection.query("SELECT role FROM users WHERE id = ?", [req.params.id]);
    if (!users.length) return res.status(404).json({ error: "Customer not found" });
    if (users[0].role === "admin") return res.status(403).json({ error: "The admin account cannot be deleted" });

    await connection.beginTransaction();
    await connection.query("DELETE oi FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE o.user_id = ?", [req.params.id]);
    await connection.query("DELETE FROM orders WHERE user_id = ?", [req.params.id]);
    await connection.query("DELETE FROM cart WHERE user_id = ?", [req.params.id]);
    await connection.query("DELETE FROM users WHERE id = ?", [req.params.id]);
    await connection.commit();
    res.json({ message: "Customer and related records deleted" });
  } catch {
    await connection.rollback();
    res.status(500).json({ error: "Could not delete customer" });
  } finally {
    connection.release();
  }
});

app.get("/products", async (req, res) => {
  try {
    const [products] = await db.query("SELECT id, name, description, price, image, category FROM products ORDER BY id DESC");
    res.json(products.map((product) => ({ ...product, price: Number(product.price), inStock: true, rating: 0, reviews: 0 })));
  } catch {
    res.status(500).json({ error: "Could not load products" });
  }
});

app.post("/products", async (req, res) => {
  const { name, price, description = "", image = "", category = "" } = req.body;
  if (!name || price === undefined) return res.status(400).json({ error: "Name and price are required" });
  try {
    const [result] = await db.query(
      "INSERT INTO products (name, description, price, image, category) VALUES (?, ?, ?, ?, ?)",
      [name, description, Number(price), image, category]
    );
    res.status(201).json({ id: result.insertId, name, description, price: Number(price), image, category, inStock: true, rating: 0, reviews: 0 });
  } catch {
    res.status(500).json({ error: "Could not add product" });
  }
});

app.put("/products/:id", async (req, res) => {
  const { name, price, description = "", image = "", category = "" } = req.body;
  try {
    const [result] = await db.query(
      "UPDATE products SET name = ?, description = ?, price = ?, image = ?, category = ? WHERE id = ?",
      [name, description, Number(price), image, category, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product updated" });
  } catch {
    res.status(500).json({ error: "Could not update product" });
  }
});

app.delete("/products/:id", async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM products WHERE id = ?", [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch {
    res.status(500).json({ error: "Could not delete product" });
  }
});

app.get("/cart/:userId", async (req, res) => {
  try {
    const [items] = await db.query(
      `SELECT p.id, p.name, p.description, p.price, p.image, p.category, c.quantity AS qty
       FROM cart c JOIN products p ON p.id = c.product_id WHERE c.user_id = ?`,
      [req.params.userId]
    );
    res.json(items.map((item) => ({ ...item, price: Number(item.price), inStock: true })));
  } catch {
    res.status(500).json({ error: "Could not load cart" });
  }
});

app.post("/cart", async (req, res) => {
  const { userId, productId, quantity = 1 } = req.body;
  try {
    const [existing] = await db.query("SELECT id FROM cart WHERE user_id = ? AND product_id = ?", [userId, productId]);
    if (existing.length) {
      await db.query("UPDATE cart SET quantity = quantity + ? WHERE id = ?", [quantity, existing[0].id]);
    } else {
      await db.query("INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)", [userId, productId, quantity]);
    }
    res.status(201).json({ message: "Cart updated" });
  } catch {
    res.status(500).json({ error: "Could not update cart" });
  }
});

app.put("/cart", async (req, res) => {
  const { userId, productId, quantity } = req.body;
  try {
    await db.query("UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?", [quantity, userId, productId]);
    res.json({ message: "Cart quantity updated" });
  } catch {
    res.status(500).json({ error: "Could not update cart quantity" });
  }
});

app.delete("/cart/:userId/:productId", async (req, res) => {
  try {
    await db.query("DELETE FROM cart WHERE user_id = ? AND product_id = ?", [req.params.userId, req.params.productId]);
    res.json({ message: "Item removed" });
  } catch {
    res.status(500).json({ error: "Could not remove cart item" });
  }
});

app.post("/orders", async (req, res) => {
  const { userId, phoneNumber, totalPrice, items } = req.body;
  if (!userId || !phoneNumber?.trim() || !items?.length) return res.status(400).json({ error: "Phone number and cart items are required" });

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [order] = await connection.query(
      "INSERT INTO orders (user_id, phone_number, total_price, status) VALUES (?, ?, ?, 'pending')",
      [userId, phoneNumber.trim(), totalPrice]
    );
    for (const item of items) {
      await connection.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [order.insertId, item.id, item.qty, item.price]
      );
    }
    await connection.query("DELETE FROM cart WHERE user_id = ?", [userId]);
    await connection.commit();
    res.status(201).json({ message: "Order placed", orderId: order.insertId });
  } catch {
    await connection.rollback();
    res.status(500).json({ error: "Could not place order" });
  } finally {
    connection.release();
  }
});

app.get("/orders", async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.id, o.user_id AS userId, o.phone_number AS phoneNumber, o.total_price AS totalPrice,
              o.status, u.name AS username, u.email
       FROM orders o JOIN users u ON u.id = o.user_id ORDER BY o.id DESC`
    );
    const [items] = await db.query(
      `SELECT oi.order_id AS orderId, oi.product_id AS productId, oi.quantity, oi.price, p.name
       FROM order_items oi JOIN products p ON p.id = oi.product_id ORDER BY oi.order_id DESC`
    );
    res.json(orders.map((order) => ({
      ...order,
      totalPrice: Number(order.totalPrice),
      items: items.filter((item) => item.orderId === order.id).map((item) => ({ ...item, price: Number(item.price) })),
    })));
  } catch {
    res.status(500).json({ error: "Could not load orders" });
  }
});

app.put("/orders/:id/status", async (req, res) => {
  const status = req.body.status;
  if (!["pending", "received"].includes(status)) return res.status(400).json({ error: "Invalid order status" });
  try {
    const [result] = await db.query("UPDATE orders SET status = ? WHERE id = ?", [status, req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: "Order not found" });
    res.json({ message: "Order status updated", status });
  } catch {
    res.status(500).json({ error: "Could not update order status" });
  }
});

app.post("/orders/:id/receive", async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [orders] = await connection.query("SELECT id, status FROM orders WHERE id = ? FOR UPDATE", [req.params.id]);
    if (!orders.length) {
      await connection.rollback();
      return res.status(404).json({ error: "Order not found" });
    }
    if (orders[0].status === "received") {
      await connection.rollback();
      return res.status(400).json({ error: "Order has already been received" });
    }

    await connection.query("UPDATE orders SET status = 'received' WHERE id = ?", [req.params.id]);
    await connection.query("DELETE FROM order_items WHERE order_id = ?", [req.params.id]);
    await connection.query("DELETE FROM orders WHERE id = ? AND status = 'received'", [req.params.id]);
    await connection.commit();
    res.json({ message: "Order received and removed" });
  } catch {
    await connection.rollback();
    res.status(500).json({ error: "Could not receive order" });
  } finally {
    connection.release();
  }
});

app.delete("/orders/:id", async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [orders] = await connection.query("SELECT id, status FROM orders WHERE id = ?", [req.params.id]);
    if (!orders.length) {
      await connection.rollback();
      return res.status(404).json({ error: "Order not found" });
    }
    if (orders[0].status !== "received") {
      await connection.rollback();
      return res.status(400).json({ error: "Only received orders can be deleted" });
    }
    await connection.query("DELETE FROM order_items WHERE order_id = ?", [req.params.id]);
    const [result] = await connection.query("DELETE FROM orders WHERE id = ?", [req.params.id]);
    if (!result.affectedRows) {
      await connection.rollback();
      return res.status(404).json({ error: "Order not found" });
    }
    await connection.commit();
    res.json({ message: "Order deleted" });
  } catch {
    await connection.rollback();
    res.status(500).json({ error: "Could not delete order" });
  } finally {
    connection.release();
  }
});

app.listen(port, async () => {
  try {
    await db.query(`CREATE TABLE IF NOT EXISTS contact_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(30) NOT NULL DEFAULT '',
      subject VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    await db.query("ALTER TABLE orders ADD COLUMN phone_number VARCHAR(30) NOT NULL DEFAULT ''");
  } catch (error) {
    if (error.code !== "ER_DUP_FIELDNAME") console.error("Could not prepare order phone number:", error.message);
  }

  try {
    await db.query("SELECT 1");
    console.log("Connected to MySQL database gas_shop_db");
    console.log(`Server running on port ${port}`);
  } catch (error) {
    console.error(`Database connection failed for ${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || 3306}/${databaseName}:`, error.code || error.message);
  }
});
