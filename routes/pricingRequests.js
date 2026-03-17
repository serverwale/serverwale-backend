const express = require("express");
const db = require("../db");

const router = express.Router();

/* =========================
   GET pricing requests count (TOTAL + NEW)
========================= */
router.get("/counts", (req, res) => {
  const sql = `
    SELECT 
      COUNT(*) AS total,
      SUM(status = 'new') AS newCount
    FROM pricing_requests
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
   GET pricing requests
========================= */
router.get("/", (req, res) => {
  const { status = "all" } = req.query;

  let sql = "SELECT * FROM pricing_requests WHERE 1=1";
  const params = [];

  if (status !== "all") {
    sql += " AND status = ?";
    params.push(status);
  }

  sql += " ORDER BY created_at DESC";

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.error("FETCH ERROR ❌", err);
      return res.status(500).json({ success: false });
    }
    res.json(rows || []);
  });
});

/* =========================
   UPDATE status
========================= */
router.put("/:id/status", (req, res) => {
  const { status } = req.body;

  db.query(
    "UPDATE pricing_requests SET status=? WHERE id=?",
    [status, req.params.id],
    (err, result) => {
      if (err) {
        console.error("UPDATE ERROR ❌", err);
        return res.status(500).json({ success: false });
      }

      if (!result || result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Not found" });
      }

      res.json({ success: true });
    }
  );
});

module.exports = router;
