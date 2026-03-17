console.log("✅ supportRequests routes loaded");

const express = require("express");
const db = require("../db");

const router = express.Router();

/* =========================
   GET support requests count (TOTAL + NEW)
========================= */
router.get("/counts", (req, res) => {
  const sql = `
    SELECT 
      COUNT(*) AS total,
      SUM(status = 'new') AS newCount
    FROM support_requests
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Count error ❌", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    res.json({
      success: true,
      total: results[0]?.total || 0,
      newCount: results[0]?.newCount || 0,
    });
  });
});

/* =========================
   GET support requests (SAFE STATUS)
========================= */
router.get("/", (req, res) => {
  const { status = "all" } = req.query;

  let sql = `
    SELECT 
      id,
      name,
      city,
      phone,
      created_at,
      COALESCE(status, 'new') AS status
    FROM support_requests
    WHERE 1=1
  `;

  const params = [];

  if (status !== "all") {
    sql += " AND status = ?";
    params.push(status);
  }

  sql += " ORDER BY created_at DESC";

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.error("SUPPORT FETCH ERROR ❌", err);
      return res.status(500).json([]);
    }

    res.json(rows || []);
  });
});

/* =========================
   CREATE support request
========================= */
router.post("/", (req, res) => {
  const { name, phone, city } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  const sql =
    "INSERT INTO support_requests (name, phone, city, status) VALUES (?, ?, ?, 'new')";

  db.query(sql, [name, phone, city || ""], (err, result) => {
    if (err) {
      console.error("MYSQL INSERT ERROR ❌", err);
      return res.status(500).json({ success: false });
    }

    res.json({ success: true, id: result.insertId });
  });
});

/* =========================
   UPDATE support status
========================= */
router.put("/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowed = ["new", "contacted", "not_contacted", "interested", "not_interested", "old"];

  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  const sql = "UPDATE support_requests SET status=? WHERE id=?";

  db.query(sql, [status, id], (err, result) => {
    if (err) {
      console.error("SUPPORT UPDATE ERROR ❌", err);
      return res.status(500).json({ success: false });
    }

    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json({ success: true });
  });
});

module.exports = router;
