const express = require("express");
const router = express.Router();
const db = require("../db");

/**
 * COUNTS
 */
router.get("/counts", (req, res) => {
  const sql = `
    SELECT 
      COUNT(*) AS total,
      SUM(status = 'new') AS new,
      SUM(status = 'old') AS old,
      SUM(status = 'not_contacted') AS not_contacted,
      SUM(status = 'interested') AS interested,
      SUM(status = 'not_interested') AS not_interested
    FROM ai_leads
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Counts error:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, counts: result[0] });
  });
});

/**
 * GET LEADS
 */
router.get("/", (req, res) => {
  const { status, search, limit = 20, offset = 0 } = req.query;

  let sql = `
    SELECT id, name, phone, email, message, source, status, DATE(created_at) AS created_at
    FROM ai_leads
    WHERE 1=1
  `;
  const params = [];

  if (status && status !== "all") {
    sql += " AND status=?";
    params.push(status);
  }

  if (search) {
    sql += " AND (name LIKE ? OR phone LIKE ? OR email LIKE ? OR message LIKE ?)";
    const s = `%${search}%`;
    params.push(s, s, s, s);
  }

  sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
  params.push(Number(limit), Number(offset));

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.error("Fetch leads error:", err);
      return res.status(500).json({ success: false, error: err.message });
    }

    res.json({
      success: true,
      leads: rows,
      pagination: { hasMore: rows.length === Number(limit) }
    });
  });
});

/**
 * CREATE
 */
router.post("/", (req, res) => {
  const { name, phone, email, message, source } = req.body;

  if (!name || !phone || !email) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  const sql = `
    INSERT INTO ai_leads (name, phone, email, message, source, status)
    VALUES (?, ?, ?, ?, ?, 'new')
  `;

  db.query(sql, [name, phone, email, message || "", source || "Emma AI"], (err, result) => {
    if (err) {
      console.error("Insert error:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, leadId: result.insertId });
  });
});

/**
 * UPDATE STATUS
 */
router.put("/:id/status", (req, res) => {
  const { status } = req.body;
  const allowed = ["new", "old", "not_contacted", "interested", "not_interested"];

  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  db.query("UPDATE ai_leads SET status=? WHERE id=?", [status, req.params.id], (err, result) => {
    if (err) {
      console.error("Update status error:", err);
      return res.status(500).json({ success: false, error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    res.json({ success: true });
  });
});

/**
 * DELETE
 */
router.delete("/:id", (req, res) => {
  db.query("DELETE FROM ai_leads WHERE id=?", [req.params.id], (err) => {
    if (err) {
      console.error("Delete error:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true });
  });
});

router.get("/counts", (req, res) => {
  db.query(
    `SELECT COUNT(*) AS total, SUM(status = 'new') AS newCount FROM ai_leads`,
    (err, results) => {
      if (err) return res.status(500).json({ success: false });
      res.json({ success: true, counts: results[0] });
    }
  );
});


module.exports = router;
