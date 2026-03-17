const express = require("express");
const db = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

/* =========================
   MULTER CONFIG
========================= */
const uploadDir = path.join(__dirname, "../uploads/blogs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

/* =========================
   PUBLIC ROUTES
========================= */

// GET published blogs
router.get("/public", (req, res) => {
  db.query(
    "SELECT * FROM blogs WHERE status='published' ORDER BY created_at DESC",
    (err, rows) => {
      if (err) return res.status(500).json([]);
      res.json(rows);
    }
  );
});

// GET blog by slug (reading page)
router.get("/public/:slug", (req, res) => {
  db.query(
    "SELECT * FROM blogs WHERE slug=? AND status='published' LIMIT 1",
    [req.params.slug],
    (err, rows) => {
      if (err || !rows.length) return res.status(404).json(null);
      res.json(rows[0]);
    }
  );
});

/* =========================
   ADMIN ROUTES
========================= */

// GET blogs count (PLACE THIS BEFORE /:id route!)
router.get("/counts", (req, res) => {
  db.query("SELECT COUNT(*) as total FROM blogs", (err, results) => {
    if (err) {
      console.error("Count error:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }
    res.json({ success: true, count: results[0].total });
  });
});

// GET blogs (admin list)
router.get("/", (req, res) => {
  const { status } = req.query;

  let sql = "SELECT * FROM blogs WHERE 1=1";
  const params = [];

  if (status && status !== "all") {
    sql += " AND status=?";
    params.push(status);
  }

  sql += " ORDER BY created_at DESC";

  db.query(sql, params, (err, rows) => {
    if (err) return res.status(500).json([]);
    res.json(rows);
  });
});

// GET blog by ID (EDIT PAGE) - THIS MUST BE AFTER /counts
router.get("/:id", (req, res) => {
  db.query(
    "SELECT * FROM blogs WHERE id=? LIMIT 1",
    [req.params.id],
    (err, rows) => {
      if (err || !rows.length) return res.status(404).json(null);
      res.json(rows[0]);
    }
  );
});

// CREATE blog
router.post("/", upload.single("image"), (req, res) => {
  const { title, slug, excerpt, content, tags, status = "draft" } = req.body;

  if (!title || !slug || !content) {
    return res.status(400).json({ success: false });
  }

  const image = req.file ? `/uploads/blogs/${req.file.filename}` : null;

  db.query(
    `INSERT INTO blogs (title, slug, excerpt, content, tags, image, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [title, slug, excerpt, content, tags, image, status],
    (err, result) => {
      if (err) return res.status(500).json({ success: false });
      res.json({ success: true, id: result.insertId });
    }
  );
});

// UPDATE blog
router.put("/:id", upload.single("image"), (req, res) => {
  const { title, slug, excerpt, content, tags, status } = req.body;

  let sql =
    "UPDATE blogs SET title=?, slug=?, excerpt=?, content=?, tags=?, status=?";
  const params = [title, slug, excerpt, content, tags, status];

  if (req.file) {
    sql += ", image=?";
    params.push(`/uploads/blogs/${req.file.filename}`);
  }

  sql += " WHERE id=?";
  params.push(req.params.id);

  db.query(sql, params, (err) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true });
  });
});

// UPDATE status
router.put("/:id/status", (req, res) => {
  db.query(
    "UPDATE blogs SET status=? WHERE id=?",
    [req.body.status, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ success: false });
      res.json({ success: true });
    }
  );
});

// DELETE blog
router.delete("/:id", (req, res) => {
  db.query(
    "DELETE FROM blogs WHERE id=?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ success: false });
      res.json({ success: true });
    }
  );
});

/* =========================
   INLINE IMAGE UPLOAD
========================= */

// Inline image upload for blog content
router.post("/upload-inline-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No image uploaded" });
  }

  const imageUrl = `/uploads/blogs/${req.file.filename}`;
  
  res.json({
    success: true,
    imageUrl: imageUrl,
    message: "Image uploaded successfully"
  });
});

module.exports = router;
