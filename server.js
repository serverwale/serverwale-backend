console.log("SERVER FILE LOADED ✅");

process.on("uncaughtException", (err) => {
  console.error("🔥 UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("🔥 UNHANDLED PROMISE REJECTION:", reason);
});

const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const db = require("./db");

const app = express();

/* ================================
   BASIC SECURITY
================================ */
app.disable("x-powered-by");

/* ================================
   MIDDLEWARE
================================ */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* ================================
   STATIC FILES
================================ */
const uploadsPath = path.join(__dirname, "uploads");
// Allow cross-origin image/file access from frontend dev server
app.use("/uploads", (req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
}, express.static(uploadsPath));
console.log("Uploads folder:", uploadsPath);

// Security headers (relaxed for dev — tighten in prod)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
}));

// CORS (lock this in prod)
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "http://localhost:3004", "http://localhost:3005", "http://localhost:5173"],
  credentials: true,
}));

// Rate limiting — only on login (anti-bruteforce), not all API routes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 20,                     // max 20 login attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts. Please try again later." }
});

// Light rate limit for public form submissions only
const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});

/* ================================
   ROUTES
================================ */
app.use("/api/products", require("./routes/products"));
app.use("/api/product-images", require("./routes/productImages"));
app.use("/api/product-reviews", require("./routes/productReviews"));
app.use("/api/product-descriptions", require("./routes/productDescriptions"));
app.use("/api/product-specifications", require("./routes/productSpecification"));
app.use("/api/product-faqs", require("./routes/productFAQ"));
app.use("/api/product-warranty", require("./routes/productWarranty"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/pricing-requests", require("./routes/pricingRequests"));
app.use("/api/support-requests", require("./routes/supportRequests"));
app.use("/api/inquiries", require("./routes/inquiries"));
app.use("/api/blogs", require("./routes/blogs"));
app.use("/api/leads", require("./routes/Leads"));
app.use("/api/ai-leads", require("./routes/aiLeads"));
app.use("/api/consultations", require("./routes/consultations")); 
app.use("/api/chat", require("./routes/chat"));
app.use("/api/shop-products", require("./routes/shopProducts"));
app.use("/api/shop-categories", require("./routes/shopCategories"));
app.use("/api/jobs", require("./routes/jobs"));

/* ================================
   CONSULTATION API
================================ */
app.post("/api/consultations", (req, res) => {
  const { name, phone, state, email } = req.body;

  if (!name || !phone || !state || !email) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  db.query(
    "INSERT INTO consultations (name, phone, state, email) VALUES (?, ?, ?, ?)",
    [name, phone, state, email],
    (err, result) => {
      if (err) {
        console.error("DB Error ❌", err);
        return res.status(500).json({ success: false });
      }
      res.json({ success: true, id: result.insertId });
    }
  );
});

/* ================================
   CONTACT API
================================ */
app.post("/api/contact", (req, res) => {
  const { name, email, company, requirement, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "Required fields missing",
    });
  }

  db.query(
    `INSERT INTO contact_inquiries
     (full_name, email, company, requirement, details)
     VALUES (?, ?, ?, ?, ?)`,
    [name, email, company || null, requirement || null, message],
    (err, result) => {
      if (err) {
        console.error("CONTACT MYSQL ERROR ❌", err);
        return res.status(500).json({ success: false });
      }

      res.json({ success: true, id: result.insertId });
    }
  );
});

/* ================================
   PRICING API
================================ */
app.post("/api/pricing", (req, res) => {
  const { name, phone, serviceType, email } = req.body;

  if (!name || !phone || !serviceType || !email) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  db.query(
    `INSERT INTO pricing_requests
     (full_name, phone, service, email, status)
     VALUES (?, ?, ?, ?, 'new')`,
    [name, phone, serviceType, email],
    (err, result) => {
      if (err) {
        console.error("PRICING MYSQL ERROR ❌", err);
        return res.status(500).json({ success: false });
      }

      res.json({ success: true, id: result.insertId });
    }
  );
});

/* ================================
   ADMIN LOGIN API
================================ */
app.post("/api/admin/login", loginLimiter, (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.json({ success: false, message: "Missing fields" });
  }

  db.query(
    "SELECT * FROM admin_users WHERE username = ?",
    [username],
    (err, result) => {
      if (err) return res.json({ success: false, message: "Database error" });
      if (!result.length)
        return res.json({ success: false, message: "User not found" });

      const admin = result[0];
      if (password !== admin.password)
        return res.json({ success: false, message: "Wrong password" });

      res.json({ success: true, message: "Login successful 🎉" });
    }
  );
});

/* ================================
   HEALTH CHECK
================================ */
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", ai: "Emma running 🤖" });
});



/* ================================
   SERVER START
================================ */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT} 🚀`);
});

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ message: "Internal Server Error" });
});

