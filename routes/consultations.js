const express = require("express");
const db = require("../db");

const router = express.Router();
const { verifyAdmin } = require("../middleware/adminAuth");
router.use(verifyAdmin);

/**
 * GET consultations counts
 */
router.get("/counts", (req, res) => {
  const sql = `
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN COALESCE(status, 'new') = 'new' THEN 1 ELSE 0 END) AS new,
      SUM(CASE WHEN status = 'contacted' THEN 1 ELSE 0 END) AS contacted,
      SUM(CASE WHEN status = 'not_contacted' THEN 1 ELSE 0 END) AS not_contacted,
      SUM(CASE WHEN status = 'interested' THEN 1 ELSE 0 END) AS interested,
      SUM(CASE WHEN status = 'not_interested' THEN 1 ELSE 0 END) AS not_interested,
      SUM(CASE WHEN status = 'old' THEN 1 ELSE 0 END) AS old
    FROM consultations
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("CONSULTATIONS COUNT ERROR ❌", err);
      return res.status(500).json({ success: false, error: err.message });
    }

    const row = results[0] || {};

    res.json({
      success: true,
      count: row.total || 0,          // 👈 IMPORTANT for dashboard
      total: row.total || 0,          // 👈 for safety
      counts: {
        total: row.total || 0,
        new: row.new || 0,
        contacted: row.contacted || 0,
        not_contacted: row.not_contacted || 0,
        interested: row.interested || 0,
        not_interested: row.not_interested || 0,
        old: row.old || 0,
      },
    });
  });
});

/**
 * GET consultations list
 */
router.get("/", (req, res) => {
  const { status, search } = req.query;

  let sql = `
    SELECT 
      id,
      name,
      phone,
      state,
      email,
      created_at,
      COALESCE(status, 'new') AS status
    FROM consultations
    WHERE 1=1
  `;

  const params = [];

  if (status && status !== "all") {
    sql += " AND COALESCE(status, 'new') = ?";
    params.push(status);
  }

  if (search) {
    sql += " AND (name LIKE ? OR phone LIKE ? OR email LIKE ? OR state LIKE ?)";
    const s = `%${search}%`;
    params.push(s, s, s, s);
  }

  sql += " ORDER BY created_at DESC";

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.error("CONSULTATIONS FETCH ERROR ❌", err);
      return res.status(500).json({ success: false, error: err.message });
    }

    res.json({ success: true, data: rows });
  });
});

/**
 * UPDATE status
 */
router.put("/:id/status", (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  const allowed = ["new", "contacted", "not_contacted", "interested", "not_interested", "old"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  db.query(
    "UPDATE consultations SET status=? WHERE id=?",
    [status, id],
    (err, result) => {
      if (err) {
        console.error("CONSULTATIONS UPDATE ERROR ❌", err);
        return res.status(500).json({ success: false, error: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Not found" });
      }

      res.json({ success: true });
    }
  );
});

router.get("/counts", (req, res) => {
  db.query(
    `SELECT COUNT(*) AS total, SUM(status = 'new') AS newCount FROM consultations`,
    (err, results) => {
      if (err) return res.status(500).json({ success: false });
      res.json({ success: true, counts: results[0] });
    }
  );
});


module.exports = router;
