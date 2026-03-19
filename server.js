console.log("SERVER FILE LOADED ✅");

process.on("uncaughtException", (err) => {
  console.error("🔥 UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("🔥 UNHANDLED PROMISE REJECTION:", reason);
});

const http      = require("http");
const { Server } = require("socket.io");
const helmet    = require("helmet");
const rateLimit = require("express-rate-limit");
const express   = require("express");
const cors      = require("cors");
const path      = require("path");
const axios     = require("axios");
const bcrypt    = require("bcryptjs");
require("dotenv").config();

const db = require("./db");

/* ── AI Agents ── */
const { inspectRequest, trackLogin, getRecentLogs, getSuspiciousIPs, logEvent } = require("./ai-agents/securityAgent");
const analyticsAgent = require("./ai-agents/analyticsAgent");
const reportAgent    = require("./ai-agents/reportAgent");
const blogAgent      = require("./ai-agents/blogAgent");

const app    = express();
const server = http.createServer(app);

/* ================================
   SOCKET.IO — Real-Time Dashboard
================================ */
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000","http://localhost:3001","http://localhost:3002",
             "http://localhost:3003","http://localhost:3004","http://localhost:3005",
             "http://localhost:5173","https://serverwale.com"],
    credentials: true,
  },
});

// Pass io to analytics agent so it can push live updates
analyticsAgent.setIO(io);

io.on("connection", (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  // Admin joins "admin-room" to receive real-time agent data
  socket.on("join-admin", () => {
    socket.join("admin-room");
    // Send current state immediately on connect
    socket.emit("visitor-update", {
      activeCount: analyticsAgent.getActiveVisitors().length,
      activeVisitors: analyticsAgent.getActiveVisitors(),
    });
    socket.emit("security-logs", {
      logs: getRecentLogs(20),
      suspiciousIPs: getSuspiciousIPs(),
    });
  });

  // Visitor heartbeat to keep session alive
  socket.on("visitor-ping", ({ sessionId }) => {
    if (sessionId) {
      const visitors = analyticsAgent.getActiveVisitors();
      const v = visitors.find(x => x.sessionId === sessionId);
      if (v) v.lastSeen = new Date().toISOString();
    }
  });

  socket.on("disconnect", () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

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
app.use("/uploads", (req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
}, express.static(uploadsPath));
console.log("Uploads folder:", uploadsPath);

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
}));

// CORS
app.use(cors({
  origin: ["http://localhost:3000","http://localhost:3001","http://localhost:3002",
           "http://localhost:3003","http://localhost:3004","http://localhost:3005",
           "http://localhost:5173","https://serverwale.com"],
  credentials: true,
}));

/* ================================
   AI SECURITY MIDDLEWARE (FIRST — before all routes)
================================ */
app.use(inspectRequest);

/* ================================
   ANALYTICS MIDDLEWARE
================================ */
app.use(analyticsAgent.analyticsMiddleware);

/* ================================
   RATE LIMITING
================================ */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts. Please try again later." },
});

const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});

/* ================================
   ROUTES
================================ */
app.use("/api/products",              require("./routes/products"));
app.use("/api/product-images",        require("./routes/productImages"));
app.use("/api/product-reviews",       require("./routes/productReviews"));
app.use("/api/product-descriptions",  require("./routes/productDescriptions"));
app.use("/api/product-specifications",require("./routes/productSpecification"));
app.use("/api/product-faqs",          require("./routes/productFAQ"));
app.use("/api/product-warranty",      require("./routes/productWarranty"));
app.use("/api/categories",            require("./routes/categories"));
app.use("/api/pricing-requests",      require("./routes/pricingRequests"));
app.use("/api/support-requests",      require("./routes/supportRequests"));
app.use("/api/inquiries",             require("./routes/inquiries"));
app.use("/api/blogs",                 require("./routes/blogs"));
app.use("/api/leads",                 require("./routes/Leads"));
app.use("/api/ai-leads",              require("./routes/aiLeads"));
app.use("/api/consultations",         require("./routes/consultations"));
app.use("/api/chat",                  require("./routes/chat"));
app.use("/api/shop-products",         require("./routes/shopProducts"));
app.use("/api/shop-categories",       require("./routes/shopCategories"));
app.use("/api/jobs",                  require("./routes/jobs"));

/* ── AI AGENTS (Security + Marketing + Analytics + SEO) ── */
app.use("/api/ai", require("./routes/aiAgents"));

/* ================================
   IMAGE PROXY
================================ */
app.get("/api/img-proxy", async (req, res) => {
  const raw = req.query.u;
  if (!raw) return res.status(400).send("Missing url");
  try {
    const imgRes = await axios.get(raw, {
      responseType: "arraybuffer",
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 8000,
    });
    const ct = imgRes.headers["content-type"] || "image/webp";
    res.set("Content-Type", ct);
    res.set("Cache-Control", "public, max-age=86400");
    res.set("Access-Control-Allow-Origin", "*");
    res.send(Buffer.from(imgRes.data));
  } catch {
    res.status(502).send("Image fetch failed");
  }
});

