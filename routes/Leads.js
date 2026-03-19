const express = require("express");
const db = require("../db");
const sendEmail = require("../utils/sendEmail");

const router = express.Router();
const { verifyAdmin } = require("../middleware/adminAuth");
router.use(verifyAdmin); // 🔒 Admin only

/* =========================
   GET lead counts (TOTAL + NEW)
========================= */
router.get("/counts", (req, res) => {
  const sql = `
    SELECT 
      COUNT(*) AS total,
      SUM(status = 'new') AS newCount
    FROM leads
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Count error:", err);
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
   CREATE lead
========================= */
router.post("/", (req, res) => {
  const { name, company, email, phone, service, message } = req.body;

  const sql = `
    INSERT INTO leads 
    (name, company, email, phone, service, message, status)
    VALUES (?, ?, ?, ?, ?, ?, 'new')
  `;

  db.query(sql, [name, company, email, phone, service, message], async (err) => {
    if (err) {
      console.error("Insert error:", err);
      return res.status(500).json({ success: false, message: "Insert failed" });
    }

    try {
      await sendEmail({ name, company, email, phone, service, message });
    } catch (e) {
      console.log("Email error:", e.message);
    }

    res.json({ success: true });
  });
});

/* =========================
   GET leads (SAFE)
========================= */
router.get("/", (req, res) => {
  const { search = "", status = "all" } = req.query;

  let sql = `
    SELECT 
      id,
      name,
      company,
      email,
      phone,
      service,
      message,
      created_at,
      COALESCE(status, 'new') AS status
    FROM leads
    WHERE 1=1
  `;

  const params = [];

  if (search) {
    sql += " AND (name LIKE ? OR email LIKE ? OR company LIKE ?)";
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (status !== "all") {
    sql += " AND status = ?";
    params.push(status);
  }

  sql += " ORDER BY created_at DESC";

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.error("Fetch error:", err);
      return res.status(500).json({ success: false, data: [] });
    }
    res.json(rows || []);
  });
});

/* =========================
   UPDATE lead status
========================= */
router.put("/:id/status", (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  const allowed = ["new", "contacted", "not_contacted", "interested", "not_interested", "old"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  db.query("UPDATE leads SET status=? WHERE id=?", [status, id], (err, result) => {
    if (err) {
      console.error("UPDATE ERROR ❌", err);
      return res.status(500).json({ success: false, message: "Update failed" });
    }

    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    res.json({ success: true });
  });
});

/* =========================
   DELETE lead
========================= */
router.delete("/:id", (req, res) => {
  db.query("DELETE FROM leads WHERE id=?", [req.params.id], (err) => {
    if (err) {
      console.error("Delete error:", err);
      return res.status(500).json({ success: false, message: "Delete failed" });
    }
    res.json({ success: true });
  });
});

module.exports = router;
