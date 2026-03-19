const express = require("express");
const db = require("../db");
const sendEmail = require("../utils/sendEmail");

const router = express.Router();
const { verifyAdmin } = require("../middleware/adminAuth");
router.use(verifyAdmin);

/* =========================
   POST — create pricing request + send email
========================= */
router.post("/", (req, res) => {
  const { full_name, phone, email, service } = req.body;

  if (!full_name || !phone || !email) {
    return res.status(400).json({ success: false, message: "Name, phone, and email are required" });
  }

  const sql = "INSERT INTO pricing_requests (full_name, phone, email, service, status) VALUES (?, ?, ?, ?, 'new')";

  db.query(sql, [full_name, phone, email, service || ""], async (err, result) => {
    if (err) {
      console.error("INSERT ERROR ❌", err);
      return res.status(500).json({ success: false });
    }

    // Send email notification
    try {
      await sendEmail({
        name: full_name,
        company: "",
        email,
        phone,
        service: service || "Not specified",
        message: `Pricing request received for: ${service || "product"}`,
      });
    } catch (emailErr) {
      console.error("Pricing request email error ❌", emailErr.message);
    }

    res.json({ success: true, id: result.insertId });
  });
});

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