/* ================================
   SITEMAP & ROBOTS
================================ */
const seoAgent = require("./ai-agents/seoAgent");

app.get("/sitemap.xml", (req, res) => {
  res.set("Content-Type", "application/xml");
  res.send(seoAgent.generateSitemap());
});

app.get("/robots.txt", (req, res) => {
  res.set("Content-Type", "text/plain");
  res.send(seoAgent.generateRobotsTxt());
});

/* ================================
   CONSULTATION API
================================ */
app.post("/api/consultations", formLimiter, (req, res) => {
  const { name, phone, state, email } = req.body;
  if (!name || !phone || !state || !email) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }
  db.query(
    "INSERT INTO consultations (name, phone, state, email) VALUES (?, ?, ?, ?)",
    [name, phone, state, email],
    (err, result) => {
      if (err) { console.error("DB Error ❌", err); return res.status(500).json({ success: false }); }
      res.json({ success: true, id: result.insertId });
    }
  );
});

/* ================================
   CONTACT API
================================ */
app.post("/api/contact", formLimiter, (req, res) => {
  const { name, email, company, requirement, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: "Required fields missing" });
  }
  db.query(
    `INSERT INTO contact_inquiries (full_name, email, company, requirement, details) VALUES (?, ?, ?, ?, ?)`,
    [name, email, company || null, requirement || null, message],
    (err, result) => {
      if (err) { console.error("CONTACT MYSQL ERROR ❌", err); return res.status(500).json({ success: false }); }
      res.json({ success: true, id: result.insertId });
    }
  );
});

/* ================================
   PRICING API
================================ */
app.post("/api/pricing", formLimiter, (req, res) => {
  const { name, phone, serviceType, email } = req.body;
  if (!name || !phone || !serviceType || !email) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }
  db.query(
    `INSERT INTO pricing_requests (full_name, phone, service, email, status) VALUES (?, ?, ?, ?, 'new')`,
    [name, phone, serviceType, email],
    (err, result) => {
      if (err) { console.error("PRICING MYSQL ERROR ❌", err); return res.status(500).json({ success: false }); }
      res.json({ success: true, id: result.insertId });
    }
  );
});

/* ================================
   ADMIN LOGIN API (bcrypt secured)
================================ */
app.post("/api/admin/login", loginLimiter, (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.json({ success: false, message: "Missing fields" });
  }

  // Track login attempt for brute-force detection
  const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";

  db.query(
    "SELECT * FROM admin_users WHERE username = ?",
    [username],
    async (err, result) => {
      if (err) return res.json({ success: false, message: "Database error" });
      if (!result.length) {
        trackLogin(ip, false);
        return res.json({ success: false, message: "Invalid credentials" });
      }

      const admin = result[0];

      // Support both hashed (bcrypt) and plain passwords (legacy)
      let match = false;
      if (admin.password && admin.password.startsWith("$2")) {
        match = await bcrypt.compare(password, admin.password);
      } else {
        match = password === admin.password;
      }

      if (!match) {
        trackLogin(ip, false);
        return res.json({ success: false, message: "Invalid credentials" });
      }

      trackLogin(ip, true);
      res.json({ success: true, message: "Login successful 🎉" });
    }
  );
});

/* ================================
   HEALTH CHECK
================================ */
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    ai: "All agents running 🤖",
    agents: ["Security", "Marketing", "Analytics", "SEO", "Reports"],
    uptime: Math.floor(process.uptime()) + "s",
  });
});

/* ================================
   GLOBAL ERROR HANDLER
================================ */
app.use((err, req, res, next) => {
  console.error("[Server Error]", err.message);
  res.status(500).json({ message: "Internal Server Error" });
});

/* ================================
   START REPORT SCHEDULER
================================ */
reportAgent.startReportScheduler();

/* ================================
   START BLOG AGENT SCHEDULES
================================ */
blogAgent.startAllSchedules();

/* ================================
   SERVER START (use http server for Socket.io)
================================ */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Backend + Socket.io running on http://localhost:${PORT}`);
  console.log(`📊 Analytics Agent: ACTIVE`);
  console.log(`🛡️  Security Agent: ACTIVE`);
  console.log(`📈 Marketing Agent: ACTIVE`);
  console.log(`🔍 SEO Agent: ACTIVE`);
  console.log(`📧 Report Agent: ACTIVE (daily 8AM IST)`);
  console.log(`✍️  Blog Agent: ACTIVE (schedules loaded)`);
});
